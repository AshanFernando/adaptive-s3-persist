(function(W, $) {
    W.AP = W.AP || {};
    AWS.config.update(W.AP.AWS_CREDENTIALS);
    var records = {};

    AP.persist = {
        upload: function(obj) {
            var deferred = Q.defer(),
                s3 = new AWS.S3(),
                params = {
                    Bucket: 'persistant-experiment-us-east-1',
                    Key: obj.request_id,
                    Body: JSON.stringify(obj)
                };
            records[obj.request_id] = obj;
            s3.upload(params, function(err, res) {
                deferred.resolve(records[res.key]);
            });
            return deferred.promise;
        }
    };
})(window, jQuery);
