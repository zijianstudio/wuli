// Copyright 2020-2022, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Ratio and Proportion simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// Even though there is only one Profile, it is still nice to use this pattern for color organizing.
const RAPColors = {
  tickMarksAndLabelsInFitnessProperty: new ProfileColorProperty(ratioAndProportion, 'tickMarksAndLabelsInFitness', {
    default: Color.DARK_GRAY
  }),
  tickMarksAndLabelsOutOfFitnessProperty: new ProfileColorProperty(ratioAndProportion, 'tickMarksAndLabelsOutOfFitness', {
    default: Color.GRAY
  }),
  // the color will jump from backgroundInterpolationToFitness to this when actually in ratio
  backgroundInFitnessProperty: new ProfileColorProperty(ratioAndProportion, 'backgroundInFitness', {
    default: new Color('#5ab46c')
  }),
  // this will be the max of the interpolation for the background color
  backgroundInterpolationToFitnessProperty: new ProfileColorProperty(ratioAndProportion, 'backgroundInterpolationToFitness', {
    default: new Color('#77ce81')
  }),
  backgroundOutOfFitnessProperty: new ProfileColorProperty(ratioAndProportion, 'backgroundOutOfFitness', {
    default: new Color('white')
  }),
  // cue arrows around the ratio hands.
  cueArrowsProperty: new ProfileColorProperty(ratioAndProportion, 'cueArrows', {
    default: Color.DARK_GRAY
  }),
  createScreenHandProperty: new ProfileColorProperty(ratioAndProportion, 'createScreenHand', {
    default: new Color('#8d5cbd')
  }),
  discoverChallenge1Property: new ProfileColorProperty(ratioAndProportion, 'discoverChallenge1', {
    default: new Color(233, 69, 69)
  }),
  discoverChallenge2Property: new ProfileColorProperty(ratioAndProportion, 'discoverChallenge2', {
    default: new Color(87, 182, 221)
  }),
  discoverChallenge3Property: new ProfileColorProperty(ratioAndProportion, 'discoverChallenge3', {
    default: new Color(255, 200, 0)
  })
};
ratioAndProportion.register('RAPColors', RAPColors);
export default RAPColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsIlByb2ZpbGVDb2xvclByb3BlcnR5IiwicmF0aW9BbmRQcm9wb3J0aW9uIiwiUkFQQ29sb3JzIiwidGlja01hcmtzQW5kTGFiZWxzSW5GaXRuZXNzUHJvcGVydHkiLCJkZWZhdWx0IiwiREFSS19HUkFZIiwidGlja01hcmtzQW5kTGFiZWxzT3V0T2ZGaXRuZXNzUHJvcGVydHkiLCJHUkFZIiwiYmFja2dyb3VuZEluRml0bmVzc1Byb3BlcnR5IiwiYmFja2dyb3VuZEludGVycG9sYXRpb25Ub0ZpdG5lc3NQcm9wZXJ0eSIsImJhY2tncm91bmRPdXRPZkZpdG5lc3NQcm9wZXJ0eSIsImN1ZUFycm93c1Byb3BlcnR5IiwiY3JlYXRlU2NyZWVuSGFuZFByb3BlcnR5IiwiZGlzY292ZXJDaGFsbGVuZ2UxUHJvcGVydHkiLCJkaXNjb3ZlckNoYWxsZW5nZTJQcm9wZXJ0eSIsImRpc2NvdmVyQ2hhbGxlbmdlM1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSQVBDb2xvcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGNvbG9ycyB1c2VkIGZvciB2YXJpb3VzIG1ham9yIGNvbXBvbmVudHMgb2YgdGhlIFJhdGlvIGFuZCBQcm9wb3J0aW9uIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBDb2xvciwgUHJvZmlsZUNvbG9yUHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcmF0aW9BbmRQcm9wb3J0aW9uIGZyb20gJy4uLy4uL3JhdGlvQW5kUHJvcG9ydGlvbi5qcyc7XHJcblxyXG4vLyBFdmVuIHRob3VnaCB0aGVyZSBpcyBvbmx5IG9uZSBQcm9maWxlLCBpdCBpcyBzdGlsbCBuaWNlIHRvIHVzZSB0aGlzIHBhdHRlcm4gZm9yIGNvbG9yIG9yZ2FuaXppbmcuXHJcbmNvbnN0IFJBUENvbG9ycyA9IHtcclxuICB0aWNrTWFya3NBbmRMYWJlbHNJbkZpdG5lc3NQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCByYXRpb0FuZFByb3BvcnRpb24sICd0aWNrTWFya3NBbmRMYWJlbHNJbkZpdG5lc3MnLCB7XHJcbiAgICBkZWZhdWx0OiBDb2xvci5EQVJLX0dSQVlcclxuICB9ICksXHJcbiAgdGlja01hcmtzQW5kTGFiZWxzT3V0T2ZGaXRuZXNzUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggcmF0aW9BbmRQcm9wb3J0aW9uLCAndGlja01hcmtzQW5kTGFiZWxzT3V0T2ZGaXRuZXNzJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuR1JBWVxyXG4gIH0gKSxcclxuXHJcbiAgLy8gdGhlIGNvbG9yIHdpbGwganVtcCBmcm9tIGJhY2tncm91bmRJbnRlcnBvbGF0aW9uVG9GaXRuZXNzIHRvIHRoaXMgd2hlbiBhY3R1YWxseSBpbiByYXRpb1xyXG4gIGJhY2tncm91bmRJbkZpdG5lc3NQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCByYXRpb0FuZFByb3BvcnRpb24sICdiYWNrZ3JvdW5kSW5GaXRuZXNzJywge1xyXG4gICAgZGVmYXVsdDogbmV3IENvbG9yKCAnIzVhYjQ2YycgKVxyXG4gIH0gKSxcclxuXHJcbiAgLy8gdGhpcyB3aWxsIGJlIHRoZSBtYXggb2YgdGhlIGludGVycG9sYXRpb24gZm9yIHRoZSBiYWNrZ3JvdW5kIGNvbG9yXHJcbiAgYmFja2dyb3VuZEludGVycG9sYXRpb25Ub0ZpdG5lc3NQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCByYXRpb0FuZFByb3BvcnRpb24sICdiYWNrZ3JvdW5kSW50ZXJwb2xhdGlvblRvRml0bmVzcycsIHtcclxuICAgIGRlZmF1bHQ6IG5ldyBDb2xvciggJyM3N2NlODEnIClcclxuICB9ICksXHJcbiAgYmFja2dyb3VuZE91dE9mRml0bmVzc1Byb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHJhdGlvQW5kUHJvcG9ydGlvbiwgJ2JhY2tncm91bmRPdXRPZkZpdG5lc3MnLCB7XHJcbiAgICBkZWZhdWx0OiBuZXcgQ29sb3IoICd3aGl0ZScgKVxyXG4gIH0gKSxcclxuXHJcbiAgLy8gY3VlIGFycm93cyBhcm91bmQgdGhlIHJhdGlvIGhhbmRzLlxyXG4gIGN1ZUFycm93c1Byb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHJhdGlvQW5kUHJvcG9ydGlvbiwgJ2N1ZUFycm93cycsIHtcclxuICAgIGRlZmF1bHQ6IENvbG9yLkRBUktfR1JBWVxyXG4gIH0gKSxcclxuICBjcmVhdGVTY3JlZW5IYW5kUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggcmF0aW9BbmRQcm9wb3J0aW9uLCAnY3JlYXRlU2NyZWVuSGFuZCcsIHtcclxuICAgIGRlZmF1bHQ6IG5ldyBDb2xvciggJyM4ZDVjYmQnIClcclxuICB9ICksXHJcbiAgZGlzY292ZXJDaGFsbGVuZ2UxUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggcmF0aW9BbmRQcm9wb3J0aW9uLCAnZGlzY292ZXJDaGFsbGVuZ2UxJywge1xyXG4gICAgZGVmYXVsdDogbmV3IENvbG9yKCAyMzMsIDY5LCA2OSApXHJcbiAgfSApLFxyXG4gIGRpc2NvdmVyQ2hhbGxlbmdlMlByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHJhdGlvQW5kUHJvcG9ydGlvbiwgJ2Rpc2NvdmVyQ2hhbGxlbmdlMicsIHtcclxuICAgIGRlZmF1bHQ6IG5ldyBDb2xvciggODcsIDE4MiwgMjIxIClcclxuICB9ICksXHJcbiAgZGlzY292ZXJDaGFsbGVuZ2UzUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggcmF0aW9BbmRQcm9wb3J0aW9uLCAnZGlzY292ZXJDaGFsbGVuZ2UzJywge1xyXG4gICAgZGVmYXVsdDogbmV3IENvbG9yKCAyNTUsIDIwMCwgMCApXHJcbiAgfSApXHJcbn07XHJcblxyXG5yYXRpb0FuZFByb3BvcnRpb24ucmVnaXN0ZXIoICdSQVBDb2xvcnMnLCBSQVBDb2xvcnMgKTtcclxuZXhwb3J0IGRlZmF1bHQgUkFQQ29sb3JzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLEVBQUVDLG9CQUFvQixRQUFRLG1DQUFtQztBQUMvRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7O0FBRTVEO0FBQ0EsTUFBTUMsU0FBUyxHQUFHO0VBQ2hCQyxtQ0FBbUMsRUFBRSxJQUFJSCxvQkFBb0IsQ0FBRUMsa0JBQWtCLEVBQUUsNkJBQTZCLEVBQUU7SUFDaEhHLE9BQU8sRUFBRUwsS0FBSyxDQUFDTTtFQUNqQixDQUFFLENBQUM7RUFDSEMsc0NBQXNDLEVBQUUsSUFBSU4sb0JBQW9CLENBQUVDLGtCQUFrQixFQUFFLGdDQUFnQyxFQUFFO0lBQ3RIRyxPQUFPLEVBQUVMLEtBQUssQ0FBQ1E7RUFDakIsQ0FBRSxDQUFDO0VBRUg7RUFDQUMsMkJBQTJCLEVBQUUsSUFBSVIsb0JBQW9CLENBQUVDLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFO0lBQ2hHRyxPQUFPLEVBQUUsSUFBSUwsS0FBSyxDQUFFLFNBQVU7RUFDaEMsQ0FBRSxDQUFDO0VBRUg7RUFDQVUsd0NBQXdDLEVBQUUsSUFBSVQsb0JBQW9CLENBQUVDLGtCQUFrQixFQUFFLGtDQUFrQyxFQUFFO0lBQzFIRyxPQUFPLEVBQUUsSUFBSUwsS0FBSyxDQUFFLFNBQVU7RUFDaEMsQ0FBRSxDQUFDO0VBQ0hXLDhCQUE4QixFQUFFLElBQUlWLG9CQUFvQixDQUFFQyxrQkFBa0IsRUFBRSx3QkFBd0IsRUFBRTtJQUN0R0csT0FBTyxFQUFFLElBQUlMLEtBQUssQ0FBRSxPQUFRO0VBQzlCLENBQUUsQ0FBQztFQUVIO0VBQ0FZLGlCQUFpQixFQUFFLElBQUlYLG9CQUFvQixDQUFFQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUU7SUFDNUVHLE9BQU8sRUFBRUwsS0FBSyxDQUFDTTtFQUNqQixDQUFFLENBQUM7RUFDSE8sd0JBQXdCLEVBQUUsSUFBSVosb0JBQW9CLENBQUVDLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFO0lBQzFGRyxPQUFPLEVBQUUsSUFBSUwsS0FBSyxDQUFFLFNBQVU7RUFDaEMsQ0FBRSxDQUFDO0VBQ0hjLDBCQUEwQixFQUFFLElBQUliLG9CQUFvQixDQUFFQyxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRTtJQUM5RkcsT0FBTyxFQUFFLElBQUlMLEtBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7RUFDbEMsQ0FBRSxDQUFDO0VBQ0hlLDBCQUEwQixFQUFFLElBQUlkLG9CQUFvQixDQUFFQyxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRTtJQUM5RkcsT0FBTyxFQUFFLElBQUlMLEtBQUssQ0FBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUk7RUFDbkMsQ0FBRSxDQUFDO0VBQ0hnQiwwQkFBMEIsRUFBRSxJQUFJZixvQkFBb0IsQ0FBRUMsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUU7SUFDOUZHLE9BQU8sRUFBRSxJQUFJTCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFFO0VBQ2xDLENBQUU7QUFDSixDQUFDO0FBRURFLGtCQUFrQixDQUFDZSxRQUFRLENBQUUsV0FBVyxFQUFFZCxTQUFVLENBQUM7QUFDckQsZUFBZUEsU0FBUyJ9