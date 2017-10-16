// eslint-disable-next-line no-unused-vars
const corePredicates = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('../signet-types');

        const moduleOutput = moduleFactory(signet);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(signet);
    }

})(function (signet) {
    'use strict';

    const isArray = signet.isTypeOf('array');
    const isFunction = signet.isTypeOf('function');
    const isInt = signet.isTypeOf('int');
    const isNull = signet.isTypeOf('null');
    const isReferencible = signet.isTypeOf('referencible');

    return {
        isArray: isArray,
        isFunction: isFunction,
        isInt: isInt,
        isNull: isNull,
        isReferencible: isReferencible
    };
});
