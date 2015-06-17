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
        //var connector = new Y.WebRTC("video-drawing-demo2");
        var connector = new Y.XMPP().join("video-drawing-demo2");
        window.y = new Y(connector);

        // this token makes sure that annotations that were just added to the drawing from a yjs object
        // are not immediately written back to yjs.
        var lockAddAnnotation = false;

        document.querySelector("#video1").addEventListener("loadedmetadata", function(e) {
            connector.whenSynced(function() {

                var setAnnotationsObserver = function(annotations) {
                    // show all already existing drawings
                    var annotationTimes = annotations.val();
                    for (var i in annotationTimes) {
                        var annotationObject = annotationTimes[i].val();
                        annotationObject.forEach(function(object) {
                            // make an annotation object out of it
                            var annotation = {"time":i,"type":"drawing","data":object};
                            document.querySelector("sevianno-video-controls").addAnnotation(annotation);
                        });

                    }

                    annotations.observe(function(events) {
                        for (var i in events) {
                            if (events[i].type === "add") {
                                var annotationsList = annotations.val(events[i].name);
                                var time = events[i].name;

                                // add the existing objects of the list to the drawing
                                var objectsJSON = annotationsList.val();
                                for (var k in objectsJSON) {
                                    var annotation = {};
                                    annotation.time = time;
                                    annotation.type = "drawing";
                                    annotation.data = JSON.parse(objectsJSON[k]);
                                    document.querySelector("sevianno-video-controls").addAnnotation(annotation);
                                }

                                // add an observer to the list
                                annotationsList.observe(function(listEvents) {
                                    for (var j in listEvents) {
                                        if (listEvents[j].type === "insert") {
                                            if (listEvents[j].changedBy !== y._model.connector.user_id) {
                                                console.log("Observed insert!");

                                                var object = annotationsList.val(listEvents[j].position);
                                                var annotation = {};
                                                annotation.time = time;
                                                annotation.type = "drawing";
                                                annotation.data = JSON.parse(object);
                                                lockAddAnnotation = true;
                                                document.querySelector("sevianno-video-controls").addAnnotation(annotation);
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
                        if (events[i].name === "annotations") {
                            setAnnotationsObserver(events[i].object.val("annotations"));
                        }

                    }
                });

                if (y.val("annotations") == null) {
                    y.val("annotations", new Y.Object());
                } else {
                    setAnnotationsObserver(y.val("annotations"));
                }

            });
        });

        document.querySelector("sevianno-video-controls").addEventListener("sevianno-annotation-added", function(annotation) {
            // check if there are annotations currently being added from yjs.
            if (!lockAddAnnotation) {
                console.log("inserting annotation");

                if (y._model.connector.is_synced) {
                    var time = annotation.detail.time;
                    var objects = y.val("annotations").val(time);

                    if (objects == null) {
                        y.val("annotations").val(time, new Y.List([JSON.stringify(annotation.detail.data)]));
                    } else {
                        // drawing does already exist at this time
                        y.val("annotations").val(time).push(JSON.stringify(annotation.detail.data));
                    }
                }
            }

        });

    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onMenuSelect = function() {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

})(document);
