require('dotenv').config({path: __dirname + '/.env'})
const FileType = require("file-type");
const fs = require('fs');
const mongoose = require('mongoose');
const {ImageModel} = require("./db/images");
const fetch = require('node-fetch');
const { SkynetClient } = require('@nebulous/skynet');
const schedule = require('node-schedule');

const skyPortalUrl = process.env['SKYPORTAL'];
const client = new SkynetClient(skyPortalUrl);

let mongoDB = process.env['MONGODB'];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});



//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
backupAndCheck();
async function backupAndCheck() {
    let query = await ImageModel.find({votes: {$gte: -5}})
        .select('_id link online')
        .sort({votes:-1})
        .limit(100)
        .exec();

    query.map(async function(el){
        if (!fs.existsSync("./backup/"+el._id+".png") && !fs.existsSync("./backup/"+el._id+".jpg")) {
            const response = await fetch(el.link);
            const buffer = await response.buffer();
            const filetype = await FileType.fromBuffer(buffer);
            fs.writeFile(`./backup/${el._id}.`+filetype.ext, buffer, () =>
                console.log('finished downloading!' + el._id));
        }
        if (el.online === false){
            let file;
            if (fs.existsSync("./backup/"+el._id+".png")){
                file="./backup/"+el._id+".png";
            }else{
                file="./backup/"+el._id+".jpg";
            }
            const url = await client.uploadDirectory(file);
            console.log(`Upload successful, url: ${url} `+ el._id);
            let skyNetLink = skyPortalUrl + url.replace("sia://", "");
            console.log(skyNetLink);

            await ImageModel.findByIdAndUpdate(
                {_id:el._id},
                {link:skyNetLink, online:true},
                function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("updated "+ el._id);
                    }
                })
        }
    })
}
schedule.scheduleJob('0 15 * * *', async function () { // every 24 hours at 15:00
    console.log("Check started at: " + new Date());
    await backupAndCheck();
});