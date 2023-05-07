// Copyright 2022, University of Colorado Boulder

/**
 * MoleculeNode is the base class for all molecules.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node } from '../../../scenery/js/imports.js';
import nitroglycerin from '../nitroglycerin.js';
export default class MoleculeNode extends Node {
  constructor(atomNodes, providedOptions) {
    const options = optionize()({
      children: [new Node({
        children: atomNodes,
        center: Vector2.ZERO // origin at geometric center
      })]
    }, providedOptions);
    super(options);
  }
}
nitroglycerin.register('MoleculeNode', MoleculeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwib3B0aW9uaXplIiwiTm9kZSIsIm5pdHJvZ2x5Y2VyaW4iLCJNb2xlY3VsZU5vZGUiLCJjb25zdHJ1Y3RvciIsImF0b21Ob2RlcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjaGlsZHJlbiIsImNlbnRlciIsIlpFUk8iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbGVjdWxlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9sZWN1bGVOb2RlIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBhbGwgbW9sZWN1bGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSwgeyBBdG9tTm9kZU9wdGlvbnMgfSBmcm9tICcuL0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IG5pdHJvZ2x5Y2VyaW4gZnJvbSAnLi4vbml0cm9nbHljZXJpbi5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBUaGlzIGlzIG5vdCB1c2VkIGluIE1vbGVjdWxlTm9kZSwgYnV0IGlzIHVzZWQgaW4gZXZlcnkgY29uY3JldGUgY2xhc3MgdGhhdCBleHRlbmRzIE1vbGVjdWxlTm9kZS5cclxuICBhdG9tTm9kZU9wdGlvbnM/OiBBdG9tTm9kZU9wdGlvbnM7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBNb2xlY3VsZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbGVjdWxlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIGF0b21Ob2RlczogQXRvbU5vZGVbXSwgcHJvdmlkZWRPcHRpb25zPzogTW9sZWN1bGVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1vbGVjdWxlTm9kZU9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdhdG9tTm9kZU9wdGlvbnMnPiwgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogYXRvbU5vZGVzLFxyXG4gICAgICAgIGNlbnRlcjogVmVjdG9yMi5aRVJPIC8vIG9yaWdpbiBhdCBnZW9tZXRyaWMgY2VudGVyXHJcbiAgICAgIH0gKSBdXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubml0cm9nbHljZXJpbi5yZWdpc3RlciggJ01vbGVjdWxlTm9kZScsIE1vbGVjdWxlTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFFMUQsU0FBU0MsSUFBSSxRQUFxQixnQ0FBZ0M7QUFFbEUsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQVUvQyxlQUFlLE1BQU1DLFlBQVksU0FBU0YsSUFBSSxDQUFDO0VBRW5DRyxXQUFXQSxDQUFFQyxTQUFxQixFQUFFQyxlQUFxQyxFQUFHO0lBRXBGLE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUErRSxDQUFDLENBQUU7TUFDekdRLFFBQVEsRUFBRSxDQUFFLElBQUlQLElBQUksQ0FBRTtRQUNwQk8sUUFBUSxFQUFFSCxTQUFTO1FBQ25CSSxNQUFNLEVBQUVWLE9BQU8sQ0FBQ1csSUFBSSxDQUFDO01BQ3ZCLENBQUUsQ0FBQztJQUNMLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVDLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFMLGFBQWEsQ0FBQ1MsUUFBUSxDQUFFLGNBQWMsRUFBRVIsWUFBYSxDQUFDIn0=