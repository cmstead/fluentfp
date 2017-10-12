'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');
        const coreFunctions = require('./core-functions');
        const coreTransformable = require('./core-transformable');

        module.exports = moduleFactory(
            signet,
            coreMonads,
            coreFunctions,
            coreTransformable
        );
    } else {
        window.fluentAppendable.js = moduleFactory(
            signet,
            window.coreMonads,
            window.coreFunctions,
            window.coreTransformable
        );
    }

})(function (
    signet,
    coreMonads,
    coreFunctions,
    coreTransformable
) {

    const compose = coreFunctions.compose;
    const meither = coreMonads.meither;
    const getValueOf = coreTransformable.getValueOf;

    function transformableToAppendable(inputType, typeValue, appender) {
        const transform = typeValue.transform;

        typeValue.transform =
            (transformer, outputType) =>
                transformableToAppendable(outputType, transform(transformer, outputType), appender);

        typeValue.append =
            (value) =>
                typeValue.transform((currentValue) => appender(currentValue, value), inputType);

        return typeValue;
    }


    function Nothing() {
        const nothingValue = coreTransformable.Nothing();
        return transformableToAppendable('*', nothingValue, () => nothingValue);
    }

    function Just(inputType, value, appender) {
        const justValue = coreTransformable.Just(inputType, value);
        return transformableToAppendable(inputType, justValue, appender);
    }

    function Maybe(inputType, value, appender) {
        const maybeValue = coreTransformable.Maybe(inputType, getValueOf(value));
        const innerValue = transformableToAppendable(inputType, maybeValue.getInnerValue(), appender);

        maybeValue.transform =
            (transformer, outputType) =>
                Maybe(outputType, innerValue.transform(transformer, outputType), appender);

        maybeValue.append =
            (value) =>
                maybeValue.transform((currentValue) => appender(currentValue, value), inputType);

        return maybeValue;
    }

    function toAppendable(inputType, value, appender) {
        return Maybe(inputType, value, appender);
    }



    function addNamedAppendableProps(propName, appendable) {
        const append = appendable.append;

        appendable.append = (value) => addNamedAppendableProps(propName, append(value));
        appendable[propName] = appendable.append;

        return appendable;
    }

    const compositional =
        (fn) =>
            addNamedAppendableProps(
                'compose',
                toAppendable('function', fn, compose));

    const multiplicative =
        (value) =>
            addNamedAppendableProps(
                'times',
                toAppendable('number', value, (a, b) => a * b));

    const additive =
        (value) =>
            addNamedAppendableProps(
                'plus',
                toAppendable('number', value, (a, b) => a + b));

    const stringConcat = (a, b) => String.prototype.concat.call(a, b);
    const arrayConcat = (a, b) => Array.prototype.concat.call(a, b);

    const concatable =
        (value) =>
            addNamedAppendableProps(
                'concat',
                toAppendable(
                    meither('string', () => 'string', () => 'array')(value),
                    value,
                    meither('string', () => stringConcat, () => arrayConcat)(value)));

    return {
        Just: Just,
        Maybe: Maybe,
        Nothing: Nothing,

        toAppendable: signet.enforce(
            'type:type, value: *, appender:function<* => *> => Appendable<*>',
            toAppendable),

        compositional: signet.enforce(
            'value: function => Appendable<function>',
            compositional),

        multiplicative: signet.enforce(
            'value: number => Appendable<number>',
            multiplicative),

        additive: signet.enforce(
            'value: number => Appendable<number>',
            additive),

        concatable: signet.enforce(
            'value: variant<string, array> => Appendable<variant<string, array>>',
            concatable)

    }
});
