[← Previous: Configuration](./configuration.md)

# Environment Variables

The server is configured using a `.env` file in the root of the project. This file contains sensitive information and should not be committed to version control. Below is a description of the available variables.

### Server Configuration

- `PORT`: The port on which the server will run. (Default: `4000`)
- `NODE_ENV`: The environment mode. (e.g., `development`, `production`)
- `HOST`: The server's host address. (e.g., `http://localhost`)

### Database Configuration

- `DB_HOST`: The hostname of the database server. (Default: `localhost`)
- `DB_PORT`: The port of the database server. (Default: `3306`)
- `DB_NAME`: The name of the database to use.
- `DB_USER`: The username for database authentication.
- `DB_PASSWORD`: The password for database authentication.

### JWT Configuration

- `JWT_SECRET`: The secret key for signing standard JSON Web Tokens.
- `JWT_EXPIRES_IN`: The expiration time for standard JWTs (e.g., `24h`).
- `JWT_REFRESH_EXPIRES_IN`: The expiration time for refresh tokens (e.g., `7d`).
- `ADMIN_JWT_SECRET`: A separate secret key for signing admin-level JWTs.

### Game-Specific Settings

- `EVENT_NAME`: The name of the current in-game shop event (e.g., `halloween`).
- `EVENT_CURRENCY`: The currency used for the current event (e.g., `candies`).
- `HOURLY_PLAYTIME_REWARD_INTERVAL`: The interval in hours for hourly playtime rewards.
- `WHEEL_UNLOCK_AFTER_PLAYTIME`: The required playtime in minutes to unlock the referral wheel.
- `MINIMUM_GRADE_TO_CONFIGURE`: The minimum user grade required to access configuration settings.

---

[Next: Contributing →](./contributing.md)

