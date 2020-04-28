import Logger from '../utils/logger';
import VisibilityFilters from '../utils/visibilityFilters';
import uiReducer, {initialState as uiInitialState} from './uiReducer';
import todosReducer from './todosReducer';
import filterReducer from './filterReducer';
import {rollbackingReducer} from '../utils/rollbackingReducer';

export const initialState = {
    ui: uiInitialState,
    todos: [],
    currentFilterId: VisibilityFilters.SHOW_ALL.id
};

// The rollbacking reducer intercepts actions and rolls the state back when an async action fails.
// This allows us to optimistically update the state and handle failure without writing any handlers for failed actions.
// An alternative solution, which requires more work, but could be simpler is to write handlers for failed actions.
export const rootReducer = rollbackingReducer((state, action) => {
    // This is basically a simple logging middleware ...
    // Of course we could implement support for custom middleware,
    // but all library-like code introduce complexity and make the call hierarchy more difficult to follow and understand.
    Logger.debugAction(action);

    return {
        ui: uiReducer(state.ui, action),
        todos: todosReducer(state.todos, action),
        currentFilterId: filterReducer(state.currentFilterId, action)
    }
});
