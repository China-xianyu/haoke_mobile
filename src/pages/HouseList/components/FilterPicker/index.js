import React, {Component} from 'react'
import {PickerView} from 'antd-mobile'
import PropTypes from 'prop-types'

import FilterFooter from '../../../../components/FilterFooter'

export default class FilterPicker extends Component {

  state = {
    /* 选中的数据 */
    value: this.props.defaultValue
  }

  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    cols: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    defaultValue: PropTypes.array.isRequired,
  }

  render() {
    /* type:表示是哪一种数据 */
    const {onCancel, onSave, data, cols, type} = this.props
    const {value} = this.state
    return (
      <div>
        <PickerView data={data} value={value} cols={cols} onChange={value => {
          this.setState({
            value
          })
        }}/>

        <FilterFooter onCancel={() => onCancel(type)} onOk={() => onSave(type, value)} type={type}/>
      </div>
    )
  }
}
