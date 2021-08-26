import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {BASE_URL} from '../../utils'
// 导入样式
import styles from './NoHouse.module.scss'

export default class NoHouse extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    const {children} = this.props

    return (
      <div className={styles.root}>
        <img className={styles.img} src={`${BASE_URL}/images/not-found.png`} alt="暂无数据"/>
        <p className={styles.msg}>{children}</p>
      </div>
    )
  }
}
