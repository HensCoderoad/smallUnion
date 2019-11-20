<template>
  <div class="pay_history_wrapper">
    <div style="text-align: right;"><el-button @click="$router.go(-1)">返回</el-button></div>
    <el-table :data="historyList" style="margin-top: 20px;">
      <el-table-column prop="col1" label="结算日期">
        <template slot-scope="props">
          <div>{{props.row.col1 && $util.formatFullTime(props.row.col1, 'yyyy-MM-dd mm:hh')}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="col2" label="结算金额">
      </el-table-column>
      <el-table-column prop="col3" label="付费作品数">
      </el-table-column>
      <el-table-column prop="col4" label="是否提供发票和合同">
        <template slot-scope="props">
          <div>{{props.row.col4 ? '是' : '否'}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="col5" label="税率">
        <template slot-scope="props">
          <div>{{props.row.col5}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="col6" label="微信费率">
        <template slot-scope="props">
          <div>{{props.row.col6}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="col7" label="实付金额">
      </el-table-column>
      <el-table-column prop="col8" label="结算操作人">
      </el-table-column>
    </el-table>
    <div style="background: #fff">
      <el-pagination layout="prev, pager, next" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
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
      historyList: [],
      total: 0,
      page: 1,
      pageSize: 3,
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getData();
  },
  methods: {
    //获取下架的合集列表
    getData() {
      this.historyList = [];
      // var pageid = (this.page - 1) * this.pageSize;
      // this.loading = true;
      // this.$http.post(api.SearchVideoSet4Admin, {}).then((res) => {
      //   if (res.data && res.data.head.status == 1) {
      //     this.total = +res.data.total;
      //     this.historyList = res.data.info;
      //     this.loading = false;
      //   } else {
      //     this.$message.error(res.data && res.data.head.msg);
      //   }
      // }).catch((err) => {
      //   console.log(err);
      //   this.$message.error('服务器错误，获取列表失败');
      // });
    },
    changePage() {

    }
  }
}

</script>
<style lang="scss">
.pay_history_wrapper {
  padding: 30px 20px;
  th,
  td {
    text-align: center  !important;
  }
}

</style>
