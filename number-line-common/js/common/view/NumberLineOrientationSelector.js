// Copyright 2020-2023, University of Colorado Boulder

/**
 * A node that controls a number line's orientation
 *
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import numberLineCommon from '../../numberLineCommon.js';

const ARROW_ICON_LENGTH = 40;
const ORIENTATION_BUTTON_DILATION = 2;

class NumberLineOrientationSelector extends RectangularRadioButtonGroup {

  /**
   * @param {Property.<Orientation>} orientationProperty
   * @param {Object} [options]
   */
  constructor( orientationProperty, options ) {
    const arrowIconOptions = {
      doubleHead: true,
      tailWidth: 1
    };

    // Map the orientation icons to their enum values.
    const orientationButtonsContent = [
      {
        value: Orientation.HORIZONTAL,
        createNode: () => new ArrowNode( -ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_LENGTH / 2, 0, arrowIconOptions )
      },
      {
        value: Orientation.VERTICAL,
        createNode: () => new ArrowNode( 0, -ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_LENGTH / 2, arrowIconOptions )
      }
    ];

    // orientation radio buttons
    super(
      orientationProperty,
      orientationButtonsContent,
      merge( {
        orientation: 'horizontal',
        spacing: 12,
        touchAreaXDilation: ORIENTATION_BUTTON_DILATION,
        touchAreaYDilation: ORIENTATION_BUTTON_DILATION,
        radioButtonOptions: {
          xMargin: 5,
          yMargin: 5,
          baseColor: 'white',
          buttonAppearanceStrategyOptions: {
            selectedLineWidth: 2,
            deselectedLineWidth: 0.5,
            deselectedButtonOpacity: 0.25
          }
        }
      }, options ) );
  }

}

numberLineCommon.register( 'NumberLineOrientationSelector', NumberLineOrientationSelector );
export default NumberLineOrientationSelector;
