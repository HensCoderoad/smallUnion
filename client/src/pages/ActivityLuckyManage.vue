<template>
  <div class="activity_lucky_manage_wrapper">
    <div class="search_wrap">
      <el-select v-model="workSearchType" placeholder="请选择" slot="prepend">
        <el-option v-for="item in workSearchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="搜索内容">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <!-- <el-button @click="showAdd" type="primary">添加名单</el-button> -->
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="中奖名单" name="default">
        <el-table :data="dataList" style="margin-top: 20px;">
          <el-table-column prop="lucky_uid" label="用户UID" width="150">
          </el-table-column>
          <el-table-column prop="act_id" label="活动ACID" width="200">
          </el-table-column>
          <el-table-column prop="act_title" label="活动标题" width="200">
          </el-table-column>
          <el-table-column prop="goods_name_alias" label="活动奖品" width="200">
          </el-table-column>
          <el-table-column prop="contact" label="联系方式" width="200">
          </el-table-column>
          <el-table-column label="兑换操作人" width="150">
            <template slot-scope="props">{{userIdNameMap[props.row.present_uid]}}</template>
          </el-table-column>
          <el-table-column label="抽奖操作人" width="150">
            <template slot-scope="props">{{userIdNameMap[props.row.create_uid]}}</template>
          </el-table-column>
          <el-table-column label="兑换状态" width="100">
            <template slot-scope="props">{{presentStateIdMap[props.row.present_state]}}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="150">
            <template slot-scope="props">{{props.row.create_time && $util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="showDelete(props.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div style="background-color: #fff">
      <el-pagination layout="total, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
    <!-- 修改兑换状态 -->
    <el-dialog title="修改兑换状态" :visible.sync="editDialogVisible">
      <el-form :model="editForm" ref="editForm" v-loading="dialogLoading" :rules="rules">
        <el-form-item label="兑换状态" label-width="100px" prop="actPresentState">
          <el-select v-model="editForm.actPresentState" placeholder="请选择" clearable>
            <el-option v-for="item in presentStateList" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateEditForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 新增中奖记录 -->
    <el-dialog title="新增中奖记录" :visible.sync="addDialogVisible">
      <el-form :model="addForm" ref="addForm" v-loading="dialogLoading" :rules="addRules">
        <el-form-item label="活动ID" label-width="100px" prop="actId">
          <el-input v-model="addForm.actId"></el-input>
        </el-form-item>
        <el-form-item label="奖项ID" label-width="100px" prop="ruleId">
          <el-input v-model="addForm.ruleId"></el-input>
        </el-form-item>
        <el-form-item label="用户ID" label-width="100px" prop="uid">
          <el-input v-model="addForm.uid"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateAddForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
import STATUS from '@/api/status';

// CREATE TABLE `tb_act_lucky` (
//   `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
//   `act_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '活动id',
//   `lucky_uid` bigint(20) NOT NULL DEFAULT '0' COMMENT '中奖人uid',
//   `award_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '奖品id',
//   `contact` varchar(50) NOT NULL DEFAULT '' COMMENT '中奖人联系方式',
//   `present_uid` bigint(20) NOT NULL DEFAULT '0' COMMENT '兑现操作人（运营人员）id',
//   `present_time` int(11) NOT NULL DEFAULT '0' COMMENT '兑奖时间，单位：秒',
//   `present_state` int(11) NOT NULL DEFAULT '1' COMMENT '兑奖状态，1=联系中、2=已联系、3=已完成领奖、4=已过期、5=已放弃、6=已取消',
//   `creator_uid` bigint(20) NOT NULL DEFAULT '0' COMMENT '建档人用户id',
//   `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间，单位：秒',
//   `notice_time` int(11) NOT NULL DEFAULT '0' COMMENT '中奖通知时间，单位：秒',
//   PRIMARY KEY (`id`),
//   KEY `idx_actid` (`act_id`) USING BTREE,
//   KEY `idx_lucky_uid` (`lucky_uid`) USING BTREE,
//   KEY `idx_ctime` (`create_time`) USING BTREE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动中奖名单表';


export default {
  name: 'ActivityLuckyManage',
  data() {
    return {
      workSearchOptions: [{
          label: '活动ACID',
          value: 1
        },
        {
          label: '中奖用户ID',
          value: 2
        }
      ],
      workSearchType: 1,
      activeName: 'default',
      loading: true,
      dataList: [],
      total: 0,
      page: 1,
      pageSize: 8,
      searchKey: '',
      userList: [],
      userIdNameMap: {},
      editForm: {
        actPresentState: ''
      },
      dialogLoading: false,
      editDialogVisible: false,
      addDialogVisible: false,
      rules: {
        actPresentState: [
          { required: true, message: '请选择兑换状态', trigger: 'blur' }
        ]
      },
      imgUrl: '',
      // 1=未领奖、2=已领奖、3=已过期    
      presentStateIdMap: {
        '-2': '已删除',
        1: '未领奖',
        2: '已领奖',
        3: '已过期',
      },
      presentStateList: [{
          name: '未领奖',
          value: 1
        },
        {
          name: '已领奖',
          value: 2
        },
        {
          name: '已过期',
          value: 3
        }
      ],
      addForm: {
        actId: '',
        ruleId: '',
        uid: ''
      },
      addRules: {
        actId: [
          { required: true, message: '请输入活动ID', trigger: 'blur' }
        ],
        ruleId: [
          { required: true, message: '请输入活动奖品ID', trigger: 'blur' }
        ],
        uid: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ]
      },
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getTotal();
    this.getData();
    this.getUserList();
  },
  methods: {
    changeTab() {
      this.refresh();
    },
    //页码
    changePage(page) {
      this.page = page;
      this.getData();
    },
    //回车搜索
    keydown(e) {
      if (e.keyCode == 108 || e.keyCode == 13) {
        this.search();
      }
    },
    refresh() {
      this.page = 1;
      this.total = 0;
      this.dataList = [];
      this.getTotal();
      this.getData();
    },
    //搜索
    search() {
      this.confirmSearchKey = this.searchKey;
      this.page = 1;
      this.total = 0;
      this.dataList = [];
      this.getTotal();
      this.getData();
    },
    showAdd() {
      this.addForm.actId = '';
      this.addForm.ruleId = '';
      this.addForm.uid = '';
      this.addDialogVisible = true;
    },
    //显示编辑弹框
    showEdit(data) {
      this.editDialogVisible = true;
      this.editForm.actPresentState = Number(data.present_state);
      this.editForm.actId = data.act_id;
      this.editForm.awardId = data.award_id;
    },
    showDelete(data) {
      this.toDeleteData = data;
      this.$confirm('是否确定删除？', '提示').then(() => {
        this.deleteLucky();
      }).catch(() => {});
    },
    //获取运营后台用户列表
    getUserList() {
      this.$http.get(api.getUserList).then((res) => {
        this.userList = res.data.list;
        res.data.list.map((item) => {
          this.userIdNameMap[item.id] = item.nickName;
        });
      });
    },
    //获取名单数量
    getTotal() {
      var option = {};
      if (this.workSearchType == 1) {
        option.actId = this.confirmSearchKey;
      } else {
        option.uid = this.confirmSearchKey;
      }
      this.$http.get(api.getLuckyTotal, {
        params: option
      }).then((res) => {
        if (res.data.status == STATUS.SUCCESS) {
          this.total = res.data.total;
        } else {
          this.$message.error('获取列表总数失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取列表总数失败');
      });
    },
    //获取名单列表
    getData() {
      var option = {
        page: this.page,
        pageSize: this.pageSize
      };
      if (this.workSearchType == 1) {
        option.actId = this.confirmSearchKey;
      } else {
        option.uid = this.confirmSearchKey;
      }
      this.dataList = [];
      this.loading = true;
      this.$http.get(api.getLuckyList, {
        params: option
      }).then((res) => {
        this.loading = false;
        if (res.data.status == STATUS.SUCCESS) {
          this.dataList = res.data.list;
        } else {
          this.$message.error('获取列表失败');
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取列表失败');
      });
    },
    validateEditForm() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.changeState();
        } else {
          return false;
        }
      });
    },
    validateAddForm() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.addLucky();
        } else {
          return false;
        }
      });
    },
    //修改兑换状态
    changeState() {
      this.dialogLoading = true;
      this.$http.post(api.UpdateActLuckyStatus, {
        operUid: this.user.id,
        actId: this.editForm.actId,
        awardId: this.editForm.awardId,
        actPresentState: this.editForm.actPresentState
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.editDialogVisible = false;
          this.$message.success('操作成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //添加中奖记录
    addLucky() {
      this.dialogLoading = true;
      this.$http.post(api.AddActLucky, {
        operUid: this.user.id,
        actId: this.addForm.actId,
        ruleId: this.addForm.ruleId,
        uid: this.addForm.uid
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.addDialogVisible = false;
          this.$message.success('操作成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    deleteLucky() {
      this.$http.post(api.UpdateActLuckyStatus, {
        operUid: this.user.id,
        actId: this.toDeleteData.act_id,
        awardId: this.toDeleteData.award_id,
        actPresentState: -2
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          this.refresh();
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
.activity_lucky_manage_wrapper {
  position: relative;
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

  .back {
    position: absolute;
    top: 30px;
    right: 20px;
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
