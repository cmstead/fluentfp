'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const identity = signet.enforce(
        'value:* => *',

        callableDecorator(function identity(value) {
            return value;
        })
    );

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

    fluentfp.identity = identity;
    fluentfp.compose = compose;

});
