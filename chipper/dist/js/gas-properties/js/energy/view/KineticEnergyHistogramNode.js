// Copyright 2019-2022, University of Colorado Boulder

/**
 * KineticEnergyHistogramNode shows the distribution of the kinetic energy of particles in the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
import HistogramNode from './HistogramNode.js';
export default class KineticEnergyHistogramNode extends HistogramNode {
  constructor(histogramsModel, providedOptions) {
    const options = optionize()({
      // HistogramNodeOptions
      barColor: GasPropertiesColors.kineticEnergyHistogramBarColorProperty
    }, providedOptions);
    super(histogramsModel.numberOfBins, histogramsModel.kineticEnergyBinWidth, histogramsModel.binCountsUpdatedEmitter, histogramsModel.allKineticEnergyBinCountsProperty, histogramsModel.heavyKineticEnergyBinCountsProperty, histogramsModel.lightKineticEnergyBinCountsProperty, histogramsModel.yScaleProperty, GasPropertiesStrings.kineticEnergyStringProperty,
    // x-axis label
    GasPropertiesStrings.numberOfParticlesStringProperty,
    // y-axis label
    options);
  }
}
gasProperties.register('KineticEnergyHistogramNode', KineticEnergyHistogramNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJHYXNQcm9wZXJ0aWVzQ29sb3JzIiwiZ2FzUHJvcGVydGllcyIsIkdhc1Byb3BlcnRpZXNTdHJpbmdzIiwiSGlzdG9ncmFtTm9kZSIsIktpbmV0aWNFbmVyZ3lIaXN0b2dyYW1Ob2RlIiwiY29uc3RydWN0b3IiLCJoaXN0b2dyYW1zTW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmFyQ29sb3IiLCJraW5ldGljRW5lcmd5SGlzdG9ncmFtQmFyQ29sb3JQcm9wZXJ0eSIsIm51bWJlck9mQmlucyIsImtpbmV0aWNFbmVyZ3lCaW5XaWR0aCIsImJpbkNvdW50c1VwZGF0ZWRFbWl0dGVyIiwiYWxsS2luZXRpY0VuZXJneUJpbkNvdW50c1Byb3BlcnR5IiwiaGVhdnlLaW5ldGljRW5lcmd5QmluQ291bnRzUHJvcGVydHkiLCJsaWdodEtpbmV0aWNFbmVyZ3lCaW5Db3VudHNQcm9wZXJ0eSIsInlTY2FsZVByb3BlcnR5Iiwia2luZXRpY0VuZXJneVN0cmluZ1Byb3BlcnR5IiwibnVtYmVyT2ZQYXJ0aWNsZXNTdHJpbmdQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiS2luZXRpY0VuZXJneUhpc3RvZ3JhbU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogS2luZXRpY0VuZXJneUhpc3RvZ3JhbU5vZGUgc2hvd3MgdGhlIGRpc3RyaWJ1dGlvbiBvZiB0aGUga2luZXRpYyBlbmVyZ3kgb2YgcGFydGljbGVzIGluIHRoZSBjb250YWluZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HYXNQcm9wZXJ0aWVzQ29sb3JzLmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzU3RyaW5ncyBmcm9tICcuLi8uLi9HYXNQcm9wZXJ0aWVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBIaXN0b2dyYW1zTW9kZWwgZnJvbSAnLi4vbW9kZWwvSGlzdG9ncmFtc01vZGVsLmpzJztcclxuaW1wb3J0IEhpc3RvZ3JhbU5vZGUsIHsgSGlzdG9ncmFtTm9kZU9wdGlvbnMgfSBmcm9tICcuL0hpc3RvZ3JhbU5vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEtpbmV0aWNFbmVyZ3lIaXN0b2dyYW1Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEhpc3RvZ3JhbU5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLaW5ldGljRW5lcmd5SGlzdG9ncmFtTm9kZSBleHRlbmRzIEhpc3RvZ3JhbU5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGhpc3RvZ3JhbXNNb2RlbDogSGlzdG9ncmFtc01vZGVsLCBwcm92aWRlZE9wdGlvbnM6IEtpbmV0aWNFbmVyZ3lIaXN0b2dyYW1Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEtpbmV0aWNFbmVyZ3lIaXN0b2dyYW1Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIEhpc3RvZ3JhbU5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBIaXN0b2dyYW1Ob2RlT3B0aW9uc1xyXG4gICAgICBiYXJDb2xvcjogR2FzUHJvcGVydGllc0NvbG9ycy5raW5ldGljRW5lcmd5SGlzdG9ncmFtQmFyQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgIGhpc3RvZ3JhbXNNb2RlbC5udW1iZXJPZkJpbnMsXHJcbiAgICAgIGhpc3RvZ3JhbXNNb2RlbC5raW5ldGljRW5lcmd5QmluV2lkdGgsXHJcbiAgICAgIGhpc3RvZ3JhbXNNb2RlbC5iaW5Db3VudHNVcGRhdGVkRW1pdHRlcixcclxuICAgICAgaGlzdG9ncmFtc01vZGVsLmFsbEtpbmV0aWNFbmVyZ3lCaW5Db3VudHNQcm9wZXJ0eSxcclxuICAgICAgaGlzdG9ncmFtc01vZGVsLmhlYXZ5S2luZXRpY0VuZXJneUJpbkNvdW50c1Byb3BlcnR5LFxyXG4gICAgICBoaXN0b2dyYW1zTW9kZWwubGlnaHRLaW5ldGljRW5lcmd5QmluQ291bnRzUHJvcGVydHksXHJcbiAgICAgIGhpc3RvZ3JhbXNNb2RlbC55U2NhbGVQcm9wZXJ0eSxcclxuICAgICAgR2FzUHJvcGVydGllc1N0cmluZ3Mua2luZXRpY0VuZXJneVN0cmluZ1Byb3BlcnR5LCAvLyB4LWF4aXMgbGFiZWxcclxuICAgICAgR2FzUHJvcGVydGllc1N0cmluZ3MubnVtYmVyT2ZQYXJ0aWNsZXNTdHJpbmdQcm9wZXJ0eSwgLy8geS1heGlzIGxhYmVsXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnS2luZXRpY0VuZXJneUhpc3RvZ3JhbU5vZGUnLCBLaW5ldGljRW5lcmd5SGlzdG9ncmFtTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxtQkFBbUIsTUFBTSxxQ0FBcUM7QUFDckUsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFFaEUsT0FBT0MsYUFBYSxNQUFnQyxvQkFBb0I7QUFNeEUsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0QsYUFBYSxDQUFDO0VBRTdERSxXQUFXQSxDQUFFQyxlQUFnQyxFQUFFQyxlQUFrRCxFQUFHO0lBRXpHLE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUF1RSxDQUFDLENBQUU7TUFFakc7TUFDQVUsUUFBUSxFQUFFVCxtQkFBbUIsQ0FBQ1U7SUFDaEMsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FDSEQsZUFBZSxDQUFDSyxZQUFZLEVBQzVCTCxlQUFlLENBQUNNLHFCQUFxQixFQUNyQ04sZUFBZSxDQUFDTyx1QkFBdUIsRUFDdkNQLGVBQWUsQ0FBQ1EsaUNBQWlDLEVBQ2pEUixlQUFlLENBQUNTLG1DQUFtQyxFQUNuRFQsZUFBZSxDQUFDVSxtQ0FBbUMsRUFDbkRWLGVBQWUsQ0FBQ1csY0FBYyxFQUM5QmYsb0JBQW9CLENBQUNnQiwyQkFBMkI7SUFBRTtJQUNsRGhCLG9CQUFvQixDQUFDaUIsK0JBQStCO0lBQUU7SUFDdERYLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsYUFBYSxDQUFDbUIsUUFBUSxDQUFFLDRCQUE0QixFQUFFaEIsMEJBQTJCLENBQUMifQ==