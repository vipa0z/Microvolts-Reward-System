require('dotenv').config();
const path = require("path")
const logger = require("./util/logger")
const express = require('express');
const cors = require('cors');
const db  = require('./util/db')
const chalk = require('chalk');
const {ensureRewardFieldsExist } = require('./util/updateDBHelpers')
const ConfigValidator = require('./services/ConfigValidator')
const MemoryLoader = require('./services/MemoryLoader');
const run = require('./util/updateDBHelpers').run;



// Import routes
const authRoutes = require('./routes/apiRoutes');
const siteRoutes = require("./routes/siteRoutes")

// replace with API endpoints
// validateConfigFilesItems("shop_item")
// validateConfigFilesItems("hourly_item")
// validateConfigFilesItems("achievement_item")
// Initialize Express app
const app = express();
const errorHandler = require('./middleware/error');


console.log("\n")
console.log(chalk.magenta('[+] Welcome to the MicroBolts Reward Server'));
console.log("──────────────────────────────────────────────────────────────")


// Security middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Logging middleware
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/', authRoutes);
// app.use(siteRoutes)
app.use(errorHandler);

app.set('view engine', 'ejs');

// Set the views folder (default is './views')
app.set('views', path.join(__dirname, 'views'));

// Serve static assets 
app.use(express.static(path.join(__dirname, 'public')));

// health check
app.get('/', (req, res) => {
return res.send("<html><body style='text-align: center;background-color:#f0f0;'><h1>MicroVolts Rewards Server</h1> </body></html>")
});



// Database connection and server startup
const DB_PORT = process.env.DB_PORT || 3305; // default port is 3306
const PORT = process.env.PORT || 4000;


async function startServer() {
  const rows = await db.query('SELECT 1');
  if (rows && rows.length > 0 && rows[0]['1'] === 1) {

    console.log(chalk.yellow(`[+] Succesfully established connection to ${process.env.DB_NAME} \n`));
  }
// ──────────────────────────────────────────────────────────────
// [DEV] Optional DB bootstrap step (only runs with --populate flag)
// - Creates valid_items entries if needed
// - Ensures required user table fields exist
// - Useful during first-time setup or migrations
// ──────────────────────────────────────────────────────────────

    const args = process.argv.slice(2);
    if (args.includes('--populate')) {
      try {
        run();

      } catch (error) {
        console.error('Failed to populate valid_items:', error);
      }
    }
    await MemoryLoader.loadAllItemsIntoMemory();
                                                                  
    const categories = ["wheel_items", "shop_items", "hourly_items"];
    try {
    for (const category of categories) {
        await ConfigValidator.validateConfigFileOnStartup(category).then(() => {
           MemoryLoader.loadItemsIntoMemory(category);
        }).catch((error) => {
            console.error(`[!] Failed to validate ${category} config file: ${error}`);
        });
    } }
    catch (error) {
        console.error('Failed to validate config files:', error);
    }
    
    // Start server
    try {
    app.listen(PORT, () => {
      console.log("──────────────────────────────────────────────────────────────")
      console.log(chalk.white('\n🔥  Server started  on port ' + PORT +`, Environment: ${process.env.NODE_ENV} `));


    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});



startServer();

module.exports = app;