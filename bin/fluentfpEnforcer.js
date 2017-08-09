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
        maybe: 'valueType:type => function',

        // Array handling
        foldl: 'action:function, initialValue:[*] => array<*> => *',
        slice: 'start:int, end:[int] => values:object => array'
    };

    const isUndefined = signet.isTypeOf('undefined');

    Object.keys(fluentfp).forEach(function (key) {
        const signature = signatures[key];

        if (!isUndefined(signature)) {
            fluentfp[key] = signet.enforce(signature, fluentfp[key]);
        }
    });

    return fluentfp;
});
