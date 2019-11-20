<template>
  <div class="pay_manage_wrapper">
    <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
    </el-date-picker>
    <div class="search_wrap">
      <el-select v-model="workSearchType" placeholder="请选择">
        <el-option v-for="item in workSearchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容"></el-input>
      <el-button @click='search'>搜索</el-button>
    </div>
    <el-table :data="workList" style="margin-top: 20px;">
      <el-table-column prop="col1" label="认证号">
      </el-table-column>
      <el-table-column prop="col2" label="作品数">
      </el-table-column>
      <el-table-column prop="col3" label="付费作品数">
      </el-table-column>
      <el-table-column prop="col4" label="合集数">
      </el-table-column>
      <el-table-column prop="col5" label="付费合集数">
      </el-table-column>
      <el-table-column prop="col6" label="付费作品收入">
      </el-table-column>
      <el-table-column prop="col7" label="付费合集收入">
      </el-table-column>
      <el-table-column prop="col8" label="累积付费收益">
      </el-table-column>
      <el-table-column prop="col9" label="已结算收益">
      </el-table-column>
      <el-table-column prop="col10" label="未结算收益余额">
      </el-table-column>
      <el-table-column prop="col11" label="本期新增收益">
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120">
        <template slot-scope="props">
          <div style="display:inline-block;text-align: left;">
            <el-button style="margin:10px" size="mini" type="primary" @click="showPay(props.row)">结算</el-button>
            <el-button style="margin:10px" size="mini" type="primary" @click="$router.push('/pay_history')">结算历史</el-button>
            <el-button style="margin:10px" size="mini" type="primary" @click="$router.push('/pay_detail')">作品详情</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div style="background: #fff">
      <el-pagination layout="prev, pager, next" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
    <!-- 下架合集 -->
    <el-dialog title="结算" :visible.sync="moneyDialogVisible">
      <el-form>
        <el-form-item label="结算金额" label-width="100px">
          <el-input-number v-model="money" :precision="2" :step="0.1" :max="1000000"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moneyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confrimMoney">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
export default {
  name: 'PayManage',
  data() {
    return {
      loading: true,
      dateRange: null,
      workSearchOptions: [{
        label: '认证主体名',
        value: 1
      }],
      workSearchType: 1,
      searchKey: '',
      workSearchKey: '',
      workList: [],
      total: 0,
      page: 1,
      pageSize: 3,
      money: 0,
      moneyDialogVisible: false,
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
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        this.search();
      }
    },
    //搜索作品
    search() {
      this.workSearchKey = this.searchKey;
      this.workBeginTime = this.beginTime;
      this.workEndTime = this.endTime;
    },
    showPay(data) {
      this.toPayData = data;
      this.moneyDialogVisible = true;
    },
    //获取下架的合集列表
    getData() {
      this.workList = [{}];
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
    confrimMoney() {
      console.log(this.money);
      this.moneyDialogVisible = false;
    }
  }
}

</script>
<style lang="scss">
.pay_manage_wrapper {
  padding: 30px 20px;
  .search_wrap {
    display: flex;
    align-items: center;
    margin-top: 20px;
    .el-input {
      margin-right: 20px;
      width: 300px;
    }
  }
  th,
  td {
    text-align: center !important;
  }
}

</style>
