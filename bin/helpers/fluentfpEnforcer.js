'use strict';

(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.fluentfpEnforcer = moduleFactory;
    }

})(function (signet, fluentfp) {

    const signatures = {
        // Execution Core
        apply: 'fn:function, values:[array] => *',
        call: 'fn:function => *',
        partial: 'fn:function => function',

        // Core Functions
        always: 'value:* => * => *',
        compose: 'fn1:function, fn2:[function] => * => *',
        identity: 'value:* => *',
        pipeline: 'value:*, fn:[function] => *',

        // Types and Type Management
        either: 'valueType:type => defaultValue:* => value:* => *',
        maybe: 'valueType:type => value:* => maybe<value:*>',

        // Array handling
        filter: 'predicate:function<* => boolean> => values:array<*> => array<*>',
        foldl: 'action:function, initialValue:[*] => values:array<*> => *',
        push: 'values:array<*> => value:* => values:array<*>',
        slice: 'start:int, end:[int] => values:variant<arguments, array<*>> => array<*>'
    };

    const typeCheckSignature = 'value:* => boolean';
    const typeCheckKeys = [
        'isFunction',
        'isInt',
        'isArray',
        'isObject',
        'isObjectInstance',
        'isString',
        'isUndefined'
    ];

    typeCheckKeys.forEach(function (key) {
        const tempSignature = fluentfp[key].signature;
        if(!fluentfp.isString(tempSignature)) {
            fluentfp[key] = signet.sign(typeCheckSignature, fluentfp[key]);
        }
    });

    Object.keys(fluentfp).forEach(function (key) {
        const signature = signatures[key];

        if (!fluentfp.isUndefined(signature)) {
            fluentfp[key] = signet.enforce(signature, fluentfp[key]);
        }
    });

    return fluentfp;
});
