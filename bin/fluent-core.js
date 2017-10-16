// eslint-disable-next-line no-unused-vars
const fluentCore = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if(isNode) {
        const corePredicates = require('./core/core-predicates');
        const coreFunctions = require('./core/core-functions');
        const coreMonads = require('./core/core-monads');
        const coreMappable = require('./core/core-mappable');
        const coreAppendable = require('./core/core-appendable');

        const moduleOutput = moduleFactory(
            corePredicates,
            coreFunctions,
            coreMonads,
            coreMappable,
            coreAppendable
        );

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(
            corePredicates,
            coreFunctions,
            coreMonads,
            coreMappable,
            coreAppendable
        );
    }

})(function (
    corePredicates,
    coreFunctions,
    coreMonads,
    coreMappable,
    coreAppendable
) {
    'use strict';

    return {
        isArray: corePredicates.isArray,
        isFunction: corePredicates.isFunction,
        isInt: corePredicates.isInt,
        isNull: corePredicates.isNull,
        isReferencible: corePredicates.isReferencible,

        apply: coreFunctions.apply,
        applyThrough: coreFunctions.applyThrough,
        call: coreFunctions.call,
        callThrough: coreFunctions.callThrough,

        compose: coreFunctions.compose,
        curry: coreFunctions.curry,
        identity: coreFunctions.identity,
        noOp: coreFunctions.noOp,
        recur: coreFunctions.recur,
        slice: coreFunctions.slice,
        valueOf: coreFunctions.valueOf,

        either: coreMonads.either,
        meither: coreMonads.meither,

        Just: coreMappable.Just,
        Maybe: coreMappable.Maybe,
        Nothing: coreMappable.Nothing,

        toMappable: coreMappable.toMappable,
        toAppendable: coreAppendable.toAppendable,
        toCompositional: coreAppendable.toCompositional,
        toMultiplicative: coreAppendable.toMultiplicative,
        toAdditive: coreAppendable.toAdditive,
        toConcatable: coreAppendable.toConcatable
    };
});
