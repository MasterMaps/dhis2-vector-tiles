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
    map.addSource('serverMalaria', {
        type: 'vector',
        tiles: [`${serverTiles}malaria/{z}/{x}/{y}`],
    });
    map.addLayer({
        "id": "sierraleone-facilities",
        "type": "circle",
        "source": 'orgUnits',
        "source-layer": "facility",
        "minzoom": 7, // Zoom levels not visible on init fail for some reason...
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "circle-color": "#0000FF",
            "circle-radius": 5,
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                9, 0,
                10, 1,
            ]
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
        minzoom: 7, // Zoom levels not visible on init fail for some reason...
        "paint": {
            "line-color": "#999999",
            "line-width": 2,
            "line-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                9, 1,
            ]
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
            "line-color": "#333333",
            "line-width": 2,
        }
    });

    map.addLayer({
        "id": "sierraleone-malaria-pts",
        "type": "circle",
        "source": 'serverMalaria',
        "source-layer": "malariaevents",
        minzoom: 7, // Zoom levels not visible on init fail for some reason...
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 2,
                16, 4
            ],
            "circle-color": "#FF0000",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                9, 0,
                14, 1
            ],
            "circle-stroke-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                9, 0,
                14, 1
            ]
        }
    });
    map.addLayer({
        "id": "sierraleone-malaria-heatmap",
        "type": "heatmap",
        "source": 'serverMalaria',
        "source-layer": "malariaevents",
        "maxzoom": 14,
        // "layout": {
        //     "line-join": "round",
        //     "line-cap": "round"
        // },
        "paint": {
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                9, 0.8,
                11, 0.2,
                14, 0
            ],
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0,
                6, 1
            ],
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                11, 3
            ],
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
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 2,
                11, 20
            ],
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

const createClusters = async () => {
    const data = await getData(malariaEvents);
    const geoJson = toGeoJson(data.rows);

    map.addSource('events', { 
        type: 'geojson', 
        data: geoJson,
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
    addVectorLayers();
    await createClusters();
}

map.on('load', init);

function createLayerToggles() {
    var toggleableLayerGroups = {
        'Server Heatmap': [
           'sierraleone-malaria-heatmap',
           'sierraleone-malaria-pts', 
        ],
        'Client Clusters': [
            'clusters',
            'cluster-count',
            'unclustered-point'
        ]
    };

    var groups = Object.keys(toggleableLayerGroups);
    for (var i = 0; i < groups.length; i++) {
        var name = groups[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = name;

        var themap = map;
        link.onclick = function (e) {
            var ids = toggleableLayerGroups[this.textContent];
            e.preventDefault();
            e.stopPropagation();

            for (var i = 0; i < ids.length; ++i) {
                const id = ids[i];
                var visibility = themap.getLayoutProperty(id, 'visibility');

                if (visibility === 'visible') {
                    themap.setLayoutProperty(id, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    themap.setLayoutProperty(id, 'visibility', 'visible');
                }
            }
        };

        var layers = document.getElementById('menu');
        layers.appendChild(link);
    }
}

createLayerToggles();