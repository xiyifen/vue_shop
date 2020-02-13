import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 手动配置elementUI
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// Vue.use(ElementUI)

import './plugins/element.js'

// 引入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入插件
import ZkTable from 'vue-table-with-tree-grid'
// 使用插件
Vue.use(ZkTable)

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 样式
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem("token")
  return config;
});
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 过滤器 处理时间格式
Vue.filter('dateFormat',function(originVal){

  const dt=new Date(originVal);

  const y=dt.getFullYear();
  const m= (dt.getMonth()+1+ '').padStart(2,'0');
  const d=(dt.getDate()+ '').padStart(2,'0')

  const hh=(dt.getHours()+ '').padStart(2,'0');
  const mm=(dt.getMinutes()+ '').padStart(2,'0');
  const ss = (dt.getSeconds()+ '').padStart(2,'0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})



new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
