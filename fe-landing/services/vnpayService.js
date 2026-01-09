import axiosJWT from './axiosJWT';

const vnpayService = {
    // Tạo URL thanh toán VNPay
    createPaymentUrl: async (data) => {
        return await axiosJWT.post('/vnpay/create_payment_url', data);
    },

    // Kiểm tra trạng thái thanh toán
    checkPaymentStatus: async (orderId) => {
        return await axiosJWT.get(`/vnpay/payment_status/${orderId}`);
    },
};

export default vnpayService;
