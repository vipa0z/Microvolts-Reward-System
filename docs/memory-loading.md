# Memory Loading System

## Overview

The Memory Loading System is designed to load configuration items (shop items, wheel items, etc.) into memory when the server starts. This improves performance by avoiding repeated file system access and database queries when these items are needed.

## How It Works

1. When the server starts, the `MemoryLoader` service loads all configuration items from JSON files into memory.
2. Services like `SpinningWheel` and `ShopService` access these items directly from memory instead of reading from files or querying the database.
3. This results in faster response times for users when they interact with the shop, wheel, and other features.


### Services Using Memory-Loaded Items

1. **SpinningWheel Service** - Uses memory-loaded wheel items for the spinning wheel feature
2. **ShopService** - Uses memory-loaded shop items for the shop feature

