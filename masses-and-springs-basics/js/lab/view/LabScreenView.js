// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for Lab screen.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MassesAndSpringsConstants from '../../../../masses-and-springs/js/common/MassesAndSpringsConstants.js';
import MassesAndSpringsColors from '../../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import MassValueControlPanel from '../../../../masses-and-springs/js/common/view/MassValueControlPanel.js';
import OneSpringScreenView from '../../../../masses-and-springs/js/common/view/OneSpringScreenView.js';
import ReferenceLineNode from '../../../../masses-and-springs/js/common/view/ReferenceLineNode.js';
import ShelfNode from '../../../../masses-and-springs/js/common/view/ShelfNode.js';
import PeriodTraceNode from '../../../../masses-and-springs/js/lab/view/PeriodTraceNode.js';
import VectorVisibilityControlNode from '../../../../masses-and-springs/js/vectors/view/VectorVisibilityControlNode.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import LineOptionsNode from '../../common/view/LineOptionsNode.js';
import massesAndSpringsBasics from '../../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../../MassesAndSpringsBasicsStrings.js';
import GravityAccordionBox from './GravityAccordionBox.js';

const centerOfOscillationString = MassesAndSpringsBasicsStrings.centerOfOscillation;

class LabScreenView extends OneSpringScreenView {
  /**
   * @param {LabModel} model
   * @param {Tandem} tandem
   *
   */
  constructor( model, tandem ) {

    // Calls common spring view
    super( model, tandem );
    const vectorVisibilityControlNode = new VectorVisibilityControlNode(
      model,
      tandem.createTandem( 'vectorVisibilityControlNode' ),
      {
        maxWidth: MassesAndSpringsConstants.PANEL_MAX_WIDTH + 30,
        showForces: false
      } );

    // VBox that contains all of the panel's content
    const optionsVBox = new VBox( {
      spacing: 10,
      children: [
        new LineOptionsNode( model, tandem ),
        MassesAndSpringsConstants.LINE_SEPARATOR( 165 ),
        vectorVisibilityControlNode
      ]
    } );

    // Panel that will display all the toggleable options.
    const optionsPanel = this.createOptionsPanel( optionsVBox, this.rightPanelAlignGroup, tandem );

    const gravityAccordionBox = new GravityAccordionBox(
      model.gravityProperty,
      model.bodyProperty,
      this,
      this.rightPanelAlignGroup,
      tandem.createTandem( 'gravityAccordionBox' ), {
        expandedProperty: model.gravityAccordionBoxExpandedProperty
      } );

    // Contains all of the options for the reference lines, gravity, damping, and toolbox
    const rightPanelsVBox = new VBox( {
      children: [ optionsPanel, gravityAccordionBox, this.toolboxPanel ],
      spacing: this.spacing * 0.9
    } );

    // Shelf used for masses
    const shelf = new ShelfNode( tandem, {
      rectHeight: 7,
      rectWidth: 200,
      left: this.visibleBoundsProperty.value.left + this.spacing,
      rectY: this.modelViewTransform.modelToViewY( MassesAndSpringsConstants.FLOOR_Y ) - this.shelf.rectHeight
    } );

    // Initializes equilibrium line for an attached mass
    const equilibriumLineNode = new ReferenceLineNode(
      this.modelViewTransform,
      model.firstSpring,
      model.firstSpring.equilibriumYPositionProperty,
      this.equilibriumVisibilityProperty, {
        stroke: MassesAndSpringsColors.restingPositionProperty
      }
    );
    this.addChild( equilibriumLineNode );

    const oscillationVisibilityProperty = new DerivedProperty( [
        model.firstSpring.periodTraceVisibilityProperty,
        model.accelerationVectorVisibilityProperty,
        model.velocityVectorVisibilityProperty,
        model.firstSpring.massAttachedProperty
      ],
      ( periodTraceVisible, accelerationVectorVisible, velocityVectorVisible, massAttached ) => {
        if ( massAttached ) {
          return periodTraceVisible || accelerationVectorVisible || velocityVectorVisible;
        }
        else {
          return false;
        }
      } );

    // Initializes center of oscillation line for an attached mass
    const centerOfOscillationLineNode = new ReferenceLineNode(
      this.modelViewTransform,
      model.firstSpring,
      model.firstSpring.massEquilibriumYPositionProperty,
      oscillationVisibilityProperty, {
        stroke: 'black',
        label: new Text( centerOfOscillationString, {
          font: MassesAndSpringsConstants.TITLE_FONT,
          fill: 'black',
          maxWidth: 125
        } )
      }
    );
    this.addChild( centerOfOscillationLineNode );

    // Accessed in Basics version to adjust to a larger width.
    const massValueControlPanel = new MassValueControlPanel(
      model.masses[ 0 ],
      this.massNodeIcon,
      tandem.createTandem( 'massValueControlPanel' ), {
        maxWidth: MassesAndSpringsConstants.PANEL_MAX_WIDTH + MassesAndSpringsConstants.PANEL_MAX_WIDTH * 0.05,
        basicsVersion: model.basicsVersion
      }
    );

    this.springSystemControlsNode.setChildren( [
      massValueControlPanel, this.springHangerNode, this.springStopperButtonNode
    ] );
    this.springSystemControlsNode.spacing = this.spacing * 1.2;

    // @private {PeriodTraceNode}
    this.periodTraceNode = new PeriodTraceNode( model.firstSpring.periodTrace, this.modelViewTransform, model.basicsVersion, {
      center: this.massEquilibriumLineNode.center
    } );

    // Move layers with interactive elements and layers to the front
    this.movableLineNode.moveToFront();
    this.massLayer.moveToFront();
    this.toolsLayer.moveToFront();

    this.resetAllButton.addListener( () => {
      this.movableLineNode.reset();
    } );

    // Back layer used to handle z order of view elements.
    this.backLayer.children = [ this.backgroundDragPlane, rightPanelsVBox, shelf, this.periodTraceNode ];

    this.visibleBoundsProperty.link( () => {
      rightPanelsVBox.rightTop = new Vector2( this.panelRightSpacing, this.spacing );
      this.springSystemControlsNode.centerX = this.springCenter * 0.835; // centering springHangerNode over spring
      this.springConstantControlPanel.left = this.springSystemControlsNode.right + this.spacing;
    } );
  }

  /**
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.periodTraceNode.step( dt, this.model.playingProperty );
  }
}

massesAndSpringsBasics.register( 'LabScreenView', LabScreenView );
export default LabScreenView;