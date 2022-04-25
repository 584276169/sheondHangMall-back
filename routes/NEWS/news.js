var express = require('express');
var router = express.Router();
let news=require('../../User_newsController/news');


router.post('/getNewsList',news.getNewsList);
router.post('/getuserInfo',news.getuserInfo);






module.exports = router;