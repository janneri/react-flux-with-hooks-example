import produce from "immer"

import {GET_TODOS, DELETE_TODO, INSERT_TODO, UPDATE_COMPLETED} from './actions';
import {startOf, successOf} from './actionDispatcher';


// the state is just an array of todos
const todosReducer = (state, action) =>
    produce(state, draftState => {
        if (successOf(GET_TODOS, action)) {
            return action.payload;
        }
        else if (startOf(INSERT_TODO, action)) {
            draftState.push({id: -1, text: action.payload});
        }
        else if (successOf(INSERT_TODO, action)) {
            const index = draftState.findIndex(todo => todo.id === -1);
            draftState[index].id = action.payload;
        }
        else if (startOf(DELETE_TODO, action)) {
            return draftState.filter(todo => todo.id !== action.payload.id);
        }
        else if (startOf(UPDATE_COMPLETED, action)) {
            const index = draftState.findIndex(todo => todo.id === action.payload.id);
            draftState[index].completed = !draftState[index].completed;
        }
    });

export default todosReducer;
