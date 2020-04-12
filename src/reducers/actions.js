import http from '../utils/httpClient';
import {bindPathVariables, getHttpRequestBody} from '../utils/urlTemplateUtils';
import Logger from '../utils/logger';

// ------------------------------------------------------
// ACTION TYPES

export const GET_TODOS = 'GET_TODOS';
export const DELETE_TODO = 'DELETE_TODO';
export const INSERT_TODO = 'INSERT_TODO';
export const UPDATE_COMPLETED = 'UPDATE_COMPLETED';
export const UPDATE_CURRENT_FILTER_ID = 'UPDATE_CURRENT_FILTER_ID';
export const CLEAR_ERROR = 'CLEAR_ERROR';


// ------------------------------------------------------
// API ENDPOINTS
// Bind rest apis to action types

const API_PREFIX = 'http://localhost:4000';
const createEndpoint = (method, urltemplate, contentIsFile = false) => ({method, urlTemplate: API_PREFIX + urltemplate, contentIsFile});

const endpoints = {
    [GET_TODOS]: createEndpoint('GET', '/todos'),
    [DELETE_TODO]: createEndpoint('DELETE', '/todos/{id}'),
    [INSERT_TODO]: createEndpoint('POST', '/todos/'),
    [UPDATE_COMPLETED]: createEndpoint('PUT', '/todos/{id}')
};


// ------------------------------------------------------
// Action dispatcher

/*
 * Calls the backend api and dispatches actions.
 *
 * For example with action: {type: 'DELETE_TODO', payload: {todoId: 1}}:
 * 1. dispatch the action with meta: {type: 'DELETE_TODO', payload: {todoId: 1}}, meta: {started: true}}
 * 2. http fetch
 * 3. dispatch the action with either
 *      {type: 'DELETE_TODO', payload: {todoId: 1}}, meta: {succeeded: true}}
 *      {type: 'DELETE_TODO', payload: {todoId: 1}}, meta: {failed: true}}
 */
const callApiAndDispatchActions = (dispatch, action) => {
    try {
        dispatch({type: action.type, payload: action.payload, meta: {started: true, async: true}});
        const endpoint = endpoints[action.type];
        const url = bindPathVariables(endpoint.urlTemplate, {pathVariables: action.payload});
        const httpRequestBody = getHttpRequestBody(endpoint.urlTemplate, action.payload);

        Logger.debug('calling', url, 'with requestbody', httpRequestBody);
        http.call(endpoint.method, url, httpRequestBody, endpoint.contentIsFile)
            .then(result => dispatch({type: action.type, payload: result, meta: {succeeded: true, async: true}}))
            .catch(error => dispatch({type: action.type, payload: error, meta: {failed: true, async: true, causeAction: action}}));
    } catch (error) {
        dispatch({type: action.type, payload: error, meta: {failed: true, async: true, causeAction: action}});
    }
};

/**
 * Call this from the components.
 * This is a middleware/thunk, which catches all actions and forwards them
 * in the flux standard action -form. FSA is just and object with type, payload and possibly meta.
 */
export const dispatchActions = (store, dispatch, action) => {
    if (endpoints[action.type]) {
        // Async-action -> call api and send started and either succeeded or failed actions
        callApiAndDispatchActions(dispatch, action);
    } else {
        // Not-async -> dispatch the action with meta: started: true, async: false
        dispatch({type: action.type, payload: action.payload, meta: {started: true, async: false}});
    }
};

// Common helpers for checking the action type in reducers.
export const startOf = (actionType, action) => (action.type === actionType && action.meta && action.meta.started);
export const successOf = (actionType, action) => (action.type === actionType && action.meta && action.meta.succeeded);
export const failureOf = (actionType, action) => (action.type === actionType && action.meta && action.meta.failed);
export const failureOfSome = (actionTypes, action) => (actionTypes.includes(action.type) && action.meta && action.meta.failed);
export const successOfSome = (actionTypes, action) => (actionTypes.includes(action.type) && action.meta && action.meta.succeeded);
export const startOfSome = (actionTypes, action) => (actionTypes.includes(action.type) && action.meta && action.meta.started);
