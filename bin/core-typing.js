(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        const signet = require('./signet-types');

        module.exports = moduleFactory(signet);
    } else {
        window.coreTyping = moduleFactory(signet);
    }

})(function (signet) {
    'use strict';

    function setProperty(typeObj, key, value) {
        typeObj[key] = value;
        return typeObj;
    }

    const makeMapper = typeFn => transformer => typeFn(transformer);
    const setOuterType = (typeObj, typeValue) => setProperty(typeObj, 'whichType', typeValue);
    const setInnerType = (typeObj, typeStr) => setProperty(typeObj, 'innerType', typeStr);

    function None() {
        return None;
    }

    None.map = makeMapper(None);
    setOuterType(None, 'None');

    function Maybe(type, value) {
        const typeOk = signet.isTypeOf(type)(value);

        function maybeValue(transformer) {
            return typeOk ? transformer(value) : None;
        }

        maybeValue.map = makeMapper(maybeValue);
        setOuterType(maybeValue, 'Maybe');
        setInnerType(maybeValue, type);

        return maybeValue;
    }

    return {
        Maybe: signet.enforce(
            'typeStr:type, value:* => Maybe:mappable', 
            Maybe),
        None: None
    };

});
