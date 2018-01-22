var axios = require('axios');
const ERR_OK = 200;

function format() {
    var result = arguments[0];
    if (arguments.length == 2 && typeof (arguments[1]) == "object") {
        //传入对象
        var args = arguments[1];
        for (var key in args) {
            var reg = new RegExp("({" + key + "})", "g");
            result = result.replace(reg, args[key]);
        }
    }
    else {
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i] == undefined) {
                return "";
            }
            else {
                var reg = new RegExp("({[" + (i - 1) + "]})", "g");
                result = result.replace(reg, arguments[i]);
            }
        }
    }

    return result;
}

function $get(url, params, config) {
    let _config = {};
    if (config && typeof config === 'object' && JSON.stringify(config) != '{}') {
        config.params = params;
        _config = config;
    } else {
        _config.params = params;
    }

    return new Promise((resolve, reject) => {
        axios.get(url, _config).then(response => {
            if (response.status == ERR_OK) {
                resolve(response.data);
            } else {
                reject(`Request Fail! Status:${response.status} StatusText:${response.statusText}.`);
            }
        }).catch(error => {
            let paramStr = JSON.stringify(params);
            console.error(`url:${url}\r\nparams:${paramStr}\r\nerrmsg:${error}`);
            reject(`Request Error! ${error}`);
        });
    });
}

function $post(url, data, config) {
    return new Promise((resolve, reject) => {
        axios.post(url, data, config || {}).then(response => {
            if (response.status == ERR_OK) {
                resolve(response.data);
            } else {
                reject(`Request Fail! Status:${response.status} StatusText:${response.statusText}.`);
            }
        }).catch(error => {
            let paramStr = JSON.stringify(params);
            console.error(`url:${url}\r\nparams:${paramStr}\r\nerrmsg:${error}`);
            reject(`Request Error! ${error}`);
        });;
    });
}

module.exports = {
    format,
    $get,
    $post
}