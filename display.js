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
    var eNamed = streema.eventBus.addNamedListener; 
    
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

    var betterDisplay = function(d) {
        if ( 'badge' in d ) {
            chrome.browserAction.setBadgeText({text: d.badge});
        }

        if ( 'title' in d ) {
            chrome.browserAction.setTitle({title: d.title});
        }

        if ('state' in d) {
            chrome.extension.sendRequest({'method': 'display.status', 
                                        'stat': d.state})
        }

        if ('notification' in d) {
            if (notification) {
                notification.cancel();
            }

            notification = webkitNotifications.createHTMLNotification(
                'notification.html#title=' + escape(d.notification.title) + 
                '&' + 'body=' + escape(d.notification.body)  
            // html url - can be relative
            );
        
            // Then show the notification.
            notification.show();
        
        }
    };

    var display = function (msg, badge, statP) {
        console.log('Displaying: ' + msg + ' ' + badge)
        badge = badge || '';
        stat = statP || currentRadio(msg) || stat;
        chrome.browserAction.setBadgeText({text: badge});
        chrome.extension.sendRequest({'method': 'display.status', 
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
            'notification.html#title=' + escape(msg) + '&' + 
            'body=' + escape(body)  
          // html url - can be relative
        );
        
        // Then show the notification.
        notification.show();
    }

    eNamed('player.error', function() {
        display('Currently not working ', '!'); 
    });
    
    eNamed('ui.play', function(data) {
        selectedRadio = JSON.parse(data.what)
        display('Playing');
    });
    
    eNamed('ui.stop', function() {
        display('Stopped');
    });
    
    eNamed('ui.streemaIcon', function() {
        chrome.extension.sendRequest({'method': 'display.status', 
            'stat': stat});
        betterDisplay({'badge': ''});
    });
    
    eNamed('song.update', function(data) {
        var songInfo = JSON.parse(data.info);
        betterDisplay({'notification': { 
            'title':  songInfo.song,
            'body': 'by ' + songInfo.artist}});
    });

    eNamed('ui.emptyRadioList', function() {
        var loggedIn = sprintf('<span class="error">%s \
        <a href="http://streema.com/account/login" target="_blank">%s</a> \
    %s<a href="http://streema.com/account/register" target="_blank">%s</a>%s\
        </span>',
            'Please  ',
            'log in',
            ' or ',
            'register',
            ', it is fast and free!');
        betterDisplay({'badge': '?',
            'title': 'Are you logged in?',
            'state': loggedIn,
            'notification': {'title': 'No radios found',
            'body': loggedIn}});

    });
    
    console.log('display module loaded ok')

}());
