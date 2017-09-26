(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('signet')();
        module.exports = moduleFactory(signet);
    } else {
        window.signet = moduleFactory(signet);
    }

})(function (signet) {
    'use strict';

    function isMappable(value) {
        return signet.isTypeOf('function')(value.map);
    }

    function isWhichType(value, whichTypeValue) {
        return value.whichType === whichTypeValue;
    }

    function isInnerType(value, outerType) {
        return value.innerType === outerType;
    }

    function isNone(value) {
        return isWhichType(value, 'None');
    }

    function isMaybe(value, options) {
        return isWhichType(value, 'Maybe') && isInnerType(value, options[0]);
    }

    signet.extend('mappable', isMappable);

    signet.subtype('mappable')('None', isNone);
    signet.subtype('mappable')('Maybe', isMaybe);

    signet.alias('fluentType', 'variant<type, function>');

    return signet;

});
