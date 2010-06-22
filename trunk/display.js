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

    var selectedRadio;
    
    var currentRadio = function (prefix, text) {
        if ( typeof selectedRadio == 'undefined' || 
            selectedRadio === null ) {
            return '';
        }

        if ( text ) {
            return sprintf('%s %s', prefix, selectedRadio.name)
        }

        return sprintf('%s <a href="%s" target="_blank">%s</a>',
                    prefix,
                    'http://streema.com' + 
                    selectedRadio.spotUrl,
                    selectedRadio.name);
    }

    var notification;

    var stat = 'Ready. Click on a radio station above to start listening'; 

    var display = function (msg, badge, statP) {
        console.log('Displaying: ' + msg + ' ' + badge)
        badge = badge || '';
        stat = statP || currentRadio(msg) || stat;
        chrome.browserAction.setBadgeText({text: badge});
        chrome.extension.sendRequest({'method': 'status', 
                                        'stat': stat})
        chrome.browserAction.setTitle({title: msg});

        var body = currentRadio(msg) || badge;
        
        if ( !streema.config['notifications.enabled'] ) {
            return;
        }

        // create an HTML notification:
        if (notification) {
            notification.cancel();
        }
            

        notification = webkitNotifications.createHTMLNotification(
          'notification.html'  // html url - can be relative
        );

        notification.ondisplay = function () {
            chrome.extension.sendRequest({'method': 'notification', 
                                        'title': msg,
                                        'body': body});
        }
        
        // Then show the notification.
        notification.show();
    }

    streema.eventBus.addListener( function (data,sender,sendResponse) {
        if (data) {

            if ( data.method == 'playbackNoCheck' ) {
                display('Playing');
            } else if ( data.method == 'playbackError' ) {
                display('Currently not working ', '!'); 
            } else if ( data.method == 'playbackChecked' ) {
                display('Playing');
            } else if ( data.method == 'play' ) {
                selectedRadio = JSON.parse(data.what)
                display('Buffering');
            } else if ( data.method == 'stop' ) {
                display('Stopped');
            } else if ( data.method == 'refresh' ) {
                streema.loadConfig()
            } else if ( data.method == 'streemaIcon' ) {
                chrome.extension.sendRequest({'method': 'status', 
                'stat': stat});
            } else if ( data.method == 'emptyRadioList' ) {
                display('No radios found, are you logged in?', '?',
                    sprintf(
                    '<span class="error">%s \
        <a href="http://streema.com/account/login" target="_blank">%s</a>%s\
                        </span>',
                    'No radios found, are you',
                    'logged in',
                    '?'));
            }
        }
    
        sendResponse()
    });

    console.log('display module loaded ok')

}());
