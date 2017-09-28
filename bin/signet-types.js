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

    function hasTypeName (typeName) {
        return function (value) {
            return value.toString().indexOf(typeName) > -1;
        }
    }

    signet.alias('fluentType', 'variant<type, function>');
    signet.alias('referencible', 'not<variant<null, undefined>>');
    
    signet.subtype('referencible')('mappable', isMappable);

    signet.subtype('mappable')('Just', hasTypeName('Just'));
    signet.subtype('mappable')('Maybe', hasTypeName('Maybe'));
    signet.subtype('mappable')('Nothing', hasTypeName('Nothing'));


    return signet;

});
