const puppeteer = require("puppeteer-core");
var nodemailer = require('nodemailer');
const promptly = require('promptly');

const notifier = require('node-notifier');

const kaam_k_center = [];
var receivers = [];
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'sanuj1770.cse16@chitkara.edu.in',
           pass: 'sk@bansal123'
       }
   });

var mobileNumber = "";
const script = async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        headless: true
    });

    const validator = function (value) {
        if (value.length != 6) {
            throw new Error('Length must be 6');
        }
        return value;
    };

    await promptly.prompt("enter list of emails seperated by spaces").then((input) => {
        receivers = input.split(" ");
    });
    const mailOptions = {
        from: 'Notification Service covid@notification.com', // sender address
        to: receivers, // list of receivers
        subject: '18+ vaccination available book now', // Subject line
        html: "Hello This is email from server running at sanuj's pc to tell that 18+ vaccine is now available" // plain text body
      };
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setViewport({ height: 600, width: 800 });
    await page.goto('https://selfregistration.cowin.gov.in/', { waitUntil: 'networkidle0' });
    mobileNumber = await promptly.prompt("Enter mobile number to get OTP");
    await page.waitForSelector('#mat-input-0');
    await page.type('#mat-input-0', mobileNumber, { delay: 20});
    await page.click('div[class="covid-button-desktop ion-text-center"]', {delay: 2000});
    const otp = await promptly.prompt('OTP: ', { validator });
    await page.type('#mat-input-1', otp, { delay: 20 })
    await page.click('#main-content > app-login > ion-content > div > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col > ion-grid > form > ion-row > ion-col:nth-child(3) > div', { delay: 200 });
    await page.waitFor(10*1000);
    await page.waitForSelector('#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(2) > ion-col > ion-grid > ion-row.dose-data.md.hydrated > ion-col:nth-child(2) > ul > li > a > img');
    await page.click('#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(2) > ion-col > ion-grid > ion-row.dose-data.md.hydrated > ion-col:nth-child(2) > ul > li > a > img', { delay: 20 });
    await page.waitForSelector('#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(5) > ion-col > div > div:nth-child(2) > div > ion-button');
    await page.click('#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(5) > ion-col > div > div:nth-child(2) > div > ion-button', { delay: 200 });
    const pincode = await promptly.prompt('Pincode: ', { validator });
    await page.type('#mat-input-2', pincode, { delay: 20 });
    await page.click('#main-content > app-appointment-table > ion-content > div > div > ion-grid > ion-row > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col:nth-child(2) > form > ion-grid > ion-row > ion-col.col-padding.ion-text-start.ng-star-inserted.md.hydrated > ion-button');
    console.log('Server started successfully, lets wait for the notification on your device and email');
    await page.on('response', (response) => {
        if (response._url.includes('https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin')) {
            
            response.json().then((res) => {
                res.centers.forEach( (center) => {
                    var availableCap = 0;
                    center.sessions.forEach(session => {
                        if (session.available_capacity > 0 && session.min_age_limit == 18) {
                           availableCap = availableCap + session.available_capacity; 
                        }
                    });
                    if (availableCap > 0) {
                        kaam_k_center.push('Availability: '+ availableCap + ' Center Address'+ center.address);  
                    }
                });

                
                if (kaam_k_center.length > 0) {
                    console.log(kaam_k_center);
                    notifier.notify('Book slot for covid vaccine now');
                    transporter.sendMail(mailOptions, function (err, info) {
                        setTimeout(() => {
                            page.click('#main-content > app-appointment-table > ion-content > div > div > ion-grid > ion-row > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col:nth-child(2) > form > ion-grid > ion-row > ion-col.col-padding.ion-text-start.ng-star-inserted.md.hydrated > ion-button');
                        }, 2000000) 
                        if(err)
                          console.log(err)
                        else
                          console.log('Email sent successfully');
                     });
                } else {
                    setTimeout(() => {
                        page.click('#main-content > app-appointment-table > ion-content > div > div > ion-grid > ion-row > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col:nth-child(2) > form > ion-grid > ion-row > ion-col.col-padding.ion-text-start.ng-star-inserted.md.hydrated > ion-button');
                    }, 20000)
                }
            }).catch(err => {
            });
        }
    })
}


script();