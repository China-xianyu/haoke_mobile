import {
  RECEIVER_GROUPS,
  RECEIVER_SWIPERS,
  RECEIVER_RECOMMEND,
  MODIFY_FILTERS,
  RECEIVER_HOUSES,
  ADD_HOUSE,
  RECEIVER_FILTERS
} from './action-types'
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

function modifyFilters(state = {}, action) {
  switch (action.type) {
    case MODIFY_FILTERS:
      return action.data
    default:
      return state
  }
}

function filterData (state = {}, action) {
  switch(action.type){
    case RECEIVER_FILTERS:
      return action.data
    default:
      return state
  }
}

function houseList(state = [], action) {
  switch (action.type) {
    case RECEIVER_HOUSES:
      return action.data
    case ADD_HOUSE:
      return [...state, ...action.data.list]
    default:
      return state
  }
}

function houseCount(state = 0, action) {
  switch (action.type) {
    case 'RECEIVER_HOUSES_COUNT':
      return action.data
    default:
      return state
  }
}

export default combineReducers({
  swipers,
  groups,
  recommend,
  modifyFilters,
  houseList,
  houseCount,
  filterData
})
