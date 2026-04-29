const admin = require('../config/firebase');
const mongoose = require('mongoose');
const Tenant = require('../models/tenant');

const tenantResolver = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Primary path: tenantId is stored as a Firebase custom claim.
        // Fallback path: resolve tenant by Firebase uid (useful before the client refreshes token claims).
        let tenantId = decodedToken.tenantId;
        if (!tenantId) {
            let tenantByUid = await Tenant.findOne({ adminUid: decodedToken.uid, status: 'active' });

            // If there is no tenant yet, auto-provision one so the app can function.
            // This avoids hard 403s on fresh environments where no tenant was registered.
            if (!tenantByUid) {
                const provisionalTenantId = decodedToken.uid;
                tenantByUid = await Tenant.findOneAndUpdate(
                    { adminUid: decodedToken.uid },
                    {
                        $setOnInsert: {
                            tenantId: provisionalTenantId,
                            companyName: decodedToken.name || decodedToken.email || 'Default Tenant',
                            adminUid: decodedToken.uid,
                            status: 'active',
                            plan: 'basic',
                        },
                    },
                    { upsert: true, returnDocument: 'after' }
                );
            }

            if (tenantByUid?.tenantId) {
                tenantId = tenantByUid.tenantId;
                // Best-effort: persist the claim so future tokens include tenantId.
                admin.auth().setCustomUserClaims(decodedToken.uid, { tenantId }).catch(() => {});
            }
        }

        if (!tenantId) {
            return res.status(403).json({ error: "Forbidden: User has no assigned tenant" });
        }

        const tenantInfo = await Tenant.findOne({ tenantId, status: 'active' });
        if (!tenantInfo) {
            return res.status(403).json({ error: "Forbidden: Tenant account is inactive or deleted" });
        }

        const tenantDb = mongoose.connection.useDb(`db_${tenantId}`, { useCache: true });
        
        req.tenantDb = tenantDb;
        req.tenantInfo = tenantInfo;
        req.user = decodedToken; 

        next();
    } catch (err) {
        console.error("Firebase Auth Error:", err.message);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

module.exports = tenantResolver;