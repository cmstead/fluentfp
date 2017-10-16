// eslint-disable-next-line no-unused-vars
const fluentArray = (function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');
        const fluentCore = require('./fluent-core');

        const moduleOutput = moduleFactory(signet, fluentCore);

        module.exports = moduleOutput;
        return moduleOutput;
    } else {
        return moduleFactory(signet, fluentCore);
    }

})(function (signet, fluentCore) {
    'use strict';

    const addCoreBehaviors = fluentCore.addCoreBehaviors;
    const identityTransform = fluentCore.identityTransform;
    const isArray = fluentCore.isArray;
    const toTransformable = fluentCore.toTransformable;
    
    function mapOverArray(operation, values) {
        let result = [];

        for(var i = 0; i < values.length; i++) {
            result.push(operation(values[i]));
        }

        return toTransformable('array', result, identityTransform);
    }

    const map =
        (operation) =>
            (mappableValue) =>
                isArray(mappableValue)
                    ? mapOverArray(operation, mappableValue)
                    : mappableValue.map(operation);

    return {
        map: signet.enforce(
            'operation:function => mappableValue: Mappable<*> => Mappable<*>',
            addCoreBehaviors(map))
    };
});
