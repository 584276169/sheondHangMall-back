var express = require('express');
var router = express.Router();
let manager=require('../../User_systemController/manager');

router.post('/login',manager.login);
router.post('/customlist',manager.customlist);
router.post('/recommendlist',manager.recommendlist);
router.post('/recommend',manager.recommend);
router.post('/recommending',manager.recommending);
router.post('/addSwiper',manager.addSwiper);
router.get('/Swiperlist',manager.Swiperlist);
router.post('/deleteSwiper',manager.deleteSwiper);
router.post('/sortSwiper',manager.sortSwiper);
router.post('/agreenment',manager.agreenment);
router.get('/agreenmentList',manager.agreenmentList);
router.post('/agreementChange',manager.agreementChange);





module.exports = router;