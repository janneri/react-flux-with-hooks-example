import React, {useEffect, useReducer} from 'react';
import Logger from '../utils/logger';
import {initialState, rootReducer} from '../reducers/rootReducer';
import {dispatchActions} from '../reducers/actionDispatcher';
import {
    DELETE_TODO,
    GET_TODOS,
    INSERT_TODO,
    UPDATE_COMPLETED,
    UPDATE_CURRENT_FILTER_ID,
    CLEAR_ERROR
} from '../reducers/actions';
import TodoList from './TodoList';
import TodoInput from './TodoInput';
import VisibilityFilterPanel from './VisibilityFilterPanel';
import ErrorPanel from './ErrorPanel';

function App() {
    const [rootState, myDispatch] = useReducer(rootReducer, initialState);
    const dispatchPayload = actionType => payload => dispatchActions(rootState, myDispatch, {type: actionType, payload});

    // eslint-disable-next-line
    useEffect(() => dispatchActions(rootState, myDispatch, {type: GET_TODOS}), []);

    Logger.debug('rendering', rootState);

    return (
        <div className="app">
            <h2>todos</h2>
            <ErrorPanel
                error={rootState.ui.error}
                clearError={dispatchPayload(CLEAR_ERROR)}
            />
            <TodoInput
                insertTodo={dispatchPayload(INSERT_TODO)}
                disabled={rootState.ui.loadCount > 0}
            />
            <TodoList
                todos={rootState.todos}
                currentFilterId={rootState.currentFilterId}
                deleteTodo={dispatchPayload(DELETE_TODO)}
                updateCompleted={dispatchPayload(UPDATE_COMPLETED)}
                isLoading={rootState.ui.initialLoad}
                disabled={rootState.ui.loadCount > 0}
            />
            <VisibilityFilterPanel
                currentFilterId={rootState.currentFilterId}
                updateCurrentFilterId={dispatchPayload(UPDATE_CURRENT_FILTER_ID)}
            />
        </div>
    );
}

export default App;
