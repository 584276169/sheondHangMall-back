let dbConfig = require(".././utils/dbConfig");
let dayJS=require('dayjs');
let jwt = require(".././utils/tokenConfig");
/**后台登陆*/
login = (req, res) => {
    let {
        username,
        password
    } = req.body;
    dbConfig.sqlConnect('select * from shm_admin where username=?', [username], (err, data) => {
        if (err) {
            console.log(err);

        } else {
            let dataStr = JSON.parse(JSON.stringify(data));
            if (dataStr.length !== 0) {
                if (dataStr[0].password == password) {
                    res.send({
                        'code': 0,
                        'msg': '登录成功',
                        'token': jwt.encrypt({
                            id: dataStr[0].id
                        }, '7d'),
                    })
                } else {
                    res.send({
                        'code': 1,
                        'msg': '登录失败,密码错误',
                    })
                }
            } else {
                res.send({
                    'code': 1,
                    'msg': '登录失败,账号错误'
                })
            }


        }
    })
}
//客户列表
customlist = (req, res) => {
    let {
        token
    } = req.headers;
    let {
        page
    } = req.body;
    let ifValue = jwt.decrypt(token);
    if (ifValue.token) {
        let pagesize = 10;
        let Page = page || 1;
        let start = (Page - 1) * pagesize;

        dbConfig.sqlConnect('select count(*) as count from shm_user;select * from shm_user order by id desc limit ?,?', [start, pagesize], (err, data) => {
            if (err) {
                console.log(err);

            } else {
                let dataStr = JSON.parse(JSON.stringify(data))
                //处理数量
                let totalnum = dataStr[0][0].count;
                dataStr[1].forEach(i => {
                    i.time =dayJS(i.time*1000).format('YYYY-MM-DD HH:mm:ss');
                    i.updateTime =dayJS(i.updateTime*1000).format('YYYY-MM-DD HH:mm:ss');
                })

                res.send({
                    'code': 0,
                    'msg': '用户列表获取成功',
                    'data': dataStr[1],
                    'totalnum': totalnum,
                })
            }

        })
    } else {
        res.send({
            'code': 1,
            'msg': 'token过期,请重新登录',
        })
    }




}
//推荐申请
recommendlist = (req, res) => {
    let {
        page
    } = req.body;
    let {
        token
    } = req.headers;
    let idValue = jwt.decrypt(token);
    if (idValue.token) {
        let pagesize = 10;
        let Page = page || 1;
        let start = (Page - 1) * pagesize;
        let sql="select count(*) as count from shm_recommend where recommend=?;select a.*,b.*,c.nickName from (shm_recommend as a inner join shm_product as b on a.product_id=b.id) inner join shm_user as c on a.user_openid=c.openid where a.recommend=? order by a.recommend_time desc limit ?,?";
        let sqlArr=[1,1,start,pagesize];
        let callback=(err,data)=>{
            if(err){
                console.log(err);
                
            }else{
                let dataStr=JSON.parse(JSON.stringify(data))
                let totalnum=dataStr[0][0].count
                dataStr[1].forEach(i=>{
                    i.recommend_time=dayJS(i.recommend_time*1000).format('YYYY-MM-DD HH:mm:ss');
                    if(i.picUrl){
                        i.picUrl=JSON.parse(i.picUrl);
                    }
                })
                res.send({
                    'code':0,
                    'msg':'推荐申请列表获取成功',
                    'data':dataStr[1],
                    'totalnum':totalnum,
                })
            }
        };
        dbConfig.sqlConnect(sql,sqlArr,callback);
     
    } else {
        res.send({
            'code': 1,
            'msg': 'token过期,请重新登录',
        })
    }
}
//同意/拒绝上推荐
recommend=(req,res)=>{
    let {token}=req.headers;
    let {id,recommend}=req.body;
    let isValue=jwt.decrypt(token);
    if(isValue.token){
       dbConfig.sqlConnect("update shm_recommend set recommend=? where id=?",[recommend,id],(err,data)=>{
           if(err){
               console.log(err);
               
           }else{
               res.send({
                   'code':0,
                   'msg':'商品推荐成功',
               })
           }
       })
    }else{
        res.send({'code':1,'msg':'token过期,请重新登录'})
    }
}
//推荐中的商品
recommending=(req,res)=>{
    dbConfig.sqlConnect('select b.* from shm_recommend as a inner join shm_product as b on a.product_id=b.id where recommend=?',[2],(err,data)=>{
        if(err){
            console.log(err);
            
        }else{
            let dataStr=JSON.parse(JSON.stringify(data))
            dataStr.forEach(i=>{
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
                'code':0,
                'msg':'推荐商品获取成功',
                'data':dataStr,
            })
        }
    })
}
//新增轮播图
addSwiper=(req,res)=>{
    let {token}=req.headers;
    let {url}=req.body;
    let isValue=jwt.decrypt(token);
    if(isValue.token){
        dbConfig.sqlConnect("insert into shm_swiper(url) values(?)",[url],(err,data)=>{
            if(err){
                console.log(err);
                
            }else{
                res.send({
                    'code':0,
                    'msg':'轮播图添加成功',
                })
            }
        })
    }else{
        res.send({'code':1,'msg':'token过期,请重新登录'});
    }
}

//获取轮播图列表
Swiperlist=(req,res)=>{
    dbConfig.sqlConnect("select * from shm_swiper",[],(err,data)=>{
        if(err){
            console.log(err);
            
        }else{
            res.send({'code':0,'msg':'轮播图获取成功','data':data})
        }
    })
}
//删除轮播图
deleteSwiper=(req,res)=>{
    let {id}=req.body;
    let {token}=req.headers;
    let isValue=jwt.decrypt(token)
    if(isValue.token){
        dbConfig.sqlConnect("delete from shm_swiper where id=?",[id],(err,data)=>{
            if(err){
                console.log(err);
                
            }else{
                res.send({'code':0,'msg':'图片删除成功'})
            }
        })
    }else{
        res.send({'code':1,'msg':'token过期,请重新登录'})
    }
}
//轮播图排序
sortSwiper=(req,res)=>{
    let {sort,id}=req.body;
    let {token}=req.headers;
    let isValue=jwt.decrypt(token)
    if(isValue.token){
        dbConfig.sqlConnect('update shm_swiper set sort=? where id=?',[sort,id],(err,data)=>{
            if(err){
                console.log(err);
                
            }else{
                res.send({
                    'code':0,
                    'msg':'修改成功',
                })
            }
        })
    }else{
        res.send({'code':1,'msg':'token过期,请重新登录'})
    }
}
//添加协议规则
agreenment=(req,res)=>{
    let {text}=req.body;
    let {token}=req.headers;
    let isValue=jwt.decrypt(token)
    if(isValue.token){
      dbConfig.sqlConnect("insert into shm_agreement(agreement) values(?)",[text],(err,data)=>{
          if(err){
              console.log(err);
              
          }else{
              res.send({
                  code:0,
                  msg:'内容添加成功',
              })
          }
      })
        
    }else{
        res.send({code:1,msg:'token过期,请重新登录'})
    }
}
//获取协议内容
agreenmentList=(req,res)=>{
    dbConfig.sqlConnect("select * from shm_agreement",[],(err,data)=>{
        if(err){
            console.log(err);
            
        }else{
           res.send({
               code:0,
               msg:'协议内容获取成功',
               data:data,
           })
        }
    })
}
//修改协议内容
agreementChange=(req,res)=>{
    let {text}=req.body;
    let {token}=req.headers;
    let isValue=jwt.decrypt(token)
    if(isValue.token){
        dbConfig.sqlConnect("update shm_agreement set agreement=?",[text],(err,data)=>{
            if(err){
                console.log(err);
                
            }else{
                res.send({code:0,msg:'修改成功'})
            }
        })
    }else{
        res.send({code:1,msg:'token过期,请重新登录'})
    }
}
module.exports = {
    login,
    customlist,
    recommendlist,
    recommend,
    recommending,
    addSwiper,
    Swiperlist,
    deleteSwiper,
    sortSwiper,
    agreenment,
    agreenmentList,
    agreementChange,
}