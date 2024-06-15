const express = require('express')
const router = express.Router();
const {authenticateToken} = require('../auth/authController');

const postController = require('../controllers/postsController');

router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostById);
router.post('/posts',authenticateToken, postController.createPost);
router.put('/posts/:id',authenticateToken, postController.putPost);
router.delete('/posts/:id',authenticateToken, postController.deletePost);

module.exports = router;