mapboxgl.accessToken = 'pk.eyJ1IjoibWFzdGVybWFwcyIsImEiOiJjaXdiYnZlaDgwMDNuMnZucm40dG1jZjd2In0.2oOUnZaKYWuZyz35I4rD9g';

const analyticsApi = 'http://localhost:8080/api/2.30/api/30/analytics/';
const malariaEvents = 'events/query/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2017-10-01&endDate=2018-10-01';
const serverTiles = 'http://localhost:5001/';

const username = 'admin';
const password = 'district';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

map.fitBounds([[ -13.1899707, 7.009718 ], [ -10.4107857, 9.860312 ]]);

const toggleVectorLayers = (evt) => {
    const btn = evt.target;
    btn.classList.toggle('selected');

    if (btn.className === 'selected') {
        addVectorLayers();
    } else {
        removeVectorLayers();
    }
}

const addVectorLayers = () => {
    map.addSource('sierraleone-orgunits', {
        type: 'vector',
        tiles: [`${serverTiles}sierraleone-orgunits/{z}/{x}/{y}`]
    });

    map.addLayer({
        "id": "sierraleone-facilities",
        "type": "circle",
        "source": "sierraleone-orgunits",
        "source-layer": "facility",
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "circle-color": "#0000FF",
            "circle-radius": 4,
            "circle-blur": 1,
        }
    });
    map.addLayer({
        "id": "sierraleone-chiefdoms",
        "type": "line",
        "source": "sierraleone-orgunits",
        "source-layer": "chiefdom",
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "line-color": "#00FF00",
            "line-width": 1
        }
    });
    map.addLayer({
        "id": "sierraleone-districts",
        "type": "line",
        "source": "sierraleone-orgunits",
        "source-layer": "district",
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "line-color": "#FF0000",
            "line-width": 2
        }
    });
};

const removeVectorLayers = () => {
    map.removeLayer('sierraleone-facilities');
    map.removeLayer('sierraleone-chiefdoms');
    map.removeLayer('sierraleone-districts');
    map.removeSource('sierraleone-orgunits');;
};

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

const clearClusters = () => {
    map.removerSource('events');
    map.removeLayer('clusters');
    map.removeLayer('cluster-count');
    map.removeLayer('unclustered-point');
};

createHeatmap = (data) => {
    map.addSource('events', {
        type: 'geojson',
        data
    });

    map.addLayer({
        "id": "events-heat",
        "type": "heatmap",
        "source": "events",
        "maxzoom": 12,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": 0.2,
            /*
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0,
                6, 1
            ],
            */
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                12, 3
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
                0, 1,
                12, 10
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                12, 1
            ],
        }
    }, 'waterway-label');

    map.addLayer({
        "id": "events-point",
        "type": "circle",
        "source": "events",
        "minzoom": 10,
        "paint": {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": 4,
            // Color circle by earthquake magnitude
            "circle-color": 'red',
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            // Transition from heatmap to circle layer by zoom level
            "circle-opacity": 1
        }
    }, 'waterway-label');

    console.log('heatmap');
};

const init = async () => {
    const data = await getData(malariaEvents);
    const geoJson = toGeoJson(data.rows);

    // addVectorLayers();
    // createClusters(geoJson);
    // createHeatmap(geoJson);

    document.getElementById('tiles').addEventListener('click', toggleVectorLayers);
}

map.on('load', init);

