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


$ = function(s) { return document.getElementById(s) }
    
var background = chrome.extension.getBackgroundPage();

    if ( typeof streema == 'undefined' ) {
        throw new Error('config.js must be loaded first')
    }
    streema.player = streema.player || {};
    streema.radios = streema.radio || [];
    streema.player.selectedRadio = null;

    streema.display = function (msg, badge) {
        badge = badge || '';
        chrome.browserAction.setBadgeText({text: badge});
        streema.player.status = currentRadio(msg);
        chrome.browserAction.setTitle({title: msg});
        streema.player.updateStatus();

        streema.display.status = {title: msg, 
            body: currentRadio(msg) || badge };
        
        if ( !streema.config['notifications.enable'] ) {
            return;
        }

        // create an HTML notification:
        if (streema.display.notification) {
            streema.display.notification.cancel();
        }
            

        streema.display.notification = webkitNotifications.createHTMLNotification(
          'notification.html'  // html url - can be relative
        );

        // Then show the notification.
        streema.display.notification.show();

    }

    var currentRadio = function (prefix, text) {
        if ( typeof streema.player.selectedRadio == 'undefined' || 
            streema.player.selectedRadio === null ) {
            return '';
        }

        if ( text )
            return sprintf('%s %s', prefix, streema.radios[streema.player.selectedRadio].name)

        return sprintf('%s <a href="%s" target="_blank">%s</a>',
                    prefix,
                    'http://streema.com' + 
                    streema.radios[streema.player.selectedRadio].spotUrl,
                    streema.radios[streema.player.selectedRadio].name);
    }


    streema.player.error = function () {
        console.log('updating status')

        //streema.player.selectedRadio = null;
        streema.display('Currently not working ', '!');
        
        if (typeof popup != 'undefined') {
            console.log('popup is present')
            if (popup.document) {
                console.log('popup.document is present')
                var elem = popup.document.getElementsByClassName('selected')[0];
                elem.setAttribute('class', 'error');
            }
        } else {
            console.log('popup is not present')
        }

        chrome.extension.getBackgroundPage().document.body.innerHTML = ''; 
        // Google Analytics
        var radio = streema.radios[streema.player.selectedRadio];
        _gaq.push(['_trackEvent', 'Radio ' + radio.name + ' [' + radio.id + ']', 'failed']);
    }

    streema.player.playTimeout = function () {
        var state;
        console.log('Entering playTimeout')
        if ( !background.$('player') || (!background.$('player').playState && navigator.appVersion.indexOf("Win")!=-1)) {
            console.log('Passed timeout check :)! with state: ' +  state);

            streema.display('Playing')
            // Google Analytics
            var radio = streema.radios[streema.player.selectedRadio];
            _gaq.push(['_trackEvent', 'Radio ' + radio.name + ' [' + radio.id + ']', 'playing (but can\'t check)']);
            return;
        }

        state = background.$('player').playState
        if ( state  != 3 ) {
            console.log('Play timeout, state:' + state );
            streema.player.error();
        } else {
            console.log('Passed timeout check :)! with state: ' +  state);

            streema.display('Playing')
            // Google Analytics
            var radio = streema.radios[streema.player.selectedRadio];
            _gaq.push(['_trackEvent', 'Radio ' + radio.name + ' [' + radio.id + ']', 'playing']);
        }
    }

chrome.extension.onRequest.addListener( function (data,sender,sendResponse) {
    if (data) {
        if ( data.method == 'play' ) {
            console.log('Setting timeout')
            streema.player.timeout = setTimeout ( 'streema.player.playTimeout()', data.when )

            streema.display('Buffering')
        } else if ( data.method == 'clearTimer') {
            clearTimeout(streema.player.timeout)
        } else if ( data.method == 'stop') {
           document.body.innerHTML = '' ;
        } else if ( data.method == 'refresh' ) {
            streema.loadConfig()
        }
    }
    sendResponse()
} )
