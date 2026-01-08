const router = require('express').Router();
const jwtAuth = require('../midlewares/jwtAuth');
const VNPayController = require('../controllers/VNPayController');

// Tạo URL thanh toán VNPay
router.post('/create_payment_url', jwtAuth, VNPayController.createPaymentUrl);

// Callback từ VNPay sau khi thanh toán (Return URL - cho user)
router.get('/vnpay_return', VNPayController.vnpayReturn);

// IPN URL - VNPay gọi về để cập nhật kết quả (Server-to-Server)
router.get('/vnpay_ipn', VNPayController.vnpayIPN);

// Kiểm tra trạng thái thanh toán
router.get('/payment_status/:order_id', jwtAuth, VNPayController.checkPaymentStatus);

module.exports = router;
