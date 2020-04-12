import Logger from '../utils/logger';
import VisibilityFilters from '../utils/visibilityFilters';
import uiReducer, {initialState as uiInitialState} from './uiReducer';
import todosReducer from './todosReducer';
import filterReducer from './filterReducer';

export const initialState = {
    ui: uiInitialState,
    todos: [],
    currentFilterId: VisibilityFilters.SHOW_ALL.id
};


let prevValidState = initialState;

export const rootReducer = (state, action) => {
    // This is basically a simple logging middleware ...
    Logger.debugAction(action);

    // Revert to previously known valid state, when failure
    let baseState = state;
    if (action.meta && action.meta.failed) {
        baseState = prevValidState;
    }
    else {
        prevValidState = state;
    }

    return {
        ui: uiReducer(baseState.ui, action),
        todos: todosReducer(baseState.todos, action),
        currentFilterId: filterReducer(baseState.currentFilterId, action)
    }
};
