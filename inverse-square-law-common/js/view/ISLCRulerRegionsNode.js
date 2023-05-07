// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows the regions that a ruler can occupy in vertical space. These regions are used for interactive description of
 * the ruler.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { Path } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

/**
 * @param {Array.<number>} rulerRegionPositions - a list of y values that are the ruler region boundaries
 * @param {Bounds2} layoutBounds
 * @param {Object} [options]
 * @constructor
 */
class ISLCRulerRegionsNode extends Path {
  constructor( rulerRegionPositions, layoutBounds, options ) {

    options = merge( {
      stroke: 'rgba(237,54,187,0.6)',
      lineWidth: 1.5
    }, options );

    const regionsShape = new Shape();

    rulerRegionPositions.forEach( position => {

      // draw the grid line
      regionsShape.moveTo( layoutBounds.left, position );
      regionsShape.lineTo( layoutBounds.right, position );
    } );

    super( regionsShape, options );
  }
}

inverseSquareLawCommon.register( 'ISLCRulerRegionsNode', ISLCRulerRegionsNode );
export default ISLCRulerRegionsNode;