// Copyright 2013-2022, University of Colorado Boulder

/**
 * Faucet that drains solution from the beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FaucetNode from '../../../../scenery-phet/js/FaucetNode.js';
import phScale from '../../phScale.js';
import PHScaleConstants from '../PHScaleConstants.js';
import { optionize4 } from '../../../../phet-core/js/optionize.js';
// constants
const SCALE = 0.6;
export default class DrainFaucetNode extends FaucetNode {
  constructor(faucet, modelViewTransform, providedOptions) {
    const horizontalPipeLength = Math.abs(modelViewTransform.modelToViewX(faucet.position.x - faucet.pipeMinX)) / SCALE;
    const options = optionize4()({}, PHScaleConstants.FAUCET_OPTIONS, {
      // FaucetNodeOptions
      horizontalPipeLength: horizontalPipeLength,
      verticalPipeLength: 5
    }, providedOptions);
    super(faucet.maxFlowRate, faucet.flowRateProperty, faucet.enabledProperty, options);
    this.translation = modelViewTransform.modelToViewPosition(faucet.position);
    this.setScaleMagnitude(-SCALE, SCALE); // reflect horizontally
  }
}

phScale.register('DrainFaucetNode', DrainFaucetNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGYXVjZXROb2RlIiwicGhTY2FsZSIsIlBIU2NhbGVDb25zdGFudHMiLCJvcHRpb25pemU0IiwiU0NBTEUiLCJEcmFpbkZhdWNldE5vZGUiLCJjb25zdHJ1Y3RvciIsImZhdWNldCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsImhvcml6b250YWxQaXBlTGVuZ3RoIiwiTWF0aCIsImFicyIsIm1vZGVsVG9WaWV3WCIsInBvc2l0aW9uIiwieCIsInBpcGVNaW5YIiwib3B0aW9ucyIsIkZBVUNFVF9PUFRJT05TIiwidmVydGljYWxQaXBlTGVuZ3RoIiwibWF4Rmxvd1JhdGUiLCJmbG93UmF0ZVByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRyYWluRmF1Y2V0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGYXVjZXQgdGhhdCBkcmFpbnMgc29sdXRpb24gZnJvbSB0aGUgYmVha2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBGYXVjZXROb2RlLCB7IEZhdWNldE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhdWNldE5vZGUuanMnO1xyXG5pbXBvcnQgcGhTY2FsZSBmcm9tICcuLi8uLi9waFNjYWxlLmpzJztcclxuaW1wb3J0IFBIU2NhbGVDb25zdGFudHMgZnJvbSAnLi4vUEhTY2FsZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGYXVjZXQgZnJvbSAnLi4vbW9kZWwvRmF1Y2V0LmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zLCBvcHRpb25pemU0IH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU0NBTEUgPSAwLjY7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRHJhaW5GYXVjZXROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEZhdWNldE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFpbkZhdWNldE5vZGUgZXh0ZW5kcyBGYXVjZXROb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmYXVjZXQ6IEZhdWNldCwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwcm92aWRlZE9wdGlvbnM6IERyYWluRmF1Y2V0Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbFBpcGVMZW5ndGggPSBNYXRoLmFicyggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggZmF1Y2V0LnBvc2l0aW9uLnggLSBmYXVjZXQucGlwZU1pblggKSApIC8gU0NBTEU7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTQ8RHJhaW5GYXVjZXROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIEZhdWNldE5vZGVPcHRpb25zPigpKCB7fSxcclxuICAgICAgUEhTY2FsZUNvbnN0YW50cy5GQVVDRVRfT1BUSU9OUywge1xyXG5cclxuICAgICAgICAvLyBGYXVjZXROb2RlT3B0aW9uc1xyXG4gICAgICAgIGhvcml6b250YWxQaXBlTGVuZ3RoOiBob3Jpem9udGFsUGlwZUxlbmd0aCxcclxuICAgICAgICB2ZXJ0aWNhbFBpcGVMZW5ndGg6IDVcclxuICAgICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGZhdWNldC5tYXhGbG93UmF0ZSwgZmF1Y2V0LmZsb3dSYXRlUHJvcGVydHksIGZhdWNldC5lbmFibGVkUHJvcGVydHksIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGZhdWNldC5wb3NpdGlvbiApO1xyXG4gICAgdGhpcy5zZXRTY2FsZU1hZ25pdHVkZSggLVNDQUxFLCBTQ0FMRSApOyAvLyByZWZsZWN0IGhvcml6b250YWxseVxyXG4gIH1cclxufVxyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ0RyYWluRmF1Y2V0Tm9kZScsIERyYWluRmF1Y2V0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQTZCLDJDQUEyQztBQUN6RixPQUFPQyxPQUFPLE1BQU0sa0JBQWtCO0FBQ3RDLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUdyRCxTQUEyQkMsVUFBVSxRQUFRLHVDQUF1QztBQUdwRjtBQUNBLE1BQU1DLEtBQUssR0FBRyxHQUFHO0FBTWpCLGVBQWUsTUFBTUMsZUFBZSxTQUFTTCxVQUFVLENBQUM7RUFFL0NNLFdBQVdBLENBQUVDLE1BQWMsRUFBRUMsa0JBQXVDLEVBQUVDLGVBQXVDLEVBQUc7SUFFckgsTUFBTUMsb0JBQW9CLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFSixrQkFBa0IsQ0FBQ0ssWUFBWSxDQUFFTixNQUFNLENBQUNPLFFBQVEsQ0FBQ0MsQ0FBQyxHQUFHUixNQUFNLENBQUNTLFFBQVMsQ0FBRSxDQUFDLEdBQUdaLEtBQUs7SUFFdkgsTUFBTWEsT0FBTyxHQUFHZCxVQUFVLENBQXlELENBQUMsQ0FBRSxDQUFDLENBQUMsRUFDdEZELGdCQUFnQixDQUFDZ0IsY0FBYyxFQUFFO01BRS9CO01BQ0FSLG9CQUFvQixFQUFFQSxvQkFBb0I7TUFDMUNTLGtCQUFrQixFQUFFO0lBQ3RCLENBQUMsRUFBRVYsZUFBZ0IsQ0FBQztJQUV0QixLQUFLLENBQUVGLE1BQU0sQ0FBQ2EsV0FBVyxFQUFFYixNQUFNLENBQUNjLGdCQUFnQixFQUFFZCxNQUFNLENBQUNlLGVBQWUsRUFBRUwsT0FBUSxDQUFDO0lBRXJGLElBQUksQ0FBQ00sV0FBVyxHQUFHZixrQkFBa0IsQ0FBQ2dCLG1CQUFtQixDQUFFakIsTUFBTSxDQUFDTyxRQUFTLENBQUM7SUFDNUUsSUFBSSxDQUFDVyxpQkFBaUIsQ0FBRSxDQUFDckIsS0FBSyxFQUFFQSxLQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzNDO0FBQ0Y7O0FBRUFILE9BQU8sQ0FBQ3lCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRXJCLGVBQWdCLENBQUMifQ==