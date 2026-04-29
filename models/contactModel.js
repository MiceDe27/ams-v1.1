const mongoose = require ('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {type: String, required: true},
    number: {type: String, required: true},
    email: {type:String},
    photo: {type: String, default: 'assets/contact.svg'}
},{timestamps: true}
);
module.exports = ContactSchema;