(function($) {

    module('Request Window', {});

    asyncTest('Request Window Should Generate a Summary', function() {
        expect(1);

        var reqwin = window.AP.reqWin,
            utils = window.AP.utils;
        var saveSimulation = function(requestId) {
            var deferred = Q.defer();
            setTimeout(function() {
                deferred.resolve(utils.fillPayload({
                    request_id: requestId,
                    request_at: utils.timestamp()
                }, 1024));
            }, Math.random() * 1000);
            return deferred.promise;
        }
        reqwin.adaptiveWindow(saveSimulation).then(function(logs) {
            ok(true, 'Adaptive save operation: ' + JSON.stringify(logs));
            start();
        });
    });
}(jQuery));
