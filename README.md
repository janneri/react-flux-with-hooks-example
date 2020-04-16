An example single page application (spa) with plain React. Also an experiment of using the ``useReducer``-hook, instead of Redux, for handling state.

## Motivation

Building applications with React and Redux has been fun and easy. But as always, the tools we use change, and we need to re-evaluate. 
The hooks API, introduced with React 16.8 provides us something previously seen only in the flux-libraries.
That is, the ability to dispatch actions and calculate component state based on the action and the previous state.
This is how it looks in a basic container component:

```JavaScript
// useEffect and useReducer are built-in hooks in React
import React, {useEffect, useReducer} from 'react';

// calculate new state based on old state and the action
const reducer = (state, action) => {
  ... 
  return newState;
}

// container components can be implemented without classes
function Counter() { 
  const [state, dispatch] = useReducer(reducer, initialState);

  // A bit like componentDidMount. Runs only once. Loads the initial count from the backend.
  useEffect(() => dispatch({type: 'get_initial_count'}), []);

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```  

To evaluate whether or not I still want Redux in my toolchain, I need to build something without it, using plain React.
The example app should be small enough to implement in a reasonable time and big enough to make a point.
To begin with, I decided to list the requirements and scope of evaluation.  

## Requirements for the example app / evaluation 

The sample application is a todo list app, which allows the user to:
1. add a todo items
1. delete todo items
1. mark items completed / not completed
1. filter todo items (all/completed/not completed)

The following non-functional requirements:
1. The frontend loads todo items from a http/json API provided by a backend
1. The frontend will add, delete and update items using the http/json API
1. If the operation fails, an error message is shown. 
1. After error, the UI state is in sync with the backend state.
1. The UI clearly indicates a loading state. For example, loading items is not the same as no items. 
1. Prevent double clicking delete item. Operations either succeed or fail before starting new operations.

These requirements should be enough to make the application complex/real enough for this evaluation.

## Backend implementation

I used node and the express-library to implement a simple backend:

```JavaScript
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json({strict: false})); // for parsing application/json

// Create artificial "load" so that the loading state is clearly visible
const sleepMiddleware = (req, res, next) => {
    setTimeout(() => next(), 1000);
};
app.use(sleepMiddleware);


// in-memory data(base)
let todos = [{id: 1, text: 'learn react', completed: false}];
let idSeq = 1;


// routes
app.get('/todos', (req, res) => res.send(todos));

app.post('/todos', (req, res) => {
    idSeq += 1;
    todos.push({id: idSeq, text: req.body, completed: false});
    res.send(String(idSeq));
});

app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    todos = todos.filter(t => t.id !== todoId);
    res.send(null);
});

app.put('/todos/:id', (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id, 10));
    todos[index].completed = !todos[index].completed;
    res.send(null);
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
```

## Frontend implementation

### Container vs presentation components

One of the key patterns in implementing a frontend is the division to container and presentational components.

| | Container components | Presentational components |
|---| --- | --- |
|Aware of the flux implementation| yes | no |
|To read data| Subscribe to the flux store | Use props from parent |
|To write data| Dispatch actions | Invoke callbacks given as props from parent |
|The proportion of components in a typical app| ~5% | ~95% |
|ToDo app components| App |  TodoInput, TodoList, VisibilityFilterPanel, ErrorPanel |

Presentational components are easy to understand and implement. 
It makes sense to make most of your components presentational. 
The additional bonus is, changing the flux implementation in the future becomes easier, when only a few components are 
coupled to the implementation.

### App.js - the main (container) component implementation

App.js is the main component, which passes down callbacks and props to the child components.
It contains the root state of the whole application. It uses the ```useReducer```-hook to calculate the new state
from actions dispatched from the child components. In the next section we will look at the dispatcher more closely.
Instead of calling ``myDispatch`` directly, we call ``dispatchActions``, which takes care of calling the REST APIs
and dispatching actions with metadata "started" and "succeeded" or "failed". This is a common pattern sometimes
called "thunk" or "middleware".


```JSX
function App() {
    const [rootState, myDispatch] = useReducer(rootReducer, initialState);
    const dispatchPayload = actionType => payload => dispatchActions(rootState, myDispatch, {type: actionType, payload});

    // load todo
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
```

## Actions and endpoints

Depending on the flux implementation, an action can mean many things. 
Standards help developers understand implementations quickly, so the actions in this implementation are
 [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action), which 
 - are plain JavaScript objects
 - have a type property
 - have a payload property
 - have a meta property
 - may have an error property
 
The action types for the ToDo app look like this:

```JavaScript
export const GET_TODOS = 'GET_TODOS';
export const DELETE_TODO = 'DELETE_TODO';
export const INSERT_TODO = 'INSERT_TODO';
export const UPDATE_COMPLETED = 'UPDATE_COMPLETED';
export const UPDATE_CURRENT_FILTER_ID = 'UPDATE_CURRENT_FILTER_ID';
export const CLEAR_ERROR = 'CLEAR_ERROR';
```

Some of these action types are "async". 
For instance, when the ``DELETE_TODO`` is called, we want to do a HTTP DELETE to ``/todos/{id}``.
This brings us a new concept called an endpoint. 
The idea is, that we can use these endpoints and the mapping from action types to the REST APIs
from the action dispatcher, without writing "async/await/fetch"-code for each and every action when new API endpoints emerge. 


```JavaScript
const API_PREFIX = 'http://localhost:4000';
const createEndpoint = (method, urltemplate) => ({method, urlTemplate: API_PREFIX + urltemplate});

export const endpoints = {
    [GET_TODOS]: createEndpoint('GET', '/todos'),
    [DELETE_TODO]: createEndpoint('DELETE', '/todos/{id}'),
    [INSERT_TODO]: createEndpoint('POST', '/todos/'),
    [UPDATE_COMPLETED]: createEndpoint('PUT', '/todos/{id}')
};
```

## Action dispatching and backend calls

This is where the async magic happens. What happens here step by step:
1. Check if the action is async? If not, dispatch it with meta ``{async: false}``. Otherwise
1. Dispatch the action with ``meta: {started: true, async: true}}``
1. Create the called url using the urlTemplate, such as ``/todos/{id}``, 
and the action payload, which could be  ``{id: 2}``, that creates the url ``/todos/2``
1. Create the HTTP request body from the action payload. The request body is the action payload without properties already in the url.
1. Call the REST API
1. If the call succeeds, dispatch the action with ``meta: {succeeded: true, async: true}}`` 
1. If the call fails, dispatch the action with ``meta: {failed: true, async: true, causeAction: action}}``


```JavaScript
import http from '../utils/httpClient';
import {bindPathVariables, getHttpRequestBody} from '../utils/urlTemplateUtils';
import Logger from '../utils/logger';
import {endpoints} from './actions';

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
```

## The root reducer

The root reducer creates the state of the whole application. In this simple implementation, 
it also handles reverting the state back to the previously known valid state, if an action fails.
This simplifies the implementation of optimistic updates, which means that the UI is updated immediately 
after the started action and then reverted back if the operation fails.

```JavaScript
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
```

## UI reducer for handling the loading state (and Immer)


```JavaScript
import produce from "immer"
import {GET_TODOS, CLEAR_ERROR} from './actions';
import {startOf, successOf} from './actionDispatcher';

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
```

## Logger - the poor mans Redux tools
                         
Redux tools are just awesome! They let you inspect the state and state changes using Chrome dev tools. 
If you don't use Redux, you need something else. I noticed that using a Logger, which logs stuff in dev-mode is helpful.

This is how it's implemented:

```JavaScript
let loglevel = 'debug';

export default {
    setLoglevel(level) {
        loglevel = level;
    },

    debug() {
        if (loglevel === 'debug') {
            // eslint-disable-next-line prefer-rest-params,no-console
            console.log.apply(this, arguments);
        }
    },

    debugAction(action) {
        const actionSubType = action.meta.started ? 'started' : (action.meta.succeeded ? 'succeeded' : 'failed');
        this.debug(action.type + " " + actionSubType + " with payload", action.payload);
    }
};
```

## How to run?

In the project directory.
1. Start the backend with `npm run start-backend`.
2. Start the frontend with `npm start`.
3. Run tests with `npm test`.

The frontend was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), 
which allows you to quickly create React apps with no build configuration.

