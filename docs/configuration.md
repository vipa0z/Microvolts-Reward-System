# Configuration

The server's reward systems are configured through JSON files located in the `configs/` directory. This makes it easy to add, remove, or modify rewards without changing the server's code.

### Configuration Endpoint

While not fully implemented for all features, the architecture supports a configuration endpoint that allows for dynamic updates to the reward items. This will eventually provide an easy way to manage rewards through a GUI or API calls.

### Manual Configuration

You can also configure the rewards manually by editing the JSON files in the `configs/` directory. For example, to add items to the referral wheel, you would edit `configs/wheel_items.json`.
if you were hosting on a seperate server you could copy the files using scp:
```
scp wheel_items.json user@server:<pathto-overvolt/configs>
```

Each configuration file should contain a JSON object with a key that matches the feature (e.g., `"wheel_items"`) and an array of item objects.

Example `wheel_items.json`:

```json
{
    "wheel_items": [
        {
            "ii_id": 12345, 
            "name": "Awesome Item",
            "duration": 30
        }
    ]
}
```
response
```
{
    "success": true,
data: {
    "message": "2 item(s) added to wheel_items and memory cache updated."
     ii_id: [141414,242556]
   }
}
```

### Configuration Validation

To ensure the integrity of the reward systems, the server automatically validates all configuration files in the `configs/` directory on startup. The validation process includes:

1. **File Existence**: If a configuration file is missing, the server will create it with a default empty structure.
2. **JSON Structure**: It checks if the file contains valid JSON and the expected root key (e.g., `"wheel_items"`).
3. **Item ID Validation**: It extracts all item IDs from the configuration file and checks them against the `valid_items` table in the database. If any invalid item IDs are found, a warning is logged to the console.

This validation process prevents server crashes due to misconfiguration and ensures that only valid items are available as rewards.

---
## Memory Loading System

The Memory Loading System is designed to load configuration items (shop items, wheel items, etc.) into memory when the server starts. This improves performance by avoiding repeated file system access and database queries when these items are needed.

## How It Works

1. When the server starts, the `MemoryLoader` service loads all configuration items from JSON files into memory.
2. Services like `SpinningWheel` and `ShopService` access these items directly from memory instead of reading from files or querying the database.
3. This results in faster response times for users when they interact with the shop, wheel, and other features.


### Services Using Memory-Loaded Items

1. **SpinningWheel Service** - Uses memory-loaded wheel items for the spinning wheel feature
2. **ShopService** - Uses memory-loaded shop items for the shop feature


[Next: Environment Variables →](./environment-variables.md)
