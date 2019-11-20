<template>
  <el-dialog :title="isAdd?'新 增':'修 改'" :visible.sync="formvisible">
    <el-form ref="form" :model="formdata" label-width="150px">
      <div v-for="field in fields" :key="field.field">
        <template
          v-if="!field.condition||(field.condition&&formdata[field.condition.field]==field.condition.value)"
        >
          <el-form-item v-if="field.showlabel" :label="field.name">
            <ym-upload
              v-if="field.ctrltype==3"
              :ikey="field.field"
              :iurl="formdata[field.field]"
              @upload="upload"
            ></ym-upload>
            <el-input-number v-else-if="field.ctrltype==2" v-model="formdata[field.field]" :min="0"></el-input-number>
            <template v-else-if="field.ctrltype==4">
              <el-radio-group size="medium" v-model="formdata[field.field]">
                <el-radio
                  border
                  v-for="radio in field.radios"
                  :key="radio.value"
                  :label="radio.value"
                >{{radio.text}}</el-radio>
              </el-radio-group>
            </template>
            <template v-else-if="field.ctrltype==5">
              <el-select v-model="formdata[field.field]" filterable placeholder="请选择">
                <el-option
                  v-for="item in datasouce[field.field]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
            <el-input v-else v-model="formdata[field.field]"></el-input>
          </el-form-item>
        </template>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formvisible = false">取 消</el-button>
      <el-button type="primary" @click="commitForm">{{isAdd?'新 增':'修 改'}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import YmUpload from "./YmUpload";
export default {
  name: "YmForm",
  props: ["value", "fields", "data"],
  components: { YmUpload },
  data() {
    return {
      formvisible: false,
      formdata: {},
      datasouce: {},
      isAdd: false
    };
  },
  mounted() {
    this.formvisible = this.value;
    this.formdata = this.data;
    this.renderField();
  },
  methods: {
    open(data) {
      this.formvisible = true;
      if (!data || JSON.stringify(data) == "{}") {
        this.isAdd = true;
        this.formdata = this.getEmply();
      } else {
        this.isAdd = false;
        this.formdata = data;
      }
    },
    close(){
      this.formvisible = false;
    },
    getEmply() {
      let _data = {};
      this.fields.forEach(field => {
        _data[field.field] = "";
      });
      return _data;
    },
    commitForm() {
      this.$emit("commit", this.isAdd,this.formdata);
    },
    renderField() {
      this.fields.forEach(field => {
        if (field.datasouce) {
          this.$http
            .post(field.datasouce.path, {})
            .then(data => {
              if (data.data.head.status == 1) {
                let result = field.datasouce.rep?data.data[field.datasouce.rep]:data.data.info
                // 加载数据源
                this.datasouce[field.field] = this.getSouce(
                  result,
                  field.datasouce.param
                );
              }
            })
            .catch(err => {
              debugger;
            });
        }
      });
    },
    getSouce(data, param) {
      let returnAry = [];
      let _data = Object.assign([], data);
      if (param) {
        _data.forEach(d => {
          returnAry.push({
            value: d[param.value],
            label: d[param.text]
          });
        });
      }
      return returnAry;
    }
  },
  watch: {
    value(ov, nv) {
      this.formvisible = ov;
    },
    formvisible(ov, nv) {
      this.$emit("input", ov);
    },
    data(ov, nv) {
      debugger;
    }
  }
};
</script>

<style lang="scss">
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
</style>
