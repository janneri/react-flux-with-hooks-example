import React from 'react';
import VisibilityFilters from '../utils/visibilityFilters';

const isVisible = (todo, currentFilterId) =>
    currentFilterId === VisibilityFilters.SHOW_ALL.id ||
    (todo.completed && currentFilterId === VisibilityFilters.SHOW_COMPLETED.id) ||
    (!todo.completed && currentFilterId === VisibilityFilters.SHOW_ACTIVE.id)

const TodoList = ({todos, currentFilterId, deleteTodo, updateCompleted, isLoading, disabled}) => (
    <div className="todo-list">
        { isLoading && (
            <div className="loading-indicator">
                Loading tasks...
            </div>
        )}
        {
            todos
                .filter(todo => isVisible(todo, currentFilterId))
                .map(todo => (
                <div key={todo.id} className="todo-item">
                    <span
                        onClick={() => updateCompleted({id: todo.id})}
                        className={todo.completed ? 'complete todo-text' : 'todo-text'}
                    >
                        {todo.text}
                    </span>
                    <button
                        className="delete"
                        onClick={() => deleteTodo({id: todo.id})}
                        disabled={disabled}
                    >
                        delete
                    </button>
                </div>
            ))
        }
    </div>
);

export default TodoList;
