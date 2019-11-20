import ImageUpload from './upload_img.js';
export default {
  upload(file) {
    return ImageUpload.upload(file);
  },
  uuid(prefix = "") {
    var s = []
    var itoh = '0123456789ABCDEF'.split('');
    for (let i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);
    s[14] = 4;
    s[19] = (s[19] & 0x3) | 0x8;
    for (let i = 0; i < 36; i++) s[i] = itoh[s[i]];
    s[8] = s[13] = s[18] = s[23] = '-';
    return prefix + s.join('');
  },
  //生成短时唯一标识
  getSeqid(prefix = "") {
    var a = new Date()
      .getTime()
      .toString()
      .substr(-11);
    var b = ~~(Math.random() * 100);
    b = b < 10 ? b + 10 + "" : b + "";
    return prefix + a + b;
  },
  //完整日期时间格式
  formatFullTime(date, format = 'yyyy-MM-dd hh:mm:ss:SSS') {
    date = date instanceof Date ? date : new Date(+date ? +date : date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millis = date.getMilliseconds();
    format = format.replace('yyyy', year);
    format = format.replace('MM', ('0' + month).slice(-2));
    format = format.replace('dd', ('0' + day).slice(-2));
    format = format.replace('hh', ('0' + hour).slice(-2));
    format = format.replace('mm', ('0' + minute).slice(-2));
    format = format.replace('ss', ('0' + second).slice(-2));
    format = format.replace('SSS', millis);
    return format;
  },
  storeUser(user) {
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  getUser() {
    return sessionStorage.getItem('user') && JSON.parse(sessionStorage.getItem('user'));
  },
  setLoginStatus() {
    sessionStorage.setItem('login', true);
  },
  getLoginStatus() {
    return sessionStorage.getItem('login');
  },
  clearUser() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('login');
  }
};
