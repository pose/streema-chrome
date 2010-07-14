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

(function () {


    var MINUTES_BETWEEN_SONG_INFO = streema.config['songinfo.check_every'],
    eNamed = streema.eventBus.addNamedListener, songInfo, radio, timer,
    updateSongInfo = function () {
        
        if ( !streema.config['songinfo.enabled'] ) {
            return;
        }

        if ( !radio ) {
            return;
        }
        var newSongInfo, xhr = new XMLHttpRequest();
        xhr.onreadystatechange =  function() {
            if ( xhr.readyState === 4 ) {
                console.log(xhr.responseText);
                newSongInfo = JSON.parse(xhr.responseText);

                /* New radio does not provide song info, so we need to
                hide the previous song name */
                if ( newSongInfo === undefined) {
                    songInfo = undefined;
                    return;
                }

                /* Also, as this radio does not support song info suspend
                the song name polling */
                if ( newSongInfo.data === undefined  ||
                    newSongInfo.data.song === undefined) {
                    clearInterval(timer);
                    return;
                }

                /* Has the songInfo changed? */
                if (  !songInfo ||
                    JSON.stringify(songInfo.data) !== 
                    JSON.stringify(newSongInfo.data)  ) {

                    songInfo = newSongInfo;
                    streema.eventBus.sendRequest(
                        {'method': 'song.update', 
                        'info': JSON.stringify(songInfo.data)}
                    );
                    console.log(sprintf('Playing %s by %s', 
                            songInfo.data.song, 
                            songInfo.data.artist) );
                }
            }
        };

        xhr.open('GET',sprintf(
            'http://streema.com/radios/metadata/%d?noCache=1277389681591', 
            radio.id), 
            true);
        xhr.send();
    };

    eNamed('player.playing', updateSongInfo);

    eNamed('song.checkSong', updateSongInfo);

    eNamed('ui.play', function (data) {
        if ( timer !== undefined ) {
            clearInterval(timer);
        }
        if ( !streema.config['songinfo.enabled'] ) {
            return;
        }
        radio = JSON.parse(data.what);
        songInfo = undefined;
        timer = setInterval(function () { 
            streema.eventBus.sendRequest({'method': 'song.checkSong'});
        } , 1000 * 60 * MINUTES_BETWEEN_SONG_INFO);
    });

    eNamed('ui.stop', function() {
        if (timer !== undefined) {
            clearInterval(timer);
        }
    });
    
    eNamed('player.error', function() {
        clearInterval(timer);
    });

    updateSongInfo();

    console.log('songinfo module loaded ok');

}());
