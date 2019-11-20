<template>
  <div class="activity_work_audit_manage_wrapper">
    <div class="search_wrap">
      <el-date-picker v-model="dateRange" @change="dateChange" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
      <el-select v-model="workSearchType" placeholder="请选择" slot="prepend">
        <el-option v-for="item in workSearchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-input v-if="activeName=='rec' || activeName=='unrec'" v-model="searchKey" placeholder="请输入内容" disabled>
        <el-button slot="append" icon="el-icon-search" disabled></el-button>
      </el-input>
      <el-input v-else v-model="searchKey" @keydown.native="keydown" placeholder="请输入内容">
        <el-button @click='searchWork' slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button type="primary" icon="el-icon-refresh" circle style="margin-left: 20px" @click="refresh"></el-button>
    </div>
    <el-tabs v-loading="loading" class="tab_wrap" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane class="tab_item" label="待审核" name="waiteToAudit">
        <el-button type="success" size="mini" @click="showBatchPass">批量通过</el-button>
        <el-button type="danger" size="mini" @click="showBatchDown">批量下架</el-button>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='waiteToAudit'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="活动ACID">
                  <span v-if="props.row.business_source">{{props.row.business_source.source_id}}</span>
                </el-form-item>
                <el-form-item label="活动名称">
                  <span>{{props.row.video.actTitle}}</span>
                </el-form-item>
                <el-form-item label="用户UID">
                  <span v-if="props.row.publisher">{{props.row.publisher.uid}}</span>
                </el-form-item>
                <el-form-item label="用户昵称">
                  <span v-if="props.row.publisher">{{props.row.publisher.nickname}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="作品名">
            <template slot-scope="props">{{props.row.video.title}}<br>{{'#'+props.row.video.actTitle}}</template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.video.coverurl" style="max-height: 160px;max-width: 250px;display: block;margin:auto">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video.url" :key="props.row.video.coverurl">
                <VideoPlayer :extendOptions='{poster: props.row.video.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.video.url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.video.pubtime && $util.formatFullTime(props.row.video.pubtime,'yyyy-MM-dd hh:mm')}}</div>
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
        <el-pagination layout="total, prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="已通过" name="passed">
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='passed'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="活动ACID">
                  <span v-if="props.row.business_source">{{props.row.business_source.source_id}}</span>
                </el-form-item>
                <el-form-item label="活动名称">
                  <span>{{props.row.video.actTitle}}</span>
                </el-form-item>
                <el-form-item label="用户UID">
                  <span v-if="props.row.publisher">{{props.row.publisher.uid}}</span>
                </el-form-item>
                <el-form-item label="用户昵称">
                  <span v-if="props.row.publisher">{{props.row.publisher.nickname}}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span v-if="props.row.audit">{{ userIdNameMap[props.row.audit.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="操作时间">
                  <span v-if="props.row.audit">{{props.row.audit.audit_time && $util.formatFullTime(props.row.audit.audit_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="作品名">
            <template slot-scope="props">{{props.row.video.title}}<br>{{'#'+props.row.video.actTitle}}</template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.video.coverurl" style="max-height: 160px;max-width: 250px;display: block;margin:auto">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video.url" :key="props.row.video.coverurl">
                <VideoPlayer :extendOptions='{poster: props.row.video.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.video.url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.video.pubtime && $util.formatFullTime(props.row.video.pubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showC(props.row)">C类</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="total, prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="C类列表" name="C">
        <el-button type="success" size="mini" @click="showBatchCancelC">批量取消C类</el-button>
        <el-button type="danger" size="mini" @click="showBatchDown">批量下架</el-button>
        <el-select v-model="mark" size="mini" placeholder="请选择" @change="changeCMark" clearable style="margin-left: 10px">
          <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='C'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="活动ACID">
                  <span v-if="props.row.business_source">{{props.row.business_source.source_id}}</span>
                </el-form-item>
                <el-form-item label="活动名称">
                  <span>{{props.row.video.actTitle}}</span>
                </el-form-item>
                <el-form-item label="用户UID">
                  <span v-if="props.row.publisher">{{props.row.publisher.uid}}</span>
                </el-form-item>
                <el-form-item label="用户昵称">
                  <span v-if="props.row.publisher">{{props.row.publisher.nickname}}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span v-if="props.row.audit">{{ userIdNameMap[props.row.audit.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="操作时间">
                  <span v-if="props.row.audit">{{props.row.audit.audit_time && $util.formatFullTime(props.row.audit.audit_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="作品名">
            <template slot-scope="props">{{props.row.video.title}}<br>{{'#'+props.row.video.actTitle}}</template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.video.coverurl" style="max-height: 160px;max-width: 250px;display: block;margin:auto">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video.url" :key="props.row.video.coverurl">
                <VideoPlayer :extendOptions='{poster: props.row.video.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.video.url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.video.pubtime && $util.formatFullTime(props.row.video.pubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit.audit_mark" label="C类原因">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showEdit(props.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="showDown(props.row)">下架</el-button>
              <el-button size="mini" type="danger" @click="showCancelC(props.row)">取消C类</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="total, prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="非C类下架列表" name="down">
        <el-button type="success" size="mini" @click="showBatchRecovery">批量恢复</el-button>
        <el-select v-model="mark" size="mini" placeholder="请选择" @change="changeCMark" clearable style="margin-left: 10px">
          <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='down'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="活动ACID">
                  <span v-if="props.row.business_source">{{props.row.business_source.source_id}}</span>
                </el-form-item>
                <el-form-item label="活动名称">
                  <span>{{props.row.video.actTitle}}</span>
                </el-form-item>
                <el-form-item label="用户UID">
                  <span v-if="props.row.publisher">{{props.row.publisher.uid}}</span>
                </el-form-item>
                <el-form-item label="用户昵称">
                  <span v-if="props.row.publisher">{{props.row.publisher.nickname}}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span v-if="props.row.audit">{{ userIdNameMap[props.row.audit.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="操作时间">
                  <span v-if="props.row.audit">{{props.row.audit.audit_time && $util.formatFullTime(props.row.audit.audit_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="作品名">
            <template slot-scope="props">{{props.row.video.title}}<br>{{'#'+props.row.video.actTitle}}</template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.video.coverurl" style="max-height: 160px;max-width: 250px;display: block;margin:auto">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video.url" :key="props.row.video.coverurl">
                <VideoPlayer :extendOptions='{poster: props.row.video.coverurl,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.video.url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.video.pubtime && $util.formatFullTime(props.row.video.pubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit.audit_mark" label="下架原因">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showRecovery(props.row)">恢复作品</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="total, prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane class="tab_item" label="C类下架列表" name="cDown">
        <el-button type="success" size="mini" @click="showBatchRecovery">批量恢复</el-button>
        <el-select v-model="mark" size="mini" placeholder="请选择" @change="changeCMark" clearable style="margin-left: 10px">
          <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-table :data="workList" @selection-change="selectionChange" v-if="activeName=='cDown'">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table_expand">
                <el-form-item label="类型">
                  <span>{{ !props.row.video_type ? '视频' : '音频' }}</span>
                </el-form-item>
                <el-form-item label="活动ACID">
                  <span v-if="props.row.business_source">{{props.row.business_source.source_id}}</span>
                </el-form-item>
                <el-form-item label="活动名称">
                  <span>{{props.row.video.actTitle}}</span>
                </el-form-item>
                <el-form-item label="用户UID">
                  <span v-if="props.row.publisher">{{props.row.publisher.uid}}</span>
                </el-form-item>
                <el-form-item label="用户昵称">
                  <span v-if="props.row.publisher">{{props.row.publisher.nickname}}</span>
                </el-form-item>
                <el-form-item label="操作人">
                  <span v-if="props.row.audit">{{ userIdNameMap[props.row.audit.audit_uid] }}</span>
                </el-form-item>
                <el-form-item label="操作时间">
                  <span v-if="props.row.audit">{{props.row.audit.audit_time && $util.formatFullTime(props.row.audit.audit_time*1000,'yyyy-MM-dd hh:mm')}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="作品名">
            <template slot-scope="props">{{props.row.video.title}}<br>{{'#'+props.row.video.actTitle}}</template>
          </el-table-column>
          <el-table-column label="作品封面" width="250">
            <template slot-scope="props">
              <img :src="props.row.video.coverurl" style="max-height: 160px;max-width: 250px;display: block;margin:auto">
            </template>
          </el-table-column>
          <el-table-column label="作品内容" width="300">
            <template slot-scope="props">
              <div v-if="props.row.video.url" :key="props.row.video.coverurl">
                <VideoPlayer :extendOptions='{poster: props.row.cover_url,controlBar: {remainingTimeDisplay:false, durationDisplay:false, timeDivider:false}}' :url='props.row.video.url' :height="160"></VideoPlayer>
              </div>
              <div v-else>播放地址为空</div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="150">
            <template slot-scope="props">
              <div>{{props.row.video.pubtime && $util.formatFullTime(props.row.video.pubtime,'yyyy-MM-dd hh:mm')}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="audit.audit_mark" label="下架原因">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="props">
              <el-button size="mini" type="primary" @click="showRecovery(props.row)">恢复作品</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="total, prev, pager, next, jumper" :total="workTotal" :current-page="workPage" :page-size="workPageSize" @current-change="changeWorkPage">
        </el-pagination>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editWork">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 下架作品 -->
    <el-dialog title="下架" :visible.sync="downDialogVisible">
      <el-form v-loading="dialogLoading" :model="downForm">
        <el-form-item label="下架原因" label-width="100px">
          <el-select v-model="downForm.reason" placeholder="请选择">
            <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downForm.reason=='自定义输入'" label="原因" label-width="100px">
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
            <el-option v-for="item in downReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="downForm.reason=='自定义输入'" label="原因" label-width="100px">
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
        <el-form-item label="原因" label-width="100px">
          <el-select v-model="cForm.reason" placeholder="请选择">
            <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setC">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 恢复 -->
    <el-dialog title="恢复" :visible.sync="recoveryDialogVisible">
      <el-form :model="recoveryForm" v-loading="dialogLoading">
        <el-form-item label="原因" label-width="100px">
          <el-select v-model="recoveryForm.reason" placeholder="请选择">
            <el-option v-for="item in cReasonList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="recoveryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="recovery(true)">置为C类</el-button>
        <el-button type="primary" @click="recovery()">直接通过</el-button>
      </div>
    </el-dialog>
    <div style="line-height: 0;height:0;">
      <input ref="file" type="file" style="visibility: hidden" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg" @change="uploadImage">
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import api from '@/api';
import status from '@/api/status';
import VideoPlayer from '@/components/VideoPlayer';
export default {
  name: 'ActivityWrokAuditManage',
  components: {
    VideoPlayer
  },
  data() {
    return {
      loading: false,
      dialogLoading: false,
      dateRange: null,
      workSearchOptions: [{
          label: '作品名',
          value: 1
        },
        {
          label: '活动ID',
          value: 2
        },
        {
          label: '用户ID',
          value: 3
        }
      ],
      workSearchType: 1,
      searchKey: '',
      confirmSearchKey: '',
      activeName: 'waiteToAudit',
      workList: [],
      workTotal: undefined,
      workPage: 1,
      workPageSize: 10,
      workForm: {
        name: '',
        coverurl: '',
      },
      downForm: {
        reason: '',
        customReason: '',
      },
      cForm: {
        reason: '',
        customReason: '',
      },
      passForm: {
        reason: '',
        customReason: '',
      },
      recoveryForm: {
        reason: ''
      },
      downReasonList: null,
      cReasonList: null,
      editDialogVisible: false,
      downDialogVisible: false,
      batchDownDialogVisible: false,
      cDialogVisible: false,
      passDialogVisible: false,
      recoveryDialogVisible: false,
      batchDownDialogVisible: false,
      mark: '',
      switchFlag: -1,
      userIdNameMap: {},
    }
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapState('global', ['categoryList', 'CSPECIAL', 'UNRECOMMEND', 'CANCEL'])
  },
  created() {
    var now = new Date();
    this.getTotal();
    this.getData();
    this.getUserList();
    this.downReasonList = this.CANCEL;
    this.cReasonList = this.CSPECIAL.slice(0, -1);
  },
  methods: {
    ...mapActions('global', ['getCategoryList']),
    refresh() {
      this.changeTab();
    },
    changeTab(tab) {
      this.workTotal = 0;
      this.workPage = 1;
      this.workList = [];
      this.mark = '';
      this.getTotal();
      this.getData();
    },
    //选择日期范围
    dateChange(range) {
      if(range) {
        this.beginTime = range && Math.floor((+range[0]) / 1000) || 0;
        this.endTime = range && Math.floor((+range[1]) / 1000) || 0;
        this.endTime += 24 * 60 * 60;
      } else {
        this.startTime = undefined;
        this.endTime = undefined;
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
      this.getData();
    },
    //C类列表原因
    changeCMark() {
      this.workList = [];
      this.workPage = 1;
      this.workTotal = 0;
      this.searchKey = '';
      this.confirmSearchKey = '';
      this.getTotal();
      this.getData();
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
      this.mark = '';
      this.getTotal();
      this.getData();
    },
    //获取运营后台用户列表
    getUserList() {
      this.$http.get(api.getUserList).then((res) => {
        res.data.list.map((item) => {
          this.userIdNameMap[item.id] = item.nickName;
        });
      });
    },
    //获取总数量
    getTotal() {
      var option = {
        ctime_begin: this.workStarTime || 0,
        ctime_end: this.workEndTime || 0,
        source_type: 2
      }
      var url = api.CountWorksByStatus2;
      switch (this.activeName) {
        case 'waiteToAudit':
          option.audit_status = 0; //查询作品审核状态  0=待审核  1=已通过,但不标记  2=已下架 3=已通过,但标记 4=已通过(不管是否标记) 5=c类已下架 6=全部
          break;
        case 'passed':
          option.audit_status = 1;
          break;
        case 'C':
          option.audit_status = 3;
          option.mark = this.mark;
          if(this.mark) {
            url = api.CountWorksByMark2;
          }
          break;
        case 'down':
          option.audit_status = 2;
          option.mark = this.mark;
          if(this.mark) {
            url = api.CountWorksByMark2;
          }
          break;
        case 'cDown':
          option.audit_status = 5;
          option.mark = this.mark;
          if(this.mark) {
            url = api.CountWorksByMark2;
          }
          break;
      }
      if (this.workSearchType == 1) {
        option.video_title = this.confirmSearchKey;
      } else if(this.workSearchType == 2) {
        option.source_id = this.confirmSearchKey || 0;
      } else {
        option.owner_uid = this.confirmSearchKey || 0;
      }
      this.$http.post(url, option).then((res) => {
        if (res.data.head.status == 1) {
          this.workTotal = res.data.total || 0;
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，获取作品总数失败');
      });
    },
    //获取列表
    getData() {
      var option = {
        page_no: this.workPage,
        page_size: this.workPageSize,
        ctime_begin: this.workStarTime || 0,
        ctime_end: this.workEndTime || 0,
        source_type: 2
      }
      var url = api.ListWorksByStatus2;
      switch (this.activeName) {
        case 'waiteToAudit':
          option.audit_status = 0; //查询作品审核状态  0=待审核  1=已通过,但不标记  2=已下架 3=已通过,但标记 4=已通过(不管是否标记) 5=c类已下架 6=全部
          break;
        case 'passed':
          option.audit_status = 1;
          break;
        case 'C':
          option.audit_status = 3;
          option.mark = this.mark;
          if(this.mark) {
            url = api.ListWorksByMark2;
          }
          break;
        case 'down':
          option.audit_status = 2;
          option.mark = this.mark;
          if(this.mark) {
            url = api.ListWorksByMark2;
          }
          break;
        case 'cDown':
          option.audit_status = 5;
          option.mark = this.mark;
          if(this.mark) {
            url = api.ListWorksByMark2;
          }
          break;
      }
      if (this.workSearchType == 1) {
        option.video_title = this.confirmSearchKey;
      } else if(this.workSearchType == 2) {
        option.source_id = this.confirmSearchKey || 0;
      } else {
        option.owner_uid = this.confirmSearchKey || 0;
      }
      this.loading = true;
      this.$http.post(url, option).then((res) => {
        this.loading = false;
        if (res.data.head.status == 1) {
          this.workList = res.data.infos || [];
          var actIds = [];
          this.workList.map((item) => {
            if(item.business_source && item.business_source.source_id) {
              actIds.push(item.business_source.source_id);
            }
          });
          if(actIds.length) {
            this.getActTitle(actIds).then((result)=>{
              this.workList.map((item)=>{
                item.video.actTitle = ''
                result.list.map((obj)=>{
                  if(obj.id == item.business_source.source_id) {
                    item.video.actTitle = obj.act_title;
                  }
                });
              });
              this.workList = this.workList.concat([]);
            });
          }
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$message.error('服务器错误，获取作品列表失败');
      });
    },
    getActTitle(actIds) {
      return this.$http.get(api.getActByIds, {
        params: {
          actIds: actIds
        }
      }).then((res) => {
        return res.data;
      }).catch((err) => {
        console.log(err);
        this.$message.error('获取活动标题失败');
      });
    },
    //显示作品编辑弹框
    showEdit(data) {
      this.toEditData = data;
      this.workForm.vid = data.video.vid;
      this.workForm.name = data.video.title;
      this.workForm.coverurl = data.video.coverurl;
      this.editDialogVisible = true;
    },
    //批量通过确认
    showBatchPass() {
      if (this.selection && this.selection.length) {
        this.$confirm('是否确定批量通过', '提示').then(() => {
          var vid = [];
          this.selection.map((item) => {
            vid.push(item.video.vid);
          });
          this.batchPassWork(vid);
        }).catch(() => {});
      } else {
        this.$message('请先选中作品');
        return;
      }
    },
    //批量下架
    showBatchDown() {
      if (this.selection && this.selection.length) {
        this.batchDownDialogVisible = true;
        var vids = [];
        this.selection.map((item) => {
          vids.push(item.video.vid);
        });
        this.downForm.vids = vids;
      } else {
        this.$message('请先选中作品');
        return;
      }
    },
    //下架
    showDown(data) {
      if (this.activeName == 'C') {
        this.downForm.vids = [data.video.vid];
      } else {
        this.downForm.vid = data.video.vid;
      }
      this.downForm.reason = '';
      this.downForm.customReason = '';
      this.downDialogVisible = true;
    },
    //标记为C类
    showC(data) {
      this.cForm.vid = data.video.vid;
      this.cForm.aid = data.author.aid;
      this.cForm.reason = '';
      this.cDialogVisible = true;
    },
    //审核通过
    showPass(data) {
      this.passForm.aid = data.author.aid;
      this.passForm.vid = data.video.vid;
      this.$confirm('是否确定通过', '提示').then(() => {
        this.passWork();
      }).catch(() => {});
    },
    //批量取消C类确认
    showBatchCancelC(data) {
      if (this.selection && this.selection.length) {
        this.$confirm('是否确定批量取消C类', '提示').then(() => {
          var vid = [];
          this.selection.map((item) => {
            vid.push(item.video.vid);
          });
          this.batchPassWork(vid);
        }).catch(() => {});
      } else {
        this.$message('请先选中作品');
        return;
      }
    },
    //取消C类
    showCancelC(data) {
      this.$confirm('是否确定取消C类', '提示').then(() => {
        this.batchPassWork([data.video.vid]);
      }).catch(() => {});
    },
    //批量恢复
    showBatchRecovery() {
      if (this.selection && this.selection.length) {
        this.$confirm('是否确定批量恢复', '提示').then(() => {
          var vid = [];
          this.selection.map((item) => {
            vid.push(item.video.vid);
          });
          this.batchPassWork(vid);
        }).catch(() => {});
      } else {
        this.$message('请先选中作品');
        return;
      }
    },
    //恢复已下架作品
    showRecovery(data) {
      this.recoveryForm.vid = data.video.vid;
      this.recoveryForm.reason = '';
      this.recoveryDialogVisible = true;
    },
    //编辑作品
    editWork() {
      this.dialogLoading = true;
      this.$http.post(api.UpdateVideo, {
        vid: this.workForm.vid,
        title: this.workForm.name,
        coverurl: this.workForm.coverurl,
      }).then((res) => {
        this.dialogLoading = false;
        this.editDialogVisible = false;
        if (res.data.head.status == 1) {
          this.$message.success('编辑成功');
          // this.toEditData.video.title = this.workForm.name;
          // this.toEditData.video.coverurl = this.workForm.coverurl;
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.editDialogVisible = false;
        this.dialogLoading = false;
        this.$message.error('编辑失败');
      });
    },
    //下架作品
    downWork() {
      var reason = '';
      reason = this.downForm.reason == '自定义输入' ? this.downForm.customReason : this.downForm.reason;
      if (!reason) {
        this.$message.error('下架原因不能为空');
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: [this.downForm.vid],
        audit_uid: this.user.id,
        audit_operation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        mark: reason,
      }).then((res) => {
        this.dialogLoading = false;
        this.downDialogVisible = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          if (this.workList.length == 1) {
            this.workPage && this.workPage--;
          }
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.downDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //标记C类
    setC() {
      var reason = '';
      reason = this.cForm.reason == '自定义输入' ? this.cForm.customReason : this.cForm.reason;
      if (!reason) {
        this.$message.error('下架原因不能为空');
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: [this.cForm.vid],
        audit_uid: this.user.id,
        audit_operation: 1, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        mark: reason,
      }).then((res) => {
        this.dialogLoading = false;
        this.cDialogVisible = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          if (this.workList.length == 1) {
            this.workPage && this.workPage--;
          }
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.cDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //审核通过
    passWork() {
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: [this.passForm.vid],
        audit_uid: this.user.id,
        audit_operation: 0, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
      }).then((res) => {
        this.dialogLoading = false;
        this.passDialogVisible = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          if (this.workList.length == 1) {
            this.workPage && this.workPage--;
          }
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.passDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //恢复作品
    recovery(ifC) {
      var reason = '';
      if (ifC) {
        reason = this.recoveryForm.reason == '自定义输入' ? this.recoveryForm.customReason : this.recoveryForm.reason;
        if (!reason) {
          this.$message.error('原因不能为空');
          return;
        }
      }
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: [this.recoveryForm.vid],
        audit_uid: this.user.id,
        audit_operation: ifC ? 1 : 0, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        mark: reason,
      }).then((res) => {
        this.dialogLoading = false;
        this.recoveryDialogVisible = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          if (this.workList.length == 1) {
            this.workPage && this.workPage--;
          }
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.recoveryDialogVisible = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //删除作品
    deleteWork(vid) {
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: [vid],
        audit_uid: this.user.id
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          if (this.workList.length == 1) {
            this.workPage && this.workPage--;
          }
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.$message.error('服务器错误，操作失败');
      });
    },
    //批量通过
    batchPassWork(vids) {
      this.$http.post(api.BatchAuditWorks, {
        vid: vids,
        audit_uid: this.user.id,
        audit_operation: 0, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
      }).then((res) => {
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
      });
    },
    //批量下架
    batchDownWork() {
      var reason = '';
      reason = this.downForm.reason == '自定义输入' ? this.downForm.customReason : this.downForm.reason;
      if (!reason) {
        this.$message.error('下架原因不能为空');
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.BatchAuditWorks, {
        vid: this.downForm.vids,
        audit_uid: this.user.id,
        audit_operation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        mark: reason
      }).then((res) => {
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          this.batchDownDialogVisible = false;
          this.dialogLoading = false;
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
        this.batchDownDialogVisible = false;
        this.dialogLoading = false;
      });
    },
    //批量下架C类作品
    batchUpDownVideos() {
      var reason = '';
      reason = this.downForm.reason == '自定义输入' ? this.downForm.customReason : this.downForm.reason;
      if (!reason) {
        this.$message.error('下架原因不能为空');
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.BatchUpDownVideos, {
        vid: this.downForm.vids,
        oper_uid: this.user.id,
        auditOperation: 3, //作品审核状态  0=通过  1=通过且标记  2=通过但取消标记  3=下架  5=恢复上架
        mark: reason
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.$message.success('操作成功');
          this.batchDownDialogVisible = false;
          this.downDialogVisible = false;
          this.getTotal();
          this.getData();
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.$message.error('服务器错误，操作失败');
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
      this.$util.upload(e.target.files[0]).then((url) => {
        if (this.activeName == 'vsetTab') {
          this.vsetForm.coverurl = url;
        } else {
          this.workForm.coverurl = url;
        }
      });
    }
  }
}

</script>
<style lang="scss">
.activity_work_audit_manage_wrapper {
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
    border-color: #409EFF;
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
