<template>
  <div class="crawler_manage_wrapper">
    <div class="search_wrap">
      <el-select v-model="searchType" placeholder="请选择">
        <el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button type="primary" @click='authorListDialogVisible=true'>今日爬虫发布统计</el-button>
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="作品列表" name="waiteToAuditTab">
        <el-table :data="tableData" style="margin-top: 30px" v-if="activeName=='waiteToAuditTab'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="来源">
                  <span>{{ props.row.video_from }}</span>
                </el-form-item>
                <el-form-item label="原分类">
                  <span>{{ props.row.old_type }}</span>
                </el-form-item>
                <el-form-item label="时长">
                  <span>{{ props.row.duration || 0 }}</span>
                </el-form-item>
                <el-form-item label="爬取时间">
                  <span>{{ props.row.spidertime && $util.formatFullTime(props.row.spidertime,'yyyy-MM-dd hh:mm') }}</span>
                </el-form-item>
                <el-form-item label="评论数">
                  <span>{{ props.row.comment_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="点赞数">
                  <span>{{ props.row.like_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="浏览数">
                  <span>{{ props.row.play_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="分享">
                  <span>{{ props.row.share_volume || 0 }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="作品名称" prop="title" width="200">
          </el-table-column>
          <el-table-column label="作品封面" width="200">
            <template slot-scope="item">
              <img v-if="item.row.img_oss_url" :src="item.row.img_oss_url" style="max-width: 100%;max-height: 160px">
              <span v-else>未设置封面</span>
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="item">
              <div v-if="item.row.video_oss_url" :key="item.row.img_oss_url">
                <VideoPlayer :extendOptions='{poster: item.row.img_oss_url,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='item.row.video_oss_url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="150">
            <template slot-scope="props">
              <div>{{ props.row.createtime && $util.formatFullTime(props.row.createtime,'yyyy-MM-dd hh:mm') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类" prop="video_type">
            <template slot-scope="props">
              <div>{{categoryIdNameMap[props.row.video_type]}}</div>
            </template>
          </el-table-column>
          <el-table-column label="匹配认证号" prop="user_name" width="120">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button size="mini" type="primary" @click="showPass(props.row)">通过</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showC(props.row)">C类</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="下架列表" name="downListTab">
        <el-table :data="tableData" style="margin-top: 30px" v-if="activeName=='downListTab'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="来源">
                  <span>{{ props.row.video_from }}</span>
                </el-form-item>
                <el-form-item label="原分类">
                  <span>{{ props.row.old_type }}</span>
                </el-form-item>
                <el-form-item label="时长">
                  <span>{{ props.row.duration || 0 }}</span>
                </el-form-item>
                <el-form-item label="评论数">
                  <span>{{ props.row.comment_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="点赞数">
                  <span>{{ props.row.like_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="浏览数">
                  <span>{{ props.row.play_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="分享">
                  <span>{{ props.row.share_volume || 0 }}</span>
                </el-form-item>
                <el-form-item label="爬取时间">
                  <span>{{ props.row.spidertime && $util.formatFullTime(props.row.spidertime,'yyyy-MM-dd hh:mm') }}</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.createtime && $util.formatFullTime(props.row.createtime,'yyyy-MM-dd hh:mm') }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.oper_user_id] }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="作品名称" prop="title" width="200">
          </el-table-column>
          <el-table-column label="作品封面" width="200">
            <template slot-scope="item">
              <img v-if="item.row.img_oss_url" :src="item.row.img_oss_url" style="max-width: 100%;max-height: 160px">
              <span v-else>未设置封面</span>
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="item">
              <div v-if="item.row.video_oss_url" :key="item.row.img_oss_url">
                <VideoPlayer :extendOptions='{poster: item.row.img_oss_url,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='item.row.video_oss_url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="150">
            <template slot-scope="props">
              <div>{{ props.row.createtime && $util.formatFullTime(props.row.createtime,'yyyy-MM-dd hh:mm') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类" prop="video_type">
            <template slot-scope="props">
              <div>{{categoryIdNameMap[props.row.video_type]}}</div>
            </template>
          </el-table-column>
          <el-table-column label="匹配认证号" prop="user_name" width="120">
          </el-table-column>
          <el-table-column label="下架原因" prop="reason" width="120">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showRecovery(props.row)">恢复作品</el-button>
              <el-button size="mini" type="primary" @click="showDelete(props.row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div style="background-color: #fff">
      <el-pagination layout="total, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
    <!-- 编辑作品 -->
    <el-dialog title="编辑作品" :visible.sync="editDialogVisible">
      <el-form>
        <el-form-item label="标题" label-width="100px">
          <el-input v-model="editForm.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="100px">
          <img style="max-width: 100%;max-height: 300px;cursor: pointer;" :src="editForm.img_oss_url || 'https://via.placeholder.com/200/999999/FFFFFF/?text=ADD_PICTURE'" @click="triggerInput">
        </el-form-item>
        <el-form-item label="分类" label-width="100px">
          <el-select v-model="editForm.video_type" placeholder="请选择" @change="changeEditCategory">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.typename" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="匹配认证号" label-width="100px" v-loading="authorLoading">
          <div style="display: flex;">
            <el-select v-if="!editForm.user_id_2" style="margin-right: 20px" v-model="editForm.user_id_1" :placeholder="editForm.user_name">
              <el-option v-for="item in editAuthorList" :key="item.author.aid" :label="item.author.name+'-->'+(item.author.videocount||0)" :value="item.author.aid">
              </el-option>
            </el-select>
            <div v-if="!editForm.user_id_1" class="edit_search_w">
              <el-input v-model="searchAuthorKey" autocomplete="off"></el-input>
              <el-button @click="searchAuthor">搜索</el-button>
            </div>
          </div>
          <div v-if="!editForm.user_id_1" class="eidt_search_result_w">
            <template v-for="item in editSearchAuthorList">
              <el-radio v-model="editForm.user_id_2" :label="item.author.aid" border>{{item.author.name}}-->{{item.author.videocount||0}}</el-radio>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 通过 -->
    <el-dialog title="通过" :visible.sync="passDialogVisible">
      <el-form :model="passForm" v-loading="passLoaing">
        <el-form-item label="视频分类" label-width="100px">
          <el-select v-model="passForm.video_type" placeholder="请选择">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.typename" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态" label-width="100px">
          <el-select v-model="passForm.recommendStatus" placeholder="请选择">
            <el-option label="上推荐" :value="1"></el-option>
            <el-option label="不推荐" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="passForm.recommendStatus==1" label="作品评级" label-width="100px">
          <el-select v-model="passForm.gradeType" placeholder="请选择">
            <el-option v-for="item in rankList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-if="passForm.recommendStatus==2" label="原因" label-width="100px">
          <el-select v-model="passForm.reason" placeholder="请选择">
            <el-option v-for="item in UNRECOMMEND" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="passForm.reason=='自定义输入'" label="原因" label-width="100px">
          <el-input v-model="passForm.customReason"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmPass">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 下架作品 -->
    <el-dialog title="下架" :visible.sync="downDialogVisible">
      <el-form :model="downForm">
        <el-form-item label="下架原因" label-width="100px">
          <el-select v-model="downForm.reason" placeholder="请选择">
            <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downForm.reason=='自定义输入'" label="原因" label-width="100px">
          <el-input v-model="downForm.customReason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="downDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDown">确 定</el-button>
      </div>
    </el-dialog>
    <!-- C类 -->
    <el-dialog title="C类" :visible.sync="cDialogVisible">
      <el-form :model="cForm" v-loading="passLoaing">
        <el-form-item label="视频分类" label-width="100px">
          <el-select v-model="cForm.video_type" placeholder="请选择">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.typename" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态" label-width="100px">
          <el-select v-model="cForm.recommendStatus" placeholder="请选择">
            <el-option label="上推荐" :value="1"></el-option>
            <el-option label="不推荐" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="原因" label-width="100px">
          <el-select v-model="cForm.reason" placeholder="请选择">
            <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmC">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 爬虫发布统计弹框 -->
    <el-dialog v-loading="authorListLoading" class="author_dialog_w" title="今日爬虫发布统计" :visible.sync="authorListDialogVisible">
      <el-table :data="authorList">
        <el-table-column prop="author.aid" label="认证号ID">
        </el-table-column>
        <el-table-column prop="author.name" label="认证号名称">
        </el-table-column>
        <el-table-column label="认证封面" width="300">
          <template slot-scope="props">
            <img v-if="props.row.author.headimage" :src="props.row.author.headimage" style="max-width: 200px;height: 100px">
            <span v-else>未设置封面</span>
          </template>
        </el-table-column>
        <el-table-column label="认证号领域">
          <template slot-scope="props">
            {{props.row.author.category && props.row.author.category[0].name || '未设置领域'}}
          </template>
        </el-table-column>
        <el-table-column prop="pubcount" label="发布作品数">
          <template slot-scope="props">
            <span>{{props.row.pubcount || 0}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template slot-scope="props">
            <el-button v-if="!props.row.pubcount || props.row.pubcount<10" type="primary" @click="showAddWork(props.row.author)">补作品</el-button>
            <el-button v-else type="primary" disabled>补作品</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination layout="total, prev, pager, next, jumper" :total="authorTotal" :current-page="authorPage" :page-size="authorPageSize" @current-change="authorChangePage">
        </el-pagination>
      </div>
    </el-dialog>
    <!-- 补齐弹框 -->
    <el-dialog title="补齐" :visible.sync="addWorkDialogVisible">
      <el-form v-loading="addWorkLoading" :model="addWorkForm">
        <el-form-item label="匹配数量" label-width="100px">
          <el-input-number v-model="addWorkForm.num" :min="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addWorkDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddWork">确 定</el-button>
      </div>
    </el-dialog>
    <div style="line-height: 0;height:0;">
      <input ref="file" type="file" style="visibility: hidden" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg" @change="uploadImage">
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import api from '@/api';
import STATUS from '@/api/status';
import VideoPlayer from '@/components/VideoPlayer';
export default {
  components: {
    VideoPlayer
  },
  name: 'CrawlerManage',
  data() {
    return {
      activeName: 'waiteToAuditTab',
      loading: false,
      status: 3, //3=待审核，4=审核通过或C类，5=下架
      searchOptions: [{
        label: '作品名称',
        value: 1
      }, {
        label: '认证号名称',
        value: 2
      }, {
        label: '爬虫来源',
        value: 3
      }],
      searchType: 1,
      searchKey: '',
      confirmSearchKey: '',
      searchAuthorKey: '',
      confirmSearchAuthorKey: '',
      page: 1,
      pageSize: 3,
      total: 0,
      tableData: [],
      allAuthorList: [],
      authorList: [],
      editAuthorList: [],
      editSearchAuthorList: [],
      editForm: {
        title: '',
        img_oss_url: '',
        video_type: '',
        user_id: '',
        user_id_1: '',
        user_id_2: '',
        user_name: ''
      },
      downForm: {
        reason: '',
        customReason: ''
      },
      addWorkForm: {
        num: 1
      },
      passForm: {},
      cForm: {},
      editDialogVisible: false,
      passDialogVisible: false,
      downDialogVisible: false,
      cDialogVisible: false,
      authorListDialogVisible: false,
      addWorkDialogVisible: false,
      categoryIdNameMap: {},
      downReasonList: null,
      cReasonList: null,
      rankList: [
        { id: 1, name: 'A级' },
        { id: 2, name: 'B级' },
        { id: 3, name: 'S级' }
      ],
      authorListLoading: false, //正在获取爬虫号列表
      authorLoading: false, //正在搜索匹配号
      passLoaing: false, //正在审核
      addWorkLoading: false, //正在补齐作品
      authorTotal: 0, //爬虫号列表总数量
      authorPage: 1, //爬虫号列表当前页码
      authorPageSize: 3, //爬虫号列表每页大小
      userIdNameMap: {},
      userIds: [],
    }
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapState('global', ['categoryList', 'CSPECIAL', 'UNRECOMMEND', 'CANCEL'])
  },
  created() {
    this.downReasonList = this.CANCEL;
    this.cReasonList = this.CSPECIAL;
    Promise.all([this.innerGetCategoryList(), this.getUserIds()]).then(() => {
      this.getTotal();
      this.getData();
      this.getCrawlUserList();
    });
  },
  mounted() {},
  methods: {
    ...mapActions('global', ['getCategoryList']),
    changeTab() {
      switch (this.activeName) {
        case 'waiteToAuditTab':
          this.page = 1;
          this.total = 0;
          this.status = 3;
          break;
        case 'downListTab':
          this.page = 1;
          this.total = 0;
          this.status = 5;
          break;
      }
      this.searchKey = '';
      this.confirmSearchKey = '';
      this.getTotal();
      this.getData();
    },
    //刷新
    refresh() {
      this.page = 1;
      this.total = 0;
      this.tableData = [];
      this.getTotal();
      this.getData();
    },
    //获取运营后台用户列表
    getUserList() {
      this.$http.get(api.getUserList).then((res) => {
        res.data.list.map((item) => {
          this.userIdNameMap[item.id] = item.nickName;
        });
      });
    },
    //获取待审核爬虫作品总数
    getTotal() {
      if(!this.getUserIdsDone) {
        return;
      }
      var option = {
        status: this.status,
        userIds: this.userIds
      };
      if (this.searchType == 1) {
        option.titleKey = this.confirmSearchKey;
      }
      if (this.searchType == 2) {
        option.nameKey = this.confirmSearchKey;
      }
      if (this.searchType == 3) {
        option.from = this.confirmSearchKey;
      }
      return this.$http.post(api.getWorkTotal, option).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.total = res.data.total;
        } else {
          this.$message.error('获取作品数量失败');
        }
      }).catch((err) => {
        this.$message.error('服务器错误，获取作品数量失败');
      });
    },
    //获取待审核爬虫作品
    getData() {
      if(!this.getUserIdsDone) {
        return;
      }
      var option = {
        status: this.status,
        userIds: this.userIds
      };
      if (this.searchType == 1) {
        option.titleKey = this.confirmSearchKey;
      }
      if (this.searchType == 2) {
        option.nameKey = this.confirmSearchKey;
      }
      if (this.searchType == 3) {
        option.from = this.confirmSearchKey;
      }
      this.$http.post(api.getWorkList + '/' + this.page + '/' + this.pageSize, option).then((res) => {
        this.loading = false;
        if (res.data.status == STATUS.SUCCESS) {
          this.tableData = res.data.list;
        } else {
          this.$message.error('获取作品列表失败');
        }
      }).catch((err) => {
        this.loading = false
        this.$message.error('服务器错误，获取作品列表失败');
      });
    },
    //获取分类列表
    innerGetCategoryList() {
      if (this.categoryList.length) {
        this.categoryList.map((item) => {
          this.categoryIdNameMap[item.id] = item.typename;
        });
        return Promise.resolve();
      } else {
        return this.getCategoryList().then(() => {
          this.categoryList.map((item) => {
            this.categoryIdNameMap[item.id] = item.typename;
          });
        });
      }
    },
    //获取爬虫号列表
    getCrawlUserList() {
      var now = new Date();
      var todayTs = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      this.authorListLoading = true;
      return this.$http.post(api.ListAuthorsByPubCount, {
        pubcountStart: 0,
        pubtimeStart: todayTs,
        pubtimeEnd: todayTs + 24 * 60 * 60 * 1000,
        authorLabelType: 11,
        sort: 1, //按发布数排序
        asc: false
      }).then((res) => {
        this.authorListLoading = false;
        if (res.data && res.data.head.status == 1) {
          this.allAuthorList = res.data.author;
          this.authorTotal = this.allAuthorList.length;
          this.renderCrawlUserList();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        this.authorListLoading = false;
        this.$message.error('服务器错误，获取用户列表失败');
      });
    },
    //渲染一页爬虫统计
    renderCrawlUserList() {
      var start = (this.authorPage - 1) * this.authorPageSize;
      this.authorList = this.allAuthorList.slice(start, start + this.authorPageSize);
    },
    //显示编辑框
    showEdit(data) {
      this.editForm.vid = data.vid;
      this.editForm.title = data.title;
      this.editForm.img_oss_url = data.img_oss_url;
      this.editForm.video_type = '' + data.video_type;
      this.editForm.default_user_id = data.user_id;
      this.editForm.user_id = '';
      this.editForm.user_id_1 = '';
      this.editForm.user_id_2 = '';
      this.editForm.user_name = data.user_name;
      this.editAuthorList = [];
      this.editSearchAuthorList = [];
      this.editDialogVisible = true;
      this.getUserListByCid(this.editForm.video_type);
    },
    //显示通过框
    showPass(data) {
      this.passForm = JSON.parse(JSON.stringify(data));
      this.passForm.active = 0;
      this.$set(this.passForm, 'video_type', '' + data.video_type);
      this.$set(this.passForm, 'recommendStatus', 1);
      this.$set(this.passForm, 'gradeType', 2);
      this.$set(this.passForm, 'reason', '');
      this.$set(this.passForm, 'customReason', '');
      this.passDialogVisible = true;
    },
    //显示下架框
    showDown(data) {
      this.downForm.vid = data.vid;
      this.downForm.reason = '';
      this.downForm.customReason = '';
      this.downDialogVisible = true;
    },
    //显示C类标记框
    showC(data) {
      this.cForm = JSON.parse(JSON.stringify(data));
      this.cForm.active = 1;
      this.$set(this.cForm, 'video_type', '' + data.video_type);
      this.$set(this.cForm, 'recommendStatus', 1);
      this.$set(this.cForm, 'reason', '');
      this.$set(this.cForm, 'customReason', '');
      this.cDialogVisible = true;
    },
    //显示补充作品框
    showAddWork(data) {
      this.addWorkForm.uid = data.aid;
      this.addWorkForm.uname = data.name;
      this.addWorkForm.num = 0;
      this.addWorkDialogVisible = true;
    },
    //显示恢复弹框
    showRecovery(data) {
      this.$confirm('是否确定恢复作品？', '提示').then(() => {
        this.confirmRecovery(data.vid);
      }).catch(() => {});
    },
    //彻底删除
    showDelete(data) {
      this.$confirm('是否确定删除作品？', '提示').then(() => {
        this.confirmDelete(data.vid);
      }).catch(() => {});
    },
    //上传图片
    uploadImage(e) {
      this.$util.upload(e.target.files[0]).then((url) => {
        this.editForm.img_oss_url = url;
      });
    },
    //编辑
    confirmEdit() {
      this.editForm.user_id = this.editForm.user_id_1 || this.editForm.user_id_2 || this.editForm.default_user_id;
      if (this.editForm.user_id_1) {
        this.editForm.user_name = this.findUserNameByAid(this.editAuthorList, this.editForm.user_id_1);
      } else if (this.editForm.user_id_2) {
        this.editForm.user_name = this.findUserNameByAid(this.editSearchAuthorList, this.editForm.user_id_2);
      }
      this.$http.post(api.updateWork, {
        vid: this.editForm.vid,
        title: this.editForm.title,
        img_oss_url: this.editForm.img_oss_url,
        video_type: this.editForm.video_type,
        user_id: this.editForm.user_id,
        user_name: this.editForm.user_name
      }).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.$message.success('编辑成功');
          this.editDialogVisible = false;
          this.getData();
        } else {
          this.$message.error('编辑失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('编辑失败');
      });
    },
    //根据aid查找用户名
    findUserNameByAid(list, aid) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].author.aid == aid) {
          return list[i].author.name
        }
      }
    },
    //确认下架
    confirmDown() {
      var reason = this.downForm.reason == '自定义输入' ? this.downForm.customReason : this.downForm.reason;
      if (!reason) {
        this.$message.error('下架原因不能为空');
        return;
      }
      this.$http.post(api.changeStatus, {
        vid: this.downForm.vid,
        status: 5, //3=待审核，4=审核通过或C类，5=下架
        operUid: this.user.id,
        operUname: this.user.name,
        reason: reason
      }).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.$message.success('下架成功');
          this.downDialogVisible = false;
          if (this.tableData.length == 1) {
            this.page--;
          }
          this.total && this.total--;
          this.getData();
        } else {
          this.$message.error('下架失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('下架失败');
      });
    },
    //确认恢复
    confirmRecovery(vid) {
      this.$http.post(api.changeStatus, {
        vid: vid,
        status: 3, //3=待审核，4=审核通过或C类，5=下架
        operUid: this.user.id,
        operUname: this.user.name
      }).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.$message.success('恢复成功');
          this.total && this.total--;
          if (this.tableData.length == 1) {
            this.page--;
          }
          this.getData();
        } else {
          this.$message.error('恢复失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('恢复失败');
      });
    },
    //确认删除
    confirmDelete(vid) {
      this.$http.post(api.deleteWork, {
        vid: vid
      }).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.$message.success('删除成功');
          this.total && this.total--;
          if (this.tableData.length == 1) {
            this.page--;
          }
          this.getData();
        } else {
          this.$message.error('删除失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('删除失败');
      });
    },
    //确认通过
    confirmPass() {
      this.checkIfCanPublish(this.passForm.user_id).then((pass) => {
        pass && this.publish(this.passForm);
      });
    },
    //确认标记为C类
    confirmC() {
      var reason = this.cForm.reason == '自定义输入' ? this.cForm.customReason : this.cForm.reason;
      if (reason) {
        this.cForm.reason = reason;
        this.checkIfCanPublish(this.cForm.user_id).then((pass) => {
          pass && this.publish(this.cForm);
        });
      } else {
        this.$message.error('原因不能为空');
      }
    },
    //检查认证号是否可以再发布
    checkIfCanPublish(aid) {
      var now = new Date();
      var todayTs = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      this.passLoaing = true;
      return this.$http.post(api.ListAuthorsByPubCount, {
        aid: aid,
        authorname: this.searchAuthorKey,
        pubcountStart: 0,
        pubcountEnd: 10,
        pubtimeStart: todayTs,
        pubtimeEnd: todayTs + 24 * 60 * 60 * 1000,
        authorLabelType: 11
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          if (res.data.author.length && res.data.author[0].pubcount >= 10) {
            this.passLoaing = false;
            this.$message.error('该认证号今日发文数已经大于10个');
            return false;
          }
          return true;
        } else {
          this.passLoaing = false;
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        this.passLoaing = false;
        this.$message.error('服务器错误，检查认证号发文数量失败');
      });
    },
    //发布
    publish(data) {
      var reason = data.reason == '自定义输入' ? data.customReason : data.reason;
      if ((/*data.recommendStatus == 2 || */data.active == 2) && !reason) {
        this.$message.error('原因不能为空');
        return;
      }
      this.$http.post(api.AddVideoFromSpider, {
        uid: this.user.id, // 操作用户
        aid: data.user_id, // 公众号id
        videourl: data.video_oss_url, // 作品url
        coverurl: data.img_oss_url, // 封面url
        type: 0, // 作品类型 0=视频，1=音频
        duration: data.duration, // 时长
        title: data.title, // 标题
        note: '', // 内容说明
        publish: true, // 是否立即发布
        shareimage: '', // 分享时使用的图片，如果为空则默认取封面
        width: data.width, // 视频的宽度
        height: data.height, // 视频的高度
        cpubtime: 0, // 用户自定义的发布时间，为0则取系统时间
        bid: this.$util.uuid(), // 业务流水号，可以为空。注：对一个作品的重复提交必须保证bid一致，这个是用来解决超时重复提交的问题
        category: [data.video_type], //领域id
        videopause: 0, //看了多久视频就要订阅后才能观看完整
        vsid: 0, // 所属的合集id
        gradeType: data.gradeType || 0, // 1=A级、2=B级、3=S级
        gradeValue: 0, //评级的值,比如 1000,2000(初开始来源评级所对应的值，但可自定义修改)
        recommendMinLimit: -1, //推荐最小暴光基数；当作品曝光量超过这个就是热门作品（目前是设置的B级所对应的暴光量） -1:不调整
        // 推荐相关
        recommendStatus: data.recommendStatus, //作品是否已上推荐  1=上推荐  2=下推荐
        // 审核相关
        audit_operation: data.active, //作品审核状态  1=已通过  2=C类标记
        mark: reason || '', //审核说明(下架/举报/不推荐)
        mark_type: '', //标记类型,目前暂时只有C类,可空
      }).then((res) => {
        this.passLoaing = false;
        this.cDialogVisible = false;
        this.passDialogVisible = false;
        if (res.data && res.data.head.status == 1) {
          this.pass(data);
          if (data.recommendStatus == 1) {
            this.addWhite(res.data.vid, data.user_id);
          } else {
            this.delWhite(res.data.vid, '');
          }
          this.$message.success('操作成功');
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.passLoaing = false;
        this.cDialogVisible = false;
        this.passDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //修改爬虫作品表审核状态
    pass(data) {
      return this.$http.post(api.changeStatus, {
        vid: data.vid,
        status: 4, //3=待审核，4=审核通过或C类，5=下架
        operUid: this.user.id,
        operUname: this.user.name,
        reason: ''
      }).then(() => {
        if (this.tableData.length == 1) {
          this.page--;
        }
        this.total && this.total--;
        this.getUserIds().then(()=>{
            this.getData();
        });
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，修改审核状态失败');
        return Promise.reject();
      });
    },
    //添加到推荐白名单
    addWhite(vid, aid, recommendStatus) {
      if (recommendStatus == 2) {
        return Promise.resolve();
      }
      return this.$http.post(api.addWhite, {
        vid: vid,
        aid: Number(aid),
        operUid: this.user.id
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，检测白名单失败');
        return Promise.reject();
      });
    },
    //删除推荐白名单
    delWhite(vid, reason) {
      return this.$http.post(api.delWhite, {
        vid: vid,
        operUid: this.user.id,
        reason: reason
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，删除白名单失败');
        return Promise.reject();
      });
    },
    //请求匹配作品数量
    confirmAddWork() {
      var str = `uid=${this.addWorkForm.uid}/uname=${this.addWorkForm.uname}/addnum=${this.addWorkForm.num}`
      this.addWorkLoading = true;
      this.$http.get(api.pleaseAddWork + str).then((res) => {
        this.addWorkLoading = false;
        this.addWorkDialogVisible = false;
        if (res.data.status == 1) {
          this.$message.success('操作成功');
          this.getCrawlUserList();
        } else if (res.data.status == 3) {
          this.$message('作品数不够了');
        } else {
          this.$message.error('操作失败')
        }
      }).catch((err) => {
        this.addWorkLoading = false;
        this.addWorkDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //搜索作品
    search() {
      this.confirmSearchKey = this.searchKey;
      this.refresh();
    },
    //回车搜索
    keydown(e) {
      if (e.keyCode == 108 || e.keyCode == 13) {
        this.search();
      }
    },
    //获取所有不满足发布条件的aid
    getUserIds() {
      var now = new Date();
      var todayTs = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      this.loading = true;
      return this.$http.post(api.ListAuthorsByPubCount, {
        authorname: '',
        pubcountStart: 10,
        pubtimeStart: todayTs,
        pubtimeEnd: todayTs + 24 * 60 * 60 * 1000,
        authorLabelType: 11
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.getUserIdsDone = true;
          res.data.author && res.data.author.map((item)=>{
            this.userIds.push(item.author.aid);
          });
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        this.loading = false;
        this.$message.error('服务器错误，获取认证号列表失败');
        return Promise.reject();
      });
    },
    //根据分类领域获取认证号
    getUserListByCid(categoryid) {
      var now = new Date();
      var todayTs = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      this.authorLoading = true;
      this.$http.post(api.ListAuthorsByPubCount, {
        authorname: '',
        pubcountStart: 0,
        pubcountEnd: 10,
        pubtimeStart: todayTs,
        pubtimeEnd: todayTs + 24 * 60 * 60 * 1000,
        authorLabelType: 11,
        categoryid: categoryid
      }).then((res) => {
        this.authorLoading = false;
        if (res.data && res.data.head.status == 1) {
          this.editAuthorList = res.data.author;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        this.authorLoading = false;
        this.$message.error('服务器错误，获取认证号列表失败');
      });
    },
    //搜索匹配认证号
    searchAuthor() {
      var now = new Date();
      var todayTs = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      this.authorLoading = true;
      this.$http.post(api.ListAuthorsByPubCount, {
        authorname: this.searchAuthorKey,
        pubcountStart: 0,
        pubcountEnd: 10,
        pubtimeStart: todayTs,
        pubtimeEnd: todayTs + 24 * 60 * 60 * 1000,
        authorLabelType: 11
      }).then((res) => {
        this.authorLoading = false;
        if (res.data && res.data.head.status == 1) {
          this.editSearchAuthorList = res.data.author;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        this.authorLoading = false;
        this.$message.error('服务器错误，搜索认证号失败');
      });
    },
    //作品列表页码更改
    changePage(page) {
      this.page = page;
      this.getData();
    },
    //爬虫号统计列表页面更改
    authorChangePage(page) {
      this.authorPage = page;
      this.renderCrawlUserList();
    },
    //触发图片选择系统框
    triggerInput(e) {
      this.$refs.file.click();
    },
    //编辑作品时更改分类
    changeEditCategory(cid) {
      this.editForm.user_id_1 = '';
      this.getUserListByCid(cid);
    }
  }
}

</script>
<style lang="scss">
.crawler_manage_wrapper {
  padding: 30px 20px;
  min-width: 890px;
  .search_wrap {
    display: flex;
    align-items: center;
    .el-input {
      margin-right: 20px;
      width: 200px;
    }
    .el-input-group--append {
      width: 260px;
    }
  }
  th,
  td {
    text-align: center !important;
    button {
      margin: 10px;
    }
  }
  .table_expand {
    font-size: 0;
  }
  .table_expand label {
    width: 120px;
    color: #99a9bf;
  }
  .table_expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
  .el-form-item {
    text-align: left;
  }
  .edit_search_w {
    flex-grow: 1;
    display: flex;
    .el-button {
      margin-left: 10px;
    }
  }
  .eidt_search_result_w {
    margin-top: 20px;
    .el-radio {
      margin-top: 10px;
      margin-left: 0 !important;
    }
  }
  .author_dialog_w {
    .el-dialog__body {
      /*max-height: 68vh;*/
      overflow: auto;
    }
  }
  .tab_wrap {
    margin-top: 20px;
    background: #fff;
    .el-tabs__nav-wrap {
      padding-left: 20px;
    }
  }
}

</style>
