### retry-request使用说明：
#### 应用场景：
设计的初衷是为了保证高可靠和高可用，在网络请求有极小概率会失败，但又希望保证不失败，或减少失败概率的情况下推荐使用，
调用方可以灵活设置重试间隔和重试次数，以及定义钩子函数判断是否要发起重试，重试过程对调用方来说是透明的。

在大并发的场景，建议能够控制并发调用的数量，且在上一轮的并发调用完成之后，再进行新的一轮并发调用，

#### 安装：
```
npm install retry-request
```

#### 接口说明：
默认是用request-promise来发起请求，
如果想用其它的，可传入thirdPartReqFunc

```
request(reqOptions:Object,  retryOptions:Object, retryHook [, thirdPartReqFunc:Function])
```
参数说明：
* reqOptions：请求选项，默认是request-promise的参数，若传入thirdPartReqFunc，则作为thirdPartReqFunc的参数。
* retryOptions：重试参数
* retryHook：判断是否重试的钩子函数
* thirdPartReqFunc 第三方的请求方法，可选项

retryOptions:
* retryIntervals: 重试频率列表，建议重试频率设置成递增
* msg：对本次请求的描述，用于重试时打日志

retryHook:
* responseRetry: 参数是response对象的回调函数, 返回boolean值, true:重试， false:不重试
* catchErrRetry: 参数是Error对象的回调函数, 返回boolean值， true:重试， false:不重试


#### 使用示例：
```
const {request} = require('retry-request');

let requestOptions = {
  method:'get',
  url: `http://www.baidu.com`,
  resolveWithFullResponse: true,
  timeout: 3000, // 3秒超时
  forever: true // 长连接
};

let retryOptions = {retryIntervals:[100, 200, 300], msg:`baidu request`};


let retryHook = {
  // 正常响应时是否重试的判断条件
  responseRetry:(response)=>{
    return false;
  },
  // 捕捉异常时是否重试的判断条件
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
```

#### 定义第三方请求方法测试代码示例：
```
const {request} = require('retry-request');

function promiseReqFunc(reqOptions) {
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.5) {
      console.log('throw err');
      return reject(new Error('error test'));
    }
    if (Math.random() < 0.5) {
      console.log('not ok code');
      return resolve({statusCode: 502});
    }
    console.log('ok code');
    return resolve({statusCode: 202});

  })
}

//测试

async function test() {
  let retryHook = {
    responseRetry: (response) => {
      // 可以根据 response.statusCode 来判断是否重试
      return false;
    },
    catchErrRetry: (err) => {
      // 可以根据err.message来判断是否重试
      return true;
    }
  };
  request({}, {retryIntervals: [100,200,300], msg: 'aa'}, retryHook, promiseReqFunc).then(res => {
    console.log('request success, res:', res);
  }).catch(err => {
    console.error('request fail, err:', err);
  });
}

for (let i = 0; i < 1; i++) {
  test();
}

```
