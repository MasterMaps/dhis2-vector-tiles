mapboxgl.accessToken = 'pk.eyJ1IjoibWFzdGVybWFwcyIsImEiOiJjaXdiYnZlaDgwMDNuMnZucm40dG1jZjd2In0.2oOUnZaKYWuZyz35I4rD9g';

const analyticsApi = 'http://localhost:8080/api/2.30/api/30/analytics/';
const malariaEvents = 'events/query/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2017-10-01&endDate=2018-10-01';

const username = 'admin';
const password = 'district';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

map.fitBounds([[ -13.1899707, 7.009718 ], [ -10.4107857, 9.860312 ]]);

const getData = async (request) => 
    // await fetch(`${analyticsApi}${request}`, {
    await fetch('data/malaria-events.json', {
        header: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
    }).then(response => response.json());

const toGeoJson = rows => ({
    type: 'FeatureCollection',
    features: rows.map(row => ({
        type: 'Feature',
        id: row[0],
        properties: row,
        geometry: {
            type: 'Point',
            coordinates: [parseFloat(row[3]), parseFloat(row[4])],
        }
    })),
});

const createClusters = (data) => {
    console.log('createClusters', data);

    map.addSource('events', { 
        type: 'geojson', 
        data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });
    
    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "events",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": "#51bbd6",
            "circle-radius": [
                "step",
                ["get", "point_count"],
                15,
                100,
                20,
                750,
                30
            ]
        }
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "events",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "events",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        }
    });

};

const init = async () => {
    console.log('load data');
    const data = await getData(malariaEvents);
    const geoJson = toGeoJson(data.rows);


    // const features = toGeoJson(data.rows.slice(0, 10));
    // console.log('add data');

    /*
    map.addSource('events', { 
        type: 'geojson', 
        data: toGeoJson(data.rows),
    });
    */

    console.log('added');

    createClusters(geoJson);

    /*
    map.addLayer({
        "id": "events-heat",
        "type": "heatmap",
        "source": "events",
        "maxzoom": 18,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            // "heatmap-weight": [
            //    "interpolate",
            //    ["linear"],
            //    ["get", "mag"],
            //    0, 0,
            //    6, 1
            // ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                9, 3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(33,102,172,0)",
                0.2, "rgb(103,169,207)",
                0.4, "rgb(209,229,240)",
                0.6, "rgb(253,219,199)",
                0.8, "rgb(239,138,98)",
                1, "rgb(178,24,43)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 2,
                9, 20
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],
        }
    }, 'waterway-label');
    */
    
    /*
    map.addLayer({
        "id": "events-point",
        "type": "circle",
        "source": "events",
        "minzoom": 6,
        "paint": {
            "circle-radius": 4,
            "circle-color": 'red',
            // "circle-stroke-color": "white",
            // "circle-stroke-width": 1,
            "circle-opacity": 0.1
        }
    });
    */

}

map.on('load', init);

