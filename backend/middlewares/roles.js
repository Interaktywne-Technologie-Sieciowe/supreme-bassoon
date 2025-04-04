const ROLE_HIERARCHY = {
    'g': 0,
    'u': 1,
    'a': 2
};

function requireMinRole(minRoleCode) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ error: 'Brak danych użytkownika' });
        }

        const userLevel = ROLE_HIERARCHY[req.user.role_code];
        const requiredLevel = ROLE_HIERARCHY[minRoleCode];

        if (userLevel === undefined || userLevel < requiredLevel) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        next();
    };
}

module.exports = {
    requireMinRole
};
