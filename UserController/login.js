let axios = require("axios");
let appConfig = require(".././utils/appConfig");
let dbConfig = require(".././utils/dbConfig");
let dayJS=require('dayjs');
let redis=require(".././utils/redisConfig");

//用户商品信息以及个人信息
getpersonal=(req,res)=>{
  let {openid,page}=req.body;
  let pagesize = 6;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  dbConfig.sqlConnect("select * from shm_user where openid=?;select count(*) as count from shm_product where openid=? and status=?;select * from  shm_product  where openid=? and status=? order by id desc limit ?,?",[openid,openid,1,openid,1,start,pagesize],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
       //处理data
       let datastr = JSON.parse(JSON.stringify(data));
       //处理数量
       let totalnum = datastr[1][0].count;
       //处理商品数据
       datastr[2].forEach(i => {
         if(i.createTime){
          i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
         }
         if (i.picUrl) {
           i.picUrl = JSON.parse(i.picUrl);
         }
         if (i.transactionMode) {
           if (i.transactionMode == 0) {
             i.transactionMode = "面交"
           } else if (i.transactionMode == 1) {
             i.transactionMode = "邮寄"
           } else {
             i.transactionMode = "面交/邮寄"
           }
         }
       })
       datastr[0].forEach(i=>{
        if(i.time){
          i.time = dayJS(i.time*1000).format('YYYY-MM-DD HH:mm:ss');
         }
       })
       res.send({
         'code': 200,
         'msg': '个人主页获取成功',
         'data': datastr,
         'totalnum': totalnum,
         'page': Page,
         'pagesize': pagesize,
       })
      
    }
  })
}
//获取商品发布数量
getStock=async(req,res)=>{
  let {openid}=req.headers;
  let stock=await redis.gethValue(openid+'-'+'stock');
    res.send({
      'code':200,
      'msg':'商品数据统计获取成功',
      'data':stock,
    })
  
}
//更新个人信息
updateInfo=(req,res)=>{
  let {phone,mail,nickName,sex,city,wechatNumber}=req.body;
  let {openid}=req.headers;
  dbConfig.sqlConnect("update shm_user set phone=?,mail=?,nickName=?,sex=?,city=?,wechatNumber=? where openid=?",[phone,mail,nickName,sex,city,wechatNumber,openid],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
      res.send({
        'code':200,
        'msg':'信息更新成功',
      })
    }
  })
}
//获取用户信息
getuserinfo=(req,res)=>{
 let {openid}=req.headers;
 dbConfig.sqlConnect("select * from shm_user where openid=?",[openid],(err,list)=>{
   if(err){
     console.log(err);
   }else{
        let data=JSON.parse(JSON.stringify(list));
         data.forEach(i=>{
           i.time=dayJS(i.time*1000).format('YYYY-MM-DD HH:mm:ss');
         })
         res.send({
           'code':200,
           'msg':'用户数据获取成功',
           'data':data[0],
         })
   }
 })
}
//快速登陆
QuickLogin = async (req, res) => {
  let {
    iv,
    encryptedData,
    signature,
    userInfo,
    Code
  } = req.body;
  let nickName=JSON.parse(userInfo).nickName;
  let avatarUrl=JSON.parse(userInfo).avatarUrl;
  let NickName=nickName;
  //获取openid
  let options = await getopenid(Code);
  let checkout = await checkuser(options.openid);
  if (checkout == 0) {
    //第一次登陆
    let time=dayJS().unix();
    let okay=await insertUser(options,avatarUrl,NickName,time);
    if(okay==1){
      console.log("第一次登陆成功");
         res.send({
           'code':200,
           'msg':"登入成功",
           'openid':options.openid,
         })
    }else{
      res.send({
        'code':400,
        'msg':"登入失败",
      })
    }
  }else if(checkout==1){
    //再次登录
    let updateTime=dayJS().unix();
    let okay=await updateUser(options,avatarUrl,NickName,updateTime);
    if(okay==1){
      console.log("再次登陆成功");
      res.send({
        'code':200,
        'msg':"登入成功",
        'openid':options.openid,
      })
 }else{
   res.send({
     'code':400,
     'msg':"登入失败",
   })
 }
  }

}
//添加地址
addAddress=(req,res)=>{
  let {name,phone,province,city,area,detailAddress,zipCode}=req.body;
  let {openid}=req.headers;
  let sql="insert into shm_address(name,phone,province,city,area,detailAddress,zipCode,openid) values(?,?,?,?,?,?,?,?)";
  let sqlArr=[name,phone,province,city,area,detailAddress,zipCode,openid];
  let callback=(err,data)=>{
    if(err){
      console.log(err)
    }else{
      res.send({
        'code':200,
        'msg':'地址保存成功',
        'data':req.body,
      })
    }
  };
  dbConfig.sqlConnect(sql,sqlArr,callback);
 
}
//获取地址
getAddress=(req,res)=>{
  let {openid}=req.headers;
  let sql="select * from shm_address where openid=? ";
  let sqlArr=[openid];
  let callback=(err,data)=>{
    if(err){
      console.log(err)
    }else{
      res.send({
        'code':200,
        'msg':'地址获取成功',
        'data':data,
      })
    }
  };
  dbConfig.sqlConnect(sql,sqlArr,callback);
}
//编辑地址
editorAddress=(req,res)=>{
  let {id}=req.query;
  let {openid}=req.headers;
  let sql="select * from shm_address where openid=? and id=? ";
  let sqlArr=[openid,id];
  let callback=(err,data)=>{
    if(err){
      console.log(err)
    }else{
      res.send({
        'code':200,
        'msg':'地址信息获取成功',
        'data':data,
      })
    }
  };
  dbConfig.sqlConnect(sql,sqlArr,callback);
}
//更新地址
updateAddress=(req,res)=>{
  let {name,phone,province,city,area,detailAddress,zipCode,id}=req.body;
  let {openid}=req.headers;
  let sql="update shm_address set name=?,phone=?,province=?,city=?,area=?,detailAddress=?,zipCode=? where id=?";
  let sqlArr=[name,phone,province,city,area,detailAddress,zipCode,id];
  let callback=(err,data)=>{
    if(err){
      console.log(err)
    }else{
      res.send({
        'code':200,
        'msg':'地址修改成功',
      })
    }
  };
  dbConfig.sqlConnect(sql,sqlArr,callback);
}
//获取该用户的openid
let getopenid = (code) => {
  let url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appConfig.appid + "&secret=" + appConfig.secret + "&js_code=" + code + "&grant_type=authorization_code";
  return new Promise(function (resolve, reject) {
    axios.get(url).then(res => {
      var options = {
        openid: '',
        session_key: '',
      }
      let data = res.data;
      options.openid = data.openid;
      options.session_key = data.session_key;
      resolve(options);
    })
  })

}
//查看是否存在该用户
let checkuser = (openid) => {
  return new Promise((resolve, reject) => {
    let sql = "select openid from shm_user where openid=?";
    let sqlArr = [openid];
    let callback = (err, data) => {
      if (err) {

      } else {
        if (data.length == 0) {
          resolve('0')
        } else {
          resolve('1')
        }
      }
    };
    dbConfig.sqlConnect(sql, sqlArr, callback);
  })
}
//插入该用户
let insertUser = (options,avatarUrl,NickName,time) => {
  return new Promise((resolve,reject)=>{
    let sql = "insert into shm_user(openid,avatarUrl,nickName,time) values(?,?,?,?)";
  let sqlArr = [options.openid,avatarUrl,NickName,time];
  let callback = (err, data) => {
    if (err) {
        console.log(err)
        resolve("0");
    } else {
           resolve("1");
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
  })

}
//更新该用户
let updateUser = (options,avatarUrl,NickName,updateTime) => {
  return new Promise((resolve,reject)=>{
    let sql = "update shm_user set avatarUrl=?,nickName=?,updateTime=? where openid=?";
  let sqlArr = [avatarUrl,NickName,updateTime,options.openid];
  let callback = (err, data) => {
    if (err) {
        console.log(err)
        resolve("0");
    } else {
           resolve("1");
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
  })

}
//我的收藏
mycollected=(req,res)=>{
  let {openid}=req.headers;
  dbConfig.sqlConnect('select a.*,c.avatarUrl from shm_product as a inner join shm_collected as b inner join shm_user as c  on locate(a.id,b.product_id) and a.openid=c.openid where b.openid=?',[openid],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
      data.forEach(i => {
        if(i.createTime){
          i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
        }
        if (i.picUrl) {
          i.picUrl = JSON.parse(i.picUrl);
        }
        if (i.transactionMode) {
          if (i.transactionMode == 0) {
            i.transactionMode = "面交"
          } else if (i.transactionMode == 1) {
            i.transactionMode = "邮寄"
          } else {
            i.transactionMode = "面交/邮寄"
          }
        }
      })
      res.send({
        'code': 200,
        'msg': '数据获成功',
        'data': data,
      })
      
    }
  })
}
module.exports = {
  QuickLogin,
  addAddress,
  getAddress,
  editorAddress,
  updateAddress,
  getuserinfo,
  updateInfo,
  getStock,
  getpersonal,
  mycollected,
}