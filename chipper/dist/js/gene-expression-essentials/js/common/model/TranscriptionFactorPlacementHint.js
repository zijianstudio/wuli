// Copyright 2015-2020, University of Colorado Boulder

/**
 *  Specialization of placement hint for transcription factors.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

//modules
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import PlacementHint from './PlacementHint.js';
import TranscriptionFactor from './TranscriptionFactor.js';
class TranscriptionFactorPlacementHint extends PlacementHint {
  /**
   * @param {TranscriptionFactor} transcriptionFactor
   */
  constructor(transcriptionFactor) {
    super(transcriptionFactor);
    this.setPosition(transcriptionFactor.getPosition());
    this.tfConfig = transcriptionFactor.getConfig(); // @private
  }

  /**
   * @override
   * @param {MobileBiomolecule} testBiomolecule
   * @returns {boolean}
   * @public
   */
  isMatchingBiomolecule(testBiomolecule) {
    return testBiomolecule instanceof TranscriptionFactor && testBiomolecule.getConfig() === this.tfConfig;
  }

  /**
   * @param { TranscriptionFactorConfig } transcriptionFactorConfig
   * @public
   */
  activateIfConfigMatch(transcriptionFactorConfig) {
    if (this.tfConfig === transcriptionFactorConfig) {
      this.activeProperty.set(true);
    }
  }
}
geneExpressionEssentials.register('TranscriptionFactorPlacementHint', TranscriptionFactorPlacementHint);
export default TranscriptionFactorPlacementHint;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJQbGFjZW1lbnRIaW50IiwiVHJhbnNjcmlwdGlvbkZhY3RvciIsIlRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50IiwiY29uc3RydWN0b3IiLCJ0cmFuc2NyaXB0aW9uRmFjdG9yIiwic2V0UG9zaXRpb24iLCJnZXRQb3NpdGlvbiIsInRmQ29uZmlnIiwiZ2V0Q29uZmlnIiwiaXNNYXRjaGluZ0Jpb21vbGVjdWxlIiwidGVzdEJpb21vbGVjdWxlIiwiYWN0aXZhdGVJZkNvbmZpZ01hdGNoIiwidHJhbnNjcmlwdGlvbkZhY3RvckNvbmZpZyIsImFjdGl2ZVByb3BlcnR5Iiwic2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAgU3BlY2lhbGl6YXRpb24gb2YgcGxhY2VtZW50IGhpbnQgZm9yIHRyYW5zY3JpcHRpb24gZmFjdG9ycy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcblxyXG4vL21vZHVsZXNcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgUGxhY2VtZW50SGludCBmcm9tICcuL1BsYWNlbWVudEhpbnQuanMnO1xyXG5pbXBvcnQgVHJhbnNjcmlwdGlvbkZhY3RvciBmcm9tICcuL1RyYW5zY3JpcHRpb25GYWN0b3IuanMnO1xyXG5cclxuY2xhc3MgVHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQgZXh0ZW5kcyBQbGFjZW1lbnRIaW50IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUcmFuc2NyaXB0aW9uRmFjdG9yfSB0cmFuc2NyaXB0aW9uRmFjdG9yXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRyYW5zY3JpcHRpb25GYWN0b3IgKSB7XHJcbiAgICBzdXBlciggdHJhbnNjcmlwdGlvbkZhY3RvciApO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbiggdHJhbnNjcmlwdGlvbkZhY3Rvci5nZXRQb3NpdGlvbigpICk7XHJcbiAgICB0aGlzLnRmQ29uZmlnID0gdHJhbnNjcmlwdGlvbkZhY3Rvci5nZXRDb25maWcoKTsgLy8gQHByaXZhdGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7TW9iaWxlQmlvbW9sZWN1bGV9IHRlc3RCaW9tb2xlY3VsZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc01hdGNoaW5nQmlvbW9sZWN1bGUoIHRlc3RCaW9tb2xlY3VsZSApIHtcclxuICAgIHJldHVybiB0ZXN0QmlvbW9sZWN1bGUgaW5zdGFuY2VvZiBUcmFuc2NyaXB0aW9uRmFjdG9yICYmICggdGVzdEJpb21vbGVjdWxlLmdldENvbmZpZygpID09PSB0aGlzLnRmQ29uZmlnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0geyBUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnIH0gdHJhbnNjcmlwdGlvbkZhY3RvckNvbmZpZ1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhY3RpdmF0ZUlmQ29uZmlnTWF0Y2goIHRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcgKSB7XHJcbiAgICBpZiAoIHRoaXMudGZDb25maWcgPT09IHRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdUcmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludCcsIFRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBO0FBQ0EsT0FBT0Esd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBRTFELE1BQU1DLGdDQUFnQyxTQUFTRixhQUFhLENBQUM7RUFFM0Q7QUFDRjtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLG1CQUFtQixFQUFHO0lBQ2pDLEtBQUssQ0FBRUEsbUJBQW9CLENBQUM7SUFDNUIsSUFBSSxDQUFDQyxXQUFXLENBQUVELG1CQUFtQixDQUFDRSxXQUFXLENBQUMsQ0FBRSxDQUFDO0lBQ3JELElBQUksQ0FBQ0MsUUFBUSxHQUFHSCxtQkFBbUIsQ0FBQ0ksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25EOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxxQkFBcUJBLENBQUVDLGVBQWUsRUFBRztJQUN2QyxPQUFPQSxlQUFlLFlBQVlULG1CQUFtQixJQUFNUyxlQUFlLENBQUNGLFNBQVMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDRCxRQUFVO0VBQzVHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLHFCQUFxQkEsQ0FBRUMseUJBQXlCLEVBQUc7SUFDakQsSUFBSyxJQUFJLENBQUNMLFFBQVEsS0FBS0sseUJBQXlCLEVBQUc7TUFDakQsSUFBSSxDQUFDQyxjQUFjLENBQUNDLEdBQUcsQ0FBRSxJQUFLLENBQUM7SUFDakM7RUFDRjtBQUNGO0FBRUFmLHdCQUF3QixDQUFDZ0IsUUFBUSxDQUFFLGtDQUFrQyxFQUFFYixnQ0FBaUMsQ0FBQztBQUV6RyxlQUFlQSxnQ0FBZ0MifQ==