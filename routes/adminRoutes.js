const express = require('express');
const router = express.Router();
const admin = require('../config/firebase'); // Firebase Admin SDK
const Tenant = require('../models/tenant'); // Master Tenant Model

// @route   POST /api/admin/register-tenant
// @desc    Mag-register ng bagong kumpanya at Admin user
router.post('/register-tenant', async (req, res) => {
    const { email, password, tenantName, tenantId } = req.body;

    try {
        // 1. Check kung existing na ang tenantId sa Master DB
        const existingTenant = await Tenant.findOne({ tenantId });
        if (existingTenant) {
            return res.status(400).json({ error: "Tenant ID already taken. Choose another one." });
        }

        // 2. Gawa ng User sa Firebase (Authentication)
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: tenantName,
        });

        // 3. I-assign ang Custom Claim (Ang selyo ng Multi-tenancy)
        // Dito natin ididikit ang tenantId sa mismong Firebase account ng user
        await admin.auth().setCustomUserClaims(userRecord.uid, { 
            tenantId: tenantId 
        });

        // 4. I-save ang record sa Master MongoDB
        const newTenant = new Tenant({
            tenantId,
            companyName: tenantName,
            adminUid: userRecord.uid,
            status: 'active',
            plan: 'basic'
        });

        await newTenant.save();

        res.status(201).json({
            message: `Tenant ${tenantName} successfully registered!`,
            tenantId: tenantId,
            firebaseUid: userRecord.uid
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;