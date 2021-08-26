import React, {Component} from 'react'
import {SearchBar} from 'antd-mobile'

import {API, getCity} from '../../../utils'

// 导入样式
import styles from './Search.module.scss'

export default class Search extends Component {

  state = {
    searchTxt: '',
    tipsList: []
  }

  // 当前城市id
  cityId = getCity().value
  // 请求计时器id
  timeId = null

  // 当改变搜索框的值时，搜索
  handleChange = value => {

    this.setState({
      searchTxt: value
    })

    if (value.length === 0) {
      this.setState({
        tipsList: []
      })
      return
    }

    clearTimeout(this.timeId)

    this.timeId = setTimeout(async () => {
      const result = await API.get('/area/community', {
        params: {
          id: this.cityId,
          name: value
        }
      })

      const {body} = result.data
      this.setState({
        tipsList: body
      })
    }, 500)
  }

  // 渲染搜索结果列表
  renderTips = () => {
    const {tipsList} = this.state

    return tipsList.map(item => (
      <li key={item.community} className={styles.tip} onClick={() => {
        const {community, communityName} = item
        // replace的第二个参数为要传给跳转页面的数据
        this.props.history.replace('/rent/add', {
          community,
          communityName
        })
      }}>
        {item.communityName}
      </li>
    ))
  }

  render() {
    const {searchTxt} = this.state
    const {history} = this.props
    const {handleChange, renderTips} = this

    return (
      <div className={styles.root}>
        <SearchBar
          className="search"
          value={searchTxt}
          placeholder='请输入小区或者地址'
          showCancelButton
          onCancel={() => history.replace('/rent/add')}
          onChange={handleChange}
        />

        {/* 搜索提示列表 */}
        <ul className={styles.tips}>{renderTips()}</ul>
      </div>
    )
  }
}
