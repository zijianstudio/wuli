// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import HandleNode from '../../../../scenery-phet/js/HandleNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { DragListener, LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import MultipleParticleModel from '../model/MultipleParticleModel.js';
import SOMConstants from '../SOMConstants.js';
import CompositeThermometerNode from './CompositeThermometerNode.js';
import DialGaugeNode from './DialGaugeNode.js';
import ParticleImageCanvasNode from './ParticleImageCanvasNode.js';
import PointingHandNode from './PointingHandNode.js';

// constants
const PRESSURE_GAUGE_ELBOW_OFFSET = 30;
const CONTAINER_X_MARGIN = 5; // additional size in x direction beyond nominal container width
const PERSPECTIVE_TILT_FACTOR = 0.15; // can be varied to get more or less tilt, but only works in a fairly narrow range
const CONTAINER_CUTOUT_X_MARGIN = 25;
const CONTAINER_CUTOUT_Y_MARGIN = 20;
const BEVEL_WIDTH = 9;
class ParticleContainerNode extends Node {
  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(multipleParticleModel, modelViewTransform, options) {
    options = merge({
      volumeControlEnabled: false,
      pressureGaugeEnabled: false,
      thermometerXOffsetFromCenter: 0,
      preventFit: true,
      // improves performance
      tandem: Tandem.REQUIRED
    }, options);
    super(options);

    // @private, view bounds for the particle area, everything is basically constructed and positioned based on this
    this.particleAreaViewBounds = new Bounds2(modelViewTransform.modelToViewX(0), modelViewTransform.modelToViewY(0) + modelViewTransform.modelToViewDeltaY(MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT), modelViewTransform.modelToViewX(0) + modelViewTransform.modelToViewDeltaX(MultipleParticleModel.PARTICLE_CONTAINER_WIDTH), modelViewTransform.modelToViewY(0));

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;
    this.previousContainerViewSize = this.particleAreaViewBounds.height;

    // add nodes for the various layers
    const preParticleLayer = new Node();
    this.addChild(preParticleLayer);
    this.particlesCanvasNode = new ParticleImageCanvasNode(multipleParticleModel.scaledAtoms, modelViewTransform, {
      canvasBounds: SOMConstants.SCREEN_VIEW_OPTIONS.layoutBounds.dilated(500, 500) // dilation amount empirically determined
    });

    this.addChild(this.particlesCanvasNode);
    const postParticleLayer = new Node();
    this.addChild(postParticleLayer);

    // set up variables used to create and position the various parts of the container
    const containerWidthWithMargin = modelViewTransform.modelToViewDeltaX(MultipleParticleModel.PARTICLE_CONTAINER_WIDTH) + 2 * CONTAINER_X_MARGIN;
    const topEllipseRadiusX = containerWidthWithMargin / 2;
    const topEllipseRadiusY = topEllipseRadiusX * PERSPECTIVE_TILT_FACTOR;

    // shape of the ellipse at the top of the container
    const topEllipseShape = new Shape().ellipticalArc(topEllipseRadiusX, 0, topEllipseRadiusX, topEllipseRadiusY, 0, 0, 2 * Math.PI, false);

    // add the elliptical opening at the top of the container, must be behind particles in z-order
    preParticleLayer.addChild(new Path(topEllipseShape, {
      lineWidth: 1,
      stroke: '#444444',
      centerX: this.particleAreaViewBounds.centerX,
      centerY: this.particleAreaViewBounds.minY
    }));

    // root of the lid node
    const lidNode = new Node({
      tandem: options.tandem.createTandem('lidNode'),
      phetioInputEnabledPropertyInstrumented: true,
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });
    postParticleLayer.addChild(lidNode);

    // create and add the node that will act as the elliptical background for the lid, other nodes may be added later
    const lidEllipseNode = new Path(topEllipseShape, {
      fill: 'rgba( 126, 126, 126, 0.8 )',
      centerX: this.particleAreaViewBounds.centerX
    });
    lidNode.addChild(lidEllipseNode);
    let pointingHandNode;
    if (options.volumeControlEnabled) {
      // Add the pointing hand, the finger of which can push down on the top of the container.
      pointingHandNode = new PointingHandNode(multipleParticleModel, modelViewTransform, {
        centerX: this.particleAreaViewBounds.centerX + 30,
        // offset empirically determined
        tandem: lidNode.tandem.createTandem('pointingHandNode')
      });
      lidNode.addChild(pointingHandNode);

      // Add the handle to the lid.
      const handleAreaEllipseShape = topEllipseShape.transformed(Matrix3.scale(0.8)); // scale empirically determined
      const handleAreaEllipse = new Path(handleAreaEllipseShape, {
        lineWidth: 1,
        stroke: '#888888',
        fill: 'rgba( 200, 200, 200, 0.5 )',
        centerX: lidEllipseNode.width / 2,
        centerY: 0,
        cursor: 'ns-resize'
      });
      lidEllipseNode.addChild(handleAreaEllipse);
      const handleNode = new HandleNode({
        scale: 0.28,
        attachmentFill: 'black',
        gripLineWidth: 4,
        tandem: lidNode.tandem.createTandem('handleNode')
      });
      handleNode.centerX = lidEllipseNode.width / 2;
      handleNode.bottom = handleAreaEllipse.centerY + 5; // position tweaked a bit to look better
      lidEllipseNode.addChild(handleNode);

      // add a drag handler to the lid
      let dragStartY;
      let draggedToY;
      let containerSizeAtDragStart;
      handleAreaEllipse.addInputListener(new DragListener({
        start: event => {
          dragStartY = this.globalToParentPoint(event.pointer.point).y;
          containerSizeAtDragStart = multipleParticleModel.containerHeightProperty.get();
        },
        drag: event => {
          draggedToY = this.globalToParentPoint(event.pointer.point).y;

          // Resize the container based on the drag distance.
          multipleParticleModel.setTargetContainerHeight(containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY(draggedToY - dragStartY));
        },
        end: () => {
          // Set the target size to the current size, which will stop any change in size that is currently underway.
          if (!multipleParticleModel.isExplodedProperty.value) {
            multipleParticleModel.setTargetContainerHeight(multipleParticleModel.containerHeightProperty.get());
          }
        },
        tandem: lidNode.tandem.createTandem('lidDragListener')
      }));
    }

    // The particle container can explode while the lid is being dragged and, if that happens, cancel the interaction.
    multipleParticleModel.isExplodedProperty.lazyLink(isExploded => {
      if (isExploded) {
        this.interruptSubtreeInput();
      }
    });
    let pressureGaugeNode;
    if (options.pressureGaugeEnabled) {
      // Add the pressure gauge.
      pressureGaugeNode = new DialGaugeNode(multipleParticleModel, options.tandem.createTandem('pressureGaugeNode'));
      pressureGaugeNode.right = this.particleAreaViewBounds.minX + this.particleAreaViewBounds.width * 0.2;
      postParticleLayer.addChild(pressureGaugeNode);
    }

    // define a function to evaluate the bottom edge of the ellipse at the top, used for relative positioning
    const getEllipseLowerEdgeYPos = distanceFromLeftEdge => {
      const x = distanceFromLeftEdge - topEllipseRadiusX;
      return topEllipseRadiusY * Math.sqrt(1 - Math.pow(x, 2) / Math.pow(topEllipseRadiusX, 2));
    };

    // define a bunch of variable that will be used in the process of drawing the main container
    const outerShapeTiltFactor = topEllipseRadiusY * 1.28; // empirically determined multiplier that makes curve match lid
    const cutoutShapeTiltFactor = outerShapeTiltFactor * 0.55; // empirically determined multiplier that looks good
    const cutoutHeight = this.particleAreaViewBounds.getHeight() - 2 * CONTAINER_CUTOUT_Y_MARGIN;
    const cutoutTopY = getEllipseLowerEdgeYPos(CONTAINER_CUTOUT_X_MARGIN) + CONTAINER_CUTOUT_Y_MARGIN;
    const cutoutBottomY = cutoutTopY + cutoutHeight;
    const cutoutWidth = containerWidthWithMargin - 2 * CONTAINER_CUTOUT_X_MARGIN;

    // create and add the main container node, excluding the bevel
    const mainContainer = new Path(new Shape().moveTo(0, 0)

    // top curve, y-component of control points made to match up with lower edge of the lid
    .cubicCurveTo(0, outerShapeTiltFactor, containerWidthWithMargin, outerShapeTiltFactor, containerWidthWithMargin, 0)

    // line from outer top right to outer bottom right
    .lineTo(containerWidthWithMargin, this.particleAreaViewBounds.height)

    // bottom outer curve
    .cubicCurveTo(containerWidthWithMargin, this.particleAreaViewBounds.height + outerShapeTiltFactor, 0, this.particleAreaViewBounds.height + outerShapeTiltFactor, 0, this.particleAreaViewBounds.height)

    // left outer side
    .lineTo(0, 0)

    // start drawing the cutout, must be drawn in opposite direction from outer shape to make the hole appear
    .moveTo(CONTAINER_CUTOUT_X_MARGIN, cutoutTopY)

    // left inner line
    .lineTo(CONTAINER_CUTOUT_X_MARGIN, cutoutBottomY)

    // bottom inner curve
    .quadraticCurveTo(containerWidthWithMargin / 2, cutoutBottomY + cutoutShapeTiltFactor, containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN, cutoutBottomY)

    // line from inner bottom right to inner top right
    .lineTo(containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN, cutoutTopY)

    // top inner curve
    .quadraticCurveTo(containerWidthWithMargin / 2, cutoutTopY + cutoutShapeTiltFactor, CONTAINER_CUTOUT_X_MARGIN, cutoutTopY).close(), {
      fill: new LinearGradient(0, 0, containerWidthWithMargin, 0).addColorStop(0, '#6D6D6D').addColorStop(0.1, '#8B8B8B').addColorStop(0.2, '#AEAFAF').addColorStop(0.4, '#BABABA').addColorStop(0.7, '#A3A4A4').addColorStop(0.75, '#8E8E8E').addColorStop(0.8, '#737373').addColorStop(0.9, '#646565'),
      opacity: 0.9,
      centerX: this.particleAreaViewBounds.centerX,
      top: this.particleAreaViewBounds.minY
    });
    postParticleLayer.addChild(mainContainer);
    const bevel = new Node({
      opacity: 0.9
    });
    const leftBevelEdge = new Path(new Shape().moveTo(0, 0).lineTo(0, cutoutHeight).lineTo(BEVEL_WIDTH, cutoutHeight - BEVEL_WIDTH).lineTo(BEVEL_WIDTH, BEVEL_WIDTH).lineTo(0, 0).close(), {
      fill: new LinearGradient(0, 0, 0, cutoutHeight).addColorStop(0, '#525252').addColorStop(0.3, '#515151').addColorStop(0.4, '#4E4E4E').addColorStop(0.5, '#424242').addColorStop(0.6, '#353535').addColorStop(0.7, '#2a2a2a').addColorStop(0.8, '#292929')
    });
    bevel.addChild(leftBevelEdge);
    const rightBevelEdge = new Path(new Shape().moveTo(0, BEVEL_WIDTH).lineTo(0, cutoutHeight - BEVEL_WIDTH).lineTo(BEVEL_WIDTH, cutoutHeight).lineTo(BEVEL_WIDTH, 0).lineTo(0, BEVEL_WIDTH).close(), {
      left: cutoutWidth - BEVEL_WIDTH,
      fill: new LinearGradient(0, 0, 0, cutoutHeight).addColorStop(0, '#8A8A8A').addColorStop(0.2, '#747474').addColorStop(0.3, '#525252').addColorStop(0.6, '#8A8A8A').addColorStop(0.9, '#A2A2A2').addColorStop(0.95, '#616161')
    });
    bevel.addChild(rightBevelEdge);
    const topBevelEdge = new Path(new Shape().moveTo(0, 0).quadraticCurveTo(cutoutWidth / 2, cutoutShapeTiltFactor, cutoutWidth, 0).lineTo(cutoutWidth - BEVEL_WIDTH, BEVEL_WIDTH).quadraticCurveTo(cutoutWidth / 2, cutoutShapeTiltFactor + BEVEL_WIDTH, BEVEL_WIDTH, BEVEL_WIDTH).lineTo(0, 0).close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient(0, 0, cutoutWidth, 0).addColorStop(0, '#2E2E2E').addColorStop(0.2, '#323232').addColorStop(0.3, '#363636').addColorStop(0.4, '#3E3E3E').addColorStop(0.5, '#4B4B4B').addColorStop(0.9, '#525252')
    });
    bevel.addChild(topBevelEdge);
    const bottomBevelEdge = new Path(new Shape().moveTo(BEVEL_WIDTH, 0).quadraticCurveTo(cutoutWidth / 2, cutoutShapeTiltFactor, cutoutWidth - BEVEL_WIDTH, 0).lineTo(cutoutWidth, BEVEL_WIDTH).quadraticCurveTo(cutoutWidth / 2, cutoutShapeTiltFactor + BEVEL_WIDTH, 0, BEVEL_WIDTH).lineTo(BEVEL_WIDTH, 0).close(), {
      top: cutoutHeight - BEVEL_WIDTH,
      fill: new LinearGradient(0, 0, cutoutWidth, 0).addColorStop(0, '#5D5D5D').addColorStop(0.2, '#717171').addColorStop(0.3, '#7C7C7C').addColorStop(0.4, '#8D8D8D').addColorStop(0.5, '#9E9E9E').addColorStop(0.5, '#A2A2A2').addColorStop(0.9, '#A3A3A3')
    });
    bevel.addChild(bottomBevelEdge);

    // Position and add the bevel.
    bevel.centerX = this.particleAreaViewBounds.centerX;
    bevel.top = this.particleAreaViewBounds.minY + cutoutTopY;
    postParticleLayer.addChild(bevel);

    // @private - the thermometer node, which needs to be above the container in the z-order
    this.compositeThermometerNode = new CompositeThermometerNode(multipleParticleModel, {
      font: new PhetFont(20),
      fill: 'white',
      centerX: lidEllipseNode.centerX + options.thermometerXOffsetFromCenter,
      tandem: options.tandem.createTandem('compositeThermometerNode')
    });
    postParticleLayer.addChild(this.compositeThermometerNode);

    // Define a function for updating the position and appearance of the pressure gauge.
    const updatePressureGaugePosition = () => {
      if (!pressureGaugeNode) {
        // nothing to update, so bail out
        return;
      }
      const containerHeight = this.multipleParticleModel.containerHeightProperty.get();
      if (!this.multipleParticleModel.isExplodedProperty.get()) {
        if (pressureGaugeNode.getRotation() !== 0) {
          pressureGaugeNode.setRotation(0);
        }
        pressureGaugeNode.top = this.particleAreaViewBounds.top - 75; // empirical position adjustment to connect to lid
        pressureGaugeNode.setElbowHeight(PRESSURE_GAUGE_ELBOW_OFFSET + Math.abs(this.modelViewTransform.modelToViewDeltaY(MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT - containerHeight)));
      } else {
        // The container is exploding, so move the gauge up and spin it.
        const deltaHeight = this.modelViewTransform.modelToViewDeltaY(containerHeight) - this.previousContainerViewSize;
        pressureGaugeNode.rotate(deltaHeight * 0.01 * Math.PI);
        pressureGaugeNode.centerY = pressureGaugeNode.centerY + deltaHeight * 2;
      }
    };

    // Monitor the height of the container in the model and adjust the view when changes occur.
    multipleParticleModel.containerHeightProperty.link((containerHeight, oldContainerHeight) => {
      if (oldContainerHeight) {
        this.previousContainerViewSize = modelViewTransform.modelToViewDeltaY(oldContainerHeight);
      }
      const lidYPosition = modelViewTransform.modelToViewY(containerHeight);
      lidEllipseNode.centerY = lidYPosition;
      this.compositeThermometerNode.centerY = lidYPosition;
      if (multipleParticleModel.isExplodedProperty.value) {
        // the container has exploded, so rotate the lid as it goes up so that it looks like it has been blown off.
        const deltaY = oldContainerHeight - containerHeight;
        const rotationAmount = deltaY * Math.PI * 0.00008; // multiplier empirically determined
        lidEllipseNode.rotateAround(lidEllipseNode.center, rotationAmount);

        // rotate the thermometer too, but differently than the lid for a more chaotic look
        const containerHeightChange = oldContainerHeight - containerHeight;
        this.compositeThermometerNode.rotateAround(this.compositeThermometerNode.center, containerHeightChange * 0.0001 * Math.PI);
      }

      // update the position of the pointing hand
      pointingHandNode && pointingHandNode.setFingertipYPosition(lidYPosition);

      // update the pressure gauge position (if present)
      updatePressureGaugePosition();
    });

    // Monitor the model for changes in the exploded state of the container and update the view as needed.
    multipleParticleModel.isExplodedProperty.link((isExploded, wasExploded) => {
      if (!isExploded && wasExploded) {
        // return the lid to the top of the container
        lidEllipseNode.setRotation(0);
        lidEllipseNode.centerX = modelViewTransform.modelToViewX(MultipleParticleModel.PARTICLE_CONTAINER_WIDTH / 2);
        lidEllipseNode.centerY = modelViewTransform.modelToViewY(multipleParticleModel.containerHeightProperty.get());

        // return the thermometer node to its original position
        this.compositeThermometerNode.setRotation(0);
        this.compositeThermometerNode.centerX = lidEllipseNode.centerX + options.thermometerXOffsetFromCenter;
        this.compositeThermometerNode.centerY = lidEllipseNode.centerY;

        // return the pressure gauge to its original position
        updatePressureGaugePosition();
      }
    });
  }

  /**
   * step
   * @param {number} dt - delta time
   * @public
   */
  step(dt) {
    this.particlesCanvasNode.step(dt);
  }

  /**
   * restore initial condition
   * @public
   */
  reset() {
    this.compositeThermometerNode.reset();
  }
}
statesOfMatter.register('ParticleContainerNode', ParticleContainerNode);
export default ParticleContainerNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlNoYXBlIiwibWVyZ2UiLCJIYW5kbGVOb2RlIiwiUGhldEZvbnQiLCJEcmFnTGlzdGVuZXIiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiVGFuZGVtIiwic3RhdGVzT2ZNYXR0ZXIiLCJNdWx0aXBsZVBhcnRpY2xlTW9kZWwiLCJTT01Db25zdGFudHMiLCJDb21wb3NpdGVUaGVybW9tZXRlck5vZGUiLCJEaWFsR2F1Z2VOb2RlIiwiUGFydGljbGVJbWFnZUNhbnZhc05vZGUiLCJQb2ludGluZ0hhbmROb2RlIiwiUFJFU1NVUkVfR0FVR0VfRUxCT1dfT0ZGU0VUIiwiQ09OVEFJTkVSX1hfTUFSR0lOIiwiUEVSU1BFQ1RJVkVfVElMVF9GQUNUT1IiLCJDT05UQUlORVJfQ1VUT1VUX1hfTUFSR0lOIiwiQ09OVEFJTkVSX0NVVE9VVF9ZX01BUkdJTiIsIkJFVkVMX1dJRFRIIiwiUGFydGljbGVDb250YWluZXJOb2RlIiwiY29uc3RydWN0b3IiLCJtdWx0aXBsZVBhcnRpY2xlTW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvcHRpb25zIiwidm9sdW1lQ29udHJvbEVuYWJsZWQiLCJwcmVzc3VyZUdhdWdlRW5hYmxlZCIsInRoZXJtb21ldGVyWE9mZnNldEZyb21DZW50ZXIiLCJwcmV2ZW50Rml0IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwYXJ0aWNsZUFyZWFWaWV3Qm91bmRzIiwibW9kZWxUb1ZpZXdYIiwibW9kZWxUb1ZpZXdZIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJQQVJUSUNMRV9DT05UQUlORVJfSU5JVElBTF9IRUlHSFQiLCJtb2RlbFRvVmlld0RlbHRhWCIsIlBBUlRJQ0xFX0NPTlRBSU5FUl9XSURUSCIsInByZXZpb3VzQ29udGFpbmVyVmlld1NpemUiLCJoZWlnaHQiLCJwcmVQYXJ0aWNsZUxheWVyIiwiYWRkQ2hpbGQiLCJwYXJ0aWNsZXNDYW52YXNOb2RlIiwic2NhbGVkQXRvbXMiLCJjYW52YXNCb3VuZHMiLCJTQ1JFRU5fVklFV19PUFRJT05TIiwibGF5b3V0Qm91bmRzIiwiZGlsYXRlZCIsInBvc3RQYXJ0aWNsZUxheWVyIiwiY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIiwidG9wRWxsaXBzZVJhZGl1c1giLCJ0b3BFbGxpcHNlUmFkaXVzWSIsInRvcEVsbGlwc2VTaGFwZSIsImVsbGlwdGljYWxBcmMiLCJNYXRoIiwiUEkiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJjZW50ZXJYIiwiY2VudGVyWSIsIm1pblkiLCJsaWROb2RlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJsaWRFbGxpcHNlTm9kZSIsImZpbGwiLCJwb2ludGluZ0hhbmROb2RlIiwiaGFuZGxlQXJlYUVsbGlwc2VTaGFwZSIsInRyYW5zZm9ybWVkIiwic2NhbGUiLCJoYW5kbGVBcmVhRWxsaXBzZSIsIndpZHRoIiwiY3Vyc29yIiwiaGFuZGxlTm9kZSIsImF0dGFjaG1lbnRGaWxsIiwiZ3JpcExpbmVXaWR0aCIsImJvdHRvbSIsImRyYWdTdGFydFkiLCJkcmFnZ2VkVG9ZIiwiY29udGFpbmVyU2l6ZUF0RHJhZ1N0YXJ0IiwiYWRkSW5wdXRMaXN0ZW5lciIsInN0YXJ0IiwiZXZlbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwieSIsImNvbnRhaW5lckhlaWdodFByb3BlcnR5IiwiZ2V0IiwiZHJhZyIsInNldFRhcmdldENvbnRhaW5lckhlaWdodCIsInZpZXdUb01vZGVsRGVsdGFZIiwiZW5kIiwiaXNFeHBsb2RlZFByb3BlcnR5IiwidmFsdWUiLCJsYXp5TGluayIsImlzRXhwbG9kZWQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJwcmVzc3VyZUdhdWdlTm9kZSIsInJpZ2h0IiwibWluWCIsImdldEVsbGlwc2VMb3dlckVkZ2VZUG9zIiwiZGlzdGFuY2VGcm9tTGVmdEVkZ2UiLCJ4Iiwic3FydCIsInBvdyIsIm91dGVyU2hhcGVUaWx0RmFjdG9yIiwiY3V0b3V0U2hhcGVUaWx0RmFjdG9yIiwiY3V0b3V0SGVpZ2h0IiwiZ2V0SGVpZ2h0IiwiY3V0b3V0VG9wWSIsImN1dG91dEJvdHRvbVkiLCJjdXRvdXRXaWR0aCIsIm1haW5Db250YWluZXIiLCJtb3ZlVG8iLCJjdWJpY0N1cnZlVG8iLCJsaW5lVG8iLCJxdWFkcmF0aWNDdXJ2ZVRvIiwiY2xvc2UiLCJhZGRDb2xvclN0b3AiLCJvcGFjaXR5IiwidG9wIiwiYmV2ZWwiLCJsZWZ0QmV2ZWxFZGdlIiwicmlnaHRCZXZlbEVkZ2UiLCJsZWZ0IiwidG9wQmV2ZWxFZGdlIiwiYm90dG9tQmV2ZWxFZGdlIiwiY29tcG9zaXRlVGhlcm1vbWV0ZXJOb2RlIiwiZm9udCIsInVwZGF0ZVByZXNzdXJlR2F1Z2VQb3NpdGlvbiIsImNvbnRhaW5lckhlaWdodCIsImdldFJvdGF0aW9uIiwic2V0Um90YXRpb24iLCJzZXRFbGJvd0hlaWdodCIsImFicyIsImRlbHRhSGVpZ2h0Iiwicm90YXRlIiwibGluayIsIm9sZENvbnRhaW5lckhlaWdodCIsImxpZFlQb3NpdGlvbiIsImRlbHRhWSIsInJvdGF0aW9uQW1vdW50Iiwicm90YXRlQXJvdW5kIiwiY2VudGVyIiwiY29udGFpbmVySGVpZ2h0Q2hhbmdlIiwic2V0RmluZ2VydGlwWVBvc2l0aW9uIiwid2FzRXhwbG9kZWQiLCJzdGVwIiwiZHQiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVDb250YWluZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgdGhlIFwidmlld1wiIGZvciB0aGUgcGFydGljbGUgY29udGFpbmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEhhbmRsZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0hhbmRsZU5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzdGF0ZXNPZk1hdHRlciBmcm9tICcuLi8uLi9zdGF0ZXNPZk1hdHRlci5qcyc7XHJcbmltcG9ydCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwgZnJvbSAnLi4vbW9kZWwvTXVsdGlwbGVQYXJ0aWNsZU1vZGVsLmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi9TT01Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ29tcG9zaXRlVGhlcm1vbWV0ZXJOb2RlIGZyb20gJy4vQ29tcG9zaXRlVGhlcm1vbWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IERpYWxHYXVnZU5vZGUgZnJvbSAnLi9EaWFsR2F1Z2VOb2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlSW1hZ2VDYW52YXNOb2RlIGZyb20gJy4vUGFydGljbGVJbWFnZUNhbnZhc05vZGUuanMnO1xyXG5pbXBvcnQgUG9pbnRpbmdIYW5kTm9kZSBmcm9tICcuL1BvaW50aW5nSGFuZE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBSRVNTVVJFX0dBVUdFX0VMQk9XX09GRlNFVCA9IDMwO1xyXG5jb25zdCBDT05UQUlORVJfWF9NQVJHSU4gPSA1OyAvLyBhZGRpdGlvbmFsIHNpemUgaW4geCBkaXJlY3Rpb24gYmV5b25kIG5vbWluYWwgY29udGFpbmVyIHdpZHRoXHJcbmNvbnN0IFBFUlNQRUNUSVZFX1RJTFRfRkFDVE9SID0gMC4xNTsgLy8gY2FuIGJlIHZhcmllZCB0byBnZXQgbW9yZSBvciBsZXNzIHRpbHQsIGJ1dCBvbmx5IHdvcmtzIGluIGEgZmFpcmx5IG5hcnJvdyByYW5nZVxyXG5jb25zdCBDT05UQUlORVJfQ1VUT1VUX1hfTUFSR0lOID0gMjU7XHJcbmNvbnN0IENPTlRBSU5FUl9DVVRPVVRfWV9NQVJHSU4gPSAyMDtcclxuY29uc3QgQkVWRUxfV0lEVEggPSA5O1xyXG5cclxuY2xhc3MgUGFydGljbGVDb250YWluZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TXVsdGlwbGVQYXJ0aWNsZU1vZGVsfSBtdWx0aXBsZVBhcnRpY2xlTW9kZWwgLSBtb2RlbCBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdm9sdW1lQ29udHJvbEVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICBwcmVzc3VyZUdhdWdlRW5hYmxlZDogZmFsc2UsXHJcbiAgICAgIHRoZXJtb21ldGVyWE9mZnNldEZyb21DZW50ZXI6IDAsXHJcbiAgICAgIHByZXZlbnRGaXQ6IHRydWUsIC8vIGltcHJvdmVzIHBlcmZvcm1hbmNlXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSwgdmlldyBib3VuZHMgZm9yIHRoZSBwYXJ0aWNsZSBhcmVhLCBldmVyeXRoaW5nIGlzIGJhc2ljYWxseSBjb25zdHJ1Y3RlZCBhbmQgcG9zaXRpb25lZCBiYXNlZCBvbiB0aGlzXHJcbiAgICB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggMCApLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICkgKyBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIE11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfSU5JVElBTF9IRUlHSFQgKSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggMCApICsgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwuUEFSVElDTEVfQ09OVEFJTkVSX1dJRFRIICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDAgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tdWx0aXBsZVBhcnRpY2xlTW9kZWwgPSBtdWx0aXBsZVBhcnRpY2xlTW9kZWw7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgIHRoaXMucHJldmlvdXNDb250YWluZXJWaWV3U2l6ZSA9IHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5oZWlnaHQ7XHJcblxyXG4gICAgLy8gYWRkIG5vZGVzIGZvciB0aGUgdmFyaW91cyBsYXllcnNcclxuICAgIGNvbnN0IHByZVBhcnRpY2xlTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJlUGFydGljbGVMYXllciApO1xyXG4gICAgdGhpcy5wYXJ0aWNsZXNDYW52YXNOb2RlID0gbmV3IFBhcnRpY2xlSW1hZ2VDYW52YXNOb2RlKCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwuc2NhbGVkQXRvbXMsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBjYW52YXNCb3VuZHM6IFNPTUNvbnN0YW50cy5TQ1JFRU5fVklFV19PUFRJT05TLmxheW91dEJvdW5kcy5kaWxhdGVkKCA1MDAsIDUwMCApIC8vIGRpbGF0aW9uIGFtb3VudCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBhcnRpY2xlc0NhbnZhc05vZGUgKTtcclxuICAgIGNvbnN0IHBvc3RQYXJ0aWNsZUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBvc3RQYXJ0aWNsZUxheWVyICk7XHJcblxyXG4gICAgLy8gc2V0IHVwIHZhcmlhYmxlcyB1c2VkIHRvIGNyZWF0ZSBhbmQgcG9zaXRpb24gdGhlIHZhcmlvdXMgcGFydHMgb2YgdGhlIGNvbnRhaW5lclxyXG4gICAgY29uc3QgY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwuUEFSVElDTEVfQ09OVEFJTkVSX1dJRFRIICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMiAqIENPTlRBSU5FUl9YX01BUkdJTjtcclxuICAgIGNvbnN0IHRvcEVsbGlwc2VSYWRpdXNYID0gY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIC8gMjtcclxuICAgIGNvbnN0IHRvcEVsbGlwc2VSYWRpdXNZID0gdG9wRWxsaXBzZVJhZGl1c1ggKiBQRVJTUEVDVElWRV9USUxUX0ZBQ1RPUjtcclxuXHJcbiAgICAvLyBzaGFwZSBvZiB0aGUgZWxsaXBzZSBhdCB0aGUgdG9wIG9mIHRoZSBjb250YWluZXJcclxuICAgIGNvbnN0IHRvcEVsbGlwc2VTaGFwZSA9IG5ldyBTaGFwZSgpLmVsbGlwdGljYWxBcmMoXHJcbiAgICAgIHRvcEVsbGlwc2VSYWRpdXNYLFxyXG4gICAgICAwLFxyXG4gICAgICB0b3BFbGxpcHNlUmFkaXVzWCxcclxuICAgICAgdG9wRWxsaXBzZVJhZGl1c1ksXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIDIgKiBNYXRoLlBJLFxyXG4gICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGVsbGlwdGljYWwgb3BlbmluZyBhdCB0aGUgdG9wIG9mIHRoZSBjb250YWluZXIsIG11c3QgYmUgYmVoaW5kIHBhcnRpY2xlcyBpbiB6LW9yZGVyXHJcbiAgICBwcmVQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCBuZXcgUGF0aCggdG9wRWxsaXBzZVNoYXBlLCB7XHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlOiAnIzQ0NDQ0NCcsXHJcbiAgICAgIGNlbnRlclg6IHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMubWluWVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gcm9vdCBvZiB0aGUgbGlkIG5vZGVcclxuICAgIGNvbnN0IGxpZE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZE5vZGUnICksXHJcbiAgICAgIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgIH0gKTtcclxuICAgIHBvc3RQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCBsaWROb2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIG5vZGUgdGhhdCB3aWxsIGFjdCBhcyB0aGUgZWxsaXB0aWNhbCBiYWNrZ3JvdW5kIGZvciB0aGUgbGlkLCBvdGhlciBub2RlcyBtYXkgYmUgYWRkZWQgbGF0ZXJcclxuICAgIGNvbnN0IGxpZEVsbGlwc2VOb2RlID0gbmV3IFBhdGgoIHRvcEVsbGlwc2VTaGFwZSwge1xyXG4gICAgICBmaWxsOiAncmdiYSggMTI2LCAxMjYsIDEyNiwgMC44ICknLFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMuY2VudGVyWFxyXG4gICAgfSApO1xyXG4gICAgbGlkTm9kZS5hZGRDaGlsZCggbGlkRWxsaXBzZU5vZGUgKTtcclxuXHJcbiAgICBsZXQgcG9pbnRpbmdIYW5kTm9kZTtcclxuICAgIGlmICggb3B0aW9ucy52b2x1bWVDb250cm9sRW5hYmxlZCApIHtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgcG9pbnRpbmcgaGFuZCwgdGhlIGZpbmdlciBvZiB3aGljaCBjYW4gcHVzaCBkb3duIG9uIHRoZSB0b3Agb2YgdGhlIGNvbnRhaW5lci5cclxuICAgICAgcG9pbnRpbmdIYW5kTm9kZSA9IG5ldyBQb2ludGluZ0hhbmROb2RlKCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICAgIGNlbnRlclg6IHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5jZW50ZXJYICsgMzAsIC8vIG9mZnNldCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgICAgdGFuZGVtOiBsaWROb2RlLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb2ludGluZ0hhbmROb2RlJyApXHJcbiAgICAgIH0gKTtcclxuICAgICAgbGlkTm9kZS5hZGRDaGlsZCggcG9pbnRpbmdIYW5kTm9kZSApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBoYW5kbGUgdG8gdGhlIGxpZC5cclxuICAgICAgY29uc3QgaGFuZGxlQXJlYUVsbGlwc2VTaGFwZSA9IHRvcEVsbGlwc2VTaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My5zY2FsZSggMC44ICkgKTsgLy8gc2NhbGUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICBjb25zdCBoYW5kbGVBcmVhRWxsaXBzZSA9IG5ldyBQYXRoKCBoYW5kbGVBcmVhRWxsaXBzZVNoYXBlLCB7XHJcbiAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgIHN0cm9rZTogJyM4ODg4ODgnLFxyXG4gICAgICAgIGZpbGw6ICdyZ2JhKCAyMDAsIDIwMCwgMjAwLCAwLjUgKScsXHJcbiAgICAgICAgY2VudGVyWDogbGlkRWxsaXBzZU5vZGUud2lkdGggLyAyLFxyXG4gICAgICAgIGNlbnRlclk6IDAsXHJcbiAgICAgICAgY3Vyc29yOiAnbnMtcmVzaXplJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGxpZEVsbGlwc2VOb2RlLmFkZENoaWxkKCBoYW5kbGVBcmVhRWxsaXBzZSApO1xyXG4gICAgICBjb25zdCBoYW5kbGVOb2RlID0gbmV3IEhhbmRsZU5vZGUoIHtcclxuICAgICAgICBzY2FsZTogMC4yOCxcclxuICAgICAgICBhdHRhY2htZW50RmlsbDogJ2JsYWNrJyxcclxuICAgICAgICBncmlwTGluZVdpZHRoOiA0LFxyXG4gICAgICAgIHRhbmRlbTogbGlkTm9kZS50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFuZGxlTm9kZScgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGhhbmRsZU5vZGUuY2VudGVyWCA9IGxpZEVsbGlwc2VOb2RlLndpZHRoIC8gMjtcclxuICAgICAgaGFuZGxlTm9kZS5ib3R0b20gPSBoYW5kbGVBcmVhRWxsaXBzZS5jZW50ZXJZICsgNTsgLy8gcG9zaXRpb24gdHdlYWtlZCBhIGJpdCB0byBsb29rIGJldHRlclxyXG4gICAgICBsaWRFbGxpcHNlTm9kZS5hZGRDaGlsZCggaGFuZGxlTm9kZSApO1xyXG5cclxuICAgICAgLy8gYWRkIGEgZHJhZyBoYW5kbGVyIHRvIHRoZSBsaWRcclxuICAgICAgbGV0IGRyYWdTdGFydFk7XHJcbiAgICAgIGxldCBkcmFnZ2VkVG9ZO1xyXG4gICAgICBsZXQgY29udGFpbmVyU2l6ZUF0RHJhZ1N0YXJ0O1xyXG4gICAgICBoYW5kbGVBcmVhRWxsaXBzZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgICBkcmFnU3RhcnRZID0gdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueTtcclxuICAgICAgICAgIGNvbnRhaW5lclNpemVBdERyYWdTdGFydCA9IG11bHRpcGxlUGFydGljbGVNb2RlbC5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkcmFnOiBldmVudCA9PiB7XHJcbiAgICAgICAgICBkcmFnZ2VkVG9ZID0gdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueTtcclxuXHJcbiAgICAgICAgICAvLyBSZXNpemUgdGhlIGNvbnRhaW5lciBiYXNlZCBvbiB0aGUgZHJhZyBkaXN0YW5jZS5cclxuICAgICAgICAgIG11bHRpcGxlUGFydGljbGVNb2RlbC5zZXRUYXJnZXRDb250YWluZXJIZWlnaHQoXHJcbiAgICAgICAgICAgIGNvbnRhaW5lclNpemVBdERyYWdTdGFydCArIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWSggZHJhZ2dlZFRvWSAtIGRyYWdTdGFydFkgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbmQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBTZXQgdGhlIHRhcmdldCBzaXplIHRvIHRoZSBjdXJyZW50IHNpemUsIHdoaWNoIHdpbGwgc3RvcCBhbnkgY2hhbmdlIGluIHNpemUgdGhhdCBpcyBjdXJyZW50bHkgdW5kZXJ3YXkuXHJcbiAgICAgICAgICBpZiAoICFtdWx0aXBsZVBhcnRpY2xlTW9kZWwuaXNFeHBsb2RlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICBtdWx0aXBsZVBhcnRpY2xlTW9kZWwuc2V0VGFyZ2V0Q29udGFpbmVySGVpZ2h0KCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwuY29udGFpbmVySGVpZ2h0UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB0YW5kZW06IGxpZE5vZGUudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZERyYWdMaXN0ZW5lcicgKVxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgcGFydGljbGUgY29udGFpbmVyIGNhbiBleHBsb2RlIHdoaWxlIHRoZSBsaWQgaXMgYmVpbmcgZHJhZ2dlZCBhbmQsIGlmIHRoYXQgaGFwcGVucywgY2FuY2VsIHRoZSBpbnRlcmFjdGlvbi5cclxuICAgIG11bHRpcGxlUGFydGljbGVNb2RlbC5pc0V4cGxvZGVkUHJvcGVydHkubGF6eUxpbmsoIGlzRXhwbG9kZWQgPT4ge1xyXG4gICAgICBpZiAoIGlzRXhwbG9kZWQgKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBwcmVzc3VyZUdhdWdlTm9kZTtcclxuICAgIGlmICggb3B0aW9ucy5wcmVzc3VyZUdhdWdlRW5hYmxlZCApIHtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgcHJlc3N1cmUgZ2F1Z2UuXHJcbiAgICAgIHByZXNzdXJlR2F1Z2VOb2RlID0gbmV3IERpYWxHYXVnZU5vZGUoIG11bHRpcGxlUGFydGljbGVNb2RlbCwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3N1cmVHYXVnZU5vZGUnICkgKTtcclxuICAgICAgcHJlc3N1cmVHYXVnZU5vZGUucmlnaHQgPSB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMubWluWCArIHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy53aWR0aCAqIDAuMjtcclxuICAgICAgcG9zdFBhcnRpY2xlTGF5ZXIuYWRkQ2hpbGQoIHByZXNzdXJlR2F1Z2VOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVmaW5lIGEgZnVuY3Rpb24gdG8gZXZhbHVhdGUgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSBlbGxpcHNlIGF0IHRoZSB0b3AsIHVzZWQgZm9yIHJlbGF0aXZlIHBvc2l0aW9uaW5nXHJcbiAgICBjb25zdCBnZXRFbGxpcHNlTG93ZXJFZGdlWVBvcyA9IGRpc3RhbmNlRnJvbUxlZnRFZGdlID0+IHtcclxuICAgICAgY29uc3QgeCA9IGRpc3RhbmNlRnJvbUxlZnRFZGdlIC0gdG9wRWxsaXBzZVJhZGl1c1g7XHJcbiAgICAgIHJldHVybiB0b3BFbGxpcHNlUmFkaXVzWSAqIE1hdGguc3FydCggMSAtIE1hdGgucG93KCB4LCAyICkgLyAoIE1hdGgucG93KCB0b3BFbGxpcHNlUmFkaXVzWCwgMiApICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gZGVmaW5lIGEgYnVuY2ggb2YgdmFyaWFibGUgdGhhdCB3aWxsIGJlIHVzZWQgaW4gdGhlIHByb2Nlc3Mgb2YgZHJhd2luZyB0aGUgbWFpbiBjb250YWluZXJcclxuICAgIGNvbnN0IG91dGVyU2hhcGVUaWx0RmFjdG9yID0gdG9wRWxsaXBzZVJhZGl1c1kgKiAxLjI4OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIG11bHRpcGxpZXIgdGhhdCBtYWtlcyBjdXJ2ZSBtYXRjaCBsaWRcclxuICAgIGNvbnN0IGN1dG91dFNoYXBlVGlsdEZhY3RvciA9IG91dGVyU2hhcGVUaWx0RmFjdG9yICogMC41NTsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBtdWx0aXBsaWVyIHRoYXQgbG9va3MgZ29vZFxyXG4gICAgY29uc3QgY3V0b3V0SGVpZ2h0ID0gdGhpcy5wYXJ0aWNsZUFyZWFWaWV3Qm91bmRzLmdldEhlaWdodCgpIC0gMiAqIENPTlRBSU5FUl9DVVRPVVRfWV9NQVJHSU47XHJcbiAgICBjb25zdCBjdXRvdXRUb3BZID0gZ2V0RWxsaXBzZUxvd2VyRWRnZVlQb3MoIENPTlRBSU5FUl9DVVRPVVRfWF9NQVJHSU4gKSArIENPTlRBSU5FUl9DVVRPVVRfWV9NQVJHSU47XHJcbiAgICBjb25zdCBjdXRvdXRCb3R0b21ZID0gY3V0b3V0VG9wWSArIGN1dG91dEhlaWdodDtcclxuICAgIGNvbnN0IGN1dG91dFdpZHRoID0gY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIC0gMiAqIENPTlRBSU5FUl9DVVRPVVRfWF9NQVJHSU47XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIG1haW4gY29udGFpbmVyIG5vZGUsIGV4Y2x1ZGluZyB0aGUgYmV2ZWxcclxuICAgIGNvbnN0IG1haW5Db250YWluZXIgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgICAubW92ZVRvKCAwLCAwIClcclxuXHJcbiAgICAgICAgLy8gdG9wIGN1cnZlLCB5LWNvbXBvbmVudCBvZiBjb250cm9sIHBvaW50cyBtYWRlIHRvIG1hdGNoIHVwIHdpdGggbG93ZXIgZWRnZSBvZiB0aGUgbGlkXHJcbiAgICAgICAgLmN1YmljQ3VydmVUbyhcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBvdXRlclNoYXBlVGlsdEZhY3RvcixcclxuICAgICAgICAgIGNvbnRhaW5lcldpZHRoV2l0aE1hcmdpbixcclxuICAgICAgICAgIG91dGVyU2hhcGVUaWx0RmFjdG9yLFxyXG4gICAgICAgICAgY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luLFxyXG4gICAgICAgICAgMFxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gbGluZSBmcm9tIG91dGVyIHRvcCByaWdodCB0byBvdXRlciBib3R0b20gcmlnaHRcclxuICAgICAgICAubGluZVRvKCBjb250YWluZXJXaWR0aFdpdGhNYXJnaW4sIHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5oZWlnaHQgKVxyXG5cclxuICAgICAgICAvLyBib3R0b20gb3V0ZXIgY3VydmVcclxuICAgICAgICAuY3ViaWNDdXJ2ZVRvKFxyXG4gICAgICAgICAgY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luLFxyXG4gICAgICAgICAgdGhpcy5wYXJ0aWNsZUFyZWFWaWV3Qm91bmRzLmhlaWdodCArIG91dGVyU2hhcGVUaWx0RmFjdG9yLFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5oZWlnaHQgKyBvdXRlclNoYXBlVGlsdEZhY3RvcixcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMuaGVpZ2h0XHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICAvLyBsZWZ0IG91dGVyIHNpZGVcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuXHJcbiAgICAgICAgLy8gc3RhcnQgZHJhd2luZyB0aGUgY3V0b3V0LCBtdXN0IGJlIGRyYXduIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmcm9tIG91dGVyIHNoYXBlIHRvIG1ha2UgdGhlIGhvbGUgYXBwZWFyXHJcbiAgICAgICAgLm1vdmVUbyggQ09OVEFJTkVSX0NVVE9VVF9YX01BUkdJTiwgY3V0b3V0VG9wWSApXHJcblxyXG4gICAgICAgIC8vIGxlZnQgaW5uZXIgbGluZVxyXG4gICAgICAgIC5saW5lVG8oIENPTlRBSU5FUl9DVVRPVVRfWF9NQVJHSU4sIGN1dG91dEJvdHRvbVkgKVxyXG5cclxuICAgICAgICAvLyBib3R0b20gaW5uZXIgY3VydmVcclxuICAgICAgICAucXVhZHJhdGljQ3VydmVUbyhcclxuICAgICAgICAgIGNvbnRhaW5lcldpZHRoV2l0aE1hcmdpbiAvIDIsXHJcbiAgICAgICAgICBjdXRvdXRCb3R0b21ZICsgY3V0b3V0U2hhcGVUaWx0RmFjdG9yLFxyXG4gICAgICAgICAgY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIC0gQ09OVEFJTkVSX0NVVE9VVF9YX01BUkdJTixcclxuICAgICAgICAgIGN1dG91dEJvdHRvbVlcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIC8vIGxpbmUgZnJvbSBpbm5lciBib3R0b20gcmlnaHQgdG8gaW5uZXIgdG9wIHJpZ2h0XHJcbiAgICAgICAgLmxpbmVUbyggY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIC0gQ09OVEFJTkVSX0NVVE9VVF9YX01BUkdJTiwgY3V0b3V0VG9wWSApXHJcblxyXG4gICAgICAgIC8vIHRvcCBpbm5lciBjdXJ2ZVxyXG4gICAgICAgIC5xdWFkcmF0aWNDdXJ2ZVRvKFxyXG4gICAgICAgICAgY29udGFpbmVyV2lkdGhXaXRoTWFyZ2luIC8gMixcclxuICAgICAgICAgIGN1dG91dFRvcFkgKyBjdXRvdXRTaGFwZVRpbHRGYWN0b3IsXHJcbiAgICAgICAgICBDT05UQUlORVJfQ1VUT1VUX1hfTUFSR0lOLFxyXG4gICAgICAgICAgY3V0b3V0VG9wWVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIGNvbnRhaW5lcldpZHRoV2l0aE1hcmdpbiwgMCApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCAnIzZENkQ2RCcgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4xLCAnIzhCOEI4QicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4yLCAnI0FFQUZBRicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC40LCAnI0JBQkFCQScgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC43LCAnI0EzQTRBNCcgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC43NSwgJyM4RThFOEUnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuOCwgJyM3MzczNzMnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuOSwgJyM2NDY1NjUnICksXHJcbiAgICAgICAgb3BhY2l0eTogMC45LFxyXG4gICAgICAgIGNlbnRlclg6IHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5jZW50ZXJYLFxyXG4gICAgICAgIHRvcDogdGhpcy5wYXJ0aWNsZUFyZWFWaWV3Qm91bmRzLm1pbllcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHBvc3RQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCBtYWluQ29udGFpbmVyICk7XHJcblxyXG4gICAgY29uc3QgYmV2ZWwgPSBuZXcgTm9kZSggeyBvcGFjaXR5OiAwLjkgfSApO1xyXG5cclxuICAgIGNvbnN0IGxlZnRCZXZlbEVkZ2UgPSBuZXcgUGF0aChcclxuICAgICAgbmV3IFNoYXBlKClcclxuICAgICAgICAubW92ZVRvKCAwLCAwIClcclxuICAgICAgICAubGluZVRvKCAwLCBjdXRvdXRIZWlnaHQgKVxyXG4gICAgICAgIC5saW5lVG8oIEJFVkVMX1dJRFRILCBjdXRvdXRIZWlnaHQgLSBCRVZFTF9XSURUSCApXHJcbiAgICAgICAgLmxpbmVUbyggQkVWRUxfV0lEVEgsIEJFVkVMX1dJRFRIIClcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgICAuY2xvc2UoKSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgY3V0b3V0SGVpZ2h0IClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAsICcjNTI1MjUyJyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjMsICcjNTE1MTUxJyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjQsICcjNEU0RTRFJyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjUsICcjNDI0MjQyJyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjYsICcjMzUzNTM1JyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjcsICcjMmEyYTJhJyApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjgsICcjMjkyOTI5JyApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBiZXZlbC5hZGRDaGlsZCggbGVmdEJldmVsRWRnZSApO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0QmV2ZWxFZGdlID0gbmV3IFBhdGgoXHJcbiAgICAgIG5ldyBTaGFwZSgpXHJcbiAgICAgICAgLm1vdmVUbyggMCwgQkVWRUxfV0lEVEggKVxyXG4gICAgICAgIC5saW5lVG8oIDAsIGN1dG91dEhlaWdodCAtIEJFVkVMX1dJRFRIIClcclxuICAgICAgICAubGluZVRvKCBCRVZFTF9XSURUSCwgY3V0b3V0SGVpZ2h0IClcclxuICAgICAgICAubGluZVRvKCBCRVZFTF9XSURUSCwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggMCwgQkVWRUxfV0lEVEggKVxyXG4gICAgICAgIC5jbG9zZSgpLFxyXG4gICAgICB7XHJcbiAgICAgICAgbGVmdDogY3V0b3V0V2lkdGggLSBCRVZFTF9XSURUSCxcclxuICAgICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDAsIGN1dG91dEhlaWdodCApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCAnIzhBOEE4QScgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4yLCAnIzc0NzQ3NCcgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4zLCAnIzUyNTI1MicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC42LCAnIzhBOEE4QScgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC45LCAnI0EyQTJBMicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC45NSwgJyM2MTYxNjEnIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGJldmVsLmFkZENoaWxkKCByaWdodEJldmVsRWRnZSApO1xyXG5cclxuICAgIGNvbnN0IHRvcEJldmVsRWRnZSA9IG5ldyBQYXRoKFxyXG4gICAgICBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIDAsIDAgKVxyXG4gICAgICAgIC5xdWFkcmF0aWNDdXJ2ZVRvKCBjdXRvdXRXaWR0aCAvIDIsIGN1dG91dFNoYXBlVGlsdEZhY3RvciwgY3V0b3V0V2lkdGgsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIGN1dG91dFdpZHRoIC0gQkVWRUxfV0lEVEgsIEJFVkVMX1dJRFRIIClcclxuICAgICAgICAucXVhZHJhdGljQ3VydmVUbyggY3V0b3V0V2lkdGggLyAyLCBjdXRvdXRTaGFwZVRpbHRGYWN0b3IgKyBCRVZFTF9XSURUSCwgQkVWRUxfV0lEVEgsIEJFVkVMX1dJRFRIIClcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgICAuY2xvc2UoKSxcclxuICAgICAge1xyXG4gICAgICAgIGxpbmVXaWR0aDogMCxcclxuICAgICAgICBzdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCBjdXRvdXRXaWR0aCwgMCApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCAnIzJFMkUyRScgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4yLCAnIzMyMzIzMicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4zLCAnIzM2MzYzNicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC40LCAnIzNFM0UzRScgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC41LCAnIzRCNEI0QicgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC45LCAnIzUyNTI1MicgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgYmV2ZWwuYWRkQ2hpbGQoIHRvcEJldmVsRWRnZSApO1xyXG5cclxuICAgIGNvbnN0IGJvdHRvbUJldmVsRWRnZSA9IG5ldyBQYXRoKFxyXG4gICAgICBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIEJFVkVMX1dJRFRILCAwIClcclxuICAgICAgICAucXVhZHJhdGljQ3VydmVUbyggY3V0b3V0V2lkdGggLyAyLCBjdXRvdXRTaGFwZVRpbHRGYWN0b3IsIGN1dG91dFdpZHRoIC0gQkVWRUxfV0lEVEgsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIGN1dG91dFdpZHRoLCBCRVZFTF9XSURUSCApXHJcbiAgICAgICAgLnF1YWRyYXRpY0N1cnZlVG8oIGN1dG91dFdpZHRoIC8gMiwgY3V0b3V0U2hhcGVUaWx0RmFjdG9yICsgQkVWRUxfV0lEVEgsIDAsIEJFVkVMX1dJRFRIIClcclxuICAgICAgICAubGluZVRvKCBCRVZFTF9XSURUSCwgMCApXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIHtcclxuICAgICAgICB0b3A6IGN1dG91dEhlaWdodCAtIEJFVkVMX1dJRFRILFxyXG4gICAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgY3V0b3V0V2lkdGgsIDAgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgJyM1RDVENUQnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuMiwgJyM3MTcxNzEnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuMywgJyM3QzdDN0MnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNCwgJyM4RDhEOEQnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgJyM5RTlFOUUnIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgJyNBMkEyQTInIClcclxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuOSwgJyNBM0EzQTMnIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGJldmVsLmFkZENoaWxkKCBib3R0b21CZXZlbEVkZ2UgKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiBhbmQgYWRkIHRoZSBiZXZlbC5cclxuICAgIGJldmVsLmNlbnRlclggPSB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMuY2VudGVyWDtcclxuICAgIGJldmVsLnRvcCA9IHRoaXMucGFydGljbGVBcmVhVmlld0JvdW5kcy5taW5ZICsgY3V0b3V0VG9wWTtcclxuICAgIHBvc3RQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCBiZXZlbCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIHRoZXJtb21ldGVyIG5vZGUsIHdoaWNoIG5lZWRzIHRvIGJlIGFib3ZlIHRoZSBjb250YWluZXIgaW4gdGhlIHotb3JkZXJcclxuICAgIHRoaXMuY29tcG9zaXRlVGhlcm1vbWV0ZXJOb2RlID0gbmV3IENvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZSggbXVsdGlwbGVQYXJ0aWNsZU1vZGVsLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSxcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgY2VudGVyWDogbGlkRWxsaXBzZU5vZGUuY2VudGVyWCArIG9wdGlvbnMudGhlcm1vbWV0ZXJYT2Zmc2V0RnJvbUNlbnRlcixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb3NpdGVUaGVybW9tZXRlck5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHBvc3RQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCB0aGlzLmNvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZSApO1xyXG5cclxuICAgIC8vIERlZmluZSBhIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgcG9zaXRpb24gYW5kIGFwcGVhcmFuY2Ugb2YgdGhlIHByZXNzdXJlIGdhdWdlLlxyXG4gICAgY29uc3QgdXBkYXRlUHJlc3N1cmVHYXVnZVBvc2l0aW9uID0gKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKCAhcHJlc3N1cmVHYXVnZU5vZGUgKSB7XHJcbiAgICAgICAgLy8gbm90aGluZyB0byB1cGRhdGUsIHNvIGJhaWwgb3V0XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjb250YWluZXJIZWlnaHQgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgIGlmICggIXRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBpZiAoIHByZXNzdXJlR2F1Z2VOb2RlLmdldFJvdGF0aW9uKCkgIT09IDAgKSB7XHJcbiAgICAgICAgICBwcmVzc3VyZUdhdWdlTm9kZS5zZXRSb3RhdGlvbiggMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmVzc3VyZUdhdWdlTm9kZS50b3AgPSB0aGlzLnBhcnRpY2xlQXJlYVZpZXdCb3VuZHMudG9wIC0gNzU7IC8vIGVtcGlyaWNhbCBwb3NpdGlvbiBhZGp1c3RtZW50IHRvIGNvbm5lY3QgdG8gbGlkXHJcbiAgICAgICAgcHJlc3N1cmVHYXVnZU5vZGUuc2V0RWxib3dIZWlnaHQoXHJcbiAgICAgICAgICBQUkVTU1VSRV9HQVVHRV9FTEJPV19PRkZTRVQgKyBNYXRoLmFicyggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoXHJcbiAgICAgICAgICBNdWx0aXBsZVBhcnRpY2xlTW9kZWwuUEFSVElDTEVfQ09OVEFJTkVSX0lOSVRJQUxfSEVJR0hUIC0gY29udGFpbmVySGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNvbnRhaW5lciBpcyBleHBsb2RpbmcsIHNvIG1vdmUgdGhlIGdhdWdlIHVwIGFuZCBzcGluIGl0LlxyXG4gICAgICAgIGNvbnN0IGRlbHRhSGVpZ2h0ID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIGNvbnRhaW5lckhlaWdodCApIC0gdGhpcy5wcmV2aW91c0NvbnRhaW5lclZpZXdTaXplO1xyXG4gICAgICAgIHByZXNzdXJlR2F1Z2VOb2RlLnJvdGF0ZSggZGVsdGFIZWlnaHQgKiAwLjAxICogTWF0aC5QSSApO1xyXG4gICAgICAgIHByZXNzdXJlR2F1Z2VOb2RlLmNlbnRlclkgPSBwcmVzc3VyZUdhdWdlTm9kZS5jZW50ZXJZICsgZGVsdGFIZWlnaHQgKiAyO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE1vbml0b3IgdGhlIGhlaWdodCBvZiB0aGUgY29udGFpbmVyIGluIHRoZSBtb2RlbCBhbmQgYWRqdXN0IHRoZSB2aWV3IHdoZW4gY2hhbmdlcyBvY2N1ci5cclxuICAgIG11bHRpcGxlUGFydGljbGVNb2RlbC5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5saW5rKCAoIGNvbnRhaW5lckhlaWdodCwgb2xkQ29udGFpbmVySGVpZ2h0ICkgPT4ge1xyXG5cclxuICAgICAgaWYgKCBvbGRDb250YWluZXJIZWlnaHQgKSB7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRhaW5lclZpZXdTaXplID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCBvbGRDb250YWluZXJIZWlnaHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbGlkWVBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggY29udGFpbmVySGVpZ2h0ICk7XHJcblxyXG4gICAgICBsaWRFbGxpcHNlTm9kZS5jZW50ZXJZID0gbGlkWVBvc2l0aW9uO1xyXG4gICAgICB0aGlzLmNvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZS5jZW50ZXJZID0gbGlkWVBvc2l0aW9uO1xyXG5cclxuICAgICAgaWYgKCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwuaXNFeHBsb2RlZFByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyB0aGUgY29udGFpbmVyIGhhcyBleHBsb2RlZCwgc28gcm90YXRlIHRoZSBsaWQgYXMgaXQgZ29lcyB1cCBzbyB0aGF0IGl0IGxvb2tzIGxpa2UgaXQgaGFzIGJlZW4gYmxvd24gb2ZmLlxyXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IG9sZENvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICBjb25zdCByb3RhdGlvbkFtb3VudCA9IGRlbHRhWSAqIE1hdGguUEkgKiAwLjAwMDA4OyAvLyBtdWx0aXBsaWVyIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICBsaWRFbGxpcHNlTm9kZS5yb3RhdGVBcm91bmQoIGxpZEVsbGlwc2VOb2RlLmNlbnRlciwgcm90YXRpb25BbW91bnQgKTtcclxuXHJcbiAgICAgICAgLy8gcm90YXRlIHRoZSB0aGVybW9tZXRlciB0b28sIGJ1dCBkaWZmZXJlbnRseSB0aGFuIHRoZSBsaWQgZm9yIGEgbW9yZSBjaGFvdGljIGxvb2tcclxuICAgICAgICBjb25zdCBjb250YWluZXJIZWlnaHRDaGFuZ2UgPSBvbGRDb250YWluZXJIZWlnaHQgLSBjb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jb21wb3NpdGVUaGVybW9tZXRlck5vZGUucm90YXRlQXJvdW5kKFxyXG4gICAgICAgICAgdGhpcy5jb21wb3NpdGVUaGVybW9tZXRlck5vZGUuY2VudGVyLFxyXG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0Q2hhbmdlICogMC4wMDAxICogTWF0aC5QSVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBvaW50aW5nIGhhbmRcclxuICAgICAgcG9pbnRpbmdIYW5kTm9kZSAmJiBwb2ludGluZ0hhbmROb2RlLnNldEZpbmdlcnRpcFlQb3NpdGlvbiggbGlkWVBvc2l0aW9uICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIHByZXNzdXJlIGdhdWdlIHBvc2l0aW9uIChpZiBwcmVzZW50KVxyXG4gICAgICB1cGRhdGVQcmVzc3VyZUdhdWdlUG9zaXRpb24oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNb25pdG9yIHRoZSBtb2RlbCBmb3IgY2hhbmdlcyBpbiB0aGUgZXhwbG9kZWQgc3RhdGUgb2YgdGhlIGNvbnRhaW5lciBhbmQgdXBkYXRlIHRoZSB2aWV3IGFzIG5lZWRlZC5cclxuICAgIG11bHRpcGxlUGFydGljbGVNb2RlbC5pc0V4cGxvZGVkUHJvcGVydHkubGluayggKCBpc0V4cGxvZGVkLCB3YXNFeHBsb2RlZCApID0+IHtcclxuXHJcbiAgICAgIGlmICggIWlzRXhwbG9kZWQgJiYgd2FzRXhwbG9kZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIHJldHVybiB0aGUgbGlkIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRhaW5lclxyXG4gICAgICAgIGxpZEVsbGlwc2VOb2RlLnNldFJvdGF0aW9uKCAwICk7XHJcbiAgICAgICAgbGlkRWxsaXBzZU5vZGUuY2VudGVyWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIE11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfV0lEVEggLyAyICk7XHJcbiAgICAgICAgbGlkRWxsaXBzZU5vZGUuY2VudGVyWSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG11bHRpcGxlUGFydGljbGVNb2RlbC5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgICAgICAvLyByZXR1cm4gdGhlIHRoZXJtb21ldGVyIG5vZGUgdG8gaXRzIG9yaWdpbmFsIHBvc2l0aW9uXHJcbiAgICAgICAgdGhpcy5jb21wb3NpdGVUaGVybW9tZXRlck5vZGUuc2V0Um90YXRpb24oIDAgKTtcclxuICAgICAgICB0aGlzLmNvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZS5jZW50ZXJYID0gbGlkRWxsaXBzZU5vZGUuY2VudGVyWCArIG9wdGlvbnMudGhlcm1vbWV0ZXJYT2Zmc2V0RnJvbUNlbnRlcjtcclxuICAgICAgICB0aGlzLmNvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZS5jZW50ZXJZID0gbGlkRWxsaXBzZU5vZGUuY2VudGVyWTtcclxuXHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBwcmVzc3VyZSBnYXVnZSB0byBpdHMgb3JpZ2luYWwgcG9zaXRpb25cclxuICAgICAgICB1cGRhdGVQcmVzc3VyZUdhdWdlUG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGRlbHRhIHRpbWVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICB0aGlzLnBhcnRpY2xlc0NhbnZhc05vZGUuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlc3RvcmUgaW5pdGlhbCBjb25kaXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmNvbXBvc2l0ZVRoZXJtb21ldGVyTm9kZS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdQYXJ0aWNsZUNvbnRhaW5lck5vZGUnLCBQYXJ0aWNsZUNvbnRhaW5lck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGVDb250YWluZXJOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FB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