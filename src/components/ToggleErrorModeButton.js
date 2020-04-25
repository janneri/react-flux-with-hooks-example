import React from 'react';

const ToggleErrormodeButton = ({toggleErrormode, isErrormode, disabled}) => (
    <button
        className="toggle-errormode"
        onClick={() => toggleErrormode()}
        disabled={disabled}
    >
        {isErrormode ? 'error mode off' : 'error mode on'}
    </button>
);

export default ToggleErrormodeButton;
