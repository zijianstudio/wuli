// Copyright 2017-2022, University of Colorado Boulder

/**
 * The balance scale used throughout Equality Explorer.
 * Origin is at the point where the beam is balanced on the fulcrum.
 * Do not attempt to position this Node via options; it positions itself based on model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Circle, HBox, Line, Node, Path } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerColors from '../EqualityExplorerColors.js';
import BoxNode from './BoxNode.js';
import ClearScaleButton from './ClearScaleButton.js';
import OrganizeButton from './OrganizeButton.js';
import PlateNode from './PlateNode.js';

// base
const BASE_WIDTH = 200;
const BASE_HEIGHT = 40;
const BASE_DEPTH = 10;

// beam
const BEAM_HEIGHT = 5;
const BEAM_DEPTH = 8;

// fulcrum that the beam is balanced on
const FULCRUM_HEIGHT = 52;
const FULCRUM_TOP_WIDTH = 15;
const FULCRUM_BOTTOM_WIDTH = 25;

// arrow
const ARROW_LENGTH = 75;
export default class BalanceScaleNode extends Node {
  constructor(scale, providedOptions) {
    const options = optionize()({
      // SelfOptions
      clearScaleButtonVisible: true,
      organizeButtonVisible: true,
      disposeTermsNotOnScale: null,
      phetioVisiblePropertyInstrumented: false,
      // NodeOptions
      tandem: Tandem.OPT_OUT
    }, providedOptions);
    options.x = scale.position.x;
    options.y = scale.position.y;

    // the fulcrum that the beam balances on
    const fulcrumTaper = FULCRUM_BOTTOM_WIDTH - FULCRUM_TOP_WIDTH;
    const fulcrumShape = new Shape().polygon([new Vector2(0, 0), new Vector2(FULCRUM_TOP_WIDTH, 0), new Vector2(FULCRUM_TOP_WIDTH + fulcrumTaper / 2, FULCRUM_HEIGHT), new Vector2(-fulcrumTaper / 2, FULCRUM_HEIGHT)]);
    const fulcrumNode = new Path(fulcrumShape, {
      stroke: 'black',
      fill: EqualityExplorerColors.SCALE_FULCRUM_FILL,
      // origin is at center-top of fulcrum
      centerX: 0,
      top: 0
    });

    // the base the supports the entire scale
    const baseNode = new BoxNode({
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      depth: BASE_DEPTH,
      stroke: 'black',
      topFill: EqualityExplorerColors.SCALE_TOP_FACE_FILL,
      frontFill: EqualityExplorerColors.SCALE_FRONT_FACE_FILL,
      centerX: fulcrumNode.centerX,
      top: fulcrumNode.bottom - BASE_DEPTH / 2
    });

    // the beam that supports a plate on either end
    const beamNode = new BoxNode({
      width: scale.beamWidth,
      height: BEAM_HEIGHT,
      depth: BEAM_DEPTH,
      stroke: 'black',
      topFill: EqualityExplorerColors.SCALE_TOP_FACE_FILL,
      frontFill: EqualityExplorerColors.SCALE_FRONT_FACE_FILL,
      centerX: baseNode.centerX,
      top: fulcrumNode.top - 0.5 * BEAM_DEPTH
    });

    // arrow at the center on the beam, points perpendicular to the beam
    const arrowNode = new ArrowNode(0, 0, 0, -ARROW_LENGTH, {
      headHeight: 20,
      headWidth: 15,
      centerX: beamNode.centerX,
      bottom: 0
    });

    // A dashed line that is perpendicular to the base.
    // When the scale is balanced, the arrow will be aligned with this line.
    const dashedLine = new Line(0, 0, 0, 1.2 * ARROW_LENGTH, {
      lineDash: [4, 4],
      stroke: 'black',
      centerX: beamNode.centerX,
      bottom: 0
    });

    // left plate
    const leftPlateNode = new PlateNode(scale.leftPlate, {
      center: beamNode.center // correct position will be set later in constructor
    });

    // right plate
    const rightPlateNode = new PlateNode(scale.rightPlate, {
      center: beamNode.center // correct position will be set later in constructor
    });

    // pressing this button clears all terms from the scale
    const clearScaleButton = new ClearScaleButton({
      listener: () => scale.clear(),
      visible: options.clearScaleButtonVisible,
      tandem: options.clearScaleButtonVisible ? options.tandem.createTandem('clearScaleButton') : Tandem.OPT_OUT
    });

    // pressing this button organizes terms on the scale, grouping like terms together
    const organizeButton = new OrganizeButton(() => scale.organize(), {
      visible: options.organizeButtonVisible,
      tandem: options.organizeButtonVisible ? options.tandem.createTandem('organizeButton') : Tandem.OPT_OUT
    });

    // Pressing either button disposes of any terms that are not already on the scale.
    if (options.disposeTermsNotOnScale) {
      clearScaleButton.addListener(options.disposeTermsNotOnScale);
      organizeButton.addListener(options.disposeTermsNotOnScale);
    }

    // Disable ClearScaleButton and OrganizeButton when the scale is empty. unlink not required.
    scale.numberOfTermsProperty.link(numberOfTerms => {
      const enabled = numberOfTerms !== 0;
      clearScaleButton.enabled = enabled;
      organizeButton.enabled = enabled;
    });

    // buttons on the front face of the base
    const buttonsParent = new HBox({
      children: [clearScaleButton, organizeButton],
      spacing: 100,
      centerX: baseNode.centerX,
      centerY: baseNode.bottom - BASE_HEIGHT / 2,
      excludeInvisibleChildrenFromBounds: false
    });
    options.children = [baseNode, buttonsParent, fulcrumNode, dashedLine, beamNode, arrowNode, leftPlateNode, rightPlateNode];

    // draw a red dot at the origin
    if (phet.chipper.queryParameters.dev) {
      options.children.push(new Circle(2, {
        fill: 'red'
      }));
    }
    super(options);

    // Adjust parts of the scale that depend on angle.
    scale.angleProperty.link((angle, oldAngle) => {
      const deltaAngle = oldAngle === null ? 0 : angle - oldAngle;

      // rotate the beam about its pivot point
      beamNode.rotateAround(new Vector2(beamNode.centerX, beamNode.centerY), deltaAngle);

      // rotate and fill the arrow
      arrowNode.rotateAround(new Vector2(beamNode.centerX, 0), deltaAngle);
      if (angle === 0) {
        arrowNode.fill = EqualityExplorerColors.SCALE_ARROW_BALANCED; // the scale is balanced
      } else if (Math.abs(angle) === scale.maxAngle) {
        arrowNode.fill = EqualityExplorerColors.SCALE_ARROW_BOTTOMED_OUT; // the scale is bottomed out
      } else {
        arrowNode.fill = EqualityExplorerColors.SCALE_ARROW_UNBALANCED; // the scale is unbalanced, but not bottomed out
      }
    });

    // Move the left plate.
    scale.leftPlate.positionProperty.link(position => {
      leftPlateNode.x = position.x - scale.position.x;
      leftPlateNode.y = position.y - scale.position.y;
    });

    // Move the right plate.
    scale.rightPlate.positionProperty.link(position => {
      rightPlateNode.x = position.x - scale.position.x;
      rightPlateNode.y = position.y - scale.position.y;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
equalityExplorer.register('BalanceScaleNode', BalanceScaleNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJvcHRpb25pemUiLCJBcnJvd05vZGUiLCJDaXJjbGUiLCJIQm94IiwiTGluZSIsIk5vZGUiLCJQYXRoIiwiVGFuZGVtIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJDb2xvcnMiLCJCb3hOb2RlIiwiQ2xlYXJTY2FsZUJ1dHRvbiIsIk9yZ2FuaXplQnV0dG9uIiwiUGxhdGVOb2RlIiwiQkFTRV9XSURUSCIsIkJBU0VfSEVJR0hUIiwiQkFTRV9ERVBUSCIsIkJFQU1fSEVJR0hUIiwiQkVBTV9ERVBUSCIsIkZVTENSVU1fSEVJR0hUIiwiRlVMQ1JVTV9UT1BfV0lEVEgiLCJGVUxDUlVNX0JPVFRPTV9XSURUSCIsIkFSUk9XX0xFTkdUSCIsIkJhbGFuY2VTY2FsZU5vZGUiLCJjb25zdHJ1Y3RvciIsInNjYWxlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNsZWFyU2NhbGVCdXR0b25WaXNpYmxlIiwib3JnYW5pemVCdXR0b25WaXNpYmxlIiwiZGlzcG9zZVRlcm1zTm90T25TY2FsZSIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRhbmRlbSIsIk9QVF9PVVQiLCJ4IiwicG9zaXRpb24iLCJ5IiwiZnVsY3J1bVRhcGVyIiwiZnVsY3J1bVNoYXBlIiwicG9seWdvbiIsImZ1bGNydW1Ob2RlIiwic3Ryb2tlIiwiZmlsbCIsIlNDQUxFX0ZVTENSVU1fRklMTCIsImNlbnRlclgiLCJ0b3AiLCJiYXNlTm9kZSIsIndpZHRoIiwiaGVpZ2h0IiwiZGVwdGgiLCJ0b3BGaWxsIiwiU0NBTEVfVE9QX0ZBQ0VfRklMTCIsImZyb250RmlsbCIsIlNDQUxFX0ZST05UX0ZBQ0VfRklMTCIsImJvdHRvbSIsImJlYW1Ob2RlIiwiYmVhbVdpZHRoIiwiYXJyb3dOb2RlIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsImRhc2hlZExpbmUiLCJsaW5lRGFzaCIsImxlZnRQbGF0ZU5vZGUiLCJsZWZ0UGxhdGUiLCJjZW50ZXIiLCJyaWdodFBsYXRlTm9kZSIsInJpZ2h0UGxhdGUiLCJjbGVhclNjYWxlQnV0dG9uIiwibGlzdGVuZXIiLCJjbGVhciIsInZpc2libGUiLCJjcmVhdGVUYW5kZW0iLCJvcmdhbml6ZUJ1dHRvbiIsIm9yZ2FuaXplIiwiYWRkTGlzdGVuZXIiLCJudW1iZXJPZlRlcm1zUHJvcGVydHkiLCJsaW5rIiwibnVtYmVyT2ZUZXJtcyIsImVuYWJsZWQiLCJidXR0b25zUGFyZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiY2VudGVyWSIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRldiIsInB1c2giLCJhbmdsZVByb3BlcnR5IiwiYW5nbGUiLCJvbGRBbmdsZSIsImRlbHRhQW5nbGUiLCJyb3RhdGVBcm91bmQiLCJTQ0FMRV9BUlJPV19CQUxBTkNFRCIsIk1hdGgiLCJhYnMiLCJtYXhBbmdsZSIsIlNDQUxFX0FSUk9XX0JPVFRPTUVEX09VVCIsIlNDQUxFX0FSUk9XX1VOQkFMQU5DRUQiLCJwb3NpdGlvblByb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsYW5jZVNjYWxlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFsYW5jZSBzY2FsZSB1c2VkIHRocm91Z2hvdXQgRXF1YWxpdHkgRXhwbG9yZXIuXHJcbiAqIE9yaWdpbiBpcyBhdCB0aGUgcG9pbnQgd2hlcmUgdGhlIGJlYW0gaXMgYmFsYW5jZWQgb24gdGhlIGZ1bGNydW0uXHJcbiAqIERvIG5vdCBhdHRlbXB0IHRvIHBvc2l0aW9uIHRoaXMgTm9kZSB2aWEgb3B0aW9uczsgaXQgcG9zaXRpb25zIGl0c2VsZiBiYXNlZCBvbiBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBIQm94LCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlckNvbG9ycyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyQ29sb3JzLmpzJztcclxuaW1wb3J0IEJhbGFuY2VTY2FsZSBmcm9tICcuLi9tb2RlbC9CYWxhbmNlU2NhbGUuanMnO1xyXG5pbXBvcnQgQm94Tm9kZSBmcm9tICcuL0JveE5vZGUuanMnO1xyXG5pbXBvcnQgQ2xlYXJTY2FsZUJ1dHRvbiBmcm9tICcuL0NsZWFyU2NhbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgT3JnYW5pemVCdXR0b24gZnJvbSAnLi9Pcmdhbml6ZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQbGF0ZU5vZGUgZnJvbSAnLi9QbGF0ZU5vZGUuanMnO1xyXG5cclxuLy8gYmFzZVxyXG5jb25zdCBCQVNFX1dJRFRIID0gMjAwO1xyXG5jb25zdCBCQVNFX0hFSUdIVCA9IDQwO1xyXG5jb25zdCBCQVNFX0RFUFRIID0gMTA7XHJcblxyXG4vLyBiZWFtXHJcbmNvbnN0IEJFQU1fSEVJR0hUID0gNTtcclxuY29uc3QgQkVBTV9ERVBUSCA9IDg7XHJcblxyXG4vLyBmdWxjcnVtIHRoYXQgdGhlIGJlYW0gaXMgYmFsYW5jZWQgb25cclxuY29uc3QgRlVMQ1JVTV9IRUlHSFQgPSA1MjtcclxuY29uc3QgRlVMQ1JVTV9UT1BfV0lEVEggPSAxNTtcclxuY29uc3QgRlVMQ1JVTV9CT1RUT01fV0lEVEggPSAyNTtcclxuXHJcbi8vIGFycm93XHJcbmNvbnN0IEFSUk9XX0xFTkdUSCA9IDc1O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBjbGVhclNjYWxlQnV0dG9uVmlzaWJsZT86IGJvb2xlYW47XHJcbiAgb3JnYW5pemVCdXR0b25WaXNpYmxlPzogYm9vbGVhbjtcclxuICBkaXNwb3NlVGVybXNOb3RPblNjYWxlPzogKCAoKSA9PiB2b2lkICkgfCBudWxsOyAvLyBjYWxsIHRoaXMgdG8gZGlzcG9zZSBvZiB0ZXJtcyB0aGF0IGFyZSBOT1Qgb24gdGhlIHNjYWxlXHJcbn07XHJcblxyXG50eXBlIEJhbGFuY2VTY2FsZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbGFuY2VTY2FsZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY2FsZTogQmFsYW5jZVNjYWxlLCBwcm92aWRlZE9wdGlvbnM/OiBCYWxhbmNlU2NhbGVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJhbGFuY2VTY2FsZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGNsZWFyU2NhbGVCdXR0b25WaXNpYmxlOiB0cnVlLFxyXG4gICAgICBvcmdhbml6ZUJ1dHRvblZpc2libGU6IHRydWUsXHJcbiAgICAgIGRpc3Bvc2VUZXJtc05vdE9uU2NhbGU6IG51bGwsXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgIFxyXG4gICAgICAvLyBOb2RlT3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zLnggPSBzY2FsZS5wb3NpdGlvbi54O1xyXG4gICAgb3B0aW9ucy55ID0gc2NhbGUucG9zaXRpb24ueTtcclxuXHJcbiAgICAvLyB0aGUgZnVsY3J1bSB0aGF0IHRoZSBiZWFtIGJhbGFuY2VzIG9uXHJcbiAgICBjb25zdCBmdWxjcnVtVGFwZXIgPSBGVUxDUlVNX0JPVFRPTV9XSURUSCAtIEZVTENSVU1fVE9QX1dJRFRIO1xyXG4gICAgY29uc3QgZnVsY3J1bVNoYXBlID0gbmV3IFNoYXBlKCkucG9seWdvbiggW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggRlVMQ1JVTV9UT1BfV0lEVEgsIDAgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIEZVTENSVU1fVE9QX1dJRFRIICsgZnVsY3J1bVRhcGVyIC8gMiwgRlVMQ1JVTV9IRUlHSFQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIC1mdWxjcnVtVGFwZXIgLyAyLCBGVUxDUlVNX0hFSUdIVCApXHJcbiAgICBdICk7XHJcbiAgICBjb25zdCBmdWxjcnVtTm9kZSA9IG5ldyBQYXRoKCBmdWxjcnVtU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLlNDQUxFX0ZVTENSVU1fRklMTCxcclxuXHJcbiAgICAgIC8vIG9yaWdpbiBpcyBhdCBjZW50ZXItdG9wIG9mIGZ1bGNydW1cclxuICAgICAgY2VudGVyWDogMCxcclxuICAgICAgdG9wOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIGJhc2UgdGhlIHN1cHBvcnRzIHRoZSBlbnRpcmUgc2NhbGVcclxuICAgIGNvbnN0IGJhc2VOb2RlID0gbmV3IEJveE5vZGUoIHtcclxuICAgICAgd2lkdGg6IEJBU0VfV0lEVEgsXHJcbiAgICAgIGhlaWdodDogQkFTRV9IRUlHSFQsXHJcbiAgICAgIGRlcHRoOiBCQVNFX0RFUFRILFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHRvcEZpbGw6IEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMuU0NBTEVfVE9QX0ZBQ0VfRklMTCxcclxuICAgICAgZnJvbnRGaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLlNDQUxFX0ZST05UX0ZBQ0VfRklMTCxcclxuICAgICAgY2VudGVyWDogZnVsY3J1bU5vZGUuY2VudGVyWCxcclxuICAgICAgdG9wOiBmdWxjcnVtTm9kZS5ib3R0b20gLSAoIEJBU0VfREVQVEggLyAyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0aGUgYmVhbSB0aGF0IHN1cHBvcnRzIGEgcGxhdGUgb24gZWl0aGVyIGVuZFxyXG4gICAgY29uc3QgYmVhbU5vZGUgPSBuZXcgQm94Tm9kZSgge1xyXG4gICAgICB3aWR0aDogc2NhbGUuYmVhbVdpZHRoLFxyXG4gICAgICBoZWlnaHQ6IEJFQU1fSEVJR0hULFxyXG4gICAgICBkZXB0aDogQkVBTV9ERVBUSCxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICB0b3BGaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLlNDQUxFX1RPUF9GQUNFX0ZJTEwsXHJcbiAgICAgIGZyb250RmlsbDogRXF1YWxpdHlFeHBsb3JlckNvbG9ycy5TQ0FMRV9GUk9OVF9GQUNFX0ZJTEwsXHJcbiAgICAgIGNlbnRlclg6IGJhc2VOb2RlLmNlbnRlclgsXHJcbiAgICAgIHRvcDogZnVsY3J1bU5vZGUudG9wIC0gKCAwLjUgKiBCRUFNX0RFUFRIIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhcnJvdyBhdCB0aGUgY2VudGVyIG9uIHRoZSBiZWFtLCBwb2ludHMgcGVycGVuZGljdWxhciB0byB0aGUgYmVhbVxyXG4gICAgY29uc3QgYXJyb3dOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgLUFSUk9XX0xFTkdUSCwge1xyXG4gICAgICBoZWFkSGVpZ2h0OiAyMCxcclxuICAgICAgaGVhZFdpZHRoOiAxNSxcclxuICAgICAgY2VudGVyWDogYmVhbU5vZGUuY2VudGVyWCxcclxuICAgICAgYm90dG9tOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQSBkYXNoZWQgbGluZSB0aGF0IGlzIHBlcnBlbmRpY3VsYXIgdG8gdGhlIGJhc2UuXHJcbiAgICAvLyBXaGVuIHRoZSBzY2FsZSBpcyBiYWxhbmNlZCwgdGhlIGFycm93IHdpbGwgYmUgYWxpZ25lZCB3aXRoIHRoaXMgbGluZS5cclxuICAgIGNvbnN0IGRhc2hlZExpbmUgPSBuZXcgTGluZSggMCwgMCwgMCwgMS4yICogQVJST1dfTEVOR1RILCB7XHJcbiAgICAgIGxpbmVEYXNoOiBbIDQsIDQgXSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBjZW50ZXJYOiBiZWFtTm9kZS5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsZWZ0IHBsYXRlXHJcbiAgICBjb25zdCBsZWZ0UGxhdGVOb2RlID0gbmV3IFBsYXRlTm9kZSggc2NhbGUubGVmdFBsYXRlLCB7XHJcbiAgICAgIGNlbnRlcjogYmVhbU5vZGUuY2VudGVyIC8vIGNvcnJlY3QgcG9zaXRpb24gd2lsbCBiZSBzZXQgbGF0ZXIgaW4gY29uc3RydWN0b3JcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByaWdodCBwbGF0ZVxyXG4gICAgY29uc3QgcmlnaHRQbGF0ZU5vZGUgPSBuZXcgUGxhdGVOb2RlKCBzY2FsZS5yaWdodFBsYXRlLCB7XHJcbiAgICAgIGNlbnRlcjogYmVhbU5vZGUuY2VudGVyIC8vIGNvcnJlY3QgcG9zaXRpb24gd2lsbCBiZSBzZXQgbGF0ZXIgaW4gY29uc3RydWN0b3JcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwcmVzc2luZyB0aGlzIGJ1dHRvbiBjbGVhcnMgYWxsIHRlcm1zIGZyb20gdGhlIHNjYWxlXHJcbiAgICBjb25zdCBjbGVhclNjYWxlQnV0dG9uID0gbmV3IENsZWFyU2NhbGVCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHNjYWxlLmNsZWFyKCksXHJcbiAgICAgIHZpc2libGU6IG9wdGlvbnMuY2xlYXJTY2FsZUJ1dHRvblZpc2libGUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy5jbGVhclNjYWxlQnV0dG9uVmlzaWJsZSA/IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NsZWFyU2NhbGVCdXR0b24nICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHByZXNzaW5nIHRoaXMgYnV0dG9uIG9yZ2FuaXplcyB0ZXJtcyBvbiB0aGUgc2NhbGUsIGdyb3VwaW5nIGxpa2UgdGVybXMgdG9nZXRoZXJcclxuICAgIGNvbnN0IG9yZ2FuaXplQnV0dG9uID0gbmV3IE9yZ2FuaXplQnV0dG9uKCAoKSA9PiBzY2FsZS5vcmdhbml6ZSgpLCB7XHJcbiAgICAgIHZpc2libGU6IG9wdGlvbnMub3JnYW5pemVCdXR0b25WaXNpYmxlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMub3JnYW5pemVCdXR0b25WaXNpYmxlID8gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnb3JnYW5pemVCdXR0b24nICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFByZXNzaW5nIGVpdGhlciBidXR0b24gZGlzcG9zZXMgb2YgYW55IHRlcm1zIHRoYXQgYXJlIG5vdCBhbHJlYWR5IG9uIHRoZSBzY2FsZS5cclxuICAgIGlmICggb3B0aW9ucy5kaXNwb3NlVGVybXNOb3RPblNjYWxlICkge1xyXG4gICAgICBjbGVhclNjYWxlQnV0dG9uLmFkZExpc3RlbmVyKCBvcHRpb25zLmRpc3Bvc2VUZXJtc05vdE9uU2NhbGUgKTtcclxuICAgICAgb3JnYW5pemVCdXR0b24uYWRkTGlzdGVuZXIoIG9wdGlvbnMuZGlzcG9zZVRlcm1zTm90T25TY2FsZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpc2FibGUgQ2xlYXJTY2FsZUJ1dHRvbiBhbmQgT3JnYW5pemVCdXR0b24gd2hlbiB0aGUgc2NhbGUgaXMgZW1wdHkuIHVubGluayBub3QgcmVxdWlyZWQuXHJcbiAgICBzY2FsZS5udW1iZXJPZlRlcm1zUHJvcGVydHkubGluayggbnVtYmVyT2ZUZXJtcyA9PiB7XHJcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSAoIG51bWJlck9mVGVybXMgIT09IDAgKTtcclxuICAgICAgY2xlYXJTY2FsZUJ1dHRvbi5lbmFibGVkID0gZW5hYmxlZDtcclxuICAgICAgb3JnYW5pemVCdXR0b24uZW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYnV0dG9ucyBvbiB0aGUgZnJvbnQgZmFjZSBvZiB0aGUgYmFzZVxyXG4gICAgY29uc3QgYnV0dG9uc1BhcmVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGNsZWFyU2NhbGVCdXR0b24sIG9yZ2FuaXplQnV0dG9uIF0sXHJcbiAgICAgIHNwYWNpbmc6IDEwMCxcclxuICAgICAgY2VudGVyWDogYmFzZU5vZGUuY2VudGVyWCxcclxuICAgICAgY2VudGVyWTogYmFzZU5vZGUuYm90dG9tIC0gKCBCQVNFX0hFSUdIVCAvIDIgKSxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBiYXNlTm9kZSxcclxuICAgICAgYnV0dG9uc1BhcmVudCxcclxuICAgICAgZnVsY3J1bU5vZGUsXHJcbiAgICAgIGRhc2hlZExpbmUsXHJcbiAgICAgIGJlYW1Ob2RlLFxyXG4gICAgICBhcnJvd05vZGUsXHJcbiAgICAgIGxlZnRQbGF0ZU5vZGUsXHJcbiAgICAgIHJpZ2h0UGxhdGVOb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGRyYXcgYSByZWQgZG90IGF0IHRoZSBvcmlnaW5cclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XHJcbiAgICAgIG9wdGlvbnMuY2hpbGRyZW4ucHVzaCggbmV3IENpcmNsZSggMiwgeyBmaWxsOiAncmVkJyB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEFkanVzdCBwYXJ0cyBvZiB0aGUgc2NhbGUgdGhhdCBkZXBlbmQgb24gYW5nbGUuXHJcbiAgICBzY2FsZS5hbmdsZVByb3BlcnR5LmxpbmsoICggYW5nbGUsIG9sZEFuZ2xlICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgZGVsdGFBbmdsZSA9ICggb2xkQW5nbGUgPT09IG51bGwgKSA/IDAgOiAoIGFuZ2xlIC0gb2xkQW5nbGUgKTtcclxuXHJcbiAgICAgIC8vIHJvdGF0ZSB0aGUgYmVhbSBhYm91dCBpdHMgcGl2b3QgcG9pbnRcclxuICAgICAgYmVhbU5vZGUucm90YXRlQXJvdW5kKCBuZXcgVmVjdG9yMiggYmVhbU5vZGUuY2VudGVyWCwgYmVhbU5vZGUuY2VudGVyWSApLCBkZWx0YUFuZ2xlICk7XHJcblxyXG4gICAgICAvLyByb3RhdGUgYW5kIGZpbGwgdGhlIGFycm93XHJcbiAgICAgIGFycm93Tm9kZS5yb3RhdGVBcm91bmQoIG5ldyBWZWN0b3IyKCBiZWFtTm9kZS5jZW50ZXJYLCAwICksIGRlbHRhQW5nbGUgKTtcclxuICAgICAgaWYgKCBhbmdsZSA9PT0gMCApIHtcclxuICAgICAgICBhcnJvd05vZGUuZmlsbCA9IEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMuU0NBTEVfQVJST1dfQkFMQU5DRUQ7IC8vIHRoZSBzY2FsZSBpcyBiYWxhbmNlZFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBNYXRoLmFicyggYW5nbGUgKSA9PT0gc2NhbGUubWF4QW5nbGUgKSB7XHJcbiAgICAgICAgYXJyb3dOb2RlLmZpbGwgPSBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLlNDQUxFX0FSUk9XX0JPVFRPTUVEX09VVDsgLy8gdGhlIHNjYWxlIGlzIGJvdHRvbWVkIG91dFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFycm93Tm9kZS5maWxsID0gRXF1YWxpdHlFeHBsb3JlckNvbG9ycy5TQ0FMRV9BUlJPV19VTkJBTEFOQ0VEOyAvLyB0aGUgc2NhbGUgaXMgdW5iYWxhbmNlZCwgYnV0IG5vdCBib3R0b21lZCBvdXRcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1vdmUgdGhlIGxlZnQgcGxhdGUuXHJcbiAgICBzY2FsZS5sZWZ0UGxhdGUucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIGxlZnRQbGF0ZU5vZGUueCA9IHBvc2l0aW9uLnggLSBzY2FsZS5wb3NpdGlvbi54O1xyXG4gICAgICBsZWZ0UGxhdGVOb2RlLnkgPSBwb3NpdGlvbi55IC0gc2NhbGUucG9zaXRpb24ueTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoZSByaWdodCBwbGF0ZS5cclxuICAgIHNjYWxlLnJpZ2h0UGxhdGUucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHJpZ2h0UGxhdGVOb2RlLnggPSBwb3NpdGlvbi54IC0gc2NhbGUucG9zaXRpb24ueDtcclxuICAgICAgcmlnaHRQbGF0ZU5vZGUueSA9IHBvc2l0aW9uLnkgLSBzY2FsZS5wb3NpdGlvbi55O1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdCYWxhbmNlU2NhbGVOb2RlJywgQmFsYW5jZVNjYWxlTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBUSxtQ0FBbUM7QUFDL0YsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBRWpFLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7O0FBRXRDO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLEdBQUc7QUFDdEIsTUFBTUMsV0FBVyxHQUFHLEVBQUU7QUFDdEIsTUFBTUMsVUFBVSxHQUFHLEVBQUU7O0FBRXJCO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLENBQUM7QUFDckIsTUFBTUMsVUFBVSxHQUFHLENBQUM7O0FBRXBCO0FBQ0EsTUFB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