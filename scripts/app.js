!function(e){"use strict";var n=e.querySelector("#app");n.displayInstalledToast=function(){e.querySelector("#caching-complete").show()},n.addEventListener("dom-change",function(){console.log("Our app is ready to rock!")}),window.addEventListener("WebComponentsReady",function(){function n(){e.querySelector("drawing-overlay").addObject(JSON.parse('{"type":"path","originX":"center","originY":"center","left":283.72,"top":175.56,"width":0.91,"height":0,"fill":null,"stroke":"red","strokeWidth":5,"strokeDashArray":null,"strokeLineCap":"round","strokeLineJoin":"round","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","path":[["M",283.265625,175.5625],["Q",283.265625,175.5625,283.765625,175.5625],["Q",284.265625,175.5625,284.015625,175.5625],["L",283.765625,175.5625]],"pathOffset":{"x":283.72273178118655,"y":175.5625}}')),t--,t>0&&setTimeout(n,5e3)}var o=(new Y.XMPP).join("video-drawing-demo");window.y=new Y(o);var a=!1;e.querySelector("#video1").addEventListener("loadedmetadata",function(n){o.whenSynced(function(){var n=function(n){var o=n.val();for(var t in o){var i=o[t].val();i.forEach(function(n){var o={time:t,type:"drawing",data:n};a=!0,e.querySelector("sevianno-video-controls").addAnnotation(o),a=!1})}n.observe(function(o){for(var t in o)if("add"===o[t].type){var i=n.val(o[t].name),r=o[t].name,l=i.val();if(!a)for(var d in l){var s={};s.time=r,s.type="drawing",s.data=JSON.parse(l[d]),a=!0,e.querySelector("sevianno-video-controls").addAnnotation(s),a=!1}i.observe(function(n){for(var o in n)if("insert"===n[o].type&&n[o].changedBy!==y._model.connector.user_id){var t=i.val(n[o].position),l={};l.time=r,l.type="drawing",l.data=JSON.parse(t),a=!0,e.querySelector("sevianno-video-controls").addAnnotation(l),a=!1}})}})};y.observe(function(e){for(var o in e)"annotations"===e[o].name&&n(e[o].object.val("annotations"))}),null==y.val("annotations")?y.val("annotations",new Y.Object):n(y.val("annotations"))})}),e.querySelector("sevianno-video-controls").addEventListener("sevianno-annotation-added",function(e){if(!a&&y._model.connector.is_synced){var n=e.detail.time,o=y.val("annotations").val(n);null==o?(a=!0,y.val("annotations").val(n,new Y.List([JSON.stringify(e.detail.data)])),a=!1):y.val("annotations").val(n).push(JSON.stringify(e.detail.data))}});var t=0;e.querySelector("#button10").addEventListener("tap",function(){t=2,n()})}),n.onMenuSelect=function(){var n=e.querySelector("#paperDrawerPanel");n.narrow&&n.closeDrawer()}}(document);