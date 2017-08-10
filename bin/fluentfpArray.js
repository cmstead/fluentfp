'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpArray = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp, helpers) {

    const filterOn = signet.enforce(
        'predicate:function<* => boolean>, values:array<*> => array<*>',
        function filterOn(predicate, values) {
            const filterAction = filterActionFactory(predicate);
            return fluentfp.foldl(filterAction, [])(values);
        }
    );

    const mapOn = signet.enforce(
        'action:function, values:array<*> => array<*>',
        function mapOn(action, values) {
            const mapAction = mapActionFactory(action);
            return fluentfp.foldl(mapAction, [])(values);
        }
    );

    const pushUnsafe = signet.enforce(
        'values:array<*>, value:* => *',
        function pushUnsafe(values, value) {
            values.push(value);
            return fluentArrayDecorator(values);
        }
    );

    const concatOn = signet.enforce(
        'values:array<*>, value:array<*> => array<*>',
        function concatOn(values, value) {
            return fluentArrayDecorator(values.concat(value));
        }
    );


    function fluentArrayDecorator(values) {
        values._push = (value) => pushUnsafe(values, value);
        values.fluentConcat = (value) => concatOn(values, value);
        values.fluentFilter = (predicate) => filterOn(predicate, values);
        values.fluentMap = (action) => mapOn(action, values);
        values.fluentFoldl = (action, initialValue) => helpers.reduceOn(values, action, initialValue);

        return values;
    }

    const _push = (values) => callableDecorator((value) => pushUnsafe(values, value))

    const filterActionFactory =
        (predicate) =>
            (result, value) =>
                predicate(value) ? _push(result)(value) : result;

    const filter =
        (predicate) =>
            callableDecorator((values) =>
                filterOn(predicate, values));

    const mapActionFactory =
        (action) =>
            (result, value) =>
                _push(result)(action(value));

    const map =
        (action) =>
            callableDecorator((values) =>
                mapOn(action, values));

    const foldl =
        (action, initialValue) =>
            callableDecorator((values) =>
                helpers.reduceOn(values, action, initialValue));


    function slice(start, end) {
        const sliceValues = (values) =>
            fluentArrayDecorator(helpers.slice(start, end, values));

        sliceValues.onArray = sliceValues;

        return sliceValues;
    }

    function sliceFrom(start) {
        const sliceTo = callableDecorator((end) => slice(start, end));

        sliceTo.to = sliceTo;
        sliceTo.onArray = callableDecorator((values) => slice(start)(values));

        return sliceTo;
    }

    slice.from = callableDecorator(sliceFrom);

    const concat =
        (values) =>
            callableDecorator((value) =>
                concatOn(values, value));

    fluentfp.concat = callableDecorator(concat);
    fluentfp.filter = callableDecorator(filter);
    fluentfp.foldl = callableDecorator(foldl);
    fluentfp.map = callableDecorator(map);
    fluentfp.slice = callableDecorator(slice);

    fluentfp._push = callableDecorator(_push);
});
