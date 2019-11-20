<template>
  <div class="activity_wrapper">
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
      <el-input v-model="searchKey" @keydown.native="keydown" placeholder="请输入搜索内容">
        <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <el-button type="primary" @click="showAdd">新建活动</el-button>
    </div>
    <el-table :data="dataList" style="margin-top: 20px;">
      <el-table-column prop="id" label="ACID" width="150"></el-table-column>
      <el-table-column prop="uid" label="操作人ID" width="150"></el-table-column>
      <el-table-column prop="act_title" label="活动标题" width="150"></el-table-column>
      <el-table-column prop="act_subtitle" label="活动副标题" width="150"></el-table-column>
      <el-table-column prop="authorStatInfo.subscribeCount" label="活动封面" width="200">
        <template slot-scope="props">
          <img
            v-if="props.row.act_img"
            :src="props.row.act_img"
            style="max-width: 200px;max-height: 140px;"
          >
          <div v-else>暂无图片</div>
        </template>
      </el-table-column>
      <el-table-column prop="act_detail" label="活动详情" width="200"></el-table-column>
      <el-table-column label="活动开始时间" width="150">
        <template
          slot-scope="props"
          v-if="props.row.begin_time"
        >{{$util.formatFullTime(props.row.begin_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" width="150">
        <template
          slot-scope="props"
          v-if="props.row.end_time"
        >{{$util.formatFullTime(props.row.end_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="抽奖时间" width="150">
        <template
          slot-scope="props"
          v-if="props.row.award_time"
        >{{$util.formatFullTime(props.row.award_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="150">
        <template
          slot-scope="props"
          v-if="props.row.create_time"
        >{{$util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
      </el-table-column>
      <el-table-column label="活动状态">
        <template slot-scope="props">
          <span v-if="props.row.act_status==-1">已停用</span>
          <span v-if="props.row.act_status==1">已结束</span>
          <span v-if="props.row.act_status==2">未开始</span>
          <span v-if="props.row.act_status==3">进行中</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="160">
        <template slot-scope="props">
          <el-button
            v-if="isAdmin || props.row.act_status!=3"
            size="mini"
            type="primary"
            @click="showEdit(props.row)"
          >编辑</el-button>
          <el-button
            v-if="user.name=='huangshang'"
            size="mini"
            type="danger"
            @click="showDelete(props.row)"
          >删除</el-button>
          <el-button size="mini" type="primary" @click="showAward(props.row)">奖品</el-button>
          <el-button
            v-if="props.row.act_status==-1 && props.row.now_time < props.row.end_time"
            size="mini"
            type="primary"
            @click="showStart(props.row)"
          >启动</el-button>
          <el-button
            v-if="props.row.act_status==2 || props.row.act_status==3"
            size="mini"
            type="danger"
            @click="showStop(props.row)"
          >停止</el-button>
          <el-button size="mini" type="primary" @click="showConfig(props.row)">配置</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="background-color: #fff">
      <el-pagination
        layout="total, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        @current-change="changePage"
      ></el-pagination>
    </div>
    <!-- 创建活动 -->
    <el-dialog title="创建活动" :visible.sync="addDialogVisible">
      <el-form ref="addForm" v-loading="dialogLoading" :model="addForm" :rules="rules">
        <el-form-item label="活动标题" label-width="100px" prop="actTitle">
          <el-input v-model="addForm.actTitle" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动副标题" label-width="100px" prop="actSubTitle">
          <el-input v-model="addForm.actSubTitle" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div>
              <img
                v-if="imgUrl"
                ref="addImg"
                :src="imgUrl"
                class="avatar"
                @click="triggerInput"
                @load="onImgLoad"
              >
              <i v-else class="el-icon-plus avatar-uploader-icon" @click="triggerInput"></i>
            </div>
          </div>
          <div style="color:#999">图片尺寸为750*400</div>
        </el-form-item>
        <el-form-item label="活动详情" label-width="100px" prop="actDetail">
          <el-input type="textarea" v-model="addForm.actDetail" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动时间" label-width="100px" prop="dateRange">
          <el-date-picker
            v-model="addForm.dateRange"
            @change="addFormDateChange"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="抽奖时间" label-width="100px" prop="awardTime">
          <el-date-picker
            v-model="addForm.awardTime"
            @change="awardTimeChage"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑活动 -->
    <el-dialog title="编辑活动" :visible.sync="editDialogVisible">
      <el-form ref="editForm" v-loading="dialogLoading" :model="editForm" :rules="rules">
        <el-form-item label="活动标题" label-width="100px" prop="actTitle">
          <el-input v-model="editForm.actTitle" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动副标题" label-width="100px" prop="actSubTitle">
          <el-input v-model="editForm.actSubTitle" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <div>
              <img
                v-if="imgUrl"
                ref="editImg"
                :src="imgUrl"
                class="avatar"
                @click="triggerInput"
                @load="onImgLoad"
              >
              <i v-else class="el-icon-plus avatar-uploader-icon" @click="triggerInput"></i>
            </div>
          </div>
          <div style="color:#999">图片尺寸为750*400</div>
        </el-form-item>
        <el-form-item label="活动详情" label-width="100px" prop="actDetail">
          <el-input type="textarea" v-model="editForm.actDetail" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="活动时间" label-width="100px" prop="dateRange">
          <el-date-picker
            v-model="editForm.dateRange"
            @change="editFormDateChange"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="抽奖时间" label-width="100px" prop="awardTime">
          <el-date-picker
            v-model="editForm.awardTime"
            @change="awardTimeChage"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateEditForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 活动奖品列表 -->
    <el-dialog title="活动奖品" :visible.sync="actAwardDialogVisible">
      <el-button type="primary" @click="showAddActAward">添加奖品</el-button>
      <el-table :data="actAwardList" style="margin-top: 20px;">
        <el-table-column label="奖项顺序">
          <template slot-scope="props">{{props.row.weight || 0}}</template>
        </el-table-column>
        <el-table-column prop="id" label="奖项ID" width="150"></el-table-column>
        <el-table-column prop="rule_name" label="奖项名称" width="150"></el-table-column>
        <el-table-column prop="goods_name_alias" label="奖品名称" width="150"></el-table-column>
        <el-table-column prop="award_sponsor" label="赞助商" width="150"></el-table-column>
        <el-table-column label="奖品封面" width="200">
          <template slot-scope="props">
            <img
              v-if="props.row.goods_url_alias"
              :src="props.row.goods_url_alias"
              style="max-width: 200px;max-height: 140px;"
            >
            <div v-else>暂无图片</div>
          </template>
        </el-table-column>
        <el-table-column label="奖品数量">
          <template slot-scope="props">{{props.row.award_num || 0}}</template>
        </el-table-column>
        <el-table-column label="中奖模式" width="150">
          <template slot-scope="props">
            <div
              v-if="props.row.award_type==1 && props.row.award_subtype==1"
            >前{{props.row.award_type_number}}名中奖</div>
            <div v-else-if="props.row.award_type==1">第{{props.row.award_type_number}}名中奖</div>
            <div v-else>{{props.row.award_type_number}}%概率</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template
            slot-scope="props"
          >{{props.row.create_time && $util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="150">
          <template
            slot-scope="props"
          >{{props.row.update_time && $util.formatFullTime(props.row.update_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="props">
            <el-button size="mini" type="primary" @click="showEditActAward(props.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="showDeleteActAward(props.row)">删除</el-button>
            <el-button size="mini" type="primary" @click="showLucky(props.row)">中奖名单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="awardTotal"
          :current-page="awardPage"
          :page-size="awardPageSize"
          @current-change="awarChangePage"
        ></el-pagination>
      </div>
    </el-dialog>
    <!-- 新增奖品弹框 -->
    <el-dialog title="添加活动奖品" :visible.sync="addAwardDialogVisible">
      <el-form
        ref="addActAwardForm"
        v-loading="dialogLoading"
        :model="addActAwardForm"
        :rules="awardRules"
      >
        <el-form-item label="奖项顺序" label-width="100px" prop="weight">
          <el-input-number v-model="addActAwardForm.weight" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="奖项名称" label-width="100px" prop="ruleName">
          <el-input v-model="addActAwardForm.ruleName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="奖品名称" label-width="100px" prop="goodsNameAlias">
          <el-input v-model="addActAwardForm.goodsNameAlias" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="赞助商" label-width="100px" prop="awardSponsor">
          <el-input v-model="addActAwardForm.awardSponsor" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="奖品总数" label-width="100px" prop="awardNum">
          <el-input-number v-model="addActAwardForm.awardNum" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="奖品封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <img v-if="imgUrl" :src="imgUrl" class="avatar" @click="triggerInput">
            <i v-else class="el-icon-plus avatar-uploader-icon" @click="triggerInput"></i>
          </div>
        </el-form-item>
        <el-form-item label="中奖模式" label-width="100px" prop="actAwardType">
          <el-select v-model="addActAwardForm.actAwardType" placeholder="请选择">
            <el-option :key="1" label="喜欢数排名" :value="1"></el-option>
            <el-option :key="2" label="概率中奖" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="addActAwardForm.actAwardType==1">
          <el-form-item label="排名模式" label-width="100px" prop="actAwardSubType">
            <el-select v-model="addActAwardForm.actAwardSubType" placeholder="请选择">
              <el-option :key="1" label="前多少名中奖" :value="1"></el-option>
              <el-option :key="2" label="第几名中奖" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名次" label-width="100px" prop="awardTypeNumber">
            <el-input-number v-model="addActAwardForm.awardTypeNumber" :min="1"></el-input-number>
          </el-form-item>
        </template>
        <template v-else>
          <!-- <el-form-item label="概率值" label-width="100px" prop="awardTypeNumber">
            <el-input-number v-model="addActAwardForm.awardTypeNumber" :min="1"></el-input-number>
          </el-form-item>-->
          <el-form-item label="概率设定" label-width="100px" prop="awardTypeChance">
            <div v-for="(item,index) in addActAwardForm.chanceAwardCheck" :key="index">
              <el-checkbox
                v-model="item.check"
                :label="item.text"
                @change="checkchange($event,index)"
              ></el-checkbox>
              <el-input-number
                v-model="item.value"
                :disabled="!item.check"
                size="mini"
                :min="1"
                :max="100"
              ></el-input-number>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAwardDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateAddAwardForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑奖品弹框 -->
    <el-dialog title="编辑活动奖品" :visible.sync="editAwardDialogVisible">
      <el-form
        ref="editActAwardForm"
        v-loading="dialogLoading"
        :model="editActAwardForm"
        :rules="awardRules"
      >
        <el-form-item label="奖项顺序" label-width="100px" prop="weight">
          <el-input-number v-model="editActAwardForm.weight" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="奖项名称" label-width="100px" prop="ruleName">
          <el-input v-model="editActAwardForm.ruleName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="奖品名称" label-width="100px" prop="goodsNameAlias">
          <el-input v-model="editActAwardForm.goodsNameAlias" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="赞助商" label-width="100px" prop="awardSponsor">
          <el-input v-model="editActAwardForm.awardSponsor" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="奖品总数" label-width="100px" prop="awardNum">
          <el-input-number v-model="editActAwardForm.awardNum" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="奖品封面" label-width="100px">
          <div class="avatar-uploader" :show-file-list="false">
            <img v-if="imgUrl" :src="imgUrl" class="avatar" @click="triggerInput">
            <i v-else class="el-icon-plus avatar-uploader-icon" @click="triggerInput"></i>
          </div>
        </el-form-item>
        <el-form-item label="中奖模式" label-width="100px" prop="actAwardType">
          <el-select v-model="editActAwardForm.actAwardType" placeholder="请选择">
            <el-option :key="1" label="喜欢数排名" :value="1"></el-option>
            <el-option :key="2" label="概率中奖" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="editActAwardForm.actAwardType==1">
          <el-form-item label="排名模式" label-width="100px" prop="actAwardSubType">
            <el-select v-model="editActAwardForm.actAwardSubType" placeholder="请选择">
              <el-option :key="1" label="前多少名中奖" :value="1"></el-option>
              <el-option :key="2" label="第几名中奖" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名次" label-width="100px" prop="awardTypeNumber">
            <el-input-number v-model="editActAwardForm.awardTypeNumber" :min="1"></el-input-number>
          </el-form-item>
        </template>
        <template v-else>
          <!-- <el-form-item label="概率值" label-width="100px" prop="awardTypeNumber">
            <el-input-number v-model="editActAwardForm.awardTypeNumber" :min="1"></el-input-number>
          </el-form-item>-->
          <el-form-item label="概率设定" label-width="100px" prop="awardTypeChance">
            <div v-for="(item,index) in editActAwardForm.chanceAwardCheck" :key="index">
              <el-checkbox
                v-model="item.check"
                :label="item.text"
                @change="checkchange($event,index)"
              ></el-checkbox>
              <el-input-number
                v-model="item.value"
                :disabled="!item.check"
                size="mini"
                :min="1"
                :max="100"
              ></el-input-number>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAwardDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateEditAwardForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 配置活动 -->
    <el-dialog title="配置活动" :visible.sync="configDialogVisible">
      <el-form ref="configForm" v-loading="dialogLoading" :model="configForm" :rules="awardRules">
        <el-form-item label="先审后发" label-width="100px">
          <el-switch v-model="configForm.switchFlag" active-text="是" inactive-text="否"></el-switch>
        </el-form-item>
        <el-form-item label="作品发布上限" label-width="100px">
          <el-input-number v-model="configForm.publishVideoNumOneUid"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setActConfig">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 中奖名单列表 -->
    <el-dialog title="中奖名单" :visible.sync="luckyDialogVisible">
      <el-button type="primary" @click="showAddLucky">添加</el-button>
      <el-table :data="luckyList" style="margin-top: 20px;">
        <el-table-column prop="lucky_uid" label="用户UID" width="150"></el-table-column>
        <el-table-column prop="contact" label="联系方式" width="200"></el-table-column>
        <el-table-column label="兑换操作人" width="150">
          <template slot-scope="props">{{userIdNameMap[props.row.present_uid]}}</template>
        </el-table-column>
        <el-table-column label="抽奖操作人" width="150">
          <template slot-scope="props">{{userIdNameMap[props.row.create_uid]}}</template>
        </el-table-column>
        <el-table-column label="兑换状态" width="100">
          <template slot-scope="props">{{presentStateIdMap[props.row.present_state]}}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template
            slot-scope="props"
          >{{props.row.create_time && $util.formatFullTime(props.row.create_time*1000, 'yyyy-MM-dd hh:mm')}}</template>
        </el-table-column>
      </el-table>
      <div style="background-color: #fff">
        <el-pagination
          layout="total, prev, pager, next, jumper"
          :total="luckyTotal"
          :current-page="luckyPage"
          :page-size="luckyPageSize"
          @current-change="luckyChangePage"
        ></el-pagination>
      </div>
    </el-dialog>
    <!-- 新增中奖记录 -->
    <el-dialog title="新增中奖记录" :visible.sync="addLuckyDialogVisible">
      <el-form
        :model="addLuckyForm"
        ref="addLuckyForm"
        v-loading="dialogLoading"
        :rules="addLuckyRules"
      >
        <el-form-item label="用户ID" label-width="100px" prop="uid">
          <el-input v-model="addLuckyForm.uid"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addLuckyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="validateAddLuckyForm">确 定</el-button>
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
import { mapState } from "vuex";
import api from "@/api";
import STATUS from "@/api/status";
// CREATE TABLE `tb_act` (
//   `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id,自增',
//   `uid` bigint(20) DEFAULT '0' COMMENT '创建用户uid',
//   `act_status` int(4) DEFAULT '1' COMMENT '活动状态 -1=已停用 1=已启用  2=已过期',
//   `act_title` varchar(100) NOT NULL DEFAULT '' COMMENT '活动主标题',
//   `act_subtitle` varchar(100) NOT NULL DEFAULT '' COMMENT '活动副标题',
//   `act_img` varchar(200) NOT NULL DEFAULT '' COMMENT '活动图地址',
//   `act_category_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '活动的分类id',
//   `act_detail` text NOT NULL COMMENT '活动详情',
//   `begin_time` int(11) NOT NULL DEFAULT '0' COMMENT '活动开始时间，单位：秒',
//   `end_time` int(11) NOT NULL DEFAULT '0' COMMENT '活动结束时间，单位：秒',
//   `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间,单位：秒',
//   `update_time` int(11) NOT NULL DEFAULT '0' COMMENT '修改时间,单位：秒',
//   `oper_uid` bigint(20) DEFAULT '0' COMMENT '运营后台操作人id',
//   PRIMARY KEY (`id`),
//   KEY `idx_ctime` (`create_time`) USING BTREE,
//   KEY `idx_update_time` (`update_time`) USING BTREE,
//   KEY `idx_uid` (`uid`) USING BTREE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

//活动状态 -2=已删除  -1=已停用 1=已过期 2=未开始 3=进行中
export default {
  name: "ActivityManage",
  data() {
    return {
      workSearchOptions: [
        {
          label: "活动名称",
          value: 1
        },
        {
          label: "活动ID",
          value: 2
        },
        {
          label: "操作人ID",
          value: 3
        }
      ],
      workSearchType: 1,
      loading: true,
      luckyLoading: true,
      dataList: [],
      luckyList: [],
      total: 0,
      page: 1,
      pageSize: 4,
      awardTotal: 0,
      awardPage: 1,
      awardPageSize: 4,
      luckyPage: 1,
      luckyPageSize: 6,
      luckyTotal: 0,
      dateRange: null,
      searchKey: "",
      userList: [],
      userIdNameMap: {},
      addForm: {
        operUid: undefined,
        actTitle: "",
        actSubTitle: "",
        actImg: "",
        actDetail: "",
        dateRange: null,
        beginTime: 0,
        endTime: 0,
        awardTime: null
      },
      editForm: {
        operUid: undefined,
        actTitle: "",
        actSubTitle: "",
        actImg: "",
        actDetail: "",
        dateRange: null,
        beginTime: 0,
        endTime: 0,
        awardTime: null
      },
      awardChanceCheck: [
        {
          text: "喜欢数TOP10%作品,中奖概率为",
          value: 0,
          extend: "n1_10",
          check: false
        },
        {
          text: "喜欢数TOP11%-30%作品,中奖概率为",
          value: 0,
          extend: "n11_30",
          check: false
        },
        {
          text: "喜欢数TOP31%-60%作品,中奖概率为",
          value: 0,
          extend: "n31_60",
          check: false
        },
        {
          text: "喜欢数TOP61%-80%作品,中奖概率为",
          value: 0,
          extend: "n61_80",
          check: false
        },
        {
          text: "喜欢数TOP81%-100%作品,中奖概率为",
          value: 0,
          extend: "n81_100",
          check: false
        }
      ],
      addActAwardForm: {
        weight: 1,
        ruleName: "",
        goodsNameAlias: "",
        awardSponsor: "",
        awardNum: 1,
        actAwardType: 1,
        actAwardSubType: 1,
        awardTypeNumber: 1,
        awardTypeChance: []
      },
      editActAwardForm: {
        weight: 1,
        ruleName: "",
        goodsNameAlias: "",
        awardSponsor: "",
        awardNum: 1,
        actAwardType: 1,
        actAwardSubType: 1,
        awardTypeNumber: 1,
        awardTypeChance: []
      },
      configForm: {
        switchFlag: false,
        publishVideoNumOneUid: 0
      },
      addLuckyForm: {
        uid: ""
      },
      dialogLoading: false,
      editDialogVisible: false,
      addDialogVisible: false,
      rules: {
        actTitle: [
          { required: true, message: "请输入活动标题", trigger: "blur" },
          { min: 1, max: 10, message: "长度在 1 到 10 个字符", trigger: "blur" }
        ],
        actSubTitle: [
          { required: true, message: "请输入活动副标题", trigger: "blur" },
          { min: 1, max: 16, message: "长度在 1 到 16 个字符", trigger: "blur" }
        ],
        actDetail: [
          { required: true, message: "请输入活动规则", trigger: "blur" }
        ],
        dateRange: [
          {
            type: "array",
            required: true,
            message: "请选择日期",
            trigger: "change"
          }
        ],
        awardTime: [
          { required: true, message: "请选择抽奖时间", trigger: "blur" }
        ]
      },
      awardRules: {
        ruleName: [
          { required: true, message: "请输入奖项名称", trigger: "blur" }
        ],
        goodsNameAlias: [
          { required: true, message: "请输入奖品名称", trigger: "blur" }
        ],
        awardSponsor: [
          { required: true, message: "请输入奖品名称", trigger: "blur" }
        ],
        goodsNameAlias: [
          { required: true, message: "请输入奖品名称", trigger: "blur" }
        ],
        goodsNameAlias: [
          { required: true, message: "请输入奖品名称", trigger: "blur" }
        ]
      },
      addLuckyRules: {
        uid: [{ required: true, message: "请输入中奖用户ID", trigger: "blur" }]
      },
      imgUrl: "",
      awardList: [],
      actAwardList: [],
      actAwardMap: {},
      actAwardDialogVisible: false,
      addAwardDialogVisible: false,
      editAwardDialogVisible: false,
      configDialogVisible: false,
      luckyDialogVisible: false,
      addLuckyDialogVisible: false,
      presentStateIdMap: {
        1: "未领奖",
        2: "已领奖",
        3: "已过期"
      }
    };
  },
  computed: {
    ...mapState("user", ["user"]),
    isAdmin() {
      for (var i = 0; i < this.user.roleList.length; i++) {
        if (this.user.roleList[i].role_id == 1) {
          return true;
        }
      }
      return false;
    }
  },
  created() {
    this.getTotal();
    this.getData();
    this.getUserList();
    // this.getAwardList();
  },
  methods: {
    //选择日期范围
    dateChange(range) {
      if (range) {
        this.startTime = Math.floor(+range[0] / 1000) || 0;
        this.endTime = Math.floor(+range[1] / 1000) || 0;
        this.endTime += 24 * 60 * 60;
      } else {
        this.startTime = undefined;
        this.endTime = undefined;
      }
    },
    //选择日期时间范围（创建活动）
    addFormDateChange(range) {
      if (range) {
        this.addForm.beginTime = Math.floor(+range[0] / 1000) || 0;
        this.addForm.endTime = Math.floor(+range[1] / 1000) || 0;
        if (
          this.addForm.beginTime &&
          this.addForm.beginTime == this.addForm.endTime
        ) {
          this.addForm.endTime += 24 * 60 * 60;
        }
      } else {
        this.addForm.beginTime = undefined;
        this.addForm.endTime = undefined;
      }
    },
    //选择日期时间范围（修改活动）
    editFormDateChange(range) {
      if (range) {
        this.editForm.beginTime = Math.floor(+range[0] / 1000) || 0;
        this.editForm.endTime = Math.floor(+range[1] / 1000) || 0;
        if (
          this.editForm.beginTime &&
          this.editForm.beginTime == this.editForm.endTime
        ) {
          this.editForm.endTime += 24 * 60 * 60;
        }
      } else {
        this.editForm.beginTime = undefined;
        this.editForm.endTime = undefined;
      }
    },
    awardTimeChage(date) {
      if (this.addDialogVisible) {
        this.addForm.confirmAwardTime = Math.floor(+date / 1000) || 0;
      } else {
        this.editForm.confirmAwardTime = Math.floor(+date / 1000) || 0;
      }
    },
    //活动页码
    changePage(page) {
      this.page = page;
      this.getData();
    },
    //奖品库页码
    awarChangePage(page) {
      this.awardPage = page;
      this.getAwardList();
    },
    //中奖名单页码
    luckyChangePage(page) {
      this.luckyPage = page;
      this.getLuckyList();
    },
    //回车搜索
    keydown(e) {
      if (e.keyCode == 108 || e.keyCode == 13) {
        this.search();
      }
    },
    refresh() {
      this.page = 1;
      this.total = 0;
      this.dataList = [];
      this.getTotal();
      this.getData();
    },
    //搜索
    search() {
      this.confirmSearchKey = this.searchKey;
      this.confirmStartTime = this.startTime;
      this.confrimEndTime = this.endTime;
      this.page = 1;
      this.total = 0;
      this.dataList = [];
      this.getTotal();
      this.getData();
    },
    //显示编辑弹框
    showEdit(data) {
      this.editDialogVisible = true;
      this.editForm.actId = data.id;
      this.editForm.actStatus = data.act_status;
      this.editForm.actTitle = data.act_title;
      this.editForm.actSubTitle = data.act_subtitle;
      this.imgUrl = data.act_img;
      this.editForm.actDetail = data.act_detail;
      this.editForm.beginTime = data.begin_time;
      this.editForm.endTime = data.end_time;
      this.editForm.dateRange = [
        new Date(data.begin_time * 1000),
        new Date(data.end_time * 1000)
      ];
      this.editForm.confirmAwardTime = data.award_time;
      this.editForm.awardTime =
        (data.award_time && new Date(data.award_time * 1000)) || null;
      this.imgDone = true;
    },
    //删除询问框
    showDelete(data) {
      this.$confirm("是否确定删除活动？", "提示")
        .then(() => {
          this.deleteActivity([data.id]);
        })
        .catch(() => {});
    },
    //启用询问框
    showStart(data) {
      this.$confirm("是否确定启动活动？", "提示")
        .then(() => {
          var now = (new Date().getTime() / 1000) >> 0;
          if (data.begin_time < now && data.end_time > now) {
            //已开始
            this.changeStatus([data.id], 3);
          } else if (data.end_time < now) {
            //已过期
            this.changeStatus([data.id], 1);
          } else if (data.begin_time > now) {
            //未开始
            this.changeStatus([data.id], 2);
          }
        })
        .catch(() => {});
    },
    //暂停询问框
    showStop(data) {
      this.$confirm("是否确定停止？", "提示")
        .then(() => {
          this.changeStatus([data.id], -1);
        })
        .catch(() => {});
    },
    //显示添加导出任务弹框
    showAdd() {
      this.addDialogVisible = true;
      this.addForm.actTitle = "";
      this.addForm.actSubTitle = "";
      this.addForm.actDetail = "";
      this.addForm.beginTime = 0;
      this.addForm.endTime = 0;
      this.addForm.awardTime = null;
      this.addForm.confirmAwardTime = 0;
      this.addForm.dateRange = null;
      this.imgUrl = "";
      this.imgDone = true;
    },
    //显示奖品弹框
    showAward(data) {
      this.nowActId = data.id;
      this.actAwardList = this.actAwardMap[data.id] || [];
      this.actAwardDialogVisible = true;
      this.getActAwardList(data.id);
    },
    showAddActAward() {
      this.addActAwardForm.weight = 1;
      this.addActAwardForm.ruleName = "";
      this.addActAwardForm.goodsNameAlias = "";
      this.addActAwardForm.awardSponsor = "";
      this.addActAwardForm.awardNum = 1;
      this.addActAwardForm.actAwardType = 1;
      this.addActAwardForm.actAwardSubType = 1;
      this.addActAwardForm.awardTypeNumber = 1;
      this.addActAwardForm.chanceAwardCheck = this.getChanceAwardCheck();
      this.imgUrl = "";
      this.addAwardDialogVisible = true;
    },
    showEditActAward(data) {
      this.editActAwardForm.id = data.id;
      this.editActAwardForm.weight = data.weight;
      this.editActAwardForm.ruleName = data.rule_name;
      this.editActAwardForm.goodsNameAlias = data.goods_name_alias;
      this.editActAwardForm.awardSponsor = data.award_sponsor;
      this.editActAwardForm.awardNum = data.award_num || 1;
      this.editActAwardForm.actAwardType = Number(data.award_type);
      this.editActAwardForm.actAwardSubType = Number(data.award_subtype);
      this.editActAwardForm.awardTypeNumber = data.award_type_number;
      this.editActAwardForm.chanceAwardCheck = this.getChanceAwardCheck(
        data.extend
      );
      this.imgUrl = data.goods_url_alias;
      this.editAwardDialogVisible = true;
    },
    getChanceAwardCheck(extend) {
      let chanceAwardCheck = Object.assign(this.awardChanceCheck);
      if (extend) {
        let checks = JSON.parse(extend);
        Object.keys(checks).forEach(k => {
          let _check = chanceAwardCheck.find(c => c.extend == k);
          if(_check){
            _check.check = true;
            _check.value = checks[k];
          }
        });
      }
      return chanceAwardCheck;
    },
    showDeleteActAward(data) {
      this.$confirm("是否确定删除该活动奖品？", "提示")
        .then(() => {
          this.deleteAward([data.id], 1);
        })
        .catch(() => {});
    },
    showConfig(data) {
      this.configDialogVisible = true;
      this.configForm.actId = data.id;
      this.configForm.switchFlag = false;
      this.configForm.publishVideoNumOneUid = 0;
      this.getActivityConfig(data.id);
    },
    showLucky(data) {
      this.luckyDialogVisible = true;
      this.nowRuleId = data.id;
      this.luckyPage = 1;
      this.getLuckyTotal();
      this.getLuckyList();
    },
    showAddLucky() {
      this.addLuckyDialogVisible = true;
      this.addLuckyForm.uid = "";
    },
    //获取运营后台用户列表
    getUserList() {
      this.$http.get(api.getUserList).then(res => {
        this.userList = res.data.list;
        res.data.list.map(item => {
          this.userIdNameMap[item.id] = item.nickName;
        });
      });
    },
    //获取活动数量
    getTotal() {
      var option = {
        beginTime: this.confirmStartTime,
        endTime: this.confrimEndTime
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else if (this.workSearchType == 2) {
        option.actId = this.confirmSearchKey;
      } else if (this.workSearchType == 3) {
        option.uid = this.confirmSearchKey;
      }
      this.$http
        .get(api.getActivityTotal, {
          params: option
        })
        .then(res => {
          if (res.data.status == STATUS.SUCCESS) {
            this.total = res.data.total;
          } else {
            this.$message.error("获取活动数量失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取列表总数失败");
        });
    },
    //获取活动列表
    getData() {
      var option = {
        beginTime: this.confirmStartTime,
        endTime: this.confrimEndTime,
        page: this.page,
        pageSize: this.pageSize
      };
      if (this.workSearchType == 1) {
        option.title = this.confirmSearchKey;
      } else if (this.workSearchType == 2) {
        option.actId = this.confirmSearchKey;
      } else if (this.workSearchType == 3) {
        option.uid = this.confirmSearchKey;
      }
      this.dataList = [];
      this.loading = true;
      this.$http
        .get(api.getActivityList, {
          params: option
        })
        .then(res => {
          this.loading = false;
          if (res.data.status == STATUS.SUCCESS) {
            this.dataList = res.data.list;
          } else {
            this.$message.error("获取活动列表失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message.error("服务器错误，获取活动列表失败");
        });
    },
    //获取活动奖品
    getActAwardList(actId) {
      this.actAwardList = [];
      this.$http
        .get(api.getActAwardList, {
          params: {
            actIds: actId
          }
        })
        .then(res => {
          if (res.data.status == STATUS.SUCCESS) {
            //当前活动奖品列表
            this.actAwardList = res.data.list || [];
          } else {
            this.$message.error("获取活动奖品列表失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取活动奖品列表失败");
        });
    },
    //获取中奖数量
    getLuckyTotal() {
      this.$http
        .get(api.getLuckyTotal, {
          params: {
            actId: this.nowActId,
            ruleId: this.nowRuleId
          }
        })
        .then(res => {
          if (res.data.status == STATUS.SUCCESS) {
            this.luckyTotal = res.data.total;
          } else {
            this.$message.error("获取列表数量失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，获取列表数量失败");
        });
    },
    //获取中奖列表
    getLuckyList() {
      this.luckyList = [];
      this.luckyLoading = true;
      this.$http
        .get(api.getLuckyList, {
          params: {
            actId: this.nowActId,
            ruleId: this.nowRuleId,
            page: this.luckyPage,
            pageSize: this.luckyPageSize
          }
        })
        .then(res => {
          this.luckyLoading = false;
          if (res.data.status == STATUS.SUCCESS) {
            this.luckyList = res.data.list;
          } else {
            this.$message.error("获取列表失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.luckyLoading = false;
          this.$message.error("服务器错误，获取列表失败");
        });
    },
    //验证添加表单
    validateAddForm() {
      console.log(this.addForm.actDetail);
      this.$refs["addForm"].validate(valid => {
        if (valid) {
          this.addActivity();
        } else {
          return false;
        }
      });
    },
    //验证编辑表单
    validateEditForm() {
      this.$refs["editForm"].validate(valid => {
        if (valid) {
          this.editActivity();
        } else {
          return false;
        }
      });
    },
    validateChanceCheck() {
      const chances = this.awardChanceCheck.filter(chance => chance.check);
      if (chances.length > 0) {
        let value = 0;
        chances.forEach(chance => {
          value += chance.value;
        });
        if (value == 100) return true;
      }
      this.$message.error("概率设置总和需为100%");
      return false;
    },
    //验证添加奖品表单
    validateAddAwardForm() {
      if (
        this.addActAwardForm.actAwardType == 1 ||
        (this.addActAwardForm.actAwardType == 2 && this.validateChanceCheck())
      ) {
        this.$refs["addActAwardForm"].validate(valid => {
          if (valid) {
            this.addActAward();
          } else {
            return false;
          }
        });
      }
      return false
    },
    //验证编辑奖品表单
    validateEditAwardForm() {
      if (
        this.editActAwardForm.actAwardType == 1 ||
        (this.editActAwardForm.actAwardType == 2 && this.validateChanceCheck())
      ) {
        this.$refs["editActAwardForm"].validate(valid => {
          if (valid) {
            this.editActAward();
          } else {
            return false;
          }
        });
      }
      return false
    },
    validateAddLuckyForm() {
      this.$refs["addLuckyForm"].validate(valid => {
        if (valid) {
          this.addLucky();
        } else {
          return false;
        }
      });
    },
    //添加活动
    addActivity() {
      if (this.imgUrl && !this.imgDone) {
        this.$message.error("图片尺寸不对");
        return;
      }
      if (this.addForm.endTime * 1000 < new Date().getTime()) {
        this.$message.error("活动结束时间不能早于当前时间");
        return;
      }
      if (this.addForm.confirmAwardTime < this.addForm.endTime) {
        this.$message.error("抽奖时间不能早于结束时间");
        return;
      }
      this.dialogLoading = true;
      this.$http.post(api.AddAct, {
        info: {
          uid: this.user.id,
          actTitle: this.addForm.actTitle,
          actSubTitle: this.addForm.actSubTitle,
          actImg: this.imgUrl,
          actDetail: this.addForm.actDetail,
          beginTime: this.addForm.beginTime,
          endTime: this.addForm.endTime,
          awardTime: this.addForm.confirmAwardTime,
          operUid: this.user.id,
        },
      }).then((res) => {
        this.dialogLoading = false;
        if (res.data.head.status == 1) {
          this.addDialogVisible = false;
          this.$message.success('添加活动成功');
          setTimeout(()=>{
            this.refresh();
          }, 1000);
        } else {
          this.$message.error(res.data.head.msg);
        }
      }).catch((err) => {
        console.log(err);
        this.dialogLoading = false;
        this.$message.error('服务器错误，添加失败');
      });
    },
    //编辑活动
    editActivity() {
      if (this.imgUrl && !this.imgDone) {
        this.$message.error("图片尺寸不对");
        return;
      }
      if (this.editForm.endTime * 1000 < new Date().getTime()) {
        this.$message.error("活动结束时间不能早于当前时间");
        return;
      }
      if (this.editForm.confirmAwardTime < this.editForm.endTime) {
        this.$message.error("抽奖时间不能早于结束时间");
        return;
      }
      this.dialogLoading = true;
      this.$http
        .post(api.UpdateAct, {
          info: {
            uid: this.user.id,
            actId: this.editForm.actId,
            actStatus: this.editForm.actStatus,
            actTitle: this.editForm.actTitle,
            actSubTitle: this.editForm.actSubTitle,
            actImg: this.imgUrl,
            actDetail: this.editForm.actDetail,
            beginTime: this.editForm.beginTime,
            endTime: this.editForm.endTime,
            awardTime: this.editForm.confirmAwardTime,
            operUid: this.user.id
          }
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.editDialogVisible = false;
            this.$message.success("编辑活动成功");
            this.refresh();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.$message.error("服务器错误，编辑失败");
        });
    },
    //删除活动
    deleteActivity(actIds) {
      this.$http
        .post(api.DeleteAct, {
          actId: actIds,
          operUid: this.user.id
        })
        .then(res => {
          if (res.data.head.status == 1) {
            this.$message.success("删除活动成功");
            this.refresh();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，删除失败");
        });
    },
    //更改活动状态
    changeStatus(actIds, actStatus) {
      this.$http
        .post(api.BatchChangeActStatus, {
          actId: actIds,
          actStatus: actStatus,
          operUid: this.user.id
        })
        .then(res => {
          if (res.data.head.status == 1 && !res.data.info.failNum) {
            this.$message.success("操作成功");
            this.refresh();
          } else {
            this.$message.error("操作失败");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
        });
    },
    //添加活动奖品
    addActAward() {
      if (!this.imgUrl) {
        this.$message.error("奖品图片不能为空");
        return;
      }
      var info = {
        actId: this.nowActId,
        weight: this.addActAwardForm.weight,
        ruleName: this.addActAwardForm.ruleName,
        goodsNameAlias: this.addActAwardForm.goodsNameAlias,
        awardSponsor: this.addActAwardForm.awardSponsor,
        awardNum: this.addActAwardForm.awardNum,
        actAwardType: this.addActAwardForm.actAwardType,
        awardTypeNumber: this.addActAwardForm.awardTypeNumber,
        goodsUrlAlias: this.imgUrl
      };
      if (this.addActAwardForm.actAwardType == 1) {
        info.actAwardSubType = this.addActAwardForm.actAwardSubType;
      } else {
        // 得到数据
        const chances = this.awardChanceCheck.filter(chance => chance.check);
        let extend = {};
        chances.forEach(chance => {
          extend[chance.extend] = chance.value;
        });
        info.extend = JSON.stringify(extend);
      }
      this.dialogLoading = true;
      this.$http
        .post(api.AddAwardRule, {
          info: info,
          operUid: this.user.id
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.addAwardDialogVisible = false;
            this.$message.success("操作成功");
            this.getActAwardList(this.nowActId);
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
          this.dialogLoading = false;
        });
    },
    //编辑活动奖品
    editActAward() {
      var info = {
        id: this.editActAwardForm.id,
        actId: this.nowActId,
        weight: this.editActAwardForm.weight,
        ruleName: this.editActAwardForm.ruleName,
        goodsNameAlias: this.editActAwardForm.goodsNameAlias,
        awardSponsor: this.editActAwardForm.awardSponsor,
        awardNum: this.editActAwardForm.awardNum,
        actAwardType: this.editActAwardForm.actAwardType,
        awardTypeNumber: this.editActAwardForm.awardTypeNumber,
        goodsUrlAlias: this.imgUrl
      };
      if (this.editActAwardForm.actAwardType == 1) {
        info.actAwardSubType = this.editActAwardForm.actAwardSubType;
      } else {
        // 得到数据
        const chances = this.awardChanceCheck.filter(chance => chance.check);
        let extend = {};
        chances.forEach(chance => {
          extend[chance.extend] = chance.value;
        });
        info.extend = JSON.stringify(extend);
      }
      this.dialogLoading = true;
      this.$http
        .post(api.UpdateAwardRule, {
          info: info,
          operUid: this.user.id
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.editAwardDialogVisible = false;
            this.$message.success("操作成功");
            this.getActAwardList(this.nowActId);
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
          this.dialogLoading = false;
        });
    },
    //删除活动奖品
    deleteAward(ids) {
      this.dialogLoading = true;
      this.$http
        .post(api.DeleteAwardRule, {
          actId: this.nowActId,
          ruleId: ids,
          operUid: this.user.id
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.actAwardList = this.actAwardList.filter(item => {
              if (ids.indexOf(item.id) > -1) {
                return false;
              }
              return true;
            });
            this.$message.success("操作成功");
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，操作失败");
          this.dialogLoading = false;
        });
    },
    //获取配置
    getActivityConfig(actId) {
      this.dialogLoading = true;
      this.$http
        .get(api.getActivityConfig, {
          params: {
            actId: actId
          }
        })
        .then(res => {
          if (res.data.list.length) {
            var json = JSON.parse(res.data.list[0].config_json);
            this.configForm.switchFlag = json.switchFlag == 1 ? true : false;
            this.configForm.publishVideoNumOneUid =
              json.publishVideoNumOneUid || 0;
          } else {
            this.configForm.switchFlag = false;
            this.configForm.publishVideoNumOneUid = 0;
          }
          this.dialogLoading = false;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("获取活动配置失败");
        });
    },
    //设置配置
    setActConfig() {
      this.$http
        .post(api.SetActConfig, {
          info: {
            operUid: this.user.id,
            actId: this.configForm.actId,
            config: {
              switchFlag: this.configForm.switchFlag ? 1 : 2,
              publishVideoNumOneUid: this.configForm.publishVideoNumOneUid
            }
          }
        })
        .then(res => {
          if (res.data.head.status == 1) {
            this.$message.success("设置成功");
            this.configDialogVisible = false;
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("服务器错误，设置失败");
          this.configDialogVisible = false;
        });
    },
    //添加中奖记录
    addLucky() {
      this.dialogLoading = true;
      this.$http
        .post(api.AddActLucky, {
          operUid: this.user.id,
          actId: this.nowActId,
          ruleId: this.nowRuleId,
          uid: this.addLuckyForm.uid
        })
        .then(res => {
          this.dialogLoading = false;
          if (res.data.head.status == 1) {
            this.addLuckyDialogVisible = false;
            this.$message.success("操作成功");
            this.luckyPage = 1;
            this.getLuckyTotal();
            this.getLuckyList();
          } else {
            this.$message.error(res.data.head.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.dialogLoading = false;
          this.$message.error("服务器错误，操作失败");
        });
    },
    //上传图片到阿里云
    uploadImage(e) {
      this.imgDone = false;
      this.$util.upload(e.target.files[0]).then(url => {
        this.imgUrl = url;
      });
    },
    triggerInput() {
      this.$refs.file.click();
    },
    onImgLoad() {
      var ref = null;
      if (this.addDialogVisible) {
        ref = this.$refs.addImg;
      } else if (this.editDialogVisible) {
        ref = this.$refs.editImg;
      }
      if (ref.naturalWidth != 750 || ref.naturalHeight != 400) {
        this.imgDone = false;
        this.$message.error("图片尺寸不对");
      } else {
        this.imgDone = true;
      }
    },
    checkchange(e, a) {}
  }
};
</script>
<style lang="scss">
.activity_wrapper {
  position: relative;
  padding: 30px 20px;
  min-width: 890px;

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
}
</style>
