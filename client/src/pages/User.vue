<template>
  <div class="role_wrapper">
    <div class="btn_w">
      <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
      <!-- <el-button style="margin-left: 20px" type="danger" @click="showTransfer">从旧版运营后台迁移用户</el-button> -->
    </div>
    <el-table v-loading="loading" :data="userList" style="width: 100%;">
      <el-table-column prop="name" label="用户名">
      </el-table-column>
      <el-table-column prop="nickName" label="昵称">
      </el-table-column>
      <el-table-column label="所属角色">
        <template slot-scope="data">
          <template v-for="item in data.row.role">
            <el-tag size="small">{{item.name}}</el-tag>&nbsp;          
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="item">
          <el-button type="text" @click="showEdit(item.row)">编辑</el-button>
          <el-button v-if="user.id!=item.row.id" type="text" @click="showDelete(item.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible">
      <el-form :model="addForm">
        <el-form-item label="用户名" label-width="80px">
          <el-input v-model="addForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称" label-width="80px">
          <el-input v-model="addForm.nickName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色" label-width="80px">
          <el-checkbox-group v-model="checkList" @change="selectRole">
            <el-checkbox v-for="item in roleLsit" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="密码" label-width="80px">
          <el-input v-model="addForm.password" type="password" autocomplete="new-password"></el-input>
        </el-form-item>
        <el-form-item label="确认" label-width="80px">
          <el-input v-model="addForm.confirmPassword" type="password" autocomplete="new-password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible">
      <el-form :model="editForm">
        <el-form-item label="用户名" label-width="80px">
          <el-input v-model="editForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称" label-width="80px">
          <el-input v-model="editForm.nickName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色" label-width="80px">
          <el-checkbox-group v-model="checkList" @change="selectRole">
            <el-checkbox v-for="item in roleLsit" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="修改密码" label-width="80px">
          <el-switch v-model="editForm.switch">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="editForm.switch" label="密码" label-width="80px">
          <el-input v-model="editForm.password" type="password" autocomplete="new-password"></el-input>
        </el-form-item>
        <el-form-item v-if="editForm.switch" label="确认" label-width="80px">
          <el-input v-model="editForm.confirmPassword" type="password" autocomplete="new-password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import md5 from 'js-md5';
import status from '@/api/status.js';
import api from '@/api';
import { mapState, mapActions, mapMutations } from 'vuex';
export default {
  name: 'User',
  data() {
    return {
      userList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        name: '',
        nickName: '',
        password: '',
        confirmPassword: ''
      },
      editForm: {
        name: '',
        nickName: '',
        password: '',
        confirmPassword: '',
        switch: false
      },
      roleLsit: [],
      roleListIdMap: {},
      roleUserMap: [],
      checkList: [],
      loading: true
    }
  },
  computed:{
    ...mapState('user', ['user'])
  },
  created() {
    this.getData();
  },
  methods: {
    resetForm() {
      this.addForm.name = '';
      this.addForm.nickName = '';
      this.addForm.password = '';
      this.addForm.confirmPassword = '';
      this.checkList = [];
    },
    //获取用户列表
    getData() {
      this.$http.get(api.getUserList).then((res) => {
        if (res.data.status == status.SUCCESS) {
          Promise.all([this.getRoleList(), this.getRoleUserMap()]).then(() => {
            res.data.list.map((item) => {
              item.role = this.findUserRoleNameListByUid(item.id);
            });
            this.userList = res.data.list.filter((item)=>{
              return item.id != 1;
            });
            this.loading = false;
          });
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取角色列表失败');
      });
    },
    //获取角色列表
    getRoleList() {
      return this.$http.get(api.getRoleList).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.roleLsit = res.data.list;
          res.data.list.map((item) => {
            this.roleListIdMap[item.id] = item;
          });
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取角色列表失败');
      });
    },
    //获取用户角色关联表
    getRoleUserMap() {
      return this.$http.get(api.getRoleUserMap).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.roleUserMap = res.data.list;
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取用户角色关联表失败');
      });
    },
    //分析出用户的角色名称列表
    findUserRoleNameListByUid(uid) {
      var result = [];
      this.roleUserMap.map((item) => {
        if (item.user_id == uid && this.roleListIdMap[item.role_id]) {
          result.push(this.roleListIdMap[item.role_id]);
        }
      });
      return result;
    },
    //添加用户
    addUser() {
      if (!this.addForm.name || !this.addForm.password) {
        this.$message.error('请填写用户名');
        return;
      }
      if (this.addForm.password != this.addForm.confirmPassword) {
        this.$message.error('两次密码不一致');
        return;
      }
      this.$http.post(api.addUser, {
        name: this.addForm.name,
        nickName: this.addForm.nickName,
        password: md5(this.addForm.password),
        roles: this.checkList.join(',')
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('添加成功');
          this.addDialogVisible = false;
          this.getData();
          this.resetForm();
        } else if(res.data.status == status.USER_EXISTS){
          this.$message.error('用户已存在');
        } else {
          this.$message.error('添加失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，添加失败');
      })
    },
    showEdit(data) {
      this.toEditForm = data;
      this.editForm.id = data.id;
      this.editForm.name = data.name;
      this.editForm.nickName = data.nickName;
      this.editForm.password = '';
      this.editForm.confirmPassword = '';
      this.editForm.switch =  false;
      this.checkList = data.role.map((item)=>{
        return item.id;
      });
      this.editDialogVisible = true;
    },
    showDelete(data) {
      this.$confirm("确定删除该用户么？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(() => {
        this.deleteUser(data.id);
      }).catch(()=>{});
    },
    showTransfer() {
      this.$confirm("该操作属于危险操作，确定迁移用户么？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(() => {
        this.transfer();
      }).catch(()=>{});
    },
    editUser() {
      if (!this.editForm.name) {
        this.$message.error('请填写用户名');
        return;
      }
      if(this.editForm.switch && !this.editForm.password) {
        this.$message.error('请输入密码');
        return;
      }
      if (this.editForm.switch && this.editForm.password != this.editForm.confirmPassword) {
        this.$message.error('两次密码不一致');
        return;
      }
      var option = {
        id: this.editForm.id,
        name: this.editForm.name,
        nickName: this.editForm.nickName,
        roles: this.checkList.join(',')
      }
      if(this.editForm.switch) {
        option.password = md5(this.editForm.password);
      }
      this.$http.post(api.updateUser, option).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('编辑成功');
          this.toEditForm.name = this.editForm.name;
          this.toEditForm.nickName = this.editForm.nickName;
          this.editDialogVisible = false;
          this.getData();
        } else {
          this.$message.error('编辑失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，编辑失败');
      })
    },
    deleteUser(id) {
      this.$http.post(api.deleteUser, {
        id: id
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('删除成功');
          this.getData();
        } else {
          this.$message.error('删除失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，删除失败');
      });
    },
    transfer() {
      this.$http.post(api.transferUser).then((res)=>{
        if (res.data.status == status.SUCCESS) {
          this.$message.success('迁移成功');
          this.getData();
        } else {
          this.$message.error('迁移失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，迁移失败');
      });
    },
    selectRole(roles) {
    }
  }
}

</script>
<style lang="scss">
.role_wrapper {
  padding: 30px;
  input:-webkit-autofill,
  textarea:-webkit-autofill,
  select:-webkit-autofill {
    -webkit-text-fill-color: #333 !important;
  }
  .btn_w {
    text-align: right;
    margin-bottom: 20px;
  }
  th,
  td {
    text-align: center !important;
  }
}

</style>
