let axios = require("axios");
let {appid,secret}=require('./appConfig');
 async function RequestSubscribe(content){
      let access_token=await GetToken();
      let url='https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' +access_token
      axios.post(url,{
        touser:content.to,
        template_id:'b0e2UqgRszMus8PIqdjcqKuWsFIU0mlkF0YqIvCJKuE',
        page:'pages/HOME/home',
        data:{
            thing4:{
                value:content.from_nickName,
            },
            date3:{
                value:content.time,
            },
            thing2:{
                value:'您好!您有一条咨询回复提醒,请及时查看。',
            }
        },
        miniprogram_state:'trial',
      }).then(res=>{
          console.log(res);
          
      })
      
 }


 let GetToken=()=>{
   return new Promise((resolve,reject)=>{
    let url='https://api.weixin.qq.com/cgi-bin/token';
    axios.get(url,{
       params:{
        grant_type:'client_credential',
        appid:appid,
        secret:secret,
       }
    }).then(res=>{
        let access_token=res.data.access_token
        resolve(access_token)
    })
    
   })
  
 }

module.exports={
    RequestSubscribe,
}