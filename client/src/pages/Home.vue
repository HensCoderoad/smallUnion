<template>
  <div class="home_wrapper">
    <div class="center_wrap">
      <div class="title">欢迎&nbsp;{{user.name}}&nbsp;登录音盟运营后台</div>
      <div class="version">版本号：v1.0</div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import api from '@/api';
export default {
  name: 'Home',
  data() {
    return {
      
    }
  },
  computed: {
    ...mapState('user', ['user'])
  }
}

</script>
<style lang="scss" scoped>
.home_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .center_wrap {
    padding: 100px 50px;
    background-color: #fff;
    box-shadow: 0 0 25px #cac6c6;
  }
  .title {
    font-size: 26px;
    color: #333;
  }
  .version {
    margin-top: 40px;
    font-size: 20px;
    color: #999;
  }
}

</style>
