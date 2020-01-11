import Vue from 'vue'
import VueRouter from 'vue-router'

// 页面组件
import Login from '../components/Login.vue'
import Home from 'components/Home'
import Welcome from 'components/Welcome'

import User from 'views/home/user/User'
import Rights from 'views/power/Rights'
import Roles from 'views/power/Roles'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children:[
      {path:'/welcome',component: Welcome},
      {path: '/users',component: User },
      {path: '/rights',component: Rights},
      {path: '/roles',component: Roles}
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫之全局前置守卫
router.beforeEach((to, from, next) => {
  // 将要访问的路由是登录页，直接放行
  if (to.path === '/login') return next();
  // 从sessionStorage中获取token,如果token为空,跳转到 /login中，否则放行。
  const tokenStr=window.sessionStorage.getItem('token');
  if(!tokenStr) return next("/login");
  next();

})

export default router
