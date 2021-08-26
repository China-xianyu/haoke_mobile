import React, {Component} from 'react'

import {Carousel, Flex, Toast, Modal} from 'antd-mobile'

import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'
import HousePackage from '../../components/HousePackage'

import {BASE_URL, API, isAuth, getToken} from '../../utils'

import styles from './HouseDetail.module.scss'

// 猜你喜欢
const recommendHouses = [
  {
    id: 1,
    houseImg: '/images/message/1.png',
    desc: '72.32㎡/南 北/低楼层',
    title: '安贞西里 3室1厅',
    price: 4500,
    tags: ['随时看房']
  },
  {
    id: 2,
    houseImg: '/images/message/2.png',
    desc: '83㎡/南/高楼层',
    title: '天居园 2室1厅',
    price: 7200,
    tags: ['近地铁']
  },
  {
    id: 3,
    houseImg: '/images/message/3.png',
    desc: '52㎡/西南/低楼层',
    title: '角门甲4号院 1室1厅',
    price: 4300,
    tags: ['集中供暖']
  }
]

// 百度地图
const BMap = window.BMap
// 百度地图样式
const labelStyle = {
  position: 'absolute',
  zIndex: -7982820,
  backgroundColor: 'rgb(238, 93, 91)',
  color: 'rgb(255, 255, 255)',
  height: 25,
  padding: '5px 10px',
  lineHeight: '14px',
  borderRadius: 3,
  boxShadow: 'rgb(204, 204, 204) 2px 2px 2px',
  whiteSpace: 'nowrap',
  fontSize: 12,
  userSelect: 'none'
}

export default class HouseDetail extends Component {
  state = {
    isLoading: false,
    houseInfo: {
      // 房屋图片
      slides: [],
      // 标题
      title: '',
      // 标签
      tags: [],
      // 租金
      price: 0,
      // 房型
      roomType: '两室一厅',
      // 房屋面积
      size: 89,
      // 装修类型
      renovation: '精装',
      // 朝向
      oriented: [],
      // 楼层
      floor: '',
      // 小区名称
      community: '',
      // 地理位置
      coord: {
        latitude: '39.928033',
        longitude: '116.529466'
      },
      // 房屋配套
      supporting: [],
      // 房屋标识
      houseCode: '',
      // 房屋描述
      description: ''
    },
    isFavorite: false
  }

  // 获取房屋信息
  async getHouseDetail(id) {
    this.setState({
      isLoading: true
    })

    /* 请求数据的时 开启 loading 动画 */
    Toast.loading('加载房屋详情中', 0, null, false)

    try {
      const result = await API.get(`/houses/houseDetail/?id=${id}`)

      this.setState({
        houseInfo: result.data.body,
        isLoading: false
      })

      this.addHistory(result.data.body.houseId)
      /* 数据加载完成 关闭 loading 动画 */
      Toast.hide()

      const {community, coord} = result.data.body
      /* 渲染地图 */
      this.renderMap(community, JSON.parse(coord))
    } catch (e) {
      /* 请求数据出错 关闭 loading 动画 */
      Toast.hide()
      Toast.fail('房源详情加载失败', 1, null, false)
    }
  }

  // 渲染轮播图结构
  renderSwipers() {
    const {
      houseInfo: {slides}
    } = this.state

    return slides.map((item, index) => (
      (<a
        key={index}
        href="http://localhost:3000"
        style={{
          display: 'inline-block',
          width: '100%',
          height: '252px'
        }}
      >
        <img
          src={item}
          alt=""
          style={{width: '100%', verticalAlign: 'top', height: '252px'}}
        />
      </a>)
    ))
  }

  // 渲染地图
  renderMap(community, coord) {

    const {latitude, longitude} = coord

    const map = new BMap.Map('map')
    const point = new BMap.Point(longitude, latitude)
    map.centerAndZoom(point, 17)

    const label = new BMap.Label('', {
      position: point,
      offset: new BMap.Size(0, -36)
    })

    label.setStyle(labelStyle)
    label.setContent(`
      <span>${community}</span>
      <div class="${styles.mapArrow}"></div>
    `)
    map.addOverlay(label)
  }

  // 切换房源收藏
  handleFavorite = async () => {
    const isLogin = isAuth()
    const {location, history} = this.props
    const {isFavorite} = this.state
    const {id: houseCode} = this.props.match.params
    const token = getToken()

    if (isLogin) {
      /* 开启加载动画 */
      Toast.loading('正在加载中', 0, null, false)
    }

    if (!isLogin && !token) {
      // 未登录
      return Modal.alert('提示', '登录后才能收藏房源，是否去登录？', [
        {text: '取消'},
        {text: '去登陆', onPress: () => history.push('/login', {from: location})}
      ])
    }

    // 已登录
    if (!isFavorite) {
      // 未收藏
      const result = await API({
        method: 'POST',
        url: '/user/favorites',
        data: {
          house_code: houseCode,
          authorization: getToken()
        }
      })

      /* 关闭加载动画 */
      Toast.hide()

      const {status} = result.data
      if (status === 200) {
        this.setState({
          isFavorite: true
        })
        Toast.info('已收藏', 1, null, false);
      } else {
        Toast.info('登录超时，请重新登录', 2, null, false)
      }

    } else {
      // 已收藏
      const result = await API({
        method: 'DELETE',
        url: '/user/favorites',
        data: {
          house_code: houseCode,
          authorization: getToken()
        }
      })

      /* 关闭加载动画 */
      Toast.hide()

      const {status} = result
      if (status === 200) {
        this.setState({
          isFavorite: false
        })
        Toast.info('已取消收藏', 1, null, false)
      } else {
        Toast.info('登录超时，请重新登录', 2, null, false)
      }
    }
  }

  // 检查房源是否收藏
  async checkFavorite(houseCode) {

    /* 验证是否登录 */
    const isLogin = isAuth()
    if (!isLogin) {
      return;
    }

    /* 请求验证是否收藏 */
    const result = await API.get('/user/favorites', {
      params: {
        house_code: houseCode,
        authorization: getToken()
      }
    })

    const {body: {isFavorite}, status} = result.data

    if (status === 200) {
      /* 更新数据 */
      this.setState({
        isFavorite
      })
    }

  }

  // 添加到历史记录
  async addHistory(houseId) {
    await API({
      method: 'POST',
      url: '/user/history',
      data: {
        houseId,
        authorization: getToken()
      }
    })
  }

  /* 渲染 tag 标签 */
  renderTags = () => {
    const {tags} = this.state.houseInfo

    return tags.map((item, index) => {
      if (index > 3) index = 2
      const tagClass = styles['tag' + (index + 1)]
      return (
        <span key={item} className={[styles.tag, tagClass].join(' ')}>
                    {item}
                  </span>
      )
    })
  }

  componentDidMount() {
    /* 获取当前房屋id */
    const id = this.props.match.params.id
    /* 请求数据 */
    this.getHouseDetail(id)

    /* 验证是否收藏 */
    this.checkFavorite(id)

    window.scrollTo(0, 0)
  }

  render() {
    const {
      isLoading,
      isFavorite,
      houseInfo: {
        title,
        price,
        roomType,
        size,
        oriented,
        floor,
        community,
        supporting,
        description
      }
    } = this.state
    const {renderTags, handleFavorite} = this
    return (
      <div className={styles.root}>
        {/* 顶部导航栏 */}
        <NavHeader
          title={title}
          className={styles.navHeader}
          rightContent={<i className="iconfont icon-share"/>}
        >
          {title}
        </NavHeader>

        {/* 轮播图 */}
        <div className={styles.slides}>
          {!isLoading ? (
            <Carousel autoplay infinite autoplayInterval={5000}>
              {this.renderSwipers()}
            </Carousel>
          ) : (
            ''
          )}
        </div>

        {/* 房屋基础信息 */}
        <div className={styles.info}>
          <h3 className={styles.infoTitle}>
            {title}
          </h3>

          <Flex className={styles.tags}>
            <Flex.Item>
              {renderTags()}
            </Flex.Item>
          </Flex>

          <Flex className={styles.infoPrice}>
            <Flex.Item className={styles.infoPriceItem}>
              <div>
                {price}
                <span className={styles.month}>/月</span>
              </div>
              <div>租金</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>{roomType}</div>
              <div>房型</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>{size}</div>
              <div>面积</div>
            </Flex.Item>
          </Flex>

          <Flex className={styles.infoBasic} align="start">
            <Flex.Item>
              <div>
                <span className={styles.title}>装修：</span>
                {/*{renovation}*/}
                精装
              </div>
              <div>
                <span className={styles.title}>楼层：</span>
                {!Number(floor) ? floor : floor + ' 楼'}
              </div>
            </Flex.Item>
            <Flex.Item>
              <div>
                <span className={styles.title}>朝向：</span>{oriented.join('、')}
              </div>
              <div>
                <span className={styles.title}>类型：</span>普通住宅
              </div>
            </Flex.Item>
          </Flex>
        </div>

        {/* 地图位置 */}
        <div className={styles.map}>
          <div className={styles.mapTitle}>
            小区：
            <span>{community}</span>
          </div>
          <div className={styles.mapContainer} id="map">
            {/* 地图渲染容器 */}
          </div>
        </div>

        {/* 房屋配套 */}
        <div className={styles.about}>
          <div className={styles.houseTitle}>房屋配套</div>
          {supporting.length === 0 ? <div className={styles.titleEmpty}>暂无数据</div> : <HousePackage
            list={supporting}
          />}
        </div>

        {/* 房屋概况 */}
        <div className={styles.set}>
          <div className={styles.houseTitle}>房源概况</div>
          <div>
            <div className={styles.contact}>
              <div className={styles.user}>
                <img src={BASE_URL + '/images/profile/avatar.png'} alt="头像"/>
                <div className={styles.useInfo}>
                  <div>王女士</div>
                  <div className={styles.userAuth}>
                    <i className="iconfont icon-auth"/>
                    已认证房主
                  </div>
                </div>
              </div>
              <span className={styles.userMsg}>发消息</span>
            </div>

            <div className={styles.descText}>
              {description || '暂无房屋描述'}
            </div>
          </div>
        </div>

        {/* 推荐 */}
        <div className={styles.recommend}>
          <div className={styles.houseTitle}>猜你喜欢</div>
          <div className={styles.items}>
            {recommendHouses.map(item => (
              <HouseItem {...item} key={item.id} onClick={a => a} src={`${BASE_URL}/${item.houseImg}`}/>
            ))}
          </div>
        </div>

        {/* 底部收藏按钮 */}
        <Flex className={styles.fixedBottom}>
          <Flex.Item onClick={handleFavorite}>
            <img
              src={isFavorite ? (BASE_URL + '/images/star.png') : (BASE_URL + '/images/unstar.png')}
              className={styles.favoriteImg}
              alt="收藏"
            />
            <span className={styles.favorite}>{isFavorite ? '已收藏' : '收藏'}</span>
          </Flex.Item>
          <Flex.Item>在线咨询</Flex.Item>
          <Flex.Item>
            <a href="tel:400-618-4000" className={styles.telephone}>
              电话预约
            </a>
          </Flex.Item>
        </Flex>
      </div>
    )
  }
}
