import produce from "immer"
import {GET_TODOS, CLEAR_ERROR, TOGGLE_ERRORMODE} from './actions';
import {startOf, successOf} from './actionDispatcher';

export const initialState = {
        initialLoad: true,
        isLoading: false,
        incompleteAsyncActionTypes: [],
        error: null,
        isErrormode: false
    };

const uiReducer = (state, action) => produce(state, draft => {
        if (action.meta && action.meta.async && action.meta.started) {
            draft.incompleteAsyncActionTypes.push(action.type);
        }
        if (action.meta && action.meta.async && (action.meta.succeeded || action.meta.failed)) {
            draft.incompleteAsyncActionTypes = state.incompleteAsyncActionTypes.filter(a => a !== action.type);
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
        if (startOf(TOGGLE_ERRORMODE, action)) {
            draft.isErrormode = !state.isErrormode;
        }
        draft.isLoading = draft.incompleteAsyncActionTypes.length > 0;
    });

export default uiReducer;
