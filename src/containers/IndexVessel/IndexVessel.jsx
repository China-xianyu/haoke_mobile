import {connect} from "react-redux";
import {getGroups, getRecommend, getSwipers} from "../../redux/actions";
import Index from '../../pages/Index'

export default connect(
  state => {
    return {
      groups: state.groups,
      swipers: state.swipers,
      recommend: state.recommend
    }
  },
  {getGroups, getSwipers, getRecommend}
)(Index)
