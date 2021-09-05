import React, {Component} from 'react'
import {Flex, Toast} from 'antd-mobile'
import {connect} from 'react-redux'
import {List, AutoSizer, WindowScroller, InfiniteLoader} from 'react-virtualized'
import PubSub from 'pubsub-js'

import Filter from './components/Filter'
import SearchHeader from '../../components/SearchHeader'
import HouseItem from '../../components/HouseItem'
import Sticky from '../../components/Sticky'
import NoHouse from '../../components/NoHouse'
import {API} from '../../utils'
import styles from './HouseList.module.css'
import {setFilters, getHouses, moreHouses} from '../../redux/actions'


class HouseList extends Component {

  state = {
    curCityName: '',
    isLoading: true
  }

  /* 初始化数据 */
  filters = {}

  /* 获取房屋数据 */
  async searchHouseList(entire = null) {
    const {label} = JSON.parse(localStorage.getItem('hkzf_city'))

    /* 开启 loading 动画 */
    Toast.loading('加载房源中', 0, null, false)
    if (entire !== null) {
      this.filters['mode'] = entire === 1;
    }
    this.setState({isLoading: true})

    /* 获取数据 */
    const result = await API.get('/houses/house', {
      params: {
        cityName: label,
        ...this.filters,
        start: 1,
        end: 20
      }
    })

    /* 存储数据 */
    const {list, count} = result.data.body
    this.setState({list, count, isLoading: false})

    /* 如果数据返回成功 关闭 loading 动画 */
    Toast.hide()

    /* 在没有房源的时候不提示 */
    if (count !== 0) {
      /* 提示房源数量 */
      Toast.info(`共找到${count}套房源`, 2, null, false)
    }
  }

  /* 渲染房屋列表 */
  renderHouseList = ({key, index, style}) => {
    const {list} = this.props
    const house = list[index]

    /* 如果房屋数据不存在 返回一个loading */
    if (!house) {
      return <div key={key} style={style}>
        <p className={styles.loading}/>
      </div>
    }

    return (
      <div key={key} style={style} onClick={() => this.props.history.push(`/houseDetail/${house.houseCode}`)}>
        <HouseItem
          tags={house.tags}
          src={house.houseImg}
          price={house.price * 1}
          desc={house.desc}
          title={house.title}
          ClickHandler={() => {
          }}/>
      </div>
    );
  }

  /* 渲染列表 */
  renderList = () => {
    const {count} = this.props
    const {isLoading} = this.state

    const {renderHouseList, isRowLoaded, loadMoreRows} = this

    if (count === 0 && !isLoading) {
      return <NoHouse>没有找到房源数据，请您换一个搜索条件吧~</NoHouse>
    }

    return (
      <InfiniteLoader
        isRowLoaded={isRowLoaded} // 判断当前行是否加载完毕
        loadMoreRows={loadMoreRows} // 动态加载更多数据
        rowCount={count} // 行的总数
      >
        {({onRowsRendered, registerChild}) => (
          <WindowScroller>
            {({height, isScrolling, scrollTop}) => (
              <AutoSizer>
                {({width}) => (
                  <List
                    autoHeight
                    ref={(ref) => {
                      this.HouseListEl = ref
                      return registerChild
                    }}
                    onRowsRendered={onRowsRendered}
                    width={width} // 视口宽度
                    height={height} // 视口高度
                    rowCount={count}
                    rowHeight={120}
                    rowRenderer={renderHouseList}
                    isScrolling={isScrolling} // 将 WindowScroller 的滚动状态同步到 List 中
                    scrollTop={scrollTop} // 将 WindowScroller 的滚动状态同步到 List 中
                    style={{'paddingBottom': '45px'}}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    )
  }

  /* 判断该行是否加载完毕 */
  isRowLoaded = ({index}) => {
    const {list} = this.props
    return !!list[index]
  }

  /* 动态加载数据的方法 (当前方法必须返回一个 Promise 并且在数据返回时调用 resolve 即可) */
  loadMoreRows = ({startIndex, stopIndex}) => {
    const {label} = JSON.parse(localStorage.getItem('hkzf_city'))
    const {moreHouses} = this.props;
    return new Promise((resolve, reject) => {
      moreHouses(startIndex, label)
      resolve()
    })
  }

  _get_house = (entire) => {
    this.props.getHouses(entire).then(
      () => {
        this.setState({isLoading: true})
        Toast.hide()
      },
      () => {
        this.setState({isLoading: false})
        Toast.hide()
      }
    )
  }

  componentDidMount() {
    let entire;
    if (this.props.location.state) {
      entire = this.props.location.state
    }
    /* 获取当前定位城市 */
    const {label} = JSON.parse(localStorage.getItem('hkzf_city'))
    this.setState({curCityName: label})
    const {_get_house} = this;
    Toast.loading('正在加载中', 0, null, false)
    _get_house(entire)
    // 发布筛选房源事件
    PubSub.subscribe('getHouse', function (msg, data) {
      Toast.loading('正在加载中', 0, null, false)
      _get_house(entire)
    })
  }

  componentDidUpdate() {
    /* 强制重新渲染 */
    if (this.HouseListEl) {
      this.HouseListEl.forceUpdateGrid()
    }
  }

  componentWillUnmount() {
    Toast.hide()
    this.setState = () => {
    }
  }

  render() {
    const {curCityName} = this.state
    const {renderList} = this
    const {setFilters} = this.props
    return (
      <div className={styles.root}>
        {/* 顶部搜索栏 */}
        <Flex className={styles.header}>
          <i className="iconfont icon-back" onClick={() => this.props.history.go(-1)}/>
          <SearchHeader curCityName={curCityName} className={styles.searchHeader}/>
        </Flex>

        {/* 顶置 */}
        <Sticky>
          {/* 条件筛选栏 */}
          <Filter setFilters={setFilters}/>
        </Sticky>

        {/* 房屋列表 */}
        <div className={styles.houseList}>{renderList()}</div>
      </div>
    )
  }
}

export default connect(
  state => ({filters: state.modifyFilters, list: state.houseList, count: state.houseCount}),
  {setFilters, getHouses, moreHouses}
)(HouseList)
