// eslint-disable-next-line no-unused-vars
const coreTransformable = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('../signet-types');
        const coreTypes = require('./core-types');
        const coreMonads = require('./core-monads');

        const moduleOutput = moduleFactory(
            signet,
            coreTypes,
            coreMonads);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(
            signet,
            coreTypes,
            coreMonads);
    }

})(function (signet, coreTypes, coreMonads) {
    'use strict';

    const buildNothingTransform =
        (nothingValue) =>
            () => nothingValue;

    const buildJustTransform =
        (justValue) =>
            (transformer, outputType) =>
                Just(outputType, transformer(justValue.valueOf()));

    const buildMaybeValueTransform =
        (innerValue) =>
            coreMonads.meither(
                'Nothing',
                (nothingValue) => buildNothingTransform(nothingValue),
                (justValue) => buildJustTransform(justValue)
            )(innerValue);

    function buildMaybeTransform(maybeValue) {
        return (transformer, outputType) =>
            Maybe(
                outputType,
                maybeValue.getInnerValue().transform(transformer, outputType));
    }

    function Nothing() {
        const nothingValue = coreTypes.Nothing();
        nothingValue.transform = buildNothingTransform(nothingValue);

        return nothingValue;
    }

    function Just(inputType, value) {
        const justValue = coreTypes.Just(inputType, value);
        justValue.transform = buildJustTransform(justValue);

        return justValue;
    }

    function Maybe(inputType, value) {
        const maybeValue = coreTypes.Maybe(inputType, value);
        const innerValue = maybeValue.getInnerValue();

        innerValue.transform = buildMaybeValueTransform(innerValue);
        maybeValue.transform = buildMaybeTransform(maybeValue);

        return maybeValue;
    }

    function toTransformable(inputType, value, transformFn) {
        const wrappedValue = Just(inputType, value);

        wrappedValue.transform =
            (transformer, outputType) =>
                toTransformable(outputType, transformFn(transformer, value), transformFn);

        return wrappedValue;
    }

    const identityTransform = (transformer, value) => transformer(value);

    return {
        Just: Just,
        Maybe: Maybe,
        Nothing: Nothing,

        toTransformable: signet.enforce(
            'type:type, value:*, mapFn:function => Transformable<*>',
            toTransformable),

        identityTransform: signet.enforce(
            'transformer: function, value: * => *',
            identityTransform)
    };
});
