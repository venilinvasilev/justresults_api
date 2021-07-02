const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env_JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions);
    const responseObj = {
        status: 'success',
        token
    }
    if (statusCode === 201) {
        responseObj.data = user;
    }
    res.status(statusCode).json(responseObj)
}

const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email or password incorrect', 400));
    }
    createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in. Please login to get access', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please login again.', 401));
    }
    req.user = currentUser;
    next();
});

const restrictTo = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('No user with that email address', 404));
    }
    resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/users/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request to ${resetUrl}. With your password and passwordConfirm.\n If you didn't forget your password, please ignore this message.`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token valid for 10 minutes',
            message
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpiresIn = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later...', 500));
    }
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.resetPasswordToken).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpiresIn: { $gt: Date.now() } });
    //2) If token has not expired and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired.'));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    //3) Update changedPasswordAt property for the current user
    //4) Send the new jsonwebtoken to the client
    await user.save();
    createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
    //1) Get user from collection
    const user = await User.findById(req.user._id).select('+password');
    //2) Check if posted current password is correct
    if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
        return next(new AppError('Incorrect password. Please try again'));
    }
    //3) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4) Log user in send JWT
    createSendToken(user, 200, res);
});

module.exports = {
    signup,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword
}