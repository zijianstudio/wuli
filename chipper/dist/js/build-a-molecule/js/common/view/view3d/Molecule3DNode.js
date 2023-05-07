// Copyright 2020-2023, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Bounds3 from '../../../../../dot/js/Bounds3.js';
import Matrix3, { m3 } from '../../../../../dot/js/Matrix3.js';
import Quaternion from '../../../../../dot/js/Quaternion.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { Arc, EllipticalArc } from '../../../../../kite/js/imports.js';
import { Color, DOM, Utils } from '../../../../../scenery/js/imports.js';
import buildAMolecule from '../../../buildAMolecule.js';

// constants
// debug flag, specifies whether master transforms are tracked and printed to determine "pretty" setup transformations
const GRAB_INITIAL_TRANSFORMS = false;
class Molecule3DNode extends DOM {
  /**
   * @param {CompleteMolecule} completeMolecule
   * @param {Bounds2} initialBounds
   * @param {boolean} useHighRes
   */
  constructor(completeMolecule, initialBounds, useHighRes) {
    // construct with the canvas (now properly initially sized)
    const canvas = document.createElement('canvas');
    super(canvas, {
      preventTransform: true
    });

    // @private {BooleanProperty}
    this.draggingProperty = new BooleanProperty(false);

    // @public {HTMLCanvasElement}
    this.canvas = canvas;

    // @private {number}
    this.backingScale = useHighRes ? Utils.backingScale(this.context) : 1;

    // @private {CanvasRenderingContext2D}
    this.context = this.canvas.getContext('2d');
    this.canvas.className = 'canvas-3d';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.setMoleculeCanvasBounds(initialBounds);

    // @private {Array.<Vector3>} map the atoms into our enhanced format
    this.currentAtoms = completeMolecule.atoms.map(atom => {
      // similar to picometers from angstroms? hopefully?
      const v = new Vector3(atom.x3d, atom.y3d, atom.z3d).times(75);
      v.element = atom.element;
      v.covalentRadius = atom.element.covalentRadius;
      v.color = atom.element.color;
      return v;
    });
    const gradientMap = {}; // element symbol => gradient
    this.currentAtoms.forEach(atom => {
      if (!gradientMap[atom.element.symbol]) {
        gradientMap[atom.element.symbol] = this.createGradient(atom.element);
      }
    });

    // @private {Object.<string,CanvasGradient>}
    this.gradientMap = gradientMap;

    // @private {boolean}
    this.dragging = false;

    // @private {Vector2}
    this.lastPosition = Vector2.ZERO;

    // @private {Vector2}
    this.currentPosition = Vector2.ZERO;
    if (GRAB_INITIAL_TRANSFORMS) {
      // @private {Matrix3}
      this.masterMatrix = Matrix3.identity();
    }

    // center the bounds of the atoms
    const bounds3 = Bounds3.NOTHING.copy();
    this.currentAtoms.forEach(atom => {
      bounds3.includeBounds(new Bounds3(atom.x - atom.covalentRadius, atom.y - atom.covalentRadius, atom.z - atom.covalentRadius, atom.x + atom.covalentRadius, atom.y + atom.covalentRadius, atom.z + atom.covalentRadius));
    });
    const center3 = bounds3.center;
    if (center3.magnitude) {
      this.currentAtoms.forEach(atom => {
        atom.subtract(center3);
      });
    }

    // compute our outer bounds so we can properly scale our transform to fit
    let maxTotalRadius = 0;
    this.currentAtoms.forEach(atom => {
      maxTotalRadius = Math.max(maxTotalRadius, atom.magnitude + atom.covalentRadius);
    });

    // @private {number}
    this.maxTotalRadius = maxTotalRadius;
  }

  /**
   * @param {Element} element
   * @private
   *
   * @returns {*}
   */
  createGradient(element) {
    const gCenter = new Vector2(-element.covalentRadius / 5, -element.covalentRadius / 5);
    const fullRadius = gCenter.minus(new Vector2(1, 1).normalized().times(element.covalentRadius)).magnitude;
    const gradientFill = this.context.createRadialGradient(gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius);
    const baseColor = new Color(element.color);
    gradientFill.addColorStop(0, baseColor.colorUtilsBrighter(0.5).toCSS());
    gradientFill.addColorStop(0.08, baseColor.colorUtilsBrighter(0.2).toCSS());
    gradientFill.addColorStop(0.4, baseColor.colorUtilsDarker(0.1).toCSS());
    gradientFill.addColorStop(0.8, baseColor.colorUtilsDarker(0.4).toCSS());
    gradientFill.addColorStop(0.95, baseColor.colorUtilsDarker(0.6).toCSS());
    gradientFill.addColorStop(1, baseColor.colorUtilsDarker(0.4).toCSS());
    return gradientFill;
  }

  /**
   * @param {number} ra
   * @param {number} rb
   * @param {number} d
   * @param {number} theta
   *
   * @private
   * @returns {Object.<number,number>}
   */
  ellipticalArcCut(ra, rb, d, theta) {
    if (theta > Math.PI / 2) {
      // other one is in front, bail!
    }

    // 2d circle-circle intersection point (interSectionPointX,interSectionPointY)
    const interSectionPointX = (d * d + ra * ra - rb * rb) / (2 * d);
    const ixnorm = interSectionPointX * interSectionPointX / (ra * ra);
    if (ixnorm > 1) {
      // one contains the other
      return null;
    }
    const interSectionPointY = ra * Math.sqrt(1 - ixnorm);
    const interSectionPoint = new Vector2(interSectionPointX, interSectionPointY);

    // elliptical arc center
    const arcCenterX = interSectionPoint.x * Math.sin(theta);
    const arcCenterY = 0;
    const arcCenter = new Vector2(arcCenterX, arcCenterY);

    // elliptical semi-minor/major axes
    const ellipticalSemiMinor = interSectionPoint.y * Math.cos(theta);
    const ellipticalSemiMajor = interSectionPoint.y;

    // yes, tan( interSectionPointX/interSectionPointY ) converts to this, don't let your instincts tell you otherwise
    const cutoffTheta = Math.atan2(interSectionPoint.x, interSectionPoint.y);
    if (theta < cutoffTheta - 1e-7) {
      // no arc needed
      return null;
    }
    const nx = interSectionPoint.x / (ra * Math.sin(theta));

    // start angle for our elliptical arc (from our ra circle's parametric frame)
    const startAngle = Math.acos(nx);

    // start angle for our elliptical arc (from the elliptical arc's parametric frame)
    const alpha = Math.atan2(ra * Math.sqrt(1 - nx * nx) / ellipticalSemiMajor, (ra * nx - arcCenter.x) / ellipticalSemiMinor);
    assert && assert(isFinite(ellipticalSemiMinor));
    return {
      interSectionPointX: interSectionPoint.x,
      arcCenterX: arcCenter.x,
      arcCenterY: arcCenter.y,
      ellipticalSemiMinor: ellipticalSemiMinor,
      ellipticalSemiMajor: ellipticalSemiMajor,
      startAngle: startAngle,
      alpha: alpha
    };
  }

  /**
   * Visually create the molecule 3D Node
   * @public
   *
   * @return
   */
  draw() {
    const canvas = this.canvas;
    const context = this.context;
    const width = canvas.width;
    const height = canvas.height;
    const midX = width / 2;
    const midY = height / 2;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    const bigScale = width / this.maxTotalRadius / 2.5;
    context.setTransform(bigScale, 0, 0, bigScale, midX - bigScale * midX, midY - bigScale * midY);
    const atoms = _.sortBy(this.currentAtoms, v => {
      return v.z;
    });
    for (let i = 0; i < atoms.length; i++) {
      const atom = atoms[i];
      let arcs = [];

      // check each atom behind this one for occlusion
      for (let k = 0; k < i; k++) {
        const otherAtom = atoms[k];
        const delta = otherAtom.minus(atom);
        const d = delta.magnitude;
        if (d < atom.covalentRadius + otherAtom.covalentRadius - 1e-7) {
          const theta = delta.angleBetween(new Vector3(0, 0, -1));
          const arcData = this.ellipticalArcCut(atom.covalentRadius, otherAtom.covalentRadius, d, theta);
          if (arcData) {
            // angle to center of ellipse
            const phi = Math.atan2(delta.y, delta.x);
            const center = new Vector2(arcData.arcCenterX, arcData.arcCenterY).rotated(phi);
            arcs.push({
              center: center,
              rx: arcData.ellipticalSemiMinor,
              ry: arcData.ellipticalSemiMajor,
              rotation: phi,
              circleStart: phi - arcData.startAngle,
              circleEnd: phi + arcData.startAngle,
              ellipseStart: -arcData.alpha,
              ellipseEnd: arcData.alpha
            });
          }
        }
      }
      arcs = _.sortBy(arcs, arc => {
        return arc.circleStart;
      });
      context.save();
      context.translate(midX + atom.x, midY + atom.y);
      context.beginPath();
      let arc;
      let ellipticalArc;
      if (arcs.length) {
        for (let j = 0; j < arcs.length; j++) {
          ellipticalArc = new EllipticalArc(arcs[j].center, arcs[j].rx, arcs[j].ry, arcs[j].rotation, arcs[j].ellipseStart, arcs[j].ellipseEnd, false);
          const atEnd = j + 1 === arcs.length;
          arc = new Arc(Vector2.ZERO, atom.covalentRadius, arcs[j].circleEnd, atEnd ? arcs[0].circleStart + Math.PI * 2 : arcs[j + 1].circleStart, false);
          ellipticalArc.writeToContext(context);
          arc.writeToContext(context);
        }
      } else {
        arc = new Arc(Vector2.ZERO, atom.covalentRadius, 0, Math.PI * 2, false);
        arc.writeToContext(context);
      }
      context.fillStyle = this.gradientMap[atom.element.symbol];
      context.fill();
      context.restore();
    }
  }

  /**
   * @param {number} timeElapsed
   *
   * @public
   */
  tick(timeElapsed) {
    let matrix;
    if (!this.dragging && this.currentPosition.equals(this.lastPosition)) {
      matrix = Matrix3.rotationY(timeElapsed);
    } else {
      const correctScale = 4 / this.canvas.width;
      const delta = this.currentPosition.minus(this.lastPosition);
      const quat = Quaternion.fromEulerAngles(-delta.y * correctScale,
      // yaw
      delta.x * correctScale,
      // roll
      0 // pitch
      );

      matrix = quat.toRotationMatrix();
      this.lastPosition = this.currentPosition;
    }
    this.transformMolecule(matrix);
    this.draw();
  }

  /**
   * Transform matrix of molecule
   * @param {Matrix3} matrix
   *
   * @public
   */
  transformMolecule(matrix) {
    this.currentAtoms.forEach(atom => {
      matrix.multiplyVector3(atom);
    });
    if (GRAB_INITIAL_TRANSFORMS) {
      this.masterMatrix = matrix.timesMatrix(this.masterMatrix);
    }
  }

  /**
   * Set the bounds of the canvas
   * @param {Bounds2} globalBounds
   *
   * @private
   */
  setMoleculeCanvasBounds(globalBounds) {
    this.canvas.width = globalBounds.width * this.backingScale;
    this.canvas.height = globalBounds.height * this.backingScale;
    this.canvas.style.width = `${globalBounds.width}px`;
    this.canvas.style.height = `${globalBounds.height}px`;
    this.canvas.style.left = `${globalBounds.x}px`;
    this.canvas.style.top = `${globalBounds.y}px`;
  }
}

// @public {Matrix3} Custom transforms for specific molecules to correct the molecule orientation for viewing purposes
Molecule3DNode.initialTransforms = {
  H2O: m3(0.181499678570479, -0.7277838769374022, -0.6613535326501101, 0.7878142178395282, 0.5101170681131106, -0.34515117700738, 0.58856318679366, -0.45837888835509194, 0.6659445696615028),
  NH3: m3(0.7256419599759283, 0.18308950432030757, -0.6632661451710371, 0.6790637847806467, -0.03508484396138366, 0.7332403629940194, 0.11097802540002322, -0.9824699929931513, -0.14978848669494887),
  H2S: m3(-0.18901936694052257, 0.7352299497445054, 0.6509290283280481, 0.6994305856321851, 0.5660811210546954, -0.43629006436965734, -0.689252156183515, 0.37281239971888375, -0.6212426094628606),
  CH3Cl: m3(0.8825247704702878, 0.05173884188266961, 0.46741108432194184, 0.015533653906035873, 0.9901797180758173, -0.13893463033968592, -0.47000929257058355, 0.1298738547666077, 0.8730544351558881),
  CH3F: m3(0.8515386742425068, -0.44125646463954543, 0.28315122935126347, 0.055477678905364106, 0.6128668569406603, 0.7882362861521655, -0.5213483608995008, -0.655505109116242, 0.5463597153066077),
  CH2O: m3(0.9997368891917565, -0.012558335901566027, -0.0191948062917274, -0.015732100867540004, 0.23358296278915427, -0.9722095969989872, 0.016692914409624237, 0.9722557727748514, 0.2333239355798916),
  H2O2: m3(0.9883033386786668, -0.039050026510889416, -0.14741643797796108, 0.1506915835923199, 0.10160579587128599, 0.9833454677171222, -0.023421302078455858, -0.9940580253058, 0.10630185762294211),
  CH4: m3(0.04028853904441277, -0.7991322177464342, 0.599803744721005, 0.9515438854789072, -0.1524692943075213, -0.26705308142966117, 0.30486237489952345, 0.5814987642747301, 0.7542666103690375),
  SiH4: m3(0.7844433940344874, -0.04637688489644025, 0.618464021672209, -0.3857973635912633, 0.7442945323255373, 0.5451477262140444, -0.48560164312087234, -0.6662393216387146, 0.5659648491741326),
  PH3: m3(-0.37692852482667016, -0.8939295609213261, 0.2425176844747532, 0.6824536128696786, -0.09100534451766336, 0.7252414036376821, -0.6262443240885491, 0.43887124237095504, 0.6443679687621515),
  C2H4O2: m3(0.9805217599814635, -0.1819063689114493, -0.0740753073048013, -0.18587417218418828, -0.7375332180401017, -0.6492268820696543, 0.06346550494317185, 0.6503497714587849, -0.7569790647339203)
};
buildAMolecule.register('Molecule3DNode', Molecule3DNode);
export default Molecule3DNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJCb3VuZHMzIiwiTWF0cml4MyIsIm0zIiwiUXVhdGVybmlvbiIsIlZlY3RvcjIiLCJWZWN0b3IzIiwiQXJjIiwiRWxsaXB0aWNhbEFyYyIsIkNvbG9yIiwiRE9NIiwiVXRpbHMiLCJidWlsZEFNb2xlY3VsZSIsIkdSQUJfSU5JVElBTF9UUkFOU0ZPUk1TIiwiTW9sZWN1bGUzRE5vZGUiLCJjb25zdHJ1Y3RvciIsImNvbXBsZXRlTW9sZWN1bGUiLCJpbml0aWFsQm91bmRzIiwidXNlSGlnaFJlcyIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInByZXZlbnRUcmFuc2Zvcm0iLCJkcmFnZ2luZ1Byb3BlcnR5IiwiYmFja2luZ1NjYWxlIiwiY29udGV4dCIsImdldENvbnRleHQiLCJjbGFzc05hbWUiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInNldE1vbGVjdWxlQ2FudmFzQm91bmRzIiwiY3VycmVudEF0b21zIiwiYXRvbXMiLCJtYXAiLCJhdG9tIiwidiIsIngzZCIsInkzZCIsInozZCIsInRpbWVzIiwiZWxlbWVudCIsImNvdmFsZW50UmFkaXVzIiwiY29sb3IiLCJncmFkaWVudE1hcCIsImZvckVhY2giLCJzeW1ib2wiLCJjcmVhdGVHcmFkaWVudCIsImRyYWdnaW5nIiwibGFzdFBvc2l0aW9uIiwiWkVSTyIsImN1cnJlbnRQb3NpdGlvbiIsIm1hc3Rlck1hdHJpeCIsImlkZW50aXR5IiwiYm91bmRzMyIsIk5PVEhJTkciLCJjb3B5IiwiaW5jbHVkZUJvdW5kcyIsIngiLCJ5IiwieiIsImNlbnRlcjMiLCJjZW50ZXIiLCJtYWduaXR1ZGUiLCJzdWJ0cmFjdCIsIm1heFRvdGFsUmFkaXVzIiwiTWF0aCIsIm1heCIsImdDZW50ZXIiLCJmdWxsUmFkaXVzIiwibWludXMiLCJub3JtYWxpemVkIiwiZ3JhZGllbnRGaWxsIiwiY3JlYXRlUmFkaWFsR3JhZGllbnQiLCJiYXNlQ29sb3IiLCJhZGRDb2xvclN0b3AiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ0b0NTUyIsImNvbG9yVXRpbHNEYXJrZXIiLCJlbGxpcHRpY2FsQXJjQ3V0IiwicmEiLCJyYiIsImQiLCJ0aGV0YSIsIlBJIiwiaW50ZXJTZWN0aW9uUG9pbnRYIiwiaXhub3JtIiwiaW50ZXJTZWN0aW9uUG9pbnRZIiwic3FydCIsImludGVyU2VjdGlvblBvaW50IiwiYXJjQ2VudGVyWCIsInNpbiIsImFyY0NlbnRlclkiLCJhcmNDZW50ZXIiLCJlbGxpcHRpY2FsU2VtaU1pbm9yIiwiY29zIiwiZWxsaXB0aWNhbFNlbWlNYWpvciIsImN1dG9mZlRoZXRhIiwiYXRhbjIiLCJueCIsInN0YXJ0QW5nbGUiLCJhY29zIiwiYWxwaGEiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsImRyYXciLCJ3aWR0aCIsImhlaWdodCIsIm1pZFgiLCJtaWRZIiwic2V0VHJhbnNmb3JtIiwiY2xlYXJSZWN0IiwiYmlnU2NhbGUiLCJfIiwic29ydEJ5IiwiaSIsImxlbmd0aCIsImFyY3MiLCJrIiwib3RoZXJBdG9tIiwiZGVsdGEiLCJhbmdsZUJldHdlZW4iLCJhcmNEYXRhIiwicGhpIiwicm90YXRlZCIsInB1c2giLCJyeCIsInJ5Iiwicm90YXRpb24iLCJjaXJjbGVTdGFydCIsImNpcmNsZUVuZCIsImVsbGlwc2VTdGFydCIsImVsbGlwc2VFbmQiLCJhcmMiLCJzYXZlIiwidHJhbnNsYXRlIiwiYmVnaW5QYXRoIiwiZWxsaXB0aWNhbEFyYyIsImoiLCJhdEVuZCIsIndyaXRlVG9Db250ZXh0IiwiZmlsbFN0eWxlIiwiZmlsbCIsInJlc3RvcmUiLCJ0aWNrIiwidGltZUVsYXBzZWQiLCJtYXRyaXgiLCJlcXVhbHMiLCJyb3RhdGlvblkiLCJjb3JyZWN0U2NhbGUiLCJxdWF0IiwiZnJvbUV1bGVyQW5nbGVzIiwidG9Sb3RhdGlvbk1hdHJpeCIsInRyYW5zZm9ybU1vbGVjdWxlIiwibXVsdGlwbHlWZWN0b3IzIiwidGltZXNNYXRyaXgiLCJnbG9iYWxCb3VuZHMiLCJpbml0aWFsVHJhbnNmb3JtcyIsIkgyTyIsIk5IMyIsIkgyUyIsIkNIM0NsIiwiQ0gzRiIsIkNIMk8iLCJIMk8yIiwiQ0g0IiwiU2lINCIsIlBIMyIsIkMySDRPMiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGUzRE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogM0QgTW9sZWN1bGUgZGlzcGxheSB0aGF0IHRha2VzIHVwIHRoZSBlbnRpcmUgc2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMzLmpzJztcclxuaW1wb3J0IE1hdHJpeDMsIHsgbTMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBRdWF0ZXJuaW9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9RdWF0ZXJuaW9uLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCB7IEFyYywgRWxsaXB0aWNhbEFyYyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBET00sIFV0aWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBkZWJ1ZyBmbGFnLCBzcGVjaWZpZXMgd2hldGhlciBtYXN0ZXIgdHJhbnNmb3JtcyBhcmUgdHJhY2tlZCBhbmQgcHJpbnRlZCB0byBkZXRlcm1pbmUgXCJwcmV0dHlcIiBzZXR1cCB0cmFuc2Zvcm1hdGlvbnNcclxuY29uc3QgR1JBQl9JTklUSUFMX1RSQU5TRk9STVMgPSBmYWxzZTtcclxuXHJcbmNsYXNzIE1vbGVjdWxlM0ROb2RlIGV4dGVuZHMgRE9NIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NvbXBsZXRlTW9sZWN1bGV9IGNvbXBsZXRlTW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGluaXRpYWxCb3VuZHNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUhpZ2hSZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29tcGxldGVNb2xlY3VsZSwgaW5pdGlhbEJvdW5kcywgdXNlSGlnaFJlcyApIHtcclxuICAgIC8vIGNvbnN0cnVjdCB3aXRoIHRoZSBjYW52YXMgKG5vdyBwcm9wZXJseSBpbml0aWFsbHkgc2l6ZWQpXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgc3VwZXIoIGNhbnZhcywge1xyXG4gICAgICBwcmV2ZW50VHJhbnNmb3JtOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0Jvb2xlYW5Qcm9wZXJ0eX1cclxuICAgIHRoaXMuZHJhZ2dpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7SFRNTENhbnZhc0VsZW1lbnR9XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5iYWNraW5nU2NhbGUgPSB1c2VIaWdoUmVzID8gVXRpbHMuYmFja2luZ1NjYWxlKCB0aGlzLmNvbnRleHQgKSA6IDE7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1cclxuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICAgIHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9ICdjYW52YXMtM2QnO1xyXG4gICAgdGhpcy5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9ICcwJztcclxuICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvcCA9ICcwJztcclxuICAgIHRoaXMuc2V0TW9sZWN1bGVDYW52YXNCb3VuZHMoIGluaXRpYWxCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFZlY3RvcjM+fSBtYXAgdGhlIGF0b21zIGludG8gb3VyIGVuaGFuY2VkIGZvcm1hdFxyXG4gICAgdGhpcy5jdXJyZW50QXRvbXMgPSBjb21wbGV0ZU1vbGVjdWxlLmF0b21zLm1hcCggYXRvbSA9PiB7XHJcblxyXG4gICAgICAvLyBzaW1pbGFyIHRvIHBpY29tZXRlcnMgZnJvbSBhbmdzdHJvbXM/IGhvcGVmdWxseT9cclxuICAgICAgY29uc3QgdiA9IG5ldyBWZWN0b3IzKCBhdG9tLngzZCwgYXRvbS55M2QsIGF0b20uejNkICkudGltZXMoIDc1ICk7XHJcbiAgICAgIHYuZWxlbWVudCA9IGF0b20uZWxlbWVudDtcclxuICAgICAgdi5jb3ZhbGVudFJhZGl1cyA9IGF0b20uZWxlbWVudC5jb3ZhbGVudFJhZGl1cztcclxuICAgICAgdi5jb2xvciA9IGF0b20uZWxlbWVudC5jb2xvcjtcclxuICAgICAgcmV0dXJuIHY7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZ3JhZGllbnRNYXAgPSB7fTsgLy8gZWxlbWVudCBzeW1ib2wgPT4gZ3JhZGllbnRcclxuICAgIHRoaXMuY3VycmVudEF0b21zLmZvckVhY2goIGF0b20gPT4ge1xyXG4gICAgICBpZiAoICFncmFkaWVudE1hcFsgYXRvbS5lbGVtZW50LnN5bWJvbCBdICkge1xyXG4gICAgICAgIGdyYWRpZW50TWFwWyBhdG9tLmVsZW1lbnQuc3ltYm9sIF0gPSB0aGlzLmNyZWF0ZUdyYWRpZW50KCBhdG9tLmVsZW1lbnQgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3QuPHN0cmluZyxDYW52YXNHcmFkaWVudD59XHJcbiAgICB0aGlzLmdyYWRpZW50TWFwID0gZ3JhZGllbnRNYXA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1ZlY3RvcjJ9XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IFZlY3RvcjIuWkVSTztcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn1cclxuICAgIHRoaXMuY3VycmVudFBvc2l0aW9uID0gVmVjdG9yMi5aRVJPO1xyXG5cclxuICAgIGlmICggR1JBQl9JTklUSUFMX1RSQU5TRk9STVMgKSB7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZSB7TWF0cml4M31cclxuICAgICAgdGhpcy5tYXN0ZXJNYXRyaXggPSBNYXRyaXgzLmlkZW50aXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2VudGVyIHRoZSBib3VuZHMgb2YgdGhlIGF0b21zXHJcbiAgICBjb25zdCBib3VuZHMzID0gQm91bmRzMy5OT1RISU5HLmNvcHkoKTtcclxuICAgIHRoaXMuY3VycmVudEF0b21zLmZvckVhY2goIGF0b20gPT4ge1xyXG4gICAgICBib3VuZHMzLmluY2x1ZGVCb3VuZHMoIG5ldyBCb3VuZHMzKCBhdG9tLnggLSBhdG9tLmNvdmFsZW50UmFkaXVzLCBhdG9tLnkgLSBhdG9tLmNvdmFsZW50UmFkaXVzLFxyXG4gICAgICAgIGF0b20ueiAtIGF0b20uY292YWxlbnRSYWRpdXMsIGF0b20ueCArIGF0b20uY292YWxlbnRSYWRpdXMsIGF0b20ueSArIGF0b20uY292YWxlbnRSYWRpdXMsXHJcbiAgICAgICAgYXRvbS56ICsgYXRvbS5jb3ZhbGVudFJhZGl1cyApICk7XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjZW50ZXIzID0gYm91bmRzMy5jZW50ZXI7XHJcbiAgICBpZiAoIGNlbnRlcjMubWFnbml0dWRlICkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRBdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuICAgICAgICBhdG9tLnN1YnRyYWN0KCBjZW50ZXIzICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb21wdXRlIG91ciBvdXRlciBib3VuZHMgc28gd2UgY2FuIHByb3Blcmx5IHNjYWxlIG91ciB0cmFuc2Zvcm0gdG8gZml0XHJcbiAgICBsZXQgbWF4VG90YWxSYWRpdXMgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50QXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIG1heFRvdGFsUmFkaXVzID0gTWF0aC5tYXgoIG1heFRvdGFsUmFkaXVzLCBhdG9tLm1hZ25pdHVkZSArIGF0b20uY292YWxlbnRSYWRpdXMgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5tYXhUb3RhbFJhZGl1cyA9IG1heFRvdGFsUmFkaXVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUdyYWRpZW50KCBlbGVtZW50ICkge1xyXG4gICAgY29uc3QgZ0NlbnRlciA9IG5ldyBWZWN0b3IyKCAtZWxlbWVudC5jb3ZhbGVudFJhZGl1cyAvIDUsIC1lbGVtZW50LmNvdmFsZW50UmFkaXVzIC8gNSApO1xyXG4gICAgY29uc3QgZnVsbFJhZGl1cyA9IGdDZW50ZXIubWludXMoIG5ldyBWZWN0b3IyKCAxLCAxICkubm9ybWFsaXplZCgpLnRpbWVzKCBlbGVtZW50LmNvdmFsZW50UmFkaXVzICkgKS5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCBncmFkaWVudEZpbGwgPSB0aGlzLmNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQoIGdDZW50ZXIueCwgZ0NlbnRlci55LCAwLCBnQ2VudGVyLngsIGdDZW50ZXIueSwgZnVsbFJhZGl1cyApO1xyXG5cclxuICAgIGNvbnN0IGJhc2VDb2xvciA9IG5ldyBDb2xvciggZWxlbWVudC5jb2xvciApO1xyXG4gICAgZ3JhZGllbnRGaWxsLmFkZENvbG9yU3RvcCggMCwgYmFzZUNvbG9yLmNvbG9yVXRpbHNCcmlnaHRlciggMC41ICkudG9DU1MoKSApO1xyXG4gICAgZ3JhZGllbnRGaWxsLmFkZENvbG9yU3RvcCggMC4wOCwgYmFzZUNvbG9yLmNvbG9yVXRpbHNCcmlnaHRlciggMC4yICkudG9DU1MoKSApO1xyXG4gICAgZ3JhZGllbnRGaWxsLmFkZENvbG9yU3RvcCggMC40LCBiYXNlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggMC4xICkudG9DU1MoKSApO1xyXG4gICAgZ3JhZGllbnRGaWxsLmFkZENvbG9yU3RvcCggMC44LCBiYXNlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggMC40ICkudG9DU1MoKSApO1xyXG4gICAgZ3JhZGllbnRGaWxsLmFkZENvbG9yU3RvcCggMC45NSwgYmFzZUNvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIDAuNiApLnRvQ1NTKCkgKTtcclxuICAgIGdyYWRpZW50RmlsbC5hZGRDb2xvclN0b3AoIDEsIGJhc2VDb2xvci5jb2xvclV0aWxzRGFya2VyKCAwLjQgKS50b0NTUygpICk7XHJcbiAgICByZXR1cm4gZ3JhZGllbnRGaWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJiXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhldGFcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge09iamVjdC48bnVtYmVyLG51bWJlcj59XHJcbiAgICovXHJcbiAgZWxsaXB0aWNhbEFyY0N1dCggcmEsIHJiLCBkLCB0aGV0YSApIHtcclxuICAgIGlmICggdGhldGEgPiBNYXRoLlBJIC8gMiApIHtcclxuICAgICAgLy8gb3RoZXIgb25lIGlzIGluIGZyb250LCBiYWlsIVxyXG4gICAgfVxyXG5cclxuICAgIC8vIDJkIGNpcmNsZS1jaXJjbGUgaW50ZXJzZWN0aW9uIHBvaW50IChpbnRlclNlY3Rpb25Qb2ludFgsaW50ZXJTZWN0aW9uUG9pbnRZKVxyXG4gICAgY29uc3QgaW50ZXJTZWN0aW9uUG9pbnRYID0gKCBkICogZCArIHJhICogcmEgLSByYiAqIHJiICkgLyAoIDIgKiBkICk7XHJcbiAgICBjb25zdCBpeG5vcm0gPSBpbnRlclNlY3Rpb25Qb2ludFggKiBpbnRlclNlY3Rpb25Qb2ludFggLyAoIHJhICogcmEgKTtcclxuICAgIGlmICggaXhub3JtID4gMSApIHtcclxuICAgICAgLy8gb25lIGNvbnRhaW5zIHRoZSBvdGhlclxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnN0IGludGVyU2VjdGlvblBvaW50WSA9IHJhICogTWF0aC5zcXJ0KCAxIC0gaXhub3JtICk7XHJcbiAgICBjb25zdCBpbnRlclNlY3Rpb25Qb2ludCA9IG5ldyBWZWN0b3IyKCBpbnRlclNlY3Rpb25Qb2ludFgsIGludGVyU2VjdGlvblBvaW50WSApO1xyXG5cclxuICAgIC8vIGVsbGlwdGljYWwgYXJjIGNlbnRlclxyXG4gICAgY29uc3QgYXJjQ2VudGVyWCA9IGludGVyU2VjdGlvblBvaW50LnggKiBNYXRoLnNpbiggdGhldGEgKTtcclxuICAgIGNvbnN0IGFyY0NlbnRlclkgPSAwO1xyXG4gICAgY29uc3QgYXJjQ2VudGVyID0gbmV3IFZlY3RvcjIoIGFyY0NlbnRlclgsIGFyY0NlbnRlclkgKTtcclxuXHJcbiAgICAvLyBlbGxpcHRpY2FsIHNlbWktbWlub3IvbWFqb3IgYXhlc1xyXG4gICAgY29uc3QgZWxsaXB0aWNhbFNlbWlNaW5vciA9IGludGVyU2VjdGlvblBvaW50LnkgKiBNYXRoLmNvcyggdGhldGEgKTtcclxuICAgIGNvbnN0IGVsbGlwdGljYWxTZW1pTWFqb3IgPSBpbnRlclNlY3Rpb25Qb2ludC55O1xyXG5cclxuICAgIC8vIHllcywgdGFuKCBpbnRlclNlY3Rpb25Qb2ludFgvaW50ZXJTZWN0aW9uUG9pbnRZICkgY29udmVydHMgdG8gdGhpcywgZG9uJ3QgbGV0IHlvdXIgaW5zdGluY3RzIHRlbGwgeW91IG90aGVyd2lzZVxyXG4gICAgY29uc3QgY3V0b2ZmVGhldGEgPSBNYXRoLmF0YW4yKCBpbnRlclNlY3Rpb25Qb2ludC54LCBpbnRlclNlY3Rpb25Qb2ludC55ICk7XHJcblxyXG4gICAgaWYgKCB0aGV0YSA8IGN1dG9mZlRoZXRhIC0gMWUtNyApIHtcclxuICAgICAgLy8gbm8gYXJjIG5lZWRlZFxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBueCA9IGludGVyU2VjdGlvblBvaW50LnggLyAoIHJhICogTWF0aC5zaW4oIHRoZXRhICkgKTtcclxuXHJcbiAgICAvLyBzdGFydCBhbmdsZSBmb3Igb3VyIGVsbGlwdGljYWwgYXJjIChmcm9tIG91ciByYSBjaXJjbGUncyBwYXJhbWV0cmljIGZyYW1lKVxyXG4gICAgY29uc3Qgc3RhcnRBbmdsZSA9IE1hdGguYWNvcyggbnggKTtcclxuXHJcbiAgICAvLyBzdGFydCBhbmdsZSBmb3Igb3VyIGVsbGlwdGljYWwgYXJjIChmcm9tIHRoZSBlbGxpcHRpY2FsIGFyYydzIHBhcmFtZXRyaWMgZnJhbWUpXHJcbiAgICBjb25zdCBhbHBoYSA9IE1hdGguYXRhbjIoIHJhICogTWF0aC5zcXJ0KCAxIC0gbnggKiBueCApIC8gZWxsaXB0aWNhbFNlbWlNYWpvciwgKCByYSAqIG54IC0gYXJjQ2VudGVyLnggKSAvIGVsbGlwdGljYWxTZW1pTWlub3IgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggZWxsaXB0aWNhbFNlbWlNaW5vciApICk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbnRlclNlY3Rpb25Qb2ludFg6IGludGVyU2VjdGlvblBvaW50LngsXHJcbiAgICAgIGFyY0NlbnRlclg6IGFyY0NlbnRlci54LFxyXG4gICAgICBhcmNDZW50ZXJZOiBhcmNDZW50ZXIueSxcclxuICAgICAgZWxsaXB0aWNhbFNlbWlNaW5vcjogZWxsaXB0aWNhbFNlbWlNaW5vcixcclxuICAgICAgZWxsaXB0aWNhbFNlbWlNYWpvcjogZWxsaXB0aWNhbFNlbWlNYWpvcixcclxuICAgICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcclxuICAgICAgYWxwaGE6IGFscGhhXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmlzdWFsbHkgY3JlYXRlIHRoZSBtb2xlY3VsZSAzRCBOb2RlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVyblxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmNhbnZhcztcclxuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XHJcblxyXG4gICAgY29uc3Qgd2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgY29uc3QgbWlkWCA9IHdpZHRoIC8gMjtcclxuICAgIGNvbnN0IG1pZFkgPSBoZWlnaHQgLyAyO1xyXG4gICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTtcclxuICAgIGNvbnRleHQuY2xlYXJSZWN0KCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICBjb25zdCBiaWdTY2FsZSA9IHdpZHRoIC8gdGhpcy5tYXhUb3RhbFJhZGl1cyAvIDIuNTtcclxuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCBiaWdTY2FsZSwgMCwgMCwgYmlnU2NhbGUsIG1pZFggLSBiaWdTY2FsZSAqIG1pZFgsIG1pZFkgLSBiaWdTY2FsZSAqIG1pZFkgKTtcclxuXHJcbiAgICBjb25zdCBhdG9tcyA9IF8uc29ydEJ5KCB0aGlzLmN1cnJlbnRBdG9tcywgdiA9PiB7XHJcbiAgICAgIHJldHVybiB2Lno7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXRvbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGF0b20gPSBhdG9tc1sgaSBdO1xyXG5cclxuICAgICAgbGV0IGFyY3MgPSBbXTtcclxuXHJcbiAgICAgIC8vIGNoZWNrIGVhY2ggYXRvbSBiZWhpbmQgdGhpcyBvbmUgZm9yIG9jY2x1c2lvblxyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBpOyBrKysgKSB7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJBdG9tID0gYXRvbXNbIGsgXTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBvdGhlckF0b20ubWludXMoIGF0b20gKTtcclxuICAgICAgICBjb25zdCBkID0gZGVsdGEubWFnbml0dWRlO1xyXG4gICAgICAgIGlmICggZCA8IGF0b20uY292YWxlbnRSYWRpdXMgKyBvdGhlckF0b20uY292YWxlbnRSYWRpdXMgLSAxZS03ICkge1xyXG4gICAgICAgICAgY29uc3QgdGhldGEgPSBkZWx0YS5hbmdsZUJldHdlZW4oIG5ldyBWZWN0b3IzKCAwLCAwLCAtMSApICk7XHJcbiAgICAgICAgICBjb25zdCBhcmNEYXRhID0gdGhpcy5lbGxpcHRpY2FsQXJjQ3V0KCBhdG9tLmNvdmFsZW50UmFkaXVzLCBvdGhlckF0b20uY292YWxlbnRSYWRpdXMsIGQsIHRoZXRhICk7XHJcbiAgICAgICAgICBpZiAoIGFyY0RhdGEgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBhbmdsZSB0byBjZW50ZXIgb2YgZWxsaXBzZVxyXG4gICAgICAgICAgICBjb25zdCBwaGkgPSBNYXRoLmF0YW4yKCBkZWx0YS55LCBkZWx0YS54ICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IG5ldyBWZWN0b3IyKCBhcmNEYXRhLmFyY0NlbnRlclgsIGFyY0RhdGEuYXJjQ2VudGVyWSApLnJvdGF0ZWQoIHBoaSApO1xyXG4gICAgICAgICAgICBhcmNzLnB1c2goIHtcclxuICAgICAgICAgICAgICBjZW50ZXI6IGNlbnRlcixcclxuICAgICAgICAgICAgICByeDogYXJjRGF0YS5lbGxpcHRpY2FsU2VtaU1pbm9yLFxyXG4gICAgICAgICAgICAgIHJ5OiBhcmNEYXRhLmVsbGlwdGljYWxTZW1pTWFqb3IsXHJcbiAgICAgICAgICAgICAgcm90YXRpb246IHBoaSxcclxuICAgICAgICAgICAgICBjaXJjbGVTdGFydDogcGhpIC0gYXJjRGF0YS5zdGFydEFuZ2xlLFxyXG4gICAgICAgICAgICAgIGNpcmNsZUVuZDogcGhpICsgYXJjRGF0YS5zdGFydEFuZ2xlLFxyXG4gICAgICAgICAgICAgIGVsbGlwc2VTdGFydDogLWFyY0RhdGEuYWxwaGEsXHJcbiAgICAgICAgICAgICAgZWxsaXBzZUVuZDogYXJjRGF0YS5hbHBoYVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGFyY3MgPSBfLnNvcnRCeSggYXJjcywgYXJjID0+IHtcclxuICAgICAgICByZXR1cm4gYXJjLmNpcmNsZVN0YXJ0O1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgICAgY29udGV4dC50cmFuc2xhdGUoIG1pZFggKyBhdG9tLngsIG1pZFkgKyBhdG9tLnkgKTtcclxuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgbGV0IGFyYztcclxuICAgICAgbGV0IGVsbGlwdGljYWxBcmM7XHJcbiAgICAgIGlmICggYXJjcy5sZW5ndGggKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgYXJjcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGVsbGlwdGljYWxBcmMgPSBuZXcgRWxsaXB0aWNhbEFyYyggYXJjc1sgaiBdLmNlbnRlcixcclxuICAgICAgICAgICAgYXJjc1sgaiBdLnJ4LCBhcmNzWyBqIF0ucnksXHJcbiAgICAgICAgICAgIGFyY3NbIGogXS5yb3RhdGlvbixcclxuICAgICAgICAgICAgYXJjc1sgaiBdLmVsbGlwc2VTdGFydCwgYXJjc1sgaiBdLmVsbGlwc2VFbmQsIGZhbHNlICk7XHJcbiAgICAgICAgICBjb25zdCBhdEVuZCA9IGogKyAxID09PSBhcmNzLmxlbmd0aDtcclxuICAgICAgICAgIGFyYyA9IG5ldyBBcmMoIFZlY3RvcjIuWkVSTywgYXRvbS5jb3ZhbGVudFJhZGl1cywgYXJjc1sgaiBdLmNpcmNsZUVuZCwgYXRFbmQgPyAoIGFyY3NbIDAgXS5jaXJjbGVTdGFydCArIE1hdGguUEkgKiAyICkgOiBhcmNzWyBqICsgMSBdLmNpcmNsZVN0YXJ0LCBmYWxzZSApO1xyXG4gICAgICAgICAgZWxsaXB0aWNhbEFyYy53cml0ZVRvQ29udGV4dCggY29udGV4dCApO1xyXG4gICAgICAgICAgYXJjLndyaXRlVG9Db250ZXh0KCBjb250ZXh0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFyYyA9IG5ldyBBcmMoIFZlY3RvcjIuWkVSTywgYXRvbS5jb3ZhbGVudFJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICk7XHJcbiAgICAgICAgYXJjLndyaXRlVG9Db250ZXh0KCBjb250ZXh0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5ncmFkaWVudE1hcFsgYXRvbS5lbGVtZW50LnN5bWJvbCBdO1xyXG4gICAgICBjb250ZXh0LmZpbGwoKTtcclxuICAgICAgY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZUVsYXBzZWRcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB0aWNrKCB0aW1lRWxhcHNlZCApIHtcclxuICAgIGxldCBtYXRyaXg7XHJcbiAgICBpZiAoICF0aGlzLmRyYWdnaW5nICYmIHRoaXMuY3VycmVudFBvc2l0aW9uLmVxdWFscyggdGhpcy5sYXN0UG9zaXRpb24gKSApIHtcclxuICAgICAgbWF0cml4ID0gTWF0cml4My5yb3RhdGlvblkoIHRpbWVFbGFwc2VkICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgY29ycmVjdFNjYWxlID0gNCAvIHRoaXMuY2FudmFzLndpZHRoO1xyXG4gICAgICBjb25zdCBkZWx0YSA9IHRoaXMuY3VycmVudFBvc2l0aW9uLm1pbnVzKCB0aGlzLmxhc3RQb3NpdGlvbiApO1xyXG4gICAgICBjb25zdCBxdWF0ID0gUXVhdGVybmlvbi5mcm9tRXVsZXJBbmdsZXMoXHJcbiAgICAgICAgLWRlbHRhLnkgKiBjb3JyZWN0U2NhbGUsIC8vIHlhd1xyXG4gICAgICAgIGRlbHRhLnggKiBjb3JyZWN0U2NhbGUsICAvLyByb2xsXHJcbiAgICAgICAgMCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBpdGNoXHJcbiAgICAgICk7XHJcbiAgICAgIG1hdHJpeCA9IHF1YXQudG9Sb3RhdGlvbk1hdHJpeCgpO1xyXG4gICAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFuc2Zvcm1Nb2xlY3VsZSggbWF0cml4ICk7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybSBtYXRyaXggb2YgbW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeFxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHRyYW5zZm9ybU1vbGVjdWxlKCBtYXRyaXggKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRBdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuICAgICAgbWF0cml4Lm11bHRpcGx5VmVjdG9yMyggYXRvbSApO1xyXG4gICAgfSApO1xyXG4gICAgaWYgKCBHUkFCX0lOSVRJQUxfVFJBTlNGT1JNUyApIHtcclxuICAgICAgdGhpcy5tYXN0ZXJNYXRyaXggPSBtYXRyaXgudGltZXNNYXRyaXgoIHRoaXMubWFzdGVyTWF0cml4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGJvdW5kcyBvZiB0aGUgY2FudmFzXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBnbG9iYWxCb3VuZHNcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0TW9sZWN1bGVDYW52YXNCb3VuZHMoIGdsb2JhbEJvdW5kcyApIHtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gZ2xvYmFsQm91bmRzLndpZHRoICogdGhpcy5iYWNraW5nU2NhbGU7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBnbG9iYWxCb3VuZHMuaGVpZ2h0ICogdGhpcy5iYWNraW5nU2NhbGU7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke2dsb2JhbEJvdW5kcy53aWR0aH1weGA7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtnbG9iYWxCb3VuZHMuaGVpZ2h0fXB4YDtcclxuICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSBgJHtnbG9iYWxCb3VuZHMueH1weGA7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgPSBgJHtnbG9iYWxCb3VuZHMueX1weGA7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHVibGljIHtNYXRyaXgzfSBDdXN0b20gdHJhbnNmb3JtcyBmb3Igc3BlY2lmaWMgbW9sZWN1bGVzIHRvIGNvcnJlY3QgdGhlIG1vbGVjdWxlIG9yaWVudGF0aW9uIGZvciB2aWV3aW5nIHB1cnBvc2VzXHJcbk1vbGVjdWxlM0ROb2RlLmluaXRpYWxUcmFuc2Zvcm1zID0ge1xyXG4gIEgyTzogbTMoIDAuMTgxNDk5Njc4NTcwNDc5LCAtMC43Mjc3ODM4NzY5Mzc0MDIyLCAtMC42NjEzNTM1MzI2NTAxMTAxLFxyXG4gICAgMC43ODc4MTQyMTc4Mzk1MjgyLCAwLjUxMDExNzA2ODExMzExMDYsIC0wLjM0NTE1MTE3NzAwNzM4LFxyXG4gICAgMC41ODg1NjMxODY3OTM2NiwgLTAuNDU4Mzc4ODg4MzU1MDkxOTQsIDAuNjY1OTQ0NTY5NjYxNTAyOCApLFxyXG4gIE5IMzogbTMoIDAuNzI1NjQxOTU5OTc1OTI4MywgMC4xODMwODk1MDQzMjAzMDc1NywgLTAuNjYzMjY2MTQ1MTcxMDM3MSxcclxuICAgIDAuNjc5MDYzNzg0NzgwNjQ2NywgLTAuMDM1MDg0ODQzOTYxMzgzNjYsIDAuNzMzMjQwMzYyOTk0MDE5NCxcclxuICAgIDAuMTEwOTc4MDI1NDAwMDIzMjIsIC0wLjk4MjQ2OTk5Mjk5MzE1MTMsIC0wLjE0OTc4ODQ4NjY5NDk0ODg3ICksXHJcbiAgSDJTOiBtMyggLTAuMTg5MDE5MzY2OTQwNTIyNTcsIDAuNzM1MjI5OTQ5NzQ0NTA1NCwgMC42NTA5MjkwMjgzMjgwNDgxLFxyXG4gICAgMC42OTk0MzA1ODU2MzIxODUxLCAwLjU2NjA4MTEyMTA1NDY5NTQsIC0wLjQzNjI5MDA2NDM2OTY1NzM0LFxyXG4gICAgLTAuNjg5MjUyMTU2MTgzNTE1LCAwLjM3MjgxMjM5OTcxODg4Mzc1LCAtMC42MjEyNDI2MDk0NjI4NjA2ICksXHJcbiAgQ0gzQ2w6IG0zKCAwLjg4MjUyNDc3MDQ3MDI4NzgsIDAuMDUxNzM4ODQxODgyNjY5NjEsIDAuNDY3NDExMDg0MzIxOTQxODQsXHJcbiAgICAwLjAxNTUzMzY1MzkwNjAzNTg3MywgMC45OTAxNzk3MTgwNzU4MTczLCAtMC4xMzg5MzQ2MzAzMzk2ODU5MixcclxuICAgIC0wLjQ3MDAwOTI5MjU3MDU4MzU1LCAwLjEyOTg3Mzg1NDc2NjYwNzcsIDAuODczMDU0NDM1MTU1ODg4MSApLFxyXG4gIENIM0Y6IG0zKCAwLjg1MTUzODY3NDI0MjUwNjgsIC0wLjQ0MTI1NjQ2NDYzOTU0NTQzLCAwLjI4MzE1MTIyOTM1MTI2MzQ3LFxyXG4gICAgMC4wNTU0Nzc2Nzg5MDUzNjQxMDYsIDAuNjEyODY2ODU2OTQwNjYwMywgMC43ODgyMzYyODYxNTIxNjU1LFxyXG4gICAgLTAuNTIxMzQ4MzYwODk5NTAwOCwgLTAuNjU1NTA1MTA5MTE2MjQyLCAwLjU0NjM1OTcxNTMwNjYwNzcgKSxcclxuICBDSDJPOiBtMyggMC45OTk3MzY4ODkxOTE3NTY1LCAtMC4wMTI1NTgzMzU5MDE1NjYwMjcsIC0wLjAxOTE5NDgwNjI5MTcyNzQsXHJcbiAgICAtMC4wMTU3MzIxMDA4Njc1NDAwMDQsIDAuMjMzNTgyOTYyNzg5MTU0MjcsIC0wLjk3MjIwOTU5Njk5ODk4NzIsXHJcbiAgICAwLjAxNjY5MjkxNDQwOTYyNDIzNywgMC45NzIyNTU3NzI3NzQ4NTE0LCAwLjIzMzMyMzkzNTU3OTg5MTYgKSxcclxuICBIMk8yOiBtMyggMC45ODgzMDMzMzg2Nzg2NjY4LCAtMC4wMzkwNTAwMjY1MTA4ODk0MTYsIC0wLjE0NzQxNjQzNzk3Nzk2MTA4LFxyXG4gICAgMC4xNTA2OTE1ODM1OTIzMTk5LCAwLjEwMTYwNTc5NTg3MTI4NTk5LCAwLjk4MzM0NTQ2NzcxNzEyMjIsXHJcbiAgICAtMC4wMjM0MjEzMDIwNzg0NTU4NTgsIC0wLjk5NDA1ODAyNTMwNTgsIDAuMTA2MzAxODU3NjIyOTQyMTEgKSxcclxuICBDSDQ6IG0zKCAwLjA0MDI4ODUzOTA0NDQxMjc3LCAtMC43OTkxMzIyMTc3NDY0MzQyLCAwLjU5OTgwMzc0NDcyMTAwNSxcclxuICAgIDAuOTUxNTQzODg1NDc4OTA3MiwgLTAuMTUyNDY5Mjk0MzA3NTIxMywgLTAuMjY3MDUzMDgxNDI5NjYxMTcsXHJcbiAgICAwLjMwNDg2MjM3NDg5OTUyMzQ1LCAwLjU4MTQ5ODc2NDI3NDczMDEsIDAuNzU0MjY2NjEwMzY5MDM3NSApLFxyXG4gIFNpSDQ6IG0zKCAwLjc4NDQ0MzM5NDAzNDQ4NzQsIC0wLjA0NjM3Njg4NDg5NjQ0MDI1LCAwLjYxODQ2NDAyMTY3MjIwOSxcclxuICAgIC0wLjM4NTc5NzM2MzU5MTI2MzMsIDAuNzQ0Mjk0NTMyMzI1NTM3MywgMC41NDUxNDc3MjYyMTQwNDQ0LFxyXG4gICAgLTAuNDg1NjAxNjQzMTIwODcyMzQsIC0wLjY2NjIzOTMyMTYzODcxNDYsIDAuNTY1OTY0ODQ5MTc0MTMyNiApLFxyXG4gIFBIMzogbTMoIC0wLjM3NjkyODUyNDgyNjY3MDE2LCAtMC44OTM5Mjk1NjA5MjEzMjYxLCAwLjI0MjUxNzY4NDQ3NDc1MzIsXHJcbiAgICAwLjY4MjQ1MzYxMjg2OTY3ODYsIC0wLjA5MTAwNTM0NDUxNzY2MzM2LCAwLjcyNTI0MTQwMzYzNzY4MjEsXHJcbiAgICAtMC42MjYyNDQzMjQwODg1NDkxLCAwLjQzODg3MTI0MjM3MDk1NTA0LCAwLjY0NDM2Nzk2ODc2MjE1MTUgKSxcclxuICBDMkg0TzI6IG0zKCAwLjk4MDUyMTc1OTk4MTQ2MzUsIC0wLjE4MTkwNjM2ODkxMTQ0OTMsIC0wLjA3NDA3NTMwNzMwNDgwMTMsXHJcbiAgICAtMC4xODU4NzQxNzIxODQxODgyOCwgLTAuNzM3NTMzMjE4MDQwMTAxNywgLTAuNjQ5MjI2ODgyMDY5NjU0MyxcclxuICAgIDAuMDYzNDY1NTA0OTQzMTcxODUsIDAuNjUwMzQ5NzcxNDU4Nzg0OSwgLTAuNzU2OTc5MDY0NzMzOTIwMyApXHJcbn07XHJcblxyXG5idWlsZEFNb2xlY3VsZS5yZWdpc3RlciggJ01vbGVjdWxlM0ROb2RlJywgTW9sZWN1bGUzRE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGUzRE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNB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