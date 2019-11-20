<template>
  <div class="edit_user_wrapper">
    <div class="center_wrap">
      <div class="row name">
        <span>&#xef9c;</span>
        <input v-model="name" placeholder="请输入用户名" autocomplete="off">
      </div>
      <div class="row name nick_name">
        <span>&#xef9c;</span>
        <input v-model="nickName" placeholder="请输入昵称" autocomplete="off">
      </div>
      <div class="row pwd">
        <span>&#xe898;</span>
        <input readonly onfocus="this.removeAttribute('readonly');" v-model="password" type="password" placeholder="请输入新密码" autocomplete="new-password">
      </div>
      <div class="row pwd">
        <span>&#xe898;</span>
        <input readonly onfocus="this.removeAttribute('readonly');" v-model="confrimPassword" type="password" placeholder="确认新密码" autocomplete="new-password">
      </div>
      <el-button class="btn" type="primary" @click="sumbit">修改</el-button>
    </div>
  </div>
</template>
<script>
import md5 from 'js-md5';
import util from '@/util';
import status from '@/api/status.js';
import api from '@/api';
import { mapState, mapActions, mapMutations } from 'vuex';
export default {
  name: 'EditUser',
  data() {
    return {
      name: '',
      password: '',
      confrimPassword: '',
      nickName: ''
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.name = this.user.name;
    this.nickName = this.user.nickName;
  },
  methods: {
    ...mapMutations('user', ['updateUser', 'updateLogin']),
    sumbit() {
      if (!this.password || !this.confrimPassword || !this.name) {
        this.$message('信息不完整');
        return;
      }
      if (this.password != this.confrimPassword) {
        this.$message('两次密码不一致');
        return;
      }
      this.$http.post(api.updateUserSelf, {
        id: this.user.id,
        name: this.name,
        nickName: this.nickName,
        password: md5(this.password)
      }).then((res) => {
        var code = res.data.status;
        switch (code) {
          case status.SUCCESS:
            this.$message.success('修改成功');
            this.user.name = this.name;
            this.user.nickName = this.nickName;
            this.user.password = this.password;
            this.updateUser(this.user);
            util.storeUser(this.user);
            break;
          case status.PASSWORD_INVALID:
            this.$message.error('旧密码错误');
            break;
          case status.USER_EXISTS:
            this.$message.error('用户名已存在');
            break;
          default:
            if (code != status.SESSION_INVALID) {
              this.$message.error(`服务器错误:${res.dat.status}`);
            }
        }
      }).catch((err) => {
        this.$message.error('修改失败，服务器错误');
      });
    }
  }
}

</script>
<style lang="scss" scoped>
.edit_user_wrapper {
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
  .nick_name {
    margin-top: 20px;
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
