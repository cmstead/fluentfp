'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const coreMappable = require('../bin/core-mappable.js');

describe('coreMappable', function () {
    require('./test-utils/approvals-config');

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

            assert.equal(result.toString(), 'Just<int>');
            assert.equal(result.getInnerValue(), 2468);
            assert.equal(result.valueOf(), 2468);
        });
    });

    describe('Maybe', function() {

        it('should return Maybe(transformed value) when mapped over', function() {
            var maybeInt = coreMappable.Maybe('int', 1234);
            var result = maybeInt.map(value => value * 2);

            assert.equal(result.getInnerValue().toString(), 'Just<int>');
            assert.equal(result.valueOf(), 2468);
        });

        it('should return Maybe(Nothing) when mapped over and maybe check failed', function() {
            var maybeInt = coreMappable.Maybe('int', 'Oh noes!');
            var result = maybeInt.map(value => value * 2);

            assert.equal(result.getInnerValue().toString(), 'Nothing<*>');
            assert.equal(result.valueOf(), null);
        });

        it('should allow for implicit operations against inner values', function() {
            var maybe5 = coreMappable.Maybe('int', 5);
            var maybe6 = coreMappable.Maybe('int', 6);
            var maybeNothing = coreMappable.Maybe('int', 'foo');

            assert.equal(maybe5 * maybe6, 30);
            assert.equal((maybe5 * maybeNothing).toString(), 'NaN');
        });

    });

    describe('toMappable', function() {
        
        it('should convert value into mappable type', function() {
            var mappableValue = coreMappable.toMappable('foo', (value, transformer) => transformer(value));
            var result = mappableValue.map((value) => value + ' ') + 'bar';
            assert.equal(result, 'foo bar');
        });

        it('should return a new mappable value', function() {
            var mappableValue = coreMappable.toMappable(1234, (value, transformer) => transformer(value));
            var result = mappableValue.map((value) => value * 2).map((value) => value.toString()) + 1;
            assert.equal(result, '24681');
        });

    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
