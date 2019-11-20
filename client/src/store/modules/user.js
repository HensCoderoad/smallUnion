import util from "@/util";
import Vue from 'vue';
import api from '@/api';
export default {
  namespaced: true,
  state: {
    user: util.getUser(),
    menuList: [],
    userMenuList: []
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    }
  },
  actions: {
  	logout() {
  		return Vue.prototype.$http.get(api.logout)
  	}
  }
};
