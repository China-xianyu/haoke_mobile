import axios from 'axios'
import {getToken, removeToken} from "./auth";

const API = axios.create({
  baseURL: '/api'
})

/* 请求拦截器 */
API.interceptors.request.use(config => {
  const {url, method} = config
  if (url.startsWith('/user') && !url.startsWith('/user/login') && !url.startsWith('/user/history') && !url.startsWith('/user/registered')) {
    if (method === 'get') {
      config.url = url + `?authorization=${getToken()}`
    } else {
      config.data = {
        ...config.data,
        authorization: getToken()
      }
    }
  }
  return config;
})

/* 响应拦截器 */
API.interceptors.response.use(response => {

  const {status} = response.data

  if (status === 400) {
    removeToken()
  }

  return response
})

export {
  API
}
