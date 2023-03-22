/**
 * Clase para grabar audio tanto en Cordova como en la web.
 * Cordova: Usa plugin media
 * Web: Usa objeto nativo MediaRecorder 
 * @param {*} opts 
 */
function recorder(opts){
    var mediaRec = null, media = null;
    var defaultMediaOptions = {
        video: {
            tag: 'video',
            type: 'video/webm',
            ext: '.mp4',
            gUM: {video: true, audio: true}
        },
        audio: {
            tag: 'audio',
            type: 'audio/ogg',
            ext: '.ogg',
            gUM: {audio: true}
        }
    };
    var defaultOptions = {
        type: "audio",
        mediaOptions: defaultMediaOptions
    };
    var options = $.extend(true, defaultOptions, opts);
    var mediaType = options.type;
    var mediaOptions =  options.mediaOptions;
    
    media = mediaType == "video" ? mediaOptions.video : mediaOptions.audio;



    this.record = function() {
        if (typeof(cordova) == 'object') {
            return this.recordFromCordova();
        }
        else{
            return this.recordFromWeb();
        }
    };


    function addDuration(pFileSystem, pFileEntry, pMediaRec, pCallback) {
        // Agrega la duracion al nombre del archivo, usa moveTo para renombrar
        if (pMediaRec.getDuration() == -1) {
            // El play/stop lo arregla en Android, para iOs hay que meter este fix:
            // https://github.com/apache/cordova-plugin-media/issues/177?_pjax=%23js-repo-pjax-container#issuecomment-487823086
            
            save = false;
            pMediaRec.play();
            pMediaRec.stop();
            pMediaRec.release();

            // Espera 2 segs a getDuration
            var counter = 0;
            var timerDur = setInterval(function() {
                counter = counter + 100;
                if (counter > 2000) {
                    clearInterval(timerDur);
                    resume();
                }
                if (pMediaRec.getDuration() > 0) {
                    clearInterval(timerDur);
                    resume();
                }
            }, 100);

        } else {
            resume();
        }

        function resume() {
            if (pMediaRec.getDuration() > -1) {
                var dur = pMediaRec.getDuration();
                var min = Math.trunc(dur / 60);
                var fileName = min + '-' + ('0' + Math.trunc(dur - min * 60)).slice(-2) + '_min_' + pFileEntry.name;
                pFileEntry.moveTo(pFileSystem.root, fileName,
                        function (fileEntry) {
                        fileEntry.file(pCallback);
                    },
                    function (err) {
                        console.log('moveTo error: ' + err.code);
                        pFileEntry.file(pCallback); // Pasa el que venia nomas
                    }
                )
            } else {
                pFileEntry.file(pCallback); // Pasa el que venia nomas
            }
        }
    }

    this.stopRecording = function(){
        debugger;
        if(mediaRec != null){
            if(typeof(cordova) == 'object'){
                mediaRec.stopRecord();
                mediaRec.release();
            }
            else{
                mediaRec.stop();
            }
        }
    }

    this.recordFromCordova = function(){
        return new Promise((resolve,reject)=>{
            save = false;
            var now = new Date();
            var src = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-');
            if (device.platform == 'iOS') {
                src += '.m4a';
            } else {
                src += '.aac';
            }
        
            
            mediaRec = new Media(cordova.file.dataDirectory + src,
                    // success callback
				function() {
					debugger;
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
							function (fileSystem) {
                            getFile(cordova.file.dataDirectory + src).then(
                                function (fileEntry) {
                                    
									resolve(fileEntry);
									
									/*addDuration(fileSystem, fileEntry, mediaRec, function (file) {
                                        
                                    });*/
    
                                },
                                function (err) {
                                    reject('getFile error: ' + err.code);
                                }
                            );
                        },
						function(errors) {
							debugger;
						}
                    );
                },
                // error callback
                function (err) {
                    reject('Media error: ' + err.code);
                }
            );
            mediaRec.startRecord();
        });
    }

    this.recordFromWeb = function (){
        return new Promise((resolve,reject)=>{
            var stream = null;
            navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
                stream = _stream;
                mediaRec = new MediaRecorder(stream);
                var chunks = [];
                mediaRec.ondataavailable = e => {
                  chunks.push(e.data);
                  if(mediaRec.state == 'inactive'){
                    let blob = new Blob(chunks, {type: media.type })
                    url = URL.createObjectURL(blob);
                    stream.getTracks().forEach( track => track.stop() );
                    resolve({localURL:url, blob:blob});

                  }
                };
                console.log('got media successfully');
                mediaRec.start();
              }).catch(reject);

        });
    }
}