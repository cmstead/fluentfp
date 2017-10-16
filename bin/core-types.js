// eslint-disable-next-line no-unused-vars
const coreTypes = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');
        const coreFunctions = require('./core-functions');

        const moduleOutput = moduleFactory(signet, coreMonads, coreFunctions);

        module.exports = moduleOutput;
        return moduleOutput
    } else {
        return moduleFactory(signet, coreMonads, coreFunctions);
    }

})(function (signet, coreMonads, coreFunctions) {
    'use strict';

    const meither = coreMonads.meither;
    const isUnsafeType = signet.isTypeOf('variant<array, function>');

    const valueOf = coreFunctions.valueOf


    function addTypeMethods(typeValue, innerValue, outerType, innerType) {
        if(!isUnsafeType(innerValue)) {
            typeValue.valueOf = () => valueOf(innerValue);
        }
        
        typeValue.getInnerValue = () => innerValue;
        typeValue.typeString = () => outerType + '<' + innerType + '>';

        return typeValue;
    }

    function Nothing() {
        const nothingValue = Object(undefined);

        return addTypeMethods(nothingValue, undefined, 'Nothing', '*');
    }

    function Just(type, value) {
        if (!signet.isTypeOf(type)(valueOf(value))) {
            throw new Error('Unable to create new value of type \'' + type + '\' with value ' + value);
        }

        const justValue = Object(value);

        return addTypeMethods(justValue, value, 'Just', type);
    }

    const buildIsNothing = (innerValue) => () => innerValue.typeString() === 'Nothing<*>';

    function Maybe(type, value) {
        const maybeValue = Object(value);
        const innerValue = meither(type, () => Just(type, value), () => Nothing())(value);

        maybeValue.isNothing = buildIsNothing(innerValue);

        return addTypeMethods(maybeValue, innerValue, 'Maybe', type);
    }

    return {
        Just: signet.enforce(
            'inputType:type, value:* => Just<*>',
            Just),
        Maybe: signet.enforce(
            'inputType:type, value:* => Maybe<*>',
            Maybe),
        Nothing: signet.enforce(
            '* => Nothing<*>',
            Nothing)
    };

});
