'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const isUndefined = signet.isTypeOf('undefined');
    const identity = (value) => value;
    const always = (value) => () => value;

    const functionOrIdentity = fluentfp.either('function')(identity);

    function composer(fn1, fn2) {
        return function () {
            const args = fluentfp.slice(0)(arguments);
            return fn1(fluentfp.apply(fn2, args));
        };
    }

    function reduceOn(values, action, initial) {
        const initialUndefined = isUndefined(initial);

        let result = initialUndefined ? action[0] : initial;
        let remainingValues = initialUndefined ? values.slice(1) : values

        for (let i = 0; i < remainingValues.length; i++) {
            result = action(result, remainingValues[i], i);
        }

        return result;
    }

    function foldl(action, initialValue) {
        return callableDecorator(function (values) {
            return reduceOn(values, action, initialValue);
        });
    }

    function composeThrough(fns) {
        return reduceOn(fns, composer, identity);
    }

    function compose(fn1, fn2) {
        const composite = arguments.length > 2
            ? composeThrough(fluentfp.slice(0)(arguments))
            : composer(fn1, functionOrIdentity(fn2))

        composite.with = (fn) => compose(composite, fn);
        composite.through = (fns) => compose(composite, composeThrough(fns));

        return callableDecorator(composite);
    }

    compose.function = compose;
    compose.through = signet.enforce(
        'fns:array<function> => * => *',
        (fns) => callableDecorator(composeThrough(fns)));

    const isFunction = signet.isTypeOf('function');

    function pipelineThroughFactory(pipe) {
        return function (fns) {
            const pipeInto = (pipeResult, fn) => pipeResult.into(fn);
            return reduceOn(fns, pipeInto, pipe)();
        };
    }

    function pipeFactory(composite) {
        function pipe(nextFn) {
            return isFunction(nextFn)
                ? pipeFactory(compose(nextFn, composite))
                : composite();
        }

        pipe.into = pipe;
        pipe.exec = composite;
        pipe.through = pipelineThroughFactory(pipe);

        return pipe;
    }

    function pipeline(value, fn1) {
        const pipe = pipeFactory(always(value));

        return callableDecorator(isFunction(fn1)
            ? pipelineThroughFactory(pipe)(fluentfp.slice(1)(arguments))
            : pipe);
    }

    pipeline.value = pipeline;

    fluentfp.always = callableDecorator(always);
    fluentfp.foldl = callableDecorator(foldl);
    fluentfp.identity = callableDecorator(identity);
    fluentfp.compose = callableDecorator(compose);
    fluentfp.pipeline = callableDecorator(pipeline);
});
