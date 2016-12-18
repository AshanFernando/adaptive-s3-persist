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
                'obj requests': log.REQ.total,
                'obj changes reflected': log.REQ.served,
                'obj persisted': log.W.count,
                'obj served RTT': log.REQ.requestRTT,
                'obj persisted RTT': log.REQ.windowRTT,
                'serve time av': log.REQ.average,
                'perist time av': log.RTT.average,
                'window size': log.W.size
            }
        })
    }

    asyncTest('With Adaptive Window', function() {
        var iterations = 50,
            uploadLogs;

        var refreshIntervalId = setInterval(function() {
            iterations--;
            reqwin.adaptiveWindow(EXPERIMENT.upload).then(function(logs) {
                uploadLogs = logs;
            })
            if (iterations === 0) {
                clearInterval(refreshIntervalId);
            }
        }, 50);

        expect(1);
        setTimeout(function() {
            var logs = formatLogs(uploadLogs);
            ok(true, JSON.stringify(logs));
            start();
        }, 10000);
    });

}(jQuery));
