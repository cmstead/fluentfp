'use strict';

const assert = require('chai').assert;

const coreMonads = require('../bin/core/core-monads.js');

describe('core-monads', function () {

    describe('either', function () {

        it('should return default value if user value is wrong type', function () {
            assert.equal(coreMonads.either('string', 'foo')(null), 'foo');
        });
        
        it('should return user value if it is the correct type', function() {
            assert.equal(coreMonads.either('string', 'foo')('bar'), 'bar');
        });

        it('should throw an error if default value is not correct type', function() {
            const testFn = () => coreMonads.either('string', 1234)('bar');
            const message = 'Unacceptable either default, must be null or specified type';

            assert.throws(testFn, message);
        });

    });

    describe('meither', function () {

        it('should return default value if user value is wrong type', function () {
            const result = coreMonads.meither('string', (value) => value + '!', () => 'foo')(null);
            assert.equal(result, 'foo');
        });
        
        it('should return user value if it is the correct type', function() {
            const result = coreMonads.meither('string', (value) => value + '!', () => 'foo')('bar')
            assert.equal(result, 'bar!');
        });

    });

});
