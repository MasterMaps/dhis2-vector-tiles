mapboxgl.accessToken = 'pk.eyJ1IjoibWFzdGVybWFwcyIsImEiOiJjaXdiYnZlaDgwMDNuMnZucm40dG1jZjd2In0.2oOUnZaKYWuZyz35I4rD9g';

const analyticsApi = 'http://localhost:8080/api/2.30/api/30/analytics/';
const malariaEvents = 'events/query/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2017-10-01&endDate=2018-10-01';

const username = 'admin';
const password = 'district';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

map.on('load', function () {
    map.addLayer({
        "id": "sierraleone-facilities",
        "type": "circle",
        "source": {
            type: 'vector',
            tiles: ["http://localhost:5000/sierraleone-orgunits/{z}/{x}/{y}"]
        },
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
        "source": {
            type: 'vector',
            tiles: ["http://localhost:5000/sierraleone-orgunits/{z}/{x}/{y}"]
        },
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
        "source": {
            type: 'vector',
            tiles: ["http://localhost:5000/sierraleone-orgunits/{z}/{x}/{y}"]
        },
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
});

const getData = async (request) => 
    // await fetch(`${analyticsApi}${request}`, {
    await fetch('data/malaria-events.json', {
        header: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
    }).then(response => response.json());

const init = async () => {
    const data = await getData(malariaEvents);
    console.log('data', data);
}

init();

console.log(btoa(`${username}:${password}`));
