(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreTypes = require('./core-types');
        const coreTransformable = require('./core-transformable');

        module.exports = moduleFactory(
            signet,
            coreTypes,
            coreTransformable);
    } else {
        window.coreTyping = moduleFactory(
            signet,
            window.coreTypes,
            window.coreTransformable);
    }

})(function (signet, coreTypes, coreTransformable) {
    'use strict';
    (coreTransformable);
    const getValueOf = coreTypes.getValueOf;

    function transformableToMappable(inputType, typeValue) {
        const transform = typeValue.transform;

        typeValue.transform =
            (transformer, outputType) =>
                transformableToMappable(outputType, transform(transformer, outputType));

        if (typeof typeValue.map !== 'function') {
            typeValue.map =
                (transformer) =>
                    typeValue.transform(transformer, inputType);
        } else {
            let map = typeValue.map;
            typeValue.map =
                (transformer) =>
                    transformableToMappable(inputType, map.call(typeValue, transformer))
        }

        return typeValue;
    }

    function Nothing() {
        const nothingValue = coreTransformable.Nothing();
        return transformableToMappable('*', nothingValue);
    }

    function Just(inputType, value) {
        const justValue = coreTransformable.Just(inputType, value);
        return transformableToMappable(inputType, justValue);
    }

    function Maybe(inputType, value) {
        const maybeValue = coreTransformable.Maybe(inputType, getValueOf(value));
        const innerValue = transformableToMappable(inputType, maybeValue.getInnerValue());

        maybeValue.transform =
            (transformer, outputType) =>
                Maybe(outputType, innerValue.transform(transformer, outputType));

        if (typeof maybeValue.map !== 'function') {
            maybeValue.map =
                (transformer) =>
                    maybeValue.transform(transformer, inputType);
        } else {
            const map = maybeValue.map;
            maybeValue.map =
                (transformer) =>
                    Maybe(
                        inputType,
                        map.call(maybeValue, transformer)
                    );
        }

        return maybeValue;
    }

    function toMappable(inputType, value, transformFn) {
        const wrappedValue = coreTransformable.toTransformable(inputType, value, transformFn);

        return transformableToMappable(inputType, wrappedValue);
    }

    return {
        Just: Just,
        Maybe: Maybe,
        Nothing: Nothing,

        getValueOf: getValueOf,
        toMappable: signet.enforce(
            'type:type, value:*, mapFn:function => Mappable<*>',
            toMappable)
    };

});
