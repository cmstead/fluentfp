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
    const isFunction = fluentCore.isFunction;
    const isAppendable = signet.isTypeOf('Appendable');
    const toTransformable = fluentCore.toTransformable;

    function reduceOverArray(operation, values, initialValue) {
        let result = initialValue;

        for (let i = 0; i < values.length; i++) {
            result = operation(result, values[i]);
        }

        return result;
    }

    function _push(values, value) {
        values.push(value);
        return values;
    }

    const first = (values) => values[0];
    const rest = fluentCore.slice(0);



    function addArrayBehaviors(values) {
        values.first = () => first(values);
        values.rest = () => rest(values);
        values._push = () => _push(values);

        return values;
    }

    const arrayToTransformable =
        (values) =>
            toTransformable(
                'array',
                addArrayBehaviors(values),
                identityTransform);

    function mapOverArray(operation, values) {
        const mapValue = (result, value) => _push(result, operation(value));

        return arrayToTransformable(
            reduceOverArray(mapValue, values, []));
    }

    const map =
        (operation) =>
            addCoreBehaviors((mappableValue) =>
                isArray(mappableValue)
                    ? mapOverArray(operation, mappableValue)
                    : mappableValue.map(operation));

    function filterOverArray(predicateFn, values) {
        const filterValue =
            (result, value) =>
                predicateFn(value) ? _push(result, value) : result;

        return arrayToTransformable(reduceOverArray(filterValue, values, []));
    }

    const filter =
        (predicateFn) =>
            addCoreBehaviors((values) =>
                filterOverArray(predicateFn, values));

    const applyAppend =
        (base, appendee) =>
            isFunction(base.append)
                ? base.append(appendee)
                : base.concat(appendee);

    const applyToTransformable =
        (result) =>
            isAppendable(result)
                ? result
                : toTransformable(
                    typeof result.valueOf(),
                    result,
                    identityTransform)

    const append =
        (base, appendee) =>
            applyToTransformable(applyAppend(base, appendee));

    return {
        append: signet.enforce(
            'base =: appendee, base =: result :: ' +
            'base: variant<Appendable, concatable>, ' + 
            'appendee: variant<Appendable, concatable> ' +
            '=> result: variant<Appendable, concatable>',
            addCoreBehaviors(append)),

        map: signet.enforce(
            'operation:function => mappableValue: Mappable<*> => Mappable<*>',
            addCoreBehaviors(map)),

        filter: signet.enforce(
            'predicateFn:function<* => boolean> => values: array => array',
            addCoreBehaviors(filter))
    };
});
