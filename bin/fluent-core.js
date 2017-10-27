// eslint-disable-next-line no-unused-vars
const fluentCore = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const corePredicates = require('./core/core-predicates');
        const coreFunctions = require('./core/core-functions');
        const coreMonads = require('./core/core-monads');
        const coreTransformable = require('./core/core-transformable');
        const coreMappable = require('./core/core-mappable');
        const coreAppendable = require('./core/core-appendable');

        const moduleOutput = moduleFactory(
            corePredicates,
            coreFunctions,
            coreMonads,
            coreTransformable,
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
            coreTransformable,
            coreMappable,
            coreAppendable
        );
    }

})(function (
    corePredicates,
    coreFunctions,
    coreMonads,
    coreTransformable,
    coreMappable,
    coreAppendable
) {
    'use strict';

    const compose = coreFunctions.compose;

    function addCoreBehaviors(value) {
        if (corePredicates.isFunction(value)) {
            value.applyThrough = (args) => coreFunctions.applyThrough(value, args);
            value.callThrough = (...args) => coreFunctions.applyThrough(value, args);
            value.callWith = (...args) => coreFunctions.apply(value, args);
            value.curry = (...args) => coreFunctions.curry.apply(null, value, args);
            value.compose = (fn) => addCoreBehaviors(coreFunctions.compose(value, fn));
            value.pipelineTo = (fn) => addCoreBehaviors(compose(fn, value));
        }

        return value;
    }

    return {
        addCoreBehaviors: addCoreBehaviors,

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

        identityTransform: coreTransformable.identityTransform,

        toTransformable: coreTransformable.toTransformable,
        toMappable: coreMappable.toMappable,
        toAppendable: coreAppendable.toAppendable,
        toCompositional: coreAppendable.toCompositional,
        toMultiplicative: coreAppendable.toMultiplicative,
        toAdditive: coreAppendable.toAdditive,
        toConcatable: coreAppendable.toConcatable
    };
});
