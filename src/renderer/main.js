import Vue from 'vue'
import axios from 'axios'

import App from './App'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import LongPress from 'vue-directive-long-press'
import SvgIcon from 'vue-svgicon'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.directive('long-press', LongPress)
Vue.use(SvgIcon, {
  tagName: 'svgicon'
})

new Vue({
  el: '#app',
  render: h => h(App)
});

