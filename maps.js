(function(){
	if ($('#script_mapsapi').length == 0) {
		let headTag = document.getElementsByTagName('head')[0];
		let scriptTag = document.createElement('script');
		scriptTag.id = 'script_mapsapi';
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.defer = true;
		scriptTag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDZy47rgaX-Jz74vgsA_wTUlbAodzLvnYY&libraries=places&callback=maps.initAutocompletes&types=geocode&language=es-ES';
		headTag.appendChild(scriptTag);
	}
}());

var maps = {
    initAutocompletes: function () {
        $(document).ready(function () {
            $('.maps-autocomplete').each(function () {
                var ac = new google.maps.places.Autocomplete(this, {types: ['geocode']});
                ac.addListener('place_changed', maps.fillInAddress);
                ac.inputEl = this;
                this.mapsAutocomplete = ac;
            });
        })
    },

    fillInAddress: function () {
        var place = this.getPlace();
        var el = this.inputEl;
		$(el).next('span').css('display', 'block');
		onch = el.getAttribute('customonchange');
		if (onch) eval(onch + '(place)');
    },

    onInputChange: function (el) {
		$(el).next('span').css('display', 'none');
		onch = el.getAttribute('customonchange');
		if (onch) eval(onch + '(null)');
    },

    geolocate: function (el) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                var circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
                el.mapsAutocomplete.setBounds(circle.getBounds());
            });
        }
    },
}
