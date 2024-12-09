const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Token xác thực không được tìm thấy' });
        }

        const token = authHeader.split(' ')[1];  // Lấy token từ header
        if (!token) {
            return res.status(401).json({ message: 'Định dạng token không hợp lệ' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Dùng JWT_SECRET từ .env
        const user = await User.findById(decoded.id);  // Tìm người dùng từ decoded token

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;  // Lưu thông tin người dùng vào req.user
        next();  // Tiến hành xử lý tiếp
    } catch (error) {
        let message = 'Lỗi xác thực';
        if (error.name === 'TokenExpiredError') {
            message = 'Token đã hết hạn';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Token không hợp lệ';
        }
        res.status(401).json({ message });
    }
};

module.exports = authMiddleware;
