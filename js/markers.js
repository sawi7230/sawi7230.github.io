function OkiiFunction() {
	let self = this;

	this.fourSquareData = ko.observable();

	this.infoContent = ko.observable();

	let markers = [];
	let infoWindow = new google.maps.InfoWindow();
	infoWindow.addListener('closeclick', function() {
		console.log('closeclick!');
		infoWindow.marker = undefined;
	});
	self.infoContent.subscribe((newContent) => {
		infoWindow.setContent(infoWindow.getContent()+'<br><img id="image" src="'+newContent.imageUrl+'" alt="'+newContent.name+'"></img>')
	});

	let map = new google.maps.Map(document.getElementById('map'));

	this.openInfoWindow = function() {
		const marker = this;
		console.log('marker: ' + marker.item.name);
		if (infoWindow.marker !== marker) {
			infoWindow.close();
			infoWindow.marker = marker;
			infoWindow.setContent('<span id="content-name">'+marker.item.name+'</span>');
			foursquareCall(marker).subscribe(self.infoContent);
			infoWindow.open(map, marker);
		}
	};

	let createMarkersFromData = function() {
		let bounds = new google.maps.LatLngBounds();
		let marker;
		data.forEach(item => {
			let location = new google.maps.LatLng(item.lat, item.lng);
			marker = new google.maps.Marker({
				position: location,
				map: map,
				item: item
	  		});
	  		marker.addListener('click', self.openInfoWindow);
	  		markers.push(marker);
			bounds.extend(location);
		});
		return bounds;
	};

	let initMap = function() {
		let markerBounds = createMarkersFromData();
		// auto-center to all pins
		map.fitBounds(markerBounds);
	};

	initMap();

	this.visibleMarkers = ko.observableArray();
	this.visibleMarkers.push(...markers);

	let getCategories = function() {
		let categories = new Set();
		data.forEach(item => {
			categories.add(item.category);
		});
		return Array.from(categories);
	};

	this.categories = getCategories();

	this.filterMarkers = function () {
		infoWindow.close();
		const activeCategory = this;
		self.visibleMarkers.removeAll();
		markers.forEach((marker) => {
			if (marker.item.category === activeCategory.toString()) {
				marker.setVisible(true);
				self.visibleMarkers.push(marker)
			} else {
				marker.setVisible(false);
			}
		});
	};

	this.removeFilter = function () {
		infoWindow.close();
		self.visibleMarkers.removeAll();
		markers.forEach((marker) => {
			marker.setVisible(true);
		});
		self.visibleMarkers.push(...markers);
	};

	const fs_client_id = 'UDXULMCOWB0DUWATTHBCVTSUBW50R3YUV0UEN2KJMGLJ5ER5';
	const fs_client_secret = 'HNEKZGN5HGZAZEXYOB5UANGFYWT0G11CGI5AXWMF5FMVUEL0';

	let foursquareCall = function(marker, callback) {
		const requestUri = 'https://api.foursquare.com/v2/venues/'+marker.item.foursquareId+'?client_id='+fs_client_id+'&client_secret='+fs_client_secret+'&v=20180323';
		const response = ko.observable();
		fetch(requestUri)
			.catch(error => {
				response({name: 'foursquare api not available', imageUrl: ''});
			})
			.then(function(response) {
				return response.json();
			})
			.then(function(obj) {
				const venue = obj.response.venue;
				const prefix = venue.photos.groups[1].items[0].prefix;
				const suffix = venue.photos.groups[1].items[0].suffix;
				const size = '100x100';
				response({name: venue.name, imageUrl: prefix + size + suffix});
			});
		return response;
	}

}

function startMap() {
	ko.applyBindings(new OkiiFunction());
}


