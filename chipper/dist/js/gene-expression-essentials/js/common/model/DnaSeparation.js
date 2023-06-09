// Copyright 2015-2020, University of Colorado Boulder

/**
 * Class that defines a separation of the DNA strand. This is used when forcing the DNA strand to separate in certain
 * positions, which happens, for instance, when RNA polymerase is attached and transcribing the DNA.
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

//modules
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
class DnaSeparation {
  /**
   * @param {number} xPos  - X Position in model space where this separation should exist.
   * @param {number} targetAmount
   */
  constructor(xPos, targetAmount) {
    this.xPos = xPos; // @private - x Position in model space
    this.targetAmount = targetAmount; // @private
    this.amount = 0; // @private - Actual amount of separation. Starts at 0 and is generally grown over time toward target.
  }

  /**
   * @returns {number}
   * @public
   */
  getXPosition() {
    return this.xPos;
  }

  /**
   * @param {number} xPos
   * @public
   */
  setXPosition(xPos) {
    this.xPos = xPos;
  }

  /**
   * @returns {number}
   * @public
   */
  getAmount() {
    return this.amount;
  }

  /**
   * @param {number} proportion
   * @public
   */
  setProportionOfTargetAmount(proportion) {
    this.amount = this.targetAmount * proportion;
  }
}
geneExpressionEssentials.register('DnaSeparation', DnaSeparation);
export default DnaSeparation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJEbmFTZXBhcmF0aW9uIiwiY29uc3RydWN0b3IiLCJ4UG9zIiwidGFyZ2V0QW1vdW50IiwiYW1vdW50IiwiZ2V0WFBvc2l0aW9uIiwic2V0WFBvc2l0aW9uIiwiZ2V0QW1vdW50Iiwic2V0UHJvcG9ydGlvbk9mVGFyZ2V0QW1vdW50IiwicHJvcG9ydGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRG5hU2VwYXJhdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IGRlZmluZXMgYSBzZXBhcmF0aW9uIG9mIHRoZSBETkEgc3RyYW5kLiBUaGlzIGlzIHVzZWQgd2hlbiBmb3JjaW5nIHRoZSBETkEgc3RyYW5kIHRvIHNlcGFyYXRlIGluIGNlcnRhaW5cclxuICogcG9zaXRpb25zLCB3aGljaCBoYXBwZW5zLCBmb3IgaW5zdGFuY2UsIHdoZW4gUk5BIHBvbHltZXJhc2UgaXMgYXR0YWNoZWQgYW5kIHRyYW5zY3JpYmluZyB0aGUgRE5BLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuXHJcbi8vbW9kdWxlc1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcblxyXG5jbGFzcyBEbmFTZXBhcmF0aW9uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhQb3MgIC0gWCBQb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSB3aGVyZSB0aGlzIHNlcGFyYXRpb24gc2hvdWxkIGV4aXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXRBbW91bnRcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggeFBvcywgdGFyZ2V0QW1vdW50ICkge1xyXG4gICAgdGhpcy54UG9zID0geFBvczsgLy8gQHByaXZhdGUgLSB4IFBvc2l0aW9uIGluIG1vZGVsIHNwYWNlXHJcbiAgICB0aGlzLnRhcmdldEFtb3VudCA9IHRhcmdldEFtb3VudDsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYW1vdW50ID0gMDsvLyBAcHJpdmF0ZSAtIEFjdHVhbCBhbW91bnQgb2Ygc2VwYXJhdGlvbi4gU3RhcnRzIGF0IDAgYW5kIGlzIGdlbmVyYWxseSBncm93biBvdmVyIHRpbWUgdG93YXJkIHRhcmdldC5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFhQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnhQb3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFBvc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRYUG9zaXRpb24oIHhQb3MgKSB7XHJcbiAgICB0aGlzLnhQb3MgPSB4UG9zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0QW1vdW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYW1vdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3BvcnRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0UHJvcG9ydGlvbk9mVGFyZ2V0QW1vdW50KCBwcm9wb3J0aW9uICkge1xyXG4gICAgdGhpcy5hbW91bnQgPSB0aGlzLnRhcmdldEFtb3VudCAqIHByb3BvcnRpb247XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdEbmFTZXBhcmF0aW9uJywgRG5hU2VwYXJhdGlvbiApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG5hU2VwYXJhdGlvbjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQTtBQUNBLE9BQU9BLHdCQUF3QixNQUFNLG1DQUFtQztBQUV4RSxNQUFNQyxhQUFhLENBQUM7RUFFbEI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxZQUFZLEVBQUc7SUFDaEMsSUFBSSxDQUFDRCxJQUFJLEdBQUdBLElBQUksQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZQUFZLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUNDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDbEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsT0FBTyxJQUFJLENBQUNILElBQUk7RUFDbEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUksWUFBWUEsQ0FBRUosSUFBSSxFQUFHO0lBQ25CLElBQUksQ0FBQ0EsSUFBSSxHQUFHQSxJQUFJO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VLLFNBQVNBLENBQUEsRUFBRztJQUNWLE9BQU8sSUFBSSxDQUFDSCxNQUFNO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLDJCQUEyQkEsQ0FBRUMsVUFBVSxFQUFHO0lBQ3hDLElBQUksQ0FBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQ0QsWUFBWSxHQUFHTSxVQUFVO0VBQzlDO0FBQ0Y7QUFFQVYsd0JBQXdCLENBQUNXLFFBQVEsQ0FBRSxlQUFlLEVBQUVWLGFBQWMsQ0FBQztBQUVuRSxlQUFlQSxhQUFhIn0=