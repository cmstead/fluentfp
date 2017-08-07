'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const identity = callableDecorator(signet.enforce(
        'value:* => *',

        function identity(value) {
            return value;
        }
    ));

    const always = callableDecorator(signet.enforce(
        'value:* => *',

        function always(value) {
            return function () {
                return value;
            }
        }
    ));

    const functionOrIdentity = fluentfp.either('function')(identity);

    const compose = signet.enforce(
        'fn1:function, fn2:[function] => * => *',

        function compose(fn1, fn2) {
            const safeFn2 = functionOrIdentity(fn2);

            const composite = callableDecorator(function composite() {
                const args = fluentfp.slice(0)(arguments);

                return fn1(fluentfp.apply(safeFn2, args));
            })

            composite.with = (fn) => compose(composite, fn);

            return composite;
        }
    );

    compose.function = compose;

    const isFunction = signet.isTypeOf('function');

    function pipelineThroughFactory(pipe) {
        return function (fns) {
            return fns
                .reduce((lastPipe, fn) => lastPipe.into(fn), pipe)
                .exec();
        }
    }

    const pipeFactory = signet.enforce(
        'composite:function => array<function> => *',
        function pipeFactory(composite) {
            function pipe(fn) {
                return pipeFactory(compose(fn, composite));
            }

            pipe.into = pipe;
            pipe.exec = composite;
            pipe.through = pipelineThroughFactory(pipe);

            return pipe;
        }
    );

    const pipeline = callableDecorator(signet.enforce(
        'value:*, fn1:[function] => *',

        function pipeline(value, fn1) {
            const fns = fluentfp.slice(1)(arguments);
            const pipe = pipeFactory(always(value));

            return isFunction(fn1)
                ? pipelineThroughFactory(pipe)(fns)
                : pipe;
        }
    ));

    pipeline.value = pipeline;

    fluentfp.always = always;
    fluentfp.identity = identity;
    fluentfp.compose = compose;
    fluentfp.pipeline = pipeline;

});
