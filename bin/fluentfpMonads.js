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

        function defaultHandler(defaultValue) {
            return callableDecorator(function (value) {
                return isTypeOk(value) ? value : defaultValue;
            });
        }

        defaultHandler.withDefault = defaultHandler;

        return callableDecorator(defaultHandler);
    }

    function maybe(valueType) {
        return either(valueType)(null);
    }

    fluentfp.either = callableDecorator(either);
    fluentfp.maybe = callableDecorator(maybe);
});
