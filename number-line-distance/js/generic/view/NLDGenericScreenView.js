// Copyright 2020-2022, University of Colorado Boulder

/**
 * View of the 'Generic' screen for the Number Line Distance simulation
 *
 * @author Saurabh Totey
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import NumberLineOrientationSelector from '../../../../number-line-common/js/common/view/NumberLineOrientationSelector.js';
import NumberLineRangeSelector from '../../../../number-line-common/js/common/view/NumberLineRangeSelector.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import PointsOffScaleCondition from '../../../../number-line-common/js/common/view/PointsOffScaleCondition.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import { Circle, Node } from '../../../../scenery/js/imports.js';
import NLDConstants from '../../common/NLDConstants.js';
import DistanceShadedNumberLineNode from '../../common/view/DistanceShadedNumberLineNode.js';
import NLDBaseView from '../../common/view/NLDBaseView.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';

const genericAbsoluteDistanceTemplateString = NumberLineDistanceStrings.genericAbsoluteDistanceTemplate;
const genericDirectedPositiveDistanceTemplateString = NumberLineDistanceStrings.genericDirectedPositiveDistanceTemplate;
const genericDirectedNegativeDistanceTemplateString = NumberLineDistanceStrings.genericDirectedNegativeDistanceTemplate;
const unitString = NumberLineDistanceStrings.unit;
const unitsString = NumberLineDistanceStrings.units;

const CIRCLE_REPRESENTATION_RADIUS = 6;

class NLDGenericScreenView extends ScreenView {

  /**
   * @param {NLDGenericModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    // the point controllers are represented as circles on the bottom left corner of the screen
    const firstControllerRepresentation = new Circle( CIRCLE_REPRESENTATION_RADIUS, { fill: 'magenta' } );
    const secondControllerRepresentation = new Circle( CIRCLE_REPRESENTATION_RADIUS, { fill: 'blue' } );

    const baseView = new NLDBaseView(
      model,
      firstControllerRepresentation,
      secondControllerRepresentation,
      {
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: genericAbsoluteDistanceTemplateString,
          directedPositiveDistanceDescriptionTemplate: genericDirectedPositiveDistanceTemplateString,
          directedNegativeDistanceDescriptionTemplate: genericDirectedNegativeDistanceTemplateString,
          singularUnits: unitString,
          pluralUnits: unitsString,
          getPrimaryPointControllerLabel: ( _, orientation ) => MathSymbolFont.getRichTextMarkup(
            ( orientation === Orientation.HORIZONTAL ) ? NLDConstants.X_1_STRING : NLDConstants.Y_1_STRING
          ),
          getSecondaryPointControllerLabel: ( _, orientation ) => MathSymbolFont.getRichTextMarkup(
            ( orientation === Orientation.HORIZONTAL ) ? NLDConstants.X_2_STRING : NLDConstants.Y_2_STRING
          )
        },
        distanceStatementNodeOptions: { controlsValues: true }
      }
    );
    this.addChild( baseView );

    // reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        baseView.accordionBoxOpenedProperty.reset();
      },
      right: this.layoutBounds.maxX - NLDConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLDConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // adds orientation selectors for the number line
    const orientationSelector = new NumberLineOrientationSelector( model.numberLine.orientationProperty, {
      bottom: NLDConstants.NLD_LAYOUT_BOUNDS.maxY - 50,
      right: resetAllButton.left - 50,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } );
    this.addChild( orientationSelector );

    // adds range selectors for the number line
    this.addChild( new NumberLineRangeSelector(
      model.numberLine.displayedRangeProperty,
      NLDConstants.GENERIC_NUMBER_LINE_RANGES,
      this,
      {
        bottom: orientationSelector.top - 15,
        left: orientationSelector.left
      }
    ) );

    // point controllers
    const pointControllerNodeLayer = new Node( {
      children: model.pointControllers.map( pointController => new PointControllerNode( pointController ) )
    } );
    this.addChild( pointControllerNodeLayer );

    // number line
    const numberLineNode = new DistanceShadedNumberLineNode(
      model,
      {
        pointsOffScaleCondition: PointsOffScaleCondition.SOME,
        pointNameLabelOffsetFromHorizontalNumberLine: 65,
        pointNameLabelOffsetFromVerticalNumberLine: 70
      }
    );
    this.addChild( numberLineNode );
  }

}

numberLineDistance.register( 'NLDGenericScreenView', NLDGenericScreenView );
export default NLDGenericScreenView;
