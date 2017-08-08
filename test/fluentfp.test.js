'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;

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

    describe('slice', function () {

        it('should slice an array', function () {
            const result = fluentfp.slice(1, 3)([1, 2, 3, 4, 5]);
            assert.equal(result.toString(), '2,3');
        });

        it('should slice an array with a fluent API', function () {
            const result = fluentfp
                .slice
                .from(1)
                .to(5)
                .callWith([1, 2, 3, 4, 5])
                .filter((value) => value % 2 === 1)
                .map((value) => value * 3)
                .reduce((sum, value) => sum + value);

            assert.equal(result.toString(), '24');
        });

    });

    describe('partial', function () {

        function add (a, b) {
            return a + b;
        }

        it('should partially apply values to a function', function () {
            const result = fluentfp.partial(add, 1)(2);
            assert.equal(result, 3);
        });

        it('should support adding values to application', function () {
            const result = fluentfp
                .partial(add)
                .bindValues(1)
                .bindValues(5)();

            assert.equal(result, 6);
        });

        it('should support a full fluent interface', function () {
            const result = fluentfp
                .partial
                .function(add)
                .bindValues(1, 2)
                .exec();

            assert.equal(result, 3);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
