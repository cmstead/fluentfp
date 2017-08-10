'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;

const fluentfp = require('../index.js');

describe('fluentfpArray', function () {
    require('./test-utils/approvals-config');

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
                .onArray([1, 2, 3, 4, 5])

                .filter((value) => value % 2 === 1)
                .map((value) => value * 3)
                .reduce((sum, value) => sum + value);

            assert.equal(result.toString(), '24');
        });

    });

    describe('_push', function () {

        it('should push a value into an array', function () {
            let result = [1, 2, 3];
            fluentfp._push(result)(4);

            assert.equal(result.toString(), '1,2,3,4');
        });

        it('should push return array which is being modified', function () {
            const result = fluentfp._push([1, 2, 3, 4])(5);

            assert.equal(result.toString(), '1,2,3,4,5');
        });

        it('should should be callable-decorated', function () {
            const result = fluentfp._push.callThrough([4, 3, 2], 1);

            assert.equal(result.toString(), '4,3,2,1');
        });

    });

    describe('filter', function () {

        let originalValues;

        beforeEach(function () {
            originalValues = [1, 2, 3, 4, 5, 6, 7, 8];
        });

        it('should filter values based on a predicate', function () {
            const isEven = (value) => value % 2 === 0;
            const result = fluentfp.filter(isEven)(originalValues);

            assert.equal(result.toString(), '2,4,6,8');
        });

        it('should be callable decorated', function () {
            const isOdd = (value) => value % 2 === 1;
            const result = fluentfp.filter.callThrough(isOdd, originalValues);

            assert.equal(result.toString(), '1,3,5,7');
        });

    });

    describe('map', function () {

        it('should map values appropriately', function () {
            const result = fluentfp.map((value) => value * 3)([1, 2, 3]);
            assert.equal(result.toString(), '3,6,9');
        });

        it('should be callable decorated', function () {
            const result = fluentfp.map.callThrough((value) => value * 3, [3, 2, 1]);
            assert.equal(result.toString(), '9,6,3');
        });

    });

    describe('concat', function () {

        it('should concat a value into an array', function () {
            const result = fluentfp.concat([1, 2, 3, 4])([5]);
            assert.equal(result.toString(), '1,2,3,4,5');
        });

    });

    describe('Array decoration', function () {

        it('should decorate returned arrays with fluent functions', function () {
            const originalValues = [1, 2, 3, 4, 5, 6, 7, 8];
            const isEven = (value) => value % 2 === 0;
            const divideBy2 = (value) => value / 2;
            const add = (a, b) => a + b;

            const theoryResult = fluentfp
                .pipeline(originalValues)
                .through([
                    fluentfp.slice(0),

                    (values) => fluentfp._push(values)(9),
                    (values) => fluentfp.concat(values)([10]),

                    fluentfp.filter(isEven),
                    fluentfp.map(divideBy2),
                    fluentfp.foldl(add, 0)
                ]);

            const result = fluentfp
                .slice
                .from(0)
                .onArray(originalValues)

                ._push(9)
                .fluentConcat([10])

                .fluentFilter(isEven)
                .fluentMap(divideBy2)
                .fluentFoldl(add, 0);

            assert.equal(result, theoryResult);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
