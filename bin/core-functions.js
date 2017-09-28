(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const corePredicates = require('./core-predicates');

        module.exports = moduleFactory(signet, corePredicates);
    } else {
        window.coreFunctions = moduleFactory(window.signet, window.corePredicates);
    }

})(function (signet, corePredicates) {
    'use strict';

    const isArray = corePredicates.isArray;
    const isFunction = corePredicates.isFunction;
    const isInt = corePredicates.isInt;

    function identity(value) {
        return value;
    }
    
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
        curry: signet.enforce(
            'fn:function, args...:* => curriedFunction:function',
            curry),
        identity: signet.enforce(
            'x:* => *',
            identity),
        slice: signet.enforce(
            'values: variant<array, arguments> => array',
            slice)
    };
});
