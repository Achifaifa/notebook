// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
    "use strict";
    var termjs = require('termjs');
    
    exports.make_terminal = function(element, size, ws_url) {
        var ws = new WebSocket(ws_url);
        termjs.Terminal.brokenBold = true;
        var term = new termjs.Terminal({
          cols: size.cols,
          rows: size.rows,
          screenKeys: false,
          useStyle: false
        });
        ws.onopen = function(event) {
            ws.send(JSON.stringify(["set_size", size.rows, size.cols,
                                        window.innerHeight, window.innerWidth]));
            term.on('data', function(data) {
                ws.send(JSON.stringify(['stdin', data]));
            });
            
            term.on('title', function(title) {
                document.title = title;
            });
            
            term.open(element);
            
            ws.onmessage = function(event) {
                var json_msg = JSON.parse(event.data);
                switch(json_msg[0]) {
                    case "stdout":
                        term.write(json_msg[1]);
                        break;
                    case "disconnect":
                        term.write("\r\n\r\n[CLOSED]\r\n");
                        break;
                }
            };
        };
        return {socket: ws, term: term};
    }
