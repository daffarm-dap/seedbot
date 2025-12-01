import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Newspaper,
  LogOut,
  Calendar,
  Package,
  Menu,
  Thermometer,
  Droplets,
  FlaskConical,
  Download,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Navigation,
  Info,
  Loader2,
  Trash2,
  Pencil,
  X,
  Lock,
  Brain,
  CheckCircle,
  XCircle,
  Activity,
  Sliders,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import logoMedium from "figma:asset/6931a194092f1fc319eb76cb6dbe2b371fb5d49e.png";
import logoIcon from "figma:asset/88069b1892f4c1c70d51f47030a7591b1dea6dba.png";
import api from "../services/api";
import { LeafletMap } from "./LeafletMap";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts@2.15.2";

export function FarmerDashboard({
  username,
  onLogout,
}) {
  // Initialize activeMenu from URL hash or default to "dashboard"
  const getInitialMenu = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Validate hash against menu items
      const validMenus = ["dashboard", "mapping", "histori-robot", "parameter", "kendali-manual", "ganti-password", "dummy-data", "atur-threshold"];
      if (validMenus.includes(hash)) {
        return hash;
      }
    }
    return "dashboard";
  };

  const [activeMenu, setActiveMenu] = useState(getInitialMenu());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seedingDepth, setSeedingDepth] = useState([5]);
  const [holeSpacing, setHoleSpacing] = useState([20]);
  
  // Realtime data state
  const [sensorData, setSensorData] = useState({
    suhu: { value: 0, unit: "°C", status: "baik", label: "" },
    kelembapan: { value: 0, unit: "%", status: "baik", label: "" },
    ph: { value: 0, unit: "", status: "baik", label: "" },
    nitrogen: { value: 0, unit: "mg/kg", status: "baik", label: "" },
    phospor: { value: 0, unit: "mg/kg", status: "baik", label: "" },
    kalium: { value: 0, unit: "mg/kg", status: "baik", label: "" },
  });
  const [robotStatus, setRobotStatus] = useState({
    connectionStatus: "terhubung",
    operationStatus: "Standby",
    benihTertanam: 0,
    baterai: 100,
  });
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get full name based on username
  const farmerNames = {
    evan: "Evan Nathanael",
    daffa: "Daffa Rif'at",
    asri: "Asri Sarassufi",
  };
  const farmerName = farmerNames[username] || username;

  // Mapping state
  const [mappingName, setMappingName] = useState("");
  const [savedMappings, setSavedMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [isDeleteMappingDialogOpen, setIsDeleteMappingDialogOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState([]);
  const [selectedMappingId, setSelectedMappingId] = useState(null);
  const [editingMappingId, setEditingMappingId] = useState(null);
  const [editingMappingName, setEditingMappingName] = useState("");
  const [editingCoordinates, setEditingCoordinates] = useState(null);

  // Robot control state
  const [robotMode, setRobotMode] = useState("manual"); // "manual" or "otomatis"
  const [selectedMapping, setSelectedMapping] = useState("");
  const [robotHistory, setRobotHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Ref to store timeout ID for auto-return to Standby
  const standbyTimeoutRef = useRef(null);
  
  // State untuk tracking proses Tancap Sensor
  const [isTancapSensor, setIsTancapSensor] = useState(false);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Dummy data state
  const [dummySensorData, setDummySensorData] = useState({
    suhu: 28.5,
    kelembapan: 65.3,
    ph: 6.8,
    nitrogen: 45.2,
    phospor: 38.7,
    kalium: 52.1,
  });
  const [dummyRobotStatus, setDummyRobotStatus] = useState({
    connectionStatus: "terhubung",
    operationStatus: "Standby",
    benihTertanam: 0,
    baterai: 100,
  });
  const [updatingDummyData, setUpdatingDummyData] = useState(false);

  // Sensor thresholds state
  const [sensorThresholds, setSensorThresholds] = useState({
    suhu_min: 20.0,
    suhu_max: 35.0,
    kelembapan_min: 40.0,
    kelembapan_max: 80.0,
    ph_min: 6.0,
    ph_max: 7.5,
    nitrogen_min: 30.0,
    nitrogen_max: 60.0,
    phospor_min: 25.0,
    phospor_max: 50.0,
    kalium_min: 40.0,
    kalium_max: 70.0,
  });
  const [updatingThresholds, setUpdatingThresholds] = useState(false);

  // ML Prediction state
  const [mlPrediction, setMlPrediction] = useState({
    predictions: [
      { crop: "maize", probability: 87 },
      { crop: "rice", probability: 10 },
      { crop: "chickpea", probability: 3 },
    ],
    isSuitable: true, // true if maize has highest probability
    recommendedCrop: "maize",
    recommendedProbability: 87,
    maizeProbability: 87,
  });

  const landData = [
    {
      id: 1,
      location: "Blok A1",
      area: "2 hektar",
      crop: "Jagung",
      coordinates: "-7.5678, 110.8234",
    },
    {
      id: 2,
      location: "Blok A2",
      area: "1.5 hektar",
      crop: "Jagung",
      coordinates: "-7.5680, 110.8236",
    },
    {
      id: 3,
      location: "Blok B1",
      area: "1 hektar",
      crop: "Jagung",
      coordinates: "-7.5682, 110.8238",
    },
  ];

  // Function to determine sensor status based on value and thresholds
  const getSensorStatus = (type, value, thresholdsOverride = null) => {
    const thresholds = thresholdsOverride || sensorThresholds;
    
    switch (type) {
      case "suhu":
        const suhuMin = thresholds.suhu_min || 20.0;
        const suhuMax = thresholds.suhu_max || 35.0;
        if (value >= suhuMin && value <= suhuMax) {
          return { status: "baik", label: "Suhu optimal" };
        }
        if (value < suhuMin) {
          return { status: "jelek", label: "Suhu terlalu rendah" };
        }
        return { status: "jelek", label: "Suhu terlalu tinggi" };
      
      case "kelembapan":
        const kelembapanMin = thresholds.kelembapan_min || 40.0;
        const kelembapanMax = thresholds.kelembapan_max || 80.0;
        if (value >= kelembapanMin && value <= kelembapanMax) {
          return { status: "baik", label: "Kelembapan optimal" };
        }
        if (value < kelembapanMin) {
          return { status: "jelek", label: "Kelembapan terlalu rendah" };
        }
        return { status: "jelek", label: "Kelembapan terlalu tinggi" };
      
      case "ph":
        const phMin = thresholds.ph_min || 6.0;
        const phMax = thresholds.ph_max || 7.5;
        if (value >= phMin && value <= phMax) {
          return { status: "baik", label: "pH optimal untuk jagung" };
        }
        if (value < phMin) {
          return { status: "jelek", label: "pH terlalu rendah (terlalu asam)" };
        }
        return { status: "jelek", label: "pH terlalu tinggi (terlalu basa)" };
      
      case "nitrogen":
        const nitrogenMin = thresholds.nitrogen_min || 30.0;
        const nitrogenMax = thresholds.nitrogen_max || 60.0;
        if (value >= nitrogenMin && value <= nitrogenMax) {
          return { status: "baik", label: "Kadar nitrogen baik untuk jagung" };
        }
        if (value < nitrogenMin) {
          return { status: "jelek", label: "Kadar nitrogen terlalu rendah" };
        }
        return { status: "jelek", label: "Kadar nitrogen terlalu tinggi" };
      
      case "phospor":
        const phosporMin = thresholds.phospor_min || 25.0;
        const phosporMax = thresholds.phospor_max || 50.0;
        if (value >= phosporMin && value <= phosporMax) {
          return { status: "baik", label: "Kadar phospor baik untuk jagung" };
        }
        if (value < phosporMin) {
          return { status: "jelek", label: "Kadar phospor terlalu rendah" };
        }
        return { status: "jelek", label: "Kadar phospor terlalu tinggi" };
      
      case "kalium":
        const kaliumMin = thresholds.kalium_min || 40.0;
        const kaliumMax = thresholds.kalium_max || 70.0;
        if (value >= kaliumMin && value <= kaliumMax) {
          return { status: "baik", label: "Kadar kalium baik untuk jagung" };
        }
        if (value < kaliumMin) {
          return { status: "jelek", label: "Kadar kalium terlalu rendah" };
        }
        return { status: "jelek", label: "Kadar kalium terlalu tinggi" };
      
      default:
        return { status: "baik", label: "" };
    }
  };

  // Load realtime data from backend
  const loadRealtimeData = async () => {
    try {
      setLoadingRealtime(true);
      
      // Load thresholds first if not already loaded
      let thresholdsToUse = sensorThresholds;
      if (!sensorThresholds.suhu_min) {
        const loadedThresholds = await loadSensorThresholds();
        if (loadedThresholds) {
          thresholdsToUse = loadedThresholds;
        }
      }
      
      // Load sensor data
      const sensorResponse = await api.farmer.getSensorData();
      const sensorDataRaw = sensorResponse.sensorData || {};
      
      // Load robot status
      const robotResponse = await api.farmer.getRobotStatus();
      const robotStatusRaw = robotResponse.robotStatus || {};
      
      // Process sensor data using thresholds
      const processedSensorData = {
        suhu: {
          value: sensorDataRaw.suhu || 28,
          unit: "°C",
          ...getSensorStatus("suhu", sensorDataRaw.suhu || 28, thresholdsToUse),
        },
        kelembapan: {
          value: sensorDataRaw.kelembapan || 65,
          unit: "%",
          ...getSensorStatus("kelembapan", sensorDataRaw.kelembapan || 65, thresholdsToUse),
        },
        ph: {
          value: sensorDataRaw.ph || 6.5,
          unit: "",
          ...getSensorStatus("ph", sensorDataRaw.ph || 6.5, thresholdsToUse),
        },
        nitrogen: {
          value: sensorDataRaw.nitrogen || 50,
          unit: "mg/kg",
          ...getSensorStatus("nitrogen", sensorDataRaw.nitrogen || 50, thresholdsToUse),
        },
        phospor: {
          value: sensorDataRaw.phospor || 20,
          unit: "mg/kg",
          ...getSensorStatus("phospor", sensorDataRaw.phospor || 20, thresholdsToUse),
        },
        kalium: {
          value: sensorDataRaw.kalium || 60,
          unit: "mg/kg",
          ...getSensorStatus("kalium", sensorDataRaw.kalium || 60, thresholdsToUse),
        },
      };
      
      setSensorData(processedSensorData);
      
      // Process robot status
      setRobotStatus({
        connectionStatus: robotStatusRaw.connectionStatus || "terhubung",
        operationStatus: robotStatusRaw.operationStatus || "Standby",
        benihTertanam: robotStatusRaw.benihTertanam || 0,
        baterai: robotStatusRaw.baterai || 100,
      });
      
      // Update last update time
      setLastUpdate(new Date());
      
      // Calculate ML prediction based on sensor data
      // TODO: Replace with actual ML API call when ready
      calculateMLPrediction(processedSensorData);
      
    } catch (error) {
      console.error("Gagal memuat data realtime:", error);
      // Don't show toast error for realtime data, just log it
    } finally {
      setLoadingRealtime(false);
    }
  };

  // Calculate ML prediction using actual ML API
  const calculateMLPrediction = async (sensorData) => {
    // Call actual ML API for prediction
    try {
      // Prepare data for ML API
      const mlInput = {
        nitrogen: sensorData.nitrogen.value,
        phospor: sensorData.phospor.value,
        kalium: sensorData.kalium.value,
        suhu: sensorData.suhu.value,
        kelembapan: sensorData.kelembapan.value,
        ph: sensorData.ph.value,
        rainfall: 100, // Default rainfall value (can be updated if available)
      };
      
      // Call ML API
      const response = await api.farmer.predictCrop(mlInput);
      
      // Update state with ML prediction results
      setMlPrediction({
        predictions: response.predictions || [],
        isSuitable: response.isSuitable || false,
        recommendedCrop: response.recommendedCrop || "maize",
        recommendedProbability: response.recommendedProbability || 0,
        maizeProbability: response.maizeProbability || 0,
      });
      
      return; // Exit early if API call succeeds
    } catch (error) {
      console.error("Gagal memanggil ML API, menggunakan fallback:", error);
      // Fallback to mock prediction if API fails
    }
    
    // Fallback: Mock prediction calculation (if API fails)
    
    // All crops from dataset (without soybean)
    const allCrops = [
      "rice",
      "maize",
      "chickpea",
      "kidneybeans",
      "pigeonpeas",
      "mothbeans",
      "mungbean",
      "blackgram",
      "lentil",
      "pomegranate",
      "banana",
      "mango",
      "grapes",
      "watermelon",
      "muskmelon",
      "apple",
      "orange",
      "papaya",
      "coconut",
      "cotton",
      "jute",
      "coffee"
    ];
    
    // Calculate base probability for maize based on sensor conditions
    let maizeProb = 50; // Base probability
    
    // Adjust based on sensor readings
    if (sensorData.suhu.value >= 25 && sensorData.suhu.value <= 32) maizeProb += 20;
    if (sensorData.kelembapan.value >= 60 && sensorData.kelembapan.value <= 70) maizeProb += 15;
    if (sensorData.ph.value >= 6.0 && sensorData.ph.value <= 7.0) maizeProb += 10;
    if (sensorData.nitrogen.value >= 50 && sensorData.nitrogen.value <= 60) maizeProb += 5;
    
    // Ensure probability is within 0-100
    maizeProb = Math.min(100, Math.max(0, maizeProb));
    
    // Generate probabilities for all crops
    // Distribute remaining probability (100 - maizeProb) among other crops
    const remainingProb = 100 - maizeProb;
    const otherCrops = allCrops.filter(crop => crop !== "maize");
    
    // Define weights for different crop categories
    const cropWeights = {
      "rice": 0.3,
      "chickpea": 0.08,
      "kidneybeans": 0.08,
      "pigeonpeas": 0.08,
      "mothbeans": 0.05,
      "mungbean": 0.05,
      "blackgram": 0.05,
      "lentil": 0.05,
      "banana": 0.06,
      "mango": 0.06,
      "coconut": 0.06,
      "coffee": 0.06,
      "pomegranate": 0.02,
      "grapes": 0.02,
      "watermelon": 0.02,
      "muskmelon": 0.02,
      "apple": 0.02,
      "orange": 0.02,
      "papaya": 0.02,
      "cotton": 0.02,
      "jute": 0.02,
    };
    
    // Calculate total weight
    const totalWeight = otherCrops.reduce((sum, crop) => sum + (cropWeights[crop] || 0.01), 0);
    
    // Create predictions array
    const predictions = allCrops.map(crop => {
      if (crop === "maize") {
        return { crop, probability: Math.round(maizeProb) };
      } else {
        // Calculate probability based on weight
        const weight = cropWeights[crop] || 0.01;
        const prob = Math.round((remainingProb * weight) / totalWeight);
        
        // Add some randomness (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const finalProb = Math.round(prob * randomFactor);
        
        return { crop, probability: Math.max(0, Math.min(100, finalProb)) };
      }
    });
    
    // Normalize probabilities to sum to 100
    let totalProb = predictions.reduce((sum, p) => sum + p.probability, 0);
    if (totalProb !== 100) {
      const diff = 100 - totalProb;
      // Distribute the difference proportionally
      const maizeIndex = predictions.findIndex(p => p.crop === "maize");
      if (maizeIndex !== -1 && Math.abs(diff) <= 10) {
        // Small adjustment: add to maize
        predictions[maizeIndex].probability += diff;
        predictions[maizeIndex].probability = Math.max(0, Math.min(100, predictions[maizeIndex].probability));
      } else {
        // Larger difference: redistribute proportionally
        const scaleFactor = 100 / totalProb;
        predictions.forEach(p => {
          p.probability = Math.round(p.probability * scaleFactor);
        });
        // Final adjustment to ensure exactly 100
        totalProb = predictions.reduce((sum, p) => sum + p.probability, 0);
        const finalDiff = 100 - totalProb;
        if (finalDiff !== 0 && maizeIndex !== -1) {
          predictions[maizeIndex].probability += finalDiff;
          predictions[maizeIndex].probability = Math.max(0, Math.min(100, predictions[maizeIndex].probability));
        }
      }
    }
    
    // Sort predictions by probability (descending)
    predictions.sort((a, b) => b.probability - a.probability);
    
    // Check if maize has the highest probability
    const maizePrediction = predictions.find(p => p.crop === "maize");
    const highestPrediction = predictions[0];
    const isSuitable = highestPrediction.crop === "maize";
    
    setMlPrediction({
      predictions,
      isSuitable,
      recommendedCrop: highestPrediction.crop,
      recommendedProbability: highestPrediction.probability,
      maizeProbability: maizePrediction ? maizePrediction.probability : 0,
    });
  };

  // Load realtime data on mount and when activeMenu is dashboard
  useEffect(() => {
    if (activeMenu === "dashboard") {
      // Load thresholds first, then load realtime data
      const loadData = async () => {
        await loadSensorThresholds();
        await loadRealtimeData();
      };
      loadData();
      
      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        loadRealtimeData();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [activeMenu]);

  // Load mappings from backend
  const loadMappings = async () => {
    try {
      setLoadingMappings(true);
      const response = await api.farmer.getMappings();
      const mappings = response.mappings || [];
      
      // Format mappings for display and map
      const formattedMappings = mappings.map(mapping => ({
        id: mapping.id,
        name: mapping.mappingName || mapping.name || '',
        date: mapping.createdAt || mapping.date || '',
        coordinates: mapping.coordinates || null,
        mappingName: mapping.mappingName || mapping.name || '',
        createdAt: mapping.createdAt || mapping.date || '',
      }));
      
      setSavedMappings(formattedMappings);
    } catch (error) {
      console.error("Gagal memuat mappings:", error);
      toast.error("Gagal memuat daftar mapping: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setLoadingMappings(false);
    }
  };

  // Load mappings when menu changes to mapping
  useEffect(() => {
    if (activeMenu === "mapping") {
      loadMappings();
    }
  }, [activeMenu]);

  // Load parameters from backend
  const loadParameters = async () => {
    try {
      const response = await api.farmer.getParameters();
      const parameters = response.parameters || {};
      
      if (parameters.seedingDepth !== undefined) {
        setSeedingDepth([parameters.seedingDepth]);
      }
      if (parameters.holeSpacing !== undefined) {
        setHoleSpacing([parameters.holeSpacing]);
      }
    } catch (error) {
      console.error("Gagal memuat parameters:", error);
      toast.error("Gagal memuat parameter: " + (error.message || "Terjadi kesalahan"));
    }
  };

  // Load parameters when menu changes to parameter
  useEffect(() => {
    if (activeMenu === "parameter") {
      loadParameters();
    }
  }, [activeMenu]);

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If it's already in readable format, return as is
        return timestamp;
      }
      
      // Format: YYYY-MM-DD HH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp;
    }
  };

  // Load robot history from backend
  const loadRobotHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.farmer.getRobotHistory();
      const history = response.history || [];
      
      // Format history data - keep original timestamp for chart processing
      const formattedHistory = history.map((record, index) => ({
        id: index + 1,
        timestamp: record.timestamp, // Keep original timestamp for chart
        timestampFormatted: formatTimestamp(record.timestamp), // Formatted for display
        suhu: record.suhu || 0,
        kelembapan: record.kelembapan || 0,
        ph: record.ph || 0,
        nitrogen: record.nitrogen || 0,
        phospor: record.phospor || 0,
        kalium: record.kalium || 0,
        benihTertanam: record.benihTertanam || 0,
        baterai: record.baterai || 0,
        status: record.status || 'Layak',
        gpsLatitude: record.gpsLatitude,
        gpsLongitude: record.gpsLongitude,
      }));
      
      setRobotHistory(formattedHistory);
    } catch (error) {
      console.error("Gagal memuat history robot:", error);
      toast.error("Gagal memuat history robot: " + (error.message || "Terjadi kesalahan"));
      setRobotHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load robot history when menu changes to histori-robot
  useEffect(() => {
    if (activeMenu === "histori-robot") {
      loadRobotHistory();
    }
  }, [activeMenu]);

  // Calculate chart data per minute (each record is one data point)
  const chartData = useMemo(() => {
    if (robotHistory.length === 0) return [];

    // Helper function to parse timestamp
    const parseTimestamp = (timestamp) => {
      if (!timestamp) return null;
      
      try {
        let recordDate;
        if (typeof timestamp === 'string') {
          // Try different formats
          if (timestamp.includes('T')) {
            // ISO format: 2025-11-16T02:54:00 or 2025-11-16T02:54:00.000Z
            recordDate = new Date(timestamp);
          } else if (timestamp.includes(' ')) {
            // Format: YYYY-MM-DD HH:MM or YYYY-MM-DD HH:MM:SS
            const [datePart, timePart] = timestamp.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const timeParts = timePart.split(':').map(Number);
            const hour = timeParts[0] || 0;
            const minute = timeParts[1] || 0;
            const second = timeParts[2] || 0;
            recordDate = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // Try direct parse
            recordDate = new Date(timestamp);
          }
        } else {
          recordDate = new Date(timestamp);
        }
        
        // Check if date is valid
        if (isNaN(recordDate.getTime())) return null;
        
        return recordDate;
      } catch (error) {
        console.error("Error parsing timestamp:", timestamp, error);
        return null;
      }
    };

    // Process each record as a separate data point (per minute)
    const chartDataResult = robotHistory
      .map(record => {
        if (!record.timestamp) return null;
        
        const recordDate = parseTimestamp(record.timestamp);
        if (!recordDate) return null;
        
        // Format date for display (DD/MM HH:MM)
        const formattedDate = `${String(recordDate.getDate()).padStart(2, '0')}/${String(recordDate.getMonth() + 1).padStart(2, '0')} ${String(recordDate.getHours()).padStart(2, '0')}:${String(recordDate.getMinutes()).padStart(2, '0')}`;
        
        return {
          date: formattedDate,
          fullDate: recordDate.toISOString(),
          timestamp: recordDate.getTime(),
          suhu: record.suhu !== null && record.suhu !== undefined ? Number(record.suhu) : 0,
          kelembapan: record.kelembapan !== null && record.kelembapan !== undefined ? Number(record.kelembapan) : 0,
          ph: record.ph !== null && record.ph !== undefined ? Number(record.ph) : 0,
          nitrogen: record.nitrogen !== null && record.nitrogen !== undefined ? Number(record.nitrogen) : 0,
          kalium: record.kalium !== null && record.kalium !== undefined ? Number(record.kalium) : 0,
          phospor: record.phospor !== null && record.phospor !== undefined ? Number(record.phospor) : 0,
        };
      })
      .filter(item => item !== null) // Remove invalid records
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp (oldest first)

    // Debug logging
    console.log("Robot history length:", robotHistory.length);
    console.log("Chart data result length:", chartDataResult.length);
    console.log("Chart data result (first 3):", chartDataResult.slice(0, 3));
    
    return chartDataResult;
  }, [robotHistory]);

  // Function to get color based on status (hanya hijau dan merah)
  const getStatusColor = (status) => {
    switch (status) {
      case "baik":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          icon: "text-emerald-600",
        };
      case "jelek":
        return {
          text: "text-red-600",
          bg: "bg-red-50",
          icon: "text-red-600",
        };
      default:
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          icon: "text-emerald-600",
        };
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Lihat Data Realtime",
      icon: LayoutDashboard,
    },
    { id: "mapping", label: "Atur Mapping", icon: MapPin },
    {
      id: "histori-robot",
      label: "Lihat Histori Robot",
      icon: TrendingUp,
    },
    {
      id: "parameter",
      label: "Atur Parameter Penaburan",
      icon: Settings,
    },
    {
      id: "kendali-manual",
      label: "Kendali Robot",
      icon: Package,
    },
    {
      id: "atur-threshold",
      label: "Atur Threshold",
      icon: Activity,
    },
    {
      id: "ganti-password",
      label: "Ganti Password",
      icon: Lock,
    },
    {
      id: "dummy-data",
      label: "Dummy Data Panel",
      icon: Sliders,
    },
  ];

  const handleDownloadHistory = () => {
    if (robotHistory.length === 0) {
      toast.error("Tidak ada data history untuk diunduh!");
      return;
    }

    try {
      // Create CSV content
      const headers = [
        'Waktu',
        'Suhu (°C)',
        'Kelembapan (%)',
        'pH',
        'Nitrogen (mg/kg)',
        'Phospor (mg/kg)',
        'Kalium (mg/kg)',
        'Benih Tertanam',
        'Baterai (%)',
        'Status',
        'GPS Latitude',
        'GPS Longitude'
      ];

      // Convert data to CSV rows
      const csvRows = [
        headers.join(','),
        ...robotHistory.map(record => [
          `"${record.timestampFormatted || formatTimestamp(record.timestamp) || ''}"`,
          record.suhu || 0,
          record.kelembapan || 0,
          record.ph || 0,
          record.nitrogen || 0,
          record.phospor || 0,
          record.kalium || 0,
          record.benihTertanam || 0,
          record.baterai || 0,
          `"${record.status || 'Layak'}"`,
          record.gpsLatitude || '',
          record.gpsLongitude || ''
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      // Add BOM for UTF-8 to support Indonesian characters
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `histori_robot_${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    toast.success("Histori robot berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh history:", error);
      toast.error("Gagal mengunduh history: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleSaveParameters = async () => {
    try {
      const parametersData = {
        seedingDepth: seedingDepth[0],
        holeSpacing: holeSpacing[0],
      };

      await api.farmer.updateParameters(parametersData);
    toast.success("Parameter penaburan berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan parameter:", error);
      toast.error("Gagal menyimpan parameter: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleResetToDefault = async () => {
    try {
      const response = await api.farmer.getDefaultParameters();
      const defaultParams = response.parameters || {};
      
      if (defaultParams.seedingDepth !== undefined) {
        setSeedingDepth([defaultParams.seedingDepth]);
      }
      if (defaultParams.holeSpacing !== undefined) {
        setHoleSpacing([defaultParams.holeSpacing]);
      }
      
      toast.success("Parameter berhasil direset ke default!");
    } catch (error) {
      console.error("Gagal memuat parameter default:", error);
      toast.error("Gagal memuat parameter default: " + (error.message || "Terjadi kesalahan"));
    }
  };

  // Load robot status from backend
  const loadRobotStatus = async () => {
    try {
      const response = await api.farmer.getRobotStatus();
      const status = response.robotStatus || {};
      
      setRobotStatus({
        connectionStatus: status.connectionStatus || 'terhubung',
        operationStatus: status.operationStatus || 'Standby',
        benihTertanam: status.benihTertanam || 0,
        baterai: status.baterai || 100,
      });
      
      // Load selected mapping ID from backend
      if (status.selectedMappingId) {
        setSelectedMapping(String(status.selectedMappingId));
      } else {
        setSelectedMapping("");
      }
    } catch (error) {
      console.error("Gagal memuat status robot:", error);
      // Set default status on error
      setRobotStatus({
        connectionStatus: 'terhubung',
        operationStatus: 'Standby',
        benihTertanam: 0,
        baterai: 100,
      });
      setSelectedMapping("");
    }
  };

  // Load robot status when menu changes to kendali-manual
  useEffect(() => {
    if (activeMenu === "kendali-manual") {
      // Load mappings first (needed for select dropdown)
      loadMappings();
      // Then load robot status (which includes selected mapping)
      loadRobotStatus();
      
      // Auto-refresh robot status every 2 seconds for real-time updates
      const interval = setInterval(() => {
        loadRobotStatus();
      }, 2000); // Refresh every 2 seconds
      
      return () => {
        clearInterval(interval);
        // Don't clear timeout here - let it continue running
        // The timeout will update backend even if user leaves menu
      };
    }
    // Note: We don't clear timeout when leaving menu - let it continue
    // The timeout callbacks will still execute and update backend/state
  }, [activeMenu]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (standbyTimeoutRef.current) {
        clearTimeout(standbyTimeoutRef.current);
        standbyTimeoutRef.current = null;
      }
    };
  }, []);

  // Update URL hash when activeMenu changes
  useEffect(() => {
    // Use #dashboard for dashboard menu to avoid conflict with landing page #home
    const hash = activeMenu === "dashboard" ? "#dashboard" : `#${activeMenu}`;
    window.location.hash = hash;
  }, [activeMenu]);

  // Listen for hash changes (e.g., browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      // Convert "dashboard" to "dashboard" menu, empty hash to "dashboard"
      const menuId = hash === "dashboard" || hash === "" ? "dashboard" : hash;
      
      // Validate hash against menu items
      const validMenus = ["dashboard", "mapping", "histori-robot", "parameter", "kendali-manual", "ganti-password", "dummy-data", "atur-threshold"];
      if (validMenus.includes(menuId)) {
        setActiveMenu(menuId);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Reset password form when leaving ganti-password menu
  useEffect(() => {
    if (activeMenu !== "ganti-password") {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    }
  }, [activeMenu]);

  // Keyboard controls (WASD) for robot movement
  useEffect(() => {
    // Only enable keyboard controls when:
    // 1. Menu is "kendali-manual"
    // 2. Robot mode is "manual"
    // 3. Robot is connected
    if (activeMenu !== "kendali-manual" || robotMode !== "manual" || robotStatus.connectionStatus !== "terhubung") {
      return;
    }

    const handleKeyPress = (event) => {
      // Prevent default behavior for WASD keys
      const key = event.key.toLowerCase();
      
      // Only handle if not typing in input/textarea/select
      const target = event.target;
      const isInputElement = target.tagName === 'INPUT' || 
                             target.tagName === 'TEXTAREA' || 
                             target.tagName === 'SELECT' ||
                             target.isContentEditable;
      
      if (isInputElement) {
        return;
      }

      let action = null;
      
      switch (key) {
        case 'w':
          action = 'Maju';
          break;
        case 's':
          action = 'Mundur';
          break;
        case 'a':
          action = 'Kiri';
          break;
        case 'd':
          action = 'Kanan';
          break;
        default:
          return;
      }

      if (action) {
        event.preventDefault();
        handleRobotControl(action);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeMenu, robotMode, robotStatus.connectionStatus]);

  const handleRobotControl = async (action) => {
    try {
      // Check if robot is connected
      if (robotStatus.connectionStatus !== 'terhubung') {
        toast.error("Robot tidak terhubung! Pastikan robot sudah terhubung.");
        return;
      }

      // Check if "Mulai Penaburan" is clicked in otomatis mode without selected mapping
      if (action === 'Mulai Penaburan' && robotMode === 'otomatis' && !selectedMapping) {
        toast.error("Silakan pilih mapping terlebih dahulu sebelum memulai penaburan!");
        return;
      }

      // Clear any existing timeout
      if (standbyTimeoutRef.current) {
        clearTimeout(standbyTimeoutRef.current);
        standbyTimeoutRef.current = null;
      }

      // Send control command to backend
      const response = await api.farmer.robotControl(action);
      
      // Update operation status
      if (response.operationStatus) {
        setRobotStatus(prev => ({
          ...prev,
          operationStatus: response.operationStatus,
        }));
      }
      
      toast.success(response.message || `Perintah ${action} berhasil dikirim ke robot!`);

      // Check if action is a directional movement (Maju, Mundur, Kanan, Kiri)
      const directionalMovements = ['Maju', 'Mundur', 'Kanan', 'Kiri'];
      if (directionalMovements.includes(action)) {
        // Set timeout to return to Standby after 3 seconds
        // Store timeout ID in ref so it persists even if user switches menus
        standbyTimeoutRef.current = setTimeout(async () => {
          try {
            // Always update backend regardless of current menu
            await api.farmer.updateRobotStatus({
              operationStatus: 'Standby',
            });
            
            // Update local state using functional update to get latest state
            setRobotStatus(prev => ({
              ...prev,
              operationStatus: 'Standby',
            }));
          } catch (error) {
            console.error("Gagal mengembalikan status ke Standby:", error);
          }
          
          // Clear the ref
          standbyTimeoutRef.current = null;
        }, 3000); // 3 seconds
      }
      
      // Check if action is "Return to Base" or "Stop"
      if (action === 'Return to Base' || action === 'Stop') {
        // Set timeout to return to Standby after 5 seconds
        // Store timeout ID in ref so it persists even if user switches menus
        standbyTimeoutRef.current = setTimeout(async () => {
          try {
            // Always update backend regardless of current menu
            await api.farmer.updateRobotStatus({
              operationStatus: 'Standby',
            });
            
            // Update local state using functional update to get latest state
            setRobotStatus(prev => ({
              ...prev,
              operationStatus: 'Standby',
            }));
          } catch (error) {
            console.error("Gagal mengembalikan status ke Standby:", error);
          }
          
          // Clear the ref
          standbyTimeoutRef.current = null;
        }, 5000); // 5 seconds
      }
      
      // Check if action is "Tancap Sensor"
      if (action === 'Tancap Sensor') {
        // Set state to indicate tancap sensor is in progress
        setIsTancapSensor(true);
        
        // Save current sensor data to history
        try {
          const historyData = {
            suhu: sensorData.suhu.value,
            kelembapan: sensorData.kelembapan.value,
            ph: sensorData.ph.value,
            nitrogen: sensorData.nitrogen.value,
            phospor: sensorData.phospor.value,
            kalium: sensorData.kalium.value,
            benihTertanam: robotStatus.benihTertanam || 0,
            baterai: robotStatus.baterai || 100,
            status: mlPrediction.isSuitable ? 'Layak' : 'Tidak Layak',
            // GPS coordinates can be added later if available
            gpsLatitude: null,
            gpsLongitude: null,
          };
          
          await api.farmer.createRobotHistory(historyData);
          
          // Reload history if user is on history menu
          if (activeMenu === 'histori-robot') {
            await loadRobotHistory();
          }
          
          toast.success("Data sensor berhasil disimpan ke history!");
        } catch (error) {
          console.error("Gagal menyimpan data sensor ke history:", error);
          toast.error("Gagal menyimpan data sensor ke history");
        }
        
        // Set timeout to return to Standby after 5 seconds
        // Store timeout ID in ref so it persists even if user switches menus
        standbyTimeoutRef.current = setTimeout(async () => {
          try {
            // Always update backend regardless of current menu
            await api.farmer.updateRobotStatus({
              operationStatus: 'Standby',
            });
            
            // Update local state using functional update to get latest state
            setRobotStatus(prev => ({
              ...prev,
              operationStatus: 'Standby',
            }));
            
            // Clear tancap sensor state
            setIsTancapSensor(false);
          } catch (error) {
            console.error("Gagal mengembalikan status ke Standby:", error);
            setIsTancapSensor(false);
          }
          
          // Clear the ref
          standbyTimeoutRef.current = null;
        }, 5000); // 5 seconds
      }
      
      // If action is "Stop", also clear tancap sensor state
      if (action === 'Stop') {
        setIsTancapSensor(false);
        // Clear any existing timeout
        if (standbyTimeoutRef.current) {
          clearTimeout(standbyTimeoutRef.current);
          standbyTimeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error("Gagal mengirim perintah robot:", error);
      toast.error("Gagal mengirim perintah: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleModeChange = async (newMode) => {
    try {
      setRobotMode(newMode);
      
      // Update operation status based on mode
      const operationStatus = newMode === "otomatis" ? "Mode Otomatis" : "Mode Manual";
      
      await api.farmer.updateRobotStatus({
        operationStatus: operationStatus,
      });
      
      // Update local state
      setRobotStatus(prev => ({
        ...prev,
        operationStatus: operationStatus,
      }));
      
      toast.success(`Mode diubah ke ${newMode === "otomatis" ? "Otomatis" : "Manual"}`);
    } catch (error) {
      console.error("Gagal mengubah mode:", error);
      toast.error("Gagal mengubah mode: " + (error.message || "Terjadi kesalahan"));
      // Revert mode change on error
      setRobotMode(newMode === "otomatis" ? "manual" : "otomatis");
    }
  };

  const handleSaveMapping = async () => {
    if (!mappingName.trim()) {
      toast.error("Nama mapping harus diisi!");
      return;
    }

    if (currentCoordinates.length === 0) {
      toast.error("Silakan gambar jalur di peta terlebih dahulu!");
      return;
    }

    try {
      const mappingData = {
        mappingName: mappingName.trim(),
        coordinates: JSON.stringify(currentCoordinates),
      };

      const response = await api.farmer.createMapping(mappingData);
      
      // Reload mappings from backend
      await loadMappings();
      
      setMappingName("");
      setCurrentCoordinates([]);
      toast.success("Mapping berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan mapping:", error);
      toast.error("Gagal menyimpan mapping: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleCoordinatesChange = (coordinates) => {
    setCurrentCoordinates(coordinates);
  };

  const handleMappingClick = (mappingId) => {
    setSelectedMappingId(mappingId === selectedMappingId ? null : mappingId);
  };

  const handleClearDrawing = () => {
    setCurrentCoordinates([]);
    setSelectedMappingId(null);
  };

  const handleDeleteMapping = (id) => {
    const mapping = savedMappings.find((m) => m.id === id);
    if (!mapping) return;
    
    setMappingToDelete({ id, name: mapping.name });
    setIsDeleteMappingDialogOpen(true);
  };

  const confirmDeleteMapping = async () => {
    if (!mappingToDelete) return;

    try {
      await api.farmer.deleteMapping(mappingToDelete.id);
      
      // Reload mappings from backend
      await loadMappings();
      
      setIsDeleteMappingDialogOpen(false);
      setMappingToDelete(null);
      toast.success("Mapping berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus mapping:", error);
      toast.error("Gagal menghapus mapping: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleEditMapping = async (id) => {
    try {
      const response = await api.farmer.getMapping(id);
      const mapping = response.mapping;
      
      if (!mapping) {
        toast.error("Mapping tidak ditemukan!");
        return;
      }

      // Set editing state
      setEditingMappingId(mapping.id);
      setEditingMappingName(mapping.mappingName || mapping.name || "");
      
      // Parse and set coordinates
      let coords = mapping.coordinates;
      if (typeof coords === 'string') {
        try {
          coords = JSON.parse(coords);
        } catch (e) {
          console.error("Error parsing coordinates:", e);
          coords = null;
        }
      }
      
      // Ensure coordinates is an array
      if (!Array.isArray(coords)) {
        coords = null;
      }
      
      // Set coordinates - this will trigger LeafletMap to load them
      setEditingCoordinates(coords);
      // Also set current coordinates for form validation
      setCurrentCoordinates(coords || []);
      
      // Clear new mapping form
      setMappingName("");
      setSelectedMappingId(null);
      
      toast.success("Mapping dimuat untuk diedit!");
    } catch (error) {
      console.error("Gagal memuat mapping:", error);
      toast.error("Gagal memuat mapping: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleUpdateMapping = async () => {
    if (!editingMappingId) return;

    if (!editingMappingName.trim()) {
      toast.error("Nama mapping harus diisi!");
      return;
    }

    if (currentCoordinates.length === 0) {
      toast.error("Silakan gambar jalur di peta terlebih dahulu!");
      return;
    }

    try {
      const mappingData = {
        mappingName: editingMappingName.trim(),
        coordinates: JSON.stringify(currentCoordinates),
      };

      await api.farmer.updateMapping(editingMappingId, mappingData);
      
      // Reload mappings from backend
      await loadMappings();
      
      // Clear editing state
      setEditingMappingId(null);
      setEditingMappingName("");
      setEditingCoordinates(null);
      setCurrentCoordinates([]);
      setMappingName("");
      
      toast.success("Mapping berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui mapping:", error);
      toast.error("Gagal memperbarui mapping: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleCancelEdit = () => {
    setEditingMappingId(null);
    setEditingMappingName("");
    setEditingCoordinates(null);
    setCurrentCoordinates([]);
    setMappingName("");
    setSelectedMappingId(null);
    // Force map to clear by passing null explicitly
    setTimeout(() => {
      setEditingCoordinates(null);
    }, 0);
  };

  // Helper function to ensure polygon is closed
  const ensurePolygonClosed = (coordinates) => {
    if (coordinates.length < 3) {
      return coordinates;
    }

    const firstPoint = coordinates[0];
    const lastPoint = coordinates[coordinates.length - 1];
    
    // Check if already closed
    const isClosed = Math.abs(firstPoint[0] - lastPoint[0]) < 0.0001 && 
                     Math.abs(firstPoint[1] - lastPoint[1]) < 0.0001;
    
    if (!isClosed) {
      // Add first point at the end to close the polygon
      return [...coordinates, [firstPoint[0], firstPoint[1]]];
    }
    
    return coordinates;
  };

  // Connect last point to first point manually
  const connectPoints = () => {
    if (currentCoordinates.length < 3) {
      toast.error("Minimal 3 titik diperlukan untuk menyambungkan!");
      return;
    }

    const firstPoint = currentCoordinates[0];
    const lastPoint = currentCoordinates[currentCoordinates.length - 1];
    
    // Check if already closed
    const isClosed = Math.abs(firstPoint[0] - lastPoint[0]) < 0.0001 && 
                     Math.abs(firstPoint[1] - lastPoint[1]) < 0.0001;
    
    if (isClosed) {
      toast.info("Titik sudah tersambung!");
      return;
    }

    // Add first point at the end to close the polygon
    setCurrentCoordinates([...currentCoordinates, [firstPoint[0], firstPoint[1]]]);
    toast.success("Titik berhasil disambungkan!");
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru harus minimal 6 karakter!");
      return;
    }

    try {
      setChangingPassword(true);
      
      await api.farmer.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password berhasil diubah!");
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      toast.error("Gagal mengubah password: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setChangingPassword(false);
    }
  };

  // Load sensor thresholds
  const loadSensorThresholds = async () => {
    try {
      const response = await api.farmer.getSensorThresholds();
      if (response && response.thresholds) {
        const newThresholds = {
          suhu_min: response.thresholds.suhu_min ?? 20.0,
          suhu_max: response.thresholds.suhu_max ?? 35.0,
          kelembapan_min: response.thresholds.kelembapan_min ?? 40.0,
          kelembapan_max: response.thresholds.kelembapan_max ?? 80.0,
          ph_min: response.thresholds.ph_min ?? 6.0,
          ph_max: response.thresholds.ph_max ?? 7.5,
          nitrogen_min: response.thresholds.nitrogen_min ?? 30.0,
          nitrogen_max: response.thresholds.nitrogen_max ?? 60.0,
          phospor_min: response.thresholds.phospor_min ?? 25.0,
          phospor_max: response.thresholds.phospor_max ?? 50.0,
          kalium_min: response.thresholds.kalium_min ?? 40.0,
          kalium_max: response.thresholds.kalium_max ?? 70.0,
        };
        setSensorThresholds(newThresholds);
        return newThresholds;
      }
      // Return default values if response is invalid
      const defaultThresholds = {
        suhu_min: 20.0,
        suhu_max: 35.0,
        kelembapan_min: 40.0,
        kelembapan_max: 80.0,
        ph_min: 6.0,
        ph_max: 7.5,
        nitrogen_min: 30.0,
        nitrogen_max: 60.0,
        phospor_min: 25.0,
        phospor_max: 50.0,
        kalium_min: 40.0,
        kalium_max: 70.0,
      };
      setSensorThresholds(defaultThresholds);
      return defaultThresholds;
    } catch (error) {
      console.error("Gagal memuat threshold sensor:", error);
      // Use default values if loading fails
      const defaultThresholds = {
        suhu_min: 20.0,
        suhu_max: 35.0,
        kelembapan_min: 40.0,
        kelembapan_max: 80.0,
        ph_min: 6.0,
        ph_max: 7.5,
        nitrogen_min: 30.0,
        nitrogen_max: 60.0,
        phospor_min: 25.0,
        phospor_max: 50.0,
        kalium_min: 40.0,
        kalium_max: 70.0,
      };
      setSensorThresholds(defaultThresholds);
      return defaultThresholds;
    }
  };

  // Update sensor thresholds
  const handleUpdateSensorThresholds = async () => {
    try {
      setUpdatingThresholds(true);
      
      // Debug: log data yang akan dikirim
      console.log("Updating thresholds:", sensorThresholds);
      
      const response = await api.farmer.updateSensorThresholds(sensorThresholds);
      
      // Update state with response from server
      if (response && response.thresholds) {
        setSensorThresholds({
          suhu_min: response.thresholds.suhu_min ?? 20.0,
          suhu_max: response.thresholds.suhu_max ?? 35.0,
          kelembapan_min: response.thresholds.kelembapan_min ?? 40.0,
          kelembapan_max: response.thresholds.kelembapan_max ?? 80.0,
          ph_min: response.thresholds.ph_min ?? 6.0,
          ph_max: response.thresholds.ph_max ?? 7.5,
          nitrogen_min: response.thresholds.nitrogen_min ?? 30.0,
          nitrogen_max: response.thresholds.nitrogen_max ?? 60.0,
          phospor_min: response.thresholds.phospor_min ?? 25.0,
          phospor_max: response.thresholds.phospor_max ?? 50.0,
          kalium_min: response.thresholds.kalium_min ?? 40.0,
          kalium_max: response.thresholds.kalium_max ?? 70.0,
        });
      }
      
      // Reload realtime data to reflect threshold changes in status colors
      await loadRealtimeData();
      
      toast.success("Threshold sensor berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui threshold sensor:", error);
      toast.error("Gagal memperbarui threshold sensor: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUpdatingThresholds(false);
    }
  };

  // Load thresholds when menu is opened
  useEffect(() => {
    if (activeMenu === "atur-threshold") {
      loadSensorThresholds();
    }
  }, [activeMenu]);

  // Load dummy data when menu is opened
  useEffect(() => {
    if (activeMenu === "dummy-data") {
      // Load current sensor data and robot status
      const loadData = async () => {
        await loadRealtimeData();
        await loadRobotStatus();
        // Initialize dummy data with current values after a short delay to ensure state is updated
        setTimeout(() => {
          setDummySensorData({
            suhu: sensorData.suhu.value || 28.5,
            kelembapan: sensorData.kelembapan.value || 65.3,
            ph: sensorData.ph.value || 6.8,
            nitrogen: sensorData.nitrogen.value || 45.2,
            phospor: sensorData.phospor.value || 38.7,
            kalium: sensorData.kalium.value || 52.1,
          });
          setDummyRobotStatus({
            connectionStatus: robotStatus.connectionStatus || "terhubung",
            operationStatus: robotStatus.operationStatus || "Standby",
            benihTertanam: robotStatus.benihTertanam || 0,
            baterai: robotStatus.baterai || 100,
          });
        }, 100);
      };
      loadData();
    }
  }, [activeMenu]);

  // Update dummy sensor data
  const handleUpdateDummySensorData = async () => {
    try {
      setUpdatingDummyData(true);
      
      await api.farmer.updateSensorData(dummySensorData);
      
      // Reload realtime data to reflect changes
      await loadRealtimeData();
      
      toast.success("Data sensor berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui data sensor:", error);
      toast.error("Gagal memperbarui data sensor: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUpdatingDummyData(false);
    }
  };

  // Update dummy robot status
  const handleUpdateDummyRobotStatus = async () => {
    try {
      setUpdatingDummyData(true);
      
      await api.farmer.updateRobotStatus(dummyRobotStatus);
      
      // Reload robot status to reflect changes
      await loadRobotStatus();
      
      toast.success("Status robot berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui status robot:", error);
      toast.error("Gagal memperbarui status robot: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUpdatingDummyData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static w-64 bg-white border-r h-screen transition-transform z-40`}
      >
        <div className="p-6 border-b bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex flex-col gap-2">
            <img
              src={logoMedium}
              alt="Seedbot"
              className="object-contain"
              style={{ height: '64px', width: '128px', aspectRatio: '2/1' }}
            />
            <p className="text-xs text-slate-500 ml-1">
              Dashboard Petani
            </p>
          </div>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeMenu === item.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-gray-800">
                {menuItems.find((m) => m.id === activeMenu)
                  ?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 shadow-sm">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">
                  {farmerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">
                  Petani
                </span>
                <span className="text-sm text-emerald-700">
                  {farmerName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              {/* Update Info */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-gray-800">
                  Data Realtime Sensor & Robot
                </h2>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  {loadingRealtime && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Calendar className="w-4 h-4" />
                  {lastUpdate ? (
                    <>Update: {lastUpdate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</>
                  ) : (
                    "Memuat data..."
                  )}
                </div>
              </div>

              {/* Stats Cards - Row 1 */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card
                  className={
                    getStatusColor(sensorData.suhu.status).bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      Suhu
                    </CardTitle>
                    <Thermometer
                      className={`w-4 h-4 ${getStatusColor(sensorData.suhu.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.suhu.status).text}`}
                    >
                      {sensorData.suhu.value}
                      {sensorData.suhu.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.suhu.label}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={
                    getStatusColor(sensorData.kelembapan.status)
                      .bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      Kelembapan
                    </CardTitle>
                    <Droplets
                      className={`w-4 h-4 ${getStatusColor(sensorData.kelembapan.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.kelembapan.status).text}`}
                    >
                      {sensorData.kelembapan.value}
                      {sensorData.kelembapan.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.kelembapan.label}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={
                    getStatusColor(sensorData.ph.status).bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      pH Tanah
                    </CardTitle>
                    <FlaskConical
                      className={`w-4 h-4 ${getStatusColor(sensorData.ph.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.ph.status).text}`}
                    >
                      {sensorData.ph.value}
                      {sensorData.ph.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.ph.label}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards - Row 2: NPK */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card
                  className={
                    getStatusColor(sensorData.nitrogen.status)
                      .bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      Nitrogen (N)
                    </CardTitle>
                    <FlaskConical
                      className={`w-4 h-4 ${getStatusColor(sensorData.nitrogen.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.nitrogen.status).text}`}
                    >
                      {sensorData.nitrogen.value}{" "}
                      {sensorData.nitrogen.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.nitrogen.label}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={
                    getStatusColor(sensorData.phospor.status).bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      Phospor (P)
                    </CardTitle>
                    <FlaskConical
                      className={`w-4 h-4 ${getStatusColor(sensorData.phospor.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.phospor.status).text}`}
                    >
                      {sensorData.phospor.value}{" "}
                      {sensorData.phospor.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.phospor.label}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={
                    getStatusColor(sensorData.kalium.status).bg
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-600">
                      Kalium (K)
                    </CardTitle>
                    <FlaskConical
                      className={`w-4 h-4 ${getStatusColor(sensorData.kalium.status).icon}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl ${getStatusColor(sensorData.kalium.status).text}`}
                    >
                      {sensorData.kalium.value}{" "}
                      {sensorData.kalium.unit}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sensorData.kalium.label}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Realtime Robot Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Robot Realtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Koneksi
                      </span>
                      <span
                        className={`px-3 py-1 ${robotStatus.connectionStatus === "terhubung" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded-full text-sm text-center`}
                      >
                        {robotStatus.connectionStatus === "terhubung"
                          ? "Terhubung"
                          : "Terputus"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Status
                      </span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm text-center">
                        {robotStatus.operationStatus || "Standby"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Benih Tertanam
                      </span>
                      <span className="text-sm text-emerald-600 text-center py-1">
                        {robotStatus.benihTertanam || 0} biji
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Baterai
                      </span>
                      <span className="text-sm text-emerald-600 text-center py-1">
                        {robotStatus.baterai || 100}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ML Prediction Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-600" />
                    Prediksi Kesesuaian Tanaman (Machine Learning)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status Layak/Tidak Layak */}
                    <div className={`p-4 rounded-lg border-2 ${
                      mlPrediction.isSuitable 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        {mlPrediction.isSuitable ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            mlPrediction.isSuitable ? "text-green-700" : "text-red-700"
                          }`}>
                            {mlPrediction.isSuitable ? "Layak Untuk Jagung" : "Tidak Layak Untuk Jagung"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Berdasarkan analisis data sensor realtime
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Probabilitas untuk setiap tanaman */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Probabilitas Tanaman:
                      </h4>
                      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {mlPrediction.predictions.map((pred, index) => {
                          const isMaize = pred.crop === "maize";
                          const isRecommended = pred.crop === mlPrediction.recommendedCrop;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {pred.crop}
                                  </span>
                                  {isRecommended && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                      Rekomendasi Utama
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-gray-800">
                                  {pred.probability}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${
                                    isMaize
                                      ? mlPrediction.isSuitable
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                      : isRecommended
                                      ? "bg-emerald-500"
                                      : "bg-gray-400"
                                  }`}
                                  style={{ width: `${pred.probability}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Info tambahan jika tidak layak */}
                    {!mlPrediction.isSuitable && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <Info className="w-4 h-4 inline mr-2" />
                          Probabilitas Jagung: {mlPrediction.maizeProbability}% - Tanah lebih cocok untuk {mlPrediction.recommendedCrop}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "mapping" && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800">
                Atur Mapping
              </h2>

              {/* Map Section - Now at Top */}
              <Card className="w-full" style={{ overflow: 'visible' }}>
                <CardContent className="p-0 relative" style={{ overflow: 'visible', position: 'relative' }}>
                  <div className="rounded-lg border border-gray-200" style={{ minHeight: "500px", position: "relative", overflow: "visible", borderRadius: "8px" }}>
                    <LeafletMap
                      height="500px"
                      onCoordinatesChange={handleCoordinatesChange}
                      savedMappings={savedMappings || []}
                      onMappingClick={handleMappingClick}
                      selectedMappingId={selectedMappingId}
                      initialCenter={[-7.7956, 110.3695]} // Yogyakarta, Indonesia
                      initialZoom={13}
                      initialCoordinates={editingCoordinates}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="max-w-7xl">
                <div className="space-y-6">
                  {/* Edit Mapping Card */}
                  {editingMappingId ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Pencil className="w-5 h-5 text-emerald-600" />
                          Edit Mapping
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Nama Mapping */}
                        <div className="space-y-2">
                          <Label htmlFor="edit-mapping-name">
                            Nama Mapping
                          </Label>
                          <Input
                            id="edit-mapping-name"
                            type="text"
                            value={editingMappingName}
                            onChange={(e) =>
                              setEditingMappingName(e.target.value)
                            }
                            placeholder="Contoh: Mapping Blok A1"
                          />
                        </div>

                        {/* Info about current drawing */}
                        {currentCoordinates.length > 0 && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                            <div>
                              <p className="text-xs text-emerald-700 font-medium">
                                Jalur telah digambar
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {currentCoordinates.length} titik telah ditambahkan
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {currentCoordinates.length >= 3 && (() => {
                                const firstPoint = currentCoordinates[0];
                                const lastPoint = currentCoordinates[currentCoordinates.length - 1];
                                const isClosed = Math.abs(firstPoint[0] - lastPoint[0]) < 0.0001 && 
                                                 Math.abs(firstPoint[1] - lastPoint[1]) < 0.0001;
                                if (!isClosed) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                      onClick={connectPoints}
                                    >
                                      <MapPin className="w-3 h-3 mr-1" />
                                      Sambung Titik
                                    </Button>
                                  );
                                }
                                return null;
                              })()}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleClearDrawing}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Hapus Jalur
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                            onClick={handleUpdateMapping}
                            disabled={!editingMappingName.trim() || currentCoordinates.length === 0}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Batal
                          </Button>
                        </div>
                        
                        {currentCoordinates.length === 0 && (
                          <p className="text-xs text-gray-500 text-center">
                            Gambar jalur di peta terlebih dahulu sebelum menyimpan
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        Buat Mapping Baru
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Nama Mapping */}
                      <div className="space-y-2">
                        <Label htmlFor="mapping-name">
                          Nama Mapping
                        </Label>
                        <Input
                          id="mapping-name"
                          type="text"
                          value={mappingName}
                          onChange={(e) =>
                            setMappingName(e.target.value)
                          }
                          placeholder="Contoh: Mapping Blok A1"
                        />
                      </div>

                      {/* Info about current drawing */}
                      {currentCoordinates.length > 0 && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                            <div>
                          <p className="text-xs text-emerald-700 font-medium">
                            Jalur telah digambar
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {currentCoordinates.length} titik telah ditambahkan
                          </p>
                            </div>
                            <div className="flex gap-2">
                              {currentCoordinates.length >= 3 && (() => {
                                const firstPoint = currentCoordinates[0];
                                const lastPoint = currentCoordinates[currentCoordinates.length - 1];
                                const isClosed = Math.abs(firstPoint[0] - lastPoint[0]) < 0.0001 && 
                                                 Math.abs(firstPoint[1] - lastPoint[1]) < 0.0001;
                                if (!isClosed) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                      onClick={connectPoints}
                                    >
                                      <MapPin className="w-3 h-3 mr-1" />
                                      Sambung Titik
                                    </Button>
                                  );
                                }
                                return null;
                              })()}
                          <Button
                            size="sm"
                            variant="ghost"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleClearDrawing}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Hapus Jalur
                          </Button>
                            </div>
                        </div>
                      )}

                      {/* Button Save */}
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        onClick={handleSaveMapping}
                        disabled={!mappingName.trim() || currentCoordinates.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Simpan Mapping
                      </Button>
                      
                      {currentCoordinates.length === 0 && (
                        <p className="text-xs text-gray-500 text-center">
                          Gambar jalur di peta terlebih dahulu sebelum menyimpan
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  )}

                  {/* List Saved Mappings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        Daftar Mapping Tersimpan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingMappings ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                          <p className="text-sm text-gray-600">Memuat daftar mapping...</p>
                        </div>
                      ) : savedMappings.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Belum ada mapping tersimpan
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {savedMappings.map((mapping) => (
                            <div
                              key={mapping.id}
                              className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                                selectedMappingId === mapping.id
                                  ? "bg-emerald-100 border-emerald-300"
                                  : "hover:bg-emerald-50"
                              }`}
                              onClick={() => handleMappingClick(mapping.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 font-medium">
                                    {mapping.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {mapping.date || "Tanggal tidak tersedia"}
                                  </p>
                                  {mapping.coordinates && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                      ✓ Memiliki koordinat
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMapping(mapping.id);
                                    }}
                                    title="Edit Mapping"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMapping(mapping.id);
                                  }}
                                    title="Hapus Mapping"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Delete Mapping Confirmation Dialog */}
                  <AlertDialog open={isDeleteMappingDialogOpen} onOpenChange={setIsDeleteMappingDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Mapping</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus mapping <strong>"{mappingToDelete?.name}"</strong>? 
                          Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setIsDeleteMappingDialogOpen(false);
                          setMappingToDelete(null);
                        }}>
                          Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDeleteMapping}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "histori-robot" && (
            <div className="space-y-6">
              {/* Sensor History Charts - Now at Top */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Grafik Suhu & Kelembapan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Histori Suhu & Kelembapan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                          <p className="text-sm">Belum ada data</p>
                          <p className="text-xs mt-1">(Data 7 hari terakhir)</p>
                      </div>
                    </div>
                    ) : (
                      <ChartContainer
                        config={{
                          suhu: {
                            label: "Suhu",
                            color: "hsl(var(--chart-1))",
                          },
                          kelembapan: {
                            label: "Kelembapan",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-64"
                      >
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="suhu"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Suhu (°C)"
                          />
                          <Line
                            type="monotone"
                            dataKey="kelembapan"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Kelembapan (%)"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Grafik pH Tanah */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Histori pH Tanah
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                          <p className="text-sm">Belum ada data</p>
                          <p className="text-xs mt-1">(Data 7 hari terakhir)</p>
                      </div>
                    </div>
                    ) : (
                      <ChartContainer
                        config={{
                          ph: {
                            label: "pH",
                            color: "hsl(var(--chart-3))",
                          },
                        }}
                        className="h-64"
                      >
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="ph"
                            stroke="rgb(168, 85, 247)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="pH"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Grafik Nitrogen & Kalium */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Histori Nitrogen & Kalium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                          <p className="text-sm">Belum ada data</p>
                          <p className="text-xs mt-1">(Data 7 hari terakhir)</p>
                      </div>
                    </div>
                    ) : (
                      <ChartContainer
                        config={{
                          nitrogen: {
                            label: "Nitrogen",
                            color: "hsl(var(--chart-1))",
                          },
                          kalium: {
                            label: "Kalium",
                            color: "hsl(var(--chart-4))",
                          },
                        }}
                        className="h-64"
                      >
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="nitrogen"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Nitrogen (mg/kg)"
                          />
                          <Line
                            type="monotone"
                            dataKey="kalium"
                            stroke="rgb(245, 158, 11)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Kalium (mg/kg)"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Grafik Phospor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Histori Phospor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                          <p className="text-sm">Belum ada data</p>
                          <p className="text-xs mt-1">(Data 7 hari terakhir)</p>
                      </div>
                    </div>
                    ) : (
                      <ChartContainer
                        config={{
                          phospor: {
                            label: "Phospor",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-64"
                      >
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="phospor"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Phospor (mg/kg)"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Data Table - Now at Bottom */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    Histori Data Sensor & Robot
                  </CardTitle>
                  <Button
                    onClick={handleDownloadHistory}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh Histori
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">
                            Waktu
                          </TableHead>
                          <TableHead className="text-center">
                            Suhu (°C)
                          </TableHead>
                          <TableHead className="text-center">
                            Kelembapan (%)
                          </TableHead>
                          <TableHead className="text-center">
                            pH
                          </TableHead>
                          <TableHead className="text-center">
                            N (mg/kg)
                          </TableHead>
                          <TableHead className="text-center">
                            P (mg/kg)
                          </TableHead>
                          <TableHead className="text-center">
                            K (mg/kg)
                          </TableHead>
                          <TableHead className="text-center">
                            Benih
                          </TableHead>
                          <TableHead className="text-center">
                            Baterai
                          </TableHead>
                          <TableHead className="text-center">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingHistory ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                              <p className="text-sm text-gray-600">Memuat history robot...</p>
                            </TableCell>
                          </TableRow>
                        ) : robotHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8">
                              <p className="text-sm text-gray-500">Belum ada data history robot</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          robotHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-2 whitespace-nowrap justify-center">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {record.timestampFormatted || formatTimestamp(record.timestamp)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {record.suhu}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.kelembapan}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.ph}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.nitrogen}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.phospor}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.kalium}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.benihTertanam} biji
                            </TableCell>
                            <TableCell className="text-center">
                              {record.baterai}%
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                                  record.status === "Layak"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {record.status}
                              </span>
                            </TableCell>
                          </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "parameter" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Pengaturan Parameter Penaburan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Kedalaman Tanam */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Kedalaman Tanam (cm)</Label>
                        <span className="text-emerald-600">
                          {seedingDepth[0]} cm
                        </span>
                      </div>
                      <Slider
                        value={seedingDepth}
                        onValueChange={setSeedingDepth}
                        min={3}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Rekomendasi untuk jagung: 5-7 cm
                      </p>
                    </div>

                    {/* Jarak Antar Lubang */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Jarak Antar Lubang (cm)</Label>
                        <span className="text-emerald-600">
                          {holeSpacing[0]} cm
                        </span>
                      </div>
                      <Slider
                        value={holeSpacing}
                        onValueChange={setHoleSpacing}
                        min={15}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Rekomendasi untuk jagung: 20-25 cm
                      </p>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <Button
                        onClick={handleSaveParameters}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Simpan Parameter
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleResetToDefault}
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Reset ke Default
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "kendali-manual" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kendali Robot Seedbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Robot Status & Mode Switch */}
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Koneksi:
                          </p>
                          <p
                            className={
                              robotStatus.connectionStatus === "terhubung"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }
                          >
                            {robotStatus.connectionStatus === "terhubung"
                              ? "Terhubung"
                              : "Terputus"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Status Robot:
                          </p>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${
                              robotStatus.operationStatus === "Standby" || robotStatus.operationStatus === "Berhenti"
                                ? "text-gray-700"
                                : robotStatus.operationStatus === "Penaburan Aktif"
                                ? "text-green-700"
                                : "text-emerald-700"
                            }`}>
                              {robotStatus.operationStatus || "Standby"}
                            </p>
                            {robotStatus.operationStatus && 
                             robotStatus.operationStatus !== "Standby" && 
                             robotStatus.operationStatus !== "Berhenti" && (
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Mode:
                          </p>
                          <p className="text-emerald-700 font-semibold">
                            {robotMode === "manual"
                              ? "Manual"
                              : "Otomatis"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Update:
                          </p>
                          <p className="text-xs text-gray-500">
                            Real-time (2s)
                          </p>
                        </div>
                      </div>

                      {/* Mode Switch */}
                      <div className="flex items-center gap-3 pt-2 border-t">
                        <Label
                          htmlFor="robot-mode"
                          className="text-sm"
                        >
                          Mode Kontrol:
                        </Label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${robotMode === "manual" ? "text-emerald-700" : "text-gray-500"}`}
                          >
                            Manual
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="robot-mode"
                              checked={robotMode === "otomatis"}
                              onChange={(e) => {
                                handleModeChange(
                                  e.target.checked
                                    ? "otomatis"
                                    : "manual",
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span
                            className={`text-sm ${robotMode === "otomatis" ? "text-emerald-700" : "text-gray-500"}`}
                          >
                            Otomatis
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="space-y-6">
                      {/* Directional Controls */}
                      <div>
                        <h3 className="mb-4">
                          Kontrol Arah Gerakan
                        </h3>
                        <div className="flex flex-col items-center gap-2">
                          <Button
                            size="lg"
                            onClick={() =>
                              handleRobotControl("Maju")
                            }
                            disabled={robotMode === "otomatis" || isTancapSensor}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              size="lg"
                              onClick={() =>
                                handleRobotControl("Kiri")
                              }
                              disabled={
                                robotMode === "otomatis" || isTancapSensor
                              }
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-16"
                              disabled
                            >
                              <Square className="w-5 h-5" />
                            </Button>
                            <Button
                              size="lg"
                              onClick={() =>
                                handleRobotControl("Kanan")
                              }
                              disabled={
                                robotMode === "otomatis" || isTancapSensor
                              }
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                          <Button
                            size="lg"
                            onClick={() =>
                              handleRobotControl("Mundur")
                            }
                            disabled={robotMode === "otomatis" || isTancapSensor}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Operation Controls */}
                      <div className="space-y-3">
                        <h3>Kontrol Operasi</h3>
                        
                        {/* Tancap Sensor Button - Only for Manual mode */}
                        {robotMode === "manual" && (
                          <div className="w-full">
                            <Button
                              onClick={() =>
                                handleRobotControl("Tancap Sensor")
                              }
                              disabled={isTancapSensor}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-indigo-800 py-3"
                              style={{ 
                                color: '#ffffff',
                                backgroundColor: isTancapSensor ? '#9ca3af' : '#4f46e5'
                              }}
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              <span className="text-white font-semibold">
                                {isTancapSensor ? "Tancap Sensor (5 detik)..." : "Tancap Sensor"}
                              </span>
                            </Button>
                          </div>
                        )}

                        {/* Pilih Mapping - Only for Otomatis mode */}
                        {robotMode === "otomatis" && (
                          <div className="space-y-2">
                            <Label htmlFor="select-mapping">
                              Pilih Mapping
                            </Label>
                            <select
                              id="select-mapping"
                              value={selectedMapping}
                              onChange={async (e) => {
                                const mappingId = e.target.value;
                                setSelectedMapping(mappingId);
                                
                                // Save selected mapping to backend
                                try {
                                  await api.farmer.updateRobotStatus({
                                    selectedMappingId: mappingId || null,
                                  });
                                  toast.success("Mapping berhasil dipilih!");
                                } catch (error) {
                                  console.error("Gagal menyimpan mapping yang dipilih:", error);
                                  toast.error("Gagal menyimpan mapping yang dipilih");
                                  // Revert selection on error
                                  const response = await api.farmer.getRobotStatus();
                                  const status = response.robotStatus || {};
                                  setSelectedMapping(status.selectedMappingId ? String(status.selectedMappingId) : "");
                                }
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="">
                                -- Pilih Mapping --
                              </option>
                              {savedMappings.map((mapping) => (
                                <option
                                  key={mapping.id}
                                  value={mapping.id}
                                >
                                  {mapping.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-3">
                          <Button
                            onClick={() =>
                              handleRobotControl(
                                "Mulai Penaburan",
                              )
                            }
                            disabled={robotMode === "manual" || (robotMode === "otomatis" && !selectedMapping) || isTancapSensor}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Mulai Penaburan
                          </Button>
                          <Button
                            onClick={() =>
                              handleRobotControl("Stop")
                            }
                            disabled={robotMode === "manual" || isTancapSensor}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                          <Button
                            onClick={() =>
                              handleRobotControl(
                                "Return to Base",
                              )
                            }
                            disabled={isTancapSensor}
                            variant="outline"
                            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RotateCw className="w-4 h-4 mr-2" />
                            Kembali ke Base
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard Controls Info */}
                    {robotMode === "manual" && robotStatus.connectionStatus === "terhubung" && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium mb-2">
                          ⌨️ Kontrol Keyboard (WASD):
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          <div><strong>W</strong> = Maju</div>
                          <div><strong>S</strong> = Mundur</div>
                          <div><strong>A</strong> = Kiri</div>
                          <div><strong>D</strong> = Kanan</div>
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {robotMode === "manual"
                          ? "⚠️ Perhatian: Mode manual hanya untuk situasi darurat atau pengujian. Untuk operasi normal, gunakan mode otomatis dengan GPS mapping untuk hasil optimal."
                          : "ℹ️ Mode Otomatis: Robot akan mengikuti jalur mapping yang telah ditentukan. Pastikan mapping sudah dipilih sebelum memulai penaburan."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "ganti-password" && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800">
                Ganti Password
              </h2>

              <Card className="w-full max-w-none" style={{ maxWidth: '2560px' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    Ubah Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-w-4xl">
                    {/* Password Lama */}
                    <div className="space-y-2">
                      <Label htmlFor="old-password">
                        Password Lama
                      </Label>
                      <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Masukkan password lama"
                        disabled={changingPassword}
                      />
                    </div>

                    {/* Password Baru */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password">
                        Password Baru
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru (min. 6 karakter)"
                        disabled={changingPassword}
                      />
                      <p className="text-xs text-gray-500">
                        Password baru harus minimal 6 karakter
                      </p>
                    </div>

                    {/* Konfirmasi Password Baru */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password Baru
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        disabled={changingPassword}
                      />
                    </div>

                    {/* Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mengubah Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Ubah Password
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Info className="w-4 h-4 inline mr-2" />
                        Pastikan password baru Anda kuat dan mudah diingat. Setelah password diubah, Anda perlu login ulang dengan password baru.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "atur-threshold" && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800">
                Atur Threshold Sensor
              </h2>

              {/* Sensor Thresholds Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Threshold Sensor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Table for thresholds */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Sensor</TableHead>
                            <TableHead className="font-semibold">Min Threshold</TableHead>
                            <TableHead className="font-semibold">Max Threshold</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Suhu */}
                          <TableRow>
                            <TableCell className="font-medium">Suhu (°C)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.suhu_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    suhu_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="20.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.suhu_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    suhu_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="35.0"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Kelembapan */}
                          <TableRow>
                            <TableCell className="font-medium">Kelembapan (%)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.kelembapan_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    kelembapan_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="40.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.kelembapan_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    kelembapan_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="80.0"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* pH */}
                          <TableRow>
                            <TableCell className="font-medium">pH Tanah</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.ph_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    ph_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="6.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.ph_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    ph_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="7.5"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Nitrogen */}
                          <TableRow>
                            <TableCell className="font-medium">Nitrogen (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.nitrogen_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    nitrogen_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="30.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.nitrogen_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    nitrogen_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="60.0"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Phospor */}
                          <TableRow>
                            <TableCell className="font-medium">Phospor (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.phospor_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    phospor_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="25.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.phospor_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    phospor_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="50.0"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Kalium */}
                          <TableRow>
                            <TableCell className="font-medium">Kalium (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.kalium_min || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    kalium_min: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="40.0"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={sensorThresholds.kalium_max || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSensorThresholds({
                                    ...sensorThresholds,
                                    kalium_max: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="70.0"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleUpdateSensorThresholds}
                        disabled={updatingThresholds}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        {updatingThresholds ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memperbarui...
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Perbarui Threshold
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "dummy-data" && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800">
                Dummy Data Panel
              </h2>
              <p className="text-sm text-gray-600">
                Panel ini memungkinkan Anda mengubah nilai sensor dan status robot secara langsung untuk keperluan testing, tanpa perlu mengubah database secara manual.
              </p>

              {/* Sensor Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600" />
                    Data Realtime Sensor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Table for sensor data */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Sensor</TableHead>
                            <TableHead className="font-semibold">Nilai Sekarang</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Suhu */}
                          <TableRow>
                            <TableCell className="font-medium">Suhu (°C)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.suhu || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    suhu: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="28.5"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Kelembapan */}
                          <TableRow>
                            <TableCell className="font-medium">Kelembapan (%)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.kelembapan || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    kelembapan: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="65.3"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* pH */}
                          <TableRow>
                            <TableCell className="font-medium">pH Tanah</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.ph || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    ph: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="6.8"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Nitrogen */}
                          <TableRow>
                            <TableCell className="font-medium">Nitrogen (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.nitrogen || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    nitrogen: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="45.2"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Phospor */}
                          <TableRow>
                            <TableCell className="font-medium">Phospor (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.phospor || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    phospor: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="38.7"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Kalium */}
                          <TableRow>
                            <TableCell className="font-medium">Kalium (mg/kg)</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={dummySensorData.kalium || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDummySensorData({
                                    ...dummySensorData,
                                    kalium: value === "" ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
                                  });
                                }}
                                placeholder="52.1"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleUpdateDummySensorData}
                        disabled={updatingDummyData}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        {updatingDummyData ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memperbarui...
                          </>
                        ) : (
                          <>
                            <Sliders className="w-4 h-4 mr-2" />
                            Perbarui Data Sensor
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Robot Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Status Robot Realtime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Connection Status */}
                    <div className="space-y-2">
                      <Label htmlFor="dummy-connection-status">
                        Status Koneksi
                      </Label>
                      <select
                        id="dummy-connection-status"
                        value={dummyRobotStatus.connectionStatus}
                        onChange={(e) =>
                          setDummyRobotStatus({
                            ...dummyRobotStatus,
                            connectionStatus: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="terhubung">Terhubung</option>
                        <option value="terputus">Terputus</option>
                      </select>
                    </div>

                    {/* Operation Status */}
                    <div className="space-y-2">
                      <Label htmlFor="dummy-operation-status">
                        Status Operasi
                      </Label>
                      <Input
                        id="dummy-operation-status"
                        type="text"
                        value={dummyRobotStatus.operationStatus}
                        onChange={(e) =>
                          setDummyRobotStatus({
                            ...dummyRobotStatus,
                            operationStatus: e.target.value,
                          })
                        }
                        placeholder="Standby, Maju, Mundur, dll."
                      />
                    </div>

                    {/* Benih Tertanam */}
                    <div className="space-y-2">
                      <Label htmlFor="dummy-benih-tertanam">
                        Benih Tertanam (biji)
                      </Label>
                      <Input
                        id="dummy-benih-tertanam"
                        type="number"
                        value={dummyRobotStatus.benihTertanam || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDummyRobotStatus({
                            ...dummyRobotStatus,
                            benihTertanam: value === "" ? 0 : (isNaN(parseInt(value)) ? 0 : parseInt(value)),
                          });
                        }}
                        placeholder="0"
                      />
                    </div>

                    {/* Baterai */}
                    <div className="space-y-2">
                      <Label htmlFor="dummy-baterai">
                        Baterai (%)
                      </Label>
                      <Input
                        id="dummy-baterai"
                        type="number"
                        min="0"
                        max="100"
                        value={dummyRobotStatus.baterai || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDummyRobotStatus({
                            ...dummyRobotStatus,
                            baterai: value === "" ? 0 : (isNaN(parseInt(value)) ? 0 : parseInt(value)),
                          });
                        }}
                        placeholder="100"
                      />
                    </div>

                    <Button
                      onClick={handleUpdateDummyRobotStatus}
                      disabled={updatingDummyData}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      {updatingDummyData ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memperbarui...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Perbarui Status Robot
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Info className="w-4 h-4 inline mr-2" />
                      Perubahan yang Anda buat akan langsung terlihat di menu "Lihat Data Realtime" dan "Kendali Robot". Data ini akan tersimpan di database dan dapat digunakan untuk testing fitur-fitur lainnya.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}