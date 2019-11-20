<template>
  <div class="work_manage_wrapper">
    <div class="search_wrap">
      <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
      <el-select v-if="activeName=='workTab'" v-model="workSearchType" placeholder="请选择">
        <el-option v-for="item in workSearchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-select v-else v-model="vsetSearchType" placeholder="请选择">
        <el-option v-for="item in vsetSearchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容">
        <el-button v-if="activeName=='vsetTab'" slot="append" icon="el-icon-search" @click='searchVset'></el-button>
        <el-button v-else-if="activeName=='downVsetTab'" slot="append" icon="el-icon-search" @click='searchDownVset'></el-button>
        <el-button v-else slot="append" icon="el-icon-search" @click='searchWork'></el-button>
      </el-input>
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="作品列表" name="workTab">
        <el-table :data="workList" @sort-change="sortChange">
          <el-table-column prop="videoName" label="作品名" width="200">
          </el-table-column>
          <el-table-column label="类型">
            <template slot-scope="props">
              <div>{{!props.row.videoType ? '视频' : '音频'}}</div>
            </template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.videoCoverUrl" style="max-height: 155px;max-width: 250px">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.videoUrl">
                <VideoPlayer :extendOptions='{poster: props.row.videoCoverUrl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.videoUrl' :height="155"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publishtime && $util.formatFullTime(props.row.publishtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="authorName" label="认证主体">
          </el-table-column>
          <template v-if="!searchVid">
            <el-table-column label="播放数" sortable="custom" width="100">
              <template slot-scope="props">
                <div>{{props.row.playCount || 0}}</div>
              </template>
            </el-table-column>
            <el-table-column label="去重播放数" sortable="custom"  width="120">
              <template slot-scope="props">
                <div>{{props.row.playUserCount || 0}}</div>
              </template>
            </el-table-column>
            <el-table-column label="点赞数" sortable="custom"  width="100">
              <template slot-scope="props">
                <div>{{props.row.likeCount || 0}}</div>
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column label="播放数"  width="100">
              <template slot-scope="props">
                <div>{{props.row.playCount || 0}}</div>
              </template>
            </el-table-column>
            <el-table-column label="去重播放数"  width="120">
              <template slot-scope="props">
                <div>{{props.row.playUserCount || 0}}</div>
              </template>
            </el-table-column>
            <el-table-column label="点赞数"  width="100">
              <template slot-scope="props">
                <div>{{props.row.likeCount || 0}}</div>
              </template>
            </el-table-column>
          </template>
          <el-table-column label="操作" fixed="right" width="220">
            <template slot-scope="props">
              <el-button type="primary" @click="showEditWork(props.row)">编辑</el-button>
              <el-button type="primary" @click="showDetail(props.row.vid)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
      </el-tab-pane>
      <!-- 合集列表 -->
      <el-tab-pane class="tab_item" label="合集列表" name="vsetTab">
        <el-table :data="vsetList">
          <el-table-column prop="name" label="合集名">
          </el-table-column>
          <el-table-column label="合集封面" width="300">
            <template slot-scope="props">
              <img style="max-width: 100%; max-height: 100px" :src="props.row.coverurl">
            </template>
          </el-table-column>
          <el-table-column label="作品数">
            <template slot-scope="props">{{props.row.videocount || 0}}</template>
          </el-table-column>
          <el-table-column prop="aid" label="认证号ID">
          </el-table-column>
          <el-table-column prop="authorname" label="认证号">
          </el-table-column>
          <el-table-column label="分类">
            <template slot-scope="props">
              <div>{{props.row.category && props.row.category[0].name}}</div>
            </template>
          </el-table-column>
          <el-table-column label="最后更新时间">
            <template slot-scope="props">
              <div>{{props.row.lastvideoaddtime && $util.formatFullTime(props.row.lastvideoaddtime, 'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template slot-scope="props">
              <el-button style="margin:10px" size="mini" type="primary" @click="showEditVset(props.row)">编辑</el-button>
              <el-button style="margin:10px" size="mini" type="primary" @click="showDownVset(props.row)">下架</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next, jumper" :total="vsetTotal" :current-page="vsetPage" :page-size="vsetPageSize" @current-change="changeVsetPage">
        </el-pagination>
      </el-tab-pane>
      <!-- 已下架合集列表 -->
      <el-tab-pane class="tab_item" label="合集删除记录" name="downVsetTab">
        <el-table :data="downVsetList">
          <el-table-column prop="name" label="合集名">
          </el-table-column>
          <el-table-column label="合集封面" width="300">
            <template slot-scope="props">
              <img style="max-width: 100%; max-height: 100px" :src="props.row.coverurl">
            </template>
          </el-table-column>
          <el-table-column label="作品数">
            <template slot-scope="props">{{props.row.videocount || 0}}</template>
          </el-table-column>
          <el-table-column prop="aid" label="认证号ID">
          </el-table-column>
          <el-table-column prop="authorname" label="认证号">
          </el-table-column>
          <el-table-column label="分类">
            <template slot-scope="props">
              <div>{{props.row.category && props.row.category[0].name}}</div>
            </template>
          </el-table-column>
          <el-table-column label="最后更新时间">
            <template slot-scope="props">
              <div>{{props.row.lastvideoaddtime && $util.formatFullTime(props.row.lastvideoaddtime, 'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template slot-scope="props">
              <el-button style="margin:10px" size="mini" type="primary" @click="showRecoveVset(props.row)">恢复</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next, jumper" :total="downVsetTotal" :current-page="downVsetPage" :page-size="downVsetPageSize" @current-change="changeDownVsetPage">
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
    <!-- 下架合集 -->
    <el-dialog title="下架合集" :visible.sync="downVsetDialogVisible">
      <el-form>
        <el-form-item label="下架原因" label-width="100px">
          <el-select v-model="downVsetReason" placeholder="请选择">
            <el-option v-for="item in reasonList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downVsetReason=='自定义输入'" label="原因" label-width="100px">
          <el-input v-model="customDownVsetReason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="downVsetDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="downVset">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑合集 -->
    <el-dialog title="编辑合集" :visible.sync="editVsetDialogVisible">
      <el-form :data="vsetForm">
        <el-form-item label="标题" label-width="80px">
          <el-input v-model="vsetForm.name"></el-input>
        </el-form-item>
        <el-form-item label="图片" label-width="80px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="vsetForm.coverurl" :src="vsetForm.coverurl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="分类" label-width="100px">
          <el-select v-model="vsetForm.categoryId" placeholder="请选择">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.typename" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVsetDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editVset">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑作品 -->
    <el-dialog title="编辑作品" :visible.sync="editDialogVisible">
      <el-form>
        <el-form-item label="标题" label-width="100px">
          <el-input v-model="workForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="workForm.coverurl" :src="workForm.coverurl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 作品统计详情 -->
    <el-dialog :title="detailTile" :visible.sync="showDetailDialg">
      <el-table v-loading="dialogLoading" :data="detailList">
        <el-table-column label="日期">
          <template slot-scope="props">{{props.row.date && $util.formatFullTime(props.row.date, 'yyyy-MM-dd hh:mm')}}</template>
        </el-table-column>
        <el-table-column label="播放数">
          <template slot-scope="props">{{props.row.playCount||0}}</template>
        </el-table-column>
        <el-table-column label="去重播放数">
          <template slot-scope="props">{{props.row.playUserCount||0}}</template>
        </el-table-column>
        <el-table-column label="点赞数">
          <template slot-scope="props">{{props.row.likeCount||0}}</template>
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination layout="total, prev, pager, next, jumper" :total="detailTotal" :current-page="detailPage" :page-size="detailPageSize" @current-change="detailChangePage">
        </el-pagination>
      </div>
    </el-dialog>
    <!-- 按名称搜索作品结果 -->
    <el-dialog title="搜索结果" :visible.sync="showSearchWorkDialg">
      <el-table v-loading="dialogLoading" :data="searchWorkList">
        <el-table-column label="作品ID" prop="vid">
        </el-table-column>
        <el-table-column label="作品名称" prop="videoname">
          <template slot-scope="props">
            <el-button type="text" @click="getWorkByVid(props.row.vid)">{{props.row.videoname}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="认证主体" prop="authorname">
          <template slot-scope="props">
            <el-button type="text" @click="getWorkByAid(props.row.aid)">{{props.row.authorname}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination layout="total, prev, pager, next, jumper" :total="searchWorkTotal" :current-page="searchWorkPage" :page-size="searchWorkPageSize" @current-change="searchWorkChangePage">
        </el-pagination>
      </div>
    </el-dialog>
    <!-- 按名称搜索公众号结果 -->
    <el-dialog title="搜索结果" :visible.sync="showSearchAuthorDialg">
      <el-table v-loading="dialogLoading" :data="searchAuthorList">
        <el-table-column label="公众号ID" prop="aid">
        </el-table-column>
        <el-table-column label="认证主体">
          <template slot-scope="props">
            <el-button type="text" @click="getWorkByAid(props.row.aid)">{{props.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="简介" prop="note">
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination layout="total, prev, pager, next, jumper" :total="searchAuthorTotal" :current-page="searchAuthorPage" :page-size="searchAuthorPageSize" @current-change="searchAuthorChangePage">
        </el-pagination>
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
import VideoPlayer from '@/components/VideoPlayer';
export default {
  name: 'RecManage',
  components: {
    VideoPlayer
  },
  data() {
    return {
      loading: true,
      dialogLoading: true,
      dateRange: null,
      workSearchOptions: [{
          label: '作品名',
          value: 1
        },
        {
          label: '认证主体名',
          value: 2
        }
      ],
      workSearchType: 1,
      vsetSearchOptions: [{
        label: '合集名',
        value: 0
      }, {
        label: '认证号ID',
        value: 1
      }],
      vsetSearchType: 0,
      searchKey: '',
      workSearchKey: '',
      vsetSearchKey: '',
      activeName: 'workTab',
      workList: [],
      workTotal: undefined,
      workPage: 1,
      workPageSize: 3,
      vsetList: [],
      vsetTotal: undefined,
      vsetPage: 1,
      vsetPageSize: 4,
      downVsetList: [],
      downVsetTotal: undefined,
      downVsetPage: 1,
      downVsetPageSize: 4,
      downVsetDialogVisible: false,
      editVsetDialogVisible: false,
      editDialogVisible: false,
      downVsetReason: '', //下架原因
      customDownVsetReason: '', //自定义输入原因
      workForm: {
        name: '',
        coverurl: ''
      },
      vsetForm: {
        name: '',
        categoryId: 0,
        coverurl: ''
      },
      reasonList: null,
      detailTile: '',
      showDetailDialg: false,
      detailTotal: undefined,
      detailPage: 1,
      detailPageSize: 10,
      detailList: [],
      searchWorkPage: 1,
      searchWorkTotal: undefined,
      searchWorkList: [],
      searchWorkPageSize: 6,
      showSearchWorkDialg: false,
      searchAuthorPage: 1,
      searchAuthorTotal: undefined,
      searchAuthorList: [],
      searchAuthorPageSize: 6,
      showSearchAuthorDialg: false
    }
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapState('global', ['categoryList','CSPECIAL','UNRECOMMEND','CANCEL'])
  },
  created() {
    var now = new Date();
    this.reasonList = this.CANCEL;
    this.activeIndex = 0;
    this.todayBegin = now - now.getHours() * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
    this.todayEnd = this.todayBegin + 24 * 60 * 60 * 1000;
    this.dateRange = [new Date(this.todayBegin), new Date(this.todayEnd - 1)];
    this.innerGetCategoryList();
    this.getVideosStat();
  },
  methods: {
    ...mapActions('global', ['getCategoryList']),
    changeTab(tab) {
      switch (tab.name) {
        case 'workTab':
          this.workList.length == 0 && this.getVideosStat();
          break;
        case 'vsetTab':
          this.vsetList.length == 0 && this.getVsetData();
          break;
        case 'downVsetTab':
          this.downVsetList.length == 0 && this.getDownVsetData();
          break;
      }
    },
    //选择日期范围
    dateChange(range) {
      this.beginTime = range && Math.floor((+range[0])) || 0;
      this.endTime = range && Math.floor((+range[1])) || 0;
      if (this.beginTime && this.beginTime == this.endTime) {
        this.endTime += 24 * 60 * 60 * 1000;
      }
    },
    changeWorkPage(page) {
      this.workPage = page;
      this.workList = [];
      this.getVideosStat();
    },
    changeVsetPage(page) {
      this.vsetPage = page;
      this.vsetList = [];
      this.getVsetData();
    },
    detailChangePage(page) {
      this.detailPage = page;
      this.detailList = [];
      this.getDetailList();
    },
    searchWorkChangePage(page) {
      this.searchWorkPage = page;
      this.searchWorkList = [];
      this.searchVdieoByName();
    },
    searchAuthorChangePage(page) {
      this.searchAuthorPage = page;
      this.searchAuthorList = [];
      this.searchAuthorByName();
    },
    changeDownVsetPage(page) {
      this.downVsetPage = page;
      this.downVsetList = [];
      this.getDownVsetData();
    },
    getWorkByAid(aid) {
      this.searchAid = aid;
      this.workPage = 1;
      this.workList = [];
      this.showSearchWorkDialg = false;
      this.showSearchAuthorDialg = false;
      this.getVideosStat();
    },
    getWorkByVid(vid) {
      this.searchVid = [vid];
      this.workPage = 1;
      this.workList = [];
      this.showSearchWorkDialg = false;
      this.showSearchAuthorDialg = false;
      this.getVideosStatByVids();
    },
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        if (this.activeName == 'vsetTab') {
          this.searchVset();
        } else if (this.activeName == 'downVsetTab') {
          this.searchDownVset();
        } else {
          this.searchWork();
        }
      }
    },
    //更改排序
    sortChange(e) {
      if (e.column) {
        if (e.column.label == '播放数') {
          this.sort = 1;
        } else if (e.column.label == '去重播放数') {
          this.sort = 2;
        } else {
          this.sort = 3;
        }
      } else {
        this.sort = null;
      }
      if (!this.searchVid) {
        this.workPage = 1;
        this.workList = [];
        this.getVideosStat();
      }
    },
    //搜索作品
    searchWork() {
      this.workSearchKey = this.searchKey;
      this.workPage = 1;
      this.workList = [];
      this.workStarTime = this.beginTime;
      this.workEndTime = this.endTime;
      if (!this.workSearchKey) {
        this.searchAid = 0;
        this.getVideosStat();
      } else if (this.workSearchType == 1) {
        this.showSearchWorkDialg = true;
        this.searchVdieoByName();
      } else {
        this.showSearchAuthorDialg = true;
        this.searchAuthorByName();
      }
    },
    //搜索合集
    searchVset() {
      this.vsetSearchKey = this.searchKey;
      this.vsetPage = 1;
      this.vsetList = [];
      this.vsetStarTime = this.beginTime;
      this.vsetEndTime = this.endTime;
      this.getVsetData();
    },
    //搜索下架的合集
    searchDownVset() {
      this.downVsetSearchKey = this.searchKey;
      this.downVsetPage = 1;
      this.downVsetList = [];
      this.downVsetStarTime = this.beginTime;
      this.downVsetEndTime = this.endTime;
      this.getDownVsetData();
    },
    //获取分类列表
    innerGetCategoryList() {
      if (this.categoryList.length) {
        return Promise.resolve();
      } else {
        return this.getCategoryList();
      }
    },
    //显示作品统计信息
    showDetail(vid) {
      this.detailVid = vid;
      this.showDetailDialg = true;
      this.getDetailList();
    },
    //获取作品统计信息
    getDetailList() {
      var pageid = (this.detailPage - 1) * this.detailPageSize;
      this.dialogLoading = true;
      var option = {
        vid: this.detailVid,
        pageid: pageid,
        count: this.detailPageSize,
        starttime: 0,
        endtime: this.todayEnd
      }
      this.$http.post(api.GetVideoStatDetail, option).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.detailTotal = +res.data.total || undefined;
          this.detailList = res.data.info || [];
          this.dialogLoading = false;
        } else {
          this.$message.error(res.data && res.data.head.msg);
          this.dialogLoading = false;
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取作品统计详情失败');
        this.dialogLoading = false;
      });
    },
    //作品列表
    getVideosStat() {
      var pageid = (this.workPage - 1) * this.workPageSize;
      this.loading = true;
      var option = {
        pageid: pageid,
        count: this.workPageSize,
        starttime: this.workStarTime || this.todayBegin,
        endtime: this.workEndTime || this.todayEnd,
        sort: this.sort || 0
      }
      if (this.searchAid) {
        option.aid = this.searchAid;
      }
      this.searchVid = null;
      this.$http.post(api.GetVideosStat, option).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.workTotal = +res.data.total || undefined;
          this.workList = res.data.info || [];
          this.loading = false;
        } else {
          this.$message.error(res.data && res.data.head.msg);
          this.loading = false;
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取作品列表失败');
        this.loading = false;
      });
    },
    //根据vids获取作品列表
    getVideosStatByVids() {
      var pageid = (this.workPage - 1) * this.workPageSize;
      this.loading = true;
      var option = {
        pageid: pageid,
        count: this.workPageSize,
        starttime: this.workStarTime || this.todayBegin,
        endtime: this.workEndTime || this.todayEnd,
        vid: this.searchVid
      }
      this.$http.post(api.BatchGetVideoStat, option).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.workTotal = +res.data.total || undefined;
          this.workList = res.data.info || [];
          this.loading = false;
        } else {
          this.$message.error(res.data && res.data.head.msg);
          this.loading = false;
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取作品列表失败');
        this.loading = false;
      });
    },
    //搜索作品列表
    searchVdieoByName() {
      var pageid = (this.searchWorkPage - 1) * this.searchWorkPageSize;
      this.dialogLoading = true;
      this.$http.post(api.SearchVideo, {
        condition: this.workSearchKey,
        pageid: pageid,
        count: this.searchWorkPageSize,
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data && res.data.head.status == 1) {
          this.searchWorkTotal = +res.data.total || undefined;
          this.searchWorkList = res.data.info || [];
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取合集列表失败');
        this.dialogLoading = false;
      });
    },
    //搜索认证号列表
    searchAuthorByName() {
      var pageid = (this.searchAuthorPage - 1) * this.searchAuthorPageSize;
      this.dialogLoading = true;
      this.$http.post(api.GetAuthorsByName, {
        value: this.workSearchKey,
        pageid: pageid,
        count: this.searchAuthorPageSize,
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data && res.data.head.status == 1) {
          this.searchAuthorTotal = +res.data.total || undefined;
          this.searchAuthorList = res.data.info || [];
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取合集列表失败');
        this.dialogLoading = false;
      });
    },
    //获取合集列表
    getVsetData() {
      var pageid = (this.vsetPage - 1) * this.vsetPageSize;
      this.loading = true;
      this.$http.post(api.SearchVideoSet4Admin, {
        condition: this.vsetSearchKey,
        target: this.vsetSearchType, // 搜索的目标
        pageid: pageid,
        count: this.vsetPageSize,
        starttime: this.vsetStarTime || 0, // 合集建立的开始日期
        endtime: this.vsetEndTime || 0, // 合集建立的结束日期
        state: 1, // 0=搜索所有，1=搜索正常状态的，2=搜索已停用的
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.vsetTotal = +res.data.total || undefined;
          this.vsetList = res.data.info;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
        this.loading = false;
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取合集列表失败');
      });
    },
    //获取下架的合集列表
    getDownVsetData() {
      var pageid = (this.downVsetPage - 1) * this.downVsetPageSize;
      this.loading = true;
      this.$http.post(api.SearchVideoSet4Admin, {
        condition: this.downVsetSearchKey,
        target: this.vsetSearchType, // 搜索的目标
        pageid: pageid,
        count: this.vsetPageSize,
        starttime: this.downVsetStarTime || 0, // 合集建立的开始日期
        endtime: this.downVsetEndTime || 0, // 合集建立的结束日期
        state: 2, // 0=搜索所有，1=搜索正常状态的，2=搜索已停用的
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.downVsetTotal = +res.data.total || undefined;
          this.downVsetList = res.data.info || [];
          this.loading = false;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取合集列表失败');
      });
    },
    //显示作品编辑弹框
    showEditWork(data) {
      this.workForm.vid = data.vid;
      this.workForm.name = data.videoName;
      this.workForm.coverurl = data.videoCoverUrl;
      this.editDialogVisible = true;
    },
    //显示合集编辑弹框
    showEditVset(data) {
      this.vsetForm.aid = data.aid;
      this.vsetForm.vsid = data.vsid;
      this.vsetForm.name = data.name;
      this.vsetForm.coverurl = data.coverurl;
      this.vsetForm.categoryId = data.category && '' + data.category[0].id || '';
      this.editVsetDialogVisible = true;
    },
    //下架合集确认弹框
    showDownVset(data) {
      this.downVsetDialogVisible = true;
      this.downVsid = data.vsid;
      this.downVsetReason = '';
      this.customDownVsetReason = '';
    },
    //合集恢复确认弹框
    showRecoveVset(data) {
      this.$confirm('提示', '是否确定要恢复').then(() => {
        this.revoerVsid = data.vsid;
        this.recoverVset();
      }).catch(() => {});
    },
    //下载合集
    downVset() {
      if (!this.downVsetReason || !this.customDownVsetReason && this.downVsetReason == '自定义输入') {
        this.$message('请选择或输入下架原因');
        return;
      }
      this.$http.post(api.ChangeVideoSetState, {
        vsid: this.downVsid,
        audituid: this.user.id,
        reason: this.customDownVsetReason || this.downVsetReason,
        state: 2, //1=正常状态的，2=已停用
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('下架成功');
          this.downVsetDialogVisible = false;
          this.getVsetData();
          this.getDownVsetData();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，下架合集失败');
      });
    },
    //编辑作品
    editWork() {
      this.$http.post(api.UpdateVideo, {
        vid: this.workForm.vid,
        title: this.workForm.name,
        coverurl: this.workForm.coverurl
      }).then((res) => {
        if (res.data.head.status == 1) {
          this.$message.success('编辑成功');
          this.editDialogVisible = false;
          this.getVideosStat();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('编辑失败');
      });
    },
    //恢复合集
    recoverVset() {
      this.$http.post(api.ChangeVideoSetState, {
        vsid: this.revoerVsid,
        audituid: this.user.id,
        state: 1, //1=正常状态的，2=已停用
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('恢复成功');
          this.downVsetDialogVisible = false;
          this.getVsetData();
          this.getDownVsetData();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，恢复合集失败');
      });
    },
    //编辑合集
    editVset() {
      this.$http.post(api.UpdateVset, {
        opuid: this.user.id, // 操作者用户id
        aid: this.vsetForm.aid, // 认证号id
        vsid: this.vsetForm.vsid, // 合集id
        name: this.vsetForm.name, // 合集名称
        coverurl: this.vsetForm.coverurl, // 封面
        category: [this.vsetForm.categoryId] // 分类id
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('编辑成功');
          this.editVsetDialogVisible = false;
          this.getVsetData(1);
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，编辑合集失败');
      });
    },
    //触发文件选择器
    triggerInput() {
      this.$refs.file.click();
    },
    //上传图片到阿里云
    uploadImage(e) {
      this.$util.upload(e.target.files[0]).then((url) => {
        if (this.activeName = 'vsetTab') {
          this.vsetForm.coverurl = url;
        } else {
          this.workForm.coverurl = url;
        }
      });
    }
  }
}

</script>
<style lang="scss">
.work_manage_wrapper {
  padding: 30px 20px;
  min-width: 890px;
  .search_wrap {
    display: flex;
    align-items: center;
    .el-input {
      margin-left: 20px;
      width: 200px;
    }
    .el-input-group--append {
      width: 260px;
    }
  }
  .tab_wrap {
    margin-top: 20px;
    padding: 0 20px;
    background-color: #fff;
    .tab_item {
      padding: 20px;
    }
  }
  th,
  td {
    text-align: center !important;
  }
  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader-icon:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    max-width: 100%;
    height: 178px;
    display: block;
    cursor: pointer;
  }
}

</style>
