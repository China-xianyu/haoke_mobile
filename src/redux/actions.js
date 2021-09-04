import {API} from '../utils'
import {RECEIVER_GROUPS, RECEIVER_SWIPERS, RECEIVER_RECOMMEND} from './action-types'

// 接收租房小组
const receiverGroups = groups => ({type: RECEIVER_GROUPS, data: groups})
// 接收轮播图数据
const receiverSwipers = swipers => ({type: RECEIVER_SWIPERS, data: swipers})
// 接收推荐房源
const receiverRecommend = recommend => ({type: RECEIVER_RECOMMEND, data: recommend})

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
