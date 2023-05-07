// Copyright 2023, University of Colorado Boulder

import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import CAVColors from '../CAVColors.js';
import centerAndVariability from '../../centerAndVariability.js';
import CAVConstants from '../CAVConstants.js';

export default class PlayAreaMedianIndicatorNode extends ArrowNode {
  public constructor() {
    super( 0, 0, 0, 27, {
      fill: CAVColors.medianColorProperty,
      stroke: CAVColors.arrowStrokeProperty,
      lineWidth: CAVConstants.ARROW_LINE_WIDTH,
      headHeight: 12,
      headWidth: 18
    } );
  }
}

centerAndVariability.register( 'PlayAreaMedianIndicatorNode', PlayAreaMedianIndicatorNode );