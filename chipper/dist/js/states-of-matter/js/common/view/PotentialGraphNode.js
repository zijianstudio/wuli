// Copyright 2014-2023, University of Colorado Boulder

/**
 * This class displays a graph that depicts and interaction potential.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import PositionMarker from '../../atomic-interactions/view/PositionMarker.js';
import ZoomableGridNode from '../../atomic-interactions/view/ZoomableGridNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import LjPotentialCalculator from '../model/LjPotentialCalculator.js';
import SOMConstants from '../SOMConstants.js';
import SOMColors from './SOMColors.js';
const distanceBetweenAtomsString = StatesOfMatterStrings.distanceBetweenAtoms;
const distanceBetweenMoleculesString = StatesOfMatterStrings.distanceBetweenMolecules;
const epsilonString = StatesOfMatterStrings.epsilon;
const potentialEnergyString = StatesOfMatterStrings.potentialEnergy;
const sigmaString = StatesOfMatterStrings.sigma;

// constant that controls the range of data that is graphed
const X_RANGE = 1300; // in picometers

// constants that control the appearance of the graph
const NARROW_VERSION_WIDTH = 135;
const WIDE_VERSION_WIDTH = 350;
const AXIS_LINE_WIDTH = 2;
const AXES_ARROW_HEAD_HEIGHT = 4 * AXIS_LINE_WIDTH;

// Size of pos marker wrt overall width.
const POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

// constants that control the position and size of the graph.
const VERT_AXIS_SIZE_PROPORTION = 0.85;

// Font for the labels used on the axes and within the graph.
const GREEK_LETTER_FONT_SIZE = 18;
let GREEK_LETTER_FONT = new PhetFont(GREEK_LETTER_FONT_SIZE);
let GREEK_LETTER_MAX_WIDTH;

// zoom buttons height
const ZOOM_BUTTONS_HEIGHT = 72;
class PotentialGraphNode extends Node {
  /**
   * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {Object} [options]
   */
  constructor(sigma, epsilon, options) {
    options = merge({
      // {boolean} - true if the widescreen version of the graph is needed, false if not
      wide: false,
      // {boolean} - whether or not this graph instance should have a position marker
      includePositionMarker: false,
      // {boolean} - whether or not this graph instance should allow interactivity (see usage for more information)
      allowInteraction: false
    }, options);
    super();

    // @public (read-only)
    this.graphMin = new Vector2(0, 0);
    this.xRange = X_RANGE;
    this.zeroCrossingPoint = new Vector2(0, 0);
    this.markerDistance = 0;
    this.ljPotentialCalculator = new LjPotentialCalculator(sigma, epsilon);
    let axisLabelFont;

    // Set up for the normal or wide version of the graph.
    if (options.wide) {
      this.widthOfGraph = WIDE_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.75;
      GREEK_LETTER_FONT = new PhetFont(22);
      axisLabelFont = new PhetFont({
        size: 16,
        fill: SOMColors.controlPanelTextProperty
      });
      GREEK_LETTER_MAX_WIDTH = 60;
    } else {
      this.widthOfGraph = NARROW_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.8;
      axisLabelFont = new PhetFont({
        size: 11,
        fill: SOMColors.controlPanelTextProperty
      });
      GREEK_LETTER_FONT = new PhetFont(GREEK_LETTER_FONT_SIZE);
      GREEK_LETTER_MAX_WIDTH = 17;
    }
    this.graphXOrigin = 0.05 * this.widthOfGraph;
    this.graphYOrigin = 0.85 * this.heightOfGraph;
    this.graphWidth = this.widthOfGraph - this.graphXOrigin - AXES_ARROW_HEAD_HEIGHT;
    this.graphHeight = this.heightOfGraph * VERT_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;

    // Layer where the graph elements are added.
    this.ljPotentialGraph = new Node();

    //  Using ~45% (1/2.2) of graph height instead of 50 % graph height as in the Java version.
    // This is done to fix the point flickering at the bottom most point.
    // see https://github.com/phetsims/states-of-matter/issues/63 and
    // https://github.com/phetsims/states-of-matter/issues/25
    this.verticalScalingFactor = this.graphHeight / 2.2 / (SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN);
    this.horizontalLineCount = 5;

    // Add the arrows and labels that will depict sigma and epsilon.
    this.epsilonArrow = new ArrowNode(0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 20,
      tailWidth: 9,
      doubleHead: false,
      fill: SOMColors.controlPanelTextProperty,
      lineWidth: 0.5
    });
    this.epsilonLabel = new Text(epsilonString, {
      font: GREEK_LETTER_FONT,
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: GREEK_LETTER_MAX_WIDTH,
      boundsMethod: 'accurate' // This seems necessary for good graph layout, and doesn't seem to impact performance.
    });

    // For some of the string tests, a boundsMethod value of 'accurate' causes undefined bounds, so handle this here.
    // TODO: Remove this code if the issue https://github.com/phetsims/scenery/issues/595 is addressed.
    if (isNaN(this.epsilonLabel.width) || isNaN(this.epsilonLabel.height)) {
      this.epsilonLabel.boundsMethod = 'hybrid';
    }
    const epsilonGraphLabel = new Node({
      children: [this.epsilonArrow, this.epsilonLabel],
      tandem: options.tandem.createTandem('epsilonGraphLabel')
    });
    this.ljPotentialGraph.addChild(epsilonGraphLabel);
    this.sigmaLabel = new Text(sigmaString, {
      font: GREEK_LETTER_FONT,
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: GREEK_LETTER_MAX_WIDTH
    });
    this.sigmaArrow = new ArrowNode(0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      doubleHead: true,
      fill: SOMColors.controlPanelTextProperty,
      lineWidth: 0.5
    });
    const sigmaGraphLabel = new Node({
      children: [this.sigmaArrow, this.sigmaLabel],
      tandem: options.tandem.createTandem('sigmaGraphLabel')
    });
    this.ljPotentialGraph.addChild(sigmaGraphLabel);

    // If enabled, add the layer where interactive controls can be placed and other infrastructure.  This does not provide
    // any interactivity by itself, it merely creates support for interactive controls that can be added by subclasses.
    if (options.allowInteraction) {
      // @protected - layer where interactive controls can be added by subclasses
      this.interactiveControlsLayer = new Node({
        tandem: options.tandem.createTandem('interactiveControls'),
        phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
      });
      this.ljPotentialGraph.addChild(this.interactiveControlsLayer);

      // @protected - an object where specific controls can be added for controlling the epsilon parameter in the Lennard-
      // Jones potential calculations, see usages in subclasses
      this.epsilonControls = {
        arrow: null,
        line: null
      };

      // @protected - an object where a specific control can be added for controlling the sigma parameter in the Lennard-
      // Jones potential calculations, see usages in subclasses.  See usages in subclasses.
      this.sigmaControls = {
        arrow: null
      };
    }

    // Add the position marker if included.
    if (options.includePositionMarker) {
      const markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * this.graphWidth;
      this.positionMarker = new PositionMarker(markerDiameter / 2, 'rgb( 117, 217, 255 )', {
        tandem: options.tandem.createTandem('positionMarker')
      });
      this.ljPotentialGraph.addChild(this.positionMarker);
    }

    // now that the graph portion is built, position it correctly
    this.ljPotentialGraph.x = this.graphXOrigin;
    this.ljPotentialGraph.y = this.graphYOrigin - this.graphHeight;

    // Create the horizontal axis line for the graph.
    this.horizontalAxis = new ArrowNode(0, 0, this.graphWidth + AXES_ARROW_HEAD_HEIGHT, 0, {
      fill: SOMColors.controlPanelTextProperty,
      stroke: SOMColors.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: 2,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    });
    this.horizontalAxisLabel = new Text(distanceBetweenAtomsString, {
      fill: SOMColors.controlPanelTextProperty,
      font: axisLabelFont
    });
    if (this.horizontalAxisLabel.width > this.horizontalAxis.width) {
      if (options.wide) {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width;
      } else {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width + 30;
      }
    }
    this.setMolecular(false);

    // Create the vertical axis line for the graph.
    this.verticalAxis = new ArrowNode(0, 0, 0, -this.graphHeight - AXES_ARROW_HEAD_HEIGHT, {
      fill: SOMColors.controlPanelTextProperty,
      stroke: SOMColors.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: AXIS_LINE_WIDTH,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    });
    this.verticalAxisLabel = new Text(potentialEnergyString, {
      fill: SOMColors.controlPanelTextProperty,
      font: axisLabelFont
    });

    // Create the center axis line for the graph.
    this.centerAxis = new Line(0, 0, this.graphWidth, 0, {
      lineWidth: 0.8,
      stroke: '#A7A7A7',
      x: this.graphXOrigin,
      y: this.graphYOrigin - this.graphHeight / 2
    });

    // restricted vertical axis label
    const verticalAxisHeight = options.wide ? this.verticalAxis.height - ZOOM_BUTTONS_HEIGHT : this.verticalAxis.height;
    if (this.verticalAxisLabel.width > verticalAxisHeight) {
      this.verticalAxisLabel.scale(verticalAxisHeight / this.verticalAxisLabel.width);
    }
    this.verticalAxisLabel.setTranslation(this.graphXOrigin / 2 - this.verticalAxisLabel.height / 2, this.graphYOrigin);
    this.verticalAxisLabel.setRotation(3 * Math.PI / 2);

    // Draw the initial curve upon the graph.
    this.drawPotentialCurve();
    if (options.wide) {
      this.gridNode = new ZoomableGridNode(this, 0, 0, this.graphWidth, this.graphHeight, {
        addZoomButtons: options.zoomable,
        tandem: options.tandem.createTandem('gridNode')
      });
      this.gridNode.x = this.graphXOrigin;
      this.gridNode.y = this.graphYOrigin - this.graphHeight;
      this.addChild(this.gridNode);
    }
  }

  /**
   * Set the parameters that define the shape of the Lennard-Jones potential curve.
   * @param{number} sigma -  atom diameter
   * @param {number} epsilon - interaction strength
   * @public
   */
  setLjPotentialParameters(sigma, epsilon) {
    // Update the Lennard-Jones force calculator.
    this.ljPotentialCalculator.setEpsilon(epsilon);
    this.ljPotentialCalculator.setSigma(sigma);
  }

  /**
   * @public
   */
  reset() {
    this.verticalScalingFactor = this.graphHeight / 2.2 / (SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN);
    this.horizontalLineCount = 5;
    this.drawPotentialCurve();
    this.gridNode && this.gridNode.reset();
  }

  /**
   * @returns {number}
   * @public
   */
  getGraphHeight() {
    return this.graphHeight;
  }

  /**
   * @returns {number}
   * @public
   */
  getGraphWidth() {
    return this.graphWidth;
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getZeroCrossingPoint() {
    return this.zeroCrossingPoint;
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getGraphMin() {
    return this.graphMin;
  }

  /**
   * Set the position of the position marker.  Note that is is only possible to set the x axis position, which is
   * distance.  The y axis position is always on the LJ potential curve.
   * @param {number}distance - distance from the center of the interacting molecules.
   * @public
   */
  setMarkerPosition(distance) {
    assert && assert(this.positionMarker, 'position marker not enabled for this potential graph node');
    this.markerDistance = distance;
    const xPos = this.markerDistance * (this.graphWidth / this.xRange);
    const potential = this.calculateLennardJonesPotential(this.markerDistance);
    const yPos = this.graphHeight / 2 - potential * this.verticalScalingFactor;
    if (xPos > 0 && xPos < this.graphWidth && yPos > 0 && yPos < this.graphHeight) {
      this.positionMarker.setVisible(true);
      this.positionMarker.setTranslation(xPos, yPos);
    } else {
      this.positionMarker.setVisible(false);
    }
  }

  /**
   * Set whether the graph is showing the potential between individual atoms or multi-atom molecules.
   * @param {boolean} molecular - true if graph is portraying molecules, false for individual atoms.
   * @public
   */
  setMolecular(molecular) {
    if (molecular) {
      this.horizontalAxisLabel.setString(distanceBetweenMoleculesString);
    } else {
      this.horizontalAxisLabel.setString(distanceBetweenAtomsString);
    }
    this.horizontalAxisLabel.centerX = this.graphXOrigin + this.graphWidth / 2;
    this.horizontalAxisLabel.top = this.graphYOrigin + 5;
  }

  /**
   * Calculate the Lennard-Jones potential for the given distance.
   * @param {number} radius
   * @returns {number}
   * @public
   */
  calculateLennardJonesPotential(radius) {
    return this.ljPotentialCalculator.getLjPotential(radius);
  }

  /**
   * Draw the curve that reflects the Lennard-Jones potential based upon the current values for sigma and epsilon.
   * @public
   */
  drawPotentialCurve() {
    // must be overridden in descendant types, so assert if called here
    assert && assert(false, 'this function must be overridden in descendant classes');
  }
}
statesOfMatter.register('PotentialGraphNode', PotentialGraphNode);
export default PotentialGraphNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJBcnJvd05vZGUiLCJQaGV0Rm9udCIsIkxpbmUiLCJOb2RlIiwiVGV4dCIsIlBvc2l0aW9uTWFya2VyIiwiWm9vbWFibGVHcmlkTm9kZSIsInN0YXRlc09mTWF0dGVyIiwiU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzIiwiTGpQb3RlbnRpYWxDYWxjdWxhdG9yIiwiU09NQ29uc3RhbnRzIiwiU09NQ29sb3JzIiwiZGlzdGFuY2VCZXR3ZWVuQXRvbXNTdHJpbmciLCJkaXN0YW5jZUJldHdlZW5BdG9tcyIsImRpc3RhbmNlQmV0d2Vlbk1vbGVjdWxlc1N0cmluZyIsImRpc3RhbmNlQmV0d2Vlbk1vbGVjdWxlcyIsImVwc2lsb25TdHJpbmciLCJlcHNpbG9uIiwicG90ZW50aWFsRW5lcmd5U3RyaW5nIiwicG90ZW50aWFsRW5lcmd5Iiwic2lnbWFTdHJpbmciLCJzaWdtYSIsIlhfUkFOR0UiLCJOQVJST1dfVkVSU0lPTl9XSURUSCIsIldJREVfVkVSU0lPTl9XSURUSCIsIkFYSVNfTElORV9XSURUSCIsIkFYRVNfQVJST1dfSEVBRF9IRUlHSFQiLCJQT1NJVElPTl9NQVJLRVJfRElBTUVURVJfUFJPUE9SVElPTiIsIlZFUlRfQVhJU19TSVpFX1BST1BPUlRJT04iLCJHUkVFS19MRVRURVJfRk9OVF9TSVpFIiwiR1JFRUtfTEVUVEVSX0ZPTlQiLCJHUkVFS19MRVRURVJfTUFYX1dJRFRIIiwiWk9PTV9CVVRUT05TX0hFSUdIVCIsIlBvdGVudGlhbEdyYXBoTm9kZSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIndpZGUiLCJpbmNsdWRlUG9zaXRpb25NYXJrZXIiLCJhbGxvd0ludGVyYWN0aW9uIiwiZ3JhcGhNaW4iLCJ4UmFuZ2UiLCJ6ZXJvQ3Jvc3NpbmdQb2ludCIsIm1hcmtlckRpc3RhbmNlIiwibGpQb3RlbnRpYWxDYWxjdWxhdG9yIiwiYXhpc0xhYmVsRm9udCIsIndpZHRoT2ZHcmFwaCIsImhlaWdodE9mR3JhcGgiLCJzaXplIiwiZmlsbCIsImNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSIsImdyYXBoWE9yaWdpbiIsImdyYXBoWU9yaWdpbiIsImdyYXBoV2lkdGgiLCJncmFwaEhlaWdodCIsImxqUG90ZW50aWFsR3JhcGgiLCJ2ZXJ0aWNhbFNjYWxpbmdGYWN0b3IiLCJNQVhfRVBTSUxPTiIsIktfQk9MVFpNQU5OIiwiaG9yaXpvbnRhbExpbmVDb3VudCIsImVwc2lsb25BcnJvdyIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJ0YWlsV2lkdGgiLCJkb3VibGVIZWFkIiwibGluZVdpZHRoIiwiZXBzaWxvbkxhYmVsIiwiZm9udCIsIm1heFdpZHRoIiwiYm91bmRzTWV0aG9kIiwiaXNOYU4iLCJ3aWR0aCIsImhlaWdodCIsImVwc2lsb25HcmFwaExhYmVsIiwiY2hpbGRyZW4iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJhZGRDaGlsZCIsInNpZ21hTGFiZWwiLCJzaWdtYUFycm93Iiwic2lnbWFHcmFwaExhYmVsIiwiaW50ZXJhY3RpdmVDb250cm9sc0xheWVyIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImVwc2lsb25Db250cm9scyIsImFycm93IiwibGluZSIsInNpZ21hQ29udHJvbHMiLCJtYXJrZXJEaWFtZXRlciIsInBvc2l0aW9uTWFya2VyIiwieCIsInkiLCJob3Jpem9udGFsQXhpcyIsInN0cm9rZSIsImhvcml6b250YWxBeGlzTGFiZWwiLCJzZXRNb2xlY3VsYXIiLCJ2ZXJ0aWNhbEF4aXMiLCJ2ZXJ0aWNhbEF4aXNMYWJlbCIsImNlbnRlckF4aXMiLCJ2ZXJ0aWNhbEF4aXNIZWlnaHQiLCJzY2FsZSIsInNldFRyYW5zbGF0aW9uIiwic2V0Um90YXRpb24iLCJNYXRoIiwiUEkiLCJkcmF3UG90ZW50aWFsQ3VydmUiLCJncmlkTm9kZSIsImFkZFpvb21CdXR0b25zIiwiem9vbWFibGUiLCJzZXRMalBvdGVudGlhbFBhcmFtZXRlcnMiLCJzZXRFcHNpbG9uIiwic2V0U2lnbWEiLCJyZXNldCIsImdldEdyYXBoSGVpZ2h0IiwiZ2V0R3JhcGhXaWR0aCIsImdldFplcm9Dcm9zc2luZ1BvaW50IiwiZ2V0R3JhcGhNaW4iLCJzZXRNYXJrZXJQb3NpdGlvbiIsImRpc3RhbmNlIiwiYXNzZXJ0IiwieFBvcyIsInBvdGVudGlhbCIsImNhbGN1bGF0ZUxlbm5hcmRKb25lc1BvdGVudGlhbCIsInlQb3MiLCJzZXRWaXNpYmxlIiwibW9sZWN1bGFyIiwic2V0U3RyaW5nIiwiY2VudGVyWCIsInRvcCIsInJhZGl1cyIsImdldExqUG90ZW50aWFsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb3RlbnRpYWxHcmFwaE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBkaXNwbGF5cyBhIGdyYXBoIHRoYXQgZGVwaWN0cyBhbmQgaW50ZXJhY3Rpb24gcG90ZW50aWFsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQb3NpdGlvbk1hcmtlciBmcm9tICcuLi8uLi9hdG9taWMtaW50ZXJhY3Rpb25zL3ZpZXcvUG9zaXRpb25NYXJrZXIuanMnO1xyXG5pbXBvcnQgWm9vbWFibGVHcmlkTm9kZSBmcm9tICcuLi8uLi9hdG9taWMtaW50ZXJhY3Rpb25zL3ZpZXcvWm9vbWFibGVHcmlkTm9kZS5qcyc7XHJcbmltcG9ydCBzdGF0ZXNPZk1hdHRlciBmcm9tICcuLi8uLi9zdGF0ZXNPZk1hdHRlci5qcyc7XHJcbmltcG9ydCBTdGF0ZXNPZk1hdHRlclN0cmluZ3MgZnJvbSAnLi4vLi4vU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLmpzJztcclxuaW1wb3J0IExqUG90ZW50aWFsQ2FsY3VsYXRvciBmcm9tICcuLi9tb2RlbC9MalBvdGVudGlhbENhbGN1bGF0b3IuanMnO1xyXG5pbXBvcnQgU09NQ29uc3RhbnRzIGZyb20gJy4uL1NPTUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTT01Db2xvcnMgZnJvbSAnLi9TT01Db2xvcnMuanMnO1xyXG5cclxuY29uc3QgZGlzdGFuY2VCZXR3ZWVuQXRvbXNTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MuZGlzdGFuY2VCZXR3ZWVuQXRvbXM7XHJcbmNvbnN0IGRpc3RhbmNlQmV0d2Vlbk1vbGVjdWxlc1N0cmluZyA9IFN0YXRlc09mTWF0dGVyU3RyaW5ncy5kaXN0YW5jZUJldHdlZW5Nb2xlY3VsZXM7XHJcbmNvbnN0IGVwc2lsb25TdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MuZXBzaWxvbjtcclxuY29uc3QgcG90ZW50aWFsRW5lcmd5U3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLnBvdGVudGlhbEVuZXJneTtcclxuY29uc3Qgc2lnbWFTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3Muc2lnbWE7XHJcblxyXG4vLyBjb25zdGFudCB0aGF0IGNvbnRyb2xzIHRoZSByYW5nZSBvZiBkYXRhIHRoYXQgaXMgZ3JhcGhlZFxyXG5jb25zdCBYX1JBTkdFID0gMTMwMDsgLy8gaW4gcGljb21ldGVyc1xyXG5cclxuLy8gY29uc3RhbnRzIHRoYXQgY29udHJvbCB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgZ3JhcGhcclxuY29uc3QgTkFSUk9XX1ZFUlNJT05fV0lEVEggPSAxMzU7XHJcbmNvbnN0IFdJREVfVkVSU0lPTl9XSURUSCA9IDM1MDtcclxuY29uc3QgQVhJU19MSU5FX1dJRFRIID0gMjtcclxuY29uc3QgQVhFU19BUlJPV19IRUFEX0hFSUdIVCA9IDQgKiBBWElTX0xJTkVfV0lEVEg7XHJcblxyXG4vLyBTaXplIG9mIHBvcyBtYXJrZXIgd3J0IG92ZXJhbGwgd2lkdGguXHJcbmNvbnN0IFBPU0lUSU9OX01BUktFUl9ESUFNRVRFUl9QUk9QT1JUSU9OID0gMC4wMztcclxuXHJcbi8vIGNvbnN0YW50cyB0aGF0IGNvbnRyb2wgdGhlIHBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSBncmFwaC5cclxuY29uc3QgVkVSVF9BWElTX1NJWkVfUFJPUE9SVElPTiA9IDAuODU7XHJcblxyXG4vLyBGb250IGZvciB0aGUgbGFiZWxzIHVzZWQgb24gdGhlIGF4ZXMgYW5kIHdpdGhpbiB0aGUgZ3JhcGguXHJcbmNvbnN0IEdSRUVLX0xFVFRFUl9GT05UX1NJWkUgPSAxODtcclxubGV0IEdSRUVLX0xFVFRFUl9GT05UID0gbmV3IFBoZXRGb250KCBHUkVFS19MRVRURVJfRk9OVF9TSVpFICk7XHJcbmxldCBHUkVFS19MRVRURVJfTUFYX1dJRFRIO1xyXG5cclxuLy8gem9vbSBidXR0b25zIGhlaWdodFxyXG5jb25zdCBaT09NX0JVVFRPTlNfSEVJR0hUID0gNzI7XHJcblxyXG5jbGFzcyBQb3RlbnRpYWxHcmFwaE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ21hIC0gSW5pdGlhbCB2YWx1ZSBvZiBzaWdtYSwgYS5rLmEuIHRoZSBhdG9tIGRpYW1ldGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBJbml0aWFsIHZhbHVlIG9mIGVwc2lsb24sIGEuay5hLiB0aGUgaW50ZXJhY3Rpb24gc3RyZW5ndGhcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNpZ21hLCBlcHNpbG9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGUgd2lkZXNjcmVlbiB2ZXJzaW9uIG9mIHRoZSBncmFwaCBpcyBuZWVkZWQsIGZhbHNlIGlmIG5vdFxyXG4gICAgICB3aWRlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHRoaXMgZ3JhcGggaW5zdGFuY2Ugc2hvdWxkIGhhdmUgYSBwb3NpdGlvbiBtYXJrZXJcclxuICAgICAgaW5jbHVkZVBvc2l0aW9uTWFya2VyOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHRoaXMgZ3JhcGggaW5zdGFuY2Ugc2hvdWxkIGFsbG93IGludGVyYWN0aXZpdHkgKHNlZSB1c2FnZSBmb3IgbW9yZSBpbmZvcm1hdGlvbilcclxuICAgICAgYWxsb3dJbnRlcmFjdGlvbjogZmFsc2VcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmdyYXBoTWluID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMueFJhbmdlID0gWF9SQU5HRTtcclxuICAgIHRoaXMuemVyb0Nyb3NzaW5nUG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5tYXJrZXJEaXN0YW5jZSA9IDA7XHJcbiAgICB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvciA9IG5ldyBMalBvdGVudGlhbENhbGN1bGF0b3IoIHNpZ21hLCBlcHNpbG9uICk7XHJcblxyXG4gICAgbGV0IGF4aXNMYWJlbEZvbnQ7XHJcblxyXG4gICAgLy8gU2V0IHVwIGZvciB0aGUgbm9ybWFsIG9yIHdpZGUgdmVyc2lvbiBvZiB0aGUgZ3JhcGguXHJcbiAgICBpZiAoIG9wdGlvbnMud2lkZSApIHtcclxuICAgICAgdGhpcy53aWR0aE9mR3JhcGggPSBXSURFX1ZFUlNJT05fV0lEVEg7XHJcbiAgICAgIHRoaXMuaGVpZ2h0T2ZHcmFwaCA9IHRoaXMud2lkdGhPZkdyYXBoICogMC43NTtcclxuICAgICAgR1JFRUtfTEVUVEVSX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcbiAgICAgIGF4aXNMYWJlbEZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIGZpbGw6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxUZXh0UHJvcGVydHkgfSApO1xyXG4gICAgICBHUkVFS19MRVRURVJfTUFYX1dJRFRIID0gNjA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy53aWR0aE9mR3JhcGggPSBOQVJST1dfVkVSU0lPTl9XSURUSDtcclxuICAgICAgdGhpcy5oZWlnaHRPZkdyYXBoID0gdGhpcy53aWR0aE9mR3JhcGggKiAwLjg7XHJcbiAgICAgIGF4aXNMYWJlbEZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTEsIGZpbGw6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxUZXh0UHJvcGVydHkgfSApO1xyXG4gICAgICBHUkVFS19MRVRURVJfRk9OVCA9IG5ldyBQaGV0Rm9udCggR1JFRUtfTEVUVEVSX0ZPTlRfU0laRSApO1xyXG4gICAgICBHUkVFS19MRVRURVJfTUFYX1dJRFRIID0gMTc7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdyYXBoWE9yaWdpbiA9IDAuMDUgKiB0aGlzLndpZHRoT2ZHcmFwaDtcclxuICAgIHRoaXMuZ3JhcGhZT3JpZ2luID0gMC44NSAqIHRoaXMuaGVpZ2h0T2ZHcmFwaDtcclxuICAgIHRoaXMuZ3JhcGhXaWR0aCA9IHRoaXMud2lkdGhPZkdyYXBoIC0gdGhpcy5ncmFwaFhPcmlnaW4gLSBBWEVTX0FSUk9XX0hFQURfSEVJR0hUO1xyXG5cclxuICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB0aGlzLmhlaWdodE9mR3JhcGggKiBWRVJUX0FYSVNfU0laRV9QUk9QT1JUSU9OIC0gQVhFU19BUlJPV19IRUFEX0hFSUdIVDtcclxuXHJcbiAgICAvLyBMYXllciB3aGVyZSB0aGUgZ3JhcGggZWxlbWVudHMgYXJlIGFkZGVkLlxyXG4gICAgdGhpcy5salBvdGVudGlhbEdyYXBoID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyAgVXNpbmcgfjQ1JSAoMS8yLjIpIG9mIGdyYXBoIGhlaWdodCBpbnN0ZWFkIG9mIDUwICUgZ3JhcGggaGVpZ2h0IGFzIGluIHRoZSBKYXZhIHZlcnNpb24uXHJcbiAgICAvLyBUaGlzIGlzIGRvbmUgdG8gZml4IHRoZSBwb2ludCBmbGlja2VyaW5nIGF0IHRoZSBib3R0b20gbW9zdCBwb2ludC5cclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3RhdGVzLW9mLW1hdHRlci9pc3N1ZXMvNjMgYW5kXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3RhdGVzLW9mLW1hdHRlci9pc3N1ZXMvMjVcclxuICAgIHRoaXMudmVydGljYWxTY2FsaW5nRmFjdG9yID0gKCB0aGlzLmdyYXBoSGVpZ2h0IC8gMi4yICkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFNPTUNvbnN0YW50cy5NQVhfRVBTSUxPTiAqIFNPTUNvbnN0YW50cy5LX0JPTFRaTUFOTiApO1xyXG4gICAgdGhpcy5ob3Jpem9udGFsTGluZUNvdW50ID0gNTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGFycm93cyBhbmQgbGFiZWxzIHRoYXQgd2lsbCBkZXBpY3Qgc2lnbWEgYW5kIGVwc2lsb24uXHJcbiAgICB0aGlzLmVwc2lsb25BcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIDAsIDAsIHtcclxuICAgICAgaGVhZEhlaWdodDogOCxcclxuICAgICAgaGVhZFdpZHRoOiAyMCxcclxuICAgICAgdGFpbFdpZHRoOiA5LFxyXG4gICAgICBkb3VibGVIZWFkOiBmYWxzZSxcclxuICAgICAgZmlsbDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiAwLjVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVwc2lsb25MYWJlbCA9IG5ldyBUZXh0KCBlcHNpbG9uU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IEdSRUVLX0xFVFRFUl9GT05ULFxyXG4gICAgICBmaWxsOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5LFxyXG4gICAgICBtYXhXaWR0aDogR1JFRUtfTEVUVEVSX01BWF9XSURUSCxcclxuICAgICAgYm91bmRzTWV0aG9kOiAnYWNjdXJhdGUnIC8vIFRoaXMgc2VlbXMgbmVjZXNzYXJ5IGZvciBnb29kIGdyYXBoIGxheW91dCwgYW5kIGRvZXNuJ3Qgc2VlbSB0byBpbXBhY3QgcGVyZm9ybWFuY2UuXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRm9yIHNvbWUgb2YgdGhlIHN0cmluZyB0ZXN0cywgYSBib3VuZHNNZXRob2QgdmFsdWUgb2YgJ2FjY3VyYXRlJyBjYXVzZXMgdW5kZWZpbmVkIGJvdW5kcywgc28gaGFuZGxlIHRoaXMgaGVyZS5cclxuICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGNvZGUgaWYgdGhlIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81OTUgaXMgYWRkcmVzc2VkLlxyXG4gICAgaWYgKCBpc05hTiggdGhpcy5lcHNpbG9uTGFiZWwud2lkdGggKSB8fCBpc05hTiggdGhpcy5lcHNpbG9uTGFiZWwuaGVpZ2h0ICkgKSB7XHJcbiAgICAgIHRoaXMuZXBzaWxvbkxhYmVsLmJvdW5kc01ldGhvZCA9ICdoeWJyaWQnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVwc2lsb25HcmFwaExhYmVsID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGhpcy5lcHNpbG9uQXJyb3csIHRoaXMuZXBzaWxvbkxhYmVsIF0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXBzaWxvbkdyYXBoTGFiZWwnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMubGpQb3RlbnRpYWxHcmFwaC5hZGRDaGlsZCggZXBzaWxvbkdyYXBoTGFiZWwgKTtcclxuXHJcbiAgICB0aGlzLnNpZ21hTGFiZWwgPSBuZXcgVGV4dCggc2lnbWFTdHJpbmcsIHtcclxuICAgICAgZm9udDogR1JFRUtfTEVUVEVSX0ZPTlQsXHJcbiAgICAgIGZpbGw6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxUZXh0UHJvcGVydHksXHJcbiAgICAgIG1heFdpZHRoOiBHUkVFS19MRVRURVJfTUFYX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNpZ21hQXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCAwLCAwLCB7XHJcbiAgICAgIGhlYWRIZWlnaHQ6IDgsXHJcbiAgICAgIGhlYWRXaWR0aDogOCxcclxuICAgICAgdGFpbFdpZHRoOiAzLFxyXG4gICAgICBkb3VibGVIZWFkOiB0cnVlLFxyXG4gICAgICBmaWxsOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDAuNVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNpZ21hR3JhcGhMYWJlbCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMuc2lnbWFBcnJvdywgdGhpcy5zaWdtYUxhYmVsIF0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2lnbWFHcmFwaExhYmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmxqUG90ZW50aWFsR3JhcGguYWRkQ2hpbGQoIHNpZ21hR3JhcGhMYWJlbCApO1xyXG5cclxuICAgIC8vIElmIGVuYWJsZWQsIGFkZCB0aGUgbGF5ZXIgd2hlcmUgaW50ZXJhY3RpdmUgY29udHJvbHMgY2FuIGJlIHBsYWNlZCBhbmQgb3RoZXIgaW5mcmFzdHJ1Y3R1cmUuICBUaGlzIGRvZXMgbm90IHByb3ZpZGVcclxuICAgIC8vIGFueSBpbnRlcmFjdGl2aXR5IGJ5IGl0c2VsZiwgaXQgbWVyZWx5IGNyZWF0ZXMgc3VwcG9ydCBmb3IgaW50ZXJhY3RpdmUgY29udHJvbHMgdGhhdCBjYW4gYmUgYWRkZWQgYnkgc3ViY2xhc3Nlcy5cclxuICAgIGlmICggb3B0aW9ucy5hbGxvd0ludGVyYWN0aW9uICkge1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCAtIGxheWVyIHdoZXJlIGludGVyYWN0aXZlIGNvbnRyb2xzIGNhbiBiZSBhZGRlZCBieSBzdWJjbGFzc2VzXHJcbiAgICAgIHRoaXMuaW50ZXJhY3RpdmVDb250cm9sc0xheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ludGVyYWN0aXZlQ29udHJvbHMnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1VzZWQgZm9yIFxcJ0FkanVzdGFibGUgQXR0cmFjdGlvblxcJyBvbmx5J1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMubGpQb3RlbnRpYWxHcmFwaC5hZGRDaGlsZCggdGhpcy5pbnRlcmFjdGl2ZUNvbnRyb2xzTGF5ZXIgKTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQgLSBhbiBvYmplY3Qgd2hlcmUgc3BlY2lmaWMgY29udHJvbHMgY2FuIGJlIGFkZGVkIGZvciBjb250cm9sbGluZyB0aGUgZXBzaWxvbiBwYXJhbWV0ZXIgaW4gdGhlIExlbm5hcmQtXHJcbiAgICAgIC8vIEpvbmVzIHBvdGVudGlhbCBjYWxjdWxhdGlvbnMsIHNlZSB1c2FnZXMgaW4gc3ViY2xhc3Nlc1xyXG4gICAgICB0aGlzLmVwc2lsb25Db250cm9scyA9IHtcclxuICAgICAgICBhcnJvdzogbnVsbCxcclxuICAgICAgICBsaW5lOiBudWxsXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIC0gYW4gb2JqZWN0IHdoZXJlIGEgc3BlY2lmaWMgY29udHJvbCBjYW4gYmUgYWRkZWQgZm9yIGNvbnRyb2xsaW5nIHRoZSBzaWdtYSBwYXJhbWV0ZXIgaW4gdGhlIExlbm5hcmQtXHJcbiAgICAgIC8vIEpvbmVzIHBvdGVudGlhbCBjYWxjdWxhdGlvbnMsIHNlZSB1c2FnZXMgaW4gc3ViY2xhc3Nlcy4gIFNlZSB1c2FnZXMgaW4gc3ViY2xhc3Nlcy5cclxuICAgICAgdGhpcy5zaWdtYUNvbnRyb2xzID0ge1xyXG4gICAgICAgIGFycm93OiBudWxsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBwb3NpdGlvbiBtYXJrZXIgaWYgaW5jbHVkZWQuXHJcbiAgICBpZiAoIG9wdGlvbnMuaW5jbHVkZVBvc2l0aW9uTWFya2VyICkge1xyXG4gICAgICBjb25zdCBtYXJrZXJEaWFtZXRlciA9IFBPU0lUSU9OX01BUktFUl9ESUFNRVRFUl9QUk9QT1JUSU9OICogdGhpcy5ncmFwaFdpZHRoO1xyXG4gICAgICB0aGlzLnBvc2l0aW9uTWFya2VyID0gbmV3IFBvc2l0aW9uTWFya2VyKCBtYXJrZXJEaWFtZXRlciAvIDIsICdyZ2IoIDExNywgMjE3LCAyNTUgKScsIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uTWFya2VyJyApXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5salBvdGVudGlhbEdyYXBoLmFkZENoaWxkKCB0aGlzLnBvc2l0aW9uTWFya2VyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm93IHRoYXQgdGhlIGdyYXBoIHBvcnRpb24gaXMgYnVpbHQsIHBvc2l0aW9uIGl0IGNvcnJlY3RseVxyXG4gICAgdGhpcy5salBvdGVudGlhbEdyYXBoLnggPSB0aGlzLmdyYXBoWE9yaWdpbjtcclxuICAgIHRoaXMubGpQb3RlbnRpYWxHcmFwaC55ID0gdGhpcy5ncmFwaFlPcmlnaW4gLSB0aGlzLmdyYXBoSGVpZ2h0O1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgaG9yaXpvbnRhbCBheGlzIGxpbmUgZm9yIHRoZSBncmFwaC5cclxuICAgIHRoaXMuaG9yaXpvbnRhbEF4aXMgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCB0aGlzLmdyYXBoV2lkdGggKyBBWEVTX0FSUk9XX0hFQURfSEVJR0hULCAwLCB7XHJcbiAgICAgIGZpbGw6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxUZXh0UHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSxcclxuICAgICAgaGVhZEhlaWdodDogOCxcclxuICAgICAgaGVhZFdpZHRoOiA4LFxyXG4gICAgICB0YWlsV2lkdGg6IDIsXHJcbiAgICAgIHg6IHRoaXMuZ3JhcGhYT3JpZ2luLFxyXG4gICAgICB5OiB0aGlzLmdyYXBoWU9yaWdpblxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaG9yaXpvbnRhbEF4aXNMYWJlbCA9IG5ldyBUZXh0KCBkaXN0YW5jZUJldHdlZW5BdG9tc1N0cmluZywge1xyXG4gICAgICBmaWxsOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5LFxyXG4gICAgICBmb250OiBheGlzTGFiZWxGb250XHJcbiAgICB9ICk7XHJcbiAgICBpZiAoIHRoaXMuaG9yaXpvbnRhbEF4aXNMYWJlbC53aWR0aCA+IHRoaXMuaG9yaXpvbnRhbEF4aXMud2lkdGggKSB7XHJcbiAgICAgIGlmICggb3B0aW9ucy53aWRlICkge1xyXG4gICAgICAgIHRoaXMuaG9yaXpvbnRhbEF4aXNMYWJlbC5tYXhXaWR0aCA9IHRoaXMuaG9yaXpvbnRhbEF4aXMud2lkdGg7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsQXhpc0xhYmVsLm1heFdpZHRoID0gdGhpcy5ob3Jpem9udGFsQXhpcy53aWR0aCArIDMwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXRNb2xlY3VsYXIoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSB2ZXJ0aWNhbCBheGlzIGxpbmUgZm9yIHRoZSBncmFwaC5cclxuICAgIHRoaXMudmVydGljYWxBeGlzID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgLXRoaXMuZ3JhcGhIZWlnaHQgLSBBWEVTX0FSUk9XX0hFQURfSEVJR0hULCB7XHJcbiAgICAgIGZpbGw6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxUZXh0UHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSxcclxuICAgICAgaGVhZEhlaWdodDogOCxcclxuICAgICAgaGVhZFdpZHRoOiA4LFxyXG4gICAgICB0YWlsV2lkdGg6IEFYSVNfTElORV9XSURUSCxcclxuICAgICAgeDogdGhpcy5ncmFwaFhPcmlnaW4sXHJcbiAgICAgIHk6IHRoaXMuZ3JhcGhZT3JpZ2luXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52ZXJ0aWNhbEF4aXNMYWJlbCA9IG5ldyBUZXh0KCBwb3RlbnRpYWxFbmVyZ3lTdHJpbmcsIHtcclxuICAgICAgZmlsbDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSxcclxuICAgICAgZm9udDogYXhpc0xhYmVsRm9udFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY2VudGVyIGF4aXMgbGluZSBmb3IgdGhlIGdyYXBoLlxyXG4gICAgdGhpcy5jZW50ZXJBeGlzID0gbmV3IExpbmUoIDAsIDAsIHRoaXMuZ3JhcGhXaWR0aCwgMCwge1xyXG4gICAgICBsaW5lV2lkdGg6IDAuOCxcclxuICAgICAgc3Ryb2tlOiAnI0E3QTdBNycsXHJcbiAgICAgIHg6IHRoaXMuZ3JhcGhYT3JpZ2luLFxyXG4gICAgICB5OiB0aGlzLmdyYXBoWU9yaWdpbiAtIHRoaXMuZ3JhcGhIZWlnaHQgLyAyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVzdHJpY3RlZCB2ZXJ0aWNhbCBheGlzIGxhYmVsXHJcbiAgICBjb25zdCB2ZXJ0aWNhbEF4aXNIZWlnaHQgPSBvcHRpb25zLndpZGUgPyB0aGlzLnZlcnRpY2FsQXhpcy5oZWlnaHQgLSBaT09NX0JVVFRPTlNfSEVJR0hUIDogdGhpcy52ZXJ0aWNhbEF4aXMuaGVpZ2h0O1xyXG4gICAgaWYgKCB0aGlzLnZlcnRpY2FsQXhpc0xhYmVsLndpZHRoID4gdmVydGljYWxBeGlzSGVpZ2h0ICkge1xyXG4gICAgICB0aGlzLnZlcnRpY2FsQXhpc0xhYmVsLnNjYWxlKCB2ZXJ0aWNhbEF4aXNIZWlnaHQgLyB0aGlzLnZlcnRpY2FsQXhpc0xhYmVsLndpZHRoICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52ZXJ0aWNhbEF4aXNMYWJlbC5zZXRUcmFuc2xhdGlvbihcclxuICAgICAgdGhpcy5ncmFwaFhPcmlnaW4gLyAyIC0gdGhpcy52ZXJ0aWNhbEF4aXNMYWJlbC5oZWlnaHQgLyAyLFxyXG4gICAgICB0aGlzLmdyYXBoWU9yaWdpblxyXG4gICAgKTtcclxuICAgIHRoaXMudmVydGljYWxBeGlzTGFiZWwuc2V0Um90YXRpb24oIDMgKiBNYXRoLlBJIC8gMiApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIGluaXRpYWwgY3VydmUgdXBvbiB0aGUgZ3JhcGguXHJcbiAgICB0aGlzLmRyYXdQb3RlbnRpYWxDdXJ2ZSgpO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy53aWRlICkge1xyXG4gICAgICB0aGlzLmdyaWROb2RlID0gbmV3IFpvb21hYmxlR3JpZE5vZGUoXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgdGhpcy5ncmFwaFdpZHRoLFxyXG4gICAgICAgIHRoaXMuZ3JhcGhIZWlnaHQsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYWRkWm9vbUJ1dHRvbnM6IG9wdGlvbnMuem9vbWFibGUsXHJcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyaWROb2RlJyApXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmdyaWROb2RlLnggPSB0aGlzLmdyYXBoWE9yaWdpbjtcclxuICAgICAgdGhpcy5ncmlkTm9kZS55ID0gdGhpcy5ncmFwaFlPcmlnaW4gLSB0aGlzLmdyYXBoSGVpZ2h0O1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmdyaWROb2RlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBhcmFtZXRlcnMgdGhhdCBkZWZpbmUgdGhlIHNoYXBlIG9mIHRoZSBMZW5uYXJkLUpvbmVzIHBvdGVudGlhbCBjdXJ2ZS5cclxuICAgKiBAcGFyYW17bnVtYmVyfSBzaWdtYSAtICBhdG9tIGRpYW1ldGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBpbnRlcmFjdGlvbiBzdHJlbmd0aFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRMalBvdGVudGlhbFBhcmFtZXRlcnMoIHNpZ21hLCBlcHNpbG9uICkge1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgTGVubmFyZC1Kb25lcyBmb3JjZSBjYWxjdWxhdG9yLlxyXG4gICAgdGhpcy5salBvdGVudGlhbENhbGN1bGF0b3Iuc2V0RXBzaWxvbiggZXBzaWxvbiApO1xyXG4gICAgdGhpcy5salBvdGVudGlhbENhbGN1bGF0b3Iuc2V0U2lnbWEoIHNpZ21hICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnZlcnRpY2FsU2NhbGluZ0ZhY3RvciA9ICggdGhpcy5ncmFwaEhlaWdodCAvIDIuMiApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBTT01Db25zdGFudHMuTUFYX0VQU0lMT04gKiBTT01Db25zdGFudHMuS19CT0xUWk1BTk4gKTtcclxuICAgIHRoaXMuaG9yaXpvbnRhbExpbmVDb3VudCA9IDU7XHJcbiAgICB0aGlzLmRyYXdQb3RlbnRpYWxDdXJ2ZSgpO1xyXG4gICAgdGhpcy5ncmlkTm9kZSAmJiB0aGlzLmdyaWROb2RlLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRHcmFwaEhlaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdyYXBoSGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0R3JhcGhXaWR0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdyYXBoV2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0WmVyb0Nyb3NzaW5nUG9pbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy56ZXJvQ3Jvc3NpbmdQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRHcmFwaE1pbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyYXBoTWluO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9zaXRpb24gbWFya2VyLiAgTm90ZSB0aGF0IGlzIGlzIG9ubHkgcG9zc2libGUgdG8gc2V0IHRoZSB4IGF4aXMgcG9zaXRpb24sIHdoaWNoIGlzXHJcbiAgICogZGlzdGFuY2UuICBUaGUgeSBheGlzIHBvc2l0aW9uIGlzIGFsd2F5cyBvbiB0aGUgTEogcG90ZW50aWFsIGN1cnZlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfWRpc3RhbmNlIC0gZGlzdGFuY2UgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBpbnRlcmFjdGluZyBtb2xlY3VsZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldE1hcmtlclBvc2l0aW9uKCBkaXN0YW5jZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucG9zaXRpb25NYXJrZXIsICdwb3NpdGlvbiBtYXJrZXIgbm90IGVuYWJsZWQgZm9yIHRoaXMgcG90ZW50aWFsIGdyYXBoIG5vZGUnICk7XHJcbiAgICB0aGlzLm1hcmtlckRpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICBjb25zdCB4UG9zID0gdGhpcy5tYXJrZXJEaXN0YW5jZSAqICggdGhpcy5ncmFwaFdpZHRoIC8gdGhpcy54UmFuZ2UgKTtcclxuICAgIGNvbnN0IHBvdGVudGlhbCA9IHRoaXMuY2FsY3VsYXRlTGVubmFyZEpvbmVzUG90ZW50aWFsKCB0aGlzLm1hcmtlckRpc3RhbmNlICk7XHJcbiAgICBjb25zdCB5UG9zID0gKCAoIHRoaXMuZ3JhcGhIZWlnaHQgLyAyICkgLSAoIHBvdGVudGlhbCAqIHRoaXMudmVydGljYWxTY2FsaW5nRmFjdG9yICkgKTtcclxuICAgIGlmICggeFBvcyA+IDAgJiYgeFBvcyA8IHRoaXMuZ3JhcGhXaWR0aCAmJiB5UG9zID4gMCAmJiB5UG9zIDwgdGhpcy5ncmFwaEhlaWdodCApIHtcclxuICAgICAgdGhpcy5wb3NpdGlvbk1hcmtlci5zZXRWaXNpYmxlKCB0cnVlICk7XHJcbiAgICAgIHRoaXMucG9zaXRpb25NYXJrZXIuc2V0VHJhbnNsYXRpb24oIHhQb3MsIHlQb3MgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uTWFya2VyLnNldFZpc2libGUoIGZhbHNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgd2hldGhlciB0aGUgZ3JhcGggaXMgc2hvd2luZyB0aGUgcG90ZW50aWFsIGJldHdlZW4gaW5kaXZpZHVhbCBhdG9tcyBvciBtdWx0aS1hdG9tIG1vbGVjdWxlcy5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1vbGVjdWxhciAtIHRydWUgaWYgZ3JhcGggaXMgcG9ydHJheWluZyBtb2xlY3VsZXMsIGZhbHNlIGZvciBpbmRpdmlkdWFsIGF0b21zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRNb2xlY3VsYXIoIG1vbGVjdWxhciApIHtcclxuICAgIGlmICggbW9sZWN1bGFyICkge1xyXG4gICAgICB0aGlzLmhvcml6b250YWxBeGlzTGFiZWwuc2V0U3RyaW5nKCBkaXN0YW5jZUJldHdlZW5Nb2xlY3VsZXNTdHJpbmcgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmhvcml6b250YWxBeGlzTGFiZWwuc2V0U3RyaW5nKCBkaXN0YW5jZUJldHdlZW5BdG9tc1N0cmluZyApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ob3Jpem9udGFsQXhpc0xhYmVsLmNlbnRlclggPSB0aGlzLmdyYXBoWE9yaWdpbiArICggdGhpcy5ncmFwaFdpZHRoIC8gMiApO1xyXG4gICAgdGhpcy5ob3Jpem9udGFsQXhpc0xhYmVsLnRvcCA9IHRoaXMuZ3JhcGhZT3JpZ2luICsgNTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgZm9yIHRoZSBnaXZlbiBkaXN0YW5jZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2FsY3VsYXRlTGVubmFyZEpvbmVzUG90ZW50aWFsKCByYWRpdXMgKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5nZXRMalBvdGVudGlhbCggcmFkaXVzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXcgdGhlIGN1cnZlIHRoYXQgcmVmbGVjdHMgdGhlIExlbm5hcmQtSm9uZXMgcG90ZW50aWFsIGJhc2VkIHVwb24gdGhlIGN1cnJlbnQgdmFsdWVzIGZvciBzaWdtYSBhbmQgZXBzaWxvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZHJhd1BvdGVudGlhbEN1cnZlKCkge1xyXG4gICAgLy8gbXVzdCBiZSBvdmVycmlkZGVuIGluIGRlc2NlbmRhbnQgdHlwZXMsIHNvIGFzc2VydCBpZiBjYWxsZWQgaGVyZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd0aGlzIGZ1bmN0aW9uIG11c3QgYmUgb3ZlcnJpZGRlbiBpbiBkZXNjZW5kYW50IGNsYXNzZXMnICk7XHJcbiAgfVxyXG59XHJcblxyXG5zdGF0ZXNPZk1hdHRlci5yZWdpc3RlciggJ1BvdGVudGlhbEdyYXBoTm9kZScsIFBvdGVudGlhbEdyYXBoTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQb3RlbnRpYWxHcmFwaE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sa0RBQWtEO0FBQzdFLE9BQU9DLGdCQUFnQixNQUFNLG9EQUFvRDtBQUNqRixPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxxQkFBcUIsTUFBTSxtQ0FBbUM7QUFDckUsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBRXRDLE1BQU1DLDBCQUEwQixHQUFHSixxQkFBcUIsQ0FBQ0ss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