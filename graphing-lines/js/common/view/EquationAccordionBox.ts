// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base class for accordion boxes that contains the interactive equation and related controls
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HSeparator, Node, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import GLColors from '../GLColors.js';
import Line from '../model/Line.js';

// constants
const BUTTON_FONT = new PhetFont( 18 );

export default class EquationAccordionBox extends AccordionBox {

  protected constructor( titleNode: Node, interactiveEquationNode: Node, interactiveLineProperty: TReadOnlyProperty<Line>,
                         savedLines: ObservableArray<Line>, expandedProperty: Property<boolean>, tandem: Tandem ) {

    const options: AccordionBoxOptions = {
      titleNode: titleNode,
      expandedProperty: expandedProperty,
      fill: GLColors.CONTROL_PANEL_BACKGROUND,
      titleXSpacing: 5,
      titleYMargin: 10,
      contentXMargin: 10,
      contentYMargin: 10,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 30
      },
      tandem: tandem
    };

    // Save Line button
    const saveLineButton = new TextPushButton( GraphingLinesStrings.saveLine, {
      listener: () => savedLines.add( interactiveLineProperty.value.withColor( GLColors.SAVED_LINE_NORMAL ) ),
      font: BUTTON_FONT,
      baseColor: 'white',
      xMargin: 10
    } );

    // Erase Lines button
    const eraseLinesButton = new TextPushButton( GraphingLinesStrings.eraseLines, {
      listener: () => savedLines.clear(),
      font: BUTTON_FONT,
      baseColor: 'white',
      xMargin: 10
    } );

    // horizontal layout of buttons
    const buttonGroup = new HBox( {
      spacing: 20,
      maxWidth: 320,
      children: [ saveLineButton, eraseLinesButton ]
    } );

    // Disable eraseLinesButton when there are no saved lines. unlink not needed.
    savedLines.lengthProperty.link( length => {
      eraseLinesButton.enabled = ( length > 0 );
    } );

    const separatorOptions = { stroke: 'rgb( 212, 212, 212 )' };

    const contentNode = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        new HSeparator( separatorOptions ),
        interactiveEquationNode,
        new HSeparator( separatorOptions ),
        buttonGroup
      ]
    } );

    super( contentNode, options );
  }
}

graphingLines.register( 'EquationAccordionBox', EquationAccordionBox );