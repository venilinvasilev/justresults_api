const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if(allowedFields.includes(key)) newObj[key] = obj[key];
    });
    return newObj;
}
const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
});
const updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('You cannot update your password from here. Please go to /update-password', 400));
    }
    //2) Find user validate new data fields and update;
    const filteredBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    })
    //3) Send response with changed data
    res.status(200).json({
        status: 'success',
        data: {
            user,
        }
    })
});
const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json(null);
})

module.exports = { getAllUsers, updateMe, deleteMe };