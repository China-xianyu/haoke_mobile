// 获取定位城市
import {API} from './api';

export const getCurrentCity = () => {
  // 从本地获取信息
  const localCity = JSON.parse(localStorage.getItem('hkzf_city'))
  if (!localCity) {
    // 存在
    return new Promise((resolve, reject) => {
      // 获取当前城市信息
      const curCity = new window.BMap.LocalCity()
      curCity.get(async res => {
        const cityName = res.name.slice(0, 2)
        try {
          // 请求数据
          const result = await API.get(`/area/info/?cityname=${cityName}`)
          // 存储到本地
          localStorage.setItem('hkzf_city', JSON.stringify(result.data.body))
          // 获取成功
          resolve(result.data.body)
        } catch (e) {
          // 获取失败
          reject(e)
        }
      })
    }).then()
  }
  // 不存在
  return Promise.resolve(localCity)
}

export {API} from './api'

export {BASE_URL} from './url'

export * from './auth'

export {getCity, setCity} from './city'
