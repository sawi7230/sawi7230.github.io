// get neighborhood list on foursquare:
// https://api.foursquare.com/v2/lists/5c570eb5c824ae002c196818?client_id=UDXULMCOWB0DUWATTHBCVTSUBW50R3YUV0UEN2KJMGLJ5ER5&client_secret=HNEKZGN5HGZAZEXYOB5UANGFYWT0G11CGI5AXWMF5FMVUEL0&v=20180323

function Foursquare() {
    const self = this;
    const fs_list_id = '5c570eb5c824ae002c196818';
    const fs_client_id = 'UDXULMCOWB0DUWATTHBCVTSUBW50R3YUV0UEN2KJMGLJ5ER5';
    const fs_client_secret = 'HNEKZGN5HGZAZEXYOB5UANGFYWT0G11CGI5AXWMF5FMVUEL0';

    this.categories = ko.observable([]);
    this.places = ko.observable([]);

    let getList = function() {
        const requestUri = 'https://api.foursquare.com/v2/lists/'+fs_list_id+'?client_id='+fs_client_id+'&client_secret='+fs_client_secret+'&v=20180323';
        fetch(requestUri)
            .catch(error => {
                console.log('boohoo! foursquare api not available!');
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                const cats = data.response.list.categories.items;
                const venues = data.response.list.listItems.items;

                self.categories(cats.map(item => {
                    return {name: item.category.name, icon: item.category.icon};
                }));

                self.places(venues.map(item => {
                    return {
                        name: item.venue.name,
                        category: item.venue.categories[0].name,
                        address: item.venue.location.formattedAddress,
                        latLng: {lat: item.venue.location.lat, lng: item.venue.location.lng},
                        photo: {prefix: item.photo.prefix, suffix: item.photo.suffix}
                    }
                }));

            });
    }

    getList();
}



