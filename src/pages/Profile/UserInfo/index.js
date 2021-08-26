import React, {Component} from 'react'
import {ImagePicker, Flex} from 'antd-mobile'
import RcQueueAnim from 'rc-queue-anim'
import {Toast, InputItem, Picker, List} from 'antd-mobile'

import NavHeader from '../../../components/NavHeader'
import {API, isAuth} from '../../../utils'
// 导入样式
import styles from './UserInfo.module.scss'
import '../../../assets/fonts/iconfont.css'

// 性别数据
const genderData = [
  {label: '男', value: '1'},
  {label: '女', value: '0'}
]

export default class UserInfo extends Component {

  state = {
    files: [],
    isAdd: true,
    show: false,
    textShow: false,
    genderShow: false,
    text: null,
    gender: null,
    oldContext: '',
    uploadAttr: '',
    userInfo: {}
  }

  async getUserInfo() {
    const {history, location} = this.props
    const isLogin = isAuth()
    if (!isLogin) {
      Toast.info('登录信息失效', 2, () => {
        history.replace('/login', {from: location})
      }, false)
      return
    }

    const result = await API.get('/user')
    const {status, body} = result.data
    if (status === 200) {
      this.setState({
        userInfo: body,
        gender: body.gender
      })
    } else if (status === 400) {
      Toast.info('登录信息失效', 2, () => {
        history.replace('/login', {from: location})
      }, false)
    }
  }

  async modifyAvatar(files) {
    const {userInfo} = this.state
    const {history, location} = this.props

    /* loading 动画 */
    Toast.loading('正在加载中', 0, null, false)

    const result = await API.post('/user/modifyAvatar', {avatar: files[0].url})
    const {status, body} = result.data
    if (status === 200) {
      Toast.hide()
      /* 更新头像 并将数据初始化 */
      this.setState({
        userInfo: {
          ...userInfo,
          phone: body
        },
        show: false,
        files: [],
        isAdd: true
      })
      Toast.info('修改头像成功', 1, null, false);
    } else if (status === 400) {
      Toast.info('登录超时!!!', 1, () => {
        history.replace('/login', {from: location})
      }, false);
    }
  }

  /* 只允许添加一张图片 */
  changeHandle = (files) => {
    let isAdd = files.length <= 0;

    this.setState({
      isAdd
    })

    this.setState({
      files
    })
  }

  /* 显示修改文本内容 */
  changeContext = (event) => {
    let text
    const {userInfo} = this.state
    if (event.target.localName === 'p') {
      text = event.target.innerText
    } else {
      text = event.target.parentNode.children[0].innerText
    }
    const value = event.target.parentNode.children[1].innerText
    for (const key in userInfo) {
      if (userInfo[key] === value) {
        this.setState({
          uploadAttr: key
        })
      }
    }

    if (text === '修改密码') {
      this.setState({
        uploadAttr: 'password'
      })
    }

    this.setState({
      textShow: true,
      text,
      oldContext: value
    })
  }

  // 修改信息
  uploadInfo = (userInfo, context, attr) => {
    (async () => {
      for (const key in userInfo) {
        if (userInfo[key] === context && attr !== 'password') {
          return;
        }
      }
      if (attr === 'password'  && context.length < 5) {
        Toast.info('密码长度为5到12位，只能出现数字、字母、下滑线', 2, null, false)
        return
      }

      const result = await API({
        method: 'POST',
        url: '/user/uploadInfo',
        data: {
          value: [context, attr]
        }
      })

      const {status} = result.data

      if (status === 200) {
        this.setState({
          files: [],
          isAdd: true,
          show: false,
          textShow: false,
          genderShow: false,
          text: null,
          userInfo: {
            ...userInfo,
            ...result.data.body
          }
        })
      }
    })()
  }

  componentDidMount() {
    this.getUserInfo()
  }

  render() {

    const {files, isAdd, userInfo, gender, show, textShow, genderShow} = this.state
    const {changeHandle, changeContext, modifyAvatar, uploadInfo} = this

    return (
      <div className={styles.info}>
        <NavHeader title="编辑个人资料" className={styles.header}/>
        {/* 遮罩层 */}
        <RcQueueAnim duration={1000} animConfig={{opacity: [1, 0]}}>
          {show || textShow || genderShow ? (
            <div key="b" onClick={() => this.setState({show: false, textShow: false, genderShow: false})}
                 className={styles.mask}/>
          ) : null}
        </RcQueueAnim>

        {/* 主体内容 */}
        <div className={styles.infoBody}>
          <ul className={styles.infoList}>
            <li className={styles.avatar}>
              <div className={styles.avatar_img}>
                <img src={userInfo.phone} alt="用户头像"/>
              </div>
            </li>
            <li>
              <p>用户名</p>
              <span className={styles.context}>{userInfo.username}</span>
            </li>
            <li onClick={() => this.setState({show: true})}>
              <p>选择头像</p>
            </li>
            <li onClick={(e) => changeContext(e)}>
              <p>昵称</p>
              <span className={styles.context}>{userInfo.nickname}</span>
              <span className={styles.icon + ' iconfont icon-back'}/>
            </li>
            <li onClick={(e) => changeContext(e)}>
              <p>个性签名</p>
              <span className={styles.context}>{userInfo.signature || '请输入个性签名'}</span>
              <span className={styles.icon + ' iconfont icon-back'}/>
            </li>
            <li onClick={() => this.setState({genderShow: true})}>
              <p>性别</p>
              <span className={styles.context}>{userInfo.gender * 1 === 1 ? '男' : '女'}</span>
              <span className={styles.icon + ' iconfont icon-back'}/>
            </li>
            <li onClick={(e) => changeContext(e)}>
              <p>修改密码</p>
              <span className={styles.icon + ' iconfont icon-back'}/>
            </li>
          </ul>
        </div>

        {/* 修改头像 */}
        <RcQueueAnim type="bottom">
          {show ? (
            <div className={styles.alter_avatar} key="a">
              <Flex justify="around" align="center">
                {/* 当前头像 */}
                <div className={styles.currentAvatar}>
                  <img src={userInfo.phone} alt="用户当前头像"/>
                </div>

                {/* 添加头像 */}
                <div>
                  <ImagePicker
                    files={files}
                    selectable={isAdd}
                    length={1}
                    onChange={changeHandle}
                  />
                </div>
              </Flex>
              <Flex>
                <button className={styles.cancel}
                        onClick={() => this.setState({show: false, files: [], isAdd: true})}>取消
                </button>
                <button className={styles.ok} onClick={() => modifyAvatar.call(this, files)}>确定</button>
              </Flex>
            </div>
          ) : null}
        </RcQueueAnim>

        {/* 修改其他内容 */}
        <RcQueueAnim type="bottom">
          {textShow ? (
            <div className={styles.alertContext} key="a">
              <List>
                <InputItem value={this.state.oldContext} onChange={(value) => {
                  this.setState({
                    oldContext: value
                  })
                }}>{this.state.text}</InputItem>
              </List>
              <Flex>
                <button className={styles.cancel} onClick={() => this.setState({textShow: false})}>取消</button>
                <button className={styles.ok}
                        onClick={() => uploadInfo(userInfo, this.state.oldContext, this.state.uploadAttr)}>确定
                </button>
              </Flex>
            </div>
          ) : null}
        </RcQueueAnim>

        {/* 修改性别 */}
        <RcQueueAnim type="bottom">
          {genderShow ? (
            <div key="d" className={styles.gender}>
              <Picker
                data={genderData}
                value={[gender]}
                onOk={value => this.setState({gender: value[0]})}
                title="更改性别"
              >
                <List.Item arrow="horizontal">选择性别</List.Item>
              </Picker>
              <Flex>
                <button className={styles.cancel} onClick={() => this.setState({genderShow: false})}>取消</button>
                <button className={styles.ok}
                        onClick={() => uploadInfo(userInfo, this.state.gender, 'gender')}>确定
                </button>
              </Flex>
            </div>
          ) : null}
        </RcQueueAnim>
      </div>
    )
  }
}
