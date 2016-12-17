(function(W) {
    W.AP = W.AP || {};
    AP.persist = {
        upload: function(obj) {
            var s3Path = 'http://persistant-experiment-us-east.s3.amazonaws.com/' + obj.request_id + ".json";
            $.ajax({
                type: "PUT",
                url: s3Path,
                dataType: 'json',
                async: true,
                data: JSON.stringify(obj)
            });
        }
    }
})(window);
