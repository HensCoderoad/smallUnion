<template>
  <div class="role_wrapper">
    <div class="btn_w">
      <el-button type="primary" @click="showAdd">添加角色</el-button>
    </div>
    <el-table v-loading="loading" :data="roleList" style="width: 100%;">
      <el-table-column prop="name" label="角色名称">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="item">
          <el-button type="text" @click="showEdit(item.row)">编辑</el-button>
          <el-button type="text" @click="showDelete(item.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加角色" :visible.sync="addDialogVisible">
      <el-form :model="addForm">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="addForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限" label-width="80px">
          <el-tree v-loading="!menuList.length" class="tree" :data="menuTree" node-key="id" default-expand-all :expand-on-click-node="false" :props="{label: 'name'}" show-checkbox @check-change="menuCheckChange">
            <span class="menu_item" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑角色" v-if="editDialogVisible" :visible.sync="editDialogVisible">
      <el-form :model="editForm">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="editForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限" label-width="80px">
          <el-tree v-loading="!menuList.length || !roleMenuMap" class="tree" :data="menuTree" node-key="id" default-expand-all :expand-on-click-node="false" :props="{label: 'name'}" :default-checked-keys="checkedMenus" show-checkbox @check-change="menuCheckChange">
            <span class="menu_item" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import util from '@/util';
import status from '@/api/status.js';
import api from '@/api';
import { mapState, mapActions, mapMutations } from 'vuex';
export default {
  name: 'Role',
  data() {
    return {
      roleList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        name: ''
      },
      editForm: {
        name: ''
      },
      loading: true,
      menuList: [],
      menuTree: null,
      roleMenuMap: null,
      checkedMenus: []
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      this.$http.get(api.getRoleList).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.roleList = res.data.list;
          this.loading = false;
          this.getMenuList().then(() => {
            this.getRoleMenuMap();
          });
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取角色列表失败');
      });
    },
    //获取菜单角色关联表
    getRoleMenuMap() {
      return this.$http.get(api.getRoleMenuMap).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.roleMenuMap = res.data.list;
        }
        this.roleList.map((item) => {
          item.menus = this.findMenuIdsByRoleId(item.id);
          item.menuIds = item.menus.map((item) => { return item.menu_id });
        });
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取用户角色关联表失败');
      });
    },
    findMenuIdsByRoleId(roleId) {
      if (!this.roleMenuMap) {
        return [];
      }
      var arr = [];
      this.roleMenuMap.map((item) => {
        if (item.role_id == roleId && this.findMenuById(item.menu_id).parent_id) {
          arr.push(item);
        }
      });
      return arr;
    },
    findMenuById(menuId) {
      for (var i = 0; i < this.menuList.length; i++) {
        var menu = this.menuList[i];
        if (menu.id == menuId) {
          return menu;
        }
      }
      console.log('不存在的菜单id', menuId)
      return {};
    },
    //获取菜单列表
    getMenuList() {
      return this.$http.get(api.getMenuList).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.menuList = res.data.list;
          this.menuTree = this.createMenuTree(this.menuList);
          this.loading = false;
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取菜单列表失败');
      });
    },
    //生成菜单数据
    createMenuTree(list) {
      list = list.concat([]);
      return _findChildrenById(list, 0);

      function _findChildrenById(list, id) {
        var child = [];
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.parent_id == id) {
            list.splice(i, 1);
            i--;
            item.children = _findChildrenById(list.concat([]), item.id);
            child.push(item);
          }
        }
        return child;
      }
    },
    showAdd() {
      this.addDialogVisible = true;
      this.checkedMenus = [];
    },
    showEdit(data) {
      this.toEditForm = data;
      this.editForm.name = data.name;
      this.editDialogVisible = true;
      this.checkedMenus = data.menuIds;
    },
    showDelete(data) {
      this.$confirm("确定删除该角色么？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(() => {
        this.deleteRole(data.id);
      });
    },
    addRole() {
      this.$http.post(api.addRole, {
        name: this.addForm.name,
        menus: this.addParentMenuId().join(',')
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('添加成功');
          this.addDialogVisible = false;
          this.getData();
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，添加失败');
      });
    },
    editRole() {
      this.$http.post(api.updateRole, {
        name: this.editForm.name,
        id: this.toEditForm.id,
        menus: this.addParentMenuId().join(',')
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('编程成功');
          this.editDialogVisible = false;
          this.getData();
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，编辑失败');
      });
    },
    deleteRole(id) {
      this.$http.post(api.deleteRole, {
        id: id
      }).then((res) => {
        if (res.data.status == status.SUCCESS) {
          this.$message.success('删除成功');
          this.getData();
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，删除失败');
      })
    },
    findParentMenuIds(menuId) {
      var self = this;
      var menus = [];
      _findParent(menuId);

      function _findParent(menuId) {
        for (var i = 0; i < self.menuList.length; i++) {
          var menu = self.menuList[i];
          if (menu.id == menuId) {
            if (menu.parent_id) {
              menus.push(menu.parent_id);
              _findParent(menu.parent_id)
            }
            break;
          }
        }
      }
      return menus;
    },
    menuCheckChange(data, checked, indeterminate) {
      var id = data.id;
      var index = this.checkedMenus.indexOf(id);
      if (index > -1 && !checked) {
        this.checkedMenus.splice(index, 1);
      } else if (index == -1 && checked) {
        this.checkedMenus.push(id);
      }
    },
    addParentMenuId() {
      var menuIds = this.checkedMenus.concat([]);
      for(var i=0; i<this.checkedMenus.length; i++) {
        this.findParentMenuIds(this.checkedMenus[i]).map((item) => {
          if (menuIds.indexOf(item) == -1) {
            menuIds.push(item);
          }
        });
      }
      return menuIds;
    }
  }
}

</script>
<style lang="scss">
.role_wrapper {
  padding: 30px;

  .btn_w {
    text-align: right;
    margin-bottom: 20px;
  }

  .tree {
    max-height: 400px;
    overflow: auto;
  }

  th,
  td {
    text-align: center !important;
  }
}

</style>
