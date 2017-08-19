'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpArray = moduleFactory;
    }

})(function (signet, callableDecorator, fluentfp, helpers) {

    const filterActionFactory =
        (predicate) =>
            (result, value) =>
                predicate(value) ? _push(result)(value) : result;


    let filterOn = function filterOn(predicate, values) {
        const filterAction = filterActionFactory(predicate);
        return fluentfp.foldl(filterAction, [])(values);
    }

    filterOn = signet.enforce('predicate:function<* => boolean>, values:array<*> => array<*>', filterOn);

    let findOn = function findOn(predicate, values) {
        let result = null;

        for (let i = 0; i < values.length; i++) {
            if (predicate(values[i])) {
                result = values[i];
            }
        }

        return result;
    };

    findOn = signet.enforce('predicate:function, values:array<*> => *', findOn);

    const mapActionFactory =
        (action) =>
            (result, value) =>
                _push(result)(action(value));

    let mapOn = function mapOn(action, values) {
        const mapAction = mapActionFactory(action);
        return fluentfp.foldl(mapAction, [])(values);
    };

    mapOn = signet.enforce('action:function, values:array<*> => array<*>', mapOn);

    let pushUnsafe = function pushUnsafe(values, value) {
        values.push(value);
        return fluentArrayDecorator(values);
    };

    pushUnsafe = signet.enforce('values:array<*>, value:* => *', pushUnsafe);

    let someOn = function someOn(predicate, values) {
        let result = false;

        for (let i = 0; i < values.length; i++) {
            if (result) { break; }

            result = predicate(values[i]);
        }

        return result;
    };

    someOn = signet.enforce('predicate:function, values:array<*> => boolean', someOn);

    let concatOn = function concatOn(values, value) {
        return fluentArrayDecorator(values.concat(value));
    }

    concatOn = signet.enforce('values:array<*>, value:array<*> => array<*>', concatOn);

    let allOn = function allOn(predicate, values) {
        return filterOn(predicate, values).length === values.length;
    };

    allOn = signet.enforce('predicate:function, values:array<*> => boolean', allOn);

    let sortOn = function sortOn(predicate, values) {
        return fluentArrayDecorator(helpers.slice(0, null, values).sort(predicate));
    }

    sortOn = signet.enforce('predicate:[function], values:array<*> => array<*>', sortOn);

    function fluentArrayDecorator(values) {
        values._push = (value) => pushUnsafe(values, value);
        values.concatWith = (value) => concatOn(values, value);
        values.filterOn = (predicate) => filterOn(predicate, values);
        values.findOn = (predicate) => findOn(predicate, values);
        values.foldlOn = (action, initialValue) => helpers.reduceOn(values, action, initialValue);
        values.mapOn = (action) => mapOn(action, values);
        values.sortWith = (comparator) => sortOn(comparator, values);

        values.someWhere = (predicate) => someOn(predicate, values);
        values.noneWhere = (predicate) => !someOn(predicate, values);
        values.allWhere = (predicate) => allOn(predicate, values);

        return values;
    }

    function _push(values) {
        const pushWith = callableDecorator((value) => pushUnsafe(values, value));

        pushWith.with = pushWith;
        return pushWith;
    }

    _push.into = _push;

    function filter(predicate) {
        const filterOver = callableDecorator((values) => filterOn(predicate, values));

        filterOver.over = filterOver;
        return filterOver;
    }

    filter.with = filter;

    function find(predicate) {
        const findOver = callableDecorator((values) => findOn(predicate, values));

        findOver.over = findOver;
        return findOver;
    }

    function map(action) {
        const mapOver = callableDecorator((values) => mapOn(action, values));

        mapOver.over = mapOver;
        return mapOver
    }

    map.with = map;

    function foldl(action, initialValue) {
        const foldlOver =
            callableDecorator((values) =>
                helpers.reduceOn(values, action, initialValue));

        foldlOver.over = foldlOver;
        return foldlOver;
    }

    foldl.with = foldl;

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

    function concat(values) {
        const concatWith = callableDecorator((value) => concatOn(values, value));

        concatWith.with = concatWith;
        return concatWith;
    }

    concat.onto = concat;

    function some(predicate) {
        const someIn = callableDecorator((values) => someOn(predicate, values));
        someIn.in = someIn;
        return someIn;
    }

    function none(predicate) {
        const noneIn = callableDecorator((values) => !someOn(predicate, values));
        noneIn.in = noneIn;
        return noneIn;
    }

    function all(predicate) {
        const allIn = callableDecorator((values) => allOn(predicate, values));

        allIn.in = allIn;
        return allIn;
    }

    function sort(predicate) {
        const sortOver = callableDecorator((values) => sortOn(predicate, values));

        sortOver.over = sortOver;
        return sortOver;
    }

    sort.with = sort;

    fluentfp.all = callableDecorator(all);
    fluentfp.concat = callableDecorator(concat);
    fluentfp.filter = callableDecorator(filter);
    fluentfp.find = callableDecorator(find);
    fluentfp.foldl = callableDecorator(foldl);
    fluentfp.map = callableDecorator(map);
    fluentfp.none = callableDecorator(none);
    fluentfp.slice = callableDecorator(slice);
    fluentfp.some = callableDecorator(some);
    fluentfp.sort = callableDecorator(sort);

    fluentfp._push = callableDecorator(_push);
});
