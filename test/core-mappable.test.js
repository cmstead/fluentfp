'use strict';

const assert = require('chai').assert;
const coreMappable = require('../bin/core/core-mappable.js');

describe('coreMappable', function () {

    describe('Nothing', function() {
        
        it('should return Nothing when mapped over', function() {
            var nothing = coreMappable.Nothing('foo');
            assert.equal(nothing.map(() => null), nothing);
        });

    });

    describe('Just', function() {
        it('should be mappable', function() {
            var justInt = coreMappable.Just('int', 1234);
            var result = justInt.map(value => value * 2);

            assert.equal(result.typeString(), 'Just<int>');
            assert.equal(result.getInnerValue(), 2468);
            assert.equal(result.valueOf(), 2468);
        });

        it('should wrap an array', function() {
            var justArray = coreMappable.Just('array', [1, 2, 3, 4]);
            var result = justArray.map(value => value * 2);

            assert.equal(justArray.typeString(), 'Just<array>');
            assert.equal(result.toString(), '2,4,6,8');
        });
    });

    describe('Maybe', function() {

        it('should return Maybe(transformed value) when mapped over', function() {
            var maybeInt = coreMappable.Maybe('int', 1234);
            var result = maybeInt
                .map(value => value * 2)
                .transform(value => value.toString(), 'string')
                .map(value => value + 5);

            assert.equal(result.getInnerValue().typeString(), 'Just<string>');
            assert.equal(result.valueOf(), '24685');
        });

        it('should return Maybe(Nothing) when mapped over and maybe check failed', function() {
            var maybeInt = coreMappable.Maybe('int', 'Oh noes!');
            var result = maybeInt.map(value => value * 2);

            assert.equal(result.getInnerValue().typeString(), 'Nothing<*>');
            assert.equal(result.valueOf(), null);
        });

        it('should allow for implicit operations against inner values', function() {
            var maybe5 = coreMappable.Maybe('int', 5);
            var maybe6 = coreMappable.Maybe('int', 6);
            var maybeNothing = coreMappable.Maybe('int', 'foo');

            assert.equal(maybe5 * maybe6, 30);
            assert.equal((maybe5 * maybeNothing).toString(), 'NaN');
        });

        it('should wrap an array', function() {
            var maybeArray = coreMappable.Maybe('array', [1, 2, 3, 4]);
            var result = maybeArray.map(value => value * 2);

            assert.equal(maybeArray.typeString(), 'Maybe<array>');
            assert.equal(result.toString(), '2,4,6,8');
        });
    });

    describe('toMappable', function() {
        
        it('should convert value into mappable type', function() {
            var mappableValue = coreMappable.toMappable('string', 'foo', (transformer, value) => transformer(value));
            var result = mappableValue.map((value) => value + ' ') + 'bar';
            assert.equal(result, 'foo bar');
        });

        it('should return a new mappable value', function() {
            var mappableValue = coreMappable.toMappable('int', 1234, (transformer, value) => transformer(value));
            
            var result = mappableValue
                .map((value) => value * 2)
                .transform(
                    (value) => value.toString(), 
                    'string')
                .map((value) => value + 1);

            assert.equal(result.typeString(), 'Just<string>');
            assert.equal(result, '24681');
        });

    });
});
