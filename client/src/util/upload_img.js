const OSS = require('ali-oss');
const IMAGE_DIR = process.env.NODE_ENV === 'production' ? 'img' : 'develop_img';
import api from '@/api';
import axios from 'axios';
import Spark from "spark-md5";
import Vue from 'vue';
export default {
  upload(file) {
    var sparkBuffer = new Spark();
    sparkBuffer.append(file.size + "");
    sparkBuffer.append(file.name + "");
    var osskey = sparkBuffer.end();
    return this._init().then((ossClient) => {
      return new Promise((resolve, reject) => {
        if (ossClient) {
          ossClient.put(IMAGE_DIR + '/' + osskey, file).then(() => {
            resolve('https://cdn.img1.iduoliao.cn/' + IMAGE_DIR + '/' + osskey);
          }).catch((err) => {
            reject(err);
          });
        } else {
          reject()
        }
      });
    })
  },
  async _init() {
    var self = this;
    var STS = await this._getSTS();
    if (!STS || !STS.accessKeyId) {
      return Promise.resolve();
    }
    var config = {
      region: 'oss-cn-hangzhou',
      accessKeyId: STS.accessKeyId,
      accessKeySecret: STS.accessKeySecret,
      bucket: 'jiuban-image'
    }
    STS.securityToken && (config.stsToken = STS.securityToken);
    return Promise.resolve(new OSS(config));
  },
  async _getSTS() {
    return {
      accessKeyId: 'LTAICSxvKZmtedlp',
      accessKeySecret: 'XFh0vaWn6o4TPMFNmSK2C69Vv8SEcd',
    }

    // return axios.post(api.GetSTS).then((res) => {
    //   if (res && res.data && res.data.head && res.data.head.status == 1) {
    //     this.STS = res.data;
    //     return res.data;
    //   } else {
    //     Vue.prototype.$message.error('获取STS失败');
    //   }
    // }).catch((err) => {
    //   Vue.prototype.$message.error('服务器错误，获取STS失败');
    // });
  },
};
