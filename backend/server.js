const app = require('./app');
const { PORT } = require('./config/constants');
const os = require('os');

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});