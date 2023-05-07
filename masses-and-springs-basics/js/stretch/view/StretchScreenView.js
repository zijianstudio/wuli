// Copyright 2018-2021, University of Colorado Boulder

/**
 * View for Stretch screen.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MassesAndSpringsConstants from '../../../../masses-and-springs/js/common/MassesAndSpringsConstants.js';
import DraggableRulerNode from '../../../../masses-and-springs/js/common/view/DraggableRulerNode.js';
import MassesAndSpringsColors from '../../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import ReferenceLineNode from '../../../../masses-and-springs/js/common/view/ReferenceLineNode.js';
import ShelfNode from '../../../../masses-and-springs/js/common/view/ShelfNode.js';
import TwoSpringScreenView from '../../../../masses-and-springs/js/common/view/TwoSpringScreenView.js';
import { PaintColorProperty } from '../../../../scenery/js/imports.js';
import LineOptionsNode from '../../common/view/LineOptionsNode.js';
import massesAndSpringsBasics from '../../massesAndSpringsBasics.js';

class StretchScreenView extends TwoSpringScreenView {
  /**
   * @param {VectorsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // Calls common two spring view
    super( model, tandem );

    // Equilibrium of mass is dependent on the mass being attached and the visibility of the equilibrium line.
    const firstMassEquilibriumVisibilityProperty = new DerivedProperty( [ model.equilibriumPositionVisibleProperty, model.firstSpring.massAttachedProperty ],
      ( equilibriumPositionVisible, massAttached ) => {
        return !!massAttached && equilibriumPositionVisible;
      } );
    const secondMassEquilibriumVisibilityProperty = new DerivedProperty( [ model.equilibriumPositionVisibleProperty, model.secondSpring.massAttachedProperty ],
      ( equilibriumPositionVisible, massAttached ) => {
        return !!massAttached && equilibriumPositionVisible;
      } );

    // Initializes equilibrium line for first spring
    const firstMassEquilibriumLineNode = new ReferenceLineNode(
      this.modelViewTransform,
      model.firstSpring,
      model.firstSpring.equilibriumYPositionProperty,
      firstMassEquilibriumVisibilityProperty, {
        stroke: MassesAndSpringsColors.restingPositionProperty
      }
    );

    // Initializes equilibrium line for second spring
    const secondMassEquilibriumLineNode = new ReferenceLineNode(
      this.modelViewTransform,
      model.secondSpring,
      model.secondSpring.equilibriumYPositionProperty,
      secondMassEquilibriumVisibilityProperty, {
        stroke: MassesAndSpringsColors.restingPositionProperty
      }
    );

    // Setting specific colors for this screen's springs.
    this.springFrontColorProperty.set( new PaintColorProperty( 'rgb( 162, 106, 172 )' ).value );
    this.springMiddleColorProperty.set( new PaintColorProperty( 'rgb( 100, 6, 117 )' ).value );
    this.springBackColorProperty.set( new PaintColorProperty( 'rgb( 50, 3, 58 )' ).value );

    // Adding system controls to scene graph
    this.addChild( this.springSystemControlsNode );

    // Reference lines from indicator visibility box
    this.addChild( this.firstNaturalLengthLineNode );
    this.addChild( this.secondNaturalLengthLineNode );
    this.addChild( firstMassEquilibriumLineNode );
    this.addChild( secondMassEquilibriumLineNode );

    // The movable line will always be visible on this screen.
    this.addChild( this.movableLineNode );

    // Adding layers for interactive elements
    this.addChild( this.massLayer );
    this.addChild( this.toolsLayer );

    // Contains visibility options for the reference lines and displacement arrow
    const lineOptionsPanel = new LineOptionsNode( model, tandem );

    // Panel that will display all the toggleable options.
    const optionsPanel = this.createOptionsPanel( lineOptionsPanel, this.rightPanelAlignGroup, tandem );

    // Shelves used for masses
    const labeledMassesShelf = new ShelfNode( tandem, {
      rectHeight: 7,
      rectWidth: 185,
      left: this.layoutBounds.left + this.spacing,
      rectY: this.modelViewTransform.modelToViewY( MassesAndSpringsConstants.FLOOR_Y ) - this.shelf.rectHeight
    } );

    const mysteryMassesShelf = new ShelfNode( tandem, {
      rectHeight: 7,
      rectWidth: 120,
      left: labeledMassesShelf.right + this.spacing * 2,
      rectY: this.modelViewTransform.modelToViewY( MassesAndSpringsConstants.FLOOR_Y ) - this.shelf.rectHeight
    } );

    // @public {DraggableRulerNode}
    this.rulerNode = new DraggableRulerNode(
      this.modelViewTransform,
      this.visibleBoundsProperty.get(),
      new Vector2( this.visibleBoundsProperty.value.right - this.spacing, optionsPanel.bottom + this.spacing ),
      new Property( true ),
      () => {},
      tandem.createTandem( 'rulerNode' )
    );
    this.addChild( this.rulerNode );

    // Back layer used to handle z order of view elements.
    this.backLayer.children = [ this.backgroundDragPlane, optionsPanel, labeledMassesShelf, mysteryMassesShelf ];

    this.visibleBoundsProperty.link( () => {
      optionsPanel.rightTop = new Vector2( this.panelRightSpacing, this.springSystemControlsNode.top );
      if ( !this.rulerNode.draggedProperty.value ) {
        this.rulerNode.positionProperty.set( optionsPanel.rightBottom.plusXY( 0, this.spacing ) );
      }
    } );

    // Reset call here sets the ruler to its default position rather than resetting the positionProperty
    this.resetAllButton.addListener( () => {
      this.rulerNode.positionProperty.set( optionsPanel.rightBottom.plusXY( 0, this.spacing ) );
      this.rulerNode.draggedProperty.reset();
      model.dampingProperty.set( 0.7 );
    } );
  }
}

massesAndSpringsBasics.register( 'StretchScreenView', StretchScreenView );
export default StretchScreenView;