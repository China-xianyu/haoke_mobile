import React, {Component} from 'react'
import {Flex} from "antd-mobile";
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types'

// 导入样式
import './SearchHeader.scss'

class SearchHeader extends Component {

  static propTypes = {
    curCityName: PropTypes.string.isRequired,
    className: PropTypes.string
  }

  render() {
    const {curCityName, className, history} = this.props
    return (
      <Flex className={["index_search_box", className || ''].join(' ')}>
        {/* 左侧白色区域 */}
        <Flex className="index_search">
          {/* 位置 */}
          <div className="index_location" onClick={() => history.push('/citylist')}>
            <span className="name">{curCityName}</span>
            <i className="iconfont icon-arrow"/>
          </div>

          {/* 搜索表单 */}
          <div className="index_form" onClick={() => history.push('/search')}>
            <i className="iconfont icon-seach"/>
            <span className="search_text">请输入小区或地区</span>
          </div>
        </Flex>
        {/* 右侧地图图标 */}
        <i className="iconfont icon-map" onClick={() => history.push('/map')}/>
      </Flex>
    )
  }
}

export default withRouter(SearchHeader)
