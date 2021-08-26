import React, {Component} from 'react'
import {Flex} from 'antd-mobile'
import PropTypes from 'prop-types'

/* 导入样式 */
import style from './footer.module.scss'

export default class FilterFooter extends Component {

  static propTypes = {
    cancelText: PropTypes.string,
    okText: PropTypes.string,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
    className: PropTypes.string,
    type: PropTypes.string.isRequired
  }

  render() {
    const {cancelText = '取消', okText = '确定', onCancel, className, onOk, type} = this.props
    return (
      <Flex className={[style.root, className || ''].join(' ')}>
        {/* 取消按钮 */}
        <span
          className={[style.btn, style.cancel].join(' ')}
          onClick={() => onCancel(type)}
        >
        {cancelText}
      </span>

        {/* 确定按钮 */}
        <span className={[style.btn, style.ok].join(' ')} onClick={onOk}>
        {okText}
      </span>
      </Flex>
    )
  }
}
