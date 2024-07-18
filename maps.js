/*
todo: ver de ponerle un boton Cerrar al mapa
https://developers.google.com/maps/documentation/javascript/controls#maps_control_simple-javascript
*/
var inApp = typeof app7 == 'object';

(function () {
    var key;
    debugger;
    if (inApp) {
        /*
        todo: falta restringir esta clave (no se puede ingresar la URL ionic://localhost)
        https://developers.google.com/maps/documentation/javascript/get-api-key
        */
        key = decrypt('U2FsdGVkX1980jboiLSByehdC4OHgstgnLMTIAR3jlMmshxjimk1mfzFVv2NcgRQkl+FEI8GtQM+DmvOb8Cymg==', '');
    } else {
        key = 'AIzaSyDZy47rgaX-Jz74' + 'vgsA_wTUlbAodzLvnYY';
    }
    include('mapsapi', 'https://maps.googleapis.com/maps/api/js?key=' + key + '&libraries=places&callback=maps.init&language=es-ES');
})();

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

		    $picker.click(function (e) {
		    	e.stopPropagation();
		    });
		    
			$(document).click(function () {
				$picker.hide()
			});

            maps.map = new google.maps.Map($picker[0], { zoom: 11 });
	
	        google.maps.event.addListener(maps.map, 'click', function (e) {                
		        var loc = e.latLng;
		        maps.setMarker(loc);
		        maps.updateLocation();
	        });

            if (!inApp) { // En el app se inicializan de otra forma
                // Crea los autocompletes
                $('.maps-autocomplete').each(function () {
                    debugger;
                    maps.initAc(this, function () {
                        // Setea el hidden como value
                        var $inputVal = $(this).parent().nextAll('input[type="hidden"]');
                        if ($inputVal.val()) {
                            this._value($inputVal.val());
                        }
                    });
                });
            }
        })
    },

    initAc: function (el, callback) {
        if (el.mapsAutocomplete || el.initializing) return;
        el.initializing = true;

        scriptLoaded('mapsapi', function () {
            var ac = new google.maps.places.Autocomplete(el, {types: ['geocode']});
            ac.inputEl = el;
            el.mapsAutocomplete = ac;
            ac.addListener('place_changed', maps.onPlaceChange);

            var $el = $(el);
            if ($(el).attr('onfocus') != 'maps.setBounds(this)') {
                $el.focus(function () {
                    maps.setBounds(this);
                });
            }
            if ($(el).attr('onchange') != 'maps.onInputChange(this)') {
                $el.change(function () {
                    maps.onInputChange(this);
                });
            }

            el._text = function (text) {
                var self = this;
                if (text == undefined) {
                    return self.value;
                } else {
                    self.value = text;
                    if (inApp) app7.input.checkEmptyState(self);
                    $(self).change();
                    return text;
                }

            };

            el._value = function (value) {
                if (value == undefined) {
                    // get
                    return $(this).attr('data-place');

                } else {
                    //set
                    var self = this;
                    self.initializing = true;
                    self.mapsAutocomplete.set('place', undefined);
                    self.initializing = undefined;

                    if (value) {
                        var places = new google.maps.places.PlacesService(maps.map);
                        places.getDetails({ placeId: value.split(';')[0] }, function (place, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                self.initializing = true;
                                self.mapsAutocomplete.set('place', place);
                                self.initializing = undefined;
                            }
                        });
                    };
                }

            };

            el.initializing = undefined;
            if (callback) {
                callback(el);
            }
        });
    },

    onPlaceChange: function () {
        var place = this.getPlace();
        var el = this.inputEl;

        // Setea el place como value
        var value = '';
        if (place) {
            value = place.place_id + ';' + place.geometry.location.lat() + ';' + place.geometry.location.lng()
        }

        $(el).attr('data-place', value);
        if (inApp) {
            // Cambia globo vacio/lleno
            $(el).closest('.item-input').find('i.f7-icons').html('placemark' + (place ? '_fill' : ''));
        } else {
            var $inputVal = $(el).parent().nextAll('input[type="hidden"]');
            $inputVal.val(value);
            // Muestra/oculta el tilde verde
            $(el).next('span').css('display', place ? 'block' : 'none');
        };

        if (!el.initializing) {
            var componentName = {
                street_number: 'short_name',
                route: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'short_name',
                administrative_area_level_2: 'short_name',
                country: 'long_name',
                postal_code: 'short_name'  
            };
        
            var addressComponents;
            
            if (place) {
                addressComponents = {};
                for (var i = 0; i < place.address_components.length; i++) {
                    var addressType = place.address_components[i].types[0];
                    if (componentName[addressType]) {
                        addressComponents[addressType] = place.address_components[i][componentName[addressType]];
                    }
                }
            };

            // Evento como attr del INPUT
            onch = el.getAttribute('onplacechange');
            if (onch) eval(onch + '(place, addressComponents)');

            // Evento custom
            el.dispatchEvent(new CustomEvent('placeChange', { detail: { place: place, addressComponents: addressComponents } }));
        }
    },

    onInputChange: function (el) {
		el.mapsAutocomplete.set('place', undefined);
    },

    setBounds: function (el) {
        if (!el.bounded) {
            // Centra en Cordoba por defecto
            var circle = new google.maps.Circle({
                center: { lat: -31.41, lng: -64.18 },
                radius: 1000,
            });
            el.mapsAutocomplete.setBounds(circle.getBounds());

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
                    }
                );
            }

            el.bounded = true;
        }
    },
    
    pickLocation: function (el, e) {
        debugger;
    	var $picker = $('#mapsLocationPicker')

        if (!$picker.is(':visible')) {
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
                zIndex: 20000,
            });

            if (el.mapsAutocomplete) {
                maps.pickerTarget = el;
            } else {
                maps.pickerTarget = $(el).prevAll('.maps-autocomplete')[0];
            }
            var place = maps.pickerTarget.mapsAutocomplete.getPlace();
            
            if (place) {
                // Posiciona el marcador y centra el mapa en la ubicacion seleccionada
                maps.setMarker(place.geometry.location);
                maps.map.setCenter(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                
            } else {
                // La 1ra vez centra el mapa en la ubicacion del usuario
                if (!maps.mapCentered) {
                    maps.map.setCenter(new google.maps.LatLng(-31.41, -64.18)); // Cordoba
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            function (position) {
                                maps.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
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
        }
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
                    if (inApp) {
                        setInputVal($(maps.pickerTarget), res[0].formatted_address);
                    } else {
                        $(maps.pickerTarget).val(res[0].formatted_address);
                    }      	
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
