  let redis=require('redis');
  const options = {
    host: '112.74.83.16',
    port: 6379,
    password:'chenxueliang520',
    detect_buffers: true // 传入buffer 返回也是buffer 否则会转换成String
  };

  const client=redis.createClient(options);
  client.on('error',function (err) {
    console.log('redis error：'+err);
});

client.on('connect',function () {
    console.log('redis连接成功...')
});
  //存储值
  const setValue=(key,value,expire)=>{
      if
      (typeof value==='string')
      {
        client.set(key, value,function(err,result){
            if(err){
                console.log('redis插入失败',err);
            }else{
                console.log("redis:"+ key + '插入成功');
                if(!isNaN(expire) && expire>0){
                   client.pexpireat(key,expire);
                }
            }
        })
      }
      else if
      (typeof value === 'object')
      {
          for(let item in value){
              client.hmset(key,item,value[item],function(err,result){
                if(err){
                    console.log('redis插入失败',err);
                }else{
                    console.log("redis:"+ key+":" +item + '插入成功');
                    if(!isNaN(expire) && expire>0){
                        client.pexpireat(key,expire);
                    }
                }
            })
          }
      }
  }
  //获取string
  const getValue=(key)=>{
    return new Promise((resolve,reject)=>{
        client.get(key,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }

  //获取hash
  const gethValue=(key)=>{
      return new Promise((resolve,reject)=>{
          client.hgetall(key,function(err,value){
            if
            (err)
            {
              reject(err);
            }
            else
            {
                resolve(value);
            }
          })
      })
  }
  //获取hash某个值
  const hget=(key,field)=>{
    return new Promise((resolve,reject)=>{
        client.hget(key,field,function(err,value){
          if
          (err)
          {
            reject(err);
          }
          else
          {
              resolve(value);
          }
        })
    })
}
  //hash字段自增/自减
  const hincrby=(key,field,num)=>{
      return new Promise((resolve,reject)=>{
          client.hincrby(key,field,num,function(err,value){
              if(err){
                  reject(err);
              }else{
                  resolve(value);
              }
          })
      })
  }
//自增
const incr=(key)=>{
    return new Promise((resolve,reject)=>{
        client.incr(key,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //自减
const decr=(key)=>{
    return new Promise((resolve,reject)=>{
        client.decr(key,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //存储链表
  const lpush=(key,value)=>{
    return new Promise((resolve,reject)=>{
        client.lpush(key,value,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //存储链表
  const rpush=(key,value)=>{
    return new Promise((resolve,reject)=>{
        client.rpush(key,value,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //获取链表
  const lrang=(key)=>{
    return new Promise((resolve,reject)=>{
        client.lrange(key,0,-1,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
   //获取链表某个元素
   const lindex=(key,index)=>{
    return new Promise((resolve,reject)=>{
        client.lindex(key,index,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //获取链表长度
  const llen=(key)=>{
    return new Promise((resolve,reject)=>{
        client.llen(key,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
   //修改链表某个值
   const lset=(key,index,value)=>{
    return new Promise((resolve,reject)=>{
        client.lset(key,index,value,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //存储集合
  const sadd=(key,value)=>{
    return new Promise((resolve,reject)=>{
        client.sadd(key,value,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  //获取集合元素
  const smembers=(key,value)=>{
    return new Promise((resolve,reject)=>{
        client.smembers(key,function(err,value){
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
  }
  module.exports={
      setValue,
      getValue,
      gethValue,
      incr,
      decr,
      lpush,
      rpush,
      lrang,
      lindex,
      sadd,
      smembers,
      hincrby,
      llen,
      lset,
      hget,
  }