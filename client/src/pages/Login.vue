<template>
  <div class="login_wrapper">
    <div class="title">音盟运营后台</div>
    <div class="row name">
      <span>&#xef9c;</span>
      <input v-model="name" placeholder="请输入内容">
    </div>
    <div class="row pwd">
      <span>&#xe898;</span>
      <input v-model="password" type="password" placeholder="请输入密码" @keydown="keydown">
    </div>
    <el-button class="login" type="primary" @click="login">登录</el-button>
  </div>
</template>
<script>
import md5 from 'js-md5';
import util from '@/util';
import status from '@/api/status';
import { mapState, mapMutations } from 'vuex';
import api from '@/api';
export default {
  name: 'Login',
  data() {
    return {
      name: '',
      password: ''
    }
  },
  created() {
    if (util.getUser()) {
      this.$router.push('/home');
    }
  },
  methods: {
    ...mapMutations('user', ['updateUser', 'updateLogin']),
    login() {
      if (!this.name || !this.password) {
        return;
      }
      this.$http.post(api.login, {
        name: this.name,
        password: md5(this.password)
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          util.storeUser(res.data.user);
          this.updateUser(res.data.user);
          util.setLoginStatus();
          this.$router.push('/home');
        } else if (res.data.status == status.PASSWORD_INVALID) {
          this.$message.error('账号或密码错误');
        } else if (res.data.status != status.SESSION_INVALID) {
          this.$message(`服务器错误:${res.data.status}`);
        }
      }).catch((err) => {
        this.$message.error('服务器错误');
        console.log(err);
      })
    },
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        this.login();
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.login_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(84, 92, 100);
  input:-webkit-autofill,
  textarea:-webkit-autofill,
  select:-webkit-autofill {
    -webkit-text-fill-color: #fff !important;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 400px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    input {
      flex-grow: 1;
      height: 100%;
      border-style: none;
      outline-style: none;
      background-color: transparent;
      color: #fff;
      font-size: 16px;
    }
  }
  .title {
    font-size: 30px;
    color: #fff;
    margin-top: -60px;
    margin-bottom: 60px;
  }
  .pwd {
    margin-top: 20px;
  }
  .name span,
  .pwd span {
    font-family: 'iconfont';
    font-size: 20px;
    padding: 0 20px;
    color: #ddd;
  }
  .login {
    border-style: none;
    border-radius: 4px;
    width: 400px;
    height: 50px;
    margin-top: 30px;
    font-size: 16px;
  }
}

</style>
