var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('DOMContentLoaded', this.onDeviceReady.bind(this), false);
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
        this.loader=document.getElementById('loader');
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        var game = new SimpleGame();
        gEngine.ResourceMap.registerLoader(this.onProgressLoading.bind(this));
        gEngine.Core.initialize('GLCanvas', game);
    },
    loader:undefined,

    onProgressLoading:function(progress){
        if(this.loader){
            this.loader.children[0].innerText = 'Loading: '+progress+'%';
            if(progress>=100)
                this.loader.style.display= 'none';
        }
    },

    onResume: function () {
        gEngine.GameLoop.onFocus();
    },
    onPause: function () {
        gEngine.GameLoop.onBlur();
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

    }
};

app.initialize();