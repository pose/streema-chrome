// Copyright (c) 2010, Alberto Pose. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without 
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright notice, 
//   this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation 
//   and/or other materials provided with the distribution.
//   * Neither the name of Streema nor the names of its contributors 
//   may be used to endorse or promote products derived from this software 
//   without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/*global chrome*/
var streema;


if ( typeof chrome == 'undefined' && typeof require != 'undefined' ) {
    var chrome = {};
    streema = {};
    var configListeners = [];
    streema.loadConfig = function () {
        configListeners.forEach(function (l) {
            l();
        });
    };
}

(function() {

    if ( typeof streema === 'undefined') {
        streema = {};
    }

    streema.eventBus = {};

    var listeners = [];

    streema.eventBus.addListener = function (f) {
        listeners.push(f);
    };

    streema.eventBus.addChromeNamedListener = function (name,f) {
        chrome.extension.onRequest.addListener(
            function (data,sender,sendResponse) {
            if ( data && data.method === name  ) {
                f(data,sender,sendResponse);
            }
        });
    };

    streema.eventBus.addNamedListener = function (name, f) {
        listeners.push(function (data,sender,sendResponse) {
            if ( data && data.method === name ) {
                    f(data,sender,sendResponse);
                }
        });
    };

    streema.eventBus.sendRequest = function(d) {
        listeners.forEach( function (listener) {
            listener(d, null, function() {});
        });
    };

    // Add config refresh event to all listeners
    streema.eventBus.addNamedListener('config.refresh', streema.loadConfig);

    console.log('event module loaded ok');

    if ( typeof exports != 'undefined' ) {
        streema.test = {};
        streema.test.chrome = function (value) {
            if ( arguments.length > 0 ) {
                chrome = value;
                return;
            }
            return chrome;
        };
        
        streema.test.addConfigListener = function (f) {
            configListeners.push(f);
        };

        module.exports = streema;
    }


}());
