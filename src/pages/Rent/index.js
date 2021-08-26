import React, {Component} from 'react'
import {Link} from 'react-router-dom'

import {API, getToken} from '../../utils'

import styles from './Rent.module.scss'

import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'
import NoHouse from '../../components/NoHouse'

export default class Rent extends Component {
  state = {
    list: [],
    isLoading: false
  }

  async getHouseList() {
    const result = await API.get(`user/houses?authorization=${getToken()}`)

    const {status, body} = result.data

    if (status === 200) {
      this.setState({
        list: body,
        isLoading: true
      })
    } else {
      const {history, location} = this.props
      history.replace('/login', {from: location})
    }
  }

  componentDidMount() {
    this.getHouseList()
  }

  renderHouseItem() {
    const {list} = this.state
    const {history} = this.props

    return list.map(item => {
      return (
        <div key={item.houseCode} onClick={() => history.push(`/HouseDetail/${item.houseCode}`)}>
          <HouseItem
            src={item.houseImg}
            title={item.title}
            desc={item.desc}
            tags={item.tags}
            price={item.price}
          />
        </div>
      )
    })
  }

  renderRentList() {
    const {list, isLoading} = this.state
    const hasHouse = list.length > 0

    if (!hasHouse && isLoading) {
      return (
        <NoHouse>
          您还没有发布房源，
          <Link to="/rent/add" className={styles.link}>
            快去发布房源
          </Link>
          吧!
        </NoHouse>
      )
    }

    return <div className={styles.houses}>{this.renderHouseItem()}</div>
  }


  render() {
    const {history} = this.props

    return (
      <div className={styles.root}>
        <NavHeader onLeftClick={() => history.go(-1)} title="房屋管理"/>

        {this.renderRentList()}
      </div>
    )
  }
}

