// Copyright 2018-2021, University of Colorado Boulder

/**
 * View for Bounce screen.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MassesAndSpringsConstants from '../../../../masses-and-springs/js/common/MassesAndSpringsConstants.js';
import MassesAndSpringsColors from '../../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import ReferenceLineNode from '../../../../masses-and-springs/js/common/view/ReferenceLineNode.js';
import ShelfNode from '../../../../masses-and-springs/js/common/view/ShelfNode.js';
import TwoSpringScreenView from '../../../../masses-and-springs/js/common/view/TwoSpringScreenView.js';
import { VBox } from '../../../../scenery/js/imports.js';
import LineOptionsNode from '../../common/view/LineOptionsNode.js';
import massesAndSpringsBasics from '../../massesAndSpringsBasics.js';

class BounceScreenView extends TwoSpringScreenView {
  /**
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

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

    // Adding system controls to scene graph
    this.addChild( this.springSystemControlsNode );

    // Reference lines from indicator visibility box
    this.addChild( this.firstNaturalLengthLineNode );
    this.addChild( this.secondNaturalLengthLineNode );
    this.addChild( firstMassEquilibriumLineNode );
    this.addChild( secondMassEquilibriumLineNode );
    this.addChild( this.movableLineNode );
    this.addChild( this.massLayer );
    this.addChild( this.toolsLayer );

    // Panel that will display all the toggleable options.
    const optionsPanel = this.createOptionsPanel(
      new LineOptionsNode( model, tandem ),
      this.rightPanelAlignGroup,
      tandem
    );

    // Contains all of the options for the reference lines, gravity, damping, and toolbox
    const rightPanelsVBox = new VBox( {
      children: [ optionsPanel, this.toolboxPanel ],
      spacing: this.spacing * 0.9
    } );

    this.visibleBoundsProperty.link( () => {
      rightPanelsVBox.rightTop = new Vector2( this.panelRightSpacing, this.spacing );
    } );


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

    // Back layer used to handle z order of view elements.
    this.backLayer.children = [ this.backgroundDragPlane, rightPanelsVBox, labeledMassesShelf, mysteryMassesShelf ];
  }
}

massesAndSpringsBasics.register( 'BounceScreenView', BounceScreenView );
export default BounceScreenView;