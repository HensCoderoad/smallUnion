<template>
  <div>
    <!-- 条件 -->
    <div class="search_wrap">
      <el-form :inline="true" :model="condition.form" class="demo-form-inline">
        <el-form-item :label="con.name" v-for="con in condition.fields" :key="con.field">
          <!-- 日期选择器 -->
          <el-date-picker
            v-if="con.ctrltype==6"
            v-model="condition.form[con.field]"
            type="datetimerange"
            range-separator="至"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
          <!-- 选择器 -->
          <el-select
            v-else-if="con.search"
            clearable
            v-model="condition.form[con.field].model"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            @change="(value)=>searchChange(value,con.search)"
            :remote-method="(query)=>remoteMethod(query,con.field,con.search)"
            :loading="searchloading"
          >
            <el-option
              v-for="item in condition.form[con.field].option"
              :key="item[con.search.value]"
              :label="item[con.search.label]"
              :value="item[con.search.value]"
            ></el-option>
          </el-select>
          <!-- 输入框 -->
          <el-input v-else v-model="condition.form[con.field]" :placeholder="con.name"></el-input>
        </el-form-item>
        <el-form-item>
          <template v-for="(btn) in btns">
            <!-- :disabled="(optCode&btn.opt)!==btn.opt" -->
            <template v-if="(optCode&btn.opt)===btn.opt">
              <el-dropdown
                style="margin-left:10px"
                v-if="btn.datasouse"
                :key="btn.opt"
                @command="(value)=>handleCommand(value,btn.opt,btn.datasouse.field)"
              >
                <el-button
                  :icon="btn.icon"
                  :type="btn.type"
                  :disabled="selectRow.length==0&&btn.opt!==1&&btn.opt!==2"
                >
                  {{btn.name}}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="value in btn.datasouse.values"
                    :key="value"
                    :command="value"
                  >{{value}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button
                v-else
                :key="btn.opt"
                :icon="btn.icon"
                :type="btn.type"
                :disabled="selectRow.length==0&&btn.opt!==1&&btn.opt!==2"
                @click="btnClick(btn.opt)"
              >{{btn.name}}</el-button>
            </template>
          </template>
        </el-form-item>
      </el-form>
    </div>
    <!-- 数据表格 -->
    <ym-table
      ref="table"
      :loading="loading"
      :optcode="optCode"
      :fields="fields"
      :group="group"
      :muticheck="muticheck"
      :tabledata="tabledata"
      :btns="btns"
      :pages="pages"
      @pagechange="pagechange"
      @tabChange="tabChange"
      @rclick="rclick"
      @event="tableEvent"
      @dblclick="dblclick"
    />
    <!-- 弹框表单 -->
    <ym-form ref="form" :fields="fields" v-model="formvisible" @commit="commit"/>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import api from "@/api";
import store from "@/store";
import YmTable from "./YmTable";
import YmForm from "./YmForm";
import { resolve } from "url";
export default {
  name: "YmPage",
  props: ["fields", "interface", "optcode", "group", "muticheck", "page"],
  components: { YmTable, YmForm },
  computed: {
    ...mapState("user", ["user"]),
    ...mapState("global", [
      "categoryList",
      "CSPECIAL",
      "UNRECOMMEND",
      "CANCEL",
      "COMMENT"
    ])
  },
  data() {
    return {
      count: 990000,
      pageid: 0,
      loading: false,
      tabledata: [],
      btns: [],
      logid: 0,
      condition: {},
      searchloading: false,
      optCode: 1,
      selectRow: [],
      formvisible: false,
      pages: []
    };
  },
  methods: {
    // 页面改变的时候
    pagechange(start, size) {
      // 查询数据
      let param = Object.assign(
        {
          start,
          size
        },
        this.condition.form
      );
      this.excutPost(1, param, info => {
        this.tabledata = info;
      });
    },
    tabChange(e) {
      this.optCode = e.optcode;
      this.commentStatus = e.value;
      this.tableEvent(1);
    },
    rclick(selectrow) {
      if (toString.call(selectrow) == "[object Array]") {
        this.selectRow = selectrow;
      } else {
        if (selectrow) {
          this.selectRow = [selectrow];
        } else {
          this.selectRow = [];
        }
      }
    },
    handleCommand(value, opt, field) {
      this[field] = value;
      this.btnClick(opt);
    },
    btnClick(opt) {
      this.tableEvent(opt, this.selectRow);
    },
    commit(isAdd, data) {
      this.excutPost(isAdd ? 2 : 4, data, info => {
        this.tableEvent(1);
        this.$refs.form.close();
      });
    },
    tableEvent(opt, data) {
      if (opt == 1) {
        let param = Object.assign({}, data, this.condition.form);
        // 如果带有分页则查询分页
        if (this.page&&this.page.path) {
          // 如果带上了group 那么需要把group value带上
          this.$http.post(this.page.path, param).then(p => {
            if (p.data.status == 1) {
              this.pages = p.data.list;
              // 默认查询第一页数据
              this.pagechange(0,10)
            }
          });
        } else {
          // 加入条件的查询
          this.excutPost(opt, param, info => {
            this.tabledata = info;
          });
        }
      } else {
        if (opt == 2) {
          this.$refs.form.open();
        } else {
          if (!data || JSON.stringify(data) == "{}") {
            this.$message.error("请选中数据行,再进行操作");
            return;
          }
          if (opt == 4) {
            this.$refs.form.open(Object.assign({}, data[0]));
          } else {
            this.$confirm(`是否${this.interface[opt].name}?`).then(() => {
              this.excutPost(opt, data, info => {
                this.tableEvent(1);
              });
            });
          }
        }
      }
    },
    insertLog(menu_id, action_id, action_name, param) {
      console.log(store.state);
      return new Promise((resolve, reject) => {
        this.logid = 0;
        if (action_id == 1) {
          resolve();
        } else {
          this.$http
            .post(api.addLog, {
              user_id: store.state.user.user.id,
              menu_id,
              param,
              action_name
            })
            .then(data => {
              if (data.data.status == 1) {
                this.logid = data.data.list.insertId;
                resolve(data);
              } else {
                reject("日志插入失败,无法操作数据");
              }
            })
            .catch(err => {
              reject("日志插入失败,无法操作数据");
            });
        }
      });
    },
    changeLog() {
      let logid = this.logid;
      this.$http.post(api.updateLog, {
        id: logid,
        status: 1
      });
    },
    excutPost(opt, data, callback) {
      // 将参数打包成param
      this.loading = true;
      let _this = this;
      _this.data = data;
      let sto = store;
      let _param = {};
      if (this.interface[opt].param) {
        _param = Object.assign({}, this.interface[opt].param);
        Object.keys(_param).forEach(key => {
          _param[key] = this.getParamValue(_this, _param[key]);
        });
      }
      this.insertLog(
        this.$route.path,
        opt,
        this.interface[opt].name,
        JSON.stringify(_param || {})
      )
        .then(() => {
          this.$http
            .post(this.interface[opt].path, _param)
            .then(data => {
              if (data.data.hasOwnProperty("status")) {
                data.data.head = Object.assign({}, data.data);
              }
              if (data.data.head.status == 1) {
                if (this.logid) this.changeLog();
                this.$message.success(`${this.interface[opt].name}成功!`);
                let result = data.data[this.interface[opt].rep || "info"];
                if (this.interface[opt].repMap) {
                  console.log(this.interface[opt].repMap);
                  result = eval(this.interface[opt].repMap);
                }
                callback && callback(result);
              } else {
                this.$message.error(
                  `${this.interface[opt].name}错误 ${data.data.head.msg ||
                    data.data.status_info ||
                    ""}`
                );
              }
            })
            .catch(err => {
              this.$message.error(
                `${this.interface[opt].name}错误 ${err.errMsg}`
              );
            })
            .finally(() => {
              this.loading = false;
            });
        })
        .catch(err => {
          this.$message.error(err);
        });
    },
    getParamValue(data, paramstr) {
      if (paramstr.indexOf("@") > -1) {
        let chars = paramstr.split("@");
        let _d = data; //Object.assign({}, data);
        chars.forEach(c => {
          if (c) {
            if (_d instanceof Array) {
              let re = [];
              _d.forEach(dd => {
                re.push(dd[c]);
              });
              _d = re;
              // return re;
            } else {
              _d = _d[c];
            }
          }
        });
        return _d;
      } else {
        return paramstr;
      }
    },
    initBtn() {
      let _btns = [];
      let _this = this;
      Object.keys(this.interface).forEach(opt => {
        let _opt = Number(opt);
        let _btn = {}; //
        _btn = Object.assign({}, this.interface[_opt]);
        _btn.opt = _opt;
        if (_btn.datasouse) {
          _btn.datasouse.values = this.getParamValue(
            _this,
            _btn.datasouse.values
          );
        }
        // _btn.disabled = (this.optcode & _opt) !== _opt;
        // _btn.show = (this.optcode & _opt) === _opt;
        // _btn.type = _btn.type||"primary";
        _btns.push(_btn);
      });
      this.btns = _btns;
    },
    dblclick(row, e) {
      // this.tableEvent(4, row);
    },
    // 加载查询条件
    initCondition() {
      if (this.fields && this.fields.length > 0) {
        let condition = {
          form: {},
          fields: []
        };
        this.fields.forEach(field => {
          if (field.condition) {
            // field.search ? [] :
            if (field.search) {
              condition.form[field.field] = {
                model: "",
                option: []
              };
            } else {
              condition.form[field.field] = "";
            }
            condition.fields.push(field);
          }
        });
        console.log('condition' , condition);
        this.condition = condition;
      }
    },
    remoteMethod(query, field, search) {
      this.searchloading = true;
      let param = {};
      param[search.param] = query;
      this.$http
        .post(search.path, param)
        .then(data => {
          if (data.data && data.data.status == 1) {
            this.condition.form[field].option = data.data.list;
          }
        })
        .catch(err => {})
        .finally(() => {
          this.searchloading = false;
        });
    },
    searchChange(value, search) {
      this.condition.form[search.field] = value;
    }
  },
  created() {
    this.tableEvent(1);
    this.initBtn();
    this.initCondition();
    this.optCode = this.optcode;
  }
};
</script>
<style lang="scss" scoped>
.search_wrap .el-form-item {
  margin-bottom: 0px;
}
</style>


