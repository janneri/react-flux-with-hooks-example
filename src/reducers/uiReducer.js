import produce from "immer"
import {startOf, successOf, GET_TODOS, CLEAR_ERROR} from './actions';

export const initialState = {
        initialLoad: true,
        loadCount: 0,
        error: null
    };

const uiReducer = (state, action) => produce(state, draft => {
        if (action.meta && action.meta.async && action.meta.started) {
            draft.loadCount += 1;
        }
        if (action.meta && action.meta.async && (action.meta.succeeded || action.meta.failed)) {
            draft.loadCount -= 1;
        }
        if (action.meta && action.meta.failed) {
            draft.error = {...action.payload, causeAction: action.meta.causeAction};
        }
        if (successOf(GET_TODOS, action)) {
            draft.initialLoad = false;
        }
        if (startOf(CLEAR_ERROR, action)) {
            draft.error = null;
        }
    });

export default uiReducer;
