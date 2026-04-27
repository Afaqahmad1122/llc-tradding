# Shipping API Contract

This document defines the backend contract for frontend integration of dynamic shipping tables.

## Base Path

- `/shipping`

## Public Endpoints

### `GET /shipping/regions`

Returns active regions for top tab navigation.

Response:

```json
{
  "data": [
    {
      "id": "cuid",
      "name": "Shipping Info EUROPE (RO-RO)",
      "slug": "shipping-info-europe-ro-ro",
      "sortOrder": 0
    }
  ]
}
```

### `GET /shipping/regions/:slug/schedules`

Returns one region and its normalized table payload.

Response:

```json
{
  "region": {
    "id": "cuid",
    "name": "Shipping Info EUROPE (RO-RO)",
    "slug": "shipping-info-europe-ro-ro",
    "sortOrder": 0
  },
  "table": {
    "departurePorts": ["Yoko Hama", "Nagoya", "Kobe"],
    "arrivalPorts": ["Larnaca", "Dublin", "Southampton"],
    "rows": [
      {
        "id": "cuid",
        "company": "K-LINE",
        "shipName": "BANGKOK HIGHWAY",
        "voyage": "150",
        "sortOrder": 0,
        "departures": {
          "Yoko Hama": "Dec 16",
          "Nagoya": "-",
          "Kobe": "-"
        },
        "arrivals": {
          "Larnaca": "-",
          "Dublin": "-",
          "Southampton": "-"
        }
      }
    ]
  }
}
```

Notes:
- Frontend should render departure and arrival columns in the exact order returned by `departurePorts` and `arrivalPorts`.
- If a port value is missing for a row, frontend should display `-`.

## Admin Endpoints (Auth + Admin Role Required)

### Regions

- `GET /shipping/admin/regions?page=1&pageSize=10&search=&isActive=true|false&sort=latest|oldest|name`
- `POST /shipping/admin/regions`
- `PATCH /shipping/admin/regions/:id`
- `DELETE /shipping/admin/regions/:id` (soft delete: sets `isActive=false`)

Create/Patch body fields:

```json
{
  "name": "Shipping Info EUROPE (RO-RO)",
  "slug": "shipping-info-europe-ro-ro",
  "sortOrder": 0,
  "isActive": true
}
```

### Schedules

- `GET /shipping/admin/regions/:id/schedules`
- `GET /shipping/admin/schedules/:id`
- `POST /shipping/admin/regions/:id/schedules`
- `PATCH /shipping/admin/schedules/:id`
- `DELETE /shipping/admin/schedules/:id` (soft delete: sets `isActive=false`)

Create/Patch body fields:

```json
{
  "company": "K-LINE",
  "shipName": "BANGKOK HIGHWAY",
  "voyage": "150",
  "sortOrder": 0,
  "isActive": true
}
```

### Schedule Departure/Arrival Entries (Transactional Replace)

- `PUT /shipping/admin/schedules/:id/departures`
- `PUT /shipping/admin/schedules/:id/arrivals`

Replace departures request:

```json
{
  "entries": [
    { "portName": "Yoko Hama", "etdText": "Dec 16", "sortOrder": 0 },
    { "portName": "Nagoya", "etdText": "-", "sortOrder": 1 }
  ]
}
```

Replace arrivals request:

```json
{
  "entries": [
    { "portName": "Larnaca", "etaText": "-", "sortOrder": 0 },
    { "portName": "Dublin", "etaText": "Jan 30", "sortOrder": 1 }
  ]
}
```

Notes:
- Replace endpoints delete old entries and insert the provided list in one transaction.
- Duplicate `portName` values (case-insensitive) in the same request are rejected.

## Standard Response Shapes

List responses:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Error responses:

```json
{
  "message": "error text"
}
```
