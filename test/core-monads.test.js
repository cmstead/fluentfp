'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const coreMonads = require('../bin/core-monads.js');

describe('core-monads', function () {
    require('./test-utils/approvals-config');

    describe('either', function () {

        it('should return default value if user value is wrong type', function () {
            assert.equal(coreMonads.either('string', 'foo')(null), 'foo');
        });
        
        it('should return user value if it is the correct type', function() {
            assert.equal(coreMonads.either('string', 'foo')('bar'), 'bar');
        });

        it('should throw an error if default value is not correct type', function() {
            assert.throws(() => coreMonads.either('string', 1234)('bar'), 'Unacceptable either default, must be null or specified type');
        });

    });
    
    describe('maybe', function() {
        
        it('should return null if user value is the wrong type', function() {
            assert.equal(coreMonads.maybe('string', 999), null);
        });

        it('should return user value if it is the right type', function() {
            assert.equal(coreMonads.maybe('string', 'foo'), 'foo');
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
