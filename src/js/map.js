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

const addVectorLayers = () => {
    map.addSource('orgUnits', {
        type: 'vector',
        tiles: [`${serverTiles}sierraleone-orgunits/{z}/{x}/{y}`],
    });
    map.addLayer({
        "id": "sierraleone-facilities",
        "type": "circle",
        "source": 'orgUnits',
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
        "source": 'orgUnits',
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
        "source": 'orgUnits',
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

    addVectorLayers();
    createClusters(geoJson);

}

map.on('load', init);

