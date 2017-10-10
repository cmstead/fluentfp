(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('signet')();
        module.exports = moduleFactory(signet);
    } else {
        window.fluentSignet = moduleFactory(signet);
    }

})(function (signet) {
    'use strict';

    function isMappable(value) {
        return signet.isTypeOf('function')(value.map);
    }

    function isAppendable(value, options) {
        return signet.isTypeOf('function')(value.append)
            && signet.isTypeOf(options[0])(value.valueOf());
    }

    function hasTypeName (typeName) {
        return function (value) {
            return value.toString().indexOf(typeName) > -1;
        }
    }

    signet.alias('fluentType', 'variant<type, function>');
    signet.alias('referencible', 'not<variant<null, undefined>>');
    
    signet.subtype('referencible')('Appendable{1}', isAppendable);
    signet.subtype('referencible')('Mappable', isMappable);

    signet.subtype('Mappable')('Just', hasTypeName('Just'));
    signet.subtype('Mappable')('Maybe', hasTypeName('Maybe'));
    signet.subtype('Mappable')('Nothing', hasTypeName('Nothing'));


    return signet;

});
