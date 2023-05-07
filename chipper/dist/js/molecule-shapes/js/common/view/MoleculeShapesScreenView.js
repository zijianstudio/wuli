// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base view for all "show a single molecule in the center" screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Plane3 from '../../../../dot/js/Plane3.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Sphere3 from '../../../../dot/js/Sphere3.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ContextLossFailureDialog from '../../../../scenery-phet/js/ContextLossFailureDialog.js';
import { AlignBox, animatedPanZoomSingleton, DOM, Mouse, Rectangle } from '../../../../scenery/js/imports.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
import LabelWebGLView from './3d/LabelWebGLView.js';
import GeometryNamePanel from './GeometryNamePanel.js';
import LabelFallbackNode from './LabelFallbackNode.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';
class MoleculeShapesScreenView extends ScreenView {
  /**
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @public {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });
    const self = this;
    this.model = model; // @private {ModelMoleculesModel}

    // our target for drags that don't hit other UI components
    this.backgroundEventTarget = Rectangle.bounds(this.layoutBounds, {}); // @private
    this.addChild(this.backgroundEventTarget);

    // updated in layout
    this.activeScale = 1; // @private scale applied to interaction that isn't directly tied to screen coordinates (rotation)
    this.screenWidth = null; // @public
    this.screenHeight = null; // @public

    // main three.js Scene setup
    this.threeScene = new THREE.Scene(); // @private

    this.threeCamera = new THREE.PerspectiveCamera(); // @private will set the projection parameters on layout
    this.threeCamera.near = 1;
    this.threeCamera.far = 100;

    // @public {THREE.Renderer}
    this.threeRenderer = MoleculeShapesGlobals.useWebGLProperty.value ? new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: phet.chipper.queryParameters.preserveDrawingBuffer
    }) : new THREE.CanvasRenderer({
      devicePixelRatio: 1 // hopefully helps performance a bit
    });

    this.threeRenderer.setPixelRatio(window.devicePixelRatio || 1);

    // @private {ContextLossFailureDialog|null} - dialog shown on context loss, constructed
    // lazily because Dialog requires sim bounds during construction
    this.contextLossDialog = null;

    // In the event of a context loss, we'll just show a dialog. See https://github.com/phetsims/molecule-shapes/issues/100
    if (MoleculeShapesGlobals.useWebGLProperty.value) {
      this.threeRenderer.context.canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        this.showContextLossDialog();
        if (document.domain === 'phet.colorado.edu') {
          window._gaq && window._gaq.push(['_trackEvent', 'WebGL Context Loss', `molecule-shapes ${phet.joist.sim.version}`, document.URL]);
        }
      });
    }
    MoleculeShapesColors.backgroundProperty.link(color => {
      this.threeRenderer.setClearColor(color.toNumber(), 1);
    });
    MoleculeShapesScreenView.addLightsToScene(this.threeScene);
    this.threeCamera.position.copy(MoleculeShapesScreenView.cameraPosition); // sets the camera's position

    // @private add the Canvas in with a DOM node that prevents Scenery from applying transformations on it
    this.moleculeNode = new DOM(this.threeRenderer.domElement, {
      preventTransform: true,
      // Scenery 0.2 override for transformation
      pickable: false,
      tandem: tandem.createTandem('moleculeNode')
    });
    // don't do bounds detection, it's too expensive. We're not pickable anyways
    this.moleculeNode.invalidateDOM = () => this.moleculeNode.invalidateSelf(new Bounds2(0, 0, 0, 0));
    this.moleculeNode.invalidateDOM();
    this.moleculeNode.invalidateDOM();

    // support Scenery/Joist 0.2 screenshot (takes extra work to output)
    this.moleculeNode.renderToCanvasSelf = (wrapper, matrix) => {
      let canvas = null;

      // Extract out the backing scale based on our trail
      // Guaranteed to be affine, 1:1 aspect ratio and axis-aligned
      const backingScale = matrix.timesMatrix(this.getUniqueTrail().getMatrix().inverted()).m00();
      const effectiveWidth = Math.ceil(backingScale * this.screenWidth);
      const effectiveHeight = Math.ceil(backingScale * this.screenHeight);

      // This WebGL workaround is so we can avoid the preserveDrawingBuffer setting that would impact performance.
      // We render to a framebuffer and extract the pixel data directly, since we can't create another renderer and
      // share the view (three.js constraint).
      if (MoleculeShapesGlobals.useWebGLProperty.value) {
        // set up a framebuffer (target is three.js terminology) to render into
        const target = new THREE.WebGLRenderTarget(effectiveWidth, effectiveHeight, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat
        });
        // render our screen content into the framebuffer
        this.render(target);

        // set up a buffer for pixel data, in the exact typed formats we will need
        const buffer = new window.ArrayBuffer(effectiveWidth * effectiveHeight * 4);
        const imageDataBuffer = new window.Uint8ClampedArray(buffer);
        const pixels = new window.Uint8Array(buffer);

        // read the pixel data into the buffer
        const gl = this.threeRenderer.getContext();
        gl.readPixels(0, 0, effectiveWidth, effectiveHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // create a Canvas with the correct size, and fill it with the pixel data
        canvas = document.createElement('canvas');
        canvas.width = effectiveWidth;
        canvas.height = effectiveHeight;
        const tmpContext = canvas.getContext('2d');
        const imageData = tmpContext.createImageData(effectiveWidth, effectiveHeight);
        imageData.data.set(imageDataBuffer);
        tmpContext.putImageData(imageData, 0, 0);
      } else {
        // If just falling back to Canvas, we can directly render out!
        canvas = this.threeRenderer.domElement;
      }
      const context = wrapper.context;
      context.save();

      // Take the pixel ratio into account, see https://github.com/phetsims/molecule-shapes/issues/149
      const inverse = 1 / (window.devicePixelRatio || 1);
      if (MoleculeShapesGlobals.useWebGLProperty.value) {
        context.setTransform(1, 0, 0, -1, 0, effectiveHeight); // no need to take pixel scaling into account
      } else {
        context.setTransform(inverse, 0, 0, inverse, 0, 0);
      }
      context.drawImage(canvas, 0, 0);
      context.restore();
    };
    this.addChild(this.moleculeNode);

    // overlay Scene for bond-angle labels (if WebGL)
    this.overlayScene = new THREE.Scene(); // @private
    this.overlayCamera = new THREE.OrthographicCamera(); // @private
    this.overlayCamera.position.z = 50; // @private

    this.addChild(new ResetAllButton({
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      listener: () => {
        model.reset();
      },
      tandem: tandem.createTandem('resetAllButton')
    }));
    this.addChild(new AlignBox(new GeometryNamePanel(model, tandem.createTandem('namePanel')), {
      alignBounds: this.layoutBounds,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: 10
    }));

    // we only want to support dragging particles OR rotating the molecule (not both) at the same time
    let draggedParticleCount = 0;
    let isRotating = false;
    const multiDragListener = {
      down: function (event, trail) {
        if (!event.canStartPress()) {
          return;
        }

        // if we are already rotating the entire molecule, no more drags can be handled
        if (isRotating) {
          return;
        }
        let dragMode = null;
        let draggedParticle = null;
        const pointer = event.pointer;
        const pair = self.getElectronPairUnderPointer(pointer, !(pointer instanceof Mouse));
        if (pair && !pair.userControlledProperty.value) {
          // we start dragging that pair group with this pointer, moving it along the sphere where it can exist
          dragMode = 'pairExistingSpherical';
          draggedParticle = pair;
          pair.userControlledProperty.value = true;
          draggedParticleCount++;
        }

        // We don't want to rotate while we are dragging any particles
        // Additionally, don't rotate if we're zoomed into the sim - the pan/zoom listener will interrupt the rotation
        // to start a pan, but not until there is a little bit of pointer movement. If we are zoomed in at all
        // we don't want to allow movement that will soon just get interrupted.
        else if (draggedParticleCount === 0 && animatedPanZoomSingleton.listener.matrixProperty.value.equalsEpsilon(Matrix3.IDENTITY, 1e-7)) {
          // we rotate the entire molecule with this pointer
          dragMode = 'modelRotate';
          isRotating = true;
        } else {
          // can't drag the pair OR rotate the molecule
          return;
        }
        const lastGlobalPoint = pointer.point.copy();

        // If a drag starts on a pair group, input should only be for dragging. Indicate to other listeners that
        // behavior is reserved (specifically the pan/zoom listener that should not interrupt for pan).
        if (dragMode === 'pairExistingSpherical') {
          pointer.reserveForDrag();
        }
        const onEndDrag = function (event, trail) {
          if (dragMode === 'pairExistingSpherical') {
            draggedParticle.userControlledProperty.value = false;
            draggedParticleCount--;
          } else if (dragMode === 'modelRotate') {
            isRotating = false;
          }
          pointer.removeInputListener(this);
          pointer.cursor = null;
        };
        pointer.cursor = 'pointer';
        pointer.addInputListener({
          // end drag on either up or cancel (not supporting full cancel behavior)
          up: function (event, trail) {
            this.endDrag(event, trail);
          },
          cancel: function (event, trail) {
            this.endDrag(event, trail);
          },
          move: function (event, trail) {
            if (dragMode === 'modelRotate') {
              const delta = pointer.point.minus(lastGlobalPoint);
              lastGlobalPoint.set(pointer.point);
              const scale = 0.007 / self.activeScale; // tuned constant for acceptable drag motion
              const newQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(delta.y * scale, delta.x * scale, 0));
              newQuaternion.multiply(model.moleculeQuaternionProperty.value);
              model.moleculeQuaternionProperty.value = newQuaternion;
            } else if (dragMode === 'pairExistingSpherical') {
              if (_.includes(model.moleculeProperty.value.groups, draggedParticle)) {
                draggedParticle.dragToPosition(self.getSphericalMoleculePosition(pointer.point, draggedParticle));
              }
            }
          },
          // not a Scenery event
          endDrag: onEndDrag,
          interrupt: onEndDrag
        }, true); // attach the listener so that it can be interrupted from pan and zoom operations
      }
    };

    this.backgroundEventTarget.addInputListener(multiDragListener);

    // Consider updating the cursor even if we don't move? (only if we have mouse movement)? Current development
    // decision is to ignore this edge case in favor of performance.
    this.backgroundEventTarget.addInputListener({
      mousemove: event => {
        this.backgroundEventTarget.cursor = this.getElectronPairUnderPointer(event.pointer, false) ? 'pointer' : null;
      }
    });

    // update the molecule view's rotation when the model's rotation changes
    model.moleculeQuaternionProperty.link(quaternion => {
      // moleculeView is created in the subtype (not yet). will handle initial rotation in addMoleculeView
      if (this.moleculeView) {
        this.moleculeView.quaternion.copy(quaternion);
        this.moleculeView.updateMatrix();
        this.moleculeView.updateMatrixWorld();
      }
    });

    // @private - create a pool of angle labels of the desired type
    this.angleLabels = [];
    for (let i = 0; i < 15; i++) {
      if (MoleculeShapesGlobals.useWebGLProperty.value) {
        const label = new LabelWebGLView(this.threeRenderer);
        this.angleLabels.push(label);
        this.overlayScene.add(label);
      } else {
        const label = new LabelFallbackNode();
        this.angleLabels.push(label);
        this.addChild(label);
      }
    }
    this.layoutListener = () => {
      const screenWidth = this.screenWidth;
      const screenHeight = this.screenHeight;
      const simDimensions = phet.joist.sim.dimensionProperty.value;
      if (screenWidth && screenHeight) {
        assert && assert(screenWidth === simDimensions.width);
        assert && assert(screenHeight === simDimensions.height);
        const cameraBounds = this.localToGlobalBounds(new Bounds2(0, 0, this.layoutBounds.width, this.layoutBounds.height));

        // PLEASE SEE ThreeStage.adjustViewOffset for documentation of all of this (not repeated here)
        const halfHeight = this.threeCamera.near * Math.tan(Math.PI / 360 * this.threeCamera.fov) / this.threeCamera.zoom;
        const halfWidth = this.threeCamera.aspect * halfHeight;
        const implicitBounds = new Bounds2(0, 0, this.screenWidth, this.screenHeight).shifted(cameraBounds.center.negated());
        const adjustedFullWidth = cameraBounds.width;
        const adjustedFullHeight = cameraBounds.height;
        const oldLeft = -halfWidth;
        const oldTop = halfHeight;
        const newLeft = implicitBounds.left * halfWidth / (0.5 * cameraBounds.width);
        const newTop = -implicitBounds.top * halfHeight / (0.5 * cameraBounds.height);
        const offsetX = (newLeft - oldLeft) * adjustedFullWidth / (2 * halfWidth);
        const offsetY = (oldTop - newTop) * adjustedFullHeight / (2 * halfHeight);
        this.threeCamera.setViewOffset(adjustedFullWidth, adjustedFullHeight, offsetX, offsetY, this.screenWidth, this.screenHeight);
        this.threeCamera.aspect = cameraBounds.width / cameraBounds.height;
        this.threeCamera.updateProjectionMatrix();
      }
      this.moleculeNode.invalidateDOM();
    };
    animatedPanZoomSingleton.listener.matrixProperty.lazyLink(this.layoutListener);

    // We'll want to run a single step initially to load resources. See
    // https://github.com/phetsims/molecule-shapes-basics/issues/14
    this.hasStepped = false; // private {boolean}

    // @private {function}
    this.initialStepListener = () => {
      this.step(0);
    };
  }

  /**
   * @public
   *
   * @param {THREE.Scene} threeScene
   */
  static addLightsToScene(threeScene) {
    const ambientLight = new THREE.AmbientLight(0x191919); // closest to 0.1 like the original shader
    threeScene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8 * 0.9);
    sunLight.position.set(-1.0, 0.5, 2.0);
    threeScene.add(sunLight);
    const moonLight = new THREE.DirectionalLight(0xffffff, 0.6 * 0.9);
    moonLight.position.set(2.0, -1.0, 1.0);
    threeScene.add(moonLight);
  }

  /**
   * Duck-typed to have the same API as needed by views
   * @public
   *
   * @returns {Object}
   */
  static createAPIStub(renderer) {
    return {
      threeRenderer: renderer,
      checkOutLabel: () => ({
        setLabel: () => {},
        unsetLabel: () => {}
      }),
      returnLabel: () => {}
    };
  }

  /**
   * @private
   */
  showContextLossDialog() {
    if (!this.contextLossDialog) {
      this.contextLossDialog = new ContextLossFailureDialog();
    }
    this.contextLossDialog.show();
  }

  /**
   * Removes a bond-angle label from the pool to be controlled
   * @public
   */
  checkOutLabel() {
    const label = this.angleLabels.pop();
    assert && assert(label);
    return label;
  }

  /**
   * Returns a bond-angle label to the pool
   * @public
   */
  returnLabel(label) {
    assert && assert(!_.includes(this.angleLabels, label));
    this.angleLabels.push(label);
    label.unsetLabel();
  }

  /**
   * Adds a molcule view.
   * @public
   *
   * @param {MoleculeView} moleculeView
   */
  addMoleculeView(moleculeView) {
    this.threeScene.add(moleculeView);
    this.moleculeView.quaternion.copy(this.model.moleculeQuaternionProperty.value);
    this.moleculeView.updateMatrix();
    this.moleculeView.updateMatrixWorld();
  }

  /**
   * Removes a molcule view.
   * @public
   *
   * @param {MoleculeView} moleculeView
   */
  removeMoleculeView(moleculeView) {
    this.threeScene.remove(moleculeView);
  }

  /*
   * @private
   * @param {Vector3} screenPoint
   * @returns {THREE.Raycaster}
   */
  getRaycasterFromScreenPoint(screenPoint) {
    // normalized device coordinates
    const ndcX = 2 * screenPoint.x / this.screenWidth - 1;
    const ndcY = 2 * (1 - screenPoint.y / this.screenHeight) - 1;
    const mousePoint = new THREE.Vector3(ndcX, ndcY, 0);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePoint, this.threeCamera);
    return raycaster;
  }

  /*
   * Global => NDC
   * @public
   *
   * @param {THREE.Vector3} globalPoint
   * @returns {THREE.Vector3}
   */
  convertScreenPointFromGlobalPoint(globalPoint) {
    globalPoint.project(this.threeCamera);
  }

  /*
   * @private
   *
   * @param {Vector3} screenPoint
   * @returns {Ray3}
   */
  getRayFromScreenPoint(screenPoint) {
    const threeRay = this.getRaycasterFromScreenPoint(screenPoint).ray;
    return new Ray3(new Vector3(0, 0, 0).set(threeRay.origin), new Vector3(0, 0, 0).set(threeRay.direction).normalize());
  }

  /*
   * @private
   *
   * @param {Pointer} pointer
   * @param {boolean} isTouch - Whether we should use touch regions
   * @returns {PairGroup|null} - The closest pair group, or null
   */
  getElectronPairUnderPointer(pointer, isTouch) {
    const raycaster = this.getRaycasterFromScreenPoint(pointer.point);
    const worldRay = raycaster.ray;
    const cameraOrigin = worldRay.origin; // THREE.Vector3

    let shortestDistanceSquared = Number.POSITIVE_INFINITY;
    let closestGroup = null;
    const length = this.moleculeView.radialViews.length;
    for (let i = 0; i < length; i++) {
      const view = this.moleculeView.radialViews[i];
      const intersectionPoint = view.intersect(worldRay, isTouch); // THREE.Vector3
      if (intersectionPoint) {
        const distance = cameraOrigin.distanceToSquared(intersectionPoint);
        if (distance < shortestDistanceSquared) {
          shortestDistanceSquared = distance;
          closestGroup = view.group;
        }
      }
    }
    return closestGroup;
  }

  /*
   * The position in the moleculeView's coordinate system (where z=0 in the view coordinate system) for a
   * corresponding screenPoint.
   * @public
   *
   * @param {Vector2} screenPoint
   * @returns {THREE.Vector3} in the moleculeView's local coordinate system
   */
  getPlanarMoleculePosition(screenPoint) {
    const cameraRay = this.getRayFromScreenPoint(screenPoint);
    const intersection = Plane3.XY.intersectWithRay(cameraRay);
    const position = new THREE.Vector3(intersection.x, intersection.y, 0);
    this.moleculeView.worldToLocal(position);
    return position;
  }

  /*
   * Returns the closest molecule model-space point on the sphere whose radius is the bond's radius.
   * @public
   *
   * @param {Vector3} screenPoint
   * @param {PairGroup} draggedParticle
   * @returns {Vector3}
   */
  getSphericalMoleculePosition(screenPoint, draggedParticle) {
    // our main transform matrix and inverse
    const threeMatrix = this.moleculeView.matrix.clone();
    const threeInverseMatrix = new THREE.Matrix4();
    threeInverseMatrix.getInverse(threeMatrix);
    const raycaster = this.getRaycasterFromScreenPoint(screenPoint); // {THREE.Raycaster}

    const ray = raycaster.ray.clone(); // {THREE.Ray}
    ray.applyMatrix4(threeInverseMatrix); // global to local

    const localCameraPosition = new Vector3(0, 0, 0).set(ray.origin);
    const localCameraDirection = new Vector3(0, 0, 0).set(ray.direction).normalize();

    // how far we will end up from the center atom
    const finalDistance = this.model.moleculeProperty.value.getIdealDistanceFromCenter(draggedParticle);

    // our sphere to cast our ray against
    const sphere = new Sphere3(new Vector3(0, 0, 0), finalDistance);
    const epsilon = 0.000001;
    const intersections = sphere.intersections(new Ray3(localCameraPosition, localCameraDirection), epsilon);
    if (intersections.length === 0) {
      /*
       * Compute the point where the closest line through the camera and tangent to our bounding sphere intersects the sphere
       * ie, think 2d. we have a unit sphere centered at the origin, and a camera at (d,0). Our tangent point satisfies two
       * important conditions:
       * - it lies on the sphere. x^2 + y^2 == 1
       * - vector to the point (x,y) is tangent to the vector from (x,y) to our camera (d,0). thus (x,y) . (d-y, -y) == 0
       * Solve, and we get x = 1/d  plug back in for y (call that height), and we have our 2d solution.
       *
       * Now, back to 3D. Since camera is (0,0,d), our z == 1/d and our x^2 + y^2 == (our 2D y := height), then rescale them out of the unit sphere
       */

      const distanceFromCamera = localCameraPosition.distance(Vector3.ZERO);

      // first, calculate it in unit-sphere, as noted above
      const d = distanceFromCamera / finalDistance; // scaled distance to the camera (from the origin)
      const z = 1 / d; // our result z (down-scaled)
      const height = Math.sqrt(d * d - 1) / d; // our result (down-scaled) magnitude of (x,y,0), which is the radius of the circle composed of all points that could be tangent

      /*
       * Since our camera isn't actually on the z-axis, we need to calculate two vectors. One is the direction towards
       * the camera (planeNormal, easy!), and the other is the direction perpendicular to the planeNormal that points towards
       * the mouse pointer (planeHitDirection).
       */

      // intersect our camera ray against our perpendicular plane (perpendicular to our camera position from the origin) to determine the orientations
      const planeNormal = localCameraPosition.normalized();
      const t = -localCameraPosition.magnitude / planeNormal.dot(localCameraDirection);
      const planeHitDirection = localCameraPosition.plus(localCameraDirection.times(t)).normalized();

      // use the above plane hit direction (perpendicular to the camera) and plane normal (collinear with the camera) to calculate the result
      const downscaledResult = planeHitDirection.times(height).plus(planeNormal.times(z));

      // scale it back to our sized sphere
      return downscaledResult.times(finalDistance);
    } else {
      // pick the hitPoint closer to our current point (won't flip to the other side of our sphere)
      return intersections[0].hitPoint.distance(draggedParticle.positionProperty.value) < intersections[1].hitPoint.distance(draggedParticle.positionProperty.value) ? intersections[0].hitPoint : intersections[1].hitPoint;
    }
  }

  /**
   * @override
   * @protected
   */
  layout(viewBounds) {
    super.layout(viewBounds);
    const simDimensions = phet.joist.sim.dimensionProperty.value;
    const width = simDimensions.width;
    const height = simDimensions.height;
    this.threeRenderer.setSize(width, height);
    this.backgroundEventTarget.setRectBounds(this.globalToLocalBounds(new Bounds2(0, 0, width, height)));
    this.screenWidth = width;
    this.screenHeight = height;

    // field of view (FOV) computation for the isometric view scaling we use
    const sx = width / this.layoutBounds.width;
    const sy = height / this.layoutBounds.height;
    if (sx !== 0 && sy !== 0) {
      this.activeScale = sy > sx ? sx : sy;
      this.layoutListener();
      this.overlayCamera.left = 0;
      this.overlayCamera.right = width;
      this.overlayCamera.top = 0; // will this inversion work?
      this.overlayCamera.bottom = height;
      this.overlayCamera.near = 1;
      this.overlayCamera.far = 100;

      // three.js requires this to be called after changing the parameters
      this.overlayCamera.updateProjectionMatrix();
    }
    if (!this.hasStepped && !phet.joist.sim.frameEndedEmitter.hasListener(this.initialStepListener)) {
      phet.joist.sim.frameEndedEmitter.addListener(this.initialStepListener);
    }
  }

  /**
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   */
  step(dt) {
    this.moleculeView.updateView();
    this.render(undefined);
    if (!this.hasStepped) {
      phet.joist.sim.frameEndedEmitter.removeListener(this.initialStepListener);
      this.hasStepped = true;
    }
  }

  /**
   * Renders the simulation to a specific rendering target
   * @public
   *
   * @param {THREE.WebGLRenderTarget|undefined} target - undefined for the default target
   */
  render(target) {
    // render the 3D scene first
    this.threeRenderer.render(this.threeScene, this.threeCamera, target);
    this.threeRenderer.autoClear = false;
    // then render the 2D overlay on top, without clearing the Canvas in-between
    this.threeRenderer.render(this.overlayScene, this.overlayCamera, target);
    this.threeRenderer.autoClear = true;
  }
}

// @public - where our camera is positioned in world coordinates (manually tuned)
MoleculeShapesScreenView.cameraPosition = new THREE.Vector3(0.12 * 50, -0.025 * 50, 40);
moleculeShapes.register('MoleculeShapesScreenView', MoleculeShapesScreenView);
export default MoleculeShapesScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlBsYW5lMyIsIlJheTMiLCJTcGhlcmUzIiwiVmVjdG9yMyIsIlNjcmVlblZpZXciLCJSZXNldEFsbEJ1dHRvbiIsIkNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyIsIkFsaWduQm94IiwiYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uIiwiRE9NIiwiTW91c2UiLCJSZWN0YW5nbGUiLCJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzR2xvYmFscyIsIkxhYmVsV2ViR0xWaWV3IiwiR2VvbWV0cnlOYW1lUGFuZWwiLCJMYWJlbEZhbGxiYWNrTm9kZSIsIk1vbGVjdWxlU2hhcGVzQ29sb3JzIiwiTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInNlbGYiLCJiYWNrZ3JvdW5kRXZlbnRUYXJnZXQiLCJib3VuZHMiLCJsYXlvdXRCb3VuZHMiLCJhZGRDaGlsZCIsImFjdGl2ZVNjYWxlIiwic2NyZWVuV2lkdGgiLCJzY3JlZW5IZWlnaHQiLCJ0aHJlZVNjZW5lIiwiVEhSRUUiLCJTY2VuZSIsInRocmVlQ2FtZXJhIiwiUGVyc3BlY3RpdmVDYW1lcmEiLCJuZWFyIiwiZmFyIiwidGhyZWVSZW5kZXJlciIsInVzZVdlYkdMUHJvcGVydHkiLCJ2YWx1ZSIsIldlYkdMUmVuZGVyZXIiLCJhbnRpYWxpYXMiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsIkNhbnZhc1JlbmRlcmVyIiwiZGV2aWNlUGl4ZWxSYXRpbyIsInNldFBpeGVsUmF0aW8iLCJ3aW5kb3ciLCJjb250ZXh0TG9zc0RpYWxvZyIsImNvbnRleHQiLCJjYW52YXMiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNob3dDb250ZXh0TG9zc0RpYWxvZyIsImRvY3VtZW50IiwiZG9tYWluIiwiX2dhcSIsInB1c2giLCJqb2lzdCIsInNpbSIsInZlcnNpb24iLCJVUkwiLCJiYWNrZ3JvdW5kUHJvcGVydHkiLCJsaW5rIiwiY29sb3IiLCJzZXRDbGVhckNvbG9yIiwidG9OdW1iZXIiLCJhZGRMaWdodHNUb1NjZW5lIiwicG9zaXRpb24iLCJjb3B5IiwiY2FtZXJhUG9zaXRpb24iLCJtb2xlY3VsZU5vZGUiLCJkb21FbGVtZW50IiwicHJldmVudFRyYW5zZm9ybSIsInBpY2thYmxlIiwiY3JlYXRlVGFuZGVtIiwiaW52YWxpZGF0ZURPTSIsImludmFsaWRhdGVTZWxmIiwicmVuZGVyVG9DYW52YXNTZWxmIiwid3JhcHBlciIsIm1hdHJpeCIsImJhY2tpbmdTY2FsZSIsInRpbWVzTWF0cml4IiwiZ2V0VW5pcXVlVHJhaWwiLCJnZXRNYXRyaXgiLCJpbnZlcnRlZCIsIm0wMCIsImVmZmVjdGl2ZVdpZHRoIiwiTWF0aCIsImNlaWwiLCJlZmZlY3RpdmVIZWlnaHQiLCJ0YXJnZXQiLCJXZWJHTFJlbmRlclRhcmdldCIsIm1pbkZpbHRlciIsIkxpbmVhckZpbHRlciIsIm1hZ0ZpbHRlciIsIk5lYXJlc3RGaWx0ZXIiLCJmb3JtYXQiLCJSR0JBRm9ybWF0IiwicmVuZGVyIiwiYnVmZmVyIiwiQXJyYXlCdWZmZXIiLCJpbWFnZURhdGFCdWZmZXIiLCJVaW50OENsYW1wZWRBcnJheSIsInBpeGVscyIsIlVpbnQ4QXJyYXkiLCJnbCIsImdldENvbnRleHQiLCJyZWFkUGl4ZWxzIiwiUkdCQSIsIlVOU0lHTkVEX0JZVEUiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJ0bXBDb250ZXh0IiwiaW1hZ2VEYXRhIiwiY3JlYXRlSW1hZ2VEYXRhIiwiZGF0YSIsInNldCIsInB1dEltYWdlRGF0YSIsInNhdmUiLCJpbnZlcnNlIiwic2V0VHJhbnNmb3JtIiwiZHJhd0ltYWdlIiwicmVzdG9yZSIsIm92ZXJsYXlTY2VuZSIsIm92ZXJsYXlDYW1lcmEiLCJPcnRob2dyYXBoaWNDYW1lcmEiLCJ6IiwicmlnaHQiLCJtYXhYIiwiYm90dG9tIiwibWF4WSIsImxpc3RlbmVyIiwicmVzZXQiLCJhbGlnbkJvdW5kcyIsInhBbGlnbiIsInlBbGlnbiIsIm1hcmdpbiIsImRyYWdnZWRQYXJ0aWNsZUNvdW50IiwiaXNSb3RhdGluZyIsIm11bHRpRHJhZ0xpc3RlbmVyIiwiZG93biIsInRyYWlsIiwiY2FuU3RhcnRQcmVzcyIsImRyYWdNb2RlIiwiZHJhZ2dlZFBhcnRpY2xlIiwicG9pbnRlciIsInBhaXIiLCJnZXRFbGVjdHJvblBhaXJVbmRlclBvaW50ZXIiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibWF0cml4UHJvcGVydHkiLCJlcXVhbHNFcHNpbG9uIiwiSURFTlRJVFkiLCJsYXN0R2xvYmFsUG9pbnQiLCJwb2ludCIsInJlc2VydmVGb3JEcmFnIiwib25FbmREcmFnIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJ1cCIsImVuZERyYWciLCJjYW5jZWwiLCJtb3ZlIiwiZGVsdGEiLCJtaW51cyIsInNjYWxlIiwibmV3UXVhdGVybmlvbiIsIlF1YXRlcm5pb24iLCJzZXRGcm9tRXVsZXIiLCJFdWxlciIsInkiLCJ4IiwibXVsdGlwbHkiLCJtb2xlY3VsZVF1YXRlcm5pb25Qcm9wZXJ0eSIsIl8iLCJpbmNsdWRlcyIsIm1vbGVjdWxlUHJvcGVydHkiLCJncm91cHMiLCJkcmFnVG9Qb3NpdGlvbiIsImdldFNwaGVyaWNhbE1vbGVjdWxlUG9zaXRpb24iLCJpbnRlcnJ1cHQiLCJtb3VzZW1vdmUiLCJxdWF0ZXJuaW9uIiwibW9sZWN1bGVWaWV3IiwidXBkYXRlTWF0cml4IiwidXBkYXRlTWF0cml4V29ybGQiLCJhbmdsZUxhYmVscyIsImkiLCJsYWJlbCIsImFkZCIsImxheW91dExpc3RlbmVyIiwic2ltRGltZW5zaW9ucyIsImRpbWVuc2lvblByb3BlcnR5IiwiYXNzZXJ0IiwiY2FtZXJhQm91bmRzIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImhhbGZIZWlnaHQiLCJ0YW4iLCJQSSIsImZvdiIsInpvb20iLCJoYWxmV2lkdGgiLCJhc3BlY3QiLCJpbXBsaWNpdEJvdW5kcyIsInNoaWZ0ZWQiLCJjZW50ZXIiLCJuZWdhdGVkIiwiYWRqdXN0ZWRGdWxsV2lkdGgiLCJhZGp1c3RlZEZ1bGxIZWlnaHQiLCJvbGRMZWZ0Iiwib2xkVG9wIiwibmV3TGVmdCIsImxlZnQiLCJuZXdUb3AiLCJ0b3AiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInNldFZpZXdPZmZzZXQiLCJ1cGRhdGVQcm9qZWN0aW9uTWF0cml4IiwibGF6eUxpbmsiLCJoYXNTdGVwcGVkIiwiaW5pdGlhbFN0ZXBMaXN0ZW5lciIsInN0ZXAiLCJhbWJpZW50TGlnaHQiLCJBbWJpZW50TGlnaHQiLCJzdW5MaWdodCIsIkRpcmVjdGlvbmFsTGlnaHQiLCJtb29uTGlnaHQiLCJjcmVhdGVBUElTdHViIiwicmVuZGVyZXIiLCJjaGVja091dExhYmVsIiwic2V0TGFiZWwiLCJ1bnNldExhYmVsIiwicmV0dXJuTGFiZWwiLCJzaG93IiwicG9wIiwiYWRkTW9sZWN1bGVWaWV3IiwicmVtb3ZlTW9sZWN1bGVWaWV3IiwicmVtb3ZlIiwiZ2V0UmF5Y2FzdGVyRnJvbVNjcmVlblBvaW50Iiwic2NyZWVuUG9pbnQiLCJuZGNYIiwibmRjWSIsIm1vdXNlUG9pbnQiLCJyYXljYXN0ZXIiLCJSYXljYXN0ZXIiLCJzZXRGcm9tQ2FtZXJhIiwiY29udmVydFNjcmVlblBvaW50RnJvbUdsb2JhbFBvaW50IiwiZ2xvYmFsUG9pbnQiLCJwcm9qZWN0IiwiZ2V0UmF5RnJvbVNjcmVlblBvaW50IiwidGhyZWVSYXkiLCJyYXkiLCJvcmlnaW4iLCJkaXJlY3Rpb24iLCJub3JtYWxpemUiLCJpc1RvdWNoIiwid29ybGRSYXkiLCJjYW1lcmFPcmlnaW4iLCJzaG9ydGVzdERpc3RhbmNlU3F1YXJlZCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY2xvc2VzdEdyb3VwIiwibGVuZ3RoIiwicmFkaWFsVmlld3MiLCJ2aWV3IiwiaW50ZXJzZWN0aW9uUG9pbnQiLCJpbnRlcnNlY3QiLCJkaXN0YW5jZSIsImRpc3RhbmNlVG9TcXVhcmVkIiwiZ3JvdXAiLCJnZXRQbGFuYXJNb2xlY3VsZVBvc2l0aW9uIiwiY2FtZXJhUmF5IiwiaW50ZXJzZWN0aW9uIiwiWFkiLCJpbnRlcnNlY3RXaXRoUmF5Iiwid29ybGRUb0xvY2FsIiwidGhyZWVNYXRyaXgiLCJjbG9uZSIsInRocmVlSW52ZXJzZU1hdHJpeCIsIk1hdHJpeDQiLCJnZXRJbnZlcnNlIiwiYXBwbHlNYXRyaXg0IiwibG9jYWxDYW1lcmFQb3NpdGlvbiIsImxvY2FsQ2FtZXJhRGlyZWN0aW9uIiwiZmluYWxEaXN0YW5jZSIsImdldElkZWFsRGlzdGFuY2VGcm9tQ2VudGVyIiwic3BoZXJlIiwiZXBzaWxvbiIsImludGVyc2VjdGlvbnMiLCJkaXN0YW5jZUZyb21DYW1lcmEiLCJaRVJPIiwiZCIsInNxcnQiLCJwbGFuZU5vcm1hbCIsIm5vcm1hbGl6ZWQiLCJ0IiwibWFnbml0dWRlIiwiZG90IiwicGxhbmVIaXREaXJlY3Rpb24iLCJwbHVzIiwidGltZXMiLCJkb3duc2NhbGVkUmVzdWx0IiwiaGl0UG9pbnQiLCJwb3NpdGlvblByb3BlcnR5IiwibGF5b3V0Iiwidmlld0JvdW5kcyIsInNldFNpemUiLCJzZXRSZWN0Qm91bmRzIiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsInN4Iiwic3kiLCJmcmFtZUVuZGVkRW1pdHRlciIsImhhc0xpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJkdCIsInVwZGF0ZVZpZXciLCJ1bmRlZmluZWQiLCJyZW1vdmVMaXN0ZW5lciIsImF1dG9DbGVhciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgdmlldyBmb3IgYWxsIFwic2hvdyBhIHNpbmdsZSBtb2xlY3VsZSBpbiB0aGUgY2VudGVyXCIgc2NyZWVuc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBQbGFuZTMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1BsYW5lMy5qcyc7XHJcbmltcG9ydCBSYXkzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkzLmpzJztcclxuaW1wb3J0IFNwaGVyZTMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1NwaGVyZTMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Db250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uLCBET00sIE1vdXNlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNHbG9iYWxzIGZyb20gJy4uL01vbGVjdWxlU2hhcGVzR2xvYmFscy5qcyc7XHJcbmltcG9ydCBMYWJlbFdlYkdMVmlldyBmcm9tICcuLzNkL0xhYmVsV2ViR0xWaWV3LmpzJztcclxuaW1wb3J0IEdlb21ldHJ5TmFtZVBhbmVsIGZyb20gJy4vR2VvbWV0cnlOYW1lUGFuZWwuanMnO1xyXG5pbXBvcnQgTGFiZWxGYWxsYmFja05vZGUgZnJvbSAnLi9MYWJlbEZhbGxiYWNrTm9kZS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc0NvbG9ycyBmcm9tICcuL01vbGVjdWxlU2hhcGVzQ29sb3JzLmpzJztcclxuXHJcbmNsYXNzIE1vbGVjdWxlU2hhcGVzU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01vZGVsTW9sZWN1bGVzTW9kZWx9IG1vZGVsIHRoZSBtb2RlbCBmb3IgdGhlIGVudGlyZSBzY3JlZW5cclxuICAgKiBAcHVibGljIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7IC8vIEBwcml2YXRlIHtNb2RlbE1vbGVjdWxlc01vZGVsfVxyXG5cclxuICAgIC8vIG91ciB0YXJnZXQgZm9yIGRyYWdzIHRoYXQgZG9uJ3QgaGl0IG90aGVyIFVJIGNvbXBvbmVudHNcclxuICAgIHRoaXMuYmFja2dyb3VuZEV2ZW50VGFyZ2V0ID0gUmVjdGFuZ2xlLmJvdW5kcyggdGhpcy5sYXlvdXRCb3VuZHMsIHt9ICk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJhY2tncm91bmRFdmVudFRhcmdldCApO1xyXG5cclxuICAgIC8vIHVwZGF0ZWQgaW4gbGF5b3V0XHJcbiAgICB0aGlzLmFjdGl2ZVNjYWxlID0gMTsgLy8gQHByaXZhdGUgc2NhbGUgYXBwbGllZCB0byBpbnRlcmFjdGlvbiB0aGF0IGlzbid0IGRpcmVjdGx5IHRpZWQgdG8gc2NyZWVuIGNvb3JkaW5hdGVzIChyb3RhdGlvbilcclxuICAgIHRoaXMuc2NyZWVuV2lkdGggPSBudWxsOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLnNjcmVlbkhlaWdodCA9IG51bGw7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBtYWluIHRocmVlLmpzIFNjZW5lIHNldHVwXHJcbiAgICB0aGlzLnRocmVlU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTsgLy8gQHByaXZhdGVcclxuXHJcbiAgICB0aGlzLnRocmVlQ2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7IC8vIEBwcml2YXRlIHdpbGwgc2V0IHRoZSBwcm9qZWN0aW9uIHBhcmFtZXRlcnMgb24gbGF5b3V0XHJcbiAgICB0aGlzLnRocmVlQ2FtZXJhLm5lYXIgPSAxO1xyXG4gICAgdGhpcy50aHJlZUNhbWVyYS5mYXIgPSAxMDA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VEhSRUUuUmVuZGVyZXJ9XHJcbiAgICB0aGlzLnRocmVlUmVuZGVyZXIgPSBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCB7XHJcbiAgICAgIGFudGlhbGlhczogdHJ1ZSxcclxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxyXG4gICAgfSApIDogbmV3IFRIUkVFLkNhbnZhc1JlbmRlcmVyKCB7XHJcbiAgICAgIGRldmljZVBpeGVsUmF0aW86IDEgLy8gaG9wZWZ1bGx5IGhlbHBzIHBlcmZvcm1hbmNlIGEgYml0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aHJlZVJlbmRlcmVyLnNldFBpeGVsUmF0aW8oIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q29udGV4dExvc3NGYWlsdXJlRGlhbG9nfG51bGx9IC0gZGlhbG9nIHNob3duIG9uIGNvbnRleHQgbG9zcywgY29uc3RydWN0ZWRcclxuICAgIC8vIGxhemlseSBiZWNhdXNlIERpYWxvZyByZXF1aXJlcyBzaW0gYm91bmRzIGR1cmluZyBjb25zdHJ1Y3Rpb25cclxuICAgIHRoaXMuY29udGV4dExvc3NEaWFsb2cgPSBudWxsO1xyXG5cclxuICAgIC8vIEluIHRoZSBldmVudCBvZiBhIGNvbnRleHQgbG9zcywgd2UnbGwganVzdCBzaG93IGEgZGlhbG9nLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlLXNoYXBlcy9pc3N1ZXMvMTAwXHJcbiAgICBpZiAoIE1vbGVjdWxlU2hhcGVzR2xvYmFscy51c2VXZWJHTFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnRocmVlUmVuZGVyZXIuY29udGV4dC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggJ3dlYmdsY29udGV4dGxvc3QnLCBldmVudCA9PiB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93Q29udGV4dExvc3NEaWFsb2coKTtcclxuXHJcbiAgICAgICAgaWYgKCBkb2N1bWVudC5kb21haW4gPT09ICdwaGV0LmNvbG9yYWRvLmVkdScgKSB7XHJcbiAgICAgICAgICB3aW5kb3cuX2dhcSAmJiB3aW5kb3cuX2dhcS5wdXNoKCBbICdfdHJhY2tFdmVudCcsICdXZWJHTCBDb250ZXh0IExvc3MnLCBgbW9sZWN1bGUtc2hhcGVzICR7cGhldC5qb2lzdC5zaW0udmVyc2lvbn1gLCBkb2N1bWVudC5VUkwgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIE1vbGVjdWxlU2hhcGVzQ29sb3JzLmJhY2tncm91bmRQcm9wZXJ0eS5saW5rKCBjb2xvciA9PiB7XHJcbiAgICAgIHRoaXMudGhyZWVSZW5kZXJlci5zZXRDbGVhckNvbG9yKCBjb2xvci50b051bWJlcigpLCAxICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3LmFkZExpZ2h0c1RvU2NlbmUoIHRoaXMudGhyZWVTY2VuZSApO1xyXG5cclxuICAgIHRoaXMudGhyZWVDYW1lcmEucG9zaXRpb24uY29weSggTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3LmNhbWVyYVBvc2l0aW9uICk7IC8vIHNldHMgdGhlIGNhbWVyYSdzIHBvc2l0aW9uXHJcblxyXG4gICAgLy8gQHByaXZhdGUgYWRkIHRoZSBDYW52YXMgaW4gd2l0aCBhIERPTSBub2RlIHRoYXQgcHJldmVudHMgU2NlbmVyeSBmcm9tIGFwcGx5aW5nIHRyYW5zZm9ybWF0aW9ucyBvbiBpdFxyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGUgPSBuZXcgRE9NKCB0aGlzLnRocmVlUmVuZGVyZXIuZG9tRWxlbWVudCwge1xyXG4gICAgICBwcmV2ZW50VHJhbnNmb3JtOiB0cnVlLCAvLyBTY2VuZXJ5IDAuMiBvdmVycmlkZSBmb3IgdHJhbnNmb3JtYXRpb25cclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2xlY3VsZU5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIC8vIGRvbid0IGRvIGJvdW5kcyBkZXRlY3Rpb24sIGl0J3MgdG9vIGV4cGVuc2l2ZS4gV2UncmUgbm90IHBpY2thYmxlIGFueXdheXNcclxuICAgIHRoaXMubW9sZWN1bGVOb2RlLmludmFsaWRhdGVET00gPSAoKSA9PiB0aGlzLm1vbGVjdWxlTm9kZS5pbnZhbGlkYXRlU2VsZiggbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGUuaW52YWxpZGF0ZURPTSgpO1xyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGUuaW52YWxpZGF0ZURPTSgpO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgU2NlbmVyeS9Kb2lzdCAwLjIgc2NyZWVuc2hvdCAodGFrZXMgZXh0cmEgd29yayB0byBvdXRwdXQpXHJcbiAgICB0aGlzLm1vbGVjdWxlTm9kZS5yZW5kZXJUb0NhbnZhc1NlbGYgPSAoIHdyYXBwZXIsIG1hdHJpeCApID0+IHtcclxuICAgICAgbGV0IGNhbnZhcyA9IG51bGw7XHJcblxyXG4gICAgICAvLyBFeHRyYWN0IG91dCB0aGUgYmFja2luZyBzY2FsZSBiYXNlZCBvbiBvdXIgdHJhaWxcclxuICAgICAgLy8gR3VhcmFudGVlZCB0byBiZSBhZmZpbmUsIDE6MSBhc3BlY3QgcmF0aW8gYW5kIGF4aXMtYWxpZ25lZFxyXG4gICAgICBjb25zdCBiYWNraW5nU2NhbGUgPSBtYXRyaXgudGltZXNNYXRyaXgoIHRoaXMuZ2V0VW5pcXVlVHJhaWwoKS5nZXRNYXRyaXgoKS5pbnZlcnRlZCgpICkubTAwKCk7XHJcblxyXG4gICAgICBjb25zdCBlZmZlY3RpdmVXaWR0aCA9IE1hdGguY2VpbCggYmFja2luZ1NjYWxlICogdGhpcy5zY3JlZW5XaWR0aCApO1xyXG4gICAgICBjb25zdCBlZmZlY3RpdmVIZWlnaHQgPSBNYXRoLmNlaWwoIGJhY2tpbmdTY2FsZSAqIHRoaXMuc2NyZWVuSGVpZ2h0ICk7XHJcblxyXG4gICAgICAvLyBUaGlzIFdlYkdMIHdvcmthcm91bmQgaXMgc28gd2UgY2FuIGF2b2lkIHRoZSBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIgc2V0dGluZyB0aGF0IHdvdWxkIGltcGFjdCBwZXJmb3JtYW5jZS5cclxuICAgICAgLy8gV2UgcmVuZGVyIHRvIGEgZnJhbWVidWZmZXIgYW5kIGV4dHJhY3QgdGhlIHBpeGVsIGRhdGEgZGlyZWN0bHksIHNpbmNlIHdlIGNhbid0IGNyZWF0ZSBhbm90aGVyIHJlbmRlcmVyIGFuZFxyXG4gICAgICAvLyBzaGFyZSB0aGUgdmlldyAodGhyZWUuanMgY29uc3RyYWludCkuXHJcbiAgICAgIGlmICggTW9sZWN1bGVTaGFwZXNHbG9iYWxzLnVzZVdlYkdMUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIHNldCB1cCBhIGZyYW1lYnVmZmVyICh0YXJnZXQgaXMgdGhyZWUuanMgdGVybWlub2xvZ3kpIHRvIHJlbmRlciBpbnRvXHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCBlZmZlY3RpdmVXaWR0aCwgZWZmZWN0aXZlSGVpZ2h0LCB7XHJcbiAgICAgICAgICBtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlcixcclxuICAgICAgICAgIG1hZ0ZpbHRlcjogVEhSRUUuTmVhcmVzdEZpbHRlcixcclxuICAgICAgICAgIGZvcm1hdDogVEhSRUUuUkdCQUZvcm1hdFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICAvLyByZW5kZXIgb3VyIHNjcmVlbiBjb250ZW50IGludG8gdGhlIGZyYW1lYnVmZmVyXHJcbiAgICAgICAgdGhpcy5yZW5kZXIoIHRhcmdldCApO1xyXG5cclxuICAgICAgICAvLyBzZXQgdXAgYSBidWZmZXIgZm9yIHBpeGVsIGRhdGEsIGluIHRoZSBleGFjdCB0eXBlZCBmb3JtYXRzIHdlIHdpbGwgbmVlZFxyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyB3aW5kb3cuQXJyYXlCdWZmZXIoIGVmZmVjdGl2ZVdpZHRoICogZWZmZWN0aXZlSGVpZ2h0ICogNCApO1xyXG4gICAgICAgIGNvbnN0IGltYWdlRGF0YUJ1ZmZlciA9IG5ldyB3aW5kb3cuVWludDhDbGFtcGVkQXJyYXkoIGJ1ZmZlciApO1xyXG4gICAgICAgIGNvbnN0IHBpeGVscyA9IG5ldyB3aW5kb3cuVWludDhBcnJheSggYnVmZmVyICk7XHJcblxyXG4gICAgICAgIC8vIHJlYWQgdGhlIHBpeGVsIGRhdGEgaW50byB0aGUgYnVmZmVyXHJcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLnRocmVlUmVuZGVyZXIuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIGdsLnJlYWRQaXhlbHMoIDAsIDAsIGVmZmVjdGl2ZVdpZHRoLCBlZmZlY3RpdmVIZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHBpeGVscyApO1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgYSBDYW52YXMgd2l0aCB0aGUgY29ycmVjdCBzaXplLCBhbmQgZmlsbCBpdCB3aXRoIHRoZSBwaXhlbCBkYXRhXHJcbiAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSBlZmZlY3RpdmVXaWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gZWZmZWN0aXZlSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHRtcENvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gICAgICAgIGNvbnN0IGltYWdlRGF0YSA9IHRtcENvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKCBlZmZlY3RpdmVXaWR0aCwgZWZmZWN0aXZlSGVpZ2h0ICk7XHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGEuc2V0KCBpbWFnZURhdGFCdWZmZXIgKTtcclxuICAgICAgICB0bXBDb250ZXh0LnB1dEltYWdlRGF0YSggaW1hZ2VEYXRhLCAwLCAwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gSWYganVzdCBmYWxsaW5nIGJhY2sgdG8gQ2FudmFzLCB3ZSBjYW4gZGlyZWN0bHkgcmVuZGVyIG91dCFcclxuICAgICAgICBjYW52YXMgPSB0aGlzLnRocmVlUmVuZGVyZXIuZG9tRWxlbWVudDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY29udGV4dCA9IHdyYXBwZXIuY29udGV4dDtcclxuICAgICAgY29udGV4dC5zYXZlKCk7XHJcblxyXG4gICAgICAvLyBUYWtlIHRoZSBwaXhlbCByYXRpbyBpbnRvIGFjY291bnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtc2hhcGVzL2lzc3Vlcy8xNDlcclxuICAgICAgY29uc3QgaW52ZXJzZSA9IDEgLyAoIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEgKTtcclxuXHJcbiAgICAgIGlmICggTW9sZWN1bGVTaGFwZXNHbG9iYWxzLnVzZVdlYkdMUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIC0xLCAwLCBlZmZlY3RpdmVIZWlnaHQgKTsgLy8gbm8gbmVlZCB0byB0YWtlIHBpeGVsIHNjYWxpbmcgaW50byBhY2NvdW50XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oIGludmVyc2UsIDAsIDAsIGludmVyc2UsIDAsIDAgKTtcclxuICAgICAgfVxyXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggY2FudmFzLCAwLCAwICk7XHJcbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1vbGVjdWxlTm9kZSApO1xyXG5cclxuICAgIC8vIG92ZXJsYXkgU2NlbmUgZm9yIGJvbmQtYW5nbGUgbGFiZWxzIChpZiBXZWJHTClcclxuICAgIHRoaXMub3ZlcmxheVNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm92ZXJsYXlDYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKCk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm92ZXJsYXlDYW1lcmEucG9zaXRpb24ueiA9IDUwOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDEwLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAxMCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBuZXcgR2VvbWV0cnlOYW1lUGFuZWwoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmFtZVBhbmVsJyApICksIHtcclxuICAgICAgYWxpZ25Cb3VuZHM6IHRoaXMubGF5b3V0Qm91bmRzLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJyxcclxuICAgICAgbWFyZ2luOiAxMFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gd2Ugb25seSB3YW50IHRvIHN1cHBvcnQgZHJhZ2dpbmcgcGFydGljbGVzIE9SIHJvdGF0aW5nIHRoZSBtb2xlY3VsZSAobm90IGJvdGgpIGF0IHRoZSBzYW1lIHRpbWVcclxuICAgIGxldCBkcmFnZ2VkUGFydGljbGVDb3VudCA9IDA7XHJcbiAgICBsZXQgaXNSb3RhdGluZyA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IG11bHRpRHJhZ0xpc3RlbmVyID0ge1xyXG4gICAgICBkb3duOiBmdW5jdGlvbiggZXZlbnQsIHRyYWlsICkge1xyXG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IHJvdGF0aW5nIHRoZSBlbnRpcmUgbW9sZWN1bGUsIG5vIG1vcmUgZHJhZ3MgY2FuIGJlIGhhbmRsZWRcclxuICAgICAgICBpZiAoIGlzUm90YXRpbmcgKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZHJhZ01vZGUgPSBudWxsO1xyXG4gICAgICAgIGxldCBkcmFnZ2VkUGFydGljbGUgPSBudWxsO1xyXG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5wb2ludGVyO1xyXG5cclxuICAgICAgICBjb25zdCBwYWlyID0gc2VsZi5nZXRFbGVjdHJvblBhaXJVbmRlclBvaW50ZXIoIHBvaW50ZXIsICEoIHBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSApICk7XHJcbiAgICAgICAgaWYgKCBwYWlyICYmICFwYWlyLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAvLyB3ZSBzdGFydCBkcmFnZ2luZyB0aGF0IHBhaXIgZ3JvdXAgd2l0aCB0aGlzIHBvaW50ZXIsIG1vdmluZyBpdCBhbG9uZyB0aGUgc3BoZXJlIHdoZXJlIGl0IGNhbiBleGlzdFxyXG4gICAgICAgICAgZHJhZ01vZGUgPSAncGFpckV4aXN0aW5nU3BoZXJpY2FsJztcclxuICAgICAgICAgIGRyYWdnZWRQYXJ0aWNsZSA9IHBhaXI7XHJcbiAgICAgICAgICBwYWlyLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgZHJhZ2dlZFBhcnRpY2xlQ291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcm90YXRlIHdoaWxlIHdlIGFyZSBkcmFnZ2luZyBhbnkgcGFydGljbGVzXHJcbiAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBkb24ndCByb3RhdGUgaWYgd2UncmUgem9vbWVkIGludG8gdGhlIHNpbSAtIHRoZSBwYW4vem9vbSBsaXN0ZW5lciB3aWxsIGludGVycnVwdCB0aGUgcm90YXRpb25cclxuICAgICAgICAvLyB0byBzdGFydCBhIHBhbiwgYnV0IG5vdCB1bnRpbCB0aGVyZSBpcyBhIGxpdHRsZSBiaXQgb2YgcG9pbnRlciBtb3ZlbWVudC4gSWYgd2UgYXJlIHpvb21lZCBpbiBhdCBhbGxcclxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGFsbG93IG1vdmVtZW50IHRoYXQgd2lsbCBzb29uIGp1c3QgZ2V0IGludGVycnVwdGVkLlxyXG4gICAgICAgIGVsc2UgaWYgKCBkcmFnZ2VkUGFydGljbGVDb3VudCA9PT0gMCAmJiBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIubWF0cml4UHJvcGVydHkudmFsdWUuZXF1YWxzRXBzaWxvbiggTWF0cml4My5JREVOVElUWSwgMWUtNyApICkge1xyXG4gICAgICAgICAgLy8gd2Ugcm90YXRlIHRoZSBlbnRpcmUgbW9sZWN1bGUgd2l0aCB0aGlzIHBvaW50ZXJcclxuICAgICAgICAgIGRyYWdNb2RlID0gJ21vZGVsUm90YXRlJztcclxuICAgICAgICAgIGlzUm90YXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIGNhbid0IGRyYWcgdGhlIHBhaXIgT1Igcm90YXRlIHRoZSBtb2xlY3VsZVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbGFzdEdsb2JhbFBvaW50ID0gcG9pbnRlci5wb2ludC5jb3B5KCk7XHJcblxyXG4gICAgICAgIC8vIElmIGEgZHJhZyBzdGFydHMgb24gYSBwYWlyIGdyb3VwLCBpbnB1dCBzaG91bGQgb25seSBiZSBmb3IgZHJhZ2dpbmcuIEluZGljYXRlIHRvIG90aGVyIGxpc3RlbmVycyB0aGF0XHJcbiAgICAgICAgLy8gYmVoYXZpb3IgaXMgcmVzZXJ2ZWQgKHNwZWNpZmljYWxseSB0aGUgcGFuL3pvb20gbGlzdGVuZXIgdGhhdCBzaG91bGQgbm90IGludGVycnVwdCBmb3IgcGFuKS5cclxuICAgICAgICBpZiAoIGRyYWdNb2RlID09PSAncGFpckV4aXN0aW5nU3BoZXJpY2FsJyApIHtcclxuICAgICAgICAgIHBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9uRW5kRHJhZyA9IGZ1bmN0aW9uKCBldmVudCwgdHJhaWwgKSB7XHJcbiAgICAgICAgICBpZiAoIGRyYWdNb2RlID09PSAncGFpckV4aXN0aW5nU3BoZXJpY2FsJyApIHtcclxuICAgICAgICAgICAgZHJhZ2dlZFBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHJhZ2dlZFBhcnRpY2xlQ291bnQtLTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkcmFnTW9kZSA9PT0gJ21vZGVsUm90YXRlJyApIHtcclxuICAgICAgICAgICAgaXNSb3RhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzICk7XHJcbiAgICAgICAgICBwb2ludGVyLmN1cnNvciA9IG51bGw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcG9pbnRlci5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgcG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgICAgICAgICAvLyBlbmQgZHJhZyBvbiBlaXRoZXIgdXAgb3IgY2FuY2VsIChub3Qgc3VwcG9ydGluZyBmdWxsIGNhbmNlbCBiZWhhdmlvcilcclxuICAgICAgICAgIHVwOiBmdW5jdGlvbiggZXZlbnQsIHRyYWlsICkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZERyYWcoIGV2ZW50LCB0cmFpbCApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGNhbmNlbDogZnVuY3Rpb24oIGV2ZW50LCB0cmFpbCApIHtcclxuICAgICAgICAgICAgdGhpcy5lbmREcmFnKCBldmVudCwgdHJhaWwgKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgbW92ZTogZnVuY3Rpb24oIGV2ZW50LCB0cmFpbCApIHtcclxuICAgICAgICAgICAgaWYgKCBkcmFnTW9kZSA9PT0gJ21vZGVsUm90YXRlJyApIHtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgZGVsdGEgPSBwb2ludGVyLnBvaW50Lm1pbnVzKCBsYXN0R2xvYmFsUG9pbnQgKTtcclxuICAgICAgICAgICAgICBsYXN0R2xvYmFsUG9pbnQuc2V0KCBwb2ludGVyLnBvaW50ICk7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gMC4wMDcgLyBzZWxmLmFjdGl2ZVNjYWxlOyAvLyB0dW5lZCBjb25zdGFudCBmb3IgYWNjZXB0YWJsZSBkcmFnIG1vdGlvblxyXG4gICAgICAgICAgICAgIGNvbnN0IG5ld1F1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLnNldEZyb21FdWxlciggbmV3IFRIUkVFLkV1bGVyKCBkZWx0YS55ICogc2NhbGUsIGRlbHRhLnggKiBzY2FsZSwgMCApICk7XHJcbiAgICAgICAgICAgICAgbmV3UXVhdGVybmlvbi5tdWx0aXBseSggbW9kZWwubW9sZWN1bGVRdWF0ZXJuaW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgICAgICBtb2RlbC5tb2xlY3VsZVF1YXRlcm5pb25Qcm9wZXJ0eS52YWx1ZSA9IG5ld1F1YXRlcm5pb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIGRyYWdNb2RlID09PSAncGFpckV4aXN0aW5nU3BoZXJpY2FsJyApIHtcclxuICAgICAgICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIG1vZGVsLm1vbGVjdWxlUHJvcGVydHkudmFsdWUuZ3JvdXBzLCBkcmFnZ2VkUGFydGljbGUgKSApIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnZWRQYXJ0aWNsZS5kcmFnVG9Qb3NpdGlvbiggc2VsZi5nZXRTcGhlcmljYWxNb2xlY3VsZVBvc2l0aW9uKCBwb2ludGVyLnBvaW50LCBkcmFnZ2VkUGFydGljbGUgKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAvLyBub3QgYSBTY2VuZXJ5IGV2ZW50XHJcbiAgICAgICAgICBlbmREcmFnOiBvbkVuZERyYWcsXHJcbiAgICAgICAgICBpbnRlcnJ1cHQ6IG9uRW5kRHJhZ1xyXG4gICAgICAgIH0sIHRydWUgKTsgLy8gYXR0YWNoIHRoZSBsaXN0ZW5lciBzbyB0aGF0IGl0IGNhbiBiZSBpbnRlcnJ1cHRlZCBmcm9tIHBhbiBhbmQgem9vbSBvcGVyYXRpb25zXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmJhY2tncm91bmRFdmVudFRhcmdldC5hZGRJbnB1dExpc3RlbmVyKCBtdWx0aURyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIENvbnNpZGVyIHVwZGF0aW5nIHRoZSBjdXJzb3IgZXZlbiBpZiB3ZSBkb24ndCBtb3ZlPyAob25seSBpZiB3ZSBoYXZlIG1vdXNlIG1vdmVtZW50KT8gQ3VycmVudCBkZXZlbG9wbWVudFxyXG4gICAgLy8gZGVjaXNpb24gaXMgdG8gaWdub3JlIHRoaXMgZWRnZSBjYXNlIGluIGZhdm9yIG9mIHBlcmZvcm1hbmNlLlxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kRXZlbnRUYXJnZXQuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICBtb3VzZW1vdmU6IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRFdmVudFRhcmdldC5jdXJzb3IgPSB0aGlzLmdldEVsZWN0cm9uUGFpclVuZGVyUG9pbnRlciggZXZlbnQucG9pbnRlciwgZmFsc2UgKSA/ICdwb2ludGVyJyA6IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIG1vbGVjdWxlIHZpZXcncyByb3RhdGlvbiB3aGVuIHRoZSBtb2RlbCdzIHJvdGF0aW9uIGNoYW5nZXNcclxuICAgIG1vZGVsLm1vbGVjdWxlUXVhdGVybmlvblByb3BlcnR5LmxpbmsoIHF1YXRlcm5pb24gPT4ge1xyXG4gICAgICAvLyBtb2xlY3VsZVZpZXcgaXMgY3JlYXRlZCBpbiB0aGUgc3VidHlwZSAobm90IHlldCkuIHdpbGwgaGFuZGxlIGluaXRpYWwgcm90YXRpb24gaW4gYWRkTW9sZWN1bGVWaWV3XHJcbiAgICAgIGlmICggdGhpcy5tb2xlY3VsZVZpZXcgKSB7XHJcbiAgICAgICAgdGhpcy5tb2xlY3VsZVZpZXcucXVhdGVybmlvbi5jb3B5KCBxdWF0ZXJuaW9uICk7XHJcbiAgICAgICAgdGhpcy5tb2xlY3VsZVZpZXcudXBkYXRlTWF0cml4KCk7XHJcbiAgICAgICAgdGhpcy5tb2xlY3VsZVZpZXcudXBkYXRlTWF0cml4V29ybGQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gY3JlYXRlIGEgcG9vbCBvZiBhbmdsZSBsYWJlbHMgb2YgdGhlIGRlc2lyZWQgdHlwZVxyXG4gICAgdGhpcy5hbmdsZUxhYmVscyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgMTU7IGkrKyApIHtcclxuICAgICAgaWYgKCBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBjb25zdCBsYWJlbCA9IG5ldyBMYWJlbFdlYkdMVmlldyggdGhpcy50aHJlZVJlbmRlcmVyICk7XHJcbiAgICAgICAgdGhpcy5hbmdsZUxhYmVscy5wdXNoKCBsYWJlbCApO1xyXG4gICAgICAgIHRoaXMub3ZlcmxheVNjZW5lLmFkZCggbGFiZWwgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBsYWJlbCA9IG5ldyBMYWJlbEZhbGxiYWNrTm9kZSgpO1xyXG4gICAgICAgIHRoaXMuYW5nbGVMYWJlbHMucHVzaCggbGFiZWwgKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKCBsYWJlbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sYXlvdXRMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgY29uc3Qgc2NyZWVuV2lkdGggPSB0aGlzLnNjcmVlbldpZHRoO1xyXG4gICAgICBjb25zdCBzY3JlZW5IZWlnaHQgPSB0aGlzLnNjcmVlbkhlaWdodDtcclxuXHJcbiAgICAgIGNvbnN0IHNpbURpbWVuc2lvbnMgPSBwaGV0LmpvaXN0LnNpbS5kaW1lbnNpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIGlmICggc2NyZWVuV2lkdGggJiYgc2NyZWVuSGVpZ2h0ICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjcmVlbldpZHRoID09PSBzaW1EaW1lbnNpb25zLndpZHRoICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuSGVpZ2h0ID09PSBzaW1EaW1lbnNpb25zLmhlaWdodCApO1xyXG5cclxuICAgICAgICBjb25zdCBjYW1lcmFCb3VuZHMgPSB0aGlzLmxvY2FsVG9HbG9iYWxCb3VuZHMoIG5ldyBCb3VuZHMyKCAwLCAwLCB0aGlzLmxheW91dEJvdW5kcy53aWR0aCwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICkgKTtcclxuXHJcbiAgICAgICAgLy8gUExFQVNFIFNFRSBUaHJlZVN0YWdlLmFkanVzdFZpZXdPZmZzZXQgZm9yIGRvY3VtZW50YXRpb24gb2YgYWxsIG9mIHRoaXMgKG5vdCByZXBlYXRlZCBoZXJlKVxyXG4gICAgICAgIGNvbnN0IGhhbGZIZWlnaHQgPSB0aGlzLnRocmVlQ2FtZXJhLm5lYXIgKiBNYXRoLnRhbiggKCBNYXRoLlBJIC8gMzYwICkgKiB0aGlzLnRocmVlQ2FtZXJhLmZvdiApIC8gdGhpcy50aHJlZUNhbWVyYS56b29tO1xyXG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHRoaXMudGhyZWVDYW1lcmEuYXNwZWN0ICogaGFsZkhlaWdodDtcclxuICAgICAgICBjb25zdCBpbXBsaWNpdEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCB0aGlzLnNjcmVlbldpZHRoLCB0aGlzLnNjcmVlbkhlaWdodCApLnNoaWZ0ZWQoIGNhbWVyYUJvdW5kcy5jZW50ZXIubmVnYXRlZCgpICk7XHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGdWxsV2lkdGggPSBjYW1lcmFCb3VuZHMud2lkdGg7XHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGdWxsSGVpZ2h0ID0gY2FtZXJhQm91bmRzLmhlaWdodDtcclxuICAgICAgICBjb25zdCBvbGRMZWZ0ID0gLWhhbGZXaWR0aDtcclxuICAgICAgICBjb25zdCBvbGRUb3AgPSBoYWxmSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IG5ld0xlZnQgPSBpbXBsaWNpdEJvdW5kcy5sZWZ0ICogaGFsZldpZHRoIC8gKCAwLjUgKiBjYW1lcmFCb3VuZHMud2lkdGggKTtcclxuICAgICAgICBjb25zdCBuZXdUb3AgPSAtaW1wbGljaXRCb3VuZHMudG9wICogaGFsZkhlaWdodCAvICggMC41ICogY2FtZXJhQm91bmRzLmhlaWdodCApO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSAoIG5ld0xlZnQgLSBvbGRMZWZ0ICkgKiBhZGp1c3RlZEZ1bGxXaWR0aCAvICggMiAqIGhhbGZXaWR0aCApO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSAoIG9sZFRvcCAtIG5ld1RvcCApICogYWRqdXN0ZWRGdWxsSGVpZ2h0IC8gKCAyICogaGFsZkhlaWdodCApO1xyXG4gICAgICAgIHRoaXMudGhyZWVDYW1lcmEuc2V0Vmlld09mZnNldCggYWRqdXN0ZWRGdWxsV2lkdGgsIGFkanVzdGVkRnVsbEhlaWdodCwgb2Zmc2V0WCwgb2Zmc2V0WSwgdGhpcy5zY3JlZW5XaWR0aCwgdGhpcy5zY3JlZW5IZWlnaHQgKTtcclxuICAgICAgICB0aGlzLnRocmVlQ2FtZXJhLmFzcGVjdCA9IGNhbWVyYUJvdW5kcy53aWR0aCAvIGNhbWVyYUJvdW5kcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy50aHJlZUNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubW9sZWN1bGVOb2RlLmludmFsaWRhdGVET00oKTtcclxuICAgIH07XHJcblxyXG4gICAgYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uLmxpc3RlbmVyLm1hdHJpeFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmxheW91dExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gV2UnbGwgd2FudCB0byBydW4gYSBzaW5nbGUgc3RlcCBpbml0aWFsbHkgdG8gbG9hZCByZXNvdXJjZXMuIFNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlLXNoYXBlcy1iYXNpY3MvaXNzdWVzLzE0XHJcbiAgICB0aGlzLmhhc1N0ZXBwZWQgPSBmYWxzZTsgLy8gcHJpdmF0ZSB7Ym9vbGVhbn1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmluaXRpYWxTdGVwTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RlcCggMCApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VEhSRUUuU2NlbmV9IHRocmVlU2NlbmVcclxuICAgKi9cclxuICBzdGF0aWMgYWRkTGlnaHRzVG9TY2VuZSggdGhyZWVTY2VuZSApIHtcclxuICAgIGNvbnN0IGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoIDB4MTkxOTE5ICk7IC8vIGNsb3Nlc3QgdG8gMC4xIGxpa2UgdGhlIG9yaWdpbmFsIHNoYWRlclxyXG4gICAgdGhyZWVTY2VuZS5hZGQoIGFtYmllbnRMaWdodCApO1xyXG5cclxuICAgIGNvbnN0IHN1bkxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoIDB4ZmZmZmZmLCAwLjggKiAwLjkgKTtcclxuICAgIHN1bkxpZ2h0LnBvc2l0aW9uLnNldCggLTEuMCwgMC41LCAyLjAgKTtcclxuICAgIHRocmVlU2NlbmUuYWRkKCBzdW5MaWdodCApO1xyXG5cclxuICAgIGNvbnN0IG1vb25MaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweGZmZmZmZiwgMC42ICogMC45ICk7XHJcbiAgICBtb29uTGlnaHQucG9zaXRpb24uc2V0KCAyLjAsIC0xLjAsIDEuMCApO1xyXG4gICAgdGhyZWVTY2VuZS5hZGQoIG1vb25MaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHVjay10eXBlZCB0byBoYXZlIHRoZSBzYW1lIEFQSSBhcyBuZWVkZWQgYnkgdmlld3NcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVBUElTdHViKCByZW5kZXJlciApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRocmVlUmVuZGVyZXI6IHJlbmRlcmVyLFxyXG4gICAgICBjaGVja091dExhYmVsOiAoKSA9PiAoIHtcclxuICAgICAgICBzZXRMYWJlbDogKCkgPT4ge30sXHJcbiAgICAgICAgdW5zZXRMYWJlbDogKCkgPT4ge31cclxuICAgICAgfSApLFxyXG4gICAgICByZXR1cm5MYWJlbDogKCkgPT4ge31cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHNob3dDb250ZXh0TG9zc0RpYWxvZygpIHtcclxuICAgIGlmICggIXRoaXMuY29udGV4dExvc3NEaWFsb2cgKSB7XHJcbiAgICAgIHRoaXMuY29udGV4dExvc3NEaWFsb2cgPSBuZXcgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnRleHRMb3NzRGlhbG9nLnNob3coKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBib25kLWFuZ2xlIGxhYmVsIGZyb20gdGhlIHBvb2wgdG8gYmUgY29udHJvbGxlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjaGVja091dExhYmVsKCkge1xyXG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLmFuZ2xlTGFiZWxzLnBvcCgpO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGFiZWwgKTtcclxuICAgIHJldHVybiBsYWJlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib25kLWFuZ2xlIGxhYmVsIHRvIHRoZSBwb29sXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJldHVybkxhYmVsKCBsYWJlbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLmFuZ2xlTGFiZWxzLCBsYWJlbCApICk7XHJcbiAgICB0aGlzLmFuZ2xlTGFiZWxzLnB1c2goIGxhYmVsICk7XHJcbiAgICBsYWJlbC51bnNldExhYmVsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgbW9sY3VsZSB2aWV3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGVWaWV3fSBtb2xlY3VsZVZpZXdcclxuICAgKi9cclxuICBhZGRNb2xlY3VsZVZpZXcoIG1vbGVjdWxlVmlldyApIHtcclxuICAgIHRoaXMudGhyZWVTY2VuZS5hZGQoIG1vbGVjdWxlVmlldyApO1xyXG5cclxuICAgIHRoaXMubW9sZWN1bGVWaWV3LnF1YXRlcm5pb24uY29weSggdGhpcy5tb2RlbC5tb2xlY3VsZVF1YXRlcm5pb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZVZpZXcudXBkYXRlTWF0cml4KCk7XHJcbiAgICB0aGlzLm1vbGVjdWxlVmlldy51cGRhdGVNYXRyaXhXb3JsZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIG1vbGN1bGUgdmlldy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlVmlld30gbW9sZWN1bGVWaWV3XHJcbiAgICovXHJcbiAgcmVtb3ZlTW9sZWN1bGVWaWV3KCBtb2xlY3VsZVZpZXcgKSB7XHJcbiAgICB0aGlzLnRocmVlU2NlbmUucmVtb3ZlKCBtb2xlY3VsZVZpZXcgKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHNjcmVlblBvaW50XHJcbiAgICogQHJldHVybnMge1RIUkVFLlJheWNhc3Rlcn1cclxuICAgKi9cclxuICBnZXRSYXljYXN0ZXJGcm9tU2NyZWVuUG9pbnQoIHNjcmVlblBvaW50ICkge1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCBuZGNYID0gMiAqIHNjcmVlblBvaW50LnggLyB0aGlzLnNjcmVlbldpZHRoIC0gMTtcclxuICAgIGNvbnN0IG5kY1kgPSAyICogKCAxIC0gKCBzY3JlZW5Qb2ludC55IC8gdGhpcy5zY3JlZW5IZWlnaHQgKSApIC0gMTtcclxuXHJcbiAgICBjb25zdCBtb3VzZVBvaW50ID0gbmV3IFRIUkVFLlZlY3RvcjMoIG5kY1gsIG5kY1ksIDAgKTtcclxuICAgIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKCBtb3VzZVBvaW50LCB0aGlzLnRocmVlQ2FtZXJhICk7XHJcbiAgICByZXR1cm4gcmF5Y2FzdGVyO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBHbG9iYWwgPT4gTkRDXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUSFJFRS5WZWN0b3IzfSBnbG9iYWxQb2ludFxyXG4gICAqIEByZXR1cm5zIHtUSFJFRS5WZWN0b3IzfVxyXG4gICAqL1xyXG4gIGNvbnZlcnRTY3JlZW5Qb2ludEZyb21HbG9iYWxQb2ludCggZ2xvYmFsUG9pbnQgKSB7XHJcbiAgICBnbG9iYWxQb2ludC5wcm9qZWN0KCB0aGlzLnRocmVlQ2FtZXJhICk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHNjcmVlblBvaW50XHJcbiAgICogQHJldHVybnMge1JheTN9XHJcbiAgICovXHJcbiAgZ2V0UmF5RnJvbVNjcmVlblBvaW50KCBzY3JlZW5Qb2ludCApIHtcclxuICAgIGNvbnN0IHRocmVlUmF5ID0gdGhpcy5nZXRSYXljYXN0ZXJGcm9tU2NyZWVuUG9pbnQoIHNjcmVlblBvaW50ICkucmF5O1xyXG4gICAgcmV0dXJuIG5ldyBSYXkzKCBuZXcgVmVjdG9yMyggMCwgMCwgMCApLnNldCggdGhyZWVSYXkub3JpZ2luICksXHJcbiAgICAgIG5ldyBWZWN0b3IzKCAwLCAwLCAwICkuc2V0KCB0aHJlZVJheS5kaXJlY3Rpb24gKS5ub3JtYWxpemUoKSApO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQb2ludGVyfSBwb2ludGVyXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1RvdWNoIC0gV2hldGhlciB3ZSBzaG91bGQgdXNlIHRvdWNoIHJlZ2lvbnNcclxuICAgKiBAcmV0dXJucyB7UGFpckdyb3VwfG51bGx9IC0gVGhlIGNsb3Nlc3QgcGFpciBncm91cCwgb3IgbnVsbFxyXG4gICAqL1xyXG4gIGdldEVsZWN0cm9uUGFpclVuZGVyUG9pbnRlciggcG9pbnRlciwgaXNUb3VjaCApIHtcclxuICAgIGNvbnN0IHJheWNhc3RlciA9IHRoaXMuZ2V0UmF5Y2FzdGVyRnJvbVNjcmVlblBvaW50KCBwb2ludGVyLnBvaW50ICk7XHJcbiAgICBjb25zdCB3b3JsZFJheSA9IHJheWNhc3Rlci5yYXk7XHJcbiAgICBjb25zdCBjYW1lcmFPcmlnaW4gPSB3b3JsZFJheS5vcmlnaW47IC8vIFRIUkVFLlZlY3RvcjNcclxuXHJcbiAgICBsZXQgc2hvcnRlc3REaXN0YW5jZVNxdWFyZWQgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgY2xvc2VzdEdyb3VwID0gbnVsbDtcclxuXHJcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLm1vbGVjdWxlVmlldy5yYWRpYWxWaWV3cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdmlldyA9IHRoaXMubW9sZWN1bGVWaWV3LnJhZGlhbFZpZXdzWyBpIF07XHJcblxyXG4gICAgICBjb25zdCBpbnRlcnNlY3Rpb25Qb2ludCA9IHZpZXcuaW50ZXJzZWN0KCB3b3JsZFJheSwgaXNUb3VjaCApOyAvLyBUSFJFRS5WZWN0b3IzXHJcbiAgICAgIGlmICggaW50ZXJzZWN0aW9uUG9pbnQgKSB7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBjYW1lcmFPcmlnaW4uZGlzdGFuY2VUb1NxdWFyZWQoIGludGVyc2VjdGlvblBvaW50ICk7XHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZSA8IHNob3J0ZXN0RGlzdGFuY2VTcXVhcmVkICkge1xyXG4gICAgICAgICAgc2hvcnRlc3REaXN0YW5jZVNxdWFyZWQgPSBkaXN0YW5jZTtcclxuICAgICAgICAgIGNsb3Nlc3RHcm91cCA9IHZpZXcuZ3JvdXA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNsb3Nlc3RHcm91cDtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogVGhlIHBvc2l0aW9uIGluIHRoZSBtb2xlY3VsZVZpZXcncyBjb29yZGluYXRlIHN5c3RlbSAod2hlcmUgej0wIGluIHRoZSB2aWV3IGNvb3JkaW5hdGUgc3lzdGVtKSBmb3IgYVxyXG4gICAqIGNvcnJlc3BvbmRpbmcgc2NyZWVuUG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBzY3JlZW5Qb2ludFxyXG4gICAqIEByZXR1cm5zIHtUSFJFRS5WZWN0b3IzfSBpbiB0aGUgbW9sZWN1bGVWaWV3J3MgbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgKi9cclxuICBnZXRQbGFuYXJNb2xlY3VsZVBvc2l0aW9uKCBzY3JlZW5Qb2ludCApIHtcclxuICAgIGNvbnN0IGNhbWVyYVJheSA9IHRoaXMuZ2V0UmF5RnJvbVNjcmVlblBvaW50KCBzY3JlZW5Qb2ludCApO1xyXG4gICAgY29uc3QgaW50ZXJzZWN0aW9uID0gUGxhbmUzLlhZLmludGVyc2VjdFdpdGhSYXkoIGNhbWVyYVJheSApO1xyXG4gICAgY29uc3QgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyggaW50ZXJzZWN0aW9uLngsIGludGVyc2VjdGlvbi55LCAwICk7XHJcblxyXG4gICAgdGhpcy5tb2xlY3VsZVZpZXcud29ybGRUb0xvY2FsKCBwb3NpdGlvbiApO1xyXG5cclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJucyB0aGUgY2xvc2VzdCBtb2xlY3VsZSBtb2RlbC1zcGFjZSBwb2ludCBvbiB0aGUgc3BoZXJlIHdob3NlIHJhZGl1cyBpcyB0aGUgYm9uZCdzIHJhZGl1cy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHNjcmVlblBvaW50XHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGRyYWdnZWRQYXJ0aWNsZVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIGdldFNwaGVyaWNhbE1vbGVjdWxlUG9zaXRpb24oIHNjcmVlblBvaW50LCBkcmFnZ2VkUGFydGljbGUgKSB7XHJcblxyXG4gICAgLy8gb3VyIG1haW4gdHJhbnNmb3JtIG1hdHJpeCBhbmQgaW52ZXJzZVxyXG4gICAgY29uc3QgdGhyZWVNYXRyaXggPSB0aGlzLm1vbGVjdWxlVmlldy5tYXRyaXguY2xvbmUoKTtcclxuICAgIGNvbnN0IHRocmVlSW52ZXJzZU1hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XHJcbiAgICB0aHJlZUludmVyc2VNYXRyaXguZ2V0SW52ZXJzZSggdGhyZWVNYXRyaXggKTtcclxuXHJcbiAgICBjb25zdCByYXljYXN0ZXIgPSB0aGlzLmdldFJheWNhc3RlckZyb21TY3JlZW5Qb2ludCggc2NyZWVuUG9pbnQgKTsgLy8ge1RIUkVFLlJheWNhc3Rlcn1cclxuXHJcbiAgICBjb25zdCByYXkgPSByYXljYXN0ZXIucmF5LmNsb25lKCk7IC8vIHtUSFJFRS5SYXl9XHJcbiAgICByYXkuYXBwbHlNYXRyaXg0KCB0aHJlZUludmVyc2VNYXRyaXggKTsgLy8gZ2xvYmFsIHRvIGxvY2FsXHJcblxyXG4gICAgY29uc3QgbG9jYWxDYW1lcmFQb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICkuc2V0KCByYXkub3JpZ2luICk7XHJcbiAgICBjb25zdCBsb2NhbENhbWVyYURpcmVjdGlvbiA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICkuc2V0KCByYXkuZGlyZWN0aW9uICkubm9ybWFsaXplKCk7XHJcblxyXG4gICAgLy8gaG93IGZhciB3ZSB3aWxsIGVuZCB1cCBmcm9tIHRoZSBjZW50ZXIgYXRvbVxyXG4gICAgY29uc3QgZmluYWxEaXN0YW5jZSA9IHRoaXMubW9kZWwubW9sZWN1bGVQcm9wZXJ0eS52YWx1ZS5nZXRJZGVhbERpc3RhbmNlRnJvbUNlbnRlciggZHJhZ2dlZFBhcnRpY2xlICk7XHJcblxyXG4gICAgLy8gb3VyIHNwaGVyZSB0byBjYXN0IG91ciByYXkgYWdhaW5zdFxyXG4gICAgY29uc3Qgc3BoZXJlID0gbmV3IFNwaGVyZTMoIG5ldyBWZWN0b3IzKCAwLCAwLCAwICksIGZpbmFsRGlzdGFuY2UgKTtcclxuXHJcbiAgICBjb25zdCBlcHNpbG9uID0gMC4wMDAwMDE7XHJcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25zID0gc3BoZXJlLmludGVyc2VjdGlvbnMoIG5ldyBSYXkzKCBsb2NhbENhbWVyYVBvc2l0aW9uLCBsb2NhbENhbWVyYURpcmVjdGlvbiApLCBlcHNpbG9uICk7XHJcbiAgICBpZiAoIGludGVyc2VjdGlvbnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBDb21wdXRlIHRoZSBwb2ludCB3aGVyZSB0aGUgY2xvc2VzdCBsaW5lIHRocm91Z2ggdGhlIGNhbWVyYSBhbmQgdGFuZ2VudCB0byBvdXIgYm91bmRpbmcgc3BoZXJlIGludGVyc2VjdHMgdGhlIHNwaGVyZVxyXG4gICAgICAgKiBpZSwgdGhpbmsgMmQuIHdlIGhhdmUgYSB1bml0IHNwaGVyZSBjZW50ZXJlZCBhdCB0aGUgb3JpZ2luLCBhbmQgYSBjYW1lcmEgYXQgKGQsMCkuIE91ciB0YW5nZW50IHBvaW50IHNhdGlzZmllcyB0d29cclxuICAgICAgICogaW1wb3J0YW50IGNvbmRpdGlvbnM6XHJcbiAgICAgICAqIC0gaXQgbGllcyBvbiB0aGUgc3BoZXJlLiB4XjIgKyB5XjIgPT0gMVxyXG4gICAgICAgKiAtIHZlY3RvciB0byB0aGUgcG9pbnQgKHgseSkgaXMgdGFuZ2VudCB0byB0aGUgdmVjdG9yIGZyb20gKHgseSkgdG8gb3VyIGNhbWVyYSAoZCwwKS4gdGh1cyAoeCx5KSAuIChkLXksIC15KSA9PSAwXHJcbiAgICAgICAqIFNvbHZlLCBhbmQgd2UgZ2V0IHggPSAxL2QgIHBsdWcgYmFjayBpbiBmb3IgeSAoY2FsbCB0aGF0IGhlaWdodCksIGFuZCB3ZSBoYXZlIG91ciAyZCBzb2x1dGlvbi5cclxuICAgICAgICpcclxuICAgICAgICogTm93LCBiYWNrIHRvIDNELiBTaW5jZSBjYW1lcmEgaXMgKDAsMCxkKSwgb3VyIHogPT0gMS9kIGFuZCBvdXIgeF4yICsgeV4yID09IChvdXIgMkQgeSA6PSBoZWlnaHQpLCB0aGVuIHJlc2NhbGUgdGhlbSBvdXQgb2YgdGhlIHVuaXQgc3BoZXJlXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgY29uc3QgZGlzdGFuY2VGcm9tQ2FtZXJhID0gbG9jYWxDYW1lcmFQb3NpdGlvbi5kaXN0YW5jZSggVmVjdG9yMy5aRVJPICk7XHJcblxyXG4gICAgICAvLyBmaXJzdCwgY2FsY3VsYXRlIGl0IGluIHVuaXQtc3BoZXJlLCBhcyBub3RlZCBhYm92ZVxyXG4gICAgICBjb25zdCBkID0gZGlzdGFuY2VGcm9tQ2FtZXJhIC8gZmluYWxEaXN0YW5jZTsgLy8gc2NhbGVkIGRpc3RhbmNlIHRvIHRoZSBjYW1lcmEgKGZyb20gdGhlIG9yaWdpbilcclxuICAgICAgY29uc3QgeiA9IDEgLyBkOyAvLyBvdXIgcmVzdWx0IHogKGRvd24tc2NhbGVkKVxyXG4gICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLnNxcnQoIGQgKiBkIC0gMSApIC8gZDsgLy8gb3VyIHJlc3VsdCAoZG93bi1zY2FsZWQpIG1hZ25pdHVkZSBvZiAoeCx5LDApLCB3aGljaCBpcyB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUgY29tcG9zZWQgb2YgYWxsIHBvaW50cyB0aGF0IGNvdWxkIGJlIHRhbmdlbnRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFNpbmNlIG91ciBjYW1lcmEgaXNuJ3QgYWN0dWFsbHkgb24gdGhlIHotYXhpcywgd2UgbmVlZCB0byBjYWxjdWxhdGUgdHdvIHZlY3RvcnMuIE9uZSBpcyB0aGUgZGlyZWN0aW9uIHRvd2FyZHNcclxuICAgICAgICogdGhlIGNhbWVyYSAocGxhbmVOb3JtYWwsIGVhc3khKSwgYW5kIHRoZSBvdGhlciBpcyB0aGUgZGlyZWN0aW9uIHBlcnBlbmRpY3VsYXIgdG8gdGhlIHBsYW5lTm9ybWFsIHRoYXQgcG9pbnRzIHRvd2FyZHNcclxuICAgICAgICogdGhlIG1vdXNlIHBvaW50ZXIgKHBsYW5lSGl0RGlyZWN0aW9uKS5cclxuICAgICAgICovXHJcblxyXG4gICAgICAvLyBpbnRlcnNlY3Qgb3VyIGNhbWVyYSByYXkgYWdhaW5zdCBvdXIgcGVycGVuZGljdWxhciBwbGFuZSAocGVycGVuZGljdWxhciB0byBvdXIgY2FtZXJhIHBvc2l0aW9uIGZyb20gdGhlIG9yaWdpbikgdG8gZGV0ZXJtaW5lIHRoZSBvcmllbnRhdGlvbnNcclxuICAgICAgY29uc3QgcGxhbmVOb3JtYWwgPSBsb2NhbENhbWVyYVBvc2l0aW9uLm5vcm1hbGl6ZWQoKTtcclxuICAgICAgY29uc3QgdCA9IC0oIGxvY2FsQ2FtZXJhUG9zaXRpb24ubWFnbml0dWRlICkgLyAoIHBsYW5lTm9ybWFsLmRvdCggbG9jYWxDYW1lcmFEaXJlY3Rpb24gKSApO1xyXG4gICAgICBjb25zdCBwbGFuZUhpdERpcmVjdGlvbiA9IGxvY2FsQ2FtZXJhUG9zaXRpb24ucGx1cyggbG9jYWxDYW1lcmFEaXJlY3Rpb24udGltZXMoIHQgKSApLm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAgIC8vIHVzZSB0aGUgYWJvdmUgcGxhbmUgaGl0IGRpcmVjdGlvbiAocGVycGVuZGljdWxhciB0byB0aGUgY2FtZXJhKSBhbmQgcGxhbmUgbm9ybWFsIChjb2xsaW5lYXIgd2l0aCB0aGUgY2FtZXJhKSB0byBjYWxjdWxhdGUgdGhlIHJlc3VsdFxyXG4gICAgICBjb25zdCBkb3duc2NhbGVkUmVzdWx0ID0gcGxhbmVIaXREaXJlY3Rpb24udGltZXMoIGhlaWdodCApLnBsdXMoIHBsYW5lTm9ybWFsLnRpbWVzKCB6ICkgKTtcclxuXHJcbiAgICAgIC8vIHNjYWxlIGl0IGJhY2sgdG8gb3VyIHNpemVkIHNwaGVyZVxyXG4gICAgICByZXR1cm4gZG93bnNjYWxlZFJlc3VsdC50aW1lcyggZmluYWxEaXN0YW5jZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHBpY2sgdGhlIGhpdFBvaW50IGNsb3NlciB0byBvdXIgY3VycmVudCBwb2ludCAod29uJ3QgZmxpcCB0byB0aGUgb3RoZXIgc2lkZSBvZiBvdXIgc3BoZXJlKVxyXG4gICAgICByZXR1cm4gaW50ZXJzZWN0aW9uc1sgMCBdLmhpdFBvaW50LmRpc3RhbmNlKCBkcmFnZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApIDwgaW50ZXJzZWN0aW9uc1sgMSBdLmhpdFBvaW50LmRpc3RhbmNlKCBkcmFnZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApID9cclxuICAgICAgICAgICAgIGludGVyc2VjdGlvbnNbIDAgXS5oaXRQb2ludCA6XHJcbiAgICAgICAgICAgICBpbnRlcnNlY3Rpb25zWyAxIF0uaGl0UG9pbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgbGF5b3V0KCB2aWV3Qm91bmRzICkge1xyXG4gICAgc3VwZXIubGF5b3V0KCB2aWV3Qm91bmRzICk7XHJcblxyXG4gICAgY29uc3Qgc2ltRGltZW5zaW9ucyA9IHBoZXQuam9pc3Quc2ltLmRpbWVuc2lvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3Qgd2lkdGggPSBzaW1EaW1lbnNpb25zLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gc2ltRGltZW5zaW9ucy5oZWlnaHQ7XHJcblxyXG4gICAgdGhpcy50aHJlZVJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcclxuXHJcbiAgICB0aGlzLmJhY2tncm91bmRFdmVudFRhcmdldC5zZXRSZWN0Qm91bmRzKCB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIG5ldyBCb3VuZHMyKCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICkgKSApO1xyXG5cclxuICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIC8vIGZpZWxkIG9mIHZpZXcgKEZPVikgY29tcHV0YXRpb24gZm9yIHRoZSBpc29tZXRyaWMgdmlldyBzY2FsaW5nIHdlIHVzZVxyXG4gICAgY29uc3Qgc3ggPSB3aWR0aCAvIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoO1xyXG4gICAgY29uc3Qgc3kgPSBoZWlnaHQgLyB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQ7XHJcbiAgICBpZiAoIHN4ICE9PSAwICYmIHN5ICE9PSAwICkge1xyXG4gICAgICB0aGlzLmFjdGl2ZVNjYWxlID0gc3kgPiBzeCA/IHN4IDogc3k7XHJcblxyXG4gICAgICB0aGlzLmxheW91dExpc3RlbmVyKCk7XHJcblxyXG4gICAgICB0aGlzLm92ZXJsYXlDYW1lcmEubGVmdCA9IDA7XHJcbiAgICAgIHRoaXMub3ZlcmxheUNhbWVyYS5yaWdodCA9IHdpZHRoO1xyXG4gICAgICB0aGlzLm92ZXJsYXlDYW1lcmEudG9wID0gMDsgLy8gd2lsbCB0aGlzIGludmVyc2lvbiB3b3JrP1xyXG4gICAgICB0aGlzLm92ZXJsYXlDYW1lcmEuYm90dG9tID0gaGVpZ2h0O1xyXG4gICAgICB0aGlzLm92ZXJsYXlDYW1lcmEubmVhciA9IDE7XHJcbiAgICAgIHRoaXMub3ZlcmxheUNhbWVyYS5mYXIgPSAxMDA7XHJcblxyXG4gICAgICAvLyB0aHJlZS5qcyByZXF1aXJlcyB0aGlzIHRvIGJlIGNhbGxlZCBhZnRlciBjaGFuZ2luZyB0aGUgcGFyYW1ldGVyc1xyXG4gICAgICB0aGlzLm92ZXJsYXlDYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggIXRoaXMuaGFzU3RlcHBlZCAmJiAhcGhldC5qb2lzdC5zaW0uZnJhbWVFbmRlZEVtaXR0ZXIuaGFzTGlzdGVuZXIoIHRoaXMuaW5pdGlhbFN0ZXBMaXN0ZW5lciApICkge1xyXG4gICAgICBwaGV0LmpvaXN0LnNpbS5mcmFtZUVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5pbml0aWFsU3RlcExpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBBbW91bnQgb2YgdGltZSBlbGFwc2VkXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICB0aGlzLm1vbGVjdWxlVmlldy51cGRhdGVWaWV3KCk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoIHVuZGVmaW5lZCApO1xyXG5cclxuICAgIGlmICggIXRoaXMuaGFzU3RlcHBlZCApIHtcclxuICAgICAgcGhldC5qb2lzdC5zaW0uZnJhbWVFbmRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuaW5pdGlhbFN0ZXBMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmhhc1N0ZXBwZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVycyB0aGUgc2ltdWxhdGlvbiB0byBhIHNwZWNpZmljIHJlbmRlcmluZyB0YXJnZXRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RIUkVFLldlYkdMUmVuZGVyVGFyZ2V0fHVuZGVmaW5lZH0gdGFyZ2V0IC0gdW5kZWZpbmVkIGZvciB0aGUgZGVmYXVsdCB0YXJnZXRcclxuICAgKi9cclxuICByZW5kZXIoIHRhcmdldCApIHtcclxuICAgIC8vIHJlbmRlciB0aGUgM0Qgc2NlbmUgZmlyc3RcclxuICAgIHRoaXMudGhyZWVSZW5kZXJlci5yZW5kZXIoIHRoaXMudGhyZWVTY2VuZSwgdGhpcy50aHJlZUNhbWVyYSwgdGFyZ2V0ICk7XHJcbiAgICB0aGlzLnRocmVlUmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XHJcbiAgICAvLyB0aGVuIHJlbmRlciB0aGUgMkQgb3ZlcmxheSBvbiB0b3AsIHdpdGhvdXQgY2xlYXJpbmcgdGhlIENhbnZhcyBpbi1iZXR3ZWVuXHJcbiAgICB0aGlzLnRocmVlUmVuZGVyZXIucmVuZGVyKCB0aGlzLm92ZXJsYXlTY2VuZSwgdGhpcy5vdmVybGF5Q2FtZXJhLCB0YXJnZXQgKTtcclxuICAgIHRoaXMudGhyZWVSZW5kZXJlci5hdXRvQ2xlYXIgPSB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpYyAtIHdoZXJlIG91ciBjYW1lcmEgaXMgcG9zaXRpb25lZCBpbiB3b3JsZCBjb29yZGluYXRlcyAobWFudWFsbHkgdHVuZWQpXHJcbk1vbGVjdWxlU2hhcGVzU2NyZWVuVmlldy5jYW1lcmFQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLjEyICogNTAsIC0wLjAyNSAqIDUwLCA0MCApO1xyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdNb2xlY3VsZVNoYXBlc1NjcmVlblZpZXcnLCBNb2xlY3VsZVNoYXBlc1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3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