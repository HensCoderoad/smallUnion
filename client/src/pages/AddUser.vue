<template>
  <div class="add_user_wrapper">
    <div class="center_wrap">
      <div class="row name">
        <span>&#xef9c;</span>
        <input v-model="name" placeholder="请输入名称">
      </div>
      <div class="row pwd">
        <span>&#xe898;</span>
        <input v-model="password" type="password" placeholder="请输入密码">
      </div>
      <div class="row pwd">
        <span>&#xe898;</span>
        <input v-model="confrimPassword" type="password" placeholder="确认密码">
      </div>
      <el-button class="btn" type="primary" @click="sumbit">添加</el-button>
    </div>
  </div>
</template>
<script>
import md5 from 'js-md5';
import util from '@/util';
import status from '@/api/status.js';
import api from '@/api';
import { mapState, mapMutations } from 'vuex';
export default {
  name: 'AddUser',
  data() {
    return {
      name: '',
      password: '',
      confrimPassword: ''
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    if(this.user.id!=1) {
      this.$router.go(-1);
    }
  },
  methods: {
    sumbit() {
      if (!this.name || !this.password || !this.confrimPassword) {
        this.$message('信息不完整');
        return;
      }
      if (this.password != this.confrimPassword) {
        this.$message('两次密码不一致');
        return;
      }
      this.$http.post(api.addUser, {
        name: this.name,
        password: md5(this.password)
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('添加成功');
          this.name = '';
          this.password = '';
          this.confrimPassword = '';
        } else if (res.data.status != status.SESSION_INVALID) {
          this.$message(`服务器错误:${res.dat.status}`);
        }
      }).catch((err) => {
        this.$message.error('添加失败，服务器错误');
      });
    }
  }
}

</script>
<style lang="scss" scoped>
.add_user_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  input:-webkit-autofill,
  textarea:-webkit-autofill,
  select:-webkit-autofill {
    -webkit-text-fill-color: #333 !important;
  }
  .center_wrap {
    padding: 40px;
    background-color: #fff;
    box-shadow: 0 0 25px #cac6c6;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 400px;
    height: 50px;
    border: 1px solid #ddd;
    border-radius: 4px;
    input {
      flex-grow: 1;
      height: 100%;
      border-style: none;
      outline-style: none;
      background-color: transparent;
      color: #333;
      font-size: 16px;
    }
  }
  .pwd {
    margin-top: 20px;
  }
  .name span,
  .pwd span {
    font-family: 'iconfont';
    font-size: 20px;
    padding: 0 20px;
    color: #666;
  }
  .btn {
    border-style: none;
    border-radius: 4px;
    width: 400px;
    height: 50px;
    margin-top: 30px;
    font-size: 16px;
  }
}

</style>
