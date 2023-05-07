// Copyright 2013-2022, University of Colorado Boulder

/**
 * Type that defines 'mystery masses', which are masses whose mass value is
 * not labeled, so the users must determine it by testing it against known
 * mass values.
 */

import merge from '../../../../../phet-core/js/merge.js';
import mysteryObject01_png from '../../../../images/mysteryObject01_png.js';
import mysteryObject02_png from '../../../../images/mysteryObject02_png.js';
import mysteryObject03_png from '../../../../images/mysteryObject03_png.js';
import mysteryObject04_png from '../../../../images/mysteryObject04_png.js';
import mysteryObject05_png from '../../../../images/mysteryObject05_png.js';
import mysteryObject06_png from '../../../../images/mysteryObject06_png.js';
import mysteryObject07_png from '../../../../images/mysteryObject07_png.js';
import mysteryObject08_png from '../../../../images/mysteryObject08_png.js';
import balancingAct from '../../../balancingAct.js';
import BalancingActStrings from '../../../BalancingActStrings.js';
import BAQueryParameters from '../../BAQueryParameters.js';
import LabeledImageMass from './LabeledImageMass.js';

const massLabelAString = BalancingActStrings.massLabelA;
const massLabelBString = BalancingActStrings.massLabelB;
const massLabelCString = BalancingActStrings.massLabelC;
const massLabelDString = BalancingActStrings.massLabelD;
const massLabelEString = BalancingActStrings.massLabelE;
const massLabelFString = BalancingActStrings.massLabelF;
const massLabelGString = BalancingActStrings.massLabelG;
const massLabelHString = BalancingActStrings.massLabelH;

// in kg
const massValues = BAQueryParameters.stanford ? [ 15, 50, 2, 7, 32, 23, 18, 54 ] : [ 20, 5, 15, 10, 3, 50, 25, 7.5 ];

// Mass configurations
const MYSTERY_MASS_CONFIGURATIONS = [
  // Note that the height value needs to be somewhat coordinated with the
  // image for things to look good.
  {
    massValue: massValues[ 0 ], // in kg
    image: mysteryObject01_png,
    height: 0.25, // in meters
    labelText: massLabelAString,
    isMystery: true
  },
  {
    massValue: massValues[ 1 ], // in kg
    image: mysteryObject02_png,
    height: 0.30, // in meters
    labelText: massLabelBString,
    isMystery: true
  },
  {
    massValue: massValues[ 2 ], // in kg
    image: mysteryObject03_png,
    height: 0.35, // in meters
    labelText: massLabelCString,
    isMystery: true
  },
  {
    massValue: massValues[ 3 ], // in kg
    image: mysteryObject04_png,
    height: 0.4, // in meters
    labelText: massLabelDString,
    isMystery: true
  },
  {
    massValue: massValues[ 4 ], // in kg
    image: mysteryObject05_png,
    height: 0.25, // in meters
    labelText: massLabelEString,
    isMystery: true
  },
  {
    massValue: massValues[ 5 ], // in kg
    image: mysteryObject06_png,
    height: 0.35, // in meters
    labelText: massLabelFString,
    isMystery: true
  },
  {
    massValue: massValues[ 6 ], // in kg
    image: mysteryObject07_png,
    height: 0.4, // in meters
    labelText: massLabelGString,
    isMystery: true
  },
  {
    massValue: massValues[ 7 ], // in kg
    image: mysteryObject08_png,
    height: 0.3, // in meters
    labelText: massLabelHString,
    isMystery: true
  }
];

class MysteryMass extends LabeledImageMass {

  /**
   * @param {Vector2} initialPosition
   * @param {number} mysteryMassId
   * @param {Object} [options]
   */
  constructor( initialPosition, mysteryMassId, options ) {
    assert && assert( typeof mysteryMassId === 'number', 'mysteryMassId must be a number' );
    const config = merge( options, MYSTERY_MASS_CONFIGURATIONS[ mysteryMassId ] );

    super( initialPosition, config );
    this.mysteryMassId = mysteryMassId;
  }

  /**
   * @public
   */
  createCopy() {
    return new MysteryMass( this.positionProperty.get(), this.mysteryMassId );
  }
}

balancingAct.register( 'MysteryMass', MysteryMass );

export default MysteryMass;