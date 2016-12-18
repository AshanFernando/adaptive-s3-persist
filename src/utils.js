(function(window) {
    window.AP = window.AP || {};

    var browser = function() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null)
                return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null)
            M.splice(1, 1, tem[1]);
        return M.join(' ');
    };

    var guid = function() {
        var s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    var timestamp = function() {
        return (new Date().getTime());
    };

    var fillPayload = function(obj, size) {
        var remainingSize = size - JSON.stringify(obj).length;
        obj.payload = new Array(remainingSize - 12).join('x');
        return obj;
    };

    clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    window.AP.utils = {
        browser: browser,
        clone: clone,
        guid: guid,
        fillPayload: fillPayload,
        timestamp: timestamp
    };
})(window);
