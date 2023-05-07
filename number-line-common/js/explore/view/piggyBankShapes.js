// Copyright 2020-2022, University of Colorado Boulder

/**
 * singleton that provides the shape of a piggy bank, suitable for providing to a Scenery Path node
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const NLI_LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;

const PIGGY_BANK_SVG_STRING =
  'M471.262,415.361c-3,15.5-13.5,47-41.5,66c0,0-16,7.5-24.5,32.5\n' +
  '\tc0,0,2.5,7-20.5,7s-19.5-6-19.5-6s-2-10.5-32-9.5c-27.503,0.916-33-3-43.5,0s-11.5,11-11.5,11s-2,4.5-20,4c0,0-20.5,2-21.5-6.5\n' +
  '\ts-9-20.5-15.5-24.5s-26-15.5-34.5-29s-32-16-32-16s-11.5,0.5-14-9s-2.5-43.5-2.5-43.5s-0.5-10.5,12-13s18.5-13,18.5-13\n' +
  '\ts4.615-16.491,17.957-34.329c-1.664-10.116-1.207-19.638,4.043-24.421c0.972-0.886,2.2-1.551,3.612-2.05\n' +
  '\tc-1.293-9.036-1.856-21.138,3.388-25.282c8.75-6.917,34.917,8.333,41.667,11.833c0,0,1.269,0.984,1.718,1.117\n' +
  '\tc5.673-1.913,75.15-24.218,156.115,2.132c13.926,4.532,25.339,10.428,34.698,17.174c2.614-2.025,8.027-1.944,13.425,0.698\n' +
  '\tc2.977-1.024,7.253-0.278,13.332,4.709c0,0,6.274,6.274,2.091,12.133c-0.2,0.281-0.421,0.534-0.654,0.764\n' +
  '\tc1.419,4.26,0.534,7.22-1.983,9.94C476.816,371.247,473.151,405.6,471.262,415.361z';

// unscaled version of the piggy bank shape
// NOTE: In late August 2019 we decided to reverse the orientation of the piggy banks to point to the right instead of
// the left.  However, flipping the image in the AI file and then saving it as SVG didn't seem to work - it kept
// throwing exceptions upon loading, so I (jbphet) worked around this by loading the left-facing version and flipping
// it.  Hence the transformation on the next line.
const PIGGY_BANK_SHAPE = new Shape( PIGGY_BANK_SVG_STRING ).transformed( Matrix3.scale( -1, 1 ) );

class PiggyBankShapes {

  /**
   * @public
   */
  constructor() {

    // Scale the shape to be reasonably sized.
    const mediumVersionScale = ( NLI_LAYOUT_BOUNDS.width / 8 ) / PIGGY_BANK_SHAPE.bounds.width;
    const mediumScaleTransform = Matrix3.scale( mediumVersionScale, mediumVersionScale );
    this.MEDIUM_PIGGY_BANK_SHAPE = PIGGY_BANK_SHAPE.transformed( mediumScaleTransform );
  }
}

const piggyBankShapes = new PiggyBankShapes();
numberLineCommon.register( 'piggyBankShapes', piggyBankShapes );
export default piggyBankShapes;