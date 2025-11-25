# Next-Generation Features - Technical Specification

## Overview

This document outlines the implementation plan for advanced features that will transform Ardhisasa Lite into a next-generation digital land parcel system with AR guidance, AI processing, and comprehensive analytics.

---

## 1. 🚶 Interactive Parcel Boundary Walk Mode (AR Mode)

### Objective
Enable landowners to physically walk their property boundaries with real-time AR guidance and GPS tracking.

### Technical Stack
- **Mobile:** React Native with Expo
- **AR Framework:** react-native-arkit (iOS) / ARCore (Android)
- **GPS:** react-native-geolocation-service
- **Compass:** react-native-sensors
- **Camera:** react-native-camera

### Implementation Steps

#### Phase 1: GPS Tracking
```javascript
// Components needed
- GPSTracker component
- CoordinateManager service
- AccuracyCalculator utility

// Features
- Real-time position updates (1Hz)
- Accuracy monitoring (show radius)
- Track path history
- Export GPX file
```

#### Phase 2: AR Markers
```javascript
// AR Boundary Markers
- Corner point markers (red spheres)
- Line segments between corners
- Distance labels
- Elevation indicators

// Rendering
- 3D marker placement at GPS coordinates
- Scale markers based on distance
- Rotate with device compass
```

#### Phase 3: Guidance System
```javascript
// Real-time Feedback
- Distance to next corner
- Direction arrow (compass bearing)
- "You are 2m from southwest corner"
- Accuracy warnings
- Completion tracking (% of boundary walked)

// UI Elements
- HUD overlay with distance/bearing
- Mini-map with current position
- Progress indicator
- Photo capture at each corner
```

### API Endpoints
```javascript
POST /api/parcels/:id/start-walk    // Initialize walk session
POST /api/parcels/:id/record-point  // Record GPS point
POST /api/parcels/:id/complete-walk // Finalize and validate
GET  /api/parcels/:id/walk-history  // Previous walk sessions
```

### Data Model
```javascript
WalkSession {
  parcelId: ObjectId,
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  recordedPoints: [{
    lat: Number,
    lng: Number,
    accuracy: Number,
    timestamp: Date,
    photo: String
  }],
  accuracy: Number,
  perimeter: Number,
  status: 'in_progress' | 'completed' | 'abandoned'
}
```

---

## 2. 🛰️ Advanced Satellite Parcel Visualization

### Objective
Overlay parcel boundaries on high-resolution satellite imagery for real-world context.

### Technical Stack
- **Mapping:** MapLibre GL JS / Mapbox GL JS
- **Satellite Layers:** Google Maps API, Mapbox Satellite
- **Frontend:** React + react-map-gl

### Implementation

#### Map Provider Configuration
```javascript
// src/services/mapProviders.js
export const mapProviders = {
  googleSatellite: {
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '© Google'
  },
  mapboxSatellite: {
    url: 'mapbox://styles/mapbox/satellite-v9',
    accessToken: process.env.VITE_MAPBOX_TOKEN
  },
  openStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  }
};
```

#### Parcel Overlay Component
```javascript
// Components
<MapView 
  provider="googleSatellite"
  center={parcel.center}
  zoom={18}
>
  <ParcelBoundary 
    coordinates={parcel.boundary}
    color="#FF0000"
    opacity={0.7}
  />
  <NeighborParcels 
    visible={showNeighbors}
    opacity={0.3}
  />
</MapView>
```

#### API Integration
```javascript
GET /api/parcels/:id/map-data  // Parcel + neighbors geometry
GET /api/parcels/:id/satellite  // Satellite imagery metadata
```

---

## 3. 🏘️ Neighbor Parcel & Ownership Context

### Objective
Display adjacent parcels with ownership information and history for transparency.

### Implementation

#### Spatial Query
```javascript
// Backend: controllers/parcel.controller.js
exports.getNeighbors = async (req, res) => {
  const parcel = await Parcel.findById(req.params.id);
  
  // Find parcels within buffer distance
  const neighbors = await Parcel.find({
    geometry: {
      $geoIntersects: {
        $geometry: {
          type: "Polygon",
          coordinates: parcel.buffer(50) // 50m buffer
        }
      }
    },
    _id: { $ne: parcel._id }
  }).populate('owner', 'firstName lastName');
  
  res.json({ success: true, data: neighbors });
};
```

#### UI Components
```javascript
// NeighborPanel.jsx
<div className="neighbor-panel">
  <h3>Adjacent Parcels</h3>
  {neighbors.map(neighbor => (
    <NeighborCard
      key={neighbor._id}
      parcel={neighbor}
      owner={neighbor.owner}
      onViewHistory={() => showHistory(neighbor._id)}
      onViewOnMap={() => highlightParcel(neighbor._id)}
    />
  ))}
</div>
```

---

## 4. 📴 Offline Parcel Access

### Objective
Cache parcel data locally for rural areas with poor connectivity.

### Technical Stack
- **Storage:** IndexedDB (Dexie.js)
- **Sync:** Background Sync API
- **Service Worker:** Workbox

### Implementation

#### Offline Storage
```javascript
// src/db/offlineDB.js
import Dexie from 'dexie';

const db = new Dexie('ArdhisasaOffline');
db.version(1).stores({
  parcels: 'id, titleNumber, county, lastSync',
  walkSessions: '++id, parcelId, status',
  mapTiles: '[z+x+y], data, timestamp'
});

export const cacheParcel = async (parcel) => {
  await db.parcels.put({
    ...parcel,
    lastSync: new Date()
  });
};

export const getCachedParcel = async (id) => {
  return await db.parcels.get(id);
};
```

#### Service Worker
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/parcels/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

#### Sync Strategy
```javascript
// Auto-sync when online
window.addEventListener('online', async () => {
  const pendingWalks = await db.walkSessions
    .where('status').equals('pending_sync')
    .toArray();
  
  for (const walk of pendingWalks) {
    await api.post(`/parcels/${walk.parcelId}/complete-walk`, walk);
    walk.status = 'synced';
    await db.walkSessions.put(walk);
  }
});
```

---

## 5. 📐 Parcel Area & Distance Calculator

### Objective
Provide interactive measurement tools for area, perimeter, and distances.

### Implementation

#### Calculation Utilities
```javascript
// src/utils/geoCalculations.js
import * as turf from '@turf/turf';

export const calculateArea = (coordinates) => {
  const polygon = turf.polygon([coordinates]);
  const area = turf.area(polygon); // square meters
  return {
    sqm: area,
    acres: area / 4046.86,
    hectares: area / 10000
  };
};

export const calculatePerimeter = (coordinates) => {
  const lineString = turf.lineString([...coordinates, coordinates[0]]);
  return turf.length(lineString, { units: 'meters' });
};

export const calculateSideLengths = (coordinates) => {
  return coordinates.map((coord, i) => {
    const next = coordinates[(i + 1) % coordinates.length];
    return turf.distance(coord, next, { units: 'meters' });
  });
};
```

#### Interactive UI
```javascript
// MeasurementTool.jsx
const MeasurementTool = ({ parcel }) => {
  const [mode, setMode] = useState('area'); // area, distance, corners
  const [points, setPoints] = useState([]);
  
  const measurements = {
    area: calculateArea(points),
    perimeter: calculatePerimeter(points),
    sideLengths: calculateSideLengths(points)
  };
  
  return (
    <div className="measurement-panel">
      <ModeSelector onChange={setMode} />
      <ResultsDisplay measurements={measurements} />
      <ExportButton format="pdf" data={measurements} />
    </div>
  );
};
```

---

## 6. 🤖 AI Boundary Correction

### Objective
Extract parcel boundaries from scanned survey maps using computer vision and OCR.

### Technical Stack
- **Backend:** Python FastAPI microservice
- **CV:** OpenCV, scikit-image
- **OCR:** Tesseract, EasyOCR
- **Coordinates:** GDAL, GeoPandas

### Implementation

#### Python Microservice
```python
# services/ai-boundary/main.py
from fastapi import FastAPI, UploadFile
import cv2
import numpy as np
from shapely.geometry import Polygon
import json

app = FastAPI()

@app.post("/extract-boundary")
async def extract_boundary(file: UploadFile):
    # Read image
    image = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    
    # Preprocess
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Extract largest polygon (assumed to be parcel)
    largest = max(contours, key=cv2.contourArea)
    approx = cv2.approxPolyDP(largest, 0.01 * cv2.arcLength(largest, True), True)
    
    # Convert to geo-coordinates (requires calibration points)
    coordinates = calibrate_to_geo(approx)
    
    # Create GeoJSON
    geojson = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coordinates]
        },
        "properties": {
            "confidence": calculate_confidence(approx),
            "area": Polygon(coordinates).area
        }
    }
    
    return geojson
```

#### Integration with Main App
```javascript
// Frontend upload component
const AIBoundaryUpload = () => {
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      'http://ai-service:8000/extract-boundary',
      formData
    );
    
    // Display extracted boundary for review
    setExtractedBoundary(response.data);
  };
  
  return (
    <div>
      <FileUpload onUpload={handleUpload} />
      {extractedBoundary && (
        <BoundaryReview 
          boundary={extractedBoundary}
          onApprove={saveBoundary}
          onEdit={editBoundary}
        />
      )}
    </div>
  );
};
```

---

## 7. ⚠️ Land Dispute Highlighting

### Objective
Automatically detect and visualize potential boundary conflicts and overlaps.

### Implementation

#### Spatial Analysis
```javascript
// Backend: services/disputeDetection.js
exports.detectDisputes = async (parcelId) => {
  const parcel = await Parcel.findById(parcelId);
  
  // Find overlapping parcels
  const overlaps = await Parcel.aggregate([
    {
      $geoIntersects: {
        $geometry: parcel.geometry
      }
    },
    { $match: { _id: { $ne: parcel._id } } },
    {
      $project: {
        titleNumber: 1,
        owner: 1,
        overlapArea: {
          $area: { $intersection: ['$geometry', parcel.geometry] }
        }
      }
    }
  ]);
  
  // Check for ambiguous coordinates
  const ambiguities = detectAmbiguousPoints(parcel.geometry);
  
  // Check admin flags
  const adminFlags = await DisputeFlag.find({ parcelId });
  
  return {
    overlaps,
    ambiguities,
    adminFlags,
    riskScore: calculateRiskScore(overlaps, ambiguities, adminFlags)
  };
};
```

#### Visualization
```javascript
// DisputeMap.jsx
<MapView>
  {/* Current parcel */}
  <ParcelLayer 
    data={parcel} 
    color="#00FF00"
  />
  
  {/* Overlapping parcels */}
  {disputes.overlaps.map(overlap => (
    <ParcelLayer
      key={overlap._id}
      data={overlap}
      color="#FF0000"
      opacity={0.5}
      pattern="diagonal-stripes"
    />
  ))}
  
  {/* Ambiguous points */}
  {disputes.ambiguities.map(point => (
    <Marker
      position={point.coordinates}
      icon="warning"
      tooltip={point.reason}
    />
  ))}
</MapView>
```

---

## 8. 🏛️ County Dashboard (Admin)

### Objective
Provide county admins with visual analytics and activity monitoring tools.

### Implementation

#### Heatmap Component
```javascript
// components/TransferHeatmap.jsx
import { HeatmapLayer } from 'react-map-gl';

const TransferHeatmap = ({ county, dateRange }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  
  useEffect(() => {
    fetchTransferActivity(county, dateRange).then(data => {
      // Convert to heatmap format
      const points = data.map(transfer => ({
        lat: transfer.parcel.center.lat,
        lng: transfer.parcel.center.lng,
        weight: 1
      }));
      setHeatmapData(points);
    });
  }, [county, dateRange]);
  
  return (
    <Map>
      <HeatmapLayer
        data={heatmapData}
        intensity={1}
        radius={30}
        gradient={['blue', 'green', 'yellow', 'red']}
      />
    </Map>
  );
};
```

#### Activity Tracking
```javascript
// API endpoints
GET /api/county-admin/dashboard/:county
Response: {
  totalParcels: 1247,
  activeTransfers: 23,
  pendingApprovals: 8,
  completedThisMonth: 15,
  recentActivity: [...],
  heatmapData: [...],
  topSubcounties: [...]
}
```

---

## 9. 🇰🇪 National Dashboard (NLC)

### Objective
National-level oversight with cross-county analytics and fraud detection.

### Implementation

#### National Map
```javascript
// NationalDashboard.jsx
const NationalDashboard = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <NationalMap
          parcels={allParcels}
          counties={counties}
          colorBy="activity" // activity, disputes, compliance
        />
      </div>
      
      <div className="col-span-1">
        <CountyPerformance counties={counties} />
        <FraudAlerts alerts={fraudAlerts} />
        <LandUsePatterns data={landUseData} />
      </div>
    </div>
  );
};
```

#### Fraud Detection Algorithm
```javascript
// services/fraudDetection.js
exports.detectFraud = async () => {
  const suspiciousPatterns = [];
  
  // Pattern 1: Rapid successive transfers
  const rapidTransfers = await Transfer.aggregate([
    {
      $group: {
        _id: '$parcelId',
        count: { $sum: 1 },
        transfers: { $push: '$$ROOT' }
      }
    },
    {
      $match: { 
        count: { $gte: 3 },
        'transfers.createdAt': { 
          $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
        }
      }
    }
  ]);
  
  // Pattern 2: Unusual ownership chains
  const unusualChains = detectOwnershipAnomalies();
  
  // Pattern 3: Duplicate coordinates
  const duplicates = await Parcel.aggregate([
    {
      $group: {
        _id: '$geometry',
        count: { $sum: 1 },
        parcels: { $push: '$$ROOT' }
      }
    },
    { $match: { count: { $gte: 2 } } }
  ]);
  
  return {
    rapidTransfers,
    unusualChains,
    duplicates,
    totalFlags: rapidTransfers.length + unusualChains.length + duplicates.length
  };
};
```

---

## 10. 📡 Location Accuracy Indicator

### Objective
Provide real-time GPS accuracy feedback to improve boundary precision.

### Implementation

#### Accuracy Monitor Component
```javascript
// components/AccuracyIndicator.jsx
const AccuracyIndicator = () => {
  const [accuracy, setAccuracy] = useState(null);
  const [satellites, setSatellites] = useState(0);
  
  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        setAccuracy(position.coords.accuracy);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    
    // Monitor GPS satellites (Android only)
    if (Platform.OS === 'android') {
      GpsInfo.getSatellites(setSatellites);
    }
  }, []);
  
  const getAccuracyLevel = () => {
    if (accuracy < 5) return { level: 'excellent', color: 'green' };
    if (accuracy < 10) return { level: 'good', color: 'blue' };
    if (accuracy < 20) return { level: 'fair', color: 'yellow' };
    return { level: 'poor', color: 'red' };
  };
  
  const status = getAccuracyLevel();
  
  return (
    <div className={`accuracy-indicator ${status.color}`}>
      <span>GPS Accuracy: {accuracy?.toFixed(1)}m</span>
      <span>{status.level.toUpperCase()}</span>
      <span>Satellites: {satellites}</span>
      
      {status.level === 'poor' && (
        <div className="tips">
          <p>⚠️ Poor GPS signal</p>
          <ul>
            <li>Move to an open area</li>
            <li>Avoid tall buildings/trees</li>
            <li>Wait for more satellites</li>
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## Implementation Priority

### Phase 1 (Q1 2026) - Foundation
1. ✅ Satellite Parcel Visualization
2. ✅ Parcel Area & Distance Calculator
3. ✅ Neighbor Parcel Context
4. ✅ Location Accuracy Indicator

### Phase 2 (Q2 2026) - Mobile & AR
5. 🔄 Interactive Boundary Walk Mode (AR)
6. 🔄 Offline Parcel Access
7. 🔄 Mobile App (React Native)

### Phase 3 (Q3 2026) - AI & Analytics
8. 🔄 AI Boundary Correction
9. 🔄 County Dashboard
10. 🔄 National Dashboard

### Phase 4 (Q4 2026) - Advanced Features
11. 🔄 Land Dispute Highlighting
12. 🔄 Automated Fraud Detection
13. 🔄 Predictive Analytics

---

## Technical Dependencies

### New Dependencies
```json
{
  "frontend": {
    "mapbox-gl": "^2.15.0",
    "react-map-gl": "^7.1.0",
    "@turf/turf": "^6.5.0",
    "dexie": "^3.2.4",
    "workbox-webpack-plugin": "^7.0.0"
  },
  "mobile": {
    "react-native": "^0.72.0",
    "expo": "^49.0.0",
    "react-native-maps": "^1.7.0",
    "react-native-geolocation-service": "^5.3.0",
    "react-native-sensors": "^7.3.6"
  },
  "ai-service": {
    "fastapi": "^0.104.0",
    "opencv-python": "^4.8.0",
    "pytesseract": "^0.3.10",
    "geopandas": "^0.14.0"
  }
}
```

---

## Estimated Timeline

- **Phase 1:** 2-3 months (Web features)
- **Phase 2:** 3-4 months (Mobile + AR)
- **Phase 3:** 2-3 months (AI + Analytics)
- **Phase 4:** 2-3 months (Advanced features)

**Total:** 9-13 months for complete implementation

---

## Budget Estimation

| Category | Cost (USD) |
|----------|------------|
| Mapbox API (Satellite) | $0 - $500/month |
| Google Maps API | $200 - $1000/month |
| Cloud Infrastructure | $100 - $500/month |
| AI Service (GPU) | $200 - $800/month |
| Mobile App Development | One-time: $5000-$15000 |
| **Total Annual** | **$12,000 - $35,000** |

---

**Last Updated:** November 25, 2025  
**Status:** Planning Phase  
**Next Review:** December 2025
