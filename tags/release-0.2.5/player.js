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

/*global window streema ST chrome*/

window.addEventListener('load', function () {

    var eNamed = streema.eventBus.addNamedListener, selectedRadio,
    player = new ST.player.Player(document.getElementById('player')),
    failed;
    
    ST.player.flash.SWF_PATH = 'http://streema.com/static/flash/player.swf';
    //ST.player.flash.PLAYLIST_PROXY_URL_TPL="http://streema.com/proxy/playlist/{sid}";
    
    eNamed( 'ui.play', function (data) {
        if (failed) {
            streema.eventBus.sendRequest({'method': 'player.streema.stop'});
        }
        
        var radio = data.what, result, st;

        failed = false;

        selectedRadio = JSON.parse(radio);
        console.log('Sending to streema player: ' + JSON.stringify(selectedRadio));
        result = player.open(selectedRadio);
        
        if ( result.playable ) {
            player.play();
        }
        console.log(selectedRadio.name + ' is playable by Streema? ' + (result.playable ? 'yes': 'no :('));

        st = player.getState();

        if ( !result.playable || (st !== ST.player.api.states.STATE_CONNECTING &&
            st !== ST.player.api.states.STATE_BUFFERING &&
            st !== ST.player.api.states.STATE_PLAYING) ) {
            console.log('Can\'t play radio ' + selectedRadio.name + 
                ' with streema player.');
            failed = true;
            player.stop();
            streema.eventBus.sendRequest({'method': 'player.streema.error'});
            return;
        }
       
        setTimeout( function () {
            streema.eventBus.sendRequest({'method': 'player.playing',
                'status': 'ok'});
            }, data.timeout);

    });
    
    eNamed('ui.stop', function () {
        player.stop();
        if ( failed ) {
            streema.eventBus.sendRequest({'method': 'player.streema.stop'});
        }
    });

    eNamed('ui.streemaIcon', function () {
        chrome.extension.sendRequest({'method': 'player.currentRadio',
                'id': selectedRadio ? selectedRadio.id : undefined});
    });

    chrome.extension.onRequest.addListener( 
        function (data,sender,sendResponse) {
            streema.eventBus.sendRequest(data);
        }
    );

    console.log('player adapter loaded ok');

}, true);
