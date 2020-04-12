import {UPDATE_CURRENT_FILTER_ID} from './actions';
import {startOf} from './actionDispatcher';

export default (state, action) =>
    startOf(UPDATE_CURRENT_FILTER_ID, action) ? action.payload : state;
