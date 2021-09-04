import {createStore, applyMiddleware} from 'redux'
import reducers from './renducers'
import thunk from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'

const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store
