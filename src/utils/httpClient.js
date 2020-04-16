import Logger from './logger';

// A bit more fail safe way to handle response than just response.json it...
function parseResponseBody(response) {
    let resultPromise = null;

    if (response.headers.get('Content-Length') === '0') {
        resultPromise = Promise.resolve('');
    } else if (response.headers.get('Content-Type').indexOf('text/html') !== -1) {
        resultPromise = response.text();
    } else if (response.headers.get('Content-Type').indexOf('application/json') !== -1) {
        resultPromise = response.json();
    } else {
        throw new Error(`Unsupported Content-Type: ${response.headers.get('Content-Type')}`);
    }

    return resultPromise;
}

const GET_OPTIONS = {
    method: 'GET',
    headers: {
        Accept: 'application/json'
    },
    credentials: 'same-origin'
};

function fetchOptions(data, token, method) {
    return {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': token
        },
        credentials: 'same-origin',
        body: data || data === false || data === 0 ? JSON.stringify(data) : undefined
    };
}


export default {
    call(method, url, data) {
        let token = 'not-implemented'; // csrfToken.getCsrfToken()
        let options = method === 'GET' ? GET_OPTIONS : fetchOptions(data, token, method);

        // Allows aborting http requests. See https://developer.mozilla.org/en-US/docs/Web/API/AbortController
        const controller = new AbortController();
        options.signal = controller.signal;
        const fetchPromise = fetch(url, options).then(parseResponseBody);
        // set timeout for the fetch:
        setTimeout(() => {
            Logger.debug("Aborting fetch because of timeout");
            // When abort() is called, the fetch() promise rejects with a DOMException named AbortError.
            controller.abort()
        }, 2000);
        return fetchPromise;
    }
};
