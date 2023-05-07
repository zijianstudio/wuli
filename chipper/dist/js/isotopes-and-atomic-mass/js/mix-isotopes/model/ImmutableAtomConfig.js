// Copyright 2019-2020, University of Colorado Boulder

/**
 * atom configuration that doesn't use properties, and thus consumes less memory
 *
 * @author John Blanco
 */

import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
class ImmutableAtomConfig {
  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {number} numElectrons
   */
  constructor(numProtons, numNeutrons, numElectrons) {
    this.protonCount = numProtons;
    this.neutronCount = numNeutrons;
    this.electronCount = numElectrons;
  }

  /**
   * compare two atom configurations, return true if the particle counts are the same
   * @param {NumberAtom|ImmutableAtomConfig} atomConfig
   * @returns {boolean}
   * @public
   */
  equals(atomConfig) {
    let configsAreEqual;

    // support comparison to mutable or immutable atom configurations
    if (atomConfig.protonCountProperty) {
      assert && assert(atomConfig.neutronCountProperty && atomConfig.electronCountProperty, 'atom configuration should be fully mutable or fully immutable');
      configsAreEqual = this.protonCount === atomConfig.protonCountProperty.value && this.neutronCount === atomConfig.neutronCountProperty.value && this.electronCount === atomConfig.electronCountProperty.value;
    } else {
      assert && assert(atomConfig.neutronCount !== undefined && atomConfig.protonCount !== undefined && atomConfig.electronCount !== undefined, 'unexpected atom configuration');
      configsAreEqual = this.protonCount === atomConfig.protonCount && this.neutronCount === atomConfig.neutronCount && this.electronCount === atomConfig.electronCount;
    }
    return configsAreEqual;
  }

  /**
   * @returns {number}
   * @public
   */
  getIsotopeAtomicMass() {
    return AtomIdentifier.getIsotopeAtomicMass(this.protonCount, this.neutronCount);
  }
}
isotopesAndAtomicMass.register('ImmutableAtomConfig', ImmutableAtomConfig);
export default ImmutableAtomConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdG9tSWRlbnRpZmllciIsImlzb3RvcGVzQW5kQXRvbWljTWFzcyIsIkltbXV0YWJsZUF0b21Db25maWciLCJjb25zdHJ1Y3RvciIsIm51bVByb3RvbnMiLCJudW1OZXV0cm9ucyIsIm51bUVsZWN0cm9ucyIsInByb3RvbkNvdW50IiwibmV1dHJvbkNvdW50IiwiZWxlY3Ryb25Db3VudCIsImVxdWFscyIsImF0b21Db25maWciLCJjb25maWdzQXJlRXF1YWwiLCJwcm90b25Db3VudFByb3BlcnR5IiwiYXNzZXJ0IiwibmV1dHJvbkNvdW50UHJvcGVydHkiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsImdldElzb3RvcGVBdG9taWNNYXNzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbW11dGFibGVBdG9tQ29uZmlnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGF0b20gY29uZmlndXJhdGlvbiB0aGF0IGRvZXNuJ3QgdXNlIHByb3BlcnRpZXMsIGFuZCB0aHVzIGNvbnN1bWVzIGxlc3MgbWVtb3J5XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgQXRvbUlkZW50aWZpZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvQXRvbUlkZW50aWZpZXIuanMnO1xyXG5pbXBvcnQgaXNvdG9wZXNBbmRBdG9taWNNYXNzIGZyb20gJy4uLy4uL2lzb3RvcGVzQW5kQXRvbWljTWFzcy5qcyc7XHJcblxyXG5jbGFzcyBJbW11dGFibGVBdG9tQ29uZmlnIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bVByb3RvbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtTmV1dHJvbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtRWxlY3Ryb25zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bVByb3RvbnMsIG51bU5ldXRyb25zLCBudW1FbGVjdHJvbnMgKSB7XHJcbiAgICB0aGlzLnByb3RvbkNvdW50ID0gbnVtUHJvdG9ucztcclxuICAgIHRoaXMubmV1dHJvbkNvdW50ID0gbnVtTmV1dHJvbnM7XHJcbiAgICB0aGlzLmVsZWN0cm9uQ291bnQgPSBudW1FbGVjdHJvbnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjb21wYXJlIHR3byBhdG9tIGNvbmZpZ3VyYXRpb25zLCByZXR1cm4gdHJ1ZSBpZiB0aGUgcGFydGljbGUgY291bnRzIGFyZSB0aGUgc2FtZVxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQXRvbXxJbW11dGFibGVBdG9tQ29uZmlnfSBhdG9tQ29uZmlnXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVxdWFscyggYXRvbUNvbmZpZyApIHtcclxuXHJcbiAgICBsZXQgY29uZmlnc0FyZUVxdWFsO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgY29tcGFyaXNvbiB0byBtdXRhYmxlIG9yIGltbXV0YWJsZSBhdG9tIGNvbmZpZ3VyYXRpb25zXHJcbiAgICBpZiAoIGF0b21Db25maWcucHJvdG9uQ291bnRQcm9wZXJ0eSApIHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIGF0b21Db25maWcubmV1dHJvbkNvdW50UHJvcGVydHkgJiYgYXRvbUNvbmZpZy5lbGVjdHJvbkNvdW50UHJvcGVydHksXHJcbiAgICAgICAgJ2F0b20gY29uZmlndXJhdGlvbiBzaG91bGQgYmUgZnVsbHkgbXV0YWJsZSBvciBmdWxseSBpbW11dGFibGUnXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbmZpZ3NBcmVFcXVhbCA9IHRoaXMucHJvdG9uQ291bnQgPT09IGF0b21Db25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5ldXRyb25Db3VudCA9PT0gYXRvbUNvbmZpZy5uZXV0cm9uQ291bnRQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZWN0cm9uQ291bnQgPT09IGF0b21Db25maWcuZWxlY3Ryb25Db3VudFByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIGF0b21Db25maWcubmV1dHJvbkNvdW50ICE9PSB1bmRlZmluZWQgJiYgYXRvbUNvbmZpZy5wcm90b25Db3VudCAhPT0gdW5kZWZpbmVkICYmIGF0b21Db25maWcuZWxlY3Ryb25Db3VudCAhPT0gdW5kZWZpbmVkLFxyXG4gICAgICAgICd1bmV4cGVjdGVkIGF0b20gY29uZmlndXJhdGlvbidcclxuICAgICAgKTtcclxuICAgICAgY29uZmlnc0FyZUVxdWFsID0gdGhpcy5wcm90b25Db3VudCA9PT0gYXRvbUNvbmZpZy5wcm90b25Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5ldXRyb25Db3VudCA9PT0gYXRvbUNvbmZpZy5uZXV0cm9uQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVjdHJvbkNvdW50ID09PSBhdG9tQ29uZmlnLmVsZWN0cm9uQ291bnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29uZmlnc0FyZUVxdWFsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0SXNvdG9wZUF0b21pY01hc3MoKSB7XHJcbiAgICByZXR1cm4gQXRvbUlkZW50aWZpZXIuZ2V0SXNvdG9wZUF0b21pY01hc3MoIHRoaXMucHJvdG9uQ291bnQsIHRoaXMubmV1dHJvbkNvdW50ICk7XHJcbiAgfVxyXG59XHJcblxyXG5pc290b3Blc0FuZEF0b21pY01hc3MucmVnaXN0ZXIoICdJbW11dGFibGVBdG9tQ29uZmlnJywgSW1tdXRhYmxlQXRvbUNvbmZpZyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSW1tdXRhYmxlQXRvbUNvbmZpZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFFbEUsTUFBTUMsbUJBQW1CLENBQUM7RUFFeEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLFdBQVcsRUFBRUMsWUFBWSxFQUFHO0lBQ25ELElBQUksQ0FBQ0MsV0FBVyxHQUFHSCxVQUFVO0lBQzdCLElBQUksQ0FBQ0ksWUFBWSxHQUFHSCxXQUFXO0lBQy9CLElBQUksQ0FBQ0ksYUFBYSxHQUFHSCxZQUFZO0VBQ25DOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxNQUFNQSxDQUFFQyxVQUFVLEVBQUc7SUFFbkIsSUFBSUMsZUFBZTs7SUFFbkI7SUFDQSxJQUFLRCxVQUFVLENBQUNFLG1CQUFtQixFQUFHO01BRXBDQyxNQUFNLElBQUlBLE1BQU0sQ0FDaEJILFVBQVUsQ0FBQ0ksb0JBQW9CLElBQUlKLFVBQVUsQ0FBQ0sscUJBQXFCLEVBQ2pFLCtEQUNGLENBQUM7TUFDREosZUFBZSxHQUFHLElBQUksQ0FBQ0wsV0FBVyxLQUFLSSxVQUFVLENBQUNFLG1CQUFtQixDQUFDSSxLQUFLLElBQ3pELElBQUksQ0FBQ1QsWUFBWSxLQUFLRyxVQUFVLENBQUNJLG9CQUFvQixDQUFDRSxLQUFLLElBQzNELElBQUksQ0FBQ1IsYUFBYSxLQUFLRSxVQUFVLENBQUNLLHFCQUFxQixDQUFDQyxLQUFLO0lBQ2pGLENBQUMsTUFDSTtNQUNISCxNQUFNLElBQUlBLE1BQU0sQ0FDaEJILFVBQVUsQ0FBQ0gsWUFBWSxLQUFLVSxTQUFTLElBQUlQLFVBQVUsQ0FBQ0osV0FBVyxLQUFLVyxTQUFTLElBQUlQLFVBQVUsQ0FBQ0YsYUFBYSxLQUFLUyxTQUFTLEVBQ3JILCtCQUNGLENBQUM7TUFDRE4sZUFBZSxHQUFHLElBQUksQ0FBQ0wsV0FBVyxLQUFLSSxVQUFVLENBQUNKLFdBQVcsSUFDM0MsSUFBSSxDQUFDQyxZQUFZLEtBQUtHLFVBQVUsQ0FBQ0gsWUFBWSxJQUM3QyxJQUFJLENBQUNDLGFBQWEsS0FBS0UsVUFBVSxDQUFDRixhQUFhO0lBQ25FO0lBQ0EsT0FBT0csZUFBZTtFQUN4Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxvQkFBb0JBLENBQUEsRUFBRztJQUNyQixPQUFPbkIsY0FBYyxDQUFDbUIsb0JBQW9CLENBQUUsSUFBSSxDQUFDWixXQUFXLEVBQUUsSUFBSSxDQUFDQyxZQUFhLENBQUM7RUFDbkY7QUFDRjtBQUVBUCxxQkFBcUIsQ0FBQ21CLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRWxCLG1CQUFvQixDQUFDO0FBRTVFLGVBQWVBLG1CQUFtQiJ9