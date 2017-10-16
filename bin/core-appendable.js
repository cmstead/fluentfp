// eslint-disable-next-line no-unused-vars
const fluentAppendable = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;
    
    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');
        const coreFunctions = require('./core-functions');
        const coreMappable = require('./core-mappable');
        
        const moduleOutput = moduleFactory(
            signet,
            coreMonads,
            coreFunctions,
            coreMappable
        );
        
        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(
            signet,
            coreMonads,
            coreFunctions,
            coreMappable
        );
    }
    
})(function (
    signet,
    coreMonads,
    coreFunctions,
    coreMappable
) {
    'use strict';
    
    const compose = coreFunctions.compose;
    const meither = coreMonads.meither;
    const valueOf = coreFunctions.valueOf;

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


    function Maybe(inputType, value, appender) {
        const maybeValue = coreMappable.Maybe(inputType, valueOf(value));
        const innerValue = transformableToAppendable(inputType, maybeValue.getInnerValue(), appender);

        maybeValue.transform =
            (transformer, outputType) =>
                Maybe(outputType, innerValue.transform(transformer, outputType), appender);

        maybeValue.append =
            (newValue) =>
                Maybe(inputType, appender(value, newValue), appender);

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

    const toCompositional =
        (fn) =>
            addNamedAppendableProps(
                'compose',
                toAppendable('function', fn, compose));

    const toMultiplicative =
        (value) =>
            addNamedAppendableProps(
                'times',
                toAppendable('number', value, (a, b) => a * b));

    const toAdditive =
        (value) =>
            addNamedAppendableProps(
                'plus',
                toAppendable('number', value, (a, b) => a + b));

    const stringConcat = (a, b) => String.prototype.concat.call(a, b);
    const arrayConcat = (a, b) => Array.prototype.concat.call(a, b);

    const toConcatable =
        (value) =>
            addNamedAppendableProps(
                'concat',
                toAppendable(
                    meither('string', () => 'string', () => 'array')(value),
                    value,
                    meither('string', () => stringConcat, () => arrayConcat)(value)));

    return {
        toAppendable: signet.enforce(
            'type:type, value: *, appender:function<* => *> => Appendable<*>',
            toAppendable),

        toCompositional: signet.enforce(
            'value: function => Appendable<function>',
            toCompositional),

        toMultiplicative: signet.enforce(
            'value: number => Appendable<number>',
            toMultiplicative),

        toAdditive: signet.enforce(
            'value: number => Appendable<number>',
            toAdditive),

        toConcatable: signet.enforce(
            'value: variant<string, array> => Appendable<variant<string, array>>',
            toConcatable)

    }
});
