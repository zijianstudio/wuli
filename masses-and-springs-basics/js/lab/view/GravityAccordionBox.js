// Copyright 2018-2022, University of Colorado Boulder

/**
 * AccordionBox for the gravity options.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import MassesAndSpringsConstants from '../../../../masses-and-springs/js/common/MassesAndSpringsConstants.js';
import Body from '../../../../masses-and-springs/js/common/model/Body.js';
import GravityComboBox from '../../../../masses-and-springs/js/common/view/GravityComboBox.js';
import MassesAndSpringsStrings from '../../../../masses-and-springs/js/MassesAndSpringsStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, Node, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import massesAndSpringsBasics from '../../massesAndSpringsBasics.js';

const gravityString = MassesAndSpringsStrings.gravity;
const lotsString = MassesAndSpringsStrings.lots;
const noneString = MassesAndSpringsStrings.none;
const whatIsTheValueOfGravityString = MassesAndSpringsStrings.whatIsTheValueOfGravity;

// constants
const MAX_WIDTH = 100;

class GravityAccordionBox extends AccordionBox {
  /**
   * @param {Property} gravityProperty
   * @param {Property} bodyProperty
   * @param {Node} listNodeParent
   * @param {AlignGroup} alignGroup
   * @param {Tandem} tandem
   * @param {Object} [options]
   *
   */
  constructor( gravityProperty, bodyProperty, listNodeParent, alignGroup, tandem, options ) {

    options = merge( {
      buttonYMargin: 4,
      contentXMargin: 0,
      cornerRadius: MassesAndSpringsConstants.PANEL_CORNER_RADIUS,
      minWidth: 224,
      titleNode: new Text( gravityString, { font: MassesAndSpringsConstants.TITLE_FONT, maxWidth: 185 } ),
      expandedProperty: new BooleanProperty( false ),
      titleAlignX: 'left'
    }, options );

    // Create gravity slider
    const gravitySlider = new HSlider( gravityProperty, MassesAndSpringsConstants.GRAVITY_RANGE, {
      majorTickLength: 5,
      minorTickLength: 5,
      trackSize: new Dimension2( 165, 0.1 ),
      thumbSize: new Dimension2( 13, 22 ),
      thumbFillEnabled: '#00C4DF',
      thumbFillHighlighted: MassesAndSpringsConstants.THUMB_HIGHLIGHT,
      thumbTouchAreaYDilation: 9
    } );
    gravitySlider.addMajorTick( MassesAndSpringsConstants.GRAVITY_RANGE.min, new Text( noneString, {
      font: MassesAndSpringsConstants.LABEL_FONT,
      tandem: tandem.createTandem( 'gravityNoneText' ),
      maxWidth: MAX_WIDTH * 0.5
    } ) );
    gravitySlider.addMajorTick( MassesAndSpringsConstants.GRAVITY_RANGE.max, new Text( lotsString, {
      font: MassesAndSpringsConstants.LABEL_FONT,
      tandem: tandem.createTandem( 'gravityLotsText' ),
      maxWidth: MAX_WIDTH * 0.5
    } ) );

    // Text that reads "What is the value of gravity?"
    const questionTextNode = new Node( {
      children: [ new Text( whatIsTheValueOfGravityString, {
        font: MassesAndSpringsConstants.TITLE_FONT,
        maxWidth: MAX_WIDTH * 2
      } ) ]
    } );

    // Manages the items associated with the gravity panel in a combo box
    const gravityComboBox = new GravityComboBox( bodyProperty, listNodeParent, tandem, {
      cornerRadius: 3,
      buttonYMargin: 0,
      itemYMargin: 3,
      itemXMargin: 2,
      listYMargin: 3,
      tandem: tandem.createTandem( 'gravityComboBox' )
    } );

    // Responsible for managing bodies
    bodyProperty.link( ( newBody, oldBody ) => {
      const body = _.find( Body.BODIES, newBody );

      // Set visibility of question node
      questionTextNode.visible = body === Body.PLANET_X;
      gravitySlider.visible = !questionTextNode.visible;

      // If it's not custom, set it to its value
      if ( body !== Body.CUSTOM ) {
        gravityProperty.set( body.gravity );
      }
      else {
        // If we are switching from Planet X to Custom, don't let them cheat (go back to last custom value)
        if ( oldBody === Body.PLANET_X ) {
          gravityProperty.value = Body.CUSTOM.gravity;
        }

        // For non-Planet X, update our internal custom gravity
        else {
          Body.CUSTOM.gravity = gravityProperty.value;
        }
      }
    } );

    const accordionBoxContent = new Node( {
      children: [
        gravitySlider,
        questionTextNode,
        gravityComboBox
      ]
    } );

    // Alignments of accordion box content
    gravityComboBox.top = gravitySlider.top + 45;
    questionTextNode.center = gravitySlider.center;

    super( new AlignBox( accordionBoxContent, { alignGroup: alignGroup } ), options );
  }
}

massesAndSpringsBasics.register( 'GravityAccordionBox', GravityAccordionBox );
export default GravityAccordionBox;