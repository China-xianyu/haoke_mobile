import React from 'react';
import ReactDOM from 'react-dom';
// 导入react-virtualized样式
import 'react-virtualized/styles.css'

// 导入antd-mobile样式
import 'antd-mobile/dist/antd-mobile.css'
// 导入自定义全局样式
import './index.css'
// 导入字体图标库的的样式文件
import './assets/fonts/iconfont.css'
// 导入根组件
import App from './App';

ReactDOM.render(<App/>, document.getElementById('root'));
