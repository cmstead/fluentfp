'use strict';

const assert = require('chai').assert;
const fluentArray = require('../bin/fluent-array');
const coreMappable = require('../bin/core/core-mappable');

describe('fluent-array', function () {
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
});
