'use strict';

const assert = require('chai').assert;
const coreTypes = require('../bin/core-types.js');

describe('core-types', function () {

    describe('Nothing', function() {
        
        it('should return a Nothing instance', function() {
            assert.equal(coreTypes.Nothing().typeString(), 'Nothing<*>');
        });

    });

    describe('Just', function() {
        
        it('should return a wrapped value', function() {
            assert.equal(coreTypes.Just('int', 5).typeString(), 'Just<int>');
        });

        it('should return a wrapped array', function() {
            assert.equal(coreTypes.Just('array', [1, 2, 3, 4]).typeString(), 'Just<array>');
        });

    });

    describe('Maybe', function() {
        
        it('should return a wrapped value', function() {
            assert.equal(coreTypes.Maybe('string', 'testing!').typeString(), 'Maybe<string>');
        });

        it('should return a wrapped array', function() {
            assert.equal(coreTypes.Maybe('array', ['foo', 'bar', 'baz']).typeString(), 'Maybe<array>');
        });

    });

});
