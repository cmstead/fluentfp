(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');

        module.exports = moduleFactory(signet);
    } else {
        window.coreFunctions = moduleFactory(signet);
    }

})(function (signet) {
    'use strict';

    (signet);
});
