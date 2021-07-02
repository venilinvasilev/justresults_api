const AppError = require("../utils/AppError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/"(.*?[^\\])"/)[1];
    const message = `Duplicate field value: '${value}'. Pleace use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}.`;
    return new AppError(message, 400);
}

const handleJwtError = err => new AppError('Invalid token. Please login again.', 401);
const handleJwtExpiredError = err => new AppError('Token expired. Please login again.', 401);
const sendErrorDev = async (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
}

const sendErrorUser = async (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.log(`ERROR * ${err}`);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong :('
        })
    }
}

function globalErrorHandler (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'production') {
        if(err.name === 'CastError'){
            err = handleCastErrorDB(err)
        }
        if(err.code === 11000){
            err = handleDuplicateFieldsDB(err);
        }
        if(err.name === 'ValidationError'){
            err = handleValidationErrorDB(err);
        }
        if(err.name === 'JsonWebTokenError') {
            err = handleJwtError(err);
        }
        if(err.name === 'TokenExpiredError') {
            err = handleJwtExpiredError(err);
        }
        sendErrorUser(err, res);
    } else {
        sendErrorDev(err, res);
    }
}

module.exports = globalErrorHandler;