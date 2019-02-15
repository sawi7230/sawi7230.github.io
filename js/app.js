function ViewModel() {
    const self = this;
    const fs_client_id = 'XQMDVZJ13CV2QHBVE5P20Q3H2A4I0C4NHL54Z0PQ5KML4WAU';
    const fs_client_secret = 'WFYXDWVVESIMDLK43MVPKTDDTMTMDPIICHSCPMQ53VK3NL2L';


    const foursquare = new Foursquare();

    const infoContent = ko.observable();
    const markers = [];

    const map = new google.maps.Map(document.getElementById('map'), {disableDefaultUI: true, clickableIcons: false});
    const infoWindow = new google.maps.InfoWindow();
    infoWindow.addListener('closeclick', function () {
        console.log('closeclick!');
        infoWindow.marker = undefined;
    });
    infoContent.subscribe((newContent) => {
        document.getElementById('foursquare-image').src = newContent.imageUrl;
    });


    this.visibleMarkers = ko.observableArray();

    this.openInfoWindow = function () {
        document.getElementById('sidebar').classList.remove('sidebar-open');
        const marker = this;
        console.log('marker: ' + marker.item.name);
        if (infoWindow.marker !== marker) {
            infoWindow.close();
            infoWindow.marker = marker;
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout((() => marker.setAnimation(null)), 1000);
            infoWindow.setContent('<span id="content-name">' + marker.item.name + '</span><br><img id="foursquare-image" src="' + marker.item.photo.prefix + '150x150' + marker.item.photo.suffix + '" alt="foursquare image">');
            infoWindow.open(map, marker);
        }
    };

    let createMarkersFromData = function () {
        const boundsObs = ko.observable();
        let marker;
        foursquare.places.subscribe(list => {
            const bounds = new google.maps.LatLngBounds();
            list.forEach(item => {
                let location = new google.maps.LatLng(item.lat, item.lng);
                marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    item: item,
                    animation: google.maps.Animation.DROP
                });
                marker.addListener('click', self.openInfoWindow);
                markers.push(marker);
                bounds.extend(location);
            });
            self.visibleMarkers.push(...markers);
            boundsObs(bounds);
        });
        return boundsObs;
    };

    let zoomMap = function (bounds) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
            var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.001, bounds.getNorthEast().lng() + 0.001);
            var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.001, bounds.getNorthEast().lng() - 0.001);
            bounds.extend(extendPoint1);
            bounds.extend(extendPoint2);
        }
        map.fitBounds(bounds);
    };

    let initMap = function () {
        let markerBounds = createMarkersFromData();
        // auto-center to all pins
        markerBounds.subscribe(zoomMap);
    };

    initMap();

    let getCategories = function () {
        let categories = new Set();
        data.forEach(item => {
            categories.add(item.category);
        });
        return Array.from(categories);
    };

    this.categories = foursquare.categories;

    this.filterMarkers = function () {
        infoWindow.close();
        infoWindow.marker = undefined;
        const activeCategory = this;
        self.visibleMarkers.removeAll();
        let bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => {
            if (marker.item.category === activeCategory.name) {
                marker.setVisible(true);
                bounds.extend(marker.getPosition());
                self.visibleMarkers.push(marker)
            } else {
                marker.setVisible(false);
            }
        });
        zoomMap(bounds);
    };

    this.removeFilter = function () {
        infoWindow.close();
        infoWindow.marker = undefined;
        self.visibleMarkers.removeAll();
        let bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => {
            marker.setVisible(true);
            bounds.extend(marker.getPosition());
        });
        self.visibleMarkers.push(...markers);
        zoomMap(bounds);
    };

    let foursquareCall = function (marker, callback) {
        const requestUri = 'https://api.foursquare.com/v2/venues/' + marker.item.foursquareId + '?client_id=' + fs_client_id + '&client_secret=' + fs_client_secret + '&v=20180323';
        const response = ko.observable();
        fetch(requestUri)
            .then(function (serverResponse) {
                if (serverResponse.status !== 200) {
                    throw 'foursquare api call rejected';
                }
                return serverResponse.json();
            }, error => response({imageUrl: 'img/picture-not-available-150x150.jpg'}))
            .then(function (obj) {
                const venue = obj.response.venue;
                const prefix = venue.photos.groups[1].items[0].prefix;
                const suffix = venue.photos.groups[1].items[0].suffix;
                const size = '150x150';
                response({name: venue.name, imageUrl: prefix + size + suffix});
            }, error => response({imageUrl: 'img/picture-not-available-150x150.jpg'}));
        return response;
    }
}

function googleAlert() {
    alert("GoogleMaps is not reachable :( Please try again later.");
}

function toggleSidebar() {
    parent = document.getElementById('sidebar');
    parent.classList.toggle('sidebar-open')
}

function startApp() {
    ko.applyBindings(new ViewModel());
}

