// eslint-disable-next-line no-unused-vars
const coreMonads = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('../signet-types');
        const coreFunctions = require('./core-functions');
        const corePredicates = require('./core-predicates');

        const moduleOutput = moduleFactory(signet, coreFunctions, corePredicates);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
       return moduleFactory(signet, coreFunctions, corePredicates);
    }

})(function (signet, coreFunctions, corePredicates) {
    'use strict';

    const isNull = corePredicates.isNull;
    const identity = coreFunctions.identity;

    function acceptableEitherType(type, value) {
        return isNull(value) || signet.isTypeOf(type)(value);
    }

    function throwOnBadDefault(type, defaultValue, errorMessage) {
        if (!acceptableEitherType(type, defaultValue)) {
            throw new Error(errorMessage);
        }

        return defaultValue;
    }

    const meither = (type, transformer, defaultTransformer) =>
        (testValue) =>
            signet.isTypeOf(type)(testValue)
                ? transformer(testValue)
                : defaultTransformer(testValue);

    const either = (type, defaultValue) => {
        const errorMessage = 'Unacceptable either default, must be null or specified type';
        throwOnBadDefault(type, defaultValue, errorMessage);

        const eitherable = meither(type, identity, () => defaultValue);

        return testValue => eitherable(testValue);
    }

    return {
        either: signet.enforce(
            'type:fluentType, defaultValue:* => testValue:* => *',
            either),

        meither: signet.enforce(
            'type: fluentType, ' +
            'transformer: function<* => *>, ' +
            'defaultTransformer: function<* => *> ' +
            '=> testValue: * ' +
            '=> *',
            meither)
    };

});
