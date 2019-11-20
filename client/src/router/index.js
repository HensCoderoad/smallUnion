import Vue from 'vue'
import Router from 'vue-router'
// @ts-ignore
import Frame from '@/components/Frame'
// @ts-ignore
import util from '@/util';
// @ts-ignore
import store from "@/store";
// @ts-ignore
import api from '@/api';
// @ts-ignore
import status from '@/api/status'; 

Vue.use(Router)

var router = new Router({
  routes: [{
      path: '/',
      name: 'Login',
      // @ts-ignore
      component: resolve => require(['@/pages/Login'], resolve),
    },
    {
      path: '/',
      name: 'Frame',
      component: Frame,
      children: [{
          path: '/home',
          name: 'Home',
          // @ts-ignore
          component: resolve => require(['@/pages/Home'], resolve)
        },
        {
          path: '/recommend_manage',
          name: 'RecManage',
          // @ts-ignore
          component: resolve => require(['@/pages/RecManage'], resolve)
        },
        {
          path: '/recommend_white_manage',
          name: 'RecWhiteListManage',
          // @ts-ignore
          component: resolve => require(['@/pages/RecWhiteListManage'], resolve)
        },
        {
          path: '/dispatch_manage',
          name: 'DispatchManage',
          // @ts-ignore
          component: resolve => require(['@/pages/DispatchManage'], resolve)
        },
        {
          path: '/dispatch_detail',
          name: 'DispatchDetail',
          // @ts-ignore
          component: resolve => require(['@/pages/DispatchDetail'], resolve)
        },
        {
          path: '/edit_user',
          name: 'EditUser',
          // @ts-ignore
          component: resolve => require(['@/pages/EditUser'], resolve)
        },
        {
          path: '/add_user',
          name: 'AddUser',
          // @ts-ignore
          component: resolve => require(['@/pages/AddUser'], resolve)
        },
        {
          path: '/role',
          name: 'Role',
          // @ts-ignore
          component: resolve => require(['@/pages/Role'], resolve)
        },
        {
          path: '/field',
          name: 'Field',
          // @ts-ignore
          component: resolve => require(['@/pages/Field'], resolve)
        },
        {
          path: '/user',
          name: 'User',
          // @ts-ignore
          component: resolve => require(['@/pages/User'], resolve)
        },
        {
          path: '/menu',
          name: 'Menu',
          // @ts-ignore
          component: resolve => require(['@/pages/Menu'], resolve)
        },
        {
          path: '/crawler_manage',
          name: 'CrawlerManage',
          // @ts-ignore
          component: resolve => require(['@/pages/CrawlerManage'], resolve)
        },
        {
          path: '/work_manage',
          name: 'WorkManage',
          // @ts-ignore
          component: resolve => require(['@/pages/WorkManage'], resolve)
        },
        {
          path: '/pay_manage',
          name: 'PayManage',
          // @ts-ignore
          component: resolve => require(['@/pages/PayManage'], resolve)
        },
        {
          path: '/pay_history',
          name: 'PayHistory',
          // @ts-ignore
          component: resolve => require(['@/pages/PayHistory'], resolve)
        },
        {
          path: '/pay_detail',
          name: 'PayDetail',
          // @ts-ignore
          component: resolve => require(['@/pages/PayDetail'], resolve)
        },
        {
          path: '/work_audit_manage',
          name: 'WorkAuditManage',
          // @ts-ignore
          component: resolve => require(['@/pages/WorkAuditManage'], resolve)
        },
        {
          path: '/crawler_statistics',
          name: 'CrawlerStatistics',
          // @ts-ignore
          component: resolve => require(['@/pages/CrawlerStatistics'], resolve)
        },
        {
          path: '/author_dispatch_manage',
          name: 'AuthorDispatchManage',
          // @ts-ignore
          component: resolve => require(['@/pages/AuthorDispatchManage'], resolve)
        },
        {
          path: '/activity_manage',
          name: 'ActivityManage',
          // @ts-ignore
          component: resolve => require(['@/pages/ActivityManage'], resolve)
        },
        {
          path: '/goods_manage',
          name: 'ActivityAwardManage',
          // @ts-ignore
          component: resolve => require(['@/pages/GoodsManage'], resolve)
        },
        {
          path: '/activity_lucky_manage',
          name: 'ActivityLuckyManage',
          // @ts-ignore
          component: resolve => require(['@/pages/ActivityLuckyManage'], resolve)
        },
        {
          path: '/activity_work_audit_manage',
          name: 'ActivityWorkAuditManage',
          // @ts-ignore
          component: resolve => require(['@/pages/ActivityWorkAuditManage'], resolve)
        },
        {
          path: '/activity_banner_manage',
          name: 'ActivityBannerManage',
          // @ts-ignore
          component: resolve => require(['@/pages/ActivityBannerManage'], resolve)
        },
        {
          path: '/ad_content_manage',
          name: 'AdContentManage',
          // @ts-ignore
          component: resolve => require(['@/pages/AdContentManage'], resolve)
        },

        {
          path: '/album_sort',
          name: 'AlbumSort',
          // @ts-ignore
          component: resolve => require(['@/pages/AlbumSort'], resolve)
        },
        {
          path: '/album_tag',
          name: 'AlbumTag',
          // @ts-ignore
          component: resolve => require(['@/pages/AlbumTag'], resolve)
        },
        {
          path: '/album_banner',
          name: 'AlbumBanner',
          // @ts-ignore
          component: resolve => require(['@/pages/AlbumBanner'], resolve)
        },
        {
          path: '/album_recomm',
          name: 'AlbumRecomm',
          // @ts-ignore
          component: resolve => require(['@/pages/AlbumRecomm'], resolve)
        },
        {
          path: '/album_template',
          name: 'AlbumTemplate',
          // @ts-ignore
          component: resolve => require(['@/pages/AlbumTemplate'], resolve)
        },
        {
          path: '/dynamic/:id',
          name: 'dynamic',
          // @ts-ignore
          component: resolve => require(['@/pages/Dynamic'], resolve)
        },
        {
          path : '/comment_review' ,
          name : 'CommentReview',
          component : resolve => require(['@/pages/CommentReview'] , resolve)
        }
      ]
    },
    {
      path: '/*',
      name: '404',
      // @ts-ignore
      component: resolve => require(['@/pages/Home'], resolve)
    }
  ]
})

//拦截所有路由
// @ts-ignore
router.beforeEach((to, from, next) => {
  if (util.getUser()) {
    if (['Home', 'EditUser'].indexOf(to.name) > -1) {
      getUserMenuList().then(() => {
        next();
      });
    } else {
      checkAuthor(to.path).then((pass) => {
        if (pass) {
          next();
        } else {
          next('/home');
        }
      });
    }
  } else {
    util.clearUser();
    if (['/'].indexOf(to.path) > -1) { //防止循环路由
      next();
    } else {
      next('/');
    }
  }
  //检测登录状态
  // @ts-ignore
  if (!util.getLoginStatus() && !axios.gettingUser) {
    // @ts-ignore
    axios.gettingUser = true;
    // @ts-ignore
    axios.get(api.getUser).then(() => {
      util.setLoginStatus();
      // @ts-ignore
      axios.gettingUser = false;
    }).catch(() => {
      // @ts-ignore
      axios.gettingUser = false;
    });
  }
});

//异步加载路由组件失败处理
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  if (isChunkLoadFailed) {
    // @ts-ignore
    const targetPath = router.history.pending.fullPath;
    setTimeout(() => {
      router.replace(targetPath); //重新加载
    }, 200);
  }
});

//获取用户列表
function getUserMenuList() {
  return Vue.prototype.$http.get(api.getUserMenuList + '/id/' + store.state.user.user.id).then((res) => {
    if (res.data.status == status.SUCCESS) {
      store.state.user.userMenuList = res.data.list;
    } else {
      Vue.prototype.$message.error('获取用户菜单列表失败');
    }
  }).catch((err) => {
    console.log(err);
    Vue.prototype.$message.error('服务器错误，获取用户菜单列表失败');
    throw new Error();
  });
}

//检测页面权限
function checkAuthor(path) {
  console.log(path)
  console.log(store.state.user.userMenuList)
  if (store.state.user.userMenuList.length) {
    return _check();
  } else {
    return getUserMenuList().then(() => {
      return _check();
    });
  }

  function _check() {
    var list = store.state.user.userMenuList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].path == path) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
}

export default router;
