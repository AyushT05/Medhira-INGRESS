# INGRES — Groundwater Intelligence

> **An AI-powered groundwater intelligence and visualization platform for exploring, analyzing, and comparing groundwater resources across India.**

INGRES (Groundwater Intelligence) provides an interactive interface for exploring groundwater data across India's administrative hierarchy — from **India → State → District → Block**.

The platform combines data from the **INGRES/CGWB-IITH groundwater portal** with AI-powered analysis through **Groq-hosted large language models**, allowing users to explore groundwater availability, extraction, recharge, rainfall, and water-stress indicators through interactive visualizations and natural-language queries.

---

## Features

### Interactive Groundwater Explorer

Navigate through India's groundwater data using a hierarchical interface:

```text
India
 └── State
      └── District
           └── Block
```

Data is loaded dynamically as locations are expanded, avoiding the need to load the entire dataset at once.

### Groundwater Statistics

For the currently selected location, INGRES displays important groundwater indicators including:

- Stage of Groundwater Extraction
- Groundwater Availability
- Annual Rainfall
- Total Groundwater Draft
- Future Groundwater Availability
- Total Groundwater Recharge

### AI Groundwater Analyst

Ask natural-language questions about the selected location.

Examples:

- "What is the groundwater stress status here?"
- "Which areas are over-exploited?"
- "How much groundwater is available for future use?"
- "Compare agriculture and domestic water draft."
- "Show groundwater availability trends across years."

The AI receives the currently selected location and its groundwater data as context, allowing responses to be based on the available dataset rather than generic groundwater knowledge.

### Charts & Visualizations

The platform supports dynamically generated visualizations including:

- Bar charts
- Line charts
- Pie charts
- Doughnut charts

The AI can request charts by returning structured `CHART_JSON` data, which is then interpreted and rendered by the application.

### Location Comparison

Compare multiple locations across different groundwater metrics.

Available comparison metrics include:

- Stage of Extraction
- Groundwater Availability
- Total Draft
- Total Recharge
- Future Availability
- Rainfall
- Agriculture Draft
- Domestic Draft

Comparison results can be displayed using charts as well as a tabular view.

### Interactive India Map

The application includes an interactive map of India that highlights:

- Selected states
- Locations involved in comparisons
- Selected groundwater regions

The map can also be expanded into a larger view for easier exploration.

### Multi-Year Analysis

Groundwater information can be explored across multiple assessment years:

- 2024–2025
- 2023–2024
- 2022–2023
- 2021–2022
- 2020–2021

This enables year-over-year analysis and trend visualization.

### Client-Side Caching

Frequently accessed location data is cached using browser `sessionStorage`.

This reduces unnecessary API requests while navigating between locations during a session.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend framework |
| JavaScript | Application development |
| React Scripts | Development and production tooling |
| Chart.js | Data visualization |
| D3.js | Geographic/data visualization utilities |
| Groq API | AI-powered groundwater analysis |
| Llama 3.3 70B | Default AI model |
| INGRES API | Groundwater data source |
| Session Storage | Client-side data caching |
| Local Storage | Local API key/model configuration |

---

## Architecture

The application is primarily a React single-page application.

```text
                         ┌──────────────────────┐
                         │      INGRES UI       │
                         │       React          │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ INGRES API   │  │   Groq API   │  │ Session      │
          │ Groundwater  │  │ AI Analysis  │  │ Storage      │
          │    Data      │  │              │  │ Cache        │
          └──────────────┘  └──────────────┘  └──────────────┘
                  │                 │
                  ▼                 ▼
          Groundwater Data    Natural Language
                              Analysis
                  │                 │
                  └────────┬────────┘
                           ▼
                 ┌─────────────────────┐
                 │ Charts / Map / Chat │
                 │   / Comparisons     │
                 └─────────────────────┘
```

---

## Data Source

Groundwater data is retrieved from the **INGRES platform of the Indian Institute of Technology Hyderabad (IITH)** through its public data API.

The application sends location-specific requests containing information such as:

- Location UUID
- Location name
- Location type
- Parent location
- Assessment year
- Assessment period
- Data view

The application then parses the response to identify summary records and child administrative locations.

---

## AI Analysis

INGRES uses the **Groq API** to provide natural-language groundwater analysis.

The application constructs a system prompt containing:

1. Current navigation path
2. Selected location
3. Selected assessment year
4. Groundwater statistics
5. Relevant sub-region information

The resulting context is provided to the selected Groq model.

### Supported Models

The application currently provides the following model options:

- **Llama 3.3 70B** — Best
- **Llama 3.1 8B** — Fastest
- **Mixtral 8x7B**
- **Gemma 2 9B**

The default model is:

```text
llama-3.3-70b-versatile
```

### Groundwater Classification

The AI analysis follows the following groundwater extraction classification:

| Stage of Extraction | Classification |
|---:|---|
| < 70% | Safe |
| 70–90% | Semi-Critical |
| 90–100% | Critical |
| > 100% | Over-Exploited |

---

## Project Structure

```text
Medhira-INGRESS/
│
├── public/
│   ├── index.html
│   ├── Medhira1.png
│   └── MedhiraDP.png
│
├── src/
│   │
│   ├── components/
│   │   ├── ApiKeyModal.jsx
│   │   ├── ChartWidget.jsx
│   │   ├── ChatArea.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── ComparisonPanel.jsx
│   │   ├── Header.jsx
│   │   ├── IndiaMap.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatsBar.jsx
│   │
│   ├── hooks/
│   │   └── useNodeCache.js
│   │
│   ├── App.jsx
│   ├── constants.js
│   ├── index.css
│   ├── index.js
│   └── utils.js
│
├── .gitignore
├── package.json
└── package-lock.json
```

---

## Component Overview

### `App.jsx`

The main application component.

Responsible for:

- Application state
- Current location
- Current assessment year
- AI API configuration
- Navigation path
- Map highlighting
- Chat/comparison tab selection
- Loading groundwater data

### `Sidebar.jsx`

Provides hierarchical navigation through groundwater locations.

Users can expand locations and drill down from:

```text
India → State → District → Block
```

### `ChatArea.jsx`

Provides the AI groundwater analysis interface.

It handles:

- User questions
- Groq API requests
- AI responses
- Quick prompts
- Chart extraction from AI responses
- Chat history

### `ComparisonPanel.jsx`

Provides multi-location groundwater comparison.

Users can select locations and assessment years and compare multiple groundwater metrics.

### `ChartWidget.jsx`

Handles rendering of dynamically generated charts using Chart.js.

### `IndiaMap.jsx`

Provides the interactive India map and location highlighting.

### `StatsBar.jsx`

Displays key groundwater statistics for the currently selected location.

### `useNodeCache.js`

Manages the location/data cache and dynamic hierarchical loading.

It uses `sessionStorage` to preserve cached data during the browser session.

### `utils.js`

Contains core functionality for:

- API requests
- Data parsing
- Location hierarchy handling
- AI prompt construction
- Chart configuration
- Groundwater data formatting

### `constants.js`

Contains:

- API configuration
- Location hierarchy
- State UUIDs
- Assessment years
- AI models
- Chart colors
- Groundwater metrics
- Quick prompts
- Map configuration

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- A Groq API key

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Medhira-INGRESS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

The application will start on the local development server, typically:

```text
http://localhost:3000
```

---

## Configuring the AI

On the first launch, INGRES displays an API key configuration dialog.

Enter your **Groq API key** and select the desired AI model.

The API key is stored in the browser's local storage:

```text
groq_key
```

The selected model is stored as:

```text
groq_model
```

> **Security note:** This application currently communicates with Groq directly from the browser. The API key is therefore available to the client-side application. For a production deployment, API requests should ideally be routed through a secure backend so that secret API credentials are not exposed to users.

---

## Building for Production

Create an optimized production build with:

```bash
npm run build
```

The generated production files will be placed in:

```text
build/
```

These files can be deployed to a static hosting provider.

---

## How It Works

### 1. Select a Location

The user starts at the India level and can expand the administrative hierarchy.

```text
INDIA
   ↓
STATE
   ↓
DISTRICT
   ↓
BLOCK
```

### 2. Fetch Groundwater Data

When a location is selected, the application sends a request to the INGRES API containing the location UUID, location type, parent location, and selected year.

### 3. Parse the Response

The returned data is processed to identify:

- Summary records
- Child locations
- Groundwater metrics
- Administrative relationships

### 4. Display Statistics

The selected location's groundwater information is displayed through the statistics bar, charts, map, and other UI elements.

### 5. Ask the AI

The user can ask questions about the selected region.

The application constructs a contextual prompt containing the available groundwater data and sends it to Groq.

### 6. Generate Visualizations

When a chart is requested, the AI returns structured chart information.

The application extracts the chart configuration and renders it using Chart.js.

---

## Quick AI Prompts

The application includes predefined prompts for common groundwater analysis tasks:

- **GW Stress** — Groundwater stress status
- **Recharge Chart** — Recharge source breakdown
- **Draft Breakdown** — Agriculture, domestic and industrial draft
- **Risk Zones** — Over-exploited and critical regions
- **Availability vs Draft** — Groundwater availability comparison
- **Rainfall Impact** — Rainfall and recharge analysis
- **Trend Analysis** — Multi-year groundwater trends
- **Future Outlook** — Groundwater available for future use

---

## Groundwater Metrics

The application currently supports the following primary metrics:

| Metric | Unit |
|---|---|
| Stage of Extraction | % |
| Groundwater Availability | ham |
| Total Draft | ham |
| Total Recharge | ham |
| Future Availability | ham |
| Rainfall | mm |
| Agriculture Draft | ham |
| Domestic Draft | ham |

`ham` refers to **hectare-metre**, a unit commonly used for measuring volumes of water.

---

## Browser Storage

INGRES uses browser storage for two purposes.

### Local Storage

Used for persistent configuration:

```text
groq_key
groq_model
```

### Session Storage

Used for groundwater/location caching:

```text
nodeCache
<locationUUID>_<year>
```

This allows previously retrieved data to be reused during a session without repeatedly requesting the same information from the API.

---

## Deployment

Because the application is a React single-page application, it can be deployed to platforms that support static frontend hosting.

Possible deployment targets include:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Other static hosting platforms

For production deployments, it is recommended to introduce a backend/API proxy for the Groq integration rather than exposing the API key in the browser.

---

## Important Considerations

### External API Availability

The application depends on the availability of the INGRES groundwater API. If the external API is unavailable or changes its response format, some application features may stop working.

### AI API Key

A valid Groq API key is required for AI-powered analysis.

The groundwater browsing and visualization functionality is separate from the AI functionality.

### Data Freshness

The groundwater assessment data is provided according to the assessment years exposed by the INGRES API. The application does not independently generate or verify groundwater measurements.

---

## Future Improvements

Potential improvements include:

- Secure server-side AI API integration
- User authentication and personalized dashboards
- Persistent comparison reports
- Exporting charts and groundwater reports as PDF
- More extensive historical trend analysis
- Advanced groundwater risk prediction
- Additional geographic visualizations
- Automated groundwater alerts
- More detailed sector-wise analysis
- Mobile-responsive optimization
- Backend caching for frequently requested locations

---

## License

This project is intended for educational, research, and demonstration purposes.

The groundwater data is provided through the external INGRES/CGWB-IITH platform and remains subject to the terms and availability of its respective data source.

---

## Acknowledgements

This project makes use of groundwater information provided through the **INGRES groundwater data platform associated with IIT Hyderabad and the Central Ground Water Board (CGWB)**.

Additional technologies used in the project include:

- React
- Chart.js
- D3.js
- Groq
- Meta Llama
- Open-source geographic data

---

## Project Goal

INGRES aims to make complex groundwater datasets easier to **explore, understand, compare, and analyze**.

By combining structured groundwater data, interactive geographic navigation, data visualization, and natural-language AI analysis, the platform provides a more accessible way to investigate groundwater conditions across India.