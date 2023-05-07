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
  wires: [
    {
      resistivity: resistivity,
      startVertex: 0,
      endVertex: 2
    },
    {
      resistivity: resistivity,
      startVertex: 3,
      endVertex: 1
    }
  ],
  batteries: [],
  lightBulbs: [],
  resistors: [
    {
      resistance: 10,
      startVertex: 2,
      endVertex: 3
    }
  ],
  switches: [],
  vertices: [
    {
      x: 381,
      y: 305
    },
    {
      x: 641,
      y: 305
    },
    {
      x: 451.31111111111113,
      y: 304.3777777777778,
      options: {
        attachable: false
      }
    },
    {
      x: 561.3111111111111,
      y: 304.3777777777778,
      options: {
        attachable: false
      }
    }
  ]
};
const challengeArray = [

  // Black Box 1
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 3,
        endVertex: 1
      }
    ],
    batteries: [
      {
        voltage: 10,
        startVertex: 3,
        endVertex: 2
      }
    ],
    lightBulbs: [],
    resistors: [],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 463.3925925925927,
        y: 305,
        options: {
          attachable: false
        }
      },
      {
        x: 565.3925925925927,
        y: 305,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 2
  {
    wires: [ {
      resistivity: resistivity,
      startVertex: 0,
      endVertex: 1,
      options: {
        interactive: false
      }
    } ],
    batteries: [],
    lightBulbs: [],
    resistors: [],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      }
    ]
  },

  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 2,
        endVertex: 3
      },
      {
        resistivity: resistivity,
        startVertex: 4,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 5
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 10,
        startVertex: 3,
        endVertex: 4
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 494.73089897821814,
        y: 243.01287667140764,
        options: {
          attachable: false
        }
      },
      {
        x: 575.7047913446678,
        y: 317.4657393096343,
        options: {
          attachable: false
        }
      },
      {
        x: 474.16074188562595,
        y: 304.80422462648113,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 3
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 2,
        endVertex: 3
      },
      {
        resistivity: resistivity,
        startVertex: 4,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 5
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 4
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 10,
        startVertex: 3,
        endVertex: 4
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 494.73089897821814,
        y: 243.01287667140764,
        options: {
          attachable: false
        }
      },
      {
        x: 575.7047913446678,
        y: 317.4657393096343,
        options: {
          attachable: false
        }
      },
      {
        x: 474.16074188562595,
        y: 304.80422462648113,
        options: {
          attachable: false
        }
      }
    ]
  },


  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 2,
        endVertex: 3
      },
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 4
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 1
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 10,
        startVertex: 3,
        endVertex: 5
      },
      {
        resistance: 15,
        startVertex: 4,
        endVertex: 5
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 466.7932305597578,
        y: 246.6736324433821,
        options: {
          attachable: false
        }
      },
      {
        x: 436.2563281508843,
        y: 315.1157323880298,
        options: {
          attachable: false
        }
      },
      {
        x: 545.9709724238027,
        y: 323.0338655055636,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 4
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 5
      },
      {
        resistivity: resistivity,
        startVertex: 3,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 4,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 7
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 10,
        startVertex: 3,
        endVertex: 4
      },
      {
        resistance: 25,
        startVertex: 5,
        endVertex: 6
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 491.92597968069657,
        y: 250.20948234155776,
        options: {
          attachable: false
        }
      },
      {
        x: 580.837550793385,
        y: 314.9762371025718,
        options: {
          attachable: false
        }
      },
      {
        x: 448.30478955007254,
        y: 306.68553459119494,
        options: {
          attachable: false
        }
      },
      {
        x: 534.2197071006653,
        y: 375.37779719969285,
        options: {
          attachable: false
        }
      },
      {
        x: 516.6705370101597,
        y: 435.9859700048379
      }
    ]
  },

  // Black Box 5
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 6
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 3,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 4
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 5
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 40,
        startVertex: 5,
        endVertex: 3
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 598.67209360906,
        y: 310.5176013986531,
        options: {
          attachable: false
        }
      },
      {
        x: 516.6705370101597,
        y: 435.9859700048379
      },
      {
        x: 509.7605224963715,
        y: 245.75084663763903,
        options: {
          attachable: false
        }
      },
      {
        x: 448.30478955007254,
        y: 306.68553459119494,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 6
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 4
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 7,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 3
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 7
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 15,
        startVertex: 5,
        endVertex: 7
      },
      {
        resistance: 10,
        startVertex: 4,
        endVertex: 5
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 429.7844303895079,
        y: 301.9537616627625,
        options: {
          attachable: false
        }
      },
      {
        x: 509.76052249637144,
        y: 226.43009192065796,
        options: {
          attachable: false
        }
      },
      {
        x: 511.2467343976777,
        y: 312.6303821964199,
        options: {
          attachable: false
        }
      },
      {
        x: 598.6720936090605,
        y: 291.196846681672,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 7
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 5
      },
      {
        resistivity: resistivity,
        startVertex: 4,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 7,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 3
      }
    ],
    batteries: [
      {
        voltage: 10,
        startVertex: 4,
        endVertex: 5
      }
    ],
    lightBulbs: [],
    resistors: [
      {
        resistance: 40,
        startVertex: 4,
        endVertex: 7
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 509.76052249637144,
        y: 226.43009192065796,
        options: {
          attachable: false
        }
      },
      {
        x: 429.54911989720756,
        y: 289.4390666232742,
        options: {
          attachable: false
        }
      },
      {
        x: 511.2467343976777,
        y: 312.6303821964199,
        options: {
          attachable: false
        }
      },
      {
        x: 598.6720936090605,
        y: 291.196846681672,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 10 or maybe 8
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 4
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 7,
        endVertex: 1
      },
      {
        resistivity: resistivity,
        startVertex: 6,
        endVertex: 3
      },
      {
        resistivity: resistivity,
        startVertex: 7,
        endVertex: 8
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        resistance: 5,
        startVertex: 4,
        endVertex: 5
      },
      {
        resistance: 5,
        startVertex: 4,
        endVertex: 6
      },
      {
        resistance: 10,
        startVertex: 5,
        endVertex: 7
      },
      {
        resistance: 10,
        startVertex: 6,
        endVertex: 8
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 429.47373111984234,
        y: 306.0820194162099,
        options: {
          attachable: false
        }
      },
      {
        x: 509.76052249637144,
        y: 230.8887276245767,
        options: {
          attachable: false
        }
      },
      {
        x: 515.2404740840386,
        y: 374.95919852013003,
        options: {
          attachable: false
        }
      },
      {
        x: 592.4940785388161,
        y: 303.38120105852477,
        options: {
          attachable: false
        }
      },
      {
        x: 608.3992218798088,
        y: 316.46605610903987,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 11 or maybe 9
  {
    wires: [
      {
        startVertex: 4,
        endVertex: 1,
        resistivity: resistivity
      },
      {
        startVertex: 3,
        endVertex: 6,
        resistivity: resistivity
      },
      {
        startVertex: 4,
        endVertex: 5,
        resistivity: resistivity
      },
      {
        startVertex: 6,
        endVertex: 7,
        resistivity: resistivity
      },
      {
        startVertex: 8,
        endVertex: 2,
        resistivity: resistivity
      },
      {
        startVertex: 0,
        endVertex: 9,
        resistivity: resistivity
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        startVertex: 5,
        endVertex: 7,
        resistance: 40
      },
      {
        startVertex: 9,
        endVertex: 8,
        resistance: 25
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 509.390977443609,
        y: 226.33734335839608,
        options: {
          attachable: false
        }
      },
      {
        x: 594.5088241252698,
        y: 251.8641824892183,
        options: {
          attachable: false
        }
      },
      {
        x: 510.4150375939849,
        y: 399.38045112781947,
        options: {
          attachable: false
        }
      },
      {
        x: 592.4075187969925,
        y: 361.8441102756892,
        options: {
          attachable: false
        }
      },
      {
        x: 550.8315789473686,
        y: 304.8696741854636,
        options: {
          attachable: false
        }
      },
      {
        x: 440.8315789473686,
        y: 304.8696741854636,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 12
  {
    wires: [
      {
        startVertex: 1,
        endVertex: 4,
        resistivity: resistivity
      },
      {
        startVertex: 5,
        endVertex: 3,
        resistivity: resistivity
      },
      {
        startVertex: 5,
        endVertex: 4,
        resistivity: resistivity
      },
      {
        startVertex: 8,
        endVertex: 2,
        resistivity: resistivity
      },
      {
        startVertex: 0,
        endVertex: 6,
        resistivity: resistivity
      },
      {
        startVertex: 6,
        endVertex: 5,
        resistivity: resistivity
      },
      {
        startVertex: 7,
        endVertex: 8,
        resistivity: resistivity
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        startVertex: 4,
        endVertex: 8,
        resistance: 40
      },
      {
        startVertex: 6,
        endVertex: 7,
        resistance: 40
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 508.7715158295906,
        y: 243.22376148321527,
        options: {
          attachable: false
        }
      },
      {
        x: 509.3277310924369,
        y: 404,
        options: {
          attachable: false
        }
      },
      {
        x: 423.25821237585944,
        y: 304.37560478736947,
        options: {
          attachable: false
        }
      },
      {
        x: 533.2582123758594,
        y: 304.37560478736947,
        options: {
          attachable: false
        }
      },
      {
        x: 599.9595110771581,
        y: 304.7440794499618,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 13
  {
    wires: [
      {
        startVertex: 0,
        endVertex: 5,
        resistivity: resistivity
      },
      {
        startVertex: 4,
        endVertex: 2,
        resistivity: resistivity
      },
      {
        startVertex: 8,
        endVertex: 1,
        resistivity: resistivity
      },
      {
        startVertex: 3,
        endVertex: 10,
        resistivity: resistivity
      },
      {
        startVertex: 10,
        endVertex: 7,
        resistivity: resistivity
      },
      {
        startVertex: 9,
        endVertex: 10,
        resistivity: resistivity
      }
    ],
    batteries: [
      {
        startVertex: 6,
        endVertex: 7,
        voltage: 10
      }
    ],
    lightBulbs: [],
    resistors: [
      {
        startVertex: 5,
        endVertex: 6,
        resistance: 40
      },
      {
        startVertex: 9,
        endVertex: 8,
        resistance: 40
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 603.9831932773109,
        y: 305.15788133435194,
        options: {
          attachable: false
        }
      },
      {
        x: 417,
        y: 304.48502622400264,
        options: {
          attachable: false
        }
      },
      {
        x: 527,
        y: 304.48502622400264,
        options: {
          attachable: false
        }
      },
      {
        x: 602.5860951715342,
        y: 372.97401962235654,
        options: {
          attachable: false
        }
      },
      {
        x: 525.8076918414426,
        y: 236.27648360602078,
        options: {
          attachable: false
        }
      },
      {
        x: 417.7822765469824,
        y: 257.0252100840337,
        options: {
          attachable: false
        }
      },
      {
        x: 509.19633307868605,
        y: 400.8708938120703,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 14
  {
    wires: [
      {
        startVertex: 0,
        endVertex: 4,
        resistivity: resistivity
      },
      {
        startVertex: 3,
        endVertex: 5,
        resistivity: resistivity
      },
      {
        startVertex: 6,
        endVertex: 1,
        resistivity: resistivity
      },
      {
        startVertex: 7,
        endVertex: 2,
        resistivity: resistivity
      }
    ],
    batteries: [
      {
        startVertex: 4,
        endVertex: 5,
        voltage: 10
      }
    ],
    lightBulbs: [],
    resistors: [
      {
        startVertex: 5,
        endVertex: 6,
        resistance: 40
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 425.42052029973934,
        y: 306.47030301802835,
        options: {
          attachable: false
        }
      },
      {
        x: 508.35321860715044,
        y: 365.8518451961491,
        options: {
          attachable: false
        }
      },
      {
        x: 510.58357684064254,
        y: 255.87445887445887,
        options: {
          attachable: false
        }
      },
      {
        x: 572.6921313980137,
        y: 303.59332824038705,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 15
  {
    wires: [
      {
        startVertex: 3,
        endVertex: 7,
        resistivity: resistivity
      },
      {
        startVertex: 1,
        endVertex: 4,
        resistivity: resistivity
      },
      {
        startVertex: 7,
        endVertex: 4,
        resistivity: resistivity
      },
      {
        startVertex: 0,
        endVertex: 6,
        resistivity: resistivity
      },
      {
        startVertex: 5,
        endVertex: 2,
        resistivity: resistivity
      },
      {
        startVertex: 6,
        endVertex: 5,
        resistivity: resistivity
      }
    ],
    batteries: [],
    lightBulbs: [],
    resistors: [
      {
        startVertex: 6,
        endVertex: 7,
        resistance: 40
      }
    ],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 509.23947750362845,
        y: 437.4721819061441
      },
      {
        x: 508.39495798319325,
        y: 220.25821237585942,
        options: {
          attachable: false
        }
      },
      {
        x: 596.1604278074866,
        y: 305.94015788133436,
        options: {
          attachable: false
        }
      },
      {
        x: 417.90461058169075,
        y: 303.9176958579125,
        options: {
          attachable: false
        }
      },
      {
        x: 509.97860962566824,
        y: 364.1038961038961,
        options: {
          attachable: false
        }
      }
    ]
  },

  // Black Box 16
  {
    wires: [
      {
        resistivity: resistivity,
        startVertex: 0,
        endVertex: 4
      },
      {
        resistivity: resistivity,
        startVertex: 3,
        endVertex: 2
      },
      {
        resistivity: resistivity,
        startVertex: 5,
        endVertex: 1
      }
    ],
    batteries: [
      {
        voltage: 10,
        startVertex: 4,
        endVertex: 3
      }
    ],
    lightBulbs: [],
    resistors: [],
    switches: [],
    vertices: [
      {
        x: 381,
        y: 305
      },
      {
        x: 641,
        y: 305
      },
      {
        x: 508.6893353941268,
        y: 178.18907779495106
      },
      {
        x: 509.76052249637144,
        y: 226.43009192065796,
        options: {
          attachable: false
        }
      },
      {
        x: 429.54911989720756,
        y: 289.4390666232742,
        options: {
          attachable: false
        }
      },
      {
        x: 598.6720936090605,
        y: 305,
        options: {
          attachable: false
        }
      }
    ]
  } ];

const ChallengeSet = {
  warmupCircuitStateObject: warmupCircuitStateObject,
  challengeArray: challengeArray
};

circuitConstructionKitBlackBoxStudy.register( 'ChallengeSet', ChallengeSet );

export default ChallengeSet;