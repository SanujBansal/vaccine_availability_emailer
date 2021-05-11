const https = require('https');
const notifier = require('node-notifier');

function formatDate(today) {
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

     return dd + '-' + mm + '-' + yyyy;
}

var availability = 0;
const searchCenters = async () => {
    let data = [];
    const pincode = "110034";
    const today = new Date();
    const date = formatDate(today, "dd-mm-yy");
    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=110034&date=${date}`;
    https.get(url, (res) => {
        res.on('data', chunk => {
            data.push(chunk);
        });
        res.on('end', () => {
            const respon = JSON.parse(Buffer.concat(data).toString());
            respon.centers.forEach((center) => {
                center.sessions.forEach(session => {
                    if (session.available_capacity > 0 && session.min_age_limit == 18) {
                        availability = availability + session.available_capacity;
                    }
                });
            });
            if (availability > 0) {
                console.log(availability);
                notifier.notify("book kralo");
            } else {
                setTimeout(searchCenters, 20000);
            }
        });
    });
};
console.log('server started');
searchCenters();