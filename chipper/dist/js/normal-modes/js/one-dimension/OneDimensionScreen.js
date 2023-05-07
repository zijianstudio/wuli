// Copyright 2020-2022, University of Colorado Boulder

/**
 * The 'One Dimension' screen.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import NormalModesColors from '../common/NormalModesColors.js';
import NormalModesIconFactory from '../common/view/NormalModesIconFactory.js';
import normalModes from '../normalModes.js';
import NormalModesStrings from '../NormalModesStrings.js';
import OneDimensionModel from './model/OneDimensionModel.js';
import OneDimensionScreenView from './view/OneDimensionScreenView.js';
class OneDimensionScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: NormalModesStrings.screen.oneDimensionStringProperty,
      backgroundColorProperty: new Property(NormalModesColors.SCREEN_BACKGROUND),
      homeScreenIcon: NormalModesIconFactory.createOneDimensionScreenIcon(),
      tandem: tandem
    };
    super(() => new OneDimensionModel({
      tandem: tandem.createTandem('model')
    }), model => new OneDimensionScreenView(model, {
      tandem: tandem.createTandem('view')
    }), options);
  }
}
normalModes.register('OneDimensionScreen', OneDimensionScreen);
export default OneDimensionScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIk5vcm1hbE1vZGVzQ29sb3JzIiwiTm9ybWFsTW9kZXNJY29uRmFjdG9yeSIsIm5vcm1hbE1vZGVzIiwiTm9ybWFsTW9kZXNTdHJpbmdzIiwiT25lRGltZW5zaW9uTW9kZWwiLCJPbmVEaW1lbnNpb25TY3JlZW5WaWV3IiwiT25lRGltZW5zaW9uU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsIm9uZURpbWVuc2lvblN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJTQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlT25lRGltZW5zaW9uU2NyZWVuSWNvbiIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPbmVEaW1lbnNpb25TY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdPbmUgRGltZW5zaW9uJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgRnJhbmNvIEJhcnBwIEdvbWVzIChVVEZQUilcclxuICogQGF1dGhvciBUaGlhZ28gZGUgTWVuZG9uw6dhIE1pbGRlbWJlcmdlciAoVVRGUFIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc0NvbG9ycyBmcm9tICcuLi9jb21tb24vTm9ybWFsTW9kZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgTm9ybWFsTW9kZXNJY29uRmFjdG9yeSBmcm9tICcuLi9jb21tb24vdmlldy9Ob3JtYWxNb2Rlc0ljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IG5vcm1hbE1vZGVzIGZyb20gJy4uL25vcm1hbE1vZGVzLmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVzU3RyaW5ncyBmcm9tICcuLi9Ob3JtYWxNb2Rlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgT25lRGltZW5zaW9uTW9kZWwgZnJvbSAnLi9tb2RlbC9PbmVEaW1lbnNpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBPbmVEaW1lbnNpb25TY3JlZW5WaWV3IGZyb20gJy4vdmlldy9PbmVEaW1lbnNpb25TY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIE9uZURpbWVuc2lvblNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IE5vcm1hbE1vZGVzU3RyaW5ncy5zY3JlZW4ub25lRGltZW5zaW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIE5vcm1hbE1vZGVzQ29sb3JzLlNDUkVFTl9CQUNLR1JPVU5EICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBOb3JtYWxNb2Rlc0ljb25GYWN0b3J5LmNyZWF0ZU9uZURpbWVuc2lvblNjcmVlbkljb24oKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBPbmVEaW1lbnNpb25Nb2RlbCggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSB9ICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBPbmVEaW1lbnNpb25TY3JlZW5WaWV3KCBtb2RlbCwgeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApIH0gKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbm5vcm1hbE1vZGVzLnJlZ2lzdGVyKCAnT25lRGltZW5zaW9uU2NyZWVuJywgT25lRGltZW5zaW9uU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IE9uZURpbWVuc2lvblNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsaUJBQWlCLE1BQU0sZ0NBQWdDO0FBQzlELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyxpQkFBaUIsTUFBTSw4QkFBOEI7QUFDNUQsT0FBT0Msc0JBQXNCLE1BQU0sa0NBQWtDO0FBRXJFLE1BQU1DLGtCQUFrQixTQUFTUCxNQUFNLENBQUM7RUFFdEM7QUFDRjtBQUNBO0VBQ0VRLFdBQVdBLENBQUVDLE1BQU0sRUFBRztJQUVwQixNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFUCxrQkFBa0IsQ0FBQ1EsTUFBTSxDQUFDQywwQkFBMEI7TUFDMURDLHVCQUF1QixFQUFFLElBQUlmLFFBQVEsQ0FBRUUsaUJBQWlCLENBQUNjLGlCQUFrQixDQUFDO01BQzVFQyxjQUFjLEVBQUVkLHNCQUFzQixDQUFDZSw0QkFBNEIsQ0FBQyxDQUFDO01BQ3JFUixNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLGlCQUFpQixDQUFFO01BQUVJLE1BQU0sRUFBRUEsTUFBTSxDQUFDUyxZQUFZLENBQUUsT0FBUTtJQUFFLENBQUUsQ0FBQyxFQUN6RUMsS0FBSyxJQUFJLElBQUliLHNCQUFzQixDQUFFYSxLQUFLLEVBQUU7TUFBRVYsTUFBTSxFQUFFQSxNQUFNLENBQUNTLFlBQVksQ0FBRSxNQUFPO0lBQUUsQ0FBRSxDQUFDLEVBQ3ZGUixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLFdBQVcsQ0FBQ2lCLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRWIsa0JBQW1CLENBQUM7QUFDaEUsZUFBZUEsa0JBQWtCIn0=