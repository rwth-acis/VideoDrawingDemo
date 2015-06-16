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
        var connector = new Y.XMPP().join("video-drawing-demo");
        var y = new Y(connector);

        document.querySelector("#video1").addEventListener("loadedmetadata", function(e) {
            connector.whenSynced(function() {
                var setAnnotationsObserver = function(annotations) {
                    // show all already existing drawings
                    var annotationList = annotations.val();
                    for (var i in annotationList) {
                        var annotation = annotationList[i];
                        document.querySelector("sevianno-video-controls").addAnnotation(annotation);
                    }

                    annotations.observe(function(events) {
                        for (var i in events) {
                            if (events[i].type === "insert") {
                                if (events[i].changedBy !== y._model.connector.user_id) {
                                    console.log("Observed insert!");
                                    var annotation = JSON.parse(y.val("annotations").val(events[i].position));
                                    document.querySelector("sevianno-video-controls").addAnnotation(annotation);
                                }
                            }
                        }
                    });
                };

                y.observe(function(events) {
                    for (var i in events) {
                        if (events[i].name === "annotations") {
                            setAnnotationsObserver(events[i].object);
                        }
                    }
                });

                if (y.val("annotations") == null) {
                    y.val("annotations", new Y.List());
                } else {
                    setAnnotationsObserver(y.val("annotations"));
                }

            });
        });

        document.querySelector("sevianno-video-controls").addEventListener("sevianno-annotation-added", function(annotation) {
            console.log("inserting annotation");
            var annotationsList = y.val("annotations");
            annotationsList.push(JSON.stringify(annotation.detail));
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
