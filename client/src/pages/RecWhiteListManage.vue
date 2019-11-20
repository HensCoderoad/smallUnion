<template>
  <div class="recommend_manage_wrapper">
    <div class="search_wrap">
      <el-select v-model="searchType" placeholder="请选择">
        <el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容"></el-input>
      <el-button @click='search'>搜索</el-button>
    </div>
    <el-button style="margin: 20px 0" type="primary" @click="addFormDialgVisible=true">新增白名单</el-button>
    <el-table v-loading="loading" :data="dataList" style="width: 100%;">
      <el-table-column prop="applyListBo.authorName" label="参与人">
      </el-table-column>
      <el-table-column prop="applyListBo.aid" label="认证号ID">
      </el-table-column>
      <el-table-column label="邀请转发次数">
        <template slot-scope="props">
          <span>{{props.row.inviteTransmitNum || 0}}</span>
        </template>
      </el-table-column>
      <el-table-column label="有填写的公众号数">
        <template slot-scope="props">
          <span>{{props.row.applyAllNum || 0}}</span>
        </template>
      </el-table-column>
      <el-table-column label="已入驻的公众号数">
        <template slot-scope="props">
          <span>{{props.row.applyPassNum || 0}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operName" label="白名单添加人">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="props">
          <el-button v-if="props.row.shortCodeStatus == 'SHORT_CODE_STOPPED'" type="text" @click="offline(props.row.applyListBo.aid,2)">上线用户推荐</el-button>
          <el-button v-else type="text" @click="offline(props.row.applyListBo.aid,3)">下线用户推荐</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="background: #fff" layout="prev, pager, next" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
    </el-pagination>
    <el-dialog title="新增白名单" :visible.sync="addFormDialgVisible">
      <el-form :model="addForm">
        <el-form-item label="认证号ID" label-width="100px">
          <el-input v-model="addForm.id" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormDialgVisible = false">取 消</el-button>
        <el-button type="primary" @click="addWhite">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
export default {
  name: 'RecManage',
  data() {
    return {
      searchOptions: [{
        label: '参与人AID',
        value: 1
      }],
      searchType: 1,
      searchKey: '',
      dataList: [],
      page: 1,
      total: 0,
      pageSize: 8,
      addForm: {
        id: '',
      },
      addFormDialgVisible: false,
      loading: true
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.refresh();
  },
  mounted() {},
  methods: {
    //切换页码
    changePage(page) {
      this.page = page;
      this.dataList = [];
      this.getData();
    },
    //回车搜索
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        this.search();
      }
    },
    //搜索
    search() {
      if(!/^\d*$/.test(this.searchKey)) {
        this.$message.error('请输入正确的格式');
        return;
      }
      this.confirmSearchKey = this.searchKey;
      this.refresh();
    },
    //刷新
    refresh() {
      this.total = 0;
      this.dataList = [];
      this.getTotal().then(()=>{
        this.total && this.getData();
      });
    },
    //获取列表总数
    getTotal() {
      this.loading = true;
      return this.$http.post(api.CountApplyAuthorList,{
        aid: this.confirmSearchKey || 0,
      }).then((res)=>{
        if(res.data.head.status == 1) {
          this.total = res.data.total || 0;
        }
        if(!this.total) {
          this.loading = false;
        }
      }).catch((err)=>{
        console.log(err);
        this.loading = false;
        this.$message.error('获取列表总数量失败');
      });
    },
    //获取列表数据
    getData() {
      var offset = (this.page-1)*this.pageSize;
      this.loading = true;
      return this.$http.post(api.ListApplyAuthorList,{
        aid: this.confirmSearchKey || 0,
        offset: offset,
        count: this.pageSize
      }).then((res)=>{
        this.loading = false;
        if(res.data.head.status == 1) {
          var ids = [];
          var list = res.data.info;
          list.map((item)=>{
            ids.push(item.applyListBo.operUid);
          });
          this.getOperUserName(ids).then((map)=>{
            if(map){
              list.map((item)=>{
                item.operName = map[item.applyListBo.operUid];
              });
            }
            this.dataList = list;
          });
        }
      }).catch((err)=>{
        console.log(err);
        this.loading = false;
        this.$message.error('获取列表数据失败');
      });
    },
    //获取操作人
    getOperUserName(ids) {
      return this.$http.get(api.getUserListByIds+'/'+ids.join(',')).then((res)=>{
        var map = {};
        res.data.list.map((item)=>{
          map[item.id] = item.name;
        });
        return map;
      }).catch((err)=>{
        console.log(err);
        this.$message.error('获取操作人列表失败');
      });
    },
    //下线用户推荐
    offline(aid, state) {
      this.$http.post(api.ChangeActivityCodeStateByRecommendAid, {
        state: state, // 状态： 2=使用中， 3=已禁用
        recommendAid: aid,
        opuid: this.user.id
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('操作成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
      });
    },
    //添加白名单
    addWhite() {
      if(!/^\d+$/.test(this.addForm.id)) {
        this.$message.error('请输入正确的格式');
        return;
      }
      this.$http.post(api.AddApplyAuthorList, {
        info: {
          aid: this.addForm.id,
          operUid: this.user.id
        }
      }).then((res)=>{
        if(res.data.head.status == 1) {
          this.$message.success('添加成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
        this.addFormDialgVisible = false;
      }).catch((err)=>{
        console.log(err);
        this.$message.error('服务器错误，添加失败');
        this.addFormDialgVisible = false;
      });
    }
  }
}

</script>
<style lang="scss">
.recommend_manage_wrapper {
  padding: 30px 20px;
  .search_wrap {
    display: flex;
    align-items: center;
    .el-input {
      margin-right: 20px;
      width: 300px;
    }
  }
  .tab_wrap {
    margin-top: 30px;
    padding: 0 20px;
    background-color: #fff;
    .tab_item {
      padding: 20px;
      .el-button--text {
        margin-left: 0;
        margin-right: 20px;
      }
    }
  }
  th,
  td {
    text-align: center !important;
  }
}

</style>
