import React, {Component} from "react";
import {WingBlank, Toast, Modal} from 'antd-mobile'

import NavHeader from '../../../components/NavHeader'
import HouseItem from '../../../components/HouseItem'
import NoHouse from '../../../components/NoHouse'
import {API, getToken} from '../../../utils'

// 导入样式
import styles from './LookHistory.module.scss'

const alert = Modal.alert;

export default class LookHistory extends Component {

  state = {
    historyList: [],
    isLoading: false
  }

  // 获取浏览记录
  async getHistory() {

    /* loading 动画 */
    Toast.loading('正在加载中', 0, null, false);

    const {history, location} = this.props
    const result = await API.get(`/user/history?authorization=${getToken()}`)
    const {status, body: historyList} = result.data
    Toast.hide()
    if (status === 200) {
      this.setState({
        historyList,
        isLoading: true
      })
    } else {
      Toast.fail('登录信息失效', 2, () => history.replace('/login', {from: location}), false)
    }
  }

  // 渲染历史列表
  renderHouseItem = () => {
    const {historyList} = this.state
    return historyList.map(item => (
      <div key={item.houseCode} onClick={() => this.props.history.push(`/houseDetail/${item.houseCode}`)}>
        <HouseItem
          title={item.title}
          src={item.houseImg}
          tags={item.tags}
          desc={item.desc}
          price={item.price}
        />
      </div>
    ))
  }

  // 渲染列表
  renderList = () => {
    const {historyList, isLoading} = this.state
    if (historyList.length === 0 && isLoading) {
      return (
        <NoHouse children="没有浏览记录"/>
      )
    }
    return this.renderHouseItem();
  }

  // 删除历史
  removeHistory = () => {
    alert('删除记录吗', '您确定要删除所有浏览记录吗？', [
      {text: '取消'},
      {
        text: '确定', onPress: async () => {
          Toast.loading('正在删除中', 0, null, false)
          const result = await API({
            method: 'DELETE',
            url: '/user/history',
            data: {authorization: getToken()}
          })

          const {status} = result.data
          Toast.hide()
          if (status === 200) {
            Toast.info('删除成功', 1, null, false)
            this.setState({
              historyList: []
            })
          }
        }
      },
    ])
  }

  componentDidMount() {
    this.getHistory()
  }

  render() {

    const {renderList, removeHistory} = this

    return (
      <div className={styles.history}>
        <NavHeader
          title="看房记录"
          rightContent={<span className={styles.delete} onClick={removeHistory}>删除记录</span>}
        />
        <div className={styles.historyHouse}>
          <WingBlank>
            {renderList()}
          </WingBlank>
        </div>
      </div>
    )
  }
}
