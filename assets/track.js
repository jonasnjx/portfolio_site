(function () {
    const PA_URL = 'https://portfolio-analytics-plum.vercel.app/track';

    function vid() {
        let v = localStorage.getItem('pa_vid');
        if (!v) { v = Math.random().toString(36).slice(2, 10); localStorage.setItem('pa_vid', v); }
        return v;
    }

    function ua() {
        return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    }

    window.paTrack = function (type, props) {
        const payload = JSON.stringify({ type, props: props || {}, vid: vid(), ua: ua() });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(PA_URL, new Blob([payload], { type: 'application/json' }));
        } else {
            fetch(PA_URL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
        }
    };

    // Auto-fire page_view on classic site pages
    if (window.location.pathname !== '/') {
        window.paTrack('page_view', { path: window.location.pathname });
    }
})();
