import React, {useState} from 'react';

const TodoInput = ({insertTodo, disabled}) => {
    const [text, setText] = useState('');

    return (
        <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            onChange={event => setText(event.target.value)}
            onBlur={event => {
                setText("");
                insertTodo(event.target.value)
            }}
            value={text}
            disabled={disabled}
        />
    );
};

export default TodoInput;
