var dao = require('../dao/work_dao.js');
var daovideo = require('../dao/workvideo_dao.js');

module.exports = {
    getWorkTotal(titleKey, nameKey, from, status, userIds) {
        return dao.getWorkTotal(titleKey, nameKey, from, status, userIds).then((result)=>{
            return result[0]['count(*)'];
        });
    },
    getWorkList(page, pageSiz, titleKey, nameKey, from, status, userIds) {
        return dao.getWorkList(page, pageSiz, titleKey, nameKey, from, status, userIds);
    },
    changeStatus(vid, status, operUid, operUname, reason) {
        return dao.changeStatus(vid, status, operUid, operUname, reason);
    },
    getUser(name) {
        return dao.getUser(name);
    },
    updateWork(vid, title, video_type, img_oss_url, user_id, user_name) {
        return dao.updateWork(vid, title, video_type, img_oss_url, user_id, user_name);
    },
    getCrawlUserList() {
        return dao.getCrawlUserList();
    },
    deleteWork(vid) {
        return dao.deleteWork(vid);
    },
    getVideoByVid(vid){
        return daovideo.getVideoByVid(vid);
    }
}