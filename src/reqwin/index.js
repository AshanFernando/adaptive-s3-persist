(function(window, _) {
    window.AP = window.AP || {};
    var REQ = {
            count: 0,
            average: 0,
            time: 0
        },
        LOGS = [],
        W = {
            increment: 25,
            decrement: 25,
            count: 0,
            time: 0,
            size: 0,
            max: 0
        },
        RTT = {
            start: 0,
            average: 0,
            min: 0,
            max: 0,
            threshold: 50
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
                    W.max = W.size > W.max ? W.size : W.max;
                } else if ((REQ.average - req.windowRTT) > RTT.threshold) {
                    W.size = W.size - W.decrement;
                    W.size = W.size > 0 ? W.size : 0;
                }
            }
            var log = {
                RTT: RTT,
                W: W,
                REQ: REQ
            };
            LOGS.push(utils.clone(log));
        },
        updateVariables = function(record) {
            REQ.time = REQ.time + record.requestRTT;
            REQ.average = averageServiceTime();
            RTT.average = averageRTT();
            RTT.min = (record.requestRTT > RTT.min) && RTT.min ? RTT.min : record.requestRTT;
            RTT.max = (record.requestRTT > RTT.max) ? record.requestRTT : RTT.max;
        },
        averageRTT = function() {
            return W.count > 0 ? Math.round(W.time / W.count) : 0;
        },
        averageServiceTime = function() {
            return REQ.count ? Math.round(REQ.time / REQ.count) : 0;
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
            REQ.count++;

            console.log("current request at: ", currentRequestAt);
            console.log("last requested at: ", records.lastRequestedAt);
            console.log("waiting window: ", waitingWindow);
            console.log("request count: ", REQ.count);

            records.window.push({
                request_at: currentRequestAt
            });

            // 1) Is this request within the buffering window? if YES store it untill the window time gap passed
            // 2) If not, immediately call the save callback

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
