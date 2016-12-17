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

    module('Request Window', {});

    asyncTest('Request Window Should Generate a Summary', function() {
        expect(2);

        var reqwin = window.AP.reqWin;
        var utils = window.AP.utils;
        var saveSimulation = function(requestId) {
            var deferred = Q.defer(),
                json = utils.fillPayload({
                    request_id: requestId,
                    request_at: utils.timestamp()
                }, 1024);
            setTimeout(function() {
                deferred.resolve(json);
            }, Math.random() * 1000);
            return deferred.promise;
        }
        reqwin.adaptiveSave(saveSimulation).then(function(summary) {
            ok(true, 'Adaptive save operates properly');
            ok(true, JSON.stringify(summary));
            start();
        });
    });
}(jQuery));
