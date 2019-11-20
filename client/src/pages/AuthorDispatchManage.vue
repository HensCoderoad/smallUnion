<template>
  <div class="statistics_wrapper">
    <div class="search_wrap">
      <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
      <el-input v-if="activeName=='dispatchTab'" v-model="searchKey" @keydown.native="keydown" placeholder="请输入认证号名称">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-input v-else v-model="searchKey" @keydown.native="keydown" placeholder="请输入任务名称">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button type="primary" @click="showAdd">新建导出任务</el-button>
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="发文数据" name="dispatchTab">
        <el-table :data="dataList" style="margin-top: 20px;">
          <el-table-column prop="authorStatInfo.aid" label="公众号ID">
          </el-table-column>
          <el-table-column prop="authorStatInfo.uid" label="用户ID" width="100">
          </el-table-column>
          <el-table-column prop="authorStatInfo.authorName" label="认证号名称" width="150">
          </el-table-column>
          <el-table-column prop="authorStatInfo.subscribeCount" label="订阅数量" width="80">
            <template slot-scope="props">{{props.row.authorStatInfo.subscribeCount || 0}}</template>
          </el-table-column>
          <el-table-column prop="authorStatInfo.newSubscribeCount" label="新增订阅数量" width="150">
            <template slot-scope="props">{{props.row.authorStatInfo.newSubscribeCount || 0}}</template>
          </el-table-column>
          <el-table-column prop="videoStatInfo.videoName" label="作品名称" width="300">
          </el-table-column>
          <el-table-column prop="videoStatInfo.publishtime" label="发布时间" width="150">
            <template slot-scope="props">{{props.row.videoStatInfo.publishtime && $util.formatFullTime(props.row.videoStatInfo.publishtime, 'yyyy-MM-dd hh:mm')}}</template>
          </el-table-column>
          <el-table-column prop="videoStatInfo.settleTime" label="发文结算时间" width="150">
            <template slot-scope="props">{{props.row.videoStatInfo.settleTime && $util.formatFullTime(props.row.videoStatInfo.settleTime*1000, 'yyyy-MM-dd hh:mm')}}</template>
          </el-table-column>
          <el-table-column prop="videoStatBo.playTotal" label="播放数">
            <template slot-scope="props">{{props.row.videoStatBo.playTotal || 0}}</template>
          </el-table-column>
          <el-table-column prop="videoStatBo.notRecommendDistinctPlayCount" label="公众号+转发播放数" width="150">
            <template slot-scope="props">{{props.row.videoStatBo.notRecommendDistinctPlayCount || 0}}</template>
          </el-table-column>
          <el-table-column prop="videoStatBo.notRecommendDistinctPlayCountThirtyHours" label="公众号发布视频30小时播放数定格（公众号来源+转发来源）" width="150">
            <template slot-scope="props">{{props.row.videoStatBo.notRecommendDistinctPlayCountThirtyHours || 0}}</template>
          </el-table-column>
          <el-table-column prop="sendCodeName" label="跟进人" width="100">
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="background-color: #fff">
          <el-pagination layout="total, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
          </el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="导出列表" name="exportTab">
        <el-table :data="exportList" style="margin-top: 20px;">
          <el-table-column label="创建时间" width="150">
            <template slot-scope="props">{{props.row.createTime && $util.formatFullTime(props.row.createTime*1000, 'yyyy-MM-dd hh:mm')}}</template>
          </el-table-column>
          <el-table-column prop="taskName" label="任务名称">
          </el-table-column>
          <el-table-column prop="taskDesc" label="任务描述">
          </el-table-column>
          <el-table-column prop="exportTaskStatus" label="任务状态">
            <template slot-scope="props">
              <span v-if="props.row.taskStatus=='TaskStatus_waiting'">待处理</span>
              <span v-if="props.row.taskStatus=='TaskStatus_failed'">处理失败，{{props.row.errorMsg}}</span>
              <span v-if="props.row.taskStatus=='TaskStatus_failedMaxNum'">处理失败达到最大次数，{{props.row.errorMsg}}</span>
              <span v-if="props.row.taskStatus=='TaskStatus_success'">处理成功</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="props">
              <el-button v-if="props.row.taskStatus=='TaskStatus_success'" size="mini" type="primary" @click="exportData(props.row)">导出数据</el-button>
              <el-button size="mini" type="primary" @click="showDelete(props.row)">删除任务</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="background-color: #fff">
          <el-pagination layout="total, prev, pager, next, jumper" :total="exportTotal" :current-page="exportPage" :page-size="exportPageSize" @current-change="changeExportPage">
          </el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 修改跟进人 -->
    <el-dialog title="修改跟进人" :visible.sync="editDialogVisible">
      <el-form v-loading="dialogLoading" :model="editForm">
        <el-form-item label="跟进人" label-width="100px">
          <el-select v-model="editForm.operUid" placeholder="请选择">
            <el-option v-for="item in userList" :key="item.id" :label="item.nickName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 创建导出任务 -->
    <el-dialog title="创建导出任务" :visible.sync="addDialogVisible">
      <el-form ref="addForm" v-loading="dialogLoading" :model="addForm" :rules="rules">
        <el-form-item label="任务名称" label-width="100px" prop="taskName">
          <el-input v-model="addForm.taskName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="任务描述" label-width="100px" prop="taskDesc">
          <el-input v-model="addForm.taskDesc" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="认证号名称" label-width="100px" prop="author_name">
          <el-input v-model="addForm.author_name" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="导出日期" label-width="100px" prop="dateRange">
          <el-date-picker v-model="addForm.dateRange" @change="addFormDateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
export default {
  name: 'PayHistory',
  data() {
    return {
      activeName: 'dispatchTab',
      loading: true,
      dataList: [],
      exportList: [],
      total: 0,
      page: 1,
      pageSize: 8,
      exportTotal: 0,
      exportPage: 1,
      exportPageSize: 10,
      dateRange: null,
      searchKey: '',
      userList: [],
      userIdNameMap: {},
      addForm: {
        author_name: '',
        taskName: '',
        taskDesc: '',
        dateRange: null
      },
      editForm: {
        operUid: undefined
      },
      dialogLoading: false,
      editDialogVisible: false,
      addDialogVisible: false,
      rules: {
        dateRange: [{ type: 'array', required: true, message: '请选择日期', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getTotal();
    this.getData();
    this.getExportTotal();
    this.getExportData();
    this.getUserList();
  },
  methods: {
    //选择日期范围
    dateChange(range) {
      if (range) {
        this.startTime = Math.floor((+range[0]) / 1000) || 0;
        this.endTime = Math.floor((+range[1]) / 1000) || 0;
        this.endTime += 24 * 60 * 60;
      } else {
        this.startTime = undefined;
        this.endTime = undefined;
      }
    },
    //导出任务选择日期范围
    addFormDateChange(range) {
      if (range) {
        this.addForm.startTime = Math.floor((+range[0]) / 1000) || 0;
        this.addForm.endTime = Math.floor((+range[1]) / 1000) || 0;
        this.addForm.endTime += 24 * 60 * 60;
      } else {
        this.addForm.startTime = undefined;
        this.addForm.endTime = undefined;
      }
    },
    //发文数据页码
    changePage(page) {
      this.page = page;
      this.getData();
    },
    //导出列表页码
    changeExportPage(page) {
      this.exportPage = page;
      this.getExportData();
    },
    changeTab() {},
    keydown(e) {
      if (e.keyCode == 108 || e.keyCode == 13) {
        this.search();
      }
    },
    //搜索
    search() {
      if (this.activeName == 'dispatchTab') {
        this.confirmDispatchSearchKey = this.searchKey;
        this.confirmDispatchStartTime = this.startTime;
        this.confrimDispatchEndTime = this.endTime;
        this.page = 1;
        this.total = 0;
        this.dataList = [];
        this.getTotal();
        this.getData();
      } else {
        this.confirmExportSearchKey = this.searchKey;
        this.confirmExportStartTime = this.startTime;
        this.confrimExportEndTime = this.endTime;
        this.exportPage = 1;
        this.exportTotal = 0;
        this.exportList = [];
        this.getExportTotal();
        this.getExportData();
      }
    },
    //显示编辑弹框
    showEdit(data) {
      this.editForm.operUid = data.sendCodeUid;
      this.editForm.aid = data.authorStatInfo.aid;
      this.editDialogVisible = true;
    },
    //删除导出任务询问框
    showDelete(data) {
      this.$confirm('是否确定删除任务？', '提示').then(() => {
        this.deleteExport(data.id);
      }).catch(() => {});
    },
    //显示添加导出任务弹框
    showAdd() {
      this.addForm.taskName = '';
      this.addForm.taskDesc = '';
      this.addForm.author_name = '';
      this.addForm.dateRange = null;
      this.addDialogVisible = true;
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
    //获取发文列表数
    getTotal() {
      this.$http.post(api.CountWorksForMoney, {
        author_name: this.confirmDispatchSearchKey,
        ctime_begin: this.confirmDispatchStartTime,
        ctime_end: this.confrimDispatchEndTime,
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.total = res.data.total;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取列表总数失败');
      });
    },
    //获取发文数据
    getData() {
      this.dataList = [];
      this.loading = true;
      this.$http.post(api.ListWorksForMoney, {
        author_name: this.confirmDispatchSearchKey,
        ctime_begin: this.confirmDispatchStartTime,
        ctime_end: this.confrimDispatchEndTime,
        page_no: this.page,
        page_size: this.pageSize
      }).then((res) => {
        this.loading = false;
        if (res.data && res.data.head.status == 1) {
          this.dataList = res.data.infoList || [];
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取列表失败');
      });
    },
    //获取导出任务总数
    getExportTotal() {
      this.$http.post(api.CountExportJob, {
        taskName: this.confirmExportSearchKey,
        beginTime: this.confirmExportStartTime,
        endTime: this.confrimExportEndTime,
        task: 1
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.exportTotal = res.data.total;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取导出列表总数失败');
      });
    },
    //获取导出任务列表
    getExportData() {
      this.$http.post(api.ListExportJob, {
        taskName: this.confirmExportSearchKey,
        beginTime: this.confirmExportStartTime,
        endTime: this.confrimExportEndTime,
        task: 1,
        offset: (this.exportPage - 1) * this.exportPageSize,
        size: this.exportPageSize
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.exportList = res.data.infos;
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取导出列表失败');
      });
    },
    changePage(page) {
      this.page = page;
      this.getData();
    },
    confirmEdit() {
      if (!this.editForm.operUid) {
        this.$message.error('请选择跟进人');
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.SetAuthorSendCodePerson, {
        operUid: this.user.id,
        aid: this.editForm.aid,
        sendCodeUid: this.editForm.operUid,
        sendCodeName: this.userIdNameMap[this.editForm.operUid]
      }).then((res) => {
        this.dialogLoading = false;
        this.editDialogVisible = false;
        if (res.data && res.data.head.status == 1) {
          this.$message.success('设置成功');
          this.getData();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.editDialogVisible = false;
        this.$message.error('服务器错误，设置失败');
      });
    },
    //验证添加表单
    validateForm() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.addExport();
        } else {
          return false;
        }
      });
    },
    //添加导出任务
    addExport() {
      this.dialogLoading = true;
      this.$http.post(api.CreateExportJob, {
        jobBo: {
          operUid: this.user.id,
          task: 1,
          taskName: this.addForm.taskName || '发文结算数据_' + new Date().getTime(),
          taskDesc: this.addForm.taskDesc || '商务统计-发文结算数据导出',
          taskParam: JSON.stringify({ ctimeBegin: this.addForm.startTime, ctimeEnd: this.addForm.endTime, authorName: this.addForm.author_name }),
        }
      }).then((res) => {
        this.dialogLoading = false;
        this.addDialogVisible = false;
        if (res.data && res.data.head.status == 1) {
          this.$message.success('添加成功');
          this.getExportTotal();
          this.getExportData();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.addDialogVisible = false;
        this.$message.error('服务器错误，添加失败');
      });
    },
    //删除导出任务
    deleteExport(taskId) {
      this.$http.post(api.BatchDeleteJob, {
        operUid: this.user.id,
        taskId: [taskId],
      }).then((res) => {
        if (res.data && res.data.head.status == 1) {
          this.$message.success('删除成功');
          this.getExportTotal();
          this.getExportData();
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，删除失败');
      });
    },
    //获取导出数据详情
    exportData(data) {
      this.loading = true;
      this.$http.post(api.GetExportJob, {
        taskId: data.id,
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data && res.data.head.status == 1) {
          if (res.data.jobBo) {
            this.download(res.data.jobBo);
          } else {
            this.$message('暂无数据');
          }
        } else {
          this.$message.error(res.data && res.data.head.msg);
        }
        this.loading = false;
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取导出数据失败');
        this.loading = false;
      });
    },
    //导出数据到excel
    download(data) {
      if (!data.taskResult) {
        this.$message('暂无数据');
        return;
      }
      var jsonData = JSON.parse(data.taskResult);
      if (jsonData.error) {
        this.$message(jsonData.error);
        return;
      }
      //列标题，逗号隔开，每一个逗号就是隔开一个单元格
      let cvs = `公众号ID,用户ID,认证号名称,订阅数量,新增订阅数量,作品名称,发布时间,发文结算时间,播放数,公众号+转发播放数,公众号发布视频30小时播放数定格（公众号来源+转发来源）,跟进人\n`;
      //增加\t为了不让表格显示科学计数法或者其他格式
      for (let i = 0; i < jsonData.infoList.length; i++) {
        var item = jsonData.infoList[i];
        //公众号ID
        cvs += `${(item.authorStatInfo && item.authorStatInfo.aid||'')},`;
        //用于ID
        cvs += `${(item.authorStatInfo && item.authorStatInfo.uid||'')},`;
        //认证号名称
        cvs += `${(item.authorStatInfo && this.csvHandlerStr(item.authorStatInfo.authorName)||'')},`;
        //订阅数
        cvs += `${(item.authorStatInfo && item.authorStatInfo.subscribeCount||0)},`;
        //新增订阅数
        cvs += `${(item.authorStatInfo && item.authorStatInfo.newSubscribeCount||0)},`;
        //作品名称
        cvs += `${(item.videoStatInfo && this.csvHandlerStr(item.videoStatInfo.videoName)||'')},`;
        //发布时间
        cvs += `${item.videoStatInfo && item.videoStatInfo.publishtime && this.$util.formatFullTime(item.videoStatInfo.publishtime,'yyyy-MM-dd hh:mm') || ''},`;
        //发文结算时间
        cvs += `${item.videoStatInfo && item.videoStatInfo.settleTime && this.$util.formatFullTime(item.videoStatInfo.settleTime*1000,'yyyy-MM-dd hh:mm') || ''},`;
        //播放数
        cvs += `${(item.videoStatBo && item.videoStatBo.playTotal||0)},`;
        //公众号+转发播放数
        cvs += `${(item.videoStatBo && item.videoStatBo.notRecommendDistinctPlayCount||0)},`;
        //公众号发布视频30小时播放数定格（公众号来源+转发来源）
        cvs += `${(item.videoStatBo && item.videoStatBo.notRecommendDistinctPlayCountThirtyHours||0)},`;
        //跟进人
        cvs += `${(item.sendCodeName && this.csvHandlerStr(item.sendCodeName)||'')},`;
        cvs += '\n';
      }
      let csvData = new Blob(["\ufeff" + cvs], { type: 'text / csv' });
      let uri = URL.createObjectURL(csvData);
      // let uri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURI(cvs);
      //通过创建a标签实现
      let link = document.createElement("a");
      link.href = uri;
      //对下载的文件命名
      link.download = `发文数据_${this.$util.formatFullTime(Date.now())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /**
     * 方法名称: csvHandlerStr
     * 方法描述: 处理包含逗号，或者双引号的字段
     * 返回类型: String
     */
    csvHandlerStr(str) {
      //csv格式如果有逗号，整体用双引号括起来；如果里面还有双引号就替换成两个双引号，这样导出来的格式就不会有问题了     
      var tempDescription = str;
      //如果有逗号
      if (str.indexOf(',') > -1) {
        //如果还有双引号，先将双引号转义，避免两边加了双引号后转义错误
        if (str.indexOf('"') > -1) {
          tempDescription = str.replace(/"/g, '\"\"');
        }
        //在将逗号转义
        tempDescription = '"' + tempDescription + '"';
      }
      return tempDescription;
    }
  }
}

</script>
<style lang="scss">
.statistics_wrapper {
  position: relative;
  padding: 30px 20px;
  min-width: 890px;

  .search_wrap {
    display: flex;
    align-items: center;

    .el-input {
      margin: 0 20px;
      width: 200px;
    }

    .el-input-group--append {
      width: 260px;
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

  .tab_wrap {
    margin-top: 20px;
    background: #fff;

    .el-tabs__nav-wrap {
      padding-left: 20px;
    }
  }
}

</style>
