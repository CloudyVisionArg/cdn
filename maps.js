(function(){
	if ($('#script_mapsapi').length == 0) {
		let headTag = document.getElementsByTagName('head')[0];
		let scriptTag = document.createElement('script');
		scriptTag.id = 'script_mapsapi';
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.defer = true;
		scriptTag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDZy47rgaX-Jz74vgsA_wTUlbAodzLvnYY&libraries=places&callback=maps.init&language=es-ES';
		headTag.appendChild(scriptTag);
	}
}());

var maps = {
	map: undefined,
	mapMarker: undefined,
	pickerTarget: undefined,
	mapCentered: undefined,
	
    init: function () {
        $(document).ready(function () {
            // Crea el picker con el map
			var $picker = $('<div/>', {
				id: 'mapsLocationPicker',
			}).css({
				borderRadius: '12px',
				display: 'none',
				position: 'absolute',
				border: '3px solid #ECECEC',
			}).appendTo($(document.body));
			
		    maps.map = new google.maps.Map($picker[0], { zoom: 11 });
	
	        google.maps.event.addListener(maps.map, 'click', function (e) {                
		        var loc = e.latLng;
		        maps.setMarker(loc);
		        maps.updateLocation();
	        });

        	// Crea los autocompletes
            $('.maps-autocomplete').each(function () {
                var ac = new google.maps.places.Autocomplete(this, {types: ['geocode']});
                ac.inputEl = this;
                this.mapsAutocomplete = ac;

                // Setea el place (value) del Autocomplete
                var $inputVal = $(this).parent().nextAll('input[type="hidden"]');
                if ($inputVal.val()) {
                    var places = new google.maps.places.PlacesService(maps.map);
                    places.getDetails({ placeId: $inputVal.val().split(';')[0] }, function (place, status) {
						if (status === google.maps.places.PlacesServiceStatus.OK) {
							ac.set('place', place);
						}
  					});
                }

                ac.addListener('place_changed', maps.placeChanged);
            });

		    $picker.click(function (e) {
		    	e.stopPropagation();
		    });
		    
			$(document).click(function () {
				$picker.hide()
			});
        })
    },

    placeChanged: function () {
        var place = this.getPlace();
        var el = this.inputEl;
		$(el).next('span').css('display', place ? 'block' : 'none');

        // Setea el place en el hidden
        var $inputVal = $(el).parent().nextAll('input[type="hidden"]');
        if (place) {
            $inputVal.val(place.place_id + ';' + place.geometry.location.lat() + ';' + place.geometry.location.lng());
        } else {
            $inputVal.val('');
        };

        onch = el.getAttribute('customonchange');
		if (onch) eval(onch + '(place)');
    },

    onInputChange: function (el) {
		el.mapsAutocomplete.set('place', undefined);
    },

    setBounds: function (el) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var geolocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var circle = new google.maps.Circle({
                        center: geolocation,
                        radius: position.coords.accuracy
                    });
                    el.mapsAutocomplete.setBounds(circle.getBounds());
                },
                function (err) {
                    var circle = new google.maps.Circle({
                        center: { lat: -31.41, lng: -64.18 },
                        radius: 1000,
                    });
                    el.mapsAutocomplete.setBounds(circle.getBounds());
                }
            );
        }
    },
    
    pickLocation: function (el, e) {
    	var $picker = $('#mapsLocationPicker')

		var posY, height;
		if (e.clientY > window.innerHeight - e.clientY) {
			// Para arriba
			posY = e.pageY - e.clientY + 15;
			height = e.pageY - posY - 25;
		} else {
			// Para abajo
			posY = e.pageY + 25;
			height = window.innerHeight - e.clientY - 40;
		}

		$picker.css({
			left: '5%',
			width: '90%',
			top: posY + 'px',
			height: height + 'px',
			zIndex: 1000,
		});

		maps.pickerTarget = $(el).prevAll('.maps-autocomplete')[0];
		var place = maps.pickerTarget.mapsAutocomplete.getPlace();
		
		if (place) {
			// Posiciona el marcador y centra el mapa en la ubicacion seleccionada
			maps.setMarker(place.geometry.location);
			maps.map.setCenter(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
			
		} else {
			// La 1ra vez centra el mapa en la ubicacion del usuario
			if (!maps.mapCentered) {
                if (navigator.geolocation) {
	            	navigator.geolocation.getCurrentPosition(
                        function (position) {
	            		    maps.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	            	    },
                        function (err) {
                            maps.map.setCenter(new google.maps.LatLng(-31.41, -64.18)); // Cordoba
                        }
                    )
	        	}
			};

			if (maps.mapMarker) {
				// Borra el marker
				maps.mapMarker.setMap(null);
				maps.mapMarker = undefined;
			};
		}
		maps.mapCentered = true;
		
		$picker.show();
		e.stopPropagation();
    },
    
    setMarker: function (loc) {
        if (!maps.mapMarker) {
            maps.mapMarker = new google.maps.Marker({
                position: loc,
                map: maps.map,
                draggable: true,
            });

            google.maps.event.addListener(maps.mapMarker, 'dragend', function (e){
                maps.updateLocation();
            });
            
        } else {
            maps.mapMarker.setPosition(loc);
        }
    },
    
    updateLocation: function () {
		var loc = maps.mapMarker.getPosition();
		
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({ 'location': loc }, function(res, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (res[0]) {
					$(maps.pickerTarget).val(res[0].formatted_address);
      	
      				var places = new google.maps.places.PlacesService(maps.map);
					places.getDetails({ placeId: res[0].place_id }, function (place, status) {
						if (status === google.maps.places.PlacesServiceStatus.OK) {
							maps.pickerTarget.mapsAutocomplete.set('place', place);
						} else {
							console.log('PlacesService error: ' + status);
						}
  					});
      			} else {
        			window.alert('No results found');
				}
    		} else {
				console.log('Geocoder error: ' + status);
			}
		});
	},
}
