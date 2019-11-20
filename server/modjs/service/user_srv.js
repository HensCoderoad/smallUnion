var util = require('../util/index.js');
var { javaHost, newjavaHost, exposureHost, pythonHost } = require('../util/config');

var dao = require('../dao/user_dao.js');
var axios = require('axios');

module.exports = {
    addUser(name, nickName, password, roles, id) {
        return dao.addUser(name, nickName, password, roles, id);
    },
    delteUser(id) {
        return dao.deleteUser(id);
    },
    deleteAllUser() {
        return dao.deleteAllUser();
    },
    checkUser(name, password) {
        return dao.checkUser(name, password).then((result) => {
            var data = {
                user: result[0],
                roleList: []
            };
            if (result[0]) {
                return dao.getRoleListByUid(result[0].id).then((result) => {
                    data.roleList = result;
                    return data;
                });
            } else {
                return data;
            }
        });
    },
    getUser(name) {
        return dao.getUser(name).then((result) => {
            var data = {
                user: result[0],
                roleList: []
            };
            if (result[0]) {
                return dao.getRoleListByUid(result[0].id).then((result) => {
                    data.roleList = result;
                    return data;
                });
            } else {
                return data;
            }
        });
    },
    getUserList() {
        return dao.getUserList();
    },
    getUserListByIds(ids) {
        return dao.getUserListByIds(ids);
    },
    getUserMenuList(id) {
        return dao.getUserMenuList(id);
    },
    updateUserSelf(id, name, nickName, password) {
        return dao.updateUserSelf(id, name, nickName, password);
    },
    updateUser(id, name, nickName, password, roles) {
        return dao.updateUser(id, name, nickName, password, roles);
    },
    addRole(name, weight, menus) {
        return dao.addRole(name, weight, menus);
    },
    deleteRole(id) {
        return dao.deleteRole(id);
    },
    getRoleList() {
        return dao.getRoleList();
    },
    updateRole(id, name, weight, menus) {
        return dao.updateRole(id, name, weight, menus);
    },
    addMenu(name, path, order, parentId, roles, show) {
        return dao.addMenu(name, path, order, parentId, roles, show);
    },
    deleteMenu(id) {
        return dao.deleteMenu(id);
    },
    getMenuList() {
        return dao.getMenuList();
    },
    updateMenu(id, name, path, order, roles, show) {
        return dao.updateMenu(id, name, path, order, roles, show);
    },
    getMenuRoleMap() {
        return dao.getMenuRoleMap();
    },
    addMenuRoleMap(userId, roleId) {
        return dao.addMenuRoleMap(userId, roleId);
    },
    deleteMenuRoleMap() {
        return dao.deleteMenuRoleMap();
    },
    getUserRoleMap() {
        return dao.getUserRoleMap();
    },
    addUserRoleMap(userId, roleId) {
        return dao.addUserRoleMap(userId, roleId);
    },
    deleteUserRoleMap(userId, roleId) {
        return dao.deleteUserRoleMap(userId, roleId);
    },
    copyUserAndUserRole() {
        return dao.copyUserAndUserRole();
    },
    getPhpUserList() {
        return dao.getPhpUserList();
    },
    getAllLog(menu_id, beginTime, endTime) {
        return dao.getAllLog(menu_id, beginTime, endTime);
    },
    addLog(userid, menuid, actionid, param) {
        return dao.insertLog(userid, menuid, actionid, param);
    },
    updateLog(logid, status) {
        return dao.updateLog(logid, status);
    },
    getAllField() {
        return dao.getAllField();
    },
    addField(menu, name, field, showtable, showlabel, ctrltype, radios) {
        return dao.insertField(menu, name, field, showtable, showlabel, ctrltype, radios);
    },
    editField(id, menu, name, field, showtable, showlabel, ctrltype, radios) {
        return dao.editField(id, menu, name, field, showtable, showlabel, ctrltype, radios);
    },
    getAllComment(categoryid, rand) {
        return dao.getAllComment(categoryid, rand);
    },
    addCommentList(commentText, category_name) {
        return dao.addCommentList(commentText, category_name);
    },
    deleteCommentList(id) {
        return dao.deleteCommentList(id);
    },
    getAllVuser(count) {
        return dao.getAllVuser(count);
    },
    deleteVuser() {
        return dao.deleteVuser();
    },
    addUserImg(img){
        if(img){
            let imgs = img.split(",");
            // 查询库里面用户还有哪些没有绑定用户头像
            const getUserImgUrl = "/user/SUser/BatchGetUserBaseInfo2";
            const setUserImgUrl = "/user/SUser/ModifyUserInfo";
            this.getAllVuser().then(users=>{
                let uids = []
                users.forEach(user=>{
                    uids.push(user.uid)
                })
                axios.post(javaHost + getUserImgUrl, {
                    head: {
                        "@type": "type.googleapis.com/ja.common.proto.AutReqHead",
                        platform: 5,
                        seqid: util.getSeqid(),
                        ver: 1
                    },
                    uids
                }).then(d=>{
                    if(d.data.head.status == 1){
                        Object.keys(d.data.infos).forEach(key=>{
                            let user = d.data.infos[key];
                            if(!user.avatar|| user.avatar == "https://cdn.img1.iduoliao.cn/2018/05/10/default_face.png"){
                                // 更新用户信息了
                                if(imgs.length>0){
                                    let avatar = imgs.shift()
                                    axios.post(javaHost + setUserImgUrl, {
                                        head: {
                                            "@type": "type.googleapis.com/ja.common.proto.AutReqHead",
                                            platform: 5,
                                            seqid: util.getSeqid(),
                                            ver: 1
                                        },
                                        userinfo:{
                                            "uid":user.uid,
                                            "avatar":avatar
                                        }
                                    }).then(d=>{
                                        if(d.data.head.status == 1){
                                            this.updateVuserAva(user.uid,avatar)
                                        }
                                    })
                                }else{
                                    this.updateVuserAva(key,user.avatar)
                                }
                            }else{
                                this.updateVuserAva(key,user.avatar)
                            }
                        })
                    }
                })
            })
        }
    },
    updateVuserAva(uid,avatar){
        dao.updateVuserAva(uid,avatar)
    },
    addVuser(uid, img) {
        return new Promise((resole, reject) => {
            // 根据uid切割产生用户批量插入到数据库
            if (uid) {
                uid = uid.split(',')
                dao.addVuser(uid).then(() => {
                    this.addUserImg(img)
                    resole()
                }).catch(err => {
                    reject()
                })
            }else{
                this.addUserImg(img)
                resole()
            }
        })

    },
    getAllCommentTask() {
        return dao.getAllCommentTask(false);
    },
    addCommentTask(data, vid, vname) {
        // 如果查询没有vid的视频才能插入评论任务
        dao.getAllCommentTask(false).then(d => {
            let com = d.find(dd => dd.vid == vid)
            if (!com) {
                return dao.addCommentTask(data, vid, vname)
            }
        })
    },
    deleteCommentTask(vid) {
        return dao.deleteCommentTask(vid)
    },
    executeComment() {
        let javaPath = '/works/SWorksStat/BatchGetVideoStat'
        // 获取定时任务列表
        dao.getAllCommentTask(true).then(data => {
            // 根据vid分组
            if (data && data.length > 0) {
                let vlist = {};
                let vids = []
                data.forEach(l => {
                    if (!vlist[l.vid]) {
                        vlist[l.vid] = []
                        vids.push(l.vid)
                    }
                    vlist[l.vid].push(l)
                })
                // 更新查询时间
                dao.updateCommentDate(vids);
                axios.post(javaHost + javaPath, {
                    head: {
                        "@type": "type.googleapis.com/ja.common.proto.AutReqHead",
                        platform: 5,
                        seqid: util.getSeqid(),
                        ver: 1
                    },
                    vid: vids
                }).then((result) => {
                    if (result && result.data.info) {
                        result.data.info.forEach(vinfo => {
                            let vid = vinfo.vid
                            // 更新当前曝光
                            dao.updateCommentTaskCount(vid, vinfo.totalPlayCount)
                            if (vinfo.totalPlayCount) {
                                // 测试数据
                                // 找到对应的返回值的时候 判断 插入评论操作
                                vlist[vid].forEach(task => {
                                    if (task.count <= vinfo.totalPlayCount) {
                                        // 执行任务
                                        axios.post(newjavaHost + "/video/admin/autoCreate", {
                                            params: {
                                                token: "",
                                                vid,
                                                uid: task.uid,
                                                commentTxt: task.commentText
                                            },
                                            call: "video:admin:autoCreate"
                                        }).then(d => {
                                            if (d && d.data && d.data.status == 0) {
                                                // 执行假删除
                                                dao.deleteCommentTask(vid, task.uid)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }).catch((err) => {
                    console.log(err)
                });
            }
        })
    }
}