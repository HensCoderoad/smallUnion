
<template>
  <div class="activity_wrapper">
    <el-tabs v-if="group.value" v-model="tabindex" class="tab_wrap1" @tab-click="handleClick">
      <el-tab-pane
        v-for="(gp,gi) in group.value"
        :key="gi"
        :label="gp.text+'('+(table[gp.value].length)+')'"
        :name="gp.value"
        :optcode="gp.optcode"
      ></el-tab-pane>
    </el-tabs>
    <el-table
      ref="table"
      height="700"
      style="padding:20px;width: 100%"
      v-loading="loading"
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      :data="group.value?table[tabindex]:tableData"
      :highlight-current-row="!muticheck"
      @row-dblclick="dblclick"
      @row-click="lclick"
    >
      <el-table-column v-if="muticheck" type="selection" width="55"></el-table-column>
      <template v-for="item in fields">
        <template v-if="item.showtable">
          <el-table-column :key="item.field" v-if="item.ctrltype==3" :label="item.name">
            <!-- v-if="item.ctrltype==3" -->
            <template slot-scope="scope">
              <img class="img" :src="scope.row[item.field]">
              <!-- 这是{{}} -->
            </template>
          </el-table-column>
          <el-table-column
            :key="item.field"
            v-else-if="item.ctrltype==4"
            :prop="item.field"
            :label="item.name"
            :filters="item.radios"
            :filter-method="(value, row)=>filterTag(value, row,item.field)"
            filter-placement="bottom-end"
          >
            <template slot-scope="scope">
              <!-- scope.row.tag === '家' ? 'primary' :  -->
              <el-tag
                :type="getType(scope.row[item.field],item.radios)"
                close-transition
              >{{getRadioText(scope.row[item.field],item.radios)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.ctrltype==6" :key="item.field" :label="item.name">
            <template slot-scope="scope">{{getDateTime(scope.row[item.field])}}</template>
          </el-table-column>
          <el-table-column
            :key="item.field"
            v-else-if="item.ctrltype==7"
            :label="item.name"
            width="300"
          >
            <template slot-scope="props">
              <div v-if="props.row.video_url" :key="props.row.cover_url">
                <VideoPlayer
                  :extendOptions="{poster: props.row.cover_url,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}"
                  :url="props.row.video_url"
                  :height="160"
                ></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column :key="item.field" v-else :prop="item.field" :label="item.name"/>
        </template>
      </template>
    </el-table>
      <!-- :page-sizes="[5,10,20,50]"
      @size-change="sizeChange"sizes, -->
    <el-pagination
      v-if="pages.length"
      style="background-color:#fff;padding:10px"
      @current-change="currentChange"
      :current-page="currentpage"
      :page-size="page.pagesize"
      layout="total,  prev, pager, next, jumper"
      :total="pages[tabindex].count"
    ></el-pagination>
  </div>
</template>
<script>
import { debug } from "util";
import VideoPlayer from "@/components/VideoPlayer";
export default {
  name: "YmTable",
  components: {
    VideoPlayer
  },
  // props: ["optcode", "fields", "interface"], "JSON.parse" eval("") jons.pare(value)
  props: {
    optcode: {
      type: Number,
      default: 12
    },
    fields: {
      type: Array,
      default: []
    },
    loading: {
      type: Boolean,
      default: false
    },
    tabledata: {
      type: Array,
      default: []
    },
    btns: {
      type: Array,
      default: []
    },
    group: {
      type: Object,
      default: {}
    },
    muticheck: {
      type: Number,
      default: 0
    },
    pages: {
      type: Array,
      default: {}
    }
  },
  watch: {
    tabledata(ov, nv) {
      this.tableData = ov;
      if (this.group.value) {
        // 自动分组
        this.renderTableData();
      }
    },
    tabindex(ov, nv) {
      this.$emit("tabChange", this.group.value.find(v => v.value == ov));
    },
    currentpage(ov,nv){
      let start = (ov-1) * this.page.pagesize;
      this.$emit("pagechange", start,this.page.pagesize);
    }
  },
  data() {
    return {
      tabindex: 0,
      tableData: [],
      selectRow: {},
      table: {},
      page: {
        pagesize: 10,
        pageindex: 0
      },
      currentpage:1
      // bTns:[]
    };
  },
  created() {
    // this.initBtn()
    // this.initCondition();
    // this.currentpage = 1
  },
  methods: {
    /** 根据字段初始化表格 */
    initTable() {},
    handleClick(e) {
      // 筛选根据字段
      this.$emit("tabChange", this.group.value[e.index]);
    },
    renderTableData() {
      let _table = {};
      this.group.value.forEach((gv, gi) => {
        _table[gv.value] = this.tableData.filter(
          td => td[this.group.field] == gv.value
        );
      });
      this.table = _table;
      // this.tableData.forEach(td=>{
      //   this.group.field
      // })
    },
    // handleCurrentChange(selectrow) {
    //   this.selectRow = selectrow;
    // },
    handleSelectionChange(e, a) {
      this.$emit("rclick", e);
    },
    lclick(row) {
      if (this.muticheck) return;
      if (row == this.selectRow) {
        this.selectRow = undefined;
        this.$refs.table.setCurrentRow();
      } else {
        this.$refs.table.setCurrentRow(row);
        this.selectRow = row;
      }
      this.$emit("rclick", this.selectRow);
    },
    dblclick(row, event) {
      this.$emit("dblclick", row, event);
    },
    btnClick(optcode) {
      this.$emit("event", optcode, this.selectRow);
    },
    getRadioText(value, radios) {
      let redio = radios.find(radio => radio.value == value);
      return redio ? redio.text : "无";
    },
    getType(value, radios) {
      let redio = radios.find(radio => radio.value == value);
      return redio && redio.type ? redio.type : "info";
    },
    filterTag(value, row, field) {
      return row[field] == value;
      // let radio = radios.find(radio => radio.value == value);
      // return radio ? true : false;
    },
    getDateTime(nS) {
      if (/^[0-9]*$/.test(nS)) {
        new Date(parseInt(nS) * 1000)
          .toLocaleString()
          .replace(/:\d{1,2}$/, " ");
      } else {
        return UtcToDate(nS);
      }
      function UtcToDate(UTCDateString) {
        if (!UTCDateString) {
          return "-";
        }
        function formatFunc(str) {
          //格式化显示
          return str > 9 ? str : "0" + str;
        }
        var date2 = new Date(UTCDateString); //这步是关键
        var year = date2.getFullYear();
        var mon = formatFunc(date2.getMonth() + 1);
        var day = formatFunc(date2.getDate());
        var hour = date2.getHours();
        var noon = hour >= 12 ? "下午" : "上午";
        hour = hour >= 12 ? hour - 12 : hour;
        hour = formatFunc(hour);
        var min = formatFunc(date2.getMinutes());
        var dateStr =
          year + "-" + mon + "-" + day + " " + noon + " " + hour + ":" + min;
        return dateStr;
      }
    },
    sizeChange(pagesize) {
      this.page.pagesize = pagesize;
      // // 自动切换到第一页
      // this.currentpage = 0
      // this.currentpage = 1
      
      let start = (this.currentpage-1) * pagesize;
      this.$emit("pagechange", start,pagesize);
    },
    currentChange(index) {
      this.currentpage = index
    }
  }
};
</script>
<style lang="scss">
.activity_wrapper {
  position: relative;
  margin-top: 20px;
  // padding: 30px 20px;
  min-width: 890px;
  .parging {
    padding: 10px;
    width: 100%;
    background: #fff;
  }
  .search_wrap {
    display: flex;
    align-items: center;

    .el-input {
      margin: 0 20px;
      width: 200px;
    }

    .el-input-group--append {
      width: 260px;
    }
  }

  th,
  td {
    text-align: center !important;

    .el-button {
      margin: 5px !important;
    }
  }

  .back {
    position: absolute;
    top: 30px;
    right: 20px;
  }

  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader-icon:hover {
    border-color: #409eff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    max-width: 100%;
    height: 178px;
    display: block;
    cursor: pointer;
  }
  .el-table--striped .el-table__body tr.el-table__row--striped.current-row td,
  .el-table__body tr.current-row > td {
    background-color: #9fb6cd;
  }
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    // background-color: #ffec8b;
  }
  .img {
    width: 100px;
    // height: 100px;
  }

  .tab_wrap1 {
    // margin-top: 20px;
    padding: 0 20px;
    background-color: #fff;

    .tab_item {
      padding: 20px;
    }
  }
}
</style>



