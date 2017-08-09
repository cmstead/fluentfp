(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    const fluentfpModules = {
        fluentfpMonads: './bin/fluentfpMonads',
        fluentfpCore: './bin/fluentfpCore'
    };


    function callableFactory(apply, partial, slice) {
        return function (fn) {
            fn.applyWith = function (values) { return apply(fn, values); };
            fn.applyThrough = function (values) { return apply(fn).through(values); };
            fn.bindValues = function () { return apply(partial, [fn].concat(slice(0)(arguments))); };
            fn.callWith = function () { return apply(fn, slice(0)(arguments)); };
            fn.callThrough = function () { return apply(fn).through(slice(0)(arguments)); };

            return fn;
        }
    }

    function buildFluentfp(signet, submodules, fluentfpEnforcer) {
        const fluentfp = moduleFactory(signet, callableFactory);
        const callableDecorator = callableFactory(fluentfp.apply, fluentfp.partial, fluentfp.slice);

        submodules.forEach((submoduleFactory) => submoduleFactory(signet, callableDecorator, fluentfp));

        return fluentfpEnforcer(signet, fluentfp);
    }

    function buildNodeSubmoduleArray() {
        return Object.keys(fluentfpModules).reduce(function (modules, key) {
            const modulePath = fluentfpModules[key];
            modules.push(require(modulePath));
            return modules
        }, []);
    }

    function buildClientSubmoduleArray() {
        return Object.keys(fluentfpModules).reduce(function (modules, key) {
            modules.push(window[key]);
            return modules
        }, []);
    }

    if (isNode) {
        const signet = require('signet')();
        const submodules = buildNodeSubmoduleArray();
        const fluentfpEnforcer = require('./bin/fluentfpEnforcer');

        module.exports = buildFluentfp(signet, submodules, fluentfpEnforcer);
    } else if (typeof signet === 'object') {
        const submodules = buildClientSubmoduleArray();

        window.fluentfp = buildFluentfp(signet, submodules, fluentfpEnforcer);
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet, callableFactory) {
    'use strict';

    const isArray = signet.isTypeOf('array');
    const isFunction = signet.isTypeOf('function');
    const isInt = signet.isTypeOf('int');


    function slice(start, end) {
        function sliceValues (values) {
            const endIndex = isInt(end) ? end : values.length;
            let result = [];

            for (let i = start; i < endIndex; i++) {
                result.push(values[i]);
            }

            return result;
        }

        sliceValues.callWith = sliceValues;

        return sliceValues;
    }

    function sliceFrom(start) {
        function sliceTo(end) {
            return slice(start, end);
        }

        sliceTo.to = sliceTo;
        sliceTo.array = (values) => slice(start)(values);

        return sliceTo;
    }

    slice.from = sliceFrom;

    function partitionAtIndex(length, values) {
        return [
            slice(0, length)(values),
            slice(length)(values)
        ];
    }

    function applyOrReturn(result, rest) {
        return isFunction(result) && rest.length > 0
            ? applyThrough(result)(rest)
            : result;
    }

    const applyThrough = (fn, context) => (values) => {
        const partitionedValues = partitionAtIndex(fn.length, values);
        const args = partitionedValues[0];
        const rest = partitionedValues[1];

        return applyOrReturn(fn.apply(context, args), rest);
    }

    function boxApplier(fn, context) {
        function newFn() {
            return fn.apply(context, slice(0)(arguments));
        }

        newFn.on = (context) => boxApplier(fn, context);
        newFn.with = (values) => fn.apply(context, values);
        newFn.through = applyThrough(fn);

        return newFn;
    }

    function apply(fn, values) {
        return isArray(values)
            ? fn.apply(null, values)
            : boxApplier(fn);
    }

    function boxCaller(fn, context) {
        function newFn() {
            return fn.apply(context, slice(0)(arguments));
        }

        function through() {
            const args = slice(0)(arguments);
            return applyThrough(fn, context)(args);
        }

        newFn.on = (context) => boxCaller(fn, context);
        newFn.with = newFn;
        newFn.through = through;

        return newFn;
    }

    function call(fn) {
        const slicedArgs = slice(1)(arguments);

        return slicedArgs.length === 0
            ? boxCaller(fn)
            : fn.apply(null, slicedArgs);
    }

    function setArity(fn, arity) {
        return Object.defineProperty(fn, 'length', {
            writeable: false,
            value: arity
        });
    }

    function partial(fn) {
        const initialArgs = slice(1)(arguments);
        const arityDelta = fn.length - initialArgs.length;
        const newArity = arityDelta > 0 ? arityDelta : 0;

        function partialFn() {
            const args = initialArgs.concat(slice(0)(arguments));
            return apply(fn, args);
        }

        function bindValues() {
            const args = [fn].concat(initialArgs).concat(slice(0)(arguments));
            return apply(partial, args);
        }

        partialFn.bindValues = bindValues;
        partialFn.exec = () => partialFn();

        return setArity(partialFn, newArity);
    }

    partial.function = partial;

    const callableDecorator = callableFactory(apply, partial, slice);

    return {
        apply: callableDecorator(apply),
        call: callableDecorator(call),
        partial: callableDecorator(partial),
        slice: callableDecorator(slice)
    };
});
