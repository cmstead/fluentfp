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
        apply: 'fn:function, values:[array] => *',
        call: 'fn:function => *',
        partial: 'fn:function => function',
        slice: 'start:int, end:[int] => values:object => array',
        either: 'valueType:type => defaultValue:* => value:* => *',
        maybe: 'valueType:type => function',
        always: 'value:* => * => *',
        identity: 'value:* => *',
        compose: 'fn1:function, fn2:[function] => * => *',
        pipeline: 'value:*, fn:[function] => *'
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
