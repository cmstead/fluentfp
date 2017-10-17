// eslint-disable-next-line no-unused-vars
const signet = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('signet')();
        const moduleOutput = moduleFactory(signet);

        module.exports = moduleOutput;
        return moduleOutput;
    } else if(typeof window.signet === 'object') {
        return moduleFactory(window.signet);
    } else {
        throw new Error('Fluent FP requires the Signet type library to run in the browser.');
    }

})(function (signet) {
    'use strict';

    const hasTypeName =
        (typeName) =>
            (value) =>
                value.typeString().indexOf(typeName) > -1;

    const getSubtype =
        (subtype) =>
            typeof subtype === 'undefined' ? '*' : subtype;

    const buildContractCheck =
        (propertyName) =>
            (value, options) =>
                signet.isTypeOf('function')(value[propertyName])
                && signet.isTypeOf(getSubtype(options[0]))(value.valueOf());

    signet.alias('fluentType', 'variant<type, function>');
    signet.alias('referencible', 'not<variant<null, undefined>>');

    signet.subtype('referencible')('Transformable', buildContractCheck('transform'));
    signet.subtype('referencible')('Mappable', buildContractCheck('map'));
    signet.subtype('referencible')('Appendable', buildContractCheck('append'));

    signet.subtype('referencible')('Just', hasTypeName('Just'));
    signet.subtype('referencible')('Maybe', hasTypeName('Maybe'));
    signet.subtype('referencible')('Nothing', hasTypeName('Nothing'));

    signet.subtype('referencible')('concatable', buildContractCheck('concat'));

    return signet;

});
