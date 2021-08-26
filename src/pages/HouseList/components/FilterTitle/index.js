import React, {Component} from 'react'
import {Flex} from 'antd-mobile'
import PropTypes from 'prop-types'

// 导入样式
import style from './FilterTitle.module.scss'

const titleList = [
  {title: '区域', type: 'area'},
  {title: '方式', type: 'mode'},
  {title: '租金', type: 'price'},
  {title: '筛选', type: 'more'}
]

export default class FilterTitle extends Component {

  static propTypes = {
    titleSelectStatus: PropTypes.object.isRequired,
    ClickHandler: PropTypes.func.isRequired
  }

  render() {
    const {titleSelectStatus, ClickHandler} = this.props
    return (
      <Flex align="center" className={style.root}>
        {titleList.map(item => {
          const isSelected = titleSelectStatus[item.type]
          return (
            <Flex.Item key={item.type} onClick={() => ClickHandler(item.type)}>
              <span className={[style.dropdown, isSelected ? style.selected : ''].join(' ')}>
                <span>{item.title}</span>
                <i className="iconfont icon-arrow"/>
              </span>
            </Flex.Item>
          )
        })}
      </Flex>
    )
  }
}
