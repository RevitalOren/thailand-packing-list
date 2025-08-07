# Thailand Packing List

A family packing list application for a Thailand trip with automatic local file persistence.

## Features

- 🎒 Individual packing lists for 5 family members
- ✅ Check/uncheck items as you pack
- ➕ Add custom items to any list
- ✏️ Edit existing items
- 🗑️ Delete items you don't need
- 💾 Automatic saving to local file storage
- 📱 Responsive design for mobile and desktop
- 🌐 Hebrew RTL support

## Local Storage Solution

This app uses local file storage instead of Google Sheets for better reliability and Docker deployment.

### How it works:
- **Frontend**: React app with Vite
- **Backend**: Express.js API server
- **Storage**: JSON file in `/data` directory
- **Backup**: localStorage for redundancy

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd thailand-packing-list

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Docker Build
```bash
# Build the image
docker build -t thailand-packing-list .

# Run the container
docker run -d \
  --name thailand-packing-list \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  thailand-packing-list

# View logs
docker logs -f thailand-packing-list
```

## Development Setup

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/family-data` - Load family packing data
- `POST /api/family-data` - Save family packing data

## Data Persistence

### File Location
- **Development**: `./data/packing-list.json`
- **Docker**: `/app/data/packing-list.json` (mounted to host `./data/`)

### Backup Strategy
1. **Primary**: Local JSON file
2. **Secondary**: Browser localStorage
3. **Archive**: Automatic timestamped backups

### Data Structure
```json
{
  "יונתן": {
    "items": [
      {
        "id": "unique-id",
        "name": "📄 דרכון + ויזה",
        "checked": false
      }
    ],
    "newItem": ""
  },
  "lastUpdated": "2024-01-01T00:00:00Z",
  "version": "1.0"
}
```

### Auto-Save Behavior
- Changes are automatically saved to local file after 2 seconds of inactivity
- Visual indicators show save status
- Manual save button available
- localStorage backup ensures no data loss

## Family Members & Items

### Kids (יונתן, תמר, אילון)
- Enhanced with kid-specific items
- Entertainment items for flights
- Child-appropriate quantities

### Adults (עמית, רויטל)
- Travel documents and insurance
- Adult medications and tech items
- Larger clothing quantities

## Docker Deployment Benefits

✅ **No External Dependencies**: No Google Sheets API needed  
✅ **Reliable**: File-based storage with automatic backups  
✅ **Portable**: Run anywhere Docker is supported  
✅ **Persistent**: Data survives container restarts  
✅ **Simple**: Single container deployment

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs thailand-packing-list

# Check health
docker exec thailand-packing-list curl -f http://localhost:3001/api/health
```

### Data not persisting
```bash
# Verify volume mount
docker inspect thailand-packing-list | grep -A 10 Mounts

# Check data directory permissions
ls -la ./data/
```

### Port conflicts
```bash
# Use different port
docker run -p 8080:3001 thailand-packing-list
```

## License

MIT License - Feel free to use for your own family trips! 🌴✈️