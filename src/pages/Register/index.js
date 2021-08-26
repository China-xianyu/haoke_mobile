import React, {Component} from 'react'
import {Flex, WingBlank, WhiteSpace, Toast} from 'antd-mobile'
import {withFormik, Form, Field, ErrorMessage} from 'formik'
import {Link} from "react-router-dom"
import * as Yup from "yup"

// 导入样式
import styles from './Register.module.scss'
import NavHeader from "../../components/NavHeader"
import {API} from '../../utils'
/* 匹配规则 */
const REG_UNAME = /^[a-zA-Z_\d]{5,8}/
const REG_PWD = /^[a-zA-Z_\d]{5,12}/

class Register extends Component {
  render() {
    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader} title="加入好客"/>
        {/* 两翼留白 */}
        <WhiteSpace size="xl"/>

        {/* 注册表单 */}
        <WingBlank>
          <Form>
            <div className={styles.formItem}>
              <Flex>
                <p className={styles.inputHeader}>用户名</p>
                <Field className={styles.input} type="text" name="userName" placeholder="请输入账号"/>
              </Flex>
            </div>

            {/* 出现错误 显示错误信息 */}
            <ErrorMessage className={styles.error} name="userName" component="div"/>

            <div className={styles.formItem}>
              <Flex>
                <p className={styles.inputHeader}>密码</p>
                <Field className={styles.input} type="password" name="password" placeholder="请输入密码"/>
              </Flex>
            </div>

            {/* 出现错误 显示错误信息 */}
            <ErrorMessage className={styles.error} name="password" component="div"/>

            <div className={styles.formItem}>
              <Flex>
                <p className={styles.inputHeader}>重复密码</p>
                <Field className={styles.input} type="password" name="confirmPassword" placeholder="重复输入密码"/>
              </Flex>
            </div>

            {/* 出现错误 显示错误信息 */}
            <ErrorMessage className={styles.error} name="confirmPassword" component="div"/>

            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">登录</button>
            </div>
          </Form>
          <Flex className={styles.backHome}>
            <Flex.Item style={{'textAlign': 'left'}}>
              <Link to="/home">点我返回首页</Link>
            </Flex.Item>
            <Flex.Item style={{'textAlign': 'right'}}>
              <Link to="/login">已有账号，去登陆</Link>
            </Flex.Item>
          </Flex>
        </WingBlank>
      </div>
    )
  }
}

Register = withFormik({
  mapPropsToValues: () => ({userName: '', password: '', confirmPassword: ''}),

  /* 表单验证 */
  validationSchema: Yup.object().shape({
    userName: Yup.string()
      .required('用户名为必填项')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下滑线'),
    password: Yup.string()
      .required('密码为必填项')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下滑线'),
    confirmPassword: Yup.string().test('confirmPassword', '密码和确认密码不相符', (value, config) => {
      return config.parent.password === config.parent.confirmPassword
    })
  }),

  handleSubmit: async (values, {props}) => {
    Toast.loading('正在加载中', 0, null, false)

    const result = await API({
      method: 'POST',
      url: '/user/register',
      data: {
        ...values
      }
    })

    Toast.hide()

    const {status} = result.data

    if (status === 200) {
      Toast.info('注册成功', 1, () => {
        props.history.replace('/login', {from: {pathname: '/home/profile'}});
      }, false)
    } else {
      Toast.fail('注册失败，请刷新重试', null, false)
    }

  }
})(Register)

export default Register
