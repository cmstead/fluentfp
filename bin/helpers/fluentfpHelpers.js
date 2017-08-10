'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpHelpers = moduleFactory;
    }

})(function (signet) {

    const isInt = signet.isTypeOf('int');

    const slice = signet.enforce(
        'start:int, end:?int, values:variant<arguments, array> => array<*>',
        function slice(start, end, values) {
            const endIndex = isInt(end) ? end : values.length;
            let result = [];

            for (let i = start; i < endIndex; i++) {
                result.push(values[i]);
            }

            return result;
        }
    );

    const sliceFrom = (start, values) => slice(start, null, values);

    const reduceOn = signet.enforce(
        'values:array<*>, action:function, initial:[*] => *',
        function reduceOn(values, action, initial) {
            const initialUndefined = typeof initial === 'undefined';

            let result = initialUndefined ? action[0] : initial;
            let remainingValues = initialUndefined ? values.slice(1) : values

            for (let i = 0; i < remainingValues.length; i++) {
                result = action(result, remainingValues[i], i);
            }

            return result;
        }
    );

    return {
        reduceOn: reduceOn,
        slice: slice,
        sliceFrom: sliceFrom
    };

});
