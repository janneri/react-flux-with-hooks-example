
import {resetCommitedState, rollbackingReducer} from './rollbackingReducer';

const simpleTodoReducer = (state, action) => {
    if (action.type === 'ADD_TODO' && action.meta.started) {
        return [...state, action.payload];
    }
    return state;
};

describe('rollbackingReducer', () => {
    let reducer;
    beforeEach(() => {
        resetCommitedState([]);
        reducer = rollbackingReducer(simpleTodoReducer, []);
    });

    it('non async actions update the state as usual', () => {
        let newState = reducer([], {type: 'ADD_TODO', payload: 'foo', meta: {async: false, started: true}});
        newState = reducer(newState, {type: 'ADD_TODO', payload: 'bar', meta: {async: false, started: true}});

        expect(newState).toEqual(['foo', 'bar']);
    });

    it('failing async action is rolled back', () => {
        let newState = reducer([], {type: 'ADD_TODO', payload: 'bar', meta: {async: true, started: true, transactionId: 1}});
        expect(newState).toEqual(['bar']);

        newState = reducer(newState, {type: 'ADD_TODO', payload: 'error', meta: {async: true, failed: true, transactionId: 1}});
        expect(newState).toEqual([]);
    });

    it('failing async action is rolled back to prev commited state', () => {
        let newState = reducer([], {type: 'ADD_TODO', payload: 'foo', meta: {async: true, started: true, transactionId: 1}});
        newState = reducer(newState, {type: 'ADD_TODO', payload: 'bar', meta: {async: true, started: true, transactionId: 2}});
        expect(newState).toEqual(['foo', 'bar']);

        newState = reducer(newState, {type: 'ADD_TODO', payload: 1, meta: {async: true, succeeded: true, transactionId: 2}});
        newState = reducer(newState, {type: 'ADD_TODO', payload: 'error', meta: {async: true, failed: true, transactionId: 1}});
        expect(newState).toEqual(['bar']);
    });
});