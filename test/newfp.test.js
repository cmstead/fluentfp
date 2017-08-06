'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
// const prettyJson = require('./test-utils/prettyJson');
// const sinon = require('sinon');

const fluentfp = require('../index.js');

describe('fluentfp', function () {
    require('./test-utils/approvals-config');

    describe('apply', function () {

        let add;

        beforeEach(function () {
            add = (a, b) => a + b;
        });

        it('should apply array of arguments to function', function () {
            const result = fluentfp.apply(add, [123, 456]);

            assert.equal(result, 579);
        });

        it('should return a callable function if no arguments are provided', function () {
            const result = fluentfp.apply(add);

            assert.equal(result(5, 6), 11);
        });

        it('should box function in helper with "with" function when no values provided', function () {
            const result = fluentfp
                .apply(add)
                .with([1, 2]);

            assert.equal(result, 3);
        });

        it('should implicitly handle explicitly curried functions', function () {
            const curriedAdd = (a) => (b) => a + b;

            const result = fluentfp
                .apply(curriedAdd)
                .through([4, 5]);

            assert.equal(result, 9);
        });

        it('should assign a function context', function () {
            function thisAdd(c, d) {
                return this.a + this.b + c + d;
            }

            const result = fluentfp
                .apply(thisAdd)
                .on({ a: 6, b: 7 })
                .with([8, 9]);

            assert.equal(result, 30);
        });

        it('should work with standard Javascript function behaviors', function () {
            function thisAdd(c, d) {
                return this.a + this.b + c + d;
            }

            const result = fluentfp
                .apply(thisAdd)
                .on({ a: 6, b: 7 })
                .call(null, 10, 11);

            assert.equal(result, 34);
        });

    });

    describe('call', function () {

        let add;

        beforeEach(function () {
            add = (a, b) => a + b;
        });

        it('should call passed function with arguments', function () {
            const result = fluentfp.call(add, 3, 5);
            assert.equal(result, 8);
        });

        it('should return callable function when no arguments are provided', function () {
            const result = fluentfp.call(add);
            assert.equal(result(1, 2), 3);
        });

        it('should box function in helper with "with" function when no values provided', function () {
            const result = fluentfp
                .call(add)
                .with(1, 2);

            assert.equal(result, 3);
        });

        it('should implicitly handle explicitly curried functions', function () {
            const curriedAdd = (a) => (b) => a + b;

            const result = fluentfp
                .call(curriedAdd)
                .through(4, 5);

            assert.equal(result, 9);
        });

        it('should assign a function context', function () {
            function thisAdd(c, d) {
                return this.a + this.b + c + d;
            }

            const result = fluentfp
                .call(thisAdd)
                .on({ a: 6, b: 7 })
                .with(8, 9);

            assert.equal(result, 30);
        });

        it('should work with standard Javascript function behaviors', function () {
            function thisAdd(c, d) {
                return this.a + this.b + c + d;
            }

            const result = fluentfp
                .call(thisAdd)
                .on({ a: 6, b: 7 })
                .apply(null, [10, 11]);

            assert.equal(result, 34);
        });

    });

    describe('identity', function () {

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity(11);

            assert.equal(result, 11);
        });

    });

    describe('either', function () {

        it('should return passed value when it matches type', function () {
            const result = fluentfp.either('int')(0)(10);
            assert.equal(result, 10);
        });

        it('should return default value passed value is wrong type', function () {
            const result = fluentfp.either('int')(85)('foo');
            assert.equal(result, 85);
        });

        it('should call through with arguments', function () {
            const result = fluentfp.either('int').callThrough(0, 10);
            assert.equal(result, 10);
        });

        it('should support a blended API call', function () {
            const result = fluentfp
                .either('int')
                .withDefault(0)(12);

            assert.equal(result, 12);
        });

        it('should support a fluent api', function () {
            const result = fluentfp
                .either('int')
                .withDefault(0)
                .callWith(13);

            assert.equal(result, 13);
        });

    });

    describe('maybe', function () {

        it('should return passed value when it matches type', function () {
            const result = fluentfp.maybe('int')(99);
            assert.equal(result, 99);
        });

        it('should return null when value does not match', function () {
            const result = fluentfp.maybe('int')('foo');
            assert.equal(result, null);
        });

        it('should support a fluent api', function () {
            const result = fluentfp.maybe('int').callWith(1234);
            assert.equal(result, 1234);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}