import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { swtoast } from '@/mixins/swal.mixin';
import useCartStore from '@/store/cartStore';
import axiosClient from '@/services/axiosClient';

const VNPayReturn = () => {
    const router = useRouter();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý thanh toán...');
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        const handleCallback = async () => {
            // Lấy tất cả query params từ URL
            const queryParams = router.query;
            
            if (Object.keys(queryParams).length === 0) {
                return; // Chưa có query params
            }

            try {
                // Gọi API backend để xác thực callback từ VNPay
                const response = await axiosClient.get('/vnpay/vnpay_return', {
                    params: queryParams
                });

                if (response.data.code === '00') {
                    // Thanh toán thành công
                    setStatus('success');
                    setMessage('Thanh toán thành công!');
                    clearCart();
                    swtoast.success({ text: 'Đặt hàng và thanh toán thành công!' });
                    
                    // Redirect về trang đơn hàng sau 3 giây
                    setTimeout(() => {
                        router.push(`/get-order/${response.data.orderId}`);
                    }, 3000);
                } else {
                    // Thanh toán thất bại
                    setStatus('failed');
                    setMessage('Thanh toán thất bại. Đơn hàng đã bị hủy.');
                    swtoast.error({ text: 'Thanh toán thất bại!' });
                    
                    // Redirect về giỏ hàng sau 3 giây
                    setTimeout(() => {
                        router.push('/cart');
                    }, 3000);
                }
            } catch (err) {
                console.log(err);
                setStatus('error');
                setMessage('Có lỗi xảy ra khi xử lý thanh toán.');
                swtoast.error({ text: 'Có lỗi xảy ra!' });
                
                // Redirect về giỏ hàng sau 3 giây
                setTimeout(() => {
                    router.push('/cart');
                }, 3000);
            }
        };

        if (router.isReady) {
            handleCallback();
        }
    }, [router, clearCart]);

    return (
        <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                {status === 'processing' && (
                    <>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h2 style={{ marginTop: '2rem' }}>{message}</h2>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '5rem', color: '#28a745' }}>✓</div>
                        <h2 style={{ marginTop: '1rem', color: '#28a745' }}>{message}</h2>
                        <p>Bạn sẽ được chuyển đến trang chi tiết đơn hàng...</p>
                    </>
                )}
                
                {status === 'failed' && (
                    <>
                        <div style={{ fontSize: '5rem', color: '#dc3545' }}>✗</div>
                        <h2 style={{ marginTop: '1rem', color: '#dc3545' }}>{message}</h2>
                        <p>Bạn sẽ được chuyển về giỏ hàng...</p>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '5rem', color: '#ffc107' }}>⚠</div>
                        <h2 style={{ marginTop: '1rem', color: '#ffc107' }}>{message}</h2>
                        <p>Bạn sẽ được chuyển về giỏ hàng...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VNPayReturn;
