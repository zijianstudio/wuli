// Copyright 2013-2023, University of Colorado Boulder

/**
 * Ruler is the model of a ruler that is movable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import beersLawLab from '../../beersLawLab.js';
import BLLMovable from '../../common/model/BLLMovable.js';
export default class Ruler extends BLLMovable {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      length: 2.1,
      height: 0.35,
      // BLLMovableOptions
      positionPhetioReadOnly: false
    }, providedOptions);
    super(options);
    this.length = options.length;
    this.height = options.height;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
beersLawLab.register('Ruler', Ruler);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJiZWVyc0xhd0xhYiIsIkJMTE1vdmFibGUiLCJSdWxlciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxlbmd0aCIsImhlaWdodCIsInBvc2l0aW9uUGhldGlvUmVhZE9ubHkiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSdWxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSdWxlciBpcyB0aGUgbW9kZWwgb2YgYSBydWxlciB0aGF0IGlzIG1vdmFibGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IEJMTE1vdmFibGUsIHsgQkxMTW92YWJsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQkxMTW92YWJsZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGxlbmd0aD86IG51bWJlcjsgLy8gaW4gY21cclxuICBoZWlnaHQ/OiBudW1iZXI7IC8vIGluIGNtXHJcbn07XHJcblxyXG50eXBlIFJ1bGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQkxMTW92YWJsZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlciBleHRlbmRzIEJMTE1vdmFibGUge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogUnVsZXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UnVsZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgQkxMTW92YWJsZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGxlbmd0aDogMi4xLFxyXG4gICAgICBoZWlnaHQ6IDAuMzUsXHJcblxyXG4gICAgICAvLyBCTExNb3ZhYmxlT3B0aW9uc1xyXG4gICAgICBwb3NpdGlvblBoZXRpb1JlYWRPbmx5OiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ1J1bGVyJywgUnVsZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLFVBQVUsTUFBNkIsa0NBQWtDO0FBU2hGLGVBQWUsTUFBTUMsS0FBSyxTQUFTRCxVQUFVLENBQUM7RUFLckNFLFdBQVdBLENBQUVDLGVBQTZCLEVBQUc7SUFFbEQsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQStDLENBQUMsQ0FBRTtNQUV6RTtNQUNBTyxNQUFNLEVBQUUsR0FBRztNQUNYQyxNQUFNLEVBQUUsSUFBSTtNQUVaO01BQ0FDLHNCQUFzQixFQUFFO0lBQzFCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVDLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNDLE1BQU0sR0FBR0QsT0FBTyxDQUFDQyxNQUFNO0lBQzVCLElBQUksQ0FBQ0MsTUFBTSxHQUFHRixPQUFPLENBQUNFLE1BQU07RUFDOUI7RUFFZ0JFLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBVCxXQUFXLENBQUNXLFFBQVEsQ0FBRSxPQUFPLEVBQUVULEtBQU0sQ0FBQyJ9