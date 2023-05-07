// Copyright 2020-2023, University of Colorado Boulder

/**
 * A view that contains elements that are used in all scenes/screens of the sim.
 * This view has all the common controls as well as the common display elements.
 * This is a 'base' view because it is meant to be used as the bottom layer in the scene graph for all scenes/screens.
 * Nothing needs to be disposed from this view because all instances of NLDBaseView are present for the sim's lifetime.
 *
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import NLCheckbox from '../../../../number-line-common/js/common/view/NLCheckbox.js';
import NLCheckboxGroup from '../../../../number-line-common/js/common/view/NLCheckboxGroup.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import required from '../../../../phet-core/js/required.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Path, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DistanceRepresentation from '../../common/model/DistanceRepresentation.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import NLDConstants from '../NLDConstants.js';
import DistanceStatementNode from './DistanceStatementNode.js';

const pointLabelsString = NumberLineDistanceStrings.pointLabels;
const distanceLabelsString = NumberLineDistanceStrings.distanceLabels;
const distanceDescriptionString = NumberLineDistanceStrings.distanceDescription;
const tickMarksString = NumberLineDistanceStrings.tickMarks;
const absoluteValueString = NumberLineDistanceStrings.absoluteValue;
const directedDistanceString = NumberLineDistanceStrings.directedDistance;
const distanceStatementString = NumberLineDistanceStrings.distanceStatement;

const DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS = { font: new PhetFont( 16 ), maxWidth: 200 };
const NODE_SWAP_TEXT_OPTIONS = { font: new MathSymbolFont( 30 ), maxWidth: 50 };
const NODE_SWAP_HBOX_SPACING = 15;
const SWAP_ICON_PATH_OPTIONS = { stroke: 'black', lineWidth: 4 };
const ARROW_SIZE = 5;
const ARROW_SHAPE_OPTIONS = {
  tailWidth: 0,
  headHeight: ARROW_SIZE,
  headWidth: ARROW_SIZE
};
const DISTANCE_DESCRIPTION_TEXT_OPTIONS = { font: new PhetFont( 20 ), maxWidth: 515 };
const DISTANCE_STATEMENT_TITLE_TEXT_OPTIONS = { maxWidth: 300, font: new PhetFont( 16 ) };

class NLDBaseView extends Node {

  /**
   * pointControllerRepresentation parameters are used to represent the point controllers on the bottom left of the view:
   * they are used to display x_1 and x_2 or y_1 and y_2 in the area that allows them to be swapped.
   *
   * @param {AbstractNLDBaseModel} model
   * @param {Node} pointControllerRepresentationOne
   * @param {Node} pointControllerRepresentationTwo
   * @param {Object} config - options are not bubbled to Node superconstructor
   */
  constructor( model, pointControllerRepresentationOne, pointControllerRepresentationTwo, config ) {

    config = merge( {
      distanceDescriptionStrings: {

        // {string}
        absoluteDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.absoluteDistanceDescriptionTemplate
        ),
        directedPositiveDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.directedPositiveDistanceDescriptionTemplate
        ),
        directedNegativeDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.directedNegativeDistanceDescriptionTemplate
        ),
        singularUnits: required( config.distanceDescriptionStrings.singularUnits ),
        pluralUnits: required( config.distanceDescriptionStrings.pluralUnits ),

        // {function(boolean, Orientation):string} should give a point controller label (string) when given
        // model.isPrimaryControllerSwapped and the orientation of the number line
        getPrimaryPointControllerLabel: required( config.distanceDescriptionStrings.getPrimaryPointControllerLabel ),
        getSecondaryPointControllerLabel: required( config.distanceDescriptionStrings.getSecondaryPointControllerLabel )
      },
      distanceStatementNodeOptions: { controlsValues: false }
    }, config );

    super();

    // checkboxes that control common model Properties for what should be visible
    // all used spacings and paddings were empirically determined
    const checkboxGroup = new NLCheckboxGroup(
      [
        new NLCheckbox( model.numberLine.showPointLabelsProperty, pointLabelsString ),
        new NLCheckbox( model.distanceLabelsVisibleProperty, distanceLabelsString ),
        new NLCheckbox( model.distanceDescriptionVisibleProperty, distanceDescriptionString ),
        new NLCheckbox( model.numberLine.showTickMarksProperty, tickMarksString )
      ]
    );
    checkboxGroup.right = NLDConstants.NLD_LAYOUT_BOUNDS.maxX - NLCConstants.SCREEN_VIEW_X_MARGIN;
    this.addChild( checkboxGroup );

    // checkboxes for how distance should be represented
    const distanceTypeSelector = new VerticalAquaRadioButtonGroup(
      model.distanceRepresentationProperty,
      [
        {
          value: DistanceRepresentation.ABSOLUTE,
          createNode: () => new Text( absoluteValueString, DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS )
        },
        {
          value: DistanceRepresentation.DIRECTED,
          createNode: () => new Text( directedDistanceString, DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS )
        }
      ],
      {
        left: 50, // empirically determined
        top: 25,
        spacing: 9
      }
    );
    this.addChild( distanceTypeSelector );

    // box for point controllers
    let pointControllerBoxNode = null;
    model.pointControllerBoxProperty.link( pointControllerBox => {
      pointControllerBoxNode && this.removeChild( pointControllerBoxNode );
      pointControllerBoxNode = new Rectangle( pointControllerBox, {
        fill: 'white',
        stroke: 'black',
        cornerRadius: 6
      } );
      this.addChild( pointControllerBoxNode );
    } );

    // Add pointControllerRepresentations to rectangles that ensure that the representations take up the same space.
    const largestRepresentationWidth =
      Math.max( pointControllerRepresentationOne.width, pointControllerRepresentationTwo.width );
    const largestRepresentationHeight =
      Math.max( pointControllerRepresentationOne.height, pointControllerRepresentationTwo.height );
    const pointControllerRepresentationBackgroundOne = new Rectangle(
      0,
      0,
      largestRepresentationWidth,
      largestRepresentationHeight
    );
    const pointControllerRepresentationBackgroundTwo = new Rectangle(
      0,
      0,
      largestRepresentationWidth,
      largestRepresentationHeight
    );
    pointControllerRepresentationOne.center = pointControllerRepresentationBackgroundOne.center;
    pointControllerRepresentationTwo.center = pointControllerRepresentationBackgroundTwo.center;
    pointControllerRepresentationBackgroundOne.addChild( pointControllerRepresentationOne );
    pointControllerRepresentationBackgroundTwo.addChild( pointControllerRepresentationTwo );

    // Create controls on the bottom left for which node is considered to be first and second.
    // all values used in nodeOrderDisplay were empirically determined
    const firstNodeText = new RichText( `${NLDConstants.X_1_STRING} ${MathSymbols.EQUAL_TO}`, NODE_SWAP_TEXT_OPTIONS );
    const secondNodeText = new RichText( `${NLDConstants.X_2_STRING} ${MathSymbols.EQUAL_TO}`, NODE_SWAP_TEXT_OPTIONS );
    const firstNodeHBox = new HBox( {
      children: [ firstNodeText, pointControllerRepresentationBackgroundOne ],
      spacing: NODE_SWAP_HBOX_SPACING
    } );
    const secondNodeHBox = new HBox( {
      children: [ secondNodeText, pointControllerRepresentationBackgroundTwo ],
      spacing: NODE_SWAP_HBOX_SPACING
    } );
    const nodeOrderDisplay = new VBox( {
      children: [ firstNodeHBox, secondNodeHBox ],
      spacing: ( 40 - firstNodeHBox.height ) / 2,
      bottom: NLDConstants.NLD_LAYOUT_BOUNDS.maxY - 30,
      left: 30
    } );
    this.addChild( nodeOrderDisplay );

    // button that swaps the primary point controller and secondary point controller when pressed
    // padding and dilations deterined empirically
    const swapIcon = new SwapIcon();
    const swapPrimaryNodesButton = new RectangularPushButton( {
      content: swapIcon,
      baseColor: 'white',
      left: nodeOrderDisplay.right + 20,
      centerY: nodeOrderDisplay.centerY,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      listener: () => { model.isPrimaryControllerSwappedProperty.value = !model.isPrimaryControllerSwappedProperty.value; }
    } );
    this.addChild( swapPrimaryNodesButton );

    // Listen for when the primary node should be swapped, and swap the representations.
    model.isPrimaryControllerSwappedProperty.link( isPrimaryControllerSwapped => {
      let firstNodeHBoxChildren;
      let secondNodeHBoxChildren;
      if ( isPrimaryControllerSwapped ) {
        firstNodeHBoxChildren = [ firstNodeText, pointControllerRepresentationBackgroundTwo ];
        secondNodeHBoxChildren = [ secondNodeText, pointControllerRepresentationBackgroundOne ];
      }
      else {
        firstNodeHBoxChildren = [ firstNodeText, pointControllerRepresentationBackgroundOne ];
        secondNodeHBoxChildren = [ secondNodeText, pointControllerRepresentationBackgroundTwo ];
      }
      // Don't have the nodes handled by layout of multiple containers at once
      firstNodeHBoxChildren.forEach( node => node.detach() );
      secondNodeHBoxChildren.forEach( node => node.detach() );
      firstNodeHBox.children = firstNodeHBoxChildren;
      secondNodeHBox.children = secondNodeHBoxChildren;
    } );

    // Switch the firstNodeText and secondNodeText to use either x or y based on number line orientation.
    model.numberLine.orientationProperty.link( orientation => {
      if ( orientation === Orientation.HORIZONTAL ) {
        firstNodeText.string = `${NLDConstants.X_1_STRING} ${MathSymbols.EQUAL_TO}`;
        secondNodeText.string = `${NLDConstants.X_2_STRING} ${MathSymbols.EQUAL_TO}`;
      }
      else {
        firstNodeText.string = `${NLDConstants.Y_1_STRING} ${MathSymbols.EQUAL_TO}`;
        secondNodeText.string = `${NLDConstants.Y_2_STRING} ${MathSymbols.EQUAL_TO}`;
      }
    } );

    // @public {BooleanProperty} - controls whether the distance statement accordion box is opened or closed.
    this.accordionBoxOpenedProperty = new BooleanProperty( true );

    // an accordion box for the distance statement
    // paddings and width were empirically determined
    const distanceStatementAccordionBox = new AccordionBox(
      new DistanceStatementNode( model, config.distanceStatementNodeOptions ),
      merge( NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, {
        titleNode: new Text( distanceStatementString, DISTANCE_STATEMENT_TITLE_TEXT_OPTIONS ),
        expandedProperty: this.accordionBoxOpenedProperty,
        top: NLDConstants.NLD_LAYOUT_BOUNDS.minY + 5,
        centerX: NLDConstants.NLD_LAYOUT_BOUNDS.centerX,
        contentAlign: 'center',
        minWidth: 340,
        maxWidth: 340
      } )
    );
    this.addChild( distanceStatementAccordionBox );

    // a text description for the distance under the distance statement accordion box
    const distanceDescriptionText = new RichText( '', merge( DISTANCE_DESCRIPTION_TEXT_OPTIONS, {
      top: distanceStatementAccordionBox.bottom + 15 // padding empirically determined
    } ) );
    Multilink.multilink(
      [
        model.distanceRepresentationProperty,
        model.numberLine.orientationProperty,
        model.isPrimaryControllerSwappedProperty,
        model.pointValuesProperty
      ],
      ( distanceRepresentation, orientation, isPrimaryControllerSwapped, pointValues ) => {

        // Don't say anything about distance if both point controllers aren't on the number line.
        distanceDescriptionText.string = '';
        distanceDescriptionText.centerX = distanceStatementAccordionBox.centerX;
        if ( !model.areBothPointControllersControllingOnNumberLine() ) {
          return;
        }

        const value0 = pointValues[ 0 ];
        const value1 = pointValues[ 1 ];

        // Calculate the difference with the correct sign.
        // Even though only the absolute value of difference is ever displayed, the sign is still used to determine
        // which string template to use.
        let difference = Utils.roundSymmetric( value1 - value0 );
        if ( isPrimaryControllerSwapped ) {
          difference = -difference;
        }

        // Get the strings for the point controllers.
        const primaryPointControllerLabel =
          config.distanceDescriptionStrings.getPrimaryPointControllerLabel( isPrimaryControllerSwapped, orientation );
        const secondaryPointControllerLabel =
          config.distanceDescriptionStrings.getSecondaryPointControllerLabel( isPrimaryControllerSwapped, orientation );

        // Fill in a string template for the distance text based off of the distance representation and whether the
        // distance is positive or negative.
        const fillInValues = {
          primaryPointControllerLabel: primaryPointControllerLabel,
          secondaryPointControllerLabel: secondaryPointControllerLabel,
          difference: Math.abs( difference ),
          units: ( difference === 1 || difference === -1 ) ?
            config.distanceDescriptionStrings.singularUnits : config.distanceDescriptionStrings.pluralUnits
        };
        if ( distanceRepresentation === DistanceRepresentation.ABSOLUTE || difference === 0 ) {
          distanceDescriptionText.string = StringUtils.fillIn( config.distanceDescriptionStrings.absoluteDistanceDescriptionTemplate, fillInValues );
        }
        else if ( difference > 0 ) {
          distanceDescriptionText.string = StringUtils.fillIn( config.distanceDescriptionStrings.directedPositiveDistanceDescriptionTemplate, fillInValues );
        }
        else if ( difference < 0 ) {
          distanceDescriptionText.string = StringUtils.fillIn( config.distanceDescriptionStrings.directedNegativeDistanceDescriptionTemplate, fillInValues );
        }

        distanceDescriptionText.centerX = distanceStatementAccordionBox.centerX;
      }
    );
    model.distanceDescriptionVisibleProperty.linkAttribute( distanceDescriptionText, 'visible' );
    this.addChild( distanceDescriptionText );
  }

}

/**
 * A node that has paths that depict a 'swap' icon which is nearly a half-ellipse with arrows at the end.
 * The half-ellipse is on the right with arrows on the left pointing to the left.
 */
class SwapIcon extends Node {

  /**
   * All numbers/values used were determined empirically.
   */
  constructor() {
    super();
    const ellipseAngleInset = Math.PI / 12;
    const arrowXTranslation = 4;
    const arrowYTranslation = 10;
    this.addChild( new Path(
      new Shape().ellipticalArc( 0, 0, 8, 12, 0,
        -Math.PI / 2 + ellipseAngleInset, Math.PI / 2 - ellipseAngleInset ),
      SWAP_ICON_PATH_OPTIONS
    ) );
    this.addChild( new Path(
      new ArrowShape( 0, 0, -ARROW_SIZE, ARROW_SIZE, ARROW_SHAPE_OPTIONS )
        .transformed( Matrix3.translation( arrowXTranslation, arrowYTranslation ) ),
      SWAP_ICON_PATH_OPTIONS
    ) );
    this.addChild( new Path(
      new ArrowShape( 0, 0, -ARROW_SIZE, -ARROW_SIZE, ARROW_SHAPE_OPTIONS )
        .transformed( Matrix3.translation( arrowXTranslation, -arrowYTranslation ) ),
      SWAP_ICON_PATH_OPTIONS
    ) );
  }

}

numberLineDistance.register( 'NLDBaseView', NLDBaseView );
export default NLDBaseView;
