import React, {Component} from "react"
import {SearchBar, WingBlank, Toast} from 'antd-mobile'
import {AutoSizer, InfiniteLoader, List, WindowScroller} from 'react-virtualized'

import {API, getCity} from '../../utils'
import HouseItem from '../../components/HouseItem'

// 导入样式
import styles from "./Search.module.scss";

export default class Search extends Component {

  state = {
    searchText: '',
    searchResList: [],
    tipsList: [],
    cityId: getCity()['value'],
    count: 0
  }

  timeId = null

  // 获取搜索结果
  async getHouseList(searchText, cityId) {
    Toast.loading('正在搜索中', 0, null, false)
    const result = await API.get(`/houses/search?q=${searchText}&id=${cityId}&start=0`)

    const {status, body: {list, count}} = result.data
    if (status === 200) {
      Toast.hide()
      Toast.info(`共找到${count}套房源`, 1.5, null, false)
      this.setState({
        searchResList: list,
        count
      })
    }
  }

  // 获取小区名称提示
  async getTips(city_id, searchText) {
    const result = await API.get(`/area/community?id=${city_id}&name=${searchText}&isName=1`)
    const {status, body} = result.data
    if (status === 200) {
      console.log(1)
      this.setState({
        tipsList: body
      })
    }
  }


  /* 修改文本值 */
  ChangeHandler = (value) => {
    const {cityId} = this.state

    clearTimeout(this.timeId)

    this.timeId = setTimeout(() => {
      this.getTips(cityId, value)
    }, 500)

    this.setState({
      searchText: value
    })
  }

  // 手动键盘提交
  SubmitHandler = (value) => {
    window.scrollTo(0, 0)
    const {cityId} = this.state
    this.getHouseList(value, cityId)
    clearTimeout(this.timeId)
    this.setState({
      tipsList: []
    })
  }

  // 判断是否加载完毕
  isLoadMoreRows = ({index}) => {
    const {searchResList} = this.state
    return !!searchResList[index];
  }

  // 加载更多数据
  loadMoreRows = ({startIndex, stopIndex}) => {
    const {searchText, cityId, count, searchResList} = this.state
    return new Promise((resolve, reject) => {
      if (searchResList.length < count) {
        API.get(`/houses/search?q=${searchText}&id=${cityId}&start=${startIndex}`)
          .then(response => {

            this.setState({
              searchResList: [...searchResList, ...response.data.body.list]
            })

            resolve()
          })

      }
    })
  }

  // 渲染每一行
  rowRenderer = ({key, index, style}) => {

    const {searchResList} = this.state
    const house = searchResList[index]

    /* 如果房屋数据不存在 返回一个loading */
    if (!house) {
      return <div key={key} style={style}>
        <p className={styles.loading}/>
      </div>
    }

    return (
      <div key={house.houseCode} style={style}
           onClick={() => this.props.history.replace(`/houseDetail/${house.houseCode}`)}>
        <HouseItem
          desc={house.desc}
          title={house.title}
          src={house.houseImg}
          tags={house.tags}
          price={house.price}
        />
      </div>
    )
  }

  // 渲染搜索结果列表
  renderTips = () => {
    const {tipsList} = this.state

    return tipsList.map(item => (
      <li key={item.community} className={styles.tip} onClick={() => {
        window.scrollTo(0, 0)
        /* 直接搜索小区 */
        const {community_name, city} = item
        this.setState({
          tipsList: [],
          searchText: community_name
        })
        this.getHouseList(community_name, city)
      }}>
        {item.community_name}
      </li>
    ))
  }

  render() {
    const {count} = this.state
    const {ChangeHandler, SubmitHandler, isLoadMoreRows, loadMoreRows, rowRenderer, renderTips} = this

    return (
      <div className={styles.search}>
        <SearchBar
          value={this.state.searchText}
          placeholder="搜索小区或者地区"
          onSubmit={SubmitHandler}
          showCancelButton
          onChange={ChangeHandler}
          onCancel={() => this.props.history.go(-1)}
          className={styles.searchHeader}
        />
        <div className={styles.tips}>
          {renderTips()}
        </div>
        <div className={styles.houseList}>
          <WingBlank>
            <InfiniteLoader
              isRowLoaded={isLoadMoreRows} // 判断当前行是否加载完毕
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
                          rowRenderer={rowRenderer}
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
          </WingBlank>
        </div>
      </div>
    )
  }
}
