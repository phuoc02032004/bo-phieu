const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const user = await userService.registerUser(req.body);
        res.status(201).json({ message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { accessToken, refreshToken } = await userService.loginUser(req.body.email, req.body.password);
        res.json({ accessToken, refreshToken }); 
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};


exports.verifyEmail = async (req, res) => {
    try {
        await userService.verifyUserEmail(req.body.verificationCode);
        res.status(200).json({ message: 'Xác thực email thành công' });
    } catch (error) {
        res.status(404).json({ message: error.message }); //404 Not Found
    }
};

exports.update = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.get = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};