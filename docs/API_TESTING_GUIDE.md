# API Testing Guide

This guide shows how to test TripGenie API endpoints using curl, Postman, or the built-in Swagger UI.

## Quick Start with Swagger UI

1. Start the backend: `python -m uvicorn app.main:app --reload`
2. Open browser: http://localhost:8000/docs
3. Click "Authorize" button
4. Enter credentials for any endpoint
5. Click "Try it out" and "Execute"

---

## Testing with cURL

### 1. Register New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123",
    "full_name": "Test User"
  }'

# Response will include:
# {
#   "access_token": "eyJhbGc...",
#   "refresh_token": "eyJhbGc...",
#   "token_type": "bearer"
# }
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@tripgenie.com",
    "password": "Demo123!"
  }'
```

**Save the token for next requests:**
```bash
TOKEN="eyJhbGc..." # From response above
```

### 3. Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create Trip

```bash
curl -X POST http://localhost:8000/api/v1/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paris Vacation",
    "description": "5-day trip to Paris",
    "starting_location": "Bengaluru",
    "destination": "Paris",
    "start_date": "2024-12-10T00:00:00",
    "end_date": "2024-12-15T00:00:00",
    "num_travelers": 2,
    "total_budget": 150000,
    "currency": "INR",
    "travel_style": "Culture & Food"
  }'

# Save the trip ID for next requests
TRIP_ID="1" # From response
```

### 5. Get All Trips

```bash
curl -X GET "http://localhost:8000/api/v1/trips?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get Trip Details

```bash
curl -X GET http://localhost:8000/api/v1/trips/$TRIP_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Generate Trip with Agents

```bash
curl -X POST http://localhost:8000/api/v1/trips/$TRIP_ID/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "travelers": [
      {
        "name": "Ashwini",
        "age": 25,
        "interests": ["Museums", "Food"],
        "budget_preference": "Medium",
        "activity_intensity": "Moderate"
      },
      {
        "name": "Friend",
        "age": 24,
        "interests": ["Shopping", "Food"],
        "budget_preference": "Medium",
        "activity_intensity": "High"
      }
    ],
    "interests": ["Museums", "Food", "Shopping"],
    "food_preferences": ["French", "Italian"],
    "hotel_preference": "Comfort",
    "transportation_preference": "Flight"
  }'
```

### 8. Get Budget Summary

```bash
curl -X GET http://localhost:8000/api/v1/trips/$TRIP_ID/budget \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "total_budget": 150000,
#   "estimated_cost": 130000,
#   "remaining_budget": 20000,
#   "utilization_percentage": 86.67,
#   "cost_per_traveler": 65000,
#   "breakdown": {
#     "Flights": 45000,
#     "Accommodation": 50000,
#     "Food": 20000,
#     ...
#   },
#   "currency": "INR"
# }
```

### 9. Get Risk Analysis

```bash
curl -X GET http://localhost:8000/api/v1/trips/$TRIP_ID/risks \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Get Readiness Score

```bash
curl -X GET http://localhost:8000/api/v1/trips/$TRIP_ID/readiness \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "overall_score": 87.0,
#   "checks": [
#     {
#       "item": "Flights booked",
#       "status": "Completed",
#       "weight": 0.25
#     },
#     ...
#   ],
#   "calculation_method": "Weighted completion of planning tasks",
#   "recommendation": "Complete remaining tasks..."
# }
```

### 11. Simulate Trip Changes

```bash
curl -X POST http://localhost:8000/api/v1/trips/$TRIP_ID/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 120000,
    "num_travelers": 3,
    "activity_intensity": "Light"
  }'
```

### 12. Get User Preferences

```bash
curl -X GET http://localhost:8000/api/v1/preferences \
  -H "Authorization: Bearer $TOKEN"
```

### 13. Update User Preferences

```bash
curl -X PUT http://localhost:8000/api/v1/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "favorite_activities": ["Museums", "Food", "Photography"],
    "food_preferences": ["French", "Italian", "Asian"],
    "hotel_preference": "Comfort",
    "transportation_preference": "Flight"
  }'
```

---

## Postman Collection

### Setup

1. Create new Postman collection: "TripGenie API"
2. Create environment: "Local Dev"
3. Add environment variables:
   - `BASE_URL`: http://localhost:8000/api/v1
   - `TOKEN`: (will be set after login)

### Add Requests

Create these requests in Postman:

```
1. Auth
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me

2. Trips
   - POST /trips (Create)
   - GET /trips (List)
   - GET /trips/{{trip_id}}
   - PUT /trips/{{trip_id}} (Update)
   - DELETE /trips/{{trip_id}}
   - POST /trips/{{trip_id}}/generate

3. Trip Analysis
   - GET /trips/{{trip_id}}/budget
   - GET /trips/{{trip_id}}/risks
   - GET /trips/{{trip_id}}/readiness
   - POST /trips/{{trip_id}}/simulate

4. Preferences
   - GET /preferences
   - PUT /preferences
```

### Pre-request Script (for login)

Add to login request:

```javascript
// This will run after login
pm.test("Login Successful", function () {
    pm.response.to.have.status(200);
});

pm.globals.set("token", pm.response.json().access_token);
```

### Authorization Header

Add to all protected requests:

```
Authorization: Bearer {{TOKEN}}
```

---

## Testing Workflow

### 1. User Registration & Authentication

```bash
# Register
RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "SecurePass123"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

### 2. Trip Creation & Generation

```bash
# Create trip
TRIP=$(curl -s -X POST http://localhost:8000/api/v1/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Trip",
    "starting_location": "Bengaluru",
    "destination": "Paris",
    "start_date": "2024-12-10T00:00:00",
    "end_date": "2024-12-15T00:00:00",
    "num_travelers": 2,
    "total_budget": 150000,
    "currency": "INR"
  }')

TRIP_ID=$(echo $TRIP | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Trip ID: $TRIP_ID"

# Generate trip
curl -s -X POST http://localhost:8000/api/v1/trips/$TRIP_ID/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"travelers": [], "interests": []}'
```

### 3. Verify Results

```bash
# Check budget
curl -s http://localhost:8000/api/v1/trips/$TRIP_ID/budget \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check readiness
curl -s http://localhost:8000/api/v1/trips/$TRIP_ID/readiness \
  -H "Authorization: Bearer $TOKEN" | jq '.overall_score'

# Check risks
curl -s http://localhost:8000/api/v1/trips/$TRIP_ID/risks \
  -H "Authorization: Bearer $TOKEN" | jq '.risk_count'
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Invalid token"
}
```
**Solution**: Login again and use new token

### 404 Not Found
```json
{
  "detail": "Trip not found"
}
```
**Solution**: Check trip ID is correct

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```
**Solution**: Check request format matches schema

### 500 Server Error
```json
{
  "detail": "Internal server error"
}
```
**Solution**: Check backend logs for error

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Get all trips (10 requests, 5 concurrent)
ab -n 10 -c 5 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/trips
```

### Load Test with wrk

```bash
# 1000 requests, 10 threads, 10 connections
wrk -t10 -c10 -d30s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/trips
```

---

## Rate Limiting

Current rate limits (when implemented):
- Public endpoints: 100 requests/hour
- Protected endpoints: 1000 requests/hour
- Login: 5 requests/minute

---

## Common Test Cases

### Test 1: Complete Trip Planning
1. Register user
2. Create trip
3. Add travelers
4. Generate trip
5. Check budget
6. Check readiness
7. Simulate changes
8. View results

### Test 2: Multi-traveler Conflict
1. Create trip with 3 travelers
2. Set conflicting preferences
3. Generate trip
4. Check preference analysis
5. Verify compromises

### Test 3: Budget Edge Cases
1. Create trip with very tight budget
2. Generate trip
3. Check for budget warnings
4. Simulate with reduced budget
5. Verify cost changes

---

## Debugging Tips

### Enable verbose logging
```bash
export LOG_LEVEL=DEBUG
python -m uvicorn app.main:app --reload --log-level debug
```

### Check database state
```bash
psql -U tripgenie -d tripgenie_db -c "\dt"
```

### View request logs
```bash
# In another terminal
tail -f logs/access.log
```

---

## API Response Examples

### Successful Trip Generation
```json
{
  "id": 1,
  "trip_id": 1,
  "run_type": "generation",
  "status": "completed",
  "started_at": "2024-10-03T17:00:00",
  "completed_at": "2024-10-03T17:00:05",
  "created_at": "2024-10-03T17:00:00",
  "agent_results": [
    {
      "id": 1,
      "run_id": 1,
      "agent_name": "Flight Agent",
      "status": "success",
      "input_data": {...},
      "output_data": {...},
      "error_message": null,
      "started_at": "2024-10-03T17:00:00",
      "completed_at": "2024-10-03T17:00:01"
    },
    ...
  ]
}
```

---

**Happy Testing! 🚀**
