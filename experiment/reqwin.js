(function($) {
    var EXPERIMENT = {
            results: {
                logs: []
            },
            requests: 0
        },
        reqwin = window.AP.reqWin,
        utils = window.AP.utils,
        persist = window.AP.persist;

    var reqObj = utils.fillPayload({
        request_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }, 1024);
    EXPERIMENT.upload = function(requestId, requestedAt) {
        var deferred = Q.defer();
        EXPERIMENT.requests++;
        reqObj.request_id = requestId;
        reqObj.request_at = requestedAt;
        persist.upload(reqObj).then(function(resObj) {
            deferred.resolve(resObj);
        })
        return deferred.promise;
    };

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
                'persist av': log.RTT.average,
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

    var init = function() {
        var params = window.AP.reqWin.init();
        EXPERIMENT.requests = 0;
        params.W.disabled = true;
        params.W.size = 100;
        params.W.decrement = 50;
        params.W.increment = 100;
        params.RTT.threshold = 200;
    };

    var runExperiment = function(callback) {
        var iterations, interval, responses = 0,
            iterations = 50;
        interval = 100;

        var refreshIntervalId = setInterval(function() {
            iterations--;
            if (iterations === 0) {
                clearInterval(refreshIntervalId);
            }
            reqwin.adaptiveWindow(EXPERIMENT.upload).then(function(logs) {
                responses++;
                if (responses === EXPERIMENT.requests) {
                    callback(logs);
                }
            })
        }, interval);
    };

    var averageProp = function(index, prop) {
        return Math.round((EXPERIMENT.results.logs1[index][prop] + EXPERIMENT.results.logs2[index][prop] + EXPERIMENT.results.logs3[index][prop]) / 3);
    };

    init();
    runExperiment(function(logs1) {
        //interation 1
        EXPERIMENT.results.logs1 = utils.clone(formatLogsJSON(logs1));
        init();
        runExperiment(function(logs2) {
            //interation 2
            EXPERIMENT.results.logs2 = utils.clone(formatLogsJSON(logs2));
            init();
            runExperiment(function(logs3) {
                //interation 3
                EXPERIMENT.results.logs3 = utils.clone(formatLogsJSON(logs3));
                console.log(EXPERIMENT.results);
                for (i = 0; i < EXPERIMENT.results.logs1.length; i++) {
                    EXPERIMENT.results.logs.push({
                        'requests': averageProp(i, 'requests'),
                        'served': averageProp(i, 'served'),
                        'persisted': averageProp(i, 'persisted'),
                        'serve RTT': averageProp(i, 'serve RTT'),
                        'req RTT': averageProp(i, 'req RTT'),
                        'next RTT': averageProp(i, 'next RTT'),
                        'serve av': averageProp(i, 'serve av'),
                        'persist av': averageProp(i, 'persist av'),
                        'window size': averageProp(i, 'window size')
                    });
                }
                console.log(EXPERIMENT.results);
                JSONToCSVConvertor(EXPERIMENT.results.logs);
            });
        });
    })




}(jQuery));
