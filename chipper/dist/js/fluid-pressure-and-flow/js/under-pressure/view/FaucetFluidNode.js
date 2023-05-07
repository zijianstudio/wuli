// Copyright 2013-2021, University of Colorado Boulder

/**
 * Fluid coming out of a faucet.
 * Origin is at the top center, to simplify alignment with the center of the faucet's output pipe.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Rectangle } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class FaucetFluidNode extends Rectangle {
  /**
   * @param {FaucetModel} faucet model of the sim.
   * @param {PoolWithFaucetsModel} model square-pool/mystery-pool/trapezoid model
   * @param {ModelViewTransform2} modelViewTransform that is used to transform between model and view coordinate frames
   * @param {number} maxHeight
   */
  constructor(faucet, model, modelViewTransform, maxHeight) {
    super(0, 0, 0, 0, {
      lineWidth: 1
    });
    this.currentHeight = 0;
    this.viewWidth = 0;
    const redrawRect = () => {
      if (faucet.flowRateProperty.value === 0) {
        this.setRect(0, 0, 0, 0);
      } else {
        this.setRect(modelViewTransform.modelToViewX(faucet.position.x) - this.viewWidth / 2, modelViewTransform.modelToViewY(faucet.position.y), this.viewWidth, this.currentHeight);
      }
    };
    model.underPressureModel.fluidColorModel.colorProperty.linkAttribute(this, 'fill');
    faucet.flowRateProperty.link(flowRate => {
      this.viewWidth = modelViewTransform.modelToViewX(faucet.spoutWidth) * flowRate / faucet.maxFlowRate;
      redrawRect();
    });
    model.volumeProperty.link(volume => {
      this.currentHeight = maxHeight - Math.abs(modelViewTransform.modelToViewDeltaY(volume * model.maxHeight / model.maxVolume));
      redrawRect();
    });
  }
}
fluidPressureAndFlow.register('FaucetFluidNode', FaucetFluidNode);
export default FaucetFluidNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWN0YW5nbGUiLCJmbHVpZFByZXNzdXJlQW5kRmxvdyIsIkZhdWNldEZsdWlkTm9kZSIsImNvbnN0cnVjdG9yIiwiZmF1Y2V0IiwibW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJtYXhIZWlnaHQiLCJsaW5lV2lkdGgiLCJjdXJyZW50SGVpZ2h0Iiwidmlld1dpZHRoIiwicmVkcmF3UmVjdCIsImZsb3dSYXRlUHJvcGVydHkiLCJ2YWx1ZSIsInNldFJlY3QiLCJtb2RlbFRvVmlld1giLCJwb3NpdGlvbiIsIngiLCJtb2RlbFRvVmlld1kiLCJ5IiwidW5kZXJQcmVzc3VyZU1vZGVsIiwiZmx1aWRDb2xvck1vZGVsIiwiY29sb3JQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJsaW5rIiwiZmxvd1JhdGUiLCJzcG91dFdpZHRoIiwibWF4Rmxvd1JhdGUiLCJ2b2x1bWVQcm9wZXJ0eSIsInZvbHVtZSIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWSIsIm1heFZvbHVtZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmF1Y2V0Rmx1aWROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZsdWlkIGNvbWluZyBvdXQgb2YgYSBmYXVjZXQuXHJcbiAqIE9yaWdpbiBpcyBhdCB0aGUgdG9wIGNlbnRlciwgdG8gc2ltcGxpZnkgYWxpZ25tZW50IHdpdGggdGhlIGNlbnRlciBvZiB0aGUgZmF1Y2V0J3Mgb3V0cHV0IHBpcGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZsdWlkUHJlc3N1cmVBbmRGbG93IGZyb20gJy4uLy4uL2ZsdWlkUHJlc3N1cmVBbmRGbG93LmpzJztcclxuXHJcbmNsYXNzIEZhdWNldEZsdWlkTm9kZSBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RmF1Y2V0TW9kZWx9IGZhdWNldCBtb2RlbCBvZiB0aGUgc2ltLlxyXG4gICAqIEBwYXJhbSB7UG9vbFdpdGhGYXVjZXRzTW9kZWx9IG1vZGVsIHNxdWFyZS1wb29sL215c3RlcnktcG9vbC90cmFwZXpvaWQgbW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybSB0aGF0IGlzIHVzZWQgdG8gdHJhbnNmb3JtIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgY29vcmRpbmF0ZSBmcmFtZXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4SGVpZ2h0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGZhdWNldCwgbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgbWF4SGVpZ2h0ICkge1xyXG5cclxuICAgIHN1cGVyKCAwLCAwLCAwLCAwLCB7IGxpbmVXaWR0aDogMSB9ICk7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIHRoaXMudmlld1dpZHRoID0gMDtcclxuXHJcbiAgICBjb25zdCByZWRyYXdSZWN0ID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIGZhdWNldC5mbG93UmF0ZVByb3BlcnR5LnZhbHVlID09PSAwICkge1xyXG4gICAgICAgIHRoaXMuc2V0UmVjdCggMCwgMCwgMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2V0UmVjdCggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggZmF1Y2V0LnBvc2l0aW9uLnggKSAtICggdGhpcy52aWV3V2lkdGggLyAyICksXHJcbiAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBmYXVjZXQucG9zaXRpb24ueSApLFxyXG4gICAgICAgICAgdGhpcy52aWV3V2lkdGgsXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBtb2RlbC51bmRlclByZXNzdXJlTW9kZWwuZmx1aWRDb2xvck1vZGVsLmNvbG9yUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcywgJ2ZpbGwnICk7XHJcblxyXG4gICAgZmF1Y2V0LmZsb3dSYXRlUHJvcGVydHkubGluayggZmxvd1JhdGUgPT4ge1xyXG4gICAgICB0aGlzLnZpZXdXaWR0aCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGZhdWNldC5zcG91dFdpZHRoICkgKiBmbG93UmF0ZSAvIGZhdWNldC5tYXhGbG93UmF0ZTtcclxuICAgICAgcmVkcmF3UmVjdCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLnZvbHVtZVByb3BlcnR5LmxpbmsoIHZvbHVtZSA9PiB7XHJcbiAgICAgIHRoaXMuY3VycmVudEhlaWdodCA9IG1heEhlaWdodCAtIE1hdGguYWJzKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHZvbHVtZSAqIG1vZGVsLm1heEhlaWdodCAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLm1heFZvbHVtZSApICk7XHJcbiAgICAgIHJlZHJhd1JlY3QoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmZsdWlkUHJlc3N1cmVBbmRGbG93LnJlZ2lzdGVyKCAnRmF1Y2V0Rmx1aWROb2RlJywgRmF1Y2V0Rmx1aWROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZhdWNldEZsdWlkTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFNBQVMsUUFBUSxtQ0FBbUM7QUFDN0QsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLGVBQWUsU0FBU0YsU0FBUyxDQUFDO0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsa0JBQWtCLEVBQUVDLFNBQVMsRUFBRztJQUUxRCxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQUVDLFNBQVMsRUFBRTtJQUFFLENBQUUsQ0FBQztJQUVyQyxJQUFJLENBQUNDLGFBQWEsR0FBRyxDQUFDO0lBQ3RCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLENBQUM7SUFFbEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07TUFDdkIsSUFBS1AsTUFBTSxDQUFDUSxnQkFBZ0IsQ0FBQ0MsS0FBSyxLQUFLLENBQUMsRUFBRztRQUN6QyxJQUFJLENBQUNDLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDNUIsQ0FBQyxNQUNJO1FBQ0gsSUFBSSxDQUFDQSxPQUFPLENBQUVSLGtCQUFrQixDQUFDUyxZQUFZLENBQUVYLE1BQU0sQ0FBQ1ksUUFBUSxDQUFDQyxDQUFFLENBQUMsR0FBSyxJQUFJLENBQUNQLFNBQVMsR0FBRyxDQUFHLEVBQ3pGSixrQkFBa0IsQ0FBQ1ksWUFBWSxDQUFFZCxNQUFNLENBQUNZLFFBQVEsQ0FBQ0csQ0FBRSxDQUFDLEVBQ3BELElBQUksQ0FBQ1QsU0FBUyxFQUNkLElBQUksQ0FBQ0QsYUFBYyxDQUFDO01BQ3hCO0lBQ0YsQ0FBQztJQUVESixLQUFLLENBQUNlLGtCQUFrQixDQUFDQyxlQUFlLENBQUNDLGFBQWEsQ0FBQ0MsYUFBYSxDQUFFLElBQUksRUFBRSxNQUFPLENBQUM7SUFFcEZuQixNQUFNLENBQUNRLGdCQUFnQixDQUFDWSxJQUFJLENBQUVDLFFBQVEsSUFBSTtNQUN4QyxJQUFJLENBQUNmLFNBQVMsR0FBR0osa0JBQWtCLENBQUNTLFlBQVksQ0FBRVgsTUFBTSxDQUFDc0IsVUFBVyxDQUFDLEdBQUdELFFBQVEsR0FBR3JCLE1BQU0sQ0FBQ3VCLFdBQVc7TUFDckdoQixVQUFVLENBQUMsQ0FBQztJQUNkLENBQUUsQ0FBQztJQUVITixLQUFLLENBQUN1QixjQUFjLENBQUNKLElBQUksQ0FBRUssTUFBTSxJQUFJO01BQ25DLElBQUksQ0FBQ3BCLGFBQWEsR0FBR0YsU0FBUyxHQUFHdUIsSUFBSSxDQUFDQyxHQUFHLENBQUV6QixrQkFBa0IsQ0FBQzBCLGlCQUFpQixDQUFFSCxNQUFNLEdBQUd4QixLQUFLLENBQUNFLFNBQVMsR0FDeEJGLEtBQUssQ0FBQzRCLFNBQVUsQ0FBRSxDQUFDO01BQ3BHdEIsVUFBVSxDQUFDLENBQUM7SUFDZCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFWLG9CQUFvQixDQUFDaUMsUUFBUSxDQUFFLGlCQUFpQixFQUFFaEMsZUFBZ0IsQ0FBQztBQUNuRSxlQUFlQSxlQUFlIn0=