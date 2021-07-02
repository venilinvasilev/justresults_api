const express = require('express');
const morgan = require('morgan');

const articleRouter = require('./routes/articleRouter');
const userRouter = require('./routes/userRouter');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use('/articles', articleRouter);
app.use('/users', userRouter);

app.all('*', (req, res, next) =>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;