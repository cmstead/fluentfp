'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');
        const coreFunctions = require('./core-functions');
        const corePredicates = require('./core-predicates');

        module.exports = moduleFactory(
            signet,
            coreMonads,
            coreFunctions,
            corePredicates
        );
    } else {
        window.fluentAppendable.js = moduleFactory(
            signet,
            window.coreMonads,
            window.coreFunctions,
            windows.corePredicates
        );
    }

})(function (
    signet,
    coreMonads,
    coreFunctions,
    corePredicates
) {

    const compose = coreFunctions.compose;
    const isFunction = corePredicates.isFunction;
    const meither = coreMonads.meither;

    function Nothing() {
        const nothingValue = Object(undefined);
        nothingValue.append = () => nothingValue;
        nothingValue.map = () => nothingValue;
        nothingValue.toString = () => 'Nothing<*>';
        nothingValue.valueOf = () => undefined;
    }

    function buildAppendable(type, appender, value) {
        const appendable = Object(value);

        function appendValue(newValue) {
            const appendedValue = meither(
                type,
                () => appender(value, newValue),
                Nothing
            )(newValue);

            return wrapInAppendable(type, appender, appendedValue);
        }

        appendable.append = appendValue;
        appendable.toString = 'Appendable<' + type + '>';
        appendable.valueOf = () => value;

        return appendable;
    }

    function wrapInAppendable(type, appender, value) {
        return meither(
            type,
            () => buildAppendable(type, appender, value),
            Nothing
        )(value)
    }

    function updateAppendableFunction(appendable) {
        const append = appendable.append;

        appendable.append = (fn) => updateAppendableFunction(append(fn));
        appendable.compose = appendable.append;

        return appendable;
    }

    const makeFunctionAppendable = 
        (fn) => updateAppendableFunction(wrapInAppendable('function', compose, fn));

    return {
        wrapInAppendable: signet.enforce(
            'type:type, appender:function<* => *>, value: * => variant<Appendable<*>, Nothing<*>>',
            wrapInAppendable),

        makeFunctionAppendable: signet.enforce(
            'value: function => Appendable<function>',
            makeFunctionAppendable)
    }
});
