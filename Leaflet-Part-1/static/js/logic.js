// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
// let queryUrlPastWeek ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// let queryUrlPastDay ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
// let queryUrlPasthour ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
// Function to determine marker color based on depth
function getColor(depth) {
    if (depth > 90) return '#BD0026';
    else if (depth > 70) return '#FC4E2A';
    else if (depth > 50) return '#FD8D3C';
    else if (depth > 30) return '#FEB24C';
    else if (depth > 10) return '#ADFF2F';
    else return '#00FF00';
}

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
    console.log(data)
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // // Function to determine marker color based on depth
    // function getColor(depth) {
    //     if (depth > 90) return '#800026';
    //     else if (depth > 70) return '#BD0026';
    //     else if (depth > 50) return '#E31A1C';
    //     else if (depth > 30) return '#FC4E2A';
    //     else if (depth > 10) return '#FD8D3C';
    //     else return '#FED976';
    // }

    //Function to determine marker size based on magnitude
    function getRadius(magnitude) {
        // Example magnitude scale, you may need to modify this to fit your data.
        return magnitude * 3;
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            let depth = feature.geometry.coordinates[2];
            let magnitude = feature.properties.mag;
            return L.circleMarker(latlng, {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}


function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Set up the legend.
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90]; // Example depth values
        let labels = [];


        div.innerHTML += "<h4> </h4>"; // Added a title for depth

        // Loop through our density intervals and generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+') + '<br>';
    }


        return div;
    };


    // Add the legend to the map
    legend.addTo(myMap);
}