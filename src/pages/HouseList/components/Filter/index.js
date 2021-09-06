import React, {Component, createRef} from 'react'
import RcQueueAnim from 'rc-queue-anim'
import PubSub from 'pubsub-js'

import FilterTitle from '../FilterTitle'
import FilterMore from '../FilterMore'
import FilterPicker from '../FilterPicker'
import style from './Filter.module.scss'

const titleSelectStatus = {
  area: false,
  mode: false,
  price: false,
  more: false
}

const selectedValues = {
  area: ['area', null],
  mode: [null],
  price: [null],
  more: []
}

export default class Filter extends Component {

  state = {
    /* 选项选中状态 */
    titleSelectStatus,
    /* 控制 FilterPicker 或者 FilterMore 显示或则隐藏 */
    openType: '',
    /* 选中的数据汇总 */
    selectedValues,
    show: false
  }

  mask = createRef()

  // 点击高亮
  ClickHandler = (type) => {

    this.htmlBody.className = 'fixed-body'

    const {titleSelectStatus} = this.state

    const selectedValues = this.props.filters

    /* 不直接修改对象，创建一个新对象 */
    let newTitleSelectStatus = {...titleSelectStatus}

    Object.keys(newTitleSelectStatus).forEach(key => {
      /* 点击那个直接高亮 */
      if (key === type) {
        newTitleSelectStatus[key] = true
        return newTitleSelectStatus
      }

      /* 判断是否有选中数据来判断是否高亮 */
      const selectedVal = selectedValues[key]

      if (selectedVal) {

        if (key === 'area' && (selectedVal.length !== 2 && selectedVal[0] !== 'area')) {
          newTitleSelectStatus[key] = true
        } else if (key === 'mode' && selectedVal[0] !== null) {
          newTitleSelectStatus[key] = true
        } else if (key === 'price' && selectedVal[0] !== null) {
          newTitleSelectStatus[key] = true
        } else if (key === 'more') {
          // 更多选项，FilterMore组件
        } else {
          newTitleSelectStatus[key] = false
        }
      }

    })

    this.setState({
      openType: type,
      titleSelectStatus: newTitleSelectStatus,
      show: !this.state.show
    })
  }

  /* 判断是否高亮 */
  isHigh = (type) => {
    const {selectedValues, titleSelectStatus} = this.state

    /* 不直接修改对象，创建一个新对象 */
    let newTitleSelectStatus = {...titleSelectStatus}

    /* 确定判断当前是否高亮 */
    const selectedVal = selectedValues[type]
    if (type === 'area' && (selectedVal.length !== 2 || selectedVal[0] !== 'area')) {
      newTitleSelectStatus[type] = true
    } else if (type === 'mode' && selectedVal[0] !== null) {
      newTitleSelectStatus[type] = true
    } else if (type === 'price' && selectedVal[0] !== null) {
      newTitleSelectStatus[type] = true
    } else newTitleSelectStatus[type] = type === 'more' && selectedVal.length > 0;

    this.setState({
      titleSelectStatus: newTitleSelectStatus
    })
  }

  /* 取消处理 */
  onCancel = (type) => {
    this.htmlBody.className = ''

    this.isHigh(type)

    this.setState({
      openType: '',
      show: !this.state.show
    })
  }

  /* 确定处理 */
  onSave = (type, value) => {
    this.htmlBody.className = ''

    const {selectedValues} = this.state

    const newSelectedValues = {
      ...selectedValues,
      [type]: value
    }

    /* 筛选条件汇总 */
    const filters = {}

    const {area, mode, price, more} = newSelectedValues

    const areaKey = area[0]
    let areaValues = null
    if (area.length === 3) {
      areaValues = area[2] !== null ? area[2] : area[1]
    }
    filters[areaKey] = areaValues

    filters['mode'] = mode[0]
    filters['price'] = price[0]
    filters['more'] = more.join(',')

    /* 更新数据时 返回顶部 */
    window.scrollTo(0, 0)
    // 订阅筛选房源事件
    PubSub.publish('getHouse')

    this.props.setFilters(filters)
    /* 更新状态 */
    this.setState({
      openType: '',
      selectedValues: newSelectedValues,
      show: !this.state.show
    }, () => {
      this.isHigh(type)
    })
  }

  /* 渲染FilterMore组件 */
  renderFilterMore = () => {
    const {
      openType,
      selectedValues
    } = this.state
    const {filtersData: {characteristic, floor, oriented, roomType}} = this.props
    const {onSave, onCancel} = this
    let data = {characteristic, floor, oriented, roomType}
    const defaultValues = selectedValues.more
    if (openType !== 'more') {
      return null;
    }
    return <FilterMore data={data} type={openType} onSave={onSave} defaultValues={defaultValues} onCancel={onCancel}
                       show={this.state.show} />
  }

  /* 渲染 FilterPicker 组件 */
  renderFilterPicker = () => {
    const {
      openType,
      selectedValues,
      show
    } = this.state
    const {filtersData: {subway, area, rentType, price}} = this.props
    const {onCancel, onSave} = this

    if (openType !== 'area' && openType !== 'mode' && openType !== 'price') {
      return null
    }

    let data = []
    let cols = 0
    let defaultValue = selectedValues[openType]
    switch (openType) {
      case "area":
        data = [area, subway]
        cols = 3
        break;
      case "mode":
        data = rentType
        cols = 1
        break;
      case "price":
        data = price
        cols = 1
        break;
      default:
        break;
    }
    return <FilterPicker key={openType} onCancel={onCancel} onSave={onSave} data={data} cols={cols} type={openType}
                         defaultValue={defaultValue} show={show} />
  }

  componentDidMount() {
    /* 获取body */
    this.htmlBody = document.querySelector('body')
  }

  componentWillUnmount() {
    this.setState = () => {
    }
  }

  render() {
    const {titleSelectStatus, openType} = this.state
    const {ClickHandler, onCancel, renderFilterPicker, renderFilterMore} = this

    return (
      <div className={style.root}>
        {/* 前三个菜单的遮盖层 */}
        <RcQueueAnim animConfig={[{opacity: [1, 0]}]}>
          {(openType === 'area' || openType === 'mode' || openType === 'price') ?
            <div key="1" className={style.mask} onClick={() => onCancel(openType)} />
            : null}
        </RcQueueAnim>

        <div className={style.content}>
          {/* 标题栏 */}
          <FilterTitle titleSelectStatus={titleSelectStatus} ClickHandler={ClickHandler} />
          {/* 前三个菜单对应内容 */}
          {renderFilterPicker()}

          {/* 最后一个菜单对应内容 */}
          {renderFilterMore()}
        </div>
      </div>
    )
  }
}
