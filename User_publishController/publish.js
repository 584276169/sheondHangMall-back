let dbConfig = require(".././utils/dbConfig");
let fs = require("fs");
let redis = require('.././utils/redisConfig');
let {BaseUrl}=require(".././utils/baseUrlConfig")
let dayJS=require('dayjs');
let joi=require('joi');
//删除商品
deleteProduct=(req,res)=>{
  let {id}=req.body;
  let {openid}=req.headers;
  dbConfig.sqlConnect("delete from shm_product where openid=? and id=?",[openid,id],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
      //hash自减1
      redis.hincrby(openid + '-' + 'stock', 'published', -1);
      res.send({
        'code':200,
        'msg':"删除成功",
      })
    }
  })
}
//上架/下架商品
changeStatus=(req,res)=>{
  let {status,id}=req.body;
  let {openid}=req.headers;
  dbConfig.sqlConnect("update shm_product set status=? where openid=? and id=?",[status,openid,id],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
      res.send({
         'code':200,
         'msg':'商品状态修改成功',
      })
    }
  })
}
//获取个人的商品
getdatList = (req, res) => {
  let {
    openid
  } = req.headers;
  let {
    page
  } = req.body;
  let pagesize = 6;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  dbConfig.sqlConnect('select count(*) as count from shm_product where openid=?;select * from shm_product where openid=? order by id desc limit ?,?', [openid, openid, start, pagesize], (err, data) => {
    if (err) {
      console.log(err);

    } else {
      //处理data
      let datastr = JSON.parse(JSON.stringify(data));
      //处理数量
      let totalnum = datastr[0][0].count;
      //处理商品数据
      datastr[1].forEach(i => {
        i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
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
        'msg': '列表获取成功',
        'data': datastr[1],
        'totalnum': totalnum,
        'page': Page,
        'pagesize': pagesize,
      })
    }
  })
}
//获取成色
getcondition = (req, res) => {
  let sql = "select * from shm_condition";
  let sqlArr = [];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.send({
        'code': 200,
        'msg': '商品成色信息成功',
        'data': data,
      })
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
}
//发布二手物品
pubproduct = (req, res) => {
  let {
    address,
    phone,
    degree,
    tradeName,
    secondHandPrice,
    originPrice,
    remark,
    title,
    transactionMode,
    picUrl,
    category,
    subcategory,
    status
  } = req.body;
  let {
    openid
  } = req.headers;
  //时间处理
  let createTime =dayJS().unix();
  //处理图片
  JSON.parse(picUrl);
  let sql = "insert into shm_product(address,phone,tradeName,secondHandPrice,originPrice,remark,title,transactionMode,picUrl,createTime,openid,degree,subcategory,category,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let sqlArr = [address, phone, tradeName, secondHandPrice, originPrice, remark, title, transactionMode, picUrl, createTime, openid, degree, subcategory, category, status];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.send({
        'code': 200,
        'msg': '提交成功',
      })
      //hash自增1
      redis.hincrby(openid + '-' + 'stock', 'published', 1);
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);

}
//发布租房信息
pubrentout = (req, res) => {
  let {
    address,
    phone,
    remark,
    title,
    category,
    subcategory,
    status,
    deposit,
    price,
    picUrl
  } = req.body;
  let {
    openid
  } = req.headers;
  //处理时间
  let createTime =dayJS().unix();
  //处理图片
  JSON.parse(picUrl);
  //处理类别
  let sql = "insert into shm_product(address,phone,remark,title,category,subcategory,status,deposit,price,createTime,picUrl,openid) values(?,?,?,?,?,?,?,?,?,?,?,?)";
  let sqlArr = [address, phone, remark, title, category, subcategory, status, deposit, price, createTime, picUrl, openid];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.send({
        'code': 200,
        'msg': '提交成功',
      })
      //hash自增1
      redis.hincrby(openid + '-' + 'stock', 'published', 1);
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);

}
//求二手/求租
pubseekpro = (req, res) => {
  let {
    address,
    phone,
    remark,
    title,
    category,
    subcategory,
    status
  } = req.body;
  let {
    openid
  } = req.headers;
  //处理时间
  let createTime =dayJS().unix();
  let sql = "insert into shm_product(address,phone,remark,title,category,subcategory,status,createTime,openid) values(?,?,?,?,?,?,?,?,?)";
  let sqlArr = [address, phone, remark, title, category, subcategory, status, createTime, openid];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.send({
        'code': 200,
        'msg': '提交成功',
      })
      //hash自增1
      redis.hincrby(openid + '-' + 'stock', 'published', 1);
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);

}
//获取商品类型
getcategory = (req, res) => {
  let {parent}=req.query;
  let sql = "select * from shm_category where parent=?";
  let sqlArr = [parent];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.send({
        'code': 200,
        'msg': '商品类型信息获取成功',
        'data': data,
      })
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
}
//获取商品列表
GetProductList = (req, res) => {
  let {
    page,
    category
  } = req.body;
  let pagesize = 6;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  let sql = "select count(*) as count from shm_product where status=? and category=?;select a.nickName,a.avatarUrl,b.* from shm_user as a inner join shm_product as b on a.openid=b.openid where b.status=? and b.category=? order by id desc limit ?,?";
  dbConfig.sqlConnect(sql, [1, category, 1, category, start, pagesize], (err, data) => {
    if (err) {
      console.log(err)
    } else {
      //处理data
      let datastr = JSON.parse(JSON.stringify(data));
      //处理数量
      let totalnum = datastr[0][0].count;
      //处理商品数据
      datastr[1].forEach(i => {
        i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
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
        'msg': '列表获取成功',
        'data': datastr[1],
        'totalnum': totalnum,
        'page': Page,
        'pagesize': pagesize,
      })
    }
  })
}
//获取商品类别
GetcateProduct = (req, res) => {
  let {
    category,
    subcategory,
    page,
    status
  } = req.body;
  let pagesize = 6;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  dbConfig.sqlConnect("select count(*) as count from shm_product where status=? and subcategory=? and category=?;select a.nickName,a.avatarUrl,b.* from shm_user as a inner join shm_product as b on a.openid=b.openid where b.status=? and b.category=? and b.subcategory=? order by id desc limit ?,?",
    [status, subcategory, category, status, category, subcategory, start, pagesize], (err, data) => {
      if (err) {
        console.log(err)
      } else {
        //处理data
        let datastr = JSON.parse(JSON.stringify(data));
        //处理数量
        let totalnum = datastr[0][0].count;
        //处理商品数据
        datastr[1].forEach(i => {
          i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
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
          'msg': '列表获取成功',
          'data': datastr[1],
          'totalnum': totalnum,
          'page': Page,
          'pagesize': pagesize,
        })
      }
    })
}
//搜索商品
searchProduct = (req, res) => {
  let {
    page,
    value
  } = req.body;
  let pagesize = 6;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  let sql = "select count(*) as count from shm_product where locate(?,tradeName) or locate(?,title) or locate(?,subcategory);select a.nickName,a.avatarUrl, b.* from shm_user as a inner join shm_product as b on a.openid=b.openid where b.status=? and locate(?,b.tradeName) or locate(?,b.title) or locate(?,b.subcategory) order by b.id desc limit ?,?";
  let sqlArr = [value, value, value, 1, value, value, value, start, pagesize];
  let callback = (err, data) => {
    if (err) {
      console.log(err)
    } else {
      //处理data
      let datastr = JSON.parse(JSON.stringify(data));
      //处理数量
      let totalnum = datastr[0][0].count;
      //处理商品数据
      datastr[1].forEach(i => {
        i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
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
        'msg': '搜索结果获取成功',
        'data': datastr[1],
        'totalnum': totalnum,
        'page': Page,
        'pagesize': pagesize,
      })
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
}
//物品详细页面
Getdetail = async (req, res) => {
  let {openid}=req.headers;
  let {
    id
  } = req.body;
  let collect=false;
  if(openid){
    let CheckId=await getCheckId(openid,id);
    if(CheckId==0){
      collect=false
    }else{
      collect=true
    }
  }
  dbConfig.sqlConnect("select a.avatarUrl,a.wechatNumber,a.nickName,a.openid,b.* from shm_user as a inner join shm_product as b on a.openid=b.openid where b.id=?", [id], (err, data) => {
    if (err) {
      console.log(err)
    } else {
      data.forEach(i => {
        i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
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
        'collect':collect,
      })

    }
  })
}
//判断该商品是否被用户收藏了
let getCheckId=(openid,id)=>{
  return new Promise((resolve,reject)=>{
    dbConfig.sqlConnect("select product_id from shm_collected where openid=? and locate(?,product_id)",[openid,id],(err,data)=>{
      if(err){
        console.log(err);
        
      }else{
        let datastr=JSON.parse(JSON.stringify(data));
        if(datastr.length==0){
          resolve(0)
        }else{
          resolve(1)
        }
      }
    })
  })
}
//上传图片
uploadFile = (req, res) => {
  let {
    file
  } = req
  let filetime =dayJS().unix();
  let str = Math.random().toString(36).slice(-3);
  fs.renameSync('./public/uploads/' + file.filename, "./public/uploads/" + filetime + str + '.png');
  res.send({
    'code': 200,
    'msg': '图片上传成功',
    'url': BaseUrl+"/uploads/" + filetime + str + '.png',
  })
}
//上推荐申请
recommendation=(req,res)=>{
  let {product_id,recommend_sustain}=req.body;
  let {openid}=req.headers;
  req.body.openid=openid;
    const schema=joi.object({
      product_id:joi.number().required(),
      recommend_sustain:joi.string().required(),
      openid:joi.string().required(),
    })
   let {error}=schema.validate(req.body);
    if(error){
      res.send({
        code:2,
        data:error,
      })
    }else{
      let recommend=1;
      let recommend_time=dayJS().unix();
      let sql="insert into shm_recommend(product_id,recommend_sustain,recommend,user_openid,recommend_time) values(?,?,?,?,?)";
      let sqlArr=[product_id,recommend_sustain,recommend,openid,recommend_time];
      let callback=(err,data)=>{
        if(err){
          console.log(err);
          
        }else{
          res.send({
            code:0,
            msg:'上推荐成功',
          })
        }
      };
      dbConfig.sqlConnect(sql,sqlArr,callback);
    }

   
     
}
//收藏商品
collect=async (req,res)=>{
  let {openid}=req.headers;
  let {id}=req.body;
  let updateTime=dayJS().unix();
  let Checkopenid=await CheckCollect(openid);
  if(Checkopenid==0){
       //无此用户
       dbConfig.sqlConnect('insert into shm_collected(openid,product_id,updateTime) values(?,?,?)',[openid,id,updateTime],(err,data)=>{
         if(err){
           console.log(err);
           
         }else{
           res.send({
             'code':200,
             'msg':"收藏成功",
           })
         }
       })
       //hash自增1
      redis.hincrby(openid + '-' + 'stock', 'collected', 1);
  }else{
       //有该用户
       dbConfig.sqlConnect("update shm_collected set product_id=concat(?,product_id),updateTime=? where openid=?",[id+',',updateTime,openid],(err,data)=>{
         if(err){
           console.log(err);
           
         }else{
          res.send({
            'code':200,
            'msg':"收藏成功",
          })
         }
       })
        //hash自增1
      redis.hincrby(openid + '-' + 'stock', 'collected', 1);
  }
}
//判断收藏表中是否存在该用户收藏记录
let CheckCollect=(openid)=>{
  return new Promise((resolve,reject)=>{
    dbConfig.sqlConnect("select * from shm_collected where openid=?",[openid],(err,data)=>{
      if(err){
        console.log(err);
        
      }else{
        if (data.length == 0) {
          resolve('0')
        } else {
          resolve('1')
        }
        
      }
    })
  })
}
//取消收藏
CancelCollect=(req,res)=>{
  let {openid}=req.headers;
  let {id}=req.body;
  let updateTime=dayJS().unix();
  dbConfig.sqlConnect('update shm_collected set product_id=replace(product_id,?,""),updateTime=? where openid=?',[id+',',updateTime,openid],(err,data)=>{
    if(err){
      console.log(err);
      
    }else{
      res.send({
        'code':200,
        'msg':"取消收藏成功",
      })
    }
  })
  //hash自减1
  redis.hincrby(openid + '-' + 'stock', 'collected', -1);
}
/*商品详情*/
productDetail=(req,res)=>{
  let {openid}=req.headers;
  let {id}=req.body;
  dbConfig.sqlConnect('select * from shm_product where id=?',[id],(err,data)=>{
    if(err){
      res.send({
        code:2,
        data:err,
      })
      console.log(err);
      
    }else{
      let datastr = JSON.parse(JSON.stringify(data));
      datastr.forEach(i => {
        i.createTime =dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
        if (i.picUrl) {
          i.picUrl=JSON.parse(i.picUrl);
        }
      })
      res.send({
        code:0,
        data:datastr[0],
        msg:'商品详情获取成功',
      })
    }
  })
}
//商品编辑
productEditor=(req,res)=>{
  let {openid}=req.headers;
  let {id,address,phone,degree,tradeName,secondHandPrice,originPrice,remark,title,transactionMode,picUrl,subcategory,category,status,deposit,price}=req.body;
  let sql="update shm_product set address=?,phone=?,degree=?,tradeName=?,secondHandPrice=?,originPrice=?,remark=?,title=?,transactionMode=?,picUrl=?,subcategory=?,category=?,status=?,deposit=?,price=? where id=?";
  let sqlArr=[address,phone,degree,tradeName,secondHandPrice,originPrice,remark,title,transactionMode,picUrl,subcategory,category,status,deposit,price,id];
  let callback=(err,data)=>{
    if(err){
      console.log(err)
    }else{
      res.send({
        code:0,
        msg:'商品编辑完成',
      })
    }
  };
  dbConfig.sqlConnect(sql,sqlArr,callback);
}

module.exports = {
  getcondition,
  pubproduct,
  uploadFile,
  getcategory,
  pubrentout,
  pubseekpro,
  GetProductList,
  GetcateProduct,
  searchProduct,
  Getdetail,
  getdatList,
  changeStatus,
  deleteProduct,
  recommendation,
  collect,
  CancelCollect,
  productDetail,
  productEditor,
}