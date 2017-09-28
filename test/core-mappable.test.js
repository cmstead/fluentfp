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
            assert.equal(nothing.map(() => null), coreMappable.Nothing);
        });

    });

    describe('Maybe', function() {

        it('should return Maybe(transformed value) when mapped over', function() {
            var maybeInt = coreMappable.Maybe('int', 1234);
            var result = maybeInt(value => value * 2);

            assert.equal(result.getInnerValue().toString(), 'Just<int>');
            assert.equal(result.valueOf(), 2468);
        });

        it('should return Maybe(Nothing) when mapped over and maybe check failed', function() {
            var maybeInt = coreMappable.Maybe('int', 'Oh noes!');
            var result = maybeInt.map(value => value * 2);

            assert.equal(result.getInnerValue(), coreMappable.Nothing);
            assert.equal(result.valueOf(), null);
        });

    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
