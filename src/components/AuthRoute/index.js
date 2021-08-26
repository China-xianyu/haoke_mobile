import {Route, Redirect} from 'react-router-dom'

import {isAuth} from '../../utils'

import React, {Component} from 'react'

export default class AuthRoute extends Component {
  render() {
    const {component: Component, ...rest} = this.props
    return (
      <Route {...rest} render={props => {
        const isLogin = isAuth()
        if (isLogin) {
          // 已登录
          return <Component {...props}/>
        } else {
          // 未登录
          return <Redirect to={{
            pathname: '/login',
            state: {from: props.location}
          }}/>
        }
      }}/>
    )
  }
}

