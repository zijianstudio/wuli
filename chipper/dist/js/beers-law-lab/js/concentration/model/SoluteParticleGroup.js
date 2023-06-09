// Copyright 2020-2023, University of Colorado Boulder

/**
 * SoluteParticleGroup is the PhetioGroup for dynamically creating SoluteParticle instances.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import beersLawLab from '../../beersLawLab.js';
import Solute from '../../common/model/Solute.js';
import SoluteParticle from './SoluteParticle.js';

// Arguments passed to createElement when creating the archetype
const DEFAULT_ARGUMENTS = [Solute.DRINK_MIX,
// solute
Vector2.ZERO,
// position
0,
// orientation
Vector2.ZERO,
// velocity
Vector2.ZERO // acceleration
];

export default class SoluteParticleGroup extends PhetioGroup {
  constructor(providedOptions) {
    const options = optionize()({
      // PhetioGroupOptions
      phetioType: PhetioGroup.PhetioGroupIO(SoluteParticle.SoluteParticleIO)
    }, providedOptions);

    // Instantiates a dynamic SoluteParticle.
    const createElement = (tandem, solute, position, orientation, velocity, acceleration) => new SoluteParticle(solute, position, orientation, {
      velocity: velocity,
      acceleration: acceleration,
      tandem: tandem
    });
    super(createElement, DEFAULT_ARGUMENTS, options);
  }
}
beersLawLab.register('SoluteParticleGroup', SoluteParticleGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwib3B0aW9uaXplIiwiUGhldGlvR3JvdXAiLCJiZWVyc0xhd0xhYiIsIlNvbHV0ZSIsIlNvbHV0ZVBhcnRpY2xlIiwiREVGQVVMVF9BUkdVTUVOVFMiLCJEUklOS19NSVgiLCJaRVJPIiwiU29sdXRlUGFydGljbGVHcm91cCIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb1R5cGUiLCJQaGV0aW9Hcm91cElPIiwiU29sdXRlUGFydGljbGVJTyIsImNyZWF0ZUVsZW1lbnQiLCJ0YW5kZW0iLCJzb2x1dGUiLCJwb3NpdGlvbiIsIm9yaWVudGF0aW9uIiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHV0ZVBhcnRpY2xlR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU29sdXRlUGFydGljbGVHcm91cCBpcyB0aGUgUGhldGlvR3JvdXAgZm9yIGR5bmFtaWNhbGx5IGNyZWF0aW5nIFNvbHV0ZVBhcnRpY2xlIGluc3RhbmNlcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldGlvR3JvdXAsIHsgUGhldGlvR3JvdXBPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0dyb3VwLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IFNvbHV0ZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU29sdXRlLmpzJztcclxuaW1wb3J0IFNvbHV0ZVBhcnRpY2xlLCB7IFNvbHV0ZVBhcnRpY2xlQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyB9IGZyb20gJy4vU29sdXRlUGFydGljbGUuanMnO1xyXG5cclxuLy8gQXJndW1lbnRzIHBhc3NlZCB0byBjcmVhdGVFbGVtZW50IHdoZW4gY3JlYXRpbmcgdGhlIGFyY2hldHlwZVxyXG5jb25zdCBERUZBVUxUX0FSR1VNRU5UUzogU29sdXRlUGFydGljbGVDcmVhdGVFbGVtZW50QXJndW1lbnRzID0gW1xyXG4gIFNvbHV0ZS5EUklOS19NSVgsIC8vIHNvbHV0ZVxyXG4gIFZlY3RvcjIuWkVSTywgLy8gcG9zaXRpb25cclxuICAwLCAvLyBvcmllbnRhdGlvblxyXG4gIFZlY3RvcjIuWkVSTywgLy8gdmVsb2NpdHlcclxuICBWZWN0b3IyLlpFUk8gLy8gYWNjZWxlcmF0aW9uXHJcbl07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU29sdXRlUGFydGljbGVHcm91cE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9Hcm91cE9wdGlvbnMsICd0YW5kZW0nIHwgJ3BoZXRpb0RvY3VtZW50YXRpb24nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbHV0ZVBhcnRpY2xlR3JvdXAgZXh0ZW5kcyBQaGV0aW9Hcm91cDxTb2x1dGVQYXJ0aWNsZSwgU29sdXRlUGFydGljbGVDcmVhdGVFbGVtZW50QXJndW1lbnRzPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTb2x1dGVQYXJ0aWNsZUdyb3VwT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNvbHV0ZVBhcnRpY2xlR3JvdXBPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvR3JvdXBPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBQaGV0aW9Hcm91cE9wdGlvbnNcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggU29sdXRlUGFydGljbGUuU29sdXRlUGFydGljbGVJTyApXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBJbnN0YW50aWF0ZXMgYSBkeW5hbWljIFNvbHV0ZVBhcnRpY2xlLlxyXG4gICAgY29uc3QgY3JlYXRlRWxlbWVudCA9ICggdGFuZGVtOiBUYW5kZW0sIHNvbHV0ZTogU29sdXRlLCBwb3NpdGlvbjogVmVjdG9yMiwgb3JpZW50YXRpb246IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiBWZWN0b3IyLCBhY2NlbGVyYXRpb246IFZlY3RvcjIgKSA9PlxyXG4gICAgICBuZXcgU29sdXRlUGFydGljbGUoIHNvbHV0ZSwgcG9zaXRpb24sIG9yaWVudGF0aW9uLCB7XHJcbiAgICAgICAgdmVsb2NpdHk6IHZlbG9jaXR5LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjogYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY3JlYXRlRWxlbWVudCwgREVGQVVMVF9BUkdVTUVOVFMsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJlZXJzTGF3TGFiLnJlZ2lzdGVyKCAnU29sdXRlUGFydGljbGVHcm91cCcsIFNvbHV0ZVBhcnRpY2xlR3JvdXAgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxXQUFXLE1BQThCLHNDQUFzQztBQUV0RixPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsY0FBYyxNQUFnRCxxQkFBcUI7O0FBRTFGO0FBQ0EsTUFBTUMsaUJBQXVELEdBQUcsQ0FDOURGLE1BQU0sQ0FBQ0csU0FBUztBQUFFO0FBQ2xCUCxPQUFPLENBQUNRLElBQUk7QUFBRTtBQUNkLENBQUM7QUFBRTtBQUNIUixPQUFPLENBQUNRLElBQUk7QUFBRTtBQUNkUixPQUFPLENBQUNRLElBQUksQ0FBQztBQUFBLENBQ2Q7O0FBTUQsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU1AsV0FBVyxDQUF1RDtFQUUxR1EsV0FBV0EsQ0FBRUMsZUFBMkMsRUFBRztJQUVoRSxNQUFNQyxPQUFPLEdBQUdYLFNBQVMsQ0FBOEQsQ0FBQyxDQUFFO01BRXhGO01BQ0FZLFVBQVUsRUFBRVgsV0FBVyxDQUFDWSxhQUFhLENBQUVULGNBQWMsQ0FBQ1UsZ0JBQWlCO0lBQ3pFLENBQUMsRUFBRUosZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNSyxhQUFhLEdBQUdBLENBQUVDLE1BQWMsRUFBRUMsTUFBYyxFQUFFQyxRQUFpQixFQUFFQyxXQUFtQixFQUN0RUMsUUFBaUIsRUFBRUMsWUFBcUIsS0FDOUQsSUFBSWpCLGNBQWMsQ0FBRWEsTUFBTSxFQUFFQyxRQUFRLEVBQUVDLFdBQVcsRUFBRTtNQUNqREMsUUFBUSxFQUFFQSxRQUFRO01BQ2xCQyxZQUFZLEVBQUVBLFlBQVk7TUFDMUJMLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7SUFFTCxLQUFLLENBQUVELGFBQWEsRUFBRVYsaUJBQWlCLEVBQUVNLE9BQVEsQ0FBQztFQUNwRDtBQUNGO0FBRUFULFdBQVcsQ0FBQ29CLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRWQsbUJBQW9CLENBQUMifQ==