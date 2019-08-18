/**
 * Created by kingson on 2019/8/18.
 */

const requestPromise = require('request-promise');

/**
 *  带失败重试功能的http请求接口
 * @param reqOptions        请求参数，同request-promise
 * @param retryOptions      重试参数 {retryIntervals, msg, reqId}
 * @param responseRetry     正常响应重试判断函数
 * @param catchErrRetry     捕捉异常重试判断函数
 * @param thirdPartReqFunc  第三方请求api函数
 * @returns {Promise<*>}
 */

async function request(reqOptions,  retryOptions, {responseRetry, catchErrRetry}, thirdPartReqFunc) {

    retryOptions = retryOptions || {};

    let {retryIntervals=[100,100,100], msg = '', reqId = getReqId()} = retryOptions;

    // 默认用request-promise请求
    thirdPartReqFunc = thirdPartReqFunc || requestPromise;

    return new Promise((resolve, reject)=>{

        function doRequest(){
            thirdPartReqFunc(reqOptions).then(response=> {
                if(!responseRetry(response)){
                    return resolve(response);
                }
                if (retryIntervals.length <= 0) {
                    return resolve(response);
                }
                let retryInterval = retryIntervals.shift();
                //失败重试
                setTimeout(()=>{
                    console.info(`response error retry: reqId:${reqId}, msg:${msg}, 剩余 ${retryIntervals.length} 次重试`);
                    doRequest();
                }, retryInterval)

            }).catch(err=>{
                if(!catchErrRetry(err)){
                    return reject(err);
                }
                if(retryIntervals.length <= 0){
                    return reject(err);
                }
                let retryInterval = retryIntervals.shift();
                // 异常重试
                setTimeout(()=>{
                    console.info(`catch error retry: reqId:${reqId}, msg:${msg} 剩余 ${retryIntervals.length} 次重试`);
                    doRequest();
                }, retryInterval)
            });
        }

        doRequest();

    });
}

let reqId = 1;
function getReqId(){
    return reqId++;
}


exports.request = request;
