(function(window, _) {
    window.AP = window.AP || {};
    var REQ = {
            total: 0,
            served: 0,
            average: 0,
            time: 0
        },
        LOGS = [],
        W = {
            increment: 50,
            decrement: 50,
            count: 0,
            time: 0,
            size: 100,
            max: 500,
            disabled: false
        },
        RTT = {
            start: 0,
            average: 0,
            min: 0,
            max: 0,
            threshold: 200
        },
        records = {
            pendingDelayedExecutions: false,
            lastRequestedAt: 0,
            window: [],
            saving: {}
        },
        utils = window.AP.utils,
        formatRecord = function(record, req, windowRTT) {
            var sendTime = req.request_at,
                receivedTime = utils.timestamp();
            return {
                windowRTT: windowRTT,
                requestRTT: receivedTime - sendTime + W.size
            };
        },
        adjustRequestWindow = function(req) {
            if (REQ.average && !W.disabled) {
                if ((req.windowRTT - REQ.average) > RTT.threshold) {
                    // presist window increases beyond threshold
                    W.size = W.size + W.increment;
                    W.size = W.size > W.max ? W.max : W.size;
                } else {
                    W.size = W.size - W.decrement;
                    W.size = W.size > 0 ? W.size : 0;
                }
            }
        },
        updateVariables = function(record) {
            REQ.served++;
            REQ.time = REQ.time + record.requestRTT;
            REQ.average = Math.round(REQ.time / (REQ.served || 1));
            RTT.average = Math.round(W.time / (W.count || 1));
            RTT.min = (record.requestRTT > RTT.min) && RTT.min ? RTT.min : record.requestRTT;
            RTT.max = (record.requestRTT > RTT.max) ? record.requestRTT : RTT.max;

            var log = utils.clone({
                RTT: RTT,
                W: W,
                REQ: REQ
            });
            log.REQ.windowRTT = record.windowRTT;
            log.REQ.requestRTT = record.requestRTT;
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

            console.log("current request at: ", currentRequestAt);
            console.log("last requested at: ", records.lastRequestedAt);
            console.log("waiting window: ", waitingWindow);
            console.log("request total: ", REQ.total);

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
                    var windowRTT = (utils.timestamp() - records.saving[obj.request_id].request_at);
                    W.time = W.time + windowRTT;
                    records.saving[obj.request_id].forEach(function(record) {
                        var result = formatRecord(obj, record, windowRTT);
                        updateVariables(result);
                        adjustRequestWindow(result);
                    });
                    deferred.resolve(LOGS);
                });
            };

            if (!W.size || waitingWindow >= W.size) {
                console.log("Immediate Request Execution");
                executeRequest();
            } else if (!records.pendingDelayedExecutions) {
                records.pendingDelayedExecutions = true;
                console.log("Delayed Request Execution: ", W.size - waitingWindow);
                _.delay(function() {
                    records.pendingDelayedExecutions = false;
                    executeRequest();
                }, (W.size - waitingWindow));
            }

            return deferred.promise;
        };

    window.AP.reqWin = {
        adaptiveWindow: adaptiveWindow,
        setInitRTT: setInitRTT
    };
})(window, _);
