// var
if (process.env.NODE_ENV === 'production') {
// // var javaHost = 'http://172.18.226.89:8900'; 朱总地址
  module.exports = {
    javaHost: 'http://127.0.0.1:8080',
    newjavaHost: 'http://api.mitao.iduoliao.cn',
    exposureHost: "http://120.79.254.161:8900",
    // esHosts:"http://business:flk8uogeri2$%259dvjdf@119.23.69.206:9200",
    esHosts : ["http://business:lfh834p5ih3s9d8fg23lkj@10.168.0.143:9200","http://business:lfh834p5ih3s9d8fg23lkj@10.167.0.246:7200" , "http://business:lfh834p5ih3s9d8fg23lkj@10.0.0.53:9200"],
    pythonHost: 'http://10.0.0.92:5001'
  }
} else {
  module.exports = { 
    javaHost: 'http://120.79.254.161:8088',
    newjavaHost: 'http://nttest.iduoliao.cn',
    exposureHost: 'http://120.79.254.161:8900',
    pythonHost: 'http://47.106.8.88:5000',
    esHosts:["http://business:flk8uogeri2$%259dvjdf@119.23.69.206:9200"],
    // esHost:"http://business:flk8uogeri2$%259dvjdf@119.23.69.206:9200"
  }
}