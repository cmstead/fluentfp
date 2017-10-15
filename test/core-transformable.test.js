'use strict';

const assert = require('chai').assert;
const coreTransformable = require('../bin/core-transformable.js');

describe('core-transformable', function () {
    describe('Nothing', function() {
        
        it('should return a Nothing instance', function() {
            assert.equal(coreTransformable.Nothing().typeString(), 'Nothing<*>');
        });

    });

    describe('Just', function() {
        
        it('should return a wrapped value', function() {
            assert.equal(coreTransformable.Just('int', 5).typeString(), 'Just<int>');
        });

        it('should return a wrapped array', function() {
            assert.equal(coreTransformable.Just('array', [1, 2, 3, 4]).typeString(), 'Just<array>');
        });

    });

    describe('Maybe', function() {
        
        it('should return a wrapped value', function() {
            assert.equal(coreTransformable.Maybe('string', 'testing!').typeString(), 'Maybe<string>');
        });

        it('should return a wrapped array', function() {
            assert.equal(coreTransformable.Maybe('array', ['foo', 'bar', 'baz']).typeString(), 'Maybe<array>');
        });

    });

});
