var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser=require('body-parser');
let io=require('./utils/socketConfig');



var indexRouter = require('./routes/index');
var beforeRouter = require('./routes/USER/User');
var publishRouter = require('./routes/PUBLISH/publish');
var newsRouter = require('./routes/NEWS/news');
var managerRouter=require('./routes/MANAGER/manager');
var forumRouter=require('./routes/Forum/forum');
var app = express();
//改写入口文件
var http=require('http');
var server=http.createServer(app)
//socket.io
io.websocket(server);

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/User', beforeRouter);
app.use('/publish',publishRouter);
app.use('/news',newsRouter);
app.use('/manager',managerRouter);
app.use('/forum',forumRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

server.listen('3000');

