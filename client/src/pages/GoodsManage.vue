<template>
  <div class="goods_wrapper">
    <div class="search_wrap">
      <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入商品名称">
        <el-button @click='search' slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>
    <el-table :data="dataList" style="margin-top: 20px;">
      <el-table-column prop="name" label="商品名称" width="150">
      </el-table-column>
      <el-table-column prop="note" label="商品描述" width="150">
      </el-table-column>
      <el-table-column label="封面" width="200">
        <template slot-scope="props">
          <img v-if="props.row.image_url" :src="props.row.image_url" style='max-width: 200px;max-height: 140px;'>
          <div v-else>暂无图片</div>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格">
        <template slot-scope="props">{{props.row.price || 0}}</template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="props">
          <span v-if='props.row.goods_status==-1'>已停用</span>
          <span v-if='props.row.goods_status==1'>正常</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150">
        <template slot-scope="props" v-if="props.row.create_time">{{$util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="150">
        <template slot-scope="props" v-if="props.row.update_time">{{$util.formatFullTime(props.row.update_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="100">
        <template slot-scope="props">
          <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="background-color: #fff">
      <el-pagination layout="total, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" @current-change="changePage">
      </el-pagination>
    </div>
    <!-- 编辑商品 -->
    <el-dialog title="编辑商品" :visible.sync="editDialogVisible">
      <el-form ref="editForm" v-loading="dialogLoading" :model="editForm" :rules="rules">
        <el-form-item label="商品名称" label-width="100px" prop="name">
          <el-input v-model="editForm.name" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" label-width="100px" prop="note">
          <el-input type="textarea" v-model="editForm.note" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="商品封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="imgUrl" :src="imgUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品价格" label-width="100px" prop="price">
          <el-input-number v-model="editForm.price" :min="0" :max="10000"></el-input-number>
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
  name: 'GoodsManage',
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
      editForm: {
        operUid: undefined,
        name: '',
        note: '',
        imageUrl: '',
        price: 0
      },
      dialogLoading: false,
      editDialogVisible: false,
      addDialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        note: [
          { required: true, message: '请输入商品描述', trigger: 'blur' }
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
        this.endTime += 24 * 60 * 60 * 1000;
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
    //显示编辑弹框
    showEdit(data) {
      this.editDialogVisible = true;
      this.editForm.id = data.id;
      this.editForm.name = data.name;
      this.editForm.note = data.note;
      this.editForm.price = data.price || 0;
      this.imgUrl = data.image_url;
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
      this.$http.get(api.getGoodsTotal, {
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
      this.$http.get(api.getGoodsList, {
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
    validateEditForm() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.editAward();
        } else {
          return false;
        }
      });
    },
    //编辑商品
    editAward() {
      this.dialogLoading = true;
      this.$http.post(api.UpdateGoods, {
        info: {
          id: this.editForm.id,
          name: this.editForm.name,
          note: this.editForm.note,
          price: this.editForm.price,
          imageUrl: this.imgUrl,
        },
        operUid: this.user.id
      }).then((res) => {
        this.dialogLoading = false;
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
        this.$message.error('服务器错误，编辑失败');
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
.goods_wrapper {
  position: relative;
  padding: 30px 20px;
  min-width: 890px;
  .search_wrap {
    display: flex;
    align-items: center;
    .el-input {
      margin-left: 20px;
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
