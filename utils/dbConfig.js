const mysql = require("mysql");
module.exports = {
  //数据库配置
  config: {
    host: "127.0.0.1",
    port: "3306",
    user: "shm",
    password: "MgrDMyuJH7ElLnvM",
    database: "SHM",
    multipleStatements: true,
  },

  //连接数据库  选用连接池的方式链接
  //连接池对象
  sqlConnect: function (sql, sqlArr, callback) {
    var pool = mysql.createPool(this.config);
    pool.getConnection((err, conn) => {
      console.log("连接数据库中...");
      if (err) {
        console.log("链接失败", err);
        return;
      }
      //事件驱动回调
      conn.query(sql, sqlArr, callback);
      //释放连接
      conn.release();
    });
  },
};
