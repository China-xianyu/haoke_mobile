import {API} from '../utils'
import {
  RECEIVER_GROUPS,
  RECEIVER_SWIPERS,
  RECEIVER_RECOMMEND,
  MODIFY_FILTERS,
  RECEIVER_HOUSES,
  ADD_HOUSE,
  RECEIVER_FILTERS
} from './action-types'
import store from './store'

/* 首页 */
// 接收租房小组
const receiverGroups = groups => ({type: RECEIVER_GROUPS, data: groups})
// 接收轮播图数据
const receiverSwipers = swipers => ({type: RECEIVER_SWIPERS, data: swipers})
// 接收推荐房源
const receiverRecommend = recommend => ({type: RECEIVER_RECOMMEND, data: recommend})

// 租房小组
export const getGroups = () => dispatch => {
  new Promise((resolve, reject) => {
    API.get('/home/group/').then(
      response => {
        resolve(response.data)
      },
      error => {
        reject(error)
      }
    )
  }).then(
    response => {
      dispatch(receiverGroups(response.body))
    }
  )
}

// slider
export const getSwipers = () => dispatch => {
  new Promise((resolve, reject) => {
    API.get('/home/swiper').then(
      response => {
        resolve(response.data)
      },
      error => {
        reject(error)
      }
    )
  }).then(
    response => {
      dispatch(receiverSwipers(response.body))
    }
  )
}

// 推荐房源
export const getRecommend = () => dispatch => {
  new Promise((resolve, reject) => {
    API({
      url: '/home/recommend',
    }).then(
      response => {
        resolve(response.data)
      },
      error => {
        reject(error)
      }
    )
  }).then(
    response => {
      dispatch(receiverRecommend(response.body))
    }
  )
}

/* 房屋列表 */
// 房屋筛选条件
export const setFilters = filtersData => ({type: MODIFY_FILTERS, data: filtersData})
// 接收房屋筛选条件
const receiver_filters = filtersData => ({type: RECEIVER_FILTERS, data: filtersData})
// 请求房屋筛选条件
export const getFilters = (value, label) => dispatch => {

  API.get(`/houses/condition/?id=${value}&city_name=${label}`).then(
    response => {
      console.log(response)
      dispatch(receiver_filters(response.data.body))
    }
  )

}
// 接收房屋数据
const receiver_houses = houseList => ({type: RECEIVER_HOUSES, data: houseList})
// 接收房屋数量
const receiver_houses_count = count => ({type: 'RECEIVER_HOUSES_COUNT', data: count})
// 接收更多房屋数据
const add_house = houseData => ({type: ADD_HOUSE, data: houseData})
// 请求房屋数据
export const getHouses = (entire = null) => dispatch => {

  const {label} = JSON.parse(localStorage.getItem('hkzf_city'))

  let {modifyFilters: filters} = store.getState()

  if (entire !== null) {
    filters['mode'] = entire === 1;
  }

  /* 获取数据 */
  return new Promise((resolve, reject) => {
    API.get('/houses/house', {
      params: {
        cityName: label,
        ...filters,
        start: 1,
        end: 20
      }
    }).then(
      response => {
        const {list, count} = response.data.body
        if (list.length > 0 && count > 0) {
          resolve()
        } else {
          reject()
        }
        dispatch(receiver_houses(list))
        dispatch(receiver_houses_count(count))
      }
    )
  })
}
// 请求更多房屋数据
export const moreHouses = (startIndex = 0, label = '') => dispatch => {
  const {filters} = store.getState()
  API.get('/houses/house/', {
    params: {
      cityName: label,
      ...filters,
      start: startIndex
    }
  }).then(response => {
    dispatch(add_house(response.data.body))
  })
}
