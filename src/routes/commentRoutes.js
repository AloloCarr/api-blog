const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentsController');

router.get('/comments', commentController.getComments);
router.post('/comments', commentController.postComment);
router.put('/comments/:id', commentController.putComment);
router.delete('/comments/:id', commentController.deleteComment);