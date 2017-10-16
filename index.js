(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        const fluentCore = require('./bin/fluent-core');

        module.exports = moduleFactory(fluentCore);
    } else {
        window.fluentfp = moduleFactory(fluentCore);
    }

})(function (fluentCore) {
    'use strict';

    (fluentCore);
});
