  [← Previous: Contributing](./contributing.md)

# API Routes Documentation

This document describes the available API routes defined in the `routes` folder. Each route includes its HTTP method, endpoint, description, authentication requirements, and example requests and responses.

---

## 1. POST `/api/wheel/draw`

- **Description:** Performs a wheel draw for the authenticated user.
- **Access:** Private (requires authentication)

### Example Request

```
POST /api/rewards/draw-wheel
Authorization: Bearer <token>

```

### Example Response

```
{
    "success": true,
    "data": {
        "message": "Congratulations! You won Short Layered Bob",
        "remainingSpins": 1
    }
}
```

---

## 2. POST `/api/configure/{category}`

- **Description:** Configure the items available for the specified category (admin only).
- **Access:** Private (requires authentication)

### Example Request

```
POST /api/configure/wheel
Authorization: Bearer <admin_token>
Content-Type: application/json

{
"wheel_items":
 [
    {
      "ii_id":[1110110,1110240,1110151],
      "ii_name": "Anesidora Set",
      "ii_option":"Speed++"
    },
    {
      "ii_id":1110340,
      "ii_name": "Anesidora Set",
      "ii_option":"Speed++"
    }

]
}
```

### Example Response (200)

```
{
  "success": true,
  "message": "Wheel items configured successfully."
}
```

### Example Response (400)

```
{
    "success": false,
    "error": "Import operation failed, Please ensure all itemIds are valid and try again.",
    "validItemIds": [
        1532350
    ],
    "invalidItemIds": [
            25245242,
            252424,
            2452245,
            2452245
        ]
}


## (Commented/Planned Routes)

### POST `/api/hourly-rewards/draw`
- **Description:** Claims the hourly reward for the authenticated user. (Currently not implemented)

### POST `/api/claim-achievement`
- **Description:** Claims a specific achievement for the user. (Currently not implemented)
- **Request Body:** `{ "achievementId": "someId123" }`

---

**Note:** All endpoints require a valid JWT token in the `Authorization` header. Admin-only endpoints require the user to have admin privileges.

---

[Docs Home](./index.md)
```
