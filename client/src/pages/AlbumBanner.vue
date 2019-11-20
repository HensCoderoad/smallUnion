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
        { field: "adname", name: "广告主", showtable: 1, showlabel: 1 },
        {
          field: "category_name",
          name: "跳转目标",
          showtable: 1,
          showlabel: 1,
          ctrltype: 4,
          radios: [
            { label: 1, name: "内部" },
            { label: 2, name: "网页" },
            { label: 3, name: "小程序" }
          ]
        },
        {
          field: "object",
          condition: {
            field: "category_name",
            value: "1"
          },
          name: "跳转对象",
          showtable: 1,
          showlabel: 1,
          ctrltype: 4,
          radios: [
            { label: 1, name: "分类" },
            { label: 2, name: "标签" }
          ]
        },
        {
          field: "object1",
          condition: {
            field: "object",
            value: "1"
          },
          name: "选择分类数据",
          showtable: 1,
          showlabel: 1,
          ctrltype: 5,
          datasouce:{
            path:mock.ListCategory,
            param:{
              value:"category_id",
              label:"category_name"
            }
          }
        },
        {
          field: "object2",
          condition: {
            field: "object",
            value: "2"
          },
          name: "选择标签数据",
          showtable: 1,
          showlabel: 1,
          ctrltype: 5,
          datasouce:{
            path:mock.ListTag,
            param:{
              value:"tag_id",
              label:"tag_name"
            }
          }
        },
        {
          field: "object",
          condition: {
            field: "category_name",
            value: "2"
          },
          name: "跳转链接地址",
          showtable: 1,
          showlabel: 1
        },
        {
          field: "object",
          condition: {
            field: "category_name",
            value: "3"
          },
          name: "appid",
          showtable: 1,
          showlabel: 1
        },
        {
          field: "object",
          condition: {
            field: "category_name",
            value: "3"
          },
          name: "跳转链接地址",
          showtable: 1,
          showlabel: 1
        },
        {
          field: "category_name1",
          name: "投放策略",
          showtable: 1,
          showlabel: 1,
          ctrltype: 4,
          radios: [
            { label: 1, name: "不重复" },
            { label: 2, name: "按(日)重复" }
          ]
        },
        {
          field: "time",
          condition: {
            field: "category_name1",
            value: "1"
          },
          name: "投放时间",
          showtable: 1,
          showlabel: 1,
          ctrltype: 5
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
        },
        "31": {
          path: mock.ListCategory,
          method: "POST",
          name: "小程序显示",
          param: []
        }
      }
    };
  },
  created() {}
};
</script>

