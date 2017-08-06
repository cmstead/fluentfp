'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpTypes = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const either = signet.enforce(
        'valueType:type => defaultValue:* => value:* => *',

        callableDecorator(function either(valueType) {
            const isTypeOk = signet.isTypeOf(valueType);

            function defaultHandler(defaultValue) {
                const valueHandler = (value) => isTypeOk(value) ? value : defaultValue;

                return callableDecorator(valueHandler);
            }

            defaultHandler.withDefault = defaultHandler;

            return callableDecorator(defaultHandler);
        })
    );

    const maybe = signet.enforce(
        'valueType:type => function',

        callableDecorator(function maybe(valueType) {
            return either(valueType)(null);
        })
    );

    fluentfp.either = either;
    fluentfp.maybe = maybe;
});
