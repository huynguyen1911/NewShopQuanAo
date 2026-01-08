const qs = require('qs');
const crypto = require('crypto');
const moment = require('moment');
const orderid = require('order-id')('key');

const vnpayConfig = require('../configs/vnpayConfig');
const Order = require('../models/order');
const User = require('../models/user');
const Order_State = require('../models/order_state');
const Product_Variant = require('../models/product_variant');
const Product = require('../models/product');
const Product_Price_History = require('../models/product_price_history');
const Order_Item = require('../models/order_item');
const Order_Status_Change_History = require('../models/order_status_change_history');

// Hàm sắp xếp object theo key
// Thay thế hoàn toàn hàm sortObject cũ bằng hàm này
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
			str.push(encodeURIComponent(key));
		}
	}
	str.sort();
	for (key = 0; key < str.length; key++) {
		sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
	}
	return sorted;
}

// Tạo URL thanh toán VNPay
let createPaymentUrl = async (req, res, next) => {
    let user_id = req.token.customer_id;
    if (!user_id) return res.status(400).send({ message: 'Access Token không hợp lệ' });

    try {
        let user = await User.findOne({ where: { user_id, role_id: 2 } });
        if (user == null) return res.status(400).send('User này không tồn tại');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tạo đơn hàng vui lòng thử lại');
    }

    let customer_name = req.body.customer_name;
    if (customer_name === undefined) return res.status(400).send('Trường customer_name không tồn tại');
    let email = req.body.email;
    if (email === undefined) return res.status(400).send('Trường email không tồn tại');
    let phone_number = req.body.phone_number;
    if (phone_number === undefined) return res.status(400).send('Trường phone_number không tồn tại');
    let address = req.body.address;
    if (address === undefined) return res.status(400).send('Trường address không tồn tại');
    let order_items = req.body.order_items;
    if (order_items === undefined) return res.status(400).send('Trường order_items không tồn tại');

    try {
        // Tạo đơn hàng
        let order_id = orderid.generate().replace(/-/g, "");
        var newOrder = await Order.create({
            user_id,
            order_id,
            customer_name,
            email,
            phone_number,
            address,
            total_product_value: 0,
            delivery_charges: 0,
            total_order_value: 0,
            payment_method: 'VNPAY',
            payment_status: 'PENDING'
        });

        let total_product_value = 0;
        for (let i = 0; i < order_items.length; i++) {
            let order_item = order_items[i];
            let product_variant = await Product_Variant.findOne({
                attributes: ['product_variant_id', 'quantity', 'state'],
                include: [
                    {
                        model: Product, attributes: ['product_id'],
                        include: { model: Product_Price_History, attributes: ['price'], separate: true, order: [['created_at', 'DESC']] }
                    },
                ],
                where: { product_variant_id: order_item.product_variant_id }
            });
            if (product_variant == null)
                return res.status(400).send("Sản phẩm này không tồn tại");
            if (product_variant.state != true)
                return res.status(400).send("Sản phẩm này chưa được mở bán");
            if (order_item.quantity > product_variant.quantity)
                return res.status(400).send("Số lượng sản phẩm không hợp lệ");
            let productVariantPrice = product_variant.Product.Product_Price_Histories[0].price;
            let total_value = productVariantPrice * order_item.quantity;
            let newOrderItem = {
                order_id: newOrder.order_id,
                product_variant_id: product_variant.product_variant_id,
                order_item_index: i,
                price: productVariantPrice,
                quantity: order_item.quantity,
                total_value
            }
            await Order_Item.create(newOrderItem);
            total_product_value += total_value;
        }

        let delivery_charges = 20000;
        let total_order_value = total_product_value + delivery_charges;
        await newOrder.update({ total_product_value, delivery_charges, total_order_value });

        // Tạo URL thanh toán VNPay
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        
        // Chuyển IPv6 localhost về IPv4
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
            ipAddr = '127.0.0.1';
        }
        
        // Fallback IP for sandbox
        if (!ipAddr) ipAddr = '127.0.0.1';

        let tmnCode = vnpayConfig.vnp_TmnCode;
        let secretKey = vnpayConfig.vnp_HashSecret.trim();
        let vnpUrl = vnpayConfig.vnp_Url;
        let returnUrl = vnpayConfig.vnp_ReturnUrl;
        
        let orderId = newOrder.order_id;
        let amount = total_order_value;
        let bankCode = '';
        
        let locale = 'vn';
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        // Tạo signData bằng qs.stringify() với encode: false
        let signData = qs.stringify(vnp_Params, { encode: false });
        
        console.log("vnp_Params:", vnp_Params);
        console.log("signData:", signData);

        let hmac = crypto.createHmac("sha512", secretKey);
let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
vnp_Params['vnp_SecureHash'] = signed;
        
        console.log("vnp_SecureHash:", signed);
        console.log("Secret Key Length:", secretKey.length);
        console.log("Full URL will be:", vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false }));
        
        // Tạo URL (encode: false)
       vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        // Tạo trạng thái "Chờ Thanh Toán"
        let state = await Order_State.findOne({ where: { state_id: 1 } });
        await newOrder.addOrder_State(state);

        return res.status(200).json({ 
            code: '00', 
            data: vnpUrl,
            orderId: orderId 
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tạo đơn hàng vui lòng thử lại');
    }
}



// IPN URL - VNPay gọi về để cập nhật kết quả thanh toán (Server-to-Server)
let vnpayIPN = async (req, res, next) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    
    let secretKey = vnpayConfig.vnp_HashSecret.trim();
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch
    let checkOrderId = true; // Kiểm tra orderId có tồn tại trong database
    let checkAmount = true; // Kiểm tra số tiền thanh toán

    if (secureHash === signed) {
        try {
            let order = await Order.findOne({ where: { order_id: orderId } });
            
            if (order) {
                // Kiểm tra số tiền
                if (order.total_order_value * 100 === parseInt(vnp_Params['vnp_Amount'])) {
                    if (order.payment_status === 'PENDING') {
                        if (rspCode === '00') {
                            // Thanh toán thành công
                            await order.update({ payment_status: 'PAID' });
                            
                            // Cập nhật số lượng sản phẩm
                            let orderItems = await Order_Item.findAll({ where: { order_id: orderId } });
                            for (let item of orderItems) {
                                let product_variant = await Product_Variant.findOne({
                                    where: { product_variant_id: item.product_variant_id }
                                });
                                if (product_variant) {
                                    let newQuantity = product_variant.quantity - item.quantity;
                                    await product_variant.update({ quantity: newQuantity });
                                }
                            }
                            
                            paymentStatus = '1';
                            res.status(200).json({ RspCode: '00', Message: 'Success' });
                        } else {
                            // Thanh toán thất bại
                            await order.update({ payment_status: 'FAILED' });
                            paymentStatus = '2';
                            res.status(200).json({ RspCode: '00', Message: 'Success' });
                        }
                    } else {
                        // Order đã được cập nhật rồi
                        res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                    }
                } else {
                    res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
                }
            } else {
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } catch (err) {
            console.log(err);
            res.status(200).json({ RspCode: '99', Message: 'Unknow error' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
};

// Kiểm tra trạng thái thanh toán
let checkPaymentStatus = async (req, res, next) => {
    try {
        let orderId = req.params.order_id;
        let order = await Order.findOne({ 
            where: { order_id: orderId },
            attributes: ['order_id', 'payment_method', 'payment_status', 'total_order_value']
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        return res.status(200).json({ data: order });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái thanh toán' });
    }
}

module.exports = {
    createPaymentUrl,
    vnpayIPN,
    checkPaymentStatus
}
