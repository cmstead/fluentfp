'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpMonads = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    const either = callableDecorator(signet.enforce(
        'valueType:type => defaultValue:* => value:* => *',

        function either(valueType) {
            const isTypeOk = signet.isTypeOf(valueType);

            function defaultHandler(defaultValue) {
                return callableDecorator(function (value) {
                    return isTypeOk(value) ? value : defaultValue;
                });
            }

            defaultHandler.withDefault = defaultHandler;

            return callableDecorator(defaultHandler);
        }
    ));

    const maybe = callableDecorator(signet.enforce(
        'valueType:type => function',

        function (valueType) {
            return either(valueType)(null);
        }
    ));

    fluentfp.either = either;
    fluentfp.maybe = maybe;
});
