(function() {
    window.AP = window.AP || {};
    var request = {
            count: 0,
            average: 0,
            time: 0
        },
        utils = window.AP.utils,
        log = [],
        W = {
            increment: 25,
            decrement: 25,
            count: 0,
            time: 0,
            size: 0,
            max: 0
        },
        records = {
            window: [],
            saving: {},
            total: 0
        },
        RTT = {
            start: 0,
            average: 0,
            min: 0,
            max: 0,
            threshold: 50
        },
        formatRecord = function(record, request, windowRTT) {
            var deferred = Q.defer(),
                sendTime = request.requested_at,
                receivedTime = utils.timestamp();
            deferred.resolve({
                windowRTT: windowRTT,
                requestRTT: receivedTime - sendTime + W.size
            });
            return deferred.promise;
        },
        transferObjectSize = function(obj) {
            return JSON.stringify(obj).length;
        },
        averageTransferSize = function() {
            return W.count > 0 ? Math.round(records.total / W.count) : 0;
        },
        adjustRequestWindow = function(req) {
            var deferred = Q.defer()
            if (request.average) {
                if ((req.windowRTT - request.average) > RTT.threshold) {
                    // presist window increases beyond threshold
                    W.size = W.size + W.increment;
                    W.max = W.size > W.max ? W.size : W.max;
                } else if ((request.average - req.windowRTT) > RTT.threshold) {
                    W.size = W.size - W.decrement;
                    W.size = W.size > 0 ? W.size : 0;
                }
            }
            log.push({
                RTT: RTT,
                W: W,
                Req: request
            });
            var summary = {
                average_obj_size: averageTransferSize(),
                start_rtt: RTT.start,
                min_rtt: RTT.min,
                max_rtt: RTT.max,
                average_rtt: RTT.average,
                average_obj_rtt: request.average,
                max_w_size: W.max,
            };
            deferred.resolve(summary);
            return deferred.promise;
        },
        updateVariables = function(record) {
            var deferred = Q.defer();
            request.average = averageServiceTime();
            request.time = request.time + record.requestRTT;
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
            return request.count ? Math.round(request.time / request.count) : 0;
        },
        setInitRTT = function(loadTime) {
            RTT.start = loadTime;
        },
        clone = function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        adaptiveSave = function(saveCallback) {
            var deferred = Q.defer();
            var requestedAt = utils.timestamp();
            request.count++;
            if (!records.window.length) {
                setTimeout(function() {
                    var requestId = utils.guid();
                    records.saving[requestId] = clone(records.window);
                    records.saving[requestId].request_at = utils.timestamp();
                    records.window.length = 0;
                    saveCallback(requestId).then(function(store) {
                        W.count++;
                        records.total = records.total + transferObjectSize(store);
                        var windowRTT = (utils.timestamp() - records.saving[store.request_id].request_at);
                        W.time = W.time + windowRTT;
                        records.saving[store.request_id].forEach(function(record) {
                            formatRecord(store, record, windowRTT).then(updateVariables).then(adjustRequestWindow).then(deferred.resolve);
                        });
                    });
                }, W.size);
            }
            records.window.push({
                requested_at: requestedAt
            });
            return deferred.promise;
        };

    window.AP.reqWin = {
        adaptiveSave: adaptiveSave,
        setInitRTT: setInitRTT
    };
})(window);
