// Copyright 2017-2022, University of Colorado Boulder

/**
 * The 'Animals' scene in the 'Basics' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Image } from '../../../../scenery/js/imports.js';
import cat_png from '../../../images/cat_png.js';
import catShadow_png from '../../../images/catShadow_png.js';
import dog_png from '../../../images/dog_png.js';
import dogShadow_png from '../../../images/dogShadow_png.js';
import turtle_png from '../../../images/turtle_png.js';
import turtleShadow_png from '../../../images/turtleShadow_png.js';
import EqualityExplorerConstants from '../../common/EqualityExplorerConstants.js';
import equalityExplorer from '../../equalityExplorer.js';
import BasicsScene from './BasicsScene.js';
import ObjectVariable from '../../common/model/ObjectVariable.js';
export default class AnimalsScene extends BasicsScene {
  constructor(tandem) {
    const variablesTandem = tandem.createTandem('variables');
    const variables = [
    // dog
    new ObjectVariable({
      image: dog_png,
      shadow: dogShadow_png,
      value: 11,
      tandem: variablesTandem.createTandem('dog')
    }),
    // cat
    new ObjectVariable({
      image: cat_png,
      shadow: catShadow_png,
      value: 4,
      tandem: variablesTandem.createTandem('cat')
    }),
    // turtle
    new ObjectVariable({
      image: turtle_png,
      shadow: turtleShadow_png,
      value: 6,
      tandem: variablesTandem.createTandem('turtle')
    })];
    super(variables, {
      // icon used to represent this scene in the scene control (radio buttons)
      icon: new Image(turtle_png, {
        maxHeight: EqualityExplorerConstants.SMALL_TERM_DIAMETER
      }),
      // weight at which the scale bottoms out
      maxWeight: 50,
      tandem: tandem
    });
  }
}
equalityExplorer.register('AnimalsScene', AnimalsScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsImNhdF9wbmciLCJjYXRTaGFkb3dfcG5nIiwiZG9nX3BuZyIsImRvZ1NoYWRvd19wbmciLCJ0dXJ0bGVfcG5nIiwidHVydGxlU2hhZG93X3BuZyIsIkVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMiLCJlcXVhbGl0eUV4cGxvcmVyIiwiQmFzaWNzU2NlbmUiLCJPYmplY3RWYXJpYWJsZSIsIkFuaW1hbHNTY2VuZSIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwidmFyaWFibGVzVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidmFyaWFibGVzIiwiaW1hZ2UiLCJzaGFkb3ciLCJ2YWx1ZSIsImljb24iLCJtYXhIZWlnaHQiLCJTTUFMTF9URVJNX0RJQU1FVEVSIiwibWF4V2VpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbmltYWxzU2NlbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdBbmltYWxzJyBzY2VuZSBpbiB0aGUgJ0Jhc2ljcycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNhdF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhdF9wbmcuanMnO1xyXG5pbXBvcnQgY2F0U2hhZG93X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2F0U2hhZG93X3BuZy5qcyc7XHJcbmltcG9ydCBkb2dfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9kb2dfcG5nLmpzJztcclxuaW1wb3J0IGRvZ1NoYWRvd19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2RvZ1NoYWRvd19wbmcuanMnO1xyXG5pbXBvcnQgdHVydGxlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvdHVydGxlX3BuZy5qcyc7XHJcbmltcG9ydCB0dXJ0bGVTaGFkb3dfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy90dXJ0bGVTaGFkb3dfcG5nLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEJhc2ljc1NjZW5lIGZyb20gJy4vQmFzaWNzU2NlbmUuanMnO1xyXG5pbXBvcnQgT2JqZWN0VmFyaWFibGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09iamVjdFZhcmlhYmxlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuaW1hbHNTY2VuZSBleHRlbmRzIEJhc2ljc1NjZW5lIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCB2YXJpYWJsZXNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFyaWFibGVzJyApO1xyXG5cclxuICAgIGNvbnN0IHZhcmlhYmxlcyA9IFtcclxuXHJcbiAgICAgIC8vIGRvZ1xyXG4gICAgICBuZXcgT2JqZWN0VmFyaWFibGUoIHtcclxuICAgICAgICBpbWFnZTogZG9nX3BuZyxcclxuICAgICAgICBzaGFkb3c6IGRvZ1NoYWRvd19wbmcsXHJcbiAgICAgICAgdmFsdWU6IDExLFxyXG4gICAgICAgIHRhbmRlbTogdmFyaWFibGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RvZycgKVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBjYXRcclxuICAgICAgbmV3IE9iamVjdFZhcmlhYmxlKCB7XHJcbiAgICAgICAgaW1hZ2U6IGNhdF9wbmcsXHJcbiAgICAgICAgc2hhZG93OiBjYXRTaGFkb3dfcG5nLFxyXG4gICAgICAgIHZhbHVlOiA0LFxyXG4gICAgICAgIHRhbmRlbTogdmFyaWFibGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NhdCcgKVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyB0dXJ0bGVcclxuICAgICAgbmV3IE9iamVjdFZhcmlhYmxlKCB7XHJcbiAgICAgICAgaW1hZ2U6IHR1cnRsZV9wbmcsXHJcbiAgICAgICAgc2hhZG93OiB0dXJ0bGVTaGFkb3dfcG5nLFxyXG4gICAgICAgIHZhbHVlOiA2LFxyXG4gICAgICAgIHRhbmRlbTogdmFyaWFibGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3R1cnRsZScgKVxyXG4gICAgICB9IClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIHZhcmlhYmxlcywge1xyXG5cclxuICAgICAgLy8gaWNvbiB1c2VkIHRvIHJlcHJlc2VudCB0aGlzIHNjZW5lIGluIHRoZSBzY2VuZSBjb250cm9sIChyYWRpbyBidXR0b25zKVxyXG4gICAgICBpY29uOiBuZXcgSW1hZ2UoIHR1cnRsZV9wbmcsIHtcclxuICAgICAgICBtYXhIZWlnaHQ6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU01BTExfVEVSTV9ESUFNRVRFUlxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyB3ZWlnaHQgYXQgd2hpY2ggdGhlIHNjYWxlIGJvdHRvbXMgb3V0XHJcbiAgICAgIG1heFdlaWdodDogNTAsXHJcblxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ0FuaW1hbHNTY2VuZScsIEFuaW1hbHNTY2VuZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsYUFBYSxNQUFNLGtDQUFrQztBQUM1RCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxnQkFBZ0IsTUFBTSxxQ0FBcUM7QUFDbEUsT0FBT0MseUJBQXlCLE1BQU0sMkNBQTJDO0FBQ2pGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFHakUsZUFBZSxNQUFNQyxZQUFZLFNBQVNGLFdBQVcsQ0FBQztFQUU3Q0csV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLE1BQU1DLGVBQWUsR0FBR0QsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWSxDQUFDO0lBRTFELE1BQU1DLFNBQVMsR0FBRztJQUVoQjtJQUNBLElBQUlOLGNBQWMsQ0FBRTtNQUNsQk8sS0FBSyxFQUFFZCxPQUFPO01BQ2RlLE1BQU0sRUFBRWQsYUFBYTtNQUNyQmUsS0FBSyxFQUFFLEVBQUU7TUFDVE4sTUFBTSxFQUFFQyxlQUFlLENBQUNDLFlBQVksQ0FBRSxLQUFNO0lBQzlDLENBQUUsQ0FBQztJQUVIO0lBQ0EsSUFBSUwsY0FBYyxDQUFFO01BQ2xCTyxLQUFLLEVBQUVoQixPQUFPO01BQ2RpQixNQUFNLEVBQUVoQixhQUFhO01BQ3JCaUIsS0FBSyxFQUFFLENBQUM7TUFDUk4sTUFBTSxFQUFFQyxlQUFlLENBQUNDLFlBQVksQ0FBRSxLQUFNO0lBQzlDLENBQUUsQ0FBQztJQUVIO0lBQ0EsSUFBSUwsY0FBYyxDQUFFO01BQ2xCTyxLQUFLLEVBQUVaLFVBQVU7TUFDakJhLE1BQU0sRUFBRVosZ0JBQWdCO01BQ3hCYSxLQUFLLEVBQUUsQ0FBQztNQUNSTixNQUFNLEVBQUVDLGVBQWUsQ0FBQ0MsWUFBWSxDQUFFLFFBQVM7SUFDakQsQ0FBRSxDQUFDLENBQ0o7SUFFRCxLQUFLLENBQUVDLFNBQVMsRUFBRTtNQUVoQjtNQUNBSSxJQUFJLEVBQUUsSUFBSXBCLEtBQUssQ0FBRUssVUFBVSxFQUFFO1FBQzNCZ0IsU0FBUyxFQUFFZCx5QkFBeUIsQ0FBQ2U7TUFDdkMsQ0FBRSxDQUFDO01BRUg7TUFDQUMsU0FBUyxFQUFFLEVBQUU7TUFFYlYsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQUwsZ0JBQWdCLENBQUNnQixRQUFRLENBQUUsY0FBYyxFQUFFYixZQUFhLENBQUMifQ==