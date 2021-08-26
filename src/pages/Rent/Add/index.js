import React, {Component} from 'react'
import {Flex, List, InputItem, Picker, ImagePicker, TextareaItem, Modal, Toast, Tag} from 'antd-mobile'

import {API, getCity} from '../../../utils'
import NavHeader from '../../../components/NavHeader'
import HousePackage from '../../../components/HousePackage'
// 导入样式
import styles from './Add.module.scss'

const alert = Modal.alert

// 房屋类型
const roomTypeData = [
  {label: '一室', value: 'ROOM|d4a692e4-a177-37fd'},
  {label: '二室', value: 'ROOM|d1a00384-5801-d5cd'},
  {label: '三室', value: 'ROOM|20903ae0-c7bc-f2e2'},
  {label: '四室', value: 'ROOM|ce2a5daa-811d-2f49'},
  {label: '四室+', value: 'ROOM|2731c38c-5b19-ff7f'}
]

// 朝向：
const orientedData = [
  {label: '东', value: 'ORIEN|141b98bf-1ad0-11e3'},
  {label: '西', value: 'ORIEN|103fb3aa-e8b4-de0e'},
  {label: '南', value: 'ORIEN|61e99445-e95e-7f37'},
  {label: '北', value: 'ORIEN|caa6f80b-b764-c2df'},
  {label: '东南', value: 'ORIEN|dfb1b36b-e0d1-0977'},
  {label: '东北', value: 'ORIEN|67ac2205-7e0f-c057'},
  {label: '西南', value: 'ORIEN|2354e89e-3918-9cef'},
  {label: '西北', value: 'ORIEN|80795f1a-e32f-feb9'}
]

// 楼层
const floorData = [
  {label: '高楼层', value: 'FLOOR|3'},
  {label: '中楼层', value: 'FLOOR|2'},
  {label: '低楼层', value: 'FLOOR|1'}
]

// 租聘类型
const entireData = [
  {label: '整租', value: 1},
  {label: '合租', value: 0}
]

// 房屋亮点
const tagsData = [
  {name: "精装", code: "CHAR|1d9bf0be-284f-93dd"},
  {name: "随时看房", code: "CHAR|ee11187b-a631-beef"},
  {name: "近地铁", code: "CHAR|76eb0532-8099-d1f4"},
  {name: "集中供暖", code: "CHAR|f56b9ad7-a97c-b28f"},
  {name: "双卫生间", code: "CHAR|51ae05f0-7c7a-c24b"},
  {name: "公寓", code: "CHAR|2d9fb1b2-dbf9-eb64"},
  {name: "独立卫生间", code: "CHAR|c3d3e453-c3fa-d4af"},
  {name: "押一付一", code: "CHAR|f838b575-9196-bf13"},
  {name: "独立阳台", code: "CHAR|479e8f8a-f193-9605"},
  {name: "月租", code: "CHAR|3870eb95-3f80-e5f8"},
  {name: "限女生", code: "CHAR|014e0e46-2147-8785"},
  {name: "限男生", code: "CHAR|7121e024-499d-c929"},
  {name: "新上", code: "CHAR|41e8322b-3846-d721"},
]

export default class Add extends Component {
  constructor(props) {
    super(props)
    const {state} = this.props.location
    const communityObj = {name: '', id: ''}
    if (state) {
      // state有值说明当前页从/rent/search页面跳转过来的，携带了: community和communityName
      const {community, communityName} = state
      communityObj.name = communityName
      communityObj.id = community
    }
    this.state = {
      // 临时图片地址
      tempSlides: [],

      // 小区的名称和id
      community: communityObj,
      // 价格
      price: '',
      // 面积
      size: '',
      // 房屋类型
      roomType: '',
      // 楼层
      floor: '',
      // 朝向：
      oriented: '',
      // 房屋标题
      title: '',
      // 房屋图片
      houseImg: '',
      // 房屋配套：
      supporting: '',
      // 房屋描述
      description: '',
      // 整租合租
      entire: '',
      // 房屋亮点
      tags: []
    }
  }

  // 渲染房屋亮点列表
  renderTags = () => {
    return tagsData.map(item => (
        <Tag key={item.name} className={styles.tagsItem} onChange={() => {
          this.changeTags(item.code)
        }}>{item.name}</Tag>
      )
    )
  }

  // 房屋亮点选中与不选中
  changeTags = (code) => {
    const {tags} = this.state
    let tagArr = [...tags]
    if (tagArr.indexOf(code) === -1) {
      tagArr.push(code)
    } else {
      tagArr = tagArr.filter(item => item !== code)
    }
    this.setState({
      tags: tagArr
    })
  }

  // 取消编辑，返回上一页
  onCancel = () => {
    alert('提示', '放弃发布房源?', [
      {
        text: '放弃',
        onPress: async () => this.props.history.go(-1)
      },
      {
        text: '继续编辑'
      }
    ])
  }

  /* 修改参数 */
  handleChange = (name, value) => {
    this.setState({
      [name]: value
    })
  }

  /* 获得图片 */
  getSlides = (files) => {
    this.setState({tempSlides: files})
  }

  addHouse = async () => {
    // 先上传图片
    const {tempSlides} = this.state
    const data = new FormData()
    let sizes = 0

    tempSlides.forEach(item => {
      sizes += item.url.length
      data.append('file[]', item.url)
    })

    if (sizes >= 8388608) {
      Toast.fail('图片大小总和不能大于8M', 2, null, false)
      return;
    }

    const isResult = await API.get(`/user`)

    if (isResult.data.status !== 200) {
      Toast.info('登录信息失效，请登录后重试', 2, null, false)
      return
    }

    const result = await API.post('/houses/image', data, {
      // 文件上传必须设置Content-Type
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const {status: code} = result.data
    if (code === 205) {
      Toast.info('图片仅支持png、jpg、bmp', 2, null, false)
      return
    } else if (code === 204) {
      Toast.info('至少上传一张图片', 2, null, false)
      return
    }
    const houseImg = result.data.body.join('|')

    const city = getCity()
    // 再发布房源
    const {community, price, roomType, floor, oriented, description, title, size, supporting, entire, tags} = this.state
    const houseRes = await API.post('/user/houses',
      {
        community: community.id,
        price,
        roomType,
        floor,
        oriented,
        description,
        title,
        size,
        supporting,
        houseImg,
        entire,
        tags,
        city
      })
    const {status} = houseRes
    if (status === 200) {
      Toast.info('房源发布成功', 1.5, () => {
        this.props.history.replace('/rent')
      })
    } else {
      Toast.info('登录信息失效，请重新登录', 2, () => {
        this.props.history.replace('/login', {form: this.props.location})
      }, false)
    }
  }

  render() {
    const Item = List.Item
    const {history} = this.props
    const {
      community,
      price,
      roomType,
      floor,
      oriented,
      description,
      tempSlides,
      title,
      size,
      entire,
    } = this.state
    return (
      <div className={styles.root}>
        <NavHeader onLeftClick={this.onCancel} title="发布房源"/>

        <List
          className={styles.header}
          renderHeader={() => '房源信息'}
          data-role="rent-list"
        >
          {/* 选择所在小区 */}
          <Item
            extra={community.name || '请输入小区名称'}
            arrow="horizontal"
            onClick={() => history.replace('/rent/search')}
          >
            小区名称
          </Item>
          {/* 每月租金 */}
          <InputItem placeholder="请输入租金/月" extra="￥/月" value={price} onChange={value => {
            this.handleChange('price', value)
          }}>
            租&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;金
          </InputItem>
          {/* 房子面积 */}
          <InputItem placeholder="请输入建筑面积" extra="㎡" value={size} onChange={value => this.handleChange('size', value)}>
            建筑面积
          </InputItem>
          {/* 房屋情况 */}
          <Picker data={roomTypeData} value={[roomType]} cols={1}
                  onChange={value => this.handleChange('roomType', value[0])}>
            <Item arrow="horizontal">
              户&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型
            </Item>
          </Picker>

          <Picker data={floorData} value={[floor]} cols={1} onChange={value => this.handleChange('floor', value[0])}>
            <Item arrow="horizontal">所在楼层</Item>
          </Picker>

          <Picker data={entireData} value={[entire]} cols={1} onChange={value => this.handleChange('entire', value[0])}>
            <Item arrow="horizontal">租聘类型</Item>
          </Picker>

          <Picker data={orientedData} value={[oriented]} cols={1}
                  onChange={value => this.handleChange('oriented', value[0])}>
            <Item arrow="horizontal">
              朝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;向
            </Item>
          </Picker>
        </List>

        <List
          className={styles.pics}
          renderHeader={() => '房屋亮点'}
          data-role="rent-list"
        >
          <Flex wrap="wrap">
            <Flex.Item>
              {this.renderTags()}
            </Flex.Item>
          </Flex>
        </List>

        <List
          className={styles.title}
          renderHeader={() => '房屋标题'}
          data-role="rent-list"
        >
          <InputItem
            placeholder="请输入标题（例如：整租 小区名 2室 5000元）"
            value={title}
            onChange={value => this.handleChange('title', value)}
          />
        </List>

        <List
          className={styles.pics}
          renderHeader={() => '房屋图像'}
          data-role="rent-list"
        >
          <ImagePicker
            files={tempSlides}
            multiple={true}
            className={styles.imgpicker}
            onChange={this.getSlides}
          />
        </List>

        <List
          className={styles.supporting}
          renderHeader={() => '房屋配置'}
          data-role="rent-list"
        >
          <HousePackage select onSelect={items => this.setState({supporting: items.join('|')})}/>
        </List>

        <List
          className={styles.desc}
          renderHeader={() => '房屋描述'}
          data-role="rent-list"
        >
          <TextareaItem
            rows={5}
            placeholder="请输入房屋描述信息"
            autoHeight
            value={description}
            onChange={value => this.handleChange('description', value)}
          />
        </List>

        <Flex className={styles.bottom}>
          <Flex.Item className={styles.cancel} onClick={this.onCancel}>
            取消
          </Flex.Item>
          <Flex.Item className={styles.confirm} onClick={this.addHouse}>
            提交
          </Flex.Item>
        </Flex>
      </div>
    )
  }
}
