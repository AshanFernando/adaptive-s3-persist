(function($) {
    /*
      ======== A Handy Little QUnit Reference ========
      http://api.qunitjs.com/

      Test methods:
        module(name, {[setup][ ,teardown]})
        test(name, callback)
        expect(numberOfAssertions)
        stop(increment)
        start(decrement)
      Test assertions:
        ok(value, [message])
        equal(actual, expected, [message])
        notEqual(actual, expected, [message])
        deepEqual(actual, expected, [message])
        notDeepEqual(actual, expected, [message])
        strictEqual(actual, expected, [message])
        notStrictEqual(actual, expected, [message])
        throws(block, [expected], [message])
    */

    module('Utils', {});

    test('Browser should be identified', function() {
        expect(1);

        var utils = window.AP.utils;
        notEqual(utils.browser(), '', 'Should have a non-empty browser name: ' + utils.browser());
    });

    test('Random GUID should be generated', function() {
        expect(2);

        var utils = window.AP.utils;
        var guid1 = utils.guid();
        var guid2 = utils.guid();
        notEqual(guid1, '', 'Should have a non-empty guid: ' + guid1);
        notEqual(guid1, guid2, 'First guid: ' + guid1 + ' should not equal to second guid:' + guid2);
    });

    asyncTest('Timestamp should be generated', function(assert) {
        expect(2);

        var utils = window.AP.utils;
        var timestamp1 = utils.timestamp();
        setTimeout(function() {
            var timestamp2 = utils.timestamp();
            notEqual(timestamp1, '', 'Should have a non-empty timestamp: ' + timestamp1);
            notEqual(timestamp1, timestamp2, 'First timestamp: ' + timestamp1 + ' should not equal to second timestamp:' + timestamp2);
            start();
        });
    });

    test('Generate payload to fill the given size of JSON', function() {
        expect(3);

        var utils = window.AP.utils;
        var json1024 = utils.fillPayload({
            request_id: 'xxxx-xxxx-xxx'
        }, 1024);
        equal(JSON.stringify(json1024).length, 1024, 'JSON should be the size of 512 bytes');

        var json4096 = utils.fillPayload({
            request_id: 'xxxx-xxxx-xxx'
        }, 4096);
        equal(JSON.stringify(json4096).length, 4096, 'JSON should be the size of 4096 bytes');

        var json16384 = utils.fillPayload({
            request_id: 'xxxx-xxxx-xxx'
        }, 16384);
        equal(JSON.stringify(json16384).length, 16384, 'JSON should be the size of 16384 bytes');
    });
}(jQuery));
