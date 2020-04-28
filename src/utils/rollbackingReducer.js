
let transactions = [];
let commitedState;

// for testing
export const resetCommitedState = state => {
    commitedState = state;
};

// wrap your reducer with this
export const rollbackingReducer = (rootReducer) => (state, action) => {
    if (!commitedState) {
        commitedState = state;
    }

    if (!action.meta.async) {
        commitedState = rootReducer(commitedState, action);
        return commitedState;
    }

    if (action.meta.async && action.meta.started) {
        // when transaction begins, we capture a rollback point/state
        transactions.push(action);
        return rootReducer(state, action);
    }

    if (action.meta.async && action.meta.succeeded) {
        // update the commited state
        const startAction = transactions.find(t => t.meta.transactionId === action.meta.transactionId);
        const startedState = rootReducer(commitedState, startAction);
        commitedState = rootReducer(startedState, action);

        // remove pending transaction
        transactions = transactions.filter(t => t.meta.transactionId !== action.meta.transactionId);

        // apply all pending transactions to get new state
        if (transactions.length > 0) {
            let newState = commitedState;
            transactions.forEach(t => newState = rootReducer(newState, t));
            return newState;
        }
        else {
            return commitedState;
        }
    }

    if (action.meta.async && action.meta.failed) {
        // remove pending transaction
        transactions = transactions.filter(t => t.meta.transactionId !== action.meta.transactionId);

        // apply all pending transactions to get new state
        if (transactions.length > 0) {
            let newState = rootReducer(commitedState, action);
            transactions.forEach(t => newState = rootReducer(newState, t));
            return newState;
        }
        else {
            return rootReducer(commitedState, action);
        }
    }
};