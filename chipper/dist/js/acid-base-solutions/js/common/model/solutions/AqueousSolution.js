// Copyright 2014-2022, University of Colorado Boulder

/**
 * AqueousSolution is the base class for solutions.
 *
 * A solution is a homogeneous mixture composed of two or more substances.
 * In such a mixture, a solute is dissolved in another substance, known as a solvent.
 * In an aqueous solution, the solvent is water. The substance that is produced as
 * the result of the solute dissolving is called the product.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Utils from '../../../../../dot/js/Utils.js';
import NumberIO from '../../../../../tandem/js/types/NumberIO.js';
import acidBaseSolutions from '../../../acidBaseSolutions.js';
export default class AqueousSolution {
  /**
   * @param solutionType
   * @param strength - the strength of the solute
   * @param concentration - the initial concentration of the solute, at the start of the reaction
   * @param particles - the particles that make up the solution. The order of elements in this array determines the
   *   left-to-right order of bars in the graph, and the front-to-back rendering order of particles in the magnifying glass.
   * @param tandem
   */
  constructor(solutionType, strength, concentration, particles, tandem) {
    this.solutionType = solutionType;
    this.particles = particles;
    this.strengthProperty = new NumberProperty(strength, {
      tandem: tandem.createTandem('strengthProperty'),
      phetioReadOnly: true // because ABSConstants.STRONG_STRENGTH must be a constant
    });

    this.concentrationProperty = new NumberProperty(concentration, {
      units: 'mol/L',
      tandem: tandem.createTandem('concentrationProperty')
    });
    this.pHProperty = new DerivedProperty([this.strengthProperty, this.concentrationProperty], (strength, concentration) => {
      return -Utils.roundSymmetric(100 * Utils.log10(this.getH3OConcentration())) / 100;
    }, {
      tandem: tandem.createTandem('pHProperty'),
      phetioValueType: NumberIO
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.strengthProperty.reset();
    this.concentrationProperty.reset();
  }
  getParticleWithKey(particleKey) {
    return _.find(this.particles, particle => particle.key === particleKey) || null;
  }

  // convenience function
  getConcentration() {
    return this.concentrationProperty.value;
  }

  // convenience function
  getStrength() {
    return this.strengthProperty.value;
  }
}
acidBaseSolutions.register('AqueousSolution', AqueousSolution);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlV0aWxzIiwiTnVtYmVySU8iLCJhY2lkQmFzZVNvbHV0aW9ucyIsIkFxdWVvdXNTb2x1dGlvbiIsImNvbnN0cnVjdG9yIiwic29sdXRpb25UeXBlIiwic3RyZW5ndGgiLCJjb25jZW50cmF0aW9uIiwicGFydGljbGVzIiwidGFuZGVtIiwic3RyZW5ndGhQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwiY29uY2VudHJhdGlvblByb3BlcnR5IiwidW5pdHMiLCJwSFByb3BlcnR5Iiwicm91bmRTeW1tZXRyaWMiLCJsb2cxMCIsImdldEgzT0NvbmNlbnRyYXRpb24iLCJwaGV0aW9WYWx1ZVR5cGUiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVzZXQiLCJnZXRQYXJ0aWNsZVdpdGhLZXkiLCJwYXJ0aWNsZUtleSIsIl8iLCJmaW5kIiwicGFydGljbGUiLCJrZXkiLCJnZXRDb25jZW50cmF0aW9uIiwidmFsdWUiLCJnZXRTdHJlbmd0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXF1ZW91c1NvbHV0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFxdWVvdXNTb2x1dGlvbiBpcyB0aGUgYmFzZSBjbGFzcyBmb3Igc29sdXRpb25zLlxyXG4gKlxyXG4gKiBBIHNvbHV0aW9uIGlzIGEgaG9tb2dlbmVvdXMgbWl4dHVyZSBjb21wb3NlZCBvZiB0d28gb3IgbW9yZSBzdWJzdGFuY2VzLlxyXG4gKiBJbiBzdWNoIGEgbWl4dHVyZSwgYSBzb2x1dGUgaXMgZGlzc29sdmVkIGluIGFub3RoZXIgc3Vic3RhbmNlLCBrbm93biBhcyBhIHNvbHZlbnQuXHJcbiAqIEluIGFuIGFxdWVvdXMgc29sdXRpb24sIHRoZSBzb2x2ZW50IGlzIHdhdGVyLiBUaGUgc3Vic3RhbmNlIHRoYXQgaXMgcHJvZHVjZWQgYXNcclxuICogdGhlIHJlc3VsdCBvZiB0aGUgc29sdXRlIGRpc3NvbHZpbmcgaXMgY2FsbGVkIHRoZSBwcm9kdWN0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IGFjaWRCYXNlU29sdXRpb25zIGZyb20gJy4uLy4uLy4uL2FjaWRCYXNlU29sdXRpb25zLmpzJztcclxuaW1wb3J0IHsgU29sdXRpb25UeXBlIH0gZnJvbSAnLi4vU29sdXRpb25UeXBlLmpzJztcclxuaW1wb3J0IHsgUGFydGljbGUsIFBhcnRpY2xlS2V5IH0gZnJvbSAnLi9QYXJ0aWNsZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBBcXVlb3VzU29sdXRpb24ge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc29sdXRpb25UeXBlOiBTb2x1dGlvblR5cGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBhcnRpY2xlczogUGFydGljbGVbXTtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RyZW5ndGhQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29uY2VudHJhdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyByZWFkb25seSBwSFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gc29sdXRpb25UeXBlXHJcbiAgICogQHBhcmFtIHN0cmVuZ3RoIC0gdGhlIHN0cmVuZ3RoIG9mIHRoZSBzb2x1dGVcclxuICAgKiBAcGFyYW0gY29uY2VudHJhdGlvbiAtIHRoZSBpbml0aWFsIGNvbmNlbnRyYXRpb24gb2YgdGhlIHNvbHV0ZSwgYXQgdGhlIHN0YXJ0IG9mIHRoZSByZWFjdGlvblxyXG4gICAqIEBwYXJhbSBwYXJ0aWNsZXMgLSB0aGUgcGFydGljbGVzIHRoYXQgbWFrZSB1cCB0aGUgc29sdXRpb24uIFRoZSBvcmRlciBvZiBlbGVtZW50cyBpbiB0aGlzIGFycmF5IGRldGVybWluZXMgdGhlXHJcbiAgICogICBsZWZ0LXRvLXJpZ2h0IG9yZGVyIG9mIGJhcnMgaW4gdGhlIGdyYXBoLCBhbmQgdGhlIGZyb250LXRvLWJhY2sgcmVuZGVyaW5nIG9yZGVyIG9mIHBhcnRpY2xlcyBpbiB0aGUgbWFnbmlmeWluZyBnbGFzcy5cclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBzb2x1dGlvblR5cGU6IFNvbHV0aW9uVHlwZSwgc3RyZW5ndGg6IG51bWJlciwgY29uY2VudHJhdGlvbjogbnVtYmVyLCBwYXJ0aWNsZXM6IFBhcnRpY2xlW10sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMuc29sdXRpb25UeXBlID0gc29sdXRpb25UeXBlO1xyXG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBwYXJ0aWNsZXM7XHJcblxyXG4gICAgdGhpcy5zdHJlbmd0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBzdHJlbmd0aCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdHJlbmd0aFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSAvLyBiZWNhdXNlIEFCU0NvbnN0YW50cy5TVFJPTkdfU1RSRU5HVEggbXVzdCBiZSBhIGNvbnN0YW50XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGNvbmNlbnRyYXRpb24sIHtcclxuICAgICAgdW5pdHM6ICdtb2wvTCcsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbmNlbnRyYXRpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucEhQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5zdHJlbmd0aFByb3BlcnR5LCB0aGlzLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHN0cmVuZ3RoLCBjb25jZW50cmF0aW9uICkgPT4ge1xyXG4gICAgICAgIHJldHVybiAtVXRpbHMucm91bmRTeW1tZXRyaWMoIDEwMCAqIFV0aWxzLmxvZzEwKCB0aGlzLmdldEgzT0NvbmNlbnRyYXRpb24oKSApICkgLyAxMDA7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwSFByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RyZW5ndGhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQYXJ0aWNsZVdpdGhLZXkoIHBhcnRpY2xlS2V5OiBQYXJ0aWNsZUtleSApOiBQYXJ0aWNsZSB8IG51bGwge1xyXG4gICAgcmV0dXJuIF8uZmluZCggdGhpcy5wYXJ0aWNsZXMsIHBhcnRpY2xlID0+IHBhcnRpY2xlLmtleSA9PT0gcGFydGljbGVLZXkgKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gY29udmVuaWVuY2UgZnVuY3Rpb25cclxuICBwcm90ZWN0ZWQgZ2V0Q29uY2VudHJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uY2VudHJhdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLy8gY29udmVuaWVuY2UgZnVuY3Rpb25cclxuICBwcm90ZWN0ZWQgZ2V0U3RyZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnN0cmVuZ3RoUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0U29sdXRlQ29uY2VudHJhdGlvbigpOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRQcm9kdWN0Q29uY2VudHJhdGlvbigpOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRIM09Db25jZW50cmF0aW9uKCk6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGFic3RyYWN0IGdldE9IQ29uY2VudHJhdGlvbigpOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRIMk9Db25jZW50cmF0aW9uKCk6IG51bWJlcjtcclxuXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGlzVmFsaWRTdHJlbmd0aCggc3RyZW5ndGg6IG51bWJlciApOiBib29sZWFuO1xyXG59XHJcblxyXG5hY2lkQmFzZVNvbHV0aW9ucy5yZWdpc3RlciggJ0FxdWVvdXNTb2x1dGlvbicsIEFxdWVvdXNTb2x1dGlvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLGNBQWMsTUFBTSwwQ0FBMEM7QUFHckUsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUVsRCxPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLE9BQU9DLGlCQUFpQixNQUFNLCtCQUErQjtBQUk3RCxlQUFlLE1BQWVDLGVBQWUsQ0FBQztFQVE1QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1lDLFdBQVdBLENBQUVDLFlBQTBCLEVBQUVDLFFBQWdCLEVBQUVDLGFBQXFCLEVBQUVDLFNBQXFCLEVBQUVDLE1BQWMsRUFBRztJQUVsSSxJQUFJLENBQUNKLFlBQVksR0FBR0EsWUFBWTtJQUNoQyxJQUFJLENBQUNHLFNBQVMsR0FBR0EsU0FBUztJQUUxQixJQUFJLENBQUNFLGdCQUFnQixHQUFHLElBQUlYLGNBQWMsQ0FBRU8sUUFBUSxFQUFFO01BQ3BERyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGtCQUFtQixDQUFDO01BQ2pEQyxjQUFjLEVBQUUsSUFBSSxDQUFDO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFSCxJQUFJLENBQUNDLHFCQUFxQixHQUFHLElBQUlkLGNBQWMsQ0FBRVEsYUFBYSxFQUFFO01BQzlETyxLQUFLLEVBQUUsT0FBTztNQUNkTCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHVCQUF3QjtJQUN2RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNJLFVBQVUsR0FBRyxJQUFJakIsZUFBZSxDQUFFLENBQUUsSUFBSSxDQUFDWSxnQkFBZ0IsRUFBRSxJQUFJLENBQUNHLHFCQUFxQixDQUFFLEVBQzFGLENBQUVQLFFBQVEsRUFBRUMsYUFBYSxLQUFNO01BQzdCLE9BQU8sQ0FBQ1AsS0FBSyxDQUFDZ0IsY0FBYyxDQUFFLEdBQUcsR0FBR2hCLEtBQUssQ0FBQ2lCLEtBQUssQ0FBRSxJQUFJLENBQUNDLG1CQUFtQixDQUFDLENBQUUsQ0FBRSxDQUFDLEdBQUcsR0FBRztJQUN2RixDQUFDLEVBQUU7TUFDRFQsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSxZQUFhLENBQUM7TUFDM0NRLGVBQWUsRUFBRWxCO0lBQ25CLENBQUUsQ0FBQztFQUNQO0VBRU9tQixPQUFPQSxDQUFBLEVBQVM7SUFDckJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztFQUMzRjtFQUVPQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDWixnQkFBZ0IsQ0FBQ1ksS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDVCxxQkFBcUIsQ0FBQ1MsS0FBSyxDQUFDLENBQUM7RUFDcEM7RUFFT0Msa0JBQWtCQSxDQUFFQyxXQUF3QixFQUFvQjtJQUNyRSxPQUFPQyxDQUFDLENBQUNDLElBQUksQ0FBRSxJQUFJLENBQUNsQixTQUFTLEVBQUVtQixRQUFRLElBQUlBLFFBQVEsQ0FBQ0MsR0FBRyxLQUFLSixXQUFZLENBQUMsSUFBSSxJQUFJO0VBQ25GOztFQUVBO0VBQ1VLLGdCQUFnQkEsQ0FBQSxFQUFXO0lBQ25DLE9BQU8sSUFBSSxDQUFDaEIscUJBQXFCLENBQUNpQixLQUFLO0VBQ3pDOztFQUVBO0VBQ1VDLFdBQVdBLENBQUEsRUFBVztJQUM5QixPQUFPLElBQUksQ0FBQ3JCLGdCQUFnQixDQUFDb0IsS0FBSztFQUNwQztBQWFGO0FBRUE1QixpQkFBaUIsQ0FBQzhCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRTdCLGVBQWdCLENBQUMifQ==