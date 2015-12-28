---
    layout: null
---

/**
 * 页面ready方法
 */
$(document).ready(function() {
    duoshuo();
});

var duoshuoQuery = {short_name:"{{ site.duoshuo }}"};
function duoshuo(){
    var ds = document.createElement('script');
    ds.type = 'text/javascript';ds.async = true;
    ds.src = 'http://static.duoshuo.com/embed.js';
    ds.charset = 'UTF-8';
    document.getElementsByTagName("script")[0].parentNode.appendChild(ds);
}



