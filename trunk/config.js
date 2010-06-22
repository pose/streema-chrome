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

(function () {
    if ( typeof streema == 'undefined') {
        streema = {};
    }

    if ( !streema.config ) {
        streema.config = {};
    }
    
    streema.saveConfig = function () {
        localStorage['config'] = JSON.stringify(streema.config);
        chrome.extension.sendRequest({'method': 'refresh'});
    }

    streema.loadConfig = function () {
        streema.config = JSON.parse(localStorage['config']);
    }

    if ( !localStorage['config'] ) {
        streema.config['analytics.enabled'] = false;
        streema.config['analytics.account'] = 'UA-16445553-1';

        streema.config['playback.timeout'] = 15000;

        /* Notifications*/
        streema.config['notifications.timeout'] = 10000;
        streema.config['notifications.enabled'] = true;
    
        localStorage['config'] = JSON.stringify(streema.config);
    } else {
        streema.loadConfig()
    }

    console.log('config module loaded ok');
}());

