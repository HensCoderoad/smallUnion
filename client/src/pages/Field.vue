<template>
  <div class="menu_wrapper">
    <el-tree
      :data="menu"
      class="tree"
      :props="menuprop"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :render-content="renderContent"
    ></el-tree>
    <ym-form ref="form" :fields="fields" v-model="formvisible" @commit="commit"/>
  </div>
</template>
<script>
import api from "@/api";
import store from "@/store";
import YmForm from "../components/Ym/YmForm";
export default {
  name: "Field",
  data() {
    return {
      menu: [],
      path: "",
      formvisible: false,
      fields: [
        { field: "menu", name: "菜单名", showtable: 1, showlabel: 0 },
        { field: "field", name: "字段名", showtable: 1, showlabel: 1 },
        { field: "fieldname", name: "中文名", showtable: 1, showlabel: 1 },
        { field: "showtable", name: "显示在表格", showtable: 1, showlabel: 1 },
        { field: "showlabel", name: "显示在表单", showtable: 1, showlabel: 1 },
        {
          field: "ctrltype",
          name: "控件类型",
          showtable: 1,
          showlabel: 1,
          ctrltype: 4,
          radios: [
            { value: "1", text: "文本框" },
            { value: "2", text: "数字" },
            { value: "3", text: "图片上传" },
            { value: "4", text: "选择" }
            // { value: "5", text: "下拉框" },
          ]
        },
        { field: "radios", name: "拓展", showtable: 1, showlabel: 1 }
      ],
      menuprop: {
        children: "fields",
        label: "name"
      }
    };
  },
  components: { YmForm },
  created() {
    // 获取动态菜单
    let menu = store.state.user.userMenuList.filter(m => {
      m.fields = [];
      return m.path.indexOf("dynamic") > -1;
    });
    // 获取字段设置
    this.$http
      .post(api.getField)
      .then(data => {
        if (data.data.status == 1) {
          data.data.list.forEach(field => {
            field.name = field.fieldname + ":" + field.field;
            let _menu = menu.find(m => m.path == field.menu);
            if (_menu) _menu.fields.push(field);
          });
        }
        this.menu = menu;
      })
      .catch(err => {});
  },
  methods: {
    renderContent(h, { node, data, store }) {
      if (data.fields) {
        return (
          <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
            <span>
              <span>{node.label}</span>
            </span>
            <span>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                on-click={() => this.addField(data)}
              />
            </span>
          </span>
        );
      } else {
        return (
          <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
            <span>
              <span>{node.label}</span>
            </span>
            <span>
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-edit"
                on-click={() => this.editField(data)}
              />
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                on-click={() => this.deleteField(data)}
              />
            </span>
          </span>
        );
      }
    },
    addField(data) {
      this.path = data.path;
      this.$refs.form.open();
    },
    editField(data) {
      this.$refs.form.open(Object.assign({}, data));
    },
    commit(isadd, data) {
      if (isadd) data.menu = this.path;
      this.$http
        .post(isadd ? api.addField : api.editField, data)
        .then(d => {
          if (d.status == 1) {
            this.$message.success(`操作成功!`);
          } else {
            this.$message.error(`操作失败!`);
          }
        })
        .catch(() => {
          this.$message.error(`操作失败!`);
        })
        .finally(() => {
          this.formvisible = false;
        });
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
