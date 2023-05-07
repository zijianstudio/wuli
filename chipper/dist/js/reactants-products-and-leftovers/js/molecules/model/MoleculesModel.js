// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Molecules' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ReactionFactory from '../../common/model/ReactionFactory.js';
import RPALBaseModel from '../../common/model/RPALBaseModel.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
export default class MoleculesModel extends RPALBaseModel {
  constructor(tandem) {
    const reactionsTandem = tandem.createTandem('reactions');
    const reactions = [ReactionFactory.makeWater(reactionsTandem.createTandem('makeWater')), ReactionFactory.makeAmmonia(reactionsTandem.createTandem('makeAmmonia')), ReactionFactory.combustMethane(reactionsTandem.createTandem('combustMethane'))];
    super(reactions, tandem);
  }
}
reactantsProductsAndLeftovers.register('MoleculesModel', MoleculesModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdGlvbkZhY3RvcnkiLCJSUEFMQmFzZU1vZGVsIiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJNb2xlY3VsZXNNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwicmVhY3Rpb25zVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicmVhY3Rpb25zIiwibWFrZVdhdGVyIiwibWFrZUFtbW9uaWEiLCJjb21idXN0TWV0aGFuZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVzTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnTW9sZWN1bGVzJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFJlYWN0aW9uRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUmVhY3Rpb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IFJQQUxCYXNlTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1JQQUxCYXNlTW9kZWwuanMnO1xyXG5pbXBvcnQgcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMgZnJvbSAnLi4vLi4vcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9sZWN1bGVzTW9kZWwgZXh0ZW5kcyBSUEFMQmFzZU1vZGVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCByZWFjdGlvbnNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVhY3Rpb25zJyApO1xyXG5cclxuICAgIGNvbnN0IHJlYWN0aW9ucyA9IFtcclxuICAgICAgUmVhY3Rpb25GYWN0b3J5Lm1ha2VXYXRlciggcmVhY3Rpb25zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21ha2VXYXRlcicgKSApLFxyXG4gICAgICBSZWFjdGlvbkZhY3RvcnkubWFrZUFtbW9uaWEoIHJlYWN0aW9uc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdtYWtlQW1tb25pYScgKSApLFxyXG4gICAgICBSZWFjdGlvbkZhY3RvcnkuY29tYnVzdE1ldGhhbmUoIHJlYWN0aW9uc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21idXN0TWV0aGFuZScgKSApXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCByZWFjdGlvbnMsIHRhbmRlbSApO1xyXG4gIH1cclxufVxyXG5cclxucmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMucmVnaXN0ZXIoICdNb2xlY3VsZXNNb2RlbCcsIE1vbGVjdWxlc01vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsYUFBYSxNQUFNLHFDQUFxQztBQUMvRCxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFFbEYsZUFBZSxNQUFNQyxjQUFjLFNBQVNGLGFBQWEsQ0FBQztFQUVqREcsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLE1BQU1DLGVBQWUsR0FBR0QsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWSxDQUFDO0lBRTFELE1BQU1DLFNBQVMsR0FBRyxDQUNoQlIsZUFBZSxDQUFDUyxTQUFTLENBQUVILGVBQWUsQ0FBQ0MsWUFBWSxDQUFFLFdBQVksQ0FBRSxDQUFDLEVBQ3hFUCxlQUFlLENBQUNVLFdBQVcsQ0FBRUosZUFBZSxDQUFDQyxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsRUFDNUVQLGVBQWUsQ0FBQ1csY0FBYyxDQUFFTCxlQUFlLENBQUNDLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLENBQ25GO0lBRUQsS0FBSyxDQUFFQyxTQUFTLEVBQUVILE1BQU8sQ0FBQztFQUM1QjtBQUNGO0FBRUFILDZCQUE2QixDQUFDVSxRQUFRLENBQUUsZ0JBQWdCLEVBQUVULGNBQWUsQ0FBQyJ9