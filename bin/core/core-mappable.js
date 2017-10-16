// eslint-disable-next-line no-unused-vars
const coreMappable = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('../signet-types');
        const coreTypes = require('./core-types');
        const coreTransformable = require('./core-transformable');
        const coreFunctions = require('./core-functions');

        const moduleOutput = moduleFactory(
            signet,
            coreTypes,
            coreTransformable,
            coreFunctions);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(
            signet,
            coreTypes,
            coreTransformable,
            coreFunctions);
    }

})(function (signet, coreTypes, coreTransformable, coreFunctions) {
    'use strict';
    (coreTransformable);
    const valueOf = coreFunctions.valueOf;

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
        const maybeValue = coreTransformable.Maybe(inputType, valueOf(value));
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

        toMappable: signet.enforce(
            'type:type, value:*, mapFn:function => Mappable<*>',
            toMappable)
    };

});
