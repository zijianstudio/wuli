// Copyright 2013-2022, University of Colorado Boulder

//TODO: redo layout so things float to the sides (and bottom)
/**
 * View for the 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import fractionComparison from '../../fractionComparison.js';
import ComparisonRegion from './ComparisonRegion.js';
import FractionNode from './FractionNode.js';
import HorizontalBarContainerNode from './HorizontalBarContainerNode.js';
import LeftRightSpinner from './LeftRightSpinner.js';
import NumberLineNode from './NumberLineNode.js';
import RepresentationPanel from './RepresentationPanel.js';

class IntroView extends ScreenView {

  /**
   * @param {IntroModel} model
   */
  constructor( model ) {

    super( { layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );

    //Representation panel at the bottom center
    const representationPanel = new RepresentationPanel( model.representationProperty, {
      bottom: this.layoutBounds.maxY - 5,
      centerX: this.layoutBounds.centerX
    } );
    this.addChild( representationPanel );

    const numberLineNode = new NumberLineNode( model.leftFractionModel, model.rightFractionModel, model.numberLineVisibleProperty,
      { centerX: this.layoutBounds.centerX, bottom: representationPanel.top - 70 } );
    this.addChild( numberLineNode );

    //TODO: Manually tuned to be centered on the number line part.  Could be affected based on the font, would be superior to lay out based on global bounds of number line
    this.addChild( new Checkbox( model.numberLineVisibleProperty, new Rectangle( 0, 0, 0, 0 ), {
      top: numberLineNode.bounds.maxY + 7,
      centerX: numberLineNode.centerX,
      scale: 1.15
    } ) );

    this.addChild( new ResetAllButton( {
      listener: model.reset.bind( model ),
      radius: 24,
      right: this.layoutBounds.maxX - 2,
      bottom: this.layoutBounds.maxY - 2
    } ) );

    //To make it possible to drag pieces from the left over pieces in the right, we cannot just make subtrees for the left and right views
    //So model the pieces individually

    const distanceFromSideToFraction = 50;
    const leftFractionNode = new FractionNode( model.leftFractionModel.numeratorProperty,
      model.leftFractionModel.denominatorProperty, {
        left: distanceFromSideToFraction,
        bottom: representationPanel.bounds.minY
      } );
    this.addChild( leftFractionNode );

    const rightFractionNode = new FractionNode( model.rightFractionModel.numeratorProperty,
      model.rightFractionModel.denominatorProperty, {
        right: this.layoutBounds.maxX - distanceFromSideToFraction,
        bottom: representationPanel.bounds.minY
      } );
    this.addChild( rightFractionNode );

    const compareButtonPressed = () => {
      leftHorizontalBarContainerNode.animateToComparison();
      rightHorizontalBarContainerNode.animateToComparison();
    };

    const separateButtonPressed = () => {
      leftHorizontalBarContainerNode.animateToStart();
      rightHorizontalBarContainerNode.animateToStart();
    };

    const comparisonRegion = new ComparisonRegion( compareButtonPressed, separateButtonPressed, model.bothCompareProperty, model.eitherCompareProperty, {
      top: 10,
      centerX: this.layoutBounds.centerX
    } );
    this.addChild( comparisonRegion );

    //Containers
    const leftHorizontalBarContainerNode = new HorizontalBarContainerNode(
      model.leftFractionModel,
      '#61c9e4',
      model.leftFractionModel.stateProperty,
      model.leftFractionModel.animatingProperty,
      model.leftFractionModel.divisionsProperty,
      true,
      ( width, height ) => new Vector2( width / 2 + 10, comparisonRegion.bounds.centerY ), ( width, height ) => new Vector2( this.layoutBounds.centerX, comparisonRegion.bounds.centerY ) );

    const rightHorizontalBarContainerNode = new HorizontalBarContainerNode(
      model.rightFractionModel,
      '#dc528d',
      model.rightFractionModel.stateProperty,
      model.rightFractionModel.animatingProperty,
      model.rightFractionModel.divisionsProperty,
      true,
      ( width, height ) => new Vector2( this.layoutBounds.maxX - width / 2 - 10, comparisonRegion.bounds.centerY ), ( width, height ) => new Vector2( this.layoutBounds.centerX, comparisonRegion.bounds.centerY ) );

    //Show the shadows right behind the originals, and don't let the shadows be moved
    const leftHorizontalBarContainerNodeShadow = new HorizontalBarContainerNode(
      model.leftFractionModel,
      '#61c9e4',
      model.leftFractionModel.stateProperty,
      model.leftFractionModel.animatingProperty,
      model.leftFractionModel.divisionsProperty,
      false,
      ( width, height ) => new Vector2( width / 2 + 10, comparisonRegion.bounds.centerY ), ( width, height ) => new Vector2( this.layoutBounds.centerX, comparisonRegion.bounds.centerY ) );

    const rightHorizontalBarContainerNodeShadow = new HorizontalBarContainerNode(
      model.rightFractionModel,
      '#dc528d',
      model.rightFractionModel.stateProperty,
      model.rightFractionModel.animatingProperty,
      model.rightFractionModel.divisionsProperty,
      false,
      ( width, height ) => new Vector2( this.layoutBounds.maxX - width / 2 - 10, comparisonRegion.bounds.centerY ), ( width, height ) => new Vector2( this.layoutBounds.centerX, comparisonRegion.bounds.centerY ) );

    this.addChild( leftHorizontalBarContainerNodeShadow );
    this.addChild( rightHorizontalBarContainerNodeShadow );

    this.addChild( leftHorizontalBarContainerNode );
    this.addChild( rightHorizontalBarContainerNode );

    //The dotted line to show if the "underneath" (z-order) value is too small to see.
    const lineWidth = 3;
    const leftDottedLineContainerNode = new Rectangle( 0, 0, 180, 100, {
      stroke: '#61c9e4',
      lineWidth: lineWidth,
      lineDash: [ 11, 7 ]
    } );
    model.leftFractionModel.fractionProperty.link( value => {
      leftDottedLineContainerNode.setRectWidth( value * 180 );
    } );

    leftDottedLineContainerNode.left = leftHorizontalBarContainerNode.comparePosition.x - leftHorizontalBarContainerNode.width / 2 - 1;
    leftDottedLineContainerNode.centerY = leftHorizontalBarContainerNode.comparePosition.y;

    const leftValueSmallerProperty = new DerivedProperty( [ model.leftFractionModel.fractionProperty, model.rightFractionModel.fractionProperty ],
      ( leftFraction, rightFraction ) => leftFraction <= rightFraction );

    //Only show the dotted line for the "underneath" shape after animation is complete
    const eitherAnimating = new DerivedProperty(
      [ model.leftFractionModel.animatingProperty, model.rightFractionModel.animatingProperty ],
      ( leftAnimating, rightAnimating ) => leftAnimating || rightAnimating );

    const leftDottedLineContainerVisibleProperty = new DerivedProperty( [ model.bothCompareProperty, leftValueSmallerProperty, eitherAnimating ],
      ( bothCompare, leftValueSmaller, eitherAnimating ) => bothCompare && leftValueSmaller && !eitherAnimating );
    leftDottedLineContainerVisibleProperty.linkAttribute( leftDottedLineContainerNode, 'visible' );
    this.addChild( leftDottedLineContainerNode );

    const leftDivisionsProperty = model.leftFractionModel.divisionsProperty;
    const leftDivisionSpinner = new LeftRightSpinner( leftDivisionsProperty,
      new DerivedProperty( [ leftDivisionsProperty ], leftDivisions => leftDivisions > 1 ),
      new DerivedProperty( [ leftDivisionsProperty ], leftDivisions => leftDivisions < 10 ),
      { centerX: leftHorizontalBarContainerNode.centerX, top: leftHorizontalBarContainerNode.bottom + 6 } );
    this.addChild( leftDivisionSpinner );

    const rightDivisionsProperty = model.rightFractionModel.divisionsProperty;
    const rightDivisionSpinner = new LeftRightSpinner( rightDivisionsProperty,
      new DerivedProperty( [ rightDivisionsProperty ], rightDivisions => rightDivisions > 1 ),
      new DerivedProperty( [ rightDivisionsProperty ], rightDivisions => rightDivisions < 10 ),
      { centerX: rightHorizontalBarContainerNode.centerX, top: rightHorizontalBarContainerNode.bottom + 6 } );
    this.addChild( rightDivisionSpinner );

    //Move the containers to the start position on "reset all", see #30
    model.leftFractionModel.stateProperty.link( state => {
      if ( state === 'start' ) {
        leftHorizontalBarContainerNode.animateToStart();
      }
    } );

    model.rightFractionModel.stateProperty.link( state => {
      if ( state === 'start' ) {
        rightHorizontalBarContainerNode.animateToStart();
      }
    } );
  }
}

fractionComparison.register( 'IntroView', IntroView );
export default IntroView;
