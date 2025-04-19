const ROLE_HIERARCHY = {
    'user': 1,
    'admin': 2
};
const CODE_TO_ROLE = {
    'u': 'user',
    'a': 'admin'
}

function requireMinRole(minimuRole) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ error: 'Brak danych użytkownika' });
        }

        const userLevel = ROLE_HIERARCHY[CODE_TO_ROLE[req.user.role_code]];
        const requiredLevel = ROLE_HIERARCHY[minimuRole];

        if (userLevel === undefined || userLevel < requiredLevel) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        next();
    };
}

module.exports = {
    requireMinRole
};
