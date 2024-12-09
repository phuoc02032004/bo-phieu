const User = require('../models/User');
const bcrypt = require('bcrypt');
const emailUtils = require('../utils/email');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
};


exports.registerUser = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email đã được sử dụng');

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
    if (!passwordRegex.test(userData.password)) {
        throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm 1 ký tự in hoa và 1 ký tự đặc biệt');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    userData.verificationCode = verificationCode;
    const user = new User(userData);
    await user.save();
    await emailUtils.sendVerificationEmail(userData.email, verificationCode);
    return user;
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không chính xác');

    const { accessToken, refreshToken } = generateTokens(user);

    try {
        await User.findByIdAndUpdate(user._id, { refreshToken });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Database error saving refresh token:", error);
        throw new Error("Failed to save refresh token");
    }
};

exports.verifyUserEmail = async (verificationCode) => {
    const user = await User.findOne({ verificationCode });
    if (!user) throw new Error('Mã xác thực không hợp lệ');
    user.verified = true;
    await user.save();
    return user;
};

exports.updateUser = async (id, updates) => {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) throw new Error('Người dùng không tìm thấy');
    return user;
};

exports.deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error('Người dùng không tìm thấy');
    return user;
};

exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error('Người dùng không tìm thấy');
    return user;
};

exports.getAllUsers = async () => {
    const users = await User.find();
    return users;
};

exports.findUserByRefreshToken = async (refreshToken) => {
    const user = await User.findOne({ refreshToken });
    return user;
};

exports.updateRefreshToken = async (userId, newRefreshToken) => {
    await User.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });
};