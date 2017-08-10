'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp, helpers) {

    const identity = (value) => value;
    const always = (value) => () => value;

    const functionOrIdentity = fluentfp.either(fluentfp.isFunction)(identity);

    function composer(fn1, fn2) {
        return function () {
            const args = helpers.sliceFrom(0, arguments);
            return fn1(fluentfp.apply(fn2, args));
        };
    }

    function composeThrough(fns) {
        return helpers.reduceOn(fns, composer, identity);
    }

    function compose(fn1, fn2) {
        const composite = arguments.length > 2
            ? composeThrough(helpers.sliceFrom(0, arguments))
            : composer(fn1, functionOrIdentity(fn2))

        composite.with = (fn) => compose(composite, fn);
        composite.through = (fns) => compose(composite, composeThrough(fns));

        return callableDecorator(composite);
    }

    compose.function = compose;
    compose.through = signet.enforce(
        'fns:array<function> => * => *',
        (fns) => callableDecorator(composeThrough(fns)));

    function pipelineThroughFactory(pipe) {
        return function (fns) {
            const pipeInto = (pipeResult, fn) => pipeResult.into(fn);
            return helpers.reduceOn(fns, pipeInto, pipe)();
        };
    }

    function pipeFactory(composite) {
        function pipe(nextFn) {
            return fluentfp.isFunction(nextFn)
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

        return callableDecorator(fluentfp.isFunction(fn1)
            ? pipelineThroughFactory(pipe)(helpers.sliceFrom(1, arguments))
            : pipe);
    }

    pipeline.value = pipeline;

    fluentfp.always = callableDecorator(always);
    fluentfp.identity = callableDecorator(identity);
    fluentfp.compose = callableDecorator(compose);
    fluentfp.pipeline = callableDecorator(pipeline);
});
