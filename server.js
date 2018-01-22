var express = require('express');
var crypto = require('crypto');
var app = express();
var utils = require('./utils');
var wxconfig = require('./wxconfig');
var wxauth = require("./wxauth");
var cookieParser = require('cookie-parser');

const serverURI = "http://tm.lilanz.com/leedev";
const WXAuthURL = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={0}&redirect_uri={1}&response_type=code&scope=snsapi_userinfo&state={2}#wechat_redirect";

app.use(cookieParser());
var routes = express.Router();

//用于处理微信服务器向接口推送的报文处理
routes.post('/serverauth', function (req, res) {
    var buffer = [];
    //监听 data 事件 用于接收数据
    req.on('data', function (data) {
        buffer.push(data);
    });
    //监听 end 事件 用于处理接收完成的数据
    req.on('end', function () {
        //输出接收完成的数据   
        console.log("wxpush:", Buffer.concat(buffer).toString('utf-8'));
        res.send("");
    });
});

//用于处理所有进入 3000 端口 get 的连接请求
routes.get('/serverauth', function (req, res) {
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    var signature = req.query.signature,//微信加密签名
        timestamp = req.query.timestamp,//时间戳
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [wxconfig.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型 
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
        res.send(echostr);
    } else {
        res.send('mismatch');
    }
});

//middleware
routes.use('/', (req, res, next) => {
    console.log('middleware:', req.originalUrl);
    if (req.originalUrl.indexOf('/leedev/wxauth') == 0) {
        next();
    } else {
        if (!req.cookies || !req.cookies.authorization) {
            let fullURL = serverURI + "/wxauth?sourceurl=" + encodeURIComponent(req.originalUrl);
            res.redirect(utils.format(WXAuthURL, wxconfig.appId, encodeURIComponent(fullURL), "server_auth"));
            res.end();
        } else {
            console.log('cookie:', req.cookies.authorization);
            next();
        }
    }
});

//微信网页鉴权
routes.get('/wxauth', (req, res) => {
    let code = req.query.code;
    let state = req.query.state;
    if (code && state && state.indexOf("server_auth") == 0) {
        wxauth.getToken(code).then(data => {
            if (data.errcode && data.errcode != "") {
                res.json({ errcode: data.errcode, errmsg: data.errmsg });
            } else {
                let access_token = data.access_token;
                let openid = data.openid;
                wxauth.getUserInfo(access_token, openid).then(data => {
                    console.log(`用户：${openid} 鉴权成功！`);
                    res.cookie("authorization", { userid: 354, username: 'Elilee' }, { expires: new Date(Date.now() + 5 * 60 * 1000), httpOnly: true });
                    if (req.query && req.query.sourceurl) {
                        let _target = req.query.sourceurl;
                        res.redirect(_target);
                    } else {
                        res.send('微信鉴权成功！' + openid);
                    }
                });
            }
        })
    } else {
        //let fullURL = req.protocol + '://' + req.get('host') + '/leedev/wxauth';
        let fullURL = serverURI + "/wxauth";
        res.redirect(utils.format(WXAuthURL, wxconfig.appId, encodeURIComponent(fullURL), "server_auth"));
    }
});

routes.get('/', (req, res) => {
    res.send('hello world!');
});

routes.get('/api', (req, res) => {
    res.send('hello api!');
});

app.use('/leedev', routes);

app.listen(8080, (err) => {
    console.log("listening on port 8080..");
});