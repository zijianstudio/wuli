// Copyright 2020-2022, University of Colorado Boulder

/**
 * NLOGenericScreenView is the main screen view for the "Generic" screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import NLCheckbox from '../../../../number-line-common/js/common/view/NLCheckbox.js';
import NLCheckboxGroup from '../../../../number-line-common/js/common/view/NLCheckboxGroup.js';
import NumberLineRangeSelector from '../../../../number-line-common/js/common/view/NumberLineRangeSelector.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import NLOConstants from '../../common/NLOConstants.js';
import ControllableOperationNumberLineNode from '../../common/view/ControllableOperationNumberLineNode.js';
import OperationEntryCarousel from '../../common/view/OperationEntryCarousel.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';
import NumericalExpressionAccordionBox from '../../operations/view/NumericalExpressionAccordionBox.js';
import NLOGenericModel from '../model/NLOGenericModel.js';
import SingleDualNumberLineSelector from './SingleDualNumberLineSelector.js';

// constants
const SECONDARY_ENTRY_CAROUSEL_THEME_COLOR = new Color( 0xE5BDF5 );
const SECONDARY_CAROUSEL_BUTTON_OPTIONS = {
  arrowDirection: 'up'
};

class NLOGenericScreenView extends ScreenView {

  /**
   * @param {NLOGenericModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    // checkboxes that will control the presentation options
    const checkboxes = [
      new NLCheckbox( model.primaryNumberLine.showOperationLabelsProperty, NumberLineOperationsStrings.operationLabels ),
      new NLCheckbox( model.primaryNumberLine.showPointLabelsProperty, NumberLineOperationsStrings.pointLabels ),
      new NLCheckbox( model.primaryNumberLine.showTickMarksProperty, NumberLineOperationsStrings.tickMarks )
    ];
    const checkboxGroup = new NLCheckboxGroup( checkboxes );
    this.addChild( checkboxGroup );

    // Create and add the representation of the primary number line.
    const primaryNumberLineView = new InteractiveNumberLineView(
      model.primaryNumberLine,
      model.primaryLineInitialValuePointController,
      model.primaryNumberLinePointControllers,
      this.layoutBounds,
      {
        numericalExpressionAccordionBoxOptions: {
          top: this.layoutBounds.minY + NLCConstants.SCREEN_VIEW_Y_MARGIN
        },
        operationEntryCarouselOptions: {
          top: this.layoutBounds.minY + NLCConstants.SCREEN_VIEW_Y_MARGIN
        }
      }
    );
    this.addChild( primaryNumberLineView );

    // layer where the secondary number line will live, here so that it can be shown and hidden
    const secondaryNumberLineLayer = new Node( {
      visible: false,
      opacity: 0
    } );
    this.addChild( secondaryNumberLineLayer );

    // Create and add the representation of the secondary number line.
    const secondaryNumberLineView = new InteractiveNumberLineView(
      model.secondaryNumberLine,
      model.secondaryLineInitialValuePointController,
      model.secondaryNumberLinePointControllers,
      this.layoutBounds,
      {
        numericalExpressionAccordionBoxOptions: {
          bottom: this.layoutBounds.maxY - NLCConstants.SCREEN_VIEW_Y_MARGIN
        },
        operationEntryCarouselOptions: {
          bottom: this.layoutBounds.maxY - NLCConstants.SCREEN_VIEW_Y_MARGIN,
          themeColor: SECONDARY_ENTRY_CAROUSEL_THEME_COLOR,
          entryControl1Options: SECONDARY_CAROUSEL_BUTTON_OPTIONS,
          entryControl2Options: SECONDARY_CAROUSEL_BUTTON_OPTIONS,
          pageControlPosition: OperationEntryCarousel.PageControlPosition.ABOVE
        }
      }
    );
    secondaryNumberLineLayer.addChild( secondaryNumberLineView );

    // reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        primaryNumberLineView.reset();
        secondaryNumberLineView.reset();
        model.reset();
      },
      right: this.layoutBounds.maxX - NLCConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLCConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // Add the selector used to show/hide the second number line.
    const singleDualNumberLineSelector = new SingleDualNumberLineSelector( model.secondNumberLineVisibleProperty, {
      left: checkboxGroup.left,
      bottom: resetAllButton.centerY
    } );
    this.addChild( singleDualNumberLineSelector );

    // The second number line is only visible when enabled, and fades in and out.  Monitor the model property that is
    // associated with this visibility and create animations for the fades.  No unlink is necessary.
    let secondaryNumberLineFadeAnimation = null;
    model.secondNumberLineVisibleProperty.lazyLink( isVisible => {
      const targetOpacity = isVisible ? 1 : 0;
      if ( secondaryNumberLineLayer.opacity !== targetOpacity ) {

        // Stop any previous animation.
        if ( secondaryNumberLineFadeAnimation ) {
          secondaryNumberLineFadeAnimation.stop();
        }

        secondaryNumberLineFadeAnimation = new Animation( {
          duration: 0.5,
          from: secondaryNumberLineLayer.opacity,
          to: targetOpacity,
          easing: Easing.CUBIC_IN_OUT,
          setValue: newOpacityValue => {

            // If the number line is starting to fade out, cancel any current interactions and make it unpickable so
            // that no new interactions can be started.
            if ( secondaryNumberLineLayer.opacity === 1 && newOpacityValue < 1 ) {
              secondaryNumberLineLayer.interruptSubtreeInput();
              secondaryNumberLineLayer.pickable = false;
            }

            // Update the opacity for the layer on which the number line and associated controls reside.
            secondaryNumberLineLayer.opacity = newOpacityValue;

            // Keep the visibility in sync with the opacity so that we don't have invisible interactive components.
            if ( newOpacityValue > 0 && !secondaryNumberLineLayer.visible ) {
              secondaryNumberLineLayer.visible = true;
            }
            else if ( newOpacityValue === 0 && secondaryNumberLineLayer.visible ) {
              secondaryNumberLineLayer.visible = false;
            }
          }
        } );
        secondaryNumberLineFadeAnimation.start();
        secondaryNumberLineFadeAnimation.endedEmitter.addListener( () => {

          // If the number line has just faded in, make it pickable.
          if ( secondaryNumberLineLayer.opacity === 1 ) {
            secondaryNumberLineLayer.pickable = true;
          }

          secondaryNumberLineFadeAnimation = null;
        } );
      }
    } );

    // Add the number line range selector.
    this.addChild( new NumberLineRangeSelector(
      model.primaryNumberLine.displayedRangeProperty,
      NLOGenericModel.NUMBER_LINE_RANGES,
      this,
      {
        left: singleDualNumberLineSelector.left,
        bottom: singleDualNumberLineSelector.top - 12
      }
    ) );

    // Keep the selected range of the secondary number line in sync with that of the primary.  No unlink is needed.
    model.primaryNumberLine.displayedRangeProperty.link( displayedRange => {
      model.secondaryNumberLine.displayedRangeProperty.set( displayedRange );
    } );
  }
}

/**
 * InteractiveNumberLineView is an inner class to creates and positions the various view elements used to represent and
 * interact with a number line.  It exists primarily to avoid code duplication.
 */
class InteractiveNumberLineView extends Node {

  /**
   * Add the various view elements for the provided number line.  This method exists primarily to minimize code
   * duplication.
   * @param {OperationTrackingNumberLine} numberLine
   * @param {PointController} initialValuePointController
   * @param {ObservableArrayDef.<PointController>} pointControllerObservableArray
   * @param {Bounds2} layoutBounds - the bounds into which this must be laid out
   * @param {Object} [options] - These options are specific to this class and its components, and they are not
   * propagated to the superclass.
   */
  constructor( numberLine, initialValuePointController, pointControllerObservableArray, layoutBounds, options ) {

    options = merge( {

      numericalExpressionAccordionBoxOptions: {
        titleNode: new Text( NumberLineOperationsStrings.numericalExpression, {
          font: new PhetFont( 18 ),
          maxWidth: 250
        } ),
        centerX: layoutBounds.centerX
      },
      operationEntryCarouselOptions: {
        entryControl1Options: {
          increment: 1
        },
        entryControl2Options: {
          increment: 1
        },
        right: layoutBounds.maxX - NLOConstants.OPERATION_ENTRY_CAROUSEL_LEFT_INSET
      }

    }, options );

    super();

    // layer where the point controllers go so that they stay behind the points
    const pointControllerLayer = new Node();
    this.addChild( pointControllerLayer );

    // node that represents the number line itself
    const numberLineNode = new ControllableOperationNumberLineNode(
      numberLine,
      initialValuePointController,
      pointControllerObservableArray,
      layoutBounds,
      {
        numberLineNodeOptions: {
          numberLineOperationNodeOptions: {
            operationLabelFont: new PhetFont( 22 )
          }
        }
      }
    );
    this.addChild( numberLineNode );

    // accordion box containing a mathematical description of the operations on the number line
    this.numericalExpressionAccordionBox = new NumericalExpressionAccordionBox(
      numberLine,
      options.numericalExpressionAccordionBoxOptions
    );
    this.addChild( this.numericalExpressionAccordionBox );

    // @private - carousel in which the operation entry controls reside
    this.operationEntryCarousel = new OperationEntryCarousel( numberLine, options.operationEntryCarouselOptions );
    this.addChild( this.operationEntryCarousel );

    // erase button
    const eraserButton = new EraserButton( {
      iconWidth: NLOConstants.ERASER_BUTTON_ICON_WIDTH,
      right: layoutBounds.maxX - NLOConstants.ERASER_BUTTON_INSET,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      listener: () => {
        numberLineNode.interruptSubtreeInput();
        numberLine.deactivateAllOperations();
        this.operationEntryCarousel.reset();

        // By design, the operations are set to have values of zero rather than their default values when the eraser
        // button is used.
        numberLine.operations.forEach( operation => operation.amountProperty.set( 0 ) );
      }
    } );
    this.addChild( eraserButton );

    // Erase is disabled if there are no operations.  No unlink is necessary.
    numberLine.operations.forEach( operation => {
      operation.isActiveProperty.link( () => {
        eraserButton.enabled = numberLine.getActiveOperations().length > 0;
      } );
    } );

    // Reposition the eraser button if the number line moves.  No unlink is necessary.
    numberLine.centerPositionProperty.link( position => {
      eraserButton.centerY = position.y;
    } );

    // Monitor the points on the number line and make sure that the operation being manipulated is the one being shown
    // in the corresponding operation entry carousel.
    numberLine.residentPoints.addItemAddedListener( addedPoint => {

      // Hook up a listener to the new point that will make sure that the operation entry carousel is showing the
      // operation that is being manipulated.
      const pointIsDraggingListener = isDragging => {
        if ( isDragging ) {
          this.operationEntryCarousel.showOperationWithEndpoint( addedPoint );
        }
      };
      addedPoint.isDraggingProperty.lazyLink( pointIsDraggingListener );

      // Listen for when this point is removed and unhook the listener when it is.
      numberLine.residentPoints.addItemRemovedListener( function pointRemovedListener( removedPoint ) {
        if ( removedPoint === addedPoint ) {
          removedPoint.isDraggingProperty.unlink( pointIsDraggingListener );
          numberLine.residentPoints.removeItemRemovedListener( pointRemovedListener );
        }
      } );
    } );
  }

  /**
   * @public
   */
  reset() {
    this.operationEntryCarousel.reset();
    this.numericalExpressionAccordionBox.reset();
  }
}

numberLineOperations.register( 'NLOGenericScreenView', NLOGenericScreenView );
export default NLOGenericScreenView;