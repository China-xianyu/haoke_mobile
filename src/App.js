/* eslint-disable-next-line */
import React, {Component} from "react";
import {BrowserRouter, Redirect, Route} from 'react-router-dom'

/* 路由组件 */
import Home from './pages/Home'
import Citylist from "./pages/Citylist";
import HouseDetail from './pages/HouseDetail'
import Map from './pages/Map'
import Login from './pages/Login'
import Register from './pages/Register'
import Rent from './pages/Rent'
import RentSearch from './pages/Rent/Search'
import Add from './pages/Rent/Add'
import Favorite from './pages/Favorite'
import UserInfo from './pages/Profile/UserInfo'
import LookHistory from './pages/Profile/LookHistory'
import Search from './pages/Search'
// 路由鉴权组件
import AuthRoute from './components/AuthRoute'

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          {/* 配置路由 */}
          <Route path="/home" component={Home}/>
          {/* 城市选择列表 */}
          <Route path="/citylist" component={Citylist}/>
          {/* 地图找房 */}
          <Route path="/map" component={Map}/>
          {/* 房屋详情 */}
          <Route path="/houseDetail/:id" component={HouseDetail}/>
          {/* 房源管理 */}
          <AuthRoute path="/rent" exact component={Rent}/>
          {/* 发布房源搜索地址 */}
          <AuthRoute path="/rent/search" component={RentSearch}/>
          {/* 收藏的房源 */}
          <AuthRoute path="/favorite" component={Favorite}/>
          {/* 发布房源 */}
          <AuthRoute path="/rent/add" component={Add}/>
          {/* 搜索房源 */}
          <Route path="/search" component={Search} />
          {/* 登录 */}
          <Route path="/login" component={Login}/>
          {/* 注册 */}
          <Route path="/register" component={Register}/>
          {/* 用户资料 */}
          <AuthRoute path="/profile/info" component={UserInfo}/>
          {/* 用户浏览房源记录 */}
          <AuthRoute path="/profile/history" component={LookHistory}/>
          {/* 重定向到/home */}
          <Route exact path="/" render={() => <Redirect to="/home"/>}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
