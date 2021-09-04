import React, {Component} from 'react'
import {Carousel, Flex, Grid, WingBlank, Toast} from 'antd-mobile'
import propTypes from 'prop-types'
import {connect} from 'react-redux'

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
import SearchHeader from '../../components/SearchHeader'
import HouseItem from '../../components/HouseItem'
import {getGroups, getSwipers, getRecommend} from '../../redux/actions'

// 导航菜单数据
const navs = [
  {id: 1, img: Nav1, title: '整租', path: '/home/list', state: {entire: 1}},
  {id: 2, img: Nav2, title: '合租', path: '/home/list', state: {entire: 0}},
  {id: 3, img: Nav3, title: '地图找房', path: '/map', state: {}},
  {id: 4, img: Nav4, title: '去出租', path: '/rent/add', state: {}}
]

class Index extends Component {

  state = {
    // 当前城市的名字
    curCityName: '',
  }

  static propTypes = {
    // 租房小组数据
    groups: propTypes.array.isRequired,
    getGroups: propTypes.func.isRequired,
    // 轮播图数据
    getSwipers: propTypes.func.isRequired,
    // 推荐房源
    getRecommend: propTypes.func.isRequired,
    recommend: propTypes.array.isRequired,
  }

  // 渲染轮播图结构
  renderSwiper = () => {
    return this.props.swipers.map(item => (
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
    return this.props.recommend.map(item => (
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
    Toast.loading('正在加载中', 0, null, false)
    // 获取租房小组数据
    this.props.getGroups()
    // 获取轮播图数据
    this.props.getSwipers()
    this.props.getRecommend();

    // 获取当前城市信息
    (async () => {
      const result = await getCurrentCity()
      Toast.hide()
      return result
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
  }

  render() {
    const {curCityName} = this.state
    const {groups, swipers} = this.props
    let isSwipersLoaded = swipers.length > 0
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

export default connect(
  state => {
    return {
      groups: state.groups,
      swipers: state.swipers,
      recommend: state.recommend
    }
  },
  {getGroups, getSwipers, getRecommend}
)(Index)
