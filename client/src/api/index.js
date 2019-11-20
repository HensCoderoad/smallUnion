let NewInterFace = "/new"
let NODE_HOST = process.env.NODE_ENV === 'production' ?
  'http://yunying.mitao.iduoliao.cn/api' // 正式服
  :
  "http://nodejs.dev.ym.iduoliao.cn:8093";  // 测试服
//  NODE_HOST = 'http://localhost:3000';
// NODE_HOST = 'http://yunying.mitao.iduoliao.cn/api';

let JAVA_OPERATE_HOST = process.env.NODE_ENV === 'production' ?
  'http://yunying.mitao.iduoliao.cn/api/java' // 正式服
  :
  "http://nodejs.dev.ym.iduoliao.cn:8093/java"; // 测试服
//  JAVA_OPERATE_HOST = 'http://localhost:3000/java';
// JAVA_OPERATE_HOST = 'http://yunying.mitao.iduoliao.cn/api/java';

let JAVA_WEB_HOST = process.env.NODE_ENV === 'production' ?
  'https://micro.mitao.iduoliao.cn' :
  "http://nttest.iduoliao.cn"; 

let PYTHONE_HOST = process.env.NODE_ENV === 'production' ?
  'http://yunying.mitao.iduoliao.cn/api/python' :
  "http://nodejs.dev.ym.iduoliao.cn:8093/python";
// PYTHONE_HOST = 'http://localhost:3000/python';

module.exports = {
  login: NODE_HOST + '/user/login',
  logout: NODE_HOST + '/user/logout',
  updateUser: NODE_HOST + '/user/update',
  updateUserSelf: NODE_HOST + '/user/update/self',
  addUser: NODE_HOST + '/user/add',
  getUser: NODE_HOST + '/user/get',
  getRoleUserMap: NODE_HOST + '/user/role',
  deleteUser: NODE_HOST + '/user/delete',
  getUserList: NODE_HOST + '/user/list',
  getUserListByIds: NODE_HOST + '/user/list/ids',
  getUserMenuList: NODE_HOST + '/user/menu',
  getRoleList: NODE_HOST + '/user/role/list',
  addRole: NODE_HOST + '/user/role/add',
  updateRole: NODE_HOST + '/user/role/update',
  deleteRole: NODE_HOST + '/user/role/delete',
  addMenu: NODE_HOST + '/user/menu/add',
  updateMenu: NODE_HOST + '/user/menu/update',
  deleteMenu: NODE_HOST + '/user/menu/delete',
  getMenuList: NODE_HOST + '/user/menu/list',
  getRoleMenuMap: NODE_HOST + '/user/menu/role',
  transferUser: NODE_HOST + '/user/transfer',
  getWorkList: NODE_HOST + '/work/list',
  getWorkTotal: NODE_HOST + '/work/size',
  updateWork: NODE_HOST + '/work/update',
  changeStatus: NODE_HOST + '/work/status',
  getCrawlUserList: NODE_HOST + '/work/users',
  //删除作品
  deleteWork: NODE_HOST + '/work/del',
  //添加推荐白名单
  addWhite: NODE_HOST + '/work/white/add',
  //删除白名单
  delWhite: NODE_HOST + '/work/white/del',
  //获取白名单
  getWhiteByVids: NODE_HOST + '/work/white/get',
  //白名单数量
  countWhiteList: NODE_HOST + '/work/white/size',
  //黑名单数量
  countBlackList: NODE_HOST + '/work/black/size',
  //获取白名单
  getWhiteList: NODE_HOST + '/work/white/list',
  //检测白名单
  checkWhite: NODE_HOST + '/work/white/check',
  //获取黑名单
  getBlackList: NODE_HOST + '/work/black/list',
  //获取爬虫统计
  getCrwlerStatistcs: NODE_HOST + '/statistics/list',
  //获取活动数量
  getActivityTotal: NODE_HOST + '/activity/size',
  //获取活动列表
  getActivityList: NODE_HOST + '/activity/list',
  //根据id获取活动列表
  getActByIds: NODE_HOST + '/activity/id',
  //获取活动奖品列表
  getActAwardList: NODE_HOST + '/activity/act_award/list',
  //获取中奖数量
  getLuckyTotal: NODE_HOST + '/activity/lucky/size',
  //获取中奖列表
  getLuckyList: NODE_HOST + '/activity/lucky/list',
  //获取物品总数
  getGoodsTotal: NODE_HOST + '/goods/size',
  //获取物品列表
  getGoodsList: NODE_HOST + '/goods/list',
  //获取banner总数
  getBannerTotal: NODE_HOST + '/activity/banner/size',
  //获取banner列表
  getBannerList: NODE_HOST + '/activity/banner/list',
  //获取活动配置
  getActivityConfig: NODE_HOST + '/activity/config',
  //请求补充作品
  pleaseAddWork: PYTHONE_HOST + '/videos/',
  //获取分类列表
  getCategoryList: JAVA_OPERATE_HOST + '/works/SWorksCategory/QueryVideoCategoryNew',
  //获取申请列表总数
  CountApplyAuthorByStatus: JAVA_OPERATE_HOST + '/activity/SActivity/CountApplyAuthorByStatus',
  //获取申请号列表
  ListApplyAuthorByStatus: JAVA_OPERATE_HOST + '/activity/SActivity/ListApplyAuthorByStatus',
  //审核认证号
  AuditApplyAuthorById: JAVA_OPERATE_HOST + '/activity/SActivity/AuditApplyAuthorById',
  //获取认证码
  GenerateVerifyCode: JAVA_OPERATE_HOST + '/works/SWorksAdmin/GenerateVerifyCode',
  //下线用户推荐
  ChangeActivityCodeStateByRecommendAid: JAVA_OPERATE_HOST + '/activity/SActivity/ChangeActivityCodeStateByRecommendAid',
  //屏蔽用户申请
  ChangeApplyUserStatus: JAVA_OPERATE_HOST + '/activity/SActivity/ChangeApplyUserStatus',
  //发文管理列表总数
  CountAuthorForRewardStat: JAVA_OPERATE_HOST + '/activity/SActivity/CountAuthorForRewardStat',
  //发文管理列表
  ListAuthorForRewardStat: JAVA_OPERATE_HOST + '/activity/SActivity/ListAuthorForRewardStat',
  //批量获取屏蔽状态
  BatchGetUserApplyStatus: JAVA_OPERATE_HOST + '/activity/SActivity/BatchGetUserApplyStatus',
  //批量获取上下线状态
  BatchGetShareCodeStatusByRecommendAids: JAVA_OPERATE_HOST + '/activity/SActivity/BatchGetShareCodeStatusByRecommendAids',
  //审核作品
  AddVideoFromSpider: JAVA_OPERATE_HOST + '/works/SWorksVideo/AddVideoFromSpider',
  //搜索认证号
  ListAuthorsByPubCount: JAVA_OPERATE_HOST + '/works/SWorksAuthor/ListAuthorsByPubCount',
  //获取合集列表
  SearchVideoSet4Admin: JAVA_OPERATE_HOST + '/works/SWorksAdmin/SearchVideoSet4Admin',
  //下架合集
  ChangeVideoSetState: JAVA_OPERATE_HOST + '/works/SWorksAdmin/ChangeVideoSetState',
  //更新合集
  UpdateVset: JAVA_OPERATE_HOST + '/works/SWorksVset/UpdateVset',
  //查询推荐有奖白名单总数量
  CountApplyAuthorList: JAVA_OPERATE_HOST + '/activity/SActivity/CountApplyAuthorList',
  //查询推荐有奖白名单
  ListApplyAuthorList: JAVA_OPERATE_HOST + '/activity/SActivity/ListApplyAuthorList',
  //添加推荐有奖白名单
  AddApplyAuthorList: JAVA_OPERATE_HOST + '/activity/SActivity/AddApplyAuthorList',
  //作品列表
  GetVideosStat: JAVA_OPERATE_HOST + '/works/SWorksStat/GetVideosStat',
  //根据vids获取作品
  BatchGetVideoStat: JAVA_OPERATE_HOST + '/works/SWorksStat/BatchGetVideoStat',
  //获取某个作品的详细统计信息
  GetVideoStatDetail: JAVA_OPERATE_HOST + '/works/SWorksStat/GetVideoStatDetail',
  //搜索作品
  SearchVideo: JAVA_OPERATE_HOST + '/works/SWorks/SearchVideo',
  //搜索认证号
  GetAuthorsByName: JAVA_OPERATE_HOST + '/works/SWorks/GetAuthorsByName',
  //编辑作品
  UpdateVideo: JAVA_OPERATE_HOST + '/works/SWorks/UpdateVideo',
  //根据审核状态获取作品列表
  ListWorksByStatus: JAVA_OPERATE_HOST + '/works/SWorks/ListWorksByStatus',
  //根据审核状态获取活动作品列表
  ListWorksByStatus2: JAVA_OPERATE_HOST + '/works/SWorksAudit/ListWorksByStatus2',
  //根据审核状态获取作品总数
  CountWorksByStatus: JAVA_OPERATE_HOST + '/works/SWorks/CountWorksByStatus',
  //根据审核状态获取活动作品总数
  CountWorksByStatus2: JAVA_OPERATE_HOST + '/works/SWorksAudit/CountWorksByStatus2',
  //根据vid获取作品信息
  BatchGetVideos: JAVA_OPERATE_HOST + '/works/SWorks/BatchGetVideos',
  //批量审核操作
  BatchAuditWorks: JAVA_OPERATE_HOST + '/works/SWorks/BatchAuditWorks',
  //批量删除
  BatchDeleteWorks: JAVA_OPERATE_HOST + '/works/SWorks/BatchDeleteWorks',
  //获取C类作品
  ListWorksByMark: JAVA_OPERATE_HOST + '/works/SWorks/ListWorksByMark',
  //获取C类活动作品
  ListWorksByMark2: JAVA_OPERATE_HOST + '/works/SWorksAudit/ListWorksByMark2',
  //获取C类作品总数量
  CountWorksByMark: JAVA_OPERATE_HOST + '/works/SWorks/CountWorksByMark',
  //获取C类活动作品总数量
  CountWorksByMark2: JAVA_OPERATE_HOST + '/works/SWorksAudit/CountWorksByMark2',
  //批量上下架C类作品
  BatchUpDownVideos: JAVA_OPERATE_HOST + '/works/SWorks/BatchUpDownVideos',
  //设置C类评级隐藏
  SetWorkGradeMarkC: JAVA_OPERATE_HOST + '/works/SWorks/SetWorkGradeMarkC',
  //获取C类评级隐藏
  GetWorkGradeMarkC: JAVA_OPERATE_HOST + '/works/SWorks/GetWorkGradeMarkC',
  //获取公众号发文数据总数
  CountWorksForMoney: JAVA_OPERATE_HOST + '/works/SWorksStat/CountWorksForMoney',
  //获取公众号发文数据
  ListWorksForMoney: JAVA_OPERATE_HOST + '/works/SWorksStat/ListWorksForMoney',
  //设置发码人
  SetAuthorSendCodePerson: JAVA_OPERATE_HOST + '/works/SWorksStat/SetAuthorSendCodePerson',
  //导出列表总数
  CountExportJob: JAVA_OPERATE_HOST + '/asynctask/SAsyncTask/CountJob',
  //获取导出列表
  ListExportJob: JAVA_OPERATE_HOST + '/asynctask/SAsyncTask/ListJob',
  //添加导出任务
  CreateExportJob: JAVA_OPERATE_HOST + '/asynctask/SAsyncTask/CreateJob',
  //获取导出数据详情
  GetExportJob: JAVA_OPERATE_HOST + '/asynctask/SAsyncTask/GetJob',
  //删除导出任务
  BatchDeleteJob: JAVA_OPERATE_HOST + '/asynctask/SAsyncTask/BatchDeleteJob',
  //添加活动
  AddAct: JAVA_OPERATE_HOST + '/act/SAct/AddAct',
  //编辑活动
  UpdateAct: JAVA_OPERATE_HOST + '/act/SAct/UpdateAct',
  //删除活动
  DeleteAct: JAVA_OPERATE_HOST + '/act/SAct/DeleteAct',
  //批量更改活动状态
  BatchChangeActStatus: JAVA_OPERATE_HOST + '/act/SAct/BatchChangeActStatus',
  //添加活动奖品
  AddAwardRule: JAVA_OPERATE_HOST + '/act/SActAwardRule/AddAwardRule',
  //编辑活动奖品
  UpdateAwardRule: JAVA_OPERATE_HOST + '/act/SActAwardRule/UpdateAwardRule',
  //删除活动奖品
  DeleteAwardRule: JAVA_OPERATE_HOST + '/act/SActAwardRule/DeleteAwardRule',
  //更新商品
  UpdateGoods: JAVA_OPERATE_HOST + '/goods/SGoods/UpdateGoods',
  //添加banner
  AddActBanner: JAVA_OPERATE_HOST + '/act/SActBanner/AddActBanner',
  //更新banner
  UpdateActBanner: JAVA_OPERATE_HOST + '/act/SActBanner/UpdateActBanner',
  //删除banner
  DeleteActBanner: JAVA_OPERATE_HOST + '/act/SActBanner/DeleteActBanner',
  //添加奖品
  AddActLucky: JAVA_OPERATE_HOST + '/act/SActLucky/AddActLucky',
  //更新奖品兑换状态
  UpdateActLuckyStatus: JAVA_OPERATE_HOST + '/act/SActLucky/UpdateActLuckyStatus',
  //设置活动配置
  SetActConfig: JAVA_OPERATE_HOST + '/act/SActConfig/SetActConfig',
  //通知java推荐状态
  BatchUpDownRecommendByVids: JAVA_OPERATE_HOST + '/works/SWorks/BatchUpDownRecommendByVids',
  //影集-分类
  ListCategory: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumCategory/ListCategory', //查询所有
  GetCategory: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumCategory/GetCategory',//查询单个
  AddCategory: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumCategory/AddCategory',//添加分类
  UpdateCategory: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumCategory/AddCategory',//修改分类
  ChangeCategoryStatus: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumCategory/ChangeCategoryStatus',//更改分类状态
  //影集-标签
  AddTag: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/AddTag',//添加标签
  UpdateTag: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/UpdateTag',//添加标签
  DeleteTag: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/DeleteTag',//删除标签
  ChangeTagStatus: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/ChangeTagStatus',//改变状态标签
  GetTag: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/GetTag',//单个标签
  ListTag: JAVA_OPERATE_HOST + '/livealbum/SLiveAlbumTag/ListTag',//所有标签
  // 影集-banner
  // 敏感词汇
  GetWordList: JAVA_OPERATE_HOST + '/sensitive/SSensitive/GetWordList',
  AddWord: JAVA_OPERATE_HOST + '/sensitive/SSensitive/AddWord',
  DelWord: JAVA_OPERATE_HOST + '/sensitive/SSensitive/DelWord',
  ListAuthorWhiteBlack: JAVA_OPERATE_HOST + '/works/SWorks/ListAuthorWhiteBlack',
  // 用户操作日志
  getLog: NODE_HOST + '/user/log/getall',
  addLog: NODE_HOST + '/user/log/add',
  updateLog: NODE_HOST + '/user/log/update',
  // 字段设置
  getField: NODE_HOST + '/user/field/getall',
  addField: NODE_HOST + '/user/field/addfield',
  editField: NODE_HOST + '/user/field/editfield',
  //作品评级
  getGrade: JAVA_OPERATE_HOST + '/works/SWorks/ListWorksByGrade',
  BatchGetWorksGrade: JAVA_OPERATE_HOST + '/works/SWorks/BatchGetWorksGrade',

  //各个评级基准
  ListAllWorkGradeConf: JAVA_OPERATE_HOST + '/works/SWorks/ListAllWorkGradeConf',
  BatchGetWorkGradeVids: JAVA_OPERATE_HOST + '/works/SWorks/BatchGetWorkGradeVids',//
  SetWorkGradeConf: JAVA_OPERATE_HOST + '/works/SWorks/SetWorkGradeConf', //设置曝光等级
  GetTotalExposure: JAVA_OPERATE_HOST + '/works/SWorks/GetTotalExposure', //某天分发的曝光量
  SetSingleWorkGrade: JAVA_OPERATE_HOST + '/works/SWorks/SetSingleWorkGrade',//设置作品评级

  // 评论审核
  GetCommentList: NODE_HOST + '/work/comment/getlist',// 获取评论列表
  getCommentListByDate : NODE_HOST + '/work/comment/getListByDate',// 按日期获取评论列表
  getVideoListByDate : NODE_HOST + '/work/comment/getVideoListByDate', // 按日期获取评论作品列表
  getVideoListByDateCount: NODE_HOST + '/work/comment/getVideoListByDateCount', // 按日期获取评论作品列表
  CommentPass: JAVA_OPERATE_HOST + NewInterFace + '/video/admin/commentBatchPass',//批量通过
  CommentDel: JAVA_OPERATE_HOST + NewInterFace + '/video/admin/commentBatchDel',//批量删除
  CommentRecover: JAVA_OPERATE_HOST + NewInterFace + '/video/admin/commentBatchRecover',//批量恢复
  getVideoByName: NODE_HOST + '/work/comment/getVideoByName',
  getCommentTotal : NODE_HOST + '/work/comment/getCommentTotal',// 获取评论列表总数
  getCommentPage : NODE_HOST + '/work/comment/getCommentPage',// 获取单个tab下的评论列表数据，每页10条

  // 假评论comment
  getCommentEnum: NODE_HOST + '/user/comment/getall',
  addCommentEnum: NODE_HOST + '/user/comment/add',
  deleteCommentEnum: NODE_HOST + '/user/comment/delete',
  getVuser: NODE_HOST + '/user/vuser/getall',
  deleteVuser:NODE_HOST + '/user/vuser/deleteall',
  addVuser:NODE_HOST + '/user/vuser/add',
  getCommentTask: NODE_HOST + '/user/commenttask/getall',
  addCommentTask: NODE_HOST + '/user/commenttask/add',
  // 认证号管理
  getAuthorInfo:JAVA_OPERATE_HOST+ '/works/SWorks/BatchGetAuthorInfo',

  // 测试用户信息
  getUserInfo:JAVA_OPERATE_HOST+'/user/SUser/BatchGetUserBaseInfo',
  setUserInfo:JAVA_OPERATE_HOST+'/user/SUser/ResetUserData'
}
