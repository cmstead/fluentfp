(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        module.exports = moduleFactory(signet);
    } else if (typeof signet === 'object') {
        window.fluentfp = moduleFactory(signet);
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet) {
    'use strict';

    (signet);
});
