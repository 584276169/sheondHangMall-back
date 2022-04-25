var express = require('express');
var router = express.Router();
let user=require('../../UserController/login');

router.post('/QuickLogin',user.QuickLogin);
router.post('/addAddress',user.addAddress);
router.get('/getAddress',user.getAddress);
router.get('/editorAddress',user.editorAddress);
router.post('/updateAddress',user.updateAddress);
router.post('/getuserinfo',user.getuserinfo);
router.post('/updateInfo',user.updateInfo);
router.post('/getStock',user.getStock);
router.post('/getpersonal',user.getpersonal);
router.post('/mycollected',user.mycollected);



module.exports = router;