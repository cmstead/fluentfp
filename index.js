(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    const fluentfpModules = {
        fluentfpMonads: './bin/fluentfpMonads',
        fluentfpCore: './bin/fluentfpCore'
    };


    function callableFactory(call, apply) {
        return function (fn) {
            const callable = call(fn);
            const applyable = apply(fn);

            fn.callWith = callable.with;
            fn.callThrough = callable.through;
            fn.applyWith = applyable.with;
            fn.applyThrough = applyable.through;

            return fn;
        }
    }

    function buildFluentfp(signet, submodules) {
        const fluentfp = moduleFactory(signet, callableFactory);
        const callableDecorator = callableFactory(fluentfp.call, fluentfp.apply);

        submodules.forEach((submoduleFactory) => submoduleFactory(signet, callableDecorator, fluentfp));

        return fluentfp;
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

        module.exports = buildFluentfp(signet, submodules);
    } else if (typeof signet === 'object') {
        const submodules = buildClientSubmoduleArray();

        window.fluentfp = buildFluentfp(signet, submodules);
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet, callableFactory) {
    'use strict';

    const isArray = signet.isTypeOf('array');
    const isFunction = signet.isTypeOf('function');
    const isInt = signet.isTypeOf('int');


    function slice(start, end) {
        function sliceValues(values) {
            const endIndex = isInt(end) ? end : values.length;
            let result = [];

            for (let i = start; i < endIndex; i++) {
                result.push(values[i]);
            }

            return result;
        }

        function applySlice(valuesArray) {
            return sliceValues(valuesArray[0]);
        }

        sliceValues.callWith = sliceValues;
        sliceValues.callThrough = sliceValues;
        sliceValues.applyWith = applySlice;
        sliceValues.applyThrough = applySlice;
        sliceValues.array = sliceValues;

        return sliceValues;
    }

    const sliceFrom = signet.enforce(
        'start:int => end:[int] => array',

        function sliceFrom(start) {
            function sliceTo(end) {
                return slice(start, end);
            }

            sliceTo.to = sliceTo;
            sliceTo.array = (values) => slice(start)(values);

            return sliceTo;
        }
    );

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
            return fn.apply(context, slice(0)(arguments));
        }

        function through() {
            const args = slice(0)(arguments);
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
            const slicedArgs = slice(1)(arguments);

            return slicedArgs.length === 0
                ? boxCaller(fn)
                : fn.apply(null, slicedArgs);
        }
    );

    const callableDecorator = callableFactory(call, apply);

    return {
        apply: apply,
        call: call,
        slice: signet.enforce(
            'start:int, end:[int] ' +
            '=> values:object ' +
            '=> array',
            callableDecorator(slice)
        )
    };
});
