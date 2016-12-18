(function(W, $) {
    W.AP = W.AP || {};
    AWS.config.update(W.AP.AWS_CREDENTIALS);
    var recordsLog = {};

    AP.persist = {
        upload: function(obj) {
            var deferred = Q.defer(),
                s3 = new AWS.S3(),
                params = {
                    Bucket: 'persistant-experiment-us-east-1',
                    Key: obj.request_id,
                    StorageClass: 'REDUCED_REDUNDANCY',
                    Body: JSON.stringify(obj)
                };
            recordsLog[obj.request_id] = W.AP.utils.clone(obj);
            s3.upload(params, function(err, res) {
                deferred.resolve(recordsLog[res.key]);
            });
            return deferred.promise;
        }
    };
})(window, jQuery);
