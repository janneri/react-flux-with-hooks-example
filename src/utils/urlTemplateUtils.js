export const getPathVariables = urlTemplate => {
    if (!urlTemplate || urlTemplate.indexOf('{') === -1) {
        return [];
    }
    return urlTemplate.split('{')
        .filter(v => v.indexOf('}') > -1)
        .map(value => value.split('}')[0]);
};

export const bindPathVariables = (urlTemplate, {pathVariables} = {}) => {
    if (!urlTemplate) {
        return undefined;
    }
    if (!pathVariables) {
        return urlTemplate;
    }

    let result = urlTemplate;

    Object.keys(pathVariables).forEach(key => {
        if (urlTemplate.indexOf(key) !== -1) {
            result = result.replace(`{${key}}`, pathVariables[key]);
        }
    });

    if (result.indexOf('{') !== -1) {
        throw Error('Parameters missing when binding variables to url-template.');
    }

    return result;
};

/**
 * Converts the action payload to http request body.
 * By convention, the conversion is this:
 * 1. initialize the http request body to be the same as action payload
 * 2. remove the fields which are already in the url (avoid having same data in both the url and req. body)
 * 3. if the action payload is just one key, such as {key: 'val'} then the req. body is just 'val'.
 */
export const getHttpRequestBody = (urlTemplate, actionPayload) => {
    if (!actionPayload || !(typeof actionPayload === 'object')) {
        return actionPayload;
    }
    const pathVariables = getPathVariables(urlTemplate);
    const actionPayloadWithoutPathVariables = {};
    Object.keys(actionPayload).forEach(key => {
        if (!pathVariables.includes(key)) {
            actionPayloadWithoutPathVariables[key] = actionPayload[key];
        }
    });

    // if the payload is just one key-val-pair, the request body is the value (because the key is just useless)
    return Object.keys(actionPayloadWithoutPathVariables).length === 1 ?
        Object.values(actionPayloadWithoutPathVariables)[0] : actionPayloadWithoutPathVariables;
};
