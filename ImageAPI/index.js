const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const {ImageModel} = require("./db/images");
const fetch = require('node-fetch');
const {SkynetClient} = require('@nebulous/skynet');
const schedule = require('node-schedule');
require('dotenv').config({path: __dirname + '/.env'})


const skyPortalUrl = process.env['SKYPORTAL'];
const mongoDB = process.env['MONGODB'];
const client = new SkynetClient(skyPortalUrl);
const port = 80;

const app = express();
app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let imageLibraryLink;

schedule.scheduleJob('0 0 * * *', async function () { // every 24 hours
    console.log("online check started at: " + new Date());
    await checkOnlineStatus();
})


async function uploadFirstTime() {
    const url = await client.uploadDirectory(__dirname + "/build");
    imageLibraryLink = skyPortalUrl + url.replace("sia://", "");
    console.log(`Upload successful, url: ${imageLibraryLink}`);
}

uploadFirstTime();


//Set up default mongoose connection
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useFindAndModify', false);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//not needed anymore deletes removed images from db
async function removeDeletedImages() {
    let query = await ImageModel.find({votes: {$gte: -5}})
        .select('_id link votes')
        .sort({votes: -1})
        .exec();

    query.map(el => {
        fetch(el.link)
            .then(response => {
                if (response.status === 404) {
                    return true;
                } else {
                    return false;
                }
            })
            .then(async function (state) {
                if (state === true) {
                    await ImageModel.findByIdAndUpdate(
                        {_id: el._id},
                        {online: false},
                        function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("marked offline: " + el._id);
                            }
                        })
                }
            })
    })
}

// EXPRESS START
app.post('/addimage', async (req, res) => {
    let image_instance = new ImageModel({
        link: htmlEntities(req.body.link),
        votes: 0,
        online: true
    });

    image_instance.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.sendStatus(200);
        }
        // saved!
    });

});

//send upvote
app.post('/up', async (req, res) => {
    console.log("upvoted: " + req.body.id);
    ImageModel.findOneAndUpdate({_id: req.body.id}, {$inc: {votes: 1}}, {new: true}, function (err, response) {
        if (err) {
            console.log(err)
            res.sendStatus(500);
        } else {
            res.json({
                votes: response.votes,
            })
        }
    });

});

app.post('/down', async (req, res) => {
    console.log("downvoted: " + req.body.id);
    ImageModel.findOneAndUpdate({_id: req.body.id}, {$inc: {votes: -1}}, {new: true}, function (err, response) {
        if (err) {
            console.log(err)
            res.sendStatus(500);
        } else {
            res.json({
                votes: response.votes,
            })
        }
    });

});

app.get('/images/', async (req, res) => {
    let {page = 1, limit = 12} = req.query;
    if (req.query.page === "undefined") {
        page = 1;
    }
    if (req.query.sort === "top") {
        try {
            let query = await ImageModel.find({votes: {$gte: -5}})
                .select('_id link votes online')
                .sort({votes: -1})
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await ImageModel.countDocuments();
            res.json({
                results: query,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            })
        } catch (e) {
            console.log(e.message);
        }
    } else {
        try {
            let query = await ImageModel.find({votes: {$gte: -5}})
                .select('_id link votes online')
                .sort({created_at: -1})
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await ImageModel.countDocuments();
            res.json({
                results: query,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            })
        } catch (e) {
            console.log(e.message);
        }
    }
});

//remove xss
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//check if website is still online
async function checkOnlineStatus() {
    fetch(imageLibraryLink)
        .then(response => {
            if (response.status === 404) {
                return true;
            } else {
                return false;
            }
        })
        .then(async function (state) {
            if (state === true) {
                const url = await client.uploadDirectory(__dirname + "/build");
                console.log(`Upload successful, url: ${url}`);
                imageLibraryLink = url.replace("sia://", "");
                return url.replace("sia://", "");
            } else {
                return "still online at " + imageLibraryLink;
            }
        }).then(url => {
        console.log(imageLibraryLink);
    });
}


app.listen(port, () => console.log(`Server started successfully`));