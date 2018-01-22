var config = require("./wxconfig");
var utils = require("./utils");

//网页授权 根据code获取网页授权access_token
function getToken(code) {
    let reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    let params = {
        appid: config.appId,
        secret: config.appSecret,
        code: code,
        grant_type: 'authorization_code'
    };

    return utils.$get(reqUrl, params);
}

//拉取用户信息
function getUserInfo(access_token, openid) {
    let reqUrl = 'https://api.weixin.qq.com/sns/userinfo';
    let params = {
        access_token: access_token,
        openid: openid,
        lang: 'zh_CN'
    };

    return utils.$get(reqUrl, params);
}

module.exports = {
    getToken,
    getUserInfo
}