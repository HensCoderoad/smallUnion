<template>
  <div class="work_audit_manage_wrapper1">
    <ym-page
      v-if="config"
      :interface="config.interfc"
      :optcode="config.optcode"
      :fields="config.fields"
      :page="config.page"
      :group="config.group||{}"
      :muticheck="config.muticheck"
    />
  </div>
  <!-- <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>-->
</template>
<script>
import api from "@/api";
import mock from "@/mock";
import YmPage from "../components/Ym/YmPage";
export default {
  data() {
    return {
      tabModal: "0",
      configdata: {
        sort: {
          optcode: 31,
          fields: [
            {
              field: "oper_uid",
              name: "操作人ID",
              showtable: 0,
              showlabel: 0
            },
            {
              field: "category_id",
              name: "分类ID",
              showtable: 0,
              showlabel: 0
            },
            {
              field: "category_name",
              name: "分类名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "cover_url",
              name: "封面图",
              showtable: 1,
              showlabel: 1,
              ctrltype: 3 //图片类型
            },
            {
              field: "weight",
              name: "权重",
              showtable: 1,
              showlabel: 1,
              ctrltype: 2 //数字
            },
            {
              field: "create_time",
              name: "创建时间",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "update_time",
              name: "更新时间",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "category_status",
              name: "分类状态",
              showtable: 1,
              showlabel: 0,
              ctrltype: 4,
              radios: [
                { value: "AlbumStatus_deleted", text: "已删除" },
                { value: "AlbumStatus_stopped", text: "回收站" }
              ]
            }
          ],
          interfc: {
            "1": {
              path: mock.ListCategory,
              type: "success",
              name: "查询",
              param: []
            },
            "2": {
              path: mock.ListCategory,
              name: "新增",
              param: []
            },
            "4": {
              path: mock.ListCategory,
              name: "修改",
              param: []
            },
            "8": {
              path: mock.ListCategory,
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
        },
        tag: {
          optcode: 31,
          fields: [
            {
              field: "oper_uid",
              name: "操作人ID",
              showtable: 0,
              showlabel: 0
            },
            { field: "tag_id", name: "标签ID", showtable: 1, showlabel: 0 },
            {
              field: "tag_name",
              name: "标签名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "tag_status",
              name: "标签状态",
              showtable: 1,
              showlabel: 0,
              ctrltype: 4,
              radios: [
                { value: "AlbumStatus_deleted", text: "已删除" },
                { value: "AlbumStatus_stopped", text: "回收站" }
              ]
            },
            {
              field: "weight",
              name: "权重",
              showtable: 1,
              showlabel: 1,
              ctrltype: 2
            },
            {
              field: "create_time",
              name: "创建时间",
              showtable: 1,
              showlabel: 0
            },
            {
              field: "update_time",
              name: "更新时间",
              showtable: 1,
              showlabel: 0
            }
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
        },
        audit: {
          name: "词库列表",
          optcode: 11,
          fields: [
            { field: "word", name: "敏感词", showtable: 1, showlabel: 1 }
          ],
          interfc: {
            "1": {
              path: api.GetWordList,
              method: "POST",
              name: "查询",
              rep: "words",
              repMap: "result.map(i=>i={word:i})",
              param: { pageid: "@pageid", count: "@count" }
            },
            "2": {
              path: api.AddWord,
              method: "POST",
              name: "新增",
              param: {
                word: "@data@word"
              }
            },
            "8": {
              path: api.DelWord,
              method: "POST",
              name: "删除",
              param: {
                word: "@data@word"
              }
            }
          }
        },
        approval: {
          optcode: 11,
          fields: [
            {
              field: "AuditAuthorListType",
              name: "名单类别",
              showtable: 1,
              showlabel: 1,
              ctrltype: 4,
              radios: [
                { value: "AUDIT_AUTHOR_WHITE", text: "白名单" },
                { value: "AUDIT_AUTHOR_BLACK", text: "黑名单" }
              ]
            },
            {
              field: "author_name",
              name: "认证号名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "create_time",
              name: "添加时间",
              showtable: 1,
              showlabel: 0
            }
          ],
          interfc: {
            "1": {
              path: api.ListAuthorWhiteBlack,
              method: "POST",
              name: "查询",
              rep: "infos",
              repMap:
                "result.map(i=>{i.AuditAuthorListType=i.AuditAuthorListType||'AUDIT_AUTHOR_WHITE';return i})",
              param: {
                auditAuthorListType: "AUDIT_AUTHOR_ALL",
                page_no: "@pageid",
                page_size: "@count"
              }
            },
            "2": {
              path: api.AddWord,
              method: "POST",
              name: "新增",
              param: {
                word: "@data@word"
              }
            },
            "8": {
              path: api.DelWord,
              method: "POST",
              name: "删除",
              param: {
                word: "@data@word"
              }
            }
          }
        },
        log: {
          name: "操作日志",
          optcode: 11,
          fields: [
            {
              field: "menu_id",
              name: "菜单功能号",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "menuname",
              name: "菜单",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "action_name",
              name: "操作名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "user_id",
              name: "用户ID",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "nickname",
              name: "用户昵称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "create_time",
              name: "时间",
              showtable: 1,
              showlabel: 1,
              condition: 1,
              ctrltype: 6
            },
            {
              field: "param",
              name: "参数",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "logstatus",
              name: "状态",
              showtable: 1,
              showlabel: 1,
              ctrltype: 4,
              radios: [
                { value: "1", text: "成功" },
                { value: "0", text: "失败", type: "danger" }
              ]
            }
          ],
          interfc: {
            "1": {
              path: api.getLog,
              method: "POST",
              name: "查询",
              icon: "el-icon-search",
              type: "primary",
              rep: "list",
              repMap:
                "result.map(i=>{i.menuname=(sto.state.user.userMenuList.find(m=>m.path==i.menu_id).name);return i})",
              param: {
                createtime: "@data@create_time",
                vid: "@data@vid"
              }
            }
          }
        },
        grade: {
          optcode: 11,
          fields: [
            {
              field: "video_title",
              name: "作品名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "cover_url",
              name: "作品封面",
              showtable: 1,
              showlabel: 1,
              ctrltype: 3
            },
            {
              field: "video_url",
              name: "作品内容",
              showtable: 1,
              showlabel: 1,
              ctrltype: 7
            },
            {
              field: "publish_time",
              name: "发布时间",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "menu_id",
              name: "曝光级别",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "menu_id",
              name: "当前曝光",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "menu_id",
              name: "转化率",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "menu_id",
              name: "完播率",
              showtable: 1,
              showlabel: 1
            }
          ],
          interfc: {
            "1": {
              path: api.getLog,
              method: "POST",
              name: "查询",
              rep: "list",
              repMap:
                "result.map(i=>{i.menuname=(sto.state.user.userMenuList.find(m=>m.path==i.menu_id).name);return i})",
              param: {
                auditAuthorListType: "AUDIT_AUTHOR_ALL",
                page_no: "@pageid",
                page_size: "@count"
              }
            }
          }
        },
        comments: {
          optcode: 11,
          fields: [
            {
              field: "nickname",
              name: "评论人",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "content",
              name: "评论内容",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "time",
              name: "评论时间",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "project",
              name: "评论作品",
              showtable: 1,
              showlabel: 1
            }
          ],
          interfc: {
            "1":  {
              path: api.getGrade,
              method: "POST",
              name: "查询",
              rep: "infoList",
              param: {
                auditAuthorListType: "AUDIT_AUTHOR_ALL",
                page_no: "@pageid",
                page_size: "@count"
              }
            }
          }
        },
        level: {
          name: "曝光级别",
          optcode: 5,
          fields: [
            {
              field: "grade",
              name: "作品评级",
              showtable: 1,
              showlabel: 0
            },
            {
              field: "gradeType",
              name: "作品评级",
              showtable: 0,
              showlabel: 0
            },
            {
              field: "gradeValue",
              name: "曝光量",
              showtable: 1,
              showlabel: 1
            }
          ],
          interfc: {
            "1": {
              path: api.ListAllWorkGradeConf,
              method: "POST",
              name: "查询",
              rep: "infos",
              repMap:
                "result.map(i=>{i.grade=i.gradeType.substr(6,1)+'级';return i})"
            },
            "4": {
              path: api.SetWorkGradeConf,
              method: "POST",
              name: "修改",
              param: {
                workGradeConfBo: "@data"
              }
            }
          }
        },
        review: {
          muticheck: 1,
          name: "评论审核",
          optcode: 1+16+ 32 + 64,
          group: {
            field: "comment_status",
            value: [
              { value: "0", text: "待审核", optcode: 17 + 32 },
              { value: "1", text: "已通过", type: "success", optcode: 33 },
              { value: "2", text: "已删除", type: "danger", optcode: 65 }
            ]
          },
          fields: [
            {
              field: "id",
              name: "ID",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "comment_status",
              name: "状态",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "comment_content",
              name: "评论内容",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "uid",
              name: "评论人ID",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "title",
              name: "作品名",
              showtable: 0,
              condition: 1,
              search: {
                path: api.getVideoByName,
                field: "vid",
                param: "name",
                label: "title",
                value: "vid"
              },
              showlabel: 1
            },
            {
              field: "create_time",
              name: "评论时间",
              showtable: 1,
              showlabel: 1,
              condition: 1,
              ctrltype: 6
            },
            {
              field: "vid",
              name: "作品id",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "pid",
              name: "一级评论ID",
              showtable: 1,
              showlabel: 0
            },
            {
              field: "ref_id",
              name: "引用ID",
              showtable: 1,
              showlabel: 0
            }
          ],
          interfc: {
            "1": {
              path: api.GetCommentList,
              method: "POST",
              name: "查询",
              icon: "el-icon-search",
              type: "primary",
              rep: "list",
              repMap:
                "result.map(i=>{if(i.comment_content){i.comment_content=JSON.parse(i.comment_content).txt};return i})",
              param: {
                createtime: "@data@create_time",
                vid: "@data@vid"
              }
            },
            "16": {
              path: api.CommentPass,
              method: "POST",
              name: "批量通过",
              type: "success",
              rep: "list",
              param: {
                commentIds: "@data@id"
              }
            },
            "32": {
              path: api.CommentDel,
              method: "POST",
              name: "批量删除",
              type: "danger",
              rep: "list",
              param: {
                commentIds: "@data@id",
                auditReason: "@auditReason"
              },
              datasouce: {
                field: "auditReason",
                values: "@COMMENT"
              }
            },
            "64": {
              path: api.CommentRecover,
              method: "POST",
              name: "批量恢复",
              type: "warning",
              rep: "list",
              param: {
                commentIds: "@data@id"
              }
            }
          }
        },
        commentlist: {
          optcode: 1 + 2 + 8,
          fields: [
            {
              field: "id",
              name: "评论ID",
              showtable: 1,
              showlabel: 0
            },
            {
              field: "commentText",
              name: "评论内容",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "category_name",
              name: "分类名称",
              showtable: 1,
              showlabel: 1,
              ctrltype: 5,
              datasouce: {
                path: api.getCategoryList,
                rep:"list",
                param: {
                  value: "typename",
                  text: "typename"
                }
              }
            }
          ],
          interfc: {
            "1": {
              path: api.getCommentEnum,
              method: "POST",
              name: "查询",
              rep: "list"
            },
            "2": {
              path: api.addCommentEnum,
              method: "POST",
              name: "新增",
              param: {
                commentText: "@data@commentText",
                category_name:"@data@category_name"
              }
            },
            "8": {
              path: api.deleteCommentEnum,
              method: "POST",
              name: "删除",
              param: {
                id: "@data@id"
              }
            }
          }
        },
        vuser: {
          optcode: 1+2+8,
          fields: [
            {
              field: "uid",
              name: "虚拟用户id",
              showtable: 1,
              showlabel: 1
            },{
              field: "avatar",
              name: "图片",
              showtable: 1,
              showlabel: 0,
              ctrltype:3
            },{
              field: "img",
              name: "图片链接",
              showtable: 0,
              showlabel: 1
            }
          ],
          interfc: {
            "1": {
              path: api.getVuser,
              method: "POST",
              name: "查询",
              rep: "list"
            },
            "2": {
              path: api.addVuser,
              method: "POST",
              name: "插入数据",
              rep: "list",
              param: {
                uid: "@data@uid",
                img:"@data@img"
              }
            },
            "8": {
              path: api.deleteVuser,
              method: "POST",
              name: "全部删除",
              rep: "list"
            }
          }
        },
        commenttask: {
          optcode: 1,
          group: {
            field: "flag",
            value: [
              { value: "0", text: "待执行", optcode: 1 },
              { value: "1", text: "已执行", type: "success", optcode: 1 }
            ]
          },
          fields: [
            {
              field: "id",
              name: "任务ID",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "vid",
              name: "视频ID",
              showtable: 0,
              showlabel: 0
            },
            {
              field: "vname",
              name: "视频名称",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "tasktype",
              name: "类型",
              showtable: 1,
              showlabel: 1,
              ctrltype: 4,
              radios: [
                { value: "0", text: "播放次数" },
                { value: "1", text: "点赞次数" }
              ]
            },
            {
              field: "count",
              name: "设定播放次数",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "currentcount",
              name: "目前播放次数",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "commentText",
              name: "评论内容",
              showtable: 1,
              showlabel: 1
            },
            {
              field: "flag",
              name: "状态",
              showtable: 0,
              showlabel: 1
            },
            {
              field: "excute_time",
              name: "执行时间",
              showtable: 1,
              showlabel: 1
            }
          ],
          interfc: {
            "1": {
              path: api.getCommentTask,
              method: "POST",
              name: "查询",
              rep: "list",
              repMap:
                "result.map(i=>{i.currentcount=i.currentcount||0;i.excute_time=i.excute_time||'未执行';return i})",
            }
          }
        },
        test: {
          optcode: 1,
          fields: [],
          interfc: {
            "1": {
              path: api.setUserInfo,
              method: "POST",
              name: "查询",
              rep: "list",
              param: {
                uid: "2174216599",
                target:"Avatar"
              }
            }
          }
        },
        commentstatdate : {
          optcode : 1,
          fields : [
            {
              field : 'create_time',
              name : '统计时间',
              showtable : 1,
              showlabel : 1,
              ctrltype: 6
            },
            {
              field: "comment_time",
              name: "评论时间",
              showtable: 0,
              showlabel: 1,
              condition: 1,
              ctrltype: 6
            },
            {
              field : "comment_count",
              name : '评论总数',
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'user_count',
              name : "评论用户总数",
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'video_count',
              name : '评论作品总数',
              showtable : 1,
              showlabel : 1 
            },
            {
              field : 'day_comment_count',
              name : '当天评论总数',
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'day_user_count',
              name : '当天评论人数',
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'day_video_count',
              name : '当天评论作品数',
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'first_user_count',
              name : '首发用户人数',
              showtable : 1,
              showlabel : 1
            }
          ],
          interfc : {
            "1" : {
              path : api.getCommentListByDate,
              method : 'POST',
              name : "查询",
              rep : "list",
              param:{
                createtime:"data@comment_time"
              }
            }
          }
        },
        videostatdate : {
          optcode : 1,
          page:{
            path:api.getVideoListByDateCount
          },
          fields : [
            {
              field: "title",
              name: "作品名",
              showtable: 0,
              condition: 1,
              search: {
                path: api.getVideoByName,
                field: "vid",
                param: "name",
                label: "title",
                value: "vid"
              },
              showlabel: 1
            },
            {
              field: "id",
              name: "ID",
              showtable: 1,
              showlabel: 1
            },
            {
              field : "vid",
              name : "作品ID",
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'create_time',
              name : '统计时间',
              showtable : 1,
              showlabel : 1,
              condition:1,
              ctrltype : 6
            },
            {
              field : "comment_count",
              name : "评论总数",
              showtable : 1,
              showlabel : 1
            },
            {
              field : "user_count",
              name : "评论总人数",
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'day_comment_count',
              name : '当天评论总数',
              showtable : 1,
              showlabel : 1
            },
            {
              field : 'day_user_count',
              name : '当天评论人数',
              showtable : 1,
              showlabel : 1
            }
          ],
          interfc : {
            "1" : {
              path : api.getVideoListByDate,
              method : 'POST',
              name : '查询',
              rep : 'list',
              param : {
                create_time : 'data@create_time',
                vid : 'data@vid',
                start:'data@start',
                size:'data@size'
              }
            }
          }
        }
      },
      config: []
    };
  },
  components: {
    YmPage
  },
  created() {
    this.config = this.configdata[this.$route.params.id];
  },
  watch: {
    $route() {
      this.config = undefined;
      this.$nextTick(function() {
        this.config = this.configdata[this.$route.params.id];
      });
    }
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.work_audit_manage_wrapper1 {
  padding: 30px 20px;
  min-width: 890px;
}
</style>


