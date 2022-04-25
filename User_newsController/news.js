let dbConfig = require(".././utils/dbConfig");
let redis=require('.././utils/redisConfig');
let dayJS=require('dayjs');
//消息列表
getNewsList= async (req,res)=>{
    let {openid}=req.headers;
    let list=await redis.smembers(openid+'-'+"MsgList");
    let data=[]
    for (let i = 0; i < list.length; i++) {
         let LastRecord=await redis.lindex(list[i]+'-chatRecord',-1);
         let lastRecord=JSON.parse(LastRecord);
         let Receipt=await redis.hget("MessageReceipt",list[i]+'-Receipt');
         if(lastRecord.from!==openid&&lastRecord.timeStamp>Receipt){
            lastRecord.status=1 //有未读
         }else{
            lastRecord.status=0 //没有未读
         }
          data.push(lastRecord)     
    }
    res.send({
        code:200,
        msg:"消息列表获取成功",
        data:data,
    })
}

//进入聊天窗口 获取对方用户信息
getuserInfo=(req,res)=>{
    let {to_key,id}=req.body;
    dbConfig.sqlConnect("select * from shm_user where openid=?;select * from shm_product where id=?",[to_key,id],(err,data)=>{
        if(err){
            console.log(err);
            
        }else{
            let datastr=JSON.parse(JSON.stringify(data));
             //处理商品数据
         datastr[1].forEach(i=>{
            i.createTime=dayJS(i.createTime*1000).format('YYYY-MM-DD HH:mm:ss');
            if(i.picUrl){
             i.picUrl=JSON.parse(i.picUrl);
            }
            if(i.transactionMode){
              if(i.transactionMode==0){
                i.transactionMode="面交"
              }else if(i.transactionMode==1){
               i.transactionMode="邮寄"
              }else{
               i.transactionMode="面交/邮寄"
              }
            }
          })
            res.send({
                'code':200,
                'msg':'信息获取成功',
                'data':datastr,
            })
        }
    })
}







module.exports={
    getNewsList,
    getuserInfo,
}