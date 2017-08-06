(function (moduleFactory) {
    let isNode = typeof module !== undefined && typeof module.exports !== undefined

    function callableFactory(fluentfp) {
        return function (fn) {
            const callable = fluentfp.call(fn);
            const applyable = fluentfp.apply(fn);

            fn.callWith = callable.with;
            fn.callThrough = callable.through;
            fn.applyWith = applyable.with;
            fn.applyThrough = applyable.through;

            return fn;
        }
    }

    if (isNode) {
        const signet = require('./signet-types');
        const matchlight = require('matchlight')(signet);
        const fluentfp = moduleFactory(signet, matchlight.match);
        const callableDecorator = callableFactory(fluentfp);

        require('./bin/fluentfpTypes')(signet, matchlight.match, callableDecorator, fluentfp);

        module.exports = fluentfp;
    } else if (typeof signet === 'object') {
        const fluentfp = moduleFactory(signet, matchlight.match);
        const callableDecorator = callableFactory(fluentfp);

        fluentfpTypes(signet, matchlight.match, callableDecorator, fluentfp);

        window.fluentfp = fluentfp;
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet, match) {
    'use strict';

    const isArray = signet.isTypeOf('array');
    const isFunction = signet.isTypeOf('function');

    const sliceFrom = (start) => (args) => Array.prototype.slice.call(args, start);
    const sliceAllArgs = sliceFrom(0);

    function partitionAtIndex(length, values) {
        return [
            values.slice(0, length),
            values.slice(length)
        ];
    }

    function applyOrReturn(result, rest) {
        return isFunction(result) && rest.length > 0
            ? applyThrough(result)(rest)
            : result;
    }

    const applyThrough = (fn, context) => (values) => {
        const [args, rest] = partitionAtIndex(fn.length, values);

        return applyOrReturn(fn.apply(context, args), rest);
    }

    function boxApplier(fn, context) {
        function newFn() {
            return fn.apply(context, sliceAllArgs(arguments));
        }

        newFn.with = (values) => fn.apply(context, values);
        newFn.through = applyThrough(fn);
        newFn.on = (context) => boxApplier(fn, context);

        return newFn;
    }

    const apply = signet.enforce(
        'fn:function, values:[array] => *',
        function apply(fn, values) {
            return match(values, (matchCase, matchDefault) => {
                matchCase(isArray, (values) => fn.apply(null, values));
                matchDefault(() => boxApplier(fn));
            });
        }
    );

    function boxCaller(fn, context) {
        function newFn() {
            return fn.apply(context, sliceAllArgs(arguments));
        }

        function through() {
            const args = sliceAllArgs(arguments);
            return applyThrough(fn, context)(args);
        }

        newFn.with = newFn;
        newFn.through = through;
        newFn.on = (context) => boxCaller(fn, context);

        return newFn;
    }

    const call = signet.enforce(
        'fn:function => *',
        function call(fn) {
            const slicedArgs = sliceFrom(1)(arguments);

            return match(slicedArgs, (matchCase, matchDefault) => {
                matchCase((args) => args.length === 0, () => boxCaller(fn));
                matchDefault((args) => fn.apply(null, args));
            });
        }
    );

    const identity = signet.enforce(
        'value:* => *',
        function identity(value) {
            return value;
        }
    );

    return {
        apply: apply,
        call: call,
        identity: identity,
    };
});
