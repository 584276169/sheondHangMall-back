let dbConfig = require("../utils/dbConfig");
let dayJS = require("dayjs");
let redis = require("../utils/redisConfig");
let joi = require("joi");
//添加文章
addArticles = async (req, res) => {
  let { openid } = req.headers;
  let { nickName, avatarUrl, text, img } = req.body;
  req.body.openid = openid;
  let schema = joi.object({
    openid: joi.string().required(),
    nickName: joi.string().required(),
    avatarUrl: joi.string().required(),
    text: joi.string().max(140).required(),
    img: joi.string(),
  });
  let { error } = schema.validate(req.body);
  if (error) {
    res.send({
      code: 2,
      data: error,
    });
  } else {
    let time = dayJS().unix();
    //判断是否有发布过文章
    dbConfig.sqlConnect(
      "insert into shm_articles(openid,time,nickName,avatarUrl,text,img) values(?,?,?,?,?,?)",
      [openid, time, nickName, avatarUrl, text, img],
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send({ code: 0, msg: "发布成功" });
        }
      }
    );
  }
};
//添加评论
addReview = (req, res) => {
  let { openid } = req.headers;
  let { text, nickName, avatarUrl, parent_id, belongTo_id, to_nickName } =
    req.body;
  let time = dayJS().unix();
  dbConfig.sqlConnect(
    "insert into shm_review(text,nickName,avatarUrl,parent_id,time,openid,belongTo_id,to_nickName) values(?,?,?,?,?,?,?,?)",
    [
      text,
      nickName,
      avatarUrl,
      parent_id,
      time,
      openid,
      belongTo_id,
      to_nickName,
    ],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ code: 0, msg: "评论成功" });
        updateReply(parent_id);
      }
    }
  );
};
//评论的回复数量+1
let updateReply = (parent_id) => {
  dbConfig.sqlConnect(
    "update shm_review set reply=reply+? where id=?",
    [1, parent_id],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
      }
    }
  );
};
//获取文章列表
articlesList = (req, res) => {
  let { page } = req.body;
  let pagesize = 10;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  dbConfig.sqlConnect(
    "select count(*) as count from shm_articles;select * from shm_articles order by liked desc limit ?,?",
    [start, pagesize],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let datastr = JSON.parse(JSON.stringify(data));
        //处理数量
        let totalnum = datastr[0][0].count;
        datastr[1].forEach((i) => {
          i.time = dayJS(i.time * 1000).format("YYYY-MM-DD HH:mm:ss");
          if (i.img) {
            i.img = JSON.parse(i.img);
          }
        });
        res.send({
          code: 0,
          msg: "文章列表获取成功",
          data: datastr[1],
          totalnum: totalnum,
        });
      }
    }
  );
};
//获取文章详情
articlesDetail = (req, res) => {
  let { id } = req.body;
  dbConfig.sqlConnect(
    "select * from shm_articles where id=?",
    [id],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        data.forEach((i) => {
          i.time = dayJS(i.time * 1000).format("YYYY-MM-DD HH:mm:ss");
          if (i.img) {
            i.img = JSON.parse(i.img);
          }
        });
        res.send({ code: 0, msg: "文章详情获取成功", data: data });
      }
    }
  );
};
//获取文章评论
reviewList = (req, res) => {
  let { page, belongTo_id, parent_id } = req.body;
  let pagesize = 10;
  let Page = page || 1;
  let start = (Page - 1) * pagesize;
  let sql =
    "select count(*) as count from shm_review where belongTo_id=? and parent_id=?;select * from shm_review where belongTo_id=? order by time desc limit ?,?";
  let sqlArr = [belongTo_id, parent_id, belongTo_id, start, pagesize];
  let callback = (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let dataStr = JSON.parse(JSON.stringify(data));
      let totalnum = dataStr[0][0].count;
      dataStr[1].forEach((i) => {
        i.time = dayJS(i.time * 1000).format("YYYY-MM-DD HH:mm:ss");
      });

      res.send({
        code: 0,
        msg: "文章评论获取成功",
        data: dataStr[1],
        totalnum: totalnum,
      });
    }
  };
  dbConfig.sqlConnect(sql, sqlArr, callback);
};
//评论点赞
likedUpdate = (req, res) => {
  let { id } = req.body;
  dbConfig.sqlConnect(
    "update shm_review set liked=liked+? where id=?",
    [1, id],
    (err, data) => {
      if (err) {
        console.log(err);

        res.send({ code: 500, msg: "数据库查询失败" });
      } else {
        res.send({ code: 0, msg: "点赞成功" });
      }
    }
  );
};
//文章点赞
articleLiked = async (req, res) => {
  let { id } = req.body;
  let { openid } = req.headers;
  dbConfig.sqlConnect(
    "update shm_articles set liked=liked+? where id=?",
    [1, id],
    (err, data) => {
      if (err) {
        console.log(err);

        res.send({ code: 500, msg: "数据库查询失败" });
      } else {
        res.send({ code: 0, msg: "点赞成功" });
      }
    }
  );
};
//评论详情
reviewDetail = (req, res) => {
  let { id } = req.body;
  dbConfig.sqlConnect(
    "select * from shm_review where id=? order by time desc",
    [id],
    (err, data) => {
      if (err) {
        res.send({
          err,
        });
      } else {
        res.send({
          code: 0,
          data: data,
        });
      }
    }
  );
};
module.exports = {
  addArticles,
  addReview,
  articlesList,
  articlesDetail,
  reviewList,
  likedUpdate,
  articleLiked,
};
