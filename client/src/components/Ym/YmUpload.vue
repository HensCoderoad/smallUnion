<template>
  <div>
    <div @click="imgVisible=true">
      <img v-if="iurl" :src="iurl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </div>
    <el-dialog title="选取图片" width="700px" append-to-body :show-close="false" :visible="imgVisible">
      <div class="choose">
        <div class="imgdiv">
          <vue-cropper
            ref="cropper"
            :img="imageUrl"
            :autoCropWidth="tailor.width"
            :autoCrop="true"
            :autoCropHeight="tailor.height"
            fixedBox
            :canMove="false"
            canMoveBox
            outputType="jpeg"
            @realTime="realTime"
            @cropMoving="cropMoving"
          ></vue-cropper>
        </div>
        <div class="imgdiv">
          <!-- <div
            class="show-preview"
            :style="{'width': previews.w + 'px', 'height': previews.h + 'px',  'overflow': 'hidden',
    'margin': '5px'}"
          >-->
          <div class="picture" :style="previewStyle3">
            <div :style="previews.div">
              <img :src="previews.url" :style="previews.img">
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <input
          type="file"
          id="uploads"
          style="position:absolute; clip:rect(0 0 0 0);"
          accept="image/png, image/jpeg, image/gif, image/jpg"
          @change="uploadImg($event, 1)"
        >
        <el-button @click="imgVisible = false">关 闭</el-button>
        <label class="el-button el-button--warning" for="uploads">选取照片</label>
        <el-button type="danger" :disabled="!imageUrl" @click="uploadOss">上 传</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { VueCropper } from "vue-cropper";
export default {
  name: "YmUpload",
  props: {
    // items: {
    //   required: true
    // },
    ikey: {},
    iurl: {},
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      // 可选字段，有默认值
      default: 200
    }
  },
  components: {
    VueCropper
  },
  mounted() {
    this.imageUrl = this.iurl;
    // 将传入的宽度和高度 大的那个数字按照200来做比例缩放
    if (this.width >= this.height) {
      this.tailor.width = this.maxLength;
      this.tailor.zoom = 330 / this.maxLength;
      // this.tailor.zoom = this.tailor.width/this.width
      this.tailor.height = this.height * (this.tailor.width / this.width);
    } else {
      this.tailor.height = this.maxLength;
      // this.tailor.zoom = this.tailor.height/this.height
      this.tailor.zoom = 300 / this.maxLength;
      this.tailor.width = this.width * (this.tailor.height / this.height);
    }
  },
  data() {
    return {
      maxLength: 200,
      tailor: {
        width: 0,
        height: 0,
        zoom: 1
      },
      previews: {},
      imgVisible: false,
      imageUrl: "",
      previewStyle3: {},
      fileinfo: {}
    };
  },
  methods: {
    cropMoving(a, b) {},
    realTime(data) {
      var previews = data;
      this.previewStyle3 = {
        width: previews.w + "px",
        height: previews.h + "px",
        overflow: "hidden",
        margin: "0",
        zoom: this.tailor.zoom //(this.width / previews.w)
      };
      this.previews = data;
    },
    uploadImg(e) {
      const file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = e => {
          let data;
          if (typeof e.target.result === "object") {
            // 把Array Buffer转化为blob 如果是base64不需要
            data = window.URL.createObjectURL(new Blob([e.target.result]));
          } else {
            data = e.target.result;
          }
          this.imageUrl = data;
        };
        // 转化为base64
        // reader.readAsDataURL(file)
        // 转化为blob
        reader.readAsArrayBuffer(file);
        this.fileinfo.name = file.name;
        this.fileinfo.type = file.type;
      }
    },
    uploadOss() {
      let name = this.fileinfo.name;
      let type = this.fileinfo.type;
      this.$refs.cropper.getCropBlob(data => {
        //this.downImg = window.URL.createObjectURL(data);
        data.name = name;
        this.$util.upload(data).then(url => {
          this.$message.success("上传成功");
          this.$emit("upload", this.ikey, url);
          this.imgVisible = false
        });
      })
    }
  }
};
</script>
<style lang="scss">
.choose {
  width: 100%;
  height: 300px;
  .imgdiv {
    width: 50%;
    float: left;
    height: 100%;
    display: -webkit-box;
    -webkit-box-pack: center;
    -webkit-box-align: center;
    -webkit-box-orient: vertical;
    text-align: center;
  }
  .picture {
    box-shadow: 1px 1px 1px 1px #6666;
  }
}
</style>


