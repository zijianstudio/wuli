// Copyright 2022, University of Colorado Boulder

/**
 * In the upper (paper) representation, contains all the chocolate bars on a plate. Each plate has one PaperPlateNode,
 * and each container has a maximum of 10 chocolates bars.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import MeanShareAndBalanceConstants from '../../common/MeanShareAndBalanceConstants.js';
export default class PaperPlateNode extends Node {
  constructor(plate, chocolateBarDropped, providedOptions) {
    const options = optionize()({
      x: plate.position.x,
      y: plate.position.y,
      visibleProperty: plate.isActiveProperty,
      excludeInvisibleChildrenFromBounds: false,
      children: [new Line(0, 0, MeanShareAndBalanceConstants.CHOCOLATE_WIDTH, 0, {
        stroke: 'black'
      })]
    }, providedOptions);
    super(options);
  }
}
meanShareAndBalance.register('PaperPlateNode', PaperPlateNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJMaW5lIiwiTm9kZSIsIm1lYW5TaGFyZUFuZEJhbGFuY2UiLCJNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzIiwiUGFwZXJQbGF0ZU5vZGUiLCJjb25zdHJ1Y3RvciIsInBsYXRlIiwiY2hvY29sYXRlQmFyRHJvcHBlZCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ4IiwicG9zaXRpb24iLCJ5IiwidmlzaWJsZVByb3BlcnR5IiwiaXNBY3RpdmVQcm9wZXJ0eSIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJjaGlsZHJlbiIsIkNIT0NPTEFURV9XSURUSCIsInN0cm9rZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFwZXJQbGF0ZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEluIHRoZSB1cHBlciAocGFwZXIpIHJlcHJlc2VudGF0aW9uLCBjb250YWlucyBhbGwgdGhlIGNob2NvbGF0ZSBiYXJzIG9uIGEgcGxhdGUuIEVhY2ggcGxhdGUgaGFzIG9uZSBQYXBlclBsYXRlTm9kZSxcclxuICogYW5kIGVhY2ggY29udGFpbmVyIGhhcyBhIG1heGltdW0gb2YgMTAgY2hvY29sYXRlcyBiYXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lYW5TaGFyZUFuZEJhbGFuY2UgZnJvbSAnLi4vLi4vbWVhblNoYXJlQW5kQmFsYW5jZS5qcyc7XHJcbmltcG9ydCBQbGF0ZSBmcm9tICcuLi9tb2RlbC9QbGF0ZS5qcyc7XHJcbmltcG9ydCBEcmFnZ2FibGVDaG9jb2xhdGUgZnJvbSAnLi9EcmFnZ2FibGVDaG9jb2xhdGUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIENob2NvbGF0ZUJhcnNDb250YWluZXJOb2RlT3B0aW9ucyA9IFN0cmljdE9taXQ8VkJveE9wdGlvbnMsIGtleW9mIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgfCAnY2hpbGRyZW4nPiAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFwZXJQbGF0ZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBsYXRlOiBQbGF0ZSwgY2hvY29sYXRlQmFyRHJvcHBlZDogKCBjaG9jb2xhdGVCYXI6IERyYWdnYWJsZUNob2NvbGF0ZSApID0+IHZvaWQsIHByb3ZpZGVkT3B0aW9uczogQ2hvY29sYXRlQmFyc0NvbnRhaW5lck5vZGVPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDaG9jb2xhdGVCYXJzQ29udGFpbmVyTm9kZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIHg6IHBsYXRlLnBvc2l0aW9uLngsXHJcbiAgICAgIHk6IHBsYXRlLnBvc2l0aW9uLnksXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogcGxhdGUuaXNBY3RpdmVQcm9wZXJ0eSxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2UsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBMaW5lKCAwLCAwLCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLkNIT0NPTEFURV9XSURUSCwgMCwgeyBzdHJva2U6ICdibGFjaycgfSApIF1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5tZWFuU2hhcmVBbmRCYWxhbmNlLnJlZ2lzdGVyKCAnUGFwZXJQbGF0ZU5vZGUnLCBQYXBlclBsYXRlTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQTBELG1DQUFtQztBQUNoSCxPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFJOUQsT0FBT0MsNEJBQTRCLE1BQU0sOENBQThDO0FBSXZGLGVBQWUsTUFBTUMsY0FBYyxTQUFTSCxJQUFJLENBQUM7RUFDeENJLFdBQVdBLENBQUVDLEtBQVksRUFBRUMsbUJBQWlFLEVBQUVDLGVBQWtELEVBQUc7SUFDeEosTUFBTUMsT0FBTyxHQUFHVixTQUFTLENBQW1FLENBQUMsQ0FBRTtNQUM3RlcsQ0FBQyxFQUFFSixLQUFLLENBQUNLLFFBQVEsQ0FBQ0QsQ0FBQztNQUNuQkUsQ0FBQyxFQUFFTixLQUFLLENBQUNLLFFBQVEsQ0FBQ0MsQ0FBQztNQUNuQkMsZUFBZSxFQUFFUCxLQUFLLENBQUNRLGdCQUFnQjtNQUN2Q0Msa0NBQWtDLEVBQUUsS0FBSztNQUN6Q0MsUUFBUSxFQUFFLENBQUUsSUFBSWhCLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFRyw0QkFBNEIsQ0FBQ2MsZUFBZSxFQUFFLENBQUMsRUFBRTtRQUFFQyxNQUFNLEVBQUU7TUFBUSxDQUFFLENBQUM7SUFDcEcsQ0FBQyxFQUFFVixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0VBQ2xCO0FBQ0Y7QUFFQVAsbUJBQW1CLENBQUNpQixRQUFRLENBQUUsZ0JBQWdCLEVBQUVmLGNBQWUsQ0FBQyJ9