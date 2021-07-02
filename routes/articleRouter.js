const express = require('express');

const {
    getAllArticles, createArticle, getArticle, editArticle, deleteArticle
 } = require('../controllers/articleController');

const router = express.Router();

router.route('/')
    .get(getAllArticles)
    .post(createArticle);
router.route('/:id')
    .get(getArticle)
    .patch(editArticle)
    .delete(deleteArticle);

module.exports = router;