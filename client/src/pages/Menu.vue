<template>
  <div class="menu_wrapper">
    <div class="btn_w">
      <el-button type="primary" @click="showAddDialg()">添加菜单</el-button>
    </div>
    <el-tree
      v-loading="loading"
      class="tree"
      :data="menuTree"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :props="{label: 'name'}"
    >
      <span class="menu_item" slot-scope="{ node, data }">
        <span>
          <span class="order">[{{data.m_order}}]</span>
          {{ node.label }}
        </span>
        <div class="tag_btn_w">
          <span>
            <el-popover placement="top" width="100" trigger="hover">
              <el-tag slot="reference" size="small">查看角色</el-tag>
              <div style="display: flex;justify-content: center;flex-wrap: wrap;">
                <el-tag v-for="item in data.role" :key="item.id" size="small" style="margin: 10px">{{item.name}}</el-tag>
              </div>
            </el-popover>
          </span>
          <span style="margin-left: 20px">
            <el-button type="text" size="medium" @click="showAddDialg(data)">添加子菜单</el-button>
            <el-button type="text" size="medium" @click="showEdit(data)">编辑</el-button>
            <el-button type="text" size="medium" @click="showDelete(data)">删除</el-button>
          </span>
        </div>
      </span>
    </el-tree>
    <el-dialog title="添加菜单" :visible.sync="addDialogVisible">
      <el-form :model="addForm">
        <el-form-item label="菜单名" label-width="100px">
          <el-input v-model="addForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" label-width="100px">
          <el-input v-model="addForm.path" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="排序" label-width="100px">
          <el-input-number v-model="addForm.order" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="角色" label-width="100px">
          <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="item in roleLsit" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="显隐" label-width="100px">
          <el-switch v-model="addForm.show" active-text="显示菜单" inactive-text="隐藏菜单"></el-switch>
        </el-form-item>
        <!-- <el-form-item label="功能权限" label-width="100px">
          <el-checkbox-group v-model="menuroles">
            <el-checkbox label="增加(2)" name="type"></el-checkbox>
            <el-checkbox label="修改(4)" name="type"></el-checkbox>
            <el-checkbox label="删除(8)" name="type"></el-checkbox>
            <el-checkbox label="查询(0)" name="type"></el-checkbox>
          </el-checkbox-group>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addMenu">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑菜单" :visible.sync="editDialogVisible">
      <el-form :model="editForm">
        <el-form-item label="菜单名" label-width="100px">
          <el-input v-model="editForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" label-width="100px">
          <el-input v-model="editForm.path" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="排序" label-width="100px">
          <el-input-number v-model="editForm.order" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="角色" label-width="100px">
          <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="item in roleLsit" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="显隐" label-width="100px">
          <el-switch v-model="editForm.show" active-text="显示菜单" inactive-text="隐藏菜单"></el-switch>
        </el-form-item>
        <!-- <el-form-item label="功能权限" label-width="100px">
          <el-tabs type="border-card">
            <el-tab-pane label="超级管理员" v-for="item in checkList" :key="item.id">
              <el-checkbox-group v-model="menuroles">
                <el-checkbox label="增加(2)" name="type"></el-checkbox>
                <el-checkbox label="修改(4)" name="type"></el-checkbox>
                <el-checkbox label="删除(8)" name="type"></el-checkbox>
                <el-checkbox label="查询(0)" name="type"></el-checkbox>
                <el-checkbox label="其他功能(12)" name="type"></el-checkbox>
              </el-checkbox-group>
            </el-tab-pane>
          </el-tabs>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editMenu">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import md5 from "js-md5";
import status from "@/api/status.js";
import api from "@/api";
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  name: "Menu",
  data() {
    return {
      menuroles: [],
      menuList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        name: "",
        path: "",
        order: 1,
        show: true
      },
      editForm: {
        name: "",
        path: "",
        order: 1,
        show: true
      },
      roleLsit: [],
      roleListIdMap: {},
      roleMenuMap: [],
      checkList: [],
      menuTree: [],
      loading: true
    };
  },
  computed: {
    ...mapState("user", ["user"])
  },
  created() {
    this.getData();
  },
  watch:{
    // checkList(newV,oldV){
    //   debugger
    // }
  },
  methods: {
    resetForm() {
      this.addForm.name = "";
      this.addForm.path = "";
      this.addForm.order = 1;
      this.addForm.show = true;
      this.editForm.name = "";
      this.editForm.path = "";
      this.editForm.order = 1;
      this.editForm.show = true;
      this.checkList = [];
    },
    //获取菜单列表
    getData() {
      this.$http
        .get(api.getMenuList)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            Promise.all([this.getRoleList(), this.getRoleMenuMap()]).then(
              () => {
                res.data.list.map(item => {
                  item.role = this.findUserRoleNameListByMid(item.id);
                  item.order = item.m_order;
                });
                this.menuList = res.data.list;
                this.menuTree = this.createMenuTree(this.menuList);
                this.loading = false;
              }
            );
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取菜单列表失败");
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
    //获取子菜单id数组
    findChildrenIdsById(menuId) {
      var menuIds = [];
      var root = _find(this.menuTree);
      root && _getIds(root);
      return menuIds;

      function _find(list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == menuId) {
            return list[i];
          } else {
            var r = _find(list[i].children);
            if (r) {
              return r;
            }
          }
        }
      }

      function _getIds(item) {
        menuIds.push(item.id);
        for (var i = 0; i < item.children.length; i++) {
          _getIds(item.children[i]);
        }
      }
    },
    //获取角色列表
    getRoleList() {
      return this.$http
        .get(api.getRoleList)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.roleLsit = res.data.list;
            res.data.list.map(item => {
              this.roleListIdMap[item.id] = item;
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取角色列表失败");
        });
    },
    //获取菜单角色关联表
    getRoleMenuMap() {
      return this.$http
        .get(api.getRoleMenuMap)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.roleMenuMap = res.data.list;
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取用户角色关联表失败");
        });
    },
    //分析出用户的角色名称列表
    findUserRoleNameListByMid(mid) {
      var result = [];
      this.roleMenuMap.map(item => {
        if (item.menu_id == mid) {
          result.push(this.roleListIdMap[item.role_id]);
        }
      });
      return result;
    },
    showAddDialg(data) {
      this.addDialogVisible = true;
      if (data) {
        this.parentId = data.id;
        this.checkList = data.role.map(item => {
          return item.id;
        });
      }
    },
    showEdit(data) {
      this.toEditForm = data;
      this.editForm.id = data.id;
      this.editForm.name = data.name;
      this.editForm.path = data.path;
      this.editForm.order = data.m_order;
      this.editForm.show = data.m_show == 1 ? true : false;
      this.checkList = data.role.map(item => {
        return item.id;
      });
      this.editDialogVisible = true;
    },
    showDelete(data) {
      this.$confirm("确定删除该菜单么？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.deleteMenu(data);
        })
        .catch(err => {
          console.log(err);
        });
    },
    //添加用户
    addMenu() {
      if (!this.addForm.name) {
        this.$message.error("请填写菜单名");
        return;
      }
      this.$http
        .post(api.addMenu, {
          name: this.addForm.name,
          path: this.addForm.path,
          order: this.addForm.order,
          roles: this.checkList.join(","),
          parentId: this.parentId || 0,
          show: this.addForm.show ? 1 : 0
        })
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.$message.success("添加成功");
            this.addDialogVisible = false;
            this.getData();
            this.resetForm();
          } else {
            this.$message.error("添加失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，添加失败");
        });
    },
    editMenu() {
      if (!this.editForm.name) {
        this.$message.error("请填写菜单名");
        return;
      }
      this.$http
        .post(api.updateMenu, {
          id: this.editForm.id,
          name: this.editForm.name,
          path: this.editForm.path,
          order: this.editForm.order,
          roles: this.checkList.join(","),
          show: this.editForm.show ? 1 : 0
        })
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.$message.success("编辑成功");
            this.editDialogVisible = false;
            this.resetForm();
            this.getData();
          } else {
            this.$message.error("编辑失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，编辑失败");
        });
    },
    deleteMenu(data) {
      var ids = this.findChildrenIdsById(data.id);
      this.$http
        .post(api.deleteMenu, {
          id: ids
        })
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.$message.success("删除成功");
            this.getData();
            // this.checkIfHasThisMenu(data);
          } else {
            this.$message.error("删除失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，删除失败");
        });
    },
    checkIfHasThisMenu(data) {
      if (this.user.roleList) {
        for (var i = 0; i < this.user.roleList.length; i++) {
          for (var j = 0; j < data.role.length; j++) {
            if (this.user.roleList[i].role_id == data.role[j].id) {
              window.location.reload();
            }
          }
        }
      }
    }
  }
};
</script>
<style lang="scss">
.menu_wrapper {
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

  .tree {
    padding: 40px;

    .el-tree-node__content {
      min-height: 60px;
    }

    .el-tree-node__expand-icon {
      font-size: 18px;
    }

    .menu_item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      .tag_btn_w {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
      }

      .order {
        display: inline-block;
        margin-right: 10px;
        /*width: 20px;
        height: 20px;
        line-height: 20px;
        border-radius: 50%;
        display: inline-block;
        border: 1px solid rgba(64, 158, 255, .2);
        background: rgba(64, 158, 255, .1);
        color: #409EFF;
        text-align: center;
        margin-right: 10px;*/
      }
    }
  }
}
</style>
