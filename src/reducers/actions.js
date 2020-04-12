
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

export const endpoints = {
    [GET_TODOS]: createEndpoint('GET', '/todos'),
    [DELETE_TODO]: createEndpoint('DELETE', '/todos/{id}'),
    [INSERT_TODO]: createEndpoint('POST', '/todos/'),
    [UPDATE_COMPLETED]: createEndpoint('PUT', '/todos/{id}')
};
