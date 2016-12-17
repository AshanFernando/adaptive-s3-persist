(function($) {
    var EXPERIMENT = {},
        reqwin = window.AP.reqWin,
        utils = window.AP.utils,
        persist = window.AP.persist;

    module('Experiment with 1KB and 5 requests/second', {
        setup: function() {
            EXPERIMENT.json1024 = utils.fillPayload({
                request_at: 0000000000,
                request_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            }, 1024);
        }
    });

    asyncTest('Request Window Should Generate a Summary', function() {
        expect(2);
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
        reqwin.adaptiveSave(saveSimulation).then(function(logs) {
            ok(true, 'Adaptive save operates properly');
            ok(true, JSON.stringify(logs));
            start();
        });
    });
}(jQuery));
