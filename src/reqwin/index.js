(function(window, _) {
    window.AP = window.AP || {};
    var REQ = {
            total: 0,
            served: 0,
            average: 0,
            time: 0,
            log: []
        },
        LOGS = [],
        W = {
            increment: 0,
            decrement: 0,
            factor: 100,
            count: 0,
            time: 0,
            size: 0,
            max: 0,
            disabled: false
        },
        RTT = {
            start: 0,
            average: 0,
            min: 0,
            max: 0,
            threshold: 0
        },
        records = {
            pendingDelayedExecutions: false,
            lastRequestedAt: 0,
            window: [],
            saving: {}
        },
        utils = window.AP.utils,

        predictNextRTT = function(req) {
            if(REQ.log.length < 4){
              return req.requestRTT;
            };
            var result, reqLogs = utils.clone(REQ.log);
            reqLogs.push([reqLogs.length, null]);
            result = regression('polynomial', reqLogs, 10);
            console.log(result.string)
            return Math.abs(Math.round(_.last(_.last(result.points))));
        },

        adjustRequestWindow = function(req) {
            if (!W.disabled) {
                if (RTT.nextRTT - req.requestRTT> 0) {
                    W.size = W.size + W.increment;
                } else {
                    W.size = W.size - W.decrement;
                    W.size = W.size > 0 ? W.size : 0;
                }
            }
        },

        updateVariables = function(req) {
            REQ.served++;
            REQ.time = REQ.time + req.serveTime;
            REQ.average = Math.round(REQ.time / (REQ.served || 1));
            RTT.average = Math.round(W.time / (W.count || 1));
            RTT.min = (req.requestRTT > RTT.min) && RTT.min ? RTT.min : req.requestRTT;
            RTT.max = (req.requestRTT > RTT.max) ? req.requestRTT : RTT.max;

            REQ.log.push([REQ.log.length, req.requestRTT]);
            RTT.nextRTT = predictNextRTT(req);

            var log = utils.clone({
                RTT: RTT,
                W: W,
                REQ: REQ
            });

            log.REQ.requestRTT = req.requestRTT;
            log.REQ.serveTime = req.serveTime;
            LOGS.push(log);
        },

        setInitRTT = function(loadTime) {
            RTT.start = loadTime;
        },

        adaptiveWindow = function(saveCallback) {
            var deferred = Q.defer(),
                currentRequestAt = utils.timestamp(),
                waitingWindow;
            records.lastRequestedAt = records.lastRequestedAt || utils.timestamp();
            waitingWindow = currentRequestAt - records.lastRequestedAt
            REQ.total++;

            records.window.push({
                request_at: currentRequestAt
            });

            var executeRequest = function() {
                var requestId = utils.guid();
                records.lastRequestedAt = utils.timestamp();
                records.saving[requestId] = utils.clone(records.window);
                records.saving[requestId].request_at = records.lastRequestedAt;
                records.window.length = 0;
                saveCallback(requestId, records.lastRequestedAt).then(function(obj) {
                    W.count++;
                    var requestRTT = (utils.timestamp() - records.saving[obj.request_id].request_at);
                    W.time = W.time + requestRTT;
                    records.saving[obj.request_id].forEach(function(record) {
                        var result = {
                            requestRTT: requestRTT,
                            serveTime: utils.timestamp() - record.request_at + W.size
                        };
                        updateVariables(result);
                        adjustRequestWindow(result);
                    });
                    deferred.resolve(LOGS);
                });
            };

            if (!W.size || waitingWindow >= W.size) {
                executeRequest();
            } else if (!records.pendingDelayedExecutions) {
                records.pendingDelayedExecutions = true;
                _.delay(function() {
                    records.pendingDelayedExecutions = false;
                    executeRequest();
                }, (W.size - waitingWindow));
            }

            return deferred.promise;
        };

    window.AP.reqWin = {
        W: W,
        RTT: RTT,
        adaptiveWindow: adaptiveWindow,
        setInitRTT: setInitRTT
    };
})(window, _);
