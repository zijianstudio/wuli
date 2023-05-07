// Copyright 2020-2023, University of Colorado Boulder

/**
 * A generic distance statement as a scenery Node. Can either be set to be able to control point controller values
 * (using number pickers) or just show values (using texts). All minus symbols use the MathSymbols.MINUS symbol (even if
 * it is a unary minus) so that all the minus symbols are consistent (see #27). Doesn't need to unlink Properties
 * because all instances of DistanceStatementNode are present for the lifetime of the sim.
 *
 * @author Saurabh Totey
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import AbsoluteValueLine from '../../../../number-line-common/js/common/view/AbsoluteValueLine.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { FlowBox, HBox, HStrut, Node, Rectangle, RichText, Text, VStrut } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import DistanceRepresentation from '../../common/model/DistanceRepresentation.js';
import numberLineDistance from '../../numberLineDistance.js';
import NLDConstants from '../NLDConstants.js';

// constants
const MATH_TEXT_OPTIONS = { font: new MathSymbolFont( 25 ), maxWidth: 40 };
const NORMAL_TEXT_OPTIONS = { font: new PhetFont( 25 ), maxWidth: 55 };
const TERM_LABEL_TEXT_OPTIONS = { font: new MathSymbolFont( 15 ), maxWidth: 25 };

// A value that is beyond the bounds of the number lines because the number pickers' Properties always require a number
const INVALID_VALUE = -101;
const INVALID_DISTANCE_STRING = '?';

// A bounding object that is supposed to always be larger than a potential point controller representation
const REPRESENTATION_BOUNDS = new Bounds2( 0, 0, 65, 55 );

class DistanceStatementNode extends Node {

  /**
   * @param {AbstractNLDBaseModel} model,
   * @param {Object} [options] - do not get bubbled up to Node
   */
  constructor( model, options ) {
    options = merge( {

      // {boolean} - changes whether this statement uses number pickers or texts.
      // This affects whether this can change a point controller's value or not.
      controlsValues: false
    }, options );

    super();

    // A list of size 2 that contains nodes that 'represent' a point controller's value;
    // will either be number pickers or texts depending on options.controlsValues.
    let valueRepresentations;

    // Create valueProperties for each number line point. The Property corresponds to the point's value if it has any.
    // Otherwise, the Property is INVALID_VALUE (which is still a number for the NumberProperty). The valueProperty
    // will update when the point controller's value changes, but the point's value will not update when the valueProperty
    // changes unless options.controlsValues is true. The INVALID_VALUE hack is required because the number pickers
    // require the valueProperty to always have a numeric value.
    const valueProperties = [
      new NumberProperty( INVALID_VALUE, { reentrant: true } ),
      new NumberProperty( INVALID_VALUE, { reentrant: true } )
    ];
    model.pointValuesProperty.link( pointValues => {
      valueProperties[ 0 ].value = pointValues[ 0 ] !== null ? pointValues[ 0 ] : INVALID_VALUE;
      valueProperties[ 1 ].value = pointValues[ 1 ] !== null ? pointValues[ 1 ] : INVALID_VALUE;
    } );

    // There are necessarily 2 point controllers (that is enforced by AbsractNLDBaseModel), so ensure
    // that we have the correct number of corresponding value Properties.
    assert && assert(
      valueProperties.length === 2,
      'Mapping point values to value Properties should result in exactly 2 value Properties'
    );

    if ( options.controlsValues ) {

      // Make changing the value Properties affect the point controllers' values.
      model.pointControllers.forEach( ( pointController, i ) => {
        valueProperties[ i ].link( value => {
          if ( value !== INVALID_VALUE && pointController.isControllingNumberLinePoint()
               && model.numberLine.hasPoint( pointController.numberLinePoints.get( 0 ) ) ) {
            pointController.numberLinePoints.get( 0 ).valueProperty.value = value;
          }
        } );
      } );

      // Range Property for number pickers; picks a range that contains all generic number line ranges.
      const numberPickerRangeProperty = new Property(
        NLDConstants.GENERIC_NUMBER_LINE_RANGES.reduce( ( largestNumberLineRange, currentNumberLineRange ) => {
          const newLargestNumberLineRange = largestNumberLineRange.copy();
          if ( currentNumberLineRange.min < newLargestNumberLineRange.min ) {
            newLargestNumberLineRange.min = currentNumberLineRange.min;
          }
          if ( currentNumberLineRange.max > newLargestNumberLineRange.max ) {
            newLargestNumberLineRange.max = currentNumberLineRange.max;
          }
          return newLargestNumberLineRange;
        } ),
        {
          valueType: Range
        }
      );

      valueRepresentations = model.pointControllers.map( ( pointController, i ) =>
        new NumberPicker( valueProperties[ i ], numberPickerRangeProperty, {
          color: pointController.color
        } )
      );

    }
    else {

      const textNodes = [
        new Text( `${INVALID_VALUE}`, NORMAL_TEXT_OPTIONS ),
        new Text( `${INVALID_VALUE}`, NORMAL_TEXT_OPTIONS )
      ];

      // Each Text is added within a dilated rectangle in order to ensure that the text is always centered in its space.
      // Whenever the text of the node changes, the node is re-centered within this rectangle.
      valueRepresentations = textNodes.map( textNode => {
        const textHolder = new Rectangle( textNode.localBounds.dilatedXY( 5, 10 ) ); // empirically determined
        textHolder.addChild( textNode );
        return textHolder;
      } );

      valueProperties.forEach( ( valueProperty, i ) => {
        Multilink.multilink(
          [ valueProperty, model.isPrimaryControllerSwappedProperty ],
          ( value, isPrimaryNodeSwapped ) => {
            const isSecondDisplayedValue = i === 1 && isPrimaryNodeSwapped || i === 0 && !isPrimaryNodeSwapped;
            textNodes[ i ].string = ( value < 0 && isSecondDisplayedValue ) ? `(${value})` : `${value}`;
            textNodes[ i ].string = textNodes[ i ].string.replace( '-', MathSymbols.MINUS );
            textNodes[ i ].center = valueRepresentations[ i ].rectBounds.center;
          }
        );
      } );

    }

    assert && assert(
      valueRepresentations.length === 2,
      'DistanceStatementNode requires there to be 2 value representations.'
    );

    // Background nodes that are parents to the value representations which ensure constant spacing within the node.
    // This code assumes that REPRESENTATION_BOUNDS is always larger than any of the possible children.
    const backgroundNodes = [
      new Rectangle( REPRESENTATION_BOUNDS ),
      new Rectangle( REPRESENTATION_BOUNDS )
    ];

    // These nodes that will be shown instead of the value representations if the point controllers aren't on the number line.
    const alternativeTexts = [
      new RichText( NLDConstants.X_1_STRING, MATH_TEXT_OPTIONS ),
      new RichText( NLDConstants.X_2_STRING, MATH_TEXT_OPTIONS )
    ];

    const minusSignText = new Text( MathSymbols.MINUS, NORMAL_TEXT_OPTIONS );
    const equalsSignText = new Text( MathSymbols.EQUAL_TO, NORMAL_TEXT_OPTIONS );

    // A text that displays the distance between the two point controllers (or '?' if invalid distance).
    const distanceText = new Text( INVALID_DISTANCE_STRING, NORMAL_TEXT_OPTIONS );

    // absolute value marks - are shorter than the background nodes they are supposed to wrap for #40 by an empirically
    // determined amount.
    const absoluteValueMarkHeightIndicator = new VStrut( backgroundNodes[ 0 ].height - 10 );
    const leftAbsoluteValueMark = new AbsoluteValueLine( absoluteValueMarkHeightIndicator );
    const rightAbsoluteValueMark = new AbsoluteValueLine( absoluteValueMarkHeightIndicator );

    // HBoxes are for putting absolute values alongside valueRepresentations.
    const leftTermHBox = new HBox( {
      children: [ leftAbsoluteValueMark, backgroundNodes[ 0 ] ],
      excludeInvisibleChildrenFromBounds: false
    } );
    const rightTermHBox = new HBox( {
      children: [ backgroundNodes[ 1 ], rightAbsoluteValueMark ],
      excludeInvisibleChildrenFromBounds: false
    } );

    // labels that go above the numerical terms when they have valid values
    const leftTermLabel = new RichText( NLDConstants.X_1_STRING, TERM_LABEL_TEXT_OPTIONS );
    const rightTermLabel = new RichText( NLDConstants.X_2_STRING, TERM_LABEL_TEXT_OPTIONS );
    const leftTermLabelNode = new Rectangle( 0, 0, leftTermHBox.width, 1, { children: [ leftTermLabel ] } );
    const rightTermLabelNode = new Rectangle( 0, 0, rightTermHBox.width, 1, { children: [ rightTermLabel ] } );
    leftTermLabel.centerX = leftTermLabelNode.width / 2;
    rightTermLabel.centerX = rightTermLabelNode.width / 2;

    // In order to place the term labels exactly above the appropriate terms, we need to create another HBox above the
    // HBox that houses all the distance statement terms and we need to ensure that the spacings match. The only term that
    // changes size is the distance term because the other terms are housed in parent nodes that ensure a constant width.
    const distanceTextHStrutStandin = new Node( { children: [ new HStrut( distanceText.width ) ] } );
    distanceText.boundsProperty.link( () => {
      distanceTextHStrutStandin.children = [ new HStrut( distanceText.width ) ];
    } );

    const distanceTextSpacer = new HStrut( 3 ); // empirically determined
    this.addChild( new FlowBox( {
      orientation: 'vertical',
      spacing: options.controlsValues ? 8 : 0, // empirically determined
      resize: false,
      children: [
        new HBox( {
          children: [
            leftTermLabelNode,
            new HStrut( minusSignText.width ),
            rightTermLabelNode,
            new HStrut( equalsSignText.width ),
            new Node( { children: [ distanceTextSpacer ] } ),
            distanceTextHStrutStandin
          ],
          spacing: 5
        } ),
        new HBox( {
          children: [ leftTermHBox, minusSignText, rightTermHBox, equalsSignText, new Node( { children: [ distanceTextSpacer ] } ), distanceText ],
          spacing: 5
        } )
      ]
    } ) );

    // This multilink listens for changes in any relevant Properties and updates the distance statement accordingly.
    Multilink.multilink(
      [
        valueProperties[ 0 ],
        valueProperties[ 1 ],
        model.distanceRepresentationProperty,
        model.isPrimaryControllerSwappedProperty,
        model.numberLine.orientationProperty
      ],
      ( value0, value1, distanceRepresentation, isPrimaryNodeSwapped, orientation ) => {

        // Change the alt text based off of number line orientation.
        if ( orientation === Orientation.HORIZONTAL ) {
          alternativeTexts[ 0 ].string = NLDConstants.X_1_STRING;
          alternativeTexts[ 1 ].string = NLDConstants.X_2_STRING;
        }
        else {
          alternativeTexts[ 0 ].string = NLDConstants.Y_1_STRING;
          alternativeTexts[ 1 ].string = NLDConstants.Y_2_STRING;
        }
        leftTermLabel.string = alternativeTexts[ 1 ].string;
        rightTermLabel.string = alternativeTexts[ 0 ].string;

        // Choose the ordering for children for the distance statement.
        let leftTermNode = valueRepresentations[ 1 ];
        let rightTermNode = valueRepresentations[ 0 ];
        let leftTermValue = value1;
        let rightTermValue = value0;
        let distance = Utils.roundSymmetric( leftTermValue - rightTermValue );
        if ( isPrimaryNodeSwapped ) {
          leftTermNode = valueRepresentations[ 0 ];
          leftTermValue = value0;
          rightTermNode = valueRepresentations[ 1 ];
          rightTermValue = value1;
          distance = -distance;
        }

        // Add absolute value marks and makes the distance positive if the distance representation is absolute.
        leftAbsoluteValueMark.visible = false;
        rightAbsoluteValueMark.visible = false;
        if ( distanceRepresentation === DistanceRepresentation.ABSOLUTE ) {
          distance = Math.abs( distance );
          leftAbsoluteValueMark.visible = true;
          rightAbsoluteValueMark.visible = true;
        }

        // Replace value representations with alternatives if their value is invalid.
        if ( leftTermValue === INVALID_VALUE ) {
          leftTermNode = alternativeTexts[ 1 ];
          leftTermLabel.string = '';
          distance = INVALID_DISTANCE_STRING;
        }
        if ( rightTermValue === INVALID_VALUE ) {
          rightTermNode = alternativeTexts[ 0 ];
          rightTermLabel.string = '';
          distance = INVALID_DISTANCE_STRING;
        }

        // Add distance statement terms to the background nodes and ensure they are centered.
        backgroundNodes[ 0 ].children = [ leftTermNode ];
        backgroundNodes[ 1 ].children = [ rightTermNode ];
        leftTermNode.center = REPRESENTATION_BOUNDS.center;
        rightTermNode.center = REPRESENTATION_BOUNDS.center;

        distanceText.string = `${distance}`.replace( '-', MathSymbols.MINUS );
      }
    );
  }
}

numberLineDistance.register( 'DistanceStatementNode', DistanceStatementNode );
export default DistanceStatementNode;
