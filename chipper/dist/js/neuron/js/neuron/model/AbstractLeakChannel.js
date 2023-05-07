// Copyright 2014-2020, University of Colorado Boulder
/**
 * Abstract base class for all of the leak channels, which are the channels through which ions pass in/out independent
 * of the action potentials.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MembraneChannel from './MembraneChannel.js';
class AbstractLeakChannel extends MembraneChannel {
  /**
   * @param {number} channelWidth
   * @param {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   */
  constructor(channelWidth, channelHeight, modelContainingParticles) {
    super(channelWidth, channelHeight, modelContainingParticles);
    this.reset();
  }

  // @public
  stepInTime(dt) {
    super.stepInTime(dt);
  }

  // @public
  reset() {
    this.setOpenness(1); // Leak channels are always fully open.
  }
}

neuron.register('AbstractLeakChannel', AbstractLeakChannel);
export default AbstractLeakChannel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJNZW1icmFuZUNoYW5uZWwiLCJBYnN0cmFjdExlYWtDaGFubmVsIiwiY29uc3RydWN0b3IiLCJjaGFubmVsV2lkdGgiLCJjaGFubmVsSGVpZ2h0IiwibW9kZWxDb250YWluaW5nUGFydGljbGVzIiwicmVzZXQiLCJzdGVwSW5UaW1lIiwiZHQiLCJzZXRPcGVubmVzcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQWJzdHJhY3RMZWFrQ2hhbm5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBvZiB0aGUgbGVhayBjaGFubmVscywgd2hpY2ggYXJlIHRoZSBjaGFubmVscyB0aHJvdWdoIHdoaWNoIGlvbnMgcGFzcyBpbi9vdXQgaW5kZXBlbmRlbnRcclxuICogb2YgdGhlIGFjdGlvbiBwb3RlbnRpYWxzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE1lbWJyYW5lQ2hhbm5lbCBmcm9tICcuL01lbWJyYW5lQ2hhbm5lbC5qcyc7XHJcblxyXG5jbGFzcyBBYnN0cmFjdExlYWtDaGFubmVsIGV4dGVuZHMgTWVtYnJhbmVDaGFubmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5uZWxXaWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFubmVsSGVpZ2h0XHJcbiAgICogQHBhcmFtIHtOZXVyb25Nb2RlbH0gbW9kZWxDb250YWluaW5nUGFydGljbGVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYW5uZWxXaWR0aCwgY2hhbm5lbEhlaWdodCwgbW9kZWxDb250YWluaW5nUGFydGljbGVzICkge1xyXG4gICAgc3VwZXIoIGNoYW5uZWxXaWR0aCwgY2hhbm5lbEhlaWdodCwgbW9kZWxDb250YWluaW5nUGFydGljbGVzICk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgc3RlcEluVGltZSggZHQgKSB7XHJcbiAgICBzdXBlci5zdGVwSW5UaW1lKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zZXRPcGVubmVzcyggMSApOyAgLy8gTGVhayBjaGFubmVscyBhcmUgYWx3YXlzIGZ1bGx5IG9wZW4uXHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdBYnN0cmFjdExlYWtDaGFubmVsJywgQWJzdHJhY3RMZWFrQ2hhbm5lbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWJzdHJhY3RMZWFrQ2hhbm5lbDsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlCQUFpQjtBQUNwQyxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE1BQU1DLG1CQUFtQixTQUFTRCxlQUFlLENBQUM7RUFFaEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxZQUFZLEVBQUVDLGFBQWEsRUFBRUMsd0JBQXdCLEVBQUc7SUFDbkUsS0FBSyxDQUFFRixZQUFZLEVBQUVDLGFBQWEsRUFBRUMsd0JBQXlCLENBQUM7SUFDOUQsSUFBSSxDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUNkOztFQUVBO0VBQ0FDLFVBQVVBLENBQUVDLEVBQUUsRUFBRztJQUNmLEtBQUssQ0FBQ0QsVUFBVSxDQUFFQyxFQUFHLENBQUM7RUFDeEI7O0VBRUE7RUFDQUYsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDRyxXQUFXLENBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBRTtFQUMxQjtBQUNGOztBQUVBVixNQUFNLENBQUNXLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRVQsbUJBQW9CLENBQUM7QUFFN0QsZUFBZUEsbUJBQW1CIn0=