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



$ = function (id) { return document.getElementById(id); };

(function() {
        
    var background = chrome.extension.getBackgroundPage();
    var _gaq = background._gaq;
    streema = background.streema;
    var RADIO_TIMEOUT = streema.config['playback.timeout'];
    var popup = null; 

    if (chrome.extension.getViews()) {
        popup = chrome.extension.getViews().filter( function (e) {
            return e.location.href == chrome.extension.getURL('popup.html') 
        } );
        if ( popup.length > 0 )
            popup = popup[0]
    }

    var removeSelected = function () {
        var old = document.getElementsByClassName('selected')[0];
        if (typeof old != 'undefined' && old.removeAttribute)
            old.removeAttribute('class');
    }

    streema.player.updateStatus = function() {
        if (typeof popup != 'undefined' && popup.document) {
            console.log('updating status to ' + streema.player.status)
            popup.$('status').innerHTML = streema.player.status;
        }
    }

    streema.player.status =  streema.player.status || 'Click on a radio station above to start listening';

    streema.player.stop = function () {
        if ( window.event && window.event.preventDefault)
            window.event.preventDefault();

        chrome.extension.sendRequest({'method': 'clearTimer'});
        chrome.extension.sendRequest({'method': 'stop'});

        removeSelected()

        if ( streema.player.popup )
            streema.player.popup.close()

        streema.display('Stopped');
        // Google Analytics
        if ( streema.player.selectedRadio == null)
            return;
        var radio = streema.radios[streema.player.selectedRadio];
        if ( radio )
            _gaq.push(['_trackEvent', 'Radio ' + radio.name + ' [' + radio.id +']', 'stopped']);
    }

    streema.player.play = function(id) {
        if ( window.event && window.event.preventDefault)
            window.event.preventDefault();

        chrome.extension.sendRequest({'method': 'clearTimer'});
        //streema.player.stop();

        if (arguments.length == 0) {
            if ( !streema.player.selectedRadio)
                return;
            id = streema.player.selectedRadio;
        }
        removeSelected()
        if ( this &&  this.setAttribute )
            this.setAttribute('class','selected'); 
        streema.player.selectedRadio = id;
        var radio = streema.radios[id];
        var types = {'ram': 'audio/x-pn-realaudio'}
        var defaultType = 'application/x-mplayer2';
        var type = defaultType;
        console.log(JSON.stringify(radio))
        /* <embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" 
            version="VideoLAN.VLCPlugin.2" id="player" hidden="true" autoplay="off" 
            src="' + radio.streams[0].url +'" />
        */

        if ( streema.player.popup )
            streema.player.popup.close()

        background.document.body.innerHTML = ''

        if (radio.streams[0].type == 'html') {

	    streema.player.popup = window.open( radio.streams[0].url,
                radio.streams[0].name);
            if (window.focus) {newwindow.focus()}
        } else {
            if (navigator.appVersion.indexOf("Win")!=-1) {
                type = radio.streams[0].type in types ? types[radio.streams[0].type] : defaultType;
            }

            //text="audio/mpeg" is a hack for google chrome to play the file right
            background.document.body.innerHTML = sprintf(
                '<embed type="%s" id="player" src="%s" text="audio/mpeg" />', 
                type, radio.streams[0].url);

            if ( background.$('player').controls )
                background.$('player').controls.play();

        }
        chrome.extension.sendRequest({'method': 'play', 'when':RADIO_TIMEOUT});
        

        streema.player.updateStatus();
        // Google Analytics
        _gaq.push(['_trackEvent', 'Radio ' + radio.name + ' [' + radio.id +']', 'selected']);

    };   

    var oldStatus;
    var drawRadios = function(radios) {
            if ( typeof radios == 'undefined' ) {
                oldStatus = streema.player.status;
                streema.player.status = 'Loading radios from Streema...'
                streema.player.updateStatus();        
                if (!streema.radios) {
                    return;
                } 
                radios = streema.radios;
            } else {
                streema.player.status = oldStatus;
                streema.player.updateStatus();
            }

            streema.radios = radios.sort(function (a,b) {
                a = a.name.toLowerCase();
                b = b.name.toLowerCase();
                
                if (a < b){
                    return -1;
                } else if (a > b) {
                    return  1;
                } else {
                    return 0;
                }
            })

            $('radios').innerHTML = '<ul>' + streema.radios.map( function(radio, index){
                var klass = streema.player.selectedRadio != null && 
                    streema.player.selectedRadio == index ? 'selected' : '';
                
                return sprintf(
                    '<li class="%s" onclick="streema.player.play.call(this,%s); return false;">\
                        <a href="#">%s</a> | <span class="band">%s</span> \
                    </li>',
                    klass, index, radio.name, radio.country)

            }).join('\n') + '</ul>';
            var selected = document.getElementsByClassName('selected');
            if ( selected.length > 0 ) {
                selected[0].scrollIntoView(false);
            }
            
            if (streema.radios.length == 0) {

                streema.player.status = sprintf('<span class="error">%s \
                        <a href="http://streema.com/account/login" target="_blank">%s</a>%s\
                        </span>',
                    'No radios found, are you',
                    'logged in',
                    '?');
                streema.player.updateStatus();
            }
        _gaq.push(['_trackEvent', 'Streema icon', 'clicked']);
    }

    var renderRadios =  function() {
        if ( renderRadios.xhr.readyState == 4 ) {
            drawRadios(JSON.parse(renderRadios.xhr.responseText))
        }
    };

    drawRadios();
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = renderRadios;
    renderRadios.xhr = xhr;
    xhr.open('GET','http://streema.com/playlists?noCache=1272826630207', true);
    // Spawn another thread (or at least don't do the send)
    window.setTimeout(function () { xhr.send() } , 0)
}());

