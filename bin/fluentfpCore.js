'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const identity = (value) => value;
    const always = (value) => () => value;

    const functionOrIdentity = fluentfp.either('function')(identity);

    function composer(fn1, fn2) {
        return function () {
            const args = fluentfp.slice(0)(arguments);
            return fn1(fluentfp.apply(fn2, args));
        };
    }

    function composeThrough(fns) {
        return callableDecorator(fns.reduce(composer, identity));
    }

    function compose(fn1, fn2) {
        const composite = arguments.length > 2
            ? composeThrough(fluentfp.slice(0)(arguments))
            : callableDecorator(composer(fn1, functionOrIdentity(fn2)))

        composite.with = (fn) => compose(composite, fn);
        composite.through = (fns) => compose(composite, composeThrough(fns));

        return callableDecorator(composite);
    }

    compose.function = compose;
    compose.through = signet.enforce('fns:array<function> => * => *', composeThrough);

    const isFunction = signet.isTypeOf('function');

    function pipelineThroughFactory(pipe) {
        return callableDecorator(function (fns) {
            const composePipe = (lastPipe, fn) => lastPipe.into(fn)
            return fns.reduce(composePipe, pipe)();
        })
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

        return callableDecorator(pipe);
    }

    function pipeline(value, fn1) {
        const pipe = pipeFactory(always(value));

        return isFunction(fn1)
            ? pipelineThroughFactory(pipe)(fluentfp.slice(1)(arguments))
            : pipe;
    }

    pipeline.value = pipeline;

    fluentfp.always = callableDecorator(always);
    fluentfp.identity = callableDecorator(identity);
    fluentfp.compose = callableDecorator(compose);
    fluentfp.pipeline = callableDecorator(pipeline);
});
