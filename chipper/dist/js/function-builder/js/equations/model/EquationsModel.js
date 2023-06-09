// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model for the 'Equations' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBModel from '../../common/model/FBModel.js';
import functionBuilder from '../../functionBuilder.js';
import EquationsScene from './EquationsScene.js';
export default class EquationsModel extends FBModel {
  constructor() {
    super([new EquationsScene()]);
  }
}
functionBuilder.register('EquationsModel', EquationsModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGQk1vZGVsIiwiZnVuY3Rpb25CdWlsZGVyIiwiRXF1YXRpb25zU2NlbmUiLCJFcXVhdGlvbnNNb2RlbCIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVhdGlvbnNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlICdFcXVhdGlvbnMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRkJNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRkJNb2RlbC5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uc1NjZW5lIGZyb20gJy4vRXF1YXRpb25zU2NlbmUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YXRpb25zTW9kZWwgZXh0ZW5kcyBGQk1vZGVsIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlciggWyBuZXcgRXF1YXRpb25zU2NlbmUoKSBdICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdFcXVhdGlvbnNNb2RlbCcsIEVxdWF0aW9uc01vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELGVBQWUsTUFBTUMsY0FBYyxTQUFTSCxPQUFPLENBQUM7RUFFbERJLFdBQVdBLENBQUEsRUFBRztJQUNaLEtBQUssQ0FBRSxDQUFFLElBQUlGLGNBQWMsQ0FBQyxDQUFDLENBQUcsQ0FBQztFQUNuQztBQUNGO0FBRUFELGVBQWUsQ0FBQ0ksUUFBUSxDQUFFLGdCQUFnQixFQUFFRixjQUFlLENBQUMifQ==