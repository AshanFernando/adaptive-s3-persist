(function($) {
    var EXPERIMENT = {},
        reqwin = window.AP.reqWin,
        utils = window.AP.utils,
        persist = window.AP.persist;

    module('Experiment with 1KB and 5 requests/second', {
        setup: function() {
            var reqObj = utils.fillPayload({
                request_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            }, 1024);
            EXPERIMENT.upload = function(requestId, requestedAt) {
                var deferred = Q.defer();
                reqObj.request_id = requestId;
                reqObj.request_at = requestedAt;
                persist.upload(reqObj).then(function(resObj) {
                    deferred.resolve(resObj);
                })
                return deferred.promise;
            };
        }
    });

    var formatLogs = function(logs) {
        return _.map(logs, function(log) {
            return {
                'object changes': log.REQ.count,
                'updated changes': log.W.count,
                'serve average': log.REQ.average,
                'round trip average': log.RTT.average,
                'window size': log.W.size
            }
        })
    }

    asyncTest('With Adaptive Window', function() {
        var iterations = 20,
            uploadLogs;

        var refreshIntervalId = setInterval(function() {
            iterations--;
            reqwin.adaptiveWindow(EXPERIMENT.upload).then(function(logs) {
                uploadLogs = logs;
            })
            if (iterations === 0) {
                clearInterval(refreshIntervalId);
            }
        }, 100);

        expect(1);
        setTimeout(function() {
            var logs = formatLogs(uploadLogs);
            ok(true, JSON.stringify(logs));
            start();
        }, 10000);
    });

}(jQuery));
