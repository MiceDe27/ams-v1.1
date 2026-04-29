const ContactSchema = require('../models/contactModel');
const fs = require('fs');
exports.createContact = async (req, res) => {
    try{
        const Contact = req.tenantDb.model('Contact', ContactSchema);
        const contactData = {
            name: req.body.name,
            number: req.body.number,
            email: req.body.email,
            photo: req.body.photo || 'assets/contact/svg'
        };
        if (req.file){
            contactData.photo = req.file.path;
        };
        const newContact = new Contact(contactData);
        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    }catch (err){
        res.status(400).json({ message: err.message});
    }
};
exports.getContact = async (req, res) => {
    try{
        const Contact = req.tenantDb.model('Contact', ContactSchema);
        const contacts = await Contact.find().sort({createdAt: -1});
        res.json({ contacts });
    }catch (err){
        res.status(500).json({ message: err.message});
    }
};
exports.getContactById = async (req, res) => {
    try{
        const Contact = req.tenantDb.model('Contact', ContactSchema);
        const contact = await Contact.findById(req.params.id);
         if (!contact){
            return res.status(404).json({message: 'Contact not Found'});
         }
         res.json(contact);
    } catch(err){
        res.status(500).json({ message: "Invalid ID format or Server Error "});
    }
};
exports.updateContact = async (req, res) => {
    try {
        const Contact = req.tenantDb.model('Contact', ContactSchema);
        const updateData = {
            name: req.body.name,
            number: req.body.number,
            email: req.body.email,
        };
        if (req.body.photo) {
            updateData.photo = req.body.photo;
        }
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(updatedContact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteContact = async (req, res) => {
    try{
        const Contact = req.tenantDb.model('Contact', ContactSchema);
        const contact = await Contact.findById(req.params.id);
        if (!contact)
            return res.status(404).json({ message: 'Contact not found'});
        if (contact.photo && !contact.photo.startsWith('data:image')){
            fs.unlink(contact.photo, (err) =>{
                if (err) console.log("Failed to delete file:", err);
            });
        }
        await Contact.findByIdAndDelete(req.params.id);
        res.json({message: 'Contact and photo deleted successflly'});
    }catch (err){
        res.status(500).json({ message: err.message});
    }
};