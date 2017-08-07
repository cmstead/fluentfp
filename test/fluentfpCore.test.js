'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;

const fluentfp = require('../index.js');

describe('fluentfpCore', function () {
    require('./test-utils/approvals-config');

    const add = (a) => (b) => a + b;

    describe('identity', function () {

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity(11);

            assert.equal(result, 11);
        });

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity.callWith(11);

            assert.equal(result, 11);
        });

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity.applyWith([11]);

            assert.equal(result, 11);
        });

    });

    describe('compose', function () {

        it('should compose two functions together', function () {
            const result = fluentfp.compose(add(1), add(2))(3);
            assert.equal(result, 6);
        });

        it('should compose a single function with identity', function () {
            const result = fluentfp.compose(add(1))(5);
            assert.equal(result, 6);
        });

        it('should compose more functions using the with syntax', function () {
            const result = fluentfp
                .compose(add(1))
                .with(add(4))
                .with(add(5))
                .callWith(10);

            assert.equal(result, 20);
        });

    });

    describe.skip('pipeline', function () {

        it('should pipe data through one function', function () {
            const result = fluentfp.pipeline(2, add(1));
            assert.equal(result, 3);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
