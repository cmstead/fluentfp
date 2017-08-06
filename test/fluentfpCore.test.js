'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;

const fluentfp = require('../index.js');

describe('fluentfpCore', function () {
    require('./test-utils/approvals-config');

    describe('identity', function () {

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity(11);

            assert.equal(result, 11);
        });

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity.callWith(11);

            assert.equal(result, 11);
        });

        it('should return a function which returns the original value', function () {
            const result = fluentfp.identity.applyWith([11]);

            assert.equal(result, 11);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
