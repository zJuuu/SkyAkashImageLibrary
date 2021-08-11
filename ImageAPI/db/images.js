// Define schema
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    link: String,
    votes: Number,
    online: Boolean
}, {
    collection: 'images',
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});
ImageSchema.index( { link: "text"} )

// Compile model from schema
var ImageModel = mongoose.model('akashapi', ImageSchema );

module.exports = {
    ImageModel,
    ImageSchema
};