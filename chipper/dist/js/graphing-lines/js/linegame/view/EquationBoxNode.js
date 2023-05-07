// Copyright 2013-2023, University of Colorado Boulder

/**
 * Box around an equation in the 'Line Game'.
 * Has an icon that indicates 'correct' (check mark) or 'incorrect' (red 'X').
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import checkSolidShape from '../../../../sherpa/js/fontawesome-5/checkSolidShape.js';
import timesSolidShape from '../../../../sherpa/js/fontawesome-5/timesSolidShape.js';
import graphingLines from '../../graphingLines.js';
import LineGameConstants from '../LineGameConstants.js';

// constants
const X_MARGIN = 20;
const Y_MARGIN = 10;
export default class EquationBoxNode extends Node {
  // icons for 'correct' and 'incorrect'

  constructor(title, titleColor, boxSize, equationNode) {
    super();
    this.correctIconNode = new Path(checkSolidShape, {
      scale: 0.12,
      fill: LineGameConstants.ANSWER_COLOR
    });
    this.incorrectIconNode = new Path(timesSolidShape, {
      scale: 0.12,
      fill: PhetColorScheme.RED_COLORBLIND
    });
    const titleNode = new Text(title, {
      fill: titleColor,
      font: new PhetFont({
        size: 24,
        weight: 'bold'
      }),
      maxWidth: boxSize.width - 2 * X_MARGIN - Math.max(this.correctIconNode.width, this.incorrectIconNode.width)
    });
    const boxNode = new Rectangle(0, 0, boxSize.width, boxSize.height, 20, 20, {
      fill: 'rgb( 238, 238, 238 )',
      stroke: 'black',
      lineWidth: 1
    });
    equationNode.maxWidth = boxSize.width - 2 * X_MARGIN; // constrain width for i18n

    // rendering order
    this.addChild(boxNode);
    this.addChild(titleNode);
    this.addChild(equationNode);
    this.addChild(this.correctIconNode);
    this.addChild(this.incorrectIconNode);

    // layout
    // title in upper left
    titleNode.left = X_MARGIN;
    titleNode.top = Y_MARGIN;
    // equation left-justified, vertically centered in space below title
    equationNode.left = X_MARGIN;
    equationNode.centerY = titleNode.bottom + (boxNode.bottom - titleNode.bottom) / 2;
    // icons in upper-right corner
    this.correctIconNode.right = boxNode.right - X_MARGIN;
    this.correctIconNode.top = boxNode.top + Y_MARGIN;
    this.incorrectIconNode.right = boxNode.right - X_MARGIN;
    this.incorrectIconNode.top = boxNode.top + Y_MARGIN;

    // icons are initially hidden
    this.correctIconNode.visible = false;
    this.incorrectIconNode.visible = false;
  }

  // Sets the visibility of the correct icon (green check mark).
  setCorrectIconVisible(visible) {
    this.correctIconNode.visible = visible;
  }

  // Sets the visibility of the incorrect icon (red X).
  setIncorrectIconVisible(visible) {
    this.incorrectIconNode.visible = visible;
  }
}
graphingLines.register('EquationBoxNode', EquationBoxNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImNoZWNrU29saWRTaGFwZSIsInRpbWVzU29saWRTaGFwZSIsImdyYXBoaW5nTGluZXMiLCJMaW5lR2FtZUNvbnN0YW50cyIsIlhfTUFSR0lOIiwiWV9NQVJHSU4iLCJFcXVhdGlvbkJveE5vZGUiLCJjb25zdHJ1Y3RvciIsInRpdGxlIiwidGl0bGVDb2xvciIsImJveFNpemUiLCJlcXVhdGlvbk5vZGUiLCJjb3JyZWN0SWNvbk5vZGUiLCJzY2FsZSIsImZpbGwiLCJBTlNXRVJfQ09MT1IiLCJpbmNvcnJlY3RJY29uTm9kZSIsIlJFRF9DT0xPUkJMSU5EIiwidGl0bGVOb2RlIiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJtYXhXaWR0aCIsIndpZHRoIiwiTWF0aCIsIm1heCIsImJveE5vZGUiLCJoZWlnaHQiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsImxlZnQiLCJ0b3AiLCJjZW50ZXJZIiwiYm90dG9tIiwicmlnaHQiLCJ2aXNpYmxlIiwic2V0Q29ycmVjdEljb25WaXNpYmxlIiwic2V0SW5jb3JyZWN0SWNvblZpc2libGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVxdWF0aW9uQm94Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCb3ggYXJvdW5kIGFuIGVxdWF0aW9uIGluIHRoZSAnTGluZSBHYW1lJy5cclxuICogSGFzIGFuIGljb24gdGhhdCBpbmRpY2F0ZXMgJ2NvcnJlY3QnIChjaGVjayBtYXJrKSBvciAnaW5jb3JyZWN0JyAocmVkICdYJykuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2hlY2tTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2NoZWNrU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCB0aW1lc1NvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvdGltZXNTb2xpZFNoYXBlLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBMaW5lR2FtZUNvbnN0YW50cyBmcm9tICcuLi9MaW5lR2FtZUNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgWF9NQVJHSU4gPSAyMDtcclxuY29uc3QgWV9NQVJHSU4gPSAxMDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWF0aW9uQm94Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBpY29ucyBmb3IgJ2NvcnJlY3QnIGFuZCAnaW5jb3JyZWN0J1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29ycmVjdEljb25Ob2RlOiBQYXRoO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5jb3JyZWN0SWNvbk5vZGU6IFBhdGg7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGl0bGU6IHN0cmluZywgdGl0bGVDb2xvcjogVENvbG9yLCBib3hTaXplOiBEaW1lbnNpb24yLCBlcXVhdGlvbk5vZGU6IE5vZGUgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmNvcnJlY3RJY29uTm9kZSA9IG5ldyBQYXRoKCBjaGVja1NvbGlkU2hhcGUsIHtcclxuICAgICAgc2NhbGU6IDAuMTIsXHJcbiAgICAgIGZpbGw6IExpbmVHYW1lQ29uc3RhbnRzLkFOU1dFUl9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaW5jb3JyZWN0SWNvbk5vZGUgPSBuZXcgUGF0aCggdGltZXNTb2xpZFNoYXBlLCB7XHJcbiAgICAgIHNjYWxlOiAwLjEyLFxyXG4gICAgICBmaWxsOiBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0aXRsZU5vZGUgPSBuZXcgVGV4dCggdGl0bGUsIHtcclxuICAgICAgZmlsbDogdGl0bGVDb2xvcixcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIG1heFdpZHRoOiBib3hTaXplLndpZHRoIC0gKCAyICogWF9NQVJHSU4gKSAtIE1hdGgubWF4KCB0aGlzLmNvcnJlY3RJY29uTm9kZS53aWR0aCwgdGhpcy5pbmNvcnJlY3RJY29uTm9kZS53aWR0aCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYm94Tm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJveFNpemUud2lkdGgsIGJveFNpemUuaGVpZ2h0LCAyMCwgMjAsIHtcclxuICAgICAgZmlsbDogJ3JnYiggMjM4LCAyMzgsIDIzOCApJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0gKTtcclxuXHJcbiAgICBlcXVhdGlvbk5vZGUubWF4V2lkdGggPSBib3hTaXplLndpZHRoIC0gKCAyICogWF9NQVJHSU4gKTsgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuXHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCBib3hOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aXRsZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVxdWF0aW9uTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jb3JyZWN0SWNvbk5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaW5jb3JyZWN0SWNvbk5vZGUgKTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIC8vIHRpdGxlIGluIHVwcGVyIGxlZnRcclxuICAgIHRpdGxlTm9kZS5sZWZ0ID0gWF9NQVJHSU47XHJcbiAgICB0aXRsZU5vZGUudG9wID0gWV9NQVJHSU47XHJcbiAgICAvLyBlcXVhdGlvbiBsZWZ0LWp1c3RpZmllZCwgdmVydGljYWxseSBjZW50ZXJlZCBpbiBzcGFjZSBiZWxvdyB0aXRsZVxyXG4gICAgZXF1YXRpb25Ob2RlLmxlZnQgPSBYX01BUkdJTjtcclxuICAgIGVxdWF0aW9uTm9kZS5jZW50ZXJZID0gdGl0bGVOb2RlLmJvdHRvbSArICggKCBib3hOb2RlLmJvdHRvbSAtIHRpdGxlTm9kZS5ib3R0b20gKSAvIDIgKTtcclxuICAgIC8vIGljb25zIGluIHVwcGVyLXJpZ2h0IGNvcm5lclxyXG4gICAgdGhpcy5jb3JyZWN0SWNvbk5vZGUucmlnaHQgPSBib3hOb2RlLnJpZ2h0IC0gWF9NQVJHSU47XHJcbiAgICB0aGlzLmNvcnJlY3RJY29uTm9kZS50b3AgPSBib3hOb2RlLnRvcCArIFlfTUFSR0lOO1xyXG4gICAgdGhpcy5pbmNvcnJlY3RJY29uTm9kZS5yaWdodCA9IGJveE5vZGUucmlnaHQgLSBYX01BUkdJTjtcclxuICAgIHRoaXMuaW5jb3JyZWN0SWNvbk5vZGUudG9wID0gYm94Tm9kZS50b3AgKyBZX01BUkdJTjtcclxuXHJcbiAgICAvLyBpY29ucyBhcmUgaW5pdGlhbGx5IGhpZGRlblxyXG4gICAgdGhpcy5jb3JyZWN0SWNvbk5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pbmNvcnJlY3RJY29uTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBTZXRzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBjb3JyZWN0IGljb24gKGdyZWVuIGNoZWNrIG1hcmspLlxyXG4gIHB1YmxpYyBzZXRDb3JyZWN0SWNvblZpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvcnJlY3RJY29uTm9kZS52aXNpYmxlID0gdmlzaWJsZTtcclxuICB9XHJcblxyXG4gIC8vIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGluY29ycmVjdCBpY29uIChyZWQgWCkuXHJcbiAgcHVibGljIHNldEluY29ycmVjdEljb25WaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5pbmNvcnJlY3RJY29uTm9kZS52aXNpYmxlID0gdmlzaWJsZTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdFcXVhdGlvbkJveE5vZGUnLCBFcXVhdGlvbkJveE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBVUMsSUFBSSxRQUFRLG1DQUFtQztBQUN2RixPQUFPQyxlQUFlLE1BQU0sd0RBQXdEO0FBQ3BGLE9BQU9DLGVBQWUsTUFBTSx3REFBd0Q7QUFDcEYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7O0FBRXZEO0FBQ0EsTUFBTUMsUUFBUSxHQUFHLEVBQUU7QUFDbkIsTUFBTUMsUUFBUSxHQUFHLEVBQUU7QUFFbkIsZUFBZSxN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