// Mock data for demo mode - no database required
// Comprehensive industrial supplies inventory

// AutoCrib machine types
const AUTOCRIB_TYPES = ["RDS", "Robo500", "Robo1000", "Robo2000", "TX750", "FX Locker"];
// CribMaster machine types
const CRIBMASTER_TYPES = ["Toolbox", "ProStock", "ProLock", "MultiStore", "CabLock", "WeighStation"];

// Comprehensive item catalog
const ITEM_CATALOG = [
  // PPE - Safety
  { partNumber: "GLV-NIT-SM", description: "Nitrile Gloves Small", manufacturer: "SafeHands", category: "PPE", standardPackQty: 100 },
  { partNumber: "GLV-NIT-MD", description: "Nitrile Gloves Medium", manufacturer: "SafeHands", category: "PPE", standardPackQty: 100 },
  { partNumber: "GLV-NIT-LG", description: "Nitrile Gloves Large", manufacturer: "SafeHands", category: "PPE", standardPackQty: 100 },
  { partNumber: "GLV-NIT-XL", description: "Nitrile Gloves X-Large", manufacturer: "SafeHands", category: "PPE", standardPackQty: 100 },
  { partNumber: "GLV-LTHR-MD", description: "Leather Work Gloves Medium", manufacturer: "ToughGrip", category: "PPE", standardPackQty: 1 },
  { partNumber: "GLV-LTHR-LG", description: "Leather Work Gloves Large", manufacturer: "ToughGrip", category: "PPE", standardPackQty: 1 },
  { partNumber: "GLV-CUT-MD", description: "Cut Resistant Gloves Medium", manufacturer: "ArmorHand", category: "PPE", standardPackQty: 1 },
  { partNumber: "GLV-CUT-LG", description: "Cut Resistant Gloves Large", manufacturer: "ArmorHand", category: "PPE", standardPackQty: 1 },
  { partNumber: "SAF-GLAS-CLR", description: "Safety Glasses Clear", manufacturer: "VisionGuard", category: "PPE", standardPackQty: 1 },
  { partNumber: "SAF-GLAS-TINT", description: "Safety Glasses Tinted", manufacturer: "VisionGuard", category: "PPE", standardPackQty: 1 },
  { partNumber: "SAF-GOGG-CLR", description: "Safety Goggles Clear", manufacturer: "VisionGuard", category: "PPE", standardPackQty: 1 },
  { partNumber: "SAF-GOGG-CHEM", description: "Chemical Splash Goggles", manufacturer: "ChemShield", category: "PPE", standardPackQty: 1 },
  { partNumber: "EAR-PLUG-FO", description: "Foam Ear Plugs (pair)", manufacturer: "QuietZone", category: "PPE", standardPackQty: 200 },
  { partNumber: "EAR-MUFF-STD", description: "Ear Muffs Standard", manufacturer: "QuietZone", category: "PPE", standardPackQty: 1 },
  { partNumber: "RESP-N95-20", description: "N95 Respirator 20-Pack", manufacturer: "BreatheSafe", category: "PPE", standardPackQty: 20 },
  { partNumber: "RESP-P100", description: "P100 Half Face Respirator", manufacturer: "BreatheSafe", category: "PPE", standardPackQty: 1 },
  { partNumber: "FACE-SHLD", description: "Face Shield Full", manufacturer: "VisionGuard", category: "PPE", standardPackQty: 1 },
  { partNumber: "HARD-HAT-WHT", description: "Hard Hat White", manufacturer: "HeadStrong", category: "PPE", standardPackQty: 1 },
  { partNumber: "HARD-HAT-YEL", description: "Hard Hat Yellow", manufacturer: "HeadStrong", category: "PPE", standardPackQty: 1 },
  { partNumber: "VEST-HI-VIS", description: "Hi-Vis Safety Vest", manufacturer: "SafeView", category: "PPE", standardPackQty: 1 },

  // Cutting Tools
  { partNumber: "CUT-BLD-5PK", description: "Utility Knife Blades 5-Pack", manufacturer: "SharpEdge", category: "Cutting Tools", standardPackQty: 5 },
  { partNumber: "CUT-BLD-100", description: "Utility Knife Blades 100-Pack", manufacturer: "SharpEdge", category: "Cutting Tools", standardPackQty: 100 },
  { partNumber: "CUT-KNIFE-STD", description: "Utility Knife Standard", manufacturer: "SharpEdge", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "CUT-KNIFE-HD", description: "Utility Knife Heavy Duty", manufacturer: "SharpEdge", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "SCIS-IND-8", description: "Industrial Scissors 8 inch", manufacturer: "CutMaster", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "SNIP-TIN-STR", description: "Tin Snips Straight", manufacturer: "MetalCut", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "SNIP-TIN-LFT", description: "Tin Snips Left", manufacturer: "MetalCut", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "SNIP-TIN-RGT", description: "Tin Snips Right", manufacturer: "MetalCut", category: "Cutting Tools", standardPackQty: 1 },
  { partNumber: "HACKSAW-BLD", description: "Hacksaw Blade 12 inch", manufacturer: "SawPro", category: "Cutting Tools", standardPackQty: 10 },
  { partNumber: "BANDSAW-BLD", description: "Bandsaw Blade 93x1/2", manufacturer: "SawPro", category: "Cutting Tools", standardPackQty: 3 },

  // Drill Bits
  { partNumber: "DRL-BIT-1/16", description: "Drill Bit HSS 1/16", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-1/8", description: "Drill Bit HSS 1/8", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-3/16", description: "Drill Bit HSS 3/16", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-1/4", description: "Drill Bit HSS 1/4", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-5/16", description: "Drill Bit HSS 5/16", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-3/8", description: "Drill Bit HSS 3/8", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-BIT-1/2", description: "Drill Bit HSS 1/2", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-COB-1/4", description: "Drill Bit Cobalt 1/4", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-COB-3/8", description: "Drill Bit Cobalt 3/8", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "DRL-SET-29", description: "Drill Bit Set 29pc HSS", manufacturer: "DrillPro", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "TAP-1/4-20", description: "Tap 1/4-20 NC", manufacturer: "ThreadMaster", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "TAP-5/16-18", description: "Tap 5/16-18 NC", manufacturer: "ThreadMaster", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "TAP-3/8-16", description: "Tap 3/8-16 NC", manufacturer: "ThreadMaster", category: "Drill Bits", standardPackQty: 1 },
  { partNumber: "TAP-1/2-13", description: "Tap 1/2-13 NC", manufacturer: "ThreadMaster", category: "Drill Bits", standardPackQty: 1 },

  // Abrasives
  { partNumber: "GRIND-4.5-36", description: "Grinding Wheel 4.5in 36 Grit", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 25 },
  { partNumber: "GRIND-4.5-60", description: "Grinding Wheel 4.5in 60 Grit", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 25 },
  { partNumber: "CUTOFF-4.5", description: "Cutoff Wheel 4.5in", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 25 },
  { partNumber: "FLAP-4.5-40", description: "Flap Disc 4.5in 40 Grit", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 10 },
  { partNumber: "FLAP-4.5-80", description: "Flap Disc 4.5in 80 Grit", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 10 },
  { partNumber: "SAND-80-9x11", description: "Sandpaper 80 Grit 9x11", manufacturer: "SandMaster", category: "Abrasives", standardPackQty: 50 },
  { partNumber: "SAND-120-9x11", description: "Sandpaper 120 Grit 9x11", manufacturer: "SandMaster", category: "Abrasives", standardPackQty: 50 },
  { partNumber: "SAND-220-9x11", description: "Sandpaper 220 Grit 9x11", manufacturer: "SandMaster", category: "Abrasives", standardPackQty: 50 },
  { partNumber: "WIRE-WHL-4", description: "Wire Wheel 4 inch", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 1 },
  { partNumber: "WIRE-CUP-3", description: "Wire Cup Brush 3 inch", manufacturer: "AbrasivePro", category: "Abrasives", standardPackQty: 1 },

  // Electrical
  { partNumber: "TAPE-ELEC-BLK", description: "Electrical Tape Black", manufacturer: "3M", category: "Electrical", standardPackQty: 1 },
  { partNumber: "TAPE-ELEC-RED", description: "Electrical Tape Red", manufacturer: "3M", category: "Electrical", standardPackQty: 1 },
  { partNumber: "TAPE-ELEC-WHT", description: "Electrical Tape White", manufacturer: "3M", category: "Electrical", standardPackQty: 1 },
  { partNumber: "WIRE-NUT-YEL", description: "Wire Nuts Yellow 100pk", manufacturer: "Ideal", category: "Electrical", standardPackQty: 100 },
  { partNumber: "WIRE-NUT-RED", description: "Wire Nuts Red 100pk", manufacturer: "Ideal", category: "Electrical", standardPackQty: 100 },
  { partNumber: "FUSE-20A-ATM", description: "Fuse 20A ATM Mini", manufacturer: "Buss", category: "Electrical", standardPackQty: 5 },
  { partNumber: "FUSE-30A-ATM", description: "Fuse 30A ATM Mini", manufacturer: "Buss", category: "Electrical", standardPackQty: 5 },
  { partNumber: "TERM-RING-16", description: "Ring Terminal 16-14 AWG", manufacturer: "Ideal", category: "Electrical", standardPackQty: 100 },
  { partNumber: "TERM-SPADE-16", description: "Spade Terminal 16-14 AWG", manufacturer: "Ideal", category: "Electrical", standardPackQty: 100 },
  { partNumber: "ZIPTIE-8-BLK", description: "Zip Ties 8in Black 100pk", manufacturer: "TyWrap", category: "Electrical", standardPackQty: 100 },
  { partNumber: "ZIPTIE-14-BLK", description: "Zip Ties 14in Black 100pk", manufacturer: "TyWrap", category: "Electrical", standardPackQty: 100 },

  // Lubricants & Chemicals
  { partNumber: "LUBE-WD40-12", description: "WD-40 12oz Can", manufacturer: "WD-40 Company", category: "Lubricants", standardPackQty: 6 },
  { partNumber: "LUBE-PEN-OIL", description: "Penetrating Oil 12oz", manufacturer: "PB Blaster", category: "Lubricants", standardPackQty: 1 },
  { partNumber: "GREASE-LITH", description: "Lithium Grease 14oz Tube", manufacturer: "LubeAll", category: "Lubricants", standardPackQty: 1 },
  { partNumber: "GREASE-CART", description: "Grease Cartridge 14oz", manufacturer: "LubeAll", category: "Lubricants", standardPackQty: 10 },
  { partNumber: "OIL-3IN1-4", description: "3-in-1 Oil 4oz", manufacturer: "3-in-1", category: "Lubricants", standardPackQty: 1 },
  { partNumber: "CLEAN-BRAKE", description: "Brake Cleaner 15oz", manufacturer: "CRC", category: "Lubricants", standardPackQty: 12 },
  { partNumber: "CLEAN-ELEC", description: "Electrical Cleaner 11oz", manufacturer: "CRC", category: "Lubricants", standardPackQty: 12 },
  { partNumber: "ANTI-SEIZE", description: "Anti-Seize Compound 8oz", manufacturer: "Permatex", category: "Lubricants", standardPackQty: 1 },
  { partNumber: "THREAD-LOCK", description: "Thread Locker Blue 10ml", manufacturer: "Loctite", category: "Lubricants", standardPackQty: 1 },
  { partNumber: "SILICONE-SPR", description: "Silicone Spray 11oz", manufacturer: "CRC", category: "Lubricants", standardPackQty: 1 },

  // Fasteners
  { partNumber: "BOLT-1/4-20x1", description: "Hex Bolt 1/4-20 x 1in GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "BOLT-1/4-20x2", description: "Hex Bolt 1/4-20 x 2in GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 50 },
  { partNumber: "BOLT-3/8-16x1", description: "Hex Bolt 3/8-16 x 1in GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 50 },
  { partNumber: "BOLT-3/8-16x2", description: "Hex Bolt 3/8-16 x 2in GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 25 },
  { partNumber: "BOLT-1/2-13x2", description: "Hex Bolt 1/2-13 x 2in GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 25 },
  { partNumber: "NUT-1/4-20", description: "Hex Nut 1/4-20 GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "NUT-3/8-16", description: "Hex Nut 3/8-16 GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "NUT-1/2-13", description: "Hex Nut 1/2-13 GR5", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 50 },
  { partNumber: "WASH-1/4-FL", description: "Flat Washer 1/4in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "WASH-3/8-FL", description: "Flat Washer 3/8in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "SCREW-10-32x1", description: "Machine Screw 10-32 x 1in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "SCREW-1/4-20x1", description: "Socket Cap Screw 1/4-20 x 1", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 50 },

  // Tape & Adhesives
  { partNumber: "TAPE-DUCT-SLV", description: "Duct Tape Silver 2in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "TAPE-MASK-1", description: "Masking Tape 1in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "TAPE-MASK-2", description: "Masking Tape 2in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "SUPER-GLUE", description: "Super Glue 3g", manufacturer: "Loctite", category: "Tape", standardPackQty: 1 },
  { partNumber: "EPOXY-5MIN", description: "5-Minute Epoxy 1oz", manufacturer: "Devcon", category: "Tape", standardPackQty: 1 },

  // Hand Tools
  { partNumber: "SCDRV-PHLP-2", description: "Screwdriver Phillips #2", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "SCDRV-FLAT-1/4", description: "Screwdriver Flat 1/4in", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "WRENCH-ADJ-8", description: "Adjustable Wrench 8in", manufacturer: "Crescent", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "WRENCH-ADJ-10", description: "Adjustable Wrench 10in", manufacturer: "Crescent", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "PLIER-SLIP-8", description: "Slip Joint Pliers 8in", manufacturer: "Channellock", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "PLIER-NEED-6", description: "Needle Nose Pliers 6in", manufacturer: "Channellock", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HAMMER-BALL-16", description: "Ball Peen Hammer 16oz", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "TAPE-MEAS-25", description: "Tape Measure 25ft", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HEX-SET-SAE", description: "Hex Key Set SAE 9pc", manufacturer: "Bondhus", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HEX-SET-MET", description: "Hex Key Set Metric 9pc", manufacturer: "Bondhus", category: "Hand Tools", standardPackQty: 1 },

  // Welding
  { partNumber: "WELD-ROD-6011", description: "Welding Rod 6011 1/8in 5lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 5 },
  { partNumber: "WELD-ROD-7018", description: "Welding Rod 7018 1/8in 5lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 5 },
  { partNumber: "WELD-WIRE-035", description: "MIG Wire .035 11lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-TIP-035", description: "Contact Tip .035 10pk", manufacturer: "Lincoln", category: "Welding", standardPackQty: 10 },
  { partNumber: "WELD-ANTI-SPT", description: "Anti-Spatter Spray 16oz", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-GLOVE-LG", description: "Welding Gloves Large", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },

  // Markers & Cleaning
  { partNumber: "MARKER-PERM-BLK", description: "Permanent Marker Black", manufacturer: "Sharpie", category: "Markers", standardPackQty: 12 },
  { partNumber: "MARKER-PAINT-WHT", description: "Paint Marker White", manufacturer: "Markal", category: "Markers", standardPackQty: 1 },
  { partNumber: "RAG-SHOP-25", description: "Shop Rags 25lb Box", manufacturer: "CleanCrew", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "TOWEL-BLUE-55", description: "Blue Shop Towels 55ct", manufacturer: "Scott", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "DEGREASER-GAL", description: "Degreaser 1 Gallon", manufacturer: "Simple Green", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "HAND-CLEAN", description: "Hand Cleaner 4.5lb", manufacturer: "Gojo", category: "Cleaning", standardPackQty: 1 },
];

// Customer configuration
const CUSTOMER_CONFIG = [
  { code: "ACME-001", name: "Acme Manufacturing", city: "Springfield", state: "IL", zip: "62701", stationCount: 8, vendingType: "AUTOCRIB" as const },
  { code: "TECH-002", name: "TechFab Industries", city: "Chicago", state: "IL", zip: "60601", stationCount: 12, vendingType: "CRIBMASTER" as const },
  { code: "PREC-003", name: "Precision Parts Co", city: "Detroit", state: "MI", zip: "48201", stationCount: 25, vendingType: "AUTOCRIB" as const },
  { code: "UNIV-004", name: "Universal Machining", city: "Cleveland", state: "OH", zip: "44101", stationCount: 6, vendingType: "CRIBMASTER" as const },
  { code: "STAR-005", name: "Star Fabrication", city: "Pittsburgh", state: "PA", zip: "15201", stationCount: 30, vendingType: "AUTOCRIB" as const },
  { code: "QUAL-006", name: "Quality Tool & Die", city: "Milwaukee", state: "WI", zip: "53201", stationCount: 4, vendingType: "CRIBMASTER" as const },
  { code: "APEX-007", name: "Apex Metal Works", city: "Indianapolis", state: "IN", zip: "46201", stationCount: 18, vendingType: "AUTOCRIB" as const },
  { code: "CENT-008", name: "Central Manufacturing", city: "Columbus", state: "OH", zip: "43201", stationCount: 15, vendingType: "CRIBMASTER" as const },
  { code: "ATLS-009", name: "Atlas Industrial", city: "Grand Rapids", state: "MI", zip: "49501", stationCount: 28, vendingType: "AUTOCRIB" as const },
  { code: "IRON-010", name: "Ironclad Fabricators", city: "St. Louis", state: "MO", zip: "63101", stationCount: 10, vendingType: "CRIBMASTER" as const },
  { code: "DELT-011", name: "Delta Precision", city: "Cincinnati", state: "OH", zip: "45201", stationCount: 22, vendingType: "AUTOCRIB" as const },
  { code: "NOBL-012", name: "Noble Manufacturing", city: "Louisville", state: "KY", zip: "40201", stationCount: 7, vendingType: "CRIBMASTER" as const },
  { code: "EAGL-013", name: "Eagle Tool & Machine", city: "Minneapolis", state: "MN", zip: "55401", stationCount: 16, vendingType: "AUTOCRIB" as const },
  { code: "PHNX-014", name: "Phoenix Industrial", city: "Kansas City", state: "MO", zip: "64101", stationCount: 20, vendingType: "CRIBMASTER" as const },
  { code: "STNL-015", name: "Sentinel Machining", city: "Dayton", state: "OH", zip: "45401", stationCount: 5, vendingType: "AUTOCRIB" as const },
];

const LOCATION_PREFIXES = [
  "Main Production Floor", "Assembly Line", "Tool Room", "Machine Shop", "CNC Area",
  "Welding Bay", "Paint Shop", "Shipping Dock", "Maintenance Shop", "Quality Lab",
  "Press Room", "Fabrication Area", "Grinding Station", "Finishing Area", "Testing Lab",
  "Building A", "Building B", "Building C", "North Wing", "South Wing",
  "East Production", "West Production", "Mezzanine", "Clean Room", "Heavy Equipment Bay",
  "Laser Cutting", "EDM Room", "Heat Treatment", "Plating Area", "Final Assembly"
];

// Seeded random for consistent data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const random = seededRandom(42);

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Generate items with IDs
export const mockItems = ITEM_CATALOG.map((item, idx) => ({
  id: `item-${idx + 1}`,
  ...item,
  unitOfMeasure: "EA",
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Generate all station items for all stations
type StationItemType = {
  id: string;
  stationId: string;
  itemId: string;
  quantityOnHand: number;
  currentMin: number;
  currentMax: number;
  packageQty: number;
  quantityOnOrder: number;
  numberOfBins: number;
  binLocations: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  item: typeof mockItems[0];
};

const allStationItems: StationItemType[] = [];
let stationItemIdCounter = 1;

// Generate stations for each customer
type StationType = {
  id: string;
  customerId: string;
  name: string;
  location: string;
  vendingType: "AUTOCRIB" | "CRIBMASTER";
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
  stationItems: StationItemType[];
  _count: { stationItems: number };
};

const allStations: StationType[] = [];
let stationIdCounter = 1;

CUSTOMER_CONFIG.forEach((config, custIdx) => {
  const machineTypes = config.vendingType === "AUTOCRIB" ? AUTOCRIB_TYPES : CRIBMASTER_TYPES;
  const usedLocations: string[] = [];

  for (let i = 0; i < config.stationCount; i++) {
    // Generate unique location
    let locationName: string;
    let attempts = 0;
    do {
      const prefix = LOCATION_PREFIXES[Math.floor(random() * LOCATION_PREFIXES.length)];
      const suffix = config.stationCount > 10 ? ` - Unit ${i + 1}` : "";
      locationName = prefix + suffix;
      attempts++;
    } while (usedLocations.includes(locationName) && attempts < 50);
    usedLocations.push(locationName);

    const machineType = getRandomElement(machineTypes);
    const stationId = `station-${stationIdCounter++}`;
    const customerId = `cust-${custIdx + 1}`;

    // Generate 50-80 station items for this station
    const itemCount = getRandomInt(50, 80);
    const shuffledItemIndices = [...Array(mockItems.length).keys()]
      .sort(() => random() - 0.5)
      .slice(0, Math.min(itemCount, mockItems.length));

    const stationItems: StationItemType[] = [];

    shuffledItemIndices.forEach((itemIdx) => {
      const item = mockItems[itemIdx];
      const packageQty = item.standardPackQty;

      const avgDailyUsage = random() * 5;
      const calculatedMin = Math.ceil((avgDailyUsage * 18) / packageQty) * packageQty;
      const calculatedMax = Math.ceil((avgDailyUsage * 36) / packageQty) * packageQty;

      const currentMin = Math.max(packageQty, calculatedMin + getRandomInt(-packageQty, packageQty * 2));
      const currentMax = Math.max(currentMin * 2, calculatedMax + getRandomInt(-packageQty, packageQty * 2));

      // Quantity on hand - some below min
      let qtyOnHand: number;
      const scenario = random();
      if (scenario < 0.05) {
        qtyOnHand = 0;
      } else if (scenario < 0.15) {
        qtyOnHand = getRandomInt(1, Math.max(1, currentMin - 1));
      } else if (scenario < 0.25) {
        qtyOnHand = currentMin;
      } else {
        qtyOnHand = getRandomInt(currentMin, currentMax);
      }

      const stationItem: StationItemType = {
        id: `si-${stationItemIdCounter++}`,
        stationId,
        itemId: item.id,
        quantityOnHand: qtyOnHand,
        currentMin,
        currentMax,
        packageQty,
        quantityOnOrder: qtyOnHand < currentMin && random() > 0.5 ? getRandomInt(1, 3) * packageQty : 0,
        numberOfBins: getRandomInt(1, 4),
        binLocations: `${String.fromCharCode(65 + getRandomInt(0, 5))}${getRandomInt(1, 20)}`,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        item,
      };

      stationItems.push(stationItem);
      allStationItems.push(stationItem);
    });

    const station: StationType = {
      id: stationId,
      customerId,
      name: `${machineType} - ${locationName}`,
      location: locationName,
      vendingType: config.vendingType,
      externalId: `${config.code}-STN-${String(i + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stationItems,
      _count: { stationItems: stationItems.length },
    };

    allStations.push(station);
  }
});

export const mockStations = allStations;
export const mockStationItems = allStationItems;

// Generate customers with their stations
export const mockCustomers = CUSTOMER_CONFIG.map((config, idx) => {
  const customerId = `cust-${idx + 1}`;
  const customerStations = allStations.filter(s => s.customerId === customerId);
  const pendingRecs = idx < 5 ? getRandomInt(3, 15) : 0; // First 5 customers have pending recommendations

  return {
    id: customerId,
    code: config.code,
    name: config.name,
    address: `${getRandomInt(100, 9999)} Industrial Parkway`,
    city: config.city,
    state: config.state,
    zip: config.zip,
    createdAt: new Date(),
    updatedAt: new Date(),
    vendingStations: customerStations,
    _count: { recommendations: pendingRecs },
  };
});

// Generate ERP inventory
export const mockErpInventory = mockItems.flatMap((item, idx) => [
  {
    id: `erp-${idx * 3 + 1}`,
    itemId: item.id,
    branchId: "MAIN",
    branchName: "Main Warehouse",
    quantityOnHand: getRandomInt(50, 500),
    quantityOnOrder: random() > 0.7 ? getRandomInt(50, 200) : 0,
    reorderPoint: getRandomInt(20, 100),
  },
  {
    id: `erp-${idx * 3 + 2}`,
    itemId: item.id,
    branchId: "WEST",
    branchName: "West Distribution",
    quantityOnHand: getRandomInt(20, 200),
    quantityOnOrder: random() > 0.8 ? getRandomInt(25, 100) : 0,
    reorderPoint: getRandomInt(10, 50),
  },
  {
    id: `erp-${idx * 3 + 3}`,
    itemId: item.id,
    branchId: "EAST",
    branchName: "East Distribution",
    quantityOnHand: getRandomInt(10, 150),
    quantityOnOrder: 0,
    reorderPoint: getRandomInt(5, 30),
  },
]);

// Generate purchase orders
const today = new Date();
export const mockPurchaseOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `po-${i + 1}`,
  poNumber: `PO-2025-${String(i + 1).padStart(4, "0")}`,
  supplierId: `SUP${String((i % 5) + 1).padStart(3, "0")}`,
  supplierName: ["Industrial Supply Co", "Tool Warehouse Direct", "Safety Products Inc", "FastenerWorld Dist", "Abrasives Unlimited"][i % 5],
  orderDate: new Date(today.getTime() - getRandomInt(1, 14) * 24 * 60 * 60 * 1000),
  expectedDeliveryDate: new Date(today.getTime() + getRandomInt(3, 21) * 24 * 60 * 60 * 1000),
  status: (random() > 0.3 ? "OPEN" : "PARTIAL") as "OPEN" | "PARTIAL",
}));

export const mockPurchaseOrderLines = mockPurchaseOrders.flatMap((po, poIdx) => {
  const lineCount = getRandomInt(2, 5);
  return Array.from({ length: lineCount }, (_, lineIdx) => {
    const item = mockItems[getRandomInt(0, mockItems.length - 1)];
    const qtyOrdered = getRandomInt(1, 5) * item.standardPackQty;
    return {
      id: `pol-${poIdx * 5 + lineIdx + 1}`,
      purchaseOrderId: po.id,
      itemId: item.id,
      quantityOrdered: qtyOrdered,
      quantityReceived: po.status === "PARTIAL" ? Math.floor(qtyOrdered * 0.5) : 0,
      unitCost: getRandomInt(100, 5000) / 100,
      purchaseOrder: po,
      item,
    };
  });
});

// Store for generated recommendations (in-memory)
let mockRecommendations: Array<{
  id: string;
  customerId: string;
  itemId: string;
  stationId: string;
  avgDailyUsage: number;
  usageDays: number;
  currentMin: number;
  currentMax: number;
  currentQtyOnHand: number;
  packageQty: number;
  recommendedMin: number;
  recommendedMax: number;
  warehouseBackupQty: number;
  supplierLeadTimeDays: number;
  status: "PENDING" | "APPROVED" | "APPLIED" | "REJECTED";
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  item: typeof mockItems[0];
}> = [];

// Pre-generate some recommendations for first 5 customers
const recRandom = seededRandom(123);
mockCustomers.slice(0, 5).forEach((customer) => {
  const customerStations = allStations.filter(s => s.customerId === customer.id);
  const sampleStationItems = customerStations
    .flatMap(s => s.stationItems)
    .sort(() => recRandom() - 0.5)
    .slice(0, getRandomInt(5, 15));

  sampleStationItems.forEach((si, idx) => {
    const avgDailyUsage = recRandom() * 3 + 0.5;
    const recommendedMin = Math.ceil((avgDailyUsage * 18) / si.packageQty) * si.packageQty;
    const recommendedMax = Math.ceil((avgDailyUsage * 36) / si.packageQty) * si.packageQty;

    mockRecommendations.push({
      id: `rec-${customer.id}-${idx}`,
      customerId: customer.id,
      itemId: si.itemId,
      stationId: si.stationId,
      avgDailyUsage,
      usageDays: 90,
      currentMin: si.currentMin,
      currentMax: si.currentMax,
      currentQtyOnHand: si.quantityOnHand,
      packageQty: si.packageQty,
      recommendedMin,
      recommendedMax,
      warehouseBackupQty: Math.ceil(avgDailyUsage * 21),
      supplierLeadTimeDays: 14,
      status: "PENDING",
      appliedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      item: si.item,
    });
  });
});

// Update customer recommendation counts
mockCustomers.forEach(customer => {
  customer._count.recommendations = mockRecommendations.filter(r => r.customerId === customer.id && r.status === "PENDING").length;
});

export function getMockRecommendations() {
  return mockRecommendations;
}

export function setMockRecommendations(recs: typeof mockRecommendations) {
  mockRecommendations = recs;
}

export function clearMockRecommendations(customerId: string) {
  mockRecommendations = mockRecommendations.filter(r => r.customerId !== customerId);
}
