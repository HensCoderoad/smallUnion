import util from "@/util";
import Vue from 'vue';
import api from '@/api';

const logSwitch = true;
export default {
  namespaced: true,
  state: {
    categoryList: [],
    CSPECIAL: '政治敏感、色情、血腥、暴力、赌博、毒品、涉黑、非法物品、谣言误导、宗教迷信、低俗、伦理道德、涉嫌侵权、诱导分享转发、恶搞经典、视频无内容、广告、语言障碍、恶心恐怖'.split('、'),
    UNRECOMMEND: '政治敏感、色情、血腥、暴力、赌博、毒品、涉黑、非法物品、谣言误导、宗教迷信、低俗、伦理道德、诱导分享转发、恶搞经典、方言地域局限、无内容无意义、广告、视频模糊、涉嫌侵权、重复上传、个人随拍、方言难懂、自定义输入'.split('、'),
    CANCEL: '政治敏感、色情不雅、血腥暴力、涉嫌侵权、谣言误导、恶搞经典、毒品、赌博、非法物品、虐待、不符合主题、内容带水印、涉黑、自定义输入'.split('、'),
    COMMENT:'政治敏感、色情不雅、血腥暴力、泄露信息、低俗、广告、谣言误导、宗教迷信、毒品、赌博、涉黑、重复评论'.split('、')
  },
  mutations: {},
  actions: {
    getCategoryList({ state }) {
      return Vue.prototype.$http.post(api.getCategoryList).then((res) => {
        if (res.data && res.data.head.status == 1) {
          state.categoryList = res.data.list || [];
        } else {
          Vue.prototype.$message.error(res.data && res.data.head.msg);
        }
      }).catch((err) => {
        Vue.prototype.$message.error('服务器错误，获取分类列表失败');
      });
    }
  }
};
