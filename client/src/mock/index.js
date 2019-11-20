let projectID = 30
let MOCK_HOST = 'http://yapi.iduoliao.cn/mock/'

module.exports = {
  //查询列表
  ListCategory:MOCK_HOST+projectID+'/livealbum/SLiveAlbumCategory/ListCategory',
  //标签
  ListTag:MOCK_HOST+projectID+'/livealbum/SLiveAlbumTag/ListTag',
}