var express = require('express');
var router = express.Router();
let fs = require('fs');
let dayJS=require('dayjs');
let {BaseUrl}=require("../utils/baseUrlConfig");
/* GET home page. */
router.get('/', (req, res) => {
  let tIme=dayJS().unix();
   let TIME=dayJS(tIme*1000).format('YYYY-MM-DD HH:mm:ss');
   let Time=dayJS(TIME).unix();
   res.setHeader("Content-Type", "text/html;charset=utf-8");
       res.send({
         tIme,
         TIME,
         Time,
       })
     res.end()
});
module.exports = router;