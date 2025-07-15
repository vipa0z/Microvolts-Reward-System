# Memory Loading System

## Overview

The Memory Loading System is designed to load configuration items (shop items, wheel items, etc.) into memory when the server starts. This improves performance by avoiding repeated file system access and database queries when these items are needed.

## How It Works

1. When the server starts, the `MemoryLoader` service loads all configuration items from JSON files into memory.
2. Services like `SpinningWheel` and `ShopService` access these items directly from memory instead of reading from files or querying the database.
3. This results in faster response times for users when they interact with the shop, wheel, and other features.

## Components

### MemoryLoader Service

The `MemoryLoader` service (`services/MemoryLoader.js`) is responsible for:

- Loading all configuration items into memory at server startup
- Providing methods to access items from memory
- Allowing reloading of specific categories if needed

```javascript
// Example of accessing items from memory
const wheelItems = MemoryLoader.getItems('wheel_items');
```

### Server Initialization

In `server.js`, the memory loading is initialized after config validation:

```javascript
// Load all items into memory for faster access
const MemoryLoader = require('./services/MemoryLoader');
await MemoryLoader.loadAllItems();
```

### Services Using Memory-Loaded Items

1. **SpinningWheel Service** - Uses memory-loaded wheel items for the spinning wheel feature
2. **ShopService** - Uses memory-loaded shop items for the shop feature

## Benefits

- **Improved Performance**: Items are loaded once at startup, eliminating repeated file I/O operations
- **Reduced Database Load**: Fewer database queries are needed
- **Faster Response Times**: Users experience quicker responses when interacting with features
- **Centralized Management**: All item loading is managed in one place

## Maintenance

If you need to update items while the server is running:

1. Update the JSON configuration file
2. Call `MemoryLoader.reloadCategory('category_name')` to refresh the items in memory

```javascript
// Example of reloading wheel items after updating the JSON file
await MemoryLoader.reloadCategory('wheel_items');
```

## Configuration Files

The system uses the following configuration files:

- `configs/wheel_items.json` - Items for the spinning wheel
- `configs/shop_items.json` - Items for the shop
- `configs/hourly_reward_items.json` - Items for hourly rewards
- `configs/achievement_items.json` - Items for achievements