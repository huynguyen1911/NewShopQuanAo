import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Custom404() {
    const router = useRouter();

    useEffect(() => {
        // Tự động chuyển về trang chủ sau 3 giây
        const timeout = setTimeout(() => {
            router.push('/');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="container" style={{ 
            minHeight: '60vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div>
                <h1 style={{ fontSize: '6rem', color: '#dc3545', fontWeight: 'bold' }}>404</h1>
                <h2 style={{ marginTop: '1rem' }}>Trang không tồn tại</h2>
                <p style={{ marginTop: '1rem', color: '#6c757d' }}>
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <p style={{ color: '#6c757d' }}>
                    Bạn sẽ được chuyển về trang chủ sau 3 giây...
                </p>
                <button 
                    className="btn btn-primary mt-3"
                    onClick={() => router.push('/')}
                >
                    Về trang chủ ngay
                </button>
            </div>
        </div>
    );
}
