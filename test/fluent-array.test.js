'use strict';

const assert = require('chai').assert;
const fluentArray = require('../bin/fluent-array');
const coreMappable = require('../bin/core/core-mappable');
const coreAppendable = require('../bin/core/core-appendable');

describe('fluent-array', function () {
    const isEven = (value) => value % 2 === 0;
    const add = a => b => a + b;
    
    describe('map', function () {

        it('should map over an array', function () {
            const result = fluentArray.map(value => value + 1)([1, 2, 3, 4]);
            assert.equal(result.toString(), '2,3,4,5');
        });

        it('should make arrays transformable', function () {
            const result = fluentArray
                .map
                .callThrough(value => value + 1, [1, 2, 3, 4])
                .transform(fluentArray.map(value => value * 2), 'array')
                .toString();

            assert.equal(result, '4,6,8,10');
        });

        it('should map over a mappable value', function () {
            const mappableInt = coreMappable.Just('int', 5);
            const result = fluentArray
                .map
                .callThrough(value => value + 1, mappableInt);

            assert.equal(result, 6);
        });

    });

    describe('filter', function () {


        it('should filter by a predicate function', function () {
            const result = fluentArray.filter(isEven)([1, 2, 3, 4, 5, 6]).toString();
            assert.equal(result, '2,4,6');
        });

        it('should provide a fluent, chainable filter behavior', function () {
            const mapToTriple = fluentArray.map(value => value * 3);

            const result = fluentArray
                .filter
                .callThrough(isEven, [1, 2, 3, 4, 5, 6])
                .transform(mapToTriple, 'array')
                .toString();

            assert.equal(result, '6,12,18');
        });

    });

    describe('append', function () {

        it('should append two arrays', function () {
            const result = fluentArray.append([1, 2, 3], [4, 5, 6]).toString();
            assert.equal(result, '1,2,3,4,5,6');
        });

        it('should append two arrays and provide a fluent interface', function () {
            const removeOddsThenAdd5 = fluentArray
                .map(add(5))
                .compose(fluentArray.filter(isEven))

            const result = fluentArray
                .append([1, 2, 3], [5, 7, 9])
                .transform(removeOddsThenAdd5, 'array')
                .first();

            assert.equal(result, 7);
        });

        it('should append two appendable values', function () {
            const appendable5 = coreAppendable.toAdditive(5);
            const appendable7 = coreAppendable.toAdditive(7);

            const result = fluentArray.append(appendable5, appendable7);
            assert.equal(result, 12);
        });

    });
});
