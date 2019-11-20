<template>
  <div class="statistics_wrapper">
    <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
    </el-date-picker>
    <!-- <div class="back"><el-button @click="$router.go(-1)">返回</el-button></div> -->
    <el-table :data="dataList" style="margin-top: 20px;">
      <el-table-column prop="daynum" label="日期">
        <template slot-scope="props">
          <div>{{props.row.daynum && formateTime(props.row.daynum)}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="spider_author_count" label="爬虫号总数">
        <template slot-scope="props">
          <div>{{props.row.spider_author_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="spider_author_count_publish" label="发布爬虫号">
        <template slot-scope="props">
          <div>{{props.row.spider_author_count_publish || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="video_count_assign" label="匹配作品数">
        <template slot-scope="props">
          <div>{{props.row.video_count_assign || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="video_count_pass" label="采用作品数">
        <template slot-scope="props">
          <div>{{props.row.video_count_pass || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="subscribe_count" label="订阅数">
        <template slot-scope="props">
          <div>{{props.row.subscribe_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="subscribe_count_day" label="新增订阅数">
        <template slot-scope="props">
          <div>{{props.row.subscribe_count_day || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="play_count" label="播放次数">
        <template slot-scope="props">
          <div>{{props.row.play_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="play_user_count" label="播放人数">
        <template slot-scope="props">
          <div>{{props.row.play_user_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="recommend_play_count" label="音盟推荐播放次数">
        <template slot-scope="props">
          <div>{{props.row.recommend_play_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="er_play_count" label="去推荐播放次数">
        <template slot-scope="props">
          <div>{{props.row.er_play_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="wxf_share_count" label="微信分享次数">
        <template slot-scope="props">
          <div>{{props.row.wxf_share_count || 0}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="wxm_share_count" label="海报分享次数">
        <template slot-scope="props">
          <div>{{props.row.wxm_share_count || 0}}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
export default {
  name: 'PayHistory',
  data() {
    return {
      loading: true,
      dataList: [],
      total: 0,
      page: 1,
      pageSize: 10,
      dateRange: null
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getData();
  },
  methods: {
    //选择日期范围
    dateChange(range) {
      if(range) {
        this.startTime = Math.floor((+range[0])) || 0;
        this.endTime = Math.floor((+range[1])) || 0;
        if (this.startTime && this.startTime == this.endTime) {
          this.endTime += 24 * 60 * 60 * 1000;
        }
        this.startTime = Number(this.$util.formatFullTime(this.startTime, 'yyyyMMdd'));
        this.endTime = Number(this.$util.formatFullTime(this.endTime, 'yyyyMMdd'));
      } else {
        this.startTime = undefined;
        this.endTime = undefined;
      }
      this.page = 1;
      this.total = 0;
      this.getData();
    },
    //获取下架的合集列表
    getData() {
      this.dataList = [];
      this.loading = true;
      this.$http.post(api.getCrwlerStatistcs, {
        startTime: this.startTime,
        endTime: this.endTime
      }).then((res) => {
        this.loading = false;
        if (res.data && res.data.status == 1) {
          this.dataList = res.data.list;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取列表失败');
      });
    },
    changePage(page) {
      this.page = page;
      this.getData();
    },
    formateTime(num) {
      num+='';
      return num.slice(0,4)+'-'+num.slice(4,6)+'-'+num.slice(6);
    },
  }
}

</script>
<style lang="scss">
.statistics_wrapper {
  position: relative;
  padding: 30px 20px;
  th,
  td {
    text-align: center  !important;
  }
  .back {
    position: absolute;
    top: 30px;
    right: 20px;
  }
}

</style>
