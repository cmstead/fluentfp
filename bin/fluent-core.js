'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if(isNode) {
        const corePredicates = require('./core-predicates');
        const coreFunctions = require('./core-functions');
        const coreMonads = require('./core-monads');
        const coreMappable = require('./core-mappable');

        const signet = require('./signet-types');

        module.exports = moduleFactory(
            signet,
            corePredicates,
            coreFunctions,
            coreMonads,
            coreMappable
        );
    } else {
        window.fluentCore = moduleFactory(
            window.fuentSignet,
            window.corePredicates,
            window.coreFunctions,
            window.coreMonads,
            window.coreMappable
        );
    }

})(function (
    signet,
    corePredicates,
    coreFunctions,
    coreMonads,
    coreMappable
) {
    'use strict';

    return {
        isArray: corePredicates.isArray,
        isFunction: corePredicates.isFunction,
        isInt: corePredicates.isInt,
        isNull: corePredicates.isNull,

        apply: coreFunctions.apply,
        applyThrough: coreFunctions.applyThrough,
        call: coreFunctions.call,
        callThrough: coreFunctions.callThrough,
        compose: coreFunctions.compose,
        curry: coreFunctions.curry,
        identity: coreFunctions.identity,
        slice: coreFunctions.slice,

        either: coreMonads.either,
        meither: coreMonads.meither,

        Just: coreMappable.Just,
        Maybe: coreMappable.Maybe,
        Nothing: coreMappable.Nothing
    };
});
