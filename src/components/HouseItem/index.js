import React, {Component} from 'react'
import PropTypes from 'prop-types'

// 导入样式
import styles from './HouseItem.module.scss'

export default class HouseItem extends Component {

  static propTypes = {
    src: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    tags: PropTypes.array.isRequired,
    price: PropTypes.number.isRequired,
    ClickHandler: PropTypes.func
  }

  render() {
    const {src, clickHandler, title, desc, price, tags} = this.props
    return (
      <div className={styles.house} onClick={clickHandler}>
        <div className={styles.imgWrap}>
          <img className={styles.img} src={src} alt=""/>
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.desc}>{desc}</div>
          <div>
            {tags.map((tag, index) => {
              const tagClass = 'tag' + (index + 1)
              if (index < 3) {
                return (
                  <span
                    className={[styles.tag, styles[tagClass]].join(' ')}
                    key={tag}
                  >
                {tag}
              </span>
                )
              }
              return ''
            })}
          </div>
          <div className={styles.price}>
            <span className={styles.priceNum}>{price}</span>元 / 月
          </div>
        </div>
      </div>
    )
  }
}
