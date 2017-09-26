'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const coreTyping = require('../bin/core-typing.js');

describe('coreTyping', function () {
    require('./test-utils/approvals-config');

    describe('None', function() {
        
        it('should return None when mapped over', function() {
            var none = coreTyping.None('foo');
            assert.equal(none.map(() => null), none);
        });

    });

    describe('Maybe', function() {
        
        it('should return transformed value when mapped over', function() {
            var maybeInt = coreTyping.Maybe('int', 1234);
            assert.equal(maybeInt.map((value) => value * 2), 2468);
        });

        it('should return None when mapped over and maybe check failed', function() {
            var maybeInt = coreTyping.Maybe('int', 'Oh noes!');
            assert.equal(maybeInt.map((value) => value * 2), coreTyping.None);
        });

    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
