<template>
  <div class="work_audit_manage_wrapper">
    <div class="search_wrap">
      <el-date-picker
        v-model="dateRange"
        @change="dateChange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      ></el-date-picker>
      <el-select v-model="workSearchType" placeholder="请选择" slot="prepend">
        <el-option
          v-for="item in workSearchOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容">
        <el-button @click="searchWork" slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        circle
        style="margin-left: 20px"
        @click="refresh"
      ></el-button>
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="待审核" name="waiteToAudit">
        <el-button type="success" size="mini" @click="showBatchPass">批量通过</el-button>
        <el-button type="danger" size="mini" @click="showBatchDown">批量下架</el-button>
        <el-table
          :data="workList"
          @selection-change="selectionChange"
          v-if="activeName=='waiteToAudit'"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="video_title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.cover_url"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video_url" :key="props.row.cover_url">
                <VideoPlayer
                  :extendOptions="{poster: props.row.cover_url,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}"
                  :url="props.row.video_url"
                  :height="100"
                ></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publish_time && $util.formatFullTime(props.row.publish_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && categoryIdNameMap[props.row.category[0]]}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button size="mini" type="primary" @click="showPass(props.row)">通过</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showC(props.row)">C类</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="已通过" name="passed">
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='passed'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="推荐状态">
                  <span v-if="props.row.recStatus == 1">上推荐</span>
                  <span v-if="props.row.recStatus == 2">下推荐</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="video_title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.cover_url"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
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
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publish_time && $util.formatFullTime(props.row.publish_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && categoryIdNameMap[props.row.category[0]]}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button v-if="!props.row.recStatus" size="mini" type="primary">获取中</el-button>
              <el-button
                v-if="props.row.recStatus == 1"
                size="mini"
                type="danger"
                @click="showDownRec(props.row)"
              >下推荐</el-button>
              <el-button
                v-if="props.row.recStatus == 2"
                size="mini"
                type="primary"
                @click="showUpRec(props.row)"
              >上推荐</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showC(props.row)">C类</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="C类列表" name="C">
        <el-button type="success" size="mini" @click="showBatchCancelC">批量取消C类</el-button>
        <el-button type="danger" size="mini" @click="showBatchDown">批量下架</el-button>
        <el-button v-if="switchFlag==1" type="danger" size="mini" @click="setWorkGradeMarkC">一键全量隐藏</el-button>
        <el-button v-if="switchFlag==0" type="success" size="mini" @click="setWorkGradeMarkC">一键全量开启</el-button>
        <el-select
          v-model="mark"
          size="mini"
          placeholder="请选择"
          @change="changeMark"
          clearable
          style="margin-left: 10px"
        >
          <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='C'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="推荐状态">
                  <span v-if="props.row.recStatus == 1">上推荐</span>
                  <span v-if="props.row.recStatus == 2">下推荐</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="video_title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.cover_url"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
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
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publish_time && $util.formatFullTime(props.row.publish_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && categoryIdNameMap[props.row.category[0]]}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit_mark" label="C类原因"></el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button v-if="!props.row.recStatus" size="mini" type="primary">获取中</el-button>
              <el-button
                v-if="props.row.recStatus == 1"
                size="mini"
                type="danger"
                @click="showDownRec(props.row)"
              >下推荐</el-button>
              <el-button
                v-if="props.row.recStatus == 2"
                size="mini"
                type="primary"
                @click="showUpRec(props.row)"
              >上推荐</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showCancelC(props.row)">取消C类</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="非C类下架列表" name="down">
        <el-button type="success" size="mini" @click="showBatchRecovery">批量恢复</el-button>
        <el-select
          v-model="mark"
          size="mini"
          placeholder="请选择"
          @change="changeMark"
          clearable
          style="margin-left: 10px"
        >
          <el-option v-for="item in CANCEL.slice(0,-1)" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='down'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="推荐状态">
                  <span v-if="props.row.recStatus == 1">上推荐</span>
                  <span v-if="props.row.recStatus == 2">下推荐</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="video_title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.cover_url"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
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
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publish_time && $util.formatFullTime(props.row.publish_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && categoryIdNameMap[props.row.category[0]]}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit_mark" label="下架原因"></el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showRecovery(props.row)">恢复作品</el-button>
              <el-button size="mini" type="primary" @click="showDelete(props.row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="C类下架列表" name="cDown">
        <el-button type="success" size="mini" @click="showBatchRecovery">批量恢复</el-button>
        <el-select
          v-model="mark"
          size="mini"
          placeholder="请选择"
          @change="changeMark"
          clearable
          style="margin-left: 10px"
        >
          <el-option v-for="item in CANCEL.slice(0,-1)" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='cDown'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="推荐状态">
                  <span v-if="props.row.recStatus == 1">上推荐</span>
                  <span v-if="props.row.recStatus == 2">下推荐</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="video_title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.cover_url"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
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
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.publish_time && $util.formatFullTime(props.row.publish_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && categoryIdNameMap[props.row.category[0]]}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit_mark" label="下架原因"></el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showRecovery(props.row)">恢复作品</el-button>
              <el-button size="mini" type="primary" @click="showDelete(props.row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="推荐列表" name="rec">
        <el-table :data="workList" v-if="activeName=='rec'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.coverurl"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.url" :key="props.row.coverurl">
                <VideoPlayer
                  :extendOptions="{poster: props.row.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}"
                  :url="props.row.url"
                  :height="160"
                ></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.cpubtime && $util.formatFullTime(props.row.cpubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="审核时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && props.row.category[0].name}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="danger" @click="showDownRec(props.row)">下推荐</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="下推荐列表" name="unrec">
        <el-select
          v-model="mark"
          size="mini"
          placeholder="请选择"
          @change="changeMark"
          clearable
          style="margin-left: 10px"
        >
          <el-option
            v-for="item in UNRECOMMEND.slice(0,-1)"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <el-table :data="workList" v-if="activeName=='unrec'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="认证主体">
                  <span>{{ props.row.author_name }}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span>{{ userIdNameMap[props.row.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="最后操作时间">
                  <span>{{ props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
                <el-form-item label="不推荐原因">
                  <span>{{ props.row.reason }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="作品名" width="200"></el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img
                :src="props.row.coverurl"
                style="max-height: 160px;max-width: 250px;display: block;margin:auto"
              >
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.url" :key="props.row.coverurl">
                <VideoPlayer
                  :extendOptions="{poster: props.row.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}"
                  :url="props.row.url"
                  :height="160"
                ></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.cpubtime && $util.formatFullTime(props.row.cpubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="审核时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.update_time && $util.formatFullTime(props.row.update_time*1000,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template slot-scope="props">
              <div>{{props.row.category && props.row.category[0].name}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showUpRec(props.row)">上推荐</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="workTotal"
          :current-page="workPage"
          :page-size="workPageSize"
          @current-change="changeWorkPage"
        ></el-pagination>
      </el-tab-pane>
    </el-tabs>
    <!-- 编辑作品 -->
    <el-dialog title="编辑作品" :visible.sync="editDialogVisible">
      <el-form v-loading="dialogLoading">
        <el-form-item label="标题" label-width="100px">
          <el-input v-model="workForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div @click="triggerInput">
              <img v-if="workForm.coverurl" :src="workForm.coverurl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="分类" label-width="100px">
          <el-select v-model="workForm.categoryId" placeholder="请选择">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.typename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 下架作品 -->
    <el-dialog title="下架" :visible.sync="downDialogVisible">
      <el-form v-loading="dialogLoading" :model="downForm">
        <el-form-item v-if="activeName!='C'" label="视频分类" label-width="100px">
          <el-select v-model="downForm.categoryId" placeholder="请选择">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.typename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下架原因" label-width="100px">
          <el-select v-model="downForm.reason" placeholder="请选择">
            <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downForm.reason=='自定义输入'" label="下架原因" label-width="100px">
          <el-input v-model="downForm.customReason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="downDialogVisible = false">取 消</el-button>
        <el-button v-if="activeName=='C'" type="primary" @click="batchUpDownVideos">确 定</el-button>
        <el-button v-else type="primary" @click="downWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 批量下架作品 -->
    <el-dialog title="下架" :visible.sync="batchDownDialogVisible">
      <el-form :model="downForm" v-loading="dialogLoading">
        <el-form-item label="下架原因" label-width="100px">
          <el-select v-model="downForm.reason" placeholder="请选择">
            <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downForm.reason=='自定义输入'" label="下架原因" label-width="100px">
          <el-input v-model="downForm.customReason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchDownDialogVisible = false">取 消</el-button>
        <el-button v-if="activeName=='C'" type="primary" @click="batchUpDownVideos">确 定</el-button>
        <el-button v-else type="primary" @click="batchDownWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 标记为C类 -->
    <el-dialog title="C类" :visible.sync="cDialogVisible">
      <el-form :model="cForm" v-loading="dialogLoading">
        <el-form-item label="视频分类" label-width="100px">
          <el-select v-model="cForm.categoryId" placeholder="请选择" @change="changeCommentList">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.typename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态" label-width="100px">
          <el-select v-model="cForm.recommendStatus" placeholder="请选择">
            <el-option label="上推荐" :value="1"></el-option>
            <el-option label="不推荐" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="C类原因" label-width="100px">
          <el-select v-model="cForm.reason" placeholder="请选择">
            <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="cForm.recommendStatus==1" label="作品评级" label-width="100px">
          <el-select v-model="cForm.gradeType" placeholder="请选择">
            <el-option
              v-for="item in workgrade"
              :key="item.gradeType"
              :label="item.name"
              :value="item.gradeType"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 手动评论 -->
        <el-form-item label="手动评论" label-width="100px">
          <el-select
            v-model="cForm.comment"
            multiple
            default-first-option
            filterable
            allow-create
            placeholder="请选择"
            :multiple-limit="3"
            @change="commentChange"
          >
            <el-option
              v-for="item in commentlist"
              :key="item.id"
              :label="item.commentText"
              :value="item.commentText"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- addcoms -->
        <!-- <el-form-item label="自定义评论" label-width="100px">
          <el-input  v-model="addcoms" class="input-with-select">
            <el-button slot="append" icon="el-icon-search">添加入库</el-button>
          </el-input>
        </el-form-item>-->
        <!-- <el-form-item v-if="cForm.recommendStatus==2" label="不推荐原因" label-width="100px">
          <el-select v-model="cForm.unRecreason" placeholder="请选择">
            <el-option v-for="item in UNRECOMMEND" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="cForm.recommendStatus==1" label="作品评级2" label-width="100px">
          <el-select v-model="cForm.gradeType" placeholder="请选择">
            <el-option
              v-for="item in workgrade"
              :key="item.gradeType"
              :label="item.name"
              :value="item.gradeType"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="cForm.unRecreason=='自定义输入'" label="不推荐原因" label-width="100px">
          <el-input v-model="cForm.customReason"></el-input>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setC">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 通过 -->
    <el-dialog title="通过" :visible.sync="passDialogVisible">
      <el-form :model="passForm" v-loading="dialogLoading">
        <el-form-item label="视频分类" label-width="100px">
          <el-select v-model="passForm.categoryId" placeholder="请选择" @change="changeCommentList">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.typename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态" label-width="100px">
          <el-select v-model="passForm.recommendStatus" placeholder="请选择">
            <el-option label="上推荐" :value="1"></el-option>
            <el-option label="不推荐" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="passForm.recommendStatus==2" label="不推荐原因" label-width="100px">
          <el-select v-model="passForm.reason" placeholder="请选择">
            <el-option v-for="item in UNRECOMMEND" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="passForm.recommendStatus==1" label="作品评级" label-width="100px">
          <el-select v-model="passForm.gradeType" placeholder="请选择">
            <el-option
              v-for="item in workgrade"
              :key="item.gradeType"
              :label="item.name"
              :value="item.gradeType"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="passForm.reason=='自定义输入'" label="不推荐原因" label-width="100px">
          <el-input v-model="passForm.customReason"></el-input>
        </el-form-item>

        <!-- 手动评论 -->
        <el-form-item label="手动评论" label-width="100px">
          <el-select
            v-model="passForm.comment"
            multiple
            default-first-option
            filterable
            allow-create
            placeholder="请选择"
            :multiple-limit="3"
          >
            <el-option
              v-for="item in commentlist"
              :key="item.id"
              :label="item.commentText"
              :value="item.commentText"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="passWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 恢复 -->
    <el-dialog title="恢复" :visible.sync="recoveryDialogVisible">
      <el-form :model="recoveryForm" v-loading="dialogLoading">
        <el-form-item label="C类原因" label-width="100px">
          <el-select v-model="recoveryForm.reason" placeholder="请选择">
            <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="recoveryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="recovery(true)">置为C类</el-button>
        <el-button type="primary" @click="recovery()">直接通过</el-button>
      </div>
    </el-dialog>
    <!-- 下推荐 -->
    <el-dialog title="下推荐" :visible.sync="unrecDialogVisible">
      <el-form :model="unrecForm" v-loading="dialogLoading">
        <el-form-item label="下推荐原因" label-width="100px">
          <el-select v-model="unrecForm.reason" placeholder="请选择">
            <el-option v-for="item in UNRECOMMEND" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="unrecForm.reason=='自定义输入'" label="下推荐原因" label-width="100px">
          <el-input v-model="unrecForm.customReason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="unrecDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmUnrec">确 定</el-button>
      </div>
    </el-dialog>
    <div style="line-height: 0;height:0;">
      <input
        ref="file"
        type="file"
        style="visibility: hidden"
        accept="image/gif, image/jpeg, image/jpg, image/png, image/svg"
        @change="uploadImage"
      >
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import api from "@/api";
import status from "@/api/status";
import VideoPlayer from "@/components/VideoPlayer";
export default {
  name: "RecManage",
  components: {
    VideoPlayer
  },
  data() {
    return {
      defaultGrade: "",
      workgrade: [], //曝光级别数据
      loading: false,
      dialogLoading: false,
      dateRange: null,
      workSearchOptions: [
        {
          label: "作品名",
          value: 1
        },
        {
          label: "认证主体名",
          value: 2
        }
      ],
      workSearchType: 1,
      searchKey: "",
      confirmSearchKey: "",
      activeName: "waiteToAudit",
      workList: [],
      workTotal: undefined,
      workPage: 1,
      workPageSize: 10,
      workForm: {
        name: "",
        coverurl: "",
        categoryId: ""
      },
      downForm: {
        reason: "",
        customReason: "",
        categoryId: ""
      },
      cForm: {
        reason: "",
        unRecreason: "",
        customReason: "",
        recommendStatus: 1,
        gradeType: "",
        categoryId: "",
        comment: [],
        vname: ""
      },
      passForm: {
        reason: "",
        customReason: "",
        categoryId: "",
        gradeType: "",
        recommendStatus: 1,
        comment: [],
        vname: ""
      },
      recoveryForm: {
        reason: ""
      },
      unrecForm: {
        reason: "",
        customReason: ""
      },
      downReasonList: null,
      cReasonList: null,
      rankList: [
        { id: 1, name: "A级" },
        { id: 2, name: "B级" },
        { id: 3, name: "S级" }
      ],
      editDialogVisible: false,
      downDialogVisible: false,
      cDialogVisible: false,
      passDialogVisible: false,
      recoveryDialogVisible: false,
      unrecDialogVisible: false,
      batchDownDialogVisible: false,
      categoryIdNameMap: {},
      mark: "",
      switchFlag: -1,
      userIdNameMap: {},
      recAidMap: {},
      commentlist: [] //评论列表
    };
  },
  computed: {
    ...mapState("user", ["user"]),
    ...mapState("global", ["categoryList", "CSPECIAL", "UNRECOMMEND", "CANCEL"])
  },
  created() {
    var now = new Date();
    this.innerGetCategoryList();
    this.getTotal();
    this.getData();
    this.getWorkGradeMarkC();
    this.getUserList();
    // 获取曝光评级
    this.getWorkGrade();
    this.downReasonList = this.CANCEL;
    this.cReasonList = this.CSPECIAL.slice(0, -1);
  },
  methods: {
    ...mapActions("global", ["getCategoryList"]),
    refresh() {
      this.changeTab();
    },
    changeTab(tab) {
      this.workTotal = 0;
      this.workPage = 1;
      this.workList = [];
      this.mark = "";
      this.beginTime = 0;
      this.endTime = 0;
      this.dateRange = null;
      this.workStarTime = 0;
      this.workEndTime = 0;
      this.searchKey = "";
      this.confirmSearchKey = "";
      if (this.activeName == "rec") {
        this.countWhiteList();
        this.getRecList();
      } else if (this.activeName == "unrec") {
        this.countBlackList();
        this.getUnrecList();
      } else {
        this.searchWork();
      }
    },
    //选择日期范围
    dateChange(range) {
      this.beginTime = (range && Math.floor(+range[0] / 1000)) || 0;
      this.endTime = (range && Math.floor(+range[1] / 1000)) || 0;
      if (this.beginTime && this.beginTime == this.endTime) {
        this.endTime += 24 * 60 * 60;
      }
    },
    //多选
    selectionChange(e) {
      this.selection = e;
    },
    //页码
    changeWorkPage(page) {
      this.workPage = page;
      this.workList = [];
      if (this.activeName == "rec") {
        this.getRecList();
      } else if (this.activeName == "unrec") {
        this.getUnrecList();
      } else {
        this.getData();
      }
    },
    //更改列表原因
    changeMark() {
      this.workList = [];
      this.workPage = 1;
      this.workTotal = 0;
      if (this.activeName == "unrec") {
        this.countBlackList();
        this.getUnrecList();
      } else {
        this.searchKey = "";
        this.confirmSearchKey = "";
        this.getTotal();
        this.getData();
      }
    },
    //回车搜索
    keydown(e) {
      if (e.keyCode == 13 || e.keyCode == 108) {
        this.searchWork();
      }
    },
    //搜索作品
    searchWork() {
      this.confirmSearchKey = this.searchKey;
      this.workPage = 1;
      this.workList = [];
      this.workStarTime = this.beginTime;
      this.workEndTime = this.endTime;
      this.mark = "";
      if (this.activeName == "rec") {
        this.countWhiteList();
        this.getRecList();
      } else if (this.activeName == "unrec") {
        this.countBlackList();
        this.getUnrecList();
      } else {
        this.getTotal();
        this.getData();
      }
    },
    //获取分类列表
    innerGetCategoryList() {
      if (this.categoryList.length) {
        this.categoryList.map(item => {
          this.categoryIdNameMap[item.id] = item.typename;
        });
        return Promise.resolve();
      } else {
        return this.getCategoryList().then(() => {
          this.categoryList.map(item => {
            this.categoryIdNameMap[item.id] = item.typename;
          });
        });
      }
    },
    //获取运营后台用户列表
    getUserList() {
      this.$http.get(api.getUserList).then(res => {
        res.data.list.map(item => {
          this.userIdNameMap[item.id] = item.nickName;
        });
      });
    },
    //获取总数量
    getTotal() {
      var option = {
        ctime_begin: this.workStarTime || 0,
        ctime_end: this.workEndTime || 0
      };
      var url = api.CountWorksByStatus;
      switch (this.activeName) {
        case "waiteToAudit":
          option.video_status = 0; //查询作品审核状态  0=待审核  1=已通过,但不标记  2=已下架 3=已通过,但标记 4=已通过(不管是否标记) 5=c类已下架 6=全部
          break;
        case "passed":
          option.video_status = 1;
          break;
        case "C":
          option.video_status = 3;
          option.mark = this.mark;
          if (this.mark) {
            url = api.CountWorksByMark;
          }
          break;
        case "down":
          option.video_status = 2;
          break;
        case "cDown":
          option.video_status = 5;
          option.mark = this.mark;
          if (this.mark) {
            url = api.CountWorksByMark;
          }
          break;
      }
      if (this.workSearchType == 1) {
        option.video_title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.$http
        .post(url, option)
        .then(res => {
          if (res.data.head.status == 1) {
            this.workTotal = res.data.total || 0;
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取作品总数失败");
        });
    },
    //获取列表
    getData() {
      var option = {
        page_no: this.workPage,
        page_size: this.workPageSize,
        ctime_begin: this.workStarTime || 0,
        ctime_end: this.workEndTime || 0
      };
      var url = api.ListWorksByStatus;
      switch (this.activeName) {
        case "waiteToAudit":
          option.video_status = 0; //查询作品审核状态  0=待审核  1=已通过,但不标记  2=已下架 3=已通过,但标记 4=已通过(不管是否标记) 5=c类已下架 6=全部
          break;
        case "passed":
          option.video_status = 1;
          break;
        case "C":
          option.video_status = 3;
          if (this.mark) {
            option.mark = this.mark;
            url = api.ListWorksByMark;
          }
          break;
        case "down":
          option.video_status = 2;
          if (this.mark) {
            option.mark = this.mark;
            url = api.ListWorksByMark;
          }
          break;
        case "cDown":
          option.video_status = 5;
          if (this.mark) {
            option.mark = this.mark;
            url = api.ListWorksByMark;
          }
          break;
      }
      if (this.workSearchType == 1) {
        option.video_title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.loading = true;
      this.$http
        .post(url, option)
        .then(res => {
          this.loading = false;
          if (res.data.head.status == 1) {
            var vids = [],
              aids = [];
            this.workList = res.data.infos || [];
            res.data.infos &&
              res.data.infos.map(item => {
                vids.push(item.vid);
                aids.push(item.aid);
              });
            //检测认证号是否在白名单内
            if (
              ["waiteToAudit", "passed", "down", "cDown"].indexOf(
                this.activeName
              ) > -1
            ) {
              aids.length && this.checkWhite(aids);
            }
            //获取作品推荐状态
            vids.length &&
              this.getRecStatusByVids(vids).then(result => {
                this.workList.map(item => {
                  item.recStatus = 2;
                  result.map(obj => {
                    if (obj.vid == item.vid) {
                      item.recStatus = 1;
                    }
                  });
                  this.workList = res.data.infos || [];
                  vids.length &&
                    this.getRecStatusByVids(vids).then(result => {
                      this.workList.map(item => {
                        item.recStatus = 2;
                        result.map(obj => {
                          if (obj.vid == item.vid) {
                            item.recStatus = 1;
                          }
                        });
                      });
                      this.workList = this.workList.concat([]);
                    });
                });
              });
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message.error("服务器错误，获取作品列表失败");
        });
    },
    //根据aid检测是否再白名单列表里
    checkWhite(aids) {
      this.$http
        .post(api.checkWhite, {
          aids: aids
        })
        .then(res => {
          this.recAidMap = res.data.list || {};
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，检测白名单失败");
        });
    },
    //获取白名单作品数量
    countWhiteList() {
      var option = {
        beginTime: this.workStarTime,
        endTime: this.workEndTime
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.$http
        .post(api.countWhiteList, option)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.workTotal = res.data.total;
          } else {
            this.$message.error("获取推荐作品数量失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("获取推荐作品数量失败");
        });
    },
    //获取黑名单作品数量
    countBlackList() {
      var option = {
        beginTime: this.workStarTime,
        endTime: this.workEndTime,
        reason: this.mark
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.$http
        .post(api.countBlackList, option)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            this.workTotal = res.data.total;
          } else {
            this.$message.error("获取推荐作品数量失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("获取推荐作品数量失败");
        });
    },
    //获取白名单作品
    getRecList() {
      this.loading = true;
      this.workList = [];
      var option = {
        beginTime: this.workStarTime,
        endTime: this.workEndTime,
        page: this.workPage,
        size: this.workPageSize
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.$http
        .post(api.getWhiteList, option)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            if (res.data.list.length) {
              this.batchGetVideos(res.data.list);
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
            this.$message.error("获取推荐作品列表失败");
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
          this.$message.error("获取推荐作品列表失败");
        });
    },
    //获取黑名单作品
    getUnrecList() {
      this.loading = true;
      this.workList = [];
      var option = {
        beginTime: this.workStarTime,
        endTime: this.workEndTime,
        reason: this.mark,
        page: this.workPage,
        size: this.workPageSize
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else {
        option.author_name = this.confirmSearchKey;
      }
      this.$http
        .post(api.getBlackList, option)
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            if (res.data.list.length) {
              this.batchGetVideos(res.data.list);
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
            this.$message.error("获取推荐作品列表失败");
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
          this.$message.error("获取推荐作品列表失败");
        });
    },
    //批量获取作品信息
    batchGetVideos(list) {
      var vids = [];
      var map = {};
      list.map(item => {
        vids.push(item.vid);
        map[item.vid] = item;
      });
      this.$http
        .post(api.BatchGetVideos, {
          vid: vids
        })
        .then(res => {
          this.loading = false;
          if (res.data.head.status == 1) {
            if (res.data.info) {
              for (var key in res.data.info) {
                var item = res.data.info[key];
                item.video.author_name = item.author && item.author.name;
                item.video.update_time = map[item.video.vid].create_time;
                item.video.audit_uid = map[item.video.vid].operator;
                item.video.reason = map[item.video.vid].reason;
                this.workList.push(item.video);
              }
            }
          } else {
            this.$message.error("获取推荐作品列表失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message.error("获取推荐作品列表失败");
        });
    },
    //根据vids获取推荐状态
    getRecStatusByVids(vids) {
      return this.$http
        .post(api.getWhiteByVids, {
          vids: vids
        })
        .then(res => {
          if (res.data.status == status.SUCCESS) {
            return res.data.list;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //获取C类评级隐藏状态
    getWorkGradeMarkC() {
      this.$http
        .post(api.GetWorkGradeMarkC)
        .then(res => {
          if (res.data.head.status == 1) {
            this.switchFlag = res.data.switchFlag || 0;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //设置C类评级隐藏开关
    setWorkGradeMarkC() {
      var switchFlag = 0;
      if (this.switchFlag == 0) {
        switchFlag = 1;
      }
      this.$http
        .post(api.SetWorkGradeMarkC, {
          operUid: this.user.id,
          switchFlag: switchFlag
        })
        .then(res => {
          if (res.data.head.status == 1) {
            this.switchFlag = switchFlag;
            this.$message.success("操作成功");
          } else {
            this.$message.success(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.success("操作失败");
        });
    },
    //显示作品编辑弹框
    showEdit(data) {
      this.workForm.vid = data.vid;
      this.workForm.name = data.video_title;
      this.workForm.coverurl = data.cover_url;
      this.workForm.categoryId = (data.category && data.category[0]) || "";
      this.editDialogVisible = true;
    },
    //批量通过确认
    showBatchPass() {
      if (this.selection && this.selection.length) {
        this.$confirm("是否确定批量通过", "提示")
          .then(() => {
            this.batchPassWork(this.selection);
          })
          .catch(() => {});
      } else {
        this.$message("请先选中作品");
        return;
      }
    },
    //批量下架
    showBatchDown() {
      if (this.selection && this.selection.length) {
        this.batchDownDialogVisible = true;
        var vids = [];
        this.selection.map(item => {
          vids.push(item.vid);
        });
        this.downForm.vids = vids;
      } else {
        this.$message("请先选中作品");
        return;
      }
    },
    //下架
    showDown(data) {
      if (this.activeName == "C") {
        this.downForm.vids = [data.vid];
      } else {
        this.downForm.vid = data.vid;
      }
      this.downForm.categoryId = (data.category && data.category[0]) || "";
      this.downForm.reason = "";
      this.downForm.customReason = "";
      this.downDialogVisible = true;
    },
    //标记为C类
    showC(data) {
      this.cForm.vname = data.video_title;
      this.cForm.vid = data.vid;
      this.cForm.aid = data.aid;
      this.cForm.categoryId = (data.category && data.category[0]) || "";
      this.cForm.reason = "";
      this.cForm.customReason = "";
      this.cForm.unRecreason = "";
      this.cForm.recommendStatus = 2;
      this.cForm.gradeType = this.defaultGrade;
      this.cForm.comment = "";
      if (this.recAidMap[data.aid]) {
        this.cForm.recommendStatus = 1;
      }
      this.cDialogVisible = true;
      this.changeCommentList(this.cForm.categoryId);
    },
    getVuser(count, callback) {
      this.$http
        .post(api.getVuser, {
          count
        })
        .then(data => {
          if (data.data.status == 1) {
            callback && callback(data.data.list);
          }
        });
    },
    changeCommentList(value) {
      let cate = this.categoryList.find(l => l.id == value);
      let typename = cate ? cate.typename : "";
      this.getCommentList(typename);
    },
    getCommentList(typename) {
      this.$http
        .post(api.getCommentEnum, {
          rand: 1,
          categoryid:typename
        })
        .then(data => {
          if (data.data.status == 1) {
            this.commentlist = data.data.list;
          }
        });
    },
    //审核通过
    showPass(data) {
      // 获取下拉
      this.passForm.vname = data.video_title;
      this.passForm.aid = data.aid;
      this.passForm.vid = data.vid;
      this.passForm.reason = "";
      this.passForm.customReason = "";
      this.passForm.categoryId = (data.category && data.category[0]) || "";
      this.passForm.recommendStatus = 2;
      this.passForm.gradeType = this.defaultGrade;
      this.passForm.comment = [];
      if (this.recAidMap[data.aid]) {
        this.passForm.recommendStatus = 1;
      }
      this.passDialogVisible = true;
      this.changeCommentList(this.passForm.categoryId);
    },
    //下推荐确认
    showDownRec(data) {
      this.unrecForm.data = data;
      this.unrecForm.vid = data.vid;
      this.unrecForm.reason = "";
      this.unrecForm.customReason = "";
      this.unrecDialogVisible = true;
    },
    //上推荐确认
    showUpRec(data) {
      this.$confirm("是否确定上推荐", "提示")
        .then(() => {
          this.addWhite(data.vid, data.aid).then(res => {
            if (res.data.vids.length) {
              data.recStatus = 1;
              this.workList = this.workList.concat([]);
            } else {
              this.$message.error("推荐失败");
            }
          });
        })
        .catch(() => {});
    },
    //批量取消C类确认
    showBatchCancelC(data) {
      if (this.selection && this.selection.length) {
        this.$confirm("是否确定批量取消C类", "提示")
          .then(() => {
            this.batchPassWork(this.selection);
          })
          .catch(() => {});
      } else {
        this.$message("请先选中作品");
        return;
      }
    },
    //取消C类
    showCancelC(data) {
      this.$confirm("是否确定取消C类", "提示")
        .then(() => {
          this.batchPassWork([data]);
        })
        .catch(() => {});
    },
    //批量恢复
    showBatchRecovery() {
      if (this.selection && this.selection.length) {
        this.$confirm("是否确定批量恢复", "提示")
          .then(() => {
            this.batchPassWork(this.selection);
          })
          .catch(() => {});
      } else {
        this.$message("请先选中作品");
        return;
      }
    },
    //恢复已下架作品
    showRecovery(data) {
      this.recoveryForm.vid = data.vid;
      this.recoveryForm.aid = data.aid;
      this.recoveryForm.reason = "";
      this.recoveryDialogVisible = true;
    },
    //彻底删除
    showDelete(data) {
      this.$confirm("是否确定删除作品", "提示")
        .then(() => {
          this.deleteWork(data.vid);
        })
        .catch(() => {});
    },
    //编辑作品
    editWork() {
      this.dialogLoading = true;
      this.$http
        .post(api.UpdateVideo, {
          vid: this.workForm.vid,
          title: this.workForm.name,
          coverurl: this.workForm.coverurl,
          category:
            (this.workForm.categoryId && [this.workForm.categoryId]) || []
        })
        .then(res => {
          this.dialogLoading = false;
          this.editDialogVisible = false;
          if (res.data.head.status == 1) {
            this.$message.success("编辑成功");
            this.getData();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.editDialogVisible = false;
          this.dialogLoading = false;
          this.$message.error("编辑失败");
        });
    },
    //下架作品
    downWork(action) {
      var reason = "";
      reason =
        this.downForm.reason == "自定义输入"
          ? this.downForm.customReason
          : this.downForm.reason;
      if (!reason) {
        this.$message.error("下架原因不能为空");
        return;
      }
      this.dialogLoading = true;
      this.$http
        .post(api.BatchAuditWorks, {
          vid: [this.downForm.vid],
          audit_uid: this.user.id,
          audit_operation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
          mark: reason,
          category:
            (this.downForm.categoryId && [this.downForm.categoryId]) || []
        })
        .then(res => {
          this.dialogLoading = false;
          this.downDialogVisible = false;
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            if (this.workList.length == 1) {
              this.workPage && this.workPage--;
            }
            this.getTotal();
            this.getData();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.downDialogVisible = false;
          this.$message.error("服务器错误，操作失败");
        });
    },
    //标记C类
    setC() {
      var reason = "",
        unRecreason = "";
      reason = this.cForm.reason;
      unRecreason =
        this.cForm.unRecreason == "自定义输入"
          ? this.cForm.customReason
          : this.cForm.unRecreason;
      if (!reason) {
        this.$message.error("C类原因不能为空");
        return;
      }
      // if(this.cForm.recommendStatus != 1 && !unRecreason) {
      //   this.$message.error('不推荐原因不能为空');
      //   return;
      // }
      this.dialogLoading = true;
      // 先触发评级
      let param = Object.assign({ operUid: this.user.id }, this.cForm);
      this.$http
        .post(api.SetSingleWorkGrade, {
          videoGradeBaseBo: param
        })
        .then(d => {
          if (d.data.head.status == 1) {
            this.$http
              .post(api.BatchAuditWorks, {
                vid: [this.cForm.vid],
                audit_uid: this.user.id,
                audit_operation: 1, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
                mark: reason,
                category:
                  (this.cForm.categoryId && [this.cForm.categoryId]) || []
              })
              .then(res => {
                this.dialogLoading = false;
                this.cDialogVisible = false;
                if (res.data.head.status == 1) {
                  this.$message.success("操作成功");
                  if (this.workList.length == 1) {
                    this.workPage && this.workPage--;
                  }
                  if (this.cForm.recommendStatus == 1) {
                    this.addWhite(this.cForm.vid, this.cForm.aid);
                  } else {
                    this.delWhite(this.cForm.vid, unRecreason);
                  }
                  this.getTotal();
                  this.getData();
                } else {
                  this.$message.error(res.data.head.msg);
                }
              })
              .catch(err => {
                console.log(err);
                this.dialogLoading = false;
                this.cDialogVisible = false;
                this.$message.error("服务器错误，操作失败");
              });
          } else {
            this.$message.error(d.data.head.msg || "评级失败");
          }
          this.dialogLoading = false;
        })
        .catch(err => {
          this.$message.error("服务器错误，操作失败");
          this.dialogLoading = false;
        });
    },
    addcomment(data, vid, vname) {
      if (data && Array.isArray(data)) {
        this.getVuser(data.length, users => {
          let comList = [];
          data.forEach((d, i) => {
            let com = {
              count:
                i == 0
                  ? Math.floor(Math.random() * 5 + 1)
                  : i == 1
                  ? Math.floor(Math.random() * 5 + 6)
                  : Math.floor(Math.random() * 20 + 11),
              commentid: d,
              uid: users[i].uid
            };
            comList.push(com);
          });
          this.$http
            .post(api.addCommentTask, { data: comList, vid, vname })
            .then();
        });
      }
    },
    //审核通过
    passWork() {
      var reason = "";
      reason =
        this.passForm.reason == "自定义输入"
          ? this.passForm.customReason
          : this.passForm.reason;
      if (this.passForm.recommendStatus != 1 && !reason) {
        this.$message.error("不推荐理由不能为空");
        return;
      }
      this.dialogLoading = true;
      // 先触发评级
      let param = Object.assign({ operUid: this.user.id }, this.passForm);
      this.$http
        .post(api.SetSingleWorkGrade, {
          videoGradeBaseBo: param
        })
        .then(d => {
          if (d.data.head.status == 1) {
            this.$http
              .post(api.BatchAuditWorks, {
                vid: [this.passForm.vid],
                audit_uid: this.user.id,
                audit_operation: 0, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
                category:
                  (this.passForm.categoryId && [this.passForm.categoryId]) || []
              })
              .then(res => {
                this.dialogLoading = false;
                this.passDialogVisible = false;
                if (res.data.head.status == 1) {
                  this.$message.success("操作成功");
                  debugger;
                  // 加入评论
                  this.addcomment(
                    this.passForm.comment,
                    this.passForm.vid,
                    this.passForm.vname
                  );
                  if (this.workList.length == 1) {
                    this.workPage && this.workPage--;
                  }
                  this.getTotal();
                  this.getData();
                  if (this.passForm.recommendStatus == 1) {
                    this.addWhite(this.passForm.vid, this.passForm.aid);
                  } else {
                    this.delWhite(this.passForm.vid, reason);
                  }
                } else {
                  this.$message.error(res.data.head.msg);
                }
              })
              .catch(err => {
                console.log(err);
                this.passDialogVisible = false;
                this.$message.error("服务器错误，操作失败");
              });
          } else {
            this.$message.error(d.data.head.msg || "评级失败");
          }
          this.dialogLoading = false;
        })
        .catch(err => {
          this.$message.error("服务器错误，操作失败");
          this.dialogLoading = false;
        });
    },
    //添加到白名单
    addWhite(vid, aid) {
      var av = {};
      if (typeof vid == "object") {
        av = vid;
      } else {
        av = [
          {
            aid: aid,
            vid: vid
          }
        ];
      }
      return this.$http
        .post(api.addWhite, {
          av: av,
          operUid: this.user.id
        })
        .then(res => {
          if (res.data.vids && res.data.vids.length) {
            this.pushRecStatus(res.data.vids, 1);
          }
          if (this.activeName == "unrec") {
            if (this.workList.length == 1) {
              this.workPage && this.workPage--;
            }
            this.countBlackList();
            this.getUnrecList();
          }
          return res;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，添加到白名单失败");
          return Promise.reject();
        });
    },
    delWhite(vid, reason) {
      if (typeof vid == "object") {
        vid = vid;
      } else {
        vid = [vid];
      }
      this.dialogLoading = true;
      return this.$http
        .post(api.delWhite, {
          vid: vid,
          operUid: this.user.id,
          reason: reason
        })
        .then(() => {
          this.dialogLoading = false;
          this.unrecDialogVisible = false;
          this.pushRecStatus([vid], 2);
          if (this.activeName == "rec") {
            if (this.workList.length == 1) {
              this.workPage && this.workPage--;
            }
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.unrecDialogVisible = false;
          this.$message.error("服务器错误，删除白名单失败");
          return Promise.reject();
        });
    },
    //通知java端推荐状态
    pushRecStatus(vids, recommendStatus) {
      return this.$http
        .post(api.BatchUpDownRecommendByVids, {
          vid: vids,
          recommendStatus: recommendStatus //作品是否已上推荐  1=上了推荐  2=下了推荐
        })
        .catch(err => {
          console.log(err);
        });
    },
    //恢复作品
    recovery(ifC) {
      var reason = "";
      if (ifC) {
        reason =
          this.recoveryForm.reason == "自定义输入"
            ? this.recoveryForm.customReason
            : this.recoveryForm.reason;
        if (!reason) {
          this.$message.error("原因不能为空");
          return;
        }
      }
      this.dialogLoading = true;
      this.$http
        .post(api.BatchAuditWorks, {
          vid: [this.recoveryForm.vid],
          audit_uid: this.user.id,
          audit_operation: ifC ? 1 : 0, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
          mark: reason
        })
        .then(res => {
          this.dialogLoading = false;
          this.recoveryDialogVisible = false;
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            if (this.workList.length == 1) {
              this.workPage && this.workPage--;
            }
            this.getTotal();
            this.getData();

            //默认上推荐
            if (this.recAidMap[this.recoveryForm.aid]) {
              this.addWhite(this.recoveryForm.vid);
            }
            this.getTotal();
            this.getData();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.recoveryDialogVisible = false;
          this.$message.error("服务器错误，操作失败");
        });
    },
    //删除作品
    deleteWork(vid) {
      this.dialogLoading = true;
      this.$http
        .post(api.BatchDeleteWorks, {
          vid: [vid],
          audit_uid: this.user.id
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            if (this.workList.length == 1) {
              this.workPage && this.workPage--;
            }
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.$message.error("服务器错误，操作失败");
        });
    },
    //确认下推荐
    confirmUnrec() {
      var reason =
        this.unrecForm.reason == "自定义输入"
          ? this.unrecForm.customReason
          : this.unrecForm.reason;
      if (!reason) {
        this.$message.error("原因不能为空");
        return;
      }
      this.delWhite(this.unrecForm.vid, reason).then(() => {
        this.unrecForm.data.recStatus = 2;
        this.workList = this.workList.concat([]);
      });
    },
    //批量通过
    batchPassWork(dataList) {
      var vids = [];
      var av = [];
      dataList.map(item => {
        vids.push(item.vid);
        av.push({
          vid: item.vid,
          aid: item.aid
        });
      });
      this.$http
        .post(api.BatchAuditWorks, {
          vid: vids,
          audit_uid: this.user.id,
          audit_operation: 0 //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        })
        .then(res => {
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            this.getTotal();
            this.getData();
            this.addWhite(av);
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
        });
    },
    //批量下架
    batchDownWork() {
      var reason = "";
      reason =
        this.downForm.reason == "自定义输入"
          ? this.downForm.customReason
          : this.downForm.reason;
      if (!reason) {
        this.$message.error("下架原因不能为空");
        return;
      }
      this.dialogLoading = true;
      this.$http
        .post(api.BatchAuditWorks, {
          vid: this.downForm.vids,
          audit_uid: this.user.id,
          audit_operation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
          mark: reason
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            this.batchDownDialogVisible = false;
            this.getTotal();
            this.getData();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
          this.batchDownDialogVisible = false;
          this.dialogLoading = false;
        });
    },
    //批量下架C类作品
    batchUpDownVideos() {
      var reason = "";
      reason =
        this.downForm.reason == "自定义输入"
          ? this.downForm.customReason
          : this.downForm.reason;
      if (!reason) {
        this.$message.error("下架原因不能为空");
        return;
      }
      this.dialogLoading = true;
      this.$http
        .post(api.BatchUpDownVideos, {
          vid: this.downForm.vids,
          oper_uid: this.user.id,
          auditOperation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
          mark: reason
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.$message.success("操作成功");
            this.batchDownDialogVisible = false;
            this.downDialogVisible = false;
            this.getTotal();
            this.getData();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
          this.batchDownDialogVisible = false;
          this.downDialogVisible = false;
          this.dialogLoading = false;
        });
    },
    //触发文件选择器
    triggerInput() {
      this.$refs.file.click();
    },
    //上传图片到阿里云
    uploadImage(e) {
      this.$util.upload(e.target.files[0]).then(url => {
        if (this.activeName == "vsetTab") {
          this.vsetForm.coverurl = url;
        } else {
          this.workForm.coverurl = url;
        }
      });
    },
    // 获取曝光评级
    getWorkGrade() {
      this.$http.post(api.ListAllWorkGradeConf).then(data => {
        // 改变现实
        if (data.data && data.data.infos) {
          data.data.infos.forEach(wg => {
            if (wg.gradeType == "GRADE_B") this.defaultGrade = wg.gradeType;
            wg.name =
              wg.gradeType.replace("GRADE_", "") + "级:" + wg.gradeValue + "次";
          });
          this.workgrade = data.data.infos;
        }
      });
    },
    commentChange(comment) {
      let coms = [];
      if (comment && comment.length > 0) {
        comment.forEach(c => {
          let com = this.commentlist.find(cl => c == cl.comment);
          if (!com) {
            coms.push(c);
          }
        });
      }
      this.addcoms = coms.join("\n");
    }
  }
};
</script>
<style lang="scss">
.work_audit_manage_wrapper {
  padding: 30px 20px;
  min-width: 890px;

  .search_wrap {
    display: flex;
    align-items: center;

    .el-input {
      margin-left: 20px;
      width: 200px;
    }

    .el-input-group--append {
      width: 260px;
    }
  }

  .tab_wrap {
    margin-top: 20px;
    padding: 0 20px;
    background-color: #fff;

    .tab_item {
      padding: 20px;
    }
  }

  th,
  td {
    text-align: center !important;

    button {
      margin: 10px;
    }
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

  .table_expand {
    text-align: left;
    font-size: 0;
  }

  .table_expand label {
    margin-right: 20px;
    color: #99a9bf;
  }

  .table_expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
}
</style>
