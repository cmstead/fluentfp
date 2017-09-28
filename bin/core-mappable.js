(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');

        module.exports = moduleFactory(signet, coreMonads);
    } else {
        window.coreTyping = moduleFactory(signet, window.coreMonads);
    }

})(function (signet, coreMonads) {
    'use strict';

    const either = coreMonads.either;
    const meither = coreMonads.meither;

    const getValueOf = (value) =>
        signet.isTypeOf('referencible')(value)
            ? value.valueOf()
            : value;

    const pickType = (inputType, outputType) => either('type', inputType)(outputType);

    const addConstructorBehaviors = (typeConstructor) => {
        typeConstructor.withType = typeStr => value => typeConstructor(typeStr, value);
        return typeConstructor;
    }

    const addWrapperBehaviors = (outerType, wrapperFn, innerValue, innerType) => {
        wrapperFn.map = wrapperFn;
        wrapperFn.valueOf = () => getValueOf(innerValue);
        wrapperFn.getInnerValue = () => innerValue;
        wrapperFn.toString = () => outerType + '<' + innerType + '>';

        return wrapperFn;
    }

    const Nothing = addWrapperBehaviors('Nothing', function Nothing() { return Nothing; }, null, '*');

    const Just = addConstructorBehaviors(
        function Just(inputType, value) {

            const justValue = (transformer, outputType) =>
                Just(
                    pickType(inputType, outputType),
                    transformer(value)
                );

            return addWrapperBehaviors('Just', justValue, value, inputType);
        }
    );

    const Maybe = addConstructorBehaviors(
        function Maybe(inputType, value) {
            const innerValue = meither(inputType, Just.withType(inputType), Nothing)(getValueOf(value));

            const maybeValue = (transformer, outputType) =>
                Maybe(
                    pickType(inputType, outputType),
                    innerValue.map(transformer)
                );

            return addWrapperBehaviors('Maybe', maybeValue, innerValue, inputType);
        }
    );

    return {
        Just: signet.enforce(
            'inputType:type, value:* => Just<*>',
            Just),
        Maybe: signet.enforce(
            'inputType:type, value:* => Maybe<*>',
            Maybe),
        Nothing: Nothing
    };

});
