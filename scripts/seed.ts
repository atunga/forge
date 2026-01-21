import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// AutoCrib machine types
const AUTOCRIB_TYPES = ["RDS", "Robo500", "Robo1000", "Robo2000", "TX750", "FX Locker"];

// CribMaster machine types
const CRIBMASTER_TYPES = ["Toolbox", "ProStock", "ProLock", "MultiStore", "CabLock", "WeighStation"];

// Comprehensive item catalog - industrial supplies
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
  { partNumber: "WASH-1/4-LK", description: "Lock Washer 1/4in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "WASH-3/8-LK", description: "Lock Washer 3/8in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "SCREW-10-32x1", description: "Machine Screw 10-32 x 1in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },
  { partNumber: "SCREW-1/4-20x1", description: "Socket Cap Screw 1/4-20 x 1in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 50 },
  { partNumber: "SETSCRW-1/4", description: "Set Screw 1/4-20 x 1/4in", manufacturer: "FastenerWorld", category: "Fasteners", standardPackQty: 100 },

  // Tape & Adhesives
  { partNumber: "TAPE-DUCT-SLV", description: "Duct Tape Silver 2in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "TAPE-MASK-1", description: "Masking Tape 1in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "TAPE-MASK-2", description: "Masking Tape 2in x 60yd", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "TAPE-PACK-CLR", description: "Packing Tape Clear 2in", manufacturer: "3M", category: "Tape", standardPackQty: 6 },
  { partNumber: "TAPE-FOAM-DBL", description: "Double-Sided Foam Tape", manufacturer: "3M", category: "Tape", standardPackQty: 1 },
  { partNumber: "SUPER-GLUE", description: "Super Glue 3g", manufacturer: "Loctite", category: "Tape", standardPackQty: 1 },
  { partNumber: "EPOXY-5MIN", description: "5-Minute Epoxy 1oz", manufacturer: "Devcon", category: "Tape", standardPackQty: 1 },
  { partNumber: "SILICONE-CLR", description: "Silicone Sealant Clear 10oz", manufacturer: "GE", category: "Tape", standardPackQty: 1 },

  // Hand Tools
  { partNumber: "SCDRV-PHLP-2", description: "Screwdriver Phillips #2", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "SCDRV-FLAT-1/4", description: "Screwdriver Flat 1/4in", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "WRENCH-ADJ-8", description: "Adjustable Wrench 8in", manufacturer: "Crescent", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "WRENCH-ADJ-10", description: "Adjustable Wrench 10in", manufacturer: "Crescent", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "PLIER-SLIP-8", description: "Slip Joint Pliers 8in", manufacturer: "Channellock", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "PLIER-NEED-6", description: "Needle Nose Pliers 6in", manufacturer: "Channellock", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "PLIER-DIAG-6", description: "Diagonal Cutters 6in", manufacturer: "Klein", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HAMMER-BALL-16", description: "Ball Peen Hammer 16oz", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HAMMER-CLAW-16", description: "Claw Hammer 16oz", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "TAPE-MEAS-25", description: "Tape Measure 25ft", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "LEVEL-9", description: "Torpedo Level 9in", manufacturer: "Stanley", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HEX-SET-SAE", description: "Hex Key Set SAE 9pc", manufacturer: "Bondhus", category: "Hand Tools", standardPackQty: 1 },
  { partNumber: "HEX-SET-MET", description: "Hex Key Set Metric 9pc", manufacturer: "Bondhus", category: "Hand Tools", standardPackQty: 1 },

  // Welding
  { partNumber: "WELD-ROD-6011", description: "Welding Rod 6011 1/8in 5lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 5 },
  { partNumber: "WELD-ROD-7018", description: "Welding Rod 7018 1/8in 5lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 5 },
  { partNumber: "WELD-WIRE-035", description: "MIG Wire .035 11lb", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-TIP-035", description: "Contact Tip .035 10pk", manufacturer: "Lincoln", category: "Welding", standardPackQty: 10 },
  { partNumber: "WELD-NOZZ", description: "MIG Nozzle 1/2in", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-ANTI-SPT", description: "Anti-Spatter Spray 16oz", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-LENS-10", description: "Welding Lens Shade 10", manufacturer: "Jackson", category: "Welding", standardPackQty: 1 },
  { partNumber: "WELD-GLOVE-LG", description: "Welding Gloves Large", manufacturer: "Lincoln", category: "Welding", standardPackQty: 1 },

  // Markers & Writing
  { partNumber: "MARKER-PERM-BLK", description: "Permanent Marker Black", manufacturer: "Sharpie", category: "Markers", standardPackQty: 12 },
  { partNumber: "MARKER-PAINT-WHT", description: "Paint Marker White", manufacturer: "Markal", category: "Markers", standardPackQty: 1 },
  { partNumber: "MARKER-PAINT-YEL", description: "Paint Marker Yellow", manufacturer: "Markal", category: "Markers", standardPackQty: 1 },
  { partNumber: "SOAPSTONE", description: "Soapstone Markers 12pk", manufacturer: "Markal", category: "Markers", standardPackQty: 12 },
  { partNumber: "PENCIL-CARP", description: "Carpenter Pencil", manufacturer: "Dixon", category: "Markers", standardPackQty: 12 },

  // Cleaning
  { partNumber: "RAG-SHOP-25", description: "Shop Rags 25lb Box", manufacturer: "CleanCrew", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "TOWEL-BLUE-55", description: "Blue Shop Towels 55ct", manufacturer: "Scott", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "DEGREASER-GAL", description: "Degreaser 1 Gallon", manufacturer: "Simple Green", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "HAND-CLEAN", description: "Hand Cleaner 4.5lb", manufacturer: "Gojo", category: "Cleaning", standardPackQty: 1 },
  { partNumber: "ABSORB-OIL", description: "Oil Absorbent 40lb Bag", manufacturer: "SafeStep", category: "Cleaning", standardPackQty: 1 },
];

// Customer data - 15 customers with realistic manufacturing company names
const CUSTOMERS = [
  { code: "ACME-001", name: "Acme Manufacturing", city: "Springfield", state: "IL", zip: "62701", stationCount: 8, vendingType: "AUTOCRIB" },
  { code: "TECH-002", name: "TechFab Industries", city: "Chicago", state: "IL", zip: "60601", stationCount: 12, vendingType: "CRIBMASTER" },
  { code: "PREC-003", name: "Precision Parts Co", city: "Detroit", state: "MI", zip: "48201", stationCount: 25, vendingType: "AUTOCRIB" },
  { code: "UNIV-004", name: "Universal Machining", city: "Cleveland", state: "OH", zip: "44101", stationCount: 6, vendingType: "CRIBMASTER" },
  { code: "STAR-005", name: "Star Fabrication", city: "Pittsburgh", state: "PA", zip: "15201", stationCount: 30, vendingType: "AUTOCRIB" },
  { code: "QUAL-006", name: "Quality Tool & Die", city: "Milwaukee", state: "WI", zip: "53201", stationCount: 4, vendingType: "CRIBMASTER" },
  { code: "APEX-007", name: "Apex Metal Works", city: "Indianapolis", state: "IN", zip: "46201", stationCount: 18, vendingType: "AUTOCRIB" },
  { code: "CENT-008", name: "Central Manufacturing", city: "Columbus", state: "OH", zip: "43201", stationCount: 15, vendingType: "CRIBMASTER" },
  { code: "ATLS-009", name: "Atlas Industrial", city: "Grand Rapids", state: "MI", zip: "49501", stationCount: 28, vendingType: "AUTOCRIB" },
  { code: "IRON-010", name: "Ironclad Fabricators", city: "St. Louis", state: "MO", zip: "63101", stationCount: 10, vendingType: "CRIBMASTER" },
  { code: "DELT-011", name: "Delta Precision", city: "Cincinnati", state: "OH", zip: "45201", stationCount: 22, vendingType: "AUTOCRIB" },
  { code: "NOBL-012", name: "Noble Manufacturing", city: "Louisville", state: "KY", zip: "40201", stationCount: 7, vendingType: "CRIBMASTER" },
  { code: "EAGL-013", name: "Eagle Tool & Machine", city: "Minneapolis", state: "MN", zip: "55401", stationCount: 16, vendingType: "AUTOCRIB" },
  { code: "PHNX-014", name: "Phoenix Industrial", city: "Kansas City", state: "MO", zip: "64101", stationCount: 20, vendingType: "CRIBMASTER" },
  { code: "STNL-015", name: "Sentinel Machining", city: "Dayton", state: "OH", zip: "45401", stationCount: 5, vendingType: "AUTOCRIB" },
];

// Location names for variety
const LOCATION_PREFIXES = [
  "Main Production Floor", "Assembly Line", "Tool Room", "Machine Shop", "CNC Area",
  "Welding Bay", "Paint Shop", "Shipping Dock", "Maintenance Shop", "Quality Lab",
  "Press Room", "Fabrication Area", "Grinding Station", "Finishing Area", "Testing Lab",
  "Building A", "Building B", "Building C", "North Wing", "South Wing",
  "East Production", "West Production", "Mezzanine", "Clean Room", "Heavy Equipment Bay"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding database with comprehensive data...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.purchaseOrderLine.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.usageTransaction.deleteMany({});
  await prisma.erpInventory.deleteMany({});
  await prisma.stationItem.deleteMany({});
  await prisma.vendingStation.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.supplier.deleteMany({});
  console.log("Existing data cleared.\n");

  // Create suppliers
  console.log("Creating suppliers...");
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { code: "SUP001", name: "Industrial Supply Co", leadTimeDays: 7 } }),
    prisma.supplier.create({ data: { code: "SUP002", name: "Tool Warehouse Direct", leadTimeDays: 14 } }),
    prisma.supplier.create({ data: { code: "SUP003", name: "Safety Products Inc", leadTimeDays: 5 } }),
    prisma.supplier.create({ data: { code: "SUP004", name: "FastenerWorld Dist", leadTimeDays: 3 } }),
    prisma.supplier.create({ data: { code: "SUP005", name: "Abrasives Unlimited", leadTimeDays: 10 } }),
  ]);
  console.log(`Created ${suppliers.length} suppliers.\n`);

  // Create items
  console.log("Creating items...");
  const items = await Promise.all(
    ITEM_CATALOG.map(item => prisma.item.create({ data: item }))
  );
  console.log(`Created ${items.length} items.\n`);

  // Create ERP inventory for all items
  console.log("Creating ERP inventory...");
  const branches = [
    { branchId: "MAIN", branchName: "Main Warehouse" },
    { branchId: "WEST", branchName: "West Distribution" },
    { branchId: "EAST", branchName: "East Distribution" },
  ];

  for (const item of items) {
    for (const branch of branches) {
      await prisma.erpInventory.create({
        data: {
          itemId: item.id,
          branchId: branch.branchId,
          branchName: branch.branchName,
          quantityOnHand: getRandomInt(20, 500),
          quantityOnOrder: Math.random() > 0.7 ? getRandomInt(50, 200) : 0,
          reorderPoint: getRandomInt(10, 50),
        },
      });
    }
  }
  console.log(`Created ERP inventory for ${items.length * branches.length} item/branch combinations.\n`);

  // Create customers and their vending stations
  console.log("Creating customers and vending stations...");
  let totalStations = 0;
  let totalStationItems = 0;

  for (const customerData of CUSTOMERS) {
    console.log(`  Creating ${customerData.name}...`);

    const customer = await prisma.customer.create({
      data: {
        code: customerData.code,
        name: customerData.name,
        address: `${getRandomInt(100, 9999)} Industrial Parkway`,
        city: customerData.city,
        state: customerData.state,
        zip: customerData.zip,
      },
    });

    const machineTypes = customerData.vendingType === "AUTOCRIB" ? AUTOCRIB_TYPES : CRIBMASTER_TYPES;
    const usedLocations: string[] = [];

    for (let i = 0; i < customerData.stationCount; i++) {
      // Generate unique location name
      let locationName: string;
      do {
        const prefix = getRandomElement(LOCATION_PREFIXES);
        const suffix = customerData.stationCount > 10 ? ` - Unit ${i + 1}` : "";
        locationName = prefix + suffix;
      } while (usedLocations.includes(locationName));
      usedLocations.push(locationName);

      const machineType = getRandomElement(machineTypes);

      const station = await prisma.vendingStation.create({
        data: {
          customerId: customer.id,
          name: `${machineType} - ${locationName}`,
          location: locationName,
          vendingType: customerData.vendingType as "AUTOCRIB" | "CRIBMASTER",
          externalId: `${customerData.code}-STN-${String(i + 1).padStart(3, "0")}`,
        },
      });
      totalStations++;

      // Add 50-80 items to each station
      const itemCount = getRandomInt(50, 80);
      const shuffledItems = [...items].sort(() => Math.random() - 0.5).slice(0, itemCount);

      for (const item of shuffledItems) {
        const avgDailyUsage = Math.random() * 5; // 0-5 per day average
        const packageQty = item.standardPackQty;
        const minDays = 18;
        const maxDays = 36;

        const calculatedMin = Math.ceil((avgDailyUsage * minDays) / packageQty) * packageQty;
        const calculatedMax = Math.ceil((avgDailyUsage * maxDays) / packageQty) * packageQty;

        const currentMin = Math.max(packageQty, calculatedMin + getRandomInt(-packageQty, packageQty * 2));
        const currentMax = Math.max(currentMin * 2, calculatedMax + getRandomInt(-packageQty, packageQty * 2));

        // Quantity on hand - some below min (needs attention)
        let qtyOnHand: number;
        const stockScenario = Math.random();
        if (stockScenario < 0.05) {
          qtyOnHand = 0; // Out of stock
        } else if (stockScenario < 0.15) {
          qtyOnHand = getRandomInt(1, currentMin - 1); // Low stock
        } else if (stockScenario < 0.25) {
          qtyOnHand = currentMin; // At minimum
        } else {
          qtyOnHand = getRandomInt(currentMin, currentMax); // Normal stock
        }

        await prisma.stationItem.create({
          data: {
            stationId: station.id,
            itemId: item.id,
            quantityOnHand: qtyOnHand,
            currentMin: currentMin,
            currentMax: currentMax,
            packageQty: packageQty,
            quantityOnOrder: qtyOnHand < currentMin && Math.random() > 0.5 ? getRandomInt(1, 3) * packageQty : 0,
            numberOfBins: getRandomInt(1, 4),
            binLocations: `${String.fromCharCode(65 + getRandomInt(0, 5))}${getRandomInt(1, 20)}`,
          },
        });
        totalStationItems++;
      }
    }
  }
  console.log(`Created ${CUSTOMERS.length} customers with ${totalStations} stations and ${totalStationItems} station items.\n`);

  // Generate usage transactions for last 90 days
  console.log("Generating usage transactions (this may take a moment)...");
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const stationItems = await prisma.stationItem.findMany({
    include: { item: true },
    take: 500, // Limit for performance
  });

  let usageCount = 0;
  const usageBatch: Parameters<typeof prisma.usageTransaction.createMany>[0]["data"] = [];

  for (const si of stationItems) {
    const avgDailyUsage = Math.random() * 3 + 0.2; // 0.2-3.2 per day
    const currentDate = new Date(ninetyDaysAgo);

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const skipDay = isWeekend && Math.random() > 0.2;

      if (!skipDay && Math.random() > 0.3) {
        const dailyUsage = Math.max(0, Math.round(avgDailyUsage * (0.3 + Math.random() * 1.4)));

        if (dailyUsage > 0) {
          const txDate = new Date(currentDate);
          txDate.setHours(7 + Math.floor(Math.random() * 10));
          txDate.setMinutes(Math.floor(Math.random() * 60));

          usageBatch.push({
            stationItemId: si.id,
            itemId: si.itemId,
            quantity: dailyUsage,
            transactionAt: txDate,
            userId: `USER${getRandomInt(1, 50)}`,
            jobNumber: `JOB-${getRandomInt(1000, 9999)}`,
          });
          usageCount++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Batch insert usage transactions
  if (usageBatch.length > 0) {
    await prisma.usageTransaction.createMany({ data: usageBatch });
  }
  console.log(`Created ${usageCount} usage transactions.\n`);

  // Create some purchase orders
  console.log("Creating purchase orders...");
  const poItems = items.slice(0, 20);

  for (let i = 0; i < 10; i++) {
    const supplier = getRandomElement(suppliers);
    const orderDate = new Date(today);
    orderDate.setDate(orderDate.getDate() - getRandomInt(1, 14));

    const expectedDate = new Date(orderDate);
    expectedDate.setDate(expectedDate.getDate() + supplier.leadTimeDays);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-2025-${String(i + 1).padStart(4, "0")}`,
        supplierId: supplier.code,
        supplierName: supplier.name,
        orderDate: orderDate,
        expectedDeliveryDate: expectedDate,
        status: Math.random() > 0.3 ? "OPEN" : "PARTIAL",
      },
    });

    // Add 2-5 lines per PO
    const lineCount = getRandomInt(2, 5);
    for (let j = 0; j < lineCount; j++) {
      const item = getRandomElement(poItems);
      const qtyOrdered = getRandomInt(1, 5) * item.standardPackQty;

      await prisma.purchaseOrderLine.create({
        data: {
          purchaseOrderId: po.id,
          itemId: item.id,
          quantityOrdered: qtyOrdered,
          quantityReceived: po.status === "PARTIAL" ? Math.floor(qtyOrdered * 0.5) : 0,
          unitCost: getRandomInt(100, 5000) / 100,
        },
      });
    }
  }
  console.log("Created 10 purchase orders.\n");

  // Generate recommendations for some customers
  console.log("Generating recommendations...");
  const customersWithRecs = await prisma.customer.findMany({ take: 5 });
  let recCount = 0;

  for (const customer of customersWithRecs) {
    const customerStationItems = await prisma.stationItem.findMany({
      where: {
        station: { customerId: customer.id },
      },
      include: { item: true },
      take: 15,
    });

    for (const si of customerStationItems) {
      if (Math.random() > 0.5) continue;

      const avgDailyUsage = Math.random() * 3 + 0.5;
      const recommendedMin = Math.ceil((avgDailyUsage * 18) / si.packageQty) * si.packageQty;
      const recommendedMax = Math.ceil((avgDailyUsage * 36) / si.packageQty) * si.packageQty;

      await prisma.recommendation.create({
        data: {
          customerId: customer.id,
          itemId: si.itemId,
          stationId: si.stationId,
          avgDailyUsage: avgDailyUsage,
          usageDays: 90,
          currentMin: si.currentMin,
          currentMax: si.currentMax,
          currentQtyOnHand: si.quantityOnHand,
          packageQty: si.packageQty,
          recommendedMin: recommendedMin,
          recommendedMax: recommendedMax,
          warehouseBackupQty: Math.ceil(avgDailyUsage * 21),
          supplierLeadTimeDays: 14,
          status: "PENDING",
        },
      });
      recCount++;
    }
  }
  console.log(`Created ${recCount} recommendations.\n`);

  console.log("=".repeat(50));
  console.log("Database seeding completed successfully!");
  console.log("=".repeat(50));
  console.log(`\nSummary:`);
  console.log(`  - ${suppliers.length} suppliers`);
  console.log(`  - ${items.length} items`);
  console.log(`  - ${CUSTOMERS.length} customers`);
  console.log(`  - ${totalStations} vending stations`);
  console.log(`  - ${totalStationItems} station items`);
  console.log(`  - ${usageCount} usage transactions`);
  console.log(`  - ${recCount} recommendations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
