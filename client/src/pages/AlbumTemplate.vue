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
      optcode: 6,
      fields: [
        { field: "oper_uid", name: "操作人ID" },
        { field: "tag_id", name: "标签ID" },
        { field: "tag_name", name: "标签名称" },
        { field: "tag_status", name: "标签状态" },
        { field: "weight", name: "权重" },
        { field: "create_time", name: "创建时间" },
        { field: "update_time", name: "更新时间" }
      ],
      interfc: {
        "0": {
          path: mock.ListTag,
          method: "POST",
          name:"查询",
          param: []
        },
        "2": {
          path: mock.ListCategory,
          method: "POST",
          name:"新增",
          param: []
        },
        "4": {
          path: mock.ListCategory,
          method: "POST",
          name:"修改",
          param: []
        },
        "8": {
          path: mock.ListCategory,
          method: "POST",
          name:"删除",
          param: []
        }
      }
    };
  },
  created() {}
};
</script>

