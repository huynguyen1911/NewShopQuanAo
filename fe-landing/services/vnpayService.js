import axiosJWT from './axiosJWT';

const vnpayService = {
  
    createPaymentUrl: async (data) => {
        return await axiosJWT.post('/vnpay/create_payment_url', data);
    },

  
    checkPaymentStatus: async (orderId) => {
        return await axiosJWT.get(`/vnpay/payment_status/${orderId}`);
    },
};

export default vnpayService;
