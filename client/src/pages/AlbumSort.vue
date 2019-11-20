<template>
  <ym-page :interface="interfc" :optcode="optcode" :fields="fields"/>
</template>
<script>
import mock from "@/mock";
import YmPage from "../components/Ym/YmPage";
export default {
  components: {
    YmPage
  },
  data() {
    return {
      optcode: 31,
      fields: [
        { field: "oper_uid", name: "操作人ID", showtable: 0, showlabel: 0 },
        { field: "category_id", name: "分类ID", showtable: 0, showlabel: 0 },
        {
          field: "category_name",
          name: "分类名称",
          showtable: 1,
          showlabel: 1
        },
        {
          field: "cover_url",
          name: "封面图",
          showtable: 1,
          showlabel: 1,
          ctrltype: 3 //图片类型
        },
        {
          field: "weight",
          name: "权重",
          showtable: 1,
          showlabel: 1,
          ctrltype: 2 //数字
        },
        { field: "create_time", name: "创建时间", showtable: 0, showlabel: 1 },
        { field: "update_time", name: "更新时间", showtable: 0, showlabel: 1 },
        {
          field: "category_status",
          name: "分类状态",
          showtable: 1,
          showlabel: 0
        }
      ],
      interfc: {
        "1": {
          path: mock.ListCategory,
          type: "success",
          name: "查询",
          param: []
        },
        "2": {
          path: mock.ListCategory,
          // type: "primary",
          name: "新增",
          param: []
        },
        "4": {
          path: mock.ListCategory,
          // type: "warning",
          name: "修改",
          param: []
        },
        "8": {
          path: mock.ListCategory,
          // type: "danger",
          name: "删除",
          param: []
        },
        "16": {
          path: mock.ListCategory,
          method: "POST",
          name: "上架",
          param: []
        }
      }
    };
  },
  created() {}
};
</script>

