// Copyright 2014-2022, University of Colorado Boulder

/**
 * Provides the play area for a single GravityAndOrbitsScene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @see GravityAndOrbitsScene
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import platform from '../../../../phet-core/js/platform.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, Color, Rectangle } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsStrings from '../../GravityAndOrbitsStrings.js';
import GravityAndOrbitsColors from '../GravityAndOrbitsColors.js';
import BodyNode from './BodyNode.js';
import DraggableVectorNode from './DraggableVectorNode.js';
import ExplosionNode from './ExplosionNode.js';
import GridNode from '../../../../scenery-phet/js/GridNode.js';
import PathsCanvasNode from './PathsCanvasNode.js';
import TimeCounter from './TimeCounter.js';
import VectorNode from './VectorNode.js';
import ZoomControl from './ZoomControl.js';
// constants
const SCALE = 0.8; // these numbers come from trying to match the original MLL port of this sim
const WIDTH = 790 * (1 / SCALE);
const HEIGHT = 618 * (1 / SCALE);
const STAGE_SIZE = new Bounds2(0, 0, WIDTH, HEIGHT);
const buttonBackgroundColor = new Color(255, 250, 125);
class GravityAndOrbitsSceneView extends Rectangle {
  static STAGE_SIZE = STAGE_SIZE;
  static buttonBackgroundColor = buttonBackgroundColor;

  /**
   * Constructor for GravityAndOrbitsSceneView
   */
  constructor(scene, model, tandem) {
    const forceScale = scene.forceScale;

    // each orbit mode has its own play area with a CanvasNode for rendering paths
    // each canvas should be excluded from the DOM when invisible, with the exception of iOS Safari,
    // which performs worse in this case when toggling visibility
    const excludeInvisible = !platform.mobileSafari;
    super(0, 0, WIDTH, HEIGHT, {
      scale: SCALE,
      excludeInvisible: excludeInvisible
    });
    const bodies = scene.physicsEngine.getBodies();
    this.addChild(new PathsCanvasNode(bodies, scene.transformProperty, model.showPathProperty, STAGE_SIZE));
    const forceVectorColorFill = PhetColorScheme.GRAVITATIONAL_FORCE;
    const forceVectorColorOutline = new Color(64, 64, 64);
    const velocityVectorColorFill = PhetColorScheme.VELOCITY;
    const velocityVectorColorOutline = new Color(64, 64, 64);

    // Use canvas coordinates to determine whether something has left the visible area
    const isReturnableProperties = [];
    bodies.forEach(body => {
      const bodyNode = new BodyNode(body, body.labelAngle, model.isPlayingProperty, scene, tandem.createTandem(body.bodyNodeTandemName));
      const massReadoutNode = scene.massReadoutFactory(bodyNode, model.showMassProperty);
      this.addChild(bodyNode);
      bodyNode.addChild(massReadoutNode);
      const isReturnableProperty = new DerivedProperty([body.positionProperty, scene.zoomLevelProperty], position => {
        // the return objects button should be visible when a body is out of bounds and not at the rewind position
        const atRewindPosition = bodyNode.body.positionProperty.equalsRewindValue();
        return !STAGE_SIZE.intersectsBounds(bodyNode.bounds) && !atRewindPosition;
      });
      isReturnableProperties.push(isReturnableProperty);
    });

    // Add gravity force vector nodes
    for (let i = 0; i < bodies.length; i++) {
      const bodyNodeTandem = tandem.createTandem(bodies[i].bodyNodeTandemName);
      const gravityForceVectorNode = new VectorNode(bodies[i], scene.transformProperty, model.showGravityForceProperty, bodies[i].forceProperty, forceScale, forceVectorColorFill, forceVectorColorOutline, bodyNodeTandem.createTandem('gravityVectorNode'));
      this.addChild(gravityForceVectorNode);
    }

    // Add velocity vector nodes
    for (let i = 0; i < bodies.length; i++) {
      if (bodies[i].isMovableProperty.value) {
        const bodyNodeTandem = tandem.createTandem(bodies[i].bodyNodeTandemName);
        this.addChild(new DraggableVectorNode(bodies[i], scene.transformProperty, model.showVelocityProperty, bodies[i].velocityProperty, scene.velocityVectorScale, velocityVectorColorFill, velocityVectorColorOutline, GravityAndOrbitsStrings.vStringProperty, bodyNodeTandem.createTandem('velocityVectorNode'), {
          phetioInputEnabledPropertyInstrumented: true
        }));
      }
    }

    // Add explosion nodes, which are always in the scene graph but only visible during explosions
    for (let i = 0; i < bodies.length; i++) {
      this.addChild(new ExplosionNode(bodies[i], scene.transformProperty));
    }

    // Add the node for the overlay grid, setting its visibility based on the model.showGridProperty
    const gridNode = new GridNode(scene.transformProperty, scene.gridSpacing, scene.gridCenter, 28);
    model.showGridProperty.linkAttribute(gridNode, 'visible');
    this.addChild(gridNode);
    this.addChild(new AlignBox(new TimeCounter(scene.timeFormatter, scene.physicsEngine.clock, tandem.createTandem('timeCounter'), {
      scale: 1.2
    }), {
      alignBounds: STAGE_SIZE,
      rightMargin: 50,
      bottomMargin: 20,
      xAlign: 'right',
      yAlign: 'bottom'
    }));

    // Add measuring tape
    if (model.showMeasuringTape) {
      const unitsProperty = new DerivedProperty([GravityAndOrbitsStrings.kilometersStringProperty], kilometersString => {
        return {
          name: kilometersString,
          multiplier: 1 / 1000
        };
      });
      const measuringTapeTandem = tandem.createTandem('measuringTapeNode');
      const measuringTapeTextColorProperty = GravityAndOrbitsColors.foregroundProperty;
      const measuringTapeNode = new MeasuringTapeNode(unitsProperty, {
        visibleProperty: model.showMeasuringTapeProperty,
        basePositionProperty: scene.measuringTapeStartPointProperty,
        tipPositionProperty: scene.measuringTapeEndPointProperty,
        textBackgroundColor: GravityAndOrbitsColors.measuringTapeTextBackgroundColorProperty,
        textColor: measuringTapeTextColorProperty,
        // allows distances to be measured if the planets go outside of model bounds,
        // see https://github.com/phetsims/gravity-and-orbits/issues/281
        isTipDragBounded: false,
        significantFigures: 0,
        tandem: measuringTapeTandem,
        visiblePropertyOptions: {
          phetioReadOnly: true
        } // controlled by a checkbox
      });

      scene.transformProperty.link(transform => {
        measuringTapeNode.modelViewTransformProperty.value = transform;
      });
      scene.modelBoundsProperty.link(bounds => {
        const basePosition = measuringTapeNode.basePositionProperty.get();
        measuringTapeNode.setDragBounds(bounds);

        // if the position of the base has changed due to modifying the
        // drag bounds, we want to subtract the difference from the position
        // of the tip so that the measured value remains constant
        if (!measuringTapeNode.basePositionProperty.get().equals(basePosition)) {
          const difference = basePosition.minus(measuringTapeNode.basePositionProperty.get());
          measuringTapeNode.tipPositionProperty.set(measuringTapeNode.tipPositionProperty.get().minus(difference));
        }
      });
      this.addChild(measuringTapeNode);
    }
    if (phet.chipper.queryParameters.dev) {
      const draggableAreaNode = new Rectangle(0, 0, 0, 0, {
        stroke: 'blue',
        lineWidth: 4
      });
      this.addChild(draggableAreaNode);
      scene.modelBoundsProperty.link(bounds => {
        if (bounds) {
          draggableAreaNode.setRectBounds(scene.transformProperty.get().modelToViewBounds(bounds));
        }
      });
    }
    scene.modelBoundsProperty.link(bounds => {
      // Tell each of the bodies about the stage size (in model coordinates) so they know if they are out of bounds
      for (let i = 0; i < bodies.length; i++) {
        bodies[i].boundsProperty.set(scene.transformProperty.get().viewToModelBounds(STAGE_SIZE));
      }
    });

    // If any body is out of bounds, show a "return object" button
    const anythingReturnableProperty = DerivedProperty.or(isReturnableProperties);
    const returnObjectsButton = new TextPushButton(GravityAndOrbitsStrings.returnObjectsStringProperty, {
      font: new PhetFont(16),
      textFill: 'black',
      visiblePropertyOptions: {
        phetioReadOnly: true
      },
      enabledPropertyOptions: {
        phetioReadOnly: true
      },
      listener: () => {
        // the return button should behave exactly like the rewind button
        // all objects should be restored to their saved state, and then
        // pause the orbital mode
        scene.rewind();
        scene.isPlayingProperty.set(false);
      },
      tandem: tandem.createTandem('returnObjectsButton'),
      maxWidth: 225,
      x: 100,
      y: 100
    });
    this.addChild(returnObjectsButton);
    anythingReturnableProperty.linkAttribute(returnObjectsButton, 'visible');
    const scaleControl = new ZoomControl(scene.zoomLevelProperty, tandem.createTandem('zoomControl'), {
      top: STAGE_SIZE.top + 10
    });
    scaleControl.left = scaleControl.width / 2;
    this.addChild(scaleControl);
  }
}
gravityAndOrbits.register('GravityAndOrbitsSceneView', GravityAndOrbitsSceneView);
export default GravityAndOrbitsSceneView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwicGxhdGZvcm0iLCJNZWFzdXJpbmdUYXBlTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiQWxpZ25Cb3giLCJDb2xvciIsIlJlY3RhbmdsZSIsIlRleHRQdXNoQnV0dG9uIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIiwiR3Jhdml0eUFuZE9yYml0c0NvbG9ycyIsIkJvZHlOb2RlIiwiRHJhZ2dhYmxlVmVjdG9yTm9kZSIsIkV4cGxvc2lvbk5vZGUiLCJHcmlkTm9kZSIsIlBhdGhzQ2FudmFzTm9kZSIsIlRpbWVDb3VudGVyIiwiVmVjdG9yTm9kZSIsIlpvb21Db250cm9sIiwiU0NBTEUiLCJXSURUSCIsIkhFSUdIVCIsIlNUQUdFX1NJWkUiLCJidXR0b25CYWNrZ3JvdW5kQ29sb3IiLCJHcmF2aXR5QW5kT3JiaXRzU2NlbmVWaWV3IiwiY29uc3RydWN0b3IiLCJzY2VuZSIsIm1vZGVsIiwidGFuZGVtIiwiZm9yY2VTY2FsZSIsImV4Y2x1ZGVJbnZpc2libGUiLCJtb2JpbGVTYWZhcmkiLCJzY2FsZSIsImJvZGllcyIsInBoeXNpY3NFbmdpbmUiLCJnZXRCb2RpZXMiLCJhZGRDaGlsZCIsInRyYW5zZm9ybVByb3BlcnR5Iiwic2hvd1BhdGhQcm9wZXJ0eSIsImZvcmNlVmVjdG9yQ29sb3JGaWxsIiwiR1JBVklUQVRJT05BTF9GT1JDRSIsImZvcmNlVmVjdG9yQ29sb3JPdXRsaW5lIiwidmVsb2NpdHlWZWN0b3JDb2xvckZpbGwiLCJWRUxPQ0lUWSIsInZlbG9jaXR5VmVjdG9yQ29sb3JPdXRsaW5lIiwiaXNSZXR1cm5hYmxlUHJvcGVydGllcyIsImZvckVhY2giLCJib2R5IiwiYm9keU5vZGUiLCJsYWJlbEFuZ2xlIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJib2R5Tm9kZVRhbmRlbU5hbWUiLCJtYXNzUmVhZG91dE5vZGUiLCJtYXNzUmVhZG91dEZhY3RvcnkiLCJzaG93TWFzc1Byb3BlcnR5IiwiaXNSZXR1cm5hYmxlUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5Iiwiem9vbUxldmVsUHJvcGVydHkiLCJwb3NpdGlvbiIsImF0UmV3aW5kUG9zaXRpb24iLCJlcXVhbHNSZXdpbmRWYWx1ZSIsImludGVyc2VjdHNCb3VuZHMiLCJib3VuZHMiLCJwdXNoIiwiaSIsImxlbmd0aCIsImJvZHlOb2RlVGFuZGVtIiwiZ3Jhdml0eUZvcmNlVmVjdG9yTm9kZSIsInNob3dHcmF2aXR5Rm9yY2VQcm9wZXJ0eSIsImZvcmNlUHJvcGVydHkiLCJpc01vdmFibGVQcm9wZXJ0eSIsInZhbHVlIiwic2hvd1ZlbG9jaXR5UHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidmVsb2NpdHlWZWN0b3JTY2FsZSIsInZTdHJpbmdQcm9wZXJ0eSIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZ3JpZE5vZGUiLCJncmlkU3BhY2luZyIsImdyaWRDZW50ZXIiLCJzaG93R3JpZFByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsInRpbWVGb3JtYXR0ZXIiLCJjbG9jayIsImFsaWduQm91bmRzIiwicmlnaHRNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJ4QWxpZ24iLCJ5QWxpZ24iLCJzaG93TWVhc3VyaW5nVGFwZSIsInVuaXRzUHJvcGVydHkiLCJraWxvbWV0ZXJzU3RyaW5nUHJvcGVydHkiLCJraWxvbWV0ZXJzU3RyaW5nIiwibmFtZSIsIm11bHRpcGxpZXIiLCJtZWFzdXJpbmdUYXBlVGFuZGVtIiwibWVhc3VyaW5nVGFwZVRleHRDb2xvclByb3BlcnR5IiwiZm9yZWdyb3VuZFByb3BlcnR5IiwibWVhc3VyaW5nVGFwZU5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJzaG93TWVhc3VyaW5nVGFwZVByb3BlcnR5IiwiYmFzZVBvc2l0aW9uUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlU3RhcnRQb2ludFByb3BlcnR5IiwidGlwUG9zaXRpb25Qcm9wZXJ0eSIsIm1lYXN1cmluZ1RhcGVFbmRQb2ludFByb3BlcnR5IiwidGV4dEJhY2tncm91bmRDb2xvciIsIm1lYXN1cmluZ1RhcGVUZXh0QmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJ0ZXh0Q29sb3IiLCJpc1RpcERyYWdCb3VuZGVkIiwic2lnbmlmaWNhbnRGaWd1cmVzIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwibGluayIsInRyYW5zZm9ybSIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IiwibW9kZWxCb3VuZHNQcm9wZXJ0eSIsImJhc2VQb3NpdGlvbiIsImdldCIsInNldERyYWdCb3VuZHMiLCJlcXVhbHMiLCJkaWZmZXJlbmNlIiwibWludXMiLCJzZXQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRldiIsImRyYWdnYWJsZUFyZWFOb2RlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwic2V0UmVjdEJvdW5kcyIsIm1vZGVsVG9WaWV3Qm91bmRzIiwiYm91bmRzUHJvcGVydHkiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImFueXRoaW5nUmV0dXJuYWJsZVByb3BlcnR5Iiwib3IiLCJyZXR1cm5PYmplY3RzQnV0dG9uIiwicmV0dXJuT2JqZWN0c1N0cmluZ1Byb3BlcnR5IiwiZm9udCIsInRleHRGaWxsIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsImxpc3RlbmVyIiwicmV3aW5kIiwibWF4V2lkdGgiLCJ4IiwieSIsInNjYWxlQ29udHJvbCIsInRvcCIsImxlZnQiLCJ3aWR0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3Jhdml0eUFuZE9yYml0c1NjZW5lVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcm92aWRlcyB0aGUgcGxheSBhcmVhIGZvciBhIHNpbmdsZSBHcmF2aXR5QW5kT3JiaXRzU2NlbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBzZWUgR3Jhdml0eUFuZE9yYml0c1NjZW5lXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCBNZWFzdXJpbmdUYXBlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWVhc3VyaW5nVGFwZU5vZGUuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIENvbG9yLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUFuZE9yYml0cyBmcm9tICcuLi8uLi9ncmF2aXR5QW5kT3JiaXRzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNDb2xvcnMgZnJvbSAnLi4vR3Jhdml0eUFuZE9yYml0c0NvbG9ycy5qcyc7XHJcbmltcG9ydCBCb2R5Tm9kZSBmcm9tICcuL0JvZHlOb2RlLmpzJztcclxuaW1wb3J0IERyYWdnYWJsZVZlY3Rvck5vZGUgZnJvbSAnLi9EcmFnZ2FibGVWZWN0b3JOb2RlLmpzJztcclxuaW1wb3J0IEV4cGxvc2lvbk5vZGUgZnJvbSAnLi9FeHBsb3Npb25Ob2RlLmpzJztcclxuaW1wb3J0IEdyaWROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmlkTm9kZS5qcyc7XHJcbmltcG9ydCBQYXRoc0NhbnZhc05vZGUgZnJvbSAnLi9QYXRoc0NhbnZhc05vZGUuanMnO1xyXG5pbXBvcnQgVGltZUNvdW50ZXIgZnJvbSAnLi9UaW1lQ291bnRlci5qcyc7XHJcbmltcG9ydCBWZWN0b3JOb2RlIGZyb20gJy4vVmVjdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBab29tQ29udHJvbCBmcm9tICcuL1pvb21Db250cm9sLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNTY2VuZSBmcm9tICcuLi9HcmF2aXR5QW5kT3JiaXRzU2NlbmUuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c01vZGVsIGZyb20gJy4uL21vZGVsL0dyYXZpdHlBbmRPcmJpdHNNb2RlbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTQ0FMRSA9IDAuODsgLy8gdGhlc2UgbnVtYmVycyBjb21lIGZyb20gdHJ5aW5nIHRvIG1hdGNoIHRoZSBvcmlnaW5hbCBNTEwgcG9ydCBvZiB0aGlzIHNpbVxyXG5jb25zdCBXSURUSCA9IDc5MCAqICggMSAvIFNDQUxFICk7XHJcbmNvbnN0IEhFSUdIVCA9IDYxOCAqICggMSAvIFNDQUxFICk7XHJcbmNvbnN0IFNUQUdFX1NJWkUgPSBuZXcgQm91bmRzMiggMCwgMCwgV0lEVEgsIEhFSUdIVCApO1xyXG5jb25zdCBidXR0b25CYWNrZ3JvdW5kQ29sb3IgPSBuZXcgQ29sb3IoIDI1NSwgMjUwLCAxMjUgKTtcclxuXHJcbmNsYXNzIEdyYXZpdHlBbmRPcmJpdHNTY2VuZVZpZXcgZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RBR0VfU0laRSA9IFNUQUdFX1NJWkU7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBidXR0b25CYWNrZ3JvdW5kQ29sb3IgPSBidXR0b25CYWNrZ3JvdW5kQ29sb3I7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciBHcmF2aXR5QW5kT3JiaXRzU2NlbmVWaWV3XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY2VuZTogR3Jhdml0eUFuZE9yYml0c1NjZW5lLCBtb2RlbDogR3Jhdml0eUFuZE9yYml0c01vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIGNvbnN0IGZvcmNlU2NhbGUgPSBzY2VuZS5mb3JjZVNjYWxlO1xyXG5cclxuICAgIC8vIGVhY2ggb3JiaXQgbW9kZSBoYXMgaXRzIG93biBwbGF5IGFyZWEgd2l0aCBhIENhbnZhc05vZGUgZm9yIHJlbmRlcmluZyBwYXRoc1xyXG4gICAgLy8gZWFjaCBjYW52YXMgc2hvdWxkIGJlIGV4Y2x1ZGVkIGZyb20gdGhlIERPTSB3aGVuIGludmlzaWJsZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIGlPUyBTYWZhcmksXHJcbiAgICAvLyB3aGljaCBwZXJmb3JtcyB3b3JzZSBpbiB0aGlzIGNhc2Ugd2hlbiB0b2dnbGluZyB2aXNpYmlsaXR5XHJcbiAgICBjb25zdCBleGNsdWRlSW52aXNpYmxlID0gIXBsYXRmb3JtLm1vYmlsZVNhZmFyaTtcclxuXHJcbiAgICBzdXBlciggMCwgMCwgV0lEVEgsIEhFSUdIVCwgeyBzY2FsZTogU0NBTEUsIGV4Y2x1ZGVJbnZpc2libGU6IGV4Y2x1ZGVJbnZpc2libGUgfSApO1xyXG5cclxuICAgIGNvbnN0IGJvZGllcyA9IHNjZW5lLnBoeXNpY3NFbmdpbmUuZ2V0Qm9kaWVzKCk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhdGhzQ2FudmFzTm9kZSggYm9kaWVzLCBzY2VuZS50cmFuc2Zvcm1Qcm9wZXJ0eSwgbW9kZWwuc2hvd1BhdGhQcm9wZXJ0eSwgU1RBR0VfU0laRSApICk7XHJcblxyXG4gICAgY29uc3QgZm9yY2VWZWN0b3JDb2xvckZpbGwgPSBQaGV0Q29sb3JTY2hlbWUuR1JBVklUQVRJT05BTF9GT1JDRTtcclxuICAgIGNvbnN0IGZvcmNlVmVjdG9yQ29sb3JPdXRsaW5lID0gbmV3IENvbG9yKCA2NCwgNjQsIDY0ICk7XHJcbiAgICBjb25zdCB2ZWxvY2l0eVZlY3RvckNvbG9yRmlsbCA9IFBoZXRDb2xvclNjaGVtZS5WRUxPQ0lUWTtcclxuICAgIGNvbnN0IHZlbG9jaXR5VmVjdG9yQ29sb3JPdXRsaW5lID0gbmV3IENvbG9yKCA2NCwgNjQsIDY0ICk7XHJcblxyXG4gICAgLy8gVXNlIGNhbnZhcyBjb29yZGluYXRlcyB0byBkZXRlcm1pbmUgd2hldGhlciBzb21ldGhpbmcgaGFzIGxlZnQgdGhlIHZpc2libGUgYXJlYVxyXG4gICAgY29uc3QgaXNSZXR1cm5hYmxlUHJvcGVydGllczogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj5bXSA9IFtdO1xyXG4gICAgYm9kaWVzLmZvckVhY2goIGJvZHkgPT4ge1xyXG4gICAgICBjb25zdCBib2R5Tm9kZSA9IG5ldyBCb2R5Tm9kZSggYm9keSwgYm9keS5sYWJlbEFuZ2xlLCBtb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSwgc2NlbmUsIHRhbmRlbS5jcmVhdGVUYW5kZW0oIGJvZHkuYm9keU5vZGVUYW5kZW1OYW1lICkgKTtcclxuICAgICAgY29uc3QgbWFzc1JlYWRvdXROb2RlID0gc2NlbmUubWFzc1JlYWRvdXRGYWN0b3J5KCBib2R5Tm9kZSwgbW9kZWwuc2hvd01hc3NQcm9wZXJ0eSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBib2R5Tm9kZSApO1xyXG4gICAgICBib2R5Tm9kZS5hZGRDaGlsZCggbWFzc1JlYWRvdXROb2RlICk7XHJcblxyXG4gICAgICBjb25zdCBpc1JldHVybmFibGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgYm9keS5wb3NpdGlvblByb3BlcnR5LCBzY2VuZS56b29tTGV2ZWxQcm9wZXJ0eSBdLCBwb3NpdGlvbiA9PiB7XHJcblxyXG4gICAgICAgIC8vIHRoZSByZXR1cm4gb2JqZWN0cyBidXR0b24gc2hvdWxkIGJlIHZpc2libGUgd2hlbiBhIGJvZHkgaXMgb3V0IG9mIGJvdW5kcyBhbmQgbm90IGF0IHRoZSByZXdpbmQgcG9zaXRpb25cclxuICAgICAgICBjb25zdCBhdFJld2luZFBvc2l0aW9uID0gYm9keU5vZGUuYm9keS5wb3NpdGlvblByb3BlcnR5LmVxdWFsc1Jld2luZFZhbHVlKCk7XHJcbiAgICAgICAgcmV0dXJuICFTVEFHRV9TSVpFLmludGVyc2VjdHNCb3VuZHMoIGJvZHlOb2RlLmJvdW5kcyApICYmICFhdFJld2luZFBvc2l0aW9uO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGlzUmV0dXJuYWJsZVByb3BlcnRpZXMucHVzaCggaXNSZXR1cm5hYmxlUHJvcGVydHkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgZ3Jhdml0eSBmb3JjZSB2ZWN0b3Igbm9kZXNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IGJvZHlOb2RlVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggYm9kaWVzWyBpIF0uYm9keU5vZGVUYW5kZW1OYW1lICk7XHJcbiAgICAgIGNvbnN0IGdyYXZpdHlGb3JjZVZlY3Rvck5vZGUgPSBuZXcgVmVjdG9yTm9kZSggYm9kaWVzWyBpIF0sIHNjZW5lLnRyYW5zZm9ybVByb3BlcnR5LCBtb2RlbC5zaG93R3Jhdml0eUZvcmNlUHJvcGVydHksXHJcbiAgICAgICAgYm9kaWVzWyBpIF0uZm9yY2VQcm9wZXJ0eSwgZm9yY2VTY2FsZSwgZm9yY2VWZWN0b3JDb2xvckZpbGwsIGZvcmNlVmVjdG9yQ29sb3JPdXRsaW5lLCBib2R5Tm9kZVRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmF2aXR5VmVjdG9yTm9kZScgKSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBncmF2aXR5Rm9yY2VWZWN0b3JOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHZlbG9jaXR5IHZlY3RvciBub2Rlc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGJvZGllc1sgaSBdLmlzTW92YWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGNvbnN0IGJvZHlOb2RlVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggYm9kaWVzWyBpIF0uYm9keU5vZGVUYW5kZW1OYW1lICk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IERyYWdnYWJsZVZlY3Rvck5vZGUoIGJvZGllc1sgaSBdLCBzY2VuZS50cmFuc2Zvcm1Qcm9wZXJ0eSwgbW9kZWwuc2hvd1ZlbG9jaXR5UHJvcGVydHksXHJcbiAgICAgICAgICBib2RpZXNbIGkgXS52ZWxvY2l0eVByb3BlcnR5LCBzY2VuZS52ZWxvY2l0eVZlY3RvclNjYWxlLCB2ZWxvY2l0eVZlY3RvckNvbG9yRmlsbCwgdmVsb2NpdHlWZWN0b3JDb2xvck91dGxpbmUsXHJcbiAgICAgICAgICBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy52U3RyaW5nUHJvcGVydHksIGJvZHlOb2RlVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5VmVjdG9yTm9kZScgKSwge1xyXG4gICAgICAgICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxyXG4gICAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgZXhwbG9zaW9uIG5vZGVzLCB3aGljaCBhcmUgYWx3YXlzIGluIHRoZSBzY2VuZSBncmFwaCBidXQgb25seSB2aXNpYmxlIGR1cmluZyBleHBsb3Npb25zXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBFeHBsb3Npb25Ob2RlKCBib2RpZXNbIGkgXSwgc2NlbmUudHJhbnNmb3JtUHJvcGVydHkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZSBmb3IgdGhlIG92ZXJsYXkgZ3JpZCwgc2V0dGluZyBpdHMgdmlzaWJpbGl0eSBiYXNlZCBvbiB0aGUgbW9kZWwuc2hvd0dyaWRQcm9wZXJ0eVxyXG4gICAgY29uc3QgZ3JpZE5vZGUgPSBuZXcgR3JpZE5vZGUoIHNjZW5lLnRyYW5zZm9ybVByb3BlcnR5LCBzY2VuZS5ncmlkU3BhY2luZywgc2NlbmUuZ3JpZENlbnRlciwgMjggKTtcclxuICAgIG1vZGVsLnNob3dHcmlkUHJvcGVydHkubGlua0F0dHJpYnV0ZSggZ3JpZE5vZGUsICd2aXNpYmxlJyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ3JpZE5vZGUgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQWxpZ25Cb3goIG5ldyBUaW1lQ291bnRlciggc2NlbmUudGltZUZvcm1hdHRlciwgc2NlbmUucGh5c2ljc0VuZ2luZS5jbG9jaywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVDb3VudGVyJyApLCB7XHJcbiAgICAgIHNjYWxlOiAxLjJcclxuICAgIH0gKSwge1xyXG4gICAgICBhbGlnbkJvdW5kczogU1RBR0VfU0laRSxcclxuICAgICAgcmlnaHRNYXJnaW46IDUwLFxyXG4gICAgICBib3R0b21NYXJnaW46IDIwLFxyXG4gICAgICB4QWxpZ246ICdyaWdodCcsXHJcbiAgICAgIHlBbGlnbjogJ2JvdHRvbSdcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEFkZCBtZWFzdXJpbmcgdGFwZVxyXG4gICAgaWYgKCBtb2RlbC5zaG93TWVhc3VyaW5nVGFwZSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHVuaXRzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLmtpbG9tZXRlcnNTdHJpbmdQcm9wZXJ0eSBdLCBraWxvbWV0ZXJzU3RyaW5nID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZToga2lsb21ldGVyc1N0cmluZyxcclxuICAgICAgICAgIG11bHRpcGxpZXI6IDEgLyAxMDAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBtZWFzdXJpbmdUYXBlVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21lYXN1cmluZ1RhcGVOb2RlJyApO1xyXG4gICAgICBjb25zdCBtZWFzdXJpbmdUYXBlVGV4dENvbG9yUHJvcGVydHkgPSBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eTtcclxuXHJcbiAgICAgIGNvbnN0IG1lYXN1cmluZ1RhcGVOb2RlID0gbmV3IE1lYXN1cmluZ1RhcGVOb2RlKCB1bml0c1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5zaG93TWVhc3VyaW5nVGFwZVByb3BlcnR5LFxyXG4gICAgICAgIGJhc2VQb3NpdGlvblByb3BlcnR5OiBzY2VuZS5tZWFzdXJpbmdUYXBlU3RhcnRQb2ludFByb3BlcnR5LFxyXG4gICAgICAgIHRpcFBvc2l0aW9uUHJvcGVydHk6IHNjZW5lLm1lYXN1cmluZ1RhcGVFbmRQb2ludFByb3BlcnR5LFxyXG4gICAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6IEdyYXZpdHlBbmRPcmJpdHNDb2xvcnMubWVhc3VyaW5nVGFwZVRleHRCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICB0ZXh0Q29sb3I6IG1lYXN1cmluZ1RhcGVUZXh0Q29sb3JQcm9wZXJ0eSxcclxuXHJcbiAgICAgICAgLy8gYWxsb3dzIGRpc3RhbmNlcyB0byBiZSBtZWFzdXJlZCBpZiB0aGUgcGxhbmV0cyBnbyBvdXRzaWRlIG9mIG1vZGVsIGJvdW5kcyxcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktYW5kLW9yYml0cy9pc3N1ZXMvMjgxXHJcbiAgICAgICAgaXNUaXBEcmFnQm91bmRlZDogZmFsc2UsXHJcblxyXG4gICAgICAgIHNpZ25pZmljYW50RmlndXJlczogMCxcclxuXHJcbiAgICAgICAgdGFuZGVtOiBtZWFzdXJpbmdUYXBlVGFuZGVtLFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfSAvLyBjb250cm9sbGVkIGJ5IGEgY2hlY2tib3hcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2NlbmUudHJhbnNmb3JtUHJvcGVydHkubGluayggdHJhbnNmb3JtID0+IHtcclxuICAgICAgICBtZWFzdXJpbmdUYXBlTm9kZS5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZSA9IHRyYW5zZm9ybTtcclxuICAgICAgfSApO1xyXG4gICAgICBzY2VuZS5tb2RlbEJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFzZVBvc2l0aW9uID0gbWVhc3VyaW5nVGFwZU5vZGUuYmFzZVBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgbWVhc3VyaW5nVGFwZU5vZGUuc2V0RHJhZ0JvdW5kcyggYm91bmRzISApO1xyXG5cclxuICAgICAgICAvLyBpZiB0aGUgcG9zaXRpb24gb2YgdGhlIGJhc2UgaGFzIGNoYW5nZWQgZHVlIHRvIG1vZGlmeWluZyB0aGVcclxuICAgICAgICAvLyBkcmFnIGJvdW5kcywgd2Ugd2FudCB0byBzdWJ0cmFjdCB0aGUgZGlmZmVyZW5jZSBmcm9tIHRoZSBwb3NpdGlvblxyXG4gICAgICAgIC8vIG9mIHRoZSB0aXAgc28gdGhhdCB0aGUgbWVhc3VyZWQgdmFsdWUgcmVtYWlucyBjb25zdGFudFxyXG4gICAgICAgIGlmICggIW1lYXN1cmluZ1RhcGVOb2RlLmJhc2VQb3NpdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggYmFzZVBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gYmFzZVBvc2l0aW9uLm1pbnVzKCBtZWFzdXJpbmdUYXBlTm9kZS5iYXNlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgICAgbWVhc3VyaW5nVGFwZU5vZGUudGlwUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG1lYXN1cmluZ1RhcGVOb2RlLnRpcFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkubWludXMoIGRpZmZlcmVuY2UgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggbWVhc3VyaW5nVGFwZU5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ICkge1xyXG4gICAgICBjb25zdCBkcmFnZ2FibGVBcmVhTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAsIDAsIHsgc3Ryb2tlOiAnYmx1ZScsIGxpbmVXaWR0aDogNCB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGRyYWdnYWJsZUFyZWFOb2RlICk7XHJcblxyXG4gICAgICBzY2VuZS5tb2RlbEJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgICAgaWYgKCBib3VuZHMgKSB7XHJcbiAgICAgICAgICBkcmFnZ2FibGVBcmVhTm9kZS5zZXRSZWN0Qm91bmRzKCBzY2VuZS50cmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS5tb2RlbFRvVmlld0JvdW5kcyggYm91bmRzICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZS5tb2RlbEJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcblxyXG4gICAgICAvLyBUZWxsIGVhY2ggb2YgdGhlIGJvZGllcyBhYm91dCB0aGUgc3RhZ2Ugc2l6ZSAoaW4gbW9kZWwgY29vcmRpbmF0ZXMpIHNvIHRoZXkga25vdyBpZiB0aGV5IGFyZSBvdXQgb2YgYm91bmRzXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBib2RpZXNbIGkgXS5ib3VuZHNQcm9wZXJ0eS5zZXQoIHNjZW5lLnRyYW5zZm9ybVByb3BlcnR5LmdldCgpLnZpZXdUb01vZGVsQm91bmRzKCBTVEFHRV9TSVpFICkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIGFueSBib2R5IGlzIG91dCBvZiBib3VuZHMsIHNob3cgYSBcInJldHVybiBvYmplY3RcIiBidXR0b25cclxuICAgIGNvbnN0IGFueXRoaW5nUmV0dXJuYWJsZVByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5Lm9yKCBpc1JldHVybmFibGVQcm9wZXJ0aWVzICk7XHJcblxyXG4gICAgY29uc3QgcmV0dXJuT2JqZWN0c0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MucmV0dXJuT2JqZWN0c1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgdGV4dEZpbGw6ICdibGFjaycsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyB0aGUgcmV0dXJuIGJ1dHRvbiBzaG91bGQgYmVoYXZlIGV4YWN0bHkgbGlrZSB0aGUgcmV3aW5kIGJ1dHRvblxyXG4gICAgICAgIC8vIGFsbCBvYmplY3RzIHNob3VsZCBiZSByZXN0b3JlZCB0byB0aGVpciBzYXZlZCBzdGF0ZSwgYW5kIHRoZW5cclxuICAgICAgICAvLyBwYXVzZSB0aGUgb3JiaXRhbCBtb2RlXHJcbiAgICAgICAgc2NlbmUucmV3aW5kKCk7XHJcbiAgICAgICAgc2NlbmUuaXNQbGF5aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXR1cm5PYmplY3RzQnV0dG9uJyApLFxyXG4gICAgICBtYXhXaWR0aDogMjI1LFxyXG4gICAgICB4OiAxMDAsXHJcbiAgICAgIHk6IDEwMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmV0dXJuT2JqZWN0c0J1dHRvbiApO1xyXG5cclxuICAgIGFueXRoaW5nUmV0dXJuYWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHJldHVybk9iamVjdHNCdXR0b24sICd2aXNpYmxlJyApO1xyXG5cclxuICAgIGNvbnN0IHNjYWxlQ29udHJvbCA9IG5ldyBab29tQ29udHJvbCggc2NlbmUuem9vbUxldmVsUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd6b29tQ29udHJvbCcgKSwge1xyXG4gICAgICB0b3A6IFNUQUdFX1NJWkUudG9wICsgMTBcclxuICAgIH0gKTtcclxuICAgIHNjYWxlQ29udHJvbC5sZWZ0ID0gc2NhbGVDb250cm9sLndpZHRoIC8gMjtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNjYWxlQ29udHJvbCApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ0dyYXZpdHlBbmRPcmJpdHNTY2VuZVZpZXcnLCBHcmF2aXR5QW5kT3JiaXRzU2NlbmVWaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdyYXZpdHlBbmRPcmJpdHNTY2VuZVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLFFBQVEsRUFBRUMsS0FBSyxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQzlFLE9BQU9DLGNBQWMsTUFBTSw4Q0FBOEM7QUFDekUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBTTFDO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLE1BQU1DLEtBQUssR0FBRyxHQUFHLElBQUssQ0FBQyxHQUFHRCxLQUFLLENBQUU7QUFDakMsTUFBTUUsTUFBTSxHQUFHLEdBQUcsSUFBSyxDQUFDLEdBQUdGLEtBQUssQ0FBRTtBQUNsQyxNQUFNRyxVQUFVLEdBQUcsSUFBSXZCLE9BQU8sQ0FBRSxD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