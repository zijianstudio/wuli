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
  constructor(model, tandem) {
    super(model, tandem);

    // Equilibrium of mass is dependent on the mass being attached and the visibility of the equilibrium line.
    const firstMassEquilibriumVisibilityProperty = new DerivedProperty([model.equilibriumPositionVisibleProperty, model.firstSpring.massAttachedProperty], (equilibriumPositionVisible, massAttached) => {
      return !!massAttached && equilibriumPositionVisible;
    });
    const secondMassEquilibriumVisibilityProperty = new DerivedProperty([model.equilibriumPositionVisibleProperty, model.secondSpring.massAttachedProperty], (equilibriumPositionVisible, massAttached) => {
      return !!massAttached && equilibriumPositionVisible;
    });

    // Initializes equilibrium line for first spring
    const firstMassEquilibriumLineNode = new ReferenceLineNode(this.modelViewTransform, model.firstSpring, model.firstSpring.equilibriumYPositionProperty, firstMassEquilibriumVisibilityProperty, {
      stroke: MassesAndSpringsColors.restingPositionProperty
    });

    // Initializes equilibrium line for second spring
    const secondMassEquilibriumLineNode = new ReferenceLineNode(this.modelViewTransform, model.secondSpring, model.secondSpring.equilibriumYPositionProperty, secondMassEquilibriumVisibilityProperty, {
      stroke: MassesAndSpringsColors.restingPositionProperty
    });

    // Adding system controls to scene graph
    this.addChild(this.springSystemControlsNode);

    // Reference lines from indicator visibility box
    this.addChild(this.firstNaturalLengthLineNode);
    this.addChild(this.secondNaturalLengthLineNode);
    this.addChild(firstMassEquilibriumLineNode);
    this.addChild(secondMassEquilibriumLineNode);
    this.addChild(this.movableLineNode);
    this.addChild(this.massLayer);
    this.addChild(this.toolsLayer);

    // Panel that will display all the toggleable options.
    const optionsPanel = this.createOptionsPanel(new LineOptionsNode(model, tandem), this.rightPanelAlignGroup, tandem);

    // Contains all of the options for the reference lines, gravity, damping, and toolbox
    const rightPanelsVBox = new VBox({
      children: [optionsPanel, this.toolboxPanel],
      spacing: this.spacing * 0.9
    });
    this.visibleBoundsProperty.link(() => {
      rightPanelsVBox.rightTop = new Vector2(this.panelRightSpacing, this.spacing);
    });

    // Shelves used for masses
    const labeledMassesShelf = new ShelfNode(tandem, {
      rectHeight: 7,
      rectWidth: 185,
      left: this.layoutBounds.left + this.spacing,
      rectY: this.modelViewTransform.modelToViewY(MassesAndSpringsConstants.FLOOR_Y) - this.shelf.rectHeight
    });
    const mysteryMassesShelf = new ShelfNode(tandem, {
      rectHeight: 7,
      rectWidth: 120,
      left: labeledMassesShelf.right + this.spacing * 2,
      rectY: this.modelViewTransform.modelToViewY(MassesAndSpringsConstants.FLOOR_Y) - this.shelf.rectHeight
    });

    // Back layer used to handle z order of view elements.
    this.backLayer.children = [this.backgroundDragPlane, rightPanelsVBox, labeledMassesShelf, mysteryMassesShelf];
  }
}
massesAndSpringsBasics.register('BounceScreenView', BounceScreenView);
export default BounceScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cyIsIk1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMiLCJSZWZlcmVuY2VMaW5lTm9kZSIsIlNoZWxmTm9kZSIsIlR3b1NwcmluZ1NjcmVlblZpZXciLCJWQm94IiwiTGluZU9wdGlvbnNOb2RlIiwibWFzc2VzQW5kU3ByaW5nc0Jhc2ljcyIsIkJvdW5jZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwiZmlyc3RNYXNzRXF1aWxpYnJpdW1WaXNpYmlsaXR5UHJvcGVydHkiLCJlcXVpbGlicml1bVBvc2l0aW9uVmlzaWJsZVByb3BlcnR5IiwiZmlyc3RTcHJpbmciLCJtYXNzQXR0YWNoZWRQcm9wZXJ0eSIsImVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlIiwibWFzc0F0dGFjaGVkIiwic2Vjb25kTWFzc0VxdWlsaWJyaXVtVmlzaWJpbGl0eVByb3BlcnR5Iiwic2Vjb25kU3ByaW5nIiwiZmlyc3RNYXNzRXF1aWxpYnJpdW1MaW5lTm9kZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImVxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkiLCJzdHJva2UiLCJyZXN0aW5nUG9zaXRpb25Qcm9wZXJ0eSIsInNlY29uZE1hc3NFcXVpbGlicml1bUxpbmVOb2RlIiwiYWRkQ2hpbGQiLCJzcHJpbmdTeXN0ZW1Db250cm9sc05vZGUiLCJmaXJzdE5hdHVyYWxMZW5ndGhMaW5lTm9kZSIsInNlY29uZE5hdHVyYWxMZW5ndGhMaW5lTm9kZSIsIm1vdmFibGVMaW5lTm9kZSIsIm1hc3NMYXllciIsInRvb2xzTGF5ZXIiLCJvcHRpb25zUGFuZWwiLCJjcmVhdGVPcHRpb25zUGFuZWwiLCJyaWdodFBhbmVsQWxpZ25Hcm91cCIsInJpZ2h0UGFuZWxzVkJveCIsImNoaWxkcmVuIiwidG9vbGJveFBhbmVsIiwic3BhY2luZyIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJyaWdodFRvcCIsInBhbmVsUmlnaHRTcGFjaW5nIiwibGFiZWxlZE1hc3Nlc1NoZWxmIiwicmVjdEhlaWdodCIsInJlY3RXaWR0aCIsImxlZnQiLCJsYXlvdXRCb3VuZHMiLCJyZWN0WSIsIm1vZGVsVG9WaWV3WSIsIkZMT09SX1kiLCJzaGVsZiIsIm15c3RlcnlNYXNzZXNTaGVsZiIsInJpZ2h0IiwiYmFja0xheWVyIiwiYmFja2dyb3VuZERyYWdQbGFuZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm91bmNlU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBCb3VuY2Ugc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9tYXNzZXMtYW5kLXNwcmluZ3MvanMvY29tbW9uL01hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycyBmcm9tICcuLi8uLi8uLi8uLi9tYXNzZXMtYW5kLXNwcmluZ3MvanMvY29tbW9uL3ZpZXcvTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VMaW5lTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9tYXNzZXMtYW5kLXNwcmluZ3MvanMvY29tbW9uL3ZpZXcvUmVmZXJlbmNlTGluZU5vZGUuanMnO1xyXG5pbXBvcnQgU2hlbGZOb2RlIGZyb20gJy4uLy4uLy4uLy4uL21hc3Nlcy1hbmQtc3ByaW5ncy9qcy9jb21tb24vdmlldy9TaGVsZk5vZGUuanMnO1xyXG5pbXBvcnQgVHdvU3ByaW5nU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9tYXNzZXMtYW5kLXNwcmluZ3MvanMvY29tbW9uL3ZpZXcvVHdvU3ByaW5nU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCB7IFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTGluZU9wdGlvbnNOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xpbmVPcHRpb25zTm9kZS5qcyc7XHJcbmltcG9ydCBtYXNzZXNBbmRTcHJpbmdzQmFzaWNzIGZyb20gJy4uLy4uL21hc3Nlc0FuZFNwcmluZ3NCYXNpY3MuanMnO1xyXG5cclxuY2xhc3MgQm91bmNlU2NyZWVuVmlldyBleHRlbmRzIFR3b1NwcmluZ1NjcmVlblZpZXcge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWFzc2VzQW5kU3ByaW5nc01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIEVxdWlsaWJyaXVtIG9mIG1hc3MgaXMgZGVwZW5kZW50IG9uIHRoZSBtYXNzIGJlaW5nIGF0dGFjaGVkIGFuZCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZXF1aWxpYnJpdW0gbGluZS5cclxuICAgIGNvbnN0IGZpcnN0TWFzc0VxdWlsaWJyaXVtVmlzaWJpbGl0eVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5lcXVpbGlicml1bVBvc2l0aW9uVmlzaWJsZVByb3BlcnR5LCBtb2RlbC5maXJzdFNwcmluZy5tYXNzQXR0YWNoZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlLCBtYXNzQXR0YWNoZWQgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICEhbWFzc0F0dGFjaGVkICYmIGVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlO1xyXG4gICAgICB9ICk7XHJcbiAgICBjb25zdCBzZWNvbmRNYXNzRXF1aWxpYnJpdW1WaXNpYmlsaXR5UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG1vZGVsLmVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlUHJvcGVydHksIG1vZGVsLnNlY29uZFNwcmluZy5tYXNzQXR0YWNoZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlLCBtYXNzQXR0YWNoZWQgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICEhbWFzc0F0dGFjaGVkICYmIGVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZXMgZXF1aWxpYnJpdW0gbGluZSBmb3IgZmlyc3Qgc3ByaW5nXHJcbiAgICBjb25zdCBmaXJzdE1hc3NFcXVpbGlicml1bUxpbmVOb2RlID0gbmV3IFJlZmVyZW5jZUxpbmVOb2RlKFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgbW9kZWwuZmlyc3RTcHJpbmcsXHJcbiAgICAgIG1vZGVsLmZpcnN0U3ByaW5nLmVxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIGZpcnN0TWFzc0VxdWlsaWJyaXVtVmlzaWJpbGl0eVByb3BlcnR5LCB7XHJcbiAgICAgICAgc3Ryb2tlOiBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLnJlc3RpbmdQb3NpdGlvblByb3BlcnR5XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZXMgZXF1aWxpYnJpdW0gbGluZSBmb3Igc2Vjb25kIHNwcmluZ1xyXG4gICAgY29uc3Qgc2Vjb25kTWFzc0VxdWlsaWJyaXVtTGluZU5vZGUgPSBuZXcgUmVmZXJlbmNlTGluZU5vZGUoXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBtb2RlbC5zZWNvbmRTcHJpbmcsXHJcbiAgICAgIG1vZGVsLnNlY29uZFNwcmluZy5lcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBzZWNvbmRNYXNzRXF1aWxpYnJpdW1WaXNpYmlsaXR5UHJvcGVydHksIHtcclxuICAgICAgICBzdHJva2U6IE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMucmVzdGluZ1Bvc2l0aW9uUHJvcGVydHlcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGRpbmcgc3lzdGVtIGNvbnRyb2xzIHRvIHNjZW5lIGdyYXBoXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnNwcmluZ1N5c3RlbUNvbnRyb2xzTm9kZSApO1xyXG5cclxuICAgIC8vIFJlZmVyZW5jZSBsaW5lcyBmcm9tIGluZGljYXRvciB2aXNpYmlsaXR5IGJveFxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5maXJzdE5hdHVyYWxMZW5ndGhMaW5lTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zZWNvbmROYXR1cmFsTGVuZ3RoTGluZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGZpcnN0TWFzc0VxdWlsaWJyaXVtTGluZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNlY29uZE1hc3NFcXVpbGlicml1bUxpbmVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1vdmFibGVMaW5lTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5tYXNzTGF5ZXIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudG9vbHNMYXllciApO1xyXG5cclxuICAgIC8vIFBhbmVsIHRoYXQgd2lsbCBkaXNwbGF5IGFsbCB0aGUgdG9nZ2xlYWJsZSBvcHRpb25zLlxyXG4gICAgY29uc3Qgb3B0aW9uc1BhbmVsID0gdGhpcy5jcmVhdGVPcHRpb25zUGFuZWwoXHJcbiAgICAgIG5ldyBMaW5lT3B0aW9uc05vZGUoIG1vZGVsLCB0YW5kZW0gKSxcclxuICAgICAgdGhpcy5yaWdodFBhbmVsQWxpZ25Hcm91cCxcclxuICAgICAgdGFuZGVtXHJcbiAgICApO1xyXG5cclxuICAgIC8vIENvbnRhaW5zIGFsbCBvZiB0aGUgb3B0aW9ucyBmb3IgdGhlIHJlZmVyZW5jZSBsaW5lcywgZ3Jhdml0eSwgZGFtcGluZywgYW5kIHRvb2xib3hcclxuICAgIGNvbnN0IHJpZ2h0UGFuZWxzVkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIG9wdGlvbnNQYW5lbCwgdGhpcy50b29sYm94UGFuZWwgXSxcclxuICAgICAgc3BhY2luZzogdGhpcy5zcGFjaW5nICogMC45XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICByaWdodFBhbmVsc1ZCb3gucmlnaHRUb3AgPSBuZXcgVmVjdG9yMiggdGhpcy5wYW5lbFJpZ2h0U3BhY2luZywgdGhpcy5zcGFjaW5nICk7XHJcbiAgICB9ICk7XHJcblxyXG5cclxuICAgIC8vIFNoZWx2ZXMgdXNlZCBmb3IgbWFzc2VzXHJcbiAgICBjb25zdCBsYWJlbGVkTWFzc2VzU2hlbGYgPSBuZXcgU2hlbGZOb2RlKCB0YW5kZW0sIHtcclxuICAgICAgcmVjdEhlaWdodDogNyxcclxuICAgICAgcmVjdFdpZHRoOiAxODUsXHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyB0aGlzLnNwYWNpbmcsXHJcbiAgICAgIHJlY3RZOiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuRkxPT1JfWSApIC0gdGhpcy5zaGVsZi5yZWN0SGVpZ2h0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbXlzdGVyeU1hc3Nlc1NoZWxmID0gbmV3IFNoZWxmTm9kZSggdGFuZGVtLCB7XHJcbiAgICAgIHJlY3RIZWlnaHQ6IDcsXHJcbiAgICAgIHJlY3RXaWR0aDogMTIwLFxyXG4gICAgICBsZWZ0OiBsYWJlbGVkTWFzc2VzU2hlbGYucmlnaHQgKyB0aGlzLnNwYWNpbmcgKiAyLFxyXG4gICAgICByZWN0WTogdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkZMT09SX1kgKSAtIHRoaXMuc2hlbGYucmVjdEhlaWdodFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEJhY2sgbGF5ZXIgdXNlZCB0byBoYW5kbGUgeiBvcmRlciBvZiB2aWV3IGVsZW1lbnRzLlxyXG4gICAgdGhpcy5iYWNrTGF5ZXIuY2hpbGRyZW4gPSBbIHRoaXMuYmFja2dyb3VuZERyYWdQbGFuZSwgcmlnaHRQYW5lbHNWQm94LCBsYWJlbGVkTWFzc2VzU2hlbGYsIG15c3RlcnlNYXNzZXNTaGVsZiBdO1xyXG4gIH1cclxufVxyXG5cclxubWFzc2VzQW5kU3ByaW5nc0Jhc2ljcy5yZWdpc3RlciggJ0JvdW5jZVNjcmVlblZpZXcnLCBCb3VuY2VTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJvdW5jZVNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyx5QkFBeUIsTUFBTSx1RUFBdUU7QUFDN0csT0FBT0Msc0JBQXNCLE1BQU0seUVBQXlFO0FBQzVHLE9BQU9DLGlCQUFpQixNQUFNLG9FQUFvRTtBQUNsRyxPQUFPQyxTQUFTLE1BQU0sNERBQTREO0FBQ2xGLE9BQU9DLG1CQUFtQixNQUFNLHNFQUFzRTtBQUN0RyxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9B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