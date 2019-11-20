<template>
  <div class="activity_banner_wrapper">
    <div class="search_wrap">
      <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入banner名称">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button type="primary" @click="showAdd">添加</el-button>
    </div>
    <el-table :data="dataList" style="margin-top: 20px;">
      <el-table-column prop="banner_name" label="名称">
      </el-table-column>
      <el-table-column prop="banner_tips" label="描述">
      </el-table-column>
      <el-table-column label="封面" width="200">
        <template slot-scope="props">
          <img v-if="props.row.banner_image" :src="props.row.banner_image" style='max-width: 200px;max-height: 140px;'>
          <div v-else>暂无图片</div>
        </template>
      </el-table-column>
      <el-table-column prop="jump_url" label="跳转URL" width="300"> 
      </el-table-column>
      <el-table-column prop="weight" label="顺序">
      </el-table-column>
      <el-table-column label="是否可见">
        <template slot-scope="props">
          <span v-if="props.row.can_see==1">可见</span>
          <span v-if="props.row.can_see==2">不可见</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人">
        <template slot-scope="props">{{userIdNameMap[props.row.oper_uid]}}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="150">
        <template slot-scope="props" v-if="props.row.create_time">{{$util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="150">
        <template slot-scope="props" v-if="props.row.update_time">{{$util.formatFullTime(props.row.update_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template slot-scope="props">
          <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="showDelete(props.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="background-color: #fff">
      <el-pagination layout="total, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
    <!-- 添加banner -->
    <el-dialog title="添加banner" :visible.sync="addDialogVisible">
      <el-form ref="addForm" v-loading="dialogLoading" :model="addForm" :rules="rules">
        <el-form-item label="名称" label-width="100px" prop="bannerName">
          <el-input v-model="addForm.bannerName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="100px" prop="bannerTips">
          <el-input type="textarea" v-model="addForm.bannerTips" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="imgUrl" :src="imgUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="跳转URL" label-width="100px" prop="jumpUrl">
          <el-input v-model="addForm.jumpUrl" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="顺序" label-width="100px" prop="weight">
          <el-input-number v-model="addForm.weight" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="是否可见" label-width="100px" prop="bannerVisible">
          <el-switch v-model="addForm.bannerVisible" active-text="显示" inactive-text="隐藏">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑商品 -->
    <el-dialog title="编辑banner" :visible.sync="editDialogVisible">
      <el-form ref="editForm" v-loading="dialogLoading" :model="editForm" :rules="rules">
        <el-form-item label="名称" label-width="100px" prop="bannerName">
          <el-input v-model="editForm.bannerName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="100px" prop="bannerTips">
          <el-input type="textarea" v-model="editForm.bannerTips" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="imgUrl" :src="imgUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="跳转URL" label-width="100px" prop="jumpUrl">
          <el-input v-model="editForm.jumpUrl" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="顺序" label-width="100px" prop="weight">
          <el-input-number v-model="editForm.weight" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="是否可见" label-width="100px" prop="bannerVisible">
          <el-switch v-model="editForm.bannerVisible" active-text="显示" inactive-text="隐藏">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateEditForm">确 定</el-button>
      </div>
    </el-dialog>
    <div style="line-height: 0;height:0;">
      <input ref="file" type="file" style="visibility: hidden" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg" @change="uploadImage">
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import api from '@/api';
import STATUS from '@/api/status';

export default {
  name: 'ActivityBannerManage',
  data() {
    return {
      loading: true,
      dataList: [],
      total: 0,
      page: 1,
      pageSize: 8,
      searchKey: '',
      userList: [],
      userIdNameMap: {},
      addForm: {
        bannerName: '',
        bannerTips: '',
        jumpUrl: '',
        bannerImage: '',
        weight: 1,
        bannerVisible: true
      },
      editForm: {
        bannerName: '',
        bannerTips: '',
        jumpUrl: '',
        bannerImage: '',
        weight: 1,
        bannerVisible: true
      },
      dialogLoading: false,
      editDialogVisible: false,
      addDialogVisible: false,
      rules: {
        bannerName: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        bannerTips: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ]
      },
      imgUrl: '',
      dateRange: ''
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
      this.confirmStartTime = this.startTime;
      this.confrimEndTime = this.endTime;
      this.page = 1;
      this.total = 0;
      this.dataList = [];
      this.getTotal();
      this.getData();
    },
    showAdd() {
      this.addDialogVisible = true;
      this.addForm.bannerName = '';
      this.addForm.bannerTips = '';
      this.addForm.weight = 1;
      this.addForm.bannerVisible = true;
      this.addForm.jumpUrl = '';
      this.imgUrl = '';
    },
    //显示编辑弹框
    showEdit(data) {
      this.editDialogVisible = true;
      this.editForm.id = data.id;
      this.editForm.bannerName = data.banner_name;
      this.editForm.bannerTips = data.banner_tips;
      this.editForm.weight = data.weight || 1;
      this.editForm.bannerVisible = data.can_see == 1 ? true : false;
      this.editForm.jumpUrl = data.jump_url;
      this.imgUrl = data.banner_image;
    },
    showDelete(data) {
      this.$confirm('是否确定删除？', '提示').then(() => {
        this.deleteBanner([data.id]);
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
    //获取商品数量
    getTotal() {
      this.$http.get(api.getBannerTotal, {
        params: {
          name: this.confirmSearchKey,
          beginTime: this.confirmStartTime,
          endTime: this.confrimEndTime
        }
      }).then((res) => {
        if(res.data.status == STATUS.SUCCESS) {
          this.total = res.data.total;
        } else {
          this.$message.error('获取商品数量失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取列表总数失败');
      });
    },
    //获取商品列表
    getData() {
      this.dataList = [];
      this.loading = true;
      this.$http.get(api.getBannerList, {
        params: {
          name: this.confirmSearchKey,
          page: this.page,
          beginTime: this.confirmStartTime,
          endTime: this.confrimEndTime,
          pageSize: this.pageSize
        }
      }).then((res) => {
        this.loading = false;
        if(res.data.status == STATUS.SUCCESS) {
          this.dataList = res.data.list;
        } else {
          this.$message.error('获取商品列表失败');
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取列表失败');
      });
    },
    validateAddForm() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.addBanner();
        } else {
          return false;
        }
      });
    },
    validateEditForm() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.editBanner();
        } else {
          return false;
        }
      });
    },
    //添加
    addBanner() {
      this.dialogLoading = true;
      this.$http.post(api.AddActBanner, {
        info: {
          bannerName: this.addForm.bannerName,
          bannerTips: this.addForm.bannerTips,
          jumpUrl: this.addForm.jumpUrl,
          bannerImage: this.imgUrl,
          weight: this.addForm.weight,
          bannerVisible: this.addForm.bannerVisible ? 1: 2,
          operUid: this.user.id
        }
      }).then((res) => {
        this.dialogLoading = false;
        if(res.data.head.status == 1) {
          this.addDialogVisible = false;
          this.$message.success('添加成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.addDialogVisible = false;
        this.$message.error('服务器错误，添加失败');
      });
    },
    //编辑
    editBanner() {
      this.dialogLoading = true;
      this.$http.post(api.UpdateActBanner, {
        info: {
          id: this.editForm.id,
          bannerName: this.editForm.bannerName,
          bannerTips: this.editForm.bannerTips,
          jumpUrl: this.editForm.jumpUrl,
          bannerImage: this.imgUrl,
          weight: this.editForm.weight,
          bannerVisible: this.editForm.bannerVisible ? 1: 2,
          operUid: this.user.id
        }
      }).then((res) => {
        this.dialogLoading = false;
        this.editDialogVisible = false;
        if(res.data.head.status == 1) {
          this.editDialogVisible = false;
          this.$message.success('编辑成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.editDialogVisible = false;
        this.$message.error('服务器错误，编辑失败');
      });
    },
    //删除
    deleteBanner(ids) {
      this.$http.post(api.DeleteActBanner, {
        bannerId: ids,
        operUid: this.user.id
      }).then((res) => {
        if (res.data.head.status == 1) {
          this.$message.success('删除成功');
          this.refresh();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，删除失败');
      });
    },
    //上传图片到阿里云
    uploadImage(e) {
      this.$util.upload(e.target.files[0]).then((url) => {
        this.imgUrl = url;
      });
    },
    triggerInput() {
      this.$refs.file.click();
    }
  }
}

</script>
<style lang="scss">
.activity_banner_wrapper {
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
