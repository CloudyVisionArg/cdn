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
        debugger;
        $('.maps-autocomplete').each(function () {
            this.autocomplete = new google.maps.places.Autocomplete(this, {types: ['geocode']});
            this.autocomplete.addListener('place_changed', maps.fillInAddress);
        });

    },

    fillInAddress: function () {
        debugger;
    },

    onInputChange: function () {
        debugger;
    },

    geolocate: function () {
        debugger;
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
                //#> & Name & <#_autocomplete.setBounds(circle.getBounds());
            });
        }
    },
}

/*
<script>
//var placeSearch;
var #> & Name & <#_autocomplete;

function #> & Name & <#_initAutocomplete() {
	#> & Name & <#_autocomplete = new google.maps.places.Autocomplete((_getElement('#> & Name & <#')), {types: ['geocode']});
	#> & Name & <#_autocomplete.addListener('place_changed', #> & Name & <#_fillInAddress);
}

// [START region_fillform]
function #> & Name & <#_fillInAddress() {
  var place = #> & Name & <#_autocomplete.getPlace();
  $("##> & Name & <#").next("span").css("display", "block"); 
  #> & IIf(OnChange & "" <> "", OnChange & "(place);", "") & <#
}

function #> & Name & <#_onInputChange() {
  $("##> & Name & <#").next("span").css("display", "none"); 
  #> & IIf(OnChange & "" <> "", OnChange & "(null);", "") & <#
}

function #> & Name & <#_geolocate() {
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
			#> & Name & <#_autocomplete.setBounds(circle.getBounds());
		});
	}
}
</script>
#>
*/