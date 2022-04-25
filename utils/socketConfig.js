let redis = require('./redisConfig');
let dayJS = require('dayjs');
let dbConfig = require('./dbConfig');
let {RequestSubscribe}=require('./subscribe');


let websocket = function (server) {
    let io = require('socket.io')(server);
    let socketObj = {}; //存储所有用户
    io.on('connection', (socket) => {
          //************************回执消息*********************
          socket.on("SendReceipt",async (data,callback)=>{
               socketObj[data.from]={
                   socket:socket,
               }
              let timeStamp=dayJS().unix();
              data.timeStamp=timeStamp;
              //存储消息回执
              let object={};
              let key=`${data.from}-${data.to}-Receipt`;
              object[key]=timeStamp;
            redis.setValue("MessageReceipt",object);
            if(!socketObj[data.to]){
                //对方不在线

            }else{
                
                socketObj[data.to].socket.emit("AcceptReceipt",data); //对方在线
            }
          });
          //********************获取聊天记录*************************
          socket.on("GetchatRecord",async (data,callback)=>{
              let chatRecord=await redis.lrang(data.from + '-' + data.to+'-chatRecord');
              callback(chatRecord);
          })
          //****************获取对方最近一次打开我们聊天窗的时间回执*******************
          socket.on("GetReceipt",async (data,callback)=>{
            let  Receipt=await redis.hget("MessageReceipt",data.to + '-' + data.from+'-Receipt')
            callback(Receipt);
        })
          //**************发送消息*************************
          socket.on("SendMessage",(data,callback)=>{
            data.time = dayJS().format("YYYY-MM-DD HH:mm:ss"); //发送的时间
            data.timeStamp=dayJS(data.time).unix();//发送的时间戳
            if(socketObj[data.to]){
                socketObj[data.to].socket.emit("GetMessage",data);
            }else{
                RequestSubscribe(data);
            }
             redis.rpush(data.from + '-' + data.to+'-chatRecord', JSON.stringify(data)); //消息存入发送者聊天记录
             redis.rpush(data.to + '-' + data.from+'-chatRecord', JSON.stringify(data)); //消息存入接收者聊天记录
             callback(data);
            redis.sadd(data.from + '-' + "MsgList", data.from + '-' + data.to); //将该聊天存入用户消息中心
            redis.sadd(data.to + '-' + "MsgList", data.to + '-' + data.from); //将该聊天存入对方用户消息中心
          });
          //**************断开连接*************************
          socket.on("BreakOff",data=>{
              let key=data.from;
             delete socketObj[key]
          })
    })
}

module.exports = {
    websocket,
}