import React from 'react';

const ErrorPanel = ({error, clearError}) => {
    return error && (
        <div className="error">
            <span className="message">
                {/* could implement some logic based on the error and cause action here ... */}
                Oops, something went wrong!
            </span>
            <span className="clear" onClick={clearError}>X</span>
        </div>

    );
};

export default ErrorPanel;
