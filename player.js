window.addEventListener('load', function () {

    var eNamed = streema.eventBus.addNamedListener;
    var selectedRadio;
    
    ST.player.flash.SWF_PATH = 'http://streema.com/static/flash/player.swf';
    //ST.player.flash.PLAYLIST_PROXY_URL_TPL="http://streema.com/proxy/playlist/{sid}";
    var player = new ST.player.Player(document.getElementById('player'));
    var failed;
    
    eNamed( 'ui.play', function (data) {
        if (failed) {
            streema.eventBus.sendRequest({'method': 'player.streema.stop'});
        }
        failed = false;
        var radio = data.what;
        var result;
        var st;

        selectedRadio = JSON.parse(radio);
        console.log('Sending to streema player: ' + JSON.stringify(selectedRadio));
        result = player.open(selectedRadio);
        
        if ( result.playable ) {
            player.play();
        }
        console.log(selectedRadio.name + ' is playable by Streema? ' + (result.playable ? 'yes': 'no :(')) 

        st = player.getState();

        if ( !result.playable || (st != ST.player.api.states.STATE_CONNECTING &&
            st != ST.player.api.states.STATE_BUFFERING &&
            st != ST.player.api.states.STATE_PLAYING) ) {
            console.log('Can\'t play radio ' + selectedRadio.name + 
                ' with streema player.');
            failed = true;
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
