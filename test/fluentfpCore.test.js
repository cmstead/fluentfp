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

    });

    describe('always', function () {

        it('should return a function which returns the original value', function () {
            assert.equal(fluentfp.always(1)(), 1);
        });

    });

    describe('compose', function () {

        it('should compose two functions together', function () {
            const result = fluentfp.compose(add(1), add(2))(3);
            assert.equal(result, 6);
        });

        it('should compose multiple functions together', function () {
            const result = fluentfp.compose(add(1), add(2), add(3), add(4))(5);
            assert.equal(result, 15);
        });

        it('should compose a single function with identity', function () {
            const result = fluentfp.compose(add(1))(5);
            assert.equal(result, 6);
        });

        it('should compose multiple functions with through method', function () {
            const result = fluentfp
                .compose
                .through([
                    add(1),
                    add(2),
                    add(3),
                    add(4),
                    add(5)
                ])
                .bindValues(6)
                .exec();

            assert.equal(result, 21);
        });

        it('should compose more functions using the with syntax', function () {
            const result = fluentfp
                .compose(add(1))
                .with(add(4))
                .with(add(5))
                .with(add(6))
                .with(add(7))
                .callWith(10);

            assert.equal(result, 33);
        });

    });

    describe('pipeline', function () {

        it('should pipe data through one function', function () {
            const result = fluentfp.pipeline(2, add(1));
            assert.equal(result, 3);
        });

        it('should pipe data through multiple functions', function () {
            const result = fluentfp.pipeline(2, add(1), add(3), add(5));
            assert.equal(result, 11);
        });

        it('should pipe data through multiple functions and be callable', function () {
            const result = fluentfp
                .pipeline
                .value(2)
                .into(add(1))
                .into(add(3))
                .into(add(5))
                .into(add(7))();

            assert.equal(result, 18);
        });

        it('should pipe data through multiple functions', function () {
            const result = fluentfp
                .pipeline
                .value(2)
                .into(add(1))
                .into(add(3))
                .into(add(5))
                .into(add(7))
                .exec();

            assert.equal(result, 18);
        });

        it('should pipe through an array of functions', function () {
            const result = fluentfp
                .pipeline
                .value(2)
                .through([
                    add(4),
                    add(6),
                    add(8),
                    add(10)
                ]);

            assert.equal(result, 30);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
