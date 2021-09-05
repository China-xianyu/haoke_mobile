import React, {Component} from 'react'
import PropTypes from 'prop-types'
import RcQueueAnim from 'rc-queue-anim'
import PubSub from 'pubsub-js'

import FilterFooter from '../../../../components/FilterFooter'
import style from './FilterMore.module.scss'

export default class FilterMore extends Component {

  state = {
    selectedValues: this.props.defaultValues
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    defaultValues: PropTypes.array,
    show: PropTypes.bool.isRequired
  }

  /* 切换选中状态 */
  onTagClickHandler = (value) => {
    const {selectedValues} = this.state
    /* 不直接更新数据 */
    let newSelectValues = [...selectedValues]

    /* 判断数据是否存在 */
    if (newSelectValues.indexOf(value) <= -1) {
      /* 不存在 添加 */
      newSelectValues.push(value)
    } else {
      /* 存在 删除 */
      const index = newSelectValues.findIndex(item => item === value)
      newSelectValues.splice(index, 1)
    }

    /* 更新状态 */
    this.setState({
      selectedValues: newSelectValues
    })
  }

  /* 确定处理 */
  onOk = () => {
    const {type, onSave} = this.props
    // 订阅筛选房源事件
    PubSub.publish('getHouse')
    onSave(type, this.state.selectedValues)
  }

  /* 取消处理 */
  onCancel = () => {
    this.setState({
      selectedValues: []
    })
  }

  /* 渲染标签 */
  renderFilter = (data) => {
    const {onTagClickHandler} = this
    const {selectedValues} = this.state
    /* 高亮类名: style.tagActive */
    return data.map(item => {
        const isSelected = selectedValues.indexOf(item['value']) > -1
        return (
          <span
            key={item['value']}
            className={[style.tag, isSelected ? style.tagActive : ''].join(' ')}
            onClick={() => onTagClickHandler(item['value'])}>
            {item['label']}
          </span>
        )
      }
    )
  }

  render() {
    const {renderFilter, onCancel, onOk} = this
    const {type} = this.props
    const {data: {characteristic, floor, oriented, roomType}, show} = this.props
    return (
      <div className={style.root}>
        {/* 遮盖层 */}
        <RcQueueAnim animConfig={[{opacity: [1, 0]}]} duration={1000}>
          {show ? <div key="3" className={style.mask} onClick={() => this.props.onCancel(type)}/> : null}
        </RcQueueAnim>

        {/* 条件内容 */}
        <RcQueueAnim>
          {show ? (
            <div key="4" className={style.tags}>
              <dl className={style.dl}>
                <dt className={style.dt}>户型</dt>
                <dd className={style.dd}>{renderFilter(roomType)}</dd>

                <dt className={style.dt}>楼层</dt>
                <dd className={style.dd}>{renderFilter(floor)}</dd>

                <dt className={style.dt}>朝向</dt>
                <dd className={style.dd}>{renderFilter(oriented)}</dd>

                <dt className={style.dt}>房屋亮点</dt>
                <dd className={style.dd}>{renderFilter(characteristic)}</dd>
              </dl>

              {/* 底部按钮 */}
              <FilterFooter cancelText="清除" className={style.footer} onCancel={() => onCancel()} onOk={onOk}
                            type={type}/>
            </div>
          ) : null}
        </RcQueueAnim>
      </div>
    )
  }
}
