(function(W) {
    W.AP = W.AP || {};
    AP.summary = {
            save: function() {
                var summaryApi = $resource('https://fejuq6cjwk.execute-api.us-east-1.amazonaws.com/dev/todos', null, {
                    create: {
                        method: 'post'
                    }
                });
                summaryApi.create({
                    id: "30d69bc0-c991-11e5-ad3c-3b71cd4306a9"
                }, {
                    summary: (summary.user + "," + summary.average_obj_size + "," + summary.start_rtt + "," + summary.browser + "," + summary.min_rtt + "," + summary.max_rtt + "," + summary.average_rtt + "," + summary.average_obj_rtt + "," + summary.max_w_size)
                }).$promise.then(function() {
                    alert("saved!");
                })
            };
        },
})(window);
