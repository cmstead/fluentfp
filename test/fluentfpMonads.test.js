'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;

const fluentfp = require('../index.js');

describe('fluentfpMonads', function () {
    require('./test-utils/approvals-config');

    describe('either', function () {

        it('should return passed value when it matches type', function () {
            const result = fluentfp.either('int')(0)(10);
            assert.equal(result, 10);
        });

        it('should return default value passed value is wrong type', function () {
            const result = fluentfp.either('int')(85)('foo');
            assert.equal(result, 85);
        });

        it('should call through all with arguments', function () {
            const result = fluentfp.either.callThrough('int', 0, 10);
            assert.equal(result, 10);
        });

        it('should call through with arguments', function () {
            const result = fluentfp.either('int').callThrough(0, 10);
            assert.equal(result, 10);
        });

        it('should support a blended API call', function () {
            const result = fluentfp
                .either('int')
                .withDefault(0)(12);

            assert.equal(result, 12);
        });

        it('should support a fluent api', function () {
            const result = fluentfp
                .either('int')
                .withDefault(0)
                .callWith(13);

            assert.equal(result, 13);
        });

    });

    describe('maybe', function () {

        it('should return passed value when it matches type', function () {
            const result = fluentfp.maybe('int')(99);
            assert.equal(result, 99);
        });

        it('should return null when value does not match', function () {
            const result = fluentfp.maybe('int')('foo');
            assert.equal(result, null);
        });

        it('should support a fluent api', function () {
            const result = fluentfp.maybe('int').callWith(1234);
            assert.equal(result, 1234);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
