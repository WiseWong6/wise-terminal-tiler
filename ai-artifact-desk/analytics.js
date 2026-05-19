/* global document, location, window */

(function() {
  'use strict';

  var BAIDU_ANALYTICS_ID = '832c0aa63fe65c887a71252c4c0494aa';
  var GA_MEASUREMENT_ID = 'G-0GYD7FWX66';

  function appendScript(src, attrs) {
    if (!src || document.querySelector('script[src="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    Object.keys(attrs || {}).forEach(function(key) {
      if (attrs[key] === true) {
        script.setAttribute(key, '');
      } else if (attrs[key] !== false && attrs[key] != null) {
        script.setAttribute(key, attrs[key]);
      }
    });
    document.head.appendChild(script);
  }

  function shouldLoadAnalytics() {
    if (window.self !== window.top) return false;
    if (location.protocol === 'file:') return false;
    return true;
  }

  function loadAnalytics() {
    if (!shouldLoadAnalytics() || window.__MIXED_PREVIEW_ANALYTICS_LOADED__) return;
    window.__MIXED_PREVIEW_ANALYTICS_LOADED__ = true;

    window._hmt = window._hmt || [];
    appendScript('https://hm.baidu.com/hm.js?' + BAIDU_ANALYTICS_ID, { async: true });

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
    appendScript('https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID, { async: true });
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
  } else {
    window.setTimeout(loadAnalytics, 1200);
  }
})();
