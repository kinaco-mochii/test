# Todo CRUD API

A simple REST API for managing todos with full CRUD (Create, Read, Update, Delete) operations.

## Features

- ✅ Create new todos
- ✅ List all todos
- ✅ Get individual todo by ID
- ✅ Update existing todos
- ✅ Delete todos
- ✅ Input validation
- ✅ Error handling
- ✅ Health check endpoint

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the API is running

### Todo Operations

#### Get All Todos
- **GET** `/todos`
- Returns all todos with pagination info

#### Create Todo
- **POST** `/todos`
- Request body:
  ```json
  {
    "title": "Todo title (required)",
    "description": "Optional description"
  }
  ```

#### Get Todo by ID
- **GET** `/todos/:id`
- Returns a specific todo

#### Update Todo
- **PUT** `/todos/:id`
- Request body (all fields optional):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "completed": true
  }
  ```

#### Delete Todo
- **DELETE** `/todos/:id`
- Deletes a specific todo

## Response Format

All responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Todo Object Structure

```json
{
  "id": 1,
  "title": "Todo title",
  "description": "Todo description",
  "completed": false,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Testing

Run the test suite:
```bash
npm test
```

Make sure the server is running before running tests.

## Example Usage

### Create a new todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Node.js", "description": "Complete the tutorial"}'
```

### Get all todos
```bash
curl http://localhost:3000/todos
```

### Update a todo
```bash
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete a todo
```bash
curl -X DELETE http://localhost:3000/todos/1
```