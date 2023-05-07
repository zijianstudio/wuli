// Copyright 2018-2023, University of Colorado Boulder

/**
 * Accordion box for showing and hiding terms of the interactive quadratic equation.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { AlignBox, AlignBoxOptions, AlignGroup, HSeparator, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQCheckbox from '../../common/view/GQCheckbox.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';
import ExploreViewProperties from './ExploreViewProperties.js';

type SelfOptions = EmptySelfOptions;

type QuadraticTermsAccordionBoxOptions = SelfOptions & PickRequired<AccordionBoxOptions, 'tandem' | 'expandedProperty'>;

export default class QuadraticTermsAccordionBox extends AccordionBox {

  public constructor( viewProperties: ExploreViewProperties, providedOptions: QuadraticTermsAccordionBoxOptions ) {

    const options = optionize4<QuadraticTermsAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()(
      {}, GQConstants.ACCORDION_BOX_OPTIONS, {

        // AccordionBoxOptions
        titleAlignX: 'left',
        titleXSpacing: 8,
        phetioDocumentation: 'the Quadratic Terms accordion box'
      }, providedOptions );

    // AccordionBox title
    options.titleNode = new Text( GraphingQuadraticsStrings.quadraticTerms, {
      font: GQConstants.TITLE_FONT,
      maxWidth: 180, // determined empirically
      tandem: options.tandem.createTandem( 'titleText' ),
      phetioDocumentation: 'the title on this accordion box',
      visiblePropertyOptions: { phetioReadOnly: true }
    } );

    // y = ax^2
    const quadraticTermCheckbox = GQCheckbox.createQuadraticTermCheckbox( viewProperties.quadraticTermVisibleProperty,
      options.tandem.createTandem( 'quadraticTermCheckbox' ) );

    // y = bx
    const linearTermCheckbox = GQCheckbox.createLinearTermCheckbox( viewProperties.linearTermVisibleProperty,
      options.tandem.createTandem( 'linearTermCheckbox' ) );

    // y = c
    const constantTermCheckbox = GQCheckbox.createConstantTermCheckbox( viewProperties.constantTermVisibleProperty,
      options.tandem.createTandem( 'constantTermCheckbox' ) );

    // Equations
    const equationsCheckbox = GQCheckbox.createEquationsCheckbox( viewProperties.equationsVisibleProperty,
      options.tandem.createTandem( 'equationsCheckbox' ) );

    // To make all checkboxes have the same effective width
    const alignBoxOptions: AlignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'left'
    };

    // vertical layout
    const contentNode = new VBox( {
      align: 'left',
      spacing: GQConstants.CHECKBOXES_Y_SPACING,
      children: [
        new AlignBox( quadraticTermCheckbox, alignBoxOptions ),
        new AlignBox( linearTermCheckbox, alignBoxOptions ),
        new AlignBox( constantTermCheckbox, alignBoxOptions ),
        new HSeparator( {
          stroke: GQColors.SEPARATOR,
          minimumWidth: 1.1 * options.titleNode.width
        } ),
        new AlignBox( equationsCheckbox, alignBoxOptions )
      ]
    } );

    super( contentNode, options );
  }
}

graphingQuadratics.register( 'QuadraticTermsAccordionBox', QuadraticTermsAccordionBox );