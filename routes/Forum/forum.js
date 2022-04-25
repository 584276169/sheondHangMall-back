var express = require('express');
var router = express.Router();
let forum=require('../../User_forumController/forum');

router.post('/addArticles',forum.addArticles);
router.post('/addReview',forum.addReview);
router.post('/articlesList',forum.articlesList);
router.post('/articlesDetail',forum.articlesDetail);
router.post('/reviewList',forum.reviewList);
router.post('/likedUpdate',forum.likedUpdate);
router.post('/articleLiked',forum.articleLiked);




module.exports=router