function OkiiFunction() {
	let self = this;

	this.fourSquareData = ko.observable();
		let markers = [];
	let infoWindow = new google.maps.InfoWindow();
	infoWindow.addListener('closeclick', function() {
		console.log('closeclick!');
		infoWindow.marker = undefined;
	});
	let map = new google.maps.Map(document.getElementById('map'));

	this.openInfoWindow = function() {
		const marker = this;
		console.log('marker: ' + marker.item.name);
		if (infoWindow.marker !== marker) {
			infoWindow.close();
			infoWindow.setContent(marker.item.name);
			infoWindow.marker = marker;
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

	this.getCategories = function() {
		let categories = new Set();
		data.forEach(item => {
			categories.add(item.category);
		});
		return categories;
	};

	this.categories = Array.from(this.getCategories());

	this.removeFilter = function () {
		infoWindow.close();
		self.visibleMarkers.removeAll();
		markers.forEach((marker) => {
			marker.setVisible(true);
		});
		self.visibleMarkers.push(...markers);
	};

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

	this.getFourSquareData = function () {
		const prefix = 'https://fastly.4sqi.net/img/general/';
		const size = '500x500';
		// ToDo: foursquare-request
		const detailedInfo = {
			name: 'Ain Soph.Ginza',
			category: 'supermarket',
			address: 'irgendwo in Ginza',
			imageUrl: prefix + size + '/28544771_GNOhuUDxLW7hfm6mn_omWlC-4YZ-2SH9fxrPB0d7qXg.jpg'
		};
		self.fourSquareData = detailedInfo;
	}

}

function startMap() {
	ko.applyBindings(new OkiiFunction());
}


