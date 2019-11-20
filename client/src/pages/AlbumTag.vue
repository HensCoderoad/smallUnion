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
        { field: "tag_id", name: "标签ID", showtable: 1, showlabel: 0 },
        { field: "tag_name", name: "标签名称", showtable: 1, showlabel: 1 },
        { field: "tag_status", name: "标签状态", showtable: 1, showlabel: 0 },
        { field: "weight", name: "权重", showtable: 1, showlabel: 1 ,ctrltype:2},
        { field: "create_time", name: "创建时间", showtable: 1, showlabel: 0 },
        { field: "update_time", name: "更新时间", showtable: 1, showlabel: 0 }
      ],
      interfc: {
        "1": {
          path: mock.ListTag,
          method: "POST",
          name: "查询",
          param: []
        },
        "2": {
          path: mock.ListCategory,
          method: "POST",
          name: "新增",
          param: []
        },
        "4": {
          path: mock.ListCategory,
          method: "POST",
          name: "修改",
          param: []
        },
        "8": {
          path: mock.ListCategory,
          method: "POST",
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

