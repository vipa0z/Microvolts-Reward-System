[← Previous: Introduction](./index.md)

# Database Setup

The server requires a MySQL database to function. To support the new features, several changes are made to the database schema upon initialization.

### New `valid_items` Table

A new table named `valid_items` is created to store a list of all valid item IDs in the game. This table is used to validate items added to the various reward systems (e.g., wheel, shop), preventing invalid items from being added to the configuration.

The table has a simple schema:

```sql
CREATE TABLE valid_items (
  itemId INT PRIMARY KEY UNIQUE
);
```

### New Fields in `users` Table

---

To track user-specific reward data, the following fields are added to the `users` table:

- `WheelSpinsClaimed` (INT, DEFAULT 0): Tracks the number of wheel spins a user has claimed.
- `dailyPlayTime` (INT, DEFAULT 0): Tracks the user's playtime for daily rewards.
- `dailySpinsClaimed` (INT, DEFAULT 0): Tracks daily spin claims.

### Automatic Database Population with `--populate`

To simplify the initial setup, you can run the server with a `--populate` flag. This will automatically perform the following actions:

1.  **Create `valid_items` Table**: If the table doesn't already exist, it will be created.
2.  **Add User Fields**: It will check for and add the new fields to the `users` table if they are missing.
3.  **Populate `valid_items`**: It will read a JSON file (by default `configs/iteminfo.json`) and populate the `valid_items` table with all the item IDs found in the file.

To use this feature, simply start the server with the following command:

```bash
node server.js --populate
```
[Next: Configuration →](./configuration.md)

