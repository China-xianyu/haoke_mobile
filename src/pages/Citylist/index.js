import React, {Component} from 'react'
import {Toast} from 'antd-mobile'
import {List, AutoSizer} from 'react-virtualized'

import NavHeader from '../../components/NavHeader'
import {getCurrentCity, API} from '../../utils'
// 导入样式
import styleModule from './citylist.module.css'

const formatCityIndex = (cityIndex) => {
  switch (cityIndex) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热门城市'
    default:
      return cityIndex.toUpperCase()
  }
}

// 标题的高度
const TITLE_HEIGHT = 36
// 每一项城市的高度
const NAME_HEIGHT = 50
// 有房源的城市
const HOUSE_CITY = ['北京', '上海', '广州', '深圳']

export default class Citylist extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // 城市列表索引
      cityIndex: [],
      // 城市列表内容
      cityList: {},
      activeIndex: 0
    }

    this.cityListComponent = React.createRef()
  }

  // 获取每一行的的高度
  getHeight = ({index}) => {
    const {cityIndex, cityList} = this.state
    if (index === 0) {
      return NAME_HEIGHT + TITLE_HEIGHT
    } else {
      return cityList[cityIndex[index]].length * NAME_HEIGHT + TITLE_HEIGHT
    }
  }

  // 切换城市
  changeCity = ({label, value}) => {
    if (HOUSE_CITY.indexOf(label) > -1) {
      // 修改本地数据
      localStorage.setItem('hkzf_city', JSON.stringify({label, value}))
      this.props.history.go(-1)
    } else {
      Toast.info('该城市暂无房源数据', 1, null, false)
    }
  }

  // 渲染城市列表
  rowRenderer = ({key, index, style}) => {
    const {cityIndex, cityList} = this.state
    let letter = cityIndex[index]
    let list = []

    if (index !== 0) {
      for (let i = 0; i < cityList[letter].length; i++) {
        list.push(cityList[letter][i])
      }
    } else {
      list = Array(cityList[letter])
    }

    return (
      <div key={key} style={style} className="city">
        <div className={styleModule.cityListTitle}>{formatCityIndex(letter)}</div>
        {list.map(item => (
          <div className={styleModule.cityListName} key={item['value']} onClick={() => this.changeCity(item)}>
            {item['label']}
          </div>
        ))}
      </div>
    );
  }

  // 格式化城市化列表
  formatCityList(list) {
    const cityList = {}

    list.forEach(item => {
      let first = item.short.substr(0, 1)
      if (first !== "") {
        cityList[first] ? cityList[first].push(item) : cityList[first] = [item]
      }
    })

    const cityIndex = Object.keys(cityList).sort()

    return {
      cityList,
      cityIndex
    }
  }

  // 获取城市列表
  async getCityList() {
    Toast.loading('正在加载中', 0, null, false)

    const result = await API.get('/area/citylist')
    const {cityList, cityIndex} = this.formatCityList(result.data.body)

    // 获取热门城市信息
    const hotResult = await API.get('/area/hot')
    cityList['hot'] = hotResult.data.body
    cityIndex.unshift('hot')
    // 获取当前定位城市信息
    cityList['#'] = await getCurrentCity()
    cityIndex.unshift('#')

    // 关闭loading动画
    Toast.hide()

    this.setState({
      cityIndex,
      cityList
    })
  }

  // 渲染城市列表索引
  renderCityIndex = () => {
    const {cityIndex, activeIndex} = this.state
    return cityIndex.map((item, index) => (
      <li className={styleModule.cityIndexItem} key={item} onClick={() => {
        // 点击更新索引 并跳转到指定位置
        this.cityListComponent.current.scrollToRow(index)
      }}>
          <span className={activeIndex === index ? styleModule.cityActive : ''}>
            {item === 'hot' ? '热' : item.toUpperCase()}
          </span>
      </li>
    ))
  }

  // 获取滚动到位置的索引 并更新高亮索引
  onRowsRendered = ({startIndex}) => {
    const {activeIndex} = this.state
    if (startIndex !== activeIndex) {
      this.setState({activeIndex: startIndex})
    }
  }

  componentDidMount() {
    (async () => {
      await this.getCityList()

      try {
        // 为了保证 scrollToRow 的跳转精度 在List渲染之后调用 measureAllRows
        this.cityListComponent.current.measureAllRows()
      } catch (e) {

      }
    })()
  }

  render() {
    const {cityIndex} = this.state
    const {rowRenderer, getHeight, renderCityIndex, onRowsRendered} = this
    return (
      <div className={styleModule.cityList}>
        {/* 顶部导航栏 */}
        <NavHeader title="城市选择"/>

        {/* 城市列表 */}
        <AutoSizer>
          {({width, height}) => <List
            ref={this.cityListComponent}
            width={width}
            height={height}
            rowCount={cityIndex.length}
            rowHeight={getHeight}
            rowRenderer={rowRenderer}
            onRowsRendered={onRowsRendered}
            scrollToAlignment="start"
          />}
        </AutoSizer>

        {/* 右侧索引列表 */}
        <ul className={styleModule.cityIndex}>
          {renderCityIndex()}
        </ul>
      </div>
    )
  }
}
