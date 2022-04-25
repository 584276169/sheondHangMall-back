var express = require('express');
var router = express.Router();
let fs = require('fs');
let dayJS=require('dayjs');
const Sequelize = require('sequelize')
const SequelizeInstance = require('../models/index')
const shm_user = require('../models/shm_user')(SequelizeInstance,Sequelize)
/* GET home page. */
router.get('/', async(req, res) => {
  let tIme=dayJS().unix();
   let TIME=dayJS(tIme*1000).format('YYYY-MM-DD HH:mm:ss');
   let Time=dayJS(TIME).unix();
  /*  res.setHeader("Content-Type", "text/html;charset=utf-8"); */

  let data = shm_user.findAll()
  console.log(data);
  
 
     
});
module.exports = router;