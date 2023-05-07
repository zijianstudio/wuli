// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that depicts a basic shape with its dimensions labeled, intended for use in control panels.  It
 * includes an overlying grid that can be turned on or off.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import Grid from './Grid.js';

// constants
const UNIT_LENGTH = 10; // in screen coordinates
const WIDTH = 3 * UNIT_LENGTH;
const HEIGHT = 2 * UNIT_LENGTH; // in screen coordinates
const LABEL_FONT = new PhetFont(10);
const DEFAULT_FILL_COLOR = AreaBuilderSharedConstants.GREENISH_COLOR;
class DimensionsIcon extends Node {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    super();

    // Create the background rectangle node.
    this.singleRectNode = new Rectangle(0, 0, WIDTH, HEIGHT, 0, 0);
    this.addChild(this.singleRectNode);

    // Add the grid.
    this.grid = new Grid(new Bounds2(0, 0, WIDTH, HEIGHT), UNIT_LENGTH, {
      stroke: '#b0b0b0',
      lineDash: [1, 2]
    });
    this.addChild(this.grid);

    // Initialize the color.
    this.setColor(DEFAULT_FILL_COLOR);

    // Label the sides.
    this.addChild(new Text('2', {
      font: LABEL_FONT,
      right: -2,
      centerY: HEIGHT / 2
    }));
    this.addChild(new Text('2', {
      font: LABEL_FONT,
      left: WIDTH + 2,
      centerY: HEIGHT / 2
    }));
    this.addChild(new Text('3', {
      font: LABEL_FONT,
      centerX: WIDTH / 2,
      bottom: 0
    }));
    this.addChild(new Text('3', {
      font: LABEL_FONT,
      centerX: WIDTH / 2,
      top: HEIGHT
    }));

    // Pass through any options.
    this.mutate(options);
  }

  /**
   * @param {boolean} gridVisible
   * @public
   */
  setGridVisible(gridVisible) {
    assert && assert(typeof gridVisible === 'boolean');
    this.grid.visible = gridVisible;
  }

  /**
   * @param color
   * @public
   */
  setColor(color) {
    this.singleRectNode.fill = color;
    const strokeColor = Color.toColor(color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);
    this.singleRectNode.stroke = strokeColor;
    this.grid.stroke = strokeColor;
  }
}
areaBuilder.register('DimensionsIcon', DimensionsIcon);
export default DimensionsIcon;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUGhldEZvbnQiLCJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkdyaWQiLCJVTklUX0xFTkdUSCIsIldJRFRIIiwiSEVJR0hUIiwiTEFCRUxfRk9OVCIsIkRFRkFVTFRfRklMTF9DT0xPUiIsIkdSRUVOSVNIX0NPTE9SIiwiRGltZW5zaW9uc0ljb24iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJzaW5nbGVSZWN0Tm9kZSIsImFkZENoaWxkIiwiZ3JpZCIsInN0cm9rZSIsImxpbmVEYXNoIiwic2V0Q29sb3IiLCJmb250IiwicmlnaHQiLCJjZW50ZXJZIiwibGVmdCIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJtdXRhdGUiLCJzZXRHcmlkVmlzaWJsZSIsImdyaWRWaXNpYmxlIiwiYXNzZXJ0IiwidmlzaWJsZSIsImNvbG9yIiwiZmlsbCIsInN0cm9rZUNvbG9yIiwidG9Db2xvciIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGltZW5zaW9uc0ljb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBTY2VuZXJ5IG5vZGUgdGhhdCBkZXBpY3RzIGEgYmFzaWMgc2hhcGUgd2l0aCBpdHMgZGltZW5zaW9ucyBsYWJlbGVkLCBpbnRlbmRlZCBmb3IgdXNlIGluIGNvbnRyb2wgcGFuZWxzLiAgSXRcclxuICogaW5jbHVkZXMgYW4gb3Zlcmx5aW5nIGdyaWQgdGhhdCBjYW4gYmUgdHVybmVkIG9uIG9yIG9mZi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFVOSVRfTEVOR1RIID0gMTA7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBXSURUSCA9IDMgKiBVTklUX0xFTkdUSDtcclxuY29uc3QgSEVJR0hUID0gMiAqIFVOSVRfTEVOR1RIOyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTAgKTtcclxuY29uc3QgREVGQVVMVF9GSUxMX0NPTE9SID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1I7XHJcblxyXG5jbGFzcyBEaW1lbnNpb25zSWNvbiBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYmFja2dyb3VuZCByZWN0YW5nbGUgbm9kZS5cclxuICAgIHRoaXMuc2luZ2xlUmVjdE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBXSURUSCwgSEVJR0hULCAwLCAwICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnNpbmdsZVJlY3ROb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBncmlkLlxyXG4gICAgdGhpcy5ncmlkID0gbmV3IEdyaWQoIG5ldyBCb3VuZHMyKCAwLCAwLCBXSURUSCwgSEVJR0hUICksIFVOSVRfTEVOR1RILCB7IHN0cm9rZTogJyNiMGIwYjAnLCBsaW5lRGFzaDogWyAxLCAyIF0gfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ncmlkICk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgY29sb3IuXHJcbiAgICB0aGlzLnNldENvbG9yKCBERUZBVUxUX0ZJTExfQ09MT1IgKTtcclxuXHJcbiAgICAvLyBMYWJlbCB0aGUgc2lkZXMuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVGV4dCggJzInLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIHJpZ2h0OiAtMiwgY2VudGVyWTogSEVJR0hUIC8gMiB9ICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnMicsIHsgZm9udDogTEFCRUxfRk9OVCwgbGVmdDogV0lEVEggKyAyLCBjZW50ZXJZOiBIRUlHSFQgLyAyIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFRleHQoICczJywgeyBmb250OiBMQUJFTF9GT05ULCBjZW50ZXJYOiBXSURUSCAvIDIsIGJvdHRvbTogMCB9ICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnMycsIHsgZm9udDogTEFCRUxfRk9OVCwgY2VudGVyWDogV0lEVEggLyAyLCB0b3A6IEhFSUdIVCB9ICkgKTtcclxuXHJcbiAgICAvLyBQYXNzIHRocm91Z2ggYW55IG9wdGlvbnMuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBncmlkVmlzaWJsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRHcmlkVmlzaWJsZSggZ3JpZFZpc2libGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgKCBncmlkVmlzaWJsZSApID09PSAnYm9vbGVhbicgKTtcclxuICAgIHRoaXMuZ3JpZC52aXNpYmxlID0gZ3JpZFZpc2libGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gY29sb3JcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Q29sb3IoIGNvbG9yICkge1xyXG4gICAgdGhpcy5zaW5nbGVSZWN0Tm9kZS5maWxsID0gY29sb3I7XHJcbiAgICBjb25zdCBzdHJva2VDb2xvciA9IENvbG9yLnRvQ29sb3IoIGNvbG9yICkuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKTtcclxuICAgIHRoaXMuc2luZ2xlUmVjdE5vZGUuc3Ryb2tlID0gc3Ryb2tlQ29sb3I7XHJcbiAgICB0aGlzLmdyaWQuc3Ryb2tlID0gc3Ryb2tlQ29sb3I7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0RpbWVuc2lvbnNJY29uJywgRGltZW5zaW9uc0ljb24gKTtcclxuZXhwb3J0IGRlZmF1bHQgRGltZW5zaW9uc0ljb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDaEYsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7QUFDekUsT0FBT0MsSUFBSSxNQUFNLFdBQVc7O0FBRTVCO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLE1BQU1DLEtBQUssR0FBRyxDQUFDLEdBQUdELFdB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