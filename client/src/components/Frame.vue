<template>
  <div class="frame">
    <!-- 左边菜单栏 -->
    <div class="left_menu">
      <el-menu ref="menu" :default-active="$route.path" unique-opened background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" :default-openeds="openeds" :router="true" :collapse="collapse" @select="selectMenu">
        <NavMenu :navMenus="navList"></NavMenu>
      </el-menu>
    </div>
    <!-- 面包屑导航 -->
    <div class="right_container">
      <div class="bread_crumb">
        <span class="menu_icon" v-if="!collapse" @click="collapse=!collapse">&#xe601;</span>
        <span class="menu_icon" v-else @click="collapse=!collapse">&#xe600;</span>
        <div class="bread_header">
          <div class="bread_item_w">
            <div class="bread_item" v-for="item in breads">&nbsp;&nbsp;{{item}}&nbsp;&nbsp;&#xe60e;</div>
          </div>
          <el-dropdown class="user_name_w">
            <span class="user_name">{{user && user.name}}&nbsp;<i class="el-icon-arrow-down el-icon--right"></i></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><div @click="editUser">修改资料</div></el-dropdown-item>
              <el-dropdown-item><div @click="_logout">退出</div></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!-- 路由区域 -->
      <div class="main">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import status from '@/api/status';
import util from '@/util';
import api from '@/api';
import NavMenu from '@/components/NavMenu';
export default {
  components: {
    NavMenu
  },
  name: 'Frame',
  data() {
    return {
      collapse: false,
      breads: [],
      activeIndex: '',
      openeds: [],
      menuList: [],
      navList: [],
      navPathNameMap: null
    }
  },
  computed: {
    ...mapState('user', ['user','userMenuList'])
  },
  mounted() {
    this.getData().then(() => {
      this.navPathNameMap = {};
      this.navList = this.createMenuTree(this.menuList);
      this.$nextTick(() => {
        if(this.$route.name == 'EditUser') {
          this.breads = ['修改资料'];
          return;
        } else if(this.$route.name == 'Home') {
          this.breads = ['首页'];
          return;
        }
        var menu = this.$refs.menu;
        for (var key in menu.items) {
          if (menu.items[key].active) {
            this.selectMenu(menu.items[key].index, menu.items[key].indexPath);
            break;
          }
        }
      });
    });
  },
  methods: {
    ...mapActions('user', ['logout']),
    selectMenu(index, path) {
      this.breads = [];
      path.map((item) => {
        this.breads.push(this.navPathNameMap[item]);
      });
    },
    _logout() {
      console.log('logout')
      this.logout().then((res) => {
        if (res.data.status == status.SUCCESS) {
          util.clearUser();
          this.$router.replace('/');
        }
      }).catch((err) => {
        this.$message.error('服务器错误');
        console.log(err);
      })
    },
    editUser() {
      this.$router.push('/edit_user');
      this.breads = ['修改资料'];
    },
    //获取菜单列表
    getData() {
      return this.$http.get(api.getMenuList).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.menuList = res.data.list;
        } else {
          this.$message.error('获取菜单列表失败');
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取菜单列表失败');
      });
    },
    //生成菜单树
    createMenuTree(list) {
      var self = this;
      list = list.concat([]);
      return _findChildrenById(list, 0);

      function _findChildrenById(list, id) {
        var child = [];
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.parent_id == id) {
            list.splice(i, 1);
            i--;
            if(_ifExistMenu(item.id)) {
              item.children = _findChildrenById(list.concat([]), item.id);
              child.push(item);
              // if(item.children.length) {
              //   self.openeds.push(item.path);
              // }
              self.navPathNameMap[item.path] = item.name;
            }
          }
        }
        return child;
      }

      function _ifExistMenu(id) {
        for (var i = 0; i < self.userMenuList.length; i++) {
          if (self.userMenuList[i].id == id && self.userMenuList[i].m_show == 1) {
            return true;
          }
        }
        return false;
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .left_menu {
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    .el-menu {
      width: 300px;
      height: 100%;
      &.el-menu--collapse {
        width: 64px;
      }
    }
  }
  .right_container {
    flex-grow: 1;
    position: relative;
    height: 100%;
    .bread_crumb {
      position: relative;
      height: 50px;
      background-color: #fff;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      .menu_icon {
        font-family: 'iconfont';
        cursor: pointer;
      }
      .bread_header {
        padding: 0 20px;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #333;
        .bread_item_w {
          display: flex;
          flex-grow: 1;
        }
        .bread_item {
          font-family: 'iconfont';
        }
        .bread_item:last-child {
          color: #999;
        }
        .user_name_w {
          cursor: pointer;
          flex-shrink: 0;
          .user_name {
            color: #333;
            font-weight: bolder;
          }
        }
      }
    }
    .main {
      position: absolute;
      top: 50px;
      bottom: 0;
      width: 100%;
      background-color: #f4f4f5;
      overflow: auto;
    }
  }
}

</style>
