import {startOf, UPDATE_CURRENT_FILTER_ID} from './actions';

export default (state, action) =>
    startOf(UPDATE_CURRENT_FILTER_ID, action) ? action.payload : state;
