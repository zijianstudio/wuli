// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Line Game' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import GLColors from '../common/GLColors.js';
import GLIconFactory from '../common/view/GLIconFactory.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';
import LineGameModel from './model/LineGameModel.js';
import LineGameScreenView from './view/LineGameScreenView.js';
export default class LineGameScreen extends Screen {
  constructor(tandem) {
    const options = {
      name: GraphingLinesStrings.screen.lineGameStringProperty,
      backgroundColorProperty: new Property(GLColors.SCREEN_BACKGROUND),
      homeScreenIcon: GLIconFactory.createGameScreenIcon(),
      tandem: tandem
    };
    super(() => new LineGameModel(tandem.createTandem('model')), model => new LineGameScreenView(model, tandem.createTandem('view')), options);
  }
}
graphingLines.register('LineGameScreen', LineGameScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIkdMQ29sb3JzIiwiR0xJY29uRmFjdG9yeSIsImdyYXBoaW5nTGluZXMiLCJHcmFwaGluZ0xpbmVzU3RyaW5ncyIsIkxpbmVHYW1lTW9kZWwiLCJMaW5lR2FtZVNjcmVlblZpZXciLCJMaW5lR2FtZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJsaW5lR2FtZVN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJTQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlR2FtZVNjcmVlbkljb24iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGluZUdhbWVTY3JlZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdMaW5lIEdhbWUnIHNjcmVlbi4gQ29uZm9ybXMgdG8gdGhlIGNvbnRyYWN0IHNwZWNpZmllZCBpbiBqb2lzdC9TY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHTENvbG9ycyBmcm9tICcuLi9jb21tb24vR0xDb2xvcnMuanMnO1xyXG5pbXBvcnQgR0xJY29uRmFjdG9yeSBmcm9tICcuLi9jb21tb24vdmlldy9HTEljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ0xpbmVzU3RyaW5ncyBmcm9tICcuLi9HcmFwaGluZ0xpbmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMaW5lR2FtZU1vZGVsIGZyb20gJy4vbW9kZWwvTGluZUdhbWVNb2RlbC5qcyc7XHJcbmltcG9ydCBMaW5lR2FtZVNjcmVlblZpZXcgZnJvbSAnLi92aWV3L0xpbmVHYW1lU2NyZWVuVmlldy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lR2FtZVNjcmVlbiBleHRlbmRzIFNjcmVlbjxMaW5lR2FtZU1vZGVsLCBMaW5lR2FtZVNjcmVlblZpZXc+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBHcmFwaGluZ0xpbmVzU3RyaW5ncy5zY3JlZW4ubGluZUdhbWVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb2xvcnMuU0NSRUVOX0JBQ0tHUk9VTkQgKSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IEdMSWNvbkZhY3RvcnkuY3JlYXRlR2FtZVNjcmVlbkljb24oKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBMaW5lR2FtZU1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IExpbmVHYW1lU2NyZWVuVmlldyggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnTGluZUdhbWVTY3JlZW4nLCBMaW5lR2FtZVNjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFFaEQsT0FBT0MsUUFBUSxNQUFNLHVCQUF1QjtBQUM1QyxPQUFPQyxhQUFhLE1BQU0saUNBQWlDO0FBQzNELE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0Msb0JBQW9CLE1BQU0sNEJBQTRCO0FBQzdELE9BQU9DLGFBQWEsTUFBTSwwQkFBMEI7QUFDcEQsT0FBT0Msa0JBQWtCLE1BQU0sOEJBQThCO0FBRTdELGVBQWUsTUFBTUMsY0FBYyxTQUFTUCxNQUFNLENBQW9DO0VBRTdFUSxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFFbkMsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAsb0JBQW9CLENBQUNRLE1BQU0sQ0FBQ0Msc0JBQXNCO01BQ3hEQyx1QkFBdUIsRUFBRSxJQUFJZixRQUFRLENBQUVFLFFBQVEsQ0FBQ2MsaUJBQWtCLENBQUM7TUFDbkVDLGNBQWMsRUFBRWQsYUFBYSxDQUFDZSxvQkFBb0IsQ0FBQyxDQUFDO01BQ3BEUixNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLGFBQWEsQ0FBRUksTUFBTSxDQUFDUyxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDekRDLEtBQUssSUFBSSxJQUFJYixrQkFBa0IsQ0FBRWEsS0FBSyxFQUFFVixNQUFNLENBQUNTLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUN2RVIsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBUCxhQUFhLENBQUNpQixRQUFRLENBQUUsZ0JBQWdCLEVBQUViLGNBQWUsQ0FBQyJ9