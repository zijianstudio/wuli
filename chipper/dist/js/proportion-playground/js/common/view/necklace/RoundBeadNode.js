// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows a single round bead.  Used in the necklace as well as in the NumberPicker icons.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import { Circle, Node } from '../../../../../scenery/js/imports.js';
import MutableOptionsNode from '../../../../../sun/js/MutableOptionsNode.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import ProportionPlaygroundColors from '../ProportionPlaygroundColors.js';

// constants
const DIAMETER = ProportionPlaygroundConstants.BEAD_DIAMETER;

// {Node} - Our colors need to be updated on the shaded sphere, so it's wrapped in a MutableOptionsNode.
const shadedNode = new MutableOptionsNode(ShadedSphereNode, [DIAMETER], {
  highlightDiameterRatio: 0.3,
  highlightXOffset: -0.3,
  highlightYOffset: -0.3
}, {
  mainColor: ProportionPlaygroundColors.adjustedNecklaceRoundBeadProperty(-0.1),
  shadowColor: ProportionPlaygroundColors.adjustedNecklaceRoundBeadProperty(-0.5),
  highlightColor: ProportionPlaygroundColors.adjustedNecklaceRoundBeadProperty(0.5)
});

// {Node} - Background
const backgroundNode = new Circle(DIAMETER * 0.51, {
  fill: ProportionPlaygroundColors.adjustedNecklaceRoundBeadProperty(-0.6),
  x: DIAMETER / 30,
  y: DIAMETER / 30
});

// {Node} - Shared child node that will have a parent for every display of this node.
// Presumably should not memory-leak, as we save and re-use references.
const containerNode = new Node({
  children: [backgroundNode, shadedNode],
  center: Vector2.ZERO
});
class RoundBeadNode extends Node {
  /**
   * @param {Object} [options] - node options
   */
  constructor(options) {
    super(merge({
      children: [containerNode]
    }, options));
  }
}
proportionPlayground.register('RoundBeadNode', RoundBeadNode);
export default RoundBeadNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJTaGFkZWRTcGhlcmVOb2RlIiwiQ2lyY2xlIiwiTm9kZSIsIk11dGFibGVPcHRpb25zTm9kZSIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMiLCJQcm9wb3J0aW9uUGxheWdyb3VuZENvbG9ycyIsIkRJQU1FVEVSIiwiQkVBRF9ESUFNRVRFUiIsInNoYWRlZE5vZGUiLCJoaWdobGlnaHREaWFtZXRlclJhdGlvIiwiaGlnaGxpZ2h0WE9mZnNldCIsImhpZ2hsaWdodFlPZmZzZXQiLCJtYWluQ29sb3IiLCJhZGp1c3RlZE5lY2tsYWNlUm91bmRCZWFkUHJvcGVydHkiLCJzaGFkb3dDb2xvciIsImhpZ2hsaWdodENvbG9yIiwiYmFja2dyb3VuZE5vZGUiLCJmaWxsIiwieCIsInkiLCJjb250YWluZXJOb2RlIiwiY2hpbGRyZW4iLCJjZW50ZXIiLCJaRVJPIiwiUm91bmRCZWFkTm9kZSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUm91bmRCZWFkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHNpbmdsZSByb3VuZCBiZWFkLiAgVXNlZCBpbiB0aGUgbmVja2xhY2UgYXMgd2VsbCBhcyBpbiB0aGUgTnVtYmVyUGlja2VyIGljb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE11dGFibGVPcHRpb25zTm9kZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvTXV0YWJsZU9wdGlvbnNOb2RlLmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIGZyb20gJy4uLy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzIGZyb20gJy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBESUFNRVRFUiA9IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLkJFQURfRElBTUVURVI7XHJcblxyXG4vLyB7Tm9kZX0gLSBPdXIgY29sb3JzIG5lZWQgdG8gYmUgdXBkYXRlZCBvbiB0aGUgc2hhZGVkIHNwaGVyZSwgc28gaXQncyB3cmFwcGVkIGluIGEgTXV0YWJsZU9wdGlvbnNOb2RlLlxyXG5jb25zdCBzaGFkZWROb2RlID0gbmV3IE11dGFibGVPcHRpb25zTm9kZSggU2hhZGVkU3BoZXJlTm9kZSwgWyBESUFNRVRFUiBdLCB7XHJcbiAgaGlnaGxpZ2h0RGlhbWV0ZXJSYXRpbzogMC4zLFxyXG4gIGhpZ2hsaWdodFhPZmZzZXQ6IC0wLjMsXHJcbiAgaGlnaGxpZ2h0WU9mZnNldDogLTAuM1xyXG59LCB7XHJcbiAgbWFpbkNvbG9yOiBQcm9wb3J0aW9uUGxheWdyb3VuZENvbG9ycy5hZGp1c3RlZE5lY2tsYWNlUm91bmRCZWFkUHJvcGVydHkoIC0wLjEgKSxcclxuICBzaGFkb3dDb2xvcjogUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMuYWRqdXN0ZWROZWNrbGFjZVJvdW5kQmVhZFByb3BlcnR5KCAtMC41ICksXHJcbiAgaGlnaGxpZ2h0Q29sb3I6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLmFkanVzdGVkTmVja2xhY2VSb3VuZEJlYWRQcm9wZXJ0eSggMC41IClcclxufSApO1xyXG5cclxuLy8ge05vZGV9IC0gQmFja2dyb3VuZFxyXG5jb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBDaXJjbGUoIERJQU1FVEVSICogMC41MSwge1xyXG4gIGZpbGw6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLmFkanVzdGVkTmVja2xhY2VSb3VuZEJlYWRQcm9wZXJ0eSggLTAuNiApLFxyXG4gIHg6IERJQU1FVEVSIC8gMzAsXHJcbiAgeTogRElBTUVURVIgLyAzMFxyXG59ICk7XHJcblxyXG4vLyB7Tm9kZX0gLSBTaGFyZWQgY2hpbGQgbm9kZSB0aGF0IHdpbGwgaGF2ZSBhIHBhcmVudCBmb3IgZXZlcnkgZGlzcGxheSBvZiB0aGlzIG5vZGUuXHJcbi8vIFByZXN1bWFibHkgc2hvdWxkIG5vdCBtZW1vcnktbGVhaywgYXMgd2Ugc2F2ZSBhbmQgcmUtdXNlIHJlZmVyZW5jZXMuXHJcbmNvbnN0IGNvbnRhaW5lck5vZGUgPSBuZXcgTm9kZSgge1xyXG4gIGNoaWxkcmVuOiBbIGJhY2tncm91bmROb2RlLCBzaGFkZWROb2RlIF0sXHJcbiAgY2VudGVyOiBWZWN0b3IyLlpFUk9cclxufSApO1xyXG5cclxuY2xhc3MgUm91bmRCZWFkTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBub2RlIG9wdGlvbnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBtZXJnZSggeyBjaGlsZHJlbjogWyBjb250YWluZXJOb2RlIF0gfSwgb3B0aW9ucyApICk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ1JvdW5kQmVhZE5vZGUnLCBSb3VuZEJlYWROb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3VuZEJlYWROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsT0FBT0MsZ0JBQWdCLE1BQU0sb0RBQW9EO0FBQ2pGLFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxRQUFRLHNDQUFzQztBQUNuRSxPQUFPQyxrQkFBa0IsTUFBTSw2Q0FBNkM7QUFDNUUsT0FBT0Msb0JBQW9CLE1BQU0sa0NBQWtDO0FBQ25FLE9BQU9DLDZCQUE2QixNQUFNLHdDQUF3QztBQUNsRixPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7O0FBRXpFO0FBQ0EsTUFBTUMsUUFBUSxHQUFHRiw2QkFBNkIsQ0FBQ0csYUFBYTs7QUFFNUQ7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSU4sa0JBQWtCLENBQUVILGdCQUFnQixFQUFFLENBQUVPLFFBQVEsQ0FBRSxFQUFFO0VBQ3pFRyxzQkFBc0IsRUFBRSxHQUFHO0VBQzNCQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUc7RUFDdEJDLGdCQUFnQixFQUFFLENBQUM7QUFDckIsQ0FBQyxFQUFFO0VBQ0RDLFNBQVMsRUFBRVAsMEJBQTBCLENBQUNRLGlDQUFpQyxDQUFFLENBQUMsR0FBSSxDQUFDO0VBQy9FQyxXQUFXLEVBQUVULDBCQUEwQixDQUFDUSxpQ0FBaUMsQ0FBRSxDQUFDLEdBQUksQ0FBQztFQUNqRkUsY0FBYyxFQUFFViwwQkFBMEIsQ0FBQ1EsaUNBQWlDLENBQUUsR0FBSTtBQUNwRixDQUFFLENBQUM7O0FBRUg7QUFDQSxNQUFNRyxjQUFjLEdBQUcsSUFBSWhCLE1BQU0sQ0FBRU0sUUFBUSxHQUFHLElBQUksRUFBRTtFQUNsRFcsSUFBSSxFQUFFWiwwQkFBMEIsQ0FBQ1EsaUNBQWlDLENBQUUsQ0FBQyxHQUFJLENBQUM7RUFDMUVLLENBQUMsRUFBRVosUUFBUSxHQUFHLEVBQUU7RUFDaEJhLENBQUMsRUFBRWIsUUFBUSxHQUFHO0FBQ2hCLENBQUUsQ0FBQzs7QUFFSDtBQUNBO0FBQ0EsTUFBTWMsYUFBYSxHQUFHLElBQUluQixJQUFJLENBQUU7RUFDOUJvQixRQUFRLEVBQUUsQ0FBRUwsY0FBYyxFQUFFUixVQUFVLENBQUU7RUFDeENjLE1BQU0sRUFBRXpCLE9BQU8sQ0FBQzBCO0FBQ2xCLENBQUUsQ0FBQztBQUVILE1BQU1DLGFBQWEsU0FBU3ZCLElBQUksQ0FBQztFQUMvQjtBQUNGO0FBQ0E7RUFDRXdCLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQixLQUFLLENBQUU1QixLQUFLLENBQUU7TUFBRXVCLFFBQVEsRUFBRSxDQUFFRCxhQUFhO0lBQUcsQ0FBQyxFQUFFTSxPQUFRLENBQUUsQ0FBQztFQUM1RDtBQUNGO0FBRUF2QixvQkFBb0IsQ0FBQ3dCLFFBQVEsQ0FBRSxlQUFlLEVBQUVILGFBQWMsQ0FBQztBQUUvRCxlQUFlQSxhQUFhIn0=