let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { ReadStream } from 'iqs-libs-protocols-node';
import { WriteStream } from 'iqs-libs-protocols-node';

import { TestMessage } from './TestMessage';

suite('TestMessage', ()=> {
    
    test('Reading and writing message', (done) => {
        let writeStream = new WriteStream();

        let message = new TestMessage();
        message.value1 = 1;
        message.value2 = 2;
        message.value3 = 3;
        message.value4 = -4;
        message.value5 = true;
        message.value6 = "ABC";
        message.value7 = new Date(2017,11,4,11,30,0);

        message.stream(writeStream);

        let buffer = writeStream.toBuffer();
        assert.lengthOf(buffer, 20);

        let readStream = new ReadStream(buffer);
        let message2 = new TestMessage();
        message2.stream(readStream);

        assert.equal(message.value1, message2.value1);
        assert.equal(message.value2, message2.value2);
        assert.equal(message.value3, message2.value3);
        assert.equal(message.value4, message2.value4);
        assert.equal(message.value5, message2.value5);
        assert.equal(message.value6, message2.value6);
        assert.equal(message.value7.getTime(), message2.value7.getTime());

        done();
    });

});

