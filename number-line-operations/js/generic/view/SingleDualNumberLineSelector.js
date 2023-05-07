// Copyright 2020-2023, University of Colorado Boulder

/**
 * SingleDualNumberLineSelector defines a Scenery node with two radio buttons that are used to choose between "single
 * number line" and "dual number line" modes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const ARROW_ICON_LENGTH = 40;
const ARROW_ICON_OPTIONS = {
  doubleHead: true,
  tailWidth: 1
};

class SingleDualNumberLineSelector extends RectangularRadioButtonGroup {

  /**
   * @param {BooleanProperty} secondNumberLineVisibleProperty
   * @param {Object} [options]
   */
  constructor( secondNumberLineVisibleProperty, options ) {

    options = merge( {
      orientation: 'horizontal',
      spacing: 12,
      touchAreaXDilation: 2,
      touchAreaYDilation: 2,
      radioButtonOptions: {
        xMargin: 5,
        yMargin: 10,
        baseColor: 'white',
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 0.5,
          deselectedButtonOpacity: 0.5
        }
      }
    }, options );

    // radio button descriptor items
    const items = [
      {
        value: false,
        createNode: () => createDoubleArrowNode()
      },
      {
        value: true,
        createNode: () => new VBox( {
          children: [
            createDoubleArrowNode(),
            createDoubleArrowNode()
          ],
          spacing: 10
        } )
      }
    ];

    super( secondNumberLineVisibleProperty, items, options );
  }
}

// convenience function for creating the arrow nodes
const createDoubleArrowNode = () => new ArrowNode( -ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_OPTIONS );

numberLineOperations.register( 'SingleDualNumberLineSelector', SingleDualNumberLineSelector );
export default SingleDualNumberLineSelector;