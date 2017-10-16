// eslint-disable-next-line no-unused-vars
const coreFunctions = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('../signet-types');
        const corePredicates = require('./core-predicates');

        const moduleOutput = moduleFactory(signet, corePredicates);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(signet, corePredicates);
    }

})(function (signet, corePredicates) {
    'use strict';

    const isArray = corePredicates.isArray;
    const isFunction = corePredicates.isFunction;
    const isInt = corePredicates.isInt;
    const isReferencible = corePredicates.isReferencible;

    function identity(value) {
        return value;
    }

    function noOp() { }

    const slice = (start, end) => (values) => {
        const endIndex = isInt(end) ? end : values.length;
        const valueLength = values.length;
        let result = [];

        for (var i = start; i < endIndex && i < valueLength; i++) {
            result.push(values[i]);
        }

        return result;
    };

    function apply(fn, args) {
        const resultArgs = isArray(args) ? args : slice(0)(args);
        return fn.apply(null, resultArgs);
    }

    function call(fn) {
        apply(fn, slice(1)(arguments));
    }


    function applyThrough(fn, args) {
        let result = fn;
        let remainingArgs = args;

        while (remainingArgs.length > 0 && isFunction(result)) {
            let nextArgs = slice(0, result.length)(remainingArgs);
            remainingArgs = slice(result.length)(remainingArgs);
            result = apply(result, nextArgs);
        }

        return result;
    }

    function callThrough(fn) {
        return applyThrough(fn, slice(1)(arguments));
    }


    function concat(destination, source) {
        let result = slice(0)(destination);

        for (let i = 0; i < source.length; i++) {
            result.push(source[i]);
        }

        return result
    }

    function setLength(fn, length) {
        return Object.defineProperty(fn, 'length', {
            writeable: false,
            configurable: true,
            value: length
        });
    }

    function curryWrapper(fn, args) {
        function curriedFn() {
            const nextArgs = concat(args, slice(0)(arguments));
            return nextArgs.length >= fn.length ? apply(fn, nextArgs) : curryWrapper(fn, nextArgs);
        }

        return setLength(curriedFn, fn.length - args.length);
    }

    function curry(fn) {
        const args = slice(1)(arguments);
        return curryWrapper(fn, args);
    }

    function compose(fx, gx) {
        return function () {
            return fx(apply(gx, arguments));
        };
    }

    function recur(builder) {
        const buildFApply = (f) => (...args) => apply(f(f), args)
        const buildApplicator = (f) => builder(buildFApply(f));
        const applyBuilder = f => f(f);

        return applyBuilder(buildApplicator);
    }

    function valueOf(value) {
        return isReferencible(value) ? value.valueOf() : value;
    }


    return {
        apply: signet.enforce(
            'fn:function, args:variant<array, arguments> => *',
            apply),
        applyThrough: signet.enforce(
            'fn:function, args:variant<array, arguments> => *',
            applyThrough),
        call: signet.enforce(
            'fn:function, args...:* => *',
            call),
        callThrough: signet.enforce(
            'fn:function, args...:* => *',
            callThrough),
        compose: signet.enforce(
            'fx:function, gx:function => fogx:function',
            compose),
        curry: signet.enforce(
            'fn:function, args...:* => curriedFunction:function',
            curry),
        identity: signet.enforce(
            'x:* => *',
            identity),
        noOp: signet.enforce(
            '* => undefined',
            noOp),
        recur: signet.enforce(
            'recursible:function => function',
            recur),
        slice: signet.enforce(
            'values: variant<array, arguments> => array',
            slice),
        valueOf: signet.enforce(
            '* => *',
            valueOf)
    };
});
