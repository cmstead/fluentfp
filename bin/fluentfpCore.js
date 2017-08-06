'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpCore = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp) {
    // source code here

    const identity = signet.enforce(
        'value:* => *',
        callableDecorator(function identity(value) {
            return value;
        })
    );

    fluentfp.identity = identity;

});
