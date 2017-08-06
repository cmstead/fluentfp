(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    const fluentfpModules = {
        fluentfpTypes: './bin/fluentfpTypes',
        fluentfpCore: './bin/fluentfpCore'
    };


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

    function buildFluentfp (signet, submodules) {
        const fluentfp = moduleFactory(signet);
        const callableDecorator = callableFactory(fluentfp);

        submodules.forEach((submoduleFactory) => submoduleFactory(signet, callableDecorator, fluentfp));

        return fluentfp;
    }

    function buildNodeSubmoduleArray () {
        return Object.keys(fluentfpModules).reduce(function (modules, key) {
            const modulePath = fluentfpModules[key];
            modules.push(require(modulePath));
            return modules
        }, []);
    }

    function buildClientSubmoduleArray () {
        return Object.keys(fluentfpModules).reduce(function (modules, key) {
            modules.push(window[key]);
            return modules
        }, []);
    }

    if (isNode) {
        const signet = require('signet')();
        const submodules = buildNodeSubmoduleArray();

        module.exports = buildFluentfp(signet, submodules);
    } else if (typeof signet === 'object') {
        const submodules = buildClientSubmoduleArray();

        window.fluentfp = buildFluentfp(signet, submodules);
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet) {
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
            return isArray(values)
                ? fn.apply(null, values)
                : boxApplier(fn);
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

            return slicedArgs.length === 0
                ? boxCaller(fn)
                : fn.apply(null, slicedArgs);
        }
    );

    return {
        apply: apply,
        call: call,
    };
});
