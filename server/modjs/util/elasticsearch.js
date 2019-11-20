var esearch = require('@elastic/elasticsearch');
var { esHosts } = require('../util/config');

class EsClient {
  constructor () {
    this.client = new esearch.Client({
      nodes : esHosts
    })
  }
  async search (options) {
    let data = await this.client.search(options);
    return data;
  }
  getDateRange (field , startTime , finishTime) {
    return {
      [field] : {
        gte : new Date(startTime + 8 * 3600 * 1000),
        lte : new Date(finishTime + 8 * 3600 * 1000)
      }
    }
  }
  getDateHistogram (field , startTime , finishTime , type='day') {
    let startDate = new Date(startTime +8 * 3600 * 1000);
    let finishDate = new Date(finishTime + 8 * 3600 * 1000);
    return {
      field,
      format : type == 'month' ? 'yyyy-MM' : 'yyyy-MM-dd',
      interval : type,
      extended_bounds : {
        min : type == 'month' ? startDate.getUTCFullYear() + '-' + (startDate.getUTCMonth() + 1) : startDate.getUTCFullYear() + '-' + (startDate.getUTCMonth() + 1) + '-' + startDate.getUTCDate(),
        max : type == 'month' ? finishDate.getUTCFullYear() + '-' + (finishDate.getUTCMonth() + 1) : finishDate.getUTCFullYear() + '-' + (finishDate.getUTCMonth() + 1) + '-' + finishDate.getUTCDate(),
      }
    }
  }
  getFormatTime (date) {
    let hour = Math.floor(date / 3600);
    let minute = Math.floor((date % 3600) / 60);
    let second = (date % 3600) % 60;
    return `${hour}小时${minute}分钟${second}秒`;
  }
}

module.exports = new EsClient();


