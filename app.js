function ViewModel() {
    const self = this;
    const fs_client_id = 'UDXULMCOWB0DUWATTHBCVTSUBW50R3YUV0UEN2KJMGLJ5ER5';
    const fs_client_secret = 'HNEKZGN5HGZAZEXYOB5UANGFYWT0G11CGI5AXWMF5FMVUEL0';

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

    this.openInfoWindow = function () {
        document.getElementById('sidebar').classList.remove('sidebar-open');
        const marker = this;
        console.log('marker: ' + marker.item.name);
        if (infoWindow.marker !== marker) {
            infoWindow.close();
            infoWindow.marker = marker;
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout((() => marker.setAnimation(null)), 1000);
            infoWindow.setContent('<span id="content-name">' + marker.item.name + '</span><br><img id="foursquare-image" src="img/loading-150x150.gif" alt="foursquare image">');
            if (infoWindow.pendingCall) {
                console.log('kill subscription');
                infoWindow.pendingCall.dispose();
            }
            infoWindow.pendingCall = foursquareCall(marker).subscribe(infoContent);
            infoWindow.open(map, marker);
        }
    };

    let createMarkersFromData = function () {
        let bounds = new google.maps.LatLngBounds();
        let marker;
        data.forEach(item => {
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
        return bounds;
    };

    let zoomMap = function(bounds) {
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
        zoomMap(markerBounds);
    };

    initMap();

    this.visibleMarkers = ko.observableArray();
    this.visibleMarkers.push(...markers);

    let getCategories = function () {
        let categories = new Set();
        data.forEach(item => {
            categories.add(item.category);
        });
        return Array.from(categories);
    };

    this.categories = getCategories();

    this.filterMarkers = function () {
        infoWindow.close();
        infoWindow.marker = undefined;
        const activeCategory = this;
        self.visibleMarkers.removeAll();
        let bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => {
            if (marker.item.category === activeCategory.toString()) {
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
            .catch(error => {
                response({name: 'foursquare api not available', imageUrl: 'img/picture-not-available-150x150.jpg'});
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (obj) {
                const venue = obj.response.venue;
                const prefix = venue.photos.groups[1].items[0].prefix;
                const suffix = venue.photos.groups[1].items[0].suffix;
                const size = '150x150';
                response({name: venue.name, imageUrl: prefix + size + suffix});
            });
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

