// Copyright 2014-2023, University of Colorado Boulder

/**
 * Minus sign, created using phet.scenery.Rectangle because scenery.Text("-") looks awful on Windows and cannot be accurately
 * centered. The origin is at the upper left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import optionize from '../../phet-core/js/optionize.js';
import { Rectangle } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';

// constants
const DEFAULT_SIZE = new Dimension2(20, 5);
class MinusNode extends Rectangle {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      size: DEFAULT_SIZE,
      // RectangleOptions
      fill: 'black'
    }, providedOptions);
    assert && assert(options.size.width >= options.size.height);
    super(0, 0, options.size.width, options.size.height, options);
  }
}
sceneryPhet.register('MinusNode', MinusNode);
export default MinusNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiUmVjdGFuZ2xlIiwic2NlbmVyeVBoZXQiLCJERUZBVUxUX1NJWkUiLCJNaW51c05vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzaXplIiwiZmlsbCIsImFzc2VydCIsIndpZHRoIiwiaGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaW51c05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWludXMgc2lnbiwgY3JlYXRlZCB1c2luZyBwaGV0LnNjZW5lcnkuUmVjdGFuZ2xlIGJlY2F1c2Ugc2NlbmVyeS5UZXh0KFwiLVwiKSBsb29rcyBhd2Z1bCBvbiBXaW5kb3dzIGFuZCBjYW5ub3QgYmUgYWNjdXJhdGVseVxyXG4gKiBjZW50ZXJlZC4gVGhlIG9yaWdpbiBpcyBhdCB0aGUgdXBwZXIgbGVmdC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IFJlY3RhbmdsZSwgUmVjdGFuZ2xlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMjAsIDUgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgc2l6ZT86IERpbWVuc2lvbjI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBNaW51c05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBSZWN0YW5nbGVPcHRpb25zO1xyXG5cclxuY2xhc3MgTWludXNOb2RlIGV4dGVuZHMgUmVjdGFuZ2xlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IE1pbnVzTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNaW51c05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUmVjdGFuZ2xlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc2l6ZTogREVGQVVMVF9TSVpFLFxyXG5cclxuICAgICAgLy8gUmVjdGFuZ2xlT3B0aW9uc1xyXG4gICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNpemUud2lkdGggPj0gb3B0aW9ucy5zaXplLmhlaWdodCApO1xyXG5cclxuICAgIHN1cGVyKCAwLCAwLCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTWludXNOb2RlJywgTWludXNOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1pbnVzTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sNEJBQTRCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsU0FBU0MsU0FBUyxRQUEwQiw2QkFBNkI7QUFDekUsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjs7QUFFMUM7QUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSUosVUFBVSxDQUFFLEVBQUUsRUFBRSxDQUFFLENBQUM7QUFRNUMsTUFBTUssU0FBUyxTQUFTSCxTQUFTLENBQUM7RUFFekJJLFdBQVdBLENBQUVDLGVBQWlDLEVBQUc7SUFFdEQsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQWtELENBQUMsQ0FBRTtNQUU1RTtNQUNBUSxJQUFJLEVBQUVMLFlBQVk7TUFFbEI7TUFDQU0sSUFBSSxFQUFFO0lBQ1IsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCSSxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsT0FBTyxDQUFDQyxJQUFJLENBQUNHLEtBQUssSUFBSUosT0FBTyxDQUFDQyxJQUFJLENBQUNJLE1BQU8sQ0FBQztJQUU3RCxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUwsT0FBTyxDQUFDQyxJQUFJLENBQUNHLEtBQUssRUFBRUosT0FBTyxDQUFDQyxJQUFJLENBQUNJLE1BQU0sRUFBRUwsT0FBUSxDQUFDO0VBQ2pFO0FBQ0Y7QUFFQUwsV0FBVyxDQUFDVyxRQUFRLENBQUUsV0FBVyxFQUFFVCxTQUFVLENBQUM7QUFDOUMsZUFBZUEsU0FBUyJ9