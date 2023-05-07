// Copyright 2014-2022, University of Colorado Boulder

/**
 * AtomIdentifier is an object that can be used to identify various things about an atom given its configuration, such
 * as its name, chemical symbols, and stable isotopes.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Luisa Vargas
 */

import Utils from '../../dot/js/Utils.js';
import shred from './shred.js';
import ShredStrings from './ShredStrings.js';

// An arbitrary value used to signify a 'trace' abundance, meaning that a very small amount of this isotope is
// present on Earth.
const TRACE_ABUNDANCE = 0.000000000001;
const hydrogenString = ShredStrings.hydrogen;
const heliumString = ShredStrings.helium;
const lithiumString = ShredStrings.lithium;
const berylliumString = ShredStrings.beryllium;
const boronString = ShredStrings.boron;
const carbonString = ShredStrings.carbon;
const nitrogenString = ShredStrings.nitrogen;
const oxygenString = ShredStrings.oxygen;
const fluorineString = ShredStrings.fluorine;
const neonString = ShredStrings.neon;
const sodiumString = ShredStrings.sodium;
const magnesiumString = ShredStrings.magnesium;
const aluminumString = ShredStrings.aluminum;
const siliconString = ShredStrings.silicon;
const phosphorusString = ShredStrings.phosphorus;
const sulfurString = ShredStrings.sulfur;
const chlorineString = ShredStrings.chlorine;
const argonString = ShredStrings.argon;
const potassiumString = ShredStrings.potassium;
const calciumString = ShredStrings.calcium;
const scandiumString = ShredStrings.scandium;
const titaniumString = ShredStrings.titanium;
const vanadiumString = ShredStrings.vanadium;
const chromiumString = ShredStrings.chromium;
const manganeseString = ShredStrings.manganese;
const ironString = ShredStrings.iron;
const cobaltString = ShredStrings.cobalt;
const nickelString = ShredStrings.nickel;
const copperString = ShredStrings.copper;
const zincString = ShredStrings.zinc;
const galliumString = ShredStrings.gallium;
const germaniumString = ShredStrings.germanium;
const arsenicString = ShredStrings.arsenic;
const seleniumString = ShredStrings.selenium;
const bromineString = ShredStrings.bromine;
const kryptonString = ShredStrings.krypton;
const rubidiumString = ShredStrings.rubidium;
const strontiumString = ShredStrings.strontium;
const yttriumString = ShredStrings.yttrium;
const zirconiumString = ShredStrings.zirconium;
const niobiumString = ShredStrings.niobium;
const molybdenumString = ShredStrings.molybdenum;
const technetiumString = ShredStrings.technetium;
const rutheniumString = ShredStrings.ruthenium;
const rhodiumString = ShredStrings.rhodium;
const palladiumString = ShredStrings.palladium;
const silverString = ShredStrings.silver;
const cadmiumString = ShredStrings.cadmium;
const indiumString = ShredStrings.indium;
const tinString = ShredStrings.tin;
const antimonyString = ShredStrings.antimony;
const telluriumString = ShredStrings.tellurium;
const iodineString = ShredStrings.iodine;
const xenonString = ShredStrings.xenon;
const cesiumString = ShredStrings.cesium;
const bariumString = ShredStrings.barium;
const lanthanumString = ShredStrings.lanthanum;
const ceriumString = ShredStrings.cerium;
const praseodymiumString = ShredStrings.praseodymium;
const neodymiumString = ShredStrings.neodymium;
const promethiumString = ShredStrings.promethium;
const samariumString = ShredStrings.samarium;
const europiumString = ShredStrings.europium;
const gadoliniumString = ShredStrings.gadolinium;
const terbiumString = ShredStrings.terbium;
const dysprosiumString = ShredStrings.dysprosium;
const holmiumString = ShredStrings.holmium;
const erbiumString = ShredStrings.erbium;
const thuliumString = ShredStrings.thulium;
const ytterbiumString = ShredStrings.ytterbium;
const lutetiumString = ShredStrings.lutetium;
const hafniumString = ShredStrings.hafnium;
const tantalumString = ShredStrings.tantalum;
const tungstenString = ShredStrings.tungsten;
const rheniumString = ShredStrings.rhenium;
const osmiumString = ShredStrings.osmium;
const iridiumString = ShredStrings.iridium;
const platinumString = ShredStrings.platinum;
const goldString = ShredStrings.gold;
const mercuryString = ShredStrings.mercury;
const thalliumString = ShredStrings.thallium;
const leadString = ShredStrings.lead;
const bismuthString = ShredStrings.bismuth;
const poloniumString = ShredStrings.polonium;
const astatineString = ShredStrings.astatine;
const radonString = ShredStrings.radon;
const franciumString = ShredStrings.francium;
const radiumString = ShredStrings.radium;
const actiniumString = ShredStrings.actinium;
const thoriumString = ShredStrings.thorium;
const protactiniumString = ShredStrings.protactinium;
const uraniumString = ShredStrings.uranium;
const neptuniumString = ShredStrings.neptunium;
const plutoniumString = ShredStrings.plutonium;
const americiumString = ShredStrings.americium;
const curiumString = ShredStrings.curium;
const berkeliumString = ShredStrings.berkelium;
const californiumString = ShredStrings.californium;
const einsteiniumString = ShredStrings.einsteinium;
const fermiumString = ShredStrings.fermium;
const mendeleviumString = ShredStrings.mendelevium;
const nobeliumString = ShredStrings.nobelium;
const lawrenciumString = ShredStrings.lawrencium;
const rutherfordiumString = ShredStrings.rutherfordium;
const dubniumString = ShredStrings.dubnium;
const seaborgiumString = ShredStrings.seaborgium;
const bohriumString = ShredStrings.bohrium;
const hassiumString = ShredStrings.hassium;
const meitneriumString = ShredStrings.meitnerium;
const darmstadtiumString = ShredStrings.darmstadtium;
const roentgeniumString = ShredStrings.roentgenium;
const coperniciumString = ShredStrings.copernicium;
const nihoniumString = ShredStrings.nihonium;
const fleroviumString = ShredStrings.flerovium;
const moscoviumString = ShredStrings.moscovium;
const livermoriumString = ShredStrings.livermorium;
const tennessineString = ShredStrings.tennessine;
const oganessonString = ShredStrings.oganesson;
const nameTable = ['',
// No element
hydrogenString, heliumString, lithiumString, berylliumString, boronString, carbonString, nitrogenString, oxygenString, fluorineString, neonString, sodiumString, magnesiumString, aluminumString, siliconString, phosphorusString, sulfurString, chlorineString, argonString, potassiumString, calciumString, scandiumString, titaniumString, vanadiumString, chromiumString, manganeseString, ironString, cobaltString, nickelString, copperString, zincString, galliumString, germaniumString, arsenicString, seleniumString, bromineString, kryptonString, rubidiumString, strontiumString, yttriumString, zirconiumString, niobiumString, molybdenumString, technetiumString, rutheniumString, rhodiumString, palladiumString, silverString, cadmiumString, indiumString, tinString, antimonyString, telluriumString, iodineString, xenonString, cesiumString, bariumString, lanthanumString, ceriumString, praseodymiumString, neodymiumString, promethiumString, samariumString, europiumString, gadoliniumString, terbiumString, dysprosiumString, holmiumString, erbiumString, thuliumString, ytterbiumString, lutetiumString, hafniumString, tantalumString, tungstenString, rheniumString, osmiumString, iridiumString, platinumString, goldString, mercuryString, thalliumString, leadString, bismuthString, poloniumString, astatineString, radonString, franciumString, radiumString, actiniumString, thoriumString, protactiniumString, uraniumString, neptuniumString, plutoniumString, americiumString, curiumString, berkeliumString, californiumString, einsteiniumString, fermiumString, mendeleviumString, nobeliumString, lawrenciumString, rutherfordiumString, dubniumString, seaborgiumString, bohriumString, hassiumString, meitneriumString, darmstadtiumString, roentgeniumString, coperniciumString, nihoniumString, fleroviumString, moscoviumString, livermoriumString, tennessineString, oganessonString];

// Used in PhET-iO data streams
const englishNameTable = ['',
// No element
'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 'arsenic', 'selenium', 'bromine', 'krypton', 'rubidium', 'strontium', 'yttrium', 'zirconium', 'niobium', 'molybdenum', 'technetium', 'ruthenium', 'rhodium', 'palladium', 'silver', 'cadmium', 'indium', 'tin', 'antimony', 'tellurium', 'iodine', 'xenon', 'cesium', 'barium', 'lanthanum', 'cerium', 'praseodymium', 'neodymium', 'promethium', 'samarium', 'europium', 'gadolinium', 'terbium', 'dysprosium', 'holmium', 'erbium', 'thulium', 'ytterbium', 'lutetium', 'hafnium', 'tantalum', 'tungsten', 'rhenium', 'osmium', 'iridium', 'platinum', 'gold', 'mercury', 'thallium', 'lead', 'bismuth', 'polonium', 'astatine', 'radon', 'francium', 'radium', 'actinium', 'thorium', 'protactinium', 'uranium', 'neptunium', 'plutonium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium', 'fermium', 'mendelevium', 'nobelium', 'lawrencium', 'rutherfordium', 'dubnium', 'seaborgium', 'bohrium', 'hassium', 'meitnerium', 'darmstadtium', 'roentgenium', 'copernicum', 'nihonium', 'flerovium', 'moscovium', 'livermorium', 'tennessine', 'oganesson'];
const symbolTable = ['-',
// 0, NO ELEMENT
'H',
// 1, HYDROGEN
'He',
// 2, HELIUM
'Li',
// 3, LITHIUM
'Be',
// 4, BERYLLIUM
'B',
// 5, BORON
'C',
// 6, CARBON
'N',
// 7, NITROGEN
'O',
// 8, OXYGEN
'F',
// 9, FLUORINE
'Ne',
// 10, NEON
'Na',
// 11, SODIUM
'Mg',
// 12, MAGNESIUM
'Al',
// 13, ALUMINUM
'Si',
// 14, SILICON
'P',
// 15, PHOSPHORUS
'S',
// 16, SULFUR
'Cl',
// 17, CHLORINE
'Ar',
// 18, ARGON
'K',
// 19, POTASSIUM
'Ca',
// 20, CALCIUM
'Sc',
// 21, SCANDIUM
'Ti',
// 22, TITANIUM
'V',
// 23, VANADIUM
'Cr',
// 24, CHROMIUM
'Mn',
// 25, MANGANESE
'Fe',
// 26, IRON
'Co',
// 27, COBALT
'Ni',
// 28, NICKEL
'Cu',
// 29, COPPER
'Zn',
// 30, ZINC
'Ga',
// 31, GALLIUM
'Ge',
// 32, GERMANIUM
'As',
// 33, ARSENIC
'Se',
// 34, SELENIUM
'Br',
// 35, BROMINE
'Kr',
// 36, KRYPTON
'Rb',
// 37, RUBIDIUM
'Sr',
// 38, STRONTIUM
'Y',
// 39, YTTRIUM
'Zr',
// 40, ZIRCONIUM
'Nb',
// 41, NIOBIUM
'Mo',
// 42, MOLYBDENUM
'Tc',
// 43, TECHNETIUM
'Ru',
// 44, RUTHENIUM
'Rh',
// 45, RHODIUM
'Pd',
// 46, PALLADIUM
'Ag',
// 47, SILVER
'Cd',
// 48, CADMIUM
'In',
// 49, INDIUM
'Sn',
// 50, TIN
'Sb',
// 51, ANTIMONY
'Te',
// 52, TELLURIUM
'I',
// 53, IODINE
'Xe',
// 54, XENON
'Cs',
// 55, CAESIUM
'Ba',
// 56, BARIUM
'La',
// 57, LANTHANUM
'Ce',
// 58, CERIUM
'Pr',
// 59, PRASEODYMIUM
'Nd',
// 60, NEODYMIUM
'Pm',
// 61, PROMETHIUM
'Sm',
// 62, SAMARIUM
'Eu',
// 63, EUROPIUM
'Gd',
// 64, GADOLINIUM
'Tb',
// 65, TERBIUM
'Dy',
// 66, DYSPROSIUM
'Ho',
// 67, HOLMIUM
'Er',
// 68, ERBIUM
'Tm',
// 69, THULIUM
'Yb',
// 70, YTTERBIUM
'Lu',
// 71, LUTETIUM
'Hf',
// 72, HAFNIUM
'Ta',
// 73, TANTALUM
'W',
// 74, TUNGSTEN
'Re',
// 75, RHENIUM
'Os',
// 76, OSMIUM
'Ir',
// 77, IRIDIUM
'Pt',
// 78, PLATINUM
'Au',
// 79, GOLD
'Hg',
// 80, MERCURY
'Tl',
// 81, THALLIUM
'Pb',
// 82, LEAD
'Bi',
// 83, BISMUTH
'Po',
// 84, POLONIUM
'At',
// 85, ASTATINE
'Rn',
// 86, RADON
'Fr',
// 87, FRANCIUM
'Ra',
// 88, RADIUM
'Ac',
// 89, ACTINIUM
'Th',
// 90, THORIUM
'Pa',
// 91, PROTACTINIUM
'U',
// 92, URANIUM
'Np',
// 93, NEPTUNIUM
'Pu',
// 94, PLUTONIUM
'Am',
// 95, AMERICIUM
'Cm',
// 96, CURIUM
'Bk',
// 97, BERKELIUM
'Cf',
// 98, CALIFORNIUM
'Es',
// 99, EINSTEINIUM
'Fm',
// 100, FERMIUM
'Md',
// 101, MENDELEVIUM
'No',
// 102, NOBELIUM
'Lr',
// 103, LAWRENCIUM
'Rf',
// 104, RUTHERFORDIUM
'Db',
// 105, DUBNIUM
'Sg',
// 106, SEABORGIUM
'Bh',
// 107, BOHRIUM
'Hs',
// 108, HASSIUM
'Mt',
// 109, MEITNERIUM
'Ds',
// 110, DARMSTADTIUM
'Rg',
// 111, ROENTGENIUM
'Cn',
// 112, COPERNICIUM
'Nh',
// 113, NIHONIUM
'Fl',
// 114, FLEROVIUM
'Mc',
// 115, MOSCOVIUM
'Lv',
// 116, LIVERMORIUM
'Ts',
// 117, TENNESSINE
'Og' // 118, OGANESSON
];

// Table of stable elements, indexed by atomic number to a list of viable numbers of neutrons.
const stableElementTable = [
// No element
[],
// Hydrogen
[0, 1],
// Helium
[1, 2],
// Lithium
[3, 4],
// Beryllium
[5],
// Boron
[5, 6],
// Carbon
[6, 7],
// Nitrogen
[7, 8],
// Oxygen
[8, 9, 10],
// Fluorine
[10],
// Neon
[10, 11, 12],
// Sodium
[12],
// Magnesium
[12, 13, 14],
//Aluminum
[14],
// Silicon
[14, 15, 16],
// Phosphorous
[16],
// Sulfur
[16, 17, 18, 20],
// Chlorine
[18, 20],
// Argon
[18, 20, 22], [20, 22], [20, 22, 23, 24, 26], [24], [24, 25, 26, 27, 28], [28], [28, 29, 30], [30], [28, 30, 31, 32], [32], [30, 32, 33, 34, 36], [34, 36], [34, 36, 37, 38], [38, 40], [38, 40, 41, 42, 44], [42], [40, 42, 43, 44, 46], [44, 46], [42, 44, 46, 47, 48, 50], [48], [46, 48, 49, 50], [50], [50, 51, 52, 54], [52], [50, 52, 53, 54, 55, 56], [], [52, 54, 55, 56, 57, 58, 60], [58], [56, 58, 59, 60, 62, 64], [60, 62], [58, 60, 62, 63, 64, 66], [64], [62, 64, 65, 66, 67, 68, 69, 70, 72, 74], [70, 72], [68, 70, 72, 73, 74], [74], [72, 74, 75, 76, 77, 78], [78], [74, 78, 79, 80, 81, 82], [82], [78, 82], [82], [82, 83, 85, 86, 88], [], [82, 87, 88, 90, 92], [90], [90, 91, 92, 93, 94, 96], [94], [90, 92, 94, 95, 96, 97, 98], [98], [94, 96, 98, 99, 100, 102], [100], [98, 100, 101, 102, 103, 104, 106], [104], [104, 105, 106, 107, 108], [108], [108, 110, 112], [110], [111, 112, 113, 114, 116], [114, 116], [114, 116, 117, 118, 120], [118], [116, 118, 119, 120, 121, 122, 124], [122, 124], [124, 125, 126]];
const numNeutronsInMostStableIsotope = [
// No element
0,
// Hydrogen
0,
// Helium
2,
// Lithium
4,
// Beryllium
5,
// Boron
6,
// Carbon
6,
// Nitrogen
7,
// Oxygen
8,
// Fluorine
10,
// Neon
10, 12, 12, 14, 14, 16, 16, 18, 22, 20, 20, 24, 26, 28, 28, 30, 30, 32, 31, 35, 35, 39, 41, 42, 45, 45, 48, 48, 50, 50, 51, 52, 54, 55, 57, 58, 60, 61, 64, 66, 69, 71, 76, 74, 77, 78, 81, 82, 82, 82, 84, 84, 88, 89, 93, 94, 97, 98, 99, 100, 103, 104, 106, 108, 110, 111, 114, 115, 117, 118, 121, 123, 125, 126, 125, 125, 136, 136, 138, 138, 142, 140, 146, 144, 150, 148, 151, 150, 153, 153, 157, 157, 157, 159, 157, 157, 160, 157, 161];

// This data structure maps the number of electrons to a radius for an atom.  It assumes a stable, neutral atom.
// The basic values are the covalent radii, and were taken from a Wikipedia entry entitled "Atomic radii of the
// elements" which, at the time of this writing, can be found here:
// https://en.wikipedia.org/wiki/Atomic_radii_of_the_elements_(data_page).
// The values are in picometers.
const mapElectronCountToRadius = {
  1: 53,
  2: 31,
  3: 167,
  4: 112,
  5: 87,
  6: 67,
  7: 56,
  8: 48,
  9: 42,
  10: 38,
  11: 190,
  12: 145,
  13: 118,
  14: 111,
  15: 98,
  16: 88,
  17: 79,
  18: 71,
  19: 243,
  20: 194,
  21: 184,
  22: 176,
  23: 171,
  24: 166,
  25: 161,
  26: 156,
  27: 152,
  28: 149,
  29: 145,
  30: 142,
  31: 136,
  32: 125,
  33: 114,
  34: 103,
  35: 94,
  36: 88,
  37: 265,
  38: 219,
  39: 212,
  40: 206,
  41: 198,
  42: 190,
  43: 183,
  44: 178,
  45: 173,
  46: 169,
  47: 165,
  48: 161,
  49: 156,
  50: 145,
  51: 133,
  52: 123,
  53: 115,
  54: 108,
  55: 298,
  56: 253,
  57: 226,
  58: 210,
  59: 247,
  60: 206,
  61: 205,
  62: 238,
  63: 231,
  64: 233,
  65: 225,
  66: 228,
  67: 226,
  68: 226,
  69: 222,
  70: 222,
  71: 217,
  72: 208,
  73: 200,
  74: 193,
  75: 188,
  76: 185,
  77: 180,
  78: 177,
  79: 174,
  80: 171,
  81: 156,
  82: 154,
  83: 143,
  84: 135,
  85: 127,
  86: 120,
  87: 348,
  88: 215,
  89: 195,
  90: 180,
  91: 180,
  92: 175
};

// Table which contains information about the all the possible decays an unstable nuclide can undergo and the percentage
// likelihood that the nuclide will undergo each type of decay. If the decay(s) are unknown or if the percentage
// likelihood is unknown, null is used as a placeholder. The data was obtained from the Nuclear Data Services (NDS) of
// the International Atomic Energy Agency (IAEA) at the url https://www-nds.iaea.org/relnsd/NdsEnsdf/QueryForm.html.
//
// The object is first indexed by the proton number, and then by the neutron number. For example, a nuclide with 1 proton
// and 4 neutrons ( HalfLifeConstants[ 1 ][ 4 ] ) would undergo a decay of type "2N" 100% of the time that it decays.
//
// 'quote-props' lint rule is disabled in order to have consistent styling.
/* eslint-disable quote-props */
const DECAYS_INFO_TABLE = {
  0: {
    1: {
      'B-': 100
    },
    4: null,
    6: null
  },
  1: {
    2: {
      'B-': 100
    },
    3: {
      'N': 100
    },
    4: {
      '2N': 100
    },
    5: null,
    6: null
  },
  2: {
    3: {
      'N': null
    },
    4: {
      'B-': 100
    },
    5: {
      'N': null
    },
    6: {
      'B-': 100,
      'B-N': 16
    },
    7: {
      'N': 100
    },
    8: {
      'N': 100
    }
  },
  3: {
    1: {
      'P': 100
    },
    2: {
      'P': null
    },
    5: {
      'B-A': 100,
      'B-': 100
    },
    6: {
      'B-': 100,
      'B-N': 50.8
    },
    7: {
      'N': 100
    },
    8: {
      'B-': 100,
      'B-5N': null
    },
    9: {
      'N': 100
    }
  },
  4: {
    2: {
      '2P': 100,
      'A': 100
    },
    3: {
      'EC': 100
    },
    4: {
      'A': 100
    },
    6: {
      'B-': 100
    },
    7: {
      'B-': 100,
      'B-A': 3.1,
      'B-P': 0.00083
    },
    8: {
      'B-': 100,
      'B-N': 0.5
    },
    9: {
      'N': null
    },
    10: {
      'B-': 100,
      'B-N': 81,
      'B-2N': 5
    },
    11: {
      'N': 100
    },
    12: {
      'N': 100
    }
  },
  5: {
    2: {
      'P': 100
    },
    3: {
      'B+A': 100,
      'EC+B+': 100
    },
    4: {
      'P': 100
    },
    7: {
      'B-': 100,
      'B-A': 0.6
    },
    8: {
      'B-': 100,
      'B-5N': 0.286
    },
    9: {
      'B-': 100,
      'B-5N': 6.1
    },
    10: {
      'B-': 100,
      'B-5N': 99.68
    },
    11: {
      'N': 100
    },
    12: {
      'B-': 100,
      'B-N': 63,
      'B-2N': 11
    },
    13: {
      'N': 100
    },
    14: {
      'B-': 100,
      'B-N': 71.8,
      'B-2N': 16
    },
    15: {
      'N': 100
    },
    16: {
      '2N': 100
    }
  },
  6: {
    2: {
      '2P': 100
    },
    3: {
      'EC+B+': 100,
      'B+P': 62,
      'B+A': 37.9
    },
    4: {
      'EC+B+': 100
    },
    5: {
      'EC+B+': 100
    },
    8: {
      'B-': 100
    },
    9: {
      'B-': 100
    },
    10: {
      'B-': 100,
      'B-N': 99
    },
    11: {
      'B-': 100,
      'B-N': 26
    },
    12: {
      'B-': 100,
      'B-N': 31.5
    },
    13: {
      'B-': 100,
      'B-N': 47,
      'B-2N': 7
    },
    14: {
      'B-': 100,
      'B-N': 65,
      'B-2N': 18.6
    },
    16: {
      'B-': 100,
      'B-N': 61,
      'B-2N': 37
    }
  },
  7: {
    3: {
      'P': 100
    },
    4: {
      'P': 100
    },
    5: {
      'EC+B+': 100,
      'B+A': 1.93
    },
    6: {
      'EC+B+': 100
    },
    9: {
      'B-': 100,
      'B-A': 0.0012
    },
    10: {
      'B-': 100,
      'B-N': 95.1,
      'B-A': 0.0025
    },
    11: {
      'B-': 100,
      'B-A': 12.2,
      'B-N': 12
    },
    12: {
      'B-': 100,
      'B-N': 41.8
    },
    13: {
      'B-': 100,
      'B-N': 42.9
    },
    14: {
      'B-': 100,
      'B-N': 86
    },
    15: {
      'B-': 100,
      'B-N': 34,
      'B-2N': 12
    },
    16: {
      'B-': 100,
      'B-N': 42,
      'B-2N': 8
    },
    17: {
      'N': null
    }
  },
  8: {
    3: {
      '2P': 100
    },
    4: {
      '2P': 100
    },
    5: {
      'B+P': 100,
      'EC+B+': 100
    },
    6: {
      'EC+B+': 100
    },
    7: {
      'EC+B+': 100
    },
    11: {
      'B-': 100
    },
    12: {
      'B-': 100
    },
    13: {
      'B-': 100
    },
    14: {
      'B-': 100,
      'B-N': 22
    },
    15: {
      'B-': 100,
      'B-N': 7
    },
    16: {
      'B-': 100,
      'B-N': 58
    },
    18: {
      '2N': 100
    }
  },
  9: {
    4: null,
    5: null,
    6: {
      'P': 100
    },
    7: {
      'P': 100
    },
    8: {
      'EC+B+': 100
    },
    9: {
      'EC+B+': 100
    },
    11: {
      'B-': 100
    },
    12: {
      'B-': 100
    },
    13: {
      'B-': 100,
      'B-N': 11
    },
    14: {
      'B-': 100,
      'B-N': 14
    },
    15: {
      'B-': 100,
      'B-N': 5.9
    },
    16: {
      'B-': 100,
      'B-N': 23.1
    },
    17: {
      'B-': 100,
      'B-N': 13.5
    },
    18: {
      'B-': 100,
      'B-N': 77
    },
    19: {
      'N': 100
    },
    20: {
      'B-N': 100,
      'B-': 100
    },
    21: {
      'N': null
    },
    22: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  10: {
    5: {
      '2P': 100
    },
    6: {
      '2P': 100
    },
    7: {
      'EC+B+': 100,
      'ECP': 95.2,
      'ECA': 2.77
    },
    8: {
      'EC+B+': 100
    },
    9: {
      'EC+B+': 100
    },
    13: {
      'B-': 100
    },
    14: {
      'B-': 100
    },
    15: {
      'B-': 100
    },
    16: {
      'B-': 100,
      'B-N': 0.13
    },
    17: {
      'B-': 100,
      'B-N': 2
    },
    18: {
      'B-': 100,
      'B-N': 12,
      'B-2N': 3.7
    },
    19: {
      'B-': 100,
      'B-N': 28,
      'B-2N': 4
    },
    20: {
      'B-': 100,
      'B-N': 13,
      'B-2N': 8.9
    },
    21: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    22: {
      'B-': 100,
      'B-N': null
    },
    23: {
      'N': null
    },
    24: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  11: {
    6: null,
    7: {
      'P': 100
    },
    8: {
      'P': 100
    },
    9: {
      'EC': 100,
      'ECA': 20.05
    },
    10: {
      'EC+B+': 100
    },
    11: {
      'EC+B+': 100
    },
    13: {
      'B-': 100
    },
    14: {
      'B-': 100
    },
    15: {
      'B-': 100
    },
    16: {
      'B-': 100,
      'B-N': 0.13
    },
    17: {
      'B-': 100,
      'B-N': 0.58
    },
    18: {
      'B-': 100,
      'B-N': 21.5
    },
    19: {
      'B-': 100,
      'B-N': 30,
      'B-2N': 1.15
    },
    20: {
      'B-': 100,
      'B-N': 37.3,
      'B-2N': 0.87
    },
    21: {
      'B-': 100,
      'B-N': 24,
      'B-2N': 8.3
    },
    22: {
      'B-': 100,
      'B-N': 47,
      'B-2N': 13
    },
    23: {
      'B-': 100,
      'B-2N': 50,
      'B-N': 15
    },
    24: {
      'B-': 100,
      'B-N': 0,
      'B-4N': null
    },
    25: {
      'N': null
    },
    26: {
      'B-N': null,
      'B-': null
    }
  },
  12: {
    7: {
      '2P': 100
    },
    8: {
      'B+': 100,
      'B+P': 30.3
    },
    9: {
      'EC+B+': 100,
      'B+P': 32.6,
      'B+A': 0.5
    },
    10: {
      'EC+B+': 100
    },
    11: {
      'EC+B+': 100
    },
    15: {
      'B-': 100
    },
    16: {
      'B-': 100
    },
    17: {
      'B-': 100
    },
    18: {
      'B-': 100
    },
    19: {
      'B-': 100,
      'B-N': 6.2
    },
    20: {
      'B-': 100,
      'B-N': 5.5
    },
    21: {
      'B-': 100,
      'B-N': 14
    },
    22: {
      'B-': 100,
      'B-N': null
    },
    23: {
      'B-': 100,
      'B-N': 52,
      'B-3N': null
    },
    24: {
      'B-': 100,
      'B-N': null
    },
    25: {
      'N': null,
      'B-N': null,
      'B-': null
    },
    26: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    27: {
      'N': null
    },
    28: {
      'B-': 100,
      'B-6N': null,
      'B-5N': null
    }
  },
  13: {
    8: {
      'P': null
    },
    9: {
      'EC+B+': 100,
      'B+P': 55,
      'B+2P': 1.1
    },
    10: {
      'EC+B+': 100,
      'ECP': 1.04
    },
    11: {
      'EC+B+': 100,
      'B+A': 0.035,
      'B+P': 0.0016
    },
    12: {
      'EC+B+': 100
    },
    13: {
      'EC+B+': 100
    },
    15: {
      'B-': 100
    },
    16: {
      'B-': 100
    },
    17: {
      'B-': 100
    },
    18: {
      'B-': 100,
      'B-N': 1.6
    },
    19: {
      'B-': 100,
      'B-N': 0.7
    },
    20: {
      'B-': 100,
      'B-N': 8.5
    },
    21: {
      'B-': 100,
      'B-N': 26
    },
    22: {
      'B-': 100,
      'B-N': 38,
      'B-2N': 0
    },
    23: {
      'B-': 100,
      'B-N': 31
    },
    24: {
      'B-': 100,
      'B-N': null
    },
    25: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    26: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    27: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    28: {
      'B-': 100,
      'B-N': null
    },
    29: {
      'B-N': null,
      'B-2N': null,
      'B-': null
    },
    30: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    }
  },
  14: {
    8: {
      'EC+B+': 100,
      'B+P': 32
    },
    9: {
      'EC+B+': 100,
      'ECP': 88,
      'EC2P': 3.6
    },
    10: {
      'EC+B+': 100,
      'B+P': 38
    },
    11: {
      'EC+B+': 100,
      'B+P': 35
    },
    12: {
      'EC+B+': 100
    },
    13: {
      'EC+B+': 100
    },
    17: {
      'B-': 100
    },
    18: {
      'B-': 100
    },
    19: {
      'B-': 100
    },
    20: {
      'B-': 100
    },
    21: {
      'B-': 100,
      'B-N': 5
    },
    22: {
      'B-': 100,
      'B-N': 10
    },
    23: {
      'B-': 100,
      'B-N': 17,
      'B-2N': null
    },
    24: {
      'B-': 100,
      'B-N': 25
    },
    25: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    26: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    27: {
      'B-': 100,
      'B-N': 0
    },
    28: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    29: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    30: {
      'B-': 100,
      'B-N': null
    }
  },
  15: {
    10: {
      'P': 100
    },
    11: {
      'EC+B+': 100,
      'ECP': 36.8,
      'EC2P': 2.16
    },
    12: {
      'EC+B+': 100,
      'B+P': 0.07
    },
    13: {
      'EC+B+': 100,
      'ECP': 0.0013,
      'ECA': 0.00086
    },
    14: {
      'EC+B+': 100
    },
    15: {
      'EC+B+': 100
    },
    17: {
      'B-': 100
    },
    18: {
      'B-': 100
    },
    19: {
      'B-': 100
    },
    20: {
      'B-': 100
    },
    21: {
      'B-': 100
    },
    22: {
      'B-': 100
    },
    23: {
      'B-': 100,
      'B-N': 12
    },
    24: {
      'B-': 100,
      'B-N': 26
    },
    25: {
      'B-': 100,
      'B-N': 15.8,
      'B-2N': null
    },
    26: {
      'B-': 100,
      'B-N': 30
    },
    27: {
      'B-': 100,
      'B-N': 50,
      'B-2N': null
    },
    28: {
      'B-N': 100,
      'B-': 100,
      'B-2N': null
    },
    29: {
      'B-N': null,
      'B-': null
    },
    30: {
      'B-': null
    },
    31: {
      'B-': 100
    }
  },
  16: {
    10: {
      'P': null
    },
    11: {
      'EC+B+': 100,
      'B+P': 2.3,
      'B+2P': 1.1
    },
    12: {
      'EC+B+': 100,
      'ECP': 20.7
    },
    13: {
      'EC+B+': 100,
      'ECP': 47
    },
    14: {
      'EC+B+': 100
    },
    15: {
      'EC+B+': 100
    },
    19: {
      'B-': 100
    },
    21: {
      'B-': 100
    },
    22: {
      'B-': 100
    },
    23: {
      'B-': 100
    },
    24: {
      'B-': 100
    },
    25: {
      'B-': 100,
      'B-N': null
    },
    26: {
      'B-': 100,
      'B-N': 4
    },
    27: {
      'B-': 100,
      'B-N': 40
    },
    28: {
      'B-': 100,
      'B-N': 18
    },
    29: {
      'B-': 100,
      'B-N': 54
    },
    30: {
      'B-': 100
    },
    32: {
      'B-': null
    }
  },
  17: {
    12: {
      'P': 100
    },
    13: {
      'P': null
    },
    14: {
      'EC+B+': 100,
      'ECP': 2.4
    },
    15: {
      'EC+B+': 100,
      'ECA': 0.054,
      'ECP': 0.026
    },
    16: {
      'EC+B+': 100
    },
    17: {
      'EC+B+': 100
    },
    19: {
      'B-': 98.1,
      'EC+B+': 1.9
    },
    21: {
      'B-': 100
    },
    22: {
      'B-': 100
    },
    23: {
      'B-': 100
    },
    24: {
      'B-': 100
    },
    25: {
      'B-': 100
    },
    26: {
      'B-': 100
    },
    27: {
      'B-': 100,
      'B-N': 8
    },
    28: {
      'B-': 100,
      'B-N': 24
    },
    29: {
      'B-': 100,
      'B-N': 60
    },
    30: {
      'B-': 100,
      'B-N': 3
    },
    31: {
      'B-': null
    },
    32: {
      'B-': null
    },
    33: {
      'B-': 100,
      'B-3N': null,
      'B-N': null
    },
    34: {
      'B-': 100
    },
    35: {
      'B-': 100,
      'B-6N': null,
      'B-5N': null
    }
  },
  18: {
    12: {
      '2P': 100
    },
    13: {
      'EC': 100,
      'B+P': 63,
      'B+2P': 7.2
    },
    14: {
      'EC+B+': 100,
      'ECP': 35.58
    },
    15: {
      'EC+B+': 100,
      'ECP': 38.7
    },
    16: {
      'EC+B+': 100
    },
    17: {
      'EC+B+': 100
    },
    19: {
      'EC': 100
    },
    21: {
      'B-': 100
    },
    23: {
      'B-': 100
    },
    24: {
      'B-': 100
    },
    25: {
      'B-': 100
    },
    26: {
      'B-': 100
    },
    27: {
      'B-': 100
    },
    28: {
      'B-': 100
    },
    29: {
      'B-': 100,
      'B-N': 0.2
    },
    30: {
      'B-': 100
    },
    31: {
      'B-': 100,
      'B-N': 65
    },
    32: {
      'B-': 100,
      'B-N': 37,
      'B-2N': null
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    },
    35: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  19: {
    14: {
      'P': null
    },
    15: {
      'P': null
    },
    16: {
      'EC+B+': 100,
      'ECP': 0.37
    },
    17: {
      'EC+B+': 100,
      'ECP': 0.048,
      'ECA': 0.0034
    },
    18: {
      'EC+B+': 100
    },
    19: {
      'EC+B+': 100
    },
    21: {
      'B-': 89.28,
      'EC+B+': 10.72
    },
    23: {
      'B-': 100
    },
    24: {
      'B-': 100
    },
    25: {
      'B-': 100
    },
    26: {
      'B-': 100
    },
    27: {
      'B-': 100
    },
    28: {
      'B-': 100
    },
    29: {
      'B-': 100,
      'B-N': 1.14
    },
    30: {
      'B-': 100,
      'B-N': 86
    },
    31: {
      'B-': 100,
      'B-N': 29,
      'B-2N': null
    },
    32: {
      'B-': 100,
      'B-N': 65
    },
    33: {
      'B-': 100,
      'B-N': 74,
      'B-2N': 2.3
    },
    34: {
      'B-': 100,
      'B-N': 67,
      'B-2N': 17
    },
    35: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    36: {
      'B-N': null,
      'B-': null
    },
    37: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  20: {
    14: {
      '2P': null,
      'P': null
    },
    15: {
      'EC+B+': 100,
      'ECP': 95.9,
      'EC2P': 4.1
    },
    16: {
      'EC+B+': 100,
      'ECP': 51.2
    },
    17: {
      'EC+B+': 100,
      'ECP': 82.1
    },
    18: {
      'EC+B+': 100
    },
    19: {
      'EC+B+': 100
    },
    21: {
      'EC': 100
    },
    25: {
      'B-': 100
    },
    27: {
      'B-': 100
    },
    28: {
      '2B-': 75,
      // '2B-': 69, // TODO: how to handle two of the same decay?
      'B-': 25
    },
    29: {
      'B-': 100
    },
    30: {
      'B-': 100
    },
    31: {
      'B-': 100,
      'B-N': null
    },
    32: {
      'B-': 100,
      'B-N': null
    },
    33: {
      'B-': 100,
      'B-N': 40
    },
    34: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    35: {
      'B-': 100,
      'B-N': null
    },
    36: {
      'B-': 100,
      'B-N': null
    },
    37: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    38: {
      'B-N': null,
      'B-': null
    }
  },
  21: {
    17: {
      'P': null
    },
    18: {
      'P': 100
    },
    19: {
      'EC+B+': 100,
      'ECP': 0.44,
      'ECA': 0.017
    },
    20: {
      'EC+B+': 100
    },
    21: {
      'EC+B+': 100
    },
    22: {
      'EC+B+': 100
    },
    23: {
      'EC+B+': 100
    },
    25: {
      'B-': 100
    },
    26: {
      'B-': 100
    },
    27: {
      'B-': 100
    },
    28: {
      'B-': 100
    },
    29: {
      'B-': 100
    },
    30: {
      'B-': 100,
      'B-N': null
    },
    31: {
      'B-': 100
    },
    32: {
      'B-': 100,
      'B-N': null
    },
    33: {
      'B-': 100,
      'B-N': 16
    },
    34: {
      'B-': 100,
      'B-N': null
    },
    35: {
      'B-': 100,
      'B-N': null
    },
    36: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    37: {
      'B-': 100,
      'B-N': null
    },
    38: {
      'B-': 100,
      'B-N': null
    },
    40: {
      'B-': 100,
      'B-4N': null,
      'B-3N': null
    }
  },
  22: {
    16: {
      '2P': null
    },
    17: {
      'ECP+EC2P': 100,
      'EC+B+': 100,
      'ECP': 93.7
    },
    18: {
      'ECP': 100,
      'EC+B+': 100
    },
    19: {
      'EC+B+': 100,
      'ECP': 100
    },
    20: {
      'EC+B+': 100
    },
    21: {
      'EC+B+': 100,
      'ECP': null
    },
    22: {
      'EC': 100
    },
    23: {
      'EC+B+': 100
    },
    29: {
      'B-': 100
    },
    30: {
      'B-': 100
    },
    31: {
      'B-': 100
    },
    32: {
      'B-': 100
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100,
      'B-N': null
    },
    35: {
      'B-': 100,
      'B-N': null
    },
    36: {
      'B-': 100,
      'B-N': null
    },
    37: {
      'B-': 100
    },
    38: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    39: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    40: {
      'B-N': null,
      'B-': null
    },
    41: {
      'B-N': null,
      'B-': null
    },
    42: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  23: {
    19: {
      'P': null
    },
    20: {
      'EC+B+': 100,
      'ECP': null
    },
    21: {
      'EC+B+': 100,
      'ECA': null
    },
    22: {
      'EC+B+': 100
    },
    23: {
      'EC+B+': 100
    },
    24: {
      'EC+B+': 100
    },
    25: {
      'EC+B+': 100
    },
    26: {
      'EC': 100
    },
    27: {
      'EC+B+': 99.3,
      'B-': 0.7
    },
    29: {
      'B-': 100
    },
    30: {
      'B-': 100
    },
    31: {
      'B-': 100
    },
    32: {
      'B-': 100
    },
    33: {
      'B-': 100,
      'B-N': null
    },
    34: {
      'B-': 100,
      'B-N': null
    },
    35: {
      'B-': 100,
      'B-N': null
    },
    36: {
      'B-': 100,
      'B-N': 0.03
    },
    37: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    38: {
      'B-': 100,
      'B-N': 10,
      'B-2N': null
    },
    39: {
      'B-': 100,
      'B-N': null
    },
    40: {
      'B-': 100,
      'B-N': 35
    },
    41: {
      'B-': 100,
      'B-N': null
    },
    42: {
      'B-': 100,
      'B-N': null
    },
    43: {
      'B-N': null,
      'B-': null
    },
    44: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  24: {
    18: {
      'EC+B+': 100,
      'ECP': 94.4
    },
    19: {
      'EC+B+': 100,
      'ECP': 79.3,
      'EC2P': 11.6
    },
    20: {
      'EC+B+': 100,
      'ECP': 7
    },
    21: {
      'B+': 100,
      'B+P': 34.4
    },
    22: {
      'EC+B+': 100
    },
    23: {
      'EC+B+': 100
    },
    24: {
      'EC+B+': 100
    },
    25: {
      'EC+B+': 100
    },
    26: {
      '2EC': null
    },
    27: {
      'EC': 100
    },
    31: {
      'B-': 100
    },
    32: {
      'B-': 100
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100
    },
    35: {
      'B-': 100
    },
    36: {
      'B-': 100,
      'B-N': null
    },
    37: {
      'B-': 100,
      'B-N': null
    },
    38: {
      'B-': 100,
      'B-N': null
    },
    39: {
      'B-': 100,
      'B-N': null
    },
    40: {
      'B-': 100,
      'B-N': null
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100
    },
    44: {
      'B-': 100,
      'B-N': 0
    },
    45: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    46: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    }
  },
  25: {
    19: {
      'P': null,
      'EC': null
    },
    20: null,
    21: {
      'EC+B+': 100,
      'ECP': 57
    },
    22: {
      'EC+B+': 100,
      'ECP': 3.4
    },
    23: {
      'EC+B+': 100,
      'B+P': 0.28,
      'B+A': 0.0006
    },
    24: {
      'EC+B+': 100
    },
    25: {
      'EC+B+': 100
    },
    26: {
      'EC+B+': 100
    },
    27: {
      'EC+B+': 100
    },
    28: {
      'EC': 100
    },
    29: {
      'EC+B+': 100,
      'B-': 0.000093
    },
    31: {
      'B-': 100
    },
    32: {
      'B-': 100
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100
    },
    35: {
      'IT': 100,
      'B-': 100
    },
    36: {
      'B-': 100,
      'B-N': 0.2
    },
    37: {
      'B-': 100,
      'B-N': null
    },
    38: {
      'B-': 100,
      'B-N': null
    },
    39: {
      'B-': 100,
      'B-N': 33
    },
    40: {
      'B-': 100,
      'B-5N': 21
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100,
      'B-N': null
    },
    43: {
      'B-': 100,
      'B-N': 0
    },
    44: {
      'B-': 100
    },
    45: {
      'B-': 100,
      'B-N': 50
    },
    46: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    },
    47: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    48: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    }
  },
  26: {
    19: {
      '2P': 57,
      'EC+B+': 43,
      'B+P': 43
    },
    20: {
      'EC+B+': 100,
      'ECP': 78.7
    },
    21: {
      'EC+B+': 100,
      'ECP': 0,
      'EC2P': null
    },
    22: {
      'EC+B+': 100,
      'ECP': 3.6
    },
    23: {
      'EC+B+': 100,
      'B+P': 56.7
    },
    24: {
      'EC+B+': 100,
      'ECP': 0
    },
    25: {
      'EC+B+': 100
    },
    26: {
      'EC+B+': 100
    },
    27: {
      'EC+B+': 100
    },
    29: {
      'EC': 100
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100
    },
    35: {
      'B-': 100
    },
    36: {
      'B-': 100
    },
    37: {
      'B-': 100
    },
    38: {
      'B-': 100
    },
    39: {
      'B-': 100
    },
    40: {
      'B-': 100
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100,
      'B-N': 0
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100,
      'B-N': null
    },
    45: {
      'B-': 100,
      'B-N': null
    },
    46: {
      'B-': 100,
      'B-N': 27.6
    },
    47: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    48: {
      'B-N': null,
      'B-2N': null,
      'B-': null
    },
    49: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    }
  },
  27: {
    23: {
      'EC+B+': 100,
      'ECP': 70.5,
      'EC2P': null
    },
    24: {
      'EC+B+': 100,
      'ECP': 3.8
    },
    25: {
      'EC+B+': 100,
      'B+P': null
    },
    26: {
      'EC+B+': 100
    },
    27: {
      'EC+B+': 100
    },
    28: {
      'EC+B+': 100
    },
    29: {
      'EC+B+': 100
    },
    30: {
      'EC': 100
    },
    31: {
      'EC+B+': 100
    },
    33: {
      'B-': 100
    },
    34: {
      'B-': 100
    },
    35: {
      'B-': 100
    },
    36: {
      'B-': 100
    },
    37: {
      'B-': 100
    },
    38: {
      'B-': 100
    },
    39: {
      'B-': 100
    },
    40: {
      'B-': 100
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100
    },
    43: {
      'B-': 100,
      'B-N': null
    },
    44: {
      'B-': 100,
      'B-N': 6
    },
    45: {
      'B-': 100,
      'B-N': 6
    },
    46: {
      'B-': 100,
      'B-N': 22,
      'B-2N': null
    },
    47: {
      'B-': 100,
      'B-N': 18,
      'B-2N': null
    },
    48: {
      'B-': 100,
      'B-N': 16,
      'B-2N': null
    },
    49: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    50: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  28: {
    20: {
      '2P': null,
      'EC+B+': null
    },
    21: {
      'EC+B+': 100,
      'B+P': 83
    },
    22: {
      'EC+B+': 100,
      'ECP': 73,
      'EC2P': 14
    },
    23: {
      'EC+B+': 100,
      'ECP': 87.2,
      'EC2P': 0.5
    },
    24: {
      'EC+B+': 100,
      'B+P': 31.4
    },
    25: {
      'EC+B+': 100,
      'ECP': 23.4
    },
    26: {
      'EC+B+': 100
    },
    27: {
      'EC+B+': 100
    },
    28: {
      'EC+B+': 100
    },
    29: {
      'EC+B+': 100
    },
    31: {
      'EC+B+': 100
    },
    35: {
      'B-': 100
    },
    37: {
      'B-': 100
    },
    38: {
      'B-': 100
    },
    39: {
      'B-': 100
    },
    40: {
      'B-': 100
    },
    41: {
      'B-': 100,
      'B-N': null
    },
    42: {
      'B-': 100
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100
    },
    45: {
      'B-': 100,
      'B-N': null
    },
    46: {
      'B-': 100,
      'B-N': null
    },
    47: {
      'B-': 100,
      'B-N': 10
    },
    48: {
      'B-': 100,
      'B-N': null
    },
    49: {
      'B-': 100,
      'B-N': 26,
      'B-2N': null
    },
    50: {
      'B-': 100,
      'B-N': null
    },
    51: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    52: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    54: null
  },
  29: {
    24: {
      'P': null
    },
    25: {
      'P': null
    },
    26: {
      'ECP': 15,
      'B+': null,
      'P': null
    },
    27: {
      'B+': 100,
      'B+P': 0.4
    },
    28: {
      'EC+B+': 100
    },
    29: {
      'EC+B+': 100
    },
    30: {
      'EC+B+': 100
    },
    31: {
      'EC+B+': 100
    },
    32: {
      'EC+B+': 100
    },
    33: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 61.5,
      'B-': 38.5
    },
    37: {
      'B-': 100
    },
    38: {
      'B-': 100
    },
    39: {
      'B-': 100
    },
    40: {
      'B-': 100
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100,
      'B-N': null
    },
    45: {
      'B-': 100,
      'B-N': 0
    },
    46: {
      'B-': 100,
      'B-N': 3.5
    },
    47: {
      'B-': 100,
      'B-N': 3
    },
    48: {
      'B-': 100,
      'B-N': 30.1
    },
    49: {
      'B-': 100,
      'B-N': 65
    },
    50: {
      'B-': 100,
      'B-N': 66,
      'B-2N': null
    },
    51: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    52: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    53: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  30: {
    24: {
      '2P': 92
    },
    25: {
      'ECP': 91,
      'B+': null
    },
    26: {
      'ECP': 86,
      'B+P': null,
      'B+': null
    },
    27: {
      'EC+B+': 100,
      'B+P': 65
    },
    28: {
      'EC+B+': 100,
      'ECP': 3
    },
    29: {
      'EC+B+': 100,
      'ECP': 0.1
    },
    30: {
      'EC+B+': 100
    },
    31: {
      'EC+B+': 100
    },
    32: {
      'EC+B+': 100
    },
    33: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 100
    },
    39: {
      'B-': 100
    },
    40: {
      '2B-': 100
      // '2B-': null // TODO: how to handle two of the same decay?
    },

    41: {
      'B-': 100
    },
    42: {
      'B-': 100
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100
    },
    45: {
      'B-': 100
    },
    46: {
      'B-': 100
    },
    47: {
      'B-': 100
    },
    48: {
      'B-': 100
    },
    49: {
      'B-': 100,
      'B-N': 1.7
    },
    50: {
      'B-': 100,
      'B-N': 1
    },
    51: {
      'B-': 100,
      'B-N': 7.5
    },
    52: {
      'B-': 100,
      'B-N': 69
    },
    53: {
      'B-': 100,
      'B-N': null
    },
    54: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    },
    55: {
      'B-N': null,
      'B-2N': null,
      'B-': null
    }
  },
  31: {
    28: {
      'P': null
    },
    29: {
      'EC+B+': 100,
      'B+P': 1.6,
      'B+A': 0.023
    },
    30: {
      'EC+B+': 100,
      'ECP': 0.25
    },
    31: {
      'EC+B+': 100,
      'ECP': null
    },
    32: {
      'EC+B+': 100
    },
    33: {
      'EC+B+': 100
    },
    34: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 100
    },
    36: {
      'EC': 100
    },
    37: {
      'EC+B+': 100
    },
    39: {
      'B-': 99.59,
      'EC': 0.41
    },
    41: {
      'B-': 100
    },
    42: {
      'B-': 100
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100
    },
    45: {
      'B-': 100
    },
    46: {
      'B-': 100
    },
    47: {
      'B-': 100
    },
    48: {
      'B-': 100,
      'B-N': 0.089
    },
    49: {
      'B-': 100,
      'B-N': 0.86
    },
    50: {
      'B-': 100,
      'B-N': 11.9
    },
    51: {
      'B-': 100,
      'B-N': 22.2
    },
    52: {
      'B-': 100,
      'B-N': 62.8
    },
    53: {
      'B-': 100,
      'B-N': 70
    },
    54: {
      'B-': 100,
      'B-N': 35
    },
    55: {
      'B-': 100,
      'B-N': 60,
      'B-2N': 20
    },
    56: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    }
  },
  32: {
    27: {
      '2P': 0.2,
      'EC+B+': null
    },
    28: {
      'ECP': null,
      'EC+B+': null
    },
    29: {
      'EC+B+': 100,
      'ECP': 62
    },
    30: {
      'EC+B+': 100,
      'ECP': null
    },
    31: {
      'EC+B+': 100
    },
    32: {
      'EC+B+': 100
    },
    33: {
      'EC+B+': 100,
      'ECP': 0.011
    },
    34: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 100
    },
    36: {
      'EC': 100
    },
    37: {
      'EC+B+': 100
    },
    39: {
      'EC': 100
    },
    43: {
      'B-': 100
    },
    45: {
      'B-': 100
    },
    46: {
      'B-': 100
    },
    47: {
      'B-': 100
    },
    48: {
      'B-': 100
    },
    49: {
      'B-': 100
    },
    50: {
      'B-': 100
    },
    51: {
      'B-': 100,
      'B-N': null
    },
    52: {
      'B-': 100,
      'B-N': 10.2
    },
    53: {
      'B-': 100,
      'B-N': 16.5,
      'B-2N': null
    },
    54: {
      'B-': 100,
      'B-N': 45
    },
    55: {
      'B-': 100,
      'B-N': null
    },
    56: {
      'B-': null,
      'B-N': null
    },
    57: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    58: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  33: {
    30: {
      'P': null
    },
    31: {
      'EC+B+': 100
    },
    32: {
      'EC+B+': 100
    },
    33: {
      'EC+B+': 100
    },
    34: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 100
    },
    36: {
      'EC+B+': 100
    },
    37: {
      'EC+B+': 100
    },
    38: {
      'EC+B+': 100
    },
    39: {
      'EC+B+': 100
    },
    40: {
      'EC': 100
    },
    41: {
      'EC+B+': 66,
      'B-': 34
    },
    43: {
      'B-': 100
    },
    44: {
      'B-': 100
    },
    45: {
      'B-': 100
    },
    46: {
      'B-': 100
    },
    47: {
      'B-': 100
    },
    48: {
      'B-': 100
    },
    49: {
      'B-': 100
    },
    50: {
      'B-': 100
    },
    51: {
      'B-': 100,
      'B-N': 0.18
    },
    52: {
      'B-': 100,
      'B-N': 62.9
    },
    53: {
      'B-': 100,
      'B-N': 35.5,
      'B-2N': null
    },
    54: {
      'B-': 100,
      'B-N': 15.4
    },
    55: {
      'B-': 100,
      'B-N': null
    },
    56: {
      'B-N': null,
      'B-2N': null,
      'B-': null
    },
    57: {
      'B-': 100,
      'B-N': null
    },
    58: {
      'B-': 100,
      'B-N': null
    },
    59: {
      'B-': 100
    }
  },
  34: {
    30: {
      'EC+B+': 100
    },
    31: {
      'ECP': 100,
      'EC+B+': 100
    },
    32: {
      'EC': 100
    },
    33: {
      'EC+B+': 100,
      'B+P': 0.5
    },
    34: {
      'EC+B+': 100
    },
    35: {
      'EC+B+': 100,
      'ECP': 0.052
    },
    36: {
      'EC+B+': 100
    },
    37: {
      'EC+B+': 100
    },
    38: {
      'EC': 100
    },
    39: {
      'EC+B+': 100
    },
    41: {
      'EC': 100
    },
    45: {
      'B-': 100
    },
    47: {
      'B-': 100
    },
    48: {
      '2B-': 100
    },
    49: {
      'B-': 100
    },
    50: {
      'B-': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100
    },
    53: {
      'B-': 100,
      'B-N': 0.36
    },
    54: {
      'B-': 100,
      'B-N': 0.99
    },
    55: {
      'B-': 100,
      'B-N': 7.8
    },
    56: {
      'B-': 100,
      'B-N': null
    },
    57: {
      'B-': 100,
      'B-N': 21
    },
    58: {
      'B-': 100
    },
    59: {
      'B-': 100
    },
    60: {
      'B-': 100
    },
    61: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    }
  },
  35: {
    34: {
      'P': 100
    },
    35: {
      'EC+B+': 100
    },
    36: {
      'EC+B+': 100
    },
    37: {
      'EC+B+': 100
    },
    38: {
      'EC+B+': 100
    },
    39: {
      'EC+B+': 100
    },
    40: {
      'EC+B+': 100
    },
    41: {
      'EC+B+': 100
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 99.99,
      'B-': 0.01
    },
    45: {
      'B-': 91.7,
      'EC+B+': 8.3
    },
    47: {
      'B-': 100
    },
    48: {
      'B-': 100
    },
    49: {
      'B-': 100
    },
    50: {
      'B-': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100,
      'B-N': 2.6
    },
    53: {
      'B-': 100,
      'B-N': 6.58
    },
    54: {
      'B-': 100,
      'B-N': 13.8
    },
    55: {
      'B-': 100,
      'B-N': 25.3
    },
    56: {
      'B-': 100,
      'B-N': 19.5
    },
    57: {
      'B-': 100,
      'B-N': 33.1
    },
    58: {
      'B-': 100,
      'B-N': 68
    },
    59: {
      'B-': 100,
      'B-N': 68
    },
    60: {
      'B-': 100,
      'B-N': 34
    },
    61: {
      'B-': 100,
      'B-N': 27.6
    },
    62: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    63: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    },
    66: {
      'B-': 100,
      'B-3N': null,
      'B-N': null
    }
  },
  36: {
    33: {
      'EC+B+': 100,
      'B+P': 99
    },
    34: {
      'EC+B+': 100,
      'ECP': 1.3
    },
    35: {
      'EC+B+': 100,
      'ECP': 2.1
    },
    36: {
      'EC+B+': 100,
      'ECP': 0.000001
    },
    37: {
      'EC+B+': 100,
      'ECP': 0.25
    },
    38: {
      'EC+B+': 100
    },
    39: {
      'EC+B+': 100
    },
    40: {
      'EC+B+': 100
    },
    41: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100
    },
    45: {
      'EC': 100
    },
    49: {
      'B-': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100
    },
    53: {
      'B-': 100
    },
    54: {
      'B-': 100
    },
    55: {
      'B-': 100
    },
    56: {
      'B-': 100,
      'B-N': 0.0332
    },
    57: {
      'B-': 100,
      'B-N': 1.95
    },
    58: {
      'B-': 100,
      'B-N': 1.11
    },
    59: {
      'B-': 100,
      'B-N': 2.87
    },
    60: {
      'B-': 100,
      'B-N': 3.7
    },
    61: {
      'B-': 100,
      'B-N': 6.7
    },
    62: {
      'B-': 100,
      'B-N': 7,
      'B-2N': null
    },
    63: {
      'B-': 100,
      'B-N': 11
    },
    64: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    65: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    66: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  37: {
    35: {
      'P': null,
      'EC+B+': null
    },
    36: {
      'EC+B+': null,
      'P': null
    },
    37: {
      'EC+B+': 100
    },
    38: {
      'EC+B+': 100
    },
    39: {
      'EC+B+': 100,
      'ECA': 0.00000038
    },
    40: {
      'EC+B+': 100
    },
    41: {
      'EC+B+': 100
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100
    },
    46: {
      'EC': 100
    },
    47: {
      'EC+B+': 96.1,
      'B-': 3.9
    },
    49: {
      'B-': 99.9948,
      'EC': 0.0052
    },
    50: {
      'B-': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100
    },
    53: {
      'B-': 100
    },
    54: {
      'B-': 100
    },
    55: {
      'B-': 100,
      'B-N': 0.0107
    },
    56: {
      'B-': 100,
      'B-N': 1.39
    },
    57: {
      'B-': 100,
      'B-N': 10.5
    },
    58: {
      'B-': 100,
      'B-N': 8.7
    },
    59: {
      'B-': 100,
      'B-N': 13.3
    },
    60: {
      'B-': 100,
      'B-N': 25.5,
      'B-2N': null
    },
    61: {
      'B-': 100,
      'B-N': 14.3,
      'B-2N': 0.054
    },
    62: {
      'B-': 100,
      'B-N': 19.8,
      'B-2N': null
    },
    63: {
      'B-': 100,
      'B-N': 5.6,
      'B-2N': 0.15
    },
    64: {
      'B-': 100,
      'B-N': 28
    },
    65: {
      'B-': 100,
      'B-N': 18
    },
    66: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    67: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    68: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    },
    69: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    }
  },
  38: {
    35: {
      'EC+B+': 100,
      'ECP': null
    },
    36: {
      'EC+B+': 100,
      'ECP': null
    },
    37: {
      'EC+B+': 100,
      'ECP': 5.2
    },
    38: {
      'EC+B+': 100,
      'ECP': 0.000034
    },
    39: {
      'EC+B+': 100,
      'ECP': 0.08
    },
    40: {
      'EC+B+': 100
    },
    41: {
      'EC+B+': 100
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100
    },
    44: {
      'EC': 100
    },
    45: {
      'EC+B+': 100
    },
    47: {
      'EC': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100
    },
    53: {
      'B-': 100
    },
    54: {
      'B-': 100
    },
    55: {
      'B-': 100
    },
    56: {
      'B-': 100
    },
    57: {
      'B-': 100
    },
    58: {
      'B-': 100
    },
    59: {
      'B-': 100,
      'B-N': 0.05
    },
    60: {
      'B-': 100,
      'B-N': 0.23
    },
    61: {
      'B-': 100,
      'B-N': 0.1
    },
    62: {
      'B-': 100,
      'B-N': 1.11
    },
    63: {
      'B-': 100,
      'B-N': 2.37
    },
    64: {
      'B-': 100,
      'B-N': 5.5
    },
    65: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    66: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    67: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    68: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    69: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    70: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    }
  },
  39: {
    37: {
      'P': null,
      'EC+B+': null
    },
    38: {
      'EC+B+': 100,
      'P': null,
      'ECP': null
    },
    39: {
      'EC+B+': 100,
      'ECP': null
    },
    40: {
      'EC+B+': 100,
      'ECP': null
    },
    41: {
      'EC+B+': 100,
      'ECP': null
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    51: {
      'B-': 100
    },
    52: {
      'B-': 100
    },
    53: {
      'B-': 100
    },
    54: {
      'B-': 100
    },
    55: {
      'B-': 100
    },
    56: {
      'B-': 100
    },
    57: {
      'B-': 100
    },
    58: {
      'B-': 100,
      'B-N': 0.055
    },
    59: {
      'B-': 100,
      'B-N': 0.33
    },
    60: {
      'B-': 100,
      'B-N': 1.77
    },
    61: {
      'B-': 100,
      'B-N': 1.02
    },
    62: {
      'B-': 100,
      'B-N': 1.94
    },
    63: {
      'B-': 100,
      'B-N': 4.9
    },
    64: {
      'B-': 100,
      'B-N': 8
    },
    65: {
      'B-': 100,
      'B-N': 34,
      'B-2N': null
    },
    66: {
      'B-': 100,
      'B-N': 82
    },
    67: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    68: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    69: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    72: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    }
  },
  40: {
    37: {
      '2P': null,
      'ECP': null,
      'EC+B+': null
    },
    38: {
      'EC+B+': null
    },
    39: {
      'EC+B+': 100,
      'ECP': null
    },
    40: {
      'EC+B+': 100,
      'ECP': null
    },
    41: {
      'EC+B+': 100,
      'ECP': 0.12
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100,
      'ECP': null
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100
    },
    48: {
      'EC': 100
    },
    49: {
      'EC+B+': 100
    },
    53: {
      'B-': 100
    },
    55: {
      'B-': 100
    },
    56: null,
    57: {
      'B-': 100
    },
    58: {
      'B-': 100
    },
    59: {
      'B-': 100
    },
    60: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100,
      'B-N': 2
    },
    66: {
      'B-': 100,
      'B-N': 7
    },
    67: {
      'B-': 100,
      'B-N': 23
    },
    68: {
      'B-': 100,
      'B-N': null
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    71: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    72: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    73: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    74: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  41: {
    40: {
      'EC+B+': null
    },
    41: {
      'EC+B+': 100,
      'ECP': null
    },
    42: {
      'EC+B+': 100
    },
    43: {
      'EC+B+': 100,
      'ECP': null
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    50: {
      'EC+B+': 100
    },
    51: {
      'EC+B+': 100
    },
    53: {
      'B-': 100
    },
    54: {
      'B-': 100
    },
    55: {
      'B-': 100
    },
    56: {
      'B-': 100
    },
    57: {
      'B-': 100
    },
    58: {
      'B-': 100
    },
    59: {
      'B-': 100
    },
    60: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100,
      'B-N': 0.06
    },
    64: {
      'B-': 100,
      'B-N': 1.7
    },
    65: {
      'B-': 100,
      'B-N': 4.5
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100,
      'B-N': 6.3,
      'B-2N': null
    },
    68: {
      'B-': 100,
      'B-N': 15
    },
    69: {
      'B-': 100,
      'B-N': 40
    },
    70: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    73: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    74: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    75: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    },
    76: {
      'B-': 100,
      'B-2N': null,
      'B-3N': null
    }
  },
  42: {
    39: {
      'EC+B+': null,
      'ECP': null
    },
    40: {
      'EC+B+': 100,
      'ECP': null
    },
    41: {
      'EC+B+': 100
    },
    42: {
      'EC+B+': 100,
      'ECP': null
    },
    43: {
      'EC+B+': 100,
      'ECP': 0.14
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100,
      'B+P': 15
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    51: {
      'EC': 100
    },
    57: {
      'B-': 100
    },
    58: {
      '2B-': 100
      // '2B-': 100 // TODO: how to handle two of the same decay?
    },

    59: {
      'B-': 100
    },
    60: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100,
      'B-N': 1.3
    },
    68: {
      'B-': 100,
      'B-N': 2
    },
    69: {
      'B-': 100,
      'B-N': 12
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100,
      'B-N': null
    },
    72: {
      'B-': 100,
      'B-N': null
    },
    73: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    74: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    75: {
      'B-2N': null,
      'B-N': null,
      'B-': null
    },
    76: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    77: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  43: {
    42: {
      'P': null
    },
    43: {
      'EC+B+': 100,
      'ECP': null
    },
    44: {
      'EC+B+': 100
    },
    45: {
      'EC+B+': 100,
      'ECP': null
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC': 100
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    50: {
      'EC+B+': 100
    },
    51: {
      'EC+B+': 100
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    54: {
      'EC': 100
    },
    55: {
      'B-': 100
    },
    56: {
      'B-': 100
    },
    57: {
      'B-': 99.9974,
      'EC': 0.0026
    },
    58: {
      'B-': 100
    },
    59: {
      'B-': 100
    },
    60: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100,
      'B-N': 0.08
    },
    67: {
      'B-': 100,
      'B-N': 0.04
    },
    68: {
      'B-': 100,
      'B-N': 0.85
    },
    69: {
      'B-': 100,
      'B-N': 1.5
    },
    70: {
      'B-': 100,
      'B-N': 2.1
    },
    71: {
      'B-': 100,
      'B-N': null
    },
    72: {
      'B-': 100,
      'B-N': null
    },
    73: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    74: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    75: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    76: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    77: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    78: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    79: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  44: {
    41: {
      'P': null,
      'ECP': null,
      'EC+B+': null
    },
    42: {
      'ECP': null,
      'EC+B+': null
    },
    44: {
      'EC+B+': 100,
      'ECP': null
    },
    45: {
      'EC+B+': 100,
      'ECP': 3
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    50: {
      'EC': 100,
      'B++EC': 100
    },
    51: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    59: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100
    },
    68: {
      'B-': 100
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100,
      'B-N': null
    },
    72: {
      'B-': 100,
      'B-N': null
    },
    73: {
      'B-': 100,
      'B-N': null
    },
    74: {
      'B-': 100,
      'B-N': null
    },
    75: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    76: {
      'B-': 100,
      'B-N': null
    },
    77: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    78: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    79: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    80: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    81: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    }
  },
  45: {
    44: {
      'EC+B+': null,
      'ECP': null,
      'P': null
    },
    45: {
      'EC+B+': 100,
      'ECP': 0.7
    },
    46: {
      'EC+B+': 100,
      'B+P': 1.3
    },
    47: {
      'EC+B+': 100,
      'B+P': 1.9
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100,
      'ECP': 1.8
    },
    50: {
      'EC+B+': 100
    },
    51: {
      'EC+B+': 100
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    54: {
      'EC+B+': 100
    },
    55: {
      'EC+B+': 100
    },
    56: {
      'EC': 100
    },
    57: {
      'EC+B+': 78,
      'B-': 22
    },
    59: {
      'B-': 99.55,
      'EC+B+': 0.45
    },
    60: {
      'B-': 100
    },
    61: {
      'B-': 100
    },
    62: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100
    },
    68: {
      'B-': 100
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100
    },
    73: {
      'B-': 100,
      'B-N': 3.1
    },
    74: {
      'B-': 100,
      'B-N': 6.4
    },
    75: {
      'B-': 100,
      'B-N': 5.4,
      'B-2N': null
    },
    76: {
      'B-': 100,
      'B-N': null
    },
    77: {
      'B-2N': null,
      'B-': null,
      'B-N': null
    },
    78: {
      'B-': 100,
      'B-N': 24.2,
      'B-2N': null
    },
    79: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    80: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    81: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    82: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    83: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  46: {
    44: {
      'EC+B+': 100,
      '2P': null,
      'ECP': null
    },
    45: {
      'EC+B+': 100
    },
    46: {
      'EC+B+': 100
    },
    47: {
      'EC+B+': 100,
      'ECP': null
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC+B+': 100
    },
    50: {
      'EC+B+': 100
    },
    51: {
      'EC+B+': 100
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    54: {
      'EC': 100
    },
    55: {
      'EC+B+': 100
    },
    57: {
      'EC': 100
    },
    61: {
      'B-': 100
    },
    63: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100
    },
    68: {
      'B-': 100
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100
    },
    73: {
      'B-': 100
    },
    74: {
      'B-': 100,
      'B-N': 0.7
    },
    75: {
      'B-': 100,
      'B-N': 0.8
    },
    76: {
      'B-': 100,
      'B-N': 2.5
    },
    77: {
      'B-': 100,
      'B-N': 1.4
    },
    78: {
      'B-': 100,
      'B-N': null
    },
    79: {
      'B-': 100,
      'B-N': null
    },
    80: {
      'B-': null,
      'B-N': null
    },
    81: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    82: {
      'B-': 100,
      'B-N': null
    },
    83: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    84: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    85: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    }
  },
  47: {
    45: {
      'EC+B+': null,
      'ECP': null,
      'P': null
    },
    46: {
      'ECP': null,
      'EC+B+': null,
      'P': null
    },
    47: {
      'EC+B+': 100,
      'ECP': null
    },
    48: {
      'EC+B+': 100,
      'ECP': null
    },
    49: {
      'EC+B+': 100,
      'ECP': 8.5
    },
    50: {
      'EC': 100
    },
    51: {
      'EC+B+': 100,
      'ECP': 0.0011
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    54: {
      'EC+B+': 100
    },
    55: {
      'EC+B+': 100
    },
    56: {
      'EC+B+': 100
    },
    57: {
      'EC+B+': 100
    },
    58: {
      'EC+B+': 100
    },
    59: {
      'EC+B+': 99.5,
      'B-': 1
    },
    61: {
      'B-': 97.15,
      'EC+B+': 2.85
    },
    63: {
      'B-': 99.7,
      'EC': 0.3
    },
    64: {
      'B-': 100
    },
    65: {
      'B-': 100
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 100
    },
    68: {
      'B-': 100
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100
    },
    73: {
      'B-': 100,
      'B-N': 0.003
    },
    74: {
      'B-': 100,
      'B-N': 0.08
    },
    75: {
      'B-': 99.8,
      'B-N': 0.186
    },
    76: {
      'B-': 100,
      'B-N': 0.62
    },
    77: {
      'B-': 100,
      'B-N': 1.3
    },
    78: {
      'B-': 100,
      'B-N': null
    },
    79: {
      'B-': 100,
      'B-N': null
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100,
      'B-N': null
    },
    82: {
      'B-': 100,
      'B-N': 0
    },
    83: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    84: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    85: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    }
  },
  48: {
    46: {
      'ECP': null,
      'EC+B+': null
    },
    47: {
      'B+': 100,
      'B+P': 4.5
    },
    48: {
      'EC+B+': 100
    },
    49: {
      'EC': 100,
      'ECP': null
    },
    50: {
      'EC+B+': 100,
      'ECP': 0.029
    },
    51: {
      'EC+B+': 100,
      'B+P': 0.17,
      'B+A': 0.0001
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100
    },
    54: {
      'EC+B+': 100
    },
    55: {
      'EC+B+': 100
    },
    56: {
      'EC+B+': 100
    },
    57: {
      'EC+B+': 100
    },
    59: {
      'EC+B+': 100
    },
    61: {
      'EC': 100
    },
    65: {
      'B-': 100
    },
    67: {
      'B-': 100
    },
    68: {
      '2B-': null
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100
    },
    73: {
      'B-': 100
    },
    74: {
      'B-': 100
    },
    75: {
      'B-': 100
    },
    76: {
      'B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      'B-': 100
    },
    79: {
      'B-': 100
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100,
      'B-N': 0
    },
    82: {
      'B-': 100,
      'B-N': 3.5
    },
    83: {
      'B-': 100,
      'B-N': 3.5
    },
    84: {
      'B-': 100,
      'B-N': 60,
      'B-2N': null
    },
    85: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    86: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    }
  },
  49: {
    47: {
      'ECP': null,
      'EC+B+': null,
      'P': null
    },
    48: {
      'B+': 100,
      'B+P': 1.7
    },
    49: {
      'EC+B+': 100,
      'ECP': 0.13
    },
    50: {
      'B+P': 0.9
    },
    51: {
      'EC+B+': 100,
      'ECP': 1.66
    },
    52: {
      'EC+B+': 100,
      'B+P': null
    },
    53: {
      'EC+B+': 100,
      'B+P': 0.0093
    },
    54: {
      'EC+B+': 100
    },
    55: {
      'EC+B+': 100
    },
    56: {
      'EC+B+': 100
    },
    57: {
      'EC+B+': 100
    },
    58: {
      'EC+B+': 100
    },
    59: {
      'EC+B+': 100
    },
    60: {
      'EC+B+': 100
    },
    61: {
      'EC+B+': 100
    },
    62: {
      'EC': 100
    },
    63: {
      'EC+B+': 62,
      'B-': 38
    },
    65: {
      'B-': 99.5,
      'EC+B+': 0.5
    },
    66: {
      'B-': 100
    },
    67: {
      'B-': 99.977,
      'EC': 0.023
    },
    68: {
      'B-': 100
    },
    69: {
      'B-': 100
    },
    70: {
      'B-': 100
    },
    71: {
      'B-': 100
    },
    72: {
      'B-': 100
    },
    73: {
      'B-': 100
    },
    74: {
      'B-': 100
    },
    75: {
      'B-': 100
    },
    76: {
      'B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      'B-': 100,
      'B-N': 0.03
    },
    79: {
      'B-': 100,
      'B-N': 0.046
    },
    80: {
      'B-': 100,
      'B-N': 0.23
    },
    81: {
      'B-': 100,
      'B-N': 0.93
    },
    82: {
      'B-': 100,
      'B-N': 2
    },
    83: {
      'B-': 100,
      'B-N': 7.4,
      'B-2N': null
    },
    84: {
      'B-': 100,
      'B-N': 85
    },
    85: {
      'B-': 100,
      'B-N': 65
    },
    86: {
      'B-': 100,
      'B-N': 0,
      'B-2N': null
    },
    87: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    88: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  50: {
    49: {
      'ECP': null,
      'EC+B+': null
    },
    50: {
      'EC+B+': 100,
      'ECP': 17
    },
    51: {
      'EC+B+': 100,
      'ECP': 26
    },
    52: {
      'EC+B+': 100
    },
    53: {
      'EC+B+': 100,
      'ECP': 1.2
    },
    54: {
      'EC+B+': 100
    },
    55: {
      'EC+B+': 100,
      'B+P': 0.011
    },
    56: {
      'EC+B+': 100
    },
    57: {
      'EC+B+': 100
    },
    58: {
      'EC+B+': 100
    },
    59: {
      'EC+B+': 100
    },
    60: {
      'EC': 100
    },
    61: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100
    },
    71: {
      'B-': 100
    },
    73: {
      'B-': 100
    },
    75: {
      'B-': 100
    },
    76: {
      'B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      'B-': 100
    },
    79: {
      'B-': 100
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100
    },
    82: {
      'B-': 100
    },
    83: {
      'B-': 100,
      'B-N': 0.0294
    },
    84: {
      'B-': 100,
      'B-N': 17
    },
    85: {
      'B-': 100,
      'B-N': 21,
      'B-2N': null
    },
    86: {
      'B-': 100,
      'B-N': 27
    },
    87: {
      'B-': 100,
      'B-N': 58
    },
    88: {
      'B-': 100,
      'B-N': 36,
      'B-2N': null
    },
    89: {
      'B-': 100,
      'B-3N': null,
      'B-2N': null
    },
    90: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  51: {
    52: {
      'P': null
    },
    53: {
      'EC+B+': 100,
      'ECP': 7,
      'P': 1
    },
    54: {
      'EC+B+': 100,
      'P': null
    },
    55: {
      'EC+B+': null
    },
    56: {
      'EC+B+': 100
    },
    57: {
      'EC+B+': 100
    },
    58: {
      'EC+B+': 100
    },
    59: {
      'EC+B+': 100
    },
    60: {
      'EC+B+': 100
    },
    61: {
      'EC+B+': 100
    },
    62: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100
    },
    66: {
      'EC+B+': 100,
      'B+': 1.7
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC': 100
    },
    69: {
      'EC+B+': 100
    },
    71: {
      'B-': 97.59,
      'EC+B+': 2.41
    },
    73: {
      'B-': 100
    },
    74: {
      'B-': 100
    },
    75: {
      'B-': 100
    },
    76: {
      'B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      'B-': 100
    },
    79: {
      'B-': 100
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100
    },
    82: {
      'B-': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100,
      'B-N': 22
    },
    85: {
      'B-': 100,
      'B-N': 18.5,
      'B-2N': 1
    },
    86: {
      'B-': 100,
      'B-N': 49
    },
    87: {
      'B-N': 72,
      'B-2N': null,
      'B-': null
    },
    88: {
      'B-': 100,
      'B-N': 90,
      'B-2N': null
    },
    89: {
      'B-': 100,
      'B-N': 23,
      'B-2N': 7.6
    },
    90: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    91: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  52: {
    52: {
      'A': 100,
      '2P': null
    },
    53: {
      'A': 100
    },
    54: {
      'A': 100
    },
    55: {
      'A': 70,
      'EC+B+': 30
    },
    56: {
      'EC+B+': 51,
      'A': 49,
      'B+P': 2.4
    },
    57: {
      'EC+B+': 96.1,
      'B+P': 9.4,
      'A': 3.9
    },
    58: {
      'EC+B+': 100,
      'A': 0.00067
    },
    59: {
      'EC+B+': 100,
      'B+P': null
    },
    60: {
      'EC+B+': 100
    },
    61: {
      'EC+B+': 100
    },
    62: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100,
      'B+': 25
    },
    66: {
      'EC': 100
    },
    67: {
      'EC+B+': 100,
      'B+': 2.06
    },
    69: {
      'EC+B+': 100
    },
    71: {
      'EC': 100
    },
    75: {
      'B-': 100
    },
    76: {
      '2B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      '2B-': 100
    },
    79: {
      'B-': 100
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100
    },
    82: {
      'B-': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100,
      'B-N': 1.31
    },
    85: {
      'B-': 100,
      'B-N': 2.99
    },
    86: {
      'B-': 100,
      'B-N': 6.3
    },
    87: {
      'B-': 100,
      'B-N': null
    },
    88: {
      'B-': 100,
      'B-N': null
    },
    90: null,
    91: {
      'B-': null,
      'B-N': null,
      'B-2N': null
    },
    92: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    },
    93: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  53: {
    55: {
      'A': 91,
      'EC+B+': 9,
      'P': 1
    },
    56: {
      'P': 99.986,
      'A': 0.014
    },
    57: {
      'EC+B+': 83,
      'A': 17,
      'ECP': 11
    },
    58: {
      'EC+B+': 99.9,
      'A': 0.1
    },
    59: {
      'EC+B+': 100,
      'ECP': 0.88,
      'ECA': 0.104
    },
    60: {
      'EC+B+': 100,
      'A': 0.000000331
    },
    61: {
      'EC+B+': 100,
      'B+P': null
    },
    62: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100
    },
    64: {
      'EC+B+': 100,
      'B+': 77
    },
    65: {
      'EC+B+': 100
    },
    66: {
      'EC+B+': 100,
      'B+': 51,
      'EC': 49
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100
    },
    72: {
      'EC': 100
    },
    73: {
      'EC+B+': 52.7,
      'B-': 47.3
    },
    75: {
      'B-': 93.1,
      'EC+B+': 6.9
    },
    76: {
      'B-': 100
    },
    77: {
      'B-': 100
    },
    78: {
      'B-': 100
    },
    79: {
      'B-': 100
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100
    },
    82: {
      'B-': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100,
      'B-N': 7.14
    },
    85: {
      'B-': 100,
      'B-N': 5.44
    },
    86: {
      'B-': 100,
      'B-N': 10
    },
    87: {
      'B-': 100,
      'B-N': 7.6
    },
    88: {
      'B-': 100,
      'B-N': 21.2
    },
    89: null,
    90: {
      'B-': null
    },
    91: null,
    92: {
      'B-N': null,
      'B-': null
    },
    93: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    94: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  54: {
    54: {
      'A': 100,
      '2P': null
    },
    55: {
      'A': 100
    },
    56: {
      'A': 64,
      'EC+B+': 36,
      'ECP': null
    },
    57: {
      'A': 8,
      'EC+B+': null
    },
    58: {
      'EC+B+': 98.8,
      'A': 1.2
    },
    59: {
      'EC+B+': 100,
      'ECP': 7,
      'A': 0.011
    },
    60: {
      'EC+B+': 100
    },
    61: {
      'EC+B+': 100,
      'B+P': 0.34,
      'A': 0.0003
    },
    62: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100,
      'B+P': 0.0029
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100
    },
    66: {
      'EC+B+': 100
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      '2B+': null
    },
    71: {
      'EC+B+': 100
    },
    73: {
      'EC': 100
    },
    79: {
      'B-': 100
    },
    80: {
      '2B-': 0
    },
    81: {
      'B-': 100
    },
    82: {
      '2B-': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100
    },
    85: {
      'B-': 100
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100,
      'B-N': 0.044
    },
    88: {
      'B-': 100,
      'B-N': 0.21
    },
    89: {
      'B-': 100,
      'B-N': 0
    },
    90: {
      'B-': 100
    },
    91: {
      'B-': 100,
      'B-N': 5
    },
    92: {
      'B-': 100,
      'B-N': 6.9
    },
    93: {
      'B-N': 8,
      'B-': null
    },
    94: {
      'B-N': null,
      'B-': null
    },
    95: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    },
    96: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  55: {
    57: {
      'P': 100,
      'A': 0.26
    },
    58: {
      'P': 100
    },
    59: {
      'EC+B+': 99.982,
      'ECP': 8.7,
      'ECA': 0.19
    },
    60: {
      'EC+B+': 100,
      'B+P': 0.07
    },
    61: {
      'EC+B+': 100,
      'ECP': 2.8,
      'ECA': 0.049
    },
    62: {
      'EC+B+': 100
    },
    63: {
      'EC+B+': 100,
      'ECP': 0.042,
      'ECA': 0.0024
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100,
      'B+A': 0.00002,
      'B+P': 0.000007
    },
    66: {
      'EC+B+': 100
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 98.4,
      'B-': 1.6
    },
    76: {
      'EC': 100
    },
    77: {
      'EC+B+': 98.13,
      'B-': 1.87
    },
    79: {
      'B-': 99.9997,
      'EC': 0.0003
    },
    80: {
      'B-': 100
    },
    81: {
      'B-': 100
    },
    82: {
      'B-': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100
    },
    85: {
      'B-': 100
    },
    86: {
      'B-': 100,
      'B-N': 0.035
    },
    87: {
      'B-': 100,
      'B-N': 0.09
    },
    88: {
      'B-': 100,
      'B-N': 1.64
    },
    89: {
      'B-': 100,
      'B-N': 3.03
    },
    90: {
      'B-': 100,
      'B-N': 14.7
    },
    91: {
      'B-': 100,
      'B-N': 14.2
    },
    92: {
      'B-': 100,
      'B-N': 28.5
    },
    93: {
      'B-': 100,
      'B-N': 25.1
    },
    94: {
      'B-': 100,
      'B-N': null
    },
    95: {
      'B-': 100,
      'B-N': 20
    },
    96: {
      'B-': 100,
      'B-N': null
    },
    97: {
      'B-': 100,
      'B-2N': null,
      'B-N': null
    }
  },
  56: {
    58: {
      'EC+B+': 99.1,
      'ECP': 20,
      'A': 0.9
    },
    59: {
      'EC+B+': 100,
      'B+P': 15
    },
    60: {
      'EC+B+': 100,
      'B+P': 3
    },
    61: {
      'EC+B+': 100,
      'B+P': 0,
      'B+A': 0
    },
    62: {
      'EC+B+': 100,
      'ECP': null
    },
    63: {
      'EC+B+': 100,
      'ECP': 25
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100
    },
    66: {
      'EC+B+': 100
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100
    },
    72: {
      'EC': 100
    },
    73: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      '2B+': null
    },
    77: {
      'EC': 100
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100
    },
    85: {
      'B-': 100
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100
    },
    88: {
      'B-': 100
    },
    89: {
      'B-': 100
    },
    90: {
      'B-': 100
    },
    91: {
      'B-': 100,
      'B-N': 0.06
    },
    92: {
      'B-': 100,
      'B-N': 0.4
    },
    93: {
      'B-': 100,
      'B-N': 0.43
    },
    94: {
      'B-': 100,
      'B-N': null
    },
    95: {
      'B-': 100,
      'B-N': null
    },
    96: {
      'B-': 100,
      'B-N': null
    },
    97: {
      'B-': 100,
      'B-N': null
    },
    98: {
      'B-': 100,
      'B-N': null
    }
  },
  57: {
    60: {
      'P': 93.9,
      'EC+B+': 6.1
    },
    63: {
      'EC+B+': 100,
      'ECP': 0
    },
    64: {
      'EC+B+': 100
    },
    65: {
      'EC+B+': 100,
      'ECP': null
    },
    66: {
      'EC+B+': 100
    },
    67: {
      'EC+B+': 100
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 0
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC': 100
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC': 100
    },
    81: {
      'EC+B+': 65.5,
      'B-': 34.5
    },
    83: {
      'B-': 100
    },
    84: {
      'B-': 100
    },
    85: {
      'B-': 100
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100
    },
    88: {
      'B-': 100
    },
    89: {
      'B-': 100,
      'B-N': 0.007
    },
    90: {
      'B-': 100,
      'B-N': 0.041
    },
    91: {
      'B-': 100,
      'B-N': 0.15
    },
    92: {
      'B-': 100,
      'B-N': 1.43
    },
    93: {
      'B-': 100,
      'B-N': 2.7
    },
    94: {
      'B-': 100,
      'B-N': null
    },
    95: {
      'B-': 100,
      'B-N': null
    },
    96: {
      'B-': 100,
      'B-N': null
    },
    97: {
      'B-': 100,
      'B-N': null
    },
    98: {
      'B-': 100,
      'B-N': null
    },
    99: {
      'B-': 100,
      'B-N': null
    },
    100: {
      'B-': 100,
      'B-N': null,
      'B-2N': null
    }
  },
  58: {
    63: {
      'EC+B+': 100,
      'ECP': 1
    },
    64: {
      'EC+B+': null,
      'ECP': null
    },
    65: {
      'EC+B+': 100,
      'ECP': 0
    },
    66: {
      'EC+B+': 100
    },
    67: {
      'EC+B+': 100,
      'B+P': null
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100,
      'B+': 11
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC': 100
    },
    77: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      '2EC': 100
    },
    81: {
      'EC': 100
    },
    83: {
      'B-': 100
    },
    84: null,
    85: {
      'B-': 100
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100
    },
    88: {
      'B-': 100
    },
    89: {
      'B-': 100
    },
    90: {
      'B-': 100
    },
    91: {
      'B-': 100
    },
    92: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100
    },
    95: {
      'B-': 100,
      'B-N': null
    },
    96: {
      'B-': 100,
      'B-N': null
    },
    97: {
      'B-': 100,
      'B-N': null
    },
    98: {
      'B-': 100,
      'B-N': null
    },
    99: {
      'B-': 100,
      'B-N': null
    },
    100: {
      'B-': 100,
      'B-N': null
    }
  },
  59: {
    62: {
      'P': 100
    },
    65: {
      'EC+B+': 100,
      'ECP': 0
    },
    66: {
      'EC+B+': 100,
      'B+P': null
    },
    67: {
      'EC+B+': 100,
      'ECP': null
    },
    68: {
      'EC+B+': 100
    },
    69: {
      'EC+B+': 100
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    83: {
      'B-': 99.9836,
      'EC': 0.0164
    },
    84: {
      'B-': 100
    },
    85: {
      'B-': 100
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100
    },
    88: {
      'B-': 100
    },
    89: {
      'B-': 100
    },
    90: {
      'B-': 100
    },
    91: {
      'B-': 100
    },
    92: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100,
      'B-N': null
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100,
      'B-N': null
    },
    97: {
      'B-': 100,
      'B-N': null
    },
    98: {
      'B-': 100,
      'B-N': null
    },
    99: {
      'B-': 100,
      'B-N': null
    },
    100: {
      'B-': 100,
      'B-N': null
    },
    101: {
      'B-': 100,
      'B-N': null
    },
    102: {
      'B-': 100,
      'B-N': null
    }
  },
  60: {
    65: {
      'EC+B+': 100,
      'ECP': 0
    },
    66: {
      'ECP': null,
      'EC+B+': null
    },
    67: {
      'EC+B+': 100,
      'ECP': null
    },
    68: {
      'EC+B+': 100,
      'ECP': null
    },
    69: {
      'EC+B+': 100,
      'ECP': 0
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100,
      'ECP': 0
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC': 100
    },
    81: {
      'EC+B+': 100
    },
    84: {
      'A': 100
    },
    87: {
      'B-': 100
    },
    89: {
      'B-': 100
    },
    90: {
      '2B-': 100
    },
    91: {
      'B-': 100
    },
    92: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100,
      'B-N': null
    },
    99: {
      'B-': 100,
      'B-N': null
    },
    100: {
      'B-': 100,
      'B-N': null
    },
    101: {
      'B-': 100,
      'B-N': null
    },
    102: {
      'B-': 100,
      'B-N': null
    },
    103: {
      'B-': 100,
      'B-N': null
    }
  },
  61: {
    67: {
      'EC': 100,
      'A': null,
      'ECP': null
    },
    68: {
      'EC+B+': 100,
      'P': null,
      'ECP': null
    },
    69: {
      'EC+B+': 100,
      'ECP': null
    },
    70: {
      'EC+B+': 100
    },
    71: {
      'EC+B+': 100,
      'ECP': 0.00005
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    82: {
      'EC+B+': 100,
      'B+': 0.0000057
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'EC': 100,
      'A': 0.00000028
    },
    85: {
      'EC': 65.7,
      'B-': 34.3
    },
    86: {
      'B-': 100
    },
    87: {
      'B-': 100
    },
    88: {
      'B-': 100
    },
    89: {
      'B-': 100
    },
    90: {
      'B-': 100
    },
    91: {
      'B-': 100
    },
    92: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100
    },
    99: {
      'B-': 100,
      'B-N': null
    },
    100: {
      'B-': 100,
      'B-N': null
    },
    101: {
      'B-': 100,
      'B-N': null
    },
    102: {
      'B-': 100,
      'B-N': null
    },
    103: {
      'B-': 100,
      'B-N': null
    },
    104: {
      'B-': 100,
      'B-N': null
    }
  },
  62: {
    67: {
      'EC+B+': 100,
      'ECP': 0
    },
    68: {
      'EC+B+': null
    },
    69: {
      'EC+B+': 100,
      'ECP': 0
    },
    70: {
      'EC+B+': 100,
      'ECP': null
    },
    71: {
      'EC+B+': 100,
      'ECP': 0
    },
    72: {
      'EC+B+': 100
    },
    73: {
      'EC+B+': 100,
      'ECP': 0.02
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    83: {
      'EC': 100
    },
    84: {
      'A': 100
    },
    85: {
      'A': 100
    },
    86: {
      'A': 100
    },
    89: {
      'B-': 100
    },
    91: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100,
      'B-N': null
    },
    102: {
      'B-': 100,
      'B-N': null
    },
    103: {
      'B-': 100,
      'B-N': null
    },
    104: {
      'B-': 100,
      'B-N': null
    },
    105: {
      'B-': 100,
      'B-N': null
    },
    106: {
      'B-': 100,
      'B-N': null
    }
  },
  63: {
    67: {
      'P': 100
    },
    68: {
      'P': 89,
      'EC+B+': 11
    },
    69: {
      'P': 0,
      'EC+B+': null
    },
    71: {
      'EC+B+': 100,
      'ECP': 0
    },
    72: {
      'EC+B+': 100,
      'ECP': null
    },
    73: {
      'EC+B+': 100,
      'B+P': 0.09
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'EC': 99.9978,
      'A': 0.0022
    },
    85: {
      'EC+B+': 100,
      'A': 0.00000094
    },
    86: {
      'EC': 100
    },
    87: {
      'EC+B+': 100
    },
    88: {
      'A': null
    },
    89: {
      'EC+B+': 72.08,
      'B-': 27.92
    },
    91: {
      'B-': 99.982,
      'EC+B+': 0.018
    },
    92: {
      'B-': 100
    },
    93: {
      'B-': 100
    },
    94: {
      'B-': 100
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100,
      'B-N': null
    },
    104: {
      'B-': 100,
      'B-N': null
    },
    105: {
      'B-': 100,
      'B-N': null
    },
    106: {
      'B-': 100,
      'B-N': null
    }
  },
  64: {
    70: null,
    71: {
      'EC+B+': 100,
      'ECP': 2
    },
    72: null,
    73: {
      'EC+B+': 100,
      'ECP': null
    },
    74: {
      'EC+B+': 100
    },
    75: {
      'EC+B+': 100,
      'ECP': 0
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100,
      'B+P': 0.03
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'A': 100
    },
    85: {
      'EC+B+': 100,
      'A': 0.00043
    },
    86: {
      'A': 100
    },
    87: {
      'EC': 100,
      'A': 0.0000008
    },
    88: {
      'A': 100
    },
    89: {
      'EC': 100
    },
    95: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100
    },
    105: {
      'B-': 100,
      'B-N': null
    },
    106: {
      'B-': 100,
      'B-N': null
    },
    107: {
      'B-': 100,
      'B-N': null
    },
    108: {
      'B-': 100,
      'B-N': null
    }
  },
  65: {
    70: {
      'P': 100,
      'EC+B+': null
    },
    73: {
      'EC+B+': 100
    },
    74: {
      'EC+B+': 0,
      'ECP': null,
      'P': null
    },
    75: {
      'EC+B+': 100,
      'ECP': 0.26
    },
    76: {
      'EC+B+': 100
    },
    77: {
      'EC+B+': 100,
      'B+P': 0.0022
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100
    },
    80: null,
    81: {
      'EC+B+': 100
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'EC+B+': 83.3,
      'A': 16.7
    },
    85: {
      'EC+B+': 100,
      'A': 0.05
    },
    86: {
      'EC+B+': 99.9905,
      'A': 0.0095
    },
    87: {
      'EC+B+': 100,
      'A': 0.0000007
    },
    88: {
      'EC+B+': 100
    },
    89: {
      'EC+B+': 100,
      'B-': 0.1
    },
    90: {
      'EC': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC': 100
    },
    93: {
      'EC+B+': 83.4,
      'B-': 16.6
    },
    95: {
      'B-': 100
    },
    96: {
      'B-': 100
    },
    97: {
      'B-': 100
    },
    98: {
      'B-': 100
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100,
      'B-N': null
    },
    105: {
      'B-': 100,
      'B-N': null
    },
    106: {
      'B-': 100,
      'B-N': null
    },
    107: {
      'B-': 100,
      'B-N': null
    },
    108: {
      'B-': 100,
      'B-N': null
    },
    109: {
      'B-': 100,
      'B-N': null
    }
  },
  66: {
    73: {
      'EC+B+': 100,
      'ECP': 11
    },
    74: {
      'EC+B+': null
    },
    75: {
      'EC+B+': 100,
      'B+P': null
    },
    76: {
      'EC+B+': 100,
      'ECP': 0.06
    },
    77: {
      'EC+B+': 100,
      'ECP': null
    },
    78: {
      'EC+B+': 100,
      'ECP': null
    },
    79: {
      'EC+B+': 100,
      'ECP': 50
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100,
      'B+P': 0.05
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'EC+B+': 64,
      'A': 36
    },
    85: {
      'EC+B+': 94.4,
      'A': 5.6
    },
    86: {
      'EC+B+': 99.9,
      'A': 0.1
    },
    87: {
      'EC+B+': 99.9906,
      'A': 0.0094
    },
    88: {
      'A': 100
    },
    89: {
      'EC+B+': 100
    },
    91: {
      'EC+B+': 100
    },
    93: {
      'EC': 100
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100
    },
    105: {
      'B-': 100
    },
    106: {
      'B-': null
    },
    107: {
      'B-': 100
    },
    108: {
      'B-': null
    },
    109: {
      'B-': 100,
      'B-N': null
    },
    110: {
      'B-': 100,
      'B-N': null
    }
  },
  67: {
    73: {
      'P': 100
    },
    74: {
      'P': 100
    },
    75: {
      'EC+B+': 100,
      'ECP': 0,
      'P': 0
    },
    76: {
      'ECP': null,
      'EC+B+': null
    },
    77: {
      'EC+B+': 100,
      'ECP': null
    },
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100,
      'ECP': null
    },
    80: {
      'EC+B+': 100
    },
    81: {
      'EC+B+': 100
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'EC+B+': 78,
      'A': 22
    },
    85: {
      'EC+B+': 88,
      'A': 12
    },
    86: {
      'EC+B+': 99.949,
      'A': 0.051
    },
    87: {
      'EC+B+': 99.981,
      'A': 0.019
    },
    88: {
      'EC+B+': 100
    },
    89: {
      'EC+B+': 100
    },
    90: {
      'EC+B+': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC': 100
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC': 100
    },
    97: {
      'EC+B+': 60,
      'B-': 40
    },
    99: {
      'B-': 100
    },
    100: {
      'B-': 100
    },
    101: {
      'B-': 100
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100
    },
    105: {
      'B-': 100
    },
    106: {
      'B-': 100
    },
    107: {
      'B-': 100,
      'B-N': null
    },
    108: {
      'B-': 100,
      'B-N': null
    },
    109: {
      'B-N': null,
      'B-': null
    },
    110: {
      'B-': 100,
      'B-N': null
    },
    111: {
      'B-': 100,
      'B-N': null
    }
  },
  68: {
    75: null,
    76: {
      'EC+B+': 100
    },
    77: null,
    78: {
      'EC+B+': 100
    },
    79: {
      'EC+B+': 100,
      'B+P': 0
    },
    80: {
      'EC+B+': 100,
      'ECP': 0.15
    },
    81: {
      'EC+B+': 100,
      'ECP': 7
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'A': 90,
      'EC+B+': 10
    },
    85: {
      'A': 53,
      'EC+B+': 47
    },
    86: {
      'EC+B+': 99.53,
      'A': 0.47
    },
    87: {
      'EC+B+': 99.978,
      'A': 0.022
    },
    88: {
      'EC+B+': 100,
      'A': 0.000017
    },
    89: {
      'EC+B+': 100
    },
    90: {
      'EC': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC': 100
    },
    93: {
      'EC+B+': 100
    },
    95: {
      'EC+B+': 100
    },
    97: {
      'EC': 100
    },
    101: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100
    },
    105: {
      'B-': 100
    },
    106: {
      'B-': 100
    },
    107: {
      'B-': 100
    },
    108: {
      'B-': null
    },
    109: {
      'B-': 100
    },
    110: {
      'B-': null
    },
    111: {
      'B-': 100
    },
    112: {
      'B-': 100,
      'B-N': null
    }
  },
  69: {
    75: {
      'P': 0
    },
    76: {
      'P': 100
    },
    77: {
      'EC+B+': null,
      'P': null
    },
    78: {
      'EC+B+': 85,
      'P': 15
    },
    79: {
      'EC+B+': 100
    },
    80: {
      'EC+B+': 100,
      'ECP': 0.2
    },
    81: {
      'EC+B+': 100,
      'ECP': 1.2
    },
    82: {
      'EC+B+': 100
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'A': 91,
      'EC+B+': 9
    },
    85: {
      'A': 54,
      'EC+B+': 46
    },
    86: {
      'EC+B+': 99.17,
      'A': 0.83
    },
    87: {
      'EC+B+': 99.936,
      'A': 0.064
    },
    88: {
      'EC+B+': 100
    },
    89: {
      'EC+B+': 100
    },
    90: {
      'EC+B+': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC+B+': 100
    },
    95: {
      'EC+B+': 100,
      'B+': 39
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC': 100
    },
    99: {
      'EC+B+': 99.99,
      'B-': 0.01
    },
    101: {
      'B-': 99.869,
      'EC': 0.131
    },
    102: {
      'B-': 100
    },
    103: {
      'B-': 100
    },
    104: {
      'B-': 100
    },
    105: {
      'B-': 100
    },
    106: {
      'B-': 100
    },
    107: {
      'B-': 100
    },
    108: {
      'B-': 100
    },
    109: {
      'B-': null
    },
    110: {
      'B-': null
    },
    111: {
      'B-': 100
    },
    112: {
      'B-': null,
      'B-N': null
    }
  },
  70: {
    79: {
      'ECP': 100,
      'EC+B+': 100
    },
    80: null,
    81: {
      'EC+B+': 100,
      'ECP': 0
    },
    82: {
      'EC+B+': 100,
      'B+P': null
    },
    83: {
      'EC+B+': 90,
      'A': 10,
      'B+P': 0.008
    },
    84: {
      'A': 92.6,
      'EC+B+': 7.4
    },
    85: {
      'A': 89,
      'EC+B+': 11
    },
    86: {
      'EC+B+': 90,
      'A': 10
    },
    87: {
      'EC+B+': 99.5,
      'A': 0.5
    },
    88: {
      'EC+B+': 100,
      'A': 0.0021
    },
    89: {
      'EC+B+': 100
    },
    90: {
      'EC+B+': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC': 100
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC': 100
    },
    97: {
      'EC+B+': 100
    },
    99: {
      'EC': 100
    },
    105: {
      'B-': 100
    },
    107: {
      'B-': 100
    },
    108: {
      'B-': 100
    },
    109: {
      'B-': 100
    },
    110: {
      'B-': 100
    },
    111: {
      'B-': null
    },
    112: {
      'B-': null
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': null
    },
    115: {
      'B-': null
    }
  },
  71: {
    79: {
      'P': 70.9,
      'EC+B+': 29.1
    },
    80: {
      'P': 63.4,
      'EC+B+': 36.6
    },
    81: {
      'EC+B+': 100,
      'B+P': 15
    },
    82: {
      'EC+B+': null,
      'A': null
    },
    83: null,
    84: {
      'A': 90,
      'EC+B+': 10
    },
    85: {
      'A': 95,
      'EC+B+': 5
    },
    86: {
      'A': 0
    },
    87: {
      'EC+B+': 99.09,
      'A': 0.91
    },
    88: {
      'EC+B+': 100,
      'A': 0.1
    },
    89: {
      'EC+B+': 100,
      'A': 0.0001
    },
    90: {
      'EC+B+': 100
    },
    91: {
      'EC+B+': 100
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC+B+': 100
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC+B+': 100
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC+B+': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC': 100
    },
    103: {
      'EC+B+': 100
    },
    105: {
      'B-': 100
    },
    106: {
      'B-': 100
    },
    107: {
      'B-': 100
    },
    108: {
      'B-': 100
    },
    109: {
      'B-': 100
    },
    110: {
      'B-': 100
    },
    111: {
      'B-': 100
    },
    112: {
      'B-': 100
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': null
    },
    115: {
      'B-': null
    },
    116: {
      'B-': null,
      'B-N': null
    },
    117: {
      'B-': 100
    }
  },
  72: {
    79: null,
    81: null,
    82: {
      'EC+B+': 100,
      'A': 0
    },
    83: {
      'EC+B+': 100
    },
    84: {
      'A': 100
    },
    85: {
      'A': 94,
      'EC+B+': 14
    },
    86: {
      'EC+B+': 55.7,
      'A': 44.3
    },
    87: {
      'EC+B+': 65,
      'A': 35
    },
    88: {
      'EC+B+': 99.3,
      'A': 0.7
    },
    89: {
      'EC+B+': 99.87,
      'A': 0.13
    },
    90: {
      'EC+B+': 99.992,
      'A': 0.008
    },
    91: {
      'EC+B+': 100,
      'A': 0.0001
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC+B+': 100
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC': 100
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'A': 100
    },
    103: {
      'EC': 100
    },
    109: {
      'B-': 100
    },
    110: {
      'B-': 100
    },
    111: {
      'IT': 100,
      'B-': 100
    },
    112: {
      'B-': 100
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': 100
    },
    115: {
      'B-': 100
    },
    116: {
      'B-': 100
    },
    117: {
      'B-': 100
    },
    118: {
      'B-': 100
    }
  },
  73: {
    82: {
      'P': 100
    },
    83: {
      'P': 71,
      'EC+B+': 29
    },
    84: {
      'A': 96.6,
      'P': 3.4
    },
    85: {
      'A': 91,
      'EC+B+': 9
    },
    86: {
      'EC+B+': 66,
      'A': 34
    },
    87: {
      'A': 34
    },
    88: {
      'A': null,
      'EC+B+': null
    },
    89: {
      'EC+B+': 99.926,
      'A': 0.074,
      'ECP': null
    },
    90: {
      'EC+B+': 99.8,
      'A': 0.2
    },
    91: {
      'EC+B+': 100,
      'A': null
    },
    92: {
      'EC+B+': 100
    },
    93: {
      'EC+B+': 100
    },
    94: {
      'EC+B+': 100
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC+B+': 100
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC+B+': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC+B+': 100
    },
    103: {
      'EC+B+': 100
    },
    104: {
      'EC+B+': 100
    },
    105: {
      'EC+B+': 100
    },
    106: {
      'EC': 100
    },
    107: {
      'EC': 85,
      'B-': 15
    },
    109: {
      'B-': 100
    },
    110: {
      'B-': 100
    },
    111: {
      'B-': 100
    },
    112: {
      'B-': 100
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': 100
    },
    115: {
      'B-': 100
    },
    116: {
      'B-': 100
    },
    117: {
      'B-': 100
    },
    118: {
      'B-': null
    },
    119: {
      'B-': 100
    },
    120: {
      'B-': 100,
      'B-N': null
    },
    121: {
      'B-': 100,
      'B-N': null
    }
  },
  74: {
    83: {
      'EC': null
    },
    84: {
      'A': 100
    },
    85: {
      'A': 99.9,
      'EC+B+': 0.1
    },
    86: {
      'A': 87,
      'EC+B+': 13
    },
    87: {
      'A': 73,
      'EC+B+': 27
    },
    88: {
      'EC+B+': 54.8,
      'A': 45.2
    },
    89: {
      'EC+B+': 86,
      'A': 14
    },
    90: {
      'EC+B+': 96.2,
      'A': 3.8
    },
    91: {
      'EC+B+': 99.8,
      'A': 0.2
    },
    92: {
      'EC+B+': 99.965,
      'A': 0.035
    },
    93: {
      'EC+B+': 99.96,
      'A': 0.04
    },
    94: {
      'EC+B+': 100,
      'A': 0.0032
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC+B+': 100
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC+B+': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC': 100
    },
    103: {
      'EC+B+': 100
    },
    104: {
      'EC': 100
    },
    105: {
      'EC+B+': 100
    },
    106: {
      'A': 100
    },
    107: {
      'EC': 100
    },
    109: {
      'A': null
    },
    111: {
      'B-': 100
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': 100
    },
    115: {
      'B-': 100
    },
    116: {
      'B-': 100
    },
    118: {
      'B-': 100
    },
    119: {
      'B-': 100
    },
    120: {
      'B-': 100
    },
    121: {
      'B-': null
    },
    122: {
      'B-': null
    },
    123: {
      'B-': null
    }
  },
  75: {
    84: null,
    85: {
      'P': 89,
      'A': 11
    },
    86: {
      'P': 100,
      'A': 1.4
    },
    87: {
      'A': 94,
      'EC+B+': 6
    },
    88: {
      'EC+B+': 68,
      'A': 32
    },
    89: {
      'A': 58,
      'EC+B+': 42
    },
    90: {
      'EC+B+': 86,
      'A': 14
    },
    91: {
      'EC+B+': 76,
      'A': 24
    },
    92: {
      'EC+B+': 99,
      'A': 1
    },
    93: {
      'EC+B+': 100,
      'A': 0.005
    },
    94: {
      'EC+B+': 100,
      'A': 0.01
    },
    95: {
      'EC+B+': 100
    },
    96: {
      'EC+B+': 100
    },
    97: {
      'EC+B+': 100
    },
    98: {
      'EC+B+': 100
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC+B+': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC+B+': 100
    },
    103: {
      'EC+B+': 100
    },
    104: {
      'EC+B+': 100
    },
    105: {
      'EC+B+': 100
    },
    106: {
      'EC+B+': 100
    },
    107: {
      'EC+B+': 100
    },
    108: {
      'EC': 100
    },
    109: {
      'EC+B+': 100
    },
    111: {
      'B-': 92.53,
      'EC': 7.47
    },
    112: {
      'B-': 100,
      'A': 0.0001
    },
    113: {
      'B-': 100
    },
    114: {
      'B-': 100
    },
    115: {
      'B-': 100
    },
    116: {
      'B-': 100
    },
    117: {
      'B-': 100
    },
    118: null,
    119: {
      'B-': 100
    },
    120: {
      'B-': 100
    },
    121: {
      'B-': 100
    },
    122: {
      'B-': null
    },
    123: {
      'B-N': null,
      'B-': null
    },
    124: {
      'B-N': null,
      'B-': null
    }
  },
  76: {
    85: {
      'A': 100
    },
    86: {
      'A': 99
    },
    87: {
      'A': 100,
      'EC+B+': null
    },
    88: {
      'A': 96,
      'EC+B+': 4
    },
    89: {
      'A': 90,
      'EC+B+': 10
    },
    90: {
      'A': 72,
      'EC+B+': 28
    },
    91: {
      'A': 57,
      'EC+B+': 43
    },
    92: {
      'EC+B+': 57,
      'A': 43
    },
    93: {
      'EC+B+': 86.3,
      'A': 13.7
    },
    94: {
      'EC+B+': 90.5,
      'A': 9.5
    },
    95: {
      'EC+B+': 98.2,
      'A': 1.8
    },
    96: {
      'EC+B+': 99.8,
      'A': 0.2
    },
    97: {
      'EC+B+': 99.6,
      'A': 0.4
    },
    98: {
      'EC': 100,
      'A': 0.02
    },
    99: {
      'EC+B+': 100
    },
    100: {
      'EC+B+': 100
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC+B+': 100,
      'A': 0
    },
    103: {
      'EC+B+': 100
    },
    104: {
      'EC+B+': 100
    },
    105: {
      'EC+B+': 100
    },
    106: {
      'EC': 100
    },
    107: {
      'EC+B+': 100
    },
    108: {
      'A': null,
      '2B+': null
    },
    109: {
      'EC': 100
    },
    110: {
      'A': 100
    },
    115: {
      'B-': 100
    },
    117: {
      'B-': 100
    },
    118: {
      'B-': 100
    },
    119: {
      'B-': null
    },
    120: {
      'B-': 100
    },
    121: {
      'B-': 100
    },
    122: {
      'B-': 100
    },
    123: {
      'B-': 100
    },
    124: {
      'B-': 100
    },
    125: {
      'B-': null
    },
    126: {
      'B-': null
    },
    127: {
      'B-': 100,
      'B-N': null
    }
  },
  77: {
    87: {
      'EC+B+': null,
      'A': null,
      'P': null
    },
    88: {
      'A': null,
      'P': null
    },
    89: {
      'A': 93,
      'P': 7
    },
    90: {
      'A': 48,
      'P': 32,
      'EC+B+': 20
    },
    91: {
      'A': 100,
      'EC+B+': null,
      'P': null
    },
    92: {
      'A': 45,
      'P': null,
      'EC+B+': null
    },
    93: {
      'EC+B+': 94.8,
      'A': 5.2
    },
    94: {
      'EC+B+': 85,
      'A': 15
    },
    95: {
      'EC+B+': 98,
      'A': 2
    },
    96: {
      'EC+B+': 93,
      'A': 7
    },
    97: {
      'EC': 99.5,
      'A': 0.5
    },
    98: {
      'EC+B+': 99.15,
      'A': 0.85
    },
    99: {
      'EC+B+': 96.9,
      'A': 3.1
    },
    100: {
      'EC+B+': 99.94,
      'A': 0.06
    },
    101: {
      'EC+B+': 100
    },
    102: {
      'EC+B+': 100
    },
    103: {
      'EC+B+': 100
    },
    104: {
      'EC+B+': 100
    },
    105: {
      'EC+B+': 100
    },
    106: {
      'EC+B+': 100
    },
    107: {
      'EC+B+': 100
    },
    108: {
      'EC+B+': 100
    },
    109: {
      'EC+B+': 100
    },
    110: {
      'EC+B+': 100
    },
    111: {
      'EC+B+': 100
    },
    112: {
      'EC': 100
    },
    113: {
      'EC+B+': 100,
      'B+': 0.002
    },
    115: {
      'B-': 95.24,
      'EC': 4.76
    },
    117: {
      'B-': 100
    },
    118: {
      'B-': 100
    },
    119: {
      'B-': 100
    },
    120: {
      'B-': 100
    },
    121: {
      'B-': 100
    },
    122: {
      'B-': null
    },
    123: {
      'B-': null
    },
    124: {
      'B-': null
    },
    125: {
      'B-': 100
    },
    126: {
      'B-': 100
    },
    127: {
      'B-N': null,
      'B-': null
    },
    128: {
      'B-': 100,
      'B-N': null
    }
  },
  78: {
    87: {
      'A': 100
    },
    88: {
      'A': 100
    },
    89: {
      'A': 100
    },
    90: {
      'A': 100
    },
    91: {
      'A': 100
    },
    92: {
      'A': 98,
      'EC+B+': 2
    },
    93: {
      'A': 90,
      'EC+B+': 10
    },
    94: {
      'A': 94,
      'EC+B+': 6
    },
    95: {
      'A': 86,
      'EC+B+': 16
    },
    96: {
      'A': 76,
      'EC+B+': 24
    },
    97: {
      'A': 64,
      'EC+B+': 36
    },
    98: {
      'EC+B+': 60,
      'A': 40
    },
    99: {
      'EC+B+': 94.3,
      'A': 5.7
    },
    100: {
      'EC+B+': 92.3,
      'A': 7.7
    },
    101: {
      'EC+B+': 99.76,
      'A': 0.24
    },
    102: {
      'EC+B+': 99.7,
      'A': 0.3
    },
    103: {
      'EC+B+': 100,
      'A': 0.08
    },
    104: {
      'EC+B+': 99.962,
      'A': 0.038
    },
    105: {
      'EC+B+': 100,
      'A': 0.0096
    },
    106: {
      'EC+B+': 100,
      'A': 0.001
    },
    107: {
      'EC+B+': 100
    },
    108: {
      'EC+B+': 100,
      'A': 0.00014
    },
    109: {
      'EC+B+': 100
    },
    110: {
      'EC+B+': 99.999974,
      'A': 0.000026
    },
    111: {
      'EC+B+': 100
    },
    112: {
      'A': 100
    },
    113: {
      'EC': 100
    },
    115: {
      'EC': 100
    },
    119: {
      'B-': 100
    },
    121: {
      'B-': 100
    },
    122: {
      'B-': 100
    },
    123: {
      'B-': 100
    },
    124: {
      'B-': 100
    },
    125: {
      'B-': 100
    },
    126: {
      'B-': 100
    },
    127: {
      'B-': 100,
      'B-N': null
    },
    128: {
      'B-N': null,
      'B-': null
    },
    129: {
      'B-N': null,
      'B-': null
    },
    130: {
      'B-N': null,
      'B-': null
    }
  },
  79: {
    91: {
      'P': 89,
      'A': 11
    },
    92: {
      'P': 100
    },
    93: {
      'A': 100,
      'P': null,
      'EC+B+': null
    },
    94: {
      'A': 94,
      'P': null,
      'EC+B+': null
    },
    95: {
      'A': 0
    },
    96: {
      'A': 90
    },
    97: null,
    98: {
      'EC+B+': 60,
      'A': 40
    },
    99: {
      'EC+B+': 60,
      'A': 40
    },
    100: {
      'EC+B+': 78,
      'A': 22
    },
    101: {
      'EC+B+': 98.2,
      'A': 1.8
    },
    102: {
      'EC+B+': 97.3,
      'A': 2.7
    },
    103: {
      'EC+B+': 99.87,
      'A': 0.13
    },
    104: {
      'EC+B+': 99.45,
      'A': 0.55
    },
    105: {
      'EC+B+': 100,
      'A': 0.016
    },
    106: {
      'EC+B+': 99.74,
      'A': 0.26
    },
    107: {
      'EC+B+': 100,
      'A': 0.0008
    },
    108: {
      'EC+B+': 100,
      'A': 0.003
    },
    109: {
      'EC+B+': 100
    },
    110: {
      'EC+B+': 100,
      'A': 0.00003
    },
    111: {
      'EC+B+': 100,
      'A': 0.000001
    },
    112: {
      'EC+B+': 100
    },
    113: {
      'EC+B+': 100
    },
    114: {
      'EC+B+': 100
    },
    115: {
      'EC+B+': 100
    },
    116: {
      'EC': 100
    },
    117: {
      'EC+B+': 93,
      'B-': 7
    },
    119: {
      'B-': 100
    },
    120: {
      'B-': 100
    },
    121: {
      'B-': 100
    },
    122: {
      'B-': 100
    },
    123: {
      'B-': 100
    },
    124: {
      'B-': 100
    },
    125: {
      'B-': 100
    },
    126: {
      'B-': 100
    },
    127: {
      'B-': 100
    },
    128: {
      'B-': null,
      'B-N': null
    },
    129: {
      'B-N': null,
      'B-': null
    },
    130: {
      'B-': 100
    },
    131: {
      'B-N': null,
      'B-': null
    }
  },
  80: {
    90: {
      'A': 100
    },
    91: {
      'A': 100
    },
    92: {
      'A': 100
    },
    93: {
      'A': 100
    },
    94: {
      'A': 99.6
    },
    95: {
      'A': 100
    },
    96: {
      'A': 94
    },
    97: {
      'A': 100
    },
    98: {
      'A': 70,
      'EC+B+': 30
    },
    99: {
      'A': 55,
      'EC+B+': 45,
      'ECP': 0.15
    },
    100: {
      'EC+B+': 52,
      'A': 48
    },
    101: {
      'EC+B+': 73,
      'A': 27,
      'ECP': 0.013
    },
    102: {
      'EC+B+': 86.2,
      'A': 13.8
    },
    103: {
      'EC+B+': 88.3,
      'A': 11.7,
      'ECP': 0.00026
    },
    104: {
      'EC+B+': 98.89,
      'A': 1.11
    },
    105: {
      'EC+B+': 94,
      'A': 6
    },
    106: {
      'EC+B+': 99.984,
      'A': 0.016
    },
    107: {
      'EC+B+': 100,
      'A': 0.00037
    },
    108: {
      'EC+B+': 99.999963,
      'A': 0.000037
    },
    109: {
      'EC+B+': 100,
      'A': 0.00003
    },
    110: {
      'EC+B+': 100,
      'A': 0.00000034
    },
    111: {
      'EC+B+': 100
    },
    112: {
      'EC': 100
    },
    113: {
      'EC+B+': 100
    },
    114: {
      'EC': 100
    },
    115: {
      'EC+B+': 100
    },
    117: {
      'EC': 100
    },
    123: {
      'B-': 100
    },
    125: {
      'B-': 100
    },
    126: {
      'B-': 100
    },
    127: {
      'B-': 100
    },
    128: {
      'B-': 100
    },
    129: {
      'B-': 100
    },
    130: null,
    131: {
      'B-N': null,
      'B-': null
    },
    132: {
      'B-': 100,
      'B-N': null
    },
    133: {
      'B-N': null,
      'B-': null
    },
    134: {
      'B-': 100,
      'B-N': null
    },
    135: {
      'B-N': null,
      'B-': null
    },
    136: {
      'B-N': null,
      'B-': null
    }
  },
  81: {
    95: {
      'P': 100
    },
    96: {
      'A': 73,
      'P': 27
    },
    97: {
      'A': 53,
      'EC+B+': 47
    },
    98: {
      'A': 100,
      'P': null,
      'EC+B+': null
    },
    99: {
      'EC+B+': 94,
      'A': 6,
      'ECSF': 0.0032
    },
    100: {
      'A': 10
    },
    101: {
      'EC+B+': 97.5,
      'A': 5
    },
    102: {
      'EC+B+': 0,
      'A': null
    },
    103: {
      'EC+B+': 97.9,
      'A': 2.1
    },
    104: {
      'EC+B+': null
    },
    105: {
      'EC+B+': 100,
      'A': 0.006
    },
    106: {
      'EC+B+': 100,
      'A': 0.03
    },
    107: {
      'EC+B+': 100
    },
    108: {
      'EC+B+': 100
    },
    109: {
      'EC+B+': 100
    },
    110: null,
    111: {
      'EC+B+': 100
    },
    112: {
      'EC+B+': 100
    },
    113: {
      'EC+B+': 100,
      'A': 0.0000001
    },
    114: {
      'EC+B+': 100
    },
    115: {
      'EC+B+': 100
    },
    116: {
      'EC+B+': 100
    },
    117: {
      'EC+B+': 100
    },
    118: {
      'EC+B+': 100
    },
    119: {
      'EC+B+': 100
    },
    120: {
      'EC': 100
    },
    121: {
      'EC+B+': 100
    },
    123: {
      'B-': 97.08,
      'EC+B+': 2.92
    },
    125: {
      'B-': 100
    },
    126: {
      'B-': 100
    },
    127: {
      'B-': 100
    },
    128: {
      'B-': 100
    },
    129: {
      'B-': 100,
      'B-N': 0.007
    },
    130: {
      'B-': 100,
      'B-N': null
    },
    131: {
      'B-': 100,
      'B-N': 1.8
    },
    132: {
      'B-': 100,
      'B-N': null
    },
    133: {
      'B-': 100,
      'B-N': 34
    },
    134: {
      'B-N': null,
      'B-': null
    },
    135: {
      'B-': null,
      'B-N': null
    },
    136: {
      'B-': 100,
      'B-N': null
    }
  },
  82: {
    96: {
      'A': 100
    },
    97: {
      'A': 100
    },
    98: {
      'A': 100
    },
    99: {
      'A': 100
    },
    100: {
      'A': 98,
      'EC+B+': 2
    },
    101: {
      'A': 90
    },
    102: {
      'A': 80,
      'EC+B+': 20
    },
    103: {
      'A': 34,
      'EC+B+': null
    },
    104: {
      'EC+B+': 60,
      'A': 40
    },
    105: {
      'EC+B+': 90.5,
      'A': 9.5
    },
    106: {
      'EC+B+': 91.5,
      'A': 8.5
    },
    107: {
      'EC+B+': 100,
      'A': 0.4
    },
    108: {
      'EC+B+': 99.6,
      'A': 0.4
    },
    109: {
      'EC+B+': 99.987,
      'A': 0.013
    },
    110: {
      'EC+B+': 99.9941,
      'A': 0.0059
    },
    111: {
      'EC+B+': null
    },
    112: {
      'EC+B+': 100,
      'A': 0.0000073
    },
    113: {
      'EC+B+': 100
    },
    114: {
      'EC+B+': 100,
      'A': 0.00003
    },
    115: {
      'EC+B+': 100
    },
    116: {
      'EC+B+': 100
    },
    117: {
      'EC+B+': 100
    },
    118: {
      'EC': 100
    },
    119: {
      'EC+B+': 100
    },
    120: {
      'EC': 100,
      'A': 1
    },
    121: {
      'EC': 100
    },
    122: {
      'A': null
    },
    123: {
      'EC': 100
    },
    127: {
      'B-': 100
    },
    128: {
      'B-': 100,
      'A': 0.0000019
    },
    129: {
      'B-': 100
    },
    130: {
      'B-': 100
    },
    131: {
      'B-': 100
    },
    132: {
      'B-': 100
    },
    133: {
      'B-': 100
    },
    134: {
      'B-': null
    },
    135: {
      'B-': 100
    },
    136: {
      'B-': 100
    },
    137: {
      'B-': 100
    },
    138: {
      'B-': null
    }
  },
  83: {
    101: {
      'A': 100
    },
    102: {
      'P': 90,
      'A': 10
    },
    103: {
      'A': 100
    },
    104: {
      'A': 100
    },
    105: {
      'A': 100
    },
    106: {
      'A': 100
    },
    107: {
      'A': 90,
      'EC+B+': 10,
      'B+F': 0.000023
    },
    108: {
      'A': 51,
      'EC+B+': 49
    },
    109: {
      'EC+B+': 88,
      'A': 12
    },
    110: {
      'EC+B+': 96.5,
      'A': 3.5
    },
    111: {
      'EC+B+': 99.54,
      'A': 0.46
    },
    112: {
      'EC+B+': 99.97,
      'A': 0.03
    },
    113: {
      'EC+B+': 100,
      'A': 0.00115
    },
    114: {
      'EC+B+': 100,
      'A': 0.0001
    },
    115: {
      'EC+B+': 100
    },
    116: {
      'EC+B+': 100
    },
    117: {
      'EC+B+': 100
    },
    118: {
      'EC+B+': 100
    },
    119: {
      'EC+B+': 100
    },
    120: {
      'EC+B+': 100
    },
    121: {
      'EC+B+': 100
    },
    122: {
      'EC+B+': 100
    },
    123: {
      'EC+B+': 100
    },
    124: {
      'EC+B+': 100
    },
    125: {
      'EC+B+': 100
    },
    126: {
      'A': 100
    },
    127: {
      'B-': 100,
      'A': 0.000132
    },
    128: {
      'A': 99.724,
      'B-': 0.276
    },
    129: {
      'B-': 64.06,
      'A': 35.94
    },
    130: {
      'B-': 97.8,
      'A': 2.2
    },
    131: {
      'B-': 99.979,
      'A': 0.021,
      'B-A': 0.003
    },
    132: {
      'B-': 100
    },
    133: {
      'B-': 100
    },
    134: {
      'B-': 100
    },
    135: {
      'B-': 100
    },
    136: {
      'B-': 100
    },
    137: {
      'B-': null
    },
    138: {
      'B-N': null,
      'B-': null
    },
    139: {
      'B-N': null,
      'B-': null
    },
    140: {
      'B-N': null,
      'B-': null
    },
    141: {
      'B-': null,
      'B-N': null
    }
  },
  84: {
    102: {
      'A': 100
    },
    103: {
      'A': 100
    },
    104: {
      'A': 100
    },
    105: {
      'A': 100
    },
    106: {
      'A': 100
    },
    107: {
      'A': 99
    },
    108: {
      'A': 99.5,
      'EC+B+': 0.5
    },
    109: {
      'A': 100
    },
    110: {
      'A': 93,
      'EC+B+': 7
    },
    111: {
      'A': 94,
      'EC+B+': 6
    },
    112: {
      'A': 98,
      'EC+B+': 2
    },
    113: {
      'EC+B+': 56,
      'A': 44
    },
    114: {
      'A': 57,
      'EC+B+': 43
    },
    115: {
      'EC+B+': 92.5,
      'A': 7.5
    },
    116: {
      'EC+B+': 88.9,
      'A': 11.1
    },
    117: {
      'EC+B+': 98.87,
      'A': 1.13
    },
    118: {
      'EC+B+': 98.08,
      'A': 1.92
    },
    119: {
      'EC+B+': 99.89,
      'A': 0.11
    },
    120: {
      'EC+B+': 99.33,
      'A': 0.67
    },
    121: {
      'EC+B+': 99.96,
      'A': 0.04
    },
    122: {
      'EC+B+': 94.55,
      'A': 5.45
    },
    123: {
      'EC+B+': 99.979,
      'A': 0.021
    },
    124: {
      'A': 99.996,
      'EC+B+': 0.004
    },
    125: {
      'A': 99.546,
      'EC+B+': 0.454
    },
    126: {
      'A': 100
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 99.99977,
      'B-': 0.00023
    },
    132: {
      'A': 100
    },
    133: {
      'A': 95,
      'B-': 5
    },
    134: {
      'A': 99.98,
      'B-': 0.02
    },
    135: {
      'B-': 71.8,
      'A': 28.2
    },
    136: {
      'B-': null
    },
    137: {
      'B-': 100
    },
    138: null,
    139: {
      'B-': null
    },
    140: {
      'B-': null
    },
    141: {
      'B-': null
    },
    142: {
      'B-': null
    },
    143: {
      'B-': null
    }
  },
  85: {
    106: {
      'A': 100
    },
    107: {
      'A': 100
    },
    108: {
      'A': 100
    },
    109: {
      'A': 100,
      'ECF': 0.8,
      'EC+B+': null
    },
    110: {
      'A': 100
    },
    111: {
      'A': 95.1,
      'EC+B+': 4.9
    },
    112: {
      'A': 96.1,
      'EC+B+': 3.9
    },
    113: {
      'A': 90,
      'EC+B+': 10
    },
    114: {
      'A': 90,
      'EC+B+': 10
    },
    115: {
      'A': 52,
      'EC+B+': 48
    },
    116: {
      'A': 71,
      'EC+B+': 29
    },
    117: {
      'EC+B+': 63,
      'A': 37
    },
    118: {
      'EC+B+': 69,
      'A': 31
    },
    119: {
      'EC+B+': 96.09,
      'A': 3.91
    },
    120: {
      'EC+B+': 90,
      'A': 10
    },
    121: {
      'EC+B+': 99.1,
      'A': 0.9
    },
    122: {
      'EC+B+': 91.4,
      'A': 8.6
    },
    123: {
      'EC+B+': 99.45,
      'A': 0.55
    },
    124: {
      'EC+B+': 95.9,
      'A': 4.1
    },
    125: {
      'EC+B+': 99.825,
      'A': 0.175
    },
    126: {
      'EC': 58.2,
      'A': 41.8
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100,
      'B-': 0.006,
      'EC': 0.0000003
    },
    132: {
      'A': 99.993,
      'B-': 0.007
    },
    133: {
      'A': 99.95,
      'B-': 0.05
    },
    134: {
      'A': 93.6,
      'B-': 6.4
    },
    135: {
      'B-': 92,
      'A': 8
    },
    136: {
      'B-': 100
    },
    137: {
      'B-': 100
    },
    138: {
      'B-': 100
    },
    139: {
      'B-': null
    },
    140: {
      'B-': null
    },
    141: {
      'B-': null
    },
    142: {
      'B-': null,
      'B-N': null
    },
    143: {
      'B-': null
    },
    144: {
      'B-': null,
      'B-N': null
    }
  },
  86: {
    107: {
      'A': 100
    },
    108: {
      'A': 100
    },
    109: {
      'A': 100
    },
    110: {
      'A': 99.9,
      'EC+B+': 0.06
    },
    111: {
      'A': 100
    },
    112: {
      'EC+B+': null,
      'A': null
    },
    113: {
      'A': 94,
      'EC+B+': 6
    },
    114: {
      'A': 86,
      'EC+B+': 14
    },
    115: {
      'EC+B+': null,
      'A': null
    },
    116: {
      'A': 78,
      'EC+B+': 22
    },
    117: {
      'A': 66,
      'EC+B+': 34
    },
    118: {
      'A': 72.4,
      'EC+B+': 27.6
    },
    119: {
      'EC+B+': 75.4,
      'A': 24.6
    },
    120: {
      'A': 62,
      'EC+B+': 38
    },
    121: {
      'EC+B+': 79,
      'A': 21
    },
    122: {
      'A': 62,
      'EC+B+': 38
    },
    123: {
      'EC+B+': 83,
      'A': 17
    },
    124: {
      'A': 96,
      'EC+B+': 4
    },
    125: {
      'EC': 72.6,
      'A': 27.4
    },
    126: {
      'A': 100
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100
    },
    132: {
      'A': 100
    },
    133: {
      'A': 100
    },
    134: {
      'A': 100
    },
    135: {
      'B-': 78,
      'A': 22
    },
    136: {
      'A': 100
    },
    137: {
      'B-': 100
    },
    138: {
      'B-': 100
    },
    139: {
      'B-': 100
    },
    140: {
      'B-': 100
    },
    141: {
      'B-': 100
    },
    142: {
      'B-': 100
    },
    143: {
      'B-': 100
    }
  },
  87: {
    110: {
      'A': 100
    },
    111: {
      'A': 100
    },
    112: {
      'A': 0,
      'EC+B+': null
    },
    113: {
      'A': 100
    },
    114: {
      'A': 100
    },
    115: {
      'A': 100
    },
    116: {
      'A': 100
    },
    117: {
      'A': 92,
      'EC+B+': 8
    },
    118: {
      'A': 98.5,
      'EC+B+': 1.5
    },
    119: {
      'A': 84,
      'EC': 16
    },
    120: {
      'A': 95,
      'EC+B+': 5
    },
    121: {
      'A': 89,
      'EC+B+': 11
    },
    122: {
      'A': 89,
      'EC+B+': 11
    },
    123: {
      'A': 60,
      'EC+B+': 40
    },
    124: {
      'A': 80,
      'EC': 20
    },
    125: {
      'EC+B+': 57,
      'A': 43
    },
    126: {
      'A': 99.44,
      'EC+B+': 0.56
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100,
      'EC': 0.0000002
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100
    },
    132: {
      'A': 100
    },
    133: {
      'A': 99.65,
      'B-': 0.35
    },
    134: {
      'A': 100,
      'B-': 0.1
    },
    135: {
      'B-': 100
    },
    136: {
      'B-': 99.994,
      'A': 0.006
    },
    137: {
      'B-': 100
    },
    138: {
      'B-': 100
    },
    139: {
      'B-': 100
    },
    140: {
      'B-': 100
    },
    141: {
      'B-': 100
    },
    142: {
      'B-': 100
    },
    143: {
      'B-': 100
    },
    144: {
      'B-': 100
    },
    145: {
      'B-': 100
    },
    146: {
      'B-': 100,
      'B-N': null
    }
  },
  88: {
    113: {
      'A': 100,
      'EC+B+': null
    },
    114: {
      'A': 100
    },
    115: {
      'A': 100
    },
    116: {
      'A': 100
    },
    117: {
      'A': 100
    },
    118: {
      'A': 100
    },
    119: {
      'A': 86,
      'EC+B+': 14
    },
    120: {
      'A': 95,
      'EC+B+': 5
    },
    121: {
      'A': 100
    },
    122: {
      'A': 96,
      'EC+B+': 4
    },
    123: {
      'A': 93,
      'EC+B+': 7
    },
    124: {
      'A': 85,
      'EC+B+': 15
    },
    125: {
      'A': 80,
      'EC+B+': 20
    },
    126: {
      'A': 99.941,
      'EC': 0.059
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100,
      'EC': 0.00000001
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100
    },
    132: {
      'A': 100
    },
    133: {
      'A': 100
    },
    134: {
      'A': 100,
      '14C': 0.00000003
    },
    135: {
      'A': 100,
      '14C': 0.000000089
      // '14C': 0.000000077 // TODO: how to handle two of the same decay?
    },

    136: {
      'A': 100,
      '14C': 0.000000004
    },
    137: {
      'B-': 100,
      'A': 0.026
    },
    138: {
      'A': 100,
      '14C': 3.20E-09
    },
    139: {
      'B-': 100
    },
    140: {
      'B-': 100
    },
    141: {
      'B-': 100,
      'A': 100
    },
    142: {
      'B-': 100
    },
    143: {
      'B-': 100
    },
    144: {
      'B-': 100
    },
    145: {
      'B-': 100
    },
    146: {
      'B-': 100
    }
  },
  89: {
    116: {
      'A': 100
    },
    117: {
      'A': 100
    },
    118: {
      'A': 100
    },
    119: {
      'A': 99,
      'EC': 1
    },
    120: {
      'A': 100
    },
    121: {
      'A': 100,
      'EC+B+': null
    },
    122: {
      'A': 100,
      'EC+B+': 0.2
    },
    123: {
      'A': 95,
      'EC+B+': 5
    },
    124: {
      'A': 100
    },
    125: {
      'A': 89,
      'EC': 11
    },
    126: {
      'A': 99.91,
      'EC+B+': 0.09
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100,
      'EC+B+': 2
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100,
      'EC': 0.0005
    },
    132: {
      'A': 100
    },
    133: {
      'A': 99,
      'EC+B+': 1
    },
    134: {
      'A': 99,
      'EC': 1
    },
    135: {
      'EC': 90.9,
      'A': 9.1
    },
    136: {
      'A': 100,
      '14C': 5.30E-10
    },
    137: {
      'B-': 83,
      'EC': 17,
      'A': 0.006
    },
    138: {
      'B-': 98.62,
      'A': 1.38
    },
    139: {
      'B-': 100
    },
    140: {
      'B-': 100
    },
    141: {
      'B-': 100,
      'B-F': 0.0000012
    },
    142: {
      'B-': 100
    },
    143: {
      'B-': 100
    },
    144: {
      'B-': 100
    },
    145: {
      'B-': 100
    },
    146: null
  },
  90: {
    118: {
      'A': 100
    },
    119: {
      'A': 100
    },
    120: {
      'A': 100,
      'EC+B+': null
    },
    121: {
      'EC+B+': null,
      'A': null
    },
    122: {
      'A': 100
    },
    123: {
      'A': 100
    },
    124: {
      'A': 100
    },
    125: {
      'A': 100
    },
    126: {
      'A': 100,
      'EC+B+': 0.01
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100,
      'EC': 0.0000002
    },
    131: {
      'A': 100
    },
    132: {
      'A': 100
    },
    133: {
      'A': 100
    },
    134: {
      'A': 100
    },
    135: {
      'A': 90,
      'EC': 10
    },
    136: {
      'A': 100
    },
    137: {
      'A': 100
    },
    138: {
      'A': 100
    },
    139: {
      'A': 100
    },
    140: {
      'A': 100,
      '24NE': 5.80E-11,
      'SF': 4.00E-12
    },
    141: {
      'B-': 100,
      'A': 4.00E-11
    },
    142: {
      'A': 100,
      'SF': 1.10E-09
    },
    143: {
      'B-': 100
    },
    144: {
      'B-': 100
    },
    145: {
      'B-': 100
    },
    146: {
      'B-': 100
    }
  },
  91: {
    120: {
      'P': null,
      'A': null,
      'EC+B+': null
    },
    121: {
      'A': 100
    },
    122: {
      'A': 100
    },
    123: {
      'A': 100
    },
    124: {
      'A': 100
    },
    125: {
      'A': 98,
      'EC': 2
    },
    126: {
      'A': 100
    },
    127: {
      'A': 100
    },
    128: {
      'A': 100
    },
    129: {
      'A': 100,
      'EC+B+': 0.0000003
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100
    },
    132: {
      'A': 100
    },
    133: {
      'A': 100
    },
    134: {
      'A': 100
    },
    135: {
      'A': 74,
      'EC+B+': 26
    },
    136: {
      'A': 85,
      'EC': 15
    },
    137: {
      'EC+B+': 98.15,
      'A': 1.85
    },
    138: {
      'EC': 99.52,
      'A': 0.48
    },
    139: {
      'EC+B+': 92.2,
      'B-': 7.8,
      'A': 0.0032
    },
    140: {
      'A': 100,
      'SF': 3.00E-10
    },
    141: {
      'B-': 100,
      'EC': null
    },
    142: {
      'B-': 100
    },
    143: {
      'B-': 100
    },
    144: {
      'B-': 100
    },
    145: {
      'B-': 100,
      '|b{+-}fission': 0.00000006
    },
    146: {
      'B-': 100
    }
  },
  92: {
    122: {
      'A': 100
    },
    123: {
      'A': 0,
      'EC+B+': null
    },
    124: {
      'A': 100
    },
    125: {
      'A': 100,
      'EC+B+': null
    },
    126: {
      'A': 100
    },
    127: {
      'A': 100
    },
    129: {
      'A': 100
    },
    130: {
      'A': 100
    },
    131: {
      'A': 100,
      'EC+B+': 0.2
    },
    132: {
      'A': 100
    },
    133: {
      'A': 100
    },
    134: {
      'A': 100
    },
    135: {
      'A': 100
    },
    136: {
      'A': 95,
      'EC': 5
    },
    137: {
      'EC': 80,
      'A': 20
    },
    138: {
      'A': 100,
      '{+22}Ne': 4.80E-12
    },
    139: {
      'EC': 100,
      'A': 0.004
    },
    140: {
      'A': 100,
      '{+24}Ne': 8.90E-10,
      'SF': 2.70E-12
    },
    141: {
      'A': 100,
      '24NE': 7.20E-11,
      'SF': 6.00E-11
    },
    142: {
      'A': 100,
      'SF': 1.64E-09,
      'Mg': 1.40E-11
    },
    143: {
      'A': 100,
      'SF': 0.000000007,
      '{+25}Ne': 8.00E-10
    },
    144: {
      'A': 100,
      'SF': 0.000000094
    },
    145: {
      'B-': 100
    },
    146: {
      'A': 100,
      'SF': 0.0000545
    }
  }
};
/* eslint-enable quote-props */

// Table which contains information about various attributes of isotopes.  This data was obtained from the National
// Institute of Standards and Technology (NIST) at the URL
//
// http://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=&ascii=html&isotype=some
//
// ...though manual post-processing was necessary to remove data and get it into the format below.  This table only
// contains isotope data for the first eighteen elemtns.  The original csv of this data can be found in
// buildanatom/model/AtomIdentifier.java.
//
// This table has the following format:
// keys of type atomic number
//  subkeys of type mass number
//    subkeys of type atomicMass and abundance, which hold the values for each isotope.
const ISOTOPE_INFO_TABLE = {
  1: {
    // atomic number
    1: {
      // massNumber
      atomicMass: 1.00782503207,
      abundance: 0.999885
    },
    2: {
      atomicMass: 2.0141017778,
      abundance: 0.000115
    },
    3: {
      atomicMass: 3.0160492777,
      // Use trace abundance, since Wikipedia just says "trace" and the NIST table contained it but didn't state
      // abundance.
      abundance: TRACE_ABUNDANCE
    }
  },
  2: {
    3: {
      atomicMass: 3.0160293191,
      abundance: 0.00000134
    },
    4: {
      atomicMass: 4.00260325415,
      abundance: 0.99999866
    }
  },
  3: {
    6: {
      atomicMass: 6.015122795,
      abundance: 0.0759
    },
    7: {
      atomicMass: 7.01600455,
      abundance: 0.9241
    }
  },
  4: {
    7: {
      atomicMass: 7.016929828,
      abundance: TRACE_ABUNDANCE
    },
    9: {
      atomicMass: 9.0121822,
      abundance: 1.0000
    },
    10: {
      atomicMass: 10.013533818,
      abundance: TRACE_ABUNDANCE
    }
  },
  5: {
    10: {
      atomicMass: 10.0129370,
      abundance: 0.199
    },
    11: {
      atomicMass: 11.0093054,
      abundance: 0.801
    }
  },
  6: {
    12: {
      atomicMass: 12.0000000,
      abundance: 0.9893
    },
    13: {
      atomicMass: 13.0033548378,
      abundance: 0.0107
    },
    14: {
      atomicMass: 14.003241989,
      // Use trace abundance, since Wikipedia just says "trace" and the NIST table contained it but didn't state
      // abundance.
      abundance: TRACE_ABUNDANCE
    }
  },
  7: {
    14: {
      atomicMass: 14.0030740048,
      abundance: 0.99636
    },
    15: {
      atomicMass: 15.0001088982,
      abundance: 0.00364
    }
  },
  8: {
    16: {
      atomicMass: 15.99491461956,
      abundance: 0.99757
    },
    17: {
      atomicMass: 16.99913170,
      abundance: 0.00038
    },
    18: {
      atomicMass: 17.9991610,
      abundance: 0.00205
    }
  },
  9: {
    18: {
      atomicMass: 18.0009380,
      abundance: TRACE_ABUNDANCE
    },
    19: {
      atomicMass: 18.99840322,
      abundance: 1.0000
    }
  },
  10: {
    20: {
      atomicMass: 19.9924401754,
      abundance: 0.9048
    },
    21: {
      atomicMass: 20.99384668,
      abundance: 0.0027
    },
    22: {
      atomicMass: 21.991385114,
      abundance: 0.0925
    }
  },
  11: {
    23: {
      atomicMass: 22.9897692809,
      abundance: 1.0000
    }
  },
  12: {
    24: {
      atomicMass: 23.985041700,
      abundance: 0.7899
    },
    25: {
      atomicMass: 24.98583692,
      abundance: 0.1000
    },
    26: {
      atomicMass: 25.982592929,
      abundance: 0.1101
    }
  },
  13: {
    27: {
      atomicMass: 26.98153863,
      abundance: 1.0000
    }
  },
  14: {
    28: {
      atomicMass: 27.9769265325,
      abundance: 0.92223
    },
    29: {
      atomicMass: 28.976494700,
      abundance: 0.04685
    },
    30: {
      atomicMass: 29.97377017,
      abundance: 0.03092
    }
  },
  15: {
    31: {
      atomicMass: 30.97376163,
      abundance: 1.0000
    }
  },
  16: {
    32: {
      atomicMass: 31.97207100,
      abundance: 0.9499
    },
    33: {
      atomicMass: 32.97145876,
      abundance: 0.0075
    },
    34: {
      atomicMass: 33.96786690,
      abundance: 0.0425
    },
    36: {
      atomicMass: 35.96708076,
      abundance: 0.0001
    }
  },
  17: {
    35: {
      atomicMass: 34.96885268,
      abundance: 0.7576
    },
    37: {
      atomicMass: 36.96590259,
      abundance: 0.2424
    }
  },
  18: {
    36: {
      atomicMass: 35.967545106,
      abundance: 0.003365
    },
    38: {
      atomicMass: 37.9627324,
      abundance: 0.000632
    },
    40: {
      atomicMass: 39.9623831225,
      abundance: 0.996003
    }
  }
};

// Table which maps atomic numbers to standard atomic mass (a.k.a. standard atomic weight).  This was obtained from
// the URL below and subsequently post-processed to remove unneeded data:
//
// http://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=&ascii=ascii2&isotype=some
const standardMassTable = [0,
// 0, NO ELEMENT
1.00794,
// 1, HYDROGEN
4.002602,
// 2, HELIUM
6.941,
// 3, LITHIUM
9.012182,
// 4, BERYLLIUM
10.811,
// 5, BORON
12.0107,
// 6, CARBON
14.0067,
// 7, NITROGEN
15.9994,
// 8, OXYGEN
18.9984032,
// 9, FLUORINE
20.1797,
// 10, NEON
22.98976928,
// 11, SODIUM
24.3050,
// 12, MAGNESIUM
26.9815386,
// 13, ALUMINUM
28.0855,
// 14, SILICON
30.973762,
// 15, PHOSPHORUS
32.065,
// 16, SULFUR
35.453,
// 17, CHLORINE
39.948,
// 18, ARGON
39.0983,
// 19, POTASSIUM
40.078,
// 20, CALCIUM
44.955912,
// 21, SCANDIUM
47.867,
// 22, TITANIUM
50.9415,
// 23, VANADIUM
51.9961,
// 24, CHROMIUM
54.938045,
// 25, MANGANESE
55.845,
// 26, IRON
58.933195,
// 27, COBALT
58.6934,
// 28, NICKEL
63.546,
// 29, COPPER
65.38,
// 30, ZINC
69.723,
// 31, GALLIUM
72.64,
// 32, GERMANIUM
74.9216,
// 33, ARSENIC
78.96,
// 34, SELENIUM
79.904,
// 35, BROMINE
83.798,
// 36, KRYPTON
85.4678,
// 37, RUBIDIUM
87.62,
// 38, STRONTIUM
88.90585,
// 39, YTTRIUM
91.224,
// 40, ZIRCONIUM
92.90638,
// 41, NIOBIUM
95.96,
// 42, MOLYBDENUM
98,
// 43, TECHNETIUM
101.07,
// 44, RUTHENIUM
102.9055,
// 45, RHODIUM
106.42,
// 46, PALLADIUM
107.8682,
// 47, SILVER
112.411,
// 48, CADMIUM
114.818,
// 49, INDIUM
118.71,
// 50, TIN
121.76,
// 51, ANTIMONY
127.6,
// 52, TELLURIUM
126.90447,
// 53, IODINE
131.293,
// 54, XENON
132.9054519,
// 55, CAESIUM
137.327,
// 56, BARIUM
138.90547,
// 57, LANTHANUM
140.116,
// 58, CERIUM
140.90765,
// 59, PRASEODYMIUM
144.242,
// 60, NEODYMIUM
145,
// 61, PROMETHIUM
150.36,
// 62, SAMARIUM
151.964,
// 63, EUROPIUM
157.25,
// 64, GADOLINIUM
158.92535,
// 65, TERBIUM
162.5,
// 66, DYSPROSIUM
164.93032,
// 67, HOLMIUM
167.259,
// 68, ERBIUM
168.93421,
// 69, THULIUM
173.054,
// 70, YTTERBIUM
174.9668,
// 71, LUTETIUM
178.49,
// 72, HAFNIUM
180.94788,
// 73, TANTALUM
183.84,
// 74, TUNGSTEN
186.207,
// 75, RHENIUM
190.23,
// 76, OSMIUM
192.217,
// 77, IRIDIUM
195.084,
// 78, PLATINUM
196.966569,
// 79, GOLD
200.59,
// 80, MERCURY
204.3833,
// 81, THALLIUM
207.2,
// 82, LEAD
208.9804 // 83, BISMUTH
];

// HalfLifeConstants is an object with the half-life constants of unstable nuclides. If the half-life of an unstable
// nuclide is unknown, null is set as a placeholder. The half-life is in seconds and some numbers are in scientific
// notation. The data was obtained from the Nuclear Data Services (NDS) of the International Atomic Energy Agency (IAEA)
// at the url https://www-nds.iaea.org/relnsd/NdsEnsdf/QueryForm.html.
//
// The object is first indexed by the proton number, and then by the neutron number. For example, a nuclide with 1 proton
// and 4 neutrons ( HalfLifeConstants[ 1 ][ 4 ] ) would have a half-life of 8.60826E-23 seconds.
const HalfLifeConstants = {
  0: {
    0: null,
    // a placeholder to allow a nuclide with 0 protons and 0 neutrons to exist as a base case
    1: 613.9,
    4: 1.75476E-22,
    6: null
  },
  1: {
    2: 388781328,
    3: null,
    4: 8.60826E-23,
    5: 2.94347E-22,
    6: 5.06931E-21
  },
  2: {
    3: 7.04071E-22,
    4: 0.8067,
    5: 3.04158E-21,
    6: 0.1191,
    7: null,
    8: 1.52079E-21
  },
  3: {
    1: null,
    2: 3.70925E-22,
    5: 0.8399,
    6: 0.1783,
    7: null,
    8: 0.00875,
    9: null
  },
  4: {
    2: 4.95911E-21,
    3: 4598208,
    4: 8.19098E-17,
    6: 4.7651E+13,
    7: 13.76,
    8: 0.02146,
    9: 2.7E-21,
    10: 0.00435,
    11: 7.86617E-22,
    12: 5.70297E-22
  },
  5: {
    2: 5.69585E-22,
    3: 0.77,
    4: 8.44885E-19,
    7: 0.0202,
    8: 0.01733,
    9: 0.0125,
    10: 0.00993,
    11: 4.56238E-21,
    12: 0.00508,
    13: null,
    14: 0.00292,
    15: 9.12475E-22,
    16: 7.60396E-22
  },
  6: {
    2: 3.50952E-21,
    3: 0.1265,
    4: 19.29,
    5: 1221.84,
    8: 1.79874E+11,
    9: 2.449,
    10: 0.747,
    11: 0.193,
    12: 0.092,
    13: 0.0463,
    14: 0.0163,
    16: 0.0061
  },
  7: {
    3: 1.82495E-22,
    4: 5.49684E-22,
    5: 0.011,
    6: 597.9,
    9: 7.13,
    10: 4.173,
    11: 0.619,
    12: 0.336,
    13: 0.1344,
    14: 0.084,
    15: 0.023,
    16: 0.0141,
    17: 0.000000052
  },
  8: {
    3: 3.50952E-22,
    4: 6.33663E-21,
    5: 0.00858,
    6: 70.606,
    7: 122.24,
    11: 26.88,
    12: 13.51,
    13: 3.42,
    14: 2.25,
    15: 0.097,
    16: 0.065,
    18: 4.5E-12
  },
  9: {
    4: 4.51721E-22,
    5: 5.0136E-22,
    6: 6.91269E-22,
    7: 1.14059E-20,
    8: 64.49,
    9: 6586.2,
    11: 11.07,
    12: 4.158,
    13: 4.23,
    14: 2.23,
    15: 0.39,
    16: 0.08,
    17: 0.0082,
    18: 0.005,
    19: 4.6E-20,
    20: 0.0025,
    21: null,
    22: 0.00000026
  },
  10: {
    5: 7.73284E-22,
    6: 5.70297E-21,
    7: 0.1092,
    8: 1.672,
    9: 17.22,
    13: 37.25,
    14: 202.8,
    15: 0.602,
    16: 0.197,
    17: 0.0315,
    18: 0.02,
    19: 0.015,
    20: 0.0073,
    21: 0.0034,
    22: 0.0035,
    23: 0.00000018,
    24: 0.00000006
  },
  11: {
    6: null,
    7: 2.28119E-21,
    8: 1.14059E-20,
    9: 0.4479,
    10: 22.49,
    11: 82104810,
    13: 53989.2,
    14: 59.1,
    15: 1.07128,
    16: 0.301,
    17: 0.0305,
    18: 0.0441,
    19: 0.048,
    20: 0.01735,
    21: 0.0132,
    22: 0.008,
    23: 0.0055,
    24: 0.0018,
    25: 0.00000018,
    26: 0.00000006
  },
  12: {
    7: 4.00209E-12,
    8: 0.0904,
    9: 0.122,
    10: 3.8755,
    11: 11.3046,
    15: 567.48,
    16: 75294,
    17: 1.3,
    18: 0.335,
    19: 0.236,
    20: 0.086,
    21: 0.0905,
    22: 0.02,
    23: 0.0113,
    24: 0.0076,
    25: 0.008,
    26: null,
    27: 0.00000018,
    28: null
  },
  13: {
    8: 0.000000035,
    9: 0.0911,
    10: 0.446,
    11: 2.053,
    12: 7.183,
    13: 2.26263E+13,
    15: 134.7,
    16: 393.6,
    17: 3.62,
    18: 0.644,
    19: 0.033,
    20: 0.0417,
    21: 0.0563,
    22: 0.0383,
    23: 0.09,
    24: 0.0107,
    25: 0.009,
    26: 0.0076,
    27: 0.00000026,
    28: null,
    29: 0.00000017,
    30: 0.00000017
  },
  14: {
    8: 0.029,
    9: 0.0423,
    10: 0.14,
    11: 0.22,
    12: 2.2453,
    13: 4.15,
    17: 9441.6,
    18: 4954437378,
    19: 6.11,
    20: 2.77,
    21: 0.78,
    22: 0.45,
    23: 0.09,
    24: 0.063,
    25: 0.0475,
    26: 0.033,
    27: 0.02,
    28: 0.0125,
    29: 0.00000006,
    30: 0.00000036
  },
  15: {
    10: 0.00000003,
    11: 0.0437,
    12: 0.26,
    13: 0.2703,
    14: 4.142,
    15: 149.88,
    17: 1232755.2,
    18: 2190240,
    19: 12.43,
    20: 47.3,
    21: 5.6,
    22: 2.31,
    23: 0.64,
    24: 0.28,
    25: 0.15,
    26: 0.101,
    27: 0.0485,
    28: 0.0365,
    29: 0.0185,
    30: 0.0000002,
    31: null
  },
  16: {
    10: 0.000000079,
    11: 0.0155,
    12: 0.125,
    13: 0.188,
    14: 1.178,
    15: 2.5534,
    19: 7548768,
    21: 303,
    22: 10218,
    23: 11.5,
    24: 8.8,
    25: 1.99,
    26: 1.016,
    27: 0.265,
    28: 0.1,
    29: 0.068,
    30: 0.05,
    32: 0.0000002
  },
  17: {
    12: 0.00000002,
    13: 0.00000003,
    14: 0.19,
    15: 0.298,
    16: 2.511,
    17: 1.5266,
    19: 9.5081E+12,
    21: 2233.8,
    22: 3372,
    23: 81,
    24: 38.4,
    25: 6.8,
    26: 3.13,
    27: 0.56,
    28: 0.413,
    29: 0.232,
    30: 0.101,
    31: 0.0000002,
    32: 0.00000017,
    33: null,
    34: null,
    35: null
  },
  18: {
    12: 1E-11,
    13: 0.0144,
    14: 0.098,
    15: 0.173,
    16: 0.8438,
    17: 1.7756,
    19: 3024950.4,
    21: 8457256161,
    23: 6576.6,
    24: 1038222865,
    25: 322.2,
    26: 712.2,
    27: 21.48,
    28: 8.4,
    29: 1.23,
    30: 0.475,
    31: 0.17,
    32: 0.106,
    33: null,
    34: null,
    35: 0.00000062
  },
  19: {
    14: 0.000000025,
    15: 0.000000025,
    16: 0.178,
    17: 0.341,
    18: 1.225,
    19: 459.06,
    21: 3.9383E+16,
    23: 44478,
    24: 80280,
    25: 1327.8,
    26: 1068.6,
    27: 105,
    28: 17.5,
    29: 6.8,
    30: 1.26,
    31: 0.472,
    32: 0.365,
    33: 0.11,
    34: 0.03,
    35: 0.01,
    36: 0.00000036,
    37: 0.00000062
  },
  20: {
    14: 0.000000035,
    15: 0.0257,
    16: 0.1012,
    17: 0.1811,
    18: 0.44376,
    19: 0.8603,
    21: 3.13676E+12,
    25: 14049504,
    27: 391910.4,
    28: 5.99582E+26,
    29: 523.08,
    30: 13.45,
    31: 10,
    32: 4.6,
    33: 0.461,
    34: 0.107,
    35: 0.022,
    36: 0.011,
    37: 0.00000062,
    38: 0.00000062
  },
  21: {
    17: null,
    18: 0.0000003,
    19: 0.1823,
    20: 0.5963,
    21: 0.68079,
    22: 14007.6,
    23: 14292,
    25: 7239456,
    26: 289370.88,
    27: 157212,
    28: 3430.8,
    29: 102.5,
    30: 12.4,
    31: 8.2,
    32: 2.6,
    33: 0.526,
    34: 0.105,
    35: 0.026,
    36: 0.013,
    37: 0.012,
    38: null,
    40: null
  },
  22: {
    16: 0.00000012,
    17: 0.0285,
    18: 0.0524,
    19: 0.0819,
    20: 0.20865,
    21: 0.509,
    22: 1865014325,
    23: 11088,
    29: 345.6,
    30: 102,
    31: 32.7,
    32: 2.1,
    33: 1.3,
    34: 0.2,
    35: 0.098,
    36: 0.058,
    37: 0.0285,
    38: 0.022,
    39: 0.015,
    40: 0.00000062,
    41: 0.00000036,
    42: 0.00000062
  },
  23: {
    19: 0.000000055,
    20: 0.0793,
    21: 0.111,
    22: 0.547,
    23: 0.4225,
    24: 1956,
    25: 1380110.4,
    26: 28512000,
    27: 8.36259E+24,
    29: 224.58,
    30: 92.58,
    31: 49.8,
    32: 6.54,
    33: 0.216,
    34: 0.32,
    35: 0.191,
    36: 0.097,
    37: 0.122,
    38: 0.0483,
    39: 0.0336,
    40: 0.017,
    41: 0.015,
    42: 0.00000036,
    43: 0.00000036,
    44: 0.00000062
  },
  24: {
    18: 0.0133,
    19: 0.0212,
    20: 0.0428,
    21: 0.0609,
    22: 0.26,
    23: 0.5,
    24: 77616,
    25: 2538,
    26: 4.1024E+25,
    27: 2393625.6,
    31: 209.82,
    32: 356.4,
    33: 21.1,
    34: 7,
    35: 0.74,
    36: 0.49,
    37: 0.234,
    38: 0.206,
    39: 0.129,
    40: 0.043,
    41: 0.027,
    42: 0.024,
    44: 0.00000036,
    45: 0.00000062,
    46: 0.00000062
  },
  25: {
    19: 0.000000105,
    20: null,
    21: 0.0362,
    22: 0.1,
    23: 0.1581,
    24: 0.382,
    25: 0.28319,
    26: 2772,
    27: 483062.4,
    28: 1.16761E+14,
    29: 26974080,
    31: 9284.04,
    32: 85.4,
    33: 3,
    34: 4.59,
    35: 0.28,
    36: 0.709,
    37: 0.092,
    38: 0.275,
    39: 0.09,
    40: 0.092,
    41: 0.065,
    42: 0.047,
    43: 0.028,
    44: 0.016,
    45: 0.0199,
    46: 0.000000637,
    47: 0.00000062,
    48: null
  },
  26: {
    19: 0.00189,
    20: 0.013,
    21: 0.0218,
    22: 0.044,
    23: 0.0647,
    24: 0.152,
    25: 0.305,
    26: 29790,
    27: 510.6,
    29: 86592204.87,
    33: 3843936,
    34: 8.26791E+13,
    35: 358.8,
    36: 68,
    37: 6.1,
    38: 2,
    39: 0.81,
    40: 0.44,
    41: 0.6,
    42: 0.188,
    43: 0.11,
    44: 0.065,
    45: 0.028,
    46: 0.00000015,
    47: 0.0129,
    48: 0.0082,
    49: 0.00000062
  },
  27: {
    23: 0.0388,
    24: 0.0688,
    25: 0.104,
    26: 0.24,
    27: 0.19328,
    28: 63108,
    29: 6673190.4,
    30: 23478336,
    31: 6122304,
    33: 166344192,
    34: 5936.4,
    35: 92.4,
    36: 27.4,
    37: 0.3,
    38: 1.16,
    39: 0.2,
    40: 0.425,
    41: 0.2,
    42: 0.227,
    43: 0.112,
    44: 0.08,
    45: 0.0599,
    46: 0.0407,
    47: 0.0313,
    48: 0.03,
    49: 0.0217,
    50: 0.013
  },
  28: {
    20: 0.0021,
    21: 0.0075,
    22: 0.0185,
    23: 0.0238,
    24: 0.0408,
    25: 0.0552,
    26: 0.1142,
    27: 0.2047,
    28: 524880,
    29: 128160,
    31: 2.39833E+12,
    35: 3193560909,
    37: 9063,
    38: 196560,
    39: 21,
    40: 29,
    41: 11.4,
    42: 6,
    43: 2.56,
    44: 1.57,
    45: 0.84,
    46: 0.5077,
    47: 0.344,
    48: 0.238,
    49: 0.1589,
    50: 0.11,
    51: 0.043,
    52: 0.024,
    54: null
  },
  29: {
    24: 0.00000013,
    25: 0.000000075,
    26: 0.04,
    27: 0.093,
    28: 0.1963,
    29: 3.204,
    30: 81.5,
    31: 1422,
    32: 12020.4,
    33: 580.2,
    35: 45723.6,
    37: 307.2,
    38: 222588,
    39: 30.9,
    40: 171,
    41: 44.5,
    42: 19.4,
    43: 6.63,
    44: 4.2,
    45: 1.63,
    46: 1.224,
    47: 0.641,
    48: 0.4698,
    49: 0.335,
    50: 0.241,
    51: 0.1136,
    52: 0.0732,
    53: 0.033
  },
  30: {
    24: 0.00159,
    25: 0.02,
    26: 0.03,
    27: 0.04,
    28: 0.0867,
    29: 0.1786,
    30: 142.8,
    31: 89.1,
    32: 33094.8,
    33: 2308.2,
    35: 21075552,
    39: 3384,
    40: 1.19916E+26,
    41: 147,
    42: 167400,
    43: 24.5,
    44: 95.6,
    45: 10.2,
    46: 5.7,
    47: 2.08,
    48: 1.47,
    49: 0.746,
    50: 0.5619,
    51: 0.32,
    52: 0.166,
    53: 0.117,
    54: 0.000000633,
    55: 0.000000637
  },
  31: {
    28: 0.000000043,
    29: 0.07,
    30: 0.167,
    31: 0.116121,
    32: 32.4,
    33: 157.62,
    34: 912,
    35: 34164,
    36: 281810.88,
    37: 4062.6,
    39: 1268.4,
    41: 50760,
    42: 17496,
    43: 487.2,
    44: 126,
    45: 32.6,
    46: 13.2,
    47: 5.09,
    48: 2.848,
    49: 1.9,
    50: 1.217,
    51: 0.6,
    52: 0.3081,
    53: 0.085,
    54: 0.092,
    55: 0.043,
    56: 0.000000634
  },
  32: {
    27: 0.0133,
    28: 0.00000011,
    29: 0.044,
    30: 0.129,
    31: 0.15,
    32: 63.7,
    33: 30.9,
    34: 8136,
    35: 1134,
    36: 23408352,
    37: 140580,
    39: 987552,
    43: 4966.8,
    45: 40359.6,
    46: 5280,
    47: 18.98,
    48: 29.5,
    49: 7.6,
    50: 4,
    51: 1.85,
    52: 0.954,
    53: 0.503,
    54: 0.226,
    55: 0.14,
    56: 0.0000003,
    57: 0.0000003,
    58: null
  },
  33: {
    30: 0.000000043,
    31: 0.018,
    32: 0.128,
    33: 0.09577,
    34: 42.5,
    35: 151.6,
    36: 912,
    37: 3156,
    38: 235080,
    39: 93600,
    40: 6937920,
    41: 1535328,
    43: 94464,
    44: 139644,
    45: 5442,
    46: 540.6,
    47: 15.2,
    48: 33.3,
    49: 19.1,
    50: 13.4,
    51: 4.2,
    52: 2.021,
    53: 0.945,
    54: 0.484,
    55: 0.2,
    56: 0.0000003,
    57: null,
    58: null,
    59: null
  },
  34: {
    30: 0.00000018,
    31: 0.033,
    32: 0.042,
    33: 0.136,
    34: 35.5,
    35: 27.4,
    36: 2466,
    37: 284.4,
    38: 725760,
    39: 25740,
    41: 10348992,
    45: 1.03191E+13,
    47: 1107,
    48: 3.02946E+27,
    49: 1338,
    50: 195.6,
    51: 32.9,
    52: 14.3,
    53: 5.5,
    54: 1.53,
    55: 0.43,
    56: 0.195,
    57: 0.27,
    58: null,
    59: null,
    60: 0.00000015,
    61: 0.000000392
  },
  35: {
    34: 0.000000024,
    35: 0.0791,
    36: 21.4,
    37: 78.6,
    38: 204,
    39: 1524,
    40: 5802,
    41: 58320,
    42: 205344,
    43: 387,
    45: 1060.8,
    47: 127015.2,
    48: 8546.4,
    49: 1905.6,
    50: 174,
    51: 55.1,
    52: 55.68,
    53: 16.34,
    54: 4.357,
    55: 1.91,
    56: 0.543,
    57: 0.314,
    58: 0.102,
    59: 0.07,
    60: 0.00000015,
    61: 0.00000015,
    62: null,
    63: null,
    66: null
  },
  36: {
    33: 0.028,
    34: 0.04,
    35: 0.1,
    36: 17.1,
    37: 27.3,
    38: 690,
    39: 276,
    40: 53280,
    41: 4275,
    43: 126144,
    45: 7.22654E+12,
    49: 338889828,
    51: 4578,
    52: 10170,
    53: 189,
    54: 32.32,
    55: 8.57,
    56: 1.84,
    57: 1.286,
    58: 0.212,
    59: 0.114,
    60: 0.08,
    61: 0.063,
    62: 0.043,
    63: 0.013,
    64: 0.007,
    65: 0.000000635,
    66: null
  },
  37: {
    35: 0.000000103,
    36: 0.000000081,
    37: 0.064776,
    38: 19,
    39: 36.5,
    40: 226.8,
    41: 1059.6,
    42: 1374,
    43: 33.4,
    44: 16459.2,
    45: 75.45,
    46: 7447680,
    47: 2835648,
    49: 1610668.8,
    50: 1.56838E+18,
    51: 1066.38,
    52: 919.2,
    53: 158,
    54: 58.2,
    55: 4.48,
    56: 5.84,
    57: 2.702,
    58: 0.3777,
    59: 0.203,
    60: 0.1691,
    61: 0.115,
    62: 0.054,
    63: 0.052,
    64: 0.032,
    65: 0.037,
    66: 0.023,
    67: null,
    68: null,
    69: null
  },
  38: {
    35: 0.025,
    36: 0.027,
    37: 0.088,
    38: 7.89,
    39: 9,
    40: 160,
    41: 135,
    42: 6378,
    43: 1338,
    44: 2190240,
    45: 116676,
    47: 5602953.6,
    51: 4368643.2,
    52: 912310729.9,
    53: 34740,
    54: 9399.6,
    55: 445.8,
    56: 75.3,
    57: 23.9,
    58: 1.07,
    59: 0.429,
    60: 0.653,
    61: 0.269,
    62: 0.2,
    63: 0.118,
    64: 0.069,
    65: 0.053,
    66: 0.053,
    67: 0.039,
    68: 0.02,
    69: 0.000000395,
    70: null
  },
  39: {
    37: 0.0000002,
    38: 0.057,
    39: 0.053,
    40: 14.8,
    41: 30.1,
    42: 70.4,
    43: 8.3,
    44: 424.8,
    45: 2370,
    46: 9648,
    47: 53064,
    48: 287280,
    49: 9212486.4,
    51: 230580,
    52: 5055264,
    53: 12744,
    54: 36648,
    55: 1122,
    56: 618,
    57: 5.34,
    58: 3.75,
    59: 0.548,
    60: 1.484,
    61: 0.732,
    62: 0.45,
    63: 0.36,
    64: 0.23,
    65: 0.197,
    66: 0.107,
    67: 0.079,
    68: 0.0335,
    69: 0.03,
    70: 0.025,
    71: null,
    72: null
  },
  40: {
    37: null,
    38: 0.00000017,
    39: 0.056,
    40: 4.6,
    41: 5.5,
    42: 32,
    43: 42,
    44: 1548,
    45: 471.6,
    46: 59400,
    47: 6048,
    48: 7205760,
    49: 282276,
    53: 5.08067E+13,
    55: 5532364.8,
    56: 6.31139E+26,
    57: 60296.4,
    58: 30.7,
    59: 2.1,
    60: 7.1,
    61: 2.3,
    62: 2.9,
    63: 1.3,
    64: 1.2,
    65: 0.66,
    66: 0.18,
    67: 0.146,
    68: 0.0774,
    69: 0.056,
    70: 0.0375,
    71: 0.024,
    72: 0.03,
    73: null,
    74: null
  },
  41: {
    40: 0.0000002,
    41: 0.05,
    42: 3.9,
    43: 9.8,
    44: 20.5,
    45: 88,
    46: 222,
    47: 870,
    48: 7308,
    49: 52560,
    50: 21458709663,
    51: 1.09503E+15,
    53: 6.40606E+11,
    54: 3023222.4,
    55: 84060,
    56: 4326,
    57: 2.86,
    58: 15,
    59: 1.4,
    60: 7.1,
    61: 4.3,
    62: 1.5,
    63: 4.9,
    64: 2.91,
    65: 1.02,
    66: 0.3,
    67: 0.198,
    68: 0.108,
    69: 0.082,
    70: 0.054,
    71: 0.033,
    72: 0.032,
    73: 0.017,
    74: 0.023,
    75: null,
    76: null
  },
  42: {
    39: 0.00000045,
    40: null,
    41: 0.006,
    42: 2.3,
    43: 3.2,
    44: 19.1,
    45: 14.1,
    46: 480,
    47: 126.6,
    48: 20016,
    49: 929.4,
    51: 1.26228E+11,
    57: 237326.4,
    58: 2.21214E+26,
    59: 876.6,
    60: 678,
    61: 67.5,
    62: 60,
    63: 36.3,
    64: 8.73,
    65: 3.5,
    66: 1.09,
    67: 0.61,
    68: 0.296,
    69: 0.186,
    70: 0.12,
    71: 0.08,
    72: 0.058,
    73: 0.0455,
    74: 0.032,
    75: 0.022,
    76: 0.019,
    77: null
  },
  43: {
    42: 0.0000001,
    43: 0.055,
    44: 2.2,
    45: 6.4,
    46: 12.8,
    47: 49.2,
    48: 188.4,
    49: 255,
    50: 9900,
    51: 17580,
    52: 72000,
    53: 369792,
    54: 1.32855E+14,
    55: 1.32539E+14,
    56: 6.66167E+12,
    57: 15.65,
    58: 853.2,
    59: 5.28,
    60: 54.2,
    61: 1098,
    62: 458.4,
    63: 35.6,
    64: 21.2,
    65: 5.17,
    66: 0.91,
    67: 0.9,
    68: 0.29,
    69: 0.271,
    70: 0.152,
    71: 0.1,
    72: 0.078,
    73: 0.057,
    74: 0.0445,
    75: 0.03,
    76: 0.022,
    77: 0.021,
    78: 0.022,
    79: null
  },
  44: {
    41: 0.00000045,
    42: 0.000000438,
    44: 1.2,
    45: 1.5,
    46: 11.7,
    47: 8,
    48: 219,
    49: 59.7,
    50: 3108,
    51: 5914.8,
    53: 244512,
    59: 3390940.8,
    61: 15980.4,
    62: 32123520,
    63: 225,
    64: 273,
    65: 34.4,
    66: 12.04,
    67: 2.12,
    68: 1.75,
    69: 0.8,
    70: 0.54,
    71: 0.318,
    72: 0.204,
    73: 0.151,
    74: 0.099,
    75: 0.0695,
    76: 0.045,
    77: 0.029,
    78: 0.025,
    79: 0.019,
    80: 0.015,
    81: null
  },
  45: {
    44: 0.00000012,
    45: 0.029,
    46: 1.47,
    47: 4.66,
    48: 12.2,
    49: 70.6,
    50: 301.2,
    51: 594,
    52: 1842,
    53: 523.2,
    54: 1391040,
    55: 73800,
    56: 104137855.7,
    57: 17910720,
    59: 42.3,
    60: 127227.6,
    61: 30.07,
    62: 1302,
    63: 16.8,
    64: 80.8,
    65: 3.35,
    66: 11,
    67: 3.6,
    68: 2.8,
    69: 1.85,
    70: 0.99,
    71: 0.68,
    72: 0.44,
    73: 0.266,
    74: 0.171,
    75: 0.132,
    76: 0.151,
    77: 0.0000003,
    78: 0.0422,
    79: 0.03,
    80: 0.0265,
    81: 0.019,
    82: 0.02,
    83: null
  },
  46: {
    44: null,
    45: null,
    46: 1,
    47: 1,
    48: 9,
    49: 5,
    50: 122,
    51: 186,
    52: 1062,
    53: 1284,
    54: 313632,
    55: 30492,
    57: 1468022.4,
    61: 2.0512E+14,
    63: 48924,
    65: 1404,
    66: 75744,
    67: 93,
    68: 145.2,
    69: 25,
    70: 11.8,
    71: 4.3,
    72: 1.9,
    73: 0.92,
    74: 0.492,
    75: 0.285,
    76: 0.175,
    77: 0.109,
    78: 0.038,
    79: 0.057,
    80: 0.0486,
    81: 0.038,
    82: 0.035,
    83: 0.031,
    84: null,
    85: null
  },
  47: {
    45: null,
    46: 0.000000228,
    47: 0.026,
    48: 1.75,
    49: 4.4,
    50: 25.5,
    51: 47.5,
    52: 124,
    53: 120.6,
    54: 666,
    55: 774,
    56: 3942,
    57: 4152,
    58: 3567456,
    59: 1437.6,
    61: 142.92,
    63: 24.56,
    64: 643680,
    65: 11268,
    66: 19332,
    67: 4.6,
    68: 1200,
    69: 230,
    70: 72.8,
    71: 3.76,
    72: 2.1,
    73: 1.23,
    74: 0.78,
    75: 0.529,
    76: 0.299,
    77: 0.191,
    78: 0.159,
    79: 0.052,
    80: 0.109,
    81: 0.058,
    82: 0.046,
    83: 0.042,
    84: 0.035,
    85: 0.028
  },
  48: {
    46: 0.00000076,
    47: 0.032,
    48: 1.03,
    49: 2.8,
    50: 9.3,
    51: 16,
    52: 49.1,
    53: 81.6,
    54: 330,
    55: 438,
    56: 3462,
    57: 3330,
    59: 23400,
    61: 39908160,
    65: 2.53718E+23,
    67: 192456,
    68: 1.04138E+27,
    69: 8964,
    70: 3018,
    71: 161.4,
    72: 50.8,
    73: 13.5,
    74: 5.24,
    75: 2.1,
    76: 1.25,
    77: 0.68,
    78: 0.515,
    79: 0.37,
    80: 0.28,
    81: 0.154,
    82: 0.162,
    83: 0.068,
    84: 0.084,
    85: 0.057,
    86: 0.065
  },
  49: {
    47: null,
    48: 0.036,
    49: 0.03,
    50: 3.1,
    51: 5.65,
    52: 15.1,
    53: 23.3,
    54: 65,
    55: 108,
    56: 304.2,
    57: 372,
    58: 1944,
    59: 3480,
    60: 14972.4,
    61: 17712,
    62: 242326.08,
    63: 892.8,
    65: 71.9,
    66: 1.39166E+22,
    67: 14.1,
    68: 2592,
    69: 5,
    70: 144,
    71: 3.08,
    72: 23.1,
    73: 1.5,
    74: 6.15,
    75: 3.12,
    76: 2.36,
    77: 1.53,
    78: 1.09,
    79: 0.84,
    80: 0.611,
    81: 0.29,
    82: 0.28,
    83: 0.2,
    84: 0.165,
    85: 0.14,
    86: 0.101,
    87: 0.085,
    88: 0.065
  },
  50: {
    49: 0.00000076,
    50: 1.18,
    51: 1.7,
    52: 3.8,
    53: 7,
    54: 20.8,
    55: 32.7,
    56: 115,
    57: 174,
    58: 618,
    59: 1086,
    60: 14954.4,
    61: 2118,
    63: 9943776,
    71: 97308,
    73: 11162880,
    75: 832896,
    76: 7.25809E+12,
    77: 7560,
    78: 3544.2,
    79: 133.8,
    80: 223.2,
    81: 56,
    82: 39.7,
    83: 1.46,
    84: 1.05,
    85: 0.515,
    86: 0.345,
    87: 0.19,
    88: 0.14,
    89: 0.13,
    90: null
  },
  51: {
    52: 0.000000049,
    53: 0.44,
    54: 1.22,
    55: 0.6,
    56: 4,
    57: 7.4,
    58: 17.2,
    59: 23.6,
    60: 75,
    61: 53.5,
    62: 400.2,
    63: 209.4,
    64: 1926,
    65: 948,
    66: 10080,
    67: 216,
    68: 137484,
    69: 953.4,
    71: 235336.32,
    73: 5201280,
    74: 87051673.72,
    75: 1067040,
    76: 332640,
    77: 32580,
    78: 15717.6,
    79: 2370,
    80: 1381.8,
    81: 167.4,
    82: 140.4,
    83: 0.78,
    84: 1.679,
    85: 0.923,
    86: 0.45,
    87: 0.348,
    88: 0.093,
    89: 0.173,
    90: null,
    91: 0.053
  },
  52: {
    52: 0.000000018,
    53: 0.00000062,
    54: 0.00007,
    55: 0.0031,
    56: 2.1,
    57: 4.4,
    58: 18.6,
    59: 19.3,
    60: 120,
    61: 102,
    62: 912,
    63: 348,
    64: 8964,
    65: 3720,
    66: 518400,
    67: 57780,
    69: 1656288,
    71: 2.90324E+24,
    75: 33660,
    76: 2.42988E+32,
    77: 4176,
    78: 2.493E+28,
    79: 1500,
    80: 276825.6,
    81: 750,
    82: 2508,
    83: 19,
    84: 17.63,
    85: 2.49,
    86: 1.4,
    87: 1.6,
    88: 0.348,
    90: null,
    91: 0.000000408,
    92: null,
    93: null
  },
  53: {
    55: 0.036,
    56: 0.0000928,
    57: 0.664,
    58: 2.5,
    59: 3.34,
    60: 6.6,
    61: 2.1,
    62: 78,
    63: 2.91,
    64: 133.2,
    65: 822,
    66: 1146,
    67: 4896,
    68: 7632,
    69: 217.8,
    70: 47602.8,
    71: 360806.4,
    72: 5132764.8,
    73: 1117152,
    75: 1499.4,
    76: 4.95444E+14,
    77: 44496,
    78: 693377.28,
    79: 8262,
    80: 74988,
    81: 3150,
    82: 23688,
    83: 83.4,
    84: 24.5,
    85: 6.26,
    86: 2.28,
    87: 0.86,
    88: 0.43,
    89: 0.222,
    90: 0.13,
    91: 0.0000003,
    92: 0.000000407,
    93: 0.094,
    94: null
  },
  54: {
    54: 0.000054,
    55: 0.013,
    56: 0.093,
    57: 0.74,
    58: 2.7,
    59: 2.74,
    60: 10,
    61: 18,
    62: 59,
    63: 61,
    64: 228,
    65: 348,
    66: 2400,
    67: 2406,
    68: 72360,
    69: 7380,
    70: 5.04911E+21,
    71: 60840,
    73: 3140294.4,
    79: 453384,
    80: 1.8303E+30,
    81: 32904,
    82: 6.83207E+28,
    83: 229.08,
    84: 848.4,
    85: 39.68,
    86: 13.6,
    87: 1.73,
    88: 1.23,
    89: 0.511,
    90: 1.15,
    91: 0.188,
    92: 0.146,
    93: 0.1,
    94: 0.0000004,
    95: null,
    96: null
  },
  55: {
    57: 0.00049,
    58: 0.0000177,
    59: 0.57,
    60: 1.4,
    61: 0.7,
    62: 8.4,
    63: 14,
    64: 43,
    65: 61.3,
    66: 155,
    67: 21.18,
    68: 351.6,
    69: 30.9,
    70: 2802,
    71: 98.4,
    72: 22500,
    73: 218.4,
    74: 115416,
    75: 1752.6,
    76: 837129.6,
    77: 559872,
    79: 65171363.52,
    80: 7.25809E+13,
    81: 1124064,
    82: 949232333.3,
    83: 1950,
    84: 556.2,
    85: 63.7,
    86: 24.84,
    87: 1.684,
    88: 1.791,
    89: 0.994,
    90: 0.587,
    91: 0.322,
    92: 0.23,
    93: 0.146,
    94: 0.113,
    95: 0.084,
    96: 0.069,
    97: 0.05
  },
  56: {
    58: 0.43,
    59: 0.45,
    60: 1.3,
    61: 1.75,
    62: 5.5,
    63: 5.4,
    64: 24,
    65: 29.7,
    66: 117,
    67: 144,
    68: 660,
    69: 198,
    70: 6000,
    71: 762,
    72: 209952,
    73: 8028,
    75: 993600,
    76: 9.46708E+28,
    77: 332957126,
    83: 4975.8,
    84: 1101686.4,
    85: 1096.2,
    86: 636,
    87: 14.5,
    88: 11.5,
    89: 4.31,
    90: 2.21,
    91: 0.894,
    92: 0.612,
    93: 0.344,
    94: 0.259,
    95: 0.167,
    96: 0.139,
    97: 0.116,
    98: 0.053
  },
  57: {
    60: 0.0235,
    63: 2.8,
    64: 5.3,
    65: 8.6,
    66: 16.3,
    67: 21,
    68: 64.8,
    69: 54,
    70: 306,
    71: 310.8,
    72: 696,
    73: 522,
    74: 3540,
    75: 17280,
    76: 14083.2,
    77: 387,
    78: 70200,
    79: 592.2,
    80: 1.89342E+12,
    81: 3.25036E+18,
    83: 145029.312,
    84: 14112,
    85: 5466,
    86: 852,
    87: 40.8,
    88: 24.8,
    89: 6.1,
    90: 4.06,
    91: 1.26,
    92: 1.05,
    93: 0.59,
    94: 0.457,
    95: 0.298,
    96: 0.245,
    97: 0.161,
    98: 0.101,
    99: 0.084,
    100: null
  },
  58: {
    63: 1.1,
    64: null,
    65: 3.8,
    66: 6,
    67: 9.7,
    68: 51,
    69: 34,
    70: 235.8,
    71: 210,
    72: 1374,
    73: 618,
    74: 12636,
    75: 5820,
    76: 273024,
    77: 63720,
    79: 32400,
    80: 1.3885E+24,
    81: 11891232,
    83: 2808950.4,
    84: 1.57785E+24,
    85: 118940.4,
    86: 24616224,
    87: 180.6,
    88: 809.4,
    89: 56.4,
    90: 56.8,
    91: 5.3,
    92: 4,
    93: 1.76,
    94: 1.4,
    95: 0.865,
    96: 0.722,
    97: 0.313,
    98: 0.233,
    99: 0.18,
    100: 0.099
  },
  59: {
    62: 0.01,
    65: 1.2,
    66: 3.3,
    67: 3.14,
    68: 4.2,
    69: 2.84,
    70: 30,
    71: 40,
    72: 90.6,
    73: 96,
    74: 390,
    75: 1020,
    76: 1440,
    77: 786,
    78: 4608,
    79: 87,
    80: 15876,
    81: 203.4,
    83: 68832,
    84: 1172448,
    85: 1036.8,
    86: 21542.4,
    87: 1445.4,
    88: 804,
    89: 137.4,
    90: 135.6,
    91: 6.19,
    92: 18.9,
    93: 3.57,
    94: 4.29,
    95: 2.3,
    96: 1.47,
    97: 0.444,
    98: 0.295,
    99: 0.181,
    100: 0.13,
    101: 0.17,
    102: null
  },
  60: {
    65: 0.65,
    66: null,
    67: 1.8,
    68: 5,
    69: 6.7,
    70: 13,
    71: 25.4,
    72: 94,
    73: 70,
    74: 510,
    75: 744,
    76: 3039,
    77: 2310,
    78: 18144,
    79: 1782,
    80: 291168,
    81: 8964,
    84: 7.22654E+22,
    87: 948672,
    89: 6220.8,
    90: 2.87168E+26,
    91: 746.4,
    92: 684,
    93: 31.6,
    94: 25.9,
    95: 8.9,
    96: 5.26,
    97: 1.15,
    98: 0.82,
    99: 0.485,
    100: 0.439,
    101: 0.22,
    102: 0.31,
    103: null
  },
  61: {
    67: 1,
    68: 2.4,
    69: 2.6,
    70: 6.3,
    71: 6.2,
    72: 13.5,
    73: 5,
    74: 49,
    75: 300,
    76: 144,
    77: 10,
    78: 249,
    79: 9.2,
    80: 1254,
    81: 40.5,
    82: 22896000,
    83: 31363200,
    84: 558557589.8,
    85: 174509800.6,
    86: 82786439.6,
    87: 463795.2,
    88: 191088,
    89: 9712.8,
    90: 102240,
    91: 247.2,
    92: 315,
    93: 160.8,
    94: 41.5,
    95: 26.7,
    96: 10.56,
    97: 4.8,
    98: 1.5,
    99: 0.725,
    100: 1.05,
    101: 0.63,
    102: 0.43,
    103: null,
    104: null
  },
  62: {
    67: 0.55,
    68: null,
    69: 1.2,
    70: 4,
    71: 2.89,
    72: 9.5,
    73: 10.3,
    74: 47,
    75: 45,
    76: 186,
    77: 154.2,
    78: 889.2,
    79: 612,
    80: 4349.4,
    81: 525,
    83: 29376000,
    84: 2.14587E+15,
    85: 3.34503E+18,
    86: 2.20898E+23,
    89: 2840123338,
    91: 166622.4,
    93: 1330.8,
    94: 33840,
    95: 481.8,
    96: 318,
    97: 11.37,
    98: 9.6,
    99: 4.8,
    100: 2.4,
    101: 1.23,
    102: 1.43,
    103: 0.98,
    104: 0.8,
    105: null,
    106: null
  },
  63: {
    67: 0.0009,
    68: 0.0178,
    69: null,
    71: 0.5,
    72: 1.5,
    73: 3.3,
    74: 11,
    75: 12.1,
    76: 17.9,
    77: 1.51,
    78: 40.7,
    79: 2.34,
    80: 155.4,
    81: 10.2,
    82: 512352,
    83: 398304,
    84: 2082240,
    85: 4708800,
    86: 8043840,
    87: 1164450568,
    88: 5.36468E+25,
    89: 426554968.4,
    91: 271421120.3,
    92: 149990069.2,
    93: 1312416,
    94: 54648,
    95: 2754,
    96: 1086,
    97: 42.6,
    98: 26,
    99: 10.6,
    100: 7.7,
    101: 4.15,
    102: 2.3,
    103: 1.7,
    104: 1.3,
    105: 0.2,
    106: null
  },
  64: {
    70: null,
    71: 1.1,
    72: 0.0000002,
    73: 2.2,
    74: 4.7,
    75: 5.8,
    76: 15.8,
    77: 14,
    78: 70.2,
    79: 39,
    80: 268.2,
    81: 1380,
    82: 4170528,
    83: 137016,
    84: 2243697437,
    85: 801792,
    86: 5.64869E+13,
    87: 10704960,
    88: 3.40815E+21,
    89: 20770560,
    95: 66524.4,
    97: 219.6,
    98: 504,
    99: 68,
    100: 45,
    101: 10.3,
    102: 4.8,
    103: 4.26,
    104: 3.03,
    105: 0.75,
    106: 0.41,
    107: null,
    108: null
  },
  65: {
    70: 0.00094,
    73: 0.0000002,
    74: 1.6,
    75: 2.29,
    76: 3.5,
    77: 0.597,
    78: 12,
    79: 1,
    80: null,
    81: 8,
    82: 5904,
    83: 3600,
    84: 14824.8,
    85: 12528,
    86: 63392.4,
    87: 63000,
    88: 202176,
    89: 77400,
    90: 459648,
    91: 462240,
    92: 2240541744,
    93: 5680246675,
    95: 6246720,
    96: 595296,
    97: 456,
    98: 1170,
    99: 180,
    100: 126.6,
    101: 25.1,
    102: 19.4,
    103: 8.2,
    104: 5.1,
    105: 0.96,
    106: 1.24,
    107: 0.76,
    108: null,
    109: null
  },
  66: {
    73: 0.6,
    74: null,
    75: 0.9,
    76: 2.3,
    77: 5.6,
    78: 9.1,
    79: 6,
    80: 33.2,
    81: 67,
    82: 198,
    83: 252,
    84: 430.2,
    85: 1074,
    86: 8568,
    87: 23040,
    88: 9.46708E+13,
    89: 35640,
    91: 29304,
    93: 12476160,
    99: 8395.2,
    100: 293760,
    101: 372,
    102: 522,
    103: 39,
    104: 55,
    105: 4.1,
    106: 0.00000016,
    107: 1.43,
    108: 0.00000016,
    109: null,
    110: null
  },
  67: {
    73: 0.006,
    74: 0.0041,
    75: 0.4,
    76: null,
    77: 0.7,
    78: 2.4,
    79: 3.32,
    80: 5.8,
    81: 2.2,
    82: 21.1,
    83: 72,
    84: 35.2,
    85: 161.8,
    86: 120.6,
    87: 705.6,
    88: 2880,
    89: 3360,
    90: 756,
    91: 678,
    92: 1983,
    93: 1536,
    94: 8928,
    95: 900,
    96: 1.44215E+11,
    97: 1728,
    99: 96566.4,
    100: 11160,
    101: 179.4,
    102: 283.2,
    103: 165.6,
    104: 53,
    105: 25,
    106: 6.9,
    107: 3.2,
    108: 1.9,
    109: 0.00000016,
    110: null,
    111: null
  },
  68: {
    75: null,
    76: 0.0000002,
    77: null,
    78: 1.7,
    79: 2.5,
    80: 4.6,
    81: 4,
    82: 18.5,
    83: 23.5,
    84: 10.3,
    85: 37.1,
    86: 223.8,
    87: 318,
    88: 1170,
    89: 1119,
    90: 8244,
    91: 2160,
    92: 102888,
    93: 11556,
    95: 4500,
    97: 37296,
    101: 811468.8,
    103: 27057.6,
    104: 177480,
    105: 84,
    106: 192,
    107: 72,
    108: 0.00000016,
    109: null,
    110: 0.00000016,
    111: null,
    112: null
  },
  69: {
    75: 0.0000019,
    76: 0.00000317,
    77: 0.068,
    78: 0.58,
    79: 0.7,
    80: 0.9,
    81: 2.2,
    82: 4.17,
    83: 8,
    84: 1.48,
    85: 8.1,
    86: 21.6,
    87: 83.8,
    88: 217.8,
    89: 238.8,
    90: 547.8,
    91: 564,
    92: 1812,
    93: 1302,
    94: 6516,
    95: 117,
    96: 108216,
    97: 27720,
    98: 799200,
    99: 8043840,
    101: 11111040,
    102: 60589297.87,
    103: 228960,
    104: 29664,
    105: 324,
    106: 912,
    107: 114,
    108: 95,
    109: 0.0000003,
    110: 0.00000016,
    111: 0.0000003,
    112: 0.00000016
  },
  70: {
    79: 0.7,
    80: 0.0000002,
    81: 1.6,
    82: 3.03,
    83: 4.2,
    84: 0.409,
    85: 1.793,
    86: 26.1,
    87: 38.6,
    88: 89.4,
    89: 100.2,
    90: 288,
    91: 252,
    92: 1132.2,
    93: 663,
    94: 4548,
    95: 594,
    96: 204120,
    97: 1050,
    99: 2766355.2,
    105: 361584,
    107: 6879.6,
    108: 4440,
    109: 480,
    110: 144,
    111: 0.00000016,
    112: 0.00000016,
    113: 0.000000222,
    114: 0.00000016,
    115: 0.00000016
  },
  71: {
    79: 0.045,
    80: 0.0806,
    81: 0.7,
    82: 0.9,
    83: null,
    84: 0.068,
    85: 0.494,
    86: 6.8,
    87: 10.6,
    88: 12.1,
    89: 36.1,
    90: 77,
    91: 82.2,
    92: 238.2,
    93: 188.4,
    94: 644.4,
    95: 159,
    96: 3090,
    97: 330,
    98: 122616,
    99: 173836.8,
    100: 712540.8,
    101: 578880,
    102: 43232988.59,
    103: 104453425,
    105: 1.18654E+18,
    106: 574067.52,
    107: 1704,
    108: 16524,
    109: 342,
    110: 210,
    111: 120,
    112: 58,
    113: 19,
    114: 0.00000016,
    115: 0.00000016,
    116: 0.00000016,
    117: null
  },
  72: {
    79: null,
    81: null,
    82: 2,
    83: 0.843,
    84: 0.023,
    85: 0.115,
    86: 2.85,
    87: 5.6,
    88: 13.6,
    89: 18.4,
    90: 39.4,
    91: 40,
    92: 111,
    93: 76,
    94: 406.2,
    95: 123,
    96: 1557,
    97: 194.4,
    98: 57636,
    99: 43560,
    100: 59011451.57,
    101: 84960,
    102: 6.31139E+22,
    103: 6048000,
    109: 3662496,
    110: 2.80857E+14,
    111: 3664.8,
    112: 14832,
    113: 210,
    114: 156,
    115: null,
    116: null,
    117: null,
    118: null
  },
  73: {
    82: 0.0029,
    83: 0.106,
    84: 0.0101,
    85: 0.055,
    86: 0.83,
    87: 1.55,
    88: null,
    89: 3.57,
    90: 10.6,
    91: 14.2,
    92: 31,
    93: 34.4,
    94: 80,
    95: 120,
    96: 294,
    97: 405.6,
    98: 1398,
    99: 2208,
    100: 11304,
    101: 4104,
    102: 37800,
    103: 29124,
    104: 202896,
    105: 8496,
    106: 57433605.27,
    107: 29354.4,
    109: 9913536,
    110: 440640,
    111: 31320,
    112: 2964,
    113: 630,
    114: null,
    115: 19.6,
    116: null,
    117: 5.3,
    118: 0.0000003,
    119: 2.2,
    120: null,
    121: null
  },
  74: {
    83: 0.275,
    84: 0.00125,
    85: 0.0073,
    86: 0.091,
    87: 0.409,
    88: 1.19,
    89: 2.67,
    90: 6.3,
    91: 5.1,
    92: 19.2,
    93: 19.9,
    94: 50.9,
    95: 74,
    96: 145.2,
    97: 142.8,
    98: 396,
    99: 456,
    100: 1992,
    101: 2112,
    102: 9000,
    103: 7944,
    104: 1866240,
    105: 2223,
    106: 5.68025E+25,
    107: 10471680,
    109: 2.11431E+28,
    111: 6488640,
    113: 86400,
    114: 6028992,
    115: 696,
    116: 1800,
    118: null,
    119: null,
    120: null,
    121: 0.00000016,
    122: 0.00000016,
    123: 0.00000016
  },
  75: {
    84: null,
    85: 0.000612,
    86: 0.00044,
    87: 0.107,
    88: 0.39,
    89: 0.7,
    90: 1.6,
    91: 2.25,
    92: 5.9,
    93: 4.4,
    94: 8.1,
    95: 9.2,
    96: 15.2,
    97: 15,
    98: 118.8,
    99: 144,
    100: 353.4,
    101: 318,
    102: 840,
    103: 792,
    104: 1170,
    105: 147.6,
    106: 71640,
    107: 231120,
    108: 6048000,
    109: 3058560,
    111: 321261.12,
    112: 1.36641E+18,
    113: 61218,
    114: 87480,
    115: 180,
    116: 588,
    117: 16,
    118: null,
    119: 5,
    120: 6,
    121: 3,
    122: 0.00000016,
    123: 0.00000016,
    124: 0.00000016
  },
  76: {
    85: 0.00064,
    86: 0.0021,
    87: 0.0055,
    88: 0.021,
    89: 0.071,
    90: 0.213,
    91: 0.81,
    92: 2.1,
    93: 3.43,
    94: 7.37,
    95: 8.3,
    96: 19.2,
    97: 22.4,
    98: 44,
    99: 84,
    100: 216,
    101: 180,
    102: 300,
    103: 390,
    104: 1290,
    105: 6300,
    106: 78624,
    107: 46800,
    108: 1.76719E+21,
    109: 8087040,
    110: 6.31139E+22,
    115: 1330560,
    117: 107388,
    118: 189341555.8,
    119: 390,
    120: 2094,
    121: 168,
    122: null,
    123: 5,
    124: 6,
    125: 0.00000016,
    126: 0.00000016,
    127: null
  },
  77: {
    87: null,
    88: 0.000001,
    89: 0.0105,
    90: 0.0352,
    91: 0.222,
    92: 0.353,
    93: 0.87,
    94: 3.2,
    95: 4.4,
    96: 9,
    97: 7.9,
    98: 9,
    99: 8.7,
    100: 29.8,
    101: 12,
    102: 79,
    103: 90,
    104: 294,
    105: 900,
    106: 3480,
    107: 11124,
    108: 51840,
    109: 59904,
    110: 37800,
    111: 149400,
    112: 1140480,
    113: 1017792,
    115: 6378825.6,
    117: 69048,
    118: 8244,
    119: 52,
    120: 348,
    121: 8,
    122: 6,
    123: 0.0000003,
    124: 0.0000003,
    125: 11,
    126: null,
    127: 0.00000016,
    128: null
  },
  78: {
    87: 0.00026,
    88: 0.0003,
    89: 0.0007,
    90: 0.00202,
    91: 0.007,
    92: 0.0138,
    93: 0.0455,
    94: 0.0976,
    95: 0.382,
    96: 0.889,
    97: 2.53,
    98: 6.33,
    99: 10,
    100: 20.7,
    101: 21.2,
    102: 56,
    103: 52,
    104: 160.2,
    105: 390,
    106: 1038,
    107: 4254,
    108: 7488,
    109: 8460,
    110: 877824,
    111: 39132,
    112: 1.56838E+19,
    113: 244512,
    115: 1577846299,
    119: 71609.4,
    121: 1848,
    122: 45360,
    123: 150,
    124: 158400,
    125: 22,
    126: 10.3,
    127: null,
    128: 0.00000016,
    129: 0.00000016,
    130: 0.00000016
  },
  79: {
    91: 0.00029,
    92: 0.000022,
    93: 0.022,
    94: 0.0263,
    95: 0.12,
    96: null,
    97: null,
    98: 1.501,
    99: 2.6,
    100: 7.1,
    101: 8.4,
    102: 13.7,
    103: 15.5,
    104: 42.8,
    105: 20.6,
    106: 255,
    107: 642,
    108: 498,
    109: 530.4,
    110: 1722,
    111: 2568,
    112: 11448,
    113: 17784,
    114: 63540,
    115: 136872,
    116: 16071264,
    117: 532820.16,
    119: 232770.24,
    120: 271209.6,
    121: 2904,
    122: 1560,
    123: 28.4,
    124: 60,
    125: 39.8,
    126: 32,
    127: 40,
    128: 0.0000003,
    129: 0.0000003,
    130: 0.0000003,
    131: 0.0000003
  },
  80: {
    90: 0.00008,
    91: 0.000059,
    92: 0.000231,
    93: 0.0008,
    94: 0.0021,
    95: 0.0106,
    96: 0.0203,
    97: 0.117,
    98: 0.2665,
    99: 1.05,
    100: 2.59,
    101: 3.6,
    102: 10.83,
    103: 9.4,
    104: 30.87,
    105: 49.1,
    106: 82.8,
    107: 114,
    108: 195,
    109: 456,
    110: 1200,
    111: 2940,
    112: 17460,
    113: 13680,
    114: 14105945911,
    115: 37908,
    117: 230904,
    123: 4027104,
    125: 308.4,
    126: 499.2,
    127: 174,
    128: 2460,
    129: 36,
    130: null,
    131: 0.0000003,
    132: null,
    133: 0.0000003,
    134: null,
    135: 0.0000003,
    136: 0.0000003
  },
  81: {
    95: 0.0052,
    96: 0.018,
    97: 0.254,
    98: 0.23,
    99: 1.09,
    100: 3.2,
    101: 3.1,
    102: 6.9,
    103: 10.1,
    104: 19.5,
    105: 27.5,
    106: 51,
    107: 71,
    108: 138,
    109: 156,
    110: null,
    111: 576,
    112: 1296,
    113: 1980,
    114: 4176,
    115: 6624,
    116: 10224,
    117: 19080,
    118: 26712,
    119: 93960,
    120: 262837.44,
    121: 1063584,
    123: 119379851,
    125: 252.12,
    126: 286.2,
    127: 183.18,
    128: 129.72,
    129: 78,
    130: 88,
    131: 30.9,
    132: 46,
    133: 11,
    134: 0.0000003,
    135: 0.0000003,
    136: null
  },
  82: {
    96: 0.00012,
    97: 0.0035,
    98: 0.0041,
    99: 0.045,
    100: 0.055,
    101: 0.535,
    102: 0.49,
    103: 6.3,
    104: 4.82,
    105: 15.2,
    106: 25.5,
    107: 39,
    108: 71,
    109: 79.8,
    110: 210,
    111: null,
    112: 642,
    113: 900,
    114: 2220,
    115: 486,
    116: 8640,
    117: 5400,
    118: 77400,
    119: 33588,
    120: 1.65674E+12,
    121: 186912,
    122: 4.41797E+24,
    123: 5.36468E+14,
    127: 11642.4,
    128: 700563756.6,
    129: 2166,
    130: 38239.2,
    131: 612,
    132: 1623.6,
    133: 147,
    134: 0.0000003,
    135: 19.9,
    136: 15,
    137: null,
    138: 0.0000003
  },
  83: {
    101: 0.013,
    102: 0.000058,
    103: 0.015,
    104: 0.037,
    105: 0.06,
    106: 0.688,
    107: 6.3,
    108: 12.4,
    109: 34.6,
    110: 63.6,
    111: 95,
    112: 183,
    113: 308,
    114: 559.8,
    115: 618,
    116: 1620,
    117: 2184,
    118: 6180,
    119: 6156,
    120: 42336,
    121: 40392,
    122: 1288224,
    123: 539395.2,
    124: 995621014.5,
    125: 1.16129E+13,
    126: 6.34294E+26,
    127: 433036.8,
    128: 128.4,
    129: 3633,
    130: 2735.4,
    131: 1182.6,
    132: 456,
    133: 135,
    134: 98.5,
    135: 33,
    136: 22,
    137: 0.0000003,
    138: 0.0000003,
    139: 0.0000003,
    140: 0.0000003,
    141: 0.0000003
  },
  84: {
    102: 0.000028,
    103: 0.0014,
    104: 0.00027,
    105: 0.0035,
    106: 0.00245,
    107: 0.022,
    108: 0.0322,
    109: 0.399,
    110: 0.392,
    111: 4.64,
    112: 5.8,
    113: 84,
    114: 105.6,
    115: 328.2,
    116: 690.6,
    117: 936,
    118: 2676,
    119: 2202,
    120: 12668.4,
    121: 6264,
    122: 760320,
    123: 20880,
    124: 91451971.47,
    125: 3913058821,
    126: 11955686.4,
    127: 0.516,
    128: 2.943E-07,
    129: 0.00000372,
    130: 0.00016346,
    131: 0.001781,
    132: 0.145,
    133: 1.53,
    134: 185.82,
    135: 620,
    136: 0.0000003,
    137: 112,
    138: 550,
    139: 0.0000003,
    140: 0.0000003,
    141: 0.0000003,
    142: 0.0000003,
    143: 0.0000003
  },
  85: {
    106: 0.0017,
    107: 0.088,
    108: 0.028,
    109: 0.286,
    110: 0.29,
    111: 0.388,
    112: 0.388,
    113: 4.2,
    114: 7.03,
    115: 43,
    116: 85.2,
    117: 184,
    118: 444,
    119: 547.2,
    120: 1614,
    121: 1836,
    122: 6516,
    123: 5868,
    124: 19512,
    125: 29160,
    126: 25970.4,
    127: 0.314,
    128: 0.000000125,
    129: 0.000000558,
    130: 0.0001,
    131: 0.0003,
    132: 0.0326,
    133: 1.28,
    134: 56,
    135: 222.6,
    136: 138,
    137: 54,
    138: 50,
    139: 78,
    140: 0.0000003,
    141: 0.0000003,
    142: 0.0000003,
    143: 0.0000003,
    144: 0.0000003
  },
  86: {
    107: 0.00115,
    108: 0.00078,
    109: 0.006,
    110: 0.0044,
    111: 0.065,
    112: 0.065,
    113: 0.59,
    114: 1.03,
    115: 7,
    116: 9.7,
    117: 44.2,
    118: 74.5,
    119: 170,
    120: 340.2,
    121: 555,
    122: 1461,
    123: 1728,
    124: 8640,
    125: 52560,
    126: 1434,
    127: 0.0195,
    128: 0.000000259,
    129: 0.0000023,
    130: 0.000045,
    131: 0.00054,
    132: 0.03375,
    133: 3.96,
    134: 55.6,
    135: 1500,
    136: 330350.4,
    137: 1458,
    138: 6420,
    139: 279.6,
    140: 444,
    141: 20.2,
    142: 65,
    143: 12
  },
  87: {
    110: 0.0006,
    111: 0.015,
    112: 0.012,
    113: 0.049,
    114: 0.062,
    115: 0.3,
    116: 0.55,
    117: 1.8,
    118: 3.9,
    119: 16,
    120: 14.8,
    121: 59.1,
    122: 50.5,
    123: 190.8,
    124: 186,
    125: 1200,
    126: 34.82,
    127: 0.0055,
    128: 0.000000086,
    129: 0.0000007,
    130: 0.000022,
    131: 0.0011,
    132: 0.024,
    133: 27.4,
    134: 294,
    135: 852,
    136: 1320,
    137: 199.8,
    138: 237,
    139: 49,
    140: 148.2,
    141: 38,
    142: 50.2,
    143: 19.1,
    144: 17.6,
    145: 5.5,
    146: 0.9
  },
  88: {
    113: 0.0016,
    114: 0.016,
    115: 0.031,
    116: 0.057,
    117: 0.21,
    118: 0.24,
    119: 1.35,
    120: 1.3,
    121: 4.8,
    122: 3.7,
    123: 13,
    124: 13,
    125: 163.8,
    126: 2.438,
    127: 0.00166,
    128: 0.000000182,
    129: 0.0000016,
    130: 0.00002591,
    131: 0.009,
    132: 0.018,
    133: 28,
    134: 38,
    135: 987552,
    136: 313796.16,
    137: 1287360,
    138: 50491081559,
    139: 2532,
    140: 181452324.4,
    141: 240,
    142: 5580,
    143: 104,
    144: 252,
    145: 30,
    146: 30
  },
  89: {
    116: 0.02,
    117: 0.022,
    118: 0.027,
    119: 0.095,
    120: 0.087,
    121: 0.35,
    122: 0.21,
    123: 0.88,
    124: 0.738,
    125: 8.2,
    126: 0.17,
    127: 0.00044,
    128: 0.000000069,
    129: 0.00000103,
    130: 0.0000118,
    131: 0.0264,
    132: 0.052,
    133: 5,
    134: 126,
    135: 10008,
    136: 857088,
    137: 105732,
    138: 687057392.3,
    139: 22140,
    140: 3762,
    141: 122,
    142: 450,
    143: 119,
    144: 143,
    145: 44,
    146: 62
  },
  90: {
    118: 0.0017,
    119: 0.0025,
    120: 0.016,
    121: 0.037,
    122: 0.0317,
    123: 0.144,
    124: 0.087,
    125: 1.2,
    126: 0.026,
    127: 0.000252,
    128: 0.000000122,
    129: 0.000001025,
    130: 0.0000097,
    131: 0.00174,
    132: 0.00224,
    133: 0.6,
    134: 1.04,
    135: 525,
    136: 1834.2,
    137: 1615420.8,
    138: 60324219.69,
    139: 2.48669E+11,
    140: 2.37939E+12,
    141: 91872,
    142: 4.41797E+17,
    143: 1309.8,
    144: 2082240,
    145: 432,
    146: 2238
  },
  91: {
    120: 0.0000003,
    121: 0.0051,
    122: 0.0053,
    123: 0.017,
    124: 0.014,
    125: 0.15,
    126: 0.0038,
    127: 0.000109,
    128: 0.000000054,
    129: 0.00000078,
    130: 0.0000059,
    131: 0.0029,
    132: 0.0051,
    133: 0.846,
    134: 1.7,
    135: 108,
    136: 2298,
    137: 79200,
    138: 129600,
    139: 1503360,
    140: 1.0338E+12,
    141: 114048,
    142: 2330640,
    143: 24120,
    144: 1464,
    145: 546,
    146: 522
  },
  92: {
    122: 0.00052,
    123: 0.0007,
    124: 0.0045,
    125: 0.016,
    126: 0.00065,
    127: 0.00006,
    129: 0.00000066,
    130: 0.0000047,
    131: 0.000018,
    132: 0.00084,
    133: 0.069,
    134: 0.268,
    135: 66,
    136: 546,
    137: 3480,
    138: 1747872,
    139: 362880,
    140: 2174272200,
    141: 5.02355E+12,
    142: 7.74723E+12,
    143: 2.22161E+16,
    144: 7.39063E+14,
    145: 583372.8,
    146: 1.40996E+17
  }
};
const AtomIdentifier = {
  // Get the chemical symbol for an atom with the specified number of protons.
  getSymbol: function (numProtons) {
    return symbolTable[numProtons];
  },
  /**
   * Get the internationalized element name for an atom with the specified number of protons.
   * @param {number} numProtons
   * @returns {string}
   */
  getName: function (numProtons) {
    return nameTable[numProtons];
  },
  /**
   * Get the English name for an atom with the specified number of protons, lowercased with no whitespace and suitable
   * for usage in PhET-iO data stream
   * @param {number} numProtons
   * @returns {string}
   */
  getEnglishName: function (numProtons) {
    return englishNameTable[numProtons];
  },
  // Identifies whether a given atomic nucleus is stable.
  isStable: function (numProtons, numNeutrons) {
    const tableEntry = stableElementTable[numProtons];
    if (typeof tableEntry === 'undefined') {
      return false;
    }
    return $.inArray(numNeutrons, tableEntry) > -1;
  },
  getNumNeutronsInMostCommonIsotope: function (atomicNumber) {
    return numNeutronsInMostStableIsotope[atomicNumber] || 0;
  },
  getStandardAtomicMass: function (numProtons) {
    return standardMassTable[numProtons];
  },
  /**
   * Get the atomic mass of an isotope fom an isotope key.   Input parameters are the number of protons and neutrons
   * which hold the information necessary to determine isotope information.
   *
   * @param {number} protons
   * @param {number} neutrons
   */
  getIsotopeAtomicMass: function (protons, neutrons) {
    if (protons !== 0) {
      const tableEntry = ISOTOPE_INFO_TABLE[protons][protons + neutrons];
      if (typeof tableEntry === 'undefined') {
        // Atom defined by that number of protons and neutrons is not stable, so return -1.
        return -1;
      }
      return tableEntry.atomicMass;
    } else {
      return -1;
    }
  },
  /**
   * Returns the natural abundance of the specified isotope on present day Earth (year 2018) as a proportion (NOT a
   * percentage) with the specified number of decimal places.
   *
   * @param {NumberAtom} isotope
   * @param {number} numDecimalPlaces - number of decimal places in the result
   * @returns {number}
   * @public
   */
  getNaturalAbundance: function (isotope, numDecimalPlaces) {
    assert && assert(numDecimalPlaces !== undefined, 'must specify number of decimal places for proportion');
    let abundanceProportion = 0;
    if (isotope.protonCountProperty.get() > 0 && ISOTOPE_INFO_TABLE[isotope.protonCountProperty.get()][isotope.massNumberProperty.get()] !== undefined) {
      // the configuration is in the table, get it and round it to the needed number of decimal places
      abundanceProportion = Utils.toFixedNumber(ISOTOPE_INFO_TABLE[isotope.protonCountProperty.get()][isotope.massNumberProperty.get()].abundance, numDecimalPlaces);
    }
    return abundanceProportion;
  },
  /**
   * Returns true if the isotope exists only in trace amounts on present day Earth (~year 2018), false if there is
   * more or less than that.  The definition that is used for deciding which isotopes exist in trace amounts is from
   * https://en.wikipedia.org/wiki/Trace_radioisotope.
   * @param {NumberAtom} isotope
   * @returns {boolean}
   * @public
   */
  existsInTraceAmounts: function (isotope) {
    const tableEntry = ISOTOPE_INFO_TABLE[isotope.protonCountProperty.get()][isotope.massNumberProperty.get()];
    return tableEntry !== undefined && tableEntry.abundance === TRACE_ABUNDANCE;
  },
  /**
   * Get a list of all isotopes for the given atomic number.
   *
   * @param atomicNumber
   * @return
   */
  getAllIsotopesOfElement: function (atomicNumber) {
    const isotopesList = [];
    for (const massNumber in ISOTOPE_INFO_TABLE[atomicNumber]) {
      const numNeutrons = massNumber - atomicNumber;
      const moleculeNumberList = [atomicNumber, numNeutrons, atomicNumber];
      isotopesList.push(moleculeNumberList);
    }
    return isotopesList;
  },
  /**
   * Get a list of all isotopes that are considered stable.  This is needed
   * because the complete list of isotopes used by this class includes some
   * that exist on earth but are not stable, such as carbon-14.
   *
   * @param atomicNumber
   * @return
   */
  getStableIsotopesOfElement: function (atomicNumber) {
    const isotopesList = this.getAllIsotopesOfElement(atomicNumber);
    const stableIsotopesList = [];
    for (const isotopeIndex in isotopesList) {
      const numProtons = isotopesList[isotopeIndex][0];
      const numNeutrons = isotopesList[isotopeIndex][1];
      if (this.isStable(numProtons, numNeutrons)) {
        stableIsotopesList.push([numProtons, numNeutrons, numProtons]);
      }
    }
    return stableIsotopesList;
  },
  // Get the half-life of a nuclide with the specified number of protons and neutrons.
  getNuclideHalfLife: function (numProtons, numNeutrons) {
    if (!HalfLifeConstants[numProtons]) {
      return undefined;
    }
    return HalfLifeConstants[numProtons][numNeutrons];
  },
  // Identifies whether a given nuclide exists
  doesExist: function (numProtons, numNeutrons) {
    const isStable = this.isStable(numProtons, numNeutrons);
    const halfLife = this.getNuclideHalfLife(numProtons, numNeutrons);
    return !(!isStable && halfLife === undefined);
  },
  // Return if the next isotope of the given nuclide exists
  doesNextIsotopeExist: function (numProtons, numNeutrons) {
    return this.getNuclideHalfLife(numProtons, numNeutrons + 1) !== undefined || this.isStable(numProtons, numNeutrons + 1);
  },
  // Return if the previous isotope of the given nuclide exists
  doesPreviousIsotopeExist: function (numProtons, numNeutrons) {
    return this.getNuclideHalfLife(numProtons, numNeutrons - 1) !== undefined || this.isStable(numProtons, numNeutrons - 1);
  },
  // Return if the next isotone of the given nuclide exists
  doesNextIsotoneExist: function (numProtons, numNeutrons) {
    return this.getNuclideHalfLife(numProtons + 1, numNeutrons) !== undefined || this.isStable(numProtons + 1, numNeutrons);
  },
  // Return if the previous isotone of the given nuclide exists
  doesPreviousIsotoneExist: function (numProtons, numNeutrons) {
    return this.getNuclideHalfLife(numProtons - 1, numNeutrons) !== undefined || this.isStable(numProtons - 1, numNeutrons);
  },
  // Return if the nuclide of the given nuclide minus one proton and minus one neutrons exists
  doesPreviousNuclideExist: function (numProtons, numNeutrons) {
    return this.getNuclideHalfLife(numProtons - 1, numNeutrons - 1) !== undefined || this.isStable(numProtons - 1, numNeutrons - 1);
  },
  // Get the available decays for an unstable nuclide. Returns an empty array if the decays are unknown or if the
  // nuclide does not exist or is stable.
  getAvailableDecays: function (numProtons, numNeutrons) {
    const allDecaysAndPercents = DECAYS_INFO_TABLE[numProtons][numNeutrons];

    // undefined means the nuclide is stable or does not exist, meaning there are no available decays
    // null the nuclide is unstable and the available decays are unknown
    if (allDecaysAndPercents === undefined || allDecaysAndPercents === null) {
      return [];
    }

    // the nuclide is unstable and the available decays are known
    else {
      const allDecays = Object.keys(allDecaysAndPercents);
      const basicDecays = [];
      for (let i = 0; i < allDecays.length; i++) {
        switch (allDecays[i]) {
          case 'B-':
            if (basicDecays.indexOf('BETA_MINUS_DECAY') === -1) {
              basicDecays.push('BETA_MINUS_DECAY');
            }
            break;
          case '2B-':
            break;
          case 'EC+B+':
            if (basicDecays.indexOf('BETA_PLUS_DECAY') === -1) {
              basicDecays.push('BETA_PLUS_DECAY');
            }
            break;
          case 'EC':
            if (basicDecays.indexOf('BETA_PLUS_DECAY') === -1) {
              basicDecays.push('BETA_PLUS_DECAY');
            }
            break;
          case 'B+':
            if (basicDecays.indexOf('BETA_PLUS_DECAY') === -1) {
              basicDecays.push('BETA_PLUS_DECAY');
            }
            break;
          case 'B++EC':
            break;
          case '2EC':
            if (basicDecays.indexOf('BETA_PLUS_DECAY') === -1) {
              basicDecays.push('BETA_PLUS_DECAY');
            }
            break;
          case '2B+':
            break;
          case 'A':
            if (basicDecays.indexOf('ALPHA_DECAY') === -1) {
              basicDecays.push('ALPHA_DECAY');
            }
            break;
          case 'P':
            if (basicDecays.indexOf('PROTON_EMISSION') === -1) {
              basicDecays.push('PROTON_EMISSION');
            }
            break;
          case 'N':
            if (basicDecays.indexOf('NEUTRON_EMISSION') === -1) {
              basicDecays.push('NEUTRON_EMISSION');
            }
            break;
          case '2P':
            if (basicDecays.indexOf('PROTON_EMISSION') === -1) {
              basicDecays.push('PROTON_EMISSION');
            }
            break;
          case '2N':
            if (basicDecays.indexOf('NEUTRON_EMISSION') === -1) {
              basicDecays.push('NEUTRON_EMISSION');
            }
            break;
          case 'B+A':
            if (basicDecays.indexOf('BETA_PLUS_DECAY') === -1) {
              basicDecays.push('BETA_PLUS_DECAY');
            }
            break;
          case 'ECA':
            break;
          case 'B-A':
            break;
          case 'B-N':
            break;
          case 'B-2N':
            break;
          case 'B-3N':
            break;
          case 'B-4N':
            break;
          case 'ECP':
            break;
          case 'B+P':
            break;
          case 'B-P':
            break;
          case 'EC2P':
            break;
          case 'B+2P':
            break;
          case '24Ne':
            break;
          case '34Si':
            break;
          case '12C':
            break;
          case 'B-F':
            break;
          default:
            break;
        }
      }
      return basicDecays;
    }
  },
  getAtomicRadius: function (numElectrons) {
    return mapElectronCountToRadius[numElectrons];
  }
};
shred.register('AtomIdentifier', AtomIdentifier);
export default AtomIdentifier;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsInNocmVkIiwiU2hyZWRTdHJpbmdzIiwiVFJBQ0VfQUJVTkRBTkNFIiwiaHlkcm9nZW5TdHJpbmciLCJoeWRyb2dlbiIsImhlbGl1bVN0cmluZyIsImhlbGl1bSIsImxpdGhpdW1TdHJpbmciLCJsaXRoaXVtIiwiYmVyeWxsaXVtU3RyaW5nIiwiYmVyeWxsaXVtIiwiYm9yb25TdHJpbmciLCJib3JvbiIsImNhcmJvblN0cmluZyIsImNhcmJvbiIsIm5pdHJvZ2VuU3RyaW5nIiwibml0cm9nZW4iLCJveHlnZW5TdHJpbmciLCJveHlnZW4iLCJmbHVvcmluZVN0cmluZyIsImZsdW9yaW5lIiwibmVvblN0cmluZyIsIm5lb24iLCJzb2RpdW1TdHJpbmciLCJzb2RpdW0iLCJtYWduZXNpdW1TdHJpbmciLCJtYWduZXNpdW0iLCJhbHVtaW51bVN0cmluZyIsImFsdW1pbnVtIiwic2lsaWNvblN0cmluZyIsInNpbGljb24iLCJwaG9zcGhvcnVzU3RyaW5nIiwicGhvc3Bob3J1cyIsInN1bGZ1clN0cmluZyIsInN1bGZ1ciIsImNobG9yaW5lU3RyaW5nIiwiY2hsb3JpbmUiLCJhcmdvblN0cmluZyIsImFyZ29uIiwicG90YXNzaXVtU3RyaW5nIiwicG90YXNzaXVtIiwiY2FsY2l1bVN0cmluZyIsImNhbGNpdW0iLCJzY2FuZGl1bVN0cmluZyIsInNjYW5kaXVtIiwidGl0YW5pdW1TdHJpbmciLCJ0aXRhbml1bSIsInZhbmFkaXVtU3RyaW5nIiwidmFuYWRpdW0iLCJjaHJvbWl1bVN0cmluZyIsImNocm9taXVtIiwibWFuZ2FuZXNlU3RyaW5nIiwibWFuZ2FuZXNlIiwiaXJvblN0cmluZyIsImlyb24iLCJjb2JhbHRTdHJpbmciLCJjb2JhbHQiLCJuaWNrZWxTdHJpbmciLCJuaWNrZWwiLCJjb3BwZXJTdHJpbmciLCJjb3BwZXIiLCJ6aW5jU3RyaW5nIiwiemluYyIsImdhbGxpdW1TdHJpbmciLCJnYWxsaXVtIiwiZ2VybWFuaXVtU3RyaW5nIiwiZ2VybWFuaXVtIiwiYXJzZW5pY1N0cmluZyIsImFyc2VuaWMiLCJzZWxlbml1bVN0cmluZyIsInNlbGVuaXVtIiwiYnJvbWluZVN0cmluZyIsImJyb21pbmUiLCJrcnlwdG9uU3RyaW5nIiwia3J5cHRvbiIsInJ1YmlkaXVtU3RyaW5nIiwicnViaWRpdW0iLCJzdHJvbnRpdW1TdHJpbmciLCJzdHJvbnRpdW0iLCJ5dHRyaXVtU3RyaW5nIiwieXR0cml1bSIsInppcmNvbml1bVN0cmluZyIsInppcmNvbml1bSIsIm5pb2JpdW1TdHJpbmciLCJuaW9iaXVtIiwibW9seWJkZW51bVN0cmluZyIsIm1vbHliZGVudW0iLCJ0ZWNobmV0aXVtU3RyaW5nIiwidGVjaG5ldGl1bSIsInJ1dGhlbml1bVN0cmluZyIsInJ1dGhlbml1bSIsInJob2RpdW1TdHJpbmciLCJyaG9kaXVtIiwicGFsbGFkaXVtU3RyaW5nIiwicGFsbGFkaXVtIiwic2lsdmVyU3RyaW5nIiwic2lsdmVyIiwiY2FkbWl1bVN0cmluZyIsImNhZG1pdW0iLCJpbmRpdW1TdHJpbmciLCJpbmRpdW0iLCJ0aW5TdHJpbmciLCJ0aW4iLCJhbnRpbW9ueVN0cmluZyIsImFudGltb255IiwidGVsbHVyaXVtU3RyaW5nIiwidGVsbHVyaXVtIiwiaW9kaW5lU3RyaW5nIiwiaW9kaW5lIiwieGVub25TdHJpbmciLCJ4ZW5vbiIsImNlc2l1bVN0cmluZyIsImNlc2l1bSIsImJhcml1bVN0cmluZyIsImJhcml1bSIsImxhbnRoYW51bVN0cmluZyIsImxhbnRoYW51bSIsImNlcml1bVN0cmluZyIsImNlcml1bSIsInByYXNlb2R5bWl1bVN0cmluZyIsInByYXNlb2R5bWl1bSIsIm5lb2R5bWl1bVN0cmluZyIsIm5lb2R5bWl1bSIsInByb21ldGhpdW1TdHJpbmciLCJwcm9tZXRoaXVtIiwic2FtYXJpdW1TdHJpbmciLCJzYW1hcml1bSIsImV1cm9waXVtU3RyaW5nIiwiZXVyb3BpdW0iLCJnYWRvbGluaXVtU3RyaW5nIiwiZ2Fkb2xpbml1bSIsInRlcmJpdW1TdHJpbmciLCJ0ZXJiaXVtIiwiZHlzcHJvc2l1bVN0cmluZyIsImR5c3Byb3NpdW0iLCJob2xtaXVtU3RyaW5nIiwiaG9sbWl1bSIsImVyYml1bVN0cmluZyIsImVyYml1bSIsInRodWxpdW1TdHJpbmciLCJ0aHVsaXVtIiwieXR0ZXJiaXVtU3RyaW5nIiwieXR0ZXJiaXVtIiwibHV0ZXRpdW1TdHJpbmciLCJsdXRldGl1bSIsImhhZm5pdW1TdHJpbmciLCJoYWZuaXVtIiwidGFudGFsdW1TdHJpbmciLCJ0YW50YWx1bSIsInR1bmdzdGVuU3RyaW5nIiwidHVuZ3N0ZW4iLCJyaGVuaXVtU3RyaW5nIiwicmhlbml1bSIsIm9zbWl1bVN0cmluZyIsIm9zbWl1bSIsImlyaWRpdW1TdHJpbmciLCJpcmlkaXVtIiwicGxhdGludW1TdHJpbmciLCJwbGF0aW51bSIsImdvbGRTdHJpbmciLCJnb2xkIiwibWVyY3VyeVN0cmluZyIsIm1lcmN1cnkiLCJ0aGFsbGl1bVN0cmluZyIsInRoYWxsaXVtIiwibGVhZFN0cmluZyIsImxlYWQiLCJiaXNtdXRoU3RyaW5nIiwiYmlzbXV0aCIsInBvbG9uaXVtU3RyaW5nIiwicG9sb25pdW0iLCJhc3RhdGluZVN0cmluZyIsImFzdGF0aW5lIiwicmFkb25TdHJpbmciLCJyYWRvbiIsImZyYW5jaXVtU3RyaW5nIiwiZnJhbmNpdW0iLCJyYWRpdW1TdHJpbmciLCJyYWRpdW0iLCJhY3Rpbml1bVN0cmluZyIsImFjdGluaXVtIiwidGhvcml1bVN0cmluZyIsInRob3JpdW0iLCJwcm90YWN0aW5pdW1TdHJpbmciLCJwcm90YWN0aW5pdW0iLCJ1cmFuaXVtU3RyaW5nIiwidXJhbml1bSIsIm5lcHR1bml1bVN0cmluZyIsIm5lcHR1bml1bSIsInBsdXRvbml1bVN0cmluZyIsInBsdXRvbml1bSIsImFtZXJpY2l1bVN0cmluZyIsImFtZXJpY2l1bSIsImN1cml1bVN0cmluZyIsImN1cml1bSIsImJlcmtlbGl1bVN0cmluZyIsImJlcmtlbGl1bSIsImNhbGlmb3JuaXVtU3RyaW5nIiwiY2FsaWZvcm5pdW0iLCJlaW5zdGVpbml1bVN0cmluZyIsImVpbnN0ZWluaXVtIiwiZmVybWl1bVN0cmluZyIsImZlcm1pdW0iLCJtZW5kZWxldml1bVN0cmluZyIsIm1lbmRlbGV2aXVtIiwibm9iZWxpdW1TdHJpbmciLCJub2JlbGl1bSIsImxhd3JlbmNpdW1TdHJpbmciLCJsYXdyZW5jaXVtIiwicnV0aGVyZm9yZGl1bVN0cmluZyIsInJ1dGhlcmZvcmRpdW0iLCJkdWJuaXVtU3RyaW5nIiwiZHVibml1bSIsInNlYWJvcmdpdW1TdHJpbmciLCJzZWFib3JnaXVtIiwiYm9ocml1bVN0cmluZyIsImJvaHJpdW0iLCJoYXNzaXVtU3RyaW5nIiwiaGFzc2l1bSIsIm1laXRuZXJpdW1TdHJpbmciLCJtZWl0bmVyaXVtIiwiZGFybXN0YWR0aXVtU3RyaW5nIiwiZGFybXN0YWR0aXVtIiwicm9lbnRnZW5pdW1TdHJpbmciLCJyb2VudGdlbml1bSIsImNvcGVybmljaXVtU3RyaW5nIiwiY29wZXJuaWNpdW0iLCJuaWhvbml1bVN0cmluZyIsIm5paG9uaXVtIiwiZmxlcm92aXVtU3RyaW5nIiwiZmxlcm92aXVtIiwibW9zY292aXVtU3RyaW5nIiwibW9zY292aXVtIiwibGl2ZXJtb3JpdW1TdHJpbmciLCJsaXZlcm1vcml1bSIsInRlbm5lc3NpbmVTdHJpbmciLCJ0ZW5uZXNzaW5lIiwib2dhbmVzc29uU3RyaW5nIiwib2dhbmVzc29uIiwibmFtZVRhYmxlIiwiZW5nbGlzaE5hbWVUYWJsZSIsInN5bWJvbFRhYmxlIiwic3RhYmxlRWxlbWVudFRhYmxlIiwibnVtTmV1dHJvbnNJbk1vc3RTdGFibGVJc290b3BlIiwibWFwRWxlY3Ryb25Db3VudFRvUmFkaXVzIiwiREVDQVlTX0lORk9fVEFCTEUiLCJJU09UT1BFX0lORk9fVEFCTEUiLCJhdG9taWNNYXNzIiwiYWJ1bmRhbmNlIiwic3RhbmRhcmRNYXNzVGFibGUiLCJIYWxmTGlmZUNvbnN0YW50cyIsIkF0b21JZGVudGlmaWVyIiwiZ2V0U3ltYm9sIiwibnVtUHJvdG9ucyIsImdldE5hbWUiLCJnZXRFbmdsaXNoTmFtZSIsImlzU3RhYmxlIiwibnVtTmV1dHJvbnMiLCJ0YWJsZUVudHJ5IiwiJCIsImluQXJyYXkiLCJnZXROdW1OZXV0cm9uc0luTW9zdENvbW1vbklzb3RvcGUiLCJhdG9taWNOdW1iZXIiLCJnZXRTdGFuZGFyZEF0b21pY01hc3MiLCJnZXRJc290b3BlQXRvbWljTWFzcyIsInByb3RvbnMiLCJuZXV0cm9ucyIsImdldE5hdHVyYWxBYnVuZGFuY2UiLCJpc290b3BlIiwibnVtRGVjaW1hbFBsYWNlcyIsImFzc2VydCIsInVuZGVmaW5lZCIsImFidW5kYW5jZVByb3BvcnRpb24iLCJwcm90b25Db3VudFByb3BlcnR5IiwiZ2V0IiwibWFzc051bWJlclByb3BlcnR5IiwidG9GaXhlZE51bWJlciIsImV4aXN0c0luVHJhY2VBbW91bnRzIiwiZ2V0QWxsSXNvdG9wZXNPZkVsZW1lbnQiLCJpc290b3Blc0xpc3QiLCJtYXNzTnVtYmVyIiwibW9sZWN1bGVOdW1iZXJMaXN0IiwicHVzaCIsImdldFN0YWJsZUlzb3RvcGVzT2ZFbGVtZW50Iiwic3RhYmxlSXNvdG9wZXNMaXN0IiwiaXNvdG9wZUluZGV4IiwiZ2V0TnVjbGlkZUhhbGZMaWZlIiwiZG9lc0V4aXN0IiwiaGFsZkxpZmUiLCJkb2VzTmV4dElzb3RvcGVFeGlzdCIsImRvZXNQcmV2aW91c0lzb3RvcGVFeGlzdCIsImRvZXNOZXh0SXNvdG9uZUV4aXN0IiwiZG9lc1ByZXZpb3VzSXNvdG9uZUV4aXN0IiwiZG9lc1ByZXZpb3VzTnVjbGlkZUV4aXN0IiwiZ2V0QXZhaWxhYmxlRGVjYXlzIiwiYWxsRGVjYXlzQW5kUGVyY2VudHMiLCJhbGxEZWNheXMiLCJPYmplY3QiLCJrZXlzIiwiYmFzaWNEZWNheXMiLCJpIiwibGVuZ3RoIiwiaW5kZXhPZiIsImdldEF0b21pY1JhZGl1cyIsIm51bUVsZWN0cm9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXRvbUlkZW50aWZpZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXRvbUlkZW50aWZpZXIgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gaWRlbnRpZnkgdmFyaW91cyB0aGluZ3MgYWJvdXQgYW4gYXRvbSBnaXZlbiBpdHMgY29uZmlndXJhdGlvbiwgc3VjaFxyXG4gKiBhcyBpdHMgbmFtZSwgY2hlbWljYWwgc3ltYm9scywgYW5kIHN0YWJsZSBpc290b3Blcy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgc2hyZWQgZnJvbSAnLi9zaHJlZC5qcyc7XHJcbmltcG9ydCBTaHJlZFN0cmluZ3MgZnJvbSAnLi9TaHJlZFN0cmluZ3MuanMnO1xyXG5cclxuLy8gQW4gYXJiaXRyYXJ5IHZhbHVlIHVzZWQgdG8gc2lnbmlmeSBhICd0cmFjZScgYWJ1bmRhbmNlLCBtZWFuaW5nIHRoYXQgYSB2ZXJ5IHNtYWxsIGFtb3VudCBvZiB0aGlzIGlzb3RvcGUgaXNcclxuLy8gcHJlc2VudCBvbiBFYXJ0aC5cclxuY29uc3QgVFJBQ0VfQUJVTkRBTkNFID0gMC4wMDAwMDAwMDAwMDE7XHJcblxyXG5jb25zdCBoeWRyb2dlblN0cmluZyA9IFNocmVkU3RyaW5ncy5oeWRyb2dlbjtcclxuY29uc3QgaGVsaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmhlbGl1bTtcclxuY29uc3QgbGl0aGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5saXRoaXVtO1xyXG5jb25zdCBiZXJ5bGxpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuYmVyeWxsaXVtO1xyXG5jb25zdCBib3JvblN0cmluZyA9IFNocmVkU3RyaW5ncy5ib3JvbjtcclxuY29uc3QgY2FyYm9uU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNhcmJvbjtcclxuY29uc3Qgbml0cm9nZW5TdHJpbmcgPSBTaHJlZFN0cmluZ3Mubml0cm9nZW47XHJcbmNvbnN0IG94eWdlblN0cmluZyA9IFNocmVkU3RyaW5ncy5veHlnZW47XHJcbmNvbnN0IGZsdW9yaW5lU3RyaW5nID0gU2hyZWRTdHJpbmdzLmZsdW9yaW5lO1xyXG5jb25zdCBuZW9uU3RyaW5nID0gU2hyZWRTdHJpbmdzLm5lb247XHJcbmNvbnN0IHNvZGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5zb2RpdW07XHJcbmNvbnN0IG1hZ25lc2l1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5tYWduZXNpdW07XHJcbmNvbnN0IGFsdW1pbnVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFsdW1pbnVtO1xyXG5jb25zdCBzaWxpY29uU3RyaW5nID0gU2hyZWRTdHJpbmdzLnNpbGljb247XHJcbmNvbnN0IHBob3NwaG9ydXNTdHJpbmcgPSBTaHJlZFN0cmluZ3MucGhvc3Bob3J1cztcclxuY29uc3Qgc3VsZnVyU3RyaW5nID0gU2hyZWRTdHJpbmdzLnN1bGZ1cjtcclxuY29uc3QgY2hsb3JpbmVTdHJpbmcgPSBTaHJlZFN0cmluZ3MuY2hsb3JpbmU7XHJcbmNvbnN0IGFyZ29uU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFyZ29uO1xyXG5jb25zdCBwb3Rhc3NpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MucG90YXNzaXVtO1xyXG5jb25zdCBjYWxjaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNhbGNpdW07XHJcbmNvbnN0IHNjYW5kaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnNjYW5kaXVtO1xyXG5jb25zdCB0aXRhbml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy50aXRhbml1bTtcclxuY29uc3QgdmFuYWRpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MudmFuYWRpdW07XHJcbmNvbnN0IGNocm9taXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNocm9taXVtO1xyXG5jb25zdCBtYW5nYW5lc2VTdHJpbmcgPSBTaHJlZFN0cmluZ3MubWFuZ2FuZXNlO1xyXG5jb25zdCBpcm9uU3RyaW5nID0gU2hyZWRTdHJpbmdzLmlyb247XHJcbmNvbnN0IGNvYmFsdFN0cmluZyA9IFNocmVkU3RyaW5ncy5jb2JhbHQ7XHJcbmNvbnN0IG5pY2tlbFN0cmluZyA9IFNocmVkU3RyaW5ncy5uaWNrZWw7XHJcbmNvbnN0IGNvcHBlclN0cmluZyA9IFNocmVkU3RyaW5ncy5jb3BwZXI7XHJcbmNvbnN0IHppbmNTdHJpbmcgPSBTaHJlZFN0cmluZ3MuemluYztcclxuY29uc3QgZ2FsbGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5nYWxsaXVtO1xyXG5jb25zdCBnZXJtYW5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZ2VybWFuaXVtO1xyXG5jb25zdCBhcnNlbmljU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFyc2VuaWM7XHJcbmNvbnN0IHNlbGVuaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnNlbGVuaXVtO1xyXG5jb25zdCBicm9taW5lU3RyaW5nID0gU2hyZWRTdHJpbmdzLmJyb21pbmU7XHJcbmNvbnN0IGtyeXB0b25TdHJpbmcgPSBTaHJlZFN0cmluZ3Mua3J5cHRvbjtcclxuY29uc3QgcnViaWRpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MucnViaWRpdW07XHJcbmNvbnN0IHN0cm9udGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5zdHJvbnRpdW07XHJcbmNvbnN0IHl0dHJpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MueXR0cml1bTtcclxuY29uc3QgemlyY29uaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnppcmNvbml1bTtcclxuY29uc3QgbmlvYml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5uaW9iaXVtO1xyXG5jb25zdCBtb2x5YmRlbnVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm1vbHliZGVudW07XHJcbmNvbnN0IHRlY2huZXRpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MudGVjaG5ldGl1bTtcclxuY29uc3QgcnV0aGVuaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnJ1dGhlbml1bTtcclxuY29uc3QgcmhvZGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5yaG9kaXVtO1xyXG5jb25zdCBwYWxsYWRpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MucGFsbGFkaXVtO1xyXG5jb25zdCBzaWx2ZXJTdHJpbmcgPSBTaHJlZFN0cmluZ3Muc2lsdmVyO1xyXG5jb25zdCBjYWRtaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNhZG1pdW07XHJcbmNvbnN0IGluZGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5pbmRpdW07XHJcbmNvbnN0IHRpblN0cmluZyA9IFNocmVkU3RyaW5ncy50aW47XHJcbmNvbnN0IGFudGltb255U3RyaW5nID0gU2hyZWRTdHJpbmdzLmFudGltb255O1xyXG5jb25zdCB0ZWxsdXJpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MudGVsbHVyaXVtO1xyXG5jb25zdCBpb2RpbmVTdHJpbmcgPSBTaHJlZFN0cmluZ3MuaW9kaW5lO1xyXG5jb25zdCB4ZW5vblN0cmluZyA9IFNocmVkU3RyaW5ncy54ZW5vbjtcclxuY29uc3QgY2VzaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNlc2l1bTtcclxuY29uc3QgYmFyaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmJhcml1bTtcclxuY29uc3QgbGFudGhhbnVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmxhbnRoYW51bTtcclxuY29uc3QgY2VyaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmNlcml1bTtcclxuY29uc3QgcHJhc2VvZHltaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnByYXNlb2R5bWl1bTtcclxuY29uc3QgbmVvZHltaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm5lb2R5bWl1bTtcclxuY29uc3QgcHJvbWV0aGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5wcm9tZXRoaXVtO1xyXG5jb25zdCBzYW1hcml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5zYW1hcml1bTtcclxuY29uc3QgZXVyb3BpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZXVyb3BpdW07XHJcbmNvbnN0IGdhZG9saW5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZ2Fkb2xpbml1bTtcclxuY29uc3QgdGVyYml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy50ZXJiaXVtO1xyXG5jb25zdCBkeXNwcm9zaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmR5c3Byb3NpdW07XHJcbmNvbnN0IGhvbG1pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuaG9sbWl1bTtcclxuY29uc3QgZXJiaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmVyYml1bTtcclxuY29uc3QgdGh1bGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy50aHVsaXVtO1xyXG5jb25zdCB5dHRlcmJpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MueXR0ZXJiaXVtO1xyXG5jb25zdCBsdXRldGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5sdXRldGl1bTtcclxuY29uc3QgaGFmbml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5oYWZuaXVtO1xyXG5jb25zdCB0YW50YWx1bVN0cmluZyA9IFNocmVkU3RyaW5ncy50YW50YWx1bTtcclxuY29uc3QgdHVuZ3N0ZW5TdHJpbmcgPSBTaHJlZFN0cmluZ3MudHVuZ3N0ZW47XHJcbmNvbnN0IHJoZW5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3Mucmhlbml1bTtcclxuY29uc3Qgb3NtaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm9zbWl1bTtcclxuY29uc3QgaXJpZGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5pcmlkaXVtO1xyXG5jb25zdCBwbGF0aW51bVN0cmluZyA9IFNocmVkU3RyaW5ncy5wbGF0aW51bTtcclxuY29uc3QgZ29sZFN0cmluZyA9IFNocmVkU3RyaW5ncy5nb2xkO1xyXG5jb25zdCBtZXJjdXJ5U3RyaW5nID0gU2hyZWRTdHJpbmdzLm1lcmN1cnk7XHJcbmNvbnN0IHRoYWxsaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnRoYWxsaXVtO1xyXG5jb25zdCBsZWFkU3RyaW5nID0gU2hyZWRTdHJpbmdzLmxlYWQ7XHJcbmNvbnN0IGJpc211dGhTdHJpbmcgPSBTaHJlZFN0cmluZ3MuYmlzbXV0aDtcclxuY29uc3QgcG9sb25pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MucG9sb25pdW07XHJcbmNvbnN0IGFzdGF0aW5lU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFzdGF0aW5lO1xyXG5jb25zdCByYWRvblN0cmluZyA9IFNocmVkU3RyaW5ncy5yYWRvbjtcclxuY29uc3QgZnJhbmNpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZnJhbmNpdW07XHJcbmNvbnN0IHJhZGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5yYWRpdW07XHJcbmNvbnN0IGFjdGluaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFjdGluaXVtO1xyXG5jb25zdCB0aG9yaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnRob3JpdW07XHJcbmNvbnN0IHByb3RhY3Rpbml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5wcm90YWN0aW5pdW07XHJcbmNvbnN0IHVyYW5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MudXJhbml1bTtcclxuY29uc3QgbmVwdHVuaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm5lcHR1bml1bTtcclxuY29uc3QgcGx1dG9uaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnBsdXRvbml1bTtcclxuY29uc3QgYW1lcmljaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmFtZXJpY2l1bTtcclxuY29uc3QgY3VyaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmN1cml1bTtcclxuY29uc3QgYmVya2VsaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmJlcmtlbGl1bTtcclxuY29uc3QgY2FsaWZvcm5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuY2FsaWZvcm5pdW07XHJcbmNvbnN0IGVpbnN0ZWluaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmVpbnN0ZWluaXVtO1xyXG5jb25zdCBmZXJtaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmZlcm1pdW07XHJcbmNvbnN0IG1lbmRlbGV2aXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm1lbmRlbGV2aXVtO1xyXG5jb25zdCBub2JlbGl1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5ub2JlbGl1bTtcclxuY29uc3QgbGF3cmVuY2l1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5sYXdyZW5jaXVtO1xyXG5jb25zdCBydXRoZXJmb3JkaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLnJ1dGhlcmZvcmRpdW07XHJcbmNvbnN0IGR1Ym5pdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZHVibml1bTtcclxuY29uc3Qgc2VhYm9yZ2l1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5zZWFib3JnaXVtO1xyXG5jb25zdCBib2hyaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLmJvaHJpdW07XHJcbmNvbnN0IGhhc3NpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuaGFzc2l1bTtcclxuY29uc3QgbWVpdG5lcml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5tZWl0bmVyaXVtO1xyXG5jb25zdCBkYXJtc3RhZHRpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZGFybXN0YWR0aXVtO1xyXG5jb25zdCByb2VudGdlbml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5yb2VudGdlbml1bTtcclxuY29uc3QgY29wZXJuaWNpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuY29wZXJuaWNpdW07XHJcbmNvbnN0IG5paG9uaXVtU3RyaW5nID0gU2hyZWRTdHJpbmdzLm5paG9uaXVtO1xyXG5jb25zdCBmbGVyb3ZpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MuZmxlcm92aXVtO1xyXG5jb25zdCBtb3Njb3ZpdW1TdHJpbmcgPSBTaHJlZFN0cmluZ3MubW9zY292aXVtO1xyXG5jb25zdCBsaXZlcm1vcml1bVN0cmluZyA9IFNocmVkU3RyaW5ncy5saXZlcm1vcml1bTtcclxuY29uc3QgdGVubmVzc2luZVN0cmluZyA9IFNocmVkU3RyaW5ncy50ZW5uZXNzaW5lO1xyXG5jb25zdCBvZ2FuZXNzb25TdHJpbmcgPSBTaHJlZFN0cmluZ3Mub2dhbmVzc29uO1xyXG5cclxuY29uc3QgbmFtZVRhYmxlID0gW1xyXG4gICcnLCAvLyBObyBlbGVtZW50XHJcbiAgaHlkcm9nZW5TdHJpbmcsXHJcbiAgaGVsaXVtU3RyaW5nLFxyXG4gIGxpdGhpdW1TdHJpbmcsXHJcbiAgYmVyeWxsaXVtU3RyaW5nLFxyXG4gIGJvcm9uU3RyaW5nLFxyXG4gIGNhcmJvblN0cmluZyxcclxuICBuaXRyb2dlblN0cmluZyxcclxuICBveHlnZW5TdHJpbmcsXHJcbiAgZmx1b3JpbmVTdHJpbmcsXHJcbiAgbmVvblN0cmluZyxcclxuICBzb2RpdW1TdHJpbmcsXHJcbiAgbWFnbmVzaXVtU3RyaW5nLFxyXG4gIGFsdW1pbnVtU3RyaW5nLFxyXG4gIHNpbGljb25TdHJpbmcsXHJcbiAgcGhvc3Bob3J1c1N0cmluZyxcclxuICBzdWxmdXJTdHJpbmcsXHJcbiAgY2hsb3JpbmVTdHJpbmcsXHJcbiAgYXJnb25TdHJpbmcsXHJcbiAgcG90YXNzaXVtU3RyaW5nLFxyXG4gIGNhbGNpdW1TdHJpbmcsXHJcbiAgc2NhbmRpdW1TdHJpbmcsXHJcbiAgdGl0YW5pdW1TdHJpbmcsXHJcbiAgdmFuYWRpdW1TdHJpbmcsXHJcbiAgY2hyb21pdW1TdHJpbmcsXHJcbiAgbWFuZ2FuZXNlU3RyaW5nLFxyXG4gIGlyb25TdHJpbmcsXHJcbiAgY29iYWx0U3RyaW5nLFxyXG4gIG5pY2tlbFN0cmluZyxcclxuICBjb3BwZXJTdHJpbmcsXHJcbiAgemluY1N0cmluZyxcclxuICBnYWxsaXVtU3RyaW5nLFxyXG4gIGdlcm1hbml1bVN0cmluZyxcclxuICBhcnNlbmljU3RyaW5nLFxyXG4gIHNlbGVuaXVtU3RyaW5nLFxyXG4gIGJyb21pbmVTdHJpbmcsXHJcbiAga3J5cHRvblN0cmluZyxcclxuICBydWJpZGl1bVN0cmluZyxcclxuICBzdHJvbnRpdW1TdHJpbmcsXHJcbiAgeXR0cml1bVN0cmluZyxcclxuICB6aXJjb25pdW1TdHJpbmcsXHJcbiAgbmlvYml1bVN0cmluZyxcclxuICBtb2x5YmRlbnVtU3RyaW5nLFxyXG4gIHRlY2huZXRpdW1TdHJpbmcsXHJcbiAgcnV0aGVuaXVtU3RyaW5nLFxyXG4gIHJob2RpdW1TdHJpbmcsXHJcbiAgcGFsbGFkaXVtU3RyaW5nLFxyXG4gIHNpbHZlclN0cmluZyxcclxuICBjYWRtaXVtU3RyaW5nLFxyXG4gIGluZGl1bVN0cmluZyxcclxuICB0aW5TdHJpbmcsXHJcbiAgYW50aW1vbnlTdHJpbmcsXHJcbiAgdGVsbHVyaXVtU3RyaW5nLFxyXG4gIGlvZGluZVN0cmluZyxcclxuICB4ZW5vblN0cmluZyxcclxuICBjZXNpdW1TdHJpbmcsXHJcbiAgYmFyaXVtU3RyaW5nLFxyXG4gIGxhbnRoYW51bVN0cmluZyxcclxuICBjZXJpdW1TdHJpbmcsXHJcbiAgcHJhc2VvZHltaXVtU3RyaW5nLFxyXG4gIG5lb2R5bWl1bVN0cmluZyxcclxuICBwcm9tZXRoaXVtU3RyaW5nLFxyXG4gIHNhbWFyaXVtU3RyaW5nLFxyXG4gIGV1cm9waXVtU3RyaW5nLFxyXG4gIGdhZG9saW5pdW1TdHJpbmcsXHJcbiAgdGVyYml1bVN0cmluZyxcclxuICBkeXNwcm9zaXVtU3RyaW5nLFxyXG4gIGhvbG1pdW1TdHJpbmcsXHJcbiAgZXJiaXVtU3RyaW5nLFxyXG4gIHRodWxpdW1TdHJpbmcsXHJcbiAgeXR0ZXJiaXVtU3RyaW5nLFxyXG4gIGx1dGV0aXVtU3RyaW5nLFxyXG4gIGhhZm5pdW1TdHJpbmcsXHJcbiAgdGFudGFsdW1TdHJpbmcsXHJcbiAgdHVuZ3N0ZW5TdHJpbmcsXHJcbiAgcmhlbml1bVN0cmluZyxcclxuICBvc21pdW1TdHJpbmcsXHJcbiAgaXJpZGl1bVN0cmluZyxcclxuICBwbGF0aW51bVN0cmluZyxcclxuICBnb2xkU3RyaW5nLFxyXG4gIG1lcmN1cnlTdHJpbmcsXHJcbiAgdGhhbGxpdW1TdHJpbmcsXHJcbiAgbGVhZFN0cmluZyxcclxuICBiaXNtdXRoU3RyaW5nLFxyXG4gIHBvbG9uaXVtU3RyaW5nLFxyXG4gIGFzdGF0aW5lU3RyaW5nLFxyXG4gIHJhZG9uU3RyaW5nLFxyXG4gIGZyYW5jaXVtU3RyaW5nLFxyXG4gIHJhZGl1bVN0cmluZyxcclxuICBhY3Rpbml1bVN0cmluZyxcclxuICB0aG9yaXVtU3RyaW5nLFxyXG4gIHByb3RhY3Rpbml1bVN0cmluZyxcclxuICB1cmFuaXVtU3RyaW5nLFxyXG4gIG5lcHR1bml1bVN0cmluZyxcclxuICBwbHV0b25pdW1TdHJpbmcsXHJcbiAgYW1lcmljaXVtU3RyaW5nLFxyXG4gIGN1cml1bVN0cmluZyxcclxuICBiZXJrZWxpdW1TdHJpbmcsXHJcbiAgY2FsaWZvcm5pdW1TdHJpbmcsXHJcbiAgZWluc3RlaW5pdW1TdHJpbmcsXHJcbiAgZmVybWl1bVN0cmluZyxcclxuICBtZW5kZWxldml1bVN0cmluZyxcclxuICBub2JlbGl1bVN0cmluZyxcclxuICBsYXdyZW5jaXVtU3RyaW5nLFxyXG4gIHJ1dGhlcmZvcmRpdW1TdHJpbmcsXHJcbiAgZHVibml1bVN0cmluZyxcclxuICBzZWFib3JnaXVtU3RyaW5nLFxyXG4gIGJvaHJpdW1TdHJpbmcsXHJcbiAgaGFzc2l1bVN0cmluZyxcclxuICBtZWl0bmVyaXVtU3RyaW5nLFxyXG4gIGRhcm1zdGFkdGl1bVN0cmluZyxcclxuICByb2VudGdlbml1bVN0cmluZyxcclxuICBjb3Blcm5pY2l1bVN0cmluZyxcclxuICBuaWhvbml1bVN0cmluZyxcclxuICBmbGVyb3ZpdW1TdHJpbmcsXHJcbiAgbW9zY292aXVtU3RyaW5nLFxyXG4gIGxpdmVybW9yaXVtU3RyaW5nLFxyXG4gIHRlbm5lc3NpbmVTdHJpbmcsXHJcbiAgb2dhbmVzc29uU3RyaW5nXHJcbl07XHJcblxyXG4vLyBVc2VkIGluIFBoRVQtaU8gZGF0YSBzdHJlYW1zXHJcbmNvbnN0IGVuZ2xpc2hOYW1lVGFibGUgPSBbXHJcbiAgJycsIC8vIE5vIGVsZW1lbnRcclxuICAnaHlkcm9nZW4nLFxyXG4gICdoZWxpdW0nLFxyXG4gICdsaXRoaXVtJyxcclxuICAnYmVyeWxsaXVtJyxcclxuICAnYm9yb24nLFxyXG4gICdjYXJib24nLFxyXG4gICduaXRyb2dlbicsXHJcbiAgJ294eWdlbicsXHJcbiAgJ2ZsdW9yaW5lJyxcclxuICAnbmVvbicsXHJcbiAgJ3NvZGl1bScsXHJcbiAgJ21hZ25lc2l1bScsXHJcbiAgJ2FsdW1pbnVtJyxcclxuICAnc2lsaWNvbicsXHJcbiAgJ3Bob3NwaG9ydXMnLFxyXG4gICdzdWxmdXInLFxyXG4gICdjaGxvcmluZScsXHJcbiAgJ2FyZ29uJyxcclxuICAncG90YXNzaXVtJyxcclxuICAnY2FsY2l1bScsXHJcbiAgJ3NjYW5kaXVtJyxcclxuICAndGl0YW5pdW0nLFxyXG4gICd2YW5hZGl1bScsXHJcbiAgJ2Nocm9taXVtJyxcclxuICAnbWFuZ2FuZXNlJyxcclxuICAnaXJvbicsXHJcbiAgJ2NvYmFsdCcsXHJcbiAgJ25pY2tlbCcsXHJcbiAgJ2NvcHBlcicsXHJcbiAgJ3ppbmMnLFxyXG4gICdnYWxsaXVtJyxcclxuICAnZ2VybWFuaXVtJyxcclxuICAnYXJzZW5pYycsXHJcbiAgJ3NlbGVuaXVtJyxcclxuICAnYnJvbWluZScsXHJcbiAgJ2tyeXB0b24nLFxyXG4gICdydWJpZGl1bScsXHJcbiAgJ3N0cm9udGl1bScsXHJcbiAgJ3l0dHJpdW0nLFxyXG4gICd6aXJjb25pdW0nLFxyXG4gICduaW9iaXVtJyxcclxuICAnbW9seWJkZW51bScsXHJcbiAgJ3RlY2huZXRpdW0nLFxyXG4gICdydXRoZW5pdW0nLFxyXG4gICdyaG9kaXVtJyxcclxuICAncGFsbGFkaXVtJyxcclxuICAnc2lsdmVyJyxcclxuICAnY2FkbWl1bScsXHJcbiAgJ2luZGl1bScsXHJcbiAgJ3RpbicsXHJcbiAgJ2FudGltb255JyxcclxuICAndGVsbHVyaXVtJyxcclxuICAnaW9kaW5lJyxcclxuICAneGVub24nLFxyXG4gICdjZXNpdW0nLFxyXG4gICdiYXJpdW0nLFxyXG4gICdsYW50aGFudW0nLFxyXG4gICdjZXJpdW0nLFxyXG4gICdwcmFzZW9keW1pdW0nLFxyXG4gICduZW9keW1pdW0nLFxyXG4gICdwcm9tZXRoaXVtJyxcclxuICAnc2FtYXJpdW0nLFxyXG4gICdldXJvcGl1bScsXHJcbiAgJ2dhZG9saW5pdW0nLFxyXG4gICd0ZXJiaXVtJyxcclxuICAnZHlzcHJvc2l1bScsXHJcbiAgJ2hvbG1pdW0nLFxyXG4gICdlcmJpdW0nLFxyXG4gICd0aHVsaXVtJyxcclxuICAneXR0ZXJiaXVtJyxcclxuICAnbHV0ZXRpdW0nLFxyXG4gICdoYWZuaXVtJyxcclxuICAndGFudGFsdW0nLFxyXG4gICd0dW5nc3RlbicsXHJcbiAgJ3JoZW5pdW0nLFxyXG4gICdvc21pdW0nLFxyXG4gICdpcmlkaXVtJyxcclxuICAncGxhdGludW0nLFxyXG4gICdnb2xkJyxcclxuICAnbWVyY3VyeScsXHJcbiAgJ3RoYWxsaXVtJyxcclxuICAnbGVhZCcsXHJcbiAgJ2Jpc211dGgnLFxyXG4gICdwb2xvbml1bScsXHJcbiAgJ2FzdGF0aW5lJyxcclxuICAncmFkb24nLFxyXG4gICdmcmFuY2l1bScsXHJcbiAgJ3JhZGl1bScsXHJcbiAgJ2FjdGluaXVtJyxcclxuICAndGhvcml1bScsXHJcbiAgJ3Byb3RhY3Rpbml1bScsXHJcbiAgJ3VyYW5pdW0nLFxyXG4gICduZXB0dW5pdW0nLFxyXG4gICdwbHV0b25pdW0nLFxyXG4gICdhbWVyaWNpdW0nLFxyXG4gICdjdXJpdW0nLFxyXG4gICdiZXJrZWxpdW0nLFxyXG4gICdjYWxpZm9ybml1bScsXHJcbiAgJ2VpbnN0ZWluaXVtJyxcclxuICAnZmVybWl1bScsXHJcbiAgJ21lbmRlbGV2aXVtJyxcclxuICAnbm9iZWxpdW0nLFxyXG4gICdsYXdyZW5jaXVtJyxcclxuICAncnV0aGVyZm9yZGl1bScsXHJcbiAgJ2R1Ym5pdW0nLFxyXG4gICdzZWFib3JnaXVtJyxcclxuICAnYm9ocml1bScsXHJcbiAgJ2hhc3NpdW0nLFxyXG4gICdtZWl0bmVyaXVtJyxcclxuICAnZGFybXN0YWR0aXVtJyxcclxuICAncm9lbnRnZW5pdW0nLFxyXG4gICdjb3Blcm5pY3VtJyxcclxuICAnbmlob25pdW0nLFxyXG4gICdmbGVyb3ZpdW0nLFxyXG4gICdtb3Njb3ZpdW0nLFxyXG4gICdsaXZlcm1vcml1bScsXHJcbiAgJ3Rlbm5lc3NpbmUnLFxyXG4gICdvZ2FuZXNzb24nXHJcbl07XHJcblxyXG5jb25zdCBzeW1ib2xUYWJsZSA9IFtcclxuICAnLScsIC8vIDAsIE5PIEVMRU1FTlRcclxuICAnSCcsIC8vIDEsIEhZRFJPR0VOXHJcbiAgJ0hlJywgLy8gMiwgSEVMSVVNXHJcbiAgJ0xpJywgLy8gMywgTElUSElVTVxyXG4gICdCZScsIC8vIDQsIEJFUllMTElVTVxyXG4gICdCJywgLy8gNSwgQk9ST05cclxuICAnQycsIC8vIDYsIENBUkJPTlxyXG4gICdOJywgLy8gNywgTklUUk9HRU5cclxuICAnTycsIC8vIDgsIE9YWUdFTlxyXG4gICdGJywgLy8gOSwgRkxVT1JJTkVcclxuICAnTmUnLCAvLyAxMCwgTkVPTlxyXG4gICdOYScsIC8vIDExLCBTT0RJVU1cclxuICAnTWcnLCAvLyAxMiwgTUFHTkVTSVVNXHJcbiAgJ0FsJywgLy8gMTMsIEFMVU1JTlVNXHJcbiAgJ1NpJywgLy8gMTQsIFNJTElDT05cclxuICAnUCcsIC8vIDE1LCBQSE9TUEhPUlVTXHJcbiAgJ1MnLCAvLyAxNiwgU1VMRlVSXHJcbiAgJ0NsJywgLy8gMTcsIENITE9SSU5FXHJcbiAgJ0FyJywgLy8gMTgsIEFSR09OXHJcbiAgJ0snLCAvLyAxOSwgUE9UQVNTSVVNXHJcbiAgJ0NhJywgLy8gMjAsIENBTENJVU1cclxuICAnU2MnLCAvLyAyMSwgU0NBTkRJVU1cclxuICAnVGknLCAvLyAyMiwgVElUQU5JVU1cclxuICAnVicsIC8vIDIzLCBWQU5BRElVTVxyXG4gICdDcicsIC8vIDI0LCBDSFJPTUlVTVxyXG4gICdNbicsIC8vIDI1LCBNQU5HQU5FU0VcclxuICAnRmUnLCAvLyAyNiwgSVJPTlxyXG4gICdDbycsIC8vIDI3LCBDT0JBTFRcclxuICAnTmknLCAvLyAyOCwgTklDS0VMXHJcbiAgJ0N1JywgLy8gMjksIENPUFBFUlxyXG4gICdabicsIC8vIDMwLCBaSU5DXHJcbiAgJ0dhJywgLy8gMzEsIEdBTExJVU1cclxuICAnR2UnLCAvLyAzMiwgR0VSTUFOSVVNXHJcbiAgJ0FzJywgLy8gMzMsIEFSU0VOSUNcclxuICAnU2UnLCAvLyAzNCwgU0VMRU5JVU1cclxuICAnQnInLCAvLyAzNSwgQlJPTUlORVxyXG4gICdLcicsIC8vIDM2LCBLUllQVE9OXHJcbiAgJ1JiJywgLy8gMzcsIFJVQklESVVNXHJcbiAgJ1NyJywgLy8gMzgsIFNUUk9OVElVTVxyXG4gICdZJywgLy8gMzksIFlUVFJJVU1cclxuICAnWnInLCAvLyA0MCwgWklSQ09OSVVNXHJcbiAgJ05iJywgLy8gNDEsIE5JT0JJVU1cclxuICAnTW8nLCAvLyA0MiwgTU9MWUJERU5VTVxyXG4gICdUYycsIC8vIDQzLCBURUNITkVUSVVNXHJcbiAgJ1J1JywgLy8gNDQsIFJVVEhFTklVTVxyXG4gICdSaCcsIC8vIDQ1LCBSSE9ESVVNXHJcbiAgJ1BkJywgLy8gNDYsIFBBTExBRElVTVxyXG4gICdBZycsIC8vIDQ3LCBTSUxWRVJcclxuICAnQ2QnLCAvLyA0OCwgQ0FETUlVTVxyXG4gICdJbicsIC8vIDQ5LCBJTkRJVU1cclxuICAnU24nLCAvLyA1MCwgVElOXHJcbiAgJ1NiJywgLy8gNTEsIEFOVElNT05ZXHJcbiAgJ1RlJywgLy8gNTIsIFRFTExVUklVTVxyXG4gICdJJywgLy8gNTMsIElPRElORVxyXG4gICdYZScsIC8vIDU0LCBYRU5PTlxyXG4gICdDcycsIC8vIDU1LCBDQUVTSVVNXHJcbiAgJ0JhJywgLy8gNTYsIEJBUklVTVxyXG4gICdMYScsIC8vIDU3LCBMQU5USEFOVU1cclxuICAnQ2UnLCAvLyA1OCwgQ0VSSVVNXHJcbiAgJ1ByJywgLy8gNTksIFBSQVNFT0RZTUlVTVxyXG4gICdOZCcsIC8vIDYwLCBORU9EWU1JVU1cclxuICAnUG0nLCAvLyA2MSwgUFJPTUVUSElVTVxyXG4gICdTbScsIC8vIDYyLCBTQU1BUklVTVxyXG4gICdFdScsIC8vIDYzLCBFVVJPUElVTVxyXG4gICdHZCcsIC8vIDY0LCBHQURPTElOSVVNXHJcbiAgJ1RiJywgLy8gNjUsIFRFUkJJVU1cclxuICAnRHknLCAvLyA2NiwgRFlTUFJPU0lVTVxyXG4gICdIbycsIC8vIDY3LCBIT0xNSVVNXHJcbiAgJ0VyJywgLy8gNjgsIEVSQklVTVxyXG4gICdUbScsIC8vIDY5LCBUSFVMSVVNXHJcbiAgJ1liJywgLy8gNzAsIFlUVEVSQklVTVxyXG4gICdMdScsIC8vIDcxLCBMVVRFVElVTVxyXG4gICdIZicsIC8vIDcyLCBIQUZOSVVNXHJcbiAgJ1RhJywgLy8gNzMsIFRBTlRBTFVNXHJcbiAgJ1cnLCAvLyA3NCwgVFVOR1NURU5cclxuICAnUmUnLCAvLyA3NSwgUkhFTklVTVxyXG4gICdPcycsIC8vIDc2LCBPU01JVU1cclxuICAnSXInLCAvLyA3NywgSVJJRElVTVxyXG4gICdQdCcsIC8vIDc4LCBQTEFUSU5VTVxyXG4gICdBdScsIC8vIDc5LCBHT0xEXHJcbiAgJ0hnJywgLy8gODAsIE1FUkNVUllcclxuICAnVGwnLCAvLyA4MSwgVEhBTExJVU1cclxuICAnUGInLCAvLyA4MiwgTEVBRFxyXG4gICdCaScsIC8vIDgzLCBCSVNNVVRIXHJcbiAgJ1BvJywgLy8gODQsIFBPTE9OSVVNXHJcbiAgJ0F0JywgLy8gODUsIEFTVEFUSU5FXHJcbiAgJ1JuJywgLy8gODYsIFJBRE9OXHJcbiAgJ0ZyJywgLy8gODcsIEZSQU5DSVVNXHJcbiAgJ1JhJywgLy8gODgsIFJBRElVTVxyXG4gICdBYycsIC8vIDg5LCBBQ1RJTklVTVxyXG4gICdUaCcsIC8vIDkwLCBUSE9SSVVNXHJcbiAgJ1BhJywgLy8gOTEsIFBST1RBQ1RJTklVTVxyXG4gICdVJywgLy8gOTIsIFVSQU5JVU1cclxuICAnTnAnLCAvLyA5MywgTkVQVFVOSVVNXHJcbiAgJ1B1JywgLy8gOTQsIFBMVVRPTklVTVxyXG4gICdBbScsIC8vIDk1LCBBTUVSSUNJVU1cclxuICAnQ20nLCAvLyA5NiwgQ1VSSVVNXHJcbiAgJ0JrJywgLy8gOTcsIEJFUktFTElVTVxyXG4gICdDZicsIC8vIDk4LCBDQUxJRk9STklVTVxyXG4gICdFcycsIC8vIDk5LCBFSU5TVEVJTklVTVxyXG4gICdGbScsIC8vIDEwMCwgRkVSTUlVTVxyXG4gICdNZCcsIC8vIDEwMSwgTUVOREVMRVZJVU1cclxuICAnTm8nLCAvLyAxMDIsIE5PQkVMSVVNXHJcbiAgJ0xyJywgLy8gMTAzLCBMQVdSRU5DSVVNXHJcbiAgJ1JmJywgLy8gMTA0LCBSVVRIRVJGT1JESVVNXHJcbiAgJ0RiJywgLy8gMTA1LCBEVUJOSVVNXHJcbiAgJ1NnJywgLy8gMTA2LCBTRUFCT1JHSVVNXHJcbiAgJ0JoJywgLy8gMTA3LCBCT0hSSVVNXHJcbiAgJ0hzJywgLy8gMTA4LCBIQVNTSVVNXHJcbiAgJ010JywgLy8gMTA5LCBNRUlUTkVSSVVNXHJcbiAgJ0RzJywgLy8gMTEwLCBEQVJNU1RBRFRJVU1cclxuICAnUmcnLCAvLyAxMTEsIFJPRU5UR0VOSVVNXHJcbiAgJ0NuJywgLy8gMTEyLCBDT1BFUk5JQ0lVTVxyXG4gICdOaCcsIC8vIDExMywgTklIT05JVU1cclxuICAnRmwnLCAvLyAxMTQsIEZMRVJPVklVTVxyXG4gICdNYycsIC8vIDExNSwgTU9TQ09WSVVNXHJcbiAgJ0x2JywgLy8gMTE2LCBMSVZFUk1PUklVTVxyXG4gICdUcycsIC8vIDExNywgVEVOTkVTU0lORVxyXG4gICdPZycgIC8vIDExOCwgT0dBTkVTU09OXHJcblxyXG5dO1xyXG5cclxuLy8gVGFibGUgb2Ygc3RhYmxlIGVsZW1lbnRzLCBpbmRleGVkIGJ5IGF0b21pYyBudW1iZXIgdG8gYSBsaXN0IG9mIHZpYWJsZSBudW1iZXJzIG9mIG5ldXRyb25zLlxyXG5jb25zdCBzdGFibGVFbGVtZW50VGFibGUgPSBbXHJcbiAgLy8gTm8gZWxlbWVudFxyXG4gIFtdLFxyXG4gIC8vIEh5ZHJvZ2VuXHJcbiAgWyAwLCAxIF0sXHJcbiAgLy8gSGVsaXVtXHJcbiAgWyAxLCAyIF0sXHJcbiAgLy8gTGl0aGl1bVxyXG4gIFsgMywgNCBdLFxyXG4gIC8vIEJlcnlsbGl1bVxyXG4gIFsgNSBdLFxyXG4gIC8vIEJvcm9uXHJcbiAgWyA1LCA2IF0sXHJcbiAgLy8gQ2FyYm9uXHJcbiAgWyA2LCA3IF0sXHJcbiAgLy8gTml0cm9nZW5cclxuICBbIDcsIDggXSxcclxuICAvLyBPeHlnZW5cclxuICBbIDgsIDksIDEwIF0sXHJcbiAgLy8gRmx1b3JpbmVcclxuICBbIDEwIF0sXHJcbiAgLy8gTmVvblxyXG4gIFsgMTAsIDExLCAxMiBdLFxyXG4gIC8vIFNvZGl1bVxyXG4gIFsgMTIgXSxcclxuICAvLyBNYWduZXNpdW1cclxuICBbIDEyLCAxMywgMTQgXSxcclxuICAvL0FsdW1pbnVtXHJcbiAgWyAxNCBdLFxyXG4gIC8vIFNpbGljb25cclxuICBbIDE0LCAxNSwgMTYgXSxcclxuICAvLyBQaG9zcGhvcm91c1xyXG4gIFsgMTYgXSxcclxuICAvLyBTdWxmdXJcclxuICBbIDE2LCAxNywgMTgsIDIwIF0sXHJcbiAgLy8gQ2hsb3JpbmVcclxuICBbIDE4LCAyMCBdLFxyXG4gIC8vIEFyZ29uXHJcbiAgWyAxOCwgMjAsIDIyIF0sXHJcbiAgWyAyMCwgMjIgXSxcclxuICBbIDIwLCAyMiwgMjMsIDI0LCAyNiBdLFxyXG4gIFsgMjQgXSxcclxuICBbIDI0LCAyNSwgMjYsIDI3LCAyOCBdLFxyXG4gIFsgMjggXSxcclxuICBbIDI4LCAyOSwgMzAgXSxcclxuICBbIDMwIF0sXHJcbiAgWyAyOCwgMzAsIDMxLCAzMiBdLFxyXG4gIFsgMzIgXSxcclxuICBbIDMwLCAzMiwgMzMsIDM0LCAzNiBdLFxyXG4gIFsgMzQsIDM2IF0sXHJcbiAgWyAzNCwgMzYsIDM3LCAzOCBdLFxyXG4gIFsgMzgsIDQwIF0sXHJcbiAgWyAzOCwgNDAsIDQxLCA0MiwgNDQgXSxcclxuICBbIDQyIF0sXHJcbiAgWyA0MCwgNDIsIDQzLCA0NCwgNDYgXSxcclxuICBbIDQ0LCA0NiBdLFxyXG4gIFsgNDIsIDQ0LCA0NiwgNDcsIDQ4LCA1MCBdLFxyXG4gIFsgNDggXSxcclxuICBbIDQ2LCA0OCwgNDksIDUwIF0sXHJcbiAgWyA1MCBdLFxyXG4gIFsgNTAsIDUxLCA1MiwgNTQgXSxcclxuICBbIDUyIF0sXHJcbiAgWyA1MCwgNTIsIDUzLCA1NCwgNTUsIDU2IF0sXHJcbiAgW10sXHJcbiAgWyA1MiwgNTQsIDU1LCA1NiwgNTcsIDU4LCA2MCBdLFxyXG4gIFsgNTggXSxcclxuICBbIDU2LCA1OCwgNTksIDYwLCA2MiwgNjQgXSxcclxuICBbIDYwLCA2MiBdLFxyXG4gIFsgNTgsIDYwLCA2MiwgNjMsIDY0LCA2NiBdLFxyXG4gIFsgNjQgXSxcclxuICBbIDYyLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzIsIDc0IF0sXHJcbiAgWyA3MCwgNzIgXSxcclxuICBbIDY4LCA3MCwgNzIsIDczLCA3NCBdLFxyXG4gIFsgNzQgXSxcclxuICBbIDcyLCA3NCwgNzUsIDc2LCA3NywgNzggXSxcclxuICBbIDc4IF0sXHJcbiAgWyA3NCwgNzgsIDc5LCA4MCwgODEsIDgyIF0sXHJcbiAgWyA4MiBdLFxyXG4gIFsgNzgsIDgyIF0sXHJcbiAgWyA4MiBdLFxyXG4gIFsgODIsIDgzLCA4NSwgODYsIDg4IF0sXHJcbiAgW10sXHJcbiAgWyA4MiwgODcsIDg4LCA5MCwgOTIgXSxcclxuICBbIDkwIF0sXHJcbiAgWyA5MCwgOTEsIDkyLCA5MywgOTQsIDk2IF0sXHJcbiAgWyA5NCBdLFxyXG4gIFsgOTAsIDkyLCA5NCwgOTUsIDk2LCA5NywgOTggXSxcclxuICBbIDk4IF0sXHJcbiAgWyA5NCwgOTYsIDk4LCA5OSwgMTAwLCAxMDIgXSxcclxuICBbIDEwMCBdLFxyXG4gIFsgOTgsIDEwMCwgMTAxLCAxMDIsIDEwMywgMTA0LCAxMDYgXSxcclxuICBbIDEwNCBdLFxyXG4gIFsgMTA0LCAxMDUsIDEwNiwgMTA3LCAxMDggXSxcclxuICBbIDEwOCBdLFxyXG4gIFsgMTA4LCAxMTAsIDExMiBdLFxyXG4gIFsgMTEwIF0sXHJcbiAgWyAxMTEsIDExMiwgMTEzLCAxMTQsIDExNiBdLFxyXG4gIFsgMTE0LCAxMTYgXSxcclxuICBbIDExNCwgMTE2LCAxMTcsIDExOCwgMTIwIF0sXHJcbiAgWyAxMTggXSxcclxuICBbIDExNiwgMTE4LCAxMTksIDEyMCwgMTIxLCAxMjIsIDEyNCBdLFxyXG4gIFsgMTIyLCAxMjQgXSxcclxuICBbIDEyNCwgMTI1LCAxMjYgXVxyXG5dO1xyXG5cclxuY29uc3QgbnVtTmV1dHJvbnNJbk1vc3RTdGFibGVJc290b3BlID0gW1xyXG4gIC8vIE5vIGVsZW1lbnRcclxuICAwLFxyXG4gIC8vIEh5ZHJvZ2VuXHJcbiAgMCxcclxuICAvLyBIZWxpdW1cclxuICAyLFxyXG4gIC8vIExpdGhpdW1cclxuICA0LFxyXG4gIC8vIEJlcnlsbGl1bVxyXG4gIDUsXHJcbiAgLy8gQm9yb25cclxuICA2LFxyXG4gIC8vIENhcmJvblxyXG4gIDYsXHJcbiAgLy8gTml0cm9nZW5cclxuICA3LFxyXG4gIC8vIE94eWdlblxyXG4gIDgsXHJcbiAgLy8gRmx1b3JpbmVcclxuICAxMCxcclxuICAvLyBOZW9uXHJcbiAgMTAsXHJcbiAgMTIsXHJcbiAgMTIsXHJcbiAgMTQsXHJcbiAgMTQsXHJcbiAgMTYsXHJcbiAgMTYsXHJcbiAgMTgsXHJcbiAgMjIsXHJcbiAgMjAsXHJcbiAgMjAsXHJcbiAgMjQsXHJcbiAgMjYsXHJcbiAgMjgsXHJcbiAgMjgsXHJcbiAgMzAsXHJcbiAgMzAsXHJcbiAgMzIsXHJcbiAgMzEsXHJcbiAgMzUsXHJcbiAgMzUsXHJcbiAgMzksXHJcbiAgNDEsXHJcbiAgNDIsXHJcbiAgNDUsXHJcbiAgNDUsXHJcbiAgNDgsXHJcbiAgNDgsXHJcbiAgNTAsXHJcbiAgNTAsXHJcbiAgNTEsXHJcbiAgNTIsXHJcbiAgNTQsXHJcbiAgNTUsXHJcbiAgNTcsXHJcbiAgNTgsXHJcbiAgNjAsXHJcbiAgNjEsXHJcbiAgNjQsXHJcbiAgNjYsXHJcbiAgNjksXHJcbiAgNzEsXHJcbiAgNzYsXHJcbiAgNzQsXHJcbiAgNzcsXHJcbiAgNzgsXHJcbiAgODEsXHJcbiAgODIsXHJcbiAgODIsXHJcbiAgODIsXHJcbiAgODQsXHJcbiAgODQsXHJcbiAgODgsXHJcbiAgODksXHJcbiAgOTMsXHJcbiAgOTQsXHJcbiAgOTcsXHJcbiAgOTgsXHJcbiAgOTksXHJcbiAgMTAwLFxyXG4gIDEwMyxcclxuICAxMDQsXHJcbiAgMTA2LFxyXG4gIDEwOCxcclxuICAxMTAsXHJcbiAgMTExLFxyXG4gIDExNCxcclxuICAxMTUsXHJcbiAgMTE3LFxyXG4gIDExOCxcclxuICAxMjEsXHJcbiAgMTIzLFxyXG4gIDEyNSxcclxuICAxMjYsXHJcbiAgMTI1LFxyXG4gIDEyNSxcclxuICAxMzYsXHJcbiAgMTM2LFxyXG4gIDEzOCxcclxuICAxMzgsXHJcbiAgMTQyLFxyXG4gIDE0MCxcclxuICAxNDYsXHJcbiAgMTQ0LFxyXG4gIDE1MCxcclxuICAxNDgsXHJcbiAgMTUxLFxyXG4gIDE1MCxcclxuICAxNTMsXHJcbiAgMTUzLFxyXG4gIDE1NyxcclxuICAxNTcsXHJcbiAgMTU3LFxyXG4gIDE1OSxcclxuICAxNTcsXHJcbiAgMTU3LFxyXG4gIDE2MCxcclxuICAxNTcsXHJcbiAgMTYxXHJcbl07XHJcblxyXG4vLyBUaGlzIGRhdGEgc3RydWN0dXJlIG1hcHMgdGhlIG51bWJlciBvZiBlbGVjdHJvbnMgdG8gYSByYWRpdXMgZm9yIGFuIGF0b20uICBJdCBhc3N1bWVzIGEgc3RhYmxlLCBuZXV0cmFsIGF0b20uXHJcbi8vIFRoZSBiYXNpYyB2YWx1ZXMgYXJlIHRoZSBjb3ZhbGVudCByYWRpaSwgYW5kIHdlcmUgdGFrZW4gZnJvbSBhIFdpa2lwZWRpYSBlbnRyeSBlbnRpdGxlZCBcIkF0b21pYyByYWRpaSBvZiB0aGVcclxuLy8gZWxlbWVudHNcIiB3aGljaCwgYXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLCBjYW4gYmUgZm91bmQgaGVyZTpcclxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQXRvbWljX3JhZGlpX29mX3RoZV9lbGVtZW50c18oZGF0YV9wYWdlKS5cclxuLy8gVGhlIHZhbHVlcyBhcmUgaW4gcGljb21ldGVycy5cclxuY29uc3QgbWFwRWxlY3Ryb25Db3VudFRvUmFkaXVzID0ge1xyXG4gIDE6IDUzLFxyXG4gIDI6IDMxLFxyXG4gIDM6IDE2NyxcclxuICA0OiAxMTIsXHJcbiAgNTogODcsXHJcbiAgNjogNjcsXHJcbiAgNzogNTYsXHJcbiAgODogNDgsXHJcbiAgOTogNDIsXHJcbiAgMTA6IDM4LFxyXG4gIDExOiAxOTAsXHJcbiAgMTI6IDE0NSxcclxuICAxMzogMTE4LFxyXG4gIDE0OiAxMTEsXHJcbiAgMTU6IDk4LFxyXG4gIDE2OiA4OCxcclxuICAxNzogNzksXHJcbiAgMTg6IDcxLFxyXG4gIDE5OiAyNDMsXHJcbiAgMjA6IDE5NCxcclxuICAyMTogMTg0LFxyXG4gIDIyOiAxNzYsXHJcbiAgMjM6IDE3MSxcclxuICAyNDogMTY2LFxyXG4gIDI1OiAxNjEsXHJcbiAgMjY6IDE1NixcclxuICAyNzogMTUyLFxyXG4gIDI4OiAxNDksXHJcbiAgMjk6IDE0NSxcclxuICAzMDogMTQyLFxyXG4gIDMxOiAxMzYsXHJcbiAgMzI6IDEyNSxcclxuICAzMzogMTE0LFxyXG4gIDM0OiAxMDMsXHJcbiAgMzU6IDk0LFxyXG4gIDM2OiA4OCxcclxuICAzNzogMjY1LFxyXG4gIDM4OiAyMTksXHJcbiAgMzk6IDIxMixcclxuICA0MDogMjA2LFxyXG4gIDQxOiAxOTgsXHJcbiAgNDI6IDE5MCxcclxuICA0MzogMTgzLFxyXG4gIDQ0OiAxNzgsXHJcbiAgNDU6IDE3MyxcclxuICA0NjogMTY5LFxyXG4gIDQ3OiAxNjUsXHJcbiAgNDg6IDE2MSxcclxuICA0OTogMTU2LFxyXG4gIDUwOiAxNDUsXHJcbiAgNTE6IDEzMyxcclxuICA1MjogMTIzLFxyXG4gIDUzOiAxMTUsXHJcbiAgNTQ6IDEwOCxcclxuICA1NTogMjk4LFxyXG4gIDU2OiAyNTMsXHJcbiAgNTc6IDIyNixcclxuICA1ODogMjEwLFxyXG4gIDU5OiAyNDcsXHJcbiAgNjA6IDIwNixcclxuICA2MTogMjA1LFxyXG4gIDYyOiAyMzgsXHJcbiAgNjM6IDIzMSxcclxuICA2NDogMjMzLFxyXG4gIDY1OiAyMjUsXHJcbiAgNjY6IDIyOCxcclxuICA2NzogMjI2LFxyXG4gIDY4OiAyMjYsXHJcbiAgNjk6IDIyMixcclxuICA3MDogMjIyLFxyXG4gIDcxOiAyMTcsXHJcbiAgNzI6IDIwOCxcclxuICA3MzogMjAwLFxyXG4gIDc0OiAxOTMsXHJcbiAgNzU6IDE4OCxcclxuICA3NjogMTg1LFxyXG4gIDc3OiAxODAsXHJcbiAgNzg6IDE3NyxcclxuICA3OTogMTc0LFxyXG4gIDgwOiAxNzEsXHJcbiAgODE6IDE1NixcclxuICA4MjogMTU0LFxyXG4gIDgzOiAxNDMsXHJcbiAgODQ6IDEzNSxcclxuICA4NTogMTI3LFxyXG4gIDg2OiAxMjAsXHJcbiAgODc6IDM0OCxcclxuICA4ODogMjE1LFxyXG4gIDg5OiAxOTUsXHJcbiAgOTA6IDE4MCxcclxuICA5MTogMTgwLFxyXG4gIDkyOiAxNzVcclxufTtcclxuXHJcbi8vIFRhYmxlIHdoaWNoIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhbGwgdGhlIHBvc3NpYmxlIGRlY2F5cyBhbiB1bnN0YWJsZSBudWNsaWRlIGNhbiB1bmRlcmdvIGFuZCB0aGUgcGVyY2VudGFnZVxyXG4vLyBsaWtlbGlob29kIHRoYXQgdGhlIG51Y2xpZGUgd2lsbCB1bmRlcmdvIGVhY2ggdHlwZSBvZiBkZWNheS4gSWYgdGhlIGRlY2F5KHMpIGFyZSB1bmtub3duIG9yIGlmIHRoZSBwZXJjZW50YWdlXHJcbi8vIGxpa2VsaWhvb2QgaXMgdW5rbm93biwgbnVsbCBpcyB1c2VkIGFzIGEgcGxhY2Vob2xkZXIuIFRoZSBkYXRhIHdhcyBvYnRhaW5lZCBmcm9tIHRoZSBOdWNsZWFyIERhdGEgU2VydmljZXMgKE5EUykgb2ZcclxuLy8gdGhlIEludGVybmF0aW9uYWwgQXRvbWljIEVuZXJneSBBZ2VuY3kgKElBRUEpIGF0IHRoZSB1cmwgaHR0cHM6Ly93d3ctbmRzLmlhZWEub3JnL3JlbG5zZC9OZHNFbnNkZi9RdWVyeUZvcm0uaHRtbC5cclxuLy9cclxuLy8gVGhlIG9iamVjdCBpcyBmaXJzdCBpbmRleGVkIGJ5IHRoZSBwcm90b24gbnVtYmVyLCBhbmQgdGhlbiBieSB0aGUgbmV1dHJvbiBudW1iZXIuIEZvciBleGFtcGxlLCBhIG51Y2xpZGUgd2l0aCAxIHByb3RvblxyXG4vLyBhbmQgNCBuZXV0cm9ucyAoIEhhbGZMaWZlQ29uc3RhbnRzWyAxIF1bIDQgXSApIHdvdWxkIHVuZGVyZ28gYSBkZWNheSBvZiB0eXBlIFwiMk5cIiAxMDAlIG9mIHRoZSB0aW1lIHRoYXQgaXQgZGVjYXlzLlxyXG4vL1xyXG4vLyAncXVvdGUtcHJvcHMnIGxpbnQgcnVsZSBpcyBkaXNhYmxlZCBpbiBvcmRlciB0byBoYXZlIGNvbnNpc3RlbnQgc3R5bGluZy5cclxuLyogZXNsaW50LWRpc2FibGUgcXVvdGUtcHJvcHMgKi9cclxuY29uc3QgREVDQVlTX0lORk9fVEFCTEUgPSB7XHJcbiAgMDoge1xyXG4gICAgMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OiBudWxsLFxyXG4gICAgNjogbnVsbFxyXG4gIH0sXHJcbiAgMToge1xyXG4gICAgMjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOiB7XHJcbiAgICAgICdOJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDoge1xyXG4gICAgICAnMk4nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1OiBudWxsLFxyXG4gICAgNjogbnVsbFxyXG4gIH0sXHJcbiAgMjoge1xyXG4gICAgMzoge1xyXG4gICAgICAnTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU6IHtcclxuICAgICAgJ04nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNlxyXG4gICAgfSxcclxuICAgIDc6IHtcclxuICAgICAgJ04nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OiB7XHJcbiAgICAgICdOJzogMTAwXHJcbiAgICB9XHJcbiAgfSxcclxuICAzOiB7XHJcbiAgICAxOiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA1OiB7XHJcbiAgICAgICdCLUEnOiAxMDAsXHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNTAuOFxyXG4gICAgfSxcclxuICAgIDc6IHtcclxuICAgICAgJ04nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItNU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOToge1xyXG4gICAgICAnTic6IDEwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNDoge1xyXG4gICAgMjoge1xyXG4gICAgICAnMlAnOiAxMDAsXHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItQSc6IDMuMSxcclxuICAgICAgJ0ItUCc6IDAuMDAwODNcclxuICAgIH0sXHJcbiAgICA4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuNVxyXG4gICAgfSxcclxuICAgIDk6IHtcclxuICAgICAgJ04nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogODEsXHJcbiAgICAgICdCLTJOJzogNVxyXG4gICAgfSxcclxuICAgIDExOiB7XHJcbiAgICAgICdOJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI6IHtcclxuICAgICAgJ04nOiAxMDBcclxuICAgIH1cclxuICB9LFxyXG4gIDU6IHtcclxuICAgIDI6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOiB7XHJcbiAgICAgICdCK0EnOiAxMDAsXHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItQSc6IDAuNlxyXG4gICAgfSxcclxuICAgIDg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi01Tic6IDAuMjg2XHJcbiAgICB9LFxyXG4gICAgOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTVOJzogNi4xXHJcbiAgICB9LFxyXG4gICAgMTA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi01Tic6IDk5LjY4XHJcbiAgICB9LFxyXG4gICAgMTE6IHtcclxuICAgICAgJ04nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2MyxcclxuICAgICAgJ0ItMk4nOiAxMVxyXG4gICAgfSxcclxuICAgIDEzOiB7XHJcbiAgICAgICdOJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNzEuOCxcclxuICAgICAgJ0ItMk4nOiAxNlxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdOJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTY6IHtcclxuICAgICAgJzJOJzogMTAwXHJcbiAgICB9XHJcbiAgfSxcclxuICA2OiB7XHJcbiAgICAyOiB7XHJcbiAgICAgICcyUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogNjIsXHJcbiAgICAgICdCK0EnOiAzNy45XHJcbiAgICB9LFxyXG4gICAgNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA5OVxyXG4gICAgfSxcclxuICAgIDExOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI2XHJcbiAgICB9LFxyXG4gICAgMTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMzEuNVxyXG4gICAgfSxcclxuICAgIDEzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDQ3LFxyXG4gICAgICAnQi0yTic6IDdcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2NSxcclxuICAgICAgJ0ItMk4nOiAxOC42XHJcbiAgICB9LFxyXG4gICAgMTY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjEsXHJcbiAgICAgICdCLTJOJzogMzdcclxuICAgIH1cclxuICB9LFxyXG4gIDc6IHtcclxuICAgIDM6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK0EnOiAxLjkzXHJcbiAgICB9LFxyXG4gICAgNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItQSc6IDAuMDAxMlxyXG4gICAgfSxcclxuICAgIDEwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDk1LjEsXHJcbiAgICAgICdCLUEnOiAwLjAwMjVcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLUEnOiAxMi4yLFxyXG4gICAgICAnQi1OJzogMTJcclxuICAgIH0sXHJcbiAgICAxMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA0MS44XHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNDIuOVxyXG4gICAgfSxcclxuICAgIDE0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDg2XHJcbiAgICB9LFxyXG4gICAgMTU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMzQsXHJcbiAgICAgICdCLTJOJzogMTJcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA0MixcclxuICAgICAgJ0ItMk4nOiA4XHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgJ04nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA4OiB7XHJcbiAgICAzOiB7XHJcbiAgICAgICcyUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ6IHtcclxuICAgICAgJzJQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNToge1xyXG4gICAgICAnQitQJzogMTAwLFxyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjJcclxuICAgIH0sXHJcbiAgICAxNToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA3XHJcbiAgICB9LFxyXG4gICAgMTY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNThcclxuICAgIH0sXHJcbiAgICAxODoge1xyXG4gICAgICAnMk4nOiAxMDBcclxuICAgIH1cclxuICB9LFxyXG4gIDk6IHtcclxuICAgIDQ6IG51bGwsXHJcbiAgICA1OiBudWxsLFxyXG4gICAgNjoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTFcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDUuOVxyXG4gICAgfSxcclxuICAgIDE2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIzLjFcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxMy41XHJcbiAgICB9LFxyXG4gICAgMTg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNzdcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnTic6IDEwMFxyXG4gICAgfSxcclxuICAgIDIwOiB7XHJcbiAgICAgICdCLU4nOiAxMDAsXHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDEwOiB7XHJcbiAgICA1OiB7XHJcbiAgICAgICcyUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY6IHtcclxuICAgICAgJzJQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiA5NS4yLFxyXG4gICAgICAnRUNBJzogMi43N1xyXG4gICAgfSxcclxuICAgIDg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjEzXHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMlxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEyLFxyXG4gICAgICAnQi0yTic6IDMuN1xyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI4LFxyXG4gICAgICAnQi0yTic6IDRcclxuICAgIH0sXHJcbiAgICAyMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxMyxcclxuICAgICAgJ0ItMk4nOiA4LjlcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjM6IHtcclxuICAgICAgJ04nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjQ6IHtcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMTE6IHtcclxuICAgIDY6IG51bGwsXHJcbiAgICA3OiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk6IHtcclxuICAgICAgJ0VDJzogMTAwLFxyXG4gICAgICAnRUNBJzogMjAuMDVcclxuICAgIH0sXHJcbiAgICAxMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjEzXHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC41OFxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIxLjVcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAzMCxcclxuICAgICAgJ0ItMk4nOiAxLjE1XHJcbiAgICB9LFxyXG4gICAgMjA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMzcuMyxcclxuICAgICAgJ0ItMk4nOiAwLjg3XHJcbiAgICB9LFxyXG4gICAgMjE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjQsXHJcbiAgICAgICdCLTJOJzogOC4zXHJcbiAgICB9LFxyXG4gICAgMjI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNDcsXHJcbiAgICAgICdCLTJOJzogMTNcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogNTAsXHJcbiAgICAgICdCLU4nOiAxNVxyXG4gICAgfSxcclxuICAgIDI0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAsXHJcbiAgICAgICdCLTROJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAxMjoge1xyXG4gICAgNzoge1xyXG4gICAgICAnMlAnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OiB7XHJcbiAgICAgICdCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDMwLjNcclxuICAgIH0sXHJcbiAgICA5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDMyLjYsXHJcbiAgICAgICdCK0EnOiAwLjVcclxuICAgIH0sXHJcbiAgICAxMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2LjJcclxuICAgIH0sXHJcbiAgICAyMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1LjVcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1MixcclxuICAgICAgJ0ItM04nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNzoge1xyXG4gICAgICAnTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTZOJzogbnVsbCxcclxuICAgICAgJ0ItNU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAxMzoge1xyXG4gICAgODoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDU1LFxyXG4gICAgICAnQisyUCc6IDEuMVxyXG4gICAgfSxcclxuICAgIDEwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDEuMDRcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK0EnOiAwLjAzNSxcclxuICAgICAgJ0IrUCc6IDAuMDAxNlxyXG4gICAgfSxcclxuICAgIDEyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuNlxyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuN1xyXG4gICAgfSxcclxuICAgIDIwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDguNVxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI2XHJcbiAgICB9LFxyXG4gICAgMjI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMzgsXHJcbiAgICAgICdCLTJOJzogMFxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDMxXHJcbiAgICB9LFxyXG4gICAgMjQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjk6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDE0OiB7XHJcbiAgICA4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDMyXHJcbiAgICB9LFxyXG4gICAgOToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiA4OCxcclxuICAgICAgJ0VDMlAnOiAzLjZcclxuICAgIH0sXHJcbiAgICAxMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAzOFxyXG4gICAgfSxcclxuICAgIDExOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDM1XHJcbiAgICB9LFxyXG4gICAgMTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNVxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEwXHJcbiAgICB9LFxyXG4gICAgMjM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTcsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI1XHJcbiAgICB9LFxyXG4gICAgMjU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAzMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAxNToge1xyXG4gICAgMTA6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAzNi44LFxyXG4gICAgICAnRUMyUCc6IDIuMTZcclxuICAgIH0sXHJcbiAgICAxMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAwLjA3XHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wMDEzLFxyXG4gICAgICAnRUNBJzogMC4wMDA4NlxyXG4gICAgfSxcclxuICAgIDE0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEyXHJcbiAgICB9LFxyXG4gICAgMjQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjZcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNS44LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAzMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDUwLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnQi1OJzogMTAwLFxyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzA6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMTY6IHtcclxuICAgIDEwOiB7XHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDIuMyxcclxuICAgICAgJ0IrMlAnOiAxLjFcclxuICAgIH0sXHJcbiAgICAxMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAyMC43XHJcbiAgICB9LFxyXG4gICAgMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNDdcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDQwXHJcbiAgICB9LFxyXG4gICAgMjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMThcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1NFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDE3OiB7XHJcbiAgICAxMjoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzOiB7XHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDE0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDIuNFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDQSc6IDAuMDU0LFxyXG4gICAgICAnRUNQJzogMC4wMjZcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnQi0nOiA5OC4xLFxyXG4gICAgICAnRUMrQisnOiAxLjlcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA4XHJcbiAgICB9LFxyXG4gICAgMjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjRcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2MFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDNcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItM04nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItNk4nOiBudWxsLFxyXG4gICAgICAnQi01Tic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDE4OiB7XHJcbiAgICAxMjoge1xyXG4gICAgICAnMlAnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzoge1xyXG4gICAgICAnRUMnOiAxMDAsXHJcbiAgICAgICdCK1AnOiA2MyxcclxuICAgICAgJ0IrMlAnOiA3LjJcclxuICAgIH0sXHJcbiAgICAxNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAzNS41OFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDM4LjdcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjJcclxuICAgIH0sXHJcbiAgICAzMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2NVxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM3LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTNOJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMTk6IHtcclxuICAgIDE0OiB7XHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDE1OiB7XHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDE2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMzdcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLjA0OCxcclxuICAgICAgJ0VDQSc6IDAuMDAzNFxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdCLSc6IDg5LjI4LFxyXG4gICAgICAnRUMrQisnOiAxMC43MlxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuMTRcclxuICAgIH0sXHJcbiAgICAzMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA4NlxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI5LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2NVxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDc0LFxyXG4gICAgICAnQi0yTic6IDIuM1xyXG4gICAgfSxcclxuICAgIDM0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDY3LFxyXG4gICAgICAnQi0yTic6IDE3XHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAyMDoge1xyXG4gICAgMTQ6IHtcclxuICAgICAgJzJQJzogbnVsbCxcclxuICAgICAgJ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogOTUuOSxcclxuICAgICAgJ0VDMlAnOiA0LjFcclxuICAgIH0sXHJcbiAgICAxNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiA1MS4yXHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogODIuMVxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICcyQi0nOiA3NSxcclxuICAgICAgLy8gJzJCLSc6IDY5LCAvLyBUT0RPOiBob3cgdG8gaGFuZGxlIHR3byBvZiB0aGUgc2FtZSBkZWNheT9cclxuICAgICAgJ0ItJzogMjVcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDQwXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDIxOiB7XHJcbiAgICAxNzoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxODoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuNDQsXHJcbiAgICAgICdFQ0EnOiAwLjAxN1xyXG4gICAgfSxcclxuICAgIDIwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTZcclxuICAgIH0sXHJcbiAgICAzNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi00Tic6IG51bGwsXHJcbiAgICAgICdCLTNOJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMjI6IHtcclxuICAgIDE2OiB7XHJcbiAgICAgICcyUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNzoge1xyXG4gICAgICAnRUNQK0VDMlAnOiAxMDAsXHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDkzLjdcclxuICAgIH0sXHJcbiAgICAxODoge1xyXG4gICAgICAnRUNQJzogMTAwLFxyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQyOiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDIzOiB7XHJcbiAgICAxOToge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjMsXHJcbiAgICAgICdCLSc6IDAuN1xyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDNcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxMCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM1XHJcbiAgICB9LFxyXG4gICAgNDE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ0OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDI0OiB7XHJcbiAgICAxODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiA5NC40XHJcbiAgICB9LFxyXG4gICAgMTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNzkuMyxcclxuICAgICAgJ0VDMlAnOiAxMS42XHJcbiAgICB9LFxyXG4gICAgMjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogN1xyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDM0LjRcclxuICAgIH0sXHJcbiAgICAyMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnMkVDJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMFxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAyNToge1xyXG4gICAgMTk6IHtcclxuICAgICAgJ1AnOiBudWxsLFxyXG4gICAgICAnRUMnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjA6IG51bGwsXHJcbiAgICAyMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiA1N1xyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDMuNFxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAuMjgsXHJcbiAgICAgICdCK0EnOiAwLjAwMDZcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCLSc6IDAuMDAwMDkzXHJcbiAgICB9LFxyXG4gICAgMzE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0lUJzogMTAwLFxyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjJcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDMzXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi01Tic6IDIxXHJcbiAgICB9LFxyXG4gICAgNDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1MFxyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0zTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMjY6IHtcclxuICAgIDE5OiB7XHJcbiAgICAgICcyUCc6IDU3LFxyXG4gICAgICAnRUMrQisnOiA0MyxcclxuICAgICAgJ0IrUCc6IDQzXHJcbiAgICB9LFxyXG4gICAgMjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNzguN1xyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAsXHJcbiAgICAgICdFQzJQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDMuNlxyXG4gICAgfSxcclxuICAgIDIzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDU2LjdcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgMjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMjk6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjcuNlxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ4OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAyNzoge1xyXG4gICAgMjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNzAuNSxcclxuICAgICAgJ0VDMlAnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMy44XHJcbiAgICB9LFxyXG4gICAgMjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2XHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNlxyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIyLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxOCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTYsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDUwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMjg6IHtcclxuICAgIDIwOiB7XHJcbiAgICAgICcyUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiA4M1xyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDczLFxyXG4gICAgICAnRUMyUCc6IDE0XHJcbiAgICB9LFxyXG4gICAgMjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogODcuMixcclxuICAgICAgJ0VDMlAnOiAwLjVcclxuICAgIH0sXHJcbiAgICAyNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAzMS40XHJcbiAgICB9LFxyXG4gICAgMjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMjMuNFxyXG4gICAgfSxcclxuICAgIDI2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEwXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI2LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTQ6IG51bGxcclxuICB9LFxyXG4gIDI5OiB7XHJcbiAgICAyNDoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnRUNQJzogMTUsXHJcbiAgICAgICdCKyc6IG51bGwsXHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI3OiB7XHJcbiAgICAgICdCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAuNFxyXG4gICAgfSxcclxuICAgIDI4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdFQytCKyc6IDYxLjUsXHJcbiAgICAgICdCLSc6IDM4LjVcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMFxyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDMuNVxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDNcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAzMC4xXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjVcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2NixcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAzMDoge1xyXG4gICAgMjQ6IHtcclxuICAgICAgJzJQJzogOTJcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICAnRUNQJzogOTEsXHJcbiAgICAgICdCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICAnRUNQJzogODYsXHJcbiAgICAgICdCK1AnOiBudWxsLFxyXG4gICAgICAnQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogNjVcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAzXHJcbiAgICB9LFxyXG4gICAgMjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4xXHJcbiAgICB9LFxyXG4gICAgMzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJzJCLSc6IDEwMFxyXG4gICAgICAvLyAnMkItJzogbnVsbCAvLyBUT0RPOiBob3cgdG8gaGFuZGxlIHR3byBvZiB0aGUgc2FtZSBkZWNheT9cclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjdcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNy41XHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjlcclxuICAgIH0sXHJcbiAgICA1Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDMxOiB7XHJcbiAgICAyODoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyOToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAxLjYsXHJcbiAgICAgICdCK0EnOiAwLjAyM1xyXG4gICAgfSxcclxuICAgIDMwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMjVcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0ItJzogOTkuNTksXHJcbiAgICAgICdFQyc6IDAuNDFcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjA4OVxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuODZcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxMS45XHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjIuMlxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDYyLjhcclxuICAgIH0sXHJcbiAgICA1Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA3MFxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM1XHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjAsXHJcbiAgICAgICdCLTJOJzogMjBcclxuICAgIH0sXHJcbiAgICA1Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDMyOiB7XHJcbiAgICAyNzoge1xyXG4gICAgICAnMlAnOiAwLjIsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAyODoge1xyXG4gICAgICAnRUNQJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDI5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDYyXHJcbiAgICB9LFxyXG4gICAgMzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDMxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDMzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMDExXHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEwLjJcclxuICAgIH0sXHJcbiAgICA1Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNi41LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA1NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA0NVxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA1Njoge1xyXG4gICAgICAnQi0nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDU3OiB7XHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDMzOiB7XHJcbiAgICAzMDoge1xyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICAzMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MDoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMrQisnOiA2NixcclxuICAgICAgJ0ItJzogMzRcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjE4XHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjIuOVxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM1LjUsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDE1LjRcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDU3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9XHJcbiAgfSxcclxuICAzNDoge1xyXG4gICAgMzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzE6IHtcclxuICAgICAgJ0VDUCc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMC41XHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMzU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wNTJcclxuICAgIH0sXHJcbiAgICAzNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnMkItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4zNlxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuOTlcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA3LjhcclxuICAgIH0sXHJcbiAgICA1Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjFcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAzNToge1xyXG4gICAgMzQ6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAzOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnRUMrQisnOiA5OS45OSxcclxuICAgICAgJ0ItJzogMC4wMVxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdCLSc6IDkxLjcsXHJcbiAgICAgICdFQytCKyc6IDguM1xyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIuNlxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDYuNThcclxuICAgIH0sXHJcbiAgICA1NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxMy44XHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjUuM1xyXG4gICAgfSxcclxuICAgIDU2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDE5LjVcclxuICAgIH0sXHJcbiAgICA1Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAzMy4xXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjhcclxuICAgIH0sXHJcbiAgICA1OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2OFxyXG4gICAgfSxcclxuICAgIDYwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM0XHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjcuNlxyXG4gICAgfSxcclxuICAgIDYyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItM04nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTNOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDM2OiB7XHJcbiAgICAzMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiA5OVxyXG4gICAgfSxcclxuICAgIDM0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDEuM1xyXG4gICAgfSxcclxuICAgIDM1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDIuMVxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMDAwMDAxXHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4yNVxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDMzMlxyXG4gICAgfSxcclxuICAgIDU3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuOTVcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjExXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMi44N1xyXG4gICAgfSxcclxuICAgIDYwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDMuN1xyXG4gICAgfSxcclxuICAgIDYxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDYuN1xyXG4gICAgfSxcclxuICAgIDYyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDcsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDExXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMzc6IHtcclxuICAgIDM1OiB7XHJcbiAgICAgICdQJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM2OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDM5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDQSc6IDAuMDAwMDAwMzhcclxuICAgIH0sXHJcbiAgICA0MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnRUMrQisnOiA5Ni4xLFxyXG4gICAgICAnQi0nOiAzLjlcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnQi0nOiA5OS45OTQ4LFxyXG4gICAgICAnRUMnOiAwLjAwNTJcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjAxMDdcclxuICAgIH0sXHJcbiAgICA1Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjM5XHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTAuNVxyXG4gICAgfSxcclxuICAgIDU4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDguN1xyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEzLjNcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyNS41LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNC4zLFxyXG4gICAgICAnQi0yTic6IDAuMDU0XHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTkuOCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNS42LFxyXG4gICAgICAnQi0yTic6IDAuMTVcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyOFxyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDE4XHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0zTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItM04nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDM4OiB7XHJcbiAgICAzNToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDUuMlxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMDAwMDM0XHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wOFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ0OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDVcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjIzXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4xXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMS4xMVxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIuMzdcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1LjVcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICAzOToge1xyXG4gICAgMzc6IHtcclxuICAgICAgJ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnUCc6IG51bGwsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMzk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wNTVcclxuICAgIH0sXHJcbiAgICA1OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjMzXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMS43N1xyXG4gICAgfSxcclxuICAgIDYxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuMDJcclxuICAgIH0sXHJcbiAgICA2Mjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjk0XHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNC45XHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogOFxyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM0LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA4MlxyXG4gICAgfSxcclxuICAgIDY3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItM04nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDQwOiB7XHJcbiAgICAzNzoge1xyXG4gICAgICAnMlAnOiBudWxsLFxyXG4gICAgICAnRUNQJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDM4OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAzOToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMTJcclxuICAgIH0sXHJcbiAgICA0Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IG51bGwsXHJcbiAgICA1Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogN1xyXG4gICAgfSxcclxuICAgIDY3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIzXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNDE6IHtcclxuICAgIDQwOiB7XHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDZcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjdcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA0LjVcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2LjMsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDE1XHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTNOJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLTNOJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNDI6IHtcclxuICAgIDM5OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLjE0XHJcbiAgICB9LFxyXG4gICAgNDQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMTVcclxuICAgIH0sXHJcbiAgICA0Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnMkItJzogMTAwXHJcbiAgICAgIC8vICcyQi0nOiAxMDAgLy8gVE9ETzogaG93IHRvIGhhbmRsZSB0d28gb2YgdGhlIHNhbWUgZGVjYXk/XHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMS4zXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMlxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEyXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNDM6IHtcclxuICAgIDQyOiB7XHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDc6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0ItJzogOTkuOTk3NCxcclxuICAgICAgJ0VDJzogMC4wMDI2XHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wOFxyXG4gICAgfSxcclxuICAgIDY3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDRcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjg1XHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMS41XHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMi4xXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDQ0OiB7XHJcbiAgICA0MToge1xyXG4gICAgICAnUCc6IG51bGwsXHJcbiAgICAgICdFQ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDI6IHtcclxuICAgICAgJ0VDUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogM1xyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUwOiB7XHJcbiAgICAgICdFQyc6IDEwMCxcclxuICAgICAgJ0IrK0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDQ1OiB7XHJcbiAgICA0NDoge1xyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnRUNQJzogbnVsbCxcclxuICAgICAgJ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC43XHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMS4zXHJcbiAgICB9LFxyXG4gICAgNDc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMS45XHJcbiAgICB9LFxyXG4gICAgNDg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMS44XHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogNzgsXHJcbiAgICAgICdCLSc6IDIyXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0ItJzogOTkuNTUsXHJcbiAgICAgICdFQytCKyc6IDAuNDVcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAzLjFcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2LjRcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1LjQsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjQuMixcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA0Njoge1xyXG4gICAgNDQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnMlAnOiBudWxsLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1NDoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Nzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjdcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjhcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyLjVcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjRcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItM04nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDQ3OiB7XHJcbiAgICA0NToge1xyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnRUNQJzogbnVsbCxcclxuICAgICAgJ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogOC41XHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wMDExXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNSxcclxuICAgICAgJ0ItJzogMVxyXG4gICAgfSxcclxuICAgIDYxOiB7XHJcbiAgICAgICdCLSc6IDk3LjE1LFxyXG4gICAgICAnRUMrQisnOiAyLjg1XHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0ItJzogOTkuNyxcclxuICAgICAgJ0VDJzogMC4zXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wMDNcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjA4XHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0ItJzogOTkuOCxcclxuICAgICAgJ0ItTic6IDAuMTg2XHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC42MlxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuM1xyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTNOJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA0ODoge1xyXG4gICAgNDY6IHtcclxuICAgICAgJ0VDUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0Nzoge1xyXG4gICAgICAnQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiA0LjVcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnRUMnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wMjlcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAwLjE3LFxyXG4gICAgICAnQitBJzogMC4wMDAxXHJcbiAgICB9LFxyXG4gICAgNTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJzJCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMy41XHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMy41XHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNjAsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNDk6IHtcclxuICAgIDQ3OiB7XHJcbiAgICAgICdFQ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA0ODoge1xyXG4gICAgICAnQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAxLjdcclxuICAgIH0sXHJcbiAgICA0OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLjEzXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0IrUCc6IDAuOVxyXG4gICAgfSxcclxuICAgIDUxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDEuNjZcclxuICAgIH0sXHJcbiAgICA1Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMC4wMDkzXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0VDK0IrJzogNjIsXHJcbiAgICAgICdCLSc6IDM4XHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0ItJzogOTkuNSxcclxuICAgICAgJ0VDK0IrJzogMC41XHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0ItJzogOTkuOTc3LFxyXG4gICAgICAnRUMnOiAwLjAyM1xyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDNcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjA0NlxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMjNcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjkzXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMlxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDcuNCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogODVcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2NVxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNTA6IHtcclxuICAgIDQ5OiB7XHJcbiAgICAgICdFQ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMTdcclxuICAgIH0sXHJcbiAgICA1MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAyNlxyXG4gICAgfSxcclxuICAgIDUyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDEuMlxyXG4gICAgfSxcclxuICAgIDU0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDU1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAuMDExXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wMjk0XHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTdcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyMSxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjdcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1OFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM2LFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTNOJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA1MToge1xyXG4gICAgNTI6IHtcclxuICAgICAgJ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNyxcclxuICAgICAgJ1AnOiAxXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQisnOiAxLjdcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnQi0nOiA5Ny41OSxcclxuICAgICAgJ0VDK0IrJzogMi40MVxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDIyXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTguNSxcclxuICAgICAgJ0ItMk4nOiAxXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogNDlcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnQi1OJzogNzIsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDkwLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyMyxcclxuICAgICAgJ0ItMk4nOiA3LjZcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0yTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLTJOJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDUyOiB7XHJcbiAgICA1Mjoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJzJQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDUzOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1NToge1xyXG4gICAgICAnQSc6IDcwLFxyXG4gICAgICAnRUMrQisnOiAzMFxyXG4gICAgfSxcclxuICAgIDU2OiB7XHJcbiAgICAgICdFQytCKyc6IDUxLFxyXG4gICAgICAnQSc6IDQ5LFxyXG4gICAgICAnQitQJzogMi40XHJcbiAgICB9LFxyXG4gICAgNTc6IHtcclxuICAgICAgJ0VDK0IrJzogOTYuMSxcclxuICAgICAgJ0IrUCc6IDkuNCxcclxuICAgICAgJ0EnOiAzLjlcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDA2N1xyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCKyc6IDI1XHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQisnOiAyLjA2XHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJzJCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICcyQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjMxXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMi45OVxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDYuM1xyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTA6IG51bGwsXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA1Mzoge1xyXG4gICAgNTU6IHtcclxuICAgICAgJ0EnOiA5MSxcclxuICAgICAgJ0VDK0IrJzogOSxcclxuICAgICAgJ1AnOiAxXHJcbiAgICB9LFxyXG4gICAgNTY6IHtcclxuICAgICAgJ1AnOiA5OS45ODYsXHJcbiAgICAgICdBJzogMC4wMTRcclxuICAgIH0sXHJcbiAgICA1Nzoge1xyXG4gICAgICAnRUMrQisnOiA4MyxcclxuICAgICAgJ0EnOiAxNyxcclxuICAgICAgJ0VDUCc6IDExXHJcbiAgICB9LFxyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOSxcclxuICAgICAgJ0EnOiAwLjFcclxuICAgIH0sXHJcbiAgICA1OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLjg4LFxyXG4gICAgICAnRUNBJzogMC4xMDRcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDAwMDAzMzFcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQisnOiA3N1xyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrJzogNTEsXHJcbiAgICAgICdFQyc6IDQ5XHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDK0IrJzogNTIuNyxcclxuICAgICAgJ0ItJzogNDcuM1xyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdCLSc6IDkzLjEsXHJcbiAgICAgICdFQytCKyc6IDYuOVxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDcuMTRcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA1LjQ0XHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMTBcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA3LjZcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAyMS4yXHJcbiAgICB9LFxyXG4gICAgODk6IG51bGwsXHJcbiAgICA5MDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTE6IG51bGwsXHJcbiAgICA5Mjoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItMk4nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNTQ6IHtcclxuICAgIDU0OiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnMlAnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNTU6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA1Njoge1xyXG4gICAgICAnQSc6IDY0LFxyXG4gICAgICAnRUMrQisnOiAzNixcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA1Nzoge1xyXG4gICAgICAnQSc6IDgsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA1ODoge1xyXG4gICAgICAnRUMrQisnOiA5OC44LFxyXG4gICAgICAnQSc6IDEuMlxyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDcsXHJcbiAgICAgICdBJzogMC4wMTFcclxuICAgIH0sXHJcbiAgICA2MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAwLjM0LFxyXG4gICAgICAnQSc6IDAuMDAwM1xyXG4gICAgfSxcclxuICAgIDYyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAuMDAyOVxyXG4gICAgfSxcclxuICAgIDY0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcwOiB7XHJcbiAgICAgICcyQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJzJCLSc6IDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mjoge1xyXG4gICAgICAnMkItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wNDRcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjIxXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDVcclxuICAgIH0sXHJcbiAgICA5Mjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiA2LjlcclxuICAgIH0sXHJcbiAgICA5Mzoge1xyXG4gICAgICAnQi1OJzogOCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItMk4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA1NToge1xyXG4gICAgNTc6IHtcclxuICAgICAgJ1AnOiAxMDAsXHJcbiAgICAgICdBJzogMC4yNlxyXG4gICAgfSxcclxuICAgIDU4OiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNTk6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTgyLFxyXG4gICAgICAnRUNQJzogOC43LFxyXG4gICAgICAnRUNBJzogMC4xOVxyXG4gICAgfSxcclxuICAgIDYwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAuMDdcclxuICAgIH0sXHJcbiAgICA2MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAyLjgsXHJcbiAgICAgICdFQ0EnOiAwLjA0OVxyXG4gICAgfSxcclxuICAgIDYyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMDQyLFxyXG4gICAgICAnRUNBJzogMC4wMDI0XHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitBJzogMC4wMDAwMixcclxuICAgICAgJ0IrUCc6IDAuMDAwMDA3XHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0VDK0IrJzogOTguNCxcclxuICAgICAgJ0ItJzogMS42XHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzc6IHtcclxuICAgICAgJ0VDK0IrJzogOTguMTMsXHJcbiAgICAgICdCLSc6IDEuODdcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnQi0nOiA5OS45OTk3LFxyXG4gICAgICAnRUMnOiAwLjAwMDNcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjAzNVxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMDlcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjY0XHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMy4wM1xyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDE0LjdcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxNC4yXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjguNVxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDI1LjFcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMjBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi0yTic6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA1Njoge1xyXG4gICAgNTg6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuMSxcclxuICAgICAgJ0VDUCc6IDIwLFxyXG4gICAgICAnQSc6IDAuOVxyXG4gICAgfSxcclxuICAgIDU5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDE1XHJcbiAgICB9LFxyXG4gICAgNjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogM1xyXG4gICAgfSxcclxuICAgIDYxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IDAsXHJcbiAgICAgICdCK0EnOiAwXHJcbiAgICB9LFxyXG4gICAgNjI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDYzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDI1XHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJzJCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjA2XHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC40XHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC40M1xyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5ODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA1Nzoge1xyXG4gICAgNjA6IHtcclxuICAgICAgJ1AnOiA5My45LFxyXG4gICAgICAnRUMrQisnOiA2LjFcclxuICAgIH0sXHJcbiAgICA2Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgNjQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdFQytCKyc6IDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3MToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMrQisnOiA2NS41LFxyXG4gICAgICAnQi0nOiAzNC41XHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMC4wMDdcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjA0MVxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDAuMTVcclxuICAgIH0sXHJcbiAgICA5Mjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAxLjQzXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogMi43XHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLTJOJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNTg6IHtcclxuICAgIDYzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDFcclxuICAgIH0sXHJcbiAgICA2NDoge1xyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDBcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNjk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQisnOiAxMVxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICcyRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDogbnVsbCxcclxuICAgIDg1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDU5OiB7XHJcbiAgICA2Mjoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDBcclxuICAgIH0sXHJcbiAgICA2Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdCLSc6IDk5Ljk4MzYsXHJcbiAgICAgICdFQyc6IDAuMDE2NFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA2MDoge1xyXG4gICAgNjU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMFxyXG4gICAgfSxcclxuICAgIDY2OiB7XHJcbiAgICAgICdFQ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNjc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJzJCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDYxOiB7XHJcbiAgICA2Nzoge1xyXG4gICAgICAnRUMnOiAxMDAsXHJcbiAgICAgICdBJzogbnVsbCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdQJzogbnVsbCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA2OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wMDAwNVxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrJzogMC4wMDAwMDU3XHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0VDJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAwMjhcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnRUMnOiA2NS43LFxyXG4gICAgICAnQi0nOiAzNC4zXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDYyOiB7XHJcbiAgICA2Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgNjg6IHtcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDBcclxuICAgIH0sXHJcbiAgICA3MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMFxyXG4gICAgfSxcclxuICAgIDcyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMDJcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg1OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Nzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5ODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA2Mzoge1xyXG4gICAgNjc6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA2ODoge1xyXG4gICAgICAnUCc6IDg5LFxyXG4gICAgICAnRUMrQisnOiAxMVxyXG4gICAgfSxcclxuICAgIDY5OiB7XHJcbiAgICAgICdQJzogMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDcxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDBcclxuICAgIH0sXHJcbiAgICA3Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMC4wOVxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdFQyc6IDk5Ljk5NzgsXHJcbiAgICAgICdBJzogMC4wMDIyXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAwOTRcclxuICAgIH0sXHJcbiAgICA4Njoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQSc6IG51bGxcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnRUMrQisnOiA3Mi4wOCxcclxuICAgICAgJ0ItJzogMjcuOTJcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQi0nOiA5OS45ODIsXHJcbiAgICAgICdFQytCKyc6IDAuMDE4XHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDY0OiB7XHJcbiAgICA3MDogbnVsbCxcclxuICAgIDcxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDJcclxuICAgIH0sXHJcbiAgICA3MjogbnVsbCxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMC4wM1xyXG4gICAgfSxcclxuICAgIDc4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwNDNcclxuICAgIH0sXHJcbiAgICA4Njoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdFQyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMDAwMDhcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA1OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDY1OiB7XHJcbiAgICA3MDoge1xyXG4gICAgICAnUCc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDczOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IDAsXHJcbiAgICAgICdFQ1AnOiBudWxsLFxyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLjI2XHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQitQJzogMC4wMDIyXHJcbiAgICB9LFxyXG4gICAgNzg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODA6IG51bGwsXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnRUMrQisnOiA4My4zLFxyXG4gICAgICAnQSc6IDE2LjdcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wNVxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk5MDUsXHJcbiAgICAgICdBJzogMC4wMDk1XHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAwN1xyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0ItJzogMC4xXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogODMuNCxcclxuICAgICAgJ0ItJzogMTYuNlxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDY2OiB7XHJcbiAgICA3Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAxMVxyXG4gICAgfSxcclxuICAgIDc0OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4wNlxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgNzk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogNTBcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAwLjA1XHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0VDK0IrJzogNjQsXHJcbiAgICAgICdBJzogMzZcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnRUMrQisnOiA5NC40LFxyXG4gICAgICAnQSc6IDUuNlxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjksXHJcbiAgICAgICdBJzogMC4xXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTkwNixcclxuICAgICAgJ0EnOiAwLjAwOTRcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNjc6IHtcclxuICAgIDczOiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzQ6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiAwLFxyXG4gICAgICAnUCc6IDBcclxuICAgIH0sXHJcbiAgICA3Njoge1xyXG4gICAgICAnRUNQJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDc3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdFQ1AnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0VDK0IrJzogNzgsXHJcbiAgICAgICdBJzogMjJcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnRUMrQisnOiA4OCxcclxuICAgICAgJ0EnOiAxMlxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk0OSxcclxuICAgICAgJ0EnOiAwLjA1MVxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk4MSxcclxuICAgICAgJ0EnOiAwLjAxOVxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdFQytCKyc6IDYwLFxyXG4gICAgICAnQi0nOiA0MFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTEwOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMTE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNjg6IHtcclxuICAgIDc1OiBudWxsLFxyXG4gICAgNzY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgNzc6IG51bGwsXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAwXHJcbiAgICB9LFxyXG4gICAgODA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMC4xNVxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDdcclxuICAgIH0sXHJcbiAgICA4Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQSc6IDkwLFxyXG4gICAgICAnRUMrQisnOiAxMFxyXG4gICAgfSxcclxuICAgIDg1OiB7XHJcbiAgICAgICdBJzogNTMsXHJcbiAgICAgICdFQytCKyc6IDQ3XHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNTMsXHJcbiAgICAgICdBJzogMC40N1xyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk3OCxcclxuICAgICAgJ0EnOiAwLjAyMlxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMDAxN1xyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA2OToge1xyXG4gICAgNzU6IHtcclxuICAgICAgJ1AnOiAwXHJcbiAgICB9LFxyXG4gICAgNzY6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA3Nzoge1xyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA3ODoge1xyXG4gICAgICAnRUMrQisnOiA4NSxcclxuICAgICAgJ1AnOiAxNVxyXG4gICAgfSxcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDAuMlxyXG4gICAgfSxcclxuICAgIDgxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0VDUCc6IDEuMlxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdBJzogOTEsXHJcbiAgICAgICdFQytCKyc6IDlcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQSc6IDU0LFxyXG4gICAgICAnRUMrQisnOiA0NlxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjE3LFxyXG4gICAgICAnQSc6IDAuODNcclxuICAgIH0sXHJcbiAgICA4Nzoge1xyXG4gICAgICAnRUMrQisnOiA5OS45MzYsXHJcbiAgICAgICdBJzogMC4wNjRcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Mjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Mzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCKyc6IDM5XHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTksXHJcbiAgICAgICdCLSc6IDAuMDFcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0ItJzogOTkuODY5LFxyXG4gICAgICAnRUMnOiAwLjEzMVxyXG4gICAgfSxcclxuICAgIDEwMjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQi0nOiBudWxsLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzA6IHtcclxuICAgIDc5OiB7XHJcbiAgICAgICdFQ1AnOiAxMDAsXHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDgwOiBudWxsLFxyXG4gICAgODE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnRUNQJzogMFxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0IrUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA4Mzoge1xyXG4gICAgICAnRUMrQisnOiA5MCxcclxuICAgICAgJ0EnOiAxMCxcclxuICAgICAgJ0IrUCc6IDAuMDA4XHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0EnOiA5Mi42LFxyXG4gICAgICAnRUMrQisnOiA3LjRcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQSc6IDg5LFxyXG4gICAgICAnRUMrQisnOiAxMVxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDkwLFxyXG4gICAgICAnQSc6IDEwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNSxcclxuICAgICAgJ0EnOiAwLjVcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDIxXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTE6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTEzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDcxOiB7XHJcbiAgICA3OToge1xyXG4gICAgICAnUCc6IDcwLjksXHJcbiAgICAgICdFQytCKyc6IDI5LjFcclxuICAgIH0sXHJcbiAgICA4MDoge1xyXG4gICAgICAnUCc6IDYzLjQsXHJcbiAgICAgICdFQytCKyc6IDM2LjZcclxuICAgIH0sXHJcbiAgICA4MToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdCK1AnOiAxNVxyXG4gICAgfSxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDgzOiBudWxsLFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0EnOiA5MCxcclxuICAgICAgJ0VDK0IrJzogMTBcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQSc6IDk1LFxyXG4gICAgICAnRUMrQisnOiA1XHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0EnOiAwXHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuMDksXHJcbiAgICAgICdBJzogMC45MVxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjFcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDAxXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMTY6IHtcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9XHJcbiAgfSxcclxuICA3Mjoge1xyXG4gICAgNzk6IG51bGwsXHJcbiAgICA4MTogbnVsbCxcclxuICAgIDgyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4NToge1xyXG4gICAgICAnQSc6IDk0LFxyXG4gICAgICAnRUMrQisnOiAxNFxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDU1LjcsXHJcbiAgICAgICdBJzogNDQuM1xyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdFQytCKyc6IDY1LFxyXG4gICAgICAnQSc6IDM1XHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuMyxcclxuICAgICAgJ0EnOiAwLjdcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnRUMrQisnOiA5OS44NyxcclxuICAgICAgJ0EnOiAwLjEzXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTkyLFxyXG4gICAgICAnQSc6IDAuMDA4XHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMVxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdJVCc6IDEwMCxcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzM6IHtcclxuICAgIDgyOiB7XHJcbiAgICAgICdQJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODM6IHtcclxuICAgICAgJ1AnOiA3MSxcclxuICAgICAgJ0VDK0IrJzogMjlcclxuICAgIH0sXHJcbiAgICA4NDoge1xyXG4gICAgICAnQSc6IDk2LjYsXHJcbiAgICAgICdQJzogMy40XHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0EnOiA5MSxcclxuICAgICAgJ0VDK0IrJzogOVxyXG4gICAgfSxcclxuICAgIDg2OiB7XHJcbiAgICAgICdFQytCKyc6IDY2LFxyXG4gICAgICAnQSc6IDM0XHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0EnOiAzNFxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdBJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjkyNixcclxuICAgICAgJ0EnOiAwLjA3NCxcclxuICAgICAgJ0VDUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnRUMrQisnOiA5OS44LFxyXG4gICAgICAnQSc6IDAuMlxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMnOiA4NSxcclxuICAgICAgJ0ItJzogMTVcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTg6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjA6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA3NDoge1xyXG4gICAgODM6IHtcclxuICAgICAgJ0VDJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODU6IHtcclxuICAgICAgJ0EnOiA5OS45LFxyXG4gICAgICAnRUMrQisnOiAwLjFcclxuICAgIH0sXHJcbiAgICA4Njoge1xyXG4gICAgICAnQSc6IDg3LFxyXG4gICAgICAnRUMrQisnOiAxM1xyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdBJzogNzMsXHJcbiAgICAgICdFQytCKyc6IDI3XHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0VDK0IrJzogNTQuOCxcclxuICAgICAgJ0EnOiA0NS4yXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0VDK0IrJzogODYsXHJcbiAgICAgICdBJzogMTRcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnRUMrQisnOiA5Ni4yLFxyXG4gICAgICAnQSc6IDMuOFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjgsXHJcbiAgICAgICdBJzogMC4yXHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTY1LFxyXG4gICAgICAnQSc6IDAuMDM1XHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTYsXHJcbiAgICAgICdBJzogMC4wNFxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMzJcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Nzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5ODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMjoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIxOiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA3NToge1xyXG4gICAgODQ6IG51bGwsXHJcbiAgICA4NToge1xyXG4gICAgICAnUCc6IDg5LFxyXG4gICAgICAnQSc6IDExXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ1AnOiAxMDAsXHJcbiAgICAgICdBJzogMS40XHJcbiAgICB9LFxyXG4gICAgODc6IHtcclxuICAgICAgJ0EnOiA5NCxcclxuICAgICAgJ0VDK0IrJzogNlxyXG4gICAgfSxcclxuICAgIDg4OiB7XHJcbiAgICAgICdFQytCKyc6IDY4LFxyXG4gICAgICAnQSc6IDMyXHJcbiAgICB9LFxyXG4gICAgODk6IHtcclxuICAgICAgJ0EnOiA1OCxcclxuICAgICAgJ0VDK0IrJzogNDJcclxuICAgIH0sXHJcbiAgICA5MDoge1xyXG4gICAgICAnRUMrQisnOiA4NixcclxuICAgICAgJ0EnOiAxNFxyXG4gICAgfSxcclxuICAgIDkxOiB7XHJcbiAgICAgICdFQytCKyc6IDc2LFxyXG4gICAgICAnQSc6IDI0XHJcbiAgICB9LFxyXG4gICAgOTI6IHtcclxuICAgICAgJ0VDK0IrJzogOTksXHJcbiAgICAgICdBJzogMVxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwNVxyXG4gICAgfSxcclxuICAgIDk0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAxXHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDg6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQi0nOiA5Mi41MyxcclxuICAgICAgJ0VDJzogNy40N1xyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDAxXHJcbiAgICB9LFxyXG4gICAgMTEzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTg6IG51bGwsXHJcbiAgICAxMTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyNDoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzY6IHtcclxuICAgIDg1OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODY6IHtcclxuICAgICAgJ0EnOiA5OVxyXG4gICAgfSxcclxuICAgIDg3OiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0EnOiA5NixcclxuICAgICAgJ0VDK0IrJzogNFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdBJzogOTAsXHJcbiAgICAgICdFQytCKyc6IDEwXHJcbiAgICB9LFxyXG4gICAgOTA6IHtcclxuICAgICAgJ0EnOiA3MixcclxuICAgICAgJ0VDK0IrJzogMjhcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQSc6IDU3LFxyXG4gICAgICAnRUMrQisnOiA0M1xyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdFQytCKyc6IDU3LFxyXG4gICAgICAnQSc6IDQzXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0VDK0IrJzogODYuMyxcclxuICAgICAgJ0EnOiAxMy43XHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0VDK0IrJzogOTAuNSxcclxuICAgICAgJ0EnOiA5LjVcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnRUMrQisnOiA5OC4yLFxyXG4gICAgICAnQSc6IDEuOFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjgsXHJcbiAgICAgICdBJzogMC4yXHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNixcclxuICAgICAgJ0EnOiAwLjRcclxuICAgIH0sXHJcbiAgICA5ODoge1xyXG4gICAgICAnRUMnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMlxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDg6IHtcclxuICAgICAgJ0EnOiBudWxsLFxyXG4gICAgICAnMkIrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTk6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjY6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA3Nzoge1xyXG4gICAgODc6IHtcclxuICAgICAgJ0VDK0IrJzogbnVsbCxcclxuICAgICAgJ0EnOiBudWxsLFxyXG4gICAgICAnUCc6IG51bGxcclxuICAgIH0sXHJcbiAgICA4ODoge1xyXG4gICAgICAnQSc6IG51bGwsXHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDg5OiB7XHJcbiAgICAgICdBJzogOTMsXHJcbiAgICAgICdQJzogN1xyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdBJzogNDgsXHJcbiAgICAgICdQJzogMzIsXHJcbiAgICAgICdFQytCKyc6IDIwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdQJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdBJzogNDUsXHJcbiAgICAgICdQJzogbnVsbCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdFQytCKyc6IDk0LjgsXHJcbiAgICAgICdBJzogNS4yXHJcbiAgICB9LFxyXG4gICAgOTQ6IHtcclxuICAgICAgJ0VDK0IrJzogODUsXHJcbiAgICAgICdBJzogMTVcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnRUMrQisnOiA5OCxcclxuICAgICAgJ0EnOiAyXHJcbiAgICB9LFxyXG4gICAgOTY6IHtcclxuICAgICAgJ0VDK0IrJzogOTMsXHJcbiAgICAgICdBJzogN1xyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdFQyc6IDk5LjUsXHJcbiAgICAgICdBJzogMC41XHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuMTUsXHJcbiAgICAgICdBJzogMC44NVxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdFQytCKyc6IDk2LjksXHJcbiAgICAgICdBJzogMy4xXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk0LFxyXG4gICAgICAnQSc6IDAuMDZcclxuICAgIH0sXHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTA4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQisnOiAwLjAwMlxyXG4gICAgfSxcclxuICAgIDExNToge1xyXG4gICAgICAnQi0nOiA5NS4yNCxcclxuICAgICAgJ0VDJzogNC43NlxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyNDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjg6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzg6IHtcclxuICAgIDg3OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgODg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA4OToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkwOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTE6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Mjoge1xyXG4gICAgICAnQSc6IDk4LFxyXG4gICAgICAnRUMrQisnOiAyXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0EnOiA5MCxcclxuICAgICAgJ0VDK0IrJzogMTBcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnQSc6IDk0LFxyXG4gICAgICAnRUMrQisnOiA2XHJcbiAgICB9LFxyXG4gICAgOTU6IHtcclxuICAgICAgJ0EnOiA4NixcclxuICAgICAgJ0VDK0IrJzogMTZcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQSc6IDc2LFxyXG4gICAgICAnRUMrQisnOiAyNFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdBJzogNjQsXHJcbiAgICAgICdFQytCKyc6IDM2XHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0VDK0IrJzogNjAsXHJcbiAgICAgICdBJzogNDBcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnRUMrQisnOiA5NC4zLFxyXG4gICAgICAnQSc6IDUuN1xyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnRUMrQisnOiA5Mi4zLFxyXG4gICAgICAnQSc6IDcuN1xyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnRUMrQisnOiA5OS43NixcclxuICAgICAgJ0EnOiAwLjI0XHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjcsXHJcbiAgICAgICdBJzogMC4zXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjA4XHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk2MixcclxuICAgICAgJ0EnOiAwLjAzOFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDk2XHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMVxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMTRcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEwOiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk5OTk3NCxcclxuICAgICAgJ0EnOiAwLjAwMDAyNlxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTI6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyODoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzk6IHtcclxuICAgIDkxOiB7XHJcbiAgICAgICdQJzogODksXHJcbiAgICAgICdBJzogMTFcclxuICAgIH0sXHJcbiAgICA5Mjoge1xyXG4gICAgICAnUCc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkzOiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnQSc6IDk0LFxyXG4gICAgICAnUCc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnQSc6IDBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQSc6IDkwXHJcbiAgICB9LFxyXG4gICAgOTc6IG51bGwsXHJcbiAgICA5ODoge1xyXG4gICAgICAnRUMrQisnOiA2MCxcclxuICAgICAgJ0EnOiA0MFxyXG4gICAgfSxcclxuICAgIDk5OiB7XHJcbiAgICAgICdFQytCKyc6IDYwLFxyXG4gICAgICAnQSc6IDQwXHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDc4LFxyXG4gICAgICAnQSc6IDIyXHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdFQytCKyc6IDk4LjIsXHJcbiAgICAgICdBJzogMS44XHJcbiAgICB9LFxyXG4gICAgMTAyOiB7XHJcbiAgICAgICdFQytCKyc6IDk3LjMsXHJcbiAgICAgICdBJzogMi43XHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljg3LFxyXG4gICAgICAnQSc6IDAuMTNcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNDUsXHJcbiAgICAgICdBJzogMC41NVxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMTZcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuNzQsXHJcbiAgICAgICdBJzogMC4yNlxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDA4XHJcbiAgICB9LFxyXG4gICAgMTA4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwM1xyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDNcclxuICAgIH0sXHJcbiAgICAxMTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAxXHJcbiAgICB9LFxyXG4gICAgMTEyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTQ6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0VDK0IrJzogOTMsXHJcbiAgICAgICdCLSc6IDdcclxuICAgIH0sXHJcbiAgICAxMTk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjg6IHtcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjk6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMzA6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMxOiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA4MDoge1xyXG4gICAgOTA6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5MToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDkyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTM6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5NDoge1xyXG4gICAgICAnQSc6IDk5LjZcclxuICAgIH0sXHJcbiAgICA5NToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk2OiB7XHJcbiAgICAgICdBJzogOTRcclxuICAgIH0sXHJcbiAgICA5Nzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk4OiB7XHJcbiAgICAgICdBJzogNzAsXHJcbiAgICAgICdFQytCKyc6IDMwXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0EnOiA1NSxcclxuICAgICAgJ0VDK0IrJzogNDUsXHJcbiAgICAgICdFQ1AnOiAwLjE1XHJcbiAgICB9LFxyXG4gICAgMTAwOiB7XHJcbiAgICAgICdFQytCKyc6IDUyLFxyXG4gICAgICAnQSc6IDQ4XHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdFQytCKyc6IDczLFxyXG4gICAgICAnQSc6IDI3LFxyXG4gICAgICAnRUNQJzogMC4wMTNcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0VDK0IrJzogODYuMixcclxuICAgICAgJ0EnOiAxMy44XHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDg4LjMsXHJcbiAgICAgICdBJzogMTEuNyxcclxuICAgICAgJ0VDUCc6IDAuMDAwMjZcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0VDK0IrJzogOTguODksXHJcbiAgICAgICdBJzogMS4xMVxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnRUMrQisnOiA5NCxcclxuICAgICAgJ0EnOiA2XHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk4NCxcclxuICAgICAgJ0EnOiAwLjAxNlxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDAzN1xyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnRUMrQisnOiA5OS45OTk5NjMsXHJcbiAgICAgICdBJzogMC4wMDAwMzdcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDNcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAwMzRcclxuICAgIH0sXHJcbiAgICAxMTE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEyOiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTQ6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzA6IG51bGwsXHJcbiAgICAxMzE6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMzI6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1OJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEzMzoge1xyXG4gICAgICAnQi1OJzogbnVsbCxcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEzNDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA4MToge1xyXG4gICAgOTU6IHtcclxuICAgICAgJ1AnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5Njoge1xyXG4gICAgICAnQSc6IDczLFxyXG4gICAgICAnUCc6IDI3XHJcbiAgICB9LFxyXG4gICAgOTc6IHtcclxuICAgICAgJ0EnOiA1MyxcclxuICAgICAgJ0VDK0IrJzogNDdcclxuICAgIH0sXHJcbiAgICA5ODoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ1AnOiBudWxsLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgOTk6IHtcclxuICAgICAgJ0VDK0IrJzogOTQsXHJcbiAgICAgICdBJzogNixcclxuICAgICAgJ0VDU0YnOiAwLjAwMzJcclxuICAgIH0sXHJcbiAgICAxMDA6IHtcclxuICAgICAgJ0EnOiAxMFxyXG4gICAgfSxcclxuICAgIDEwMToge1xyXG4gICAgICAnRUMrQisnOiA5Ny41LFxyXG4gICAgICAnQSc6IDVcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0VDK0IrJzogMCxcclxuICAgICAgJ0EnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTAzOiB7XHJcbiAgICAgICdFQytCKyc6IDk3LjksXHJcbiAgICAgICdBJzogMi4xXHJcbiAgICB9LFxyXG4gICAgMTA0OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDA2XHJcbiAgICB9LFxyXG4gICAgMTA2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAzXHJcbiAgICB9LFxyXG4gICAgMTA3OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEwOiBudWxsLFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMDAwMVxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTU6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE2OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTg6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE5OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdCLSc6IDk3LjA4LFxyXG4gICAgICAnRUMrQisnOiAyLjkyXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI4OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiAwLjAwN1xyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTMxOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDEuOFxyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IDM0XHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdCLU4nOiBudWxsLFxyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDgyOiB7XHJcbiAgICA5Njoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDk3OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgOTg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICA5OToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwMDoge1xyXG4gICAgICAnQSc6IDk4LFxyXG4gICAgICAnRUMrQisnOiAyXHJcbiAgICB9LFxyXG4gICAgMTAxOiB7XHJcbiAgICAgICdBJzogOTBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0EnOiA4MCxcclxuICAgICAgJ0VDK0IrJzogMjBcclxuICAgIH0sXHJcbiAgICAxMDM6IHtcclxuICAgICAgJ0EnOiAzNCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEwNDoge1xyXG4gICAgICAnRUMrQisnOiA2MCxcclxuICAgICAgJ0EnOiA0MFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnRUMrQisnOiA5MC41LFxyXG4gICAgICAnQSc6IDkuNVxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnRUMrQisnOiA5MS41LFxyXG4gICAgICAnQSc6IDguNVxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC40XHJcbiAgICB9LFxyXG4gICAgMTA4OiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjYsXHJcbiAgICAgICdBJzogMC40XHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljk4NyxcclxuICAgICAgJ0EnOiAwLjAxM1xyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnRUMrQisnOiA5OS45OTQxLFxyXG4gICAgICAnQSc6IDAuMDA1OVxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTEyOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMDAwNzNcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMDAzXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE4OiB7XHJcbiAgICAgICdFQyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjA6IHtcclxuICAgICAgJ0VDJzogMTAwLFxyXG4gICAgICAnQSc6IDFcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0VDJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnRUMnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI4OiB7XHJcbiAgICAgICdCLSc6IDEwMCxcclxuICAgICAgJ0EnOiAwLjAwMDAwMTlcclxuICAgIH0sXHJcbiAgICAxMjk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNDoge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM4OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDgzOiB7XHJcbiAgICAxMDE6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDI6IHtcclxuICAgICAgJ1AnOiA5MCxcclxuICAgICAgJ0EnOiAxMFxyXG4gICAgfSxcclxuICAgIDEwMzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnQSc6IDkwLFxyXG4gICAgICAnRUMrQisnOiAxMCxcclxuICAgICAgJ0IrRic6IDAuMDAwMDIzXHJcbiAgICB9LFxyXG4gICAgMTA4OiB7XHJcbiAgICAgICdBJzogNTEsXHJcbiAgICAgICdFQytCKyc6IDQ5XHJcbiAgICB9LFxyXG4gICAgMTA5OiB7XHJcbiAgICAgICdFQytCKyc6IDg4LFxyXG4gICAgICAnQSc6IDEyXHJcbiAgICB9LFxyXG4gICAgMTEwOiB7XHJcbiAgICAgICdFQytCKyc6IDk2LjUsXHJcbiAgICAgICdBJzogMy41XHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjU0LFxyXG4gICAgICAnQSc6IDAuNDZcclxuICAgIH0sXHJcbiAgICAxMTI6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTcsXHJcbiAgICAgICdBJzogMC4wM1xyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDExNVxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnRUMrQisnOiAxMDAsXHJcbiAgICAgICdBJzogMC4wMDAxXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE4OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjA6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIxOiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMjoge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0VDK0IrJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI0OiB7XHJcbiAgICAgICdFQytCKyc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNToge1xyXG4gICAgICAnRUMrQisnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDAwMTMyXHJcbiAgICB9LFxyXG4gICAgMTI4OiB7XHJcbiAgICAgICdBJzogOTkuNzI0LFxyXG4gICAgICAnQi0nOiAwLjI3NlxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQi0nOiA2NC4wNixcclxuICAgICAgJ0EnOiAzNS45NFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQi0nOiA5Ny44LFxyXG4gICAgICAnQSc6IDIuMlxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQi0nOiA5OS45NzksXHJcbiAgICAgICdBJzogMC4wMjEsXHJcbiAgICAgICdCLUEnOiAwLjAwM1xyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzM6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM3OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMzg6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMzk6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDA6IHtcclxuICAgICAgJ0ItTic6IG51bGwsXHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDE6IHtcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDg0OiB7XHJcbiAgICAxMDI6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDM6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDU6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0EnOiA5OVxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQSc6IDk5LjUsXHJcbiAgICAgICdFQytCKyc6IDAuNVxyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnQSc6IDkzLFxyXG4gICAgICAnRUMrQisnOiA3XHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdBJzogOTQsXHJcbiAgICAgICdFQytCKyc6IDZcclxuICAgIH0sXHJcbiAgICAxMTI6IHtcclxuICAgICAgJ0EnOiA5OCxcclxuICAgICAgJ0VDK0IrJzogMlxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnRUMrQisnOiA1NixcclxuICAgICAgJ0EnOiA0NFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQSc6IDU3LFxyXG4gICAgICAnRUMrQisnOiA0M1xyXG4gICAgfSxcclxuICAgIDExNToge1xyXG4gICAgICAnRUMrQisnOiA5Mi41LFxyXG4gICAgICAnQSc6IDcuNVxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnRUMrQisnOiA4OC45LFxyXG4gICAgICAnQSc6IDExLjFcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0VDK0IrJzogOTguODcsXHJcbiAgICAgICdBJzogMS4xM1xyXG4gICAgfSxcclxuICAgIDExODoge1xyXG4gICAgICAnRUMrQisnOiA5OC4wOCxcclxuICAgICAgJ0EnOiAxLjkyXHJcbiAgICB9LFxyXG4gICAgMTE5OiB7XHJcbiAgICAgICdFQytCKyc6IDk5Ljg5LFxyXG4gICAgICAnQSc6IDAuMTFcclxuICAgIH0sXHJcbiAgICAxMjA6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuMzMsXHJcbiAgICAgICdBJzogMC42N1xyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnRUMrQisnOiA5OS45NixcclxuICAgICAgJ0EnOiAwLjA0XHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdFQytCKyc6IDk0LjU1LFxyXG4gICAgICAnQSc6IDUuNDVcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuOTc5LFxyXG4gICAgICAnQSc6IDAuMDIxXHJcbiAgICB9LFxyXG4gICAgMTI0OiB7XHJcbiAgICAgICdBJzogOTkuOTk2LFxyXG4gICAgICAnRUMrQisnOiAwLjAwNFxyXG4gICAgfSxcclxuICAgIDEyNToge1xyXG4gICAgICAnQSc6IDk5LjU0NixcclxuICAgICAgJ0VDK0IrJzogMC40NTRcclxuICAgIH0sXHJcbiAgICAxMjY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjk6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzA6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzE6IHtcclxuICAgICAgJ0EnOiA5OS45OTk3NyxcclxuICAgICAgJ0ItJzogMC4wMDAyM1xyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMzoge1xyXG4gICAgICAnQSc6IDk1LFxyXG4gICAgICAnQi0nOiA1XHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdBJzogOTkuOTgsXHJcbiAgICAgICdCLSc6IDAuMDJcclxuICAgIH0sXHJcbiAgICAxMzU6IHtcclxuICAgICAgJ0ItJzogNzEuOCxcclxuICAgICAgJ0EnOiAyOC4yXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMzc6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM4OiBudWxsLFxyXG4gICAgMTM5OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDA6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDM6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgODU6IHtcclxuICAgIDEwNjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEwOToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDRic6IDAuOCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQSc6IDk1LjEsXHJcbiAgICAgICdFQytCKyc6IDQuOVxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQSc6IDk2LjEsXHJcbiAgICAgICdFQytCKyc6IDMuOVxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnQSc6IDkwLFxyXG4gICAgICAnRUMrQisnOiAxMFxyXG4gICAgfSxcclxuICAgIDExNDoge1xyXG4gICAgICAnQSc6IDkwLFxyXG4gICAgICAnRUMrQisnOiAxMFxyXG4gICAgfSxcclxuICAgIDExNToge1xyXG4gICAgICAnQSc6IDUyLFxyXG4gICAgICAnRUMrQisnOiA0OFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnQSc6IDcxLFxyXG4gICAgICAnRUMrQisnOiAyOVxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnRUMrQisnOiA2MyxcclxuICAgICAgJ0EnOiAzN1xyXG4gICAgfSxcclxuICAgIDExODoge1xyXG4gICAgICAnRUMrQisnOiA2OSxcclxuICAgICAgJ0EnOiAzMVxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnRUMrQisnOiA5Ni4wOSxcclxuICAgICAgJ0EnOiAzLjkxXHJcbiAgICB9LFxyXG4gICAgMTIwOiB7XHJcbiAgICAgICdFQytCKyc6IDkwLFxyXG4gICAgICAnQSc6IDEwXHJcbiAgICB9LFxyXG4gICAgMTIxOiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjEsXHJcbiAgICAgICdBJzogMC45XHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdFQytCKyc6IDkxLjQsXHJcbiAgICAgICdBJzogOC42XHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdFQytCKyc6IDk5LjQ1LFxyXG4gICAgICAnQSc6IDAuNTVcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0VDK0IrJzogOTUuOSxcclxuICAgICAgJ0EnOiA0LjFcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0VDK0IrJzogOTkuODI1LFxyXG4gICAgICAnQSc6IDAuMTc1XHJcbiAgICB9LFxyXG4gICAgMTI2OiB7XHJcbiAgICAgICdFQyc6IDU4LjIsXHJcbiAgICAgICdBJzogNDEuOFxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0ItJzogMC4wMDYsXHJcbiAgICAgICdFQyc6IDAuMDAwMDAwM1xyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQSc6IDk5Ljk5MyxcclxuICAgICAgJ0ItJzogMC4wMDdcclxuICAgIH0sXHJcbiAgICAxMzM6IHtcclxuICAgICAgJ0EnOiA5OS45NSxcclxuICAgICAgJ0ItJzogMC4wNVxyXG4gICAgfSxcclxuICAgIDEzNDoge1xyXG4gICAgICAnQSc6IDkzLjYsXHJcbiAgICAgICdCLSc6IDYuNFxyXG4gICAgfSxcclxuICAgIDEzNToge1xyXG4gICAgICAnQi0nOiA5MixcclxuICAgICAgJ0EnOiA4XHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM5OiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDA6IHtcclxuICAgICAgJ0ItJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQi0nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdCLSc6IG51bGwsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTQzOiB7XHJcbiAgICAgICdCLSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0ItJzogbnVsbCxcclxuICAgICAgJ0ItTic6IG51bGxcclxuICAgIH1cclxuICB9LFxyXG4gIDg2OiB7XHJcbiAgICAxMDc6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMDk6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTA6IHtcclxuICAgICAgJ0EnOiA5OS45LFxyXG4gICAgICAnRUMrQisnOiAwLjA2XHJcbiAgICB9LFxyXG4gICAgMTExOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTEyOiB7XHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExMzoge1xyXG4gICAgICAnQSc6IDk0LFxyXG4gICAgICAnRUMrQisnOiA2XHJcbiAgICB9LFxyXG4gICAgMTE0OiB7XHJcbiAgICAgICdBJzogODYsXHJcbiAgICAgICdFQytCKyc6IDE0XHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdFQytCKyc6IG51bGwsXHJcbiAgICAgICdBJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDExNjoge1xyXG4gICAgICAnQSc6IDc4LFxyXG4gICAgICAnRUMrQisnOiAyMlxyXG4gICAgfSxcclxuICAgIDExNzoge1xyXG4gICAgICAnQSc6IDY2LFxyXG4gICAgICAnRUMrQisnOiAzNFxyXG4gICAgfSxcclxuICAgIDExODoge1xyXG4gICAgICAnQSc6IDcyLjQsXHJcbiAgICAgICdFQytCKyc6IDI3LjZcclxuICAgIH0sXHJcbiAgICAxMTk6IHtcclxuICAgICAgJ0VDK0IrJzogNzUuNCxcclxuICAgICAgJ0EnOiAyNC42XHJcbiAgICB9LFxyXG4gICAgMTIwOiB7XHJcbiAgICAgICdBJzogNjIsXHJcbiAgICAgICdFQytCKyc6IDM4XHJcbiAgICB9LFxyXG4gICAgMTIxOiB7XHJcbiAgICAgICdFQytCKyc6IDc5LFxyXG4gICAgICAnQSc6IDIxXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdBJzogNjIsXHJcbiAgICAgICdFQytCKyc6IDM4XHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdFQytCKyc6IDgzLFxyXG4gICAgICAnQSc6IDE3XHJcbiAgICB9LFxyXG4gICAgMTI0OiB7XHJcbiAgICAgICdBJzogOTYsXHJcbiAgICAgICdFQytCKyc6IDRcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0VDJzogNzIuNixcclxuICAgICAgJ0EnOiAyNy40XHJcbiAgICB9LFxyXG4gICAgMTI2OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI3OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI4OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTI5OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMwOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMxOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdCLSc6IDc4LFxyXG4gICAgICAnQSc6IDIyXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM3OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzODoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgODc6IHtcclxuICAgIDExMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExMjoge1xyXG4gICAgICAnQSc6IDAsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMTM6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTU6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0EnOiA5MixcclxuICAgICAgJ0VDK0IrJzogOFxyXG4gICAgfSxcclxuICAgIDExODoge1xyXG4gICAgICAnQSc6IDk4LjUsXHJcbiAgICAgICdFQytCKyc6IDEuNVxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnQSc6IDg0LFxyXG4gICAgICAnRUMnOiAxNlxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnQSc6IDk1LFxyXG4gICAgICAnRUMrQisnOiA1XHJcbiAgICB9LFxyXG4gICAgMTIxOiB7XHJcbiAgICAgICdBJzogODksXHJcbiAgICAgICdFQytCKyc6IDExXHJcbiAgICB9LFxyXG4gICAgMTIyOiB7XHJcbiAgICAgICdBJzogODksXHJcbiAgICAgICdFQytCKyc6IDExXHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdBJzogNjAsXHJcbiAgICAgICdFQytCKyc6IDQwXHJcbiAgICB9LFxyXG4gICAgMTI0OiB7XHJcbiAgICAgICdBJzogODAsXHJcbiAgICAgICdFQyc6IDIwXHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdFQytCKyc6IDU3LFxyXG4gICAgICAnQSc6IDQzXHJcbiAgICB9LFxyXG4gICAgMTI2OiB7XHJcbiAgICAgICdBJzogOTkuNDQsXHJcbiAgICAgICdFQytCKyc6IDAuNTZcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjk6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdFQyc6IDAuMDAwMDAwMlxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMzoge1xyXG4gICAgICAnQSc6IDk5LjY1LFxyXG4gICAgICAnQi0nOiAwLjM1XHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnQi0nOiAwLjFcclxuICAgIH0sXHJcbiAgICAxMzU6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdCLSc6IDk5Ljk5NCxcclxuICAgICAgJ0EnOiAwLjAwNlxyXG4gICAgfSxcclxuICAgIDEzNzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzg6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDE6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Njoge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdCLU4nOiBudWxsXHJcbiAgICB9XHJcbiAgfSxcclxuICA4ODoge1xyXG4gICAgMTEzOiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnRUMrQisnOiBudWxsXHJcbiAgICB9LFxyXG4gICAgMTE0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE1OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE2OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE3OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE4OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTE5OiB7XHJcbiAgICAgICdBJzogODYsXHJcbiAgICAgICdFQytCKyc6IDE0XHJcbiAgICB9LFxyXG4gICAgMTIwOiB7XHJcbiAgICAgICdBJzogOTUsXHJcbiAgICAgICdFQytCKyc6IDVcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0EnOiA5NixcclxuICAgICAgJ0VDK0IrJzogNFxyXG4gICAgfSxcclxuICAgIDEyMzoge1xyXG4gICAgICAnQSc6IDkzLFxyXG4gICAgICAnRUMrQisnOiA3XHJcbiAgICB9LFxyXG4gICAgMTI0OiB7XHJcbiAgICAgICdBJzogODUsXHJcbiAgICAgICdFQytCKyc6IDE1XHJcbiAgICB9LFxyXG4gICAgMTI1OiB7XHJcbiAgICAgICdBJzogODAsXHJcbiAgICAgICdFQytCKyc6IDIwXHJcbiAgICB9LFxyXG4gICAgMTI2OiB7XHJcbiAgICAgICdBJzogOTkuOTQxLFxyXG4gICAgICAnRUMnOiAwLjA1OVxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyODoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDJzogMC4wMDAwMDAwMVxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNDoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJzE0Qyc6IDAuMDAwMDAwMDNcclxuICAgIH0sXHJcbiAgICAxMzU6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICcxNEMnOiAwLjAwMDAwMDA4OVxyXG4gICAgICAvLyAnMTRDJzogMC4wMDAwMDAwNzcgLy8gVE9ETzogaG93IHRvIGhhbmRsZSB0d28gb2YgdGhlIHNhbWUgZGVjYXk/XHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnMTRDJzogMC4wMDAwMDAwMDRcclxuICAgIH0sXHJcbiAgICAxMzc6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDI2XHJcbiAgICB9LFxyXG4gICAgMTM4OiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnMTRDJzogMy4yMEUtMDlcclxuICAgIH0sXHJcbiAgICAxMzk6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQwOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH1cclxuICB9LFxyXG4gIDg5OiB7XHJcbiAgICAxMTY6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTc6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMTk6IHtcclxuICAgICAgJ0EnOiA5OSxcclxuICAgICAgJ0VDJzogMVxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMjoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogMC4yXHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdBJzogOTUsXHJcbiAgICAgICdFQytCKyc6IDVcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0EnOiA4OSxcclxuICAgICAgJ0VDJzogMTFcclxuICAgIH0sXHJcbiAgICAxMjY6IHtcclxuICAgICAgJ0EnOiA5OS45MSxcclxuICAgICAgJ0VDK0IrJzogMC4wOVxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyODoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogMlxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDJzogMC4wMDA1XHJcbiAgICB9LFxyXG4gICAgMTMyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdBJzogOTksXHJcbiAgICAgICdFQytCKyc6IDFcclxuICAgIH0sXHJcbiAgICAxMzQ6IHtcclxuICAgICAgJ0EnOiA5OSxcclxuICAgICAgJ0VDJzogMVxyXG4gICAgfSxcclxuICAgIDEzNToge1xyXG4gICAgICAnRUMnOiA5MC45LFxyXG4gICAgICAnQSc6IDkuMVxyXG4gICAgfSxcclxuICAgIDEzNjoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJzE0Qyc6IDUuMzBFLTEwXHJcbiAgICB9LFxyXG4gICAgMTM3OiB7XHJcbiAgICAgICdCLSc6IDgzLFxyXG4gICAgICAnRUMnOiAxNyxcclxuICAgICAgJ0EnOiAwLjAwNlxyXG4gICAgfSxcclxuICAgIDEzODoge1xyXG4gICAgICAnQi0nOiA5OC42MixcclxuICAgICAgJ0EnOiAxLjM4XHJcbiAgICB9LFxyXG4gICAgMTM5OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0MDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQi1GJzogMC4wMDAwMDEyXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0NjogbnVsbFxyXG4gIH0sXHJcbiAgOTA6IHtcclxuICAgIDExODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDExOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyMDoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyMToge1xyXG4gICAgICAnRUMrQisnOiBudWxsLFxyXG4gICAgICAnQSc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjY6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdFQytCKyc6IDAuMDFcclxuICAgIH0sXHJcbiAgICAxMjc6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjg6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjk6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMzA6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdFQyc6IDAuMDAwMDAwMlxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNToge1xyXG4gICAgICAnQSc6IDkwLFxyXG4gICAgICAnRUMnOiAxMFxyXG4gICAgfSxcclxuICAgIDEzNjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0MDoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJzI0TkUnOiA1LjgwRS0xMSxcclxuICAgICAgJ1NGJzogNC4wMEUtMTJcclxuICAgIH0sXHJcbiAgICAxNDE6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnQSc6IDQuMDBFLTExXHJcbiAgICB9LFxyXG4gICAgMTQyOiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnU0YnOiAxLjEwRS0wOVxyXG4gICAgfSxcclxuICAgIDE0Mzoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQ1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Njoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH1cclxuICB9LFxyXG4gIDkxOiB7XHJcbiAgICAxMjA6IHtcclxuICAgICAgJ1AnOiBudWxsLFxyXG4gICAgICAnQSc6IG51bGwsXHJcbiAgICAgICdFQytCKyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxMjE6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjI6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjM6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjQ6IHtcclxuICAgICAgJ0EnOiAxMDBcclxuICAgIH0sXHJcbiAgICAxMjU6IHtcclxuICAgICAgJ0EnOiA5OCxcclxuICAgICAgJ0VDJzogMlxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyODoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogMC4wMDAwMDAzXHJcbiAgICB9LFxyXG4gICAgMTMwOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMxOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdBJzogNzQsXHJcbiAgICAgICdFQytCKyc6IDI2XHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdBJzogODUsXHJcbiAgICAgICdFQyc6IDE1XHJcbiAgICB9LFxyXG4gICAgMTM3OiB7XHJcbiAgICAgICdFQytCKyc6IDk4LjE1LFxyXG4gICAgICAnQSc6IDEuODVcclxuICAgIH0sXHJcbiAgICAxMzg6IHtcclxuICAgICAgJ0VDJzogOTkuNTIsXHJcbiAgICAgICdBJzogMC40OFxyXG4gICAgfSxcclxuICAgIDEzOToge1xyXG4gICAgICAnRUMrQisnOiA5Mi4yLFxyXG4gICAgICAnQi0nOiA3LjgsXHJcbiAgICAgICdBJzogMC4wMDMyXHJcbiAgICB9LFxyXG4gICAgMTQwOiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAnU0YnOiAzLjAwRS0xMFxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQi0nOiAxMDAsXHJcbiAgICAgICdFQyc6IG51bGxcclxuICAgIH0sXHJcbiAgICAxNDI6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTQzOiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0NDoge1xyXG4gICAgICAnQi0nOiAxMDBcclxuICAgIH0sXHJcbiAgICAxNDU6IHtcclxuICAgICAgJ0ItJzogMTAwLFxyXG4gICAgICAnfGJ7Ky19Zmlzc2lvbic6IDAuMDAwMDAwMDZcclxuICAgIH0sXHJcbiAgICAxNDY6IHtcclxuICAgICAgJ0ItJzogMTAwXHJcbiAgICB9XHJcbiAgfSxcclxuICA5Mjoge1xyXG4gICAgMTIyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTIzOiB7XHJcbiAgICAgICdBJzogMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyNDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogbnVsbFxyXG4gICAgfSxcclxuICAgIDEyNjoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyNzoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEyOToge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMDoge1xyXG4gICAgICAnQSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDEzMToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ0VDK0IrJzogMC4yXHJcbiAgICB9LFxyXG4gICAgMTMyOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTMzOiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM0OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM1OiB7XHJcbiAgICAgICdBJzogMTAwXHJcbiAgICB9LFxyXG4gICAgMTM2OiB7XHJcbiAgICAgICdBJzogOTUsXHJcbiAgICAgICdFQyc6IDVcclxuICAgIH0sXHJcbiAgICAxMzc6IHtcclxuICAgICAgJ0VDJzogODAsXHJcbiAgICAgICdBJzogMjBcclxuICAgIH0sXHJcbiAgICAxMzg6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICd7KzIyfU5lJzogNC44MEUtMTJcclxuICAgIH0sXHJcbiAgICAxMzk6IHtcclxuICAgICAgJ0VDJzogMTAwLFxyXG4gICAgICAnQSc6IDAuMDA0XHJcbiAgICB9LFxyXG4gICAgMTQwOiB7XHJcbiAgICAgICdBJzogMTAwLFxyXG4gICAgICAneysyNH1OZSc6IDguOTBFLTEwLFxyXG4gICAgICAnU0YnOiAyLjcwRS0xMlxyXG4gICAgfSxcclxuICAgIDE0MToge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJzI0TkUnOiA3LjIwRS0xMSxcclxuICAgICAgJ1NGJzogNi4wMEUtMTFcclxuICAgIH0sXHJcbiAgICAxNDI6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdTRic6IDEuNjRFLTA5LFxyXG4gICAgICAnTWcnOiAxLjQwRS0xMVxyXG4gICAgfSxcclxuICAgIDE0Mzoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ1NGJzogMC4wMDAwMDAwMDcsXHJcbiAgICAgICd7KzI1fU5lJzogOC4wMEUtMTBcclxuICAgIH0sXHJcbiAgICAxNDQ6IHtcclxuICAgICAgJ0EnOiAxMDAsXHJcbiAgICAgICdTRic6IDAuMDAwMDAwMDk0XHJcbiAgICB9LFxyXG4gICAgMTQ1OiB7XHJcbiAgICAgICdCLSc6IDEwMFxyXG4gICAgfSxcclxuICAgIDE0Njoge1xyXG4gICAgICAnQSc6IDEwMCxcclxuICAgICAgJ1NGJzogMC4wMDAwNTQ1XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4vKiBlc2xpbnQtZW5hYmxlIHF1b3RlLXByb3BzICovXHJcblxyXG4vLyBUYWJsZSB3aGljaCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB2YXJpb3VzIGF0dHJpYnV0ZXMgb2YgaXNvdG9wZXMuICBUaGlzIGRhdGEgd2FzIG9idGFpbmVkIGZyb20gdGhlIE5hdGlvbmFsXHJcbi8vIEluc3RpdHV0ZSBvZiBTdGFuZGFyZHMgYW5kIFRlY2hub2xvZ3kgKE5JU1QpIGF0IHRoZSBVUkxcclxuLy9cclxuLy8gaHR0cDovL3BoeXNpY3MubmlzdC5nb3YvY2dpLWJpbi9Db21wb3NpdGlvbnMvc3RhbmRfYWxvbmUucGw/ZWxlPSZhc2NpaT1odG1sJmlzb3R5cGU9c29tZVxyXG4vL1xyXG4vLyAuLi50aG91Z2ggbWFudWFsIHBvc3QtcHJvY2Vzc2luZyB3YXMgbmVjZXNzYXJ5IHRvIHJlbW92ZSBkYXRhIGFuZCBnZXQgaXQgaW50byB0aGUgZm9ybWF0IGJlbG93LiAgVGhpcyB0YWJsZSBvbmx5XHJcbi8vIGNvbnRhaW5zIGlzb3RvcGUgZGF0YSBmb3IgdGhlIGZpcnN0IGVpZ2h0ZWVuIGVsZW10bnMuICBUaGUgb3JpZ2luYWwgY3N2IG9mIHRoaXMgZGF0YSBjYW4gYmUgZm91bmQgaW5cclxuLy8gYnVpbGRhbmF0b20vbW9kZWwvQXRvbUlkZW50aWZpZXIuamF2YS5cclxuLy9cclxuLy8gVGhpcyB0YWJsZSBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XHJcbi8vIGtleXMgb2YgdHlwZSBhdG9taWMgbnVtYmVyXHJcbi8vICBzdWJrZXlzIG9mIHR5cGUgbWFzcyBudW1iZXJcclxuLy8gICAgc3Via2V5cyBvZiB0eXBlIGF0b21pY01hc3MgYW5kIGFidW5kYW5jZSwgd2hpY2ggaG9sZCB0aGUgdmFsdWVzIGZvciBlYWNoIGlzb3RvcGUuXHJcbmNvbnN0IElTT1RPUEVfSU5GT19UQUJMRSA9IHtcclxuICAxOiB7IC8vIGF0b21pYyBudW1iZXJcclxuICAgIDE6IHsgLy8gbWFzc051bWJlclxyXG4gICAgICBhdG9taWNNYXNzOiAxLjAwNzgyNTAzMjA3LFxyXG4gICAgICBhYnVuZGFuY2U6IDAuOTk5ODg1XHJcbiAgICB9LFxyXG4gICAgMjoge1xyXG4gICAgICBhdG9taWNNYXNzOiAyLjAxNDEwMTc3NzgsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMDAxMTVcclxuICAgIH0sXHJcbiAgICAzOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDMuMDE2MDQ5Mjc3NyxcclxuICAgICAgLy8gVXNlIHRyYWNlIGFidW5kYW5jZSwgc2luY2UgV2lraXBlZGlhIGp1c3Qgc2F5cyBcInRyYWNlXCIgYW5kIHRoZSBOSVNUIHRhYmxlIGNvbnRhaW5lZCBpdCBidXQgZGlkbid0IHN0YXRlXHJcbiAgICAgIC8vIGFidW5kYW5jZS5cclxuICAgICAgYWJ1bmRhbmNlOiBUUkFDRV9BQlVOREFOQ0VcclxuICAgIH1cclxuICB9LFxyXG4gIDI6IHtcclxuICAgIDM6IHtcclxuICAgICAgYXRvbWljTWFzczogMy4wMTYwMjkzMTkxLFxyXG4gICAgICBhYnVuZGFuY2U6IDAuMDAwMDAxMzRcclxuICAgIH0sXHJcbiAgICA0OiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDQuMDAyNjAzMjU0MTUsXHJcbiAgICAgIGFidW5kYW5jZTogMC45OTk5OTg2NlxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMzoge1xyXG4gICAgNjoge1xyXG4gICAgICBhdG9taWNNYXNzOiA2LjAxNTEyMjc5NSxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjA3NTlcclxuICAgIH0sXHJcbiAgICA3OiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDcuMDE2MDA0NTUsXHJcbiAgICAgIGFidW5kYW5jZTogMC45MjQxXHJcbiAgICB9XHJcbiAgfSxcclxuICA0OiB7XHJcbiAgICA3OiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDcuMDE2OTI5ODI4LFxyXG4gICAgICBhYnVuZGFuY2U6IFRSQUNFX0FCVU5EQU5DRVxyXG4gICAgfSxcclxuICAgIDk6IHtcclxuICAgICAgYXRvbWljTWFzczogOS4wMTIxODIyLFxyXG4gICAgICBhYnVuZGFuY2U6IDEuMDAwMFxyXG4gICAgfSxcclxuICAgIDEwOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDEwLjAxMzUzMzgxOCxcclxuICAgICAgYWJ1bmRhbmNlOiBUUkFDRV9BQlVOREFOQ0VcclxuICAgIH1cclxuICB9LFxyXG4gIDU6IHtcclxuICAgIDEwOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDEwLjAxMjkzNzAsXHJcbiAgICAgIGFidW5kYW5jZTogMC4xOTlcclxuICAgIH0sXHJcbiAgICAxMToge1xyXG4gICAgICBhdG9taWNNYXNzOiAxMS4wMDkzMDU0LFxyXG4gICAgICBhYnVuZGFuY2U6IDAuODAxXHJcbiAgICB9XHJcbiAgfSxcclxuICA2OiB7XHJcbiAgICAxMjoge1xyXG4gICAgICBhdG9taWNNYXNzOiAxMi4wMDAwMDAwLFxyXG4gICAgICBhYnVuZGFuY2U6IDAuOTg5M1xyXG4gICAgfSxcclxuICAgIDEzOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDEzLjAwMzM1NDgzNzgsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMTA3XHJcbiAgICB9LFxyXG4gICAgMTQ6IHtcclxuICAgICAgYXRvbWljTWFzczogMTQuMDAzMjQxOTg5LFxyXG4gICAgICAvLyBVc2UgdHJhY2UgYWJ1bmRhbmNlLCBzaW5jZSBXaWtpcGVkaWEganVzdCBzYXlzIFwidHJhY2VcIiBhbmQgdGhlIE5JU1QgdGFibGUgY29udGFpbmVkIGl0IGJ1dCBkaWRuJ3Qgc3RhdGVcclxuICAgICAgLy8gYWJ1bmRhbmNlLlxyXG4gICAgICBhYnVuZGFuY2U6IFRSQUNFX0FCVU5EQU5DRVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgNzoge1xyXG4gICAgMTQ6IHtcclxuICAgICAgYXRvbWljTWFzczogMTQuMDAzMDc0MDA0OCxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjk5NjM2XHJcbiAgICB9LFxyXG4gICAgMTU6IHtcclxuICAgICAgYXRvbWljTWFzczogMTUuMDAwMTA4ODk4MixcclxuICAgICAgYWJ1bmRhbmNlOiAwLjAwMzY0XHJcbiAgICB9XHJcbiAgfSxcclxuICA4OiB7XHJcbiAgICAxNjoge1xyXG4gICAgICBhdG9taWNNYXNzOiAxNS45OTQ5MTQ2MTk1NixcclxuICAgICAgYWJ1bmRhbmNlOiAwLjk5NzU3XHJcbiAgICB9LFxyXG4gICAgMTc6IHtcclxuICAgICAgYXRvbWljTWFzczogMTYuOTk5MTMxNzAsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMDAzOFxyXG4gICAgfSxcclxuICAgIDE4OiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDE3Ljk5OTE2MTAsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMDIwNVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgOToge1xyXG4gICAgMTg6IHtcclxuICAgICAgYXRvbWljTWFzczogMTguMDAwOTM4MCxcclxuICAgICAgYWJ1bmRhbmNlOiBUUkFDRV9BQlVOREFOQ0VcclxuICAgIH0sXHJcbiAgICAxOToge1xyXG4gICAgICBhdG9taWNNYXNzOiAxOC45OTg0MDMyMixcclxuICAgICAgYWJ1bmRhbmNlOiAxLjAwMDBcclxuICAgIH1cclxuICB9LFxyXG4gIDEwOiB7XHJcbiAgICAyMDoge1xyXG4gICAgICBhdG9taWNNYXNzOiAxOS45OTI0NDAxNzU0LFxyXG4gICAgICBhYnVuZGFuY2U6IDAuOTA0OFxyXG4gICAgfSxcclxuICAgIDIxOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDIwLjk5Mzg0NjY4LFxyXG4gICAgICBhYnVuZGFuY2U6IDAuMDAyN1xyXG4gICAgfSxcclxuICAgIDIyOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDIxLjk5MTM4NTExNCxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjA5MjVcclxuICAgIH1cclxuICB9LFxyXG4gIDExOiB7XHJcbiAgICAyMzoge1xyXG4gICAgICBhdG9taWNNYXNzOiAyMi45ODk3NjkyODA5LFxyXG4gICAgICBhYnVuZGFuY2U6IDEuMDAwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgMTI6IHtcclxuICAgIDI0OiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDIzLjk4NTA0MTcwMCxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjc4OTlcclxuICAgIH0sXHJcbiAgICAyNToge1xyXG4gICAgICBhdG9taWNNYXNzOiAyNC45ODU4MzY5MixcclxuICAgICAgYWJ1bmRhbmNlOiAwLjEwMDBcclxuICAgIH0sXHJcbiAgICAyNjoge1xyXG4gICAgICBhdG9taWNNYXNzOiAyNS45ODI1OTI5MjksXHJcbiAgICAgIGFidW5kYW5jZTogMC4xMTAxXHJcbiAgICB9XHJcbiAgfSxcclxuICAxMzoge1xyXG4gICAgMjc6IHtcclxuICAgICAgYXRvbWljTWFzczogMjYuOTgxNTM4NjMsXHJcbiAgICAgIGFidW5kYW5jZTogMS4wMDAwXHJcbiAgICB9XHJcbiAgfSxcclxuICAxNDoge1xyXG4gICAgMjg6IHtcclxuICAgICAgYXRvbWljTWFzczogMjcuOTc2OTI2NTMyNSxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjkyMjIzXHJcbiAgICB9LFxyXG4gICAgMjk6IHtcclxuICAgICAgYXRvbWljTWFzczogMjguOTc2NDk0NzAwLFxyXG4gICAgICBhYnVuZGFuY2U6IDAuMDQ2ODVcclxuICAgIH0sXHJcbiAgICAzMDoge1xyXG4gICAgICBhdG9taWNNYXNzOiAyOS45NzM3NzAxNyxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjAzMDkyXHJcbiAgICB9XHJcbiAgfSxcclxuICAxNToge1xyXG4gICAgMzE6IHtcclxuICAgICAgYXRvbWljTWFzczogMzAuOTczNzYxNjMsXHJcbiAgICAgIGFidW5kYW5jZTogMS4wMDAwXHJcbiAgICB9XHJcbiAgfSxcclxuICAxNjoge1xyXG4gICAgMzI6IHtcclxuICAgICAgYXRvbWljTWFzczogMzEuOTcyMDcxMDAsXHJcbiAgICAgIGFidW5kYW5jZTogMC45NDk5XHJcbiAgICB9LFxyXG4gICAgMzM6IHtcclxuICAgICAgYXRvbWljTWFzczogMzIuOTcxNDU4NzYsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMDc1XHJcbiAgICB9LFxyXG4gICAgMzQ6IHtcclxuICAgICAgYXRvbWljTWFzczogMzMuOTY3ODY2OTAsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wNDI1XHJcbiAgICB9LFxyXG4gICAgMzY6IHtcclxuICAgICAgYXRvbWljTWFzczogMzUuOTY3MDgwNzYsXHJcbiAgICAgIGFidW5kYW5jZTogMC4wMDAxXHJcbiAgICB9XHJcbiAgfSxcclxuICAxNzoge1xyXG4gICAgMzU6IHtcclxuICAgICAgYXRvbWljTWFzczogMzQuOTY4ODUyNjgsXHJcbiAgICAgIGFidW5kYW5jZTogMC43NTc2XHJcbiAgICB9LFxyXG4gICAgMzc6IHtcclxuICAgICAgYXRvbWljTWFzczogMzYuOTY1OTAyNTksXHJcbiAgICAgIGFidW5kYW5jZTogMC4yNDI0XHJcbiAgICB9XHJcbiAgfSxcclxuICAxODoge1xyXG4gICAgMzY6IHtcclxuICAgICAgYXRvbWljTWFzczogMzUuOTY3NTQ1MTA2LFxyXG4gICAgICBhYnVuZGFuY2U6IDAuMDAzMzY1XHJcbiAgICB9LFxyXG4gICAgMzg6IHtcclxuICAgICAgYXRvbWljTWFzczogMzcuOTYyNzMyNCxcclxuICAgICAgYWJ1bmRhbmNlOiAwLjAwMDYzMlxyXG4gICAgfSxcclxuICAgIDQwOiB7XHJcbiAgICAgIGF0b21pY01hc3M6IDM5Ljk2MjM4MzEyMjUsXHJcbiAgICAgIGFidW5kYW5jZTogMC45OTYwMDNcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vLyBUYWJsZSB3aGljaCBtYXBzIGF0b21pYyBudW1iZXJzIHRvIHN0YW5kYXJkIGF0b21pYyBtYXNzIChhLmsuYS4gc3RhbmRhcmQgYXRvbWljIHdlaWdodCkuICBUaGlzIHdhcyBvYnRhaW5lZCBmcm9tXHJcbi8vIHRoZSBVUkwgYmVsb3cgYW5kIHN1YnNlcXVlbnRseSBwb3N0LXByb2Nlc3NlZCB0byByZW1vdmUgdW5uZWVkZWQgZGF0YTpcclxuLy9cclxuLy8gaHR0cDovL3BoeXNpY3MubmlzdC5nb3YvY2dpLWJpbi9Db21wb3NpdGlvbnMvc3RhbmRfYWxvbmUucGw/ZWxlPSZhc2NpaT1hc2NpaTImaXNvdHlwZT1zb21lXHJcbmNvbnN0IHN0YW5kYXJkTWFzc1RhYmxlID0gW1xyXG4gIDAsIC8vIDAsIE5PIEVMRU1FTlRcclxuICAxLjAwNzk0LCAvLyAxLCBIWURST0dFTlxyXG4gIDQuMDAyNjAyLCAvLyAyLCBIRUxJVU1cclxuICA2Ljk0MSwgLy8gMywgTElUSElVTVxyXG4gIDkuMDEyMTgyLCAvLyA0LCBCRVJZTExJVU1cclxuICAxMC44MTEsIC8vIDUsIEJPUk9OXHJcbiAgMTIuMDEwNywgLy8gNiwgQ0FSQk9OXHJcbiAgMTQuMDA2NywgLy8gNywgTklUUk9HRU5cclxuICAxNS45OTk0LCAvLyA4LCBPWFlHRU5cclxuICAxOC45OTg0MDMyLCAvLyA5LCBGTFVPUklORVxyXG4gIDIwLjE3OTcsIC8vIDEwLCBORU9OXHJcbiAgMjIuOTg5NzY5MjgsIC8vIDExLCBTT0RJVU1cclxuICAyNC4zMDUwLCAvLyAxMiwgTUFHTkVTSVVNXHJcbiAgMjYuOTgxNTM4NiwgLy8gMTMsIEFMVU1JTlVNXHJcbiAgMjguMDg1NSwgLy8gMTQsIFNJTElDT05cclxuICAzMC45NzM3NjIsIC8vIDE1LCBQSE9TUEhPUlVTXHJcbiAgMzIuMDY1LCAvLyAxNiwgU1VMRlVSXHJcbiAgMzUuNDUzLCAvLyAxNywgQ0hMT1JJTkVcclxuICAzOS45NDgsIC8vIDE4LCBBUkdPTlxyXG4gIDM5LjA5ODMsIC8vIDE5LCBQT1RBU1NJVU1cclxuICA0MC4wNzgsIC8vIDIwLCBDQUxDSVVNXHJcbiAgNDQuOTU1OTEyLCAvLyAyMSwgU0NBTkRJVU1cclxuICA0Ny44NjcsIC8vIDIyLCBUSVRBTklVTVxyXG4gIDUwLjk0MTUsIC8vIDIzLCBWQU5BRElVTVxyXG4gIDUxLjk5NjEsIC8vIDI0LCBDSFJPTUlVTVxyXG4gIDU0LjkzODA0NSwgLy8gMjUsIE1BTkdBTkVTRVxyXG4gIDU1Ljg0NSwgLy8gMjYsIElST05cclxuICA1OC45MzMxOTUsIC8vIDI3LCBDT0JBTFRcclxuICA1OC42OTM0LCAvLyAyOCwgTklDS0VMXHJcbiAgNjMuNTQ2LCAvLyAyOSwgQ09QUEVSXHJcbiAgNjUuMzgsIC8vIDMwLCBaSU5DXHJcbiAgNjkuNzIzLCAvLyAzMSwgR0FMTElVTVxyXG4gIDcyLjY0LCAvLyAzMiwgR0VSTUFOSVVNXHJcbiAgNzQuOTIxNiwgLy8gMzMsIEFSU0VOSUNcclxuICA3OC45NiwgLy8gMzQsIFNFTEVOSVVNXHJcbiAgNzkuOTA0LCAvLyAzNSwgQlJPTUlORVxyXG4gIDgzLjc5OCwgLy8gMzYsIEtSWVBUT05cclxuICA4NS40Njc4LCAvLyAzNywgUlVCSURJVU1cclxuICA4Ny42MiwgLy8gMzgsIFNUUk9OVElVTVxyXG4gIDg4LjkwNTg1LCAvLyAzOSwgWVRUUklVTVxyXG4gIDkxLjIyNCwgLy8gNDAsIFpJUkNPTklVTVxyXG4gIDkyLjkwNjM4LCAvLyA0MSwgTklPQklVTVxyXG4gIDk1Ljk2LCAvLyA0MiwgTU9MWUJERU5VTVxyXG4gIDk4LCAvLyA0MywgVEVDSE5FVElVTVxyXG4gIDEwMS4wNywgLy8gNDQsIFJVVEhFTklVTVxyXG4gIDEwMi45MDU1LCAvLyA0NSwgUkhPRElVTVxyXG4gIDEwNi40MiwgLy8gNDYsIFBBTExBRElVTVxyXG4gIDEwNy44NjgyLCAvLyA0NywgU0lMVkVSXHJcbiAgMTEyLjQxMSwgLy8gNDgsIENBRE1JVU1cclxuICAxMTQuODE4LCAvLyA0OSwgSU5ESVVNXHJcbiAgMTE4LjcxLCAvLyA1MCwgVElOXHJcbiAgMTIxLjc2LCAvLyA1MSwgQU5USU1PTllcclxuICAxMjcuNiwgLy8gNTIsIFRFTExVUklVTVxyXG4gIDEyNi45MDQ0NywgLy8gNTMsIElPRElORVxyXG4gIDEzMS4yOTMsIC8vIDU0LCBYRU5PTlxyXG4gIDEzMi45MDU0NTE5LCAvLyA1NSwgQ0FFU0lVTVxyXG4gIDEzNy4zMjcsIC8vIDU2LCBCQVJJVU1cclxuICAxMzguOTA1NDcsIC8vIDU3LCBMQU5USEFOVU1cclxuICAxNDAuMTE2LCAvLyA1OCwgQ0VSSVVNXHJcbiAgMTQwLjkwNzY1LCAvLyA1OSwgUFJBU0VPRFlNSVVNXHJcbiAgMTQ0LjI0MiwgLy8gNjAsIE5FT0RZTUlVTVxyXG4gIDE0NSwgLy8gNjEsIFBST01FVEhJVU1cclxuICAxNTAuMzYsIC8vIDYyLCBTQU1BUklVTVxyXG4gIDE1MS45NjQsIC8vIDYzLCBFVVJPUElVTVxyXG4gIDE1Ny4yNSwgLy8gNjQsIEdBRE9MSU5JVU1cclxuICAxNTguOTI1MzUsIC8vIDY1LCBURVJCSVVNXHJcbiAgMTYyLjUsIC8vIDY2LCBEWVNQUk9TSVVNXHJcbiAgMTY0LjkzMDMyLCAvLyA2NywgSE9MTUlVTVxyXG4gIDE2Ny4yNTksIC8vIDY4LCBFUkJJVU1cclxuICAxNjguOTM0MjEsIC8vIDY5LCBUSFVMSVVNXHJcbiAgMTczLjA1NCwgLy8gNzAsIFlUVEVSQklVTVxyXG4gIDE3NC45NjY4LCAvLyA3MSwgTFVURVRJVU1cclxuICAxNzguNDksIC8vIDcyLCBIQUZOSVVNXHJcbiAgMTgwLjk0Nzg4LCAvLyA3MywgVEFOVEFMVU1cclxuICAxODMuODQsIC8vIDc0LCBUVU5HU1RFTlxyXG4gIDE4Ni4yMDcsIC8vIDc1LCBSSEVOSVVNXHJcbiAgMTkwLjIzLCAvLyA3NiwgT1NNSVVNXHJcbiAgMTkyLjIxNywgLy8gNzcsIElSSURJVU1cclxuICAxOTUuMDg0LCAvLyA3OCwgUExBVElOVU1cclxuICAxOTYuOTY2NTY5LCAvLyA3OSwgR09MRFxyXG4gIDIwMC41OSwgLy8gODAsIE1FUkNVUllcclxuICAyMDQuMzgzMywgLy8gODEsIFRIQUxMSVVNXHJcbiAgMjA3LjIsIC8vIDgyLCBMRUFEXHJcbiAgMjA4Ljk4MDQgLy8gODMsIEJJU01VVEhcclxuXTtcclxuXHJcbi8vIEhhbGZMaWZlQ29uc3RhbnRzIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBoYWxmLWxpZmUgY29uc3RhbnRzIG9mIHVuc3RhYmxlIG51Y2xpZGVzLiBJZiB0aGUgaGFsZi1saWZlIG9mIGFuIHVuc3RhYmxlXHJcbi8vIG51Y2xpZGUgaXMgdW5rbm93biwgbnVsbCBpcyBzZXQgYXMgYSBwbGFjZWhvbGRlci4gVGhlIGhhbGYtbGlmZSBpcyBpbiBzZWNvbmRzIGFuZCBzb21lIG51bWJlcnMgYXJlIGluIHNjaWVudGlmaWNcclxuLy8gbm90YXRpb24uIFRoZSBkYXRhIHdhcyBvYnRhaW5lZCBmcm9tIHRoZSBOdWNsZWFyIERhdGEgU2VydmljZXMgKE5EUykgb2YgdGhlIEludGVybmF0aW9uYWwgQXRvbWljIEVuZXJneSBBZ2VuY3kgKElBRUEpXHJcbi8vIGF0IHRoZSB1cmwgaHR0cHM6Ly93d3ctbmRzLmlhZWEub3JnL3JlbG5zZC9OZHNFbnNkZi9RdWVyeUZvcm0uaHRtbC5cclxuLy9cclxuLy8gVGhlIG9iamVjdCBpcyBmaXJzdCBpbmRleGVkIGJ5IHRoZSBwcm90b24gbnVtYmVyLCBhbmQgdGhlbiBieSB0aGUgbmV1dHJvbiBudW1iZXIuIEZvciBleGFtcGxlLCBhIG51Y2xpZGUgd2l0aCAxIHByb3RvblxyXG4vLyBhbmQgNCBuZXV0cm9ucyAoIEhhbGZMaWZlQ29uc3RhbnRzWyAxIF1bIDQgXSApIHdvdWxkIGhhdmUgYSBoYWxmLWxpZmUgb2YgOC42MDgyNkUtMjMgc2Vjb25kcy5cclxuY29uc3QgSGFsZkxpZmVDb25zdGFudHMgPSB7XHJcbiAgMDoge1xyXG4gICAgMDogbnVsbCwgLy8gYSBwbGFjZWhvbGRlciB0byBhbGxvdyBhIG51Y2xpZGUgd2l0aCAwIHByb3RvbnMgYW5kIDAgbmV1dHJvbnMgdG8gZXhpc3QgYXMgYSBiYXNlIGNhc2VcclxuICAgIDE6IDYxMy45LFxyXG4gICAgNDogMS43NTQ3NkUtMjIsXHJcbiAgICA2OiBudWxsXHJcbiAgfSxcclxuICAxOiB7XHJcbiAgICAyOiAzODg3ODEzMjgsXHJcbiAgICAzOiBudWxsLFxyXG4gICAgNDogOC42MDgyNkUtMjMsXHJcbiAgICA1OiAyLjk0MzQ3RS0yMixcclxuICAgIDY6IDUuMDY5MzFFLTIxXHJcbiAgfSxcclxuICAyOiB7XHJcbiAgICAzOiA3LjA0MDcxRS0yMixcclxuICAgIDQ6IDAuODA2NyxcclxuICAgIDU6IDMuMDQxNThFLTIxLFxyXG4gICAgNjogMC4xMTkxLFxyXG4gICAgNzogbnVsbCxcclxuICAgIDg6IDEuNTIwNzlFLTIxXHJcbiAgfSxcclxuICAzOiB7XHJcbiAgICAxOiBudWxsLFxyXG4gICAgMjogMy43MDkyNUUtMjIsXHJcbiAgICA1OiAwLjgzOTksXHJcbiAgICA2OiAwLjE3ODMsXHJcbiAgICA3OiBudWxsLFxyXG4gICAgODogMC4wMDg3NSxcclxuICAgIDk6IG51bGxcclxuICB9LFxyXG4gIDQ6IHtcclxuICAgIDI6IDQuOTU5MTFFLTIxLFxyXG4gICAgMzogNDU5ODIwOCxcclxuICAgIDQ6IDguMTkwOThFLTE3LFxyXG4gICAgNjogNC43NjUxRSsxMyxcclxuICAgIDc6IDEzLjc2LFxyXG4gICAgODogMC4wMjE0NixcclxuICAgIDk6IDIuN0UtMjEsXHJcbiAgICAxMDogMC4wMDQzNSxcclxuICAgIDExOiA3Ljg2NjE3RS0yMixcclxuICAgIDEyOiA1LjcwMjk3RS0yMlxyXG4gIH0sXHJcbiAgNToge1xyXG4gICAgMjogNS42OTU4NUUtMjIsXHJcbiAgICAzOiAwLjc3LFxyXG4gICAgNDogOC40NDg4NUUtMTksXHJcbiAgICA3OiAwLjAyMDIsXHJcbiAgICA4OiAwLjAxNzMzLFxyXG4gICAgOTogMC4wMTI1LFxyXG4gICAgMTA6IDAuMDA5OTMsXHJcbiAgICAxMTogNC41NjIzOEUtMjEsXHJcbiAgICAxMjogMC4wMDUwOCxcclxuICAgIDEzOiBudWxsLFxyXG4gICAgMTQ6IDAuMDAyOTIsXHJcbiAgICAxNTogOS4xMjQ3NUUtMjIsXHJcbiAgICAxNjogNy42MDM5NkUtMjJcclxuICB9LFxyXG4gIDY6IHtcclxuICAgIDI6IDMuNTA5NTJFLTIxLFxyXG4gICAgMzogMC4xMjY1LFxyXG4gICAgNDogMTkuMjksXHJcbiAgICA1OiAxMjIxLjg0LFxyXG4gICAgODogMS43OTg3NEUrMTEsXHJcbiAgICA5OiAyLjQ0OSxcclxuICAgIDEwOiAwLjc0NyxcclxuICAgIDExOiAwLjE5MyxcclxuICAgIDEyOiAwLjA5MixcclxuICAgIDEzOiAwLjA0NjMsXHJcbiAgICAxNDogMC4wMTYzLFxyXG4gICAgMTY6IDAuMDA2MVxyXG4gIH0sXHJcbiAgNzoge1xyXG4gICAgMzogMS44MjQ5NUUtMjIsXHJcbiAgICA0OiA1LjQ5Njg0RS0yMixcclxuICAgIDU6IDAuMDExLFxyXG4gICAgNjogNTk3LjksXHJcbiAgICA5OiA3LjEzLFxyXG4gICAgMTA6IDQuMTczLFxyXG4gICAgMTE6IDAuNjE5LFxyXG4gICAgMTI6IDAuMzM2LFxyXG4gICAgMTM6IDAuMTM0NCxcclxuICAgIDE0OiAwLjA4NCxcclxuICAgIDE1OiAwLjAyMyxcclxuICAgIDE2OiAwLjAxNDEsXHJcbiAgICAxNzogMC4wMDAwMDAwNTJcclxuICB9LFxyXG4gIDg6IHtcclxuICAgIDM6IDMuNTA5NTJFLTIyLFxyXG4gICAgNDogNi4zMzY2M0UtMjEsXHJcbiAgICA1OiAwLjAwODU4LFxyXG4gICAgNjogNzAuNjA2LFxyXG4gICAgNzogMTIyLjI0LFxyXG4gICAgMTE6IDI2Ljg4LFxyXG4gICAgMTI6IDEzLjUxLFxyXG4gICAgMTM6IDMuNDIsXHJcbiAgICAxNDogMi4yNSxcclxuICAgIDE1OiAwLjA5NyxcclxuICAgIDE2OiAwLjA2NSxcclxuICAgIDE4OiA0LjVFLTEyXHJcbiAgfSxcclxuICA5OiB7XHJcbiAgICA0OiA0LjUxNzIxRS0yMixcclxuICAgIDU6IDUuMDEzNkUtMjIsXHJcbiAgICA2OiA2LjkxMjY5RS0yMixcclxuICAgIDc6IDEuMTQwNTlFLTIwLFxyXG4gICAgODogNjQuNDksXHJcbiAgICA5OiA2NTg2LjIsXHJcbiAgICAxMTogMTEuMDcsXHJcbiAgICAxMjogNC4xNTgsXHJcbiAgICAxMzogNC4yMyxcclxuICAgIDE0OiAyLjIzLFxyXG4gICAgMTU6IDAuMzksXHJcbiAgICAxNjogMC4wOCxcclxuICAgIDE3OiAwLjAwODIsXHJcbiAgICAxODogMC4wMDUsXHJcbiAgICAxOTogNC42RS0yMCxcclxuICAgIDIwOiAwLjAwMjUsXHJcbiAgICAyMTogbnVsbCxcclxuICAgIDIyOiAwLjAwMDAwMDI2XHJcbiAgfSxcclxuICAxMDoge1xyXG4gICAgNTogNy43MzI4NEUtMjIsXHJcbiAgICA2OiA1LjcwMjk3RS0yMSxcclxuICAgIDc6IDAuMTA5MixcclxuICAgIDg6IDEuNjcyLFxyXG4gICAgOTogMTcuMjIsXHJcbiAgICAxMzogMzcuMjUsXHJcbiAgICAxNDogMjAyLjgsXHJcbiAgICAxNTogMC42MDIsXHJcbiAgICAxNjogMC4xOTcsXHJcbiAgICAxNzogMC4wMzE1LFxyXG4gICAgMTg6IDAuMDIsXHJcbiAgICAxOTogMC4wMTUsXHJcbiAgICAyMDogMC4wMDczLFxyXG4gICAgMjE6IDAuMDAzNCxcclxuICAgIDIyOiAwLjAwMzUsXHJcbiAgICAyMzogMC4wMDAwMDAxOCxcclxuICAgIDI0OiAwLjAwMDAwMDA2XHJcbiAgfSxcclxuICAxMToge1xyXG4gICAgNjogbnVsbCxcclxuICAgIDc6IDIuMjgxMTlFLTIxLFxyXG4gICAgODogMS4xNDA1OUUtMjAsXHJcbiAgICA5OiAwLjQ0NzksXHJcbiAgICAxMDogMjIuNDksXHJcbiAgICAxMTogODIxMDQ4MTAsXHJcbiAgICAxMzogNTM5ODkuMixcclxuICAgIDE0OiA1OS4xLFxyXG4gICAgMTU6IDEuMDcxMjgsXHJcbiAgICAxNjogMC4zMDEsXHJcbiAgICAxNzogMC4wMzA1LFxyXG4gICAgMTg6IDAuMDQ0MSxcclxuICAgIDE5OiAwLjA0OCxcclxuICAgIDIwOiAwLjAxNzM1LFxyXG4gICAgMjE6IDAuMDEzMixcclxuICAgIDIyOiAwLjAwOCxcclxuICAgIDIzOiAwLjAwNTUsXHJcbiAgICAyNDogMC4wMDE4LFxyXG4gICAgMjU6IDAuMDAwMDAwMTgsXHJcbiAgICAyNjogMC4wMDAwMDAwNlxyXG4gIH0sXHJcbiAgMTI6IHtcclxuICAgIDc6IDQuMDAyMDlFLTEyLFxyXG4gICAgODogMC4wOTA0LFxyXG4gICAgOTogMC4xMjIsXHJcbiAgICAxMDogMy44NzU1LFxyXG4gICAgMTE6IDExLjMwNDYsXHJcbiAgICAxNTogNTY3LjQ4LFxyXG4gICAgMTY6IDc1Mjk0LFxyXG4gICAgMTc6IDEuMyxcclxuICAgIDE4OiAwLjMzNSxcclxuICAgIDE5OiAwLjIzNixcclxuICAgIDIwOiAwLjA4NixcclxuICAgIDIxOiAwLjA5MDUsXHJcbiAgICAyMjogMC4wMixcclxuICAgIDIzOiAwLjAxMTMsXHJcbiAgICAyNDogMC4wMDc2LFxyXG4gICAgMjU6IDAuMDA4LFxyXG4gICAgMjY6IG51bGwsXHJcbiAgICAyNzogMC4wMDAwMDAxOCxcclxuICAgIDI4OiBudWxsXHJcbiAgfSxcclxuICAxMzoge1xyXG4gICAgODogMC4wMDAwMDAwMzUsXHJcbiAgICA5OiAwLjA5MTEsXHJcbiAgICAxMDogMC40NDYsXHJcbiAgICAxMTogMi4wNTMsXHJcbiAgICAxMjogNy4xODMsXHJcbiAgICAxMzogMi4yNjI2M0UrMTMsXHJcbiAgICAxNTogMTM0LjcsXHJcbiAgICAxNjogMzkzLjYsXHJcbiAgICAxNzogMy42MixcclxuICAgIDE4OiAwLjY0NCxcclxuICAgIDE5OiAwLjAzMyxcclxuICAgIDIwOiAwLjA0MTcsXHJcbiAgICAyMTogMC4wNTYzLFxyXG4gICAgMjI6IDAuMDM4MyxcclxuICAgIDIzOiAwLjA5LFxyXG4gICAgMjQ6IDAuMDEwNyxcclxuICAgIDI1OiAwLjAwOSxcclxuICAgIDI2OiAwLjAwNzYsXHJcbiAgICAyNzogMC4wMDAwMDAyNixcclxuICAgIDI4OiBudWxsLFxyXG4gICAgMjk6IDAuMDAwMDAwMTcsXHJcbiAgICAzMDogMC4wMDAwMDAxN1xyXG4gIH0sXHJcbiAgMTQ6IHtcclxuICAgIDg6IDAuMDI5LFxyXG4gICAgOTogMC4wNDIzLFxyXG4gICAgMTA6IDAuMTQsXHJcbiAgICAxMTogMC4yMixcclxuICAgIDEyOiAyLjI0NTMsXHJcbiAgICAxMzogNC4xNSxcclxuICAgIDE3OiA5NDQxLjYsXHJcbiAgICAxODogNDk1NDQzNzM3OCxcclxuICAgIDE5OiA2LjExLFxyXG4gICAgMjA6IDIuNzcsXHJcbiAgICAyMTogMC43OCxcclxuICAgIDIyOiAwLjQ1LFxyXG4gICAgMjM6IDAuMDksXHJcbiAgICAyNDogMC4wNjMsXHJcbiAgICAyNTogMC4wNDc1LFxyXG4gICAgMjY6IDAuMDMzLFxyXG4gICAgMjc6IDAuMDIsXHJcbiAgICAyODogMC4wMTI1LFxyXG4gICAgMjk6IDAuMDAwMDAwMDYsXHJcbiAgICAzMDogMC4wMDAwMDAzNlxyXG4gIH0sXHJcbiAgMTU6IHtcclxuICAgIDEwOiAwLjAwMDAwMDAzLFxyXG4gICAgMTE6IDAuMDQzNyxcclxuICAgIDEyOiAwLjI2LFxyXG4gICAgMTM6IDAuMjcwMyxcclxuICAgIDE0OiA0LjE0MixcclxuICAgIDE1OiAxNDkuODgsXHJcbiAgICAxNzogMTIzMjc1NS4yLFxyXG4gICAgMTg6IDIxOTAyNDAsXHJcbiAgICAxOTogMTIuNDMsXHJcbiAgICAyMDogNDcuMyxcclxuICAgIDIxOiA1LjYsXHJcbiAgICAyMjogMi4zMSxcclxuICAgIDIzOiAwLjY0LFxyXG4gICAgMjQ6IDAuMjgsXHJcbiAgICAyNTogMC4xNSxcclxuICAgIDI2OiAwLjEwMSxcclxuICAgIDI3OiAwLjA0ODUsXHJcbiAgICAyODogMC4wMzY1LFxyXG4gICAgMjk6IDAuMDE4NSxcclxuICAgIDMwOiAwLjAwMDAwMDIsXHJcbiAgICAzMTogbnVsbFxyXG4gIH0sXHJcbiAgMTY6IHtcclxuICAgIDEwOiAwLjAwMDAwMDA3OSxcclxuICAgIDExOiAwLjAxNTUsXHJcbiAgICAxMjogMC4xMjUsXHJcbiAgICAxMzogMC4xODgsXHJcbiAgICAxNDogMS4xNzgsXHJcbiAgICAxNTogMi41NTM0LFxyXG4gICAgMTk6IDc1NDg3NjgsXHJcbiAgICAyMTogMzAzLFxyXG4gICAgMjI6IDEwMjE4LFxyXG4gICAgMjM6IDExLjUsXHJcbiAgICAyNDogOC44LFxyXG4gICAgMjU6IDEuOTksXHJcbiAgICAyNjogMS4wMTYsXHJcbiAgICAyNzogMC4yNjUsXHJcbiAgICAyODogMC4xLFxyXG4gICAgMjk6IDAuMDY4LFxyXG4gICAgMzA6IDAuMDUsXHJcbiAgICAzMjogMC4wMDAwMDAyXHJcbiAgfSxcclxuICAxNzoge1xyXG4gICAgMTI6IDAuMDAwMDAwMDIsXHJcbiAgICAxMzogMC4wMDAwMDAwMyxcclxuICAgIDE0OiAwLjE5LFxyXG4gICAgMTU6IDAuMjk4LFxyXG4gICAgMTY6IDIuNTExLFxyXG4gICAgMTc6IDEuNTI2NixcclxuICAgIDE5OiA5LjUwODFFKzEyLFxyXG4gICAgMjE6IDIyMzMuOCxcclxuICAgIDIyOiAzMzcyLFxyXG4gICAgMjM6IDgxLFxyXG4gICAgMjQ6IDM4LjQsXHJcbiAgICAyNTogNi44LFxyXG4gICAgMjY6IDMuMTMsXHJcbiAgICAyNzogMC41NixcclxuICAgIDI4OiAwLjQxMyxcclxuICAgIDI5OiAwLjIzMixcclxuICAgIDMwOiAwLjEwMSxcclxuICAgIDMxOiAwLjAwMDAwMDIsXHJcbiAgICAzMjogMC4wMDAwMDAxNyxcclxuICAgIDMzOiBudWxsLFxyXG4gICAgMzQ6IG51bGwsXHJcbiAgICAzNTogbnVsbFxyXG4gIH0sXHJcbiAgMTg6IHtcclxuICAgIDEyOiAxRS0xMSxcclxuICAgIDEzOiAwLjAxNDQsXHJcbiAgICAxNDogMC4wOTgsXHJcbiAgICAxNTogMC4xNzMsXHJcbiAgICAxNjogMC44NDM4LFxyXG4gICAgMTc6IDEuNzc1NixcclxuICAgIDE5OiAzMDI0OTUwLjQsXHJcbiAgICAyMTogODQ1NzI1NjE2MSxcclxuICAgIDIzOiA2NTc2LjYsXHJcbiAgICAyNDogMTAzODIyMjg2NSxcclxuICAgIDI1OiAzMjIuMixcclxuICAgIDI2OiA3MTIuMixcclxuICAgIDI3OiAyMS40OCxcclxuICAgIDI4OiA4LjQsXHJcbiAgICAyOTogMS4yMyxcclxuICAgIDMwOiAwLjQ3NSxcclxuICAgIDMxOiAwLjE3LFxyXG4gICAgMzI6IDAuMTA2LFxyXG4gICAgMzM6IG51bGwsXHJcbiAgICAzNDogbnVsbCxcclxuICAgIDM1OiAwLjAwMDAwMDYyXHJcbiAgfSxcclxuICAxOToge1xyXG4gICAgMTQ6IDAuMDAwMDAwMDI1LFxyXG4gICAgMTU6IDAuMDAwMDAwMDI1LFxyXG4gICAgMTY6IDAuMTc4LFxyXG4gICAgMTc6IDAuMzQxLFxyXG4gICAgMTg6IDEuMjI1LFxyXG4gICAgMTk6IDQ1OS4wNixcclxuICAgIDIxOiAzLjkzODNFKzE2LFxyXG4gICAgMjM6IDQ0NDc4LFxyXG4gICAgMjQ6IDgwMjgwLFxyXG4gICAgMjU6IDEzMjcuOCxcclxuICAgIDI2OiAxMDY4LjYsXHJcbiAgICAyNzogMTA1LFxyXG4gICAgMjg6IDE3LjUsXHJcbiAgICAyOTogNi44LFxyXG4gICAgMzA6IDEuMjYsXHJcbiAgICAzMTogMC40NzIsXHJcbiAgICAzMjogMC4zNjUsXHJcbiAgICAzMzogMC4xMSxcclxuICAgIDM0OiAwLjAzLFxyXG4gICAgMzU6IDAuMDEsXHJcbiAgICAzNjogMC4wMDAwMDAzNixcclxuICAgIDM3OiAwLjAwMDAwMDYyXHJcbiAgfSxcclxuICAyMDoge1xyXG4gICAgMTQ6IDAuMDAwMDAwMDM1LFxyXG4gICAgMTU6IDAuMDI1NyxcclxuICAgIDE2OiAwLjEwMTIsXHJcbiAgICAxNzogMC4xODExLFxyXG4gICAgMTg6IDAuNDQzNzYsXHJcbiAgICAxOTogMC44NjAzLFxyXG4gICAgMjE6IDMuMTM2NzZFKzEyLFxyXG4gICAgMjU6IDE0MDQ5NTA0LFxyXG4gICAgMjc6IDM5MTkxMC40LFxyXG4gICAgMjg6IDUuOTk1ODJFKzI2LFxyXG4gICAgMjk6IDUyMy4wOCxcclxuICAgIDMwOiAxMy40NSxcclxuICAgIDMxOiAxMCxcclxuICAgIDMyOiA0LjYsXHJcbiAgICAzMzogMC40NjEsXHJcbiAgICAzNDogMC4xMDcsXHJcbiAgICAzNTogMC4wMjIsXHJcbiAgICAzNjogMC4wMTEsXHJcbiAgICAzNzogMC4wMDAwMDA2MixcclxuICAgIDM4OiAwLjAwMDAwMDYyXHJcbiAgfSxcclxuICAyMToge1xyXG4gICAgMTc6IG51bGwsXHJcbiAgICAxODogMC4wMDAwMDAzLFxyXG4gICAgMTk6IDAuMTgyMyxcclxuICAgIDIwOiAwLjU5NjMsXHJcbiAgICAyMTogMC42ODA3OSxcclxuICAgIDIyOiAxNDAwNy42LFxyXG4gICAgMjM6IDE0MjkyLFxyXG4gICAgMjU6IDcyMzk0NTYsXHJcbiAgICAyNjogMjg5MzcwLjg4LFxyXG4gICAgMjc6IDE1NzIxMixcclxuICAgIDI4OiAzNDMwLjgsXHJcbiAgICAyOTogMTAyLjUsXHJcbiAgICAzMDogMTIuNCxcclxuICAgIDMxOiA4LjIsXHJcbiAgICAzMjogMi42LFxyXG4gICAgMzM6IDAuNTI2LFxyXG4gICAgMzQ6IDAuMTA1LFxyXG4gICAgMzU6IDAuMDI2LFxyXG4gICAgMzY6IDAuMDEzLFxyXG4gICAgMzc6IDAuMDEyLFxyXG4gICAgMzg6IG51bGwsXHJcbiAgICA0MDogbnVsbFxyXG4gIH0sXHJcbiAgMjI6IHtcclxuICAgIDE2OiAwLjAwMDAwMDEyLFxyXG4gICAgMTc6IDAuMDI4NSxcclxuICAgIDE4OiAwLjA1MjQsXHJcbiAgICAxOTogMC4wODE5LFxyXG4gICAgMjA6IDAuMjA4NjUsXHJcbiAgICAyMTogMC41MDksXHJcbiAgICAyMjogMTg2NTAxNDMyNSxcclxuICAgIDIzOiAxMTA4OCxcclxuICAgIDI5OiAzNDUuNixcclxuICAgIDMwOiAxMDIsXHJcbiAgICAzMTogMzIuNyxcclxuICAgIDMyOiAyLjEsXHJcbiAgICAzMzogMS4zLFxyXG4gICAgMzQ6IDAuMixcclxuICAgIDM1OiAwLjA5OCxcclxuICAgIDM2OiAwLjA1OCxcclxuICAgIDM3OiAwLjAyODUsXHJcbiAgICAzODogMC4wMjIsXHJcbiAgICAzOTogMC4wMTUsXHJcbiAgICA0MDogMC4wMDAwMDA2MixcclxuICAgIDQxOiAwLjAwMDAwMDM2LFxyXG4gICAgNDI6IDAuMDAwMDAwNjJcclxuICB9LFxyXG4gIDIzOiB7XHJcbiAgICAxOTogMC4wMDAwMDAwNTUsXHJcbiAgICAyMDogMC4wNzkzLFxyXG4gICAgMjE6IDAuMTExLFxyXG4gICAgMjI6IDAuNTQ3LFxyXG4gICAgMjM6IDAuNDIyNSxcclxuICAgIDI0OiAxOTU2LFxyXG4gICAgMjU6IDEzODAxMTAuNCxcclxuICAgIDI2OiAyODUxMjAwMCxcclxuICAgIDI3OiA4LjM2MjU5RSsyNCxcclxuICAgIDI5OiAyMjQuNTgsXHJcbiAgICAzMDogOTIuNTgsXHJcbiAgICAzMTogNDkuOCxcclxuICAgIDMyOiA2LjU0LFxyXG4gICAgMzM6IDAuMjE2LFxyXG4gICAgMzQ6IDAuMzIsXHJcbiAgICAzNTogMC4xOTEsXHJcbiAgICAzNjogMC4wOTcsXHJcbiAgICAzNzogMC4xMjIsXHJcbiAgICAzODogMC4wNDgzLFxyXG4gICAgMzk6IDAuMDMzNixcclxuICAgIDQwOiAwLjAxNyxcclxuICAgIDQxOiAwLjAxNSxcclxuICAgIDQyOiAwLjAwMDAwMDM2LFxyXG4gICAgNDM6IDAuMDAwMDAwMzYsXHJcbiAgICA0NDogMC4wMDAwMDA2MlxyXG4gIH0sXHJcbiAgMjQ6IHtcclxuICAgIDE4OiAwLjAxMzMsXHJcbiAgICAxOTogMC4wMjEyLFxyXG4gICAgMjA6IDAuMDQyOCxcclxuICAgIDIxOiAwLjA2MDksXHJcbiAgICAyMjogMC4yNixcclxuICAgIDIzOiAwLjUsXHJcbiAgICAyNDogNzc2MTYsXHJcbiAgICAyNTogMjUzOCxcclxuICAgIDI2OiA0LjEwMjRFKzI1LFxyXG4gICAgMjc6IDIzOTM2MjUuNixcclxuICAgIDMxOiAyMDkuODIsXHJcbiAgICAzMjogMzU2LjQsXHJcbiAgICAzMzogMjEuMSxcclxuICAgIDM0OiA3LFxyXG4gICAgMzU6IDAuNzQsXHJcbiAgICAzNjogMC40OSxcclxuICAgIDM3OiAwLjIzNCxcclxuICAgIDM4OiAwLjIwNixcclxuICAgIDM5OiAwLjEyOSxcclxuICAgIDQwOiAwLjA0MyxcclxuICAgIDQxOiAwLjAyNyxcclxuICAgIDQyOiAwLjAyNCxcclxuICAgIDQ0OiAwLjAwMDAwMDM2LFxyXG4gICAgNDU6IDAuMDAwMDAwNjIsXHJcbiAgICA0NjogMC4wMDAwMDA2MlxyXG4gIH0sXHJcbiAgMjU6IHtcclxuICAgIDE5OiAwLjAwMDAwMDEwNSxcclxuICAgIDIwOiBudWxsLFxyXG4gICAgMjE6IDAuMDM2MixcclxuICAgIDIyOiAwLjEsXHJcbiAgICAyMzogMC4xNTgxLFxyXG4gICAgMjQ6IDAuMzgyLFxyXG4gICAgMjU6IDAuMjgzMTksXHJcbiAgICAyNjogMjc3MixcclxuICAgIDI3OiA0ODMwNjIuNCxcclxuICAgIDI4OiAxLjE2NzYxRSsxNCxcclxuICAgIDI5OiAyNjk3NDA4MCxcclxuICAgIDMxOiA5Mjg0LjA0LFxyXG4gICAgMzI6IDg1LjQsXHJcbiAgICAzMzogMyxcclxuICAgIDM0OiA0LjU5LFxyXG4gICAgMzU6IDAuMjgsXHJcbiAgICAzNjogMC43MDksXHJcbiAgICAzNzogMC4wOTIsXHJcbiAgICAzODogMC4yNzUsXHJcbiAgICAzOTogMC4wOSxcclxuICAgIDQwOiAwLjA5MixcclxuICAgIDQxOiAwLjA2NSxcclxuICAgIDQyOiAwLjA0NyxcclxuICAgIDQzOiAwLjAyOCxcclxuICAgIDQ0OiAwLjAxNixcclxuICAgIDQ1OiAwLjAxOTksXHJcbiAgICA0NjogMC4wMDAwMDA2MzcsXHJcbiAgICA0NzogMC4wMDAwMDA2MixcclxuICAgIDQ4OiBudWxsXHJcbiAgfSxcclxuICAyNjoge1xyXG4gICAgMTk6IDAuMDAxODksXHJcbiAgICAyMDogMC4wMTMsXHJcbiAgICAyMTogMC4wMjE4LFxyXG4gICAgMjI6IDAuMDQ0LFxyXG4gICAgMjM6IDAuMDY0NyxcclxuICAgIDI0OiAwLjE1MixcclxuICAgIDI1OiAwLjMwNSxcclxuICAgIDI2OiAyOTc5MCxcclxuICAgIDI3OiA1MTAuNixcclxuICAgIDI5OiA4NjU5MjIwNC44NyxcclxuICAgIDMzOiAzODQzOTM2LFxyXG4gICAgMzQ6IDguMjY3OTFFKzEzLFxyXG4gICAgMzU6IDM1OC44LFxyXG4gICAgMzY6IDY4LFxyXG4gICAgMzc6IDYuMSxcclxuICAgIDM4OiAyLFxyXG4gICAgMzk6IDAuODEsXHJcbiAgICA0MDogMC40NCxcclxuICAgIDQxOiAwLjYsXHJcbiAgICA0MjogMC4xODgsXHJcbiAgICA0MzogMC4xMSxcclxuICAgIDQ0OiAwLjA2NSxcclxuICAgIDQ1OiAwLjAyOCxcclxuICAgIDQ2OiAwLjAwMDAwMDE1LFxyXG4gICAgNDc6IDAuMDEyOSxcclxuICAgIDQ4OiAwLjAwODIsXHJcbiAgICA0OTogMC4wMDAwMDA2MlxyXG4gIH0sXHJcbiAgMjc6IHtcclxuICAgIDIzOiAwLjAzODgsXHJcbiAgICAyNDogMC4wNjg4LFxyXG4gICAgMjU6IDAuMTA0LFxyXG4gICAgMjY6IDAuMjQsXHJcbiAgICAyNzogMC4xOTMyOCxcclxuICAgIDI4OiA2MzEwOCxcclxuICAgIDI5OiA2NjczMTkwLjQsXHJcbiAgICAzMDogMjM0NzgzMzYsXHJcbiAgICAzMTogNjEyMjMwNCxcclxuICAgIDMzOiAxNjYzNDQxOTIsXHJcbiAgICAzNDogNTkzNi40LFxyXG4gICAgMzU6IDkyLjQsXHJcbiAgICAzNjogMjcuNCxcclxuICAgIDM3OiAwLjMsXHJcbiAgICAzODogMS4xNixcclxuICAgIDM5OiAwLjIsXHJcbiAgICA0MDogMC40MjUsXHJcbiAgICA0MTogMC4yLFxyXG4gICAgNDI6IDAuMjI3LFxyXG4gICAgNDM6IDAuMTEyLFxyXG4gICAgNDQ6IDAuMDgsXHJcbiAgICA0NTogMC4wNTk5LFxyXG4gICAgNDY6IDAuMDQwNyxcclxuICAgIDQ3OiAwLjAzMTMsXHJcbiAgICA0ODogMC4wMyxcclxuICAgIDQ5OiAwLjAyMTcsXHJcbiAgICA1MDogMC4wMTNcclxuICB9LFxyXG4gIDI4OiB7XHJcbiAgICAyMDogMC4wMDIxLFxyXG4gICAgMjE6IDAuMDA3NSxcclxuICAgIDIyOiAwLjAxODUsXHJcbiAgICAyMzogMC4wMjM4LFxyXG4gICAgMjQ6IDAuMDQwOCxcclxuICAgIDI1OiAwLjA1NTIsXHJcbiAgICAyNjogMC4xMTQyLFxyXG4gICAgMjc6IDAuMjA0NyxcclxuICAgIDI4OiA1MjQ4ODAsXHJcbiAgICAyOTogMTI4MTYwLFxyXG4gICAgMzE6IDIuMzk4MzNFKzEyLFxyXG4gICAgMzU6IDMxOTM1NjA5MDksXHJcbiAgICAzNzogOTA2MyxcclxuICAgIDM4OiAxOTY1NjAsXHJcbiAgICAzOTogMjEsXHJcbiAgICA0MDogMjksXHJcbiAgICA0MTogMTEuNCxcclxuICAgIDQyOiA2LFxyXG4gICAgNDM6IDIuNTYsXHJcbiAgICA0NDogMS41NyxcclxuICAgIDQ1OiAwLjg0LFxyXG4gICAgNDY6IDAuNTA3NyxcclxuICAgIDQ3OiAwLjM0NCxcclxuICAgIDQ4OiAwLjIzOCxcclxuICAgIDQ5OiAwLjE1ODksXHJcbiAgICA1MDogMC4xMSxcclxuICAgIDUxOiAwLjA0MyxcclxuICAgIDUyOiAwLjAyNCxcclxuICAgIDU0OiBudWxsXHJcbiAgfSxcclxuICAyOToge1xyXG4gICAgMjQ6IDAuMDAwMDAwMTMsXHJcbiAgICAyNTogMC4wMDAwMDAwNzUsXHJcbiAgICAyNjogMC4wNCxcclxuICAgIDI3OiAwLjA5MyxcclxuICAgIDI4OiAwLjE5NjMsXHJcbiAgICAyOTogMy4yMDQsXHJcbiAgICAzMDogODEuNSxcclxuICAgIDMxOiAxNDIyLFxyXG4gICAgMzI6IDEyMDIwLjQsXHJcbiAgICAzMzogNTgwLjIsXHJcbiAgICAzNTogNDU3MjMuNixcclxuICAgIDM3OiAzMDcuMixcclxuICAgIDM4OiAyMjI1ODgsXHJcbiAgICAzOTogMzAuOSxcclxuICAgIDQwOiAxNzEsXHJcbiAgICA0MTogNDQuNSxcclxuICAgIDQyOiAxOS40LFxyXG4gICAgNDM6IDYuNjMsXHJcbiAgICA0NDogNC4yLFxyXG4gICAgNDU6IDEuNjMsXHJcbiAgICA0NjogMS4yMjQsXHJcbiAgICA0NzogMC42NDEsXHJcbiAgICA0ODogMC40Njk4LFxyXG4gICAgNDk6IDAuMzM1LFxyXG4gICAgNTA6IDAuMjQxLFxyXG4gICAgNTE6IDAuMTEzNixcclxuICAgIDUyOiAwLjA3MzIsXHJcbiAgICA1MzogMC4wMzNcclxuICB9LFxyXG4gIDMwOiB7XHJcbiAgICAyNDogMC4wMDE1OSxcclxuICAgIDI1OiAwLjAyLFxyXG4gICAgMjY6IDAuMDMsXHJcbiAgICAyNzogMC4wNCxcclxuICAgIDI4OiAwLjA4NjcsXHJcbiAgICAyOTogMC4xNzg2LFxyXG4gICAgMzA6IDE0Mi44LFxyXG4gICAgMzE6IDg5LjEsXHJcbiAgICAzMjogMzMwOTQuOCxcclxuICAgIDMzOiAyMzA4LjIsXHJcbiAgICAzNTogMjEwNzU1NTIsXHJcbiAgICAzOTogMzM4NCxcclxuICAgIDQwOiAxLjE5OTE2RSsyNixcclxuICAgIDQxOiAxNDcsXHJcbiAgICA0MjogMTY3NDAwLFxyXG4gICAgNDM6IDI0LjUsXHJcbiAgICA0NDogOTUuNixcclxuICAgIDQ1OiAxMC4yLFxyXG4gICAgNDY6IDUuNyxcclxuICAgIDQ3OiAyLjA4LFxyXG4gICAgNDg6IDEuNDcsXHJcbiAgICA0OTogMC43NDYsXHJcbiAgICA1MDogMC41NjE5LFxyXG4gICAgNTE6IDAuMzIsXHJcbiAgICA1MjogMC4xNjYsXHJcbiAgICA1MzogMC4xMTcsXHJcbiAgICA1NDogMC4wMDAwMDA2MzMsXHJcbiAgICA1NTogMC4wMDAwMDA2MzdcclxuICB9LFxyXG4gIDMxOiB7XHJcbiAgICAyODogMC4wMDAwMDAwNDMsXHJcbiAgICAyOTogMC4wNyxcclxuICAgIDMwOiAwLjE2NyxcclxuICAgIDMxOiAwLjExNjEyMSxcclxuICAgIDMyOiAzMi40LFxyXG4gICAgMzM6IDE1Ny42MixcclxuICAgIDM0OiA5MTIsXHJcbiAgICAzNTogMzQxNjQsXHJcbiAgICAzNjogMjgxODEwLjg4LFxyXG4gICAgMzc6IDQwNjIuNixcclxuICAgIDM5OiAxMjY4LjQsXHJcbiAgICA0MTogNTA3NjAsXHJcbiAgICA0MjogMTc0OTYsXHJcbiAgICA0MzogNDg3LjIsXHJcbiAgICA0NDogMTI2LFxyXG4gICAgNDU6IDMyLjYsXHJcbiAgICA0NjogMTMuMixcclxuICAgIDQ3OiA1LjA5LFxyXG4gICAgNDg6IDIuODQ4LFxyXG4gICAgNDk6IDEuOSxcclxuICAgIDUwOiAxLjIxNyxcclxuICAgIDUxOiAwLjYsXHJcbiAgICA1MjogMC4zMDgxLFxyXG4gICAgNTM6IDAuMDg1LFxyXG4gICAgNTQ6IDAuMDkyLFxyXG4gICAgNTU6IDAuMDQzLFxyXG4gICAgNTY6IDAuMDAwMDAwNjM0XHJcbiAgfSxcclxuICAzMjoge1xyXG4gICAgMjc6IDAuMDEzMyxcclxuICAgIDI4OiAwLjAwMDAwMDExLFxyXG4gICAgMjk6IDAuMDQ0LFxyXG4gICAgMzA6IDAuMTI5LFxyXG4gICAgMzE6IDAuMTUsXHJcbiAgICAzMjogNjMuNyxcclxuICAgIDMzOiAzMC45LFxyXG4gICAgMzQ6IDgxMzYsXHJcbiAgICAzNTogMTEzNCxcclxuICAgIDM2OiAyMzQwODM1MixcclxuICAgIDM3OiAxNDA1ODAsXHJcbiAgICAzOTogOTg3NTUyLFxyXG4gICAgNDM6IDQ5NjYuOCxcclxuICAgIDQ1OiA0MDM1OS42LFxyXG4gICAgNDY6IDUyODAsXHJcbiAgICA0NzogMTguOTgsXHJcbiAgICA0ODogMjkuNSxcclxuICAgIDQ5OiA3LjYsXHJcbiAgICA1MDogNCxcclxuICAgIDUxOiAxLjg1LFxyXG4gICAgNTI6IDAuOTU0LFxyXG4gICAgNTM6IDAuNTAzLFxyXG4gICAgNTQ6IDAuMjI2LFxyXG4gICAgNTU6IDAuMTQsXHJcbiAgICA1NjogMC4wMDAwMDAzLFxyXG4gICAgNTc6IDAuMDAwMDAwMyxcclxuICAgIDU4OiBudWxsXHJcbiAgfSxcclxuICAzMzoge1xyXG4gICAgMzA6IDAuMDAwMDAwMDQzLFxyXG4gICAgMzE6IDAuMDE4LFxyXG4gICAgMzI6IDAuMTI4LFxyXG4gICAgMzM6IDAuMDk1NzcsXHJcbiAgICAzNDogNDIuNSxcclxuICAgIDM1OiAxNTEuNixcclxuICAgIDM2OiA5MTIsXHJcbiAgICAzNzogMzE1NixcclxuICAgIDM4OiAyMzUwODAsXHJcbiAgICAzOTogOTM2MDAsXHJcbiAgICA0MDogNjkzNzkyMCxcclxuICAgIDQxOiAxNTM1MzI4LFxyXG4gICAgNDM6IDk0NDY0LFxyXG4gICAgNDQ6IDEzOTY0NCxcclxuICAgIDQ1OiA1NDQyLFxyXG4gICAgNDY6IDU0MC42LFxyXG4gICAgNDc6IDE1LjIsXHJcbiAgICA0ODogMzMuMyxcclxuICAgIDQ5OiAxOS4xLFxyXG4gICAgNTA6IDEzLjQsXHJcbiAgICA1MTogNC4yLFxyXG4gICAgNTI6IDIuMDIxLFxyXG4gICAgNTM6IDAuOTQ1LFxyXG4gICAgNTQ6IDAuNDg0LFxyXG4gICAgNTU6IDAuMixcclxuICAgIDU2OiAwLjAwMDAwMDMsXHJcbiAgICA1NzogbnVsbCxcclxuICAgIDU4OiBudWxsLFxyXG4gICAgNTk6IG51bGxcclxuICB9LFxyXG4gIDM0OiB7XHJcbiAgICAzMDogMC4wMDAwMDAxOCxcclxuICAgIDMxOiAwLjAzMyxcclxuICAgIDMyOiAwLjA0MixcclxuICAgIDMzOiAwLjEzNixcclxuICAgIDM0OiAzNS41LFxyXG4gICAgMzU6IDI3LjQsXHJcbiAgICAzNjogMjQ2NixcclxuICAgIDM3OiAyODQuNCxcclxuICAgIDM4OiA3MjU3NjAsXHJcbiAgICAzOTogMjU3NDAsXHJcbiAgICA0MTogMTAzNDg5OTIsXHJcbiAgICA0NTogMS4wMzE5MUUrMTMsXHJcbiAgICA0NzogMTEwNyxcclxuICAgIDQ4OiAzLjAyOTQ2RSsyNyxcclxuICAgIDQ5OiAxMzM4LFxyXG4gICAgNTA6IDE5NS42LFxyXG4gICAgNTE6IDMyLjksXHJcbiAgICA1MjogMTQuMyxcclxuICAgIDUzOiA1LjUsXHJcbiAgICA1NDogMS41MyxcclxuICAgIDU1OiAwLjQzLFxyXG4gICAgNTY6IDAuMTk1LFxyXG4gICAgNTc6IDAuMjcsXHJcbiAgICA1ODogbnVsbCxcclxuICAgIDU5OiBudWxsLFxyXG4gICAgNjA6IDAuMDAwMDAwMTUsXHJcbiAgICA2MTogMC4wMDAwMDAzOTJcclxuICB9LFxyXG4gIDM1OiB7XHJcbiAgICAzNDogMC4wMDAwMDAwMjQsXHJcbiAgICAzNTogMC4wNzkxLFxyXG4gICAgMzY6IDIxLjQsXHJcbiAgICAzNzogNzguNixcclxuICAgIDM4OiAyMDQsXHJcbiAgICAzOTogMTUyNCxcclxuICAgIDQwOiA1ODAyLFxyXG4gICAgNDE6IDU4MzIwLFxyXG4gICAgNDI6IDIwNTM0NCxcclxuICAgIDQzOiAzODcsXHJcbiAgICA0NTogMTA2MC44LFxyXG4gICAgNDc6IDEyNzAxNS4yLFxyXG4gICAgNDg6IDg1NDYuNCxcclxuICAgIDQ5OiAxOTA1LjYsXHJcbiAgICA1MDogMTc0LFxyXG4gICAgNTE6IDU1LjEsXHJcbiAgICA1MjogNTUuNjgsXHJcbiAgICA1MzogMTYuMzQsXHJcbiAgICA1NDogNC4zNTcsXHJcbiAgICA1NTogMS45MSxcclxuICAgIDU2OiAwLjU0MyxcclxuICAgIDU3OiAwLjMxNCxcclxuICAgIDU4OiAwLjEwMixcclxuICAgIDU5OiAwLjA3LFxyXG4gICAgNjA6IDAuMDAwMDAwMTUsXHJcbiAgICA2MTogMC4wMDAwMDAxNSxcclxuICAgIDYyOiBudWxsLFxyXG4gICAgNjM6IG51bGwsXHJcbiAgICA2NjogbnVsbFxyXG4gIH0sXHJcbiAgMzY6IHtcclxuICAgIDMzOiAwLjAyOCxcclxuICAgIDM0OiAwLjA0LFxyXG4gICAgMzU6IDAuMSxcclxuICAgIDM2OiAxNy4xLFxyXG4gICAgMzc6IDI3LjMsXHJcbiAgICAzODogNjkwLFxyXG4gICAgMzk6IDI3NixcclxuICAgIDQwOiA1MzI4MCxcclxuICAgIDQxOiA0Mjc1LFxyXG4gICAgNDM6IDEyNjE0NCxcclxuICAgIDQ1OiA3LjIyNjU0RSsxMixcclxuICAgIDQ5OiAzMzg4ODk4MjgsXHJcbiAgICA1MTogNDU3OCxcclxuICAgIDUyOiAxMDE3MCxcclxuICAgIDUzOiAxODksXHJcbiAgICA1NDogMzIuMzIsXHJcbiAgICA1NTogOC41NyxcclxuICAgIDU2OiAxLjg0LFxyXG4gICAgNTc6IDEuMjg2LFxyXG4gICAgNTg6IDAuMjEyLFxyXG4gICAgNTk6IDAuMTE0LFxyXG4gICAgNjA6IDAuMDgsXHJcbiAgICA2MTogMC4wNjMsXHJcbiAgICA2MjogMC4wNDMsXHJcbiAgICA2MzogMC4wMTMsXHJcbiAgICA2NDogMC4wMDcsXHJcbiAgICA2NTogMC4wMDAwMDA2MzUsXHJcbiAgICA2NjogbnVsbFxyXG4gIH0sXHJcbiAgMzc6IHtcclxuICAgIDM1OiAwLjAwMDAwMDEwMyxcclxuICAgIDM2OiAwLjAwMDAwMDA4MSxcclxuICAgIDM3OiAwLjA2NDc3NixcclxuICAgIDM4OiAxOSxcclxuICAgIDM5OiAzNi41LFxyXG4gICAgNDA6IDIyNi44LFxyXG4gICAgNDE6IDEwNTkuNixcclxuICAgIDQyOiAxMzc0LFxyXG4gICAgNDM6IDMzLjQsXHJcbiAgICA0NDogMTY0NTkuMixcclxuICAgIDQ1OiA3NS40NSxcclxuICAgIDQ2OiA3NDQ3NjgwLFxyXG4gICAgNDc6IDI4MzU2NDgsXHJcbiAgICA0OTogMTYxMDY2OC44LFxyXG4gICAgNTA6IDEuNTY4MzhFKzE4LFxyXG4gICAgNTE6IDEwNjYuMzgsXHJcbiAgICA1MjogOTE5LjIsXHJcbiAgICA1MzogMTU4LFxyXG4gICAgNTQ6IDU4LjIsXHJcbiAgICA1NTogNC40OCxcclxuICAgIDU2OiA1Ljg0LFxyXG4gICAgNTc6IDIuNzAyLFxyXG4gICAgNTg6IDAuMzc3NyxcclxuICAgIDU5OiAwLjIwMyxcclxuICAgIDYwOiAwLjE2OTEsXHJcbiAgICA2MTogMC4xMTUsXHJcbiAgICA2MjogMC4wNTQsXHJcbiAgICA2MzogMC4wNTIsXHJcbiAgICA2NDogMC4wMzIsXHJcbiAgICA2NTogMC4wMzcsXHJcbiAgICA2NjogMC4wMjMsXHJcbiAgICA2NzogbnVsbCxcclxuICAgIDY4OiBudWxsLFxyXG4gICAgNjk6IG51bGxcclxuICB9LFxyXG4gIDM4OiB7XHJcbiAgICAzNTogMC4wMjUsXHJcbiAgICAzNjogMC4wMjcsXHJcbiAgICAzNzogMC4wODgsXHJcbiAgICAzODogNy44OSxcclxuICAgIDM5OiA5LFxyXG4gICAgNDA6IDE2MCxcclxuICAgIDQxOiAxMzUsXHJcbiAgICA0MjogNjM3OCxcclxuICAgIDQzOiAxMzM4LFxyXG4gICAgNDQ6IDIxOTAyNDAsXHJcbiAgICA0NTogMTE2Njc2LFxyXG4gICAgNDc6IDU2MDI5NTMuNixcclxuICAgIDUxOiA0MzY4NjQzLjIsXHJcbiAgICA1MjogOTEyMzEwNzI5LjksXHJcbiAgICA1MzogMzQ3NDAsXHJcbiAgICA1NDogOTM5OS42LFxyXG4gICAgNTU6IDQ0NS44LFxyXG4gICAgNTY6IDc1LjMsXHJcbiAgICA1NzogMjMuOSxcclxuICAgIDU4OiAxLjA3LFxyXG4gICAgNTk6IDAuNDI5LFxyXG4gICAgNjA6IDAuNjUzLFxyXG4gICAgNjE6IDAuMjY5LFxyXG4gICAgNjI6IDAuMixcclxuICAgIDYzOiAwLjExOCxcclxuICAgIDY0OiAwLjA2OSxcclxuICAgIDY1OiAwLjA1MyxcclxuICAgIDY2OiAwLjA1MyxcclxuICAgIDY3OiAwLjAzOSxcclxuICAgIDY4OiAwLjAyLFxyXG4gICAgNjk6IDAuMDAwMDAwMzk1LFxyXG4gICAgNzA6IG51bGxcclxuICB9LFxyXG4gIDM5OiB7XHJcbiAgICAzNzogMC4wMDAwMDAyLFxyXG4gICAgMzg6IDAuMDU3LFxyXG4gICAgMzk6IDAuMDUzLFxyXG4gICAgNDA6IDE0LjgsXHJcbiAgICA0MTogMzAuMSxcclxuICAgIDQyOiA3MC40LFxyXG4gICAgNDM6IDguMyxcclxuICAgIDQ0OiA0MjQuOCxcclxuICAgIDQ1OiAyMzcwLFxyXG4gICAgNDY6IDk2NDgsXHJcbiAgICA0NzogNTMwNjQsXHJcbiAgICA0ODogMjg3MjgwLFxyXG4gICAgNDk6IDkyMTI0ODYuNCxcclxuICAgIDUxOiAyMzA1ODAsXHJcbiAgICA1MjogNTA1NTI2NCxcclxuICAgIDUzOiAxMjc0NCxcclxuICAgIDU0OiAzNjY0OCxcclxuICAgIDU1OiAxMTIyLFxyXG4gICAgNTY6IDYxOCxcclxuICAgIDU3OiA1LjM0LFxyXG4gICAgNTg6IDMuNzUsXHJcbiAgICA1OTogMC41NDgsXHJcbiAgICA2MDogMS40ODQsXHJcbiAgICA2MTogMC43MzIsXHJcbiAgICA2MjogMC40NSxcclxuICAgIDYzOiAwLjM2LFxyXG4gICAgNjQ6IDAuMjMsXHJcbiAgICA2NTogMC4xOTcsXHJcbiAgICA2NjogMC4xMDcsXHJcbiAgICA2NzogMC4wNzksXHJcbiAgICA2ODogMC4wMzM1LFxyXG4gICAgNjk6IDAuMDMsXHJcbiAgICA3MDogMC4wMjUsXHJcbiAgICA3MTogbnVsbCxcclxuICAgIDcyOiBudWxsXHJcbiAgfSxcclxuICA0MDoge1xyXG4gICAgMzc6IG51bGwsXHJcbiAgICAzODogMC4wMDAwMDAxNyxcclxuICAgIDM5OiAwLjA1NixcclxuICAgIDQwOiA0LjYsXHJcbiAgICA0MTogNS41LFxyXG4gICAgNDI6IDMyLFxyXG4gICAgNDM6IDQyLFxyXG4gICAgNDQ6IDE1NDgsXHJcbiAgICA0NTogNDcxLjYsXHJcbiAgICA0NjogNTk0MDAsXHJcbiAgICA0NzogNjA0OCxcclxuICAgIDQ4OiA3MjA1NzYwLFxyXG4gICAgNDk6IDI4MjI3NixcclxuICAgIDUzOiA1LjA4MDY3RSsxMyxcclxuICAgIDU1OiA1NTMyMzY0LjgsXHJcbiAgICA1NjogNi4zMTEzOUUrMjYsXHJcbiAgICA1NzogNjAyOTYuNCxcclxuICAgIDU4OiAzMC43LFxyXG4gICAgNTk6IDIuMSxcclxuICAgIDYwOiA3LjEsXHJcbiAgICA2MTogMi4zLFxyXG4gICAgNjI6IDIuOSxcclxuICAgIDYzOiAxLjMsXHJcbiAgICA2NDogMS4yLFxyXG4gICAgNjU6IDAuNjYsXHJcbiAgICA2NjogMC4xOCxcclxuICAgIDY3OiAwLjE0NixcclxuICAgIDY4OiAwLjA3NzQsXHJcbiAgICA2OTogMC4wNTYsXHJcbiAgICA3MDogMC4wMzc1LFxyXG4gICAgNzE6IDAuMDI0LFxyXG4gICAgNzI6IDAuMDMsXHJcbiAgICA3MzogbnVsbCxcclxuICAgIDc0OiBudWxsXHJcbiAgfSxcclxuICA0MToge1xyXG4gICAgNDA6IDAuMDAwMDAwMixcclxuICAgIDQxOiAwLjA1LFxyXG4gICAgNDI6IDMuOSxcclxuICAgIDQzOiA5LjgsXHJcbiAgICA0NDogMjAuNSxcclxuICAgIDQ1OiA4OCxcclxuICAgIDQ2OiAyMjIsXHJcbiAgICA0NzogODcwLFxyXG4gICAgNDg6IDczMDgsXHJcbiAgICA0OTogNTI1NjAsXHJcbiAgICA1MDogMjE0NTg3MDk2NjMsXHJcbiAgICA1MTogMS4wOTUwM0UrMTUsXHJcbiAgICA1MzogNi40MDYwNkUrMTEsXHJcbiAgICA1NDogMzAyMzIyMi40LFxyXG4gICAgNTU6IDg0MDYwLFxyXG4gICAgNTY6IDQzMjYsXHJcbiAgICA1NzogMi44NixcclxuICAgIDU4OiAxNSxcclxuICAgIDU5OiAxLjQsXHJcbiAgICA2MDogNy4xLFxyXG4gICAgNjE6IDQuMyxcclxuICAgIDYyOiAxLjUsXHJcbiAgICA2MzogNC45LFxyXG4gICAgNjQ6IDIuOTEsXHJcbiAgICA2NTogMS4wMixcclxuICAgIDY2OiAwLjMsXHJcbiAgICA2NzogMC4xOTgsXHJcbiAgICA2ODogMC4xMDgsXHJcbiAgICA2OTogMC4wODIsXHJcbiAgICA3MDogMC4wNTQsXHJcbiAgICA3MTogMC4wMzMsXHJcbiAgICA3MjogMC4wMzIsXHJcbiAgICA3MzogMC4wMTcsXHJcbiAgICA3NDogMC4wMjMsXHJcbiAgICA3NTogbnVsbCxcclxuICAgIDc2OiBudWxsXHJcbiAgfSxcclxuICA0Mjoge1xyXG4gICAgMzk6IDAuMDAwMDAwNDUsXHJcbiAgICA0MDogbnVsbCxcclxuICAgIDQxOiAwLjAwNixcclxuICAgIDQyOiAyLjMsXHJcbiAgICA0MzogMy4yLFxyXG4gICAgNDQ6IDE5LjEsXHJcbiAgICA0NTogMTQuMSxcclxuICAgIDQ2OiA0ODAsXHJcbiAgICA0NzogMTI2LjYsXHJcbiAgICA0ODogMjAwMTYsXHJcbiAgICA0OTogOTI5LjQsXHJcbiAgICA1MTogMS4yNjIyOEUrMTEsXHJcbiAgICA1NzogMjM3MzI2LjQsXHJcbiAgICA1ODogMi4yMTIxNEUrMjYsXHJcbiAgICA1OTogODc2LjYsXHJcbiAgICA2MDogNjc4LFxyXG4gICAgNjE6IDY3LjUsXHJcbiAgICA2MjogNjAsXHJcbiAgICA2MzogMzYuMyxcclxuICAgIDY0OiA4LjczLFxyXG4gICAgNjU6IDMuNSxcclxuICAgIDY2OiAxLjA5LFxyXG4gICAgNjc6IDAuNjEsXHJcbiAgICA2ODogMC4yOTYsXHJcbiAgICA2OTogMC4xODYsXHJcbiAgICA3MDogMC4xMixcclxuICAgIDcxOiAwLjA4LFxyXG4gICAgNzI6IDAuMDU4LFxyXG4gICAgNzM6IDAuMDQ1NSxcclxuICAgIDc0OiAwLjAzMixcclxuICAgIDc1OiAwLjAyMixcclxuICAgIDc2OiAwLjAxOSxcclxuICAgIDc3OiBudWxsXHJcbiAgfSxcclxuICA0Mzoge1xyXG4gICAgNDI6IDAuMDAwMDAwMSxcclxuICAgIDQzOiAwLjA1NSxcclxuICAgIDQ0OiAyLjIsXHJcbiAgICA0NTogNi40LFxyXG4gICAgNDY6IDEyLjgsXHJcbiAgICA0NzogNDkuMixcclxuICAgIDQ4OiAxODguNCxcclxuICAgIDQ5OiAyNTUsXHJcbiAgICA1MDogOTkwMCxcclxuICAgIDUxOiAxNzU4MCxcclxuICAgIDUyOiA3MjAwMCxcclxuICAgIDUzOiAzNjk3OTIsXHJcbiAgICA1NDogMS4zMjg1NUUrMTQsXHJcbiAgICA1NTogMS4zMjUzOUUrMTQsXHJcbiAgICA1NjogNi42NjE2N0UrMTIsXHJcbiAgICA1NzogMTUuNjUsXHJcbiAgICA1ODogODUzLjIsXHJcbiAgICA1OTogNS4yOCxcclxuICAgIDYwOiA1NC4yLFxyXG4gICAgNjE6IDEwOTgsXHJcbiAgICA2MjogNDU4LjQsXHJcbiAgICA2MzogMzUuNixcclxuICAgIDY0OiAyMS4yLFxyXG4gICAgNjU6IDUuMTcsXHJcbiAgICA2NjogMC45MSxcclxuICAgIDY3OiAwLjksXHJcbiAgICA2ODogMC4yOSxcclxuICAgIDY5OiAwLjI3MSxcclxuICAgIDcwOiAwLjE1MixcclxuICAgIDcxOiAwLjEsXHJcbiAgICA3MjogMC4wNzgsXHJcbiAgICA3MzogMC4wNTcsXHJcbiAgICA3NDogMC4wNDQ1LFxyXG4gICAgNzU6IDAuMDMsXHJcbiAgICA3NjogMC4wMjIsXHJcbiAgICA3NzogMC4wMjEsXHJcbiAgICA3ODogMC4wMjIsXHJcbiAgICA3OTogbnVsbFxyXG4gIH0sXHJcbiAgNDQ6IHtcclxuICAgIDQxOiAwLjAwMDAwMDQ1LFxyXG4gICAgNDI6IDAuMDAwMDAwNDM4LFxyXG4gICAgNDQ6IDEuMixcclxuICAgIDQ1OiAxLjUsXHJcbiAgICA0NjogMTEuNyxcclxuICAgIDQ3OiA4LFxyXG4gICAgNDg6IDIxOSxcclxuICAgIDQ5OiA1OS43LFxyXG4gICAgNTA6IDMxMDgsXHJcbiAgICA1MTogNTkxNC44LFxyXG4gICAgNTM6IDI0NDUxMixcclxuICAgIDU5OiAzMzkwOTQwLjgsXHJcbiAgICA2MTogMTU5ODAuNCxcclxuICAgIDYyOiAzMjEyMzUyMCxcclxuICAgIDYzOiAyMjUsXHJcbiAgICA2NDogMjczLFxyXG4gICAgNjU6IDM0LjQsXHJcbiAgICA2NjogMTIuMDQsXHJcbiAgICA2NzogMi4xMixcclxuICAgIDY4OiAxLjc1LFxyXG4gICAgNjk6IDAuOCxcclxuICAgIDcwOiAwLjU0LFxyXG4gICAgNzE6IDAuMzE4LFxyXG4gICAgNzI6IDAuMjA0LFxyXG4gICAgNzM6IDAuMTUxLFxyXG4gICAgNzQ6IDAuMDk5LFxyXG4gICAgNzU6IDAuMDY5NSxcclxuICAgIDc2OiAwLjA0NSxcclxuICAgIDc3OiAwLjAyOSxcclxuICAgIDc4OiAwLjAyNSxcclxuICAgIDc5OiAwLjAxOSxcclxuICAgIDgwOiAwLjAxNSxcclxuICAgIDgxOiBudWxsXHJcbiAgfSxcclxuICA0NToge1xyXG4gICAgNDQ6IDAuMDAwMDAwMTIsXHJcbiAgICA0NTogMC4wMjksXHJcbiAgICA0NjogMS40NyxcclxuICAgIDQ3OiA0LjY2LFxyXG4gICAgNDg6IDEyLjIsXHJcbiAgICA0OTogNzAuNixcclxuICAgIDUwOiAzMDEuMixcclxuICAgIDUxOiA1OTQsXHJcbiAgICA1MjogMTg0MixcclxuICAgIDUzOiA1MjMuMixcclxuICAgIDU0OiAxMzkxMDQwLFxyXG4gICAgNTU6IDczODAwLFxyXG4gICAgNTY6IDEwNDEzNzg1NS43LFxyXG4gICAgNTc6IDE3OTEwNzIwLFxyXG4gICAgNTk6IDQyLjMsXHJcbiAgICA2MDogMTI3MjI3LjYsXHJcbiAgICA2MTogMzAuMDcsXHJcbiAgICA2MjogMTMwMixcclxuICAgIDYzOiAxNi44LFxyXG4gICAgNjQ6IDgwLjgsXHJcbiAgICA2NTogMy4zNSxcclxuICAgIDY2OiAxMSxcclxuICAgIDY3OiAzLjYsXHJcbiAgICA2ODogMi44LFxyXG4gICAgNjk6IDEuODUsXHJcbiAgICA3MDogMC45OSxcclxuICAgIDcxOiAwLjY4LFxyXG4gICAgNzI6IDAuNDQsXHJcbiAgICA3MzogMC4yNjYsXHJcbiAgICA3NDogMC4xNzEsXHJcbiAgICA3NTogMC4xMzIsXHJcbiAgICA3NjogMC4xNTEsXHJcbiAgICA3NzogMC4wMDAwMDAzLFxyXG4gICAgNzg6IDAuMDQyMixcclxuICAgIDc5OiAwLjAzLFxyXG4gICAgODA6IDAuMDI2NSxcclxuICAgIDgxOiAwLjAxOSxcclxuICAgIDgyOiAwLjAyLFxyXG4gICAgODM6IG51bGxcclxuICB9LFxyXG4gIDQ2OiB7XHJcbiAgICA0NDogbnVsbCxcclxuICAgIDQ1OiBudWxsLFxyXG4gICAgNDY6IDEsXHJcbiAgICA0NzogMSxcclxuICAgIDQ4OiA5LFxyXG4gICAgNDk6IDUsXHJcbiAgICA1MDogMTIyLFxyXG4gICAgNTE6IDE4NixcclxuICAgIDUyOiAxMDYyLFxyXG4gICAgNTM6IDEyODQsXHJcbiAgICA1NDogMzEzNjMyLFxyXG4gICAgNTU6IDMwNDkyLFxyXG4gICAgNTc6IDE0NjgwMjIuNCxcclxuICAgIDYxOiAyLjA1MTJFKzE0LFxyXG4gICAgNjM6IDQ4OTI0LFxyXG4gICAgNjU6IDE0MDQsXHJcbiAgICA2NjogNzU3NDQsXHJcbiAgICA2NzogOTMsXHJcbiAgICA2ODogMTQ1LjIsXHJcbiAgICA2OTogMjUsXHJcbiAgICA3MDogMTEuOCxcclxuICAgIDcxOiA0LjMsXHJcbiAgICA3MjogMS45LFxyXG4gICAgNzM6IDAuOTIsXHJcbiAgICA3NDogMC40OTIsXHJcbiAgICA3NTogMC4yODUsXHJcbiAgICA3NjogMC4xNzUsXHJcbiAgICA3NzogMC4xMDksXHJcbiAgICA3ODogMC4wMzgsXHJcbiAgICA3OTogMC4wNTcsXHJcbiAgICA4MDogMC4wNDg2LFxyXG4gICAgODE6IDAuMDM4LFxyXG4gICAgODI6IDAuMDM1LFxyXG4gICAgODM6IDAuMDMxLFxyXG4gICAgODQ6IG51bGwsXHJcbiAgICA4NTogbnVsbFxyXG4gIH0sXHJcbiAgNDc6IHtcclxuICAgIDQ1OiBudWxsLFxyXG4gICAgNDY6IDAuMDAwMDAwMjI4LFxyXG4gICAgNDc6IDAuMDI2LFxyXG4gICAgNDg6IDEuNzUsXHJcbiAgICA0OTogNC40LFxyXG4gICAgNTA6IDI1LjUsXHJcbiAgICA1MTogNDcuNSxcclxuICAgIDUyOiAxMjQsXHJcbiAgICA1MzogMTIwLjYsXHJcbiAgICA1NDogNjY2LFxyXG4gICAgNTU6IDc3NCxcclxuICAgIDU2OiAzOTQyLFxyXG4gICAgNTc6IDQxNTIsXHJcbiAgICA1ODogMzU2NzQ1NixcclxuICAgIDU5OiAxNDM3LjYsXHJcbiAgICA2MTogMTQyLjkyLFxyXG4gICAgNjM6IDI0LjU2LFxyXG4gICAgNjQ6IDY0MzY4MCxcclxuICAgIDY1OiAxMTI2OCxcclxuICAgIDY2OiAxOTMzMixcclxuICAgIDY3OiA0LjYsXHJcbiAgICA2ODogMTIwMCxcclxuICAgIDY5OiAyMzAsXHJcbiAgICA3MDogNzIuOCxcclxuICAgIDcxOiAzLjc2LFxyXG4gICAgNzI6IDIuMSxcclxuICAgIDczOiAxLjIzLFxyXG4gICAgNzQ6IDAuNzgsXHJcbiAgICA3NTogMC41MjksXHJcbiAgICA3NjogMC4yOTksXHJcbiAgICA3NzogMC4xOTEsXHJcbiAgICA3ODogMC4xNTksXHJcbiAgICA3OTogMC4wNTIsXHJcbiAgICA4MDogMC4xMDksXHJcbiAgICA4MTogMC4wNTgsXHJcbiAgICA4MjogMC4wNDYsXHJcbiAgICA4MzogMC4wNDIsXHJcbiAgICA4NDogMC4wMzUsXHJcbiAgICA4NTogMC4wMjhcclxuICB9LFxyXG4gIDQ4OiB7XHJcbiAgICA0NjogMC4wMDAwMDA3NixcclxuICAgIDQ3OiAwLjAzMixcclxuICAgIDQ4OiAxLjAzLFxyXG4gICAgNDk6IDIuOCxcclxuICAgIDUwOiA5LjMsXHJcbiAgICA1MTogMTYsXHJcbiAgICA1MjogNDkuMSxcclxuICAgIDUzOiA4MS42LFxyXG4gICAgNTQ6IDMzMCxcclxuICAgIDU1OiA0MzgsXHJcbiAgICA1NjogMzQ2MixcclxuICAgIDU3OiAzMzMwLFxyXG4gICAgNTk6IDIzNDAwLFxyXG4gICAgNjE6IDM5OTA4MTYwLFxyXG4gICAgNjU6IDIuNTM3MThFKzIzLFxyXG4gICAgNjc6IDE5MjQ1NixcclxuICAgIDY4OiAxLjA0MTM4RSsyNyxcclxuICAgIDY5OiA4OTY0LFxyXG4gICAgNzA6IDMwMTgsXHJcbiAgICA3MTogMTYxLjQsXHJcbiAgICA3MjogNTAuOCxcclxuICAgIDczOiAxMy41LFxyXG4gICAgNzQ6IDUuMjQsXHJcbiAgICA3NTogMi4xLFxyXG4gICAgNzY6IDEuMjUsXHJcbiAgICA3NzogMC42OCxcclxuICAgIDc4OiAwLjUxNSxcclxuICAgIDc5OiAwLjM3LFxyXG4gICAgODA6IDAuMjgsXHJcbiAgICA4MTogMC4xNTQsXHJcbiAgICA4MjogMC4xNjIsXHJcbiAgICA4MzogMC4wNjgsXHJcbiAgICA4NDogMC4wODQsXHJcbiAgICA4NTogMC4wNTcsXHJcbiAgICA4NjogMC4wNjVcclxuICB9LFxyXG4gIDQ5OiB7XHJcbiAgICA0NzogbnVsbCxcclxuICAgIDQ4OiAwLjAzNixcclxuICAgIDQ5OiAwLjAzLFxyXG4gICAgNTA6IDMuMSxcclxuICAgIDUxOiA1LjY1LFxyXG4gICAgNTI6IDE1LjEsXHJcbiAgICA1MzogMjMuMyxcclxuICAgIDU0OiA2NSxcclxuICAgIDU1OiAxMDgsXHJcbiAgICA1NjogMzA0LjIsXHJcbiAgICA1NzogMzcyLFxyXG4gICAgNTg6IDE5NDQsXHJcbiAgICA1OTogMzQ4MCxcclxuICAgIDYwOiAxNDk3Mi40LFxyXG4gICAgNjE6IDE3NzEyLFxyXG4gICAgNjI6IDI0MjMyNi4wOCxcclxuICAgIDYzOiA4OTIuOCxcclxuICAgIDY1OiA3MS45LFxyXG4gICAgNjY6IDEuMzkxNjZFKzIyLFxyXG4gICAgNjc6IDE0LjEsXHJcbiAgICA2ODogMjU5MixcclxuICAgIDY5OiA1LFxyXG4gICAgNzA6IDE0NCxcclxuICAgIDcxOiAzLjA4LFxyXG4gICAgNzI6IDIzLjEsXHJcbiAgICA3MzogMS41LFxyXG4gICAgNzQ6IDYuMTUsXHJcbiAgICA3NTogMy4xMixcclxuICAgIDc2OiAyLjM2LFxyXG4gICAgNzc6IDEuNTMsXHJcbiAgICA3ODogMS4wOSxcclxuICAgIDc5OiAwLjg0LFxyXG4gICAgODA6IDAuNjExLFxyXG4gICAgODE6IDAuMjksXHJcbiAgICA4MjogMC4yOCxcclxuICAgIDgzOiAwLjIsXHJcbiAgICA4NDogMC4xNjUsXHJcbiAgICA4NTogMC4xNCxcclxuICAgIDg2OiAwLjEwMSxcclxuICAgIDg3OiAwLjA4NSxcclxuICAgIDg4OiAwLjA2NVxyXG4gIH0sXHJcbiAgNTA6IHtcclxuICAgIDQ5OiAwLjAwMDAwMDc2LFxyXG4gICAgNTA6IDEuMTgsXHJcbiAgICA1MTogMS43LFxyXG4gICAgNTI6IDMuOCxcclxuICAgIDUzOiA3LFxyXG4gICAgNTQ6IDIwLjgsXHJcbiAgICA1NTogMzIuNyxcclxuICAgIDU2OiAxMTUsXHJcbiAgICA1NzogMTc0LFxyXG4gICAgNTg6IDYxOCxcclxuICAgIDU5OiAxMDg2LFxyXG4gICAgNjA6IDE0OTU0LjQsXHJcbiAgICA2MTogMjExOCxcclxuICAgIDYzOiA5OTQzNzc2LFxyXG4gICAgNzE6IDk3MzA4LFxyXG4gICAgNzM6IDExMTYyODgwLFxyXG4gICAgNzU6IDgzMjg5NixcclxuICAgIDc2OiA3LjI1ODA5RSsxMixcclxuICAgIDc3OiA3NTYwLFxyXG4gICAgNzg6IDM1NDQuMixcclxuICAgIDc5OiAxMzMuOCxcclxuICAgIDgwOiAyMjMuMixcclxuICAgIDgxOiA1NixcclxuICAgIDgyOiAzOS43LFxyXG4gICAgODM6IDEuNDYsXHJcbiAgICA4NDogMS4wNSxcclxuICAgIDg1OiAwLjUxNSxcclxuICAgIDg2OiAwLjM0NSxcclxuICAgIDg3OiAwLjE5LFxyXG4gICAgODg6IDAuMTQsXHJcbiAgICA4OTogMC4xMyxcclxuICAgIDkwOiBudWxsXHJcbiAgfSxcclxuICA1MToge1xyXG4gICAgNTI6IDAuMDAwMDAwMDQ5LFxyXG4gICAgNTM6IDAuNDQsXHJcbiAgICA1NDogMS4yMixcclxuICAgIDU1OiAwLjYsXHJcbiAgICA1NjogNCxcclxuICAgIDU3OiA3LjQsXHJcbiAgICA1ODogMTcuMixcclxuICAgIDU5OiAyMy42LFxyXG4gICAgNjA6IDc1LFxyXG4gICAgNjE6IDUzLjUsXHJcbiAgICA2MjogNDAwLjIsXHJcbiAgICA2MzogMjA5LjQsXHJcbiAgICA2NDogMTkyNixcclxuICAgIDY1OiA5NDgsXHJcbiAgICA2NjogMTAwODAsXHJcbiAgICA2NzogMjE2LFxyXG4gICAgNjg6IDEzNzQ4NCxcclxuICAgIDY5OiA5NTMuNCxcclxuICAgIDcxOiAyMzUzMzYuMzIsXHJcbiAgICA3MzogNTIwMTI4MCxcclxuICAgIDc0OiA4NzA1MTY3My43MixcclxuICAgIDc1OiAxMDY3MDQwLFxyXG4gICAgNzY6IDMzMjY0MCxcclxuICAgIDc3OiAzMjU4MCxcclxuICAgIDc4OiAxNTcxNy42LFxyXG4gICAgNzk6IDIzNzAsXHJcbiAgICA4MDogMTM4MS44LFxyXG4gICAgODE6IDE2Ny40LFxyXG4gICAgODI6IDE0MC40LFxyXG4gICAgODM6IDAuNzgsXHJcbiAgICA4NDogMS42NzksXHJcbiAgICA4NTogMC45MjMsXHJcbiAgICA4NjogMC40NSxcclxuICAgIDg3OiAwLjM0OCxcclxuICAgIDg4OiAwLjA5MyxcclxuICAgIDg5OiAwLjE3MyxcclxuICAgIDkwOiBudWxsLFxyXG4gICAgOTE6IDAuMDUzXHJcbiAgfSxcclxuICA1Mjoge1xyXG4gICAgNTI6IDAuMDAwMDAwMDE4LFxyXG4gICAgNTM6IDAuMDAwMDAwNjIsXHJcbiAgICA1NDogMC4wMDAwNyxcclxuICAgIDU1OiAwLjAwMzEsXHJcbiAgICA1NjogMi4xLFxyXG4gICAgNTc6IDQuNCxcclxuICAgIDU4OiAxOC42LFxyXG4gICAgNTk6IDE5LjMsXHJcbiAgICA2MDogMTIwLFxyXG4gICAgNjE6IDEwMixcclxuICAgIDYyOiA5MTIsXHJcbiAgICA2MzogMzQ4LFxyXG4gICAgNjQ6IDg5NjQsXHJcbiAgICA2NTogMzcyMCxcclxuICAgIDY2OiA1MTg0MDAsXHJcbiAgICA2NzogNTc3ODAsXHJcbiAgICA2OTogMTY1NjI4OCxcclxuICAgIDcxOiAyLjkwMzI0RSsyNCxcclxuICAgIDc1OiAzMzY2MCxcclxuICAgIDc2OiAyLjQyOTg4RSszMixcclxuICAgIDc3OiA0MTc2LFxyXG4gICAgNzg6IDIuNDkzRSsyOCxcclxuICAgIDc5OiAxNTAwLFxyXG4gICAgODA6IDI3NjgyNS42LFxyXG4gICAgODE6IDc1MCxcclxuICAgIDgyOiAyNTA4LFxyXG4gICAgODM6IDE5LFxyXG4gICAgODQ6IDE3LjYzLFxyXG4gICAgODU6IDIuNDksXHJcbiAgICA4NjogMS40LFxyXG4gICAgODc6IDEuNixcclxuICAgIDg4OiAwLjM0OCxcclxuICAgIDkwOiBudWxsLFxyXG4gICAgOTE6IDAuMDAwMDAwNDA4LFxyXG4gICAgOTI6IG51bGwsXHJcbiAgICA5MzogbnVsbFxyXG4gIH0sXHJcbiAgNTM6IHtcclxuICAgIDU1OiAwLjAzNixcclxuICAgIDU2OiAwLjAwMDA5MjgsXHJcbiAgICA1NzogMC42NjQsXHJcbiAgICA1ODogMi41LFxyXG4gICAgNTk6IDMuMzQsXHJcbiAgICA2MDogNi42LFxyXG4gICAgNjE6IDIuMSxcclxuICAgIDYyOiA3OCxcclxuICAgIDYzOiAyLjkxLFxyXG4gICAgNjQ6IDEzMy4yLFxyXG4gICAgNjU6IDgyMixcclxuICAgIDY2OiAxMTQ2LFxyXG4gICAgNjc6IDQ4OTYsXHJcbiAgICA2ODogNzYzMixcclxuICAgIDY5OiAyMTcuOCxcclxuICAgIDcwOiA0NzYwMi44LFxyXG4gICAgNzE6IDM2MDgwNi40LFxyXG4gICAgNzI6IDUxMzI3NjQuOCxcclxuICAgIDczOiAxMTE3MTUyLFxyXG4gICAgNzU6IDE0OTkuNCxcclxuICAgIDc2OiA0Ljk1NDQ0RSsxNCxcclxuICAgIDc3OiA0NDQ5NixcclxuICAgIDc4OiA2OTMzNzcuMjgsXHJcbiAgICA3OTogODI2MixcclxuICAgIDgwOiA3NDk4OCxcclxuICAgIDgxOiAzMTUwLFxyXG4gICAgODI6IDIzNjg4LFxyXG4gICAgODM6IDgzLjQsXHJcbiAgICA4NDogMjQuNSxcclxuICAgIDg1OiA2LjI2LFxyXG4gICAgODY6IDIuMjgsXHJcbiAgICA4NzogMC44NixcclxuICAgIDg4OiAwLjQzLFxyXG4gICAgODk6IDAuMjIyLFxyXG4gICAgOTA6IDAuMTMsXHJcbiAgICA5MTogMC4wMDAwMDAzLFxyXG4gICAgOTI6IDAuMDAwMDAwNDA3LFxyXG4gICAgOTM6IDAuMDk0LFxyXG4gICAgOTQ6IG51bGxcclxuICB9LFxyXG4gIDU0OiB7XHJcbiAgICA1NDogMC4wMDAwNTQsXHJcbiAgICA1NTogMC4wMTMsXHJcbiAgICA1NjogMC4wOTMsXHJcbiAgICA1NzogMC43NCxcclxuICAgIDU4OiAyLjcsXHJcbiAgICA1OTogMi43NCxcclxuICAgIDYwOiAxMCxcclxuICAgIDYxOiAxOCxcclxuICAgIDYyOiA1OSxcclxuICAgIDYzOiA2MSxcclxuICAgIDY0OiAyMjgsXHJcbiAgICA2NTogMzQ4LFxyXG4gICAgNjY6IDI0MDAsXHJcbiAgICA2NzogMjQwNixcclxuICAgIDY4OiA3MjM2MCxcclxuICAgIDY5OiA3MzgwLFxyXG4gICAgNzA6IDUuMDQ5MTFFKzIxLFxyXG4gICAgNzE6IDYwODQwLFxyXG4gICAgNzM6IDMxNDAyOTQuNCxcclxuICAgIDc5OiA0NTMzODQsXHJcbiAgICA4MDogMS44MzAzRSszMCxcclxuICAgIDgxOiAzMjkwNCxcclxuICAgIDgyOiA2LjgzMjA3RSsyOCxcclxuICAgIDgzOiAyMjkuMDgsXHJcbiAgICA4NDogODQ4LjQsXHJcbiAgICA4NTogMzkuNjgsXHJcbiAgICA4NjogMTMuNixcclxuICAgIDg3OiAxLjczLFxyXG4gICAgODg6IDEuMjMsXHJcbiAgICA4OTogMC41MTEsXHJcbiAgICA5MDogMS4xNSxcclxuICAgIDkxOiAwLjE4OCxcclxuICAgIDkyOiAwLjE0NixcclxuICAgIDkzOiAwLjEsXHJcbiAgICA5NDogMC4wMDAwMDA0LFxyXG4gICAgOTU6IG51bGwsXHJcbiAgICA5NjogbnVsbFxyXG4gIH0sXHJcbiAgNTU6IHtcclxuICAgIDU3OiAwLjAwMDQ5LFxyXG4gICAgNTg6IDAuMDAwMDE3NyxcclxuICAgIDU5OiAwLjU3LFxyXG4gICAgNjA6IDEuNCxcclxuICAgIDYxOiAwLjcsXHJcbiAgICA2MjogOC40LFxyXG4gICAgNjM6IDE0LFxyXG4gICAgNjQ6IDQzLFxyXG4gICAgNjU6IDYxLjMsXHJcbiAgICA2NjogMTU1LFxyXG4gICAgNjc6IDIxLjE4LFxyXG4gICAgNjg6IDM1MS42LFxyXG4gICAgNjk6IDMwLjksXHJcbiAgICA3MDogMjgwMixcclxuICAgIDcxOiA5OC40LFxyXG4gICAgNzI6IDIyNTAwLFxyXG4gICAgNzM6IDIxOC40LFxyXG4gICAgNzQ6IDExNTQxNixcclxuICAgIDc1OiAxNzUyLjYsXHJcbiAgICA3NjogODM3MTI5LjYsXHJcbiAgICA3NzogNTU5ODcyLFxyXG4gICAgNzk6IDY1MTcxMzYzLjUyLFxyXG4gICAgODA6IDcuMjU4MDlFKzEzLFxyXG4gICAgODE6IDExMjQwNjQsXHJcbiAgICA4MjogOTQ5MjMyMzMzLjMsXHJcbiAgICA4MzogMTk1MCxcclxuICAgIDg0OiA1NTYuMixcclxuICAgIDg1OiA2My43LFxyXG4gICAgODY6IDI0Ljg0LFxyXG4gICAgODc6IDEuNjg0LFxyXG4gICAgODg6IDEuNzkxLFxyXG4gICAgODk6IDAuOTk0LFxyXG4gICAgOTA6IDAuNTg3LFxyXG4gICAgOTE6IDAuMzIyLFxyXG4gICAgOTI6IDAuMjMsXHJcbiAgICA5MzogMC4xNDYsXHJcbiAgICA5NDogMC4xMTMsXHJcbiAgICA5NTogMC4wODQsXHJcbiAgICA5NjogMC4wNjksXHJcbiAgICA5NzogMC4wNVxyXG4gIH0sXHJcbiAgNTY6IHtcclxuICAgIDU4OiAwLjQzLFxyXG4gICAgNTk6IDAuNDUsXHJcbiAgICA2MDogMS4zLFxyXG4gICAgNjE6IDEuNzUsXHJcbiAgICA2MjogNS41LFxyXG4gICAgNjM6IDUuNCxcclxuICAgIDY0OiAyNCxcclxuICAgIDY1OiAyOS43LFxyXG4gICAgNjY6IDExNyxcclxuICAgIDY3OiAxNDQsXHJcbiAgICA2ODogNjYwLFxyXG4gICAgNjk6IDE5OCxcclxuICAgIDcwOiA2MDAwLFxyXG4gICAgNzE6IDc2MixcclxuICAgIDcyOiAyMDk5NTIsXHJcbiAgICA3MzogODAyOCxcclxuICAgIDc1OiA5OTM2MDAsXHJcbiAgICA3NjogOS40NjcwOEUrMjgsXHJcbiAgICA3NzogMzMyOTU3MTI2LFxyXG4gICAgODM6IDQ5NzUuOCxcclxuICAgIDg0OiAxMTAxNjg2LjQsXHJcbiAgICA4NTogMTA5Ni4yLFxyXG4gICAgODY6IDYzNixcclxuICAgIDg3OiAxNC41LFxyXG4gICAgODg6IDExLjUsXHJcbiAgICA4OTogNC4zMSxcclxuICAgIDkwOiAyLjIxLFxyXG4gICAgOTE6IDAuODk0LFxyXG4gICAgOTI6IDAuNjEyLFxyXG4gICAgOTM6IDAuMzQ0LFxyXG4gICAgOTQ6IDAuMjU5LFxyXG4gICAgOTU6IDAuMTY3LFxyXG4gICAgOTY6IDAuMTM5LFxyXG4gICAgOTc6IDAuMTE2LFxyXG4gICAgOTg6IDAuMDUzXHJcbiAgfSxcclxuICA1Nzoge1xyXG4gICAgNjA6IDAuMDIzNSxcclxuICAgIDYzOiAyLjgsXHJcbiAgICA2NDogNS4zLFxyXG4gICAgNjU6IDguNixcclxuICAgIDY2OiAxNi4zLFxyXG4gICAgNjc6IDIxLFxyXG4gICAgNjg6IDY0LjgsXHJcbiAgICA2OTogNTQsXHJcbiAgICA3MDogMzA2LFxyXG4gICAgNzE6IDMxMC44LFxyXG4gICAgNzI6IDY5NixcclxuICAgIDczOiA1MjIsXHJcbiAgICA3NDogMzU0MCxcclxuICAgIDc1OiAxNzI4MCxcclxuICAgIDc2OiAxNDA4My4yLFxyXG4gICAgNzc6IDM4NyxcclxuICAgIDc4OiA3MDIwMCxcclxuICAgIDc5OiA1OTIuMixcclxuICAgIDgwOiAxLjg5MzQyRSsxMixcclxuICAgIDgxOiAzLjI1MDM2RSsxOCxcclxuICAgIDgzOiAxNDUwMjkuMzEyLFxyXG4gICAgODQ6IDE0MTEyLFxyXG4gICAgODU6IDU0NjYsXHJcbiAgICA4NjogODUyLFxyXG4gICAgODc6IDQwLjgsXHJcbiAgICA4ODogMjQuOCxcclxuICAgIDg5OiA2LjEsXHJcbiAgICA5MDogNC4wNixcclxuICAgIDkxOiAxLjI2LFxyXG4gICAgOTI6IDEuMDUsXHJcbiAgICA5MzogMC41OSxcclxuICAgIDk0OiAwLjQ1NyxcclxuICAgIDk1OiAwLjI5OCxcclxuICAgIDk2OiAwLjI0NSxcclxuICAgIDk3OiAwLjE2MSxcclxuICAgIDk4OiAwLjEwMSxcclxuICAgIDk5OiAwLjA4NCxcclxuICAgIDEwMDogbnVsbFxyXG4gIH0sXHJcbiAgNTg6IHtcclxuICAgIDYzOiAxLjEsXHJcbiAgICA2NDogbnVsbCxcclxuICAgIDY1OiAzLjgsXHJcbiAgICA2NjogNixcclxuICAgIDY3OiA5LjcsXHJcbiAgICA2ODogNTEsXHJcbiAgICA2OTogMzQsXHJcbiAgICA3MDogMjM1LjgsXHJcbiAgICA3MTogMjEwLFxyXG4gICAgNzI6IDEzNzQsXHJcbiAgICA3MzogNjE4LFxyXG4gICAgNzQ6IDEyNjM2LFxyXG4gICAgNzU6IDU4MjAsXHJcbiAgICA3NjogMjczMDI0LFxyXG4gICAgNzc6IDYzNzIwLFxyXG4gICAgNzk6IDMyNDAwLFxyXG4gICAgODA6IDEuMzg4NUUrMjQsXHJcbiAgICA4MTogMTE4OTEyMzIsXHJcbiAgICA4MzogMjgwODk1MC40LFxyXG4gICAgODQ6IDEuNTc3ODVFKzI0LFxyXG4gICAgODU6IDExODk0MC40LFxyXG4gICAgODY6IDI0NjE2MjI0LFxyXG4gICAgODc6IDE4MC42LFxyXG4gICAgODg6IDgwOS40LFxyXG4gICAgODk6IDU2LjQsXHJcbiAgICA5MDogNTYuOCxcclxuICAgIDkxOiA1LjMsXHJcbiAgICA5MjogNCxcclxuICAgIDkzOiAxLjc2LFxyXG4gICAgOTQ6IDEuNCxcclxuICAgIDk1OiAwLjg2NSxcclxuICAgIDk2OiAwLjcyMixcclxuICAgIDk3OiAwLjMxMyxcclxuICAgIDk4OiAwLjIzMyxcclxuICAgIDk5OiAwLjE4LFxyXG4gICAgMTAwOiAwLjA5OVxyXG4gIH0sXHJcbiAgNTk6IHtcclxuICAgIDYyOiAwLjAxLFxyXG4gICAgNjU6IDEuMixcclxuICAgIDY2OiAzLjMsXHJcbiAgICA2NzogMy4xNCxcclxuICAgIDY4OiA0LjIsXHJcbiAgICA2OTogMi44NCxcclxuICAgIDcwOiAzMCxcclxuICAgIDcxOiA0MCxcclxuICAgIDcyOiA5MC42LFxyXG4gICAgNzM6IDk2LFxyXG4gICAgNzQ6IDM5MCxcclxuICAgIDc1OiAxMDIwLFxyXG4gICAgNzY6IDE0NDAsXHJcbiAgICA3NzogNzg2LFxyXG4gICAgNzg6IDQ2MDgsXHJcbiAgICA3OTogODcsXHJcbiAgICA4MDogMTU4NzYsXHJcbiAgICA4MTogMjAzLjQsXHJcbiAgICA4MzogNjg4MzIsXHJcbiAgICA4NDogMTE3MjQ0OCxcclxuICAgIDg1OiAxMDM2LjgsXHJcbiAgICA4NjogMjE1NDIuNCxcclxuICAgIDg3OiAxNDQ1LjQsXHJcbiAgICA4ODogODA0LFxyXG4gICAgODk6IDEzNy40LFxyXG4gICAgOTA6IDEzNS42LFxyXG4gICAgOTE6IDYuMTksXHJcbiAgICA5MjogMTguOSxcclxuICAgIDkzOiAzLjU3LFxyXG4gICAgOTQ6IDQuMjksXHJcbiAgICA5NTogMi4zLFxyXG4gICAgOTY6IDEuNDcsXHJcbiAgICA5NzogMC40NDQsXHJcbiAgICA5ODogMC4yOTUsXHJcbiAgICA5OTogMC4xODEsXHJcbiAgICAxMDA6IDAuMTMsXHJcbiAgICAxMDE6IDAuMTcsXHJcbiAgICAxMDI6IG51bGxcclxuICB9LFxyXG4gIDYwOiB7XHJcbiAgICA2NTogMC42NSxcclxuICAgIDY2OiBudWxsLFxyXG4gICAgNjc6IDEuOCxcclxuICAgIDY4OiA1LFxyXG4gICAgNjk6IDYuNyxcclxuICAgIDcwOiAxMyxcclxuICAgIDcxOiAyNS40LFxyXG4gICAgNzI6IDk0LFxyXG4gICAgNzM6IDcwLFxyXG4gICAgNzQ6IDUxMCxcclxuICAgIDc1OiA3NDQsXHJcbiAgICA3NjogMzAzOSxcclxuICAgIDc3OiAyMzEwLFxyXG4gICAgNzg6IDE4MTQ0LFxyXG4gICAgNzk6IDE3ODIsXHJcbiAgICA4MDogMjkxMTY4LFxyXG4gICAgODE6IDg5NjQsXHJcbiAgICA4NDogNy4yMjY1NEUrMjIsXHJcbiAgICA4NzogOTQ4NjcyLFxyXG4gICAgODk6IDYyMjAuOCxcclxuICAgIDkwOiAyLjg3MTY4RSsyNixcclxuICAgIDkxOiA3NDYuNCxcclxuICAgIDkyOiA2ODQsXHJcbiAgICA5MzogMzEuNixcclxuICAgIDk0OiAyNS45LFxyXG4gICAgOTU6IDguOSxcclxuICAgIDk2OiA1LjI2LFxyXG4gICAgOTc6IDEuMTUsXHJcbiAgICA5ODogMC44MixcclxuICAgIDk5OiAwLjQ4NSxcclxuICAgIDEwMDogMC40MzksXHJcbiAgICAxMDE6IDAuMjIsXHJcbiAgICAxMDI6IDAuMzEsXHJcbiAgICAxMDM6IG51bGxcclxuICB9LFxyXG4gIDYxOiB7XHJcbiAgICA2NzogMSxcclxuICAgIDY4OiAyLjQsXHJcbiAgICA2OTogMi42LFxyXG4gICAgNzA6IDYuMyxcclxuICAgIDcxOiA2LjIsXHJcbiAgICA3MjogMTMuNSxcclxuICAgIDczOiA1LFxyXG4gICAgNzQ6IDQ5LFxyXG4gICAgNzU6IDMwMCxcclxuICAgIDc2OiAxNDQsXHJcbiAgICA3NzogMTAsXHJcbiAgICA3ODogMjQ5LFxyXG4gICAgNzk6IDkuMixcclxuICAgIDgwOiAxMjU0LFxyXG4gICAgODE6IDQwLjUsXHJcbiAgICA4MjogMjI4OTYwMDAsXHJcbiAgICA4MzogMzEzNjMyMDAsXHJcbiAgICA4NDogNTU4NTU3NTg5LjgsXHJcbiAgICA4NTogMTc0NTA5ODAwLjYsXHJcbiAgICA4NjogODI3ODY0MzkuNixcclxuICAgIDg3OiA0NjM3OTUuMixcclxuICAgIDg4OiAxOTEwODgsXHJcbiAgICA4OTogOTcxMi44LFxyXG4gICAgOTA6IDEwMjI0MCxcclxuICAgIDkxOiAyNDcuMixcclxuICAgIDkyOiAzMTUsXHJcbiAgICA5MzogMTYwLjgsXHJcbiAgICA5NDogNDEuNSxcclxuICAgIDk1OiAyNi43LFxyXG4gICAgOTY6IDEwLjU2LFxyXG4gICAgOTc6IDQuOCxcclxuICAgIDk4OiAxLjUsXHJcbiAgICA5OTogMC43MjUsXHJcbiAgICAxMDA6IDEuMDUsXHJcbiAgICAxMDE6IDAuNjMsXHJcbiAgICAxMDI6IDAuNDMsXHJcbiAgICAxMDM6IG51bGwsXHJcbiAgICAxMDQ6IG51bGxcclxuICB9LFxyXG4gIDYyOiB7XHJcbiAgICA2NzogMC41NSxcclxuICAgIDY4OiBudWxsLFxyXG4gICAgNjk6IDEuMixcclxuICAgIDcwOiA0LFxyXG4gICAgNzE6IDIuODksXHJcbiAgICA3MjogOS41LFxyXG4gICAgNzM6IDEwLjMsXHJcbiAgICA3NDogNDcsXHJcbiAgICA3NTogNDUsXHJcbiAgICA3NjogMTg2LFxyXG4gICAgNzc6IDE1NC4yLFxyXG4gICAgNzg6IDg4OS4yLFxyXG4gICAgNzk6IDYxMixcclxuICAgIDgwOiA0MzQ5LjQsXHJcbiAgICA4MTogNTI1LFxyXG4gICAgODM6IDI5Mzc2MDAwLFxyXG4gICAgODQ6IDIuMTQ1ODdFKzE1LFxyXG4gICAgODU6IDMuMzQ1MDNFKzE4LFxyXG4gICAgODY6IDIuMjA4OThFKzIzLFxyXG4gICAgODk6IDI4NDAxMjMzMzgsXHJcbiAgICA5MTogMTY2NjIyLjQsXHJcbiAgICA5MzogMTMzMC44LFxyXG4gICAgOTQ6IDMzODQwLFxyXG4gICAgOTU6IDQ4MS44LFxyXG4gICAgOTY6IDMxOCxcclxuICAgIDk3OiAxMS4zNyxcclxuICAgIDk4OiA5LjYsXHJcbiAgICA5OTogNC44LFxyXG4gICAgMTAwOiAyLjQsXHJcbiAgICAxMDE6IDEuMjMsXHJcbiAgICAxMDI6IDEuNDMsXHJcbiAgICAxMDM6IDAuOTgsXHJcbiAgICAxMDQ6IDAuOCxcclxuICAgIDEwNTogbnVsbCxcclxuICAgIDEwNjogbnVsbFxyXG4gIH0sXHJcbiAgNjM6IHtcclxuICAgIDY3OiAwLjAwMDksXHJcbiAgICA2ODogMC4wMTc4LFxyXG4gICAgNjk6IG51bGwsXHJcbiAgICA3MTogMC41LFxyXG4gICAgNzI6IDEuNSxcclxuICAgIDczOiAzLjMsXHJcbiAgICA3NDogMTEsXHJcbiAgICA3NTogMTIuMSxcclxuICAgIDc2OiAxNy45LFxyXG4gICAgNzc6IDEuNTEsXHJcbiAgICA3ODogNDAuNyxcclxuICAgIDc5OiAyLjM0LFxyXG4gICAgODA6IDE1NS40LFxyXG4gICAgODE6IDEwLjIsXHJcbiAgICA4MjogNTEyMzUyLFxyXG4gICAgODM6IDM5ODMwNCxcclxuICAgIDg0OiAyMDgyMjQwLFxyXG4gICAgODU6IDQ3MDg4MDAsXHJcbiAgICA4NjogODA0Mzg0MCxcclxuICAgIDg3OiAxMTY0NDUwNTY4LFxyXG4gICAgODg6IDUuMzY0NjhFKzI1LFxyXG4gICAgODk6IDQyNjU1NDk2OC40LFxyXG4gICAgOTE6IDI3MTQyMTEyMC4zLFxyXG4gICAgOTI6IDE0OTk5MDA2OS4yLFxyXG4gICAgOTM6IDEzMTI0MTYsXHJcbiAgICA5NDogNTQ2NDgsXHJcbiAgICA5NTogMjc1NCxcclxuICAgIDk2OiAxMDg2LFxyXG4gICAgOTc6IDQyLjYsXHJcbiAgICA5ODogMjYsXHJcbiAgICA5OTogMTAuNixcclxuICAgIDEwMDogNy43LFxyXG4gICAgMTAxOiA0LjE1LFxyXG4gICAgMTAyOiAyLjMsXHJcbiAgICAxMDM6IDEuNyxcclxuICAgIDEwNDogMS4zLFxyXG4gICAgMTA1OiAwLjIsXHJcbiAgICAxMDY6IG51bGxcclxuICB9LFxyXG4gIDY0OiB7XHJcbiAgICA3MDogbnVsbCxcclxuICAgIDcxOiAxLjEsXHJcbiAgICA3MjogMC4wMDAwMDAyLFxyXG4gICAgNzM6IDIuMixcclxuICAgIDc0OiA0LjcsXHJcbiAgICA3NTogNS44LFxyXG4gICAgNzY6IDE1LjgsXHJcbiAgICA3NzogMTQsXHJcbiAgICA3ODogNzAuMixcclxuICAgIDc5OiAzOSxcclxuICAgIDgwOiAyNjguMixcclxuICAgIDgxOiAxMzgwLFxyXG4gICAgODI6IDQxNzA1MjgsXHJcbiAgICA4MzogMTM3MDE2LFxyXG4gICAgODQ6IDIyNDM2OTc0MzcsXHJcbiAgICA4NTogODAxNzkyLFxyXG4gICAgODY6IDUuNjQ4NjlFKzEzLFxyXG4gICAgODc6IDEwNzA0OTYwLFxyXG4gICAgODg6IDMuNDA4MTVFKzIxLFxyXG4gICAgODk6IDIwNzcwNTYwLFxyXG4gICAgOTU6IDY2NTI0LjQsXHJcbiAgICA5NzogMjE5LjYsXHJcbiAgICA5ODogNTA0LFxyXG4gICAgOTk6IDY4LFxyXG4gICAgMTAwOiA0NSxcclxuICAgIDEwMTogMTAuMyxcclxuICAgIDEwMjogNC44LFxyXG4gICAgMTAzOiA0LjI2LFxyXG4gICAgMTA0OiAzLjAzLFxyXG4gICAgMTA1OiAwLjc1LFxyXG4gICAgMTA2OiAwLjQxLFxyXG4gICAgMTA3OiBudWxsLFxyXG4gICAgMTA4OiBudWxsXHJcbiAgfSxcclxuICA2NToge1xyXG4gICAgNzA6IDAuMDAwOTQsXHJcbiAgICA3MzogMC4wMDAwMDAyLFxyXG4gICAgNzQ6IDEuNixcclxuICAgIDc1OiAyLjI5LFxyXG4gICAgNzY6IDMuNSxcclxuICAgIDc3OiAwLjU5NyxcclxuICAgIDc4OiAxMixcclxuICAgIDc5OiAxLFxyXG4gICAgODA6IG51bGwsXHJcbiAgICA4MTogOCxcclxuICAgIDgyOiA1OTA0LFxyXG4gICAgODM6IDM2MDAsXHJcbiAgICA4NDogMTQ4MjQuOCxcclxuICAgIDg1OiAxMjUyOCxcclxuICAgIDg2OiA2MzM5Mi40LFxyXG4gICAgODc6IDYzMDAwLFxyXG4gICAgODg6IDIwMjE3NixcclxuICAgIDg5OiA3NzQwMCxcclxuICAgIDkwOiA0NTk2NDgsXHJcbiAgICA5MTogNDYyMjQwLFxyXG4gICAgOTI6IDIyNDA1NDE3NDQsXHJcbiAgICA5MzogNTY4MDI0NjY3NSxcclxuICAgIDk1OiA2MjQ2NzIwLFxyXG4gICAgOTY6IDU5NTI5NixcclxuICAgIDk3OiA0NTYsXHJcbiAgICA5ODogMTE3MCxcclxuICAgIDk5OiAxODAsXHJcbiAgICAxMDA6IDEyNi42LFxyXG4gICAgMTAxOiAyNS4xLFxyXG4gICAgMTAyOiAxOS40LFxyXG4gICAgMTAzOiA4LjIsXHJcbiAgICAxMDQ6IDUuMSxcclxuICAgIDEwNTogMC45NixcclxuICAgIDEwNjogMS4yNCxcclxuICAgIDEwNzogMC43NixcclxuICAgIDEwODogbnVsbCxcclxuICAgIDEwOTogbnVsbFxyXG4gIH0sXHJcbiAgNjY6IHtcclxuICAgIDczOiAwLjYsXHJcbiAgICA3NDogbnVsbCxcclxuICAgIDc1OiAwLjksXHJcbiAgICA3NjogMi4zLFxyXG4gICAgNzc6IDUuNixcclxuICAgIDc4OiA5LjEsXHJcbiAgICA3OTogNixcclxuICAgIDgwOiAzMy4yLFxyXG4gICAgODE6IDY3LFxyXG4gICAgODI6IDE5OCxcclxuICAgIDgzOiAyNTIsXHJcbiAgICA4NDogNDMwLjIsXHJcbiAgICA4NTogMTA3NCxcclxuICAgIDg2OiA4NTY4LFxyXG4gICAgODc6IDIzMDQwLFxyXG4gICAgODg6IDkuNDY3MDhFKzEzLFxyXG4gICAgODk6IDM1NjQwLFxyXG4gICAgOTE6IDI5MzA0LFxyXG4gICAgOTM6IDEyNDc2MTYwLFxyXG4gICAgOTk6IDgzOTUuMixcclxuICAgIDEwMDogMjkzNzYwLFxyXG4gICAgMTAxOiAzNzIsXHJcbiAgICAxMDI6IDUyMixcclxuICAgIDEwMzogMzksXHJcbiAgICAxMDQ6IDU1LFxyXG4gICAgMTA1OiA0LjEsXHJcbiAgICAxMDY6IDAuMDAwMDAwMTYsXHJcbiAgICAxMDc6IDEuNDMsXHJcbiAgICAxMDg6IDAuMDAwMDAwMTYsXHJcbiAgICAxMDk6IG51bGwsXHJcbiAgICAxMTA6IG51bGxcclxuICB9LFxyXG4gIDY3OiB7XHJcbiAgICA3MzogMC4wMDYsXHJcbiAgICA3NDogMC4wMDQxLFxyXG4gICAgNzU6IDAuNCxcclxuICAgIDc2OiBudWxsLFxyXG4gICAgNzc6IDAuNyxcclxuICAgIDc4OiAyLjQsXHJcbiAgICA3OTogMy4zMixcclxuICAgIDgwOiA1LjgsXHJcbiAgICA4MTogMi4yLFxyXG4gICAgODI6IDIxLjEsXHJcbiAgICA4MzogNzIsXHJcbiAgICA4NDogMzUuMixcclxuICAgIDg1OiAxNjEuOCxcclxuICAgIDg2OiAxMjAuNixcclxuICAgIDg3OiA3MDUuNixcclxuICAgIDg4OiAyODgwLFxyXG4gICAgODk6IDMzNjAsXHJcbiAgICA5MDogNzU2LFxyXG4gICAgOTE6IDY3OCxcclxuICAgIDkyOiAxOTgzLFxyXG4gICAgOTM6IDE1MzYsXHJcbiAgICA5NDogODkyOCxcclxuICAgIDk1OiA5MDAsXHJcbiAgICA5NjogMS40NDIxNUUrMTEsXHJcbiAgICA5NzogMTcyOCxcclxuICAgIDk5OiA5NjU2Ni40LFxyXG4gICAgMTAwOiAxMTE2MCxcclxuICAgIDEwMTogMTc5LjQsXHJcbiAgICAxMDI6IDI4My4yLFxyXG4gICAgMTAzOiAxNjUuNixcclxuICAgIDEwNDogNTMsXHJcbiAgICAxMDU6IDI1LFxyXG4gICAgMTA2OiA2LjksXHJcbiAgICAxMDc6IDMuMixcclxuICAgIDEwODogMS45LFxyXG4gICAgMTA5OiAwLjAwMDAwMDE2LFxyXG4gICAgMTEwOiBudWxsLFxyXG4gICAgMTExOiBudWxsXHJcbiAgfSxcclxuICA2ODoge1xyXG4gICAgNzU6IG51bGwsXHJcbiAgICA3NjogMC4wMDAwMDAyLFxyXG4gICAgNzc6IG51bGwsXHJcbiAgICA3ODogMS43LFxyXG4gICAgNzk6IDIuNSxcclxuICAgIDgwOiA0LjYsXHJcbiAgICA4MTogNCxcclxuICAgIDgyOiAxOC41LFxyXG4gICAgODM6IDIzLjUsXHJcbiAgICA4NDogMTAuMyxcclxuICAgIDg1OiAzNy4xLFxyXG4gICAgODY6IDIyMy44LFxyXG4gICAgODc6IDMxOCxcclxuICAgIDg4OiAxMTcwLFxyXG4gICAgODk6IDExMTksXHJcbiAgICA5MDogODI0NCxcclxuICAgIDkxOiAyMTYwLFxyXG4gICAgOTI6IDEwMjg4OCxcclxuICAgIDkzOiAxMTU1NixcclxuICAgIDk1OiA0NTAwLFxyXG4gICAgOTc6IDM3Mjk2LFxyXG4gICAgMTAxOiA4MTE0NjguOCxcclxuICAgIDEwMzogMjcwNTcuNixcclxuICAgIDEwNDogMTc3NDgwLFxyXG4gICAgMTA1OiA4NCxcclxuICAgIDEwNjogMTkyLFxyXG4gICAgMTA3OiA3MixcclxuICAgIDEwODogMC4wMDAwMDAxNixcclxuICAgIDEwOTogbnVsbCxcclxuICAgIDExMDogMC4wMDAwMDAxNixcclxuICAgIDExMTogbnVsbCxcclxuICAgIDExMjogbnVsbFxyXG4gIH0sXHJcbiAgNjk6IHtcclxuICAgIDc1OiAwLjAwMDAwMTksXHJcbiAgICA3NjogMC4wMDAwMDMxNyxcclxuICAgIDc3OiAwLjA2OCxcclxuICAgIDc4OiAwLjU4LFxyXG4gICAgNzk6IDAuNyxcclxuICAgIDgwOiAwLjksXHJcbiAgICA4MTogMi4yLFxyXG4gICAgODI6IDQuMTcsXHJcbiAgICA4MzogOCxcclxuICAgIDg0OiAxLjQ4LFxyXG4gICAgODU6IDguMSxcclxuICAgIDg2OiAyMS42LFxyXG4gICAgODc6IDgzLjgsXHJcbiAgICA4ODogMjE3LjgsXHJcbiAgICA4OTogMjM4LjgsXHJcbiAgICA5MDogNTQ3LjgsXHJcbiAgICA5MTogNTY0LFxyXG4gICAgOTI6IDE4MTIsXHJcbiAgICA5MzogMTMwMixcclxuICAgIDk0OiA2NTE2LFxyXG4gICAgOTU6IDExNyxcclxuICAgIDk2OiAxMDgyMTYsXHJcbiAgICA5NzogMjc3MjAsXHJcbiAgICA5ODogNzk5MjAwLFxyXG4gICAgOTk6IDgwNDM4NDAsXHJcbiAgICAxMDE6IDExMTExMDQwLFxyXG4gICAgMTAyOiA2MDU4OTI5Ny44NyxcclxuICAgIDEwMzogMjI4OTYwLFxyXG4gICAgMTA0OiAyOTY2NCxcclxuICAgIDEwNTogMzI0LFxyXG4gICAgMTA2OiA5MTIsXHJcbiAgICAxMDc6IDExNCxcclxuICAgIDEwODogOTUsXHJcbiAgICAxMDk6IDAuMDAwMDAwMyxcclxuICAgIDExMDogMC4wMDAwMDAxNixcclxuICAgIDExMTogMC4wMDAwMDAzLFxyXG4gICAgMTEyOiAwLjAwMDAwMDE2XHJcbiAgfSxcclxuICA3MDoge1xyXG4gICAgNzk6IDAuNyxcclxuICAgIDgwOiAwLjAwMDAwMDIsXHJcbiAgICA4MTogMS42LFxyXG4gICAgODI6IDMuMDMsXHJcbiAgICA4MzogNC4yLFxyXG4gICAgODQ6IDAuNDA5LFxyXG4gICAgODU6IDEuNzkzLFxyXG4gICAgODY6IDI2LjEsXHJcbiAgICA4NzogMzguNixcclxuICAgIDg4OiA4OS40LFxyXG4gICAgODk6IDEwMC4yLFxyXG4gICAgOTA6IDI4OCxcclxuICAgIDkxOiAyNTIsXHJcbiAgICA5MjogMTEzMi4yLFxyXG4gICAgOTM6IDY2MyxcclxuICAgIDk0OiA0NTQ4LFxyXG4gICAgOTU6IDU5NCxcclxuICAgIDk2OiAyMDQxMjAsXHJcbiAgICA5NzogMTA1MCxcclxuICAgIDk5OiAyNzY2MzU1LjIsXHJcbiAgICAxMDU6IDM2MTU4NCxcclxuICAgIDEwNzogNjg3OS42LFxyXG4gICAgMTA4OiA0NDQwLFxyXG4gICAgMTA5OiA0ODAsXHJcbiAgICAxMTA6IDE0NCxcclxuICAgIDExMTogMC4wMDAwMDAxNixcclxuICAgIDExMjogMC4wMDAwMDAxNixcclxuICAgIDExMzogMC4wMDAwMDAyMjIsXHJcbiAgICAxMTQ6IDAuMDAwMDAwMTYsXHJcbiAgICAxMTU6IDAuMDAwMDAwMTZcclxuICB9LFxyXG4gIDcxOiB7XHJcbiAgICA3OTogMC4wNDUsXHJcbiAgICA4MDogMC4wODA2LFxyXG4gICAgODE6IDAuNyxcclxuICAgIDgyOiAwLjksXHJcbiAgICA4MzogbnVsbCxcclxuICAgIDg0OiAwLjA2OCxcclxuICAgIDg1OiAwLjQ5NCxcclxuICAgIDg2OiA2LjgsXHJcbiAgICA4NzogMTAuNixcclxuICAgIDg4OiAxMi4xLFxyXG4gICAgODk6IDM2LjEsXHJcbiAgICA5MDogNzcsXHJcbiAgICA5MTogODIuMixcclxuICAgIDkyOiAyMzguMixcclxuICAgIDkzOiAxODguNCxcclxuICAgIDk0OiA2NDQuNCxcclxuICAgIDk1OiAxNTksXHJcbiAgICA5NjogMzA5MCxcclxuICAgIDk3OiAzMzAsXHJcbiAgICA5ODogMTIyNjE2LFxyXG4gICAgOTk6IDE3MzgzNi44LFxyXG4gICAgMTAwOiA3MTI1NDAuOCxcclxuICAgIDEwMTogNTc4ODgwLFxyXG4gICAgMTAyOiA0MzIzMjk4OC41OSxcclxuICAgIDEwMzogMTA0NDUzNDI1LFxyXG4gICAgMTA1OiAxLjE4NjU0RSsxOCxcclxuICAgIDEwNjogNTc0MDY3LjUyLFxyXG4gICAgMTA3OiAxNzA0LFxyXG4gICAgMTA4OiAxNjUyNCxcclxuICAgIDEwOTogMzQyLFxyXG4gICAgMTEwOiAyMTAsXHJcbiAgICAxMTE6IDEyMCxcclxuICAgIDExMjogNTgsXHJcbiAgICAxMTM6IDE5LFxyXG4gICAgMTE0OiAwLjAwMDAwMDE2LFxyXG4gICAgMTE1OiAwLjAwMDAwMDE2LFxyXG4gICAgMTE2OiAwLjAwMDAwMDE2LFxyXG4gICAgMTE3OiBudWxsXHJcbiAgfSxcclxuICA3Mjoge1xyXG4gICAgNzk6IG51bGwsXHJcbiAgICA4MTogbnVsbCxcclxuICAgIDgyOiAyLFxyXG4gICAgODM6IDAuODQzLFxyXG4gICAgODQ6IDAuMDIzLFxyXG4gICAgODU6IDAuMTE1LFxyXG4gICAgODY6IDIuODUsXHJcbiAgICA4NzogNS42LFxyXG4gICAgODg6IDEzLjYsXHJcbiAgICA4OTogMTguNCxcclxuICAgIDkwOiAzOS40LFxyXG4gICAgOTE6IDQwLFxyXG4gICAgOTI6IDExMSxcclxuICAgIDkzOiA3NixcclxuICAgIDk0OiA0MDYuMixcclxuICAgIDk1OiAxMjMsXHJcbiAgICA5NjogMTU1NyxcclxuICAgIDk3OiAxOTQuNCxcclxuICAgIDk4OiA1NzYzNixcclxuICAgIDk5OiA0MzU2MCxcclxuICAgIDEwMDogNTkwMTE0NTEuNTcsXHJcbiAgICAxMDE6IDg0OTYwLFxyXG4gICAgMTAyOiA2LjMxMTM5RSsyMixcclxuICAgIDEwMzogNjA0ODAwMCxcclxuICAgIDEwOTogMzY2MjQ5NixcclxuICAgIDExMDogMi44MDg1N0UrMTQsXHJcbiAgICAxMTE6IDM2NjQuOCxcclxuICAgIDExMjogMTQ4MzIsXHJcbiAgICAxMTM6IDIxMCxcclxuICAgIDExNDogMTU2LFxyXG4gICAgMTE1OiBudWxsLFxyXG4gICAgMTE2OiBudWxsLFxyXG4gICAgMTE3OiBudWxsLFxyXG4gICAgMTE4OiBudWxsXHJcbiAgfSxcclxuICA3Mzoge1xyXG4gICAgODI6IDAuMDAyOSxcclxuICAgIDgzOiAwLjEwNixcclxuICAgIDg0OiAwLjAxMDEsXHJcbiAgICA4NTogMC4wNTUsXHJcbiAgICA4NjogMC44MyxcclxuICAgIDg3OiAxLjU1LFxyXG4gICAgODg6IG51bGwsXHJcbiAgICA4OTogMy41NyxcclxuICAgIDkwOiAxMC42LFxyXG4gICAgOTE6IDE0LjIsXHJcbiAgICA5MjogMzEsXHJcbiAgICA5MzogMzQuNCxcclxuICAgIDk0OiA4MCxcclxuICAgIDk1OiAxMjAsXHJcbiAgICA5NjogMjk0LFxyXG4gICAgOTc6IDQwNS42LFxyXG4gICAgOTg6IDEzOTgsXHJcbiAgICA5OTogMjIwOCxcclxuICAgIDEwMDogMTEzMDQsXHJcbiAgICAxMDE6IDQxMDQsXHJcbiAgICAxMDI6IDM3ODAwLFxyXG4gICAgMTAzOiAyOTEyNCxcclxuICAgIDEwNDogMjAyODk2LFxyXG4gICAgMTA1OiA4NDk2LFxyXG4gICAgMTA2OiA1NzQzMzYwNS4yNyxcclxuICAgIDEwNzogMjkzNTQuNCxcclxuICAgIDEwOTogOTkxMzUzNixcclxuICAgIDExMDogNDQwNjQwLFxyXG4gICAgMTExOiAzMTMyMCxcclxuICAgIDExMjogMjk2NCxcclxuICAgIDExMzogNjMwLFxyXG4gICAgMTE0OiBudWxsLFxyXG4gICAgMTE1OiAxOS42LFxyXG4gICAgMTE2OiBudWxsLFxyXG4gICAgMTE3OiA1LjMsXHJcbiAgICAxMTg6IDAuMDAwMDAwMyxcclxuICAgIDExOTogMi4yLFxyXG4gICAgMTIwOiBudWxsLFxyXG4gICAgMTIxOiBudWxsXHJcbiAgfSxcclxuICA3NDoge1xyXG4gICAgODM6IDAuMjc1LFxyXG4gICAgODQ6IDAuMDAxMjUsXHJcbiAgICA4NTogMC4wMDczLFxyXG4gICAgODY6IDAuMDkxLFxyXG4gICAgODc6IDAuNDA5LFxyXG4gICAgODg6IDEuMTksXHJcbiAgICA4OTogMi42NyxcclxuICAgIDkwOiA2LjMsXHJcbiAgICA5MTogNS4xLFxyXG4gICAgOTI6IDE5LjIsXHJcbiAgICA5MzogMTkuOSxcclxuICAgIDk0OiA1MC45LFxyXG4gICAgOTU6IDc0LFxyXG4gICAgOTY6IDE0NS4yLFxyXG4gICAgOTc6IDE0Mi44LFxyXG4gICAgOTg6IDM5NixcclxuICAgIDk5OiA0NTYsXHJcbiAgICAxMDA6IDE5OTIsXHJcbiAgICAxMDE6IDIxMTIsXHJcbiAgICAxMDI6IDkwMDAsXHJcbiAgICAxMDM6IDc5NDQsXHJcbiAgICAxMDQ6IDE4NjYyNDAsXHJcbiAgICAxMDU6IDIyMjMsXHJcbiAgICAxMDY6IDUuNjgwMjVFKzI1LFxyXG4gICAgMTA3OiAxMDQ3MTY4MCxcclxuICAgIDEwOTogMi4xMTQzMUUrMjgsXHJcbiAgICAxMTE6IDY0ODg2NDAsXHJcbiAgICAxMTM6IDg2NDAwLFxyXG4gICAgMTE0OiA2MDI4OTkyLFxyXG4gICAgMTE1OiA2OTYsXHJcbiAgICAxMTY6IDE4MDAsXHJcbiAgICAxMTg6IG51bGwsXHJcbiAgICAxMTk6IG51bGwsXHJcbiAgICAxMjA6IG51bGwsXHJcbiAgICAxMjE6IDAuMDAwMDAwMTYsXHJcbiAgICAxMjI6IDAuMDAwMDAwMTYsXHJcbiAgICAxMjM6IDAuMDAwMDAwMTZcclxuICB9LFxyXG4gIDc1OiB7XHJcbiAgICA4NDogbnVsbCxcclxuICAgIDg1OiAwLjAwMDYxMixcclxuICAgIDg2OiAwLjAwMDQ0LFxyXG4gICAgODc6IDAuMTA3LFxyXG4gICAgODg6IDAuMzksXHJcbiAgICA4OTogMC43LFxyXG4gICAgOTA6IDEuNixcclxuICAgIDkxOiAyLjI1LFxyXG4gICAgOTI6IDUuOSxcclxuICAgIDkzOiA0LjQsXHJcbiAgICA5NDogOC4xLFxyXG4gICAgOTU6IDkuMixcclxuICAgIDk2OiAxNS4yLFxyXG4gICAgOTc6IDE1LFxyXG4gICAgOTg6IDExOC44LFxyXG4gICAgOTk6IDE0NCxcclxuICAgIDEwMDogMzUzLjQsXHJcbiAgICAxMDE6IDMxOCxcclxuICAgIDEwMjogODQwLFxyXG4gICAgMTAzOiA3OTIsXHJcbiAgICAxMDQ6IDExNzAsXHJcbiAgICAxMDU6IDE0Ny42LFxyXG4gICAgMTA2OiA3MTY0MCxcclxuICAgIDEwNzogMjMxMTIwLFxyXG4gICAgMTA4OiA2MDQ4MDAwLFxyXG4gICAgMTA5OiAzMDU4NTYwLFxyXG4gICAgMTExOiAzMjEyNjEuMTIsXHJcbiAgICAxMTI6IDEuMzY2NDFFKzE4LFxyXG4gICAgMTEzOiA2MTIxOCxcclxuICAgIDExNDogODc0ODAsXHJcbiAgICAxMTU6IDE4MCxcclxuICAgIDExNjogNTg4LFxyXG4gICAgMTE3OiAxNixcclxuICAgIDExODogbnVsbCxcclxuICAgIDExOTogNSxcclxuICAgIDEyMDogNixcclxuICAgIDEyMTogMyxcclxuICAgIDEyMjogMC4wMDAwMDAxNixcclxuICAgIDEyMzogMC4wMDAwMDAxNixcclxuICAgIDEyNDogMC4wMDAwMDAxNlxyXG4gIH0sXHJcbiAgNzY6IHtcclxuICAgIDg1OiAwLjAwMDY0LFxyXG4gICAgODY6IDAuMDAyMSxcclxuICAgIDg3OiAwLjAwNTUsXHJcbiAgICA4ODogMC4wMjEsXHJcbiAgICA4OTogMC4wNzEsXHJcbiAgICA5MDogMC4yMTMsXHJcbiAgICA5MTogMC44MSxcclxuICAgIDkyOiAyLjEsXHJcbiAgICA5MzogMy40MyxcclxuICAgIDk0OiA3LjM3LFxyXG4gICAgOTU6IDguMyxcclxuICAgIDk2OiAxOS4yLFxyXG4gICAgOTc6IDIyLjQsXHJcbiAgICA5ODogNDQsXHJcbiAgICA5OTogODQsXHJcbiAgICAxMDA6IDIxNixcclxuICAgIDEwMTogMTgwLFxyXG4gICAgMTAyOiAzMDAsXHJcbiAgICAxMDM6IDM5MCxcclxuICAgIDEwNDogMTI5MCxcclxuICAgIDEwNTogNjMwMCxcclxuICAgIDEwNjogNzg2MjQsXHJcbiAgICAxMDc6IDQ2ODAwLFxyXG4gICAgMTA4OiAxLjc2NzE5RSsyMSxcclxuICAgIDEwOTogODA4NzA0MCxcclxuICAgIDExMDogNi4zMTEzOUUrMjIsXHJcbiAgICAxMTU6IDEzMzA1NjAsXHJcbiAgICAxMTc6IDEwNzM4OCxcclxuICAgIDExODogMTg5MzQxNTU1LjgsXHJcbiAgICAxMTk6IDM5MCxcclxuICAgIDEyMDogMjA5NCxcclxuICAgIDEyMTogMTY4LFxyXG4gICAgMTIyOiBudWxsLFxyXG4gICAgMTIzOiA1LFxyXG4gICAgMTI0OiA2LFxyXG4gICAgMTI1OiAwLjAwMDAwMDE2LFxyXG4gICAgMTI2OiAwLjAwMDAwMDE2LFxyXG4gICAgMTI3OiBudWxsXHJcbiAgfSxcclxuICA3Nzoge1xyXG4gICAgODc6IG51bGwsXHJcbiAgICA4ODogMC4wMDAwMDEsXHJcbiAgICA4OTogMC4wMTA1LFxyXG4gICAgOTA6IDAuMDM1MixcclxuICAgIDkxOiAwLjIyMixcclxuICAgIDkyOiAwLjM1MyxcclxuICAgIDkzOiAwLjg3LFxyXG4gICAgOTQ6IDMuMixcclxuICAgIDk1OiA0LjQsXHJcbiAgICA5NjogOSxcclxuICAgIDk3OiA3LjksXHJcbiAgICA5ODogOSxcclxuICAgIDk5OiA4LjcsXHJcbiAgICAxMDA6IDI5LjgsXHJcbiAgICAxMDE6IDEyLFxyXG4gICAgMTAyOiA3OSxcclxuICAgIDEwMzogOTAsXHJcbiAgICAxMDQ6IDI5NCxcclxuICAgIDEwNTogOTAwLFxyXG4gICAgMTA2OiAzNDgwLFxyXG4gICAgMTA3OiAxMTEyNCxcclxuICAgIDEwODogNTE4NDAsXHJcbiAgICAxMDk6IDU5OTA0LFxyXG4gICAgMTEwOiAzNzgwMCxcclxuICAgIDExMTogMTQ5NDAwLFxyXG4gICAgMTEyOiAxMTQwNDgwLFxyXG4gICAgMTEzOiAxMDE3NzkyLFxyXG4gICAgMTE1OiA2Mzc4ODI1LjYsXHJcbiAgICAxMTc6IDY5MDQ4LFxyXG4gICAgMTE4OiA4MjQ0LFxyXG4gICAgMTE5OiA1MixcclxuICAgIDEyMDogMzQ4LFxyXG4gICAgMTIxOiA4LFxyXG4gICAgMTIyOiA2LFxyXG4gICAgMTIzOiAwLjAwMDAwMDMsXHJcbiAgICAxMjQ6IDAuMDAwMDAwMyxcclxuICAgIDEyNTogMTEsXHJcbiAgICAxMjY6IG51bGwsXHJcbiAgICAxMjc6IDAuMDAwMDAwMTYsXHJcbiAgICAxMjg6IG51bGxcclxuICB9LFxyXG4gIDc4OiB7XHJcbiAgICA4NzogMC4wMDAyNixcclxuICAgIDg4OiAwLjAwMDMsXHJcbiAgICA4OTogMC4wMDA3LFxyXG4gICAgOTA6IDAuMDAyMDIsXHJcbiAgICA5MTogMC4wMDcsXHJcbiAgICA5MjogMC4wMTM4LFxyXG4gICAgOTM6IDAuMDQ1NSxcclxuICAgIDk0OiAwLjA5NzYsXHJcbiAgICA5NTogMC4zODIsXHJcbiAgICA5NjogMC44ODksXHJcbiAgICA5NzogMi41MyxcclxuICAgIDk4OiA2LjMzLFxyXG4gICAgOTk6IDEwLFxyXG4gICAgMTAwOiAyMC43LFxyXG4gICAgMTAxOiAyMS4yLFxyXG4gICAgMTAyOiA1NixcclxuICAgIDEwMzogNTIsXHJcbiAgICAxMDQ6IDE2MC4yLFxyXG4gICAgMTA1OiAzOTAsXHJcbiAgICAxMDY6IDEwMzgsXHJcbiAgICAxMDc6IDQyNTQsXHJcbiAgICAxMDg6IDc0ODgsXHJcbiAgICAxMDk6IDg0NjAsXHJcbiAgICAxMTA6IDg3NzgyNCxcclxuICAgIDExMTogMzkxMzIsXHJcbiAgICAxMTI6IDEuNTY4MzhFKzE5LFxyXG4gICAgMTEzOiAyNDQ1MTIsXHJcbiAgICAxMTU6IDE1Nzc4NDYyOTksXHJcbiAgICAxMTk6IDcxNjA5LjQsXHJcbiAgICAxMjE6IDE4NDgsXHJcbiAgICAxMjI6IDQ1MzYwLFxyXG4gICAgMTIzOiAxNTAsXHJcbiAgICAxMjQ6IDE1ODQwMCxcclxuICAgIDEyNTogMjIsXHJcbiAgICAxMjY6IDEwLjMsXHJcbiAgICAxMjc6IG51bGwsXHJcbiAgICAxMjg6IDAuMDAwMDAwMTYsXHJcbiAgICAxMjk6IDAuMDAwMDAwMTYsXHJcbiAgICAxMzA6IDAuMDAwMDAwMTZcclxuICB9LFxyXG4gIDc5OiB7XHJcbiAgICA5MTogMC4wMDAyOSxcclxuICAgIDkyOiAwLjAwMDAyMixcclxuICAgIDkzOiAwLjAyMixcclxuICAgIDk0OiAwLjAyNjMsXHJcbiAgICA5NTogMC4xMixcclxuICAgIDk2OiBudWxsLFxyXG4gICAgOTc6IG51bGwsXHJcbiAgICA5ODogMS41MDEsXHJcbiAgICA5OTogMi42LFxyXG4gICAgMTAwOiA3LjEsXHJcbiAgICAxMDE6IDguNCxcclxuICAgIDEwMjogMTMuNyxcclxuICAgIDEwMzogMTUuNSxcclxuICAgIDEwNDogNDIuOCxcclxuICAgIDEwNTogMjAuNixcclxuICAgIDEwNjogMjU1LFxyXG4gICAgMTA3OiA2NDIsXHJcbiAgICAxMDg6IDQ5OCxcclxuICAgIDEwOTogNTMwLjQsXHJcbiAgICAxMTA6IDE3MjIsXHJcbiAgICAxMTE6IDI1NjgsXHJcbiAgICAxMTI6IDExNDQ4LFxyXG4gICAgMTEzOiAxNzc4NCxcclxuICAgIDExNDogNjM1NDAsXHJcbiAgICAxMTU6IDEzNjg3MixcclxuICAgIDExNjogMTYwNzEyNjQsXHJcbiAgICAxMTc6IDUzMjgyMC4xNixcclxuICAgIDExOTogMjMyNzcwLjI0LFxyXG4gICAgMTIwOiAyNzEyMDkuNixcclxuICAgIDEyMTogMjkwNCxcclxuICAgIDEyMjogMTU2MCxcclxuICAgIDEyMzogMjguNCxcclxuICAgIDEyNDogNjAsXHJcbiAgICAxMjU6IDM5LjgsXHJcbiAgICAxMjY6IDMyLFxyXG4gICAgMTI3OiA0MCxcclxuICAgIDEyODogMC4wMDAwMDAzLFxyXG4gICAgMTI5OiAwLjAwMDAwMDMsXHJcbiAgICAxMzA6IDAuMDAwMDAwMyxcclxuICAgIDEzMTogMC4wMDAwMDAzXHJcbiAgfSxcclxuICA4MDoge1xyXG4gICAgOTA6IDAuMDAwMDgsXHJcbiAgICA5MTogMC4wMDAwNTksXHJcbiAgICA5MjogMC4wMDAyMzEsXHJcbiAgICA5MzogMC4wMDA4LFxyXG4gICAgOTQ6IDAuMDAyMSxcclxuICAgIDk1OiAwLjAxMDYsXHJcbiAgICA5NjogMC4wMjAzLFxyXG4gICAgOTc6IDAuMTE3LFxyXG4gICAgOTg6IDAuMjY2NSxcclxuICAgIDk5OiAxLjA1LFxyXG4gICAgMTAwOiAyLjU5LFxyXG4gICAgMTAxOiAzLjYsXHJcbiAgICAxMDI6IDEwLjgzLFxyXG4gICAgMTAzOiA5LjQsXHJcbiAgICAxMDQ6IDMwLjg3LFxyXG4gICAgMTA1OiA0OS4xLFxyXG4gICAgMTA2OiA4Mi44LFxyXG4gICAgMTA3OiAxMTQsXHJcbiAgICAxMDg6IDE5NSxcclxuICAgIDEwOTogNDU2LFxyXG4gICAgMTEwOiAxMjAwLFxyXG4gICAgMTExOiAyOTQwLFxyXG4gICAgMTEyOiAxNzQ2MCxcclxuICAgIDExMzogMTM2ODAsXHJcbiAgICAxMTQ6IDE0MTA1OTQ1OTExLFxyXG4gICAgMTE1OiAzNzkwOCxcclxuICAgIDExNzogMjMwOTA0LFxyXG4gICAgMTIzOiA0MDI3MTA0LFxyXG4gICAgMTI1OiAzMDguNCxcclxuICAgIDEyNjogNDk5LjIsXHJcbiAgICAxMjc6IDE3NCxcclxuICAgIDEyODogMjQ2MCxcclxuICAgIDEyOTogMzYsXHJcbiAgICAxMzA6IG51bGwsXHJcbiAgICAxMzE6IDAuMDAwMDAwMyxcclxuICAgIDEzMjogbnVsbCxcclxuICAgIDEzMzogMC4wMDAwMDAzLFxyXG4gICAgMTM0OiBudWxsLFxyXG4gICAgMTM1OiAwLjAwMDAwMDMsXHJcbiAgICAxMzY6IDAuMDAwMDAwM1xyXG4gIH0sXHJcbiAgODE6IHtcclxuICAgIDk1OiAwLjAwNTIsXHJcbiAgICA5NjogMC4wMTgsXHJcbiAgICA5NzogMC4yNTQsXHJcbiAgICA5ODogMC4yMyxcclxuICAgIDk5OiAxLjA5LFxyXG4gICAgMTAwOiAzLjIsXHJcbiAgICAxMDE6IDMuMSxcclxuICAgIDEwMjogNi45LFxyXG4gICAgMTAzOiAxMC4xLFxyXG4gICAgMTA0OiAxOS41LFxyXG4gICAgMTA1OiAyNy41LFxyXG4gICAgMTA2OiA1MSxcclxuICAgIDEwNzogNzEsXHJcbiAgICAxMDg6IDEzOCxcclxuICAgIDEwOTogMTU2LFxyXG4gICAgMTEwOiBudWxsLFxyXG4gICAgMTExOiA1NzYsXHJcbiAgICAxMTI6IDEyOTYsXHJcbiAgICAxMTM6IDE5ODAsXHJcbiAgICAxMTQ6IDQxNzYsXHJcbiAgICAxMTU6IDY2MjQsXHJcbiAgICAxMTY6IDEwMjI0LFxyXG4gICAgMTE3OiAxOTA4MCxcclxuICAgIDExODogMjY3MTIsXHJcbiAgICAxMTk6IDkzOTYwLFxyXG4gICAgMTIwOiAyNjI4MzcuNDQsXHJcbiAgICAxMjE6IDEwNjM1ODQsXHJcbiAgICAxMjM6IDExOTM3OTg1MSxcclxuICAgIDEyNTogMjUyLjEyLFxyXG4gICAgMTI2OiAyODYuMixcclxuICAgIDEyNzogMTgzLjE4LFxyXG4gICAgMTI4OiAxMjkuNzIsXHJcbiAgICAxMjk6IDc4LFxyXG4gICAgMTMwOiA4OCxcclxuICAgIDEzMTogMzAuOSxcclxuICAgIDEzMjogNDYsXHJcbiAgICAxMzM6IDExLFxyXG4gICAgMTM0OiAwLjAwMDAwMDMsXHJcbiAgICAxMzU6IDAuMDAwMDAwMyxcclxuICAgIDEzNjogbnVsbFxyXG4gIH0sXHJcbiAgODI6IHtcclxuICAgIDk2OiAwLjAwMDEyLFxyXG4gICAgOTc6IDAuMDAzNSxcclxuICAgIDk4OiAwLjAwNDEsXHJcbiAgICA5OTogMC4wNDUsXHJcbiAgICAxMDA6IDAuMDU1LFxyXG4gICAgMTAxOiAwLjUzNSxcclxuICAgIDEwMjogMC40OSxcclxuICAgIDEwMzogNi4zLFxyXG4gICAgMTA0OiA0LjgyLFxyXG4gICAgMTA1OiAxNS4yLFxyXG4gICAgMTA2OiAyNS41LFxyXG4gICAgMTA3OiAzOSxcclxuICAgIDEwODogNzEsXHJcbiAgICAxMDk6IDc5LjgsXHJcbiAgICAxMTA6IDIxMCxcclxuICAgIDExMTogbnVsbCxcclxuICAgIDExMjogNjQyLFxyXG4gICAgMTEzOiA5MDAsXHJcbiAgICAxMTQ6IDIyMjAsXHJcbiAgICAxMTU6IDQ4NixcclxuICAgIDExNjogODY0MCxcclxuICAgIDExNzogNTQwMCxcclxuICAgIDExODogNzc0MDAsXHJcbiAgICAxMTk6IDMzNTg4LFxyXG4gICAgMTIwOiAxLjY1Njc0RSsxMixcclxuICAgIDEyMTogMTg2OTEyLFxyXG4gICAgMTIyOiA0LjQxNzk3RSsyNCxcclxuICAgIDEyMzogNS4zNjQ2OEUrMTQsXHJcbiAgICAxMjc6IDExNjQyLjQsXHJcbiAgICAxMjg6IDcwMDU2Mzc1Ni42LFxyXG4gICAgMTI5OiAyMTY2LFxyXG4gICAgMTMwOiAzODIzOS4yLFxyXG4gICAgMTMxOiA2MTIsXHJcbiAgICAxMzI6IDE2MjMuNixcclxuICAgIDEzMzogMTQ3LFxyXG4gICAgMTM0OiAwLjAwMDAwMDMsXHJcbiAgICAxMzU6IDE5LjksXHJcbiAgICAxMzY6IDE1LFxyXG4gICAgMTM3OiBudWxsLFxyXG4gICAgMTM4OiAwLjAwMDAwMDNcclxuICB9LFxyXG4gIDgzOiB7XHJcbiAgICAxMDE6IDAuMDEzLFxyXG4gICAgMTAyOiAwLjAwMDA1OCxcclxuICAgIDEwMzogMC4wMTUsXHJcbiAgICAxMDQ6IDAuMDM3LFxyXG4gICAgMTA1OiAwLjA2LFxyXG4gICAgMTA2OiAwLjY4OCxcclxuICAgIDEwNzogNi4zLFxyXG4gICAgMTA4OiAxMi40LFxyXG4gICAgMTA5OiAzNC42LFxyXG4gICAgMTEwOiA2My42LFxyXG4gICAgMTExOiA5NSxcclxuICAgIDExMjogMTgzLFxyXG4gICAgMTEzOiAzMDgsXHJcbiAgICAxMTQ6IDU1OS44LFxyXG4gICAgMTE1OiA2MTgsXHJcbiAgICAxMTY6IDE2MjAsXHJcbiAgICAxMTc6IDIxODQsXHJcbiAgICAxMTg6IDYxODAsXHJcbiAgICAxMTk6IDYxNTYsXHJcbiAgICAxMjA6IDQyMzM2LFxyXG4gICAgMTIxOiA0MDM5MixcclxuICAgIDEyMjogMTI4ODIyNCxcclxuICAgIDEyMzogNTM5Mzk1LjIsXHJcbiAgICAxMjQ6IDk5NTYyMTAxNC41LFxyXG4gICAgMTI1OiAxLjE2MTI5RSsxMyxcclxuICAgIDEyNjogNi4zNDI5NEUrMjYsXHJcbiAgICAxMjc6IDQzMzAzNi44LFxyXG4gICAgMTI4OiAxMjguNCxcclxuICAgIDEyOTogMzYzMyxcclxuICAgIDEzMDogMjczNS40LFxyXG4gICAgMTMxOiAxMTgyLjYsXHJcbiAgICAxMzI6IDQ1NixcclxuICAgIDEzMzogMTM1LFxyXG4gICAgMTM0OiA5OC41LFxyXG4gICAgMTM1OiAzMyxcclxuICAgIDEzNjogMjIsXHJcbiAgICAxMzc6IDAuMDAwMDAwMyxcclxuICAgIDEzODogMC4wMDAwMDAzLFxyXG4gICAgMTM5OiAwLjAwMDAwMDMsXHJcbiAgICAxNDA6IDAuMDAwMDAwMyxcclxuICAgIDE0MTogMC4wMDAwMDAzXHJcbiAgfSxcclxuICA4NDoge1xyXG4gICAgMTAyOiAwLjAwMDAyOCxcclxuICAgIDEwMzogMC4wMDE0LFxyXG4gICAgMTA0OiAwLjAwMDI3LFxyXG4gICAgMTA1OiAwLjAwMzUsXHJcbiAgICAxMDY6IDAuMDAyNDUsXHJcbiAgICAxMDc6IDAuMDIyLFxyXG4gICAgMTA4OiAwLjAzMjIsXHJcbiAgICAxMDk6IDAuMzk5LFxyXG4gICAgMTEwOiAwLjM5MixcclxuICAgIDExMTogNC42NCxcclxuICAgIDExMjogNS44LFxyXG4gICAgMTEzOiA4NCxcclxuICAgIDExNDogMTA1LjYsXHJcbiAgICAxMTU6IDMyOC4yLFxyXG4gICAgMTE2OiA2OTAuNixcclxuICAgIDExNzogOTM2LFxyXG4gICAgMTE4OiAyNjc2LFxyXG4gICAgMTE5OiAyMjAyLFxyXG4gICAgMTIwOiAxMjY2OC40LFxyXG4gICAgMTIxOiA2MjY0LFxyXG4gICAgMTIyOiA3NjAzMjAsXHJcbiAgICAxMjM6IDIwODgwLFxyXG4gICAgMTI0OiA5MTQ1MTk3MS40NyxcclxuICAgIDEyNTogMzkxMzA1ODgyMSxcclxuICAgIDEyNjogMTE5NTU2ODYuNCxcclxuICAgIDEyNzogMC41MTYsXHJcbiAgICAxMjg6IDIuOTQzRS0wNyxcclxuICAgIDEyOTogMC4wMDAwMDM3MixcclxuICAgIDEzMDogMC4wMDAxNjM0NixcclxuICAgIDEzMTogMC4wMDE3ODEsXHJcbiAgICAxMzI6IDAuMTQ1LFxyXG4gICAgMTMzOiAxLjUzLFxyXG4gICAgMTM0OiAxODUuODIsXHJcbiAgICAxMzU6IDYyMCxcclxuICAgIDEzNjogMC4wMDAwMDAzLFxyXG4gICAgMTM3OiAxMTIsXHJcbiAgICAxMzg6IDU1MCxcclxuICAgIDEzOTogMC4wMDAwMDAzLFxyXG4gICAgMTQwOiAwLjAwMDAwMDMsXHJcbiAgICAxNDE6IDAuMDAwMDAwMyxcclxuICAgIDE0MjogMC4wMDAwMDAzLFxyXG4gICAgMTQzOiAwLjAwMDAwMDNcclxuICB9LFxyXG4gIDg1OiB7XHJcbiAgICAxMDY6IDAuMDAxNyxcclxuICAgIDEwNzogMC4wODgsXHJcbiAgICAxMDg6IDAuMDI4LFxyXG4gICAgMTA5OiAwLjI4NixcclxuICAgIDExMDogMC4yOSxcclxuICAgIDExMTogMC4zODgsXHJcbiAgICAxMTI6IDAuMzg4LFxyXG4gICAgMTEzOiA0LjIsXHJcbiAgICAxMTQ6IDcuMDMsXHJcbiAgICAxMTU6IDQzLFxyXG4gICAgMTE2OiA4NS4yLFxyXG4gICAgMTE3OiAxODQsXHJcbiAgICAxMTg6IDQ0NCxcclxuICAgIDExOTogNTQ3LjIsXHJcbiAgICAxMjA6IDE2MTQsXHJcbiAgICAxMjE6IDE4MzYsXHJcbiAgICAxMjI6IDY1MTYsXHJcbiAgICAxMjM6IDU4NjgsXHJcbiAgICAxMjQ6IDE5NTEyLFxyXG4gICAgMTI1OiAyOTE2MCxcclxuICAgIDEyNjogMjU5NzAuNCxcclxuICAgIDEyNzogMC4zMTQsXHJcbiAgICAxMjg6IDAuMDAwMDAwMTI1LFxyXG4gICAgMTI5OiAwLjAwMDAwMDU1OCxcclxuICAgIDEzMDogMC4wMDAxLFxyXG4gICAgMTMxOiAwLjAwMDMsXHJcbiAgICAxMzI6IDAuMDMyNixcclxuICAgIDEzMzogMS4yOCxcclxuICAgIDEzNDogNTYsXHJcbiAgICAxMzU6IDIyMi42LFxyXG4gICAgMTM2OiAxMzgsXHJcbiAgICAxMzc6IDU0LFxyXG4gICAgMTM4OiA1MCxcclxuICAgIDEzOTogNzgsXHJcbiAgICAxNDA6IDAuMDAwMDAwMyxcclxuICAgIDE0MTogMC4wMDAwMDAzLFxyXG4gICAgMTQyOiAwLjAwMDAwMDMsXHJcbiAgICAxNDM6IDAuMDAwMDAwMyxcclxuICAgIDE0NDogMC4wMDAwMDAzXHJcbiAgfSxcclxuICA4Njoge1xyXG4gICAgMTA3OiAwLjAwMTE1LFxyXG4gICAgMTA4OiAwLjAwMDc4LFxyXG4gICAgMTA5OiAwLjAwNixcclxuICAgIDExMDogMC4wMDQ0LFxyXG4gICAgMTExOiAwLjA2NSxcclxuICAgIDExMjogMC4wNjUsXHJcbiAgICAxMTM6IDAuNTksXHJcbiAgICAxMTQ6IDEuMDMsXHJcbiAgICAxMTU6IDcsXHJcbiAgICAxMTY6IDkuNyxcclxuICAgIDExNzogNDQuMixcclxuICAgIDExODogNzQuNSxcclxuICAgIDExOTogMTcwLFxyXG4gICAgMTIwOiAzNDAuMixcclxuICAgIDEyMTogNTU1LFxyXG4gICAgMTIyOiAxNDYxLFxyXG4gICAgMTIzOiAxNzI4LFxyXG4gICAgMTI0OiA4NjQwLFxyXG4gICAgMTI1OiA1MjU2MCxcclxuICAgIDEyNjogMTQzNCxcclxuICAgIDEyNzogMC4wMTk1LFxyXG4gICAgMTI4OiAwLjAwMDAwMDI1OSxcclxuICAgIDEyOTogMC4wMDAwMDIzLFxyXG4gICAgMTMwOiAwLjAwMDA0NSxcclxuICAgIDEzMTogMC4wMDA1NCxcclxuICAgIDEzMjogMC4wMzM3NSxcclxuICAgIDEzMzogMy45NixcclxuICAgIDEzNDogNTUuNixcclxuICAgIDEzNTogMTUwMCxcclxuICAgIDEzNjogMzMwMzUwLjQsXHJcbiAgICAxMzc6IDE0NTgsXHJcbiAgICAxMzg6IDY0MjAsXHJcbiAgICAxMzk6IDI3OS42LFxyXG4gICAgMTQwOiA0NDQsXHJcbiAgICAxNDE6IDIwLjIsXHJcbiAgICAxNDI6IDY1LFxyXG4gICAgMTQzOiAxMlxyXG4gIH0sXHJcbiAgODc6IHtcclxuICAgIDExMDogMC4wMDA2LFxyXG4gICAgMTExOiAwLjAxNSxcclxuICAgIDExMjogMC4wMTIsXHJcbiAgICAxMTM6IDAuMDQ5LFxyXG4gICAgMTE0OiAwLjA2MixcclxuICAgIDExNTogMC4zLFxyXG4gICAgMTE2OiAwLjU1LFxyXG4gICAgMTE3OiAxLjgsXHJcbiAgICAxMTg6IDMuOSxcclxuICAgIDExOTogMTYsXHJcbiAgICAxMjA6IDE0LjgsXHJcbiAgICAxMjE6IDU5LjEsXHJcbiAgICAxMjI6IDUwLjUsXHJcbiAgICAxMjM6IDE5MC44LFxyXG4gICAgMTI0OiAxODYsXHJcbiAgICAxMjU6IDEyMDAsXHJcbiAgICAxMjY6IDM0LjgyLFxyXG4gICAgMTI3OiAwLjAwNTUsXHJcbiAgICAxMjg6IDAuMDAwMDAwMDg2LFxyXG4gICAgMTI5OiAwLjAwMDAwMDcsXHJcbiAgICAxMzA6IDAuMDAwMDIyLFxyXG4gICAgMTMxOiAwLjAwMTEsXHJcbiAgICAxMzI6IDAuMDI0LFxyXG4gICAgMTMzOiAyNy40LFxyXG4gICAgMTM0OiAyOTQsXHJcbiAgICAxMzU6IDg1MixcclxuICAgIDEzNjogMTMyMCxcclxuICAgIDEzNzogMTk5LjgsXHJcbiAgICAxMzg6IDIzNyxcclxuICAgIDEzOTogNDksXHJcbiAgICAxNDA6IDE0OC4yLFxyXG4gICAgMTQxOiAzOCxcclxuICAgIDE0MjogNTAuMixcclxuICAgIDE0MzogMTkuMSxcclxuICAgIDE0NDogMTcuNixcclxuICAgIDE0NTogNS41LFxyXG4gICAgMTQ2OiAwLjlcclxuICB9LFxyXG4gIDg4OiB7XHJcbiAgICAxMTM6IDAuMDAxNixcclxuICAgIDExNDogMC4wMTYsXHJcbiAgICAxMTU6IDAuMDMxLFxyXG4gICAgMTE2OiAwLjA1NyxcclxuICAgIDExNzogMC4yMSxcclxuICAgIDExODogMC4yNCxcclxuICAgIDExOTogMS4zNSxcclxuICAgIDEyMDogMS4zLFxyXG4gICAgMTIxOiA0LjgsXHJcbiAgICAxMjI6IDMuNyxcclxuICAgIDEyMzogMTMsXHJcbiAgICAxMjQ6IDEzLFxyXG4gICAgMTI1OiAxNjMuOCxcclxuICAgIDEyNjogMi40MzgsXHJcbiAgICAxMjc6IDAuMDAxNjYsXHJcbiAgICAxMjg6IDAuMDAwMDAwMTgyLFxyXG4gICAgMTI5OiAwLjAwMDAwMTYsXHJcbiAgICAxMzA6IDAuMDAwMDI1OTEsXHJcbiAgICAxMzE6IDAuMDA5LFxyXG4gICAgMTMyOiAwLjAxOCxcclxuICAgIDEzMzogMjgsXHJcbiAgICAxMzQ6IDM4LFxyXG4gICAgMTM1OiA5ODc1NTIsXHJcbiAgICAxMzY6IDMxMzc5Ni4xNixcclxuICAgIDEzNzogMTI4NzM2MCxcclxuICAgIDEzODogNTA0OTEwODE1NTksXHJcbiAgICAxMzk6IDI1MzIsXHJcbiAgICAxNDA6IDE4MTQ1MjMyNC40LFxyXG4gICAgMTQxOiAyNDAsXHJcbiAgICAxNDI6IDU1ODAsXHJcbiAgICAxNDM6IDEwNCxcclxuICAgIDE0NDogMjUyLFxyXG4gICAgMTQ1OiAzMCxcclxuICAgIDE0NjogMzBcclxuICB9LFxyXG4gIDg5OiB7XHJcbiAgICAxMTY6IDAuMDIsXHJcbiAgICAxMTc6IDAuMDIyLFxyXG4gICAgMTE4OiAwLjAyNyxcclxuICAgIDExOTogMC4wOTUsXHJcbiAgICAxMjA6IDAuMDg3LFxyXG4gICAgMTIxOiAwLjM1LFxyXG4gICAgMTIyOiAwLjIxLFxyXG4gICAgMTIzOiAwLjg4LFxyXG4gICAgMTI0OiAwLjczOCxcclxuICAgIDEyNTogOC4yLFxyXG4gICAgMTI2OiAwLjE3LFxyXG4gICAgMTI3OiAwLjAwMDQ0LFxyXG4gICAgMTI4OiAwLjAwMDAwMDA2OSxcclxuICAgIDEyOTogMC4wMDAwMDEwMyxcclxuICAgIDEzMDogMC4wMDAwMTE4LFxyXG4gICAgMTMxOiAwLjAyNjQsXHJcbiAgICAxMzI6IDAuMDUyLFxyXG4gICAgMTMzOiA1LFxyXG4gICAgMTM0OiAxMjYsXHJcbiAgICAxMzU6IDEwMDA4LFxyXG4gICAgMTM2OiA4NTcwODgsXHJcbiAgICAxMzc6IDEwNTczMixcclxuICAgIDEzODogNjg3MDU3MzkyLjMsXHJcbiAgICAxMzk6IDIyMTQwLFxyXG4gICAgMTQwOiAzNzYyLFxyXG4gICAgMTQxOiAxMjIsXHJcbiAgICAxNDI6IDQ1MCxcclxuICAgIDE0MzogMTE5LFxyXG4gICAgMTQ0OiAxNDMsXHJcbiAgICAxNDU6IDQ0LFxyXG4gICAgMTQ2OiA2MlxyXG4gIH0sXHJcbiAgOTA6IHtcclxuICAgIDExODogMC4wMDE3LFxyXG4gICAgMTE5OiAwLjAwMjUsXHJcbiAgICAxMjA6IDAuMDE2LFxyXG4gICAgMTIxOiAwLjAzNyxcclxuICAgIDEyMjogMC4wMzE3LFxyXG4gICAgMTIzOiAwLjE0NCxcclxuICAgIDEyNDogMC4wODcsXHJcbiAgICAxMjU6IDEuMixcclxuICAgIDEyNjogMC4wMjYsXHJcbiAgICAxMjc6IDAuMDAwMjUyLFxyXG4gICAgMTI4OiAwLjAwMDAwMDEyMixcclxuICAgIDEyOTogMC4wMDAwMDEwMjUsXHJcbiAgICAxMzA6IDAuMDAwMDA5NyxcclxuICAgIDEzMTogMC4wMDE3NCxcclxuICAgIDEzMjogMC4wMDIyNCxcclxuICAgIDEzMzogMC42LFxyXG4gICAgMTM0OiAxLjA0LFxyXG4gICAgMTM1OiA1MjUsXHJcbiAgICAxMzY6IDE4MzQuMixcclxuICAgIDEzNzogMTYxNTQyMC44LFxyXG4gICAgMTM4OiA2MDMyNDIxOS42OSxcclxuICAgIDEzOTogMi40ODY2OUUrMTEsXHJcbiAgICAxNDA6IDIuMzc5MzlFKzEyLFxyXG4gICAgMTQxOiA5MTg3MixcclxuICAgIDE0MjogNC40MTc5N0UrMTcsXHJcbiAgICAxNDM6IDEzMDkuOCxcclxuICAgIDE0NDogMjA4MjI0MCxcclxuICAgIDE0NTogNDMyLFxyXG4gICAgMTQ2OiAyMjM4XHJcbiAgfSxcclxuICA5MToge1xyXG4gICAgMTIwOiAwLjAwMDAwMDMsXHJcbiAgICAxMjE6IDAuMDA1MSxcclxuICAgIDEyMjogMC4wMDUzLFxyXG4gICAgMTIzOiAwLjAxNyxcclxuICAgIDEyNDogMC4wMTQsXHJcbiAgICAxMjU6IDAuMTUsXHJcbiAgICAxMjY6IDAuMDAzOCxcclxuICAgIDEyNzogMC4wMDAxMDksXHJcbiAgICAxMjg6IDAuMDAwMDAwMDU0LFxyXG4gICAgMTI5OiAwLjAwMDAwMDc4LFxyXG4gICAgMTMwOiAwLjAwMDAwNTksXHJcbiAgICAxMzE6IDAuMDAyOSxcclxuICAgIDEzMjogMC4wMDUxLFxyXG4gICAgMTMzOiAwLjg0NixcclxuICAgIDEzNDogMS43LFxyXG4gICAgMTM1OiAxMDgsXHJcbiAgICAxMzY6IDIyOTgsXHJcbiAgICAxMzc6IDc5MjAwLFxyXG4gICAgMTM4OiAxMjk2MDAsXHJcbiAgICAxMzk6IDE1MDMzNjAsXHJcbiAgICAxNDA6IDEuMDMzOEUrMTIsXHJcbiAgICAxNDE6IDExNDA0OCxcclxuICAgIDE0MjogMjMzMDY0MCxcclxuICAgIDE0MzogMjQxMjAsXHJcbiAgICAxNDQ6IDE0NjQsXHJcbiAgICAxNDU6IDU0NixcclxuICAgIDE0NjogNTIyXHJcbiAgfSxcclxuICA5Mjoge1xyXG4gICAgMTIyOiAwLjAwMDUyLFxyXG4gICAgMTIzOiAwLjAwMDcsXHJcbiAgICAxMjQ6IDAuMDA0NSxcclxuICAgIDEyNTogMC4wMTYsXHJcbiAgICAxMjY6IDAuMDAwNjUsXHJcbiAgICAxMjc6IDAuMDAwMDYsXHJcbiAgICAxMjk6IDAuMDAwMDAwNjYsXHJcbiAgICAxMzA6IDAuMDAwMDA0NyxcclxuICAgIDEzMTogMC4wMDAwMTgsXHJcbiAgICAxMzI6IDAuMDAwODQsXHJcbiAgICAxMzM6IDAuMDY5LFxyXG4gICAgMTM0OiAwLjI2OCxcclxuICAgIDEzNTogNjYsXHJcbiAgICAxMzY6IDU0NixcclxuICAgIDEzNzogMzQ4MCxcclxuICAgIDEzODogMTc0Nzg3MixcclxuICAgIDEzOTogMzYyODgwLFxyXG4gICAgMTQwOiAyMTc0MjcyMjAwLFxyXG4gICAgMTQxOiA1LjAyMzU1RSsxMixcclxuICAgIDE0MjogNy43NDcyM0UrMTIsXHJcbiAgICAxNDM6IDIuMjIxNjFFKzE2LFxyXG4gICAgMTQ0OiA3LjM5MDYzRSsxNCxcclxuICAgIDE0NTogNTgzMzcyLjgsXHJcbiAgICAxNDY6IDEuNDA5OTZFKzE3XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgQXRvbUlkZW50aWZpZXIgPSB7XHJcblxyXG4gIC8vIEdldCB0aGUgY2hlbWljYWwgc3ltYm9sIGZvciBhbiBhdG9tIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgcHJvdG9ucy5cclxuICBnZXRTeW1ib2w6IGZ1bmN0aW9uKCBudW1Qcm90b25zICkge1xyXG4gICAgcmV0dXJuIHN5bWJvbFRhYmxlWyBudW1Qcm90b25zIF07XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpbnRlcm5hdGlvbmFsaXplZCBlbGVtZW50IG5hbWUgZm9yIGFuIGF0b20gd2l0aCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBwcm90b25zLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Qcm90b25zXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXROYW1lOiBmdW5jdGlvbiggbnVtUHJvdG9ucyApIHtcclxuICAgIHJldHVybiBuYW1lVGFibGVbIG51bVByb3RvbnMgXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIEVuZ2xpc2ggbmFtZSBmb3IgYW4gYXRvbSB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHByb3RvbnMsIGxvd2VyY2FzZWQgd2l0aCBubyB3aGl0ZXNwYWNlIGFuZCBzdWl0YWJsZVxyXG4gICAqIGZvciB1c2FnZSBpbiBQaEVULWlPIGRhdGEgc3RyZWFtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bVByb3RvbnNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEVuZ2xpc2hOYW1lOiBmdW5jdGlvbiggbnVtUHJvdG9ucyApIHtcclxuICAgIHJldHVybiBlbmdsaXNoTmFtZVRhYmxlWyBudW1Qcm90b25zIF07XHJcbiAgfSxcclxuXHJcbiAgLy8gSWRlbnRpZmllcyB3aGV0aGVyIGEgZ2l2ZW4gYXRvbWljIG51Y2xldXMgaXMgc3RhYmxlLlxyXG4gIGlzU3RhYmxlOiBmdW5jdGlvbiggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgKSB7XHJcbiAgICBjb25zdCB0YWJsZUVudHJ5ID0gc3RhYmxlRWxlbWVudFRhYmxlWyBudW1Qcm90b25zIF07XHJcbiAgICBpZiAoIHR5cGVvZiAoIHRhYmxlRW50cnkgKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiAkLmluQXJyYXkoIG51bU5ldXRyb25zLCB0YWJsZUVudHJ5ICkgPiAtMTtcclxuICB9LFxyXG5cclxuICBnZXROdW1OZXV0cm9uc0luTW9zdENvbW1vbklzb3RvcGU6IGZ1bmN0aW9uKCBhdG9taWNOdW1iZXIgKSB7XHJcbiAgICByZXR1cm4gbnVtTmV1dHJvbnNJbk1vc3RTdGFibGVJc290b3BlWyBhdG9taWNOdW1iZXIgXSB8fCAwO1xyXG4gIH0sXHJcblxyXG4gIGdldFN0YW5kYXJkQXRvbWljTWFzczogZnVuY3Rpb24oIG51bVByb3RvbnMgKSB7XHJcbiAgICByZXR1cm4gc3RhbmRhcmRNYXNzVGFibGVbIG51bVByb3RvbnMgXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGF0b21pYyBtYXNzIG9mIGFuIGlzb3RvcGUgZm9tIGFuIGlzb3RvcGUga2V5LiAgIElucHV0IHBhcmFtZXRlcnMgYXJlIHRoZSBudW1iZXIgb2YgcHJvdG9ucyBhbmQgbmV1dHJvbnNcclxuICAgKiB3aGljaCBob2xkIHRoZSBpbmZvcm1hdGlvbiBuZWNlc3NhcnkgdG8gZGV0ZXJtaW5lIGlzb3RvcGUgaW5mb3JtYXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvdG9uc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZXV0cm9uc1xyXG4gICAqL1xyXG4gIGdldElzb3RvcGVBdG9taWNNYXNzOiBmdW5jdGlvbiggcHJvdG9ucywgbmV1dHJvbnMgKSB7XHJcbiAgICBpZiAoIHByb3RvbnMgIT09IDAgKSB7XHJcbiAgICAgIGNvbnN0IHRhYmxlRW50cnkgPSBJU09UT1BFX0lORk9fVEFCTEVbIHByb3RvbnMgXVsgcHJvdG9ucyArIG5ldXRyb25zIF07XHJcbiAgICAgIGlmICggdHlwZW9mICggdGFibGVFbnRyeSApID09PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgICAvLyBBdG9tIGRlZmluZWQgYnkgdGhhdCBudW1iZXIgb2YgcHJvdG9ucyBhbmQgbmV1dHJvbnMgaXMgbm90IHN0YWJsZSwgc28gcmV0dXJuIC0xLlxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGFibGVFbnRyeS5hdG9taWNNYXNzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBuYXR1cmFsIGFidW5kYW5jZSBvZiB0aGUgc3BlY2lmaWVkIGlzb3RvcGUgb24gcHJlc2VudCBkYXkgRWFydGggKHllYXIgMjAxOCkgYXMgYSBwcm9wb3J0aW9uIChOT1QgYVxyXG4gICAqIHBlcmNlbnRhZ2UpIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IGlzb3RvcGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtRGVjaW1hbFBsYWNlcyAtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBpbiB0aGUgcmVzdWx0XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TmF0dXJhbEFidW5kYW5jZTogZnVuY3Rpb24oIGlzb3RvcGUsIG51bURlY2ltYWxQbGFjZXMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1EZWNpbWFsUGxhY2VzICE9PSB1bmRlZmluZWQsICdtdXN0IHNwZWNpZnkgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGZvciBwcm9wb3J0aW9uJyApO1xyXG4gICAgbGV0IGFidW5kYW5jZVByb3BvcnRpb24gPSAwO1xyXG4gICAgaWYgKCBpc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgPiAwICYmXHJcbiAgICAgICAgIElTT1RPUEVfSU5GT19UQUJMRVsgaXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIF1bIGlzb3RvcGUubWFzc051bWJlclByb3BlcnR5LmdldCgpIF0gIT09IHVuZGVmaW5lZCApIHtcclxuXHJcbiAgICAgIC8vIHRoZSBjb25maWd1cmF0aW9uIGlzIGluIHRoZSB0YWJsZSwgZ2V0IGl0IGFuZCByb3VuZCBpdCB0byB0aGUgbmVlZGVkIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlc1xyXG4gICAgICBhYnVuZGFuY2VQcm9wb3J0aW9uID0gVXRpbHMudG9GaXhlZE51bWJlcihcclxuICAgICAgICBJU09UT1BFX0lORk9fVEFCTEVbIGlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSBdWyBpc290b3BlLm1hc3NOdW1iZXJQcm9wZXJ0eS5nZXQoKSBdLmFidW5kYW5jZSxcclxuICAgICAgICBudW1EZWNpbWFsUGxhY2VzXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFidW5kYW5jZVByb3BvcnRpb247XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBpc290b3BlIGV4aXN0cyBvbmx5IGluIHRyYWNlIGFtb3VudHMgb24gcHJlc2VudCBkYXkgRWFydGggKH55ZWFyIDIwMTgpLCBmYWxzZSBpZiB0aGVyZSBpc1xyXG4gICAqIG1vcmUgb3IgbGVzcyB0aGFuIHRoYXQuICBUaGUgZGVmaW5pdGlvbiB0aGF0IGlzIHVzZWQgZm9yIGRlY2lkaW5nIHdoaWNoIGlzb3RvcGVzIGV4aXN0IGluIHRyYWNlIGFtb3VudHMgaXMgZnJvbVxyXG4gICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RyYWNlX3JhZGlvaXNvdG9wZS5cclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IGlzb3RvcGVcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZXhpc3RzSW5UcmFjZUFtb3VudHM6IGZ1bmN0aW9uKCBpc290b3BlICkge1xyXG4gICAgY29uc3QgdGFibGVFbnRyeSA9IElTT1RPUEVfSU5GT19UQUJMRVsgaXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIF1bIGlzb3RvcGUubWFzc051bWJlclByb3BlcnR5LmdldCgpIF07XHJcbiAgICByZXR1cm4gdGFibGVFbnRyeSAhPT0gdW5kZWZpbmVkICYmIHRhYmxlRW50cnkuYWJ1bmRhbmNlID09PSBUUkFDRV9BQlVOREFOQ0U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbGlzdCBvZiBhbGwgaXNvdG9wZXMgZm9yIHRoZSBnaXZlbiBhdG9taWMgbnVtYmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGF0b21pY051bWJlclxyXG4gICAqIEByZXR1cm5cclxuICAgKi9cclxuICBnZXRBbGxJc290b3Blc09mRWxlbWVudDogZnVuY3Rpb24oIGF0b21pY051bWJlciApIHtcclxuICAgIGNvbnN0IGlzb3RvcGVzTGlzdCA9IFtdO1xyXG5cclxuICAgIGZvciAoIGNvbnN0IG1hc3NOdW1iZXIgaW4gSVNPVE9QRV9JTkZPX1RBQkxFWyBhdG9taWNOdW1iZXIgXSApIHtcclxuICAgICAgY29uc3QgbnVtTmV1dHJvbnMgPSBtYXNzTnVtYmVyIC0gYXRvbWljTnVtYmVyO1xyXG4gICAgICBjb25zdCBtb2xlY3VsZU51bWJlckxpc3QgPSBbIGF0b21pY051bWJlciwgbnVtTmV1dHJvbnMsIGF0b21pY051bWJlciBdO1xyXG5cclxuICAgICAgaXNvdG9wZXNMaXN0LnB1c2goIG1vbGVjdWxlTnVtYmVyTGlzdCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpc290b3Blc0xpc3Q7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbGlzdCBvZiBhbGwgaXNvdG9wZXMgdGhhdCBhcmUgY29uc2lkZXJlZCBzdGFibGUuICBUaGlzIGlzIG5lZWRlZFxyXG4gICAqIGJlY2F1c2UgdGhlIGNvbXBsZXRlIGxpc3Qgb2YgaXNvdG9wZXMgdXNlZCBieSB0aGlzIGNsYXNzIGluY2x1ZGVzIHNvbWVcclxuICAgKiB0aGF0IGV4aXN0IG9uIGVhcnRoIGJ1dCBhcmUgbm90IHN0YWJsZSwgc3VjaCBhcyBjYXJib24tMTQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYXRvbWljTnVtYmVyXHJcbiAgICogQHJldHVyblxyXG4gICAqL1xyXG4gIGdldFN0YWJsZUlzb3RvcGVzT2ZFbGVtZW50OiBmdW5jdGlvbiggYXRvbWljTnVtYmVyICkge1xyXG4gICAgY29uc3QgaXNvdG9wZXNMaXN0ID0gdGhpcy5nZXRBbGxJc290b3Blc09mRWxlbWVudCggYXRvbWljTnVtYmVyICk7XHJcbiAgICBjb25zdCBzdGFibGVJc290b3Blc0xpc3QgPSBbXTtcclxuXHJcbiAgICBmb3IgKCBjb25zdCBpc290b3BlSW5kZXggaW4gaXNvdG9wZXNMaXN0ICkge1xyXG4gICAgICBjb25zdCBudW1Qcm90b25zID0gaXNvdG9wZXNMaXN0WyBpc290b3BlSW5kZXggXVsgMCBdO1xyXG4gICAgICBjb25zdCBudW1OZXV0cm9ucyA9IGlzb3RvcGVzTGlzdFsgaXNvdG9wZUluZGV4IF1bIDEgXTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5pc1N0YWJsZSggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgKSApIHtcclxuICAgICAgICBzdGFibGVJc290b3Blc0xpc3QucHVzaCggWyBudW1Qcm90b25zLCBudW1OZXV0cm9ucywgbnVtUHJvdG9ucyBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RhYmxlSXNvdG9wZXNMaXN0O1xyXG4gIH0sXHJcblxyXG4gIC8vIEdldCB0aGUgaGFsZi1saWZlIG9mIGEgbnVjbGlkZSB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHByb3RvbnMgYW5kIG5ldXRyb25zLlxyXG4gIGdldE51Y2xpZGVIYWxmTGlmZTogZnVuY3Rpb24oIG51bVByb3RvbnMsIG51bU5ldXRyb25zICkge1xyXG4gICAgaWYgKCAhSGFsZkxpZmVDb25zdGFudHNbIG51bVByb3RvbnMgXSApIHtcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHJldHVybiBIYWxmTGlmZUNvbnN0YW50c1sgbnVtUHJvdG9ucyBdWyBudW1OZXV0cm9ucyBdO1xyXG4gIH0sXHJcblxyXG4gIC8vIElkZW50aWZpZXMgd2hldGhlciBhIGdpdmVuIG51Y2xpZGUgZXhpc3RzXHJcbiAgZG9lc0V4aXN0OiBmdW5jdGlvbiggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgKSB7XHJcbiAgICBjb25zdCBpc1N0YWJsZSA9IHRoaXMuaXNTdGFibGUoIG51bVByb3RvbnMsIG51bU5ldXRyb25zICk7XHJcbiAgICBjb25zdCBoYWxmTGlmZSA9IHRoaXMuZ2V0TnVjbGlkZUhhbGZMaWZlKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyApO1xyXG4gICAgcmV0dXJuICEoICFpc1N0YWJsZSAmJiBoYWxmTGlmZSA9PT0gdW5kZWZpbmVkICk7XHJcbiAgfSxcclxuXHJcbiAgLy8gUmV0dXJuIGlmIHRoZSBuZXh0IGlzb3RvcGUgb2YgdGhlIGdpdmVuIG51Y2xpZGUgZXhpc3RzXHJcbiAgZG9lc05leHRJc290b3BlRXhpc3Q6IGZ1bmN0aW9uKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyApIHtcclxuICAgIHJldHVybiB0aGlzLmdldE51Y2xpZGVIYWxmTGlmZSggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgKyAxICkgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICB0aGlzLmlzU3RhYmxlKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyArIDEgKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLy8gUmV0dXJuIGlmIHRoZSBwcmV2aW91cyBpc290b3BlIG9mIHRoZSBnaXZlbiBudWNsaWRlIGV4aXN0c1xyXG4gIGRvZXNQcmV2aW91c0lzb3RvcGVFeGlzdDogZnVuY3Rpb24oIG51bVByb3RvbnMsIG51bU5ldXRyb25zICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TnVjbGlkZUhhbGZMaWZlKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyAtIDEgKSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgdGhpcy5pc1N0YWJsZSggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgLSAxICk7XHJcbiAgfSxcclxuXHJcbiAgLy8gUmV0dXJuIGlmIHRoZSBuZXh0IGlzb3RvbmUgb2YgdGhlIGdpdmVuIG51Y2xpZGUgZXhpc3RzXHJcbiAgZG9lc05leHRJc290b25lRXhpc3Q6IGZ1bmN0aW9uKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyApIHtcclxuICAgIHJldHVybiB0aGlzLmdldE51Y2xpZGVIYWxmTGlmZSggbnVtUHJvdG9ucyArIDEsIG51bU5ldXRyb25zICkgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgIHRoaXMuaXNTdGFibGUoIG51bVByb3RvbnMgKyAxLCBudW1OZXV0cm9ucyApO1xyXG4gIH0sXHJcblxyXG4gIC8vIFJldHVybiBpZiB0aGUgcHJldmlvdXMgaXNvdG9uZSBvZiB0aGUgZ2l2ZW4gbnVjbGlkZSBleGlzdHNcclxuICBkb2VzUHJldmlvdXNJc290b25lRXhpc3Q6IGZ1bmN0aW9uKCBudW1Qcm90b25zLCBudW1OZXV0cm9ucyApIHtcclxuICAgIHJldHVybiB0aGlzLmdldE51Y2xpZGVIYWxmTGlmZSggbnVtUHJvdG9ucyAtIDEsIG51bU5ldXRyb25zICkgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgIHRoaXMuaXNTdGFibGUoIG51bVByb3RvbnMgLSAxLCBudW1OZXV0cm9ucyApO1xyXG4gIH0sXHJcblxyXG4gIC8vIFJldHVybiBpZiB0aGUgbnVjbGlkZSBvZiB0aGUgZ2l2ZW4gbnVjbGlkZSBtaW51cyBvbmUgcHJvdG9uIGFuZCBtaW51cyBvbmUgbmV1dHJvbnMgZXhpc3RzXHJcbiAgZG9lc1ByZXZpb3VzTnVjbGlkZUV4aXN0OiBmdW5jdGlvbiggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXROdWNsaWRlSGFsZkxpZmUoIG51bVByb3RvbnMgLSAxLCBudW1OZXV0cm9ucyAtIDEgKSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgdGhpcy5pc1N0YWJsZSggbnVtUHJvdG9ucyAtIDEsIG51bU5ldXRyb25zIC0gMSApO1xyXG4gIH0sXHJcblxyXG4gIC8vIEdldCB0aGUgYXZhaWxhYmxlIGRlY2F5cyBmb3IgYW4gdW5zdGFibGUgbnVjbGlkZS4gUmV0dXJucyBhbiBlbXB0eSBhcnJheSBpZiB0aGUgZGVjYXlzIGFyZSB1bmtub3duIG9yIGlmIHRoZVxyXG4gIC8vIG51Y2xpZGUgZG9lcyBub3QgZXhpc3Qgb3IgaXMgc3RhYmxlLlxyXG4gIGdldEF2YWlsYWJsZURlY2F5czogZnVuY3Rpb24oIG51bVByb3RvbnMsIG51bU5ldXRyb25zICkge1xyXG4gICAgY29uc3QgYWxsRGVjYXlzQW5kUGVyY2VudHMgPSBERUNBWVNfSU5GT19UQUJMRVsgbnVtUHJvdG9ucyBdWyBudW1OZXV0cm9ucyBdO1xyXG5cclxuICAgIC8vIHVuZGVmaW5lZCBtZWFucyB0aGUgbnVjbGlkZSBpcyBzdGFibGUgb3IgZG9lcyBub3QgZXhpc3QsIG1lYW5pbmcgdGhlcmUgYXJlIG5vIGF2YWlsYWJsZSBkZWNheXNcclxuICAgIC8vIG51bGwgdGhlIG51Y2xpZGUgaXMgdW5zdGFibGUgYW5kIHRoZSBhdmFpbGFibGUgZGVjYXlzIGFyZSB1bmtub3duXHJcbiAgICBpZiAoIGFsbERlY2F5c0FuZFBlcmNlbnRzID09PSB1bmRlZmluZWQgfHwgYWxsRGVjYXlzQW5kUGVyY2VudHMgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGUgbnVjbGlkZSBpcyB1bnN0YWJsZSBhbmQgdGhlIGF2YWlsYWJsZSBkZWNheXMgYXJlIGtub3duXHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgYWxsRGVjYXlzID0gT2JqZWN0LmtleXMoIGFsbERlY2F5c0FuZFBlcmNlbnRzICk7XHJcbiAgICAgIGNvbnN0IGJhc2ljRGVjYXlzID0gW107XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFsbERlY2F5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBzd2l0Y2goIGFsbERlY2F5c1sgaSBdICkge1xyXG4gICAgICAgICAgY2FzZSAnQi0nOlxyXG4gICAgICAgICAgICBpZiAoIGJhc2ljRGVjYXlzLmluZGV4T2YoICdCRVRBX01JTlVTX0RFQ0FZJyApID09PSAtMSApIHtcclxuICAgICAgICAgICAgICBiYXNpY0RlY2F5cy5wdXNoKCAnQkVUQV9NSU5VU19ERUNBWScgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJzJCLSc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnRUMrQisnOlxyXG4gICAgICAgICAgICBpZiAoIGJhc2ljRGVjYXlzLmluZGV4T2YoICdCRVRBX1BMVVNfREVDQVknICkgPT09IC0xICkge1xyXG4gICAgICAgICAgICAgIGJhc2ljRGVjYXlzLnB1c2goICdCRVRBX1BMVVNfREVDQVknICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdFQyc6XHJcbiAgICAgICAgICAgIGlmICggYmFzaWNEZWNheXMuaW5kZXhPZiggJ0JFVEFfUExVU19ERUNBWScgKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAgICAgYmFzaWNEZWNheXMucHVzaCggJ0JFVEFfUExVU19ERUNBWScgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ0IrJzpcclxuICAgICAgICAgICAgaWYgKCBiYXNpY0RlY2F5cy5pbmRleE9mKCAnQkVUQV9QTFVTX0RFQ0FZJyApID09PSAtMSApIHtcclxuICAgICAgICAgICAgICBiYXNpY0RlY2F5cy5wdXNoKCAnQkVUQV9QTFVTX0RFQ0FZJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQisrRUMnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJzJFQyc6XHJcbiAgICAgICAgICAgIGlmICggYmFzaWNEZWNheXMuaW5kZXhPZiggJ0JFVEFfUExVU19ERUNBWScgKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAgICAgYmFzaWNEZWNheXMucHVzaCggJ0JFVEFfUExVU19ERUNBWScgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJzJCKyc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQSc6XHJcbiAgICAgICAgICAgIGlmICggYmFzaWNEZWNheXMuaW5kZXhPZiggJ0FMUEhBX0RFQ0FZJyApID09PSAtMSApIHtcclxuICAgICAgICAgICAgICBiYXNpY0RlY2F5cy5wdXNoKCAnQUxQSEFfREVDQVknICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdQJzpcclxuICAgICAgICAgICAgaWYgKCBiYXNpY0RlY2F5cy5pbmRleE9mKCAnUFJPVE9OX0VNSVNTSU9OJyApID09PSAtMSApIHtcclxuICAgICAgICAgICAgICBiYXNpY0RlY2F5cy5wdXNoKCAnUFJPVE9OX0VNSVNTSU9OJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnTic6XHJcbiAgICAgICAgICAgIGlmICggYmFzaWNEZWNheXMuaW5kZXhPZiggJ05FVVRST05fRU1JU1NJT04nICkgPT09IC0xICkge1xyXG4gICAgICAgICAgICAgIGJhc2ljRGVjYXlzLnB1c2goICdORVVUUk9OX0VNSVNTSU9OJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnMlAnOlxyXG4gICAgICAgICAgICBpZiAoIGJhc2ljRGVjYXlzLmluZGV4T2YoICdQUk9UT05fRU1JU1NJT04nICkgPT09IC0xICkge1xyXG4gICAgICAgICAgICAgIGJhc2ljRGVjYXlzLnB1c2goICdQUk9UT05fRU1JU1NJT04nICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICcyTic6XHJcbiAgICAgICAgICAgIGlmICggYmFzaWNEZWNheXMuaW5kZXhPZiggJ05FVVRST05fRU1JU1NJT04nICkgPT09IC0xICkge1xyXG4gICAgICAgICAgICAgIGJhc2ljRGVjYXlzLnB1c2goICdORVVUUk9OX0VNSVNTSU9OJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQitBJzpcclxuICAgICAgICAgICAgaWYgKCBiYXNpY0RlY2F5cy5pbmRleE9mKCAnQkVUQV9QTFVTX0RFQ0FZJyApID09PSAtMSApIHtcclxuICAgICAgICAgICAgICBiYXNpY0RlY2F5cy5wdXNoKCAnQkVUQV9QTFVTX0RFQ0FZJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnRUNBJzpcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdCLUEnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ0ItTic6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQi0yTic6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQi0zTic6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQi00Tic6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnRUNQJzpcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdCK1AnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ0ItUCc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnRUMyUCc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnQisyUCc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnMjROZSc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnMzRTaSc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnMTJDJzpcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdCLUYnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmFzaWNEZWNheXM7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0QXRvbWljUmFkaXVzOiBmdW5jdGlvbiggbnVtRWxlY3Ryb25zICkge1xyXG4gICAgcmV0dXJuIG1hcEVsZWN0cm9uQ291bnRUb1JhZGl1c1sgbnVtRWxlY3Ryb25zIF07XHJcbiAgfVxyXG59O1xyXG5cclxuc2hyZWQucmVnaXN0ZXIoICdBdG9tSWRlbnRpZmllcicsIEF0b21JZGVudGlmaWVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IEF0b21JZGVudGlmaWVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBQzlCLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7O0FBRTVDO0FBQ0E7QUFDQSxNQUFNQyxlQUFlLEdBQUcsY0FBYztBQUV0QyxNQUFNQyxjQUFjLEdBQUdGLFlBQVksQ0FBQ0csUUFBUTtBQUM1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QUNULFdBQVcsRUFDWCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLFVBQVUsRUFDVixTQUFTLEVBQ1QsWUFBWSxFQUNaLFFBQVEsRUFDUixVQUFVLEVBQ1YsT0FBTyxFQUNQLFdBQVcsRUFDWCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixVQUFVLEVBQ1YsVUFBVSxFQUNWLFdBQVcsRUFDWCxNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULFVBQVUsRUFDVixTQUFTLEVBQ1QsU0FBUyxFQUNULFVBQVUsRUFDVixXQUFXLEVBQ1gsU0FBUyxFQUNULFdBQVcsRUFDWCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsU0FBUyxFQUNULFdBQVcsRUFDWCxRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixLQUFLLEVBQ0wsVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsV0FBVyxFQUNYLFFBQVEsRUFDUixjQUFjLEVBQ2QsV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsVUFBVSxFQUNWLFlBQVksRUFDWixTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsRUFDVCxRQUFRLEVBQ1IsU0FBUyxFQUNULFdBQVcsRUFDWCxVQUFVLEVBQ1YsU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixPQUFPLEVBQ1AsVUFBVSxFQUNWLFFBQVEsRUFDUixVQUFVLEVBQ1YsU0FBUyxFQUNULGNBQWMsRUFDZCxTQUFTLEVBQ1QsV0FBVyxFQUNYLFdBQVcsRUFDWCxXQUFXLEVBQ1gsUUFBUSxFQUNSLFdBQVcsRUFDWCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFNBQVMsRUFDVCxhQUFhLEVBQ2IsVUFBVSxFQUNWLFlBQVksRUFDWixlQUFlLEVBQ2YsU0FBUyxFQUNULFlBQVksRUFDWixTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEVBQ2QsYUFBYSxFQUNiLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFdBQVcsRUFDWCxhQUFhLEVBQ2IsWUFBWSxFQUNaLFdBQVcsQ0FDWjtBQUVELE1BQU1DLFdBQVcsR0FBRyxDQUNsQixHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixHQUFHO0FBQUU7QUFDTCxJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJO0FBQUU7QUFDTixJQUFJLENBQUU7QUFBQSxDQUVQOztBQUVEO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUc7QUFDekI7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7QUFDUjtBQUNBLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtBQUNSO0FBQ0EsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO0FBQ1I7QUFDQSxDQUFFLENBQUMsQ0FBRTtBQUNMO0FBQ0EsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO0FBQ1I7QUFDQSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7QUFDUjtBQUNBLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtBQUNSO0FBQ0EsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRTtBQUNaO0FBQ0EsQ0FBRSxFQUFFLENBQUU7QUFDTjtBQUNBLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUU7QUFDZDtBQUNBLENBQUUsRUFBRSxDQUFFO0FBQ047QUFDQSxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFO0FBQ2Q7QUFDQSxDQUFFLEVBQUUsQ0FBRTtBQUNOO0FBQ0EsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRTtBQUNkO0FBQ0EsQ0FBRSxFQUFFLENBQUU7QUFDTjtBQUNBLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFO0FBQ2xCO0FBQ0EsQ0FBRSxFQUFFLEVBQUUsRUFBRSxDQUFFO0FBQ1Y7QUFDQSxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ2QsQ0FBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ1YsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ3RCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ3RCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNkLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDbEIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDdEIsQ0FBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ1YsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDbEIsQ0FBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ1YsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ3RCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ3RCLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDMUIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNsQixDQUFFLEVBQUUsQ0FBRSxFQUNOLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ2xCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUMxQixFQUFFLEVBQ0YsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDOUIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQzFCLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDMUIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUMxQyxDQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDVixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDdEIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQzFCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUMxQixDQUFFLEVBQUUsQ0FBRSxFQUNOLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ3RCLEVBQUUsRUFDRixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDdEIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQzFCLENBQUUsRUFBRSxDQUFFLEVBQ04sQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDOUIsQ0FBRSxFQUFFLENBQUUsRUFDTixDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLEVBQzVCLENBQUUsR0FBRyxDQUFFLEVBQ1AsQ0FBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsRUFDcEMsQ0FBRSxHQUFHLENBQUUsRUFDUCxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsRUFDM0IsQ0FBRSxHQUFHLENBQUUsRUFDUCxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLEVBQ2pCLENBQUUsR0FBRyxDQUFFLEVBQ1AsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLEVBQzNCLENBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxFQUNaLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxFQUMzQixDQUFFLEdBQUcsQ0FBRSxFQUNQLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLEVBQ3JDLENBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxFQUNaLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FDbEI7QUFFRCxNQUFNQyw4QkFBOEIsR0FBRztBQUNyQztBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBLEVBQUU7QUFDRjtBQUNBLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxDQUNKOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRztFQUMvQixDQUFDLEVBQUUsRUFBRTtFQUNMLENBQUMsRUFBRSxFQUFFO0VBQ0wsQ0FBQyxFQUFFLEdBQUc7RUFDTixDQUFDLEVBQUUsR0FBRztFQUNOLENBQUMsRUFBRSxFQUFFO0VBQ0wsQ0FBQyxFQUFFLEVBQUU7RUFDTCxDQUFDLEVBQUUsRUFBRTtFQUNMLENBQUMsRUFBRSxFQUFFO0VBQ0wsQ0FBQyxFQUFFLEVBQUU7RUFDTCxFQUFFLEVBQUUsRUFBRTtFQUNOLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEVBQUU7RUFDTixFQUFFLEVBQUUsRUFBRTtFQUNOLEVBQUUsRUFBRSxFQUFFO0VBQ04sRUFBRSxFQUFFLEVBQUU7RUFDTixFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxFQUFFO0VBQ04sRUFBRSxFQUFFLEVBQUU7RUFDTixFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRSxHQUFHO0VBQ1AsRUFBRSxFQUFFLEdBQUc7RUFDUCxFQUFFLEVBQUUsR0FBRztFQUNQLEVBQUUsRUFBRTtBQUNOLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRztFQUN4QixDQUFDLEVBQUU7SUFDRCxDQUFDLEVBQUU7TUFDRCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUU7RUFDTCxDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUU7RUFDTCxDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsS0FBSyxFQUFFLEdBQUc7TUFDVixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEdBQUc7TUFDVixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxLQUFLLEVBQUUsR0FBRztNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxFQUFFO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRTtNQUNELEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1A7RUFDRixDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxLQUFLLEVBQUUsR0FBRztNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELENBQUMsRUFBRTtJQUNELENBQUMsRUFBRSxJQUFJO0lBQ1AsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLEdBQUc7TUFDVixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUU7TUFDRCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxFQUFFO01BQ1YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLENBQUM7TUFDUixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsQ0FBQyxFQUFFO01BQ0QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELENBQUMsRUFBRTtNQUNELE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsSUFBSTtNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUU7TUFDRCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsQ0FBQyxFQUFFO01BQ0QsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxLQUFLO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxDQUFDLEVBQUU7TUFDRCxPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLE1BQU07TUFDYixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLEdBQUc7TUFDVixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLEdBQUc7TUFDVixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLEtBQUs7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsS0FBSztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxLQUFLO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNY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O01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxJQUFJO01BQ1QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osTUFBTSxFQUFFO0lBQ1Y7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEVBQUU7TUFDUixPQUFPLEVBQUUsRUFBRTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxDQUFDO01BQ1IsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxFQUFFO01BQ1QsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxFQUFFO01BQ1QsSUFBSSxFQUFFLElBQUk7TUFDVixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLEVBQUU7TUFDVCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLEVBQUU7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUU7TUFDUDtJQUNGLENBQUM7O0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixNQUFNLEVBQUUsSUFBSTtNQUNaLElBQUksRUFBRSxJQUFJO01BQ1YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFLElBQUk7TUFDWixJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsR0FBRztNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsS0FBSztNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1Y7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxJQUFJO01BQ1YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEVBQUU7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFLElBQUk7TUFDWixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxHQUFHO01BQ1YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxLQUFLO01BQ2QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxJQUFJO01BQ1YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxDQUFDO01BQ1IsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLE9BQU87TUFDYixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxHQUFHO01BQ1YsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFLElBQUk7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osTUFBTSxFQUFFO0lBQ1Y7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUUsSUFBSTtNQUNYLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxHQUFHO01BQ1YsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLE1BQU0sRUFBRTtJQUNWO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFO01BQ1A7SUFDRixDQUFDOztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsT0FBTztNQUNiLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsSUFBSTtNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEtBQUssRUFBRSxJQUFJO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEVBQUU7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEtBQUs7TUFDWCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEdBQUc7TUFDVixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsTUFBTSxFQUFFLElBQUk7TUFDWixJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxJQUFJO01BQ1YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEtBQUssRUFBRSxJQUFJO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsS0FBSztNQUNYLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1Y7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEVBQUU7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLElBQUk7TUFDVixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxNQUFNO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxHQUFHO01BQ1YsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLENBQUM7TUFDUixNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFLElBQUk7TUFDWCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsQ0FBQztNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxLQUFLO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLEVBQUU7TUFDVCxNQUFNLEVBQUU7SUFDVixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUUsRUFBRTtNQUNULE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFLEVBQUU7TUFDUCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixLQUFLLEVBQUUsR0FBRztNQUNWLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUUsSUFBSTtNQUNYLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxNQUFNO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFLEVBQUU7TUFDUCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsSUFBSTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLElBQUksRUFBRSxFQUFFO01BQ1IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxJQUFJO01BQ1YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUUsRUFBRTtNQUNYLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsQ0FBQztNQUNOLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxDQUFDO01BQ1IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxJQUFJO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsQ0FBQztNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRSxJQUFJO01BQ1gsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsTUFBTSxFQUFFLElBQUk7TUFDWixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsR0FBRztNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLE1BQU07TUFDZixLQUFLLEVBQUUsR0FBRztNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxHQUFHO01BQ1YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxLQUFLO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxPQUFPO01BQ2QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsS0FBSztNQUNkLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsT0FBTztNQUNiLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULE1BQU0sRUFBRSxJQUFJO01BQ1osS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixLQUFLLEVBQUUsRUFBRTtNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRSxDQUFDO01BQ1IsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFLElBQUk7TUFDWCxNQUFNLEVBQUU7SUFDVjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLE9BQU87TUFDYixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEtBQUssRUFBRSxJQUFJO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRSxHQUFHO01BQ1QsR0FBRyxFQUFFLElBQUk7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUUsSUFBSTtNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsR0FBRztNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsQ0FBQztNQUNOLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLE9BQU87TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEtBQUs7TUFDZCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLE1BQU07TUFDWixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLEdBQUc7TUFDVCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxHQUFHO01BQ1IsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsQ0FBQztNQUNWLEtBQUssRUFBRSxJQUFJO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLE9BQU87TUFDaEIsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsT0FBTztNQUNoQixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUUsQ0FBQztNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsSUFBSTtNQUNYLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxNQUFNO01BQ2YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxNQUFNO01BQ2YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEtBQUssRUFBRTtJQUNULENBQUM7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SUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixLQUFLLEVBQUUsR0FBRztNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFLEVBQUU7TUFDUCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsTUFBTTtNQUNmLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsSUFBSTtNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLE1BQU07TUFDZixHQUFHLEVBQUUsS0FBSztNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsRUFBRTtNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsTUFBTTtNQUNmLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxHQUFHO01BQ1IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxHQUFHO01BQ1os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SUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUUsSUFBSTtNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsSUFBSTtNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxHQUFHO01BQ1IsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEVBQUU7TUFDUCxHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixJQUFJLEVBQUUsSUFBSTtNQUNWLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsS0FBSztNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLE9BQU8sRUFBRSxJQUFJO01BQ2IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxJQUFJO01BQ2IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxJQUFJO01BQ2IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxNQUFNO01BQ2YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLFNBQVM7TUFDbEIsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFLEdBQUc7TUFDUixHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsRUFBRTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFLEVBQUU7TUFDWCxLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUUsRUFBRTtNQUNQLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRSxJQUFJO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxNQUFNO01BQ2YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxTQUFTO01BQ2xCLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRTtNQUNILEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEtBQUssRUFBRSxJQUFJO01BQ1gsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRSxHQUFHO01BQ1IsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUUsQ0FBQztNQUNOLE1BQU0sRUFBRTtJQUNWLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLENBQUM7TUFDVixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxLQUFLO01BQ1gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxLQUFLLEVBQUUsSUFBSTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEtBQUssRUFBRTtJQUNUO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxFQUFFLEVBQUU7TUFDRixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsRUFBRSxFQUFFO01BQ0YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEVBQUUsRUFBRTtNQUNGLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLE1BQU07TUFDZixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLE9BQU87TUFDaEIsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsR0FBRztNQUNaLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEdBQUc7TUFDWixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRSxFQUFFO01BQ1gsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxJQUFJO01BQ2IsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxHQUFHO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxNQUFNO01BQ1gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxLQUFLO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxJQUFJO01BQ1YsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxNQUFNO01BQ1osR0FBRyxFQUFFLEtBQUs7TUFDVixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsS0FBSyxFQUFFLElBQUk7TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEtBQUs7TUFDZCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLE1BQU07TUFDZixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLE1BQU07TUFDWCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLE1BQU07TUFDWCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsUUFBUTtNQUNiLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEtBQUs7TUFDVixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLEtBQUssRUFBRSxHQUFHO01BQ1YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsRUFBRTtNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsS0FBSztNQUNkLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsTUFBTTtNQUNmLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsSUFBSTtNQUNWLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixJQUFJLEVBQUUsS0FBSztNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsTUFBTTtNQUNYLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsS0FBSztNQUNWLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsRUFBRTtNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsSUFBSTtNQUNWLEtBQUssRUFBRTtJQUNULENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixLQUFLLEVBQUU7SUFDVDtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLElBQUk7TUFDVCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLElBQUk7TUFDYixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsT0FBTyxFQUFFLEVBQUU7TUFDWCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEVBQUU7TUFDUixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLENBQUM7TUFDTixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxFQUFFO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxLQUFLO01BQ1YsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEtBQUs7TUFDVixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxNQUFNO01BQ1osR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1Q7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLE1BQU07TUFDWCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixLQUFLLEVBQUU7TUFDUDtJQUNGLENBQUM7O0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1I7RUFDRixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsS0FBSztNQUNWLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEVBQUU7TUFDUCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLElBQUk7TUFDVixHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixLQUFLLEVBQUU7SUFDVCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEVBQUU7TUFDUixJQUFJLEVBQUUsRUFBRTtNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsS0FBSztNQUNYLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxHQUFHO01BQ1QsS0FBSyxFQUFFO0lBQ1QsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7RUFDUCxDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxPQUFPLEVBQUUsSUFBSTtNQUNiLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLE1BQU0sRUFBRSxRQUFRO01BQ2hCLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUjtFQUNGLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsSUFBSTtNQUNULEdBQUcsRUFBRSxJQUFJO01BQ1QsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxFQUFFO01BQ1AsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxLQUFLO01BQ2QsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRSxLQUFLO01BQ1gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILE9BQU8sRUFBRSxJQUFJO01BQ2IsSUFBSSxFQUFFLEdBQUc7TUFDVCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLEdBQUc7TUFDVCxlQUFlLEVBQUU7SUFDbkIsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSO0VBQ0YsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsQ0FBQztNQUNOLE9BQU8sRUFBRTtJQUNYLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFLEdBQUc7TUFDUixPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUU7SUFDUCxDQUFDO0lBQ0QsR0FBRyxFQUFFO01BQ0gsR0FBRyxFQUFFO0lBQ1AsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsRUFBRTtNQUNQLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsRUFBRTtNQUNSLEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLFNBQVMsRUFBRTtJQUNiLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxJQUFJLEVBQUUsR0FBRztNQUNULEdBQUcsRUFBRTtJQUNQLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLFNBQVMsRUFBRSxRQUFRO01BQ25CLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLE1BQU0sRUFBRSxRQUFRO01BQ2hCLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRSxRQUFRO01BQ2QsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsSUFBSSxFQUFFLFdBQVc7TUFDakIsU0FBUyxFQUFFO0lBQ2IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILEdBQUcsRUFBRSxHQUFHO01BQ1IsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNELEdBQUcsRUFBRTtNQUNILElBQUksRUFBRTtJQUNSLENBQUM7SUFDRCxHQUFHLEVBQUU7TUFDSCxHQUFHLEVBQUUsR0FBRztNQUNSLElBQUksRUFBRTtJQUNSO0VBQ0Y7QUFDRixD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QU07QUFBRTtBQUNSLE9BQU87QUFBRTtBQUNULE9BQU87QUFBRTtBQUNULFNBQVM7QUFBRTtBQUNYLE1BQU07QUFBRTtBQUNSLFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULE1BQU07QUFBRTtBQUNSLEtBQUs7QUFBRTtBQUNQLE1BQU07QUFBRTtBQUNSLEtBQUs7QUFBRTtBQUNQLE9BQU87QUFBRTtBQUNULEtBQUs7QUFBRTtBQUNQLE1BQU07QUFBRTtBQUNSLE1BQU07QUFBRTtBQUNSLE9BQU87QUFBRTtBQUNULEtBQUs7QUFBRTtBQUNQLFFBQVE7QUFBRTtBQUNWLE1BQU07QUFBRTtBQUNSLFFBQVE7QUFBRTtBQUNWLEtBQUs7QUFBRTtBQUNQLEVBQUU7QUFBRTtBQUNKLE1BQU07QUFBRTtBQUNSLFFBQVE7QUFBRTtBQUNWLE1BQU07QUFBRTtBQUNSLFFBQVE7QUFBRTtBQUNWLE9BQU87QUFBRTtBQUNULE9BQU87QUFBRTtBQUNULE1BQU07QUFBRTtBQUNSLE1BQU07QUFBRTtBQUNSLEtBQUs7QUFBRTtBQUNQLFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULFdBQVc7QUFBRTtBQUNiLE9BQU87QUFBRTtBQUNULFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULEdBQUc7QUFBRTtBQUNMLE1BQU07QUFBRTtBQUNSLE9BQU87QUFBRTtBQUNULE1BQU07QUFBRTtBQUNSLFNBQVM7QUFBRTtBQUNYLEtBQUs7QUFBRTtBQUNQLFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULFNBQVM7QUFBRTtBQUNYLE9BQU87QUFBRTtBQUNULFFBQVE7QUFBRTtBQUNWLE1BQU07QUFBRTtBQUNSLFNBQVM7QUFBRTtBQUNYLE1BQU07QUFBRTtBQUNSLE9BQU87QUFBRTtBQUNULE1BQU07QUFBRTtBQUNSLE9BQU87QUFBRTtBQUNULE9BQU87QUFBRTtBQUNULFVBQVU7QUFBRTtBQUNaLE1BQU07QUFBRTtBQUNSLFFBQVE7QUFBRTtBQUNWLEtB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QUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsVUFBVTtJQUNiLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsS0FBSztJQUNSLENBQUMsRUFBRSxNQUFNO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUUsV0FBVztJQUNkLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLE1BQU07SUFDVCxDQUFDLEVBQUUsS0FBSztJQUNSLENBQUMsRUFBRSxLQUFLO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUUsSUFBSTtJQUNQLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsTUFBTTtJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixDQUFDLEVBQUUsV0FBVztJQUNkLENBQUMsRUFBRSxNQUFNO0lBQ1QsQ0FBQyxFQUFFLEtBQUs7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsTUFBTTtJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLENBQUMsRUFBRSxLQUFLO0lBQ1IsQ0FBQyxFQUFFLE1BQU07SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsQ0FBQztJQUNMLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsQ0FBQztJQUNMLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsQ0FBQztJQUNMLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRTtFQUNOLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxPQUFPO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVB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QUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUU7RUFDTixDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVB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QUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsV0FBVztJQUNmLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFO0VBQ04sQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxXQUFXO0lBQ2YsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsVUFBVTtJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsR0FBRyxFQUFFO0VBQ1AsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLFVBQVU7SUFDZCxFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLFdBQVc7SUFDZixFQUFFLEVBQUUsUUFBUTtJQUNaLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxDQUFDO0lBQ0wsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixHQUFHLEVBQUU7RUFDUCxDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEVBQUU7SUFDTixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE9BQU87SUFDWCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUU7RUFDUCxDQUFDO0VBQ0QsRUFBRSxFQUFFO0lBQ0YsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsRUFBRTtJQUNOLEVBQUUsRUFBRSxFQUFFO0lBQ04sRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsS0FBSztJQUNULEVB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QUcsRUFBRSxFQUFFO0lBQ1AsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLFVBQVU7SUFDZixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRTtFQUNQLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxTQUFTO0lBQ2IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsQ0FBQztJQUNMLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxPQUFPO0lBQ1osR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEVBQUU7SUFDUCxHQUFHLEVBQUUsVUFBVTtJQUNmLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLFVBQVU7SUFDZixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRTtFQUNQLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsU0FBUztJQUNiLEVBQUUsRUFBRSxVQUFVO0lBQ2QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLENBQUM7SUFDTCxFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsT0FBTztJQUNYLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFdBQVc7SUFDaEIsR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxFQUFFO0lBQ1AsR0FBRyxFQUFFLFNBQVM7SUFDZCxHQUFHLEVBQUUsVUFBVTtJQUNmLEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFO0VBQ1AsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxHQUFHO0lBQ1AsRUFBRSxFQUFFLFNBQVM7SUFDYixFQUFFLEVBQUUsR0FBRztJQUNQLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEdBQUc7SUFDUCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLElBQUk7SUFDUixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLEtBQUs7SUFDVCxF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QUUsU0FBUztJQUNkLEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLEVBQUU7SUFDUCxHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFLFNBQVM7SUFDZCxHQUFHLEVBQUUsU0FBUztJQUNkLEdBQUcsRUFBRTtFQUNQLENBQUM7RUFDRCxFQUFFLEVBQUU7SUFDRixFQUFFLEVBQUUsT0FBTztJQUNYLEVBQUUsRUFBRSxRQUFRO0lBQ1osRUFBRSxFQUFFLFFBQVE7SUFDWixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsTUFBTTtJQUNWLEVBQUUsRUFBRSxLQUFLO0lBQ1QsRUFBRSxFQUFFLE1BQU07SUFDVixFQUFFLEVBQUUsSUFBSTtJQUNSLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsV0FBVztJQUNoQixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxNQUFNO0lBQ1gsR0FBRyxFQUFFLE9BQU87SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxFQUFFO0lBQ1AsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsU0FBUztJQUNkLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLFNBQVM7SUFDZCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFO0VBQ1AsQ0FBQztFQUNELEVBQUUsRUFBRTtJQUNGLEVBQUUsRUFBRSxNQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQUs7SUFDVCxFQUFFLEVBQUUsS0FBSztJQUNULEVBQUUsRUFBRSxJQUFJO0lBQ1IsRUFBRSxFQUFFLElBQUk7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxFQUFFO0lBQ1AsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsR0FBRztJQUNSLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLFNBQVM7SUFDZCxHQUFHLEVBQUUsT0FBTztJQUNaLEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxNQUFNO0lBQ1gsR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsRUFBRTtJQUNQLEdBQUcsRUFBRSxFQUFFO0lBQ1AsR0FBRyxF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