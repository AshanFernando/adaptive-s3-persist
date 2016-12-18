(function($) {

    module('S3 Upload', {});

    test('Check AWS Credentials Are Set', function() {
        expect(3);
        var credentials = window.AP.AWS_CREDENTIALS;
        notEqual(credentials, undefined, 'Should be defined');
        notEqual(credentials.accessKeyId, '', 'Should be having access key');
        notEqual(credentials.secretAccessKey, '', 'Should be having secret key');
    });

    asyncTest('S3 Upload should upload file to S3 bucket in US-East-1', function() {
        expect(2);

        var persist = window.AP.persist,
            utils = window.AP.utils;

        persist.upload(utils.fillPayload({
            request_id: utils.guid(),
            name: utils.guid(),
            request_at: utils.timestamp()
        }, 1024)).then(function(data) {
            ok(true, 'Uploaded successful');
            ok(true, JSON.stringify(data));
            start();
        })
    });
}(jQuery));
