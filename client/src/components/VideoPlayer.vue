<template>
  <videoPlayer class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="options"></videoPlayer>
</template>
<script>
import 'vue-video-player/src/custom-theme.css';
import 'videojs-contrib-hls';
import 'video.js/dist/video-js.css';
import { videoPlayer } from 'vue-video-player';
export default {
  name: 'VideoPlayer',
  components: {
    videoPlayer
  },
  props: {
    url: String,
    width: Number,
    height: Number,
    extendOptions: {
      type: Object,
      default: {}
    },
    type: {
      default: '0'
    }
  },
  data() {
    return {
      options: {
        fluid: true,
        playbackRates: [1.0, 2.0, 3.0, 4.0],
        sources: {},
        preload: "none",
        techOrder: ["html5"],
        controls: true,
        muted: false,
        notSupportedMessage: "用户暂未上传视频",
        language: "zh-CN",
        hls: true
      }
    }
  },
  watch: {
    url(newUrl, oldUrl) {
      if (newUrl && newUrl != oldUrl) {
        var player = this.$refs.videoPlayer.player;
        if (player) {
          player.src(newUrl);
          player.load(newUrl);
        } else {
          setTimeout(() => {
            var player = this.$refs.videoPlayer.player;
            player.src(newUrl);
            player.load(newUrl);
          }, 100);
        }
      }
    }
  },
  created() {
    for (var key in this.extendOptions) {
      this.options[key] = this.extendOptions[key];
    }
    if (this.width) {
      this.options.width = this.width;
      this.options.fluid = false;
    }
    if (this.height) {
      this.options.height = this.height;
      this.options.fluid = false;
    }
    // if(this.type == 0) {
    //   if(this.url.indexOf("m3u8") > -1) {
    //    this.options.sources.type = "application/x-mpegURL"
    //   } else {
    //     this.options.sources.type = "video/mp4";
    //   }
    // } else {
    //   this.options.sources.type = "audio/mp3";
    // }
    // this.options.sources.src = this.url
    this.options.sources.type =
      this.type == 0 ?
      this.url.indexOf("m3u8") == -1 ?
      this.url.indexOf("mp4") == -1 ?
      "application/x-mpegURL" :
      "video/mp4" :
      "application/x-mpegURL" :
      "audio/mp3";

    this.options.sources.src =
      this.type == 0 ?
      this.url.indexOf("m3u8") == -1 ?
      this.url.indexOf("mp4") == -1 ?
      this.url + ".m3u8" :
      this.url :
      this.url :
      this.url.indexOf("mp3") == -1 ?
      this.url + ".mp3" :
      this.url;
  },
  methods: {

  }
}

</script>
<style lang="scss">
</style>
