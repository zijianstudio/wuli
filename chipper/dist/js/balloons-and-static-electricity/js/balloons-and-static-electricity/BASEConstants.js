// Copyright 2017-2021, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 *
 * @author Jesse Greenberg
 */

import Property from '../../../axon/js/Property.js';
import balloonsAndStaticElectricity from '../balloonsAndStaticElectricity.js';
const BASEConstants = {
  backgroundColorProperty: new Property('rgb( 151, 208, 255 )'),
  msScaleFactor: 1000,
  // to convert seconds to milliseconds, used throughout the view
  MAX_BALLOON_CHARGE: 57,
  // max number of charges the balloon can have
  COULOMBS_LAW_CONSTANT: 10000,
  // used when calculating force, value chosen so sim looks like Java version

  // in view coordinates, to match the layout of charge images before using node.rasterized(), because
  // node.toImage() automatically added some padding, see
  // https://github.com/phetsims/balloons-and-static-electricity/issues/434
  IMAGE_PADDING: 1,
  // scale for image charges so they look less pixelated after being rasterized
  IMAGE_SCALE: 2
};
balloonsAndStaticElectricity.register('BASEConstants', BASEConstants);
export default BASEConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkiLCJCQVNFQ29uc3RhbnRzIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJtc1NjYWxlRmFjdG9yIiwiTUFYX0JBTExPT05fQ0hBUkdFIiwiQ09VTE9NQlNfTEFXX0NPTlNUQU5UIiwiSU1BR0VfUEFERElORyIsIklNQUdFX1NDQUxFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQVNFQ29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhlIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuXHJcbmNvbnN0IEJBU0VDb25zdGFudHMgPSB7XHJcbiAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggJ3JnYiggMTUxLCAyMDgsIDI1NSApJyApLFxyXG4gIG1zU2NhbGVGYWN0b3I6IDEwMDAsIC8vIHRvIGNvbnZlcnQgc2Vjb25kcyB0byBtaWxsaXNlY29uZHMsIHVzZWQgdGhyb3VnaG91dCB0aGUgdmlld1xyXG4gIE1BWF9CQUxMT09OX0NIQVJHRTogNTcsIC8vIG1heCBudW1iZXIgb2YgY2hhcmdlcyB0aGUgYmFsbG9vbiBjYW4gaGF2ZVxyXG4gIENPVUxPTUJTX0xBV19DT05TVEFOVDogMTAwMDAsIC8vIHVzZWQgd2hlbiBjYWxjdWxhdGluZyBmb3JjZSwgdmFsdWUgY2hvc2VuIHNvIHNpbSBsb29rcyBsaWtlIEphdmEgdmVyc2lvblxyXG5cclxuICAvLyBpbiB2aWV3IGNvb3JkaW5hdGVzLCB0byBtYXRjaCB0aGUgbGF5b3V0IG9mIGNoYXJnZSBpbWFnZXMgYmVmb3JlIHVzaW5nIG5vZGUucmFzdGVyaXplZCgpLCBiZWNhdXNlXHJcbiAgLy8gbm9kZS50b0ltYWdlKCkgYXV0b21hdGljYWxseSBhZGRlZCBzb21lIHBhZGRpbmcsIHNlZVxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80MzRcclxuICBJTUFHRV9QQURESU5HOiAxLFxyXG5cclxuICAvLyBzY2FsZSBmb3IgaW1hZ2UgY2hhcmdlcyBzbyB0aGV5IGxvb2sgbGVzcyBwaXhlbGF0ZWQgYWZ0ZXIgYmVpbmcgcmFzdGVyaXplZFxyXG4gIElNQUdFX1NDQUxFOiAyXHJcbn07XHJcblxyXG5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LnJlZ2lzdGVyKCAnQkFTRUNvbnN0YW50cycsIEJBU0VDb25zdGFudHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJBU0VDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBRTdFLE1BQU1DLGFBQWEsR0FBRztFQUNwQkMsdUJBQXVCLEVBQUUsSUFBSUgsUUFBUSxDQUFFLHNCQUF1QixDQUFDO0VBQy9ESSxhQUFhLEVBQUUsSUFBSTtFQUFFO0VBQ3JCQyxrQkFBa0IsRUFBRSxFQUFFO0VBQUU7RUFDeEJDLHFCQUFxQixFQUFFLEtBQUs7RUFBRTs7RUFFOUI7RUFDQTtFQUNBO0VBQ0FDLGFBQWEsRUFBRSxDQUFDO0VBRWhCO0VBQ0FDLFdBQVcsRUFBRTtBQUNmLENBQUM7QUFFRFAsNEJBQTRCLENBQUNRLFFBQVEsQ0FBRSxlQUFlLEVBQUVQLGFBQWMsQ0FBQztBQUV2RSxlQUFlQSxhQUFhIn0=