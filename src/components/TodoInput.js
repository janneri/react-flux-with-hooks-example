import React, {useState} from 'react';

const TodoInput = ({insertTodo, disabled}) => {
    const [text, setText] = useState('');

    const callbackRef = inputElement => {
        if (inputElement) {
            inputElement.focus();
        }
    };

    const insertTodoAndClearInput = event => {
        const text = event.target.value;
        if (event.key === "Enter" && text) {
            setText("");
            insertTodo(text);
        }
    };

    return (
        <input
            type="text"
            ref={callbackRef}
            className="todo-input"
            placeholder="What needs to be done?"
            onChange={event => setText(event.target.value)}
            onKeyPress={insertTodoAndClearInput}
            value={text}
            disabled={disabled}
        />
    );
};

export default TodoInput;
