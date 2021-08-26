import React, {Component, createRef} from 'react'

// 导入样式
import styles from './Sticky.module.scss'

export default class Sticky extends Component {

  // 创建ref对象
  placeholder = createRef()
  content = createRef()

  scrollHandler = () => {
    /* 得到DOM元素 */
    const placeholderEl = this.placeholder.current
    const contentEl = this.content.current

    /* 得到元素的 height */
    const {height} = contentEl.getBoundingClientRect()
    const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    if (top < this.contentElTop) {
      /* 不顶置 */
      contentEl.classList.remove(styles.fixed)
      placeholderEl.style.height = '0px'
    }
    if (top > this.contentElTop) {
      /* 顶置 */
      contentEl.classList.add(styles.fixed)
      placeholderEl.style.height = `${height}px`
    }
  }

  componentDidMount() {
    /* 得到元素距离浏览器顶部的距离 */
    this.contentElTop = this.content.current.offsetTop

    window.addEventListener('scroll', this.scrollHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler)
  }

  render() {
    return (
      <div>
        {/* 占位元素 */}
        <div ref={this.placeholder}/>
        <div ref={this.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
