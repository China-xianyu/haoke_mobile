import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Toast} from 'antd-mobile'

// 导入样式
import style from './map.module.css'
import NavHeader from '../../components/NavHeader'
import {API} from '../../utils'

// 文本覆盖物样式设置
const labelStyle = {
  padding: '0px',
  fontSize: '12px',
  color: 'rgb(255, 255, 225)',
  textAlign: 'center',
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  whiteSpace: 'nowrap'
}

export default class Map extends Component {

  state = {
    // 房源数据
    housesList: [],
    // 表示是否显示房源列表
    isShowList: false
  }

  // 渲染地图
  initMap = () => {
    /* 获取当前定位城市 */
    const {label} = JSON.parse(localStorage.getItem('hkzf_city'))
    /* 初始化地图实例 */
    const map = new window.BMap.Map("container");
    // 公有化
    this.map = map
    //创建地址解析器实例
    const myGeo = new window.BMap.Geocoder();
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(label + '市',
      async point => {
        if (point) {
          /* 根据坐标初始化地图 */
          map.centerAndZoom(point, 11);
          const {label, value} = JSON.parse(localStorage.getItem('hkzf_city'))
          this.renderOverlays(value, label)

          // 添加比例尺控件
          map.addControl(new window.BMap.ScaleControl())
          // 添加平移缩放控件
          map.addControl(new window.BMap.NavigationControl())
        }
      }, label + '市')

    /* 移动地图 隐藏房源列表 */
    map.addEventListener('movestart', () => {
      const {isShowList} = this.state
      if (isShowList) this.setState({isShowList: false})
    })
  }

  // 渲染遮盖物入口
  async renderOverlays(id) {
    try {
      const {label: cityName} = JSON.parse(localStorage.getItem('hkzf_city'))
      const result = await API.get(`/area/map?id=${id}&city_name=${cityName}`)

      if (result) {
        /* 数据加载回来之后隐藏加载动画 */
        Toast.hide()
      }

      const data = result.data.body

      // 获取下一个缩放级别和渲染类型
      const {nextZoom, type} = this.getTypeAndZoom()

      data.forEach(item => {
        // 创建遮盖物
        this.createOverlays(item, nextZoom, type)
      })
    } catch (e) {
      /* 请求失败依旧关闭加载动画 */
      Toast.hide()
    }
  }

  // 计算要绘制的遮盖物类型和下一个缩放级别
  getTypeAndZoom() {
    // 调用 getZoom方法 获取当前缩放级别
    const zoom = this.map.getZoom()
    // 用来存储下一个缩放级别和渲染类型的变量
    let nextZoom, type

    if (zoom >= 10 && zoom < 12) {
      // 区
      nextZoom = 13
      // circle 表示绘制的是圆形的遮盖物 (除小区之外)
      type = 'circle'
    } else if (zoom >= 12 && zoom < 14) {
      nextZoom = 15
      type = 'circle'
    } else if (zoom >= 14 && zoom < 16) {
      // rect 表示绘制的是方形的遮盖物 (小区类型)
      type = 'rect'
    }

    return {nextZoom, type}
  }

  // 创建遮盖物
  createOverlays(data, zoom, type) {

    // 解析数据
    const {coord: {longitude, latitude}, label: areaName, count, value} = data

    // 转为经纬度
    const areaPoint = new window.BMap.Point(longitude, latitude)

    if (type === 'circle') {
      // 区或者镇
      this.createCircle({areaPoint, areaName, count, value}, zoom)
    } else {
      // 小区
      this.createRect({areaPoint, areaName, count, value})
    }
  }

  // 创建区、镇覆盖物
  createCircle(options, zoom) {
    // 解析数据
    const {areaPoint, areaName, count, value} = options

    const opts = {
      position: areaPoint,
      offset: new window.BMap.Size(-35, -35)
    }

    // 使用了setContent之后 这里设置的label文本内容就无效了 直接传递null就行了
    const label = new window.BMap.Label(null, opts)

    // 设置房源覆盖物的结构
    label.setContent(`
      <div class="${style.bubble}">
        <p class="${style.name}">${areaName}</p>
        <p>${count}套</p>
      </div>
    `)

    // 文本覆盖物样式设置
    label.setStyle(labelStyle)

    // 文本覆盖物添加单击事件
    label.addEventListener('click', () => {
      /* 请求数据时显示加载动画 */
      Toast.loading('正在加载', 0, null, false)

      /* 渲染入口 */
      this.renderOverlays(value)

      // 以点击位置为中心 放大地图
      this.map.centerAndZoom(areaPoint, zoom);

      // 清楚所有覆盖物 防止百度地图API自身报错
      setTimeout(() => this.map.clearOverlays(), 0)
    })

    this.map.addOverlay(label)
  }

  // 创建小区覆盖物
  createRect({areaPoint, areaName, count, value}) {
    const opts = {
      position: areaPoint,
      offset: new window.BMap.Size(-50, -28)
    }

    // 使用了setContent之后 设置的label文本内容就无效了 直接传递null就行了
    const label = new window.BMap.Label(null, opts)

    // 设置房源覆盖物的结构
    label.setContent(`
      <div class="${style.rect}">
        <span class="${style.housesname}">${areaName}</span>
        <span class="${style.housesnum}">${count}套</span>
        <i class="${style.arrow}"></i>
      </div>
    `)

    // 文本覆盖物样式设置
    label.setStyle(labelStyle)

    // 文本覆盖物添加单击事件
    label.addEventListener('click', (event) => {
      /* 请求数据时显示加载动画 */
      Toast.loading('正在加载', 0, null, false)

      /* 获取房屋数据 */
      this.getHousesList(value)

      /* 点击对象 */
      const target = event.changedTouches[0]
      /* 被点击对象移动到地图可视区中心 */
      const x = window.innerWidth / 2 - target.clientX,
        y = (window.innerHeight - 330) / 2 - target.clientY
      this.map.panBy(x, y)

    })

    this.map.addOverlay(label)
  }

  /* 获取房屋数据 */
  async getHousesList(id) {

    try {
      const result = await API.get(`/houses?id=${id}`)

      if (result) {
        /* 数据加载回来之后隐藏加载动画 */
        Toast.hide()
      }

      this.setState({
        housesList: result.data.body,
        isShowList: true
      })
    } catch (e) {
      /* 请求失败依旧关闭加载动画 */
      Toast.hide()
    }
  }

  renderHouseList = () => {
    const {housesList} = this.state
    return housesList.map(item => (
      <div key={item['houseCode']} className={style.house}
           onClick={() => this.props.history.replace(`/houseDetail/${item.houseCode}`)}>
        {/* 房屋图片 */}
        <div className={style.imgWrap}>
          <img className={style.img} src={item.houseImg} alt=""/>
        </div>
        {/* 房屋简单介绍 */}
        <div className={style.content}>
          <h3 className={style.title}>{item.title}</h3>
          <div className={style.desc}>{item.desc}</div>
          {/* 特点 */}
          <div>
            {
              item.tags.map((tag, index) => {
                const tagClass = 'tag' + (index + 1)
                return <span key={tag} className={[style.tag, style[tagClass]].join(' ')}>{tag}</span>
              })
            }
          </div>
          {/* 价格 */}
          <div className={style.price}>
            <span className={style.priceNum}>{item.price}</span> 元/月
          </div>
        </div>
      </div>
    ))
  }

  componentDidMount() {
    /* 请求数据时显示加载动画 */
    Toast.loading('正在加载', 0, null, false)

    this.initMap()
  }

  componentWillUnmount() {
    Toast.hide()
  }

  render() {
    const {isShowList} = this.state
    const {renderHouseList} = this

    return (
      <div className={style.map}>
        {/* 顶部导航栏 */}
        <NavHeader title="地图找房"/>

        {/* 地图容器元素 */}
        <div id="container" className={style.container}/>

        {/* 房源列表 */}
        <div>
          <div className={[style.houseList, isShowList ? style.show : ''].join(' ')}>
            <div className={style.titleWrap}>
              <h1 className={style.listTitle}>房屋列表</h1>
              <Link className={style.titleMore} to="/home/list">更多房源</Link>
            </div>
            {/* 列表 */}
            <div className={style.houseItems}>
              {/* 房屋结构 */}
              {renderHouseList()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
