// Copyright 2013-2022, University of Colorado Boulder

/**
 * MySolutionModel is the model for the 'My Solution' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Beaker from '../../common/model/Beaker.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import phScale from '../../phScale.js';
import MySolution from './MySolution.js';
export default class MySolutionModel {
  // Beaker, everything else is positioned relative to it. Offset constants were set by visual inspection.

  // solution in the beaker

  constructor(providedOptions) {
    this.beaker = new Beaker(PHScaleConstants.BEAKER_POSITION);
    this.solution = new MySolution({
      maxVolume: this.beaker.volume,
      tandem: providedOptions.tandem.createTandem('solution')
    });
  }
  reset() {
    this.solution.reset();
  }
}
phScale.register('MySolutionModel', MySolutionModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCZWFrZXIiLCJQSFNjYWxlQ29uc3RhbnRzIiwicGhTY2FsZSIsIk15U29sdXRpb24iLCJNeVNvbHV0aW9uTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImJlYWtlciIsIkJFQUtFUl9QT1NJVElPTiIsInNvbHV0aW9uIiwibWF4Vm9sdW1lIiwidm9sdW1lIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk15U29sdXRpb25Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNeVNvbHV0aW9uTW9kZWwgaXMgdGhlIG1vZGVsIGZvciB0aGUgJ015IFNvbHV0aW9uJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IEJlYWtlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQmVha2VyLmpzJztcclxuaW1wb3J0IFBIU2NhbGVDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1BIU2NhbGVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgcGhTY2FsZSBmcm9tICcuLi8uLi9waFNjYWxlLmpzJztcclxuaW1wb3J0IE15U29sdXRpb24gZnJvbSAnLi9NeVNvbHV0aW9uLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBNeVNvbHV0aW9uTW9kZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlTb2x1dGlvbk1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgLy8gQmVha2VyLCBldmVyeXRoaW5nIGVsc2UgaXMgcG9zaXRpb25lZCByZWxhdGl2ZSB0byBpdC4gT2Zmc2V0IGNvbnN0YW50cyB3ZXJlIHNldCBieSB2aXN1YWwgaW5zcGVjdGlvbi5cclxuICBwdWJsaWMgcmVhZG9ubHkgYmVha2VyOiBCZWFrZXI7XHJcblxyXG4gIC8vIHNvbHV0aW9uIGluIHRoZSBiZWFrZXJcclxuICBwdWJsaWMgcmVhZG9ubHkgc29sdXRpb246IE15U29sdXRpb247XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBNeVNvbHV0aW9uTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIHRoaXMuYmVha2VyID0gbmV3IEJlYWtlciggUEhTY2FsZUNvbnN0YW50cy5CRUFLRVJfUE9TSVRJT04gKTtcclxuXHJcbiAgICB0aGlzLnNvbHV0aW9uID0gbmV3IE15U29sdXRpb24oIHtcclxuICAgICAgbWF4Vm9sdW1lOiB0aGlzLmJlYWtlci52b2x1bWUsXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2x1dGlvbicgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zb2x1dGlvbi5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ015U29sdXRpb25Nb2RlbCcsIE15U29sdXRpb25Nb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFNQSxPQUFPQSxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGdCQUFnQixNQUFNLGtDQUFrQztBQUMvRCxPQUFPQyxPQUFPLE1BQU0sa0JBQWtCO0FBQ3RDLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFNeEMsZUFBZSxNQUFNQyxlQUFlLENBQW1CO0VBRXJEOztFQUdBOztFQUdPQyxXQUFXQSxDQUFFQyxlQUF1QyxFQUFHO0lBRTVELElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUlQLE1BQU0sQ0FBRUMsZ0JBQWdCLENBQUNPLGVBQWdCLENBQUM7SUFFNUQsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSU4sVUFBVSxDQUFFO01BQzlCTyxTQUFTLEVBQUUsSUFBSSxDQUFDSCxNQUFNLENBQUNJLE1BQU07TUFDN0JDLE1BQU0sRUFBRU4sZUFBZSxDQUFDTSxNQUFNLENBQUNDLFlBQVksQ0FBRSxVQUFXO0lBQzFELENBQUUsQ0FBQztFQUNMO0VBRU9DLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNMLFFBQVEsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7RUFDdkI7QUFDRjtBQUVBWixPQUFPLENBQUNhLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVgsZUFBZ0IsQ0FBQyJ9