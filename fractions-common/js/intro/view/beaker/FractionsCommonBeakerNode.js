// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a beaker graphic
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import merge from '../../../../../phet-core/js/merge.js';
import BeakerNode from '../../../../../scenery-phet/js/BeakerNode.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';

// constants
const EMPTY_BEAKER_COLOR = FractionsCommonColors.emptyBeakerProperty;
const WATER_COLOR = FractionsCommonColors.waterProperty;
const BEAKER_SHINE_COLOR = FractionsCommonColors.beakerShineProperty;

class FractionsCommonBeakerNode extends BeakerNode {
  /**
   * @param {number} numerator
   * @param {number} denominator
   * @param {Object} [options]
   */
  constructor( numerator, denominator, options ) {
    assert && assert( typeof numerator === 'number' && numerator >= 0 && numerator % 1 === 0 );
    assert && assert( typeof denominator === 'number' && denominator >= 1 && denominator % 1 === 0 );
    options = merge( {
      // {number}
      emptyBeakerFill: EMPTY_BEAKER_COLOR,
      solutionFill: options?.colorOverride ? options.colorOverride : WATER_COLOR,
      beakerGlareFill: BEAKER_SHINE_COLOR,
      beakerWidth: 80,
      beakerHeight: FractionsCommonBeakerNode.DEFAULT_BEAKER_HEIGHT,
      yRadiusOfEnds: 12,
      numberOfTicks: denominator - 1,
      ticksVisible: true,
      stroke: 'grey'
    }, options );
    const waterLevelProperty = new NumberProperty( numerator / denominator, {
      range: new Range( 0, 1 )
    } );
    super( waterLevelProperty, options );
  }
}

// @public {number} - The normal height of a beaker
FractionsCommonBeakerNode.DEFAULT_BEAKER_HEIGHT = 150;

fractionsCommon.register( 'FractionsCommonBeakerNode', FractionsCommonBeakerNode );
export default FractionsCommonBeakerNode;