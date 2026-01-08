// VNPay Configuration
// Đăng ký tài khoản tại: https://sandbox.vnpayment.vn/devreg/
// Lấy thông tin TMN_CODE và HASH_SECRET từ VNPay

module.exports = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE', // Mã website tại VNPay
    vnp_HashSecret: process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET', // Chuỗi bí mật
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán VNPay
    vnp_Api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay-return', // URL trả về sau khi thanh toán
};
