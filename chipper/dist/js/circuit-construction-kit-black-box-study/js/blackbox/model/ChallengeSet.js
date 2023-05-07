// Copyright 2016-2020, University of Colorado Boulder

/**
 * Challenges that appear in the combo box for the black box circuits.  See https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/41#issuecomment-280704297
 * for a description of how to create new circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

// constants
const resistivity = 1E-4;
const warmupCircuitStateObject = {
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 3,
    endVertex: 1
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 10,
    startVertex: 2,
    endVertex: 3
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 451.31111111111113,
    y: 304.3777777777778,
    options: {
      attachable: false
    }
  }, {
    x: 561.3111111111111,
    y: 304.3777777777778,
    options: {
      attachable: false
    }
  }]
};
const challengeArray = [
// Black Box 1
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 3,
    endVertex: 1
  }],
  batteries: [{
    voltage: 10,
    startVertex: 3,
    endVertex: 2
  }],
  lightBulbs: [],
  resistors: [],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 463.3925925925927,
    y: 305,
    options: {
      attachable: false
    }
  }, {
    x: 565.3925925925927,
    y: 305,
    options: {
      attachable: false
    }
  }]
},
// Black Box 2
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 1,
    options: {
      interactive: false
    }
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }]
}, {
  wires: [{
    resistivity: resistivity,
    startVertex: 2,
    endVertex: 3
  }, {
    resistivity: resistivity,
    startVertex: 4,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 5
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 10,
    startVertex: 3,
    endVertex: 4
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 494.73089897821814,
    y: 243.01287667140764,
    options: {
      attachable: false
    }
  }, {
    x: 575.7047913446678,
    y: 317.4657393096343,
    options: {
      attachable: false
    }
  }, {
    x: 474.16074188562595,
    y: 304.80422462648113,
    options: {
      attachable: false
    }
  }]
},
// Black Box 3
{
  wires: [{
    resistivity: resistivity,
    startVertex: 2,
    endVertex: 3
  }, {
    resistivity: resistivity,
    startVertex: 4,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 5
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 4
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 10,
    startVertex: 3,
    endVertex: 4
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 494.73089897821814,
    y: 243.01287667140764,
    options: {
      attachable: false
    }
  }, {
    x: 575.7047913446678,
    y: 317.4657393096343,
    options: {
      attachable: false
    }
  }, {
    x: 474.16074188562595,
    y: 304.80422462648113,
    options: {
      attachable: false
    }
  }]
}, {
  wires: [{
    resistivity: resistivity,
    startVertex: 2,
    endVertex: 3
  }, {
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 4
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 1
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 10,
    startVertex: 3,
    endVertex: 5
  }, {
    resistance: 15,
    startVertex: 4,
    endVertex: 5
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 466.7932305597578,
    y: 246.6736324433821,
    options: {
      attachable: false
    }
  }, {
    x: 436.2563281508843,
    y: 315.1157323880298,
    options: {
      attachable: false
    }
  }, {
    x: 545.9709724238027,
    y: 323.0338655055636,
    options: {
      attachable: false
    }
  }]
},
// Black Box 4
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 5
  }, {
    resistivity: resistivity,
    startVertex: 3,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 4,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 7
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 10,
    startVertex: 3,
    endVertex: 4
  }, {
    resistance: 25,
    startVertex: 5,
    endVertex: 6
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 491.92597968069657,
    y: 250.20948234155776,
    options: {
      attachable: false
    }
  }, {
    x: 580.837550793385,
    y: 314.9762371025718,
    options: {
      attachable: false
    }
  }, {
    x: 448.30478955007254,
    y: 306.68553459119494,
    options: {
      attachable: false
    }
  }, {
    x: 534.2197071006653,
    y: 375.37779719969285,
    options: {
      attachable: false
    }
  }, {
    x: 516.6705370101597,
    y: 435.9859700048379
  }]
},
// Black Box 5
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 6
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 3,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 4
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 5
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 40,
    startVertex: 5,
    endVertex: 3
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 598.67209360906,
    y: 310.5176013986531,
    options: {
      attachable: false
    }
  }, {
    x: 516.6705370101597,
    y: 435.9859700048379
  }, {
    x: 509.7605224963715,
    y: 245.75084663763903,
    options: {
      attachable: false
    }
  }, {
    x: 448.30478955007254,
    y: 306.68553459119494,
    options: {
      attachable: false
    }
  }]
},
// Black Box 6
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 4
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 7,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 3
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 7
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 15,
    startVertex: 5,
    endVertex: 7
  }, {
    resistance: 10,
    startVertex: 4,
    endVertex: 5
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 429.7844303895079,
    y: 301.9537616627625,
    options: {
      attachable: false
    }
  }, {
    x: 509.76052249637144,
    y: 226.43009192065796,
    options: {
      attachable: false
    }
  }, {
    x: 511.2467343976777,
    y: 312.6303821964199,
    options: {
      attachable: false
    }
  }, {
    x: 598.6720936090605,
    y: 291.196846681672,
    options: {
      attachable: false
    }
  }]
},
// Black Box 7
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 5
  }, {
    resistivity: resistivity,
    startVertex: 4,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 7,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 3
  }],
  batteries: [{
    voltage: 10,
    startVertex: 4,
    endVertex: 5
  }],
  lightBulbs: [],
  resistors: [{
    resistance: 40,
    startVertex: 4,
    endVertex: 7
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 509.76052249637144,
    y: 226.43009192065796,
    options: {
      attachable: false
    }
  }, {
    x: 429.54911989720756,
    y: 289.4390666232742,
    options: {
      attachable: false
    }
  }, {
    x: 511.2467343976777,
    y: 312.6303821964199,
    options: {
      attachable: false
    }
  }, {
    x: 598.6720936090605,
    y: 291.196846681672,
    options: {
      attachable: false
    }
  }]
},
// Black Box 10 or maybe 8
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 4
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 7,
    endVertex: 1
  }, {
    resistivity: resistivity,
    startVertex: 6,
    endVertex: 3
  }, {
    resistivity: resistivity,
    startVertex: 7,
    endVertex: 8
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    resistance: 5,
    startVertex: 4,
    endVertex: 5
  }, {
    resistance: 5,
    startVertex: 4,
    endVertex: 6
  }, {
    resistance: 10,
    startVertex: 5,
    endVertex: 7
  }, {
    resistance: 10,
    startVertex: 6,
    endVertex: 8
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 429.47373111984234,
    y: 306.0820194162099,
    options: {
      attachable: false
    }
  }, {
    x: 509.76052249637144,
    y: 230.8887276245767,
    options: {
      attachable: false
    }
  }, {
    x: 515.2404740840386,
    y: 374.95919852013003,
    options: {
      attachable: false
    }
  }, {
    x: 592.4940785388161,
    y: 303.38120105852477,
    options: {
      attachable: false
    }
  }, {
    x: 608.3992218798088,
    y: 316.46605610903987,
    options: {
      attachable: false
    }
  }]
},
// Black Box 11 or maybe 9
{
  wires: [{
    startVertex: 4,
    endVertex: 1,
    resistivity: resistivity
  }, {
    startVertex: 3,
    endVertex: 6,
    resistivity: resistivity
  }, {
    startVertex: 4,
    endVertex: 5,
    resistivity: resistivity
  }, {
    startVertex: 6,
    endVertex: 7,
    resistivity: resistivity
  }, {
    startVertex: 8,
    endVertex: 2,
    resistivity: resistivity
  }, {
    startVertex: 0,
    endVertex: 9,
    resistivity: resistivity
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    startVertex: 5,
    endVertex: 7,
    resistance: 40
  }, {
    startVertex: 9,
    endVertex: 8,
    resistance: 25
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 641,
    y: 305
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 509.390977443609,
    y: 226.33734335839608,
    options: {
      attachable: false
    }
  }, {
    x: 594.5088241252698,
    y: 251.8641824892183,
    options: {
      attachable: false
    }
  }, {
    x: 510.4150375939849,
    y: 399.38045112781947,
    options: {
      attachable: false
    }
  }, {
    x: 592.4075187969925,
    y: 361.8441102756892,
    options: {
      attachable: false
    }
  }, {
    x: 550.8315789473686,
    y: 304.8696741854636,
    options: {
      attachable: false
    }
  }, {
    x: 440.8315789473686,
    y: 304.8696741854636,
    options: {
      attachable: false
    }
  }]
},
// Black Box 12
{
  wires: [{
    startVertex: 1,
    endVertex: 4,
    resistivity: resistivity
  }, {
    startVertex: 5,
    endVertex: 3,
    resistivity: resistivity
  }, {
    startVertex: 5,
    endVertex: 4,
    resistivity: resistivity
  }, {
    startVertex: 8,
    endVertex: 2,
    resistivity: resistivity
  }, {
    startVertex: 0,
    endVertex: 6,
    resistivity: resistivity
  }, {
    startVertex: 6,
    endVertex: 5,
    resistivity: resistivity
  }, {
    startVertex: 7,
    endVertex: 8,
    resistivity: resistivity
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    startVertex: 4,
    endVertex: 8,
    resistance: 40
  }, {
    startVertex: 6,
    endVertex: 7,
    resistance: 40
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 641,
    y: 305
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 508.7715158295906,
    y: 243.22376148321527,
    options: {
      attachable: false
    }
  }, {
    x: 509.3277310924369,
    y: 404,
    options: {
      attachable: false
    }
  }, {
    x: 423.25821237585944,
    y: 304.37560478736947,
    options: {
      attachable: false
    }
  }, {
    x: 533.2582123758594,
    y: 304.37560478736947,
    options: {
      attachable: false
    }
  }, {
    x: 599.9595110771581,
    y: 304.7440794499618,
    options: {
      attachable: false
    }
  }]
},
// Black Box 13
{
  wires: [{
    startVertex: 0,
    endVertex: 5,
    resistivity: resistivity
  }, {
    startVertex: 4,
    endVertex: 2,
    resistivity: resistivity
  }, {
    startVertex: 8,
    endVertex: 1,
    resistivity: resistivity
  }, {
    startVertex: 3,
    endVertex: 10,
    resistivity: resistivity
  }, {
    startVertex: 10,
    endVertex: 7,
    resistivity: resistivity
  }, {
    startVertex: 9,
    endVertex: 10,
    resistivity: resistivity
  }],
  batteries: [{
    startVertex: 6,
    endVertex: 7,
    voltage: 10
  }],
  lightBulbs: [],
  resistors: [{
    startVertex: 5,
    endVertex: 6,
    resistance: 40
  }, {
    startVertex: 9,
    endVertex: 8,
    resistance: 40
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 641,
    y: 305
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 603.9831932773109,
    y: 305.15788133435194,
    options: {
      attachable: false
    }
  }, {
    x: 417,
    y: 304.48502622400264,
    options: {
      attachable: false
    }
  }, {
    x: 527,
    y: 304.48502622400264,
    options: {
      attachable: false
    }
  }, {
    x: 602.5860951715342,
    y: 372.97401962235654,
    options: {
      attachable: false
    }
  }, {
    x: 525.8076918414426,
    y: 236.27648360602078,
    options: {
      attachable: false
    }
  }, {
    x: 417.7822765469824,
    y: 257.0252100840337,
    options: {
      attachable: false
    }
  }, {
    x: 509.19633307868605,
    y: 400.8708938120703,
    options: {
      attachable: false
    }
  }]
},
// Black Box 14
{
  wires: [{
    startVertex: 0,
    endVertex: 4,
    resistivity: resistivity
  }, {
    startVertex: 3,
    endVertex: 5,
    resistivity: resistivity
  }, {
    startVertex: 6,
    endVertex: 1,
    resistivity: resistivity
  }, {
    startVertex: 7,
    endVertex: 2,
    resistivity: resistivity
  }],
  batteries: [{
    startVertex: 4,
    endVertex: 5,
    voltage: 10
  }],
  lightBulbs: [],
  resistors: [{
    startVertex: 5,
    endVertex: 6,
    resistance: 40
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 641,
    y: 305
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 425.42052029973934,
    y: 306.47030301802835,
    options: {
      attachable: false
    }
  }, {
    x: 508.35321860715044,
    y: 365.8518451961491,
    options: {
      attachable: false
    }
  }, {
    x: 510.58357684064254,
    y: 255.87445887445887,
    options: {
      attachable: false
    }
  }, {
    x: 572.6921313980137,
    y: 303.59332824038705,
    options: {
      attachable: false
    }
  }]
},
// Black Box 15
{
  wires: [{
    startVertex: 3,
    endVertex: 7,
    resistivity: resistivity
  }, {
    startVertex: 1,
    endVertex: 4,
    resistivity: resistivity
  }, {
    startVertex: 7,
    endVertex: 4,
    resistivity: resistivity
  }, {
    startVertex: 0,
    endVertex: 6,
    resistivity: resistivity
  }, {
    startVertex: 5,
    endVertex: 2,
    resistivity: resistivity
  }, {
    startVertex: 6,
    endVertex: 5,
    resistivity: resistivity
  }],
  batteries: [],
  lightBulbs: [],
  resistors: [{
    startVertex: 6,
    endVertex: 7,
    resistance: 40
  }],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 641,
    y: 305
  }, {
    x: 509.23947750362845,
    y: 437.4721819061441
  }, {
    x: 508.39495798319325,
    y: 220.25821237585942,
    options: {
      attachable: false
    }
  }, {
    x: 596.1604278074866,
    y: 305.94015788133436,
    options: {
      attachable: false
    }
  }, {
    x: 417.90461058169075,
    y: 303.9176958579125,
    options: {
      attachable: false
    }
  }, {
    x: 509.97860962566824,
    y: 364.1038961038961,
    options: {
      attachable: false
    }
  }]
},
// Black Box 16
{
  wires: [{
    resistivity: resistivity,
    startVertex: 0,
    endVertex: 4
  }, {
    resistivity: resistivity,
    startVertex: 3,
    endVertex: 2
  }, {
    resistivity: resistivity,
    startVertex: 5,
    endVertex: 1
  }],
  batteries: [{
    voltage: 10,
    startVertex: 4,
    endVertex: 3
  }],
  lightBulbs: [],
  resistors: [],
  switches: [],
  vertices: [{
    x: 381,
    y: 305
  }, {
    x: 641,
    y: 305
  }, {
    x: 508.6893353941268,
    y: 178.18907779495106
  }, {
    x: 509.76052249637144,
    y: 226.43009192065796,
    options: {
      attachable: false
    }
  }, {
    x: 429.54911989720756,
    y: 289.4390666232742,
    options: {
      attachable: false
    }
  }, {
    x: 598.6720936090605,
    y: 305,
    options: {
      attachable: false
    }
  }]
}];
const ChallengeSet = {
  warmupCircuitStateObject: warmupCircuitStateObject,
  challengeArray: challengeArray
};
circuitConstructionKitBlackBoxStudy.register('ChallengeSet', ChallengeSet);
export default ChallengeSet;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaXJjdWl0Q29uc3RydWN0aW9uS2l0QmxhY2tCb3hTdHVkeSIsInJlc2lzdGl2aXR5Iiwid2FybXVwQ2lyY3VpdFN0YXRlT2JqZWN0Iiwid2lyZXMiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsImJhdHRlcmllcyIsImxpZ2h0QnVsYnMiLCJyZXNpc3RvcnMiLCJyZXNpc3RhbmNlIiwic3dpdGNoZXMiLCJ2ZXJ0aWNlcyIsIngiLCJ5Iiwib3B0aW9ucyIsImF0dGFjaGFibGUiLCJjaGFsbGVuZ2VBcnJheSIsInZvbHRhZ2UiLCJpbnRlcmFjdGl2ZSIsIkNoYWxsZW5nZVNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hhbGxlbmdlU2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENoYWxsZW5nZXMgdGhhdCBhcHBlYXIgaW4gdGhlIGNvbWJvIGJveCBmb3IgdGhlIGJsYWNrIGJveCBjaXJjdWl0cy4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWJsYWNrLWJveC1zdHVkeS9pc3N1ZXMvNDEjaXNzdWVjb21tZW50LTI4MDcwNDI5N1xyXG4gKiBmb3IgYSBkZXNjcmlwdGlvbiBvZiBob3cgdG8gY3JlYXRlIG5ldyBjaXJjdWl0cy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkgZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHJlc2lzdGl2aXR5ID0gMUUtNDtcclxuXHJcbmNvbnN0IHdhcm11cENpcmN1aXRTdGF0ZU9iamVjdCA9IHtcclxuICB3aXJlczogW1xyXG4gICAge1xyXG4gICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgIHN0YXJ0VmVydGV4OiAwLFxyXG4gICAgICBlbmRWZXJ0ZXg6IDJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgIGVuZFZlcnRleDogMVxyXG4gICAgfVxyXG4gIF0sXHJcbiAgYmF0dGVyaWVzOiBbXSxcclxuICBsaWdodEJ1bGJzOiBbXSxcclxuICByZXNpc3RvcnM6IFtcclxuICAgIHtcclxuICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgIHN0YXJ0VmVydGV4OiAyLFxyXG4gICAgICBlbmRWZXJ0ZXg6IDNcclxuICAgIH1cclxuICBdLFxyXG4gIHN3aXRjaGVzOiBbXSxcclxuICB2ZXJ0aWNlczogW1xyXG4gICAge1xyXG4gICAgICB4OiAzODEsXHJcbiAgICAgIHk6IDMwNVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgeDogNjQxLFxyXG4gICAgICB5OiAzMDVcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHg6IDQ1MS4zMTExMTExMTExMTExMyxcclxuICAgICAgeTogMzA0LjM3Nzc3Nzc3Nzc3NzgsXHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB4OiA1NjEuMzExMTExMTExMTExMSxcclxuICAgICAgeTogMzA0LjM3Nzc3Nzc3Nzc3NzgsXHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG59O1xyXG5jb25zdCBjaGFsbGVuZ2VBcnJheSA9IFtcclxuXHJcbiAgLy8gQmxhY2sgQm94IDFcclxuICB7XHJcbiAgICB3aXJlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAwLFxyXG4gICAgICAgIGVuZFZlcnRleDogMlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAzLFxyXG4gICAgICAgIGVuZFZlcnRleDogMVxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgYmF0dGVyaWVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB2b2x0YWdlOiAxMCxcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDJcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGxpZ2h0QnVsYnM6IFtdLFxyXG4gICAgcmVzaXN0b3JzOiBbXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2NDEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0NjMuMzkyNTkyNTkyNTkyNyxcclxuICAgICAgICB5OiAzMDUsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1NjUuMzkyNTkyNTkyNTkyNyxcclxuICAgICAgICB5OiAzMDUsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyBCbGFjayBCb3ggMlxyXG4gIHtcclxuICAgIHdpcmVzOiBbIHtcclxuICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgZW5kVmVydGV4OiAxLFxyXG4gICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0gXSxcclxuICAgIGJhdHRlcmllczogW10sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW10sXHJcbiAgICBzd2l0Y2hlczogW10sXHJcbiAgICB2ZXJ0aWNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeDogMzgxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDNcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDFcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDVcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW10sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgICAgZW5kVmVydGV4OiA0XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBzd2l0Y2hlczogW10sXHJcbiAgICB2ZXJ0aWNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeDogMzgxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4LjY4OTMzNTM5NDEyNjgsXHJcbiAgICAgICAgeTogMTc4LjE4OTA3Nzc5NDk1MTA2XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0OTQuNzMwODk4OTc4MjE4MTQsXHJcbiAgICAgICAgeTogMjQzLjAxMjg3NjY3MTQwNzY0LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTc1LjcwNDc5MTM0NDY2NzgsXHJcbiAgICAgICAgeTogMzE3LjQ2NTczOTMwOTYzNDMsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0NzQuMTYwNzQxODg1NjI1OTUsXHJcbiAgICAgICAgeTogMzA0LjgwNDIyNDYyNjQ4MTEzLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgLy8gQmxhY2sgQm94IDNcclxuICB7XHJcbiAgICB3aXJlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAyLFxyXG4gICAgICAgIGVuZFZlcnRleDogM1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA0LFxyXG4gICAgICAgIGVuZFZlcnRleDogMVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAwLFxyXG4gICAgICAgIGVuZFZlcnRleDogNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogNFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgYmF0dGVyaWVzOiBbXSxcclxuICAgIGxpZ2h0QnVsYnM6IFtdLFxyXG4gICAgcmVzaXN0b3JzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3RhbmNlOiAxMCxcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDRcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2NDEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ5NC43MzA4OTg5NzgyMTgxNCxcclxuICAgICAgICB5OiAyNDMuMDEyODc2NjcxNDA3NjQsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1NzUuNzA0NzkxMzQ0NjY3OCxcclxuICAgICAgICB5OiAzMTcuNDY1NzM5MzA5NjM0MyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ3NC4xNjA3NDE4ODU2MjU5NSxcclxuICAgICAgICB5OiAzMDQuODA0MjI0NjI2NDgxMTMsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG5cclxuXHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDNcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDRcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDFcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW10sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3RhbmNlOiAxNSxcclxuICAgICAgICBzdGFydFZlcnRleDogNCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDVcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2NDEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ2Ni43OTMyMzA1NTk3NTc4LFxyXG4gICAgICAgIHk6IDI0Ni42NzM2MzI0NDMzODIxLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDM2LjI1NjMyODE1MDg4NDMsXHJcbiAgICAgICAgeTogMzE1LjExNTczMjM4ODAyOTgsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1NDUuOTcwOTcyNDIzODAyNyxcclxuICAgICAgICB5OiAzMjMuMDMzODY1NTA1NTYzNixcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcblxyXG4gIC8vIEJsYWNrIEJveCA0XHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDJcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDFcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDdcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW10sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgICAgZW5kVmVydGV4OiA0XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3RhbmNlOiAyNSxcclxuICAgICAgICBzdGFydFZlcnRleDogNSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDZcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2NDEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ5MS45MjU5Nzk2ODA2OTY1NyxcclxuICAgICAgICB5OiAyNTAuMjA5NDgyMzQxNTU3NzYsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1ODAuODM3NTUwNzkzMzg1LFxyXG4gICAgICAgIHk6IDMxNC45NzYyMzcxMDI1NzE4LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDQ4LjMwNDc4OTU1MDA3MjU0LFxyXG4gICAgICAgIHk6IDMwNi42ODU1MzQ1OTExOTQ5NCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUzNC4yMTk3MDcxMDA2NjUzLFxyXG4gICAgICAgIHk6IDM3NS4zNzc3OTcxOTk2OTI4NSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUxNi42NzA1MzcwMTAxNTk3LFxyXG4gICAgICAgIHk6IDQzNS45ODU5NzAwMDQ4Mzc5XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyBCbGFjayBCb3ggNVxyXG4gIHtcclxuICAgIHdpcmVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDAsXHJcbiAgICAgICAgZW5kVmVydGV4OiA2XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiAyXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgICAgZW5kVmVydGV4OiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiA0XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBiYXR0ZXJpZXM6IFtdLFxyXG4gICAgbGlnaHRCdWxiczogW10sXHJcbiAgICByZXNpc3RvcnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGFuY2U6IDQwLFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogM1xyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgc3dpdGNoZXM6IFtdLFxyXG4gICAgdmVydGljZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHg6IDM4MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDY0MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOC42ODkzMzUzOTQxMjY4LFxyXG4gICAgICAgIHk6IDE3OC4xODkwNzc3OTQ5NTEwNlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTk4LjY3MjA5MzYwOTA2LFxyXG4gICAgICAgIHk6IDMxMC41MTc2MDEzOTg2NTMxLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTE2LjY3MDUzNzAxMDE1OTcsXHJcbiAgICAgICAgeTogNDM1Ljk4NTk3MDAwNDgzNzlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS43NjA1MjI0OTYzNzE1LFxyXG4gICAgICAgIHk6IDI0NS43NTA4NDY2Mzc2MzkwMyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ0OC4zMDQ3ODk1NTAwNzI1NCxcclxuICAgICAgICB5OiAzMDYuNjg1NTM0NTkxMTk0OTQsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyBCbGFjayBCb3ggNlxyXG4gIHtcclxuICAgIHdpcmVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDAsXHJcbiAgICAgICAgZW5kVmVydGV4OiA0XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiAyXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgZW5kVmVydGV4OiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBiYXR0ZXJpZXM6IFtdLFxyXG4gICAgbGlnaHRCdWxiczogW10sXHJcbiAgICByZXNpc3RvcnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGFuY2U6IDE1LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogN1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBzd2l0Y2hlczogW10sXHJcbiAgICB2ZXJ0aWNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeDogMzgxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4LjY4OTMzNTM5NDEyNjgsXHJcbiAgICAgICAgeTogMTc4LjE4OTA3Nzc5NDk1MTA2XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDkuMjM5NDc3NTAzNjI4NDUsXHJcbiAgICAgICAgeTogNDM3LjQ3MjE4MTkwNjE0NDFcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQyOS43ODQ0MzAzODk1MDc5LFxyXG4gICAgICAgIHk6IDMwMS45NTM3NjE2NjI3NjI1LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5Ljc2MDUyMjQ5NjM3MTQ0LFxyXG4gICAgICAgIHk6IDIyNi40MzAwOTE5MjA2NTc5NixcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUxMS4yNDY3MzQzOTc2Nzc3LFxyXG4gICAgICAgIHk6IDMxMi42MzAzODIxOTY0MTk5LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTk4LjY3MjA5MzYwOTA2MDUsXHJcbiAgICAgICAgeTogMjkxLjE5Njg0NjY4MTY3MixcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcblxyXG4gIC8vIEJsYWNrIEJveCA3XHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDJcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDFcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDNcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdm9sdGFnZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogNDAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBzd2l0Y2hlczogW10sXHJcbiAgICB2ZXJ0aWNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeDogMzgxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4LjY4OTMzNTM5NDEyNjgsXHJcbiAgICAgICAgeTogMTc4LjE4OTA3Nzc5NDk1MTA2XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDkuMjM5NDc3NTAzNjI4NDUsXHJcbiAgICAgICAgeTogNDM3LjQ3MjE4MTkwNjE0NDFcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS43NjA1MjI0OTYzNzE0NCxcclxuICAgICAgICB5OiAyMjYuNDMwMDkxOTIwNjU3OTYsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0MjkuNTQ5MTE5ODk3MjA3NTYsXHJcbiAgICAgICAgeTogMjg5LjQzOTA2NjYyMzI3NDIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MTEuMjQ2NzM0Mzk3Njc3NyxcclxuICAgICAgICB5OiAzMTIuNjMwMzgyMTk2NDE5OSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDU5OC42NzIwOTM2MDkwNjA1LFxyXG4gICAgICAgIHk6IDI5MS4xOTY4NDY2ODE2NzIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyBCbGFjayBCb3ggMTAgb3IgbWF5YmUgOFxyXG4gIHtcclxuICAgIHdpcmVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDAsXHJcbiAgICAgICAgZW5kVmVydGV4OiA0XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiAyXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgZW5kVmVydGV4OiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHksXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgZW5kVmVydGV4OiA4XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBiYXR0ZXJpZXM6IFtdLFxyXG4gICAgbGlnaHRCdWxiczogW10sXHJcbiAgICByZXNpc3RvcnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGFuY2U6IDUsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3RhbmNlOiA1LFxyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA0LFxyXG4gICAgICAgIGVuZFZlcnRleDogNlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVzaXN0YW5jZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByZXNpc3RhbmNlOiAxMCxcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDhcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2NDEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS4yMzk0Nzc1MDM2Mjg0NSxcclxuICAgICAgICB5OiA0MzcuNDcyMTgxOTA2MTQ0MVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDI5LjQ3MzczMTExOTg0MjM0LFxyXG4gICAgICAgIHk6IDMwNi4wODIwMTk0MTYyMDk5LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5Ljc2MDUyMjQ5NjM3MTQ0LFxyXG4gICAgICAgIHk6IDIzMC44ODg3Mjc2MjQ1NzY3LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTE1LjI0MDQ3NDA4NDAzODYsXHJcbiAgICAgICAgeTogMzc0Ljk1OTE5ODUyMDEzMDAzLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTkyLjQ5NDA3ODUzODgxNjEsXHJcbiAgICAgICAgeTogMzAzLjM4MTIwMTA1ODUyNDc3LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjA4LjM5OTIyMTg3OTgwODgsXHJcbiAgICAgICAgeTogMzE2LjQ2NjA1NjEwOTAzOTg3LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgLy8gQmxhY2sgQm94IDExIG9yIG1heWJlIDlcclxuICB7XHJcbiAgICB3aXJlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiAxLFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDMsXHJcbiAgICAgICAgZW5kVmVydGV4OiA2LFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA1LFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3LFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDgsXHJcbiAgICAgICAgZW5kVmVydGV4OiAyLFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDAsXHJcbiAgICAgICAgZW5kVmVydGV4OiA5LFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgYmF0dGVyaWVzOiBbXSxcclxuICAgIGxpZ2h0QnVsYnM6IFtdLFxyXG4gICAgcmVzaXN0b3JzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgcmVzaXN0YW5jZTogNDBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA5LFxyXG4gICAgICAgIGVuZFZlcnRleDogOCxcclxuICAgICAgICByZXNpc3RhbmNlOiAyNVxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgc3dpdGNoZXM6IFtdLFxyXG4gICAgdmVydGljZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHg6IDM4MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOC42ODkzMzUzOTQxMjY4LFxyXG4gICAgICAgIHk6IDE3OC4xODkwNzc3OTQ5NTEwNlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5LjIzOTQ3NzUwMzYyODQ1LFxyXG4gICAgICAgIHk6IDQzNy40NzIxODE5MDYxNDQxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDkuMzkwOTc3NDQzNjA5LFxyXG4gICAgICAgIHk6IDIyNi4zMzczNDMzNTgzOTYwOCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDU5NC41MDg4MjQxMjUyNjk4LFxyXG4gICAgICAgIHk6IDI1MS44NjQxODI0ODkyMTgzLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTEwLjQxNTAzNzU5Mzk4NDksXHJcbiAgICAgICAgeTogMzk5LjM4MDQ1MTEyNzgxOTQ3LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTkyLjQwNzUxODc5Njk5MjUsXHJcbiAgICAgICAgeTogMzYxLjg0NDExMDI3NTY4OTIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1NTAuODMxNTc4OTQ3MzY4NixcclxuICAgICAgICB5OiAzMDQuODY5Njc0MTg1NDYzNixcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDQ0MC44MzE1Nzg5NDczNjg2LFxyXG4gICAgICAgIHk6IDMwNC44Njk2NzQxODU0NjM2LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgLy8gQmxhY2sgQm94IDEyXHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAxLFxyXG4gICAgICAgIGVuZFZlcnRleDogNCxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogMyxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogNCxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA4LFxyXG4gICAgICAgIGVuZFZlcnRleDogMixcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAwLFxyXG4gICAgICAgIGVuZFZlcnRleDogNixcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA2LFxyXG4gICAgICAgIGVuZFZlcnRleDogNSxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA3LFxyXG4gICAgICAgIGVuZFZlcnRleDogOCxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW10sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiA4LFxyXG4gICAgICAgIHJlc2lzdGFuY2U6IDQwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgcmVzaXN0YW5jZTogNDBcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDY0MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS4yMzk0Nzc1MDM2Mjg0NSxcclxuICAgICAgICB5OiA0MzcuNDcyMTgxOTA2MTQ0MVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4Ljc3MTUxNTgyOTU5MDYsXHJcbiAgICAgICAgeTogMjQzLjIyMzc2MTQ4MzIxNTI3LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5LjMyNzczMTA5MjQzNjksXHJcbiAgICAgICAgeTogNDA0LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDIzLjI1ODIxMjM3NTg1OTQ0LFxyXG4gICAgICAgIHk6IDMwNC4zNzU2MDQ3ODczNjk0NyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUzMy4yNTgyMTIzNzU4NTk0LFxyXG4gICAgICAgIHk6IDMwNC4zNzU2MDQ3ODczNjk0NyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDU5OS45NTk1MTEwNzcxNTgxLFxyXG4gICAgICAgIHk6IDMwNC43NDQwNzk0NDk5NjE4LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgLy8gQmxhY2sgQm94IDEzXHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAwLFxyXG4gICAgICAgIGVuZFZlcnRleDogNSxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA0LFxyXG4gICAgICAgIGVuZFZlcnRleDogMixcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA4LFxyXG4gICAgICAgIGVuZFZlcnRleDogMSxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiAzLFxyXG4gICAgICAgIGVuZFZlcnRleDogMTAsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMTAsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3LFxyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDksXHJcbiAgICAgICAgZW5kVmVydGV4OiAxMCxcclxuICAgICAgICByZXNpc3Rpdml0eTogcmVzaXN0aXZpdHlcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgZW5kVmVydGV4OiA3LFxyXG4gICAgICAgIHZvbHRhZ2U6IDEwXHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgZW5kVmVydGV4OiA2LFxyXG4gICAgICAgIHJlc2lzdGFuY2U6IDQwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogOSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDgsXHJcbiAgICAgICAgcmVzaXN0YW5jZTogNDBcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHN3aXRjaGVzOiBbXSxcclxuICAgIHZlcnRpY2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB4OiAzODEsXHJcbiAgICAgICAgeTogMzA1XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguNjg5MzM1Mzk0MTI2OCxcclxuICAgICAgICB5OiAxNzguMTg5MDc3Nzk0OTUxMDZcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDY0MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS4yMzk0Nzc1MDM2Mjg0NSxcclxuICAgICAgICB5OiA0MzcuNDcyMTgxOTA2MTQ0MVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjAzLjk4MzE5MzI3NzMxMDksXHJcbiAgICAgICAgeTogMzA1LjE1Nzg4MTMzNDM1MTk0LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDE3LFxyXG4gICAgICAgIHk6IDMwNC40ODUwMjYyMjQwMDI2NCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUyNyxcclxuICAgICAgICB5OiAzMDQuNDg1MDI2MjI0MDAyNjQsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA2MDIuNTg2MDk1MTcxNTM0MixcclxuICAgICAgICB5OiAzNzIuOTc0MDE5NjIyMzU2NTQsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MjUuODA3NjkxODQxNDQyNixcclxuICAgICAgICB5OiAyMzYuMjc2NDgzNjA2MDIwNzgsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYXR0YWNoYWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0MTcuNzgyMjc2NTQ2OTgyNCxcclxuICAgICAgICB5OiAyNTcuMDI1MjEwMDg0MDMzNyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOS4xOTYzMzMwNzg2ODYwNSxcclxuICAgICAgICB5OiA0MDAuODcwODkzODEyMDcwMyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcblxyXG4gIC8vIEJsYWNrIEJveCAxNFxyXG4gIHtcclxuICAgIHdpcmVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDEsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDIsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBiYXR0ZXJpZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA0LFxyXG4gICAgICAgIGVuZFZlcnRleDogNSxcclxuICAgICAgICB2b2x0YWdlOiAxMFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgbGlnaHRCdWxiczogW10sXHJcbiAgICByZXNpc3RvcnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA1LFxyXG4gICAgICAgIGVuZFZlcnRleDogNixcclxuICAgICAgICByZXNpc3RhbmNlOiA0MFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgc3dpdGNoZXM6IFtdLFxyXG4gICAgdmVydGljZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHg6IDM4MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOC42ODkzMzUzOTQxMjY4LFxyXG4gICAgICAgIHk6IDE3OC4xODkwNzc3OTQ5NTEwNlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5LjIzOTQ3NzUwMzYyODQ1LFxyXG4gICAgICAgIHk6IDQzNy40NzIxODE5MDYxNDQxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA0MjUuNDIwNTIwMjk5NzM5MzQsXHJcbiAgICAgICAgeTogMzA2LjQ3MDMwMzAxODAyODM1LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4LjM1MzIxODYwNzE1MDQ0LFxyXG4gICAgICAgIHk6IDM2NS44NTE4NDUxOTYxNDkxLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTEwLjU4MzU3Njg0MDY0MjU0LFxyXG4gICAgICAgIHk6IDI1NS44NzQ0NTg4NzQ0NTg4NyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDU3Mi42OTIxMzEzOTgwMTM3LFxyXG4gICAgICAgIHk6IDMwMy41OTMzMjgyNDAzODcwNSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBhdHRhY2hhYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcblxyXG4gIC8vIEJsYWNrIEJveCAxNVxyXG4gIHtcclxuICAgIHdpcmVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDcsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDYsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDIsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzdGFydFZlcnRleDogNixcclxuICAgICAgICBlbmRWZXJ0ZXg6IDUsXHJcbiAgICAgICAgcmVzaXN0aXZpdHk6IHJlc2lzdGl2aXR5XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBiYXR0ZXJpZXM6IFtdLFxyXG4gICAgbGlnaHRCdWxiczogW10sXHJcbiAgICByZXNpc3RvcnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHN0YXJ0VmVydGV4OiA2LFxyXG4gICAgICAgIGVuZFZlcnRleDogNyxcclxuICAgICAgICByZXNpc3RhbmNlOiA0MFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgc3dpdGNoZXM6IFtdLFxyXG4gICAgdmVydGljZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHg6IDM4MSxcclxuICAgICAgICB5OiAzMDVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHg6IDUwOC42ODkzMzUzOTQxMjY4LFxyXG4gICAgICAgIHk6IDE3OC4xODkwNzc3OTQ5NTEwNlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5LjIzOTQ3NzUwMzYyODQ1LFxyXG4gICAgICAgIHk6IDQzNy40NzIxODE5MDYxNDQxXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDguMzk0OTU3OTgzMTkzMjUsXHJcbiAgICAgICAgeTogMjIwLjI1ODIxMjM3NTg1OTQyLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTk2LjE2MDQyNzgwNzQ4NjYsXHJcbiAgICAgICAgeTogMzA1Ljk0MDE1Nzg4MTMzNDM2LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDE3LjkwNDYxMDU4MTY5MDc1LFxyXG4gICAgICAgIHk6IDMwMy45MTc2OTU4NTc5MTI1LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA5Ljk3ODYwOTYyNTY2ODI0LFxyXG4gICAgICAgIHk6IDM2NC4xMDM4OTYxMDM4OTYxLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgLy8gQmxhY2sgQm94IDE2XHJcbiAge1xyXG4gICAgd2lyZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMCxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDRcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogMyxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDJcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHJlc2lzdGl2aXR5OiByZXNpc3Rpdml0eSxcclxuICAgICAgICBzdGFydFZlcnRleDogNSxcclxuICAgICAgICBlbmRWZXJ0ZXg6IDFcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIGJhdHRlcmllczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdm9sdGFnZTogMTAsXHJcbiAgICAgICAgc3RhcnRWZXJ0ZXg6IDQsXHJcbiAgICAgICAgZW5kVmVydGV4OiAzXHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBsaWdodEJ1bGJzOiBbXSxcclxuICAgIHJlc2lzdG9yczogW10sXHJcbiAgICBzd2l0Y2hlczogW10sXHJcbiAgICB2ZXJ0aWNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeDogMzgxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNjQxLFxyXG4gICAgICAgIHk6IDMwNVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTA4LjY4OTMzNTM5NDEyNjgsXHJcbiAgICAgICAgeTogMTc4LjE4OTA3Nzc5NDk1MTA2XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB4OiA1MDkuNzYwNTIyNDk2MzcxNDQsXHJcbiAgICAgICAgeTogMjI2LjQzMDA5MTkyMDY1Nzk2LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNDI5LjU0OTExOTg5NzIwNzU2LFxyXG4gICAgICAgIHk6IDI4OS40MzkwNjY2MjMyNzQyLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeDogNTk4LjY3MjA5MzYwOTA2MDUsXHJcbiAgICAgICAgeTogMzA1LFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGF0dGFjaGFibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSBdO1xyXG5cclxuY29uc3QgQ2hhbGxlbmdlU2V0ID0ge1xyXG4gIHdhcm11cENpcmN1aXRTdGF0ZU9iamVjdDogd2FybXVwQ2lyY3VpdFN0YXRlT2JqZWN0LFxyXG4gIGNoYWxsZW5nZUFycmF5OiBjaGFsbGVuZ2VBcnJheVxyXG59O1xyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkucmVnaXN0ZXIoICdDaGFsbGVuZ2VTZXQnLCBDaGFsbGVuZ2VTZXQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENoYWxsZW5nZVNldDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQ0FBbUMsTUFBTSw4Q0FBOEM7O0FBRTlGO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLElBQUk7QUFFeEIsTUFBTUMsd0JBQXdCLEdBQUc7RUFDL0JDLEtBQUssRUFBRSxDQUNMO0lBQ0VGLFdBQVcsRUFBRUEsV0FBVztJQUN4Qkcs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