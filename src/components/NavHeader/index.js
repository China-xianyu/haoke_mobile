import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {NavBar} from "antd-mobile";
import PropTypes from 'prop-types'

import style from './NavHeader.module.css'

/**
 * 如果没有传递 onLeftClick 会使用 defaultHandler 默认行为
 * 必须传入标题
 */

class NavHeader extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    onLeftClick: PropTypes.func,
    className: PropTypes.string,
    rightContent: PropTypes.object
  }

  defaultHandler = () => {
    this.props.history.go(-1)
  }

  render() {
    const {title, onLeftClick, className, rightContent} = this.props
    const {defaultHandler} = this

    return (
      <NavBar
        className={[style.navHeader, className].join(' ')}
        mode="light"
        icon={<i className="iconfont icon-back"/>}
        onLeftClick={onLeftClick || defaultHandler}
        rightContent={rightContent}
      >{title}</NavBar>
    )
  }
}


export default withRouter(NavHeader)
