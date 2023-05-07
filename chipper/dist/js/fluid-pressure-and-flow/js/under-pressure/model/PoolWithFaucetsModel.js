// Copyright 2013-2020, University of Colorado Boulder

/**
 * Parent type for models of pools with faucets. Handles liquid level changes
 * based on the states of the input and output faucets.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class PoolWithFaucetsModel {
  /**
   * @param {UnderPressureModel} underPressureModel
   * @param {FaucetModel} inputFaucet that fills the pool
   * @param {FaucetModel} outputFaucet that drains the pool
   * @param {number} maxVolume of the pool in liters
   */
  constructor(underPressureModel, inputFaucet, outputFaucet, maxVolume) {
    // Note: Each scene could have a different volume. If we use currentVolumeProperty from the underPressureModel
    // instead of this property then volume changes in one scene will reflect in the other.
    //L @public
    this.volumeProperty = new Property(1.5);

    // Enable faucets and dropper based on amount of solution in the beaker.
    this.volumeProperty.link(volume => {
      inputFaucet.enabledProperty.value = volume < maxVolume;
      outputFaucet.enabledProperty.value = volume > 0;
      underPressureModel.currentVolumeProperty.value = volume;
    });
  }

  /**
   * Restores initial conditions.
   * @public
   */
  reset() {
    this.volumeProperty.reset();
  }

  /**
   * @public
   * Step the pool model forward in time by dt seconds.
   * @param {number} dt -- time in seconds
   */
  step(dt) {
    this.addLiquid(dt);
    this.removeLiquid(dt);
  }

  /**
   * @public
   * Add liquid to the pool based on the input faucet's flow rate and dt.
   * @param {number} dt -- time in seconds
   */
  addLiquid(dt) {
    const deltaVolume = this.inputFaucet.flowRateProperty.value * dt;
    if (deltaVolume > 0) {
      this.volumeProperty.value = Math.min(this.maxVolume, this.volumeProperty.value + deltaVolume);
    }
  }

  /**
   * @public
   * Remove liquid from the pool based on the output faucet's flow rate and dt.
   * @param {number} dt -- time in seconds
   */
  removeLiquid(dt) {
    const deltaVolume = this.outputFaucet.flowRateProperty.value * dt;
    if (deltaVolume > 0) {
      this.volumeProperty.value = Math.max(0, this.volumeProperty.value - deltaVolume);
    }
  }
}
fluidPressureAndFlow.register('PoolWithFaucetsModel', PoolWithFaucetsModel);
export default PoolWithFaucetsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImZsdWlkUHJlc3N1cmVBbmRGbG93IiwiUG9vbFdpdGhGYXVjZXRzTW9kZWwiLCJjb25zdHJ1Y3RvciIsInVuZGVyUHJlc3N1cmVNb2RlbCIsImlucHV0RmF1Y2V0Iiwib3V0cHV0RmF1Y2V0IiwibWF4Vm9sdW1lIiwidm9sdW1lUHJvcGVydHkiLCJsaW5rIiwidm9sdW1lIiwiZW5hYmxlZFByb3BlcnR5IiwidmFsdWUiLCJjdXJyZW50Vm9sdW1lUHJvcGVydHkiLCJyZXNldCIsInN0ZXAiLCJkdCIsImFkZExpcXVpZCIsInJlbW92ZUxpcXVpZCIsImRlbHRhVm9sdW1lIiwiZmxvd1JhdGVQcm9wZXJ0eSIsIk1hdGgiLCJtaW4iLCJtYXgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvb2xXaXRoRmF1Y2V0c01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhcmVudCB0eXBlIGZvciBtb2RlbHMgb2YgcG9vbHMgd2l0aCBmYXVjZXRzLiBIYW5kbGVzIGxpcXVpZCBsZXZlbCBjaGFuZ2VzXHJcbiAqIGJhc2VkIG9uIHRoZSBzdGF0ZXMgb2YgdGhlIGlucHV0IGFuZCBvdXRwdXQgZmF1Y2V0cy5cclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcblxyXG5jbGFzcyBQb29sV2l0aEZhdWNldHNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VW5kZXJQcmVzc3VyZU1vZGVsfSB1bmRlclByZXNzdXJlTW9kZWxcclxuICAgKiBAcGFyYW0ge0ZhdWNldE1vZGVsfSBpbnB1dEZhdWNldCB0aGF0IGZpbGxzIHRoZSBwb29sXHJcbiAgICogQHBhcmFtIHtGYXVjZXRNb2RlbH0gb3V0cHV0RmF1Y2V0IHRoYXQgZHJhaW5zIHRoZSBwb29sXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZvbHVtZSBvZiB0aGUgcG9vbCBpbiBsaXRlcnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdW5kZXJQcmVzc3VyZU1vZGVsLCBpbnB1dEZhdWNldCwgb3V0cHV0RmF1Y2V0LCBtYXhWb2x1bWUgKSB7XHJcblxyXG4gICAgLy8gTm90ZTogRWFjaCBzY2VuZSBjb3VsZCBoYXZlIGEgZGlmZmVyZW50IHZvbHVtZS4gSWYgd2UgdXNlIGN1cnJlbnRWb2x1bWVQcm9wZXJ0eSBmcm9tIHRoZSB1bmRlclByZXNzdXJlTW9kZWxcclxuICAgIC8vIGluc3RlYWQgb2YgdGhpcyBwcm9wZXJ0eSB0aGVuIHZvbHVtZSBjaGFuZ2VzIGluIG9uZSBzY2VuZSB3aWxsIHJlZmxlY3QgaW4gdGhlIG90aGVyLlxyXG4gICAgLy9MIEBwdWJsaWNcclxuICAgIHRoaXMudm9sdW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEuNSApO1xyXG5cclxuICAgIC8vIEVuYWJsZSBmYXVjZXRzIGFuZCBkcm9wcGVyIGJhc2VkIG9uIGFtb3VudCBvZiBzb2x1dGlvbiBpbiB0aGUgYmVha2VyLlxyXG4gICAgdGhpcy52b2x1bWVQcm9wZXJ0eS5saW5rKCB2b2x1bWUgPT4ge1xyXG4gICAgICBpbnB1dEZhdWNldC5lbmFibGVkUHJvcGVydHkudmFsdWUgPSAoIHZvbHVtZSA8IG1heFZvbHVtZSApO1xyXG4gICAgICBvdXRwdXRGYXVjZXQuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gKCB2b2x1bWUgPiAwICk7XHJcbiAgICAgIHVuZGVyUHJlc3N1cmVNb2RlbC5jdXJyZW50Vm9sdW1lUHJvcGVydHkudmFsdWUgPSB2b2x1bWU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlcyBpbml0aWFsIGNvbmRpdGlvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy52b2x1bWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIFN0ZXAgdGhlIHBvb2wgbW9kZWwgZm9yd2FyZCBpbiB0aW1lIGJ5IGR0IHNlY29uZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0tIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5hZGRMaXF1aWQoIGR0ICk7XHJcbiAgICB0aGlzLnJlbW92ZUxpcXVpZCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBBZGQgbGlxdWlkIHRvIHRoZSBwb29sIGJhc2VkIG9uIHRoZSBpbnB1dCBmYXVjZXQncyBmbG93IHJhdGUgYW5kIGR0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtLSB0aW1lIGluIHNlY29uZHNcclxuICAgKi9cclxuICBhZGRMaXF1aWQoIGR0ICkge1xyXG4gICAgY29uc3QgZGVsdGFWb2x1bWUgPSB0aGlzLmlucHV0RmF1Y2V0LmZsb3dSYXRlUHJvcGVydHkudmFsdWUgKiBkdDtcclxuICAgIGlmICggZGVsdGFWb2x1bWUgPiAwICkge1xyXG4gICAgICB0aGlzLnZvbHVtZVByb3BlcnR5LnZhbHVlID0gTWF0aC5taW4oIHRoaXMubWF4Vm9sdW1lLCB0aGlzLnZvbHVtZVByb3BlcnR5LnZhbHVlICsgZGVsdGFWb2x1bWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBSZW1vdmUgbGlxdWlkIGZyb20gdGhlIHBvb2wgYmFzZWQgb24gdGhlIG91dHB1dCBmYXVjZXQncyBmbG93IHJhdGUgYW5kIGR0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtLSB0aW1lIGluIHNlY29uZHNcclxuICAgKi9cclxuICByZW1vdmVMaXF1aWQoIGR0ICkge1xyXG4gICAgY29uc3QgZGVsdGFWb2x1bWUgPSB0aGlzLm91dHB1dEZhdWNldC5mbG93UmF0ZVByb3BlcnR5LnZhbHVlICogZHQ7XHJcbiAgICBpZiAoIGRlbHRhVm9sdW1lID4gMCApIHtcclxuICAgICAgdGhpcy52b2x1bWVQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWF4KCAwLCB0aGlzLnZvbHVtZVByb3BlcnR5LnZhbHVlIC0gZGVsdGFWb2x1bWUgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZsdWlkUHJlc3N1cmVBbmRGbG93LnJlZ2lzdGVyKCAnUG9vbFdpdGhGYXVjZXRzTW9kZWwnLCBQb29sV2l0aEZhdWNldHNNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBQb29sV2l0aEZhdWNldHNNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLG9CQUFvQixDQUFDO0VBRXpCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRUMsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLFNBQVMsRUFBRztJQUV0RTtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJUixRQUFRLENBQUUsR0FBSSxDQUFDOztJQUV6QztJQUNBLElBQUksQ0FBQ1EsY0FBYyxDQUFDQyxJQUFJLENBQUVDLE1BQU0sSUFBSTtNQUNsQ0wsV0FBVyxDQUFDTSxlQUFlLENBQUNDLEtBQUssR0FBS0YsTUFBTSxHQUFHSCxTQUFXO01BQzFERCxZQUFZLENBQUNLLGVBQWUsQ0FBQ0MsS0FBSyxHQUFLRixNQUFNLEdBQUcsQ0FBRztNQUNuRE4sa0JBQWtCLENBQUNTLHFCQUFxQixDQUFDRCxLQUFLLEdBQUdGLE1BQU07SUFDekQsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUksS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDTixjQUFjLENBQUNNLEtBQUssQ0FBQyxDQUFDO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSSxDQUFDQyxTQUFTLENBQUVELEVBQUcsQ0FBQztJQUNwQixJQUFJLENBQUNFLFlBQVksQ0FBRUYsRUFBRyxDQUFDO0VBQ3pCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsU0FBU0EsQ0FBRUQsRUFBRSxFQUFHO0lBQ2QsTUFBTUcsV0FBVyxHQUFHLElBQUksQ0FBQ2QsV0FBVyxDQUFDZSxnQkFBZ0IsQ0FBQ1IsS0FBSyxHQUFHSSxFQUFFO0lBQ2hFLElBQUtHLFdBQVcsR0FBRyxDQUFDLEVBQUc7TUFDckIsSUFBSSxDQUFDWCxjQUFjLENBQUNJLEtBQUssR0FBR1MsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDZixTQUFTLEVBQUUsSUFBSSxDQUFDQyxjQUFjLENBQUNJLEtBQUssR0FBR08sV0FBWSxDQUFDO0lBQ2pHO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRCxZQUFZQSxDQUFFRixFQUFFLEVBQUc7SUFDakIsTUFBTUcsV0FBVyxHQUFHLElBQUksQ0FBQ2IsWUFBWSxDQUFDYyxnQkFBZ0IsQ0FBQ1IsS0FBSyxHQUFHSSxFQUFFO0lBQ2pFLElBQUtHLFdBQVcsR0FBRyxDQUFDLEVBQUc7TUFDckIsSUFBSSxDQUFDWCxjQUFjLENBQUNJLEtBQUssR0FBR1MsSUFBSSxDQUFDRSxHQUFHLENBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQ2YsY0FBYyxDQUFDSSxLQUFLLEdBQUdPLFdBQVksQ0FBQztJQUNwRjtFQUNGO0FBQ0Y7QUFFQWxCLG9CQUFvQixDQUFDdUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFdEIsb0JBQXFCLENBQUM7QUFDN0UsZUFBZUEsb0JBQW9CIn0=