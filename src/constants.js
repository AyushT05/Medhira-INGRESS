export const INDIA_UUID = 'ffce954d-24e1-494b-ba7e-0931d8ad6085';
export const API_URL = 'https://ingres.iith.ac.in/api/gec/getBusinessDataForUserOpen';
export const LOCTYPE_CHAIN = ['COUNTRY', 'STATE', 'DISTRICT', 'BLOCK'];
export const CHILD_LOCTYPE = { COUNTRY: 'STATE', STATE: 'DISTRICT', DISTRICT: 'BLOCK', BLOCK: 'SUBBLOCK' };
export const SUMMARY_KEY_TO_LOCTYPE = {
  BLOCK: 'BLOCK', TALUK: 'BLOCK', FIRKA: 'BLOCK', TEHSIL: 'BLOCK',
  VILLAGE: 'BLOCK', WATERSHED: 'BLOCK', ISLAND: 'BLOCK',
  DISTRICT: 'DISTRICT', STATE: 'STATE', REGION: 'BLOCK',
};
export const YEARS = ['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021'];
export const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B — Best' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B — Fastest' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
];
export const PALETTE = ['#1A4A8A', '#0F7B6C', '#B45309', '#7C3AED', '#C02A2A', '#0369A1', '#1A6B3A', '#9D174D'];

export const KNOWN_STATES = {
  'MADHYA PRADESH': 'f38e6de8-396e-47b4-af18-32c333eddccc',
  'NAGALAND': '37572702-1c31-4723-8328-0a1757f6b4e1',
  'MIZORAM': '812072c8-d651-485c-88e8-7dd29d8c183b',
  'ARUNACHAL PRADESH': 'f318279f-537d-4373-b9dc-ac347cdef82f',
  'BIHAR': 'ae12d8f1-e36c-445f-8d32-80f958766b4e',
  'DAMAN AND DIU': 'ee1789e0-3831-4cdb-b0b8-77231309cd7e',
  'JAMMU AND KASHMIR': '12f0823e-2c16-4765-8137-585b3d5123ac',
  'PUNJAB': '5ff5533e-36c5-4c24-abff-1cbbea6f2bdf',
  'MEGHALAYA': 'b967d23e-68c8-492c-a372-9623441f7d24',
  'CHHATTISGARH': 'bd81d570-0e97-4dad-9bcd-219a05f56f2f',
  'KERALA': 'ca25704a-43d0-42ad-bcf4-b2b60270594c',
  'TRIPURA': '40320284-8d82-4f7e-80d7-00a00bb0e5b0',
  'UTTAR PRADESH': 'edce8ca7-bf15-4b5e-b4c5-b10c543acd83',
  'WEST BENGAL': '68ecabb4-0ea5-4909-b8e3-20bbaa7b91e8',
  'CHANDIGARH': 'd6da1adf-2a9c-4908-a356-e7668d4ab108',
  'PUDUCHERRY': 'fd163bec-156c-4633-a7b7-5dfee5fcdf57',
  'ANDAMAN AND NICOBAR ISLANDS': '68dad067-a4cc-4397-a6fd-fc10ef7cc933',
  'HARYANA': '648a95f6-9249-4c92-8ae4-a9d93eb7c898',
  'GOA': '7f615d2f-0be6-42bf-891f-7239e101e487',
  'DADRA AND NAGAR HAVELI': 'f5c761d1-d9c5-4e5f-af48-2cdfc1c92ce8',
  'LAKSHDWEEP': '5f2a2b2b-cd02-4a00-94ec-3fc97d9f0d19',
  'MAHARASHTRA': 'e7b3f02d-2497-4bcd-9e20-baa4b621822b',
  'SIKKIM': '19903c2c-ed18-4782-a679-dc10e8aa71ed',
  'TELANGANA': 'a1588b13-5700-450d-b51d-b782ed565801',
  'ANDHRA PRADESH': '609c5df4-6414-4bbd-a22d-ff5fbdad6836',
  'KARNATAKA': 'eaec6bbb-a219-415f-bdba-991c42586352',
  'HIMACHAL PRADESH': 'b8c2ccc0-b638-468a-84e7-3512ece9b3a5',
  'DELHI': 'a1ac5d18-8c9a-4047-8fdd-4d7d9deaa34e',
  'ODISHA': 'd19a5290-2e40-494a-83d2-98f4c845b1f1',
  'ASSAM': '94360caf-ebf0-4303-8c9e-3509bb0cded2',
  'JHARKHAND': '496bae22-c752-43d6-9bda-7798f9d3b32f',
  'UTTARAKHAND': '200030a1-6d27-4dff-988a-e2104ff62ab8',
  'MANIPUR': '0ee3cc5b-1b67-465c-9528-46540aea9cb7',
  'TAMILNADU': 'e98cd5b7-6556-4c0f-a778-3429e1c14a6b',
  'RAJASTHAN': '785cc6f0-e9d0-4961-9578-08ed2f24377a',
  'GUJARAT': '8fd29251-6e20-4f33-9a96-f47cab45eb13',
  'LADAKH': '6ad10263-20ad-4001-86c0-738be00ec03e',
};

export const STATE_COORDS = {
  'ANDHRA PRADESH': { lat: 15.9129, lng: 79.7400 },
  'ARUNACHAL PRADESH': { lat: 28.2180, lng: 94.7278 },
  'ASSAM': { lat: 26.2006, lng: 92.9376 },
  'BIHAR': { lat: 25.0961, lng: 85.3131 },
  'CHHATTISGARH': { lat: 21.2787, lng: 81.8661 },
  'GOA': { lat: 15.2993, lng: 74.1240 },
  'GUJARAT': { lat: 22.2587, lng: 71.1924 },
  'HARYANA': { lat: 29.0588, lng: 76.0856 },
  'HIMACHAL PRADESH': { lat: 31.1048, lng: 77.1734 },
  'JAMMU AND KASHMIR': { lat: 33.7782, lng: 76.5762 },
  'JHARKHAND': { lat: 23.6102, lng: 85.2799 },
  'KARNATAKA': { lat: 15.3173, lng: 75.7139 },
  'KERALA': { lat: 10.8505, lng: 76.2711 },
  'LADAKH': { lat: 34.1526, lng: 77.5771 },
  'MADHYA PRADESH': { lat: 22.9734, lng: 78.6569 },
  'MAHARASHTRA': { lat: 19.7515, lng: 75.7139 },
  'MANIPUR': { lat: 24.6637, lng: 93.9063 },
  'MEGHALAYA': { lat: 25.4670, lng: 91.3662 },
  'MIZORAM': { lat: 23.1645, lng: 92.9376 },
  'NAGALAND': { lat: 26.1584, lng: 94.5624 },
  'ODISHA': { lat: 20.9517, lng: 85.0985 },
  'PUNJAB': { lat: 31.1471, lng: 75.3412 },
  'RAJASTHAN': { lat: 27.0238, lng: 74.2179 },
  'SIKKIM': { lat: 27.5330, lng: 88.5122 },
  'TAMILNADU': { lat: 11.1271, lng: 78.6569 },
  'TELANGANA': { lat: 18.1124, lng: 79.0193 },
  'TRIPURA': { lat: 23.9408, lng: 91.9882 },
  'UTTAR PRADESH': { lat: 26.8467, lng: 80.9462 },
  'UTTARAKHAND': { lat: 30.0668, lng: 79.0193 },
  'WEST BENGAL': { lat: 22.9868, lng: 87.8550 },
  'CHANDIGARH': { lat: 30.7333, lng: 76.7794 },
  'DELHI': { lat: 28.7041, lng: 77.1025 },
  'PUDUCHERRY': { lat: 11.9416, lng: 79.8083 },
  'ANDAMAN AND NICOBAR ISLANDS': { lat: 11.7401, lng: 92.6586 },
  'DADRA AND NAGAR HAVELI': { lat: 20.1809, lng: 73.0169 },
  'DAMAN AND DIU': { lat: 20.4283, lng: 72.8397 },
  'LAKSHDWEEP': { lat: 10.5667, lng: 72.6417 },
};

export const STATE_SIZE = {
  'RAJASTHAN': 28, 'MADHYA PRADESH': 26, 'MAHARASHTRA': 25, 'UTTAR PRADESH': 24,
  'JAMMU AND KASHMIR': 24, 'LADAKH': 26, 'GUJARAT': 22, 'KARNATAKA': 22,
  'ANDHRA PRADESH': 21, 'ODISHA': 19, 'CHHATTISGARH': 19, 'TELANGANA': 17,
  'WEST BENGAL': 16, 'ARUNACHAL PRADESH': 20, 'JHARKHAND': 15,
  'ASSAM': 16, 'HIMACHAL PRADESH': 16, 'UTTARAKHAND': 14, 'PUNJAB': 14,
  'HARYANA': 13, 'BIHAR': 16, 'TAMILNADU': 17, 'KERALA': 13,
  'MEGHALAYA': 11, 'TRIPURA': 9, 'MANIPUR': 10, 'NAGALAND': 9,
  'MIZORAM': 9, 'SIKKIM': 7, 'GOA': 6, 'DEFAULT': 10,
};

export const MAP_ACCENT = '#1A4A8A';
export const MAP_OCEAN = '#D6EBF5';
export const MAP_LAND = '#EEF3FA';
export const MAP_BORDER = '#94A3B8';
export const MAP_BORDER_HL = '#1A4A8A';
export const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

export const SVG_W = 480;
export const SVG_H = 560;

export const BADGE_CFG = {
  over:  { bg: 'var(--red-bg)',   color: 'var(--red)',   border: '#F5BEBE', label: 'O/E'   },
  crit:  { bg: 'var(--amber-bg)', color: 'var(--amber)', border: '#F9D9A0', label: 'CRIT'  },
  semi:  { bg: '#FFFBEA',         color: '#92680A',       border: '#F5E0A0', label: 'S/C'   },
  safe:  { bg: 'var(--green-bg)', color: 'var(--green)', border: '#A8DFB8', label: 'SAFE'  },
  hilly: { bg: '#F3EEFF',         color: '#5B21B6',       border: '#D2BEFF', label: 'HILLY' },
};

export const METRICS = [
  { key: 'stage',         label: 'Stage of Extraction',  unit: '%',   get: d => d?.stageOfExtraction?.total || 0 },
  { key: 'availability',  label: 'GW Availability',       unit: 'ham', get: d => d?.totalGWAvailability?.total || 0 },
  { key: 'draft',         label: 'Total Draft',           unit: 'ham', get: d => d?.draftData?.total?.total || 0 },
  { key: 'recharge',      label: 'Total Recharge',        unit: 'ham', get: d => d?.rechargeData?.total?.total || 0 },
  { key: 'future',        label: 'Future Availability',   unit: 'ham', get: d => d?.availabilityForFutureUse?.total || 0 },
  { key: 'rainfall',      label: 'Rainfall',              unit: 'mm',  get: d => d?.rainfall?.total || 0 },
  { key: 'agri_draft',    label: 'Agriculture Draft',     unit: 'ham', get: d => d?.draftData?.agriculture?.total || 0 },
  { key: 'domestic_draft',label: 'Domestic Draft',        unit: 'ham', get: d => d?.draftData?.domestic?.total || 0 },
];

export const CHART_TYPES_INFO = {
  bar:     { label: 'Bar',   hint: 'Best for comparing values side-by-side across locations' },
  doughnut:{ label: 'Donut', hint: 'Best for showing proportional share of a single metric' },
  line:    { label: 'Line',  hint: 'Best for trend data across multiple time periods' },
};

export const QUICK_PROMPTS = [
  { label: 'GW Stress',       text: 'What is the groundwater stress status here?' },
  { label: 'Recharge Chart',  text: 'Show recharge sources breakdown with a chart' },
  { label: 'Draft Breakdown', text: 'Compare agriculture vs domestic vs industry water draft with a pie chart' },
  { label: 'Risk Zones',      text: 'Which sub-regions are over-exploited or critical?' },
  { label: 'Avail vs Draft',  text: 'Show groundwater availability vs total draft as a bar chart' },
  { label: 'Rainfall Impact', text: 'Summarize rainfall recharge vs other recharge sources' },
  { label: 'Trend Analysis',  text: 'Show groundwater availability trend across years as a line chart' },
  { label: 'Future Outlook',  text: 'What percentage of groundwater is available for future use?' },
];
