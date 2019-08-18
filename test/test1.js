/**
 * Created by kingson on 2019/8/18.
 */

const {request} = require('../index');

let requestOptions = {
    method:'get',
    url: `http://www.baidu.com`,
    resolveWithFullResponse: true,
    timeout: 3000, // 3秒超时
    forever: true // 长连接
};

let retryOptions = {retryIntervals:[100, 200, 300], msg:`baidu request`};


let retryHook = {
    // 正常响应时是否重连的判断条件
    responseRetry:(response)=>{
        return false;
    },
    // 捕捉异常时是否重连的判断条件
    catchErrRetry:(err)=> {
        return true;
    }
};

request(requestOptions, retryOptions, retryHook).then(response => {
    console.log('request success');
}).catch(err => {
    console.log('request fail');
});



// 对比原生的request-promise

const requestPromise = require('request-promise');

requestPromise(requestOptions).then((response)=>{
    console.log('request success');
}).catch(err => {
    console.log('request fail');
});