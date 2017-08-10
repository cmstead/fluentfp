(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    const fluentfpModules = {
        fluentfpMonads: './bin/fluentfpMonads',
        fluentfpCore: './bin/fluentfpCore',
        fluentfpArray: './bin/fluentfpArray'
    };


    function callableFactory(apply, partial, sliceFrom) {
        return function (fn) {
            fn.applyWith = function (values) { return apply(fn, values); };
            fn.applyThrough = function (values) { return apply(fn).through(values); };
            fn.bindValues = function () { return apply(partial, [fn].concat(sliceFrom(0, arguments))); };
            fn.callWith = function () { return apply(fn, sliceFrom(0, arguments)); };
            fn.callThrough = function () { return apply(fn).through(sliceFrom(0, arguments)); };

            return fn;
        }
    }

    function buildFluentfp(
        signet,
        submodules,
        fluentfpEnforcer,
        fluentfpTypes,
        fluentfpHelpers) {

        const fluentfp = moduleFactory(signet, callableFactory, fluentfpTypes, fluentfpHelpers);
        const callableDecorator = callableFactory(fluentfp.apply, fluentfp.partial, fluentfpHelpers.sliceFrom);

        submodules.forEach((submoduleFactory) =>
            submoduleFactory(signet, callableDecorator, fluentfp, fluentfpHelpers));

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
        const fluentfpTypes = require('./bin/helpers/fluentfpTypes')(signet);
        const fluentfpHelpers = require('./bin/helpers/fluentfpHelpers')(signet);
        const fluentfpEnforcer = require('./bin/helpers/fluentfpEnforcer');

        module.exports = buildFluentfp(
            signet,
            submodules,
            fluentfpEnforcer,
            fluentfpTypes,
            fluentfpHelpers);
    } else if (typeof signet === 'object') {
        const submodules = buildClientSubmoduleArray();

        window.fluentfp = buildFluentfp(
            signet,
            submodules,
            fluentfpEnforcer,
            fluentfpTypes(signet),
            fluentfpHelpers(signet));
    } else {
        throw new Error('The module fluentfp requires Signet to run.');
    }

})(function (signet, callableFactory, fluentfp, helpers) {
    'use strict';

    function partitionAtIndex(length, values) {
        return [
            helpers.slice(0, length, values),
            helpers.sliceFrom(length, values)
        ];
    }

    function applyOrReturn(result, rest) {
        return fluentfp.isFunction(result) && rest.length > 0
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
            return fn.apply(context, helpers.sliceFrom(0, arguments));
        }

        newFn.on = (context) => boxApplier(fn, context);
        newFn.with = (values) => fn.apply(context, values);
        newFn.through = applyThrough(fn);

        return newFn;
    }

    function apply(fn, values) {
        return fluentfp.isArray(values)
            ? fn.apply(null, values)
            : boxApplier(fn);
    }

    function boxCaller(fn, context) {
        function newFn() {
            return fn.apply(context, helpers.sliceFrom(0, arguments));
        }

        function through() {
            const args = helpers.sliceFrom(0, arguments);
            return applyThrough(fn, context)(args);
        }

        newFn.on = (context) => boxCaller(fn, context);
        newFn.with = newFn;
        newFn.through = through;

        return newFn;
    }

    function call(fn) {
        const slicedArgs = helpers.sliceFrom(1, arguments);

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
        const initialArgs = helpers.sliceFrom(1, arguments);
        const arityDelta = fn.length - initialArgs.length;
        const newArity = arityDelta > 0 ? arityDelta : 0;

        function partialFn() {
            const args = initialArgs.concat(helpers.sliceFrom(0, arguments));
            return apply(fn, args);
        }

        function bindValues() {
            const args = [fn].concat(initialArgs).concat(helpers.sliceFrom(0, arguments));
            return apply(partial, args);
        }

        partialFn.bindValues = bindValues;
        partialFn.exec = () => partialFn();

        return setArity(partialFn, newArity);
    }

    partial.function = partial;

    console.log(typeof helpers.sliceFrom);
    const callableDecorator = callableFactory(apply, partial, helpers.sliceFrom);

    fluentfp.apply = callableDecorator(apply);
    fluentfp.call = callableDecorator(call);
    fluentfp.partial = callableDecorator(partial);

    return fluentfp;
});
