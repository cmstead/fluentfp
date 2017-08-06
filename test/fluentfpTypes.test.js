'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const fluentfpTypes = require('../bin/fluentfpTypes.js');

describe('fluentfpTypes', function () {
    require('./test-utils/approvals-config');
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
