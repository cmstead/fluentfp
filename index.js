(function (moduleFactory) {
    const isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        const fluentCore = require('./bin/fluent-core');
        const fluentArray = require('./bin/fluent-array');

        module.exports = moduleFactory(fluentCore, fluentArray);
    } else {
        window.fluentfp = moduleFactory(fluentCore, fluentArray);
    }

})(function (
    fluentCore,
    fluentArray) {

    'use strict';

    let fluentApi = {};

    function reduce(values, fn, initial) {
        let result = initial;

        for (let i = 0; i < values.length; i++) {
            result = fn(result, values[i]);
        }

        return result;
    }

    function attachModuleApi(module) {
        const keys = Object.keys(module);

        function attachKey(result, key) {
            result[key] = module[key];
            return result;
        }

        return reduce(keys, attachKey, fluentApi);
    }

    const modules = [
        fluentArray
    ];

    modules.forEach(attachModuleApi);

    return fluentApi;
});
