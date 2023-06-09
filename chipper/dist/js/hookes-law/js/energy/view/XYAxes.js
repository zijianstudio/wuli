// Copyright 2015-2022, University of Colorado Boulder

/**
 * Axes for XY plots.
 * Draws x and y axes with arrows pointing in the positive directions, and labels at the positive ends.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import hookesLaw from '../../hookesLaw.js';

// constants
const AXIS_OPTIONS = {
  headHeight: 10,
  headWidth: 10,
  tailWidth: 1,
  fill: 'black',
  stroke: null
};
const DEFAULT_FONT = new PhetFont(14);
export default class XYAxes extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      font: DEFAULT_FONT,
      xLabelMaxWidth: null
    }, providedOptions);

    // x-axis, arrow in positive direction only
    const xAxisNode = new ArrowNode(options.minX, 0, options.maxX, 0, AXIS_OPTIONS);
    const xAxisText = new Text(options.xString, {
      font: options.font,
      left: xAxisNode.right + 4,
      centerY: xAxisNode.centerY,
      maxWidth: options.xLabelMaxWidth,
      // constrain for i18n
      tandem: options.tandem.createTandem('xAxisText')
    });

    // y-axis, arrow in positive direction only
    const yAxisNode = new ArrowNode(0, -options.minY, 0, -options.maxY, AXIS_OPTIONS);
    const yAxisText = new Text(options.yString, {
      font: options.font,
      centerX: yAxisNode.centerX,
      bottom: yAxisNode.top - 2,
      maxWidth: 0.85 * xAxisNode.width,
      // constrain for i18n
      tandem: options.tandem.createTandem('yAxisText')
    });
    options.children = [xAxisNode, xAxisText, yAxisNode, yAxisText];
    super(options);
  }
}
hookesLaw.register('XYAxes', XYAxes);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJBcnJvd05vZGUiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiaG9va2VzTGF3IiwiQVhJU19PUFRJT05TIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsInRhaWxXaWR0aCIsImZpbGwiLCJzdHJva2UiLCJERUZBVUxUX0ZPTlQiLCJYWUF4ZXMiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmb250IiwieExhYmVsTWF4V2lkdGgiLCJ4QXhpc05vZGUiLCJtaW5YIiwibWF4WCIsInhBeGlzVGV4dCIsInhTdHJpbmciLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJZIiwibWF4V2lkdGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ5QXhpc05vZGUiLCJtaW5ZIiwibWF4WSIsInlBeGlzVGV4dCIsInlTdHJpbmciLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwid2lkdGgiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiWFlBeGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEF4ZXMgZm9yIFhZIHBsb3RzLlxyXG4gKiBEcmF3cyB4IGFuZCB5IGF4ZXMgd2l0aCBhcnJvd3MgcG9pbnRpbmcgaW4gdGhlIHBvc2l0aXZlIGRpcmVjdGlvbnMsIGFuZCBsYWJlbHMgYXQgdGhlIHBvc2l0aXZlIGVuZHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEZvbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGhvb2tlc0xhdyBmcm9tICcuLi8uLi9ob29rZXNMYXcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFYSVNfT1BUSU9OUyA9IHtcclxuICBoZWFkSGVpZ2h0OiAxMCxcclxuICBoZWFkV2lkdGg6IDEwLFxyXG4gIHRhaWxXaWR0aDogMSxcclxuICBmaWxsOiAnYmxhY2snLFxyXG4gIHN0cm9rZTogbnVsbFxyXG59O1xyXG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIG1pblg6IG51bWJlcjtcclxuICBtYXhYOiBudW1iZXI7XHJcbiAgbWluWTogbnVtYmVyO1xyXG4gIG1heFk6IG51bWJlcjtcclxuICB4U3RyaW5nOiBzdHJpbmc7XHJcbiAgeVN0cmluZzogc3RyaW5nO1xyXG4gIGZvbnQ/OiBGb250O1xyXG4gIHhMYWJlbE1heFdpZHRoPzogbnVtYmVyIHwgbnVsbDtcclxufTtcclxuXHJcbnR5cGUgWFlBeGVzT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBYWUF4ZXMgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFhZQXhlc09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxYWUF4ZXNPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGZvbnQ6IERFRkFVTFRfRk9OVCxcclxuICAgICAgeExhYmVsTWF4V2lkdGg6IG51bGxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHgtYXhpcywgYXJyb3cgaW4gcG9zaXRpdmUgZGlyZWN0aW9uIG9ubHlcclxuICAgIGNvbnN0IHhBeGlzTm9kZSA9IG5ldyBBcnJvd05vZGUoIG9wdGlvbnMubWluWCwgMCwgb3B0aW9ucy5tYXhYLCAwLCBBWElTX09QVElPTlMgKTtcclxuICAgIGNvbnN0IHhBeGlzVGV4dCA9IG5ldyBUZXh0KCBvcHRpb25zLnhTdHJpbmcsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5mb250LFxyXG4gICAgICBsZWZ0OiB4QXhpc05vZGUucmlnaHQgKyA0LFxyXG4gICAgICBjZW50ZXJZOiB4QXhpc05vZGUuY2VudGVyWSxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMueExhYmVsTWF4V2lkdGgsIC8vIGNvbnN0cmFpbiBmb3IgaTE4blxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3hBeGlzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHktYXhpcywgYXJyb3cgaW4gcG9zaXRpdmUgZGlyZWN0aW9uIG9ubHlcclxuICAgIGNvbnN0IHlBeGlzTm9kZSA9IG5ldyBBcnJvd05vZGUoIDAsIC1vcHRpb25zLm1pblksIDAsIC1vcHRpb25zLm1heFksIEFYSVNfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgeUF4aXNUZXh0ID0gbmV3IFRleHQoIG9wdGlvbnMueVN0cmluZywge1xyXG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXHJcbiAgICAgIGNlbnRlclg6IHlBeGlzTm9kZS5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IHlBeGlzTm9kZS50b3AgLSAyLFxyXG4gICAgICBtYXhXaWR0aDogMC44NSAqIHhBeGlzTm9kZS53aWR0aCwgLy8gY29uc3RyYWluIGZvciBpMThuXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAneUF4aXNUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgeEF4aXNOb2RlLCB4QXhpc1RleHQsIHlBeGlzTm9kZSwgeUF4aXNUZXh0IF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ1hZQXhlcycsIFhZQXhlcyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQWVDLElBQUksRUFBZUMsSUFBSSxRQUFRLG1DQUFtQztBQUNqRixPQUFPQyxTQUFTLE1BQU0sb0JBQW9COztBQUUxQztBQUNBLE1BQU1DLFlBQVksR0FBRztFQUNuQkMsVUFBVSxFQUFFLEVBQUU7RUFDZEMsU0FBUyxFQUFFLEVBQUU7RUFDYkMsU0FBUyxFQUFFLENBQUM7RUFDWkMsSUFBSSxFQUFFLE9BQU87RUFDYkMsTUFBTSxFQUFFO0FBQ1YsQ0FBQztBQUNELE1BQU1DLFlBQVksR0FBRyxJQUFJVixRQUFRLENBQUUsRUFBRyxDQUFDO0FBZXZDLGVBQWUsTUFBTVcsTUFBTSxTQUFTVixJQUFJLENBQUM7RUFFaENXLFdBQVdBLENBQUVDLGVBQThCLEVBQUc7SUFFbkQsTUFBTUMsT0FBTyxHQUFHaEIsU0FBUyxDQUEwQyxDQUFDLENBQUU7TUFFcEU7TUFDQWlCLElBQUksRUFBRUwsWUFBWTtNQUNsQk0sY0FBYyxFQUFFO0lBQ2xCLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNSSxTQUFTLEdBQUcsSUFBSWxCLFNBQVMsQ0FBRWUsT0FBTyxDQUFDSSxJQUFJLEVBQUUsQ0FBQyxFQUFFSixPQUFPLENBQUNLLElBQUksRUFBRSxDQUFDLEVBQUVmLFlBQWEsQ0FBQztJQUNqRixNQUFNZ0IsU0FBUyxHQUFHLElBQUlsQixJQUFJLENBQUVZLE9BQU8sQ0FBQ08sT0FBTyxFQUFFO01BQzNDTixJQUFJLEVBQUVELE9BQU8sQ0FBQ0MsSUFBSTtNQUNsQk8sSUFBSSxFQUFFTCxTQUFTLENBQUNNLEtBQUssR0FBRyxDQUFDO01BQ3pCQyxPQUFPLEVBQUVQLFNBQVMsQ0FBQ08sT0FBTztNQUMxQkMsUUFBUSxFQUFFWCxPQUFPLENBQUNFLGNBQWM7TUFBRTtNQUNsQ1UsTUFBTSxFQUFFWixPQUFPLENBQUNZLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVk7SUFDbkQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUk3QixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUNlLE9BQU8sQ0FBQ2UsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDZixPQUFPLENBQUNnQixJQUFJLEVBQUUxQixZQUFhLENBQUM7SUFDbkYsTUFBTTJCLFNBQVMsR0FBRyxJQUFJN0IsSUFBSSxDQUFFWSxPQUFPLENBQUNrQixPQUFPLEVBQUU7TUFDM0NqQixJQUFJLEVBQUVELE9BQU8sQ0FBQ0MsSUFBSTtNQUNsQmtCLE9BQU8sRUFBRUwsU0FBUyxDQUFDSyxPQUFPO01BQzFCQyxNQUFNLEVBQUVOLFNBQVMsQ0FBQ08sR0FBRyxHQUFHLENBQUM7TUFDekJWLFFBQVEsRUFBRSxJQUFJLEdBQUdSLFNBQVMsQ0FBQ21CLEtBQUs7TUFBRTtNQUNsQ1YsTUFBTSxFQUFFWixPQUFPLENBQUNZLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVk7SUFDbkQsQ0FBRSxDQUFDO0lBRUhiLE9BQU8sQ0FBQ3VCLFFBQVEsR0FBRyxDQUFFcEIsU0FBUyxFQUFFRyxTQUFTLEVBQUVRLFNBQVMsRUFBRUcsU0FBUyxDQUFFO0lBRWpFLEtBQUssQ0FBRWpCLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFYLFNBQVMsQ0FBQ21DLFFBQVEsQ0FBRSxRQUFRLEVBQUUzQixNQUFPLENBQUMifQ==