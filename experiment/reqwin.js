(function($) {
    var EXPERIMENT = {},
        reqwin = window.AP.reqWin,
        utils = window.AP.utils,
        persist = window.AP.persist;

    module('Experiment Object Peristense', {
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

    var formatLogsJSON = function(logs) {
        return _.map(logs, function(log) {
            return {
                'requests': log.REQ.total,
                'served': log.REQ.served,
                'persisted': log.W.count,
                'serve RTT': log.REQ.serveTime,
                'req RTT': log.REQ.requestRTT,
                'next RTT': log.RTT.nextRTT,
                'serve av': log.REQ.average,
                'perist av': log.RTT.average,
                'window size': log.W.size
            }
        })
    };

    var JSONToCSVConvertor = function(JSONData) {

        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        //This condition will generate the Label/Header
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }
        row = row.slice(0, -1);
        //append Label row with line break
        CSV += row + '\r\n';

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }
            row.slice(0, row.length - 1);
            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV == '') {
            alert("Invalid data");
            return;
        }

        //this trick will generate a temp "a" tag
        var link = document.createElement("a");
        link.id = "lnkDwnldLnk";

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);

        var csv = CSV;
        blob = new Blob([csv], {
            type: 'text/csv'
        });
        var csvUrl = window.webkitURL.createObjectURL(blob);
        var filename = 'test-results.csv';
        $("#lnkDwnldLnk")
            .attr({
                'download': filename,
                'href': csvUrl
            });

        $('#lnkDwnldLnk')[0].click();
        document.body.removeChild(link);
    }

    asyncTest('Executing experiment', function() {
        var iterations, frequency,
            uploadLogs;

        window.AP.reqWin.W.disabled = false;
        window.AP.reqWin.W.size = 100;
        window.AP.reqWin.W.decrement = 50;
        window.AP.reqWin.W.increment = 100;
        window.AP.reqWin.RTT.threshold = 200;

        iterations = 500;
        frequency = 100;

        var refreshIntervalId = setInterval(function() {
            iterations--;
            reqwin.adaptiveWindow(EXPERIMENT.upload).then(function(logs) {
                uploadLogs = logs;
            })
            if (iterations === 0) {
                clearInterval(refreshIntervalId);
            }
        }, frequency);

        expect(1);
        _.delay(function() {
            var logs = JSONToCSVConvertor(formatLogsJSON(uploadLogs));
            ok(true, JSON.stringify(formatLogsJSON(uploadLogs)));
            start();
        }, 180000);
    });

}(jQuery));
