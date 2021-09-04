import {RECEIVER_GROUPS, RECEIVER_SWIPERS, RECEIVER_RECOMMEND} from './action-types'
import {combineReducers} from 'redux'

// 租房小组
function groups(state = [], action) {
  if (action.type === RECEIVER_GROUPS) {
    return action.data
  } else {
    return state
  }
}

// slider
function swipers(state = [], action) {
  if (action.type === RECEIVER_SWIPERS) {
    return action.data
  } else {
    return state
  }
}

// 推荐房源
function recommend(state = [], action) {
  if (action.type === RECEIVER_RECOMMEND) {
    return action.data
  } else {
    return state
  }
}

export default combineReducers({
  swipers,
  groups,
  recommend
})
