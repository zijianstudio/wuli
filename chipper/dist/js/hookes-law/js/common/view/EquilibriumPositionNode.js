// Copyright 2015-2022, University of Colorado Boulder

/**
 * Vertical dashed line that denotes the equilibrium position of a spring or system of springs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Line } from '../../../../scenery/js/imports.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawColors from '../HookesLawColors.js';
export default class EquilibriumPositionNode extends Line {
  constructor(length, providedOptions) {
    const options = optionize()({
      // LineOptions
      stroke: HookesLawColors.EQUILIBRIUM_POSITION,
      lineWidth: 2,
      lineDash: [3, 3]
    }, providedOptions);
    super(0, 0, 0, length, options);
  }
}
hookesLaw.register('EquilibriumPositionNode', EquilibriumPositionNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJMaW5lIiwiaG9va2VzTGF3IiwiSG9va2VzTGF3Q29sb3JzIiwiRXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImxlbmd0aCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzdHJva2UiLCJFUVVJTElCUklVTV9QT1NJVElPTiIsImxpbmVXaWR0aCIsImxpbmVEYXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVpbGlicml1bVBvc2l0aW9uTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZXJ0aWNhbCBkYXNoZWQgbGluZSB0aGF0IGRlbm90ZXMgdGhlIGVxdWlsaWJyaXVtIHBvc2l0aW9uIG9mIGEgc3ByaW5nIG9yIHN5c3RlbSBvZiBzcHJpbmdzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBMaW5lT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBob29rZXNMYXcgZnJvbSAnLi4vLi4vaG9va2VzTGF3LmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbG9ycyBmcm9tICcuLi9Ib29rZXNMYXdDb2xvcnMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEVxdWlsaWJyaXVtUG9zaXRpb25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmXHJcbiAgUGlja09wdGlvbmFsPExpbmVPcHRpb25zLCAndmlzaWJsZVByb3BlcnR5Jz4gJiBQaWNrUmVxdWlyZWQ8TGluZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWlsaWJyaXVtUG9zaXRpb25Ob2RlIGV4dGVuZHMgTGluZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9uczogRXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTGluZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIExpbmVPcHRpb25zXHJcbiAgICAgIHN0cm9rZTogSG9va2VzTGF3Q29sb3JzLkVRVUlMSUJSSVVNX1BPU0lUSU9OLFxyXG4gICAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDMsIDMgXVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIDAsIDAsIDAsIGxlbmd0aCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnRXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGUnLCBFcXVpbGlicml1bVBvc2l0aW9uTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUduRixTQUFTQyxJQUFJLFFBQTZDLG1DQUFtQztBQUM3RixPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFPbkQsZUFBZSxNQUFNQyx1QkFBdUIsU0FBU0gsSUFBSSxDQUFDO0VBRWpESSxXQUFXQSxDQUFFQyxNQUFjLEVBQUVDLGVBQStDLEVBQUc7SUFFcEYsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQTJELENBQUMsQ0FBRTtNQUVyRjtNQUNBUyxNQUFNLEVBQUVOLGVBQWUsQ0FBQ08sb0JBQW9CO01BQzVDQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxRQUFRLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQztJQUNsQixDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFRCxNQUFNLEVBQUVFLE9BQVEsQ0FBQztFQUNuQztBQUNGO0FBRUFOLFNBQVMsQ0FBQ1csUUFBUSxDQUFFLHlCQUF5QixFQUFFVCx1QkFBd0IsQ0FBQyJ9