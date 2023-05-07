// Copyright 2022-2023, University of Colorado Boulder

/**
 * A double-headed arrow used to indicate something can be dragged horizontally.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import CAVColors from '../CAVColors.js';
import CAVConstants from '../CAVConstants.js';
import centerAndVariability from '../../centerAndVariability.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type DragIndicatorArrowNodeOptions = PickRequired<ArrowNodeOptions, 'tandem'> & Pick<ArrowNodeOptions, 'visible'>;

export default class DragIndicatorArrowNode extends ArrowNode {

  public constructor( options: DragIndicatorArrowNodeOptions ) {

    super( 0, 0, 35, 0, optionize<DragIndicatorArrowNodeOptions, EmptySelfOptions, ArrowNodeOptions>()( {
      headHeight: 8,
      headWidth: 12,
      tailWidth: 5,
      doubleHead: true,
      fill: CAVColors.dragIndicatorColorProperty,
      stroke: CAVColors.arrowStrokeProperty,
      lineWidth: CAVConstants.ARROW_LINE_WIDTH
    }, options ) );
  }
}

centerAndVariability.register( 'DragIndicatorArrowNode', DragIndicatorArrowNode );
