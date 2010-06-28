window.addEventListener('load', function () {

    var eNamed = streema.eventBus.addNamedListener;
    var selectedRadio;
    
    ST.player.flash.SWF_PATH = 'http://streema.com/static/flash/player.swf';
    var player = new ST.player.Player(document.getElementById('player'));
    
    eNamed( 'ui.play', function (data) {
        var radio = data.what;
        var result;
        var st;

        selectedRadio = JSON.parse(radio);
        result = player.open(selectedRadio);
        
        if ( result.playable ) {
            player.play();
        }

        st = player.getState();

        if ( !result.playable || (st != ST.player.api.states.STATE_CONNECTING &&
            st != ST.player.api.states.STATE_BUFFERING &&
            st != ST.player.api.states.STATE_PLAYING) ) {
            console.log('Can\'t play radio ' + radio.name + 
                ' with streema player.');
            streema.eventBus.sendRequest({'method': 'player.error'});
            return;
        }
       
        setTimeout( function () {
            streema.eventBus.sendRequest({'method': 'player.playing',
                'status': 'ok'});
            }, data.timeout);

    });
    
    eNamed('ui.stop', function () {
        player.stop();
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
