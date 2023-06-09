// Copyright 2014-2022, University of Colorado Boulder

/**
 * Representation of the transverse cross section of the axon the view.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';

// constants
const MEMBRANE_COLOR = Color.YELLOW;
const LINE_WIDTH = 1;
class AxonCrossSectionNode extends Node {
  /**
   * Constructor for the AxonCrossSectionNode
   * @param {NeuronModel} axonMembraneModel
   * @param {ModelViewTransform2} mvt
   */
  constructor(axonMembraneModel, mvt) {
    super({});
    const outerDiameter = axonMembraneModel.getCrossSectionDiameter() + axonMembraneModel.getMembraneThickness();
    const innerDiameter = axonMembraneModel.getCrossSectionDiameter() - axonMembraneModel.getMembraneThickness();

    // Create the cross section, which consists of an outer circle that
    // represents the outer edge of the membrane and an inner circle that
    // represents the inner edge of the membrane and the inner portion of
    // the axon.
    const outerDiameterCircle = mvt.modelToViewShape(new Shape().ellipse(0, 0, outerDiameter / 2, outerDiameter / 2));
    const innerDiameterCircle = mvt.modelToViewShape(new Shape().ellipse(0, 0, innerDiameter / 2, innerDiameter / 2));
    const outerMembrane = new Path(outerDiameterCircle, {
      fill: MEMBRANE_COLOR,
      stroke: Color.BLACK,
      lineWidth: LINE_WIDTH
    });
    this.addChild(outerMembrane);
    const innerMembrane = new Path(innerDiameterCircle, {
      fill: new Color(73, 210, 242),
      stroke: Color.BLACK,
      lineWidth: LINE_WIDTH
    });
    this.addChild(innerMembrane);
  }
}
neuron.register('AxonCrossSectionNode', AxonCrossSectionNode);
export default AxonCrossSectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJuZXVyb24iLCJNRU1CUkFORV9DT0xPUiIsIllFTExPVyIsIkxJTkVfV0lEVEgiLCJBeG9uQ3Jvc3NTZWN0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiYXhvbk1lbWJyYW5lTW9kZWwiLCJtdnQiLCJvdXRlckRpYW1ldGVyIiwiZ2V0Q3Jvc3NTZWN0aW9uRGlhbWV0ZXIiLCJnZXRNZW1icmFuZVRoaWNrbmVzcyIsImlubmVyRGlhbWV0ZXIiLCJvdXRlckRpYW1ldGVyQ2lyY2xlIiwibW9kZWxUb1ZpZXdTaGFwZSIsImVsbGlwc2UiLCJpbm5lckRpYW1ldGVyQ2lyY2xlIiwib3V0ZXJNZW1icmFuZSIsImZpbGwiLCJzdHJva2UiLCJCTEFDSyIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwiaW5uZXJNZW1icmFuZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXhvbkNyb3NzU2VjdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zdmVyc2UgY3Jvc3Mgc2VjdGlvbiBvZiB0aGUgYXhvbiB0aGUgdmlldy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1FTUJSQU5FX0NPTE9SID0gQ29sb3IuWUVMTE9XO1xyXG5jb25zdCBMSU5FX1dJRFRIID0gMTtcclxuXHJcbmNsYXNzIEF4b25Dcm9zc1NlY3Rpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgQXhvbkNyb3NzU2VjdGlvbk5vZGVcclxuICAgKiBAcGFyYW0ge05ldXJvbk1vZGVsfSBheG9uTWVtYnJhbmVNb2RlbFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbXZ0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGF4b25NZW1icmFuZU1vZGVsLCBtdnQgKSB7XHJcbiAgICBzdXBlcigge30gKTtcclxuICAgIGNvbnN0IG91dGVyRGlhbWV0ZXIgPSBheG9uTWVtYnJhbmVNb2RlbC5nZXRDcm9zc1NlY3Rpb25EaWFtZXRlcigpICsgYXhvbk1lbWJyYW5lTW9kZWwuZ2V0TWVtYnJhbmVUaGlja25lc3MoKTtcclxuICAgIGNvbnN0IGlubmVyRGlhbWV0ZXIgPSBheG9uTWVtYnJhbmVNb2RlbC5nZXRDcm9zc1NlY3Rpb25EaWFtZXRlcigpIC0gYXhvbk1lbWJyYW5lTW9kZWwuZ2V0TWVtYnJhbmVUaGlja25lc3MoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNyb3NzIHNlY3Rpb24sIHdoaWNoIGNvbnNpc3RzIG9mIGFuIG91dGVyIGNpcmNsZSB0aGF0XHJcbiAgICAvLyByZXByZXNlbnRzIHRoZSBvdXRlciBlZGdlIG9mIHRoZSBtZW1icmFuZSBhbmQgYW4gaW5uZXIgY2lyY2xlIHRoYXRcclxuICAgIC8vIHJlcHJlc2VudHMgdGhlIGlubmVyIGVkZ2Ugb2YgdGhlIG1lbWJyYW5lIGFuZCB0aGUgaW5uZXIgcG9ydGlvbiBvZlxyXG4gICAgLy8gdGhlIGF4b24uXHJcbiAgICBjb25zdCBvdXRlckRpYW1ldGVyQ2lyY2xlID0gbXZ0Lm1vZGVsVG9WaWV3U2hhcGUoIG5ldyBTaGFwZSgpLmVsbGlwc2UoIDAsIDAsIG91dGVyRGlhbWV0ZXIgLyAyLCBvdXRlckRpYW1ldGVyIC8gMiApICk7XHJcbiAgICBjb25zdCBpbm5lckRpYW1ldGVyQ2lyY2xlID0gbXZ0Lm1vZGVsVG9WaWV3U2hhcGUoIG5ldyBTaGFwZSgpLmVsbGlwc2UoIDAsIDAsIGlubmVyRGlhbWV0ZXIgLyAyLCBpbm5lckRpYW1ldGVyIC8gMiApICk7XHJcbiAgICBjb25zdCBvdXRlck1lbWJyYW5lID0gbmV3IFBhdGgoIG91dGVyRGlhbWV0ZXJDaXJjbGUsIHtcclxuICAgICAgZmlsbDogTUVNQlJBTkVfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgIGxpbmVXaWR0aDogTElORV9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggb3V0ZXJNZW1icmFuZSApO1xyXG4gICAgY29uc3QgaW5uZXJNZW1icmFuZSA9IG5ldyBQYXRoKCBpbm5lckRpYW1ldGVyQ2lyY2xlLCB7XHJcbiAgICAgIGZpbGw6IG5ldyBDb2xvciggNzMsIDIxMCwgMjQyICksXHJcbiAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgIGxpbmVXaWR0aDogTElORV9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggaW5uZXJNZW1icmFuZSApO1xyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnQXhvbkNyb3NzU2VjdGlvbk5vZGUnLCBBeG9uQ3Jvc3NTZWN0aW9uTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXhvbkNyb3NzU2VjdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNyRSxPQUFPQyxNQUFNLE1BQU0saUJBQWlCOztBQUVwQztBQUNBLE1BQU1DLGNBQWMsR0FBR0osS0FBSyxDQUFDSyxNQUFNO0FBQ25DLE1BQU1DLFVBQVUsR0FBRyxDQUFDO0FBRXBCLE1BQU1DLG9CQUFvQixTQUFTTixJQUFJLENBQUM7RUFFdEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxpQkFBaUIsRUFBRUMsR0FBRyxFQUFHO0lBQ3BDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQztJQUNYLE1BQU1DLGFBQWEsR0FBR0YsaUJBQWlCLENBQUNHLHVCQUF1QixDQUFDLENBQUMsR0FBR0gsaUJBQWlCLENBQUNJLG9CQUFvQixDQUFDLENBQUM7SUFDNUcsTUFBTUMsYUFBYSxHQUFHTCxpQkFBaUIsQ0FBQ0csdUJBQXVCLENBQUMsQ0FBQyxHQUFHSCxpQkFBaUIsQ0FBQ0ksb0JBQW9CLENBQUMsQ0FBQzs7SUFFNUc7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNRSxtQkFBbUIsR0FBR0wsR0FBRyxDQUFDTSxnQkFBZ0IsQ0FBRSxJQUFJakIsS0FBSyxDQUFDLENBQUMsQ0FBQ2tCLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFTixhQUFhLEdBQUcsQ0FBQyxFQUFFQSxhQUFhLEdBQUcsQ0FBRSxDQUFFLENBQUM7SUFDckgsTUFBTU8sbUJBQW1CLEdBQUdSLEdBQUcsQ0FBQ00sZ0JBQWdCLENBQUUsSUFBSWpCLEtBQUssQ0FBQyxDQUFDLENBQUNrQixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUgsYUFBYSxHQUFHLENBQUMsRUFBRUEsYUFBYSxHQUFHLENBQUUsQ0FBRSxDQUFDO0lBQ3JILE1BQU1LLGFBQWEsR0FBRyxJQUFJakIsSUFBSSxDQUFFYSxtQkFBbUIsRUFBRTtNQUNuREssSUFBSSxFQUFFaEIsY0FBYztNQUNwQmlCLE1BQU0sRUFBRXJCLEtBQUssQ0FBQ3NCLEtBQUs7TUFDbkJDLFNBQVMsRUFBRWpCO0lBQ2IsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDa0IsUUFBUSxDQUFFTCxhQUFjLENBQUM7SUFDOUIsTUFBTU0sYUFBYSxHQUFHLElBQUl2QixJQUFJLENBQUVnQixtQkFBbUIsRUFBRTtNQUNuREUsSUFBSSxFQUFFLElBQUlwQixLQUFLLENBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7TUFDL0JxQixNQUFNLEVBQUVyQixLQUFLLENBQUNzQixLQUFLO01BQ25CQyxTQUFTLEVBQUVqQjtJQUNiLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ2tCLFFBQVEsQ0FBRUMsYUFBYyxDQUFDO0VBQ2hDO0FBQ0Y7QUFFQXRCLE1BQU0sQ0FBQ3VCLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRW5CLG9CQUFxQixDQUFDO0FBRS9ELGVBQWVBLG9CQUFvQiJ9