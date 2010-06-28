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

    var radiolist;

    var updateRadioList = function () {
        var xhr = new XMLHttpRequest();

        /* When we have loaded a previous radiolist we show it to the user 
        but we update on background */
        if ( radiolist !== undefined && (radiolist instanceof Array &&
            radiolist.length !== 0 )) {
            chrome.extension.sendRequest(
                {'method': 'radiolist.update', 
                'radios':JSON.stringify(radiolist)}
            );
        }

        xhr.onreadystatechange =  function() {
            if ( xhr.readyState == 4 ) {
                radiolist = JSON.parse(xhr.responseText);
                chrome.extension.sendRequest(
                    {'method': 'radiolist.update', 
                    'radios':JSON.stringify(radiolist)}
                );
            }
        };

        xhr.open('GET',
            'http://streema.com/playlists?noCache=1272826630207', 
            true);
        xhr.send();
    };

    var eNamed = streema.eventBus.addNamedListener;

    eNamed( 'ui.streemaIcon', updateRadioList);

    updateRadioList();
    console.log('radiolist module loaded ok');

}());
