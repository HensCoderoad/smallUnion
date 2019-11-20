<template>
<div>
  <el-form :inline="true" style="padding:30px 20px;">
    <el-form-item label="作品名" style="margin-right: 15px;">
      <el-select
        clearable
        remote
        reserve-keyword
        placeholder="请输入关键词"
        :remote-method="remoteMethod"
        :value="selectedValue"
        filterable
        @change="changeSearch"
      >
        <el-option
          v-for="option in options"
          :key="option.vid"
          :label="option.title"
          :value="option.vid"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="评论时间" style="margin-right: 15px;">
      <el-date-picker
        type="datetimerange"
        range-separator="至"
        value-format="yyyy-MM-dd HH:mm:ss"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        v-model="createTime"
        @change="changeDate"
      ></el-date-picker>
    </el-form-item>
    <el-form-item style="margin-right:15px;">
      <el-button
        type="primary"
        icon="el-icon-search"
        @click="queryReviewList"
      >查询</el-button>
    </el-form-item>
    <el-form-item style="margin-right:15px;" v-if="this.commentStatus != 2 && this.commentStatus != 1">
      <el-button
        type="success"
        :disabled="!pass"
        @click="passReview"
      >批量通过</el-button>
    </el-form-item>
    <el-form-item v-if="this.commentStatus != 2">
      <el-dropdown @command="deleteReview">
        <el-button
          type="danger"
          :disabled="!del"
        >
          批量删除
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item 
            v-for="value in COMMENT"
            :key="value"
            :command="value"
          >
          {{value}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-form-item>
    <el-form-item v-if="this.commentStatus == 2">
      <el-button
        type="warning"
        :disabled="!recover"
        @click="recoverReview"
      >
        批量恢复
      </el-button>
    </el-form-item>
  </el-form>
  <div style="padding:0 20px;background-color:#fff;">
    <el-tabs v-model="tabindex" @tab-click="tabClick">
      <el-tab-pane 
        v-for="tab in tabs.data" 
        :key="tab.value"
        :label="tab.text+'('+(totals[tab.value] ? totals[tab.value] : 0)+')'"
      ></el-tab-pane>
    </el-tabs>
    <el-table
      height="600"
      style="width:100%"
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      :data="table"
      v-loading="loading"
    >
      <el-table-column v-if="muticheck" type="selection" width="55"></el-table-column>
      <template v-for="column in columns">
        <template v-if="column.show">
          <el-table-column 
            :key="column.field" 
            :label="column.name" 
            :prop="column.field"
          >
          </el-table-column>
        </template>
      </template>
    </el-table>
    <div style="padding:20px 0;">
      <el-pagination
        v-if="totals[commentStatus] > 10"
        :page-size="pageSize"
        :page="page"
        :total="totals[commentStatus]"
        layout="total , prev , pager , next , jumper"
        @current-change="pageChange"
        :current-page.sync="currentPage"
      ></el-pagination>
    </div>
  </div>
</div>
  
</template>
<script>
import api from '@/api';
import store from "@/store";
import { mapState, mapActions } from 'vuex';
export default {
  data () {
    return {
      selectedValue : '',   // 选择器中选中的列表项
      options : [],  // 选择器中的可选择项列表数据
      tabindex : 0,  // 选中的tab
      table : [],    // 表格中的评论列表数据
      page : 1,   // 页数
      pageSize : 10,  // 每一页的条数
      currentPage : 1, // 当前页
      totals : {},    // 评论列表分类，每一类的评论列表总数
      createTime : '',  // 筛选时间
      commentStatus : 0,
      loading : false,
      muticheck : 1,
      columns : [
        {field : 'id',name : 'ID' , show : true},
        {field : 'comment_content' , name : '评论内容' , show : true},
        {field : 'uid' , name : "评论人ID" , show : true},
        {field : 'create_time' , name : '评论时间' , show : true},
        {field : 'vid' , name : '作品id' , show : false},
        {field : 'vname' , name : '作品名' , show : true},
        {field : 'pid' , name : '一级评论ID' , show : true},
        {field : 'ref_id' , name : '引用ID' , show : true}
      ],
      tabs : {
        field : 'comment_status',
        data : [
          {value : '0' , text : '待审核'},
          {value : '1' , text : '已通过'},
          {value : '2' , text : '已删除'}
        ]
      },
      pass : false,
      del : false,
      recover : false,
      selectRow : [],
      loading : true,
      logId : 0,
      vids : []
    }
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapState('global', ['categoryList', 'CSPECIAL', 'UNRECOMMEND', 'CANCEL','COMMENT'])
  },
  methods : {
    remoteMethod (query) {
      this.$http.post(api.getVideoByName , {
        name : query
      })
      .then(data => {
        this.options = data.data.list;
      })
    },
    getReviewTotal () {
      this.$http.post(api.getCommentTotal , {
        vid : this.selectedValue,
        createtime : this.createTime
      })
      .then(data => {
        let res = {};
        data.data.list.forEach(total => {
          res[total['comment_status']] = total.count;
        });
        this.totals = res;
      })
      .catch(err => {
        console.log(err);
      })
    },
    getOneReviewList () {
      this.loading = true;
      this.vids = [];
      this.$http.post(api.getCommentPage , {
        vid : this.selectedValue,
        createtime : this.createTime,
        page : this.page,
        pageSize : this.pageSize,
        commentStatus : this.commentStatus
      })
      .then(data => {
        this.loading = false;
        let list = data.data.list;
        if (list.length > 0) {
          list.forEach(item => {
            item.create_time = this.getDateTime(item.create_time);
            item.comment_content = JSON.parse(item.comment_content).txt;
            this.vids.push(item.vid);
          });
          this.$http.post(api.BatchGetVideoStat , {
            vid : this.vids
          }).then(data => {
            let videoList = data.data.info;
            videoList.forEach((video , index) => {
              list[index].vname = video.videoName;
            });
            this.table = list;
          })
        } else {
          this.table = list;
        }
      })
    },
    // 选中选择框中的某一项时触发
    changeSearch (value) {
      this.selectedValue = value;
    },
    // 日期选择器选中的值
    changeDate (value) {
      this.createTime = value;
    },
    pageChange (page) {
      this.page = page;
      this.getOneReviewList();
    },
    tabClick (e) {
      this.commentStatus = e.index;
      this.page = 1;
      this.currentPage = 1;
      this.getReviewTotal();
      this.getOneReviewList();
    },
    queryReviewList () {
      this.getReviewTotal();
      this.getOneReviewList();
    },
    handleSelectionChange (selection) {
      if (Array.isArray(selection)) {
        this.selectRow = selection;
      } else {
        if (selection) {
          this.selectRow = selection;
        } else {
          this.selectRow = [];
        }
      };
      if (selection.length > 0) {
        if (this.commentStatus == 0) {
          this.pass = true;
          this.del = true;
        } else if (this.commentStatus == 1) {
          this.del = true;
          this.pass = false;
        } else if (this.commentStatus == 2) {
          this.del = false;
          this.pass = true;
          this.recover = true;
        }
      } else {
        this.pass = false;
        this.del = false;
        this.recover = false;
      }
    },
    passReview () {
      this.page = 1;
      this.currentPage = 1;
      let commentIds = [];
      this.$confirm(`是否批量通过?`).then(() => {
        this.loading = true;
        this.selectRow.forEach(row => {
          commentIds.push(row.id);
        });
        let param = {
          commentIds
        }
        this.insertLog('批量通过' , JSON.stringify(param))
        .then(data => {
          this.$http.post(api.CommentPass , {
            commentIds
          })
          .then(data => {
            if (data.data.status == 1) {
              if (this.logId) {
                this.changeLog();
              }
              this.getReviewTotal();
              this.getOneReviewList();
            } else {
              this.$message.error(`data.data.status_info`);
            }
          })
        })
        .catch(err => {
          this.$message.error(`${err.errMsg}`);
        })
      });
    },
    deleteReview (value) {
      this.page = 1;
      this.currentPage = 1;
      let auditReason = value;
      let commentIds = [];
      this.$confirm('是否批量删除?').then(() => {
        this.loading = true;
        this.selectRow.forEach(row => {
          commentIds.push(row.id);
        });
        let param = {
          commentIds,
          auditReason
        }
        this.insertLog('批量删除' , JSON.stringify(param))
        .then(data => {
          this.$http.post(api.CommentDel , {
            commentIds,
            auditReason
          })
          .then(data => {
            if (data.data.status == 1) {
              if (this.logId) {
                this.changeLog();
                this.getReviewTotal();
                this.getOneReviewList();
              }
            } else {
              this.$message.error(`data.data.status_info`);
            }
          })
        })
        .catch(err => {
          this.$message.error(`${err.errMsg}`);
        })
      })
      .catch(err => {
        console.log(err);
      })
    },
    recoverReview () {
      this.page = 1;
      this.currentPage = 1;
      let commentIds = [];
      this.$confirm('是否批量恢复?').then(() => {
        this.loading = true;
        this.selectRow.forEach(row => {
          commentIds.push(row.id);
        });
        let param = {
          commentIds
        };
        this.insertLog('批量恢复' , JSON.stringify(param))
        .then(data => {
          this.$http.post(api.CommentRecover , {
            commentIds
          })
          .then(data => {
            if (data.data.status == 1) {
              this.changeLog();
              this.getReviewTotal();
              this.getOneReviewList();
            } else {
              this.$message.error(`data.data.status_info`);
            }
          })
        })
        .catch(err => {
          this.$message.error(`${err.errMsg}`);
        })
      })
      .catch(err => {
        console.log(err);
      })
    },
    insertLog (action_name , param) {
      let menu_id = this.$route.path;
      return new Promise((resolve , reject) => {
        this.logId = 0;
        this.$http.post(api.addLog , {
          user_id : store.state.user.user.id,
          menu_id,
          param,
          action_name
        })
        .then(data => {
          if (data.data.status == 1) {
            this.logId = data.data.list.insertId;
            resolve(data);
          } else {
            reject("日志插入失败,无法操作数据");
          }
        })
        .catch(err => {
          reject("日志插入失败,无法操作数据");
        });
      });
    },
    changeLog () {
      let logId = this.logId;
      this.$http.post(api.updateLog, {
        id: logId,
        status: 1
      });
    },
    getDateTime(nS) {
      if(/^[0-9]*$/.test(nS)){
        new Date(parseInt(nS) * 1000)
        .toLocaleString()
        .replace(/:\d{1,2}$/, " ");
      }else{
        return UtcToDate(nS)
      }
      function UtcToDate(UTCDateString) {
        if (!UTCDateString) {
          return "-";
        }
        function formatFunc(str) {
          //格式化显示
          return str > 9 ? str : "0" + str;
        }
        var date2 = new Date(UTCDateString); //这步是关键
        var year = date2.getFullYear();
        var mon = formatFunc(date2.getMonth() + 1);
        var day = formatFunc(date2.getDate());
        var hour = date2.getHours();
        var noon = hour >= 12 ? "下午" : "上午";
        hour = hour >= 12 ? hour - 12 : hour;
        hour = formatFunc(hour);
        var min = formatFunc(date2.getMinutes());
        var dateStr =
          year + "-" + mon + "-" + day + " " + noon + " " + hour + ":" + min;
        return dateStr;
      }
    }
  },
  created () {
    this.getReviewTotal();
    this.getOneReviewList();
  }
}
</script>
<style lang="scss">

</style>


