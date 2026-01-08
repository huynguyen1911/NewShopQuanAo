const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

const User = require('../models/user');
const Customer_Info = require('../models/customer_info');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Xác thực Google ID Token và đăng nhập/đăng ký user
 */
let googleLogin = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).send({ message: 'Thiếu thông tin xác thực Google' });
    }

    try {
        // Xác thực Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).send({ message: 'Không thể lấy email từ tài khoản Google' });
        }

        // Kiểm tra user đã tồn tại chưa
        let customer = await User.findOne({ 
            where: { email, role_id: 2 } 
        });

        if (!customer) {
            // Tạo user mới nếu chưa tồn tại
            // Tạo password ngẫu nhiên cho tài khoản Google (user không cần biết)
            const randomPassword = require('crypto').randomBytes(32).toString('hex');
            const bcrypt = require('bcrypt');
            const hashPassword = bcrypt.hashSync(randomPassword, 10);

            customer = await User.create({ 
                email: email, 
                password: hashPassword, 
                role_id: 2,
                google_id: googleId // Lưu Google ID để nhận diện tài khoản Google
            });

            // Tạo thông tin khách hàng
            await Customer_Info.create({ 
                user_id: customer.user_id, 
                customer_name: name || email.split('@')[0],
                phone_number: '',
                avatar: picture || ''
            });

            console.log(`[Google Auth] Tạo tài khoản mới cho: ${email}`);
        } else {
            // Cập nhật Google ID nếu user đã tồn tại nhưng chưa liên kết Google
            if (!customer.google_id) {
                await User.update(
                    { google_id: googleId },
                    { where: { user_id: customer.user_id } }
                );
            }
            console.log(`[Google Auth] Đăng nhập tài khoản: ${email}`);
        }

        // Tạo JWT tokens
        const accessToken = jwt.sign(
            { customer_id: customer.user_id },
            process.env.ACCESSTOKEN_SECRET_KEY,
            { expiresIn: process.env.ACCESSTOKEN_EXPIRES_IN }
        );

        const { exp } = jwtDecode(accessToken);
        const accessTokenExpires = exp;

        const refreshToken = jwt.sign(
            { customer_id: customer.user_id },
            process.env.REFRESHTOKEN_SECRET_KEY,
            { expiresIn: process.env.REFRESHTOKEN_EXPIRES_IN }
        );

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict'
        });

        return res.send({
            access_token: accessToken,
            access_token_expires: accessTokenExpires,
            message: 'Đăng nhập Google thành công'
        });

    } catch (error) {
        console.error('[Google Auth Error]:', error);
        
        if (error.message.includes('Token used too late') || error.message.includes('Invalid token')) {
            return res.status(401).send({ message: 'Token Google không hợp lệ hoặc đã hết hạn' });
        }
        
        return res.status(500).send({ message: 'Có lỗi xảy ra khi đăng nhập bằng Google' });
    }
};

module.exports = {
    googleLogin
};
