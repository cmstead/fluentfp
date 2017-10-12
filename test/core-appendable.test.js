'use strict';

const assert = require('chai').assert;

const coreAppendable = require('../bin/core-appendable');

describe('core-appendable', function () {

    describe('toAppendable', function() {
        
        it('should make a value appendable', function() {
            const appendableInt = coreAppendable.toAppendable('int', 5, (a, b) => a + b);
            const result = appendableInt
                .append(6)
                .append(7)
                .append(8);

            assert.equal(result + 9, 35);
        });

        it('should default to nothing when value is not of appropriate type', function() {
            const appendableInt = coreAppendable.toAppendable('int', 'foo', (a, b) => a + b);
            const appendResult = appendableInt.append(6).append(7)

            assert.equal(appendableInt.isNothing(), true);
            assert.equal(appendResult.isNothing(), true);
        });

    });

    describe.skip('compositional', function() {
        
        it('should make an append function with compose behavior', function() {
            const add = a => b => a + b;
            const composableAdd = coreAppendable.compositional(add(1));

            const add10 = composableAdd
                .append(add(2))
                .append(add(3))
                .append(add(4));
            
            assert.equal(add10(5), 15);
        });

    });

    describe('multiplicative', function() {
        
        it('should multiply values together', function() {
            const multAppendable = coreAppendable.multiplicative(5);
            const result = multAppendable
                .times(4)
                .times(3)
                .append(2)
                .append(1);
            
            assert.equal(result, 120);
        });

    });

    describe('additive', function() {
        
        it('should add values together', function() {
            const multAppendable = coreAppendable.additive(5);
            const result = multAppendable
                .plus(4)
                .plus(3)
                .append(2)
                .append(1);
            
            assert.equal(result, 15);
        });

    });

    describe('concatable', function() {
        
        it('should concat strings together', function() {
            const concatAppendable = coreAppendable.concatable('Hello');
            const result = concatAppendable
                .concat(',')
                .concat(' ')
                .append('World')
                .append('!');
            
            assert.equal(result, 'Hello, World!');
        });

        it.skip('should concat arrays together', function() {
            const concatAppendable = coreAppendable.concatable(['Hello']);
            const result = concatAppendable
                .concat([','])
                .concat([' '])
                .append(['World'])
                .append(['!']);
            
            assert.equal(result.join(''), 'Hello, World!');
        });

    });

});

