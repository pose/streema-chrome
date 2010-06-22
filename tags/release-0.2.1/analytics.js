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

(function() {   
    var radio;
  
    if ( !streema.config['analytics.enabled'] ) {
        console.log('Analytics disabled');
        return;
     }

    var _gaq = _gaq || [];

     if ( !streema.config['analytics.account'] ) {
        throw new Error('Invalid Google Analytics account. \
                            Check your preferences' );
     }

     _gaq.push(['_setAccount',streema.config['analytics.account']]);
     _gaq.push(['_trackPageview']);

     (function() {
        var ga = document.createElement('script'); 
        ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; 
        s.parentNode.insertBefore(ga, s);
     })();

    if ( !streema || ! streema.eventBus ) {
        return;
    }

    var log = function (name, type) {
        console.log('Logging to Analytics: [' + name + ',' + type + ']');
        _gaq.push(['_trackEvent', name, type]);
    };

    var radioSerialize = function() {
        return 'Radio ' + radio.name + ' [' + radio.id +']';
    };

   streema.eventBus.addListener( function (data,sender,sendResponse) {
        if (data) {
            if ( data.method == 'play' ) {
                radio = JSON.parse(data.what)
                log(radioSerialize(), 'selected');
            } else if (data.method == 'stop' ) {
                log(radioSerialize(), 'stopped');
            } else if ( data.method == 'refresh' ) {
                streema.loadConfig()
            } else if ( data.method == 'streemaIcon' ) {
                log('Streema icon', 'clicked');
            } else if ( data.method == 'playbackError' ) {
                log(radioSerialize(), 'failed'); 
            } else if ( data.method == 'playbackNoCheck' ) {
                log(radioSerialize(), 'playing (but can\'t check)');
            } else if ( data.method == 'playbackChecked' ) {
                log(radioSerialize(), 'playing');
            }

        }
    
        sendResponse()
    });

    console.log('analytics module loaded ok')
}());

