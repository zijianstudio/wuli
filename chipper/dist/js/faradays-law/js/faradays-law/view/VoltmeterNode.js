// Copyright 2014-2022, University of Colorado Boulder

/**
 * Voltmeter for 'Faradays Law' simulation model
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import VoltmeterGauge from './VoltmeterGauge.js';
const faradaysLawVoltageString = FaradaysLawStrings['faradays-law'].voltage;

// constants
const TERMINAL_COLOR = '#C0C0C0';
const TERMINAL_STROKE = '#000000';
const TERMINAL_BORDER_RADIUS = 3;
const RECTANGLE_HEIGHT = 107;
const READOUT_WIDTH = 132;
const TERMINAL_SIZE = 18; // size of terminals at the bottom of the voltmeter
const TERMINAL_SIGN_SIZE = new Dimension2(12, 2); // size of plus and minus signs

class VoltmeterNode extends Node {
  /**
   * @param {NumberProperty} needleAngleProperty - angle of needle in voltmeter
   * @param {Tandem} tandem - This type should not be instrumented! Instead it will be instrumented by
   * VoltmeterAndWiresNode, see https://github.com/phetsims/faradays-law/issues/106
   */
  constructor(needleAngleProperty, tandem) {
    super();
    const background = new ShadedRectangle(new Bounds2(0, 0, 170, RECTANGLE_HEIGHT), {
      cornerRadius: 10,
      baseColor: new Color('#232674'),
      center: Vector2.ZERO
    });
    this.addChild(background);

    // background rectangle with a deflecting needle meter inside
    const readoutBackground = new Rectangle(0, 0, READOUT_WIDTH, 72, {
      cornerRadius: 5,
      fill: '#FFF',
      centerX: 0,
      centerY: -5 // empirically determined to allow space for the label under the readout
    });

    // scale + needle
    readoutBackground.addChild(new VoltmeterGauge(needleAngleProperty, {
      centerX: readoutBackground.width / 2,
      centerY: readoutBackground.height / 2
    }));
    this.addChild(readoutBackground);

    // create the label and scale it if it's too long
    const label = new Text(faradaysLawVoltageString, {
      font: new PhetFont(18),
      fill: 'yellow',
      tandem: tandem.createTandem('labelText'),
      phetioDocumentation: 'Text label at the bottom of the voltmeter',
      maxWidth: READOUT_WIDTH // Support PhET-iO
    });

    label.scale(Math.min(readoutBackground.width / label.width, 1));

    // position and add the label
    label.centerX = 0;
    label.centerY = (readoutBackground.bottom + background.bottom) * 0.48;

    // When the text changes (via PhET-iO), re-center it
    label.stringProperty.lazyLink(() => {
      label.centerX = 0;
    });
    this.addChild(label);

    // add the plus and minus terminals at the bottom
    // @public
    this.plusNode = new Node({
      children: [new Rectangle(-TERMINAL_SIZE / 2, -TERMINAL_SIZE / 2, TERMINAL_SIZE, TERMINAL_SIZE, TERMINAL_BORDER_RADIUS, TERMINAL_BORDER_RADIUS, {
        fill: TERMINAL_COLOR,
        stroke: TERMINAL_STROKE
      }), new PlusNode({
        centerX: 0,
        centerY: 0,
        size: TERMINAL_SIGN_SIZE
      })],
      center: new Vector2(TERMINAL_SIZE, RECTANGLE_HEIGHT / 2 + TERMINAL_SIZE / 2)
    });
    this.addChild(this.plusNode);

    // @public
    this.minusNode = new Node({
      children: [new Rectangle(-TERMINAL_SIZE / 2, -TERMINAL_SIZE / 2, TERMINAL_SIZE, TERMINAL_SIZE, TERMINAL_BORDER_RADIUS, TERMINAL_BORDER_RADIUS, {
        fill: TERMINAL_COLOR,
        stroke: TERMINAL_STROKE
      }), new MinusNode({
        centerX: 0,
        centerY: 0,
        size: TERMINAL_SIGN_SIZE
      })],
      center: new Vector2(-TERMINAL_SIZE, RECTANGLE_HEIGHT / 2 + TERMINAL_SIZE / 2)
    });
    this.addChild(this.minusNode);
  }
}
faradaysLaw.register('VoltmeterNode', VoltmeterNode);
export default VoltmeterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJNaW51c05vZGUiLCJQaGV0Rm9udCIsIlBsdXNOb2RlIiwiU2hhZGVkUmVjdGFuZ2xlIiwiQ29sb3IiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdTdHJpbmdzIiwiVm9sdG1ldGVyR2F1Z2UiLCJmYXJhZGF5c0xhd1ZvbHRhZ2VTdHJpbmciLCJ2b2x0YWdlIiwiVEVSTUlOQUxfQ09MT1IiLCJURVJNSU5BTF9TVFJPS0UiLCJURVJNSU5BTF9CT1JERVJfUkFESVVTIiwiUkVDVEFOR0xFX0hFSUdIVCIsIlJFQURPVVRfV0lEVEgiLCJURVJNSU5BTF9TSVpFIiwiVEVSTUlOQUxfU0lHTl9TSVpFIiwiVm9sdG1ldGVyTm9kZSIsImNvbnN0cnVjdG9yIiwibmVlZGxlQW5nbGVQcm9wZXJ0eSIsInRhbmRlbSIsImJhY2tncm91bmQiLCJjb3JuZXJSYWRpdXMiLCJiYXNlQ29sb3IiLCJjZW50ZXIiLCJaRVJPIiwiYWRkQ2hpbGQiLCJyZWFkb3V0QmFja2dyb3VuZCIsImZpbGwiLCJjZW50ZXJYIiwiY2VudGVyWSIsIndpZHRoIiwiaGVpZ2h0IiwibGFiZWwiLCJmb250IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIm1heFdpZHRoIiwic2NhbGUiLCJNYXRoIiwibWluIiwiYm90dG9tIiwic3RyaW5nUHJvcGVydHkiLCJsYXp5TGluayIsInBsdXNOb2RlIiwiY2hpbGRyZW4iLCJzdHJva2UiLCJzaXplIiwibWludXNOb2RlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWb2x0bWV0ZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZvbHRtZXRlciBmb3IgJ0ZhcmFkYXlzIExhdycgc2ltdWxhdGlvbiBtb2RlbFxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNTGVhcm5lcilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTWludXNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NaW51c05vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBsdXNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QbHVzTm9kZS5qcyc7XHJcbmltcG9ydCBTaGFkZWRSZWN0YW5nbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NoYWRlZFJlY3RhbmdsZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5pbXBvcnQgRmFyYWRheXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0ZhcmFkYXlzTGF3U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBWb2x0bWV0ZXJHYXVnZSBmcm9tICcuL1ZvbHRtZXRlckdhdWdlLmpzJztcclxuXHJcbmNvbnN0IGZhcmFkYXlzTGF3Vm9sdGFnZVN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5nc1sgJ2ZhcmFkYXlzLWxhdycgXS52b2x0YWdlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFUk1JTkFMX0NPTE9SID0gJyNDMEMwQzAnO1xyXG5jb25zdCBURVJNSU5BTF9TVFJPS0UgPSAnIzAwMDAwMCc7XHJcbmNvbnN0IFRFUk1JTkFMX0JPUkRFUl9SQURJVVMgPSAzO1xyXG5jb25zdCBSRUNUQU5HTEVfSEVJR0hUID0gMTA3O1xyXG5jb25zdCBSRUFET1VUX1dJRFRIID0gMTMyO1xyXG5jb25zdCBURVJNSU5BTF9TSVpFID0gMTg7IC8vIHNpemUgb2YgdGVybWluYWxzIGF0IHRoZSBib3R0b20gb2YgdGhlIHZvbHRtZXRlclxyXG5jb25zdCBURVJNSU5BTF9TSUdOX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTIsIDIgKTsgLy8gc2l6ZSBvZiBwbHVzIGFuZCBtaW51cyBzaWduc1xyXG5cclxuY2xhc3MgVm9sdG1ldGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlclByb3BlcnR5fSBuZWVkbGVBbmdsZVByb3BlcnR5IC0gYW5nbGUgb2YgbmVlZGxlIGluIHZvbHRtZXRlclxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW0gLSBUaGlzIHR5cGUgc2hvdWxkIG5vdCBiZSBpbnN0cnVtZW50ZWQhIEluc3RlYWQgaXQgd2lsbCBiZSBpbnN0cnVtZW50ZWQgYnlcclxuICAgKiBWb2x0bWV0ZXJBbmRXaXJlc05vZGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmFyYWRheXMtbGF3L2lzc3Vlcy8xMDZcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbmVlZGxlQW5nbGVQcm9wZXJ0eSwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kID0gbmV3IFNoYWRlZFJlY3RhbmdsZSggbmV3IEJvdW5kczIoIDAsIDAsIDE3MCwgUkVDVEFOR0xFX0hFSUdIVCApLCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogMTAsXHJcbiAgICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAnIzIzMjY3NCcgKSxcclxuICAgICAgY2VudGVyOiBWZWN0b3IyLlpFUk9cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhY2tncm91bmQgKTtcclxuXHJcbiAgICAvLyBiYWNrZ3JvdW5kIHJlY3RhbmdsZSB3aXRoIGEgZGVmbGVjdGluZyBuZWVkbGUgbWV0ZXIgaW5zaWRlXHJcbiAgICBjb25zdCByZWFkb3V0QmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIFJFQURPVVRfV0lEVEgsIDcyLCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuICAgICAgZmlsbDogJyNGRkYnLFxyXG4gICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICBjZW50ZXJZOiAtNSAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGFsbG93IHNwYWNlIGZvciB0aGUgbGFiZWwgdW5kZXIgdGhlIHJlYWRvdXRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzY2FsZSArIG5lZWRsZVxyXG4gICAgcmVhZG91dEJhY2tncm91bmQuYWRkQ2hpbGQoIG5ldyBWb2x0bWV0ZXJHYXVnZSggbmVlZGxlQW5nbGVQcm9wZXJ0eSwge1xyXG4gICAgICBjZW50ZXJYOiByZWFkb3V0QmFja2dyb3VuZC53aWR0aCAvIDIsXHJcbiAgICAgIGNlbnRlclk6IHJlYWRvdXRCYWNrZ3JvdW5kLmhlaWdodCAvIDJcclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVhZG91dEJhY2tncm91bmQgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGxhYmVsIGFuZCBzY2FsZSBpdCBpZiBpdCdzIHRvbyBsb25nXHJcbiAgICBjb25zdCBsYWJlbCA9IG5ldyBUZXh0KCBmYXJhZGF5c0xhd1ZvbHRhZ2VTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxyXG4gICAgICBmaWxsOiAneWVsbG93JyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGV4dCBsYWJlbCBhdCB0aGUgYm90dG9tIG9mIHRoZSB2b2x0bWV0ZXInLFxyXG4gICAgICBtYXhXaWR0aDogUkVBRE9VVF9XSURUSCAvLyBTdXBwb3J0IFBoRVQtaU9cclxuICAgIH0gKTtcclxuICAgIGxhYmVsLnNjYWxlKCBNYXRoLm1pbiggcmVhZG91dEJhY2tncm91bmQud2lkdGggLyBsYWJlbC53aWR0aCwgMSApICk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gYW5kIGFkZCB0aGUgbGFiZWxcclxuICAgIGxhYmVsLmNlbnRlclggPSAwO1xyXG4gICAgbGFiZWwuY2VudGVyWSA9ICggcmVhZG91dEJhY2tncm91bmQuYm90dG9tICsgYmFja2dyb3VuZC5ib3R0b20gKSAqIDAuNDg7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdGV4dCBjaGFuZ2VzICh2aWEgUGhFVC1pTyksIHJlLWNlbnRlciBpdFxyXG4gICAgbGFiZWwuc3RyaW5nUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgbGFiZWwuY2VudGVyWCA9IDA7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsYWJlbCApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcGx1cyBhbmQgbWludXMgdGVybWluYWxzIGF0IHRoZSBib3R0b21cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMucGx1c05vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBSZWN0YW5nbGUoIC1URVJNSU5BTF9TSVpFIC8gMiwgLVRFUk1JTkFMX1NJWkUgLyAyLCBURVJNSU5BTF9TSVpFLCBURVJNSU5BTF9TSVpFLCBURVJNSU5BTF9CT1JERVJfUkFESVVTLCBURVJNSU5BTF9CT1JERVJfUkFESVVTLCB7XHJcbiAgICAgICAgICBmaWxsOiBURVJNSU5BTF9DT0xPUixcclxuICAgICAgICAgIHN0cm9rZTogVEVSTUlOQUxfU1RST0tFXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBQbHVzTm9kZSgge1xyXG4gICAgICAgICAgY2VudGVyWDogMCxcclxuICAgICAgICAgIGNlbnRlclk6IDAsXHJcbiAgICAgICAgICBzaXplOiBURVJNSU5BTF9TSUdOX1NJWkVcclxuICAgICAgICB9IClcclxuICAgICAgXSxcclxuICAgICAgY2VudGVyOiBuZXcgVmVjdG9yMiggVEVSTUlOQUxfU0laRSwgUkVDVEFOR0xFX0hFSUdIVCAvIDIgKyBURVJNSU5BTF9TSVpFIC8gMiApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBsdXNOb2RlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5taW51c05vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBSZWN0YW5nbGUoIC1URVJNSU5BTF9TSVpFIC8gMiwgLVRFUk1JTkFMX1NJWkUgLyAyLCBURVJNSU5BTF9TSVpFLCBURVJNSU5BTF9TSVpFLCBURVJNSU5BTF9CT1JERVJfUkFESVVTLCBURVJNSU5BTF9CT1JERVJfUkFESVVTLCB7XHJcbiAgICAgICAgICBmaWxsOiBURVJNSU5BTF9DT0xPUixcclxuICAgICAgICAgIHN0cm9rZTogVEVSTUlOQUxfU1RST0tFXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBNaW51c05vZGUoIHtcclxuICAgICAgICAgIGNlbnRlclg6IDAsXHJcbiAgICAgICAgICBjZW50ZXJZOiAwLFxyXG4gICAgICAgICAgc2l6ZTogVEVSTUlOQUxfU0lHTl9TSVpFXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNlbnRlcjogbmV3IFZlY3RvcjIoIC1URVJNSU5BTF9TSVpFLCBSRUNUQU5HTEVfSEVJR0hUIC8gMiArIFRFUk1JTkFMX1NJWkUgLyAyIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubWludXNOb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG5mYXJhZGF5c0xhdy5yZWdpc3RlciggJ1ZvbHRtZXRlck5vZGUnLCBWb2x0bWV0ZXJOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFZvbHRtZXRlck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2hGLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFFaEQsTUFBTUMsd0JBQXdCLEdBQUdGLGtCQUFrQixDQUFFLGNBQWMsQ0FBRSxDQUFDRyxPQUFPOztBQUU3RTtBQUNBLE1BQU1DLGNBQWMsR0FBRyxTQUFTO0FBQ2hDLE1BQU1DLGVBQWUsR0FBRyxTQUFTO0FBQ2pDLE1BQU1DLHNCQUFzQixHQUFHLENBQUM7QUFDaEMsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRztBQUM1QixNQUFNQyxhQUFhLEdBQUcsR0FBRztBQUN6QixNQUFNQyxhQUFhLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDMUIsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSXJCLFVBQVUsQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQzs7QUFFcEQsTUFBTXNCLGFBQWEsU0FBU2YsSUFBSSxDQUFDO0VBRS9CO0FB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