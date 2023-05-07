// Copyright 2022-2023, University of Colorado Boulder

/**
 * Accordion box used in all of the soccer screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import { AlignBox, Node, Rectangle } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import CAVConstants from '../CAVConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import centerAndVariability from '../../centerAndVariability.js';
import { Shape } from '../../../../kite/js/imports.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import TEmitter from '../../../../axon/js/TEmitter.js';

type SelfOptions = {
  leftMargin: number;
};
export type CAVAccordionBoxOptions =
  SelfOptions
  & StrictOmit<AccordionBoxOptions, 'titleNode' | 'expandedProperty'>
  & PickRequired<AccordionBoxOptions, 'tandem'>;

// constants
const CONTENT_MARGIN = 10;
const BUTTON_SIDE_LENGTH = 20;

export default class CAVAccordionBox extends AccordionBox {

  public readonly plotNode: Node;

  // NOTE: The positions of the passed-in nodes are modified directly, so they cannot be used in the scenery DAG
  public constructor( resetEmitter: TEmitter, plotNode: Node, titleNode: Node,
                      layoutBounds: Bounds2, checkboxGroup: Node, providedOptions: CAVAccordionBoxOptions ) {

    const options = optionize<CAVAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {
      titleAlignX: 'left',
      titleXSpacing: 8,
      cornerRadius: 6,
      titleYMargin: CONTENT_MARGIN,
      buttonXMargin: CONTENT_MARGIN,
      buttonYMargin: CONTENT_MARGIN,
      contentXMargin: CONTENT_MARGIN,
      contentYMargin: 0,
      contentYSpacing: 0,
      contentAlign: 'left',
      expandCollapseButtonOptions: {
        sideLength: BUTTON_SIDE_LENGTH
      },
      // TODO: This is currently highlighting a layout issues with AccordionBox, see: https://github.com/phetsims/center-and-variability/issues/166
      titleBarOptions: {
        stroke: 'black'
      },
      titleNode: titleNode
    }, providedOptions );

    const backgroundNode = new Rectangle( {
      rectHeight: 140,
      rectWidth: layoutBounds.width - CAVConstants.SCREEN_VIEW_X_MARGIN * 2 - CONTENT_MARGIN * 2 - options.leftMargin
    } );

    // Since the title is visible while the accordion box is open, this background will not any area above the bottom of
    // the expand/collapse button. To vertically-center things, make a new set of bounds that includes the missing space.
    // Values come from the height of the expand/collapse button plus the y margin above and below it. Also add the
    // horizontal content margin that is not part of backgroundNode so these bounds are the full area of the accordion box.
    const fullBackgroundBounds =
      backgroundNode.localBounds.withOffsets( CONTENT_MARGIN, CONTENT_MARGIN * 2 + BUTTON_SIDE_LENGTH, CONTENT_MARGIN, 0 );

    // add clip area so dot stacks that are taller than the accordion box are clipped appropriately
    backgroundNode.clipArea = Shape.bounds( fullBackgroundBounds );

    // Vertical positioning
    plotNode.centerY = fullBackgroundBounds.centerY;
    if ( plotNode.bottom > fullBackgroundBounds.bottom - 5 ) {
      plotNode.bottom = fullBackgroundBounds.bottom - 5;
    }
    backgroundNode.addChild( plotNode );

    const checkboxAlignBox = new AlignBox( checkboxGroup,
      { xAlign: 'right', yAlign: 'center', rightMargin: 20, alignBounds: fullBackgroundBounds } );

    backgroundNode.addChild( checkboxAlignBox );

    super( backgroundNode, options );

    resetEmitter.addListener( () => this.reset() );

    this.plotNode = plotNode;
  }

}

centerAndVariability.register( 'CAVAccordionBox', CAVAccordionBox );