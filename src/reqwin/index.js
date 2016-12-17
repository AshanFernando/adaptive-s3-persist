(function() {
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
            window: [],
            saving: {}
        },
        utils = window.AP.utils,
        formatRecord = function(record, req, windowRTT) {
            var deferred = Q.defer(),
                sendTime = req.requested_at,
                receivedTime = utils.timestamp();
            deferred.resolve({
                windowRTT: windowRTT,
                requestRTT: receivedTime - sendTime + W.size
            });
            return deferred.promise;
        },
        adjustRequestWindow = function(req) {
            var deferred = Q.defer();
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
            LOGS.push(log);
            deferred.resolve(LOGS);
            return deferred.promise;
        },
        updateVariables = function(record) {
            var deferred = Q.defer();
            REQ.average = averageServiceTime();
            REQ.time = REQ.time + record.requestRTT;
            RTT.average = averageRTT();
            RTT.min = (record.requestRTT > RTT.min) && RTT.min ? RTT.min : record.requestRTT;
            RTT.max = (record.requestRTT > RTT.max) ? record.requestRTT : RTT.max;
            deferred.resolve(record);
            return deferred.promise;
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
        clone = function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        adaptiveSave = function(saveCallback, disabled) {
            var deferred = Q.defer();
            var requestedAt = utils.timestamp();
            REQ.count++;
            W.disabled = disabled;
            if (!records.window.length) {
                setTimeout(function() {
                    var requestId = utils.guid();
                    records.saving[requestId] = clone(records.window);
                    records.saving[requestId].request_at = utils.timestamp();
                    records.window.length = 0;
                    saveCallback(requestId).then(function(obj) {
                        W.count++;
                        var windowRTT = (utils.timestamp() - records.saving[obj.request_id].request_at);
                        W.time = W.time + windowRTT;
                        records.saving[obj.request_id].forEach(function(record) {
                            formatRecord(obj, record, windowRTT).then(updateVariables).then(adjustRequestWindow).then(deferred.resolve);
                        });
                    });
                }, W.size);
            }
            setTimeout(function() {
                records.window.push({
                    requested_at: requestedAt
                });
            });
            return deferred.promise;
        };

    window.AP.reqWin = {
        adaptiveSave: adaptiveSave,
        setInitRTT: setInitRTT
    };
})(window);
