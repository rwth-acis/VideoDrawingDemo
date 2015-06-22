/*
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(document) {
    'use strict';

    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');

    app.displayInstalledToast = function() {
        document.querySelector('#caching-complete').show();
    };

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function() {
        console.log('Our app is ready to rock!');
    });

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function() {
        // imports are loaded and elements have been registered

        // set up y-js framework
        //var connector = new Y.WebRTC("video-drawing-demo");
        var connector = new Y.XMPP().join('video-drawing-demo');
        window.y = new Y(connector);

        // this token makes sure that annotations that were just added to the drawing from a yjs object
        // are not immediately written back to yjs.
        var lockAddAnnotation = false;

        document.querySelector('#video1').addEventListener('loadedmetadata', function(e) {
            connector.whenSynced(function() {

                var setAnnotationsObserver = function(annotations) {
                    // show all already existing drawings
                    var annotationTimes = annotations.val();
                    for (var i in annotationTimes) {
                        var annotationObject = annotationTimes[i].val();

                        // observe any existing annotationObject
                        var time = i;
                        annotationTimes[i].observe(function(listEvents) {
                            for (var j in listEvents) {
                                if (listEvents[j].type === 'insert') {
                                    if (listEvents[j].changedBy !== y._model.connector.user_id) {
                                        var object = annotationTimes[i].val(listEvents[j].position);
                                        var annotation = {};
                                        annotation.time = time;
                                        annotation.type = 'drawing';
                                        annotation.data = JSON.parse(object);
                                        lockAddAnnotation = true;
                                        document.querySelector('sevianno-video-controls').addAnnotation(annotation);
                                        lockAddAnnotation = false;
                                    }
                                }
                            }
                        });

                        annotationObject.forEach(function(object) {
                            // make an annotation object out of it
                            var annotation = {'time':i,'type':'drawing','data':JSON.parse(object)};
                            lockAddAnnotation = true;
                            document.querySelector('sevianno-video-controls').addAnnotation(annotation);
                            lockAddAnnotation = false;
                        });

                    }

                    annotations.observe(function(events) {
                        for (var i in events) {
                            if (events[i].type === 'add') {
                                var annotationsList = annotations.val(events[i].name);
                                var time = events[i].name;

                                // add the existing objects of the list to the drawing
                                var objectsJSON = annotationsList.val();
                                if (!lockAddAnnotation) {
                                    for (var k in objectsJSON) {
                                        var annotation = {};
                                        annotation.time = time;
                                        annotation.type = 'drawing';
                                        annotation.data = JSON.parse(objectsJSON[k]);
                                        lockAddAnnotation = true;
                                        document.querySelector('sevianno-video-controls').addAnnotation(annotation);
                                        lockAddAnnotation = false;
                                    }
                                }


                                // add an observer to the list
                                annotationsList.observe(function(listEvents) {
                                    for (var j in listEvents) {
                                        if (listEvents[j].type === 'insert') {
                                            if (listEvents[j].changedBy !== y._model.connector.user_id) {
                                                var object = annotationsList.val(listEvents[j].position);
                                                var annotation = {};
                                                annotation.time = time;
                                                annotation.type = 'drawing';
                                                annotation.data = JSON.parse(object);
                                                lockAddAnnotation = true;
                                                document.querySelector('sevianno-video-controls').addAnnotation(annotation);
                                                lockAddAnnotation = false;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });

                };

                // observe the main y object
                y.observe(function(events) {
                    for (var i in events) {

                        // if the event is about the "annotations" object, set the annotations observer
                        if (events[i].name === 'annotations') {
                            setAnnotationsObserver(events[i].object.val('annotations'));
                        }

                    }
                });

                if (y.val('annotations') == null) {
                    y.val('annotations', new Y.Object());
                } else {
                    setAnnotationsObserver(y.val('annotations'));
                }

            });
        });

        document.querySelector('sevianno-video-controls').addEventListener('sevianno-annotation-added', function(annotation) {
            // check if there are annotations currently being added from yjs.
            if (!lockAddAnnotation) {
                if (y._model.connector.is_synced) {
                    var time = annotation.detail.time;
                    var objects = y.val('annotations').val(time);

                    if (objects == null) {
                        lockAddAnnotation = true;
                        y.val('annotations').val(time, new Y.List([JSON.stringify(annotation.detail.data)]));
                        lockAddAnnotation = false;
                    } else {
                        // drawing does already exist at this time
                        lockAddAnnotation = true;
                        y.val('annotations').val(time).push(JSON.stringify(annotation.detail.data));
                        lockAddAnnotation = false;
                    }
                }
            }

        });

        //// evaluation
        //
        //var objectsToSend = 25;
        //var object;
        //
        //document.querySelector('#buttonDot').addEventListener('tap', function() {
        //    object = JSON.parse('{"type":"path","originX":"center","originY":"center","left":283.72,"top":175.56,"width":0.91,"height":0,"fill":null,"stroke":"red","strokeWidth":5,"strokeDashArray":null,"strokeLineCap":"round","strokeLineJoin":"round","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","path":[["M",283.265625,175.5625],["Q",283.265625,175.5625,283.765625,175.5625],["Q",284.265625,175.5625,284.015625,175.5625],["L",283.765625,175.5625]],"pathOffset":{"x":283.72273178118655,"y":175.5625}}');
        //    sendObject();
        //});
        //
        //document.querySelector('#buttonSquare').addEventListener('tap', function() {
        //    object = JSON.parse('{"type":"path","originX":"center","originY":"center","left":151.89,"top":248.56,"width":201.75,"height":192,"fill":null,"stroke":"red","strokeWidth":5,"strokeDashArray":null,"strokeLineCap":"round","strokeLineJoin":"round","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","path":[["M",144.265625,152.5625],["Q",144.265625,152.5625,144.765625,152.5625],["Q",145.265625,152.5625,144.515625,153.0625],["Q",143.765625,153.5625,143.265625,154.0625],["Q",142.765625,154.5625,140.265625,157.0625],["Q",137.765625,159.5625,135.265625,162.5625],["Q",132.765625,165.5625,129.265625,169.0625],["Q",125.765625,172.5625,122.765625,176.5625],["Q",119.765625,180.5625,116.765625,185.0625],["Q",113.765625,189.5625,111.265625,193.0625],["Q",108.765625,196.5625,106.765625,200.5625],["Q",104.765625,204.5625,102.765625,208.0625],["Q",100.765625,211.5625,99.765625,213.0625],["Q",98.765625,214.5625,97.265625,217.5625],["Q",95.765625,220.5625,93.265625,224.5625],["Q",90.765625,228.5625,89.765625,230.5625],["Q",88.765625,232.5625,87.765625,234.0625],["Q",86.765625,235.5625,85.765625,237.0625],["Q",84.765625,238.5625,83.765625,240.0625],["Q",82.765625,241.5625,81.765625,242.5625],["Q",80.765625,243.5625,80.265625,244.5625],["Q",79.765625,245.5625,78.765625,246.5625],["Q",77.765625,247.5625,77.265625,249.0625],["Q",76.765625,250.5625,76.265625,251.5625],["Q",75.765625,252.5625,74.765625,254.0625],["Q",73.765625,255.5625,72.765625,256.5625],["Q",71.765625,257.5625,69.265625,261.0625],["Q",66.765625,264.5625,66.265625,265.5625],["Q",65.765625,266.5625,64.765625,267.5625],["Q",63.765625,268.5625,63.265625,270.0625],["Q",62.765625,271.5625,62.265625,272.5625],["Q",61.765625,273.5625,60.765625,275.0625],["Q",59.765625,276.5625,58.765625,278.5625],["Q",57.765625,280.5625,57.265625,281.5625],["Q",56.765625,282.5625,56.265625,283.5625],["Q",55.765625,284.5625,55.265625,285.5625],["Q",54.765625,286.5625,54.265625,287.0625],["Q",53.765625,287.5625,53.265625,289.5625],["Q",52.765625,291.5625,52.265625,293.0625],["Q",51.765625,294.5625,51.265625,295.5625],["Q",50.765625,296.5625,53.765625,297.0625],["Q",56.765625,297.5625,57.765625,298.0625],["Q",58.765625,298.5625,61.265625,299.0625],["Q",63.765625,299.5625,64.765625,299.5625],["Q",65.765625,299.5625,70.265625,300.0625],["Q",74.765625,300.5625,78.765625,302.5625],["Q",82.765625,304.5625,84.765625,305.0625],["Q",86.765625,305.5625,88.265625,306.5625],["Q",89.765625,307.5625,91.265625,308.0625],["Q",92.765625,308.5625,94.265625,309.5625],["Q",95.765625,310.5625,98.765625,312.0625],["Q",101.765625,313.5625,107.765625,316.0625],["Q",113.765625,318.5625,115.765625,319.5625],["Q",117.765625,320.5625,122.765625,322.5625],["Q",127.765625,324.5625,131.765625,325.5625],["Q",135.765625,326.5625,140.265625,328.0625],["Q",144.765625,329.5625,148.765625,331.0625],["Q",152.765625,332.5625,157.765625,334.0625],["Q",162.765625,335.5625,167.265625,336.5625],["Q",171.765625,337.5625,174.765625,337.5625],["Q",177.765625,337.5625,182.765625,338.0625],["Q",187.765625,338.5625,191.265625,339.5625],["Q",194.765625,340.5625,197.765625,341.0625],["Q",200.765625,341.5625,202.265625,342.0625],["Q",203.765625,342.5625,205.265625,343.0625],["Q",206.765625,343.5625,207.765625,343.5625],["Q",208.765625,343.5625,209.765625,344.0625],["Q",210.765625,344.5625,211.765625,344.5625],["Q",212.765625,344.5625,213.265625,344.5625],["Q",213.765625,344.5625,214.265625,344.5625],["Q",214.765625,344.5625,214.765625,343.0625],["Q",214.765625,341.5625,214.765625,339.5625],["Q",214.765625,337.5625,215.265625,336.5625],["Q",215.765625,335.5625,216.265625,332.0625],["Q",216.765625,328.5625,217.765625,325.0625],["Q",218.765625,321.5625,219.265625,318.5625],["Q",219.765625,315.5625,219.765625,312.0625],["Q",219.765625,308.5625,220.265625,305.0625],["Q",220.765625,301.5625,221.265625,299.5625],["Q",221.765625,297.5625,222.265625,294.5625],["Q",222.765625,291.5625,223.765625,288.0625],["Q",224.765625,284.5625,225.265625,282.5625],["Q",225.765625,280.5625,226.265625,278.0625],["Q",226.765625,275.5625,227.265625,274.0625],["Q",227.765625,272.5625,228.265625,270.0625],["Q",228.765625,267.5625,229.265625,266.0625],["Q",229.765625,264.5625,230.765625,263.0625],["Q",231.765625,261.5625,231.765625,259.0625],["Q",231.765625,256.5625,232.265625,254.5625],["Q",232.765625,252.5625,233.265625,251.0625],["Q",233.765625,249.5625,234.265625,246.5625],["Q",234.765625,243.5625,235.265625,240.0625],["Q",235.765625,236.5625,235.765625,233.0625],["Q",235.765625,229.5625,236.265625,227.0625],["Q",236.765625,224.5625,236.765625,221.0625],["Q",236.765625,217.5625,237.265625,215.0625],["Q",237.765625,212.5625,238.265625,211.0625],["Q",238.765625,209.5625,238.765625,207.5625],["Q",238.765625,205.5625,239.265625,204.5625],["Q",239.765625,203.5625,240.265625,202.0625],["Q",240.765625,200.5625,240.765625,200.0625],["Q",240.765625,199.5625,241.265625,198.0625],["Q",241.765625,196.5625,242.265625,195.0625],["Q",242.765625,193.5625,243.265625,192.0625],["Q",243.765625,190.5625,244.265625,189.5625],["Q",244.765625,188.5625,245.765625,187.0625],["Q",246.765625,185.5625,247.265625,183.5625],["Q",247.765625,181.5625,248.265625,180.0625],["Q",248.765625,178.5625,249.265625,177.5625],["Q",249.765625,176.5625,250.265625,175.5625],["Q",250.765625,174.5625,250.765625,174.0625],["Q",250.765625,173.5625,251.265625,173.0625],["Q",251.765625,172.5625,251.765625,172.0625],["Q",251.765625,171.5625,252.265625,171.0625],["Q",252.765625,170.5625,252.765625,170.0625],["Q",252.765625,169.5625,248.765625,169.0625],["Q",244.765625,168.5625,243.265625,168.5625],["Q",241.765625,168.5625,238.765625,168.0625],["Q",235.765625,167.5625,228.765625,166.0625],["Q",221.765625,164.5625,216.765625,164.0625],["Q",211.765625,163.5625,207.265625,163.0625],["Q",202.765625,162.5625,200.765625,162.0625],["Q",198.765625,161.5625,196.265625,161.5625],["Q",193.765625,161.5625,191.765625,160.5625],["Q",189.765625,159.5625,186.765625,159.5625],["Q",183.765625,159.5625,181.265625,159.0625],["Q",178.765625,158.5625,176.265625,158.5625],["Q",173.765625,158.5625,172.265625,158.0625],["Q",170.765625,157.5625,169.765625,157.5625],["Q",168.765625,157.5625,168.265625,157.5625],["Q",167.765625,157.5625,166.265625,157.5625],["Q",164.765625,157.5625,163.265625,157.0625],["Q",161.765625,156.5625,160.765625,156.5625],["Q",159.765625,156.5625,158.265625,156.5625],["Q",156.765625,156.5625,154.765625,156.0625],["Q",152.765625,155.5625,151.265625,155.5625],["Q",149.765625,155.5625,148.765625,155.5625],["Q",147.765625,155.5625,146.765625,155.5625],["Q",145.765625,155.5625,144.265625,155.0625],["Q",142.765625,154.5625,141.265625,154.5625],["Q",139.765625,154.5625,138.765625,154.0625],["Q",137.765625,153.5625,137.265625,153.5625],["Q",136.765625,153.5625,136.265625,153.5625],["L",135.765625,153.5625]],"pathOffset":{"x":151.89168623086601,"y":248.5625}}');
        //    sendObject();
        //});
        //
        //function sendObject() {
        //    document.querySelector('drawing-overlay').addObject(object);
        //    objectsToSend--;
        //
        //    if (objectsToSend > 0) {
        //        setTimeout(sendObject.bind(this), 4000);
        //    }
        //}

    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onMenuSelect = function() {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

})(document);
