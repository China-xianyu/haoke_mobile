import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Grid, Button, Modal, Toast} from 'antd-mobile'

// 导入样式
import styles from './profile.module.scss'
// 导入工具
import {getToken, isAuth, removeToken, API, BASE_URL} from '../../utils'

// 菜单数据
const menus = [
  {id: 1, name: '我的收藏', iconfont: 'icon-coll', to: '/favorite'},
  {id: 2, name: '我的出租', iconfont: 'icon-ind', to: '/rent'},
  {id: 3, name: '看房记录', iconfont: 'icon-record', to: '/profile/history'},
  {id: 4, name: '成为房主', iconfont: 'icon-identity', to: '/rent/add'},
  {id: 5, name: '个人资料', iconfont: 'icon-myinfo', to: '/profile/info'},
  {id: 6, name: '联系我们', iconfont: 'icon-cust'}
]

// 默认头像
const DEFAULT_AVATAR = BASE_URL + '/images/profile/default_avatar.png'

const alert = Modal.alert

export default class Profile extends Component {

  state = {
    isLogin: isAuth(),
    userInfo: {
      avatar: '',
      nickname: ''
    }
  }

  logout = () => {
    alert('提示', '是否确定要退出吗？', [
      {text: '取消'},
      {
        text: '退出', onPress: async () => {
          await API({
            method: 'POST',
            url: '/user/logout',
            data: {
              authorization: getToken()
            }
          })

          /* 移除本地token */
          removeToken()

          /* 清空用户状态对象 */
          this.setState({
            isLogin: false,
            userInfo: {
              avatar: '',
              nickname: ''
            }
          })
        }
      },
    ])
  }

  async getUserInfo() {
    const {isLogin} = this.state

    /* 判断是否登录 */
    if (!isLogin) {
      return;
    }

    const result = await API({
      method: 'GET',
      url: `/user`
    });

    if (result.data.status === 200) {
      const {phone, nickname, signature} = result.data.body

      this.setState({
        userInfo: {
          phone,
          nickname,
          signature
        }
      })
    } else {
      // 如果token过期 退出登录 移除本地token

      await API({
        method: 'POST',
        url: '/user/logout',
        data: {
          authorization: getToken()
        }
      })

      /* 清空用户状态对象 */
      this.setState({
        isLogin: false,
        userInfo: {
          avatar: '',
          nickname: ''
        }
      })

      Toast.info(result.data.msg, 2, null, false)
    }
  }


  componentDidMount() {
    this.getUserInfo()
  }

  render() {

    const {history} = this.props
    const {isLogin, userInfo: {phone, nickname, signature}} = this.state

    return (
      <div className={styles.root}>
        {/* 个人信息 */}
        <div className={styles.title}>
          <img className={styles.bg} src={BASE_URL + '/images/profile/bg.png'} alt="背景图"/>
          <div className={styles.info}>
            <div className={styles.myIcon}>
              <img className={styles.avatar} src={phone || DEFAULT_AVATAR} alt="默认头像"/>
            </div>
            <div className={styles.user}>
              <div className={styles.name}>{nickname || '游客'}</div>
              {
                isLogin ? (
                  /* 登录后展示 */
                  <div>
                    <div className={styles.auth}>
                      <span onClick={this.logout}>退出</span>
                    </div>
                    <span className={styles.signature}>{signature || '自定义个性签名'}</span>
                    <div className={styles.edit} onClick={() => this.props.history.push('/profile/info')}>
                      编辑个人资料
                      <span className={styles.arrow}>
                      <i className="iconfont icon-arrow"/>
                    </span>
                    </div>
                  </div>
                ) : (
                  /* 未登录展示 */
                  <div className={styles.edit}>
                    <Button
                      type="primary"
                      size="small"
                      inline
                      onClick={() => {
                        history.push('/login')
                      }}>
                      去登陆
                    </Button>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* 九宫格菜单 */}
        <Grid
          data={menus}
          columnNum={3}
          hasLine={false}
          renderItem={item =>
            item.to ? (
              <Link to={item.to}>
                <div className={styles.menuItem}>
                  <i className={`iconfont ${item.iconfont}`}/>
                  <span>{item.name}</span>
                </div>
              </Link>
            ) : (
              <div className={styles.menuItem}>
                <i className={`iconfont ${item.iconfont}`}/>
                <span>{item.name}</span>
              </div>
            )}>
        </Grid>

        {/* 加入我们 */}
        <div className={styles.ad}>
          <img src={BASE_URL + '/images/profile/join.png'} alt=""/>
        </div>
      </div>
    )
  }
}
