# Neighborhood Map

This is my neighborhood map project for the udacity front-end nano-degree.

## Features:

  - you can view a small list of cool places in Tokyo
  - this list can be filtered by category
  - by clicking an element of the list or a marker in the map an info-window will popup and show an image of the selected location
  - the site is responsive and will work on mobile devices, too
  - errors in the used APIs are handled gracefully
  - all calls to the used APIs as well as the click-events on the location-list are processed asynchronously

## Structure

  - *app.js*: contains the view-model, this is where all the magic happens
  - *data.js*: this file only contains static data about the locations
  - *knockout-3.4.2.js*: knockout framework
  - *style.css*: makes everything pretty
  - *index.html*: here everything is put together

## Used APIs

This neighborhood map uses the [GoogleMaps API v3](https://developers.google.com/maps/documentation/javascript/reference/map) to provide a map, the markers and their info-windows.
Furthermore the [FourSquare Places API v2](https://developer.foursquare.com/docs/api/venues/photos) is used to retrieve photos of the listed locations.

## Live Example

A live demo can be found [here](https://sawi7230.github.io/).
