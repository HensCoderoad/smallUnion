<template>
  <div class="dispatch_manage_wrapper">
    <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
    </el-date-picker>
    <div class="search_wrap">
      <el-select v-model="searchType" placeholder="请选择">
        <el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容"></el-input>
      <el-button @click="search">搜索</el-button>
    </div>
    <el-table v-loading="loading" class="table" :data="listData" style="width: 100%;">
      <el-table-column prop="rewardBaseBo.authorBo.authorName" label="认证号名称">
      </el-table-column>
      <el-table-column prop="rewardBaseBo.authorBo.aid" label="认证号ID">
      </el-table-column>
      <el-table-column prop="rewardBaseBo.authorBo.wxMpName" label="微信公众号">
      </el-table-column>
      <el-table-column prop="videoDetailBo.length" label="发文次数">
      </el-table-column>
      <el-table-column label="发文数据">
        <template slot-scope="data">
          <span v-html="dispatchFormatter(data.row)"></span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="data">
          <el-button type="text" @click="gotoDetail(data.row)">查看发文详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="total" :current-page="pageNo" :page-size="pageSize" @current-change="changePage">
    </el-pagination>
  </div>
</template>
<script>
import api from '@/api';
export default {
  name: 'DispatchManage',
  data() {
    return {
      searchOptions: [{
          label: '公众号名称',
          value: 1
        },
        {
          label: '公众号ID',
          value: 2
        }
      ],
      searchType: 1,
      searchKey: '',
      listData: [
        // {
        //   rewardBaseBo: {
        //     authorBo: {
        //       authorName: 'lisong',
        //       id: '11'
        //     }
        //   },
        //   videoDetailBo: [{
        //     videoTitle: '名称',
        //     cover: '呵呵',
        //     videoPlayUrl: 'https://cdn.img1.iduoliao.cn/video/6cbb4928babd1c2a55628fe45f0a9b5d.m3u8',
        //     playCountTotal: 10000,
        //     playUidCountTotal: 2000,
        //     videoCoverUrl: 'http://www.pptok.com/wp-content/uploads/2012/08/xunguang-4.jpg'
        //   }]
        // }
      ],
      dateRange: '',
      total: 0,
      pageNo: 1,
      pageSize: 5,
      loading: true
    }
  },
  created() {
    this.getTotal().then((total) => {
      total && this.getData();
    });
  },
  mounted() {},
  methods: {
    changePage(page) {
      this.pageNo = page;
      this.getData();
    },
    dateChange(range) {
      if (range) {
        this.beginTime = Math.floor((+range[0]) / 1000);
        this.endTime = Math.floor((+range[1]) / 1000);
        if (this.beginTime && this.beginTime == this.endTime) {
          this.endTime += 24 * 60 * 60 * 1000;
        }
      } else {
        this.beginTime = 0;
        this.endTime = 0;
      }
    },
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        this.search();
      }
    },
    search() {
      this.pageNo = 1;
      this.total = 0;
      this.listData = [];
      this.confirmSearchKey = this.searchKey;
      this.confirmBeginTime = this.beginTime;
      this.confirmEndTime = this.endTime;
      this.getTotal().then((total) => {
        total && this.getData();
      });
    },
    getTotal() {
      if (this.searchType == 2) {
        this.confirmSearchKey = this.searchKey || '0';
        if (!/^\d*$/.test(this.confirmSearchKey)) {
          this.$message.error('ID必须是数字');
          return;
        }
      }
      var data = {
        beginTime: this.confirmBeginTime || 0,
        endTime: this.confirmEndTime || 0
      };
      if (this.searchType == 1) {
        data.authorName = this.confirmSearchKey;
      } else {
        data.aid = this.confirmSearchKey || 0;
      }
      return this.$http.post(api.CountAuthorForRewardStat, data).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.total = res.data.total || 0;
          if (!this.total) {
            this.loading = false;
          }
          return res.data.total;
        } else {
          this.loading = false;
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('获取列表数量失败');
      })
    },
    getData() {
      // message AuthorSevenDaysVideoRewardBo {
      //   RewardBaseBo rewardBaseBo = 1; //奖励信息
      //   repeated VideoDetailBo videoDetailBo = 2; //奖励信息详情(7天作品列表)
      // }
      //奖励-基础信息
      // message RewardBaseBo {
      //   int64 rewardId = 1; //奖励id
      //   ActAuthorSimpleBo authorBo = 2; //认证号信息
      //   int32 amount = 3; //奖励经验值
      //   int32 effectTime = 4; //奖励生效时间，单位：秒
      //   TaskTypeEnum taskType = 5; //任务类型 1000=新人入驻 1001=首次发文  1002=7天累计发文有3篇达标
      // }
      var data = {
        beginTime: this.confirmBeginTime || 0,
        endTime: this.confirmEndTime || 0,
        offset: (this.pageNo - 1) * this.pageSize,
        count: this.pageSize
      };
      if (this.searchType == 1) {
        data.authorName = this.confirmSearchKey;
      } else {
        data.aid = this.confirmSearchKey || 0;
      }
      this.loading = true;
      this.$http.post(api.ListAuthorForRewardStat, data).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.listData = res.data.infos || [];
        } else {
          this.$message.error(res.data.head.msg);
        }
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
        console.log(err);
        this.$message.error('获取列表数据失败');
      });
    },
    gotoDetail(data) {
      data.videoDetailBo[0].authorName = data.rewardBaseBo.authorBo.authorName;
      data.videoDetailBo[0].aid = data.rewardBaseBo.authorBo.aid;
      localStorage.setItem('dispatch_detail', JSON.stringify(data.videoDetailBo));
      this.$router.push('/dispatch_detail');
    },
    dispatchFormatter(row) {
      var list = row.videoDetailBo;
      var counts = [0, 0, 0];
      list.map((item) => {
        if (item.playUidCountThirtyHoursPublishTime > 30000) {
          counts[2]++;
        } else if (item.playUidCountThirtyHoursPublishTime > 10000) {
          counts[1]++;
        } else if (item.playUidCountThirtyHoursPublishTime > 3000) {
          counts[0]++;
        }
      });
      var str = '';
      str += '播放量≥3000，' + counts[0] + '<br/>';
      str += '播放量≥10000，' + counts[1] + '<br/>';
      str += '播放量≥30000，' + counts[2] + '<br/>';
      return str;
    }
  }
}

</script>
<style lang="scss">
.dispatch_manage_wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 20px;
  overflow: auto;
  .search_wrap {
    display: flex;
    align-items: center;
    margin-top: 30px;
    .el-input {
      margin-right: 20px;
      width: 300px;
    }
  }
  .table {
    margin-top: 30px;
    .el-button--text {
      margin-left: 0;
      margin-right: 20px;
    }
  }
  th,
  td {
    text-align: center !important;
  }
  .el-pagination {
    background-color: #fff;
  }
}

</style>
