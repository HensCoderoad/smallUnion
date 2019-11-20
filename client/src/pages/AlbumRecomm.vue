<template>
  <div class="activity_wrapper">
    <el-tabs type="border-card" style="width:100%">
      <el-tab-pane label="推荐TAB">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="推荐1" name="1">
            <ym-page :interface="interfc" :optcode="optcode" :fields="fields"/>
          </el-tab-pane>
          <el-tab-pane label="推荐2" name="2">标签一</el-tab-pane>
          <el-tab-pane label="推荐3" name="3">标签一</el-tab-pane>
          <el-tab-pane label="推荐4" name="4">定时任务补偿</el-tab-pane>
        </el-tabs>
      </el-tab-pane>
      <el-tab-pane label="推荐模板">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="模板推荐1" name="1">
            <ym-page :interface="interfc" :optcode="optcode" :fields="fields"/>
          </el-tab-pane>
          <el-tab-pane label="模板推荐2" name="2">标签一</el-tab-pane>
          <el-tab-pane label="模板推荐3" name="3">标签一</el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
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
        { field: "tag_id", name: "推荐ID", showtable: 0, showlabel: 0 },
        { field: "tag_name", name: "别名", showtable: 1, showlabel: 1 },
        { field: "tag_status", name: "推荐类别", showtable: 1, showlabel: 1 },
        { field: "tag_status", name: "是否按(天)重复", showtable: 1, showlabel: 1 },
        {
          field: "weight",
          name: "投放起始时间",
          showtable: 1,
          showlabel: 1
        },{
          field: "weight",
          name: "投放结束时间",
          showtable: 1,
          showlabel: 1
        },
        { field: "create_time", name: "创建时间", showtable: 1, showlabel: 1 },
        { field: "update_time", name: "更新时间", showtable: 1, showlabel: 1 }
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
  created() {},
  methods: {}
};
</script>