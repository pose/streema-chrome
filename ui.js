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

/*global window streema chrome sprintf*/

window.addEventListener('load',function() {
        
    var $ = function (id) { 
        return document.getElementById(id); 
    },radios = [], selectedRadioId, ui = {}, config = streema.config, 
    RADIO_TIMEOUT = config['playback.timeout'], gotRadios = false, 
    gotCurrentRadio = false, drawn = false, stat, 
    eNamed = streema.eventBus.addChromeNamedListener,
    removeSelected = function () {
        var old = document.getElementsByClassName('selected')[0];
        if (typeof old !== 'undefined' && old.removeAttribute) {
            old.removeAttribute('class');
        }
    }, 
    drawRadios = function() {
        radios = radios.sort(function (a,b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
                
            if (a < b){
                return -1;
            } else if (a > b) {
                return  1;
            } else {
                return 0;
            }
        });

        $('radios').innerHTML = '<ul>' + radios.map( function(radio, index){
            var klass = selectedRadioId !== undefined && 
                selectedRadioId === radio.id ? 'selected' : '';
                
            return sprintf(
                '<li class="%s" onclick="ui.play.call(this,%s); return false;">\
                        <a href="#">%s</a> | <span class="band">%s</span> \
                    </li>',
                klass, radio.id, radio.name, radio.country)
        }).join('\n') + '</ul>';

        var selected = document.getElementsByClassName('selected');
        if ( selected.length > 0 ) {
            selected[0].scrollIntoView(false);
        }
            
        if (radios.length === 0) {
            chrome.extension.sendRequest({'method': 'ui.emptyRadioList'}); 
        }
    }, 
    drawIfReady = function () {
        if ( gotCurrentRadio && gotRadios && !drawn) {
            drawRadios();
            $('status').innerHTML = stat;
            drawn = true;
        }
    };
    
    

    ui.stop = function () {
        if ( window.event && window.event.preventDefault) {
            window.event.preventDefault();
        }

        chrome.extension.sendRequest({'method': 'ui.stop'});
        removeSelected();
    };

    ui.play = function(id) {
        if ( window.event && window.event.preventDefault) {
            window.event.preventDefault();
        }
        
        if (arguments.length === 0) {
            if ( !selectedRadioId) {
                return;
            }

            id = selectedRadioId;
        }

        removeSelected();
        if ( this &&  this.setAttribute ) {
            this.setAttribute('class','selected'); 
        }

        var radio = radios.filter( function (radio) { 
            if ( radio.id === id ) {
                return true;
            }
        })[0];

        
        selectedRadioId = radio.id;
        console.log(JSON.stringify(radio));
        chrome.extension.sendRequest({'method': 'ui.play', 
                                        'what': JSON.stringify(radio), 
                                        'timeout':RADIO_TIMEOUT});
    };   

    $('status').innerHTML = 'Loading...';

    eNamed('display.status', function (data) {
        stat = data.stat;
        console.log('updating status to ' + stat)
        if (drawn) {
            $('status').innerHTML = stat;
        }
    });

    eNamed('radiolist.update', function (data) {
        radios = JSON.parse(data.radios);
        gotRadios = true;
        drawIfReady();
    });

    eNamed('player.currentRadio', function (data) {
        selectedRadioId = data.id;
        gotCurrentRadio = true;
        drawIfReady();
    });

    chrome.extension.sendRequest({'method': 'ui.streemaIcon'});
    console.log('ui module loaded ok');

 }, true);
