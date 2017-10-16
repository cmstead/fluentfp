'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if(isNode) {
        const signet = require('./signet-types');

        module.exports = moduleFactory(signet);
    } else {
        window.corePredicates = moduleFactory(signet);
    }

})(function (signet) {
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
