import React, {Component} from 'react'
import {Route} from 'react-router-dom'
import {TabBar} from 'antd-mobile'

// 导入home的样式
import './home.css'
// 引入路由组件
import Index from '../../containers/IndexVessel/IndexVessel'
import HouseList from '../../containers/List/HouseList'
import Profile from '../Profile'

// TabBar 数据
const tabItmes = [
  {id: 1, title: '首页', icon: 'icon-ind', path: '/home'},
  {id: 2, title: '找房', icon: 'icon-findHouse', path: '/home/list'},
  {id: 3, title: '我的', icon: 'icon-my', path: '/home/profile'}
]

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // 默认选中的TabBar菜单项
      selectedTab: this.props.location.pathname
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      // 到这里说明路由切换了
      this.setState({selectedTab: this.props.location.pathname})
    }
  }


  // 渲染 TabBar.Item
  renderTabBarItem = () => (
    tabItmes.map(tabItem => (
      <TabBar.Item
        title={tabItem['title']}
        key={tabItem['title']}
        icon={<i className={`iconfont ${tabItem['icon']}`}/>}
        selectedIcon={<i className={`iconfont ${tabItem['icon']}`}/>}
        selected={this.state.selectedTab === `${tabItem['path']}`}
        onPress={() => {
          this.setState({
            selectedTab: `${tabItem['path']}`,
          });

          // 路由切换
          this.props.history.push(`${tabItem['path']}`)
        }}
      >
      </TabBar.Item>
    ))
  )

  render() {
    return (
      <div className="home">
        {/* 路由内容显示 */}
        <Route exact path="/home" component={Index}/>
        <Route path="/home/list" component={HouseList}/>
        <Route path="/home/profile" exact component={Profile}/>

        {/* TabBar */}
        <TabBar tintColor="#21b97a" barTintColor="white" noRenderContent={true}>
          {this.renderTabBarItem()}
        </TabBar>
      </div>
    )
  }
}
