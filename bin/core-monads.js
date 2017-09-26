(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const coreTyping = require('./core-typing');

        module.exports = moduleFactory(signet, coreTyping);
    } else {
        window.coreMonads = moduleFactory(window.signet, window.coreTyping);
    }

})(function (signet, coreTyping) {
    'use strict';

    function acceptableEitherType(type, value) {
        return signet.isTypeOf('null')(value) || signet.isTypeOf(type)(value);
    }

    const badDefaultMessage = 'Unacceptable either default, must be null or specified type';

    const either = (type, defaultValue) => {
        if (!acceptableEitherType(type, defaultValue)) {
            throw new Error(badDefaultMessage);
        }

        return (testValue) => {
            return signet.isTypeOf(type)(testValue) ? testValue : defaultValue;
        }
    }

    function maybe(type, testValue) {
        return either(type, null)(testValue);
    }

    (coreTyping);
    // function some(value) {
    //     if()
    // }

    return {
        either: signet.enforce(
            'type:fluentType, defaultValue:* => testValue:* => *',
            either),
        maybe: signet.enforce(
            'type:fluentType, testValue:* => *',
            maybe)
    };

});
