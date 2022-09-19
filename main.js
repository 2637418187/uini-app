import { $http } from '@escook/request-miniprogram'
// #ifndef VUE3
import Vue from 'vue'
import App from './App'


// 请求开始之前做一些事情
$http.beforeRequest = function (options) {
  console.log("开始");
  uni.showLoading({
    title: '数据加载中...',
  })
}

// 请求完成之后做一些事情
$http.afterRequest = function () {
  uni.hideLoading()
}
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif