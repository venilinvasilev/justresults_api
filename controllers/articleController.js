const APIFeatures = require('../utils/ApiFeatures');
const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');

const getAllArticles = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Article.find(), req.query).filter().sort().limitFields().paginate();
    const articles = await features.query;
    res
        .status(200)
        .json({
            status: "success",
            count: articles.length,
            data: articles
        });
});

const createArticle = catchAsync(async (req, res, next) => {
    const newArticle = await Article.create(req.body);
    res.status(201).json({
        status: "success",
        data: newArticle
    });
});

const getArticle = catchAsync(async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    if(!article) {
        return next(new AppError('No article found with that id', 404));
    }
    res.status(201).json({
        status: "success",
        data: article
    })
});

const editArticle = catchAsync(async (req, res, next) => {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!article) {
        return next(new AppError('No article found with that id', 404));
    }
    res.status(200).json({
        status: "success",
        data: article
    });
});

const deleteArticle = catchAsync(async (req, res, next) => {
    const article = await Article.findByIdAndDelete(req.params.id);
    if(!article) {
        return next(new AppError('No article found with that id', 404));
    }
    res.status(204).json(null);
});

module.exports =  {
    getAllArticles,
    createArticle,
    getArticle,
    editArticle,
    deleteArticle
};