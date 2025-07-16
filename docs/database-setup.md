[← Previous: Introduction](./index.md)

# Database Setup

The server requires a MySQL database to function. To support the new features, several changes are made to the database schema upon initialization.


To track user-specific reward data, the following fields are added to the `users` table:

- `WheelSpinsClaimed` (INT, DEFAULT 0): Tracks the number of wheel spins a user has claimed.
- `dailyPlayTime` (INT, DEFAULT 0): Tracks the user's playtime for daily rewards.
- `dailySpinsClaimed` (INT, DEFAULT 0): Tracks daily spin claims.

### Automatic Database Population with `--populate`

To simplify the initial setup, you can run the server with a `--populate` flag. This will automatically perform the following actions:

2.  **Add User Fields**: It will check for and add the new fields to the `users` table if they are missing.

To use this feature, simply start the server with the following command:

```bash
node server.js --populate
```
[Next: Configuration →](./configuration.md)

