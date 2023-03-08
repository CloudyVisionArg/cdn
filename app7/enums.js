//Plugin Camera
const CameraResultType = {
    Uri: 'uri',
    Base64: 'base64',
    DataUrl: 'dataUrl'
}

const CameraSource = {
    Prompt: 'PROMPT', //Prompts the user to select either the photo album or take a photo.
    Camera: 'CAMERA', //Take a new photo using the camera.
    Photos: 'PHOTOS' //Pick an existing photo from the gallery or photo album.
}

const CameraDirection = {
    Rear: 'REAR',
    Front: 'FRONT'
}