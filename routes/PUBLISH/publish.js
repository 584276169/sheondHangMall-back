var express = require('express');
var router = express.Router();
let publish=require('../../User_publishController/publish');
let multer=require("multer");
let uploads=multer({dest:'./public/uploads'});



router.get('/getcondition',publish.getcondition);
router.post('/pubproduct',publish.pubproduct);
router.post('/pubrentout',publish.pubrentout);
router.post('/pubseekpro',publish.pubseekpro);
router.post('/uploadFile',uploads.single('file'),publish.uploadFile);
router.get('/getcategory',publish.getcategory);
router.post('/GetProductList',publish.GetProductList);
router.post('/GetcateProduct',publish.GetcateProduct);
router.post('/searchProduct',publish.searchProduct);
router.post('/Getdetail',publish.Getdetail);
router.post('/getdatList',publish.getdatList);
router.post('/changeStatus',publish.changeStatus);
router.post('/deleteProduct',publish.deleteProduct);
router.post('/recommendation',publish.recommendation);
router.post('/collect',publish.collect);
router.post('/CancelCollect',publish.CancelCollect);
router.post('/productDetail',publish.productDetail);
router.post('/productEditor',publish.productEditor);



module.exports = router;