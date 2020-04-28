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
        this.debug(action.type + " " + actionSubType + " with payload", action.payload, "txId", action.meta.transactionId);
    }
};
