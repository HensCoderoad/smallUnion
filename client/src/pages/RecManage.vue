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
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="待审核" name="toaudit">
        <el-table :data="dataList[0]" style="width: 100%;">
          <el-table-column prop="authorName" label="公众号名称">
          </el-table-column>
          <el-table-column prop="wxno" label="号主微信">
          </el-table-column>
          <el-table-column prop="phone" label="号主手机号">
          </el-table-column>
          <el-table-column prop="recommendAid" label="推荐人aid">
          </el-table-column>
          <el-table-column label="申请时间">
            <template slot-scope="item">
              <span v-if="item.row">{{$util.formatFullTime(item.row.applyTime*1000, 'yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column :formatter="stateFormatter" label="状态">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="item">
              <el-button type="text" @click="showConfirmAuditDialog(item.row)">通过</el-button>
              <el-button type="text" @click="showConfirmNoPassDialog(item.row)">不通过</el-button>
              <el-button type="text" @click="shiled(item.row, 1)" v-if='item.row.shiledStatus==2'>屏蔽</el-button>
              <el-button type="text" @click="shiled(item.row, 2)" v-else-if="item.row.shiledStatus==1">解封</el-button>
              <el-button type="text" @click="offline(item.row, 3)" v-if='item.row.offlineStatus==2'>下线用户推荐</el-button>
              <el-button type="text" @click="offline(item.row, 2)" v-else-if="item.row.offlineStatus==3">上线用户推荐</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" :total="totals[0]" :current-page="pages[0]" :page-size="pageSize" @current-change="changePage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="已通过" name="nopass">
        <el-table :data="dataList[1]" style="width: 100%;">
          <el-table-column prop="authorName" label="公众号名称">
          </el-table-column>
          <el-table-column prop="wxno" label="号主微信">
          </el-table-column>
          <el-table-column prop="phone" label="号主手机号">
          </el-table-column>
          <el-table-column prop="recommendAid" label="推荐人aid">
          </el-table-column>
          <el-table-column label="申请时间">
            <template slot-scope="item">
              <span v-if="item.row">{{$util.formatFullTime(item.row.applyTime*1000, 'yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="审核时间">
            <template slot-scope="item">
              <span v-if="item.row && item.row.auditTime">{{$util.formatFullTime(item.row.auditTime*1000, 'yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column :formatter="stateFormatter" label="状态">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="item">
              <!-- <el-button type="text" @click="showConfirmNoPassDialog(item.row)">不通过</el-button> -->
              <el-button type="text" @click="shiled(item.row, 1)" v-if='item.row.shiledStatus==2'>屏蔽</el-button>
              <el-button type="text" @click="shiled(item.row, 2)" v-else-if="item.row.shiledStatus==1">解封</el-button>
              <el-button type="text" @click="offline(item.row, 3)" v-if='item.row.offlineStatus==2'>下线用户推荐</el-button>
              <el-button type="text" @click="offline(item.row, 2)" v-else-if="item.row.offlineStatus==3">上线用户推荐</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" :total="totals[1]" :current-page="pages[1]" :page-size="pageSize" @current-change="changePage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="未通过" name="pass">
        <el-table :data="dataList[2]" style="width: 100%;">
          <el-table-column prop="authorName" label="公众号名称">
          </el-table-column>
          <el-table-column prop="wxno" label="号主微信">
          </el-table-column>
          <el-table-column prop="phone" label="号主手机号">
          </el-table-column>
          <el-table-column prop="recommendAid" label="推荐人aid">
          </el-table-column>
          <el-table-column label="申请时间">
            <template slot-scope="item">
              <span v-if="item.row">{{$util.formatFullTime(item.row.applyTime*1000, 'yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="审核时间">
            <template slot-scope="item">
              <span v-if="item.row && item.row.auditTime">{{$util.formatFullTime(item.row.auditTime*1000, 'yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column :formatter="stateFormatter" label="状态">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="item">
              <!-- <el-button type="text" @click="showConfirmAuditDialog(item.row)">通过</el-button> -->
              <el-button type="text" @click="shiled(item.row, 1)" v-if='item.row.shiledStatus==2'>屏蔽</el-button>
              <el-button type="text" @click="shiled(item.row, 2)" v-else-if="item.row.shiledStatus==1">解封</el-button>
              <el-button type="text" @click="offline(item.row, 3)" v-if='item.row.offlineStatus==2'>下线用户推荐</el-button>
              <el-button type="text" @click="offline(item.row, 2)" v-else-if="item.row.offlineStatus==3">上线用户推荐</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" :total="totals[2]" :current-page="pages[2]" :page-size="pageSize" @current-change="changePage">
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="确认通过" :visible.sync="confirmAuditDialogVisible">
      <el-form :model="confirmForm">
        <el-form-item label="公众号名称" label-width="110px">
          <el-input v-model="confirmForm.authorName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" label-width="110px">
          <el-input v-model="confirmForm.note" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="110px">
          <el-input v-model="confirmForm.mark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmAuditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="passAudit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="不通过" :visible.sync="confirmNoPassDialogVisible">
      <el-form :model="confirmForm">
        <el-form-item label="备注" label-width="80px">
          <el-input v-model="confirmForm.mark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmNoPassDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="nopassAudit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
const SHILED_STATUS = {
  'APPLY_USER_ACTION_BLOCK': 1,
  'APPLY_USER_ACTION_UNBLOCK': 2
}
const CODE_STATUS = {
  "SHORT_CODE_USING": 2, //2=使用中
  "SHORT_CODE_STOPPED": 3 //3=已禁用（即已下线此用户的推荐）
}
const APLLY_STATUS = {
  'APPLY_AUTHOR_WAITING': '待审核',
  'APPLY_AUTHOR_PASS': '通过',
  'APPLY_AUTHOR_REFUSED': '不通过'
}
export default {
  name: 'RecManage',
  data() {
    return {
      searchOptions: [{
          label: '被推荐公众号名称',
          value: 3
        },
        {
          label: '推荐人AID',
          value: 1
        }
      ],
      searchType: 3,
      searchKey: '',
      activeName: 'toaudit',
      dataList: [
        [],
        [],
        []
      ],
      pages: [1, 1, 1],
      totals: [0, 0, 0],
      pageSize: 5,
      confirmForm: {
        authorName: '',
        note: '',
        mark: ''
      },
      confirmAuditDialogVisible: false,
      confirmNoPassDialogVisible: false,
      loading: true
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.activeIndex = 0;
    this.getTotal(0).then(() => {
      this.totals[0] && this.getData(0);
    });
  },
  mounted() {},
  methods: {
    changeTab(tab) {
      var tabIndex = Number(tab.index);
      this.activeIndex = tabIndex;
      if (!this.totals[tabIndex]) {
        this.getTotal(tabIndex).then(() => {
          this.totals[tabIndex] && this.getData(tabIndex);
        });
      }
    },
    changePage(page) {
      var tabIndex = this.activeIndex;
      this.$set(this.pages, tabIndex, page);
      this.getData(tabIndex);
    },
    keydown(e) {
      if(e.keyCode == 13 || e.keyCode == 108) {
        this.search();
      }
    },
    //搜索
    search() {
      var tabIndex = this.activeIndex;
      this.confirmSearchKey = this.searchKey;
      this.getTotal(tabIndex).then(() => {
        this.$set(this.pages, tabIndex, 1);
        this.$set(this.dataList, tabIndex, []);
        this.getData(tabIndex);
      });
    },
    refresh(tabIndex) {
      this.$set(this.pages, tabIndex, 1);
      this.$set(this.totals, tabIndex, 0);
      this.$set(this.dataList, tabIndex, []);
      this.getTotal(tabIndex).then(() => {
        this.totals[tabIndex] && this.getData(tabIndex);
      });
    },
    getTotal(tabIndex) {
      this.loading = true;
      if(this.searchType == 1) {
        this.confirmSearchKey = this.searchKey || '0';
        if(!/^\d*$/.test(this.confirmSearchKey)) {
          this.$message.error('ID必须是数字');
          return;
        }
      }
      var applyAuthorStatus = '';
      switch (tabIndex) {
        case 0:
          applyAuthorStatus = 1;
          break;
        case 1:
          applyAuthorStatus = 2;
          break;
        case 2:
          applyAuthorStatus = 3;
          break;
      }
      return this.$http.post(api.CountApplyAuthorByStatus, {
        keyword: this.confirmSearchKey,
        applySearch: this.searchType, //1=推荐人的  2=被推荐人的
        applyAuthorStatus: applyAuthorStatus, //审核状态  1=待审核  2=通过  3=不通过
        // operUid: this.user.id,
        // beginTime: this.beginTime,
        // endTime: this.endTime
      }).then((res) => {
        if(res.data.head.status == 1) {
          this.$set(this.totals, tabIndex, res.data.total || 0);
          if(!this.totals[tabIndex]) {
            this.loading = false;
          }
        } else {
          this.loading = false;
          this.$message.error(res.data.head.msg);
        }
      }).catch((err)=>{
        this.loading = false;
        this.$message.error('服务器错误，获取列表总数失败');
      });
    },
    stateFormatter(row) {
      return APLLY_STATUS[row.applyStatus];
    },
    getData(tabIndex) {
      //认证号申请信息
      // message ApplyAuthorBo{
      // int64 id = 1; //记录id
      // string authorName = 2; //申请的认证号名称(要求平台唯一)
      // string wxno = 3; //联系人微信号
      // string phone = 4; //联系人手机号
      // int64 recommendUid = 5; //推荐人uid
      // int64 recommendAid = 6; //推荐人认证号aid
      // int64 applyUid = 7; //申请人uid
      // int32 applyTime = 8; //申请时间,单位：秒
      // ApplyAuthorStatusEnum applyStatus = 9; //审核状态 1=待审核 2=通过 3=不通过
      // string mark = 10; //审核描述
      // int32 auditTime = 11; //审核时间,单位：秒
      // int64 operUid = 12; //审核人id
      // int64 aid = 13; //关联的正式认证号aid
      // string wxMpName = 14; //微信公众号名称
      // string headimage = 15; //认证号头像地址
      // string note = 16; //认证号的简介
      // }

      var applyAuthorStatus = '';
      var pageNo = 1;
      switch (tabIndex) {
        case 0:
          applyAuthorStatus = 1;
          pageNo = this.pages[0];
          break;
        case 1:
          applyAuthorStatus = 2;
          pageNo = this.pages[1];
          break;
        case 2:
          applyAuthorStatus = 3;
          pageNo = this.pages[2];
          break;
      }
      this.$http.post(api.ListApplyAuthorByStatus, {
        keyword: this.confirmSearchKey,
        applySearch: this.searchType, //3=被推荐的认证号名称 1=推荐人认证号aid
        applyAuthorStatus: applyAuthorStatus, //审核状态  1=待审核  2=通过  3=不通过
        // operUid: this.user.id,
        // beginTime: this.beginTime,
        // endTime: this.endTime,
        offset: (pageNo - 1) * this.pageSize,
        count: this.pageSize
      }).then((res) => {
        this.searchKey = '';
        if (res.data && res.data.head.status == 1) {
          if (res.data.infos && res.data.infos.length) {
            Promise.all([this.batchGetUserApplyStatus(res.data.infos), this.batchGetShareCodeStatus(res.data.infos)]).then(() => {
              this.$set(this.dataList, tabIndex, res.data.infos || []);
            });
          }
        } else {
          this.$message.error(res.data.head.msg);
        }
        this.loading = false;
      }).catch(()=>{
        this.$message.error('服务器错误，获取列表数据失败');
        this.loading = false;
      })
    },
    //批量获取屏蔽状态
    batchGetUserApplyStatus(data) {
      var uids = [];
      data.map((item) => {
        uids.push(item.applyUid);
      });
      return this.$http.post(api.BatchGetUserApplyStatus, {
        uid: uids
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          for (var key in res.data.info) {
            for (var i = 0; i < data.length; i++) {
              if (data[i].applyUid == key) {
                data[i].shiledStatus = SHILED_STATUS[res.data.info[key]];
              }
            }
          }
        } else {
          this.$message.error('查询用户屏蔽状态失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('查询用户屏蔽状态失败');
      });
    },
    //批量获取上下线状态
    batchGetShareCodeStatus(data) {
      var recommendAid = [];
      data.map((item) => {
        recommendAid.push(item.recommendAid);
      });
      return this.$http.post(api.BatchGetShareCodeStatusByRecommendAids, {
        recommendAid: recommendAid
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          for (var key in res.data.info) {
            for (var i = 0; i < data.length; i++) {
              if (data[i].recommendAid == key) {
                data[i].offlineStatus = CODE_STATUS[res.data.info[key]];
              }
            }
          }
        } else {
          this.$message.error('查询用户上下线状态失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('查询用户上下线状态失败');
      });
    },
    //获取认证号
    getCode() {
      return this.$http.post(api.GenerateVerifyCode, {
        userName: this.user.name,
        uid: this.user.id
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          return res.data.value;
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取认证码失败');
      });
    },
    showConfirmAuditDialog(data) {
      this.confirmAuditDialogVisible = true;
      this.confirmForm.authorName = data.authorName;
      this.toConfirmData = data;
    },
    showConfirmNoPassDialog(data) {
      this.confirmNoPassDialogVisible = true;
      this.toConfirmData = data;
    },
    //通过
    passAudit() {
      this.confirmAuditDialogVisible = false;
      this.toConfirmData.authorName = this.confirmForm.authorName;
      this.toConfirmData.note = this.confirmForm.note;
      this.toConfirmData.mark = this.confirmForm.mark;
      this.confirmAudit(this.toConfirmData, 2);
    },
    //不通过
    nopassAudit() {
      this.confirmNoPassDialogVisible = false;
      this.toConfirmData.mark = this.confirmForm.mark;
      this.confirmAudit(this.toConfirmData, 3);
    },
    //修改认证号审核状态
    confirmAudit(data, applyAuthorStatus) {
      var tabIndex = this.activeIndex;
      this.getCode().then((code) => {
        if (!code) {
          return;
        }
        this.$http.post(api.AuditApplyAuthorById, {
          applyId: data.id,
          authorName: data.authorName,
          note: data.note || '',
          verifyCode: code,
          applyAuthorStatus: applyAuthorStatus, //审核状态  1=待审核  2=通过  3=不通过
          operUid: this.user.id,
          mark: data.mark || ''
        }).then((res) => {
          if (res.data && res.data.head.status == 1) {
            this.$message.success('操作成功');
            if (tabIndex == 0) {
              if (applyAuthorStatus == 2) { //通过
                this.refresh(1);
              } else { //不通过
                this.refresh(2);
              }
            } else if (tabIndex == 1) { //通过修改为不通过
              this.refresh(2);
            } else { //不通过修改为通过
              this.refresh(1);
            }
            this.refresh(tabIndex);
          } else {
            this.$message.error(res.data.head.msg);
          }
        }).catch((err) => {
          console.log(err);
          this.$message.error('服务器错误，操作失败');
        });
      });
    },
    //下线用户推荐
    offline(data, state) {
      this.$http.post(api.ChangeActivityCodeStateByRecommendAid, {
        state: state, // 状态： 2=使用中， 3=已禁用
        recommendAid: data.recommendAid,
        opuid: this.user.id
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('操作成功');
          for (var i = 0; i < this.dataList[this.activeIndex].length; i++) {
            if (this.dataList[this.activeIndex][i].recommendAid == data.recommendAid) {
              this.dataList[this.activeIndex][i].offlineStatus = state;
            }
          }
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
      });
    },
    //屏蔽用户
    shiled(data, action) {
      this.$http.post(api.ChangeApplyUserStatus, {
        applyUserAction: action, //用户的认证号申请状态    1=封锁  2=解封
        uid: data.applyUid,
        operUid: this.user.id
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('操作成功');
          data.shiledStatus = action;
          for (var i = 0; i < this.dataList[this.activeIndex].length; i++) {
            if (this.dataList[this.activeIndex][i].applyUid == data.applyUid) {
              this.dataList[this.activeIndex][i].shiledStatus = action;
            }
          }
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
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
