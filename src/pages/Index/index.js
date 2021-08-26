import React, {Component} from 'react'
import {Carousel, Flex, Grid, WingBlank, Toast} from 'antd-mobile'
import axios from 'axios'

// 导入utils工具方法
import {getCurrentCity} from '../../utils'
// 导入导航菜单图片
import Nav1 from '../../assets/images/nav-1.png'
import Nav2 from '../../assets/images/nav-2.png'
import Nav3 from '../../assets/images/nav-3.png'
import Nav4 from '../../assets/images/nav-4.png'
// 引入样式
import './index.scss'
// 引入图标样式
import '../../assets/fonts/iconfont.css'
import {API} from '../../utils'
import SearchHeader from '../../components/SearchHeader'
import HouseItem from '../../components/HouseItem'

// 导航菜单数据
const navs = [
  {id: 1, img: Nav1, title: '整租', path: '/home/list', state: {entire: 1}},
  {id: 2, img: Nav2, title: '合租', path: '/home/list', state: {entire: 0}},
  {id: 3, img: Nav3, title: '地图找房', path: '/map', state: {}},
  {id: 4, img: Nav4, title: '去出租', path: '/rent/add', state: {}}
]

export default class Index extends Component {

  state = {
    // 轮播图数据
    swipers: [],
    isSwipersLoaded: false,
    // 租房小组数据
    groups: [],
    // 最新资讯数据
    recommend: [],
    // 当前城市的名字
    curCityName: ''
  }

  cancel = null

  // 获取轮播图数据
  async getSwiper() {
    const result = await API.get('/home/swiper/')
    this.setState({
      swipers: result.data.body,
      isSwipersLoaded: true
    })
  }

  // 获取租房小组数据
  async getGroups() {
    const result = await API.get('/home/group')
    this.setState({
      groups: result.data.body
    })
  }

  // 获取推荐房源
  async getRecommend() {
    try {
      Toast.loading('正在加载中', 0, null, false)
      const result = await API({
        url: '/home/recommend',
        cancelToken: new axios.CancelToken((c) => this.cancel = c)
      })
      Toast.hide()
      if (result) {
        this.setState({
          recommend: result.data.body
        })
      }
    } catch (e) {

    }
  }

  // 渲染轮播图结构
  renderSwiper = () => {
    return this.state.swipers.map(item => (
      <a
        key={item.id}
        href="http://localhost:3000"
        style={{display: 'inline-block', width: '100%', height: 212}}
      >
        <img
          src={item.imgSrc}
          alt=""
          style={{width: '100%', verticalAlign: 'top'}}
        />
      </a>
    ))
  }

  // 渲染导航菜单
  renderNav = () => {
    return navs.map(item => (
      <Flex.Item key={item.id} onClick={() => this.props.history.push(item.path, item.state)}>
        <img src={item.img} alt=""/>
        <h2>{item.title}</h2>
      </Flex.Item>
    ))
  }

  // 渲染最新资讯
  renderRecommend = () => {
    return this.state.recommend.map(item => (
      <div key={item.houseCode} onClick={() => this.props.history.push(`/houseDetail/${item.houseCode}`)}>
        <HouseItem
          title={item.title}
          desc={item.desc}
          price={item.price}
          tags={item.tags}
          src={item.houseImg}
        />
      </div>
    ))
  }


  componentDidMount() {
    this.getSwiper()
    this.getGroups()
    this.getRecommend();

    // 获取当前城市信息
    (async () => {
      return await getCurrentCity()
    })().then(
      response => {
        this.setState({
          curCityName: response.label
        })
      }
    )
  }

  componentWillUnmount() {
    Toast.hide()
    this.setState = () => {
    }
    this.cancel()
  }

  render() {
    const {isSwipersLoaded, groups, curCityName} = this.state
    return (
      <div>
        <div className="index">
          {/* 轮播图 */}
          <div className="swiper">
            {
              isSwipersLoaded ?
                <Carousel autoplay infinite>
                  {this.renderSwiper()}
                </Carousel> : ''
            }

            {/* 搜索框 */}
            <SearchHeader curCityName={curCityName}/>

          </div>
          {/* 导航菜单 */}
          <Flex className="index_nav">
            {this.renderNav()}
          </Flex>
          {/* 租房小组 */}
          <div className="index_group">
            <h3 className="group_title">
              租房小组 <span className="more">更多</span>
            </h3>
            <Grid data={groups} activeStyle={false} columnNum={2} hasLine={false} renderItem={item => (
              <Flex className="group-item" justify="around">
                <div className="desc">
                  <p className="title">{item.title}</p>
                  <span className="info">{item.desc}</span>
                </div>
                <img src={item.imgSrc} alt=""/>
              </Flex>
            )} square={false}/>
          </div>
          {/* 最新资讯 */}
          <div className="index_news">
            <h3 className="news_title">为您推荐</h3>
            <WingBlank size="md">
              {this.renderRecommend()}
            </WingBlank>
          </div>
        </div>
      </div>
    )
  }
}
