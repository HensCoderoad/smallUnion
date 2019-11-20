<template>
  <div class="pay_manage_wrapper">
    <div style="text-align: right;"><el-button @click="$router.go(-1)">返回</el-button></div>
    <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
    </el-date-picker>
    <el-tabs style="margin-top: 20px;background-color: #fff;padding: 20px" v-loading="loading" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="付费作品" name="workTab">
        <el-table :data="workList" style="margin-top: 20px;">
          <el-table-column prop="col1" label="作品名称">
          </el-table-column>
          <el-table-column prop="col2" label="作品封面" width="300">
            <template slot-scope="props">
              <img :src="props.row.col2" style="max-width: 100%;height: 200px">
            </template>
          </el-table-column>
          <el-table-column prop="col3" label="作品内容">
            <template slot-scope="props">
              <div :key="props.row.col2">
                <VideoPlayer :extendOptions='{poster: props.row.col2,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url="props.row.col3"></VideoPlayer>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="col4" label="作品价格">
          </el-table-column>
          <el-table-column prop="col5" label="付费人数">
          </el-table-column>
          <el-table-column prop="col6" label="付费金额">
          </el-table-column>
        </el-table>
        <div style="background: #fff">
          <el-pagination layout="prev, pager, next" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
          </el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="付费合集" name="vsetTab">
        <el-table :data="vsetList" style="margin-top: 20px;">
          <el-table-column prop="col2_1" label="合集名称">
          </el-table-column>
          <el-table-column prop="col2_2" label="合集作品数">
          </el-table-column>
          <el-table-column prop="col2_3" label="作品内容">
            <template slot-scope="props">
              <div>查看合集作品</div>
            </template>
          </el-table-column>
          <el-table-column prop="col2_4" label="合集价格">
          </el-table-column>
          <el-table-column prop="col2_5" label="付费人数">
          </el-table-column>
          <el-table-column prop="col2_6" label="付费金额">
          </el-table-column>
        </el-table>
        <div style="background: #fff">
          <el-pagination layout="prev, pager, next" :total="vsetTotal" :current-page="vsetPage" :page-size="vsetPageSize" @current-change="changeVsetPage">
          </el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
export default {
  name: 'PayManage',
  data() {
    return {
      activeName: 'workTab',
      loading: false,
      dateRange: null,
      workList: [],
      vsetList: [],
      total: 0,
      page: 1,
      pageSize: 3,
      vsetTotal: 0,
      vsetPage: 1,
      vsetPageSize: 3
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getData();
  },
  methods: {
    changeTab(tab) {

    },
    //选择日期范围
    dateChange(range) {
      this.beginTime = range && Math.floor((+range[0])) || 0;
      this.endTime = range && Math.floor((+range[1])) || 0;
      if (this.beginTime && this.beginTime == this.endTime) {
        this.endTime += 24 * 60 * 60 * 1000;
      }
    },
    changePage(page) {
      this.page = page;
      this.getData();
    },
    changeVsetPage(page) {
      this.vsetPage = page;
    },
    //搜索作品
    search() {
      if (this.activeName == 'workTab') {
        this.workBeginTime = this.beginTime;
        this.workEndTime = this.endTime;
        this.page = 0;
        this.total = 0;
        this.workList = [];
        this.getData();
      } else {
        this.vsetBeginTime = this.beginTime;
        this.vsetEndTime = this.endTime;
        this.vsetPage = 1;
        this.vsetTotal = 0;
        this.vsetList = [];
        this.getVsetData();
      }
    },
    //获取下架的合集列表
    getData() {
      // var pageid = (this.page - 1) * this.pageSize;
      // this.loading = true;
      // this.$http.post(api.SearchVideoSet4Admin, {}).then((res) => {
      //   if (res.data && res.data.head.status == 1) {
      //     this.total = +res.data.total;
      //     this.workList = res.data.info;
      //     this.loading = false;
      //   } else {
      //     this.$message.error(res.data && res.data.head.msg);
      //   }
      // }).catch((err) => {
      //   console.log(err);
      //   this.$message.error('服务器错误，获取列表失败');
      // });
    },
    getVsetData() {}
  }
}

</script>
<style lang="scss">
.pay_manage_wrapper {
  padding: 30px 20px;
  th,
  td {
    text-align: center !important;
  }
}

</style>
