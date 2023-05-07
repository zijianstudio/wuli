// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for all accordion boxes in Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Rectangle, Text, TextOptions } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = {
  titleStringProperty: TReadOnlyProperty<string>;
  titleTextOptions?: StrictOmit<TextOptions, 'tandem'>;
};
export type NumberSuiteCommonAccordionBoxOptions = SelfOptions & StrictOmit<AccordionBoxOptions, 'titleNode'>;

// constants
const PADDING = 10;
const EXPAND_COLLAPSE_BUTTON_SIZE = 20;

class NumberSuiteCommonAccordionBox extends AccordionBox {

  // expose contentNode so subclasses can add their content to it
  protected readonly contentNode: Rectangle;

  // expose the full bounds of the visible area inside the accordion box (updated in the link below)
  protected readonly contentBoundsProperty: TProperty<Bounds2>;

  protected constructor( contentWidth: number, contentHeightProperty: TReadOnlyProperty<number>,
                         providedOptions: NumberSuiteCommonAccordionBoxOptions ) {

    const titleText = new Text( providedOptions.titleStringProperty, combineOptions<TextOptions>( {
                        font: NumberSuiteCommonConstants.ACCORDION_BOX_TITLE_FONT
                      }, providedOptions.titleTextOptions ) );

    const options = optionize<NumberSuiteCommonAccordionBoxOptions, StrictOmit<SelfOptions, 'titleTextOptions'>, AccordionBoxOptions>()( {
      titleNode: titleText,
      titleAlignX: 'left',
      titleXSpacing: 8,
      showTitleWhenExpanded: false,
      cornerRadius: 6,
      titleYMargin: PADDING,
      buttonXMargin: PADDING,
      buttonYMargin: PADDING,
      contentXMargin: PADDING,
      contentYMargin: 0,
      contentXSpacing: 0,
      contentAlign: 'left',
      expandCollapseButtonOptions: {
        sideLength: EXPAND_COLLAPSE_BUTTON_SIZE
      }
    }, providedOptions );

    const contentNode = new Rectangle( {
      rectWidth: contentWidth - EXPAND_COLLAPSE_BUTTON_SIZE - ( PADDING * 2 ),
      rectHeight: contentHeightProperty.value
    } );

    super( contentNode, options );

    this.contentNode = contentNode;

    this.contentBoundsProperty = new Property( Bounds2.NOTHING );

    // update the accordion box content bounds when the height changes
    contentHeightProperty.link( height => {
      const innerContentBounds = new Bounds2( contentNode.left, contentNode.top, contentNode.right, height );

      // override the local bounds so they don't change
      contentNode.localBounds = innerContentBounds;

      // set the full bounds of the visible area inside the accordion box
      this.contentBoundsProperty.value = innerContentBounds.withOffsets( PADDING + EXPAND_COLLAPSE_BUTTON_SIZE, 0, PADDING, 0 );

      assert && assert( this.contentBoundsProperty.value.width === contentWidth,
        'available content bounds width should match provided contentWidth' );
      assert && assert( this.contentBoundsProperty.value.height === height,
        'available content bounds height should match provided height' );
    } );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonAccordionBox', NumberSuiteCommonAccordionBox );
export default NumberSuiteCommonAccordionBox;