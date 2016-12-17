(function($) {
    var EXPERIMENT = {},
        reqwin = window.AP.reqWin,
        utils = window.AP.utils,
        persist = window.AP.persist;

    module('Experiment with 1KB and 5 requests/second', {
        setup: function() {
            var reqObj = utils.fillPayload({
                request_at: 0000000000,
                request_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            }, 1024);
            EXPERIMENT.upload = function(requestId) {
                var deferred = Q.defer();
                reqObj.request_id = requestId;
                reqObj.request_at = utils.timestamp();
                persist.upload(reqObj).then(function(resObj) {
                    deferred.resolve(resObj);
                })
                return deferred.promise;
            };
        }
    });

    asyncTest('With Adaptive Window', function() {
        var iterations = 50,
            counts = {
                responses: 0
            };
        expect(iterations);
        for (var i = 0; i < iterations; i++) {
            setTimeout(function() {
                reqwin.adaptiveSave(EXPERIMENT.upload, false).then(function(logs) {
                    counts.responses++;
                    ok(true, 'Adaptive save operation: '+ counts.responses + ' with Data ' + JSON.stringify(logs.reverse()[0]));
                    if (counts.responses === iterations) {
                        start();
                    }
                });
            }, 200);
        }
    });

}(jQuery));
