<template>
  <div class="dispatch_detail_wrapper">
    <div class="back"><el-button @click="$router.go(-1)">返回</el-button></div>
    <el-table :data="listData" style="width: 100%;" :span-method="arraySpanMethod" border>
      <el-table-column prop="authorName" label="公众号">
      </el-table-column>
      <el-table-column prop="aid" label="公众号ID">
      </el-table-column>
      <el-table-column prop="videoTitle" label="作品名">
      </el-table-column>
      <el-table-column label="作品封面" width="300">
        <template slot-scope="item">
          <img :src="item.row.videoCoverUrl" style="max-height: 200px;max-width: 100%;">
        </template>
      </el-table-column>
      <el-table-column label="作品内容" width="300">
        <template slot-scope="item">
          <div :key="item.row.videoCoverUrl">
            <VideoPlayer :extendOptions='{poster: item.row.videoCoverUrl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='item.row.videoPlayUrl' ></VideoPlayer>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="playCountTotal" label="总播放">
      </el-table-column>
      <el-table-column prop="playUidCountThirtyHoursPublishTime" label="30小时去重播放数">
      </el-table-column>
      <el-table-column label="奖励标准" width="250">
        <template slot-scope="item">
          <p v-if="item.$index == 0" style="display:inline-block;text-align: left">
            播放量＜3000，0元；<br>
            3000＜播放量＜10000，50元；<br>
            10000＜播放量＜30000，100元；<br>
            播放量＞30000，150元；
          </p>
        </template>
      </el-table-column>
      <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button @click="handleClick(scope.row)" type="text" size="small">上调</el-button>
        <el-button type="text" size="small">下调</el-button>
      </template>
    </el-table-column>
    </el-table>
  </div>
</template>
<script>
import VideoPlayer from '@/components/VideoPlayer';
export default {
  name: 'DispatchDetail',
  components: {
    VideoPlayer
  },
  data() {
    return {
      listData: []
    }
  },
  created() {
    // message VideoDetailBo {
    //   int64 aid = 1;            //作品所属认证号aid
    //   string vid = 2;           //作品vid
    //   string videoTitle = 3;        //作品标题
    //   string videoPlayUrl = 4;      //作品播放地址
    //   string videoCoverUrl = 5;     //作品封面
    //   int32 videoPublishTime = 6;     //作品发布时间，单位：秒
    //   int32 playTotal = 7;              //当前播放总次数
    //   int32 playUidCount = 8;             //当前的去推荐播放总人次
    //   int32 playTotalThirtyHoursPublishTime = 9;    //发布后，30个小时播放总数
    //   int32 playUidCountThirtyHoursPublishTime = 10;  //发布后，30个小时去推荐播放人次
    //   int32 playTotalThirtyHoursSettleTime = 11;    //发文结算时间，30个小时播放总数
    //   int32 playUidCountThirtyHoursSettleTime = 12; //发文结算时间，30个小时去推荐播放人次
    // }
    var listData = localStorage.getItem('dispatch_detail');
    this.listData = listData && JSON.parse(listData);
    this.listData.map((item)=>{
      item.playCountTotal = item.playCountTotal || 0;
      item.playUidCountThirtyHoursPublishTime = item.playUidCountThirtyHoursPublishTime || 0;
    });
  },
  methods: {
    arraySpanMethod({ rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex == 1) {
        if (rowIndex == 0) {
          return {
            rowspan: 10000,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    }
  }
}

</script>
<style lang="scss">
.dispatch_detail_wrapper {
  padding: 30px 20px;
  .back {
    margin-bottom: 20px;
    text-align: right;
  }
  th,
  td {
    text-align: center !important;
  }
}
</style>
