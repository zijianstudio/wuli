// Copyright 2019-2023, University of Colorado Boulder

/**
 * GasPropertiesIconFactory is a set of factory methods for creating the various icons that appear in the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import HandleNode from '../../../../scenery-phet/js/HandleNode.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import { HBox, Line, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import DiffusionParticle1 from '../../diffusion/model/DiffusionParticle1.js';
import DiffusionParticle2 from '../../diffusion/model/DiffusionParticle2.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesColors from '../GasPropertiesColors.js';
import HeavyParticle from '../model/HeavyParticle.js';
import LightParticle from '../model/LightParticle.js';
import DimensionalArrowsNode from './DimensionalArrowsNode.js';
import ParticleNode from './ParticleNode.js';
import PressureGaugeNode from './PressureGaugeNode.js';

// constants
const SCREEN_ICONS_TRANSFORM = ModelViewTransform2.createIdentity();
const GasPropertiesIconFactory = {
  /**
   * Creates the icon for the Ideal screen.
   */
  createIdealScreenIcon() {
    // Container
    const containerNode = new Rectangle(0, 0, 275, 200, {
      stroke: GasPropertiesColors.containerBoundsStrokeProperty,
      lineWidth: 5
    });

    // Thermometer
    const thermometerNode = new ThermometerNode(new NumberProperty(40), 0, 100, {
      backgroundFill: 'white',
      glassThickness: 5,
      centerX: containerNode.right - 0.25 * containerNode.width,
      centerY: containerNode.top - 3
    });

    // Gauge
    const gaugeNode = new GaugeNode(new NumberProperty(30), new Property(''), new Range(0, 100), {
      radius: 0.25 * containerNode.height,
      needleLineWidth: 6,
      numberOfTicks: 15,
      majorTickStroke: 'black',
      minorTickStroke: 'black',
      left: containerNode.right + 15,
      top: containerNode.top,
      tandem: Tandem.OPT_OUT
    });

    // Post that connects the gauge to the container
    const postWidth = gaugeNode.centerX - containerNode.right;
    const postHeight = 0.3 * gaugeNode.height;
    const postNode = new Rectangle(0, 0, postWidth, postHeight, {
      fill: PressureGaugeNode.createPostGradient(postHeight),
      stroke: 'black',
      left: containerNode.right - 1,
      // overlap
      centerY: gaugeNode.centerY
    });

    // Particles, positions determined empirically in view coordinates, specified left to right
    const particlePositions = [new Vector2(0, 300), new Vector2(250, 0), new Vector2(575, 225)];
    const particleNodes = [];
    for (let i = 0; i < particlePositions.length; i++) {
      particleNodes.push(GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        center: particlePositions[i]
      }));
    }

    // Parent for particles, scale empirically
    const particlesParent = new Node({
      scale: 0.2,
      center: containerNode.center,
      children: particleNodes
    });
    const iconNode = new Node({
      children: [postNode, containerNode, gaugeNode, particlesParent, thermometerNode]
    });
    return new ScreenIcon(iconNode, {
      fill: GasPropertiesColors.screenBackgroundColorProperty
    });
  },
  /**
   * Creates the icon for the Explore screen.
   */
  createExploreScreenIcon() {
    // Vertical section of container wall
    const wallNode = new Line(0, 0, 0, 300, {
      stroke: GasPropertiesColors.containerBoundsStrokeProperty,
      lineWidth: 10
    });

    // Handle, attached to the left of the wall
    const handleNode = new HandleNode({
      gripBaseColor: GasPropertiesColors.resizeGripColorProperty,
      rotation: -Math.PI / 2,
      right: wallNode.left + 3,
      // overlap
      centerY: wallNode.centerY
    });

    // Particles, positions determined empirically, relative to rightCenter of wall
    const particlesNode = new Node({
      scale: 0.25,
      translation: wallNode.rightCenter,
      children: [
      // 2 particles against the wall
      GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        left: 0,
        bottom: 0
      }), GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        left: 0,
        top: 0
      }),
      // 2 particles away from the wall
      GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        left: 800,
        centerY: 340
      }), GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        left: 600,
        centerY: -200
      })]
    });
    const iconNode = new Node({
      children: [handleNode, wallNode, particlesNode]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1,
      fill: GasPropertiesColors.screenBackgroundColorProperty
    });
  },
  /**
   * Creates the icon for the Energy screen.
   */
  createEnergyScreenIcon() {
    // histogram shape
    const iconWidth = 300;
    const iconHeight = 200;
    const binCounts = [0.8, 1.0, 0.85, 0.53, 0.33, 0.21, 0.13, 0.08, 0.05, 0.03];
    const deltaX = iconWidth / binCounts.length;
    let x = 0;
    let y = 0;
    const iconShape = new Shape().moveTo(x, y);
    for (let i = 0; i < binCounts.length; i++) {
      x = i * deltaX;
      y = -iconHeight * binCounts[i];
      iconShape.lineTo(x, y);
      x = (i + 1) * deltaX;
      iconShape.lineTo(x, y);
    }
    iconShape.lineTo(iconWidth, 0).lineTo(0, 0).close();
    const iconNode = new Path(iconShape, {
      fill: GasPropertiesColors.kineticEnergyHistogramBarColorProperty
    });
    return new ScreenIcon(iconNode, {
      maxIconHeightProportion: 0.75,
      fill: GasPropertiesColors.screenBackgroundColorProperty
    });
  },
  /**
   * Creates the icon for the Diffusion screen.
   */
  createDiffusionScreenIcon() {
    // Invisible container, so that divider is centered
    const containerNode = new Rectangle(0, 0, 425, 300, {
      stroke: phet.chipper.queryParameters.dev ? 'red' : null
    });
    const dividerNode = new Line(0, 0, 0, containerNode.height, {
      stroke: GasPropertiesColors.dividerColorProperty,
      lineWidth: 12,
      center: containerNode.center
    });

    // Particles, positions determined empirically, relative to centerX of divider, specified left to right
    const particle1Positions = [new Vector2(-400, 300), new Vector2(-600, 600), new Vector2(-340, 800)];
    const particle2Positions = [new Vector2(400, 300), new Vector2(660, 740)];

    // Create particle icons, relative to centerTop of divider
    const particleNodes = [];
    for (let i = 0; i < particle1Positions.length; i++) {
      particleNodes.push(GasPropertiesIconFactory.createDiffusionParticle1Icon(SCREEN_ICONS_TRANSFORM, {
        center: particle1Positions[i]
      }));
    }
    for (let i = 0; i < particle2Positions.length; i++) {
      particleNodes.push(GasPropertiesIconFactory.createDiffusionParticle2Icon(SCREEN_ICONS_TRANSFORM, {
        center: particle2Positions[i]
      }));
    }

    // Parent for particles, scale empirically
    const particlesParent = new Node({
      scale: 0.25,
      translation: dividerNode.centerTop,
      children: particleNodes
    });
    const iconNode = new Node({
      children: [containerNode, dividerNode, particlesParent]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1,
      fill: GasPropertiesColors.screenBackgroundColorProperty
    });
  },
  /**
   * Creates the icon for the Intro screen in the Gases Intro sim.
   */
  createIntroScreenIcon() {
    // Invisible container
    const containerNode = new Rectangle(0, 0, 800, 600, {
      stroke: phet.chipper.queryParameters.dev ? 'red' : null
    });

    // Particles, positions determined empirically in view coordinates, specified left to right
    const heavyParticlePositions = [new Vector2(0, 850), new Vector2(110, 105), new Vector2(555, 945), new Vector2(670, 425), new Vector2(1000, 125), new Vector2(1220, 1050)];
    const lightParticlePositions = [new Vector2(278, 475), new Vector2(1000, 680), new Vector2(1450, 210)];

    // Create particle icons
    const particleNodes = [];
    for (let i = 0; i < heavyParticlePositions.length; i++) {
      particleNodes.push(GasPropertiesIconFactory.createHeavyParticleIcon(SCREEN_ICONS_TRANSFORM, {
        center: heavyParticlePositions[i]
      }));
    }
    for (let i = 0; i < lightParticlePositions.length; i++) {
      particleNodes.push(GasPropertiesIconFactory.createLightParticleIcon(SCREEN_ICONS_TRANSFORM, {
        center: lightParticlePositions[i]
      }));
    }
    const particlesParent = new Node({
      scale: 0.45,
      center: containerNode.center,
      children: particleNodes
    });
    const iconNode = new Node({
      children: [containerNode, particlesParent]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 0.9,
      fill: GasPropertiesColors.screenBackgroundColorProperty
    });
  },
  /**
   * Creates an icon for a heavy particle.
   */
  createHeavyParticleIcon(modelViewTransform, options) {
    return createParticleIcon(new HeavyParticle(), modelViewTransform, options);
  },
  /**
   * Creates an icon for a light particle.
   */
  createLightParticleIcon(modelViewTransform, options) {
    return createParticleIcon(new LightParticle(), modelViewTransform, options);
  },
  /**
   * Creates an icon for particle type 1 in the Diffusion screen.
   */
  createDiffusionParticle1Icon(modelViewTransform, options) {
    return createParticleIcon(new DiffusionParticle1(), modelViewTransform, options);
  },
  /**
   * Creates an icon for particle type 2 in the Diffusion screen.
   */
  createDiffusionParticle2Icon(modelViewTransform, options) {
    return createParticleIcon(new DiffusionParticle2(), modelViewTransform, options);
  },
  /**
   * Creates a simplified icon for the Stopwatch.
   */
  createStopwatchIcon() {
    return createToolIcon(GasPropertiesColors.stopwatchBackgroundColorProperty);
  },
  /**
   * Creates a simplified icon for the Collision Counter.
   */
  createCollisionCounterIcon() {
    return createToolIcon(GasPropertiesColors.collisionCounterBackgroundColorProperty);
  },
  /**
   * Creates the icon that represents the histogram for a species of particle.
   */
  createSpeciesHistogramIcon(particle, modelViewTransform) {
    return new HBox({
      spacing: 3,
      children: [createParticleIcon(particle, modelViewTransform), createHistogramIcon(particle.colorProperty)]
    });
  },
  /**
   * Creates the icon used on the 'Width' checkbox.
   */
  createContainerWidthIcon() {
    return new DimensionalArrowsNode(new NumberProperty(44), {
      color: GasPropertiesColors.widthIconColorProperty
    });
  },
  /**
   * Creates the icon used on the 'Center of Mass' checkbox.
   */
  createCenterOfMassIcon() {
    const width = 4;
    const height = 15;
    return new HBox({
      spacing: 12,
      children: [new Rectangle(0, 0, width, height, {
        fill: GasPropertiesColors.particle1ColorProperty,
        stroke: GasPropertiesColors.centerOfMassStrokeProperty
      }), new Rectangle(0, 0, width, height, {
        fill: GasPropertiesColors.particle2ColorProperty,
        stroke: GasPropertiesColors.centerOfMassStrokeProperty
      })]
    });
  },
  /**
   * Creates the icon used on the 'Particle Flow Rate' checkbox.
   */
  createParticleFlowRateIcon() {
    const arrowOptions = {
      fill: GasPropertiesColors.particle1ColorProperty,
      stroke: 'black',
      headHeight: 12,
      headWidth: 12,
      tailWidth: 6
    };
    return new HBox({
      spacing: 3,
      children: [new ArrowNode(0, 0, -18, 0, arrowOptions), new ArrowNode(0, 0, 24, 0, arrowOptions)]
    });
  },
  /**
   * Creates the icon used on the 'Scale' checkbox.
   */
  createScaleIcon() {
    const scaleLength = 30;
    const tickLength = 6;
    const numberOfTicks = 5;
    const tickInterval = scaleLength / (numberOfTicks - 1);
    const shape = new Shape().moveTo(0, 0).lineTo(scaleLength, 0);
    for (let i = 0; i < numberOfTicks; i++) {
      shape.moveTo(i * tickInterval, 0).lineTo(i * tickInterval, tickLength);
    }
    return new Path(shape, {
      stroke: GasPropertiesColors.scaleColorProperty,
      lineWidth: 1
    });
  }
};

/**
 * Creates the icon for a particle.
 */
function createParticleIcon(particle, modelViewTransform, options) {
  return new ParticleNode(particle, modelViewTransform, options);
}

/**
 * Creates a simplified icon for a tool like the stopwatch or collision counter.
 */
function createToolIcon(color) {
  const background = new ShadedRectangle(new Bounds2(0, 0, 25, 20), {
    baseColor: color,
    cornerRadius: 4
  });
  const display = new Rectangle(0, 0, 0.75 * background.width, 0.35 * background.height, {
    fill: 'white',
    stroke: 'black',
    lineWidth: 0.5,
    cornerRadius: 1.5,
    centerX: background.centerX,
    top: background.top + 0.25 * background.height
  });
  return new Node({
    children: [background, display]
  });
}

/**
 * Creates an icon for a histogram shape, used for the checkboxes on the histograms.
 */
function createHistogramIcon(stroke) {
  // unit shape
  const shape = new Shape().moveTo(0, 1).lineTo(0, 0.25).lineTo(0.25, 0.25).lineTo(0.25, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(0.75, 0.5).lineTo(0.75, 0.75).lineTo(1, 0.75).lineTo(1, 1).transformed(Matrix3.scaling(12, 12));
  return new Path(shape, {
    stroke: stroke,
    lineWidth: 1.5
  });
}
gasProperties.register('GasPropertiesIconFactory', GasPropertiesIconFactory);
export default GasPropertiesIconFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQm91bmRzMiIsIk1hdHJpeDMiLCJSYW5nZSIsIlZlY3RvcjIiLCJTY3JlZW5JY29uIiwiU2hhcGUiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQXJyb3dOb2RlIiwiR2F1Z2VOb2RlIiwiSGFuZGxlTm9kZSIsIlNoYWRlZFJlY3RhbmdsZSIsIlRoZXJtb21ldGVyTm9kZSIsIkhCb3giLCJMaW5lIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJUYW5kZW0iLCJEaWZmdXNpb25QYXJ0aWNsZTEiLCJEaWZmdXNpb25QYXJ0aWNsZTIiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsIkhlYXZ5UGFydGljbGUiLCJMaWdodFBhcnRpY2xlIiwiRGltZW5zaW9uYWxBcnJvd3NOb2RlIiwiUGFydGljbGVOb2RlIiwiUHJlc3N1cmVHYXVnZU5vZGUiLCJTQ1JFRU5fSUNPTlNfVFJBTlNGT1JNIiwiY3JlYXRlSWRlbnRpdHkiLCJHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkiLCJjcmVhdGVJZGVhbFNjcmVlbkljb24iLCJjb250YWluZXJOb2RlIiwic3Ryb2tlIiwiY29udGFpbmVyQm91bmRzU3Ryb2tlUHJvcGVydHkiLCJsaW5lV2lkdGgiLCJ0aGVybW9tZXRlck5vZGUiLCJiYWNrZ3JvdW5kRmlsbCIsImdsYXNzVGhpY2tuZXNzIiwiY2VudGVyWCIsInJpZ2h0Iiwid2lkdGgiLCJjZW50ZXJZIiwidG9wIiwiZ2F1Z2VOb2RlIiwicmFkaXVzIiwiaGVpZ2h0IiwibmVlZGxlTGluZVdpZHRoIiwibnVtYmVyT2ZUaWNrcyIsIm1ham9yVGlja1N0cm9rZSIsIm1pbm9yVGlja1N0cm9rZSIsImxlZnQiLCJ0YW5kZW0iLCJPUFRfT1VUIiwicG9zdFdpZHRoIiwicG9zdEhlaWdodCIsInBvc3ROb2RlIiwiZmlsbCIsImNyZWF0ZVBvc3RHcmFkaWVudCIsInBhcnRpY2xlUG9zaXRpb25zIiwicGFydGljbGVOb2RlcyIsImkiLCJsZW5ndGgiLCJwdXNoIiwiY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24iLCJjZW50ZXIiLCJwYXJ0aWNsZXNQYXJlbnQiLCJzY2FsZSIsImNoaWxkcmVuIiwiaWNvbk5vZGUiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImNyZWF0ZUV4cGxvcmVTY3JlZW5JY29uIiwid2FsbE5vZGUiLCJoYW5kbGVOb2RlIiwiZ3JpcEJhc2VDb2xvciIsInJlc2l6ZUdyaXBDb2xvclByb3BlcnR5Iiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJwYXJ0aWNsZXNOb2RlIiwidHJhbnNsYXRpb24iLCJyaWdodENlbnRlciIsImJvdHRvbSIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsImNyZWF0ZUVuZXJneVNjcmVlbkljb24iLCJpY29uV2lkdGgiLCJpY29uSGVpZ2h0IiwiYmluQ291bnRzIiwiZGVsdGFYIiwieCIsInkiLCJpY29uU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsImtpbmV0aWNFbmVyZ3lIaXN0b2dyYW1CYXJDb2xvclByb3BlcnR5IiwiY3JlYXRlRGlmZnVzaW9uU2NyZWVuSWNvbiIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiZGl2aWRlck5vZGUiLCJkaXZpZGVyQ29sb3JQcm9wZXJ0eSIsInBhcnRpY2xlMVBvc2l0aW9ucyIsInBhcnRpY2xlMlBvc2l0aW9ucyIsImNyZWF0ZURpZmZ1c2lvblBhcnRpY2xlMUljb24iLCJjcmVhdGVEaWZmdXNpb25QYXJ0aWNsZTJJY29uIiwiY2VudGVyVG9wIiwiY3JlYXRlSW50cm9TY3JlZW5JY29uIiwiaGVhdnlQYXJ0aWNsZVBvc2l0aW9ucyIsImxpZ2h0UGFydGljbGVQb3NpdGlvbnMiLCJjcmVhdGVMaWdodFBhcnRpY2xlSWNvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJjcmVhdGVQYXJ0aWNsZUljb24iLCJjcmVhdGVTdG9wd2F0Y2hJY29uIiwiY3JlYXRlVG9vbEljb24iLCJzdG9wd2F0Y2hCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImNyZWF0ZUNvbGxpc2lvbkNvdW50ZXJJY29uIiwiY29sbGlzaW9uQ291bnRlckJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiY3JlYXRlU3BlY2llc0hpc3RvZ3JhbUljb24iLCJwYXJ0aWNsZSIsInNwYWNpbmciLCJjcmVhdGVIaXN0b2dyYW1JY29uIiwiY29sb3JQcm9wZXJ0eSIsImNyZWF0ZUNvbnRhaW5lcldpZHRoSWNvbiIsImNvbG9yIiwid2lkdGhJY29uQ29sb3JQcm9wZXJ0eSIsImNyZWF0ZUNlbnRlck9mTWFzc0ljb24iLCJwYXJ0aWNsZTFDb2xvclByb3BlcnR5IiwiY2VudGVyT2ZNYXNzU3Ryb2tlUHJvcGVydHkiLCJwYXJ0aWNsZTJDb2xvclByb3BlcnR5IiwiY3JlYXRlUGFydGljbGVGbG93UmF0ZUljb24iLCJhcnJvd09wdGlvbnMiLCJoZWFkSGVpZ2h0IiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiY3JlYXRlU2NhbGVJY29uIiwic2NhbGVMZW5ndGgiLCJ0aWNrTGVuZ3RoIiwidGlja0ludGVydmFsIiwic2hhcGUiLCJzY2FsZUNvbG9yUHJvcGVydHkiLCJiYWNrZ3JvdW5kIiwiYmFzZUNvbG9yIiwiY29ybmVyUmFkaXVzIiwiZGlzcGxheSIsInRyYW5zZm9ybWVkIiwic2NhbGluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeSBpcyBhIHNldCBvZiBmYWN0b3J5IG1ldGhvZHMgZm9yIGNyZWF0aW5nIHRoZSB2YXJpb3VzIGljb25zIHRoYXQgYXBwZWFyIGluIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBHYXVnZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0dhdWdlTm9kZS5qcyc7XHJcbmltcG9ydCBIYW5kbGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9IYW5kbGVOb2RlLmpzJztcclxuaW1wb3J0IFNoYWRlZFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2hhZGVkUmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IFRoZXJtb21ldGVyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGhlcm1vbWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IHsgSEJveCwgTGluZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRGlmZnVzaW9uUGFydGljbGUxIGZyb20gJy4uLy4uL2RpZmZ1c2lvbi9tb2RlbC9EaWZmdXNpb25QYXJ0aWNsZTEuanMnO1xyXG5pbXBvcnQgRGlmZnVzaW9uUGFydGljbGUyIGZyb20gJy4uLy4uL2RpZmZ1c2lvbi9tb2RlbC9EaWZmdXNpb25QYXJ0aWNsZTIuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb2xvcnMgZnJvbSAnLi4vR2FzUHJvcGVydGllc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBIZWF2eVBhcnRpY2xlIGZyb20gJy4uL21vZGVsL0hlYXZ5UGFydGljbGUuanMnO1xyXG5pbXBvcnQgTGlnaHRQYXJ0aWNsZSBmcm9tICcuLi9tb2RlbC9MaWdodFBhcnRpY2xlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4uL21vZGVsL1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbmFsQXJyb3dzTm9kZSBmcm9tICcuL0RpbWVuc2lvbmFsQXJyb3dzTm9kZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZU5vZGUsIHsgUGFydGljbGVOb2RlT3B0aW9ucyB9IGZyb20gJy4vUGFydGljbGVOb2RlLmpzJztcclxuaW1wb3J0IFByZXNzdXJlR2F1Z2VOb2RlIGZyb20gJy4vUHJlc3N1cmVHYXVnZU5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNDUkVFTl9JQ09OU19UUkFOU0ZPUk0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCk7XHJcblxyXG5jb25zdCBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoZSBJZGVhbCBzY3JlZW4uXHJcbiAgICovXHJcbiAgY3JlYXRlSWRlYWxTY3JlZW5JY29uKCk6IFNjcmVlbkljb24ge1xyXG5cclxuICAgIC8vIENvbnRhaW5lclxyXG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDI3NSwgMjAwLCB7XHJcbiAgICAgIHN0cm9rZTogR2FzUHJvcGVydGllc0NvbG9ycy5jb250YWluZXJCb3VuZHNTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiA1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlcm1vbWV0ZXJcclxuICAgIGNvbnN0IHRoZXJtb21ldGVyTm9kZSA9IG5ldyBUaGVybW9tZXRlck5vZGUoIG5ldyBOdW1iZXJQcm9wZXJ0eSggNDAgKSwgMCwgMTAwLCB7XHJcbiAgICAgIGJhY2tncm91bmRGaWxsOiAnd2hpdGUnLFxyXG4gICAgICBnbGFzc1RoaWNrbmVzczogNSxcclxuICAgICAgY2VudGVyWDogY29udGFpbmVyTm9kZS5yaWdodCAtIDAuMjUgKiBjb250YWluZXJOb2RlLndpZHRoLFxyXG4gICAgICBjZW50ZXJZOiBjb250YWluZXJOb2RlLnRvcCAtIDNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBHYXVnZVxyXG4gICAgY29uc3QgZ2F1Z2VOb2RlID0gbmV3IEdhdWdlTm9kZSggbmV3IE51bWJlclByb3BlcnR5KCAzMCApLCBuZXcgUHJvcGVydHkoICcnICksIG5ldyBSYW5nZSggMCwgMTAwICksIHtcclxuICAgICAgcmFkaXVzOiAwLjI1ICogY29udGFpbmVyTm9kZS5oZWlnaHQsXHJcbiAgICAgIG5lZWRsZUxpbmVXaWR0aDogNixcclxuICAgICAgbnVtYmVyT2ZUaWNrczogMTUsXHJcbiAgICAgIG1ham9yVGlja1N0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbWlub3JUaWNrU3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsZWZ0OiBjb250YWluZXJOb2RlLnJpZ2h0ICsgMTUsXHJcbiAgICAgIHRvcDogY29udGFpbmVyTm9kZS50b3AsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQb3N0IHRoYXQgY29ubmVjdHMgdGhlIGdhdWdlIHRvIHRoZSBjb250YWluZXJcclxuICAgIGNvbnN0IHBvc3RXaWR0aCA9IGdhdWdlTm9kZS5jZW50ZXJYIC0gY29udGFpbmVyTm9kZS5yaWdodDtcclxuICAgIGNvbnN0IHBvc3RIZWlnaHQgPSAwLjMgKiBnYXVnZU5vZGUuaGVpZ2h0O1xyXG4gICAgY29uc3QgcG9zdE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBwb3N0V2lkdGgsIHBvc3RIZWlnaHQsIHtcclxuICAgICAgZmlsbDogUHJlc3N1cmVHYXVnZU5vZGUuY3JlYXRlUG9zdEdyYWRpZW50KCBwb3N0SGVpZ2h0ICksXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGVmdDogY29udGFpbmVyTm9kZS5yaWdodCAtIDEsIC8vIG92ZXJsYXBcclxuICAgICAgY2VudGVyWTogZ2F1Z2VOb2RlLmNlbnRlcllcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQYXJ0aWNsZXMsIHBvc2l0aW9ucyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5IGluIHZpZXcgY29vcmRpbmF0ZXMsIHNwZWNpZmllZCBsZWZ0IHRvIHJpZ2h0XHJcbiAgICBjb25zdCBwYXJ0aWNsZVBvc2l0aW9ucyA9IFsgbmV3IFZlY3RvcjIoIDAsIDMwMCApLCBuZXcgVmVjdG9yMiggMjUwLCAwICksIG5ldyBWZWN0b3IyKCA1NzUsIDIyNSApIF07XHJcbiAgICBjb25zdCBwYXJ0aWNsZU5vZGVzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZVBvc2l0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgcGFydGljbGVOb2Rlcy5wdXNoKCBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24oIFNDUkVFTl9JQ09OU19UUkFOU0ZPUk0sIHtcclxuICAgICAgICBjZW50ZXI6IHBhcnRpY2xlUG9zaXRpb25zWyBpIF1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFyZW50IGZvciBwYXJ0aWNsZXMsIHNjYWxlIGVtcGlyaWNhbGx5XHJcbiAgICBjb25zdCBwYXJ0aWNsZXNQYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBzY2FsZTogMC4yLFxyXG4gICAgICBjZW50ZXI6IGNvbnRhaW5lck5vZGUuY2VudGVyLFxyXG4gICAgICBjaGlsZHJlbjogcGFydGljbGVOb2Rlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGljb25Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgcG9zdE5vZGUsIGNvbnRhaW5lck5vZGUsIGdhdWdlTm9kZSwgcGFydGljbGVzUGFyZW50LCB0aGVybW9tZXRlck5vZGUgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgICAgZmlsbDogR2FzUHJvcGVydGllc0NvbG9ycy5zY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoZSBFeHBsb3JlIHNjcmVlbi5cclxuICAgKi9cclxuICBjcmVhdGVFeHBsb3JlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBzZWN0aW9uIG9mIGNvbnRhaW5lciB3YWxsXHJcbiAgICBjb25zdCB3YWxsTm9kZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCAzMDAsIHtcclxuICAgICAgc3Ryb2tlOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLmNvbnRhaW5lckJvdW5kc1N0cm9rZVByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGFuZGxlLCBhdHRhY2hlZCB0byB0aGUgbGVmdCBvZiB0aGUgd2FsbFxyXG4gICAgY29uc3QgaGFuZGxlTm9kZSA9IG5ldyBIYW5kbGVOb2RlKCB7XHJcbiAgICAgIGdyaXBCYXNlQ29sb3I6IEdhc1Byb3BlcnRpZXNDb2xvcnMucmVzaXplR3JpcENvbG9yUHJvcGVydHksXHJcbiAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIsXHJcbiAgICAgIHJpZ2h0OiB3YWxsTm9kZS5sZWZ0ICsgMywgLy8gb3ZlcmxhcFxyXG4gICAgICBjZW50ZXJZOiB3YWxsTm9kZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFydGljbGVzLCBwb3NpdGlvbnMgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSwgcmVsYXRpdmUgdG8gcmlnaHRDZW50ZXIgb2Ygd2FsbFxyXG4gICAgY29uc3QgcGFydGljbGVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHNjYWxlOiAwLjI1LFxyXG4gICAgICB0cmFuc2xhdGlvbjogd2FsbE5vZGUucmlnaHRDZW50ZXIsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAgIC8vIDIgcGFydGljbGVzIGFnYWluc3QgdGhlIHdhbGxcclxuICAgICAgICBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24oIFNDUkVFTl9JQ09OU19UUkFOU0ZPUk0sIHtcclxuICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICBib3R0b206IDBcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LmNyZWF0ZUhlYXZ5UGFydGljbGVJY29uKCBTQ1JFRU5fSUNPTlNfVFJBTlNGT1JNLCB7XHJcbiAgICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgICAgdG9wOiAwXHJcbiAgICAgICAgfSApLFxyXG5cclxuICAgICAgICAvLyAyIHBhcnRpY2xlcyBhd2F5IGZyb20gdGhlIHdhbGxcclxuICAgICAgICBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24oIFNDUkVFTl9JQ09OU19UUkFOU0ZPUk0sIHtcclxuICAgICAgICAgIGxlZnQ6IDgwMCxcclxuICAgICAgICAgIGNlbnRlclk6IDM0MFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24oIFNDUkVFTl9JQ09OU19UUkFOU0ZPUk0sIHtcclxuICAgICAgICAgIGxlZnQ6IDYwMCxcclxuICAgICAgICAgIGNlbnRlclk6IC0yMDBcclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGljb25Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaGFuZGxlTm9kZSwgd2FsbE5vZGUsIHBhcnRpY2xlc05vZGUgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDEsXHJcbiAgICAgIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMuc2NyZWVuQmFja2dyb3VuZENvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgRW5lcmd5IHNjcmVlbi5cclxuICAgKi9cclxuICBjcmVhdGVFbmVyZ3lTY3JlZW5JY29uKCk6IFNjcmVlbkljb24ge1xyXG5cclxuICAgIC8vIGhpc3RvZ3JhbSBzaGFwZVxyXG4gICAgY29uc3QgaWNvbldpZHRoID0gMzAwO1xyXG4gICAgY29uc3QgaWNvbkhlaWdodCA9IDIwMDtcclxuICAgIGNvbnN0IGJpbkNvdW50cyA9IFsgMC44LCAxLjAsIDAuODUsIDAuNTMsIDAuMzMsIDAuMjEsIDAuMTMsIDAuMDgsIDAuMDUsIDAuMDMgXTtcclxuICAgIGNvbnN0IGRlbHRhWCA9IGljb25XaWR0aCAvIGJpbkNvdW50cy5sZW5ndGg7XHJcbiAgICBsZXQgeCA9IDA7XHJcbiAgICBsZXQgeSA9IDA7XHJcbiAgICBjb25zdCBpY29uU2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIHgsIHkgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJpbkNvdW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgeCA9IGkgKiBkZWx0YVg7XHJcbiAgICAgIHkgPSAtaWNvbkhlaWdodCAqIGJpbkNvdW50c1sgaSBdO1xyXG4gICAgICBpY29uU2hhcGUubGluZVRvKCB4LCB5ICk7XHJcbiAgICAgIHggPSAoIGkgKyAxICkgKiBkZWx0YVg7XHJcbiAgICAgIGljb25TaGFwZS5saW5lVG8oIHgsIHkgKTtcclxuICAgIH1cclxuICAgIGljb25TaGFwZS5saW5lVG8oIGljb25XaWR0aCwgMCApLmxpbmVUbyggMCwgMCApLmNsb3NlKCk7XHJcblxyXG4gICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgUGF0aCggaWNvblNoYXBlLCB7XHJcbiAgICAgIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMua2luZXRpY0VuZXJneUhpc3RvZ3JhbUJhckNvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNjcmVlbkljb24oIGljb25Ob2RlLCB7XHJcbiAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAwLjc1LFxyXG4gICAgICBmaWxsOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLnNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlIERpZmZ1c2lvbiBzY3JlZW4uXHJcbiAgICovXHJcbiAgY3JlYXRlRGlmZnVzaW9uU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgICAvLyBJbnZpc2libGUgY29udGFpbmVyLCBzbyB0aGF0IGRpdmlkZXIgaXMgY2VudGVyZWRcclxuICAgIGNvbnN0IGNvbnRhaW5lck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA0MjUsIDMwMCwge1xyXG4gICAgICBzdHJva2U6IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ID8gJ3JlZCcgOiBudWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZGl2aWRlck5vZGUgPSBuZXcgTGluZSggMCwgMCwgMCwgY29udGFpbmVyTm9kZS5oZWlnaHQsIHtcclxuICAgICAgc3Ryb2tlOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLmRpdmlkZXJDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDEyLFxyXG4gICAgICBjZW50ZXI6IGNvbnRhaW5lck5vZGUuY2VudGVyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFydGljbGVzLCBwb3NpdGlvbnMgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSwgcmVsYXRpdmUgdG8gY2VudGVyWCBvZiBkaXZpZGVyLCBzcGVjaWZpZWQgbGVmdCB0byByaWdodFxyXG4gICAgY29uc3QgcGFydGljbGUxUG9zaXRpb25zID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggLTQwMCwgMzAwICksIG5ldyBWZWN0b3IyKCAtNjAwLCA2MDAgKSwgbmV3IFZlY3RvcjIoIC0zNDAsIDgwMCApXHJcbiAgICBdO1xyXG4gICAgY29uc3QgcGFydGljbGUyUG9zaXRpb25zID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggNDAwLCAzMDAgKSwgbmV3IFZlY3RvcjIoIDY2MCwgNzQwIClcclxuICAgIF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHBhcnRpY2xlIGljb25zLCByZWxhdGl2ZSB0byBjZW50ZXJUb3Agb2YgZGl2aWRlclxyXG4gICAgY29uc3QgcGFydGljbGVOb2RlcyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGFydGljbGUxUG9zaXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBwYXJ0aWNsZU5vZGVzLnB1c2goIEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeS5jcmVhdGVEaWZmdXNpb25QYXJ0aWNsZTFJY29uKCBTQ1JFRU5fSUNPTlNfVFJBTlNGT1JNLCB7XHJcbiAgICAgICAgY2VudGVyOiBwYXJ0aWNsZTFQb3NpdGlvbnNbIGkgXVxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcnRpY2xlMlBvc2l0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgcGFydGljbGVOb2Rlcy5wdXNoKCBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlRGlmZnVzaW9uUGFydGljbGUySWNvbiggU0NSRUVOX0lDT05TX1RSQU5TRk9STSwge1xyXG4gICAgICAgIGNlbnRlcjogcGFydGljbGUyUG9zaXRpb25zWyBpIF1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFyZW50IGZvciBwYXJ0aWNsZXMsIHNjYWxlIGVtcGlyaWNhbGx5XHJcbiAgICBjb25zdCBwYXJ0aWNsZXNQYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBzY2FsZTogMC4yNSxcclxuICAgICAgdHJhbnNsYXRpb246IGRpdmlkZXJOb2RlLmNlbnRlclRvcCxcclxuICAgICAgY2hpbGRyZW46IHBhcnRpY2xlTm9kZXNcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGNvbnRhaW5lck5vZGUsIGRpdmlkZXJOb2RlLCBwYXJ0aWNsZXNQYXJlbnQgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDEsXHJcbiAgICAgIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMuc2NyZWVuQmFja2dyb3VuZENvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgSW50cm8gc2NyZWVuIGluIHRoZSBHYXNlcyBJbnRybyBzaW0uXHJcbiAgICovXHJcbiAgY3JlYXRlSW50cm9TY3JlZW5JY29uKCk6IFNjcmVlbkljb24ge1xyXG5cclxuICAgIC8vIEludmlzaWJsZSBjb250YWluZXJcclxuICAgIGNvbnN0IGNvbnRhaW5lck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA4MDAsIDYwMCwge1xyXG4gICAgICBzdHJva2U6IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ID8gJ3JlZCcgOiBudWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFydGljbGVzLCBwb3NpdGlvbnMgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSBpbiB2aWV3IGNvb3JkaW5hdGVzLCBzcGVjaWZpZWQgbGVmdCB0byByaWdodFxyXG4gICAgY29uc3QgaGVhdnlQYXJ0aWNsZVBvc2l0aW9ucyA9IFtcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIDg1MCApLCBuZXcgVmVjdG9yMiggMTEwLCAxMDUgKSwgbmV3IFZlY3RvcjIoIDU1NSwgOTQ1ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCA2NzAsIDQyNSApLCBuZXcgVmVjdG9yMiggMTAwMCwgMTI1ICksIG5ldyBWZWN0b3IyKCAxMjIwLCAxMDUwICkgXTtcclxuICAgIGNvbnN0IGxpZ2h0UGFydGljbGVQb3NpdGlvbnMgPSBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyNzgsIDQ3NSApLCBuZXcgVmVjdG9yMiggMTAwMCwgNjgwICksIG5ldyBWZWN0b3IyKCAxNDUwLCAyMTAgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBDcmVhdGUgcGFydGljbGUgaWNvbnNcclxuICAgIGNvbnN0IHBhcnRpY2xlTm9kZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGhlYXZ5UGFydGljbGVQb3NpdGlvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHBhcnRpY2xlTm9kZXMucHVzaCggR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LmNyZWF0ZUhlYXZ5UGFydGljbGVJY29uKCBTQ1JFRU5fSUNPTlNfVFJBTlNGT1JNLCB7XHJcbiAgICAgICAgY2VudGVyOiBoZWF2eVBhcnRpY2xlUG9zaXRpb25zWyBpIF1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaWdodFBhcnRpY2xlUG9zaXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBwYXJ0aWNsZU5vZGVzLnB1c2goIEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeS5jcmVhdGVMaWdodFBhcnRpY2xlSWNvbiggU0NSRUVOX0lDT05TX1RSQU5TRk9STSwge1xyXG4gICAgICAgIGNlbnRlcjogbGlnaHRQYXJ0aWNsZVBvc2l0aW9uc1sgaSBdXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnRpY2xlc1BhcmVudCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHNjYWxlOiAwLjQ1LFxyXG4gICAgICBjZW50ZXI6IGNvbnRhaW5lck5vZGUuY2VudGVyLFxyXG4gICAgICBjaGlsZHJlbjogcGFydGljbGVOb2Rlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGljb25Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgY29udGFpbmVyTm9kZSwgcGFydGljbGVzUGFyZW50IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNjcmVlbkljb24oIGljb25Ob2RlLCB7XHJcbiAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAwLjksXHJcbiAgICAgIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMuc2NyZWVuQmFja2dyb3VuZENvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIGEgaGVhdnkgcGFydGljbGUuXHJcbiAgICovXHJcbiAgY3JlYXRlSGVhdnlQYXJ0aWNsZUljb24oIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgb3B0aW9ucz86IFBhcnRpY2xlTm9kZU9wdGlvbnMgKTogTm9kZSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUGFydGljbGVJY29uKCBuZXcgSGVhdnlQYXJ0aWNsZSgpLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIGEgbGlnaHQgcGFydGljbGUuXHJcbiAgICovXHJcbiAgY3JlYXRlTGlnaHRQYXJ0aWNsZUljb24oIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgb3B0aW9ucz86IFBhcnRpY2xlTm9kZU9wdGlvbnMgKTogTm9kZSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUGFydGljbGVJY29uKCBuZXcgTGlnaHRQYXJ0aWNsZSgpLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIHBhcnRpY2xlIHR5cGUgMSBpbiB0aGUgRGlmZnVzaW9uIHNjcmVlbi5cclxuICAgKi9cclxuICBjcmVhdGVEaWZmdXNpb25QYXJ0aWNsZTFJY29uKCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIG9wdGlvbnM/OiBQYXJ0aWNsZU5vZGVPcHRpb25zICk6IE5vZGUge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBhcnRpY2xlSWNvbiggbmV3IERpZmZ1c2lvblBhcnRpY2xlMSgpLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIHBhcnRpY2xlIHR5cGUgMiBpbiB0aGUgRGlmZnVzaW9uIHNjcmVlbi5cclxuICAgKi9cclxuICBjcmVhdGVEaWZmdXNpb25QYXJ0aWNsZTJJY29uKCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIG9wdGlvbnM/OiBQYXJ0aWNsZU5vZGVPcHRpb25zICk6IE5vZGUge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBhcnRpY2xlSWNvbiggbmV3IERpZmZ1c2lvblBhcnRpY2xlMigpLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgc2ltcGxpZmllZCBpY29uIGZvciB0aGUgU3RvcHdhdGNoLlxyXG4gICAqL1xyXG4gIGNyZWF0ZVN0b3B3YXRjaEljb24oKTogTm9kZSB7XHJcbiAgICByZXR1cm4gY3JlYXRlVG9vbEljb24oIEdhc1Byb3BlcnRpZXNDb2xvcnMuc3RvcHdhdGNoQmFja2dyb3VuZENvbG9yUHJvcGVydHkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgc2ltcGxpZmllZCBpY29uIGZvciB0aGUgQ29sbGlzaW9uIENvdW50ZXIuXHJcbiAgICovXHJcbiAgY3JlYXRlQ29sbGlzaW9uQ291bnRlckljb24oKTogTm9kZSB7XHJcbiAgICByZXR1cm4gY3JlYXRlVG9vbEljb24oIEdhc1Byb3BlcnRpZXNDb2xvcnMuY29sbGlzaW9uQ291bnRlckJhY2tncm91bmRDb2xvclByb3BlcnR5ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiB0aGF0IHJlcHJlc2VudHMgdGhlIGhpc3RvZ3JhbSBmb3IgYSBzcGVjaWVzIG9mIHBhcnRpY2xlLlxyXG4gICAqL1xyXG4gIGNyZWF0ZVNwZWNpZXNIaXN0b2dyYW1JY29uKCBwYXJ0aWNsZTogUGFydGljbGUsIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiApOiBOb2RlIHtcclxuICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAzLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGNyZWF0ZVBhcnRpY2xlSWNvbiggcGFydGljbGUsIG1vZGVsVmlld1RyYW5zZm9ybSApLFxyXG4gICAgICAgIGNyZWF0ZUhpc3RvZ3JhbUljb24oIHBhcnRpY2xlLmNvbG9yUHJvcGVydHkgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiB1c2VkIG9uIHRoZSAnV2lkdGgnIGNoZWNrYm94LlxyXG4gICAqL1xyXG4gIGNyZWF0ZUNvbnRhaW5lcldpZHRoSWNvbigpOiBOb2RlIHtcclxuICAgIHJldHVybiBuZXcgRGltZW5zaW9uYWxBcnJvd3NOb2RlKCBuZXcgTnVtYmVyUHJvcGVydHkoIDQ0ICksIHtcclxuICAgICAgY29sb3I6IEdhc1Byb3BlcnRpZXNDb2xvcnMud2lkdGhJY29uQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGljb24gdXNlZCBvbiB0aGUgJ0NlbnRlciBvZiBNYXNzJyBjaGVja2JveC5cclxuICAgKi9cclxuICBjcmVhdGVDZW50ZXJPZk1hc3NJY29uKCk6IE5vZGUge1xyXG5cclxuICAgIGNvbnN0IHdpZHRoID0gNDtcclxuICAgIGNvbnN0IGhlaWdodCA9IDE1O1xyXG5cclxuICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAwLCB3aWR0aCwgaGVpZ2h0LCB7XHJcbiAgICAgICAgICBmaWxsOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLnBhcnRpY2xlMUNvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICBzdHJva2U6IEdhc1Byb3BlcnRpZXNDb2xvcnMuY2VudGVyT2ZNYXNzU3Ryb2tlUHJvcGVydHlcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgICAgZmlsbDogR2FzUHJvcGVydGllc0NvbG9ycy5wYXJ0aWNsZTJDb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgc3Ryb2tlOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLmNlbnRlck9mTWFzc1N0cm9rZVByb3BlcnR5XHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIHVzZWQgb24gdGhlICdQYXJ0aWNsZSBGbG93IFJhdGUnIGNoZWNrYm94LlxyXG4gICAqL1xyXG4gIGNyZWF0ZVBhcnRpY2xlRmxvd1JhdGVJY29uKCk6IE5vZGUge1xyXG5cclxuICAgIGNvbnN0IGFycm93T3B0aW9ucyA9IHtcclxuICAgICAgZmlsbDogR2FzUHJvcGVydGllc0NvbG9ycy5wYXJ0aWNsZTFDb2xvclByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGhlYWRIZWlnaHQ6IDEyLFxyXG4gICAgICBoZWFkV2lkdGg6IDEyLFxyXG4gICAgICB0YWlsV2lkdGg6IDZcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDMsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEFycm93Tm9kZSggMCwgMCwgLTE4LCAwLCBhcnJvd09wdGlvbnMgKSxcclxuICAgICAgICBuZXcgQXJyb3dOb2RlKCAwLCAwLCAyNCwgMCwgYXJyb3dPcHRpb25zIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGljb24gdXNlZCBvbiB0aGUgJ1NjYWxlJyBjaGVja2JveC5cclxuICAgKi9cclxuICBjcmVhdGVTY2FsZUljb24oKTogTm9kZSB7XHJcblxyXG4gICAgY29uc3Qgc2NhbGVMZW5ndGggPSAzMDtcclxuICAgIGNvbnN0IHRpY2tMZW5ndGggPSA2O1xyXG4gICAgY29uc3QgbnVtYmVyT2ZUaWNrcyA9IDU7XHJcbiAgICBjb25zdCB0aWNrSW50ZXJ2YWwgPSBzY2FsZUxlbmd0aCAvICggbnVtYmVyT2ZUaWNrcyAtIDEgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggc2NhbGVMZW5ndGgsIDAgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mVGlja3M7IGkrKyApIHtcclxuICAgICAgc2hhcGUubW92ZVRvKCBpICogdGlja0ludGVydmFsLCAwICkubGluZVRvKCBpICogdGlja0ludGVydmFsLCB0aWNrTGVuZ3RoICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQYXRoKCBzaGFwZSwge1xyXG4gICAgICBzdHJva2U6IEdhc1Byb3BlcnRpZXNDb2xvcnMuc2NhbGVDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgYSBwYXJ0aWNsZS5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVBhcnRpY2xlSWNvbiggcGFydGljbGU6IFBhcnRpY2xlLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz86IFBhcnRpY2xlTm9kZU9wdGlvbnMgKTogTm9kZSB7XHJcbiAgcmV0dXJuIG5ldyBQYXJ0aWNsZU5vZGUoIHBhcnRpY2xlLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzaW1wbGlmaWVkIGljb24gZm9yIGEgdG9vbCBsaWtlIHRoZSBzdG9wd2F0Y2ggb3IgY29sbGlzaW9uIGNvdW50ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVUb29sSWNvbiggY29sb3I6IFRDb2xvciApOiBOb2RlIHtcclxuXHJcbiAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBTaGFkZWRSZWN0YW5nbGUoIG5ldyBCb3VuZHMyKCAwLCAwLCAyNSwgMjAgKSwge1xyXG4gICAgYmFzZUNvbG9yOiBjb2xvcixcclxuICAgIGNvcm5lclJhZGl1czogNFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAuNzUgKiBiYWNrZ3JvdW5kLndpZHRoLCAwLjM1ICogYmFja2dyb3VuZC5oZWlnaHQsIHtcclxuICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgIGNvcm5lclJhZGl1czogMS41LFxyXG4gICAgY2VudGVyWDogYmFja2dyb3VuZC5jZW50ZXJYLFxyXG4gICAgdG9wOiBiYWNrZ3JvdW5kLnRvcCArIDAuMjUgKiBiYWNrZ3JvdW5kLmhlaWdodFxyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kLCBkaXNwbGF5IF1cclxuICB9ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGljb24gZm9yIGEgaGlzdG9ncmFtIHNoYXBlLCB1c2VkIGZvciB0aGUgY2hlY2tib3hlcyBvbiB0aGUgaGlzdG9ncmFtcy5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUhpc3RvZ3JhbUljb24oIHN0cm9rZTogVENvbG9yICk6IE5vZGUge1xyXG5cclxuICAvLyB1bml0IHNoYXBlXHJcbiAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggMCwgMSApXHJcbiAgICAubGluZVRvKCAwLCAwLjI1IClcclxuICAgIC5saW5lVG8oIDAuMjUsIDAuMjUgKVxyXG4gICAgLmxpbmVUbyggMC4yNSwgMCApXHJcbiAgICAubGluZVRvKCAwLjUsIDAgKVxyXG4gICAgLmxpbmVUbyggMC41LCAwLjUgKVxyXG4gICAgLmxpbmVUbyggMC43NSwgMC41IClcclxuICAgIC5saW5lVG8oIDAuNzUsIDAuNzUgKVxyXG4gICAgLmxpbmVUbyggMSwgMC43NSApXHJcbiAgICAubGluZVRvKCAxLCAxIClcclxuICAgIC50cmFuc2Zvcm1lZCggTWF0cml4My5zY2FsaW5nKCAxMiwgMTIgKSApO1xyXG5cclxuICByZXR1cm4gbmV3IFBhdGgoIHNoYXBlLCB7XHJcbiAgICBzdHJva2U6IHN0cm9rZSxcclxuICAgIGxpbmVXaWR0aDogMS41XHJcbiAgfSApO1xyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnR2FzUHJvcGVydGllc0ljb25GYWN0b3J5JywgR2FzUHJvcGVydGllc0ljb25GYWN0b3J5ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFN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