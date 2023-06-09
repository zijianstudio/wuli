// Copyright 2019-2022, University of Colorado Boulder

/**
 * KineticEnergyNumberDisplay is a subclass of PlayAreaNumberDisplay for displaying the total kinetic energy of a
 * BallSystem. Instances are positioned just inside the bottom-right corner of the PlayArea and appears on all
 * Screens.
 *
 * KineticEnergyNumberDisplays are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';
class KineticEnergyNumberDisplay extends PlayAreaNumberDisplay {
  /**
   * @param {ReadOnlyProperty.<number>} totalKineticEnergyProperty
   * @param {Object} [options]
   */
  constructor(totalKineticEnergyProperty, options) {
    assert && AssertUtils.assertAbstractPropertyOf(totalKineticEnergyProperty, 'number');
    options = merge({
      valuePattern: StringUtils.fillIn(CollisionLabStrings.pattern.labelEqualsValueSpaceUnits, {
        label: CollisionLabStrings.kineticEnergy,
        units: CollisionLabStrings.units.joules
      }),
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      },
      maxWidth: 300 // constrain width for i18n, determined empirically.
    }, options);
    super(totalKineticEnergyProperty, options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'KineticEnergyNumberDisplay is not intended to be disposed');
  }
}
collisionLab.register('KineticEnergyNumberDisplay', KineticEnergyNumberDisplay);
export default KineticEnergyNumberDisplay;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFzc2VydFV0aWxzIiwiU3RyaW5nVXRpbHMiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJTdHJpbmdzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiUGxheUFyZWFOdW1iZXJEaXNwbGF5IiwiS2luZXRpY0VuZXJneU51bWJlckRpc3BsYXkiLCJjb25zdHJ1Y3RvciIsInRvdGFsS2luZXRpY0VuZXJneVByb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsImFzc2VydEFic3RyYWN0UHJvcGVydHlPZiIsInZhbHVlUGF0dGVybiIsImZpbGxJbiIsInBhdHRlcm4iLCJsYWJlbEVxdWFsc1ZhbHVlU3BhY2VVbml0cyIsImxhYmVsIiwia2luZXRpY0VuZXJneSIsInVuaXRzIiwiam91bGVzIiwidGV4dE9wdGlvbnMiLCJmb250IiwiRElTUExBWV9GT05UIiwibWF4V2lkdGgiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJLaW5ldGljRW5lcmd5TnVtYmVyRGlzcGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBLaW5ldGljRW5lcmd5TnVtYmVyRGlzcGxheSBpcyBhIHN1YmNsYXNzIG9mIFBsYXlBcmVhTnVtYmVyRGlzcGxheSBmb3IgZGlzcGxheWluZyB0aGUgdG90YWwga2luZXRpYyBlbmVyZ3kgb2YgYVxyXG4gKiBCYWxsU3lzdGVtLiBJbnN0YW5jZXMgYXJlIHBvc2l0aW9uZWQganVzdCBpbnNpZGUgdGhlIGJvdHRvbS1yaWdodCBjb3JuZXIgb2YgdGhlIFBsYXlBcmVhIGFuZCBhcHBlYXJzIG9uIGFsbFxyXG4gKiBTY3JlZW5zLlxyXG4gKlxyXG4gKiBLaW5ldGljRW5lcmd5TnVtYmVyRGlzcGxheXMgYXJlIGNyZWF0ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0gYW5kIGFyZSBuZXZlciBkaXNwb3NlZCwgc28gbm8gZGlzcG9zZSBtZXRob2QgaXNcclxuICogbmVjZXNzYXJ5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYlN0cmluZ3MgZnJvbSAnLi4vLi4vQ29sbGlzaW9uTGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBsYXlBcmVhTnVtYmVyRGlzcGxheSBmcm9tICcuL1BsYXlBcmVhTnVtYmVyRGlzcGxheS5qcyc7XHJcblxyXG5jbGFzcyBLaW5ldGljRW5lcmd5TnVtYmVyRGlzcGxheSBleHRlbmRzIFBsYXlBcmVhTnVtYmVyRGlzcGxheSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmVhZE9ubHlQcm9wZXJ0eS48bnVtYmVyPn0gdG90YWxLaW5ldGljRW5lcmd5UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRvdGFsS2luZXRpY0VuZXJneVByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHlPZiggdG90YWxLaW5ldGljRW5lcmd5UHJvcGVydHksICdudW1iZXInICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICB2YWx1ZVBhdHRlcm46IFN0cmluZ1V0aWxzLmZpbGxJbiggQ29sbGlzaW9uTGFiU3RyaW5ncy5wYXR0ZXJuLmxhYmVsRXF1YWxzVmFsdWVTcGFjZVVuaXRzLCB7XHJcbiAgICAgICAgbGFiZWw6IENvbGxpc2lvbkxhYlN0cmluZ3Mua2luZXRpY0VuZXJneSxcclxuICAgICAgICB1bml0czogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5qb3VsZXNcclxuICAgICAgfSApLFxyXG4gICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IENvbGxpc2lvbkxhYkNvbnN0YW50cy5ESVNQTEFZX0ZPTlRcclxuICAgICAgfSxcclxuICAgICAgbWF4V2lkdGg6IDMwMCAvLyBjb25zdHJhaW4gd2lkdGggZm9yIGkxOG4sIGRldGVybWluZWQgZW1waXJpY2FsbHkuXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB0b3RhbEtpbmV0aWNFbmVyZ3lQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0tpbmV0aWNFbmVyZ3lOdW1iZXJEaXNwbGF5IGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0tpbmV0aWNFbmVyZ3lOdW1iZXJEaXNwbGF5JywgS2luZXRpY0VuZXJneU51bWJlckRpc3BsYXkgKTtcclxuZXhwb3J0IGRlZmF1bHQgS2luZXRpY0VuZXJneU51bWJlckRpc3BsYXk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMsMEJBQTBCLFNBQVNELHFCQUFxQixDQUFDO0VBRTdEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLDBCQUEwQixFQUFFQyxPQUFPLEVBQUc7SUFDakRDLE1BQU0sSUFBSVYsV0FBVyxDQUFDVyx3QkFBd0IsQ0FBRUgsMEJBQTBCLEVBQUUsUUFBUyxDQUFDO0lBRXRGQyxPQUFPLEdBQUdWLEtBQUssQ0FBRTtNQUVmYSxZQUFZLEVBQUVYLFdBQVcsQ0FBQ1ksTUFBTSxDQUFFVixtQkFBbUIsQ0FBQ1csT0FBTyxDQUFDQywwQkFBMEIsRUFBRTtRQUN4RkMsS0FBSyxFQUFFYixtQkFBbUIsQ0FBQ2MsYUFBYTtRQUN4Q0MsS0FBSyxFQUFFZixtQkFBbUIsQ0FBQ2UsS0FBSyxDQUFDQztNQUNuQyxDQUFFLENBQUM7TUFDSEMsV0FBVyxFQUFFO1FBQ1hDLElBQUksRUFBRWpCLHFCQUFxQixDQUFDa0I7TUFDOUIsQ0FBQztNQUNEQyxRQUFRLEVBQUUsR0FBRyxDQUFDO0lBRWhCLENBQUMsRUFBRWQsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFRCwwQkFBMEIsRUFBRUMsT0FBUSxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VlLE9BQU9BLENBQUEsRUFBRztJQUNSZCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsMkRBQTRELENBQUM7RUFDeEY7QUFDRjtBQUVBUixZQUFZLENBQUN1QixRQUFRLENBQUUsNEJBQTRCLEVBQUVuQiwwQkFBMkIsQ0FBQztBQUNqRixlQUFlQSwwQkFBMEIifQ==