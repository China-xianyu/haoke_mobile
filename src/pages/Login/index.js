import React, {Component} from 'react'
import {Flex, WingBlank, WhiteSpace, Toast} from 'antd-mobile'
import {Link} from 'react-router-dom'
import {withFormik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'

/* 公共导航栏组件 */
import NavHeader from '../../components/NavHeader'
// 导入样式
import styles from './Login.module.scss'
import {setToken, API} from '../../utils'

/* 匹配规则 */
const REG_UNAME = /^[a-zA-Z_\d]{5,8}/;
const REG_PWD = /^[a-zA-Z_\d]{5,12}/

class Login extends Component {

  render() {

    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader} title="账号登录"/>
        {/* 两翼留白 */}
        <WhiteSpace size="xl"/>

        {/* 登录表单 */}
        <WingBlank>
          <Form>
            <div className={styles.formItem}>
              <Field className={styles.input} name="userName" placeholder="请输入账号" autoComplete="off"/>
            </div>

            {/* 出现错误 显示错误信息 */}
            <ErrorMessage className={styles.error} name="userName" component="div"/>

            <div className={styles.formItem}>
              <Field className={styles.input} type="password" name="password" placeholder="请输入密码" autoComplete="off"/>
            </div>

            {/* 出现错误 显示错误信息 */}
            <ErrorMessage className={styles.error} name="password" component="div"/>

            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">登录</button>
            </div>
          </Form>
          <Flex className={styles.backHome}>
            <Flex.Item>
              <Link to="/register">还没有账号，去注册~</Link>
            </Flex.Item>
          </Flex>
        </WingBlank>
      </div>
    )
  }
}

// 使用withFormik包装Login组件
Login = withFormik({
  /* 提供状态 */
  mapPropsToValues: () => ({userName: '', password: ''}),

  /* 表单验证 */
  validationSchema: Yup.object().shape({
    userName: Yup.string()
      .required('用户名为必填项')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下滑线'),
    password: Yup.string()
      .required('密码为必填项')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下滑线')
  }),

  /* 提交处理 */
  handleSubmit: async (values, {props}) => {

    Toast.loading('正在加载中', 0, null, false)

    const {userName, password} = values;

    const result = await API({
      method: 'POST',
      url: '/user/login',
      data: {
        userName,
        password
      }
    })

    Toast.hide()

    const {status, msg, body} = result.data

    if (status === 200) {
      /* 本地存储token */
      setToken(body.token)

      if (!props.location.state) {
        /* 如果不是直接进入登录 直接返回上一个页面 */
        /* 在方法中 无法通过this获取 props 只能在通过第二个参数获取 */
        props.history.go(-1)
      } else {
        /* 从需要登录后才能访问的页面进入登录，登录后返回之前的页面 */
        const pathname = props.location.state.from.pathname
        props.history.replace(pathname)
      }

    } else {
      Toast.info(msg, 2, null, false)
    }
  }
})(Login)

export default Login
