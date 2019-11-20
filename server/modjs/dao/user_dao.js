var db = require('../db/node_db.js');
var db2 = require('../db/php_db.js');

module.exports = {
    constructor() { },
    _select(sql, sqlParam = []) {
        return db.connect().then((connection) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, sqlParam, function (err, result) {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    },
    //针对php后台数据库
    _select2(sql, sqlParam = []) {
        return db2.connect().then((connection) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, sqlParam, function (err, result) {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    },
    //新增用户
    addUser(name, nickName, password, roles, id) {
        var sql = `INSERT IGNORE INTO user(name,nickname,password${id ? ',id' : ''}) VALUES(?,?,?${id ? ',?' : ''})`;
        var sqlParam = [name, nickName, password];
        id && sqlParam.push(id);
        return this._select(sql, sqlParam).then((result) => {
            if (roles && result.insertId) {
                return this.addUserRoleMap(result.insertId, roles);
            }
            return result;
        });
    },
    //验证用户
    checkUser(name, password) {
        var sql = 'SELECT * FROM user WHERE name = ? && password = ?';
        var sqlParam = [name, password];
        return this._select(sql, sqlParam);
    },
    //获取用户
    getUser(name) {
        var sql = 'SELECT * FROM user WHERE name = ? ';
        var sqlParam = [name];
        return this._select(sql, sqlParam);
    },
    //获取用户列表
    getUserList() {
        var sql = 'SELECT * FROM user';
        return this._select(sql);
    },
    //根据id获取用户列表
    getUserListByIds(ids) {
        var sql = 'SELECT * FROM user WHERE id in (?)';
        var sqlParam = [ids];
        return this._select(sql, sqlParam);
    },
    //获取用户的菜单
    getUserMenuList(id) {
        var sql = 'SELECT a.id FROM role a JOIN role_user b ON a.id = b.role_id WHERE b.user_id = ?';
        sql = 'SELECT menu_id FROM role_menu WHERE role_id IN  (SELECT id FROM role WHERE id in (' + sql + '))'
        sql = 'SELECT * FROM menu WHERE id IN ( ' + sql + ')';
        var sqlParam = [id];
        return this._select(sql, sqlParam);
    },
    //删除用户
    deleteUser(id) {
        var sql = 'DELETE FROM user WHERE id = ?';
        var sqlParam = [id];
        return this._select(sql, sqlParam).then(() => {
            var sql = 'DELETE FROM role_user WHERE user_id = ?';
            var sqlParam = [id];
            //删除对应的角色用户项
            return this._select(sql, sqlParam);
        });
    },
    //删除所有用户
    deleteAllUser() {
        var sql = `DELETE FROM user`;
        return this._select(sql).then(() => {
            sql = `DELETE FROM role_user`;
            return this._select(sql);
        });
    },
    //用户自己更新资料
    updateUserSelf(id, name, nickName, password) {
        var sql = `UPDATE user set name = ? , nickName = ? ${password ? ', password="' + password + '"' : ''} WHERE id = ?`;
        var sqlParam = [name, nickName, id];
        return this._select(sql, sqlParam);
    },
    //更新用户
    updateUser(id, name, nickName, password, roles) {
        var sql = `UPDATE user set name = ? , nickName = ? ${password ? ', password="' + password + '"' : ''} WHERE id = ?`;
        var sqlParam = [name, nickName, id];
        return this._select(sql, sqlParam).then((result) => {
            return this.addUserRoleMap(id, roles);
        });
    },
    //添加角色
    addRole(name, weight, menus) {
        var sql = 'INSERT IGNORE INTO role (name, weight) VALUES(?, ?)';
        var sqlParam = [name, weight];
        return this._select(sql, sqlParam).then((result) => {
            if (result.insertId && menus) {
                this.addRoleMenuMap(result.insertId, menus);
            }
            return result;
        });
    },
    //删除角色
    deleteRole(id) {
        var sql = 'DELETE FROM role WHERE id = ?';
        var sqlParam = [id];
        return this._select(sql, sqlParam).then(() => {
            var sql = 'DELETE FROM role_menu WHERE role_id = ?';
            var sqlParam = [id];
            //删除对应的角色菜单项
            return this._select(sql, sqlParam)
        }).then(() => {
            var sql = 'DELETE FROM role_user WHERE role_id = ?';
            var sqlParam = [id];
            //删对应的角色用户项
            return this._select(sql, sqlParam);
        });
    },
    //更新角色
    updateRole(id, name, weight, menus) {
        var sql = 'UPDATE role set name = ?, weight = ? WHERE id = ?';
        var sqlParam = [name, weight, id];
        return this._select(sql, sqlParam).then((result) => {
            this.addRoleMenuMap(id, menus);
            return result;
        });
    },
    //获取角色列表
    getRoleList() {
        var sql = 'SELECT * FROM role';
        return this._select(sql);
    },
    //根据用户id获取角色列表
    getRoleListByUid(uid) {
        var sql = 'SELECT * FROM role_user where user_id = ?';
        var sqlParam = [uid];
        return this._select(sql, sqlParam);
    },
    //添加角色对应的菜单
    addRoleMenuMap(roldeId, menus) {
        return this.deleteRoleMenuMap(roldeId).then(() => {
            if (!menus) {
                return;
            }
            menus = menus instanceof Array ? menus : [menus];
            var sql = 'INSERT IGNORE INTO role_menu (menu_id, role_id) VALUES ?';
            var sqlParam = [];
            //批量插入
            menus.map((item) => {
                sqlParam.push([item, roldeId]);
            });
            return this._select(sql, [sqlParam]);
        });
    },
    //删除角色对应的菜单
    deleteRoleMenuMap(roldeId, menuId) {
        var sql = `DELETE FROM role_menu WHERE role_id = ? ${menuId ? 'AND menu_id = ?' : ''}`;
        var sqlParam = [roldeId, menuId];
        return this._select(sql, sqlParam);
    },
    //添加菜单
    addMenu(name, path, order, parentId, roles, show) {
        var sql = 'INSERT IGNORE INTO menu (name, path, m_order, m_show) VALUES(?,?,?,?)';
        var sqlParam = [name, path, order, show];
        if (parentId) {
            sql = 'INSERT IGNORE INTO menu (name, path, m_order, m_show, parent_id) VALUES(?, ?, ?, ?, ?)';
            sqlParam = [name, path, order, show, parentId];
        }
        return this._select(sql, sqlParam).then((result) => {
            if (roles && result.insertId) {
                return this.addMenuRoleMap(result.insertId, roles).then(() => {
                    return result;
                });
            }
            return result;
        });
    },
    //删除菜单
    deleteMenu(id) {
        var sql = 'DELETE FROM menu WHERE id in (?)';
        var sqlParam = [id];
        return this._select(sql, sqlParam).then(() => {
            var sql = 'DELETE FROM role_menu WHERE menu_id in (?)';
            var sqlParam = [id];
            //删除对应的角色菜单项
            return this._select(sql, sqlParam)
        });
    },
    //获取菜单列表
    getMenuList() {
        var sql = 'SELECT * FROM menu order by m_order';
        return this._select(sql);
    },
    //更新菜单
    updateMenu(id, name, path, order, roles, show) {
        var sql = 'UPDATE menu set name = ?, path = ?, m_order = ?, m_show = ? WHERE id = ?';
        var sqlParam = [name, path, order, show, id];
        return this._select(sql, sqlParam).then((result) => {
            return this.addMenuRoleMap(id, roles);
        });
    },
    //获取用户角色关联表
    getUserRoleMap() {
        var sql = 'SELECT * FROM role_user';
        return this._select(sql);
    },
    //添加用户对应的角色
    addUserRoleMap(userId, roles) {
        return this.deleteUserRoleMap(userId).then(() => {
            if (!roles) {
                return;
            }
            roles = roles instanceof Array ? roles : [roles];
            var sql = 'INSERT IGNORE INTO role_user (user_id, role_id) VALUES ?';
            var sqlParam = [];
            //批量插入
            roles.map((item) => {
                sqlParam.push([userId, item]);
            });
            return this._select(sql, [sqlParam]);
        });
    },
    //删除用户对应的角色
    deleteUserRoleMap(userId, roleId) {
        var sql = `DELETE FROM role_user WHERE user_id = ? ${roleId ? 'AND role_id = ?' : ''}`;
        var sqlParam = [userId];
        return this._select(sql, sqlParam);
    },
    //获取菜单角色关联表
    getMenuRoleMap() {
        var sql = 'SELECT * FROM role_menu';
        return this._select(sql);
    },
    //添加菜单对应的角色
    addMenuRoleMap(menuId, roles) {
        return this.deleteMenuRoleMap(menuId).then(() => {
            if (!roles) {
                return;
            }
            roles = roles instanceof Array ? roles : [roles];
            var sql = 'INSERT IGNORE INTO role_menu (menu_id, role_id) VALUES ?';
            var sqlParam = [];
            //批量插入
            roles.map((item) => {
                sqlParam.push([menuId, item]);
            });
            return this._select(sql, [sqlParam]);
        });
    },
    //删除菜单对应的角色
    deleteMenuRoleMap(menuId, roleId) {
        var sql = `DELETE FROM role_menu WHERE menu_id = ? ${roleId ? 'AND role_id = ?' : ''}`;
        var sqlParam = [menuId, roleId];
        return this._select(sql, sqlParam);
    },
    //备份用户菜单和用户权限表
    copyUserAndUserRole() {
        var sql = '';
        return this.getUserList().then((result) => {
            if (result.length) {
                sql = `DELETE FROM user_backup`;
                return this._select(sql).then(() => {
                    sql = `INSERT user_backup SELECT * FROM user`;
                    return this._select(sql);
                });
            }
        }).then(() => {
            return this.getUserRoleMap();
        }).then((result) => {
            if (result.length) {
                sql = `DELETE FROM role_user_backup`;
                return this._select(sql).then(() => {
                    sql = `INSERT role_user_backup SELECT * FROM role_user`;
                    return this._select(sql);
                });
            }
        });
    },
    //获取旧版运营后台所有用户
    getPhpUserList() {
        var sql = 'SELECT * FROM users';
        return this._select2(sql);
    },
    // 获取日志
    getAllLog(menu_id, beginTime, endTime) {
        var sql = "SELECT log.*,user.nickname FROM `log` INNER join user on log.user_id = user.id where 1=1 ";
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' AND create_time <= '${endTime}') `;
        }
        if (menu_id) {
            sql += `and menu_id = '${menu_id}'`;
        }
        sql += `order by create_time desc`;
        return this._select(sql);
    },
    insertLog(userid, menuid, action_name, param) {
        var sql = `insert into log(user_id,menu_id,action_name,param) values(${userid},'${menuid}','${action_name}','${param}')`;
        return this._select(sql);
    },
    updateLog(logid, status) {
        var sql = `update log set logstatus = ${status} where id = ${logid}`;
        return this._select(sql);
    },
    // 字段
    getAllField() {
        var sql = "select * from field";
        return this._select(sql);
    },
    insertField(menu, fieldname, field, showtable, showlabel, ctrltype, radios) {
        var sql = `insert into field(menu,fieldname,field,showtable,showlabel,ctrltype,radios) values('${menu}','${fieldname}','${field}',${showtable},${showlabel},${ctrltype},'${radios}')`;
        return this._select(sql);
    },
    editField(id, menu, fieldname, field, showtable, showlabel, ctrltype, radios) {
        var sql = `update field set menu = '${menu}',name='${fieldname}',field = '${field}',showtable=${showtable},showlabel=${showlabel},ctrltype=${ctrltype},radios = '${radios}' where id = ${id}`;
        return this._select(sql);
    },
    // ,
    // updateField(){

    // }
    getAllComment(categoryid, rand) {
        var sql = "select * from commentlist where 1=1 ";
        if (categoryid) {
            sql += ` and category_name='${categoryid}'`
        }
        if (rand) {
            sql += ` order by  rand()`
        }
        return this._select(sql);
    },
    addCommentList(commentText, category_name) {
        if (commentText.indexOf("；") > -1) {
            let coms = commentText.split('；')
            if (coms.length > 0) {
                coms.forEach(com => {
                    if (com)
                        this._select(`insert into commentlist(commentText,category_name) values('${com}','${category_name}')`);
                })
            }
            return new Promise((resolve, reject) => {
                resolve()
            })
        }
        var sql = `insert into commentlist(commentText,category_name) values('${commentText}','${category_name}')`;
        return this._select(sql);
    },
    deleteCommentList(id) {
        var sql = `delete from commentlist where id = ${id}`;
        return this._select(sql);
    },
    getAllVuser(count) {
        let sql;
        if (count)
            sql = `select * from vuser order by rand() limit 0,${count}`
        else
            sql = `select * from vuser`
        return this._select(sql);
    },
    deleteVuser() {
        let sql = `delete from vuser`
        return this._select(sql);
    },
    addVuser(vids) {
        let sql = `insert into vuser(uid) values`
        vids.forEach(vid => {
            if (vid) {
                vid = vid.replace(/"/g, "'")
                sql += `(${vid}),`
            }
        })
        sql = sql.substr(0, sql.length - 1);
        return this._select(sql);
    },
    updateVuserAva(uid,avatar){
        let sql = `update vuser set avatar = '${avatar}' where uid = '${uid}'`
        return this._select(sql);
    },
    /**
     * 
     * @param {*} nodelete 没被删除
     */
    getAllCommentTask(nodelete) {
        var sql = "select * from comment_task";
        if (nodelete) {
            sql += ' where flag = 0'
        }
        return this._select(sql);
    },
    addCommentTask(data, vid, vname) {
        let _this = this;
        data.forEach(d => {
            _this._select(`insert into comment_task(count,commentText,vid,vname,uid) values (${d.count},'${d.commentid}','${vid}','${vname}','${d.uid}');`)
        });
    },
    deleteCommentTask(vid, uid) {
        let date = new Date();
        let sql = `update comment_task set flag = 1,excute_time='${date.toLocaleDateString() + " " + date.toLocaleTimeString()}' where vid = '${vid}' and uid = '${uid}'`
        return this._select(sql);
    },
    updateCommentTaskCount(vid, ccount) {
        let sql = `update comment_task set currentcount = ${ccount} where vid = '${vid}'`
        this._select(sql);
    },
    updateCommentDate(vids) {
        let date = new Date();
        if (vids && vids.length > 0) {
            vids.forEach(vid => {
                let sql = `update comment_task set excute_time='${date.toLocaleDateString() + " " + date.toLocaleTimeString()}' where vid = '${vid}'`
                this._select(sql);
            })
        }
    }
}