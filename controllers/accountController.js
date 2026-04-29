const AccountSchema = require('../models/accountModel');

exports.createAccount = async (req, res) =>{
    try{
        const Account = req.tenantDb.model('Account', AccountSchema);
        const newAccount = new Account(req.body);
        const savedAccount = await newAccount.save();
        res.status(201).json(savedAccount);
    } catch (err){
        res.status(400).json({message: err.message});
    }
};

exports.getAccounts = async (req, res) =>{
    try{
        const Account = req.tenantDb.model('Account', AccountSchema);
        const accounts = await Account.find();
        res.json({ accounts });
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

exports.getAccountById = async (req, res) => {
    try{
        const Account = req.tenantDb.model('Account', AccountSchema);
        const account = await Account.findById(req.params.id);
         if (!account){
            return res.status(404).json({message: 'Account not Found'});
         }
         res.json(account);
    } catch(err){
        res.status(500).json({ message: "Invalid ID format or Server Error "});
    }
};

exports.updateAccount = async (req, res) =>{
    try{
        const Account = req.tenantDb.model('Account', AccountSchema);
        const updateAccount = await Account.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
        );
        if (!updateAccount)
            return res.status(404).json({message: 'Account not found'});
        res.json(updateAccount);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const Account = req.tenantDb.model('Account', AccountSchema);
        const deletedAccount = await Account.findByIdAndDelete(req.params.id);
        
        if (!deletedAccount) return res.status(404).json({ message: 'Account not found' });
        
        res.json({ message: 'Account successfully deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};