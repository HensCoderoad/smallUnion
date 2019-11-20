import axios from "axios";
import axiosRetry from 'axios-retry';
import util from "@/util";
import router from "@/router";
import status from "@/api/status";

const inc = axios.create();

inc.interceptors.request.use(function(config) {
  config.withCredentials = true;
  //JAVA服务器，要加head头
  let i = config.url.indexOf('/java')
  let newface = config.url.indexOf('/new/')>-1
  if (i > -1) {
    if(newface){
      config.data.token=""
      // config.url = config.url.replace("/new","")
    // 修改成新格式
    config = {
      ...config,
      data: {
        params:config.data,
        call:config.url.substr(i+10,config.url.length-1).split('/').join(":")
      }
    }
    }else{
      config = {
        ...config,
        data: {
          ...config.data,
          head: {
            "@type": "type.googleapis.com/ja.common.proto.AutReqHead",
            ver: 1,
            platform: 5,
            seqid: util.getSeqid()
          }
        }
      }
    }
  }
  return config
})

inc.interceptors.response.use(function(res) {
  if (res.data.status == status.SESSION_INVALID) {
    // token过期
    util.clearUser();
    router.replace("/");
  }
  return res;
}, function(error) {
  console.info(error);
  return Promise.reject(error);
})

axiosRetry(inc, {
  retries: 3, // 重新链接3次
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
  retryCondition: axiosRetry.isNetworkError || axiosRetry.isIdempotentRequestError
});

export default inc;
