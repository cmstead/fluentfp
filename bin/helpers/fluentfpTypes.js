'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if(isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpTypes = moduleFactory;
    }

})(function (signet) {

    signet.alias('maybe', 'variant<null, _>');

    const isFunction = (value) => typeof value === 'function';
    const isArray = (value) => Array.isArray(value);
    const isObject = (value) => typeof value === 'object';
    const isObjectInstance = (value) => isObject(value) && value !== null;
    const isString = (value) => typeof value === 'string';
    const isUndefined = (value) => typeof value === 'undefined';

    const isInt = signet.isTypeOf('int');

    return {
        isFunction: isFunction,
        isInt: isInt,
        isArray: isArray,
        isObject: isObject,
        isObjectInstance: isObjectInstance,
        isString: isString,
        isUndefined: isUndefined
    };

});
