(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreMonads = require('./core-monads');

        module.exports = moduleFactory(signet, coreMonads);
    } else {
        window.coreFunctions = moduleFactory(signet, window.coreMonads);
    }

})(function (signet, coreMonads) {
    'use strict';

    function identity(value) {
        return value;
    }

    function apply (fn, args) {
        return fn.apply(null, args);
    }

    const slice = (start, end) => (values) => {
        const endIndex = coreMonads.either('int', values.length)(end);
        const result = [];

        for(var i = start; i < endIndex; i++) {
            result.push(values[i]);
        }

        return result;
    };

    function concat (destination, source) {
        let result = slice(0)(destination);

        for (let i = 0; i < source.length; i++) {
            result.push(source[i]);
        }

        return result
    }

    function setLength (fn, length) {
        return Object.defineProperty(fn, 'length', {
            writeable: false,
            configurable: true,
            value: length
        });
    }

    function functionWrapper(fn, args) {
        function curriedFn () {
            const finalArgs = concat(args, slice(0)(arguments));
            return finalArgs.length >= fn.length ? apply(fn, finalArgs) : functionWrapper(fn, finalArgs);
        }

        return setLength(curriedFn, fn.length - args.length);
    }

    function curry (fn) {
        const args = slice(1)(arguments);
        return functionWrapper(fn, args);
    }

    return {
        apply: signet.enforce(
            'fn:function, args:variant<array, arguments> => *',
            apply),
        curry: signet.enforce(
            'fn:function, args...:* => curriedFunction:function',
            curry),
        identity: signet.enforce(
            'x:* => *',
            identity)
    };
});
