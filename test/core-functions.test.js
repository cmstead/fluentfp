'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const coreFunctions = require('../bin/core-functions.js');

function add (a, b) { return a + b; }

describe('core-functions', function () {
    require('./test-utils/approvals-config');

    describe('apply', function() {
        
        it('should apply arguments to a passed function', function() {

            assert.equal(coreFunctions.apply(add, [5, 6]), 11);
        });

    });

    describe('identity', function() {
        
        it('should return the argument which is passed', function() {
            assert.equal(coreFunctions.identity('testing'), 'testing');
        });

    });

    describe('curry', function() {

        it('should curry a one-argument function', function() {
            var curriedIdentity = coreFunctions.curry(coreFunctions.identity);
            assert.equal(curriedIdentity()(1234), 1234);
        });

        it('should curry a multi-value function', function() {
            var curriedAdd = coreFunctions.curry(add);
            assert.equal(curriedAdd(5)(6), 11);
        });

        it('should not share state', function() {
            const curriedAdd = coreFunctions.curry(add);
            const add1 = curriedAdd(1);
            const add2 = curriedAdd(2);

            assert.equal(add1(2), 3);
            assert.equal(add2(3), 5);
        });

        it('should update function length appropriately when currying', function() {
            const curriedAdd = coreFunctions.curry(add);
            assert.equal(curriedAdd(1).length, 1);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
