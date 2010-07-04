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

/*global streema sprintf*/

var $ = function (s) {
    return document.getElementById(s); 
};

(function () {
    if ( typeof streema === 'undefined' ) {
        throw new Error('config.js must be loaded first');
    }
    streema.player = streema.player || {};
    var selectedRadio, timeout, popup,
        eNamed = streema.eventBus.addNamedListener, type;

    streema.player.playTimeout = function () {
        var state;
        if ( !$('handle') || (!$('handle').playState && 
                navigator.appVersion.indexOf("Win") !== -1)) {
            console.log('Passed timeout check :)! with state: ' +  state);

            streema.eventBus.sendRequest({'method': 'player.playing', 
                                        'status': 'noCheck'});
            return;
        }

        state = $('handle').playState;
        if ( state  !== 3 ) {
            console.log('Play timeout, state:' + state );
        
            $('player').innerHTML = ''; 
            streema.eventBus.sendRequest({'method': 'player.error'});
        } else {
            console.log('Passed timeout check :)! with state: ' +  state);

            streema.eventBus.sendRequest({'method': 'player.playing', 
                                        'status': 'ok'});
        }
    };
/*
    chrome.extension.onRequest.addListener( 
        function (data,sender,sendResponse) {
            streema.eventBus.sendRequest(data);
        }
    );*/

    eNamed( 'ui.play', function (data) {
        clearTimeout(streema.player.timeout);

        var radio = data.what, types = {'ram': 'audio/x-pn-realaudio'},
            defaultType = 'application/x-mplayer2';
        selectedRadio = JSON.parse(radio);
        type = defaultType;
        //console.log(radio)
       /* <embed type="application/x-vlc-plugin" 
                    pluginspage="http://www.videolan.org" 
                    version="VideoLAN.VLCPlugin.2" id="player" 
                    hidden="true" autoplay="off" 
                    src="' + radio.streams[0].url +'" />
        */

        if ( popup ) {
            popup.close();
        }

        $('player').innerHTML = '';

        if (navigator.appVersion.indexOf("Win")!==-1) {
            type = selectedRadio.streams[0].type in types ? 
                types[selectedRadio.streams[0].type] : defaultType;
        }
    });

    eNamed( 'player.streema.error', function (data) {
        // text="audio/mpeg" is a hack for google chrome to play 
        // the file right
        $('player').innerHTML = sprintf(
            '<embed type="%s" id="handle" src="%s" text="audio/mpeg" />', 
            type, selectedRadio.streams[0].url);

        if ( $('handle').controls ) {
            $('handle').controls.play();
        }

        console.log('Setting timeout');
        timeout = setTimeout ( 
            'streema.player.playTimeout()', data.timeout );
        console.log('setting buffering');

    });

    eNamed('player.streema.stop', function () {
        clearTimeout(timeout);

         if ( popup ) {
            popup.close()
        }

       $('player').innerHTML = '' ;
    });

/*    eNamed('ui.streemaIcon', function () {
        chrome.extension.sendRequest({'method': 'player.currentRadio',
                'id': selectedRadio ? selectedRadio.id : undefined});
    });*/

    console.log('background module loaded ok');

}());
