'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpMonads = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {

    function either(valueType) {
        const isTypeOk = signet.isTypeOf(valueType);

        const defaultHandler = callableDecorator(
            function defaultHandler(defaultValue) {
                function callWithValue (value) {
                    return isTypeOk(value) ? value : defaultValue;
                }

                callWithValue.callWith = callWithValue;

                return callWithValue;
            });

        defaultHandler.withDefault = defaultHandler;

        return defaultHandler;
    }

    function maybe(valueType) {
        return either(valueType)(null);
    }

    fluentfp.either = callableDecorator(either);
    fluentfp.maybe = callableDecorator(maybe);
});
