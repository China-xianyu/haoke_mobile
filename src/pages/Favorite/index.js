import React, {Component} from 'react'
import {Toast} from 'antd-mobile'

import NavHeader from "../../components/NavHeader";
import HouseItem from "../../components/HouseItem";
import NoHouse from '../../components/NoHouse'
import {API} from '../../utils'


// 导入样式
import styles from './Favorite.module.scss'
import {Link} from "react-router-dom";

export default class Favorite extends Component {

  state = {
    favoriteList: [],
    isLoading: false
  }

  // 获取收藏列表
  async getFavorite() {
    Toast.loading('正在加载中', 0, null, false)
    const result = await API.post('/user/favorite')
    const {body, status} = result.data
    if (status === 200) {
      Toast.hide()
      this.setState({
        favoriteList: body,
        isLoading: true
      })
    } else {
      Toast.hide()
      Toast.info('加载失败，登录信息失效', 1, () => {
        this.props.history.replace('/login', {from: this.props.location})
      }, false)
    }
  }

  // 渲染收藏列表
  renderHouseItem = () => {
    const {favoriteList} = this.state
    return favoriteList.map(item => (
      <HouseItem
        key={item.houseCode}
        onClick={() => this.props.history.push(`/houseDetail/${item.houseCode}`)}
        title={item.title}
        desc={item.desc}
        price={item.price}
        src={item.houseImg}
        tags={item.tags}
      />
    ))
  }

  renderFavoriteList = () => (
    <NoHouse>
      您还没有收藏房源，
      <Link to="/home/list" className={styles.link}>
        快去收藏房源
      </Link>
      吧!
    </NoHouse>
  )

  componentDidMount() {
    this.getFavorite()
  }

  render() {
    const {favoriteList} = this.state
    const {renderFavoriteList, renderHouseItem} = this

    return (
      <div>
        <NavHeader title="我的收藏"/>
        <div className={favoriteList.length > 0 ? styles.houses : ''}>
          {renderHouseItem() || renderFavoriteList()}
        </div>
      </div>
    )
  }
}
