
import {bindPathVariables, getPathVariables, getHttpRequestBody} from './urlTemplateUtils';

describe('urlTemplateUtils', () => {
    describe('bindPathVariables', () => {
        it('toimii ilman templatea ja parametreja', () => {
            expect(bindPathVariables()).toEqual(undefined);
        });

        it('toimii ilman parametreja', () => {
            expect(bindPathVariables('a')).toEqual('a');
        });

        it('loytaa parametrit', () => {
            expect(bindPathVariables('/a/{a}', {pathVariables: {a: 1}})).toEqual('/a/1');

            expect(bindPathVariables('/a/{a}/b/{b}/c/{test}', {pathVariables: {a: 1, b: 2, test: 3}}))
                .toEqual('/a/1/b/2/c/3');
        });

        it('ei huomioi parametreja, jotka eivat ole urlissa', () => {
            expect(bindPathVariables('/a/{a}', {pathVariables: {a: 1, b: 2}})).toEqual('/a/1');
        });

        it('heittaa poikkeuksen, jos parametria ei loydy', done => {
            try {
                bindPathVariables('/a/{a}', {pathVariables: {}});
            } catch (e) {
                done();
            }
        });
    });

    describe('getPathVariables', () => {
        it('osaa parsia polusta kaarisulkeissa olevat muuttujat', () => {
            expect(getPathVariables()).toEqual(getPathVariables());
            expect(getPathVariables('api/todo')).toEqual([]);
            expect(getPathVariables('/todo/{todoId}/item/{itemId}/detail/{detailId}'))
                .toEqual(['todoId', 'itemId', 'detailId']);
        });
    });

    describe('getHttpRequestBody', () => {
        it('poistaa http requestin bodysta muuttujat, jotka ovat jo urlissa', () => {
            expect(getHttpRequestBody('/api/{todoId}', {todoId: 1, b: 2})).toEqual(2);
            expect(getHttpRequestBody('/api/{todoId}', {todoId: 1, b: 2, c: 3})).toEqual({b: 2, c: 3});
        });

        it('käyttää payloadia suoraan, jos path variableja ei ole', () => {
            expect(getHttpRequestBody('/api/todo', null)).toEqual(null);
            expect(getHttpRequestBody('/api/{todoId}', null)).toEqual(null);
            expect(getHttpRequestBody('/api/todo', '1/31/2019')).toEqual('1/31/2019');
        });
    });
});
