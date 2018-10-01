mapboxgl.accessToken = 'pk.eyJ1IjoibWFzdGVybWFwcyIsImEiOiJjaXdiYnZlaDgwMDNuMnZucm40dG1jZjd2In0.2oOUnZaKYWuZyz35I4rD9g';

const analyticsApi = 'http://localhost:8080/api/2.30/api/30/analytics/';
const malariaEvents = 'events/query/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2017-10-01&endDate=2018-10-01';

const username = 'admin';
const password = 'district';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
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