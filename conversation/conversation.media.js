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
        if(_isCapacitor()){
            return this.recordCapacitor();
        } 
        else {
            if (typeof(cordova) == 'object') {
                return this.recordFromCordova();
            }
            else{
                return this.recordFromWeb();
            }
        }
    };

    var capacitorCallback = null;
    var capacitorCallbackError = null;
    var capacitorFilename = null;
    this.recordCapacitor = function(){
        return new Promise(async(resolve,reject)=>{
            
            capacitorCallback = resolve;
            capacitorCallbackError = reject;
            //TODO: https://github.com/tchvu3/capacitor-voice-recorder
            //Evaluar mejor los permisos 
            const result = await Capacitor.Plugins.VoiceRecorder.requestAudioRecordingPermission();
            if(result.value){
                const currentStatusResult = await Capacitor.Plugins.VoiceRecorder.getCurrentStatus();
                if(currentStatusResult.status != 'NONE'){
                    const startStopResult = await Capacitor.Plugins.VoiceRecorder.stopRecording();
                }
                let now = new Date();
                capacitorFilename = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-') + ".aac";
                const startRecordingResult = await Capacitor.Plugins.VoiceRecorder.startRecording();
            }
        })
        
    }

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
        if(_isCapacitor()){
            saveCapacitor();
        }
        else{
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
    }

    async function saveCapacitor() {

        const recordingData = await Capacitor.Plugins.VoiceRecorder.stopRecording();
        var now = new Date();
        let millis = recordingData.value.msDuration;
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        let durationString = (seconds == 60) ?
            (minutes+1) + ":00" :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        
        var dur = millis / 1000;
        var min = Math.trunc(dur / 60);
        
        var completeName = min + '-' + ('0' + Math.trunc(dur - min * 60)).slice(-2) + '_min_' + capacitorFilename;
        //let fileName = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-') + '_min_' + durationString.replaceAll(':', '-') + '.aac';

        //Guarda en cache.
        //Habria que borrarlo posteriormente al guardado
        writeFileInCache(completeName, recordingData.value.recordDataBase64).then(
            (res)=>{
                    let byteCharacters = atob(recordingData.value.recordDataBase64);
                    let byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    let byteArray = new Uint8Array(byteNumbers);
                    let blob = new Blob([byteArray], { type: recordingData.value.mimeType });

                    let file = new File([blob], capacitorFilename, { type: recordingData.value.mimeType });
                    capacitorCallback(file);
                },(err)=>{
                    capacitorCallbackError(err);
            });


            // Capacitor.Plugins.Filesystem.writeFile({
            //     path : completeName,
            //     data : recordingData.value.recordDataBase64,
            //     directory: Directory.Cache,
            // }).then(
            //     (res)=>{
            //         getFile(res.uri).then(
            //             function (file) {
            //                 if(capacitorCallback !=null){
            //                     capacitorCallback(file);
            //                 }
            //             },(err)=>{
            //                 console.log("Error obteniendo el audio.");
            //                 capacitorCallbackError(err);
            //             });
            //     },(err)=>{
            //         console.log("Error escribiendo el audio.");
            //         capacitorCallbackError(err);
            //     });
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
        
            mediaRec = new Media('cdvfile://localhost/temporary/' + src,
            // success callback
            function() {
                if (save) {
                    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
                        function (fileSystem) {
                            fileSystem.root.getFile(src, { create: false, exclusive: false	},
                                function (fileEntry) {
                                    addDuration(fileSystem, fileEntry, mediaRec, function (file) {
                                        resolve(fileEntry);
                                    });
                                },
                                function (err) {
                                    reject('getFile error: ' + err.code);
                                }
                            );
                        }
                    );
                };
            },
            // error callback
            function (err) {
                logAndToast('Media error: ' + err.code);
            }
        );
            
            // mediaRec = new Media(cordova.file.dataDirectory + src,
            //         // success callback
			// 	function() {
			// 		debugger;
			// 			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
			// 				function (fileSystem) {
            //                 getFile(cordova.file.dataDirectory + src).then(
            //                     function (fileEntry) {
                                    
			// 						resolve(fileEntry);
									
			// 						/*addDuration(fileSystem, fileEntry, mediaRec, function (file) {
                                        
            //                         });*/
    
            //                     },
            //                     function (err) {
            //                         reject('getFile error: ' + err.code);
            //                     }
            //                 );
            //             },
			// 			function(errors) {
			// 				debugger;
			// 			}
            //         );
            //     },
            //     // error callback
            //     function (err) {
            //         reject('Media error: ' + err.code);
            //     }
            // );
            // mediaRec.startRecord();
        });
    }

    this.recordFromWeb = function (){
        return new Promise((resolve,reject)=>{
            var stream = null;
            navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
                stream = _stream;
                mediaRec = new MediaRecorder(stream, { mimeType: 'audio/aac' });
                var chunks = [];
                mediaRec.ondataavailable = e => {
                    chunks.push(e.data);
                    if(mediaRec.state == 'inactive'){
                    var now = new Date();
                    var src = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-');
                    let file = new File(chunks, `${src}.aac`,{ 'type' : 'audio/aac' })
                    //let blob = new Blob(chunks, {type: media.type })
                    url = URL.createObjectURL(file);
                    stream.getTracks().forEach( track => track.stop() );
                    resolve(file);
                    }
                };
                console.log('got media successfully');
                mediaRec.start();
            }).catch(reject);
        });
    }
}


//Plugin Camera
const CameraResultType = {
    Uri: 'uri',
    Base64: 'base64',
    DataUrl: 'dataUrl'
};

const CameraPermissionType = {
    Camera: 'camera', 
    Photos: 'photos'
};

const CameraSource = {
    Prompt: 'PROMPT', //Prompts the user to select either the photo album or take a photo.
    Camera: 'CAMERA', //Take a new photo using the camera.
    Photos: 'PHOTOS' //Pick an existing photo from the gallery or photo album.
};

const CameraDirection = {
    Rear: 'REAR',
    Front: 'FRONT'
};

async function requestPermissionsImages(cameraPermissionType){
    const oPermissionStatus = await Capacitor.Plugins.Camera.requestPermissions({ permissions : cameraPermissionType });
    return (oPermissionStatus[cameraPermissionType] == 'granted' || oPermissionStatus[cameraPermissionType] == 'limited');
}

function cameraOptions(pSource) {
	return {
		quality: 50,
		destinationType: Camera.DestinationType.FILE_URI,
		sourceType: pSource,
		encodingType: Camera.EncodingType.JPEG,
		mediaType: Camera.MediaType.ALLMEDIA,
		//allowEdit: (device.platform == 'iOS'),
		correctOrientation: true, //Corrects Android orientation quirks
		//targetWidth: Width in pixels to scale image. Must be used with targetHeight. Aspect ratio remains constant.
		//targetHeight: 
		//saveToPhotoAlbum: Save the image to the photo album on the device after capture.
		//cameraDirection: Choose the camera to use (front- or back-facing). Camera.Direction.BACK/FRONT
	};
};

function cameraOptionsCapacitor(pSource){
    return {
		quality: 50,
		saveToGallery: true,    
		source: pSource,
		//encodingType: Camera.EncodingType.JPEG,
		//mediaType: Camera.MediaType.ALLMEDIA,
		//allowEdit: (device.platform == 'iOS'),
		correctOrientation: true, //Corrects Android orientation quirks
        resultType: CameraResultType.DataUrl,
		//targetWidth: Width in pixels to scale image. Must be used with targetHeight. Aspect ratio remains constant.
		//targetHeight: 
		//saveToPhotoAlbum: Save the image to the photo album on the device after capture.
		//cameraDirection: Choose the camera to use (front- or back-facing). Camera.Direction.BACK/FRONT
	};
}