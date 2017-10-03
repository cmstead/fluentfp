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

    const addMappableBehaviors = (outerType, mappableValue, mapFn, innerValue, innerType) => {
        mappableValue.map = mapFn;
        mappableValue.valueOf = () => getValueOf(innerValue);
        mappableValue.getInnerValue = () => innerValue;
        mappableValue.toString = () => outerType + '<' + innerType + '>';

        return mappableValue;
    }

    function Nothing() {
        const nothingValue = Object(undefined);
        const nothingMap = () => nothingValue;

        return addMappableBehaviors('Nothing', nothingValue, nothingMap, undefined, '*');
    }


    function Just(inputType, value) {

        const justValue = Object(value);

        function justMap(transformer, outputType) {
            const nextType = pickType(inputType, outputType);
            return Just(nextType, transformer(value));
        }

        return addMappableBehaviors('Just', justValue, justMap, value, inputType);
    }

    function Maybe(inputType, value) {
        const innerValue = meither(inputType, (value) => Just(inputType, value), Nothing)(getValueOf(value));
        const maybeValue = Object(getValueOf(value));

        function maybeMap(transformer, outputType) {
            const nextType = pickType(inputType, outputType);
            const nextValue = innerValue.map(transformer, nextType);

            return Maybe(nextType, nextValue);
        }

        return addMappableBehaviors('Maybe', maybeValue, maybeMap, innerValue, inputType);
    }

    function toMappable(value, mapFn) {
        const wrappedValue = Object(value);
        const mapper = (transformer) => toMappable(mapFn(value, transformer), mapFn);

        return addMappableBehaviors('Mappable', wrappedValue, mapper, value, '*');
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
            Nothing),
        toMappable: signet.enforce(
            'value:*, mapFn:function => Mappable<*>',
            toMappable)
    };

});
