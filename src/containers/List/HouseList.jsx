import {connect} from "react-redux";
import {getFilters, getHouses, moreHouses, setFilters} from "../../redux/actions";
import HouseList from '../../pages/HouseList'

export default connect(
  state => (
    {
      filters: state.modifyFilters,
      list: state.houseList,
      count: state.houseCount,
      filtersData: state.filterData
    }
  ),
  {setFilters, getHouses, moreHouses, getFilters}
)(HouseList)
