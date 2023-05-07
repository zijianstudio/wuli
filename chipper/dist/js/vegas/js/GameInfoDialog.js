// Copyright 2022, University of Colorado Boulder

/**
 * GameInfoDialog shows descriptions for the levels of a game.  Each description is on a separate line.
 * If the simulation supports the gameLevels query parameter (see getGameLevelsSchema.ts) the caller
 * can optionally provide options.gameLevels to control which descriptions are visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node, RichText, VBox } from '../../scenery/js/imports.js';
import vegas from './vegas.js';
import optionize from '../../phet-core/js/optionize.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import ScreenView from '../../joist/js/ScreenView.js';
const DEFAULT_DESCRIPTION_TEXT_FONT = new PhetFont(24);
export default class GameInfoDialog extends Dialog {
  /**
   * @param levelDescriptions - level descriptions, in order of ascending level number
   * @param providedOptions
   */
  constructor(levelDescriptions, providedOptions) {
    const options = optionize()({
      descriptionTextOptions: {
        font: DEFAULT_DESCRIPTION_TEXT_FONT
      },
      vBoxOptions: {
        align: 'left',
        spacing: 20
      },
      maxContentWidth: 0.75 * ScreenView.DEFAULT_LAYOUT_BOUNDS.width,
      tandem: Tandem.REQUIRED
    }, providedOptions);

    // Constrain the width of the title, and ensure that the title can still be used with scenery DAG feature.
    if (options.title) {
      options.title = new Node({
        children: [options.title],
        maxWidth: options.maxContentWidth
      });
    }
    const descriptionNodes = levelDescriptions.map((levelDescription, index) => new RichText(levelDescription, optionize()({
      tandem: options.tandem.createTandem(`level${index}DescriptionText`)
    }, options.descriptionTextOptions)));

    // Hide descriptions for levels that are not included in options.gameLevels.
    // We must still create these Nodes so that the PhET-iO API is not changed.
    if (options.gameLevels) {
      assert && assert(_.every(options.gameLevels, gameLevel => Number.isInteger(gameLevel) && gameLevel > 0), 'gameLevels must be positive integers');
      descriptionNodes.forEach((node, index) => {
        node.visible = options.gameLevels.includes(index + 1);
      });
    }

    // Vertical layout
    const content = new VBox(optionize()({
      children: descriptionNodes,
      maxWidth: options.maxContentWidth // scale all descriptions uniformly
    }, options.vBoxOptions));
    super(content, options);
    this.disposeGameInfoDialog = () => {
      descriptionNodes.forEach(node => node.dispose());
    };
  }
  dispose() {
    this.disposeGameInfoDialog();
    super.dispose();
  }
}
vegas.register('GameInfoDialog', GameInfoDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiUmljaFRleHQiLCJWQm94IiwidmVnYXMiLCJvcHRpb25pemUiLCJEaWFsb2ciLCJUYW5kZW0iLCJQaGV0Rm9udCIsIlNjcmVlblZpZXciLCJERUZBVUxUX0RFU0NSSVBUSU9OX1RFWFRfRk9OVCIsIkdhbWVJbmZvRGlhbG9nIiwiY29uc3RydWN0b3IiLCJsZXZlbERlc2NyaXB0aW9ucyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkZXNjcmlwdGlvblRleHRPcHRpb25zIiwiZm9udCIsInZCb3hPcHRpb25zIiwiYWxpZ24iLCJzcGFjaW5nIiwibWF4Q29udGVudFdpZHRoIiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwid2lkdGgiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRpdGxlIiwiY2hpbGRyZW4iLCJtYXhXaWR0aCIsImRlc2NyaXB0aW9uTm9kZXMiLCJtYXAiLCJsZXZlbERlc2NyaXB0aW9uIiwiaW5kZXgiLCJjcmVhdGVUYW5kZW0iLCJnYW1lTGV2ZWxzIiwiYXNzZXJ0IiwiXyIsImV2ZXJ5IiwiZ2FtZUxldmVsIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwiZm9yRWFjaCIsIm5vZGUiLCJ2aXNpYmxlIiwiaW5jbHVkZXMiLCJjb250ZW50IiwiZGlzcG9zZUdhbWVJbmZvRGlhbG9nIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2FtZUluZm9EaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdhbWVJbmZvRGlhbG9nIHNob3dzIGRlc2NyaXB0aW9ucyBmb3IgdGhlIGxldmVscyBvZiBhIGdhbWUuICBFYWNoIGRlc2NyaXB0aW9uIGlzIG9uIGEgc2VwYXJhdGUgbGluZS5cclxuICogSWYgdGhlIHNpbXVsYXRpb24gc3VwcG9ydHMgdGhlIGdhbWVMZXZlbHMgcXVlcnkgcGFyYW1ldGVyIChzZWUgZ2V0R2FtZUxldmVsc1NjaGVtYS50cykgdGhlIGNhbGxlclxyXG4gKiBjYW4gb3B0aW9uYWxseSBwcm92aWRlIG9wdGlvbnMuZ2FtZUxldmVscyB0byBjb250cm9sIHdoaWNoIGRlc2NyaXB0aW9ucyBhcmUgdmlzaWJsZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlLCBSaWNoVGV4dCwgUmljaFRleHRPcHRpb25zLCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB2ZWdhcyBmcm9tICcuL3ZlZ2FzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IERpYWxvZywgeyBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxuY29uc3QgREVGQVVMVF9ERVNDUklQVElPTl9URVhUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDI0ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBHYW1lIGxldmVscyB3aG9zZSBkZXNjcmlwdGlvbnMgc2hvdWxkIGJlIHZpc2libGUgaW4gdGhlIGRpYWxvZy4gTGV2ZWxzIGFyZSBudW1iZXJlZCBzdGFydGluZyBmcm9tIDEuXHJcbiAgLy8gVGhpcyBpcyB0eXBpY2FsbHkgc2V0IHRvIHRoZSB2YWx1ZSBvZiB0aGUgZ2FtZUxldmVscyBxdWVyeSBwYXJhbWV0ZXIuIFNlZSBnZXRHYW1lTGV2ZWxzU2NoZW1hLnRzLlxyXG4gIGdhbWVMZXZlbHM/OiBudW1iZXJbXTtcclxuXHJcbiAgLy8gT3B0aW9ucyBmb3IgdGhlIGRlc2NyaXB0aW9uIHRleHQgbm9kZXNcclxuICBkZXNjcmlwdGlvblRleHRPcHRpb25zPzogU3RyaWN0T21pdDxSaWNoVGV4dE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbiAgLy8gT3B0aW9ucyBmb3IgdGhlIGxheW91dCAoVkJveClcclxuICB2Qm94T3B0aW9ucz86IFN0cmljdE9taXQ8VkJveE9wdGlvbnMsICdjaGlsZHJlbicgfCAnbWF4V2lkdGgnPjtcclxuXHJcbiAgLy8gY29uc3RyYWlucyB0aGUgd2lkdGggb2YgdGhlIERpYWxvZydzIGNvbnRlbnQgYW5kIHRpdGxlXHJcbiAgbWF4Q29udGVudFdpZHRoPzogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgR2FtZUluZm9EaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBEaWFsb2dPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZUluZm9EaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VHYW1lSW5mb0RpYWxvZzogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGxldmVsRGVzY3JpcHRpb25zIC0gbGV2ZWwgZGVzY3JpcHRpb25zLCBpbiBvcmRlciBvZiBhc2NlbmRpbmcgbGV2ZWwgbnVtYmVyXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGV2ZWxEZXNjcmlwdGlvbnM6ICggc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiApW10sIHByb3ZpZGVkT3B0aW9ucz86IEdhbWVJbmZvRGlhbG9nT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdhbWVJbmZvRGlhbG9nT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2dhbWVMZXZlbHMnPiwgRGlhbG9nT3B0aW9ucz4oKSgge1xyXG4gICAgICBkZXNjcmlwdGlvblRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogREVGQVVMVF9ERVNDUklQVElPTl9URVhUX0ZPTlRcclxuICAgICAgfSxcclxuICAgICAgdkJveE9wdGlvbnM6IHtcclxuICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgIHNwYWNpbmc6IDIwXHJcbiAgICAgIH0sXHJcbiAgICAgIG1heENvbnRlbnRXaWR0aDogMC43NSAqIFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLndpZHRoLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ29uc3RyYWluIHRoZSB3aWR0aCBvZiB0aGUgdGl0bGUsIGFuZCBlbnN1cmUgdGhhdCB0aGUgdGl0bGUgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aCBzY2VuZXJ5IERBRyBmZWF0dXJlLlxyXG4gICAgaWYgKCBvcHRpb25zLnRpdGxlICkge1xyXG4gICAgICBvcHRpb25zLnRpdGxlID0gbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBvcHRpb25zLnRpdGxlIF0sXHJcbiAgICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubWF4Q29udGVudFdpZHRoXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbk5vZGVzID0gbGV2ZWxEZXNjcmlwdGlvbnMubWFwKCAoIGxldmVsRGVzY3JpcHRpb24sIGluZGV4ICkgPT5cclxuICAgICAgbmV3IFJpY2hUZXh0KCBsZXZlbERlc2NyaXB0aW9uLCBvcHRpb25pemU8UmljaFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBSaWNoVGV4dE9wdGlvbnM+KCkoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYGxldmVsJHtpbmRleH1EZXNjcmlwdGlvblRleHRgIClcclxuICAgICAgfSwgb3B0aW9ucy5kZXNjcmlwdGlvblRleHRPcHRpb25zICkgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBIaWRlIGRlc2NyaXB0aW9ucyBmb3IgbGV2ZWxzIHRoYXQgYXJlIG5vdCBpbmNsdWRlZCBpbiBvcHRpb25zLmdhbWVMZXZlbHMuXHJcbiAgICAvLyBXZSBtdXN0IHN0aWxsIGNyZWF0ZSB0aGVzZSBOb2RlcyBzbyB0aGF0IHRoZSBQaEVULWlPIEFQSSBpcyBub3QgY2hhbmdlZC5cclxuICAgIGlmICggb3B0aW9ucy5nYW1lTGV2ZWxzICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBvcHRpb25zLmdhbWVMZXZlbHMsIGdhbWVMZXZlbCA9PiAoIE51bWJlci5pc0ludGVnZXIoIGdhbWVMZXZlbCApICYmIGdhbWVMZXZlbCA+IDAgKSApLFxyXG4gICAgICAgICdnYW1lTGV2ZWxzIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlcnMnICk7XHJcbiAgICAgIGRlc2NyaXB0aW9uTm9kZXMuZm9yRWFjaCggKCBub2RlLCBpbmRleCApID0+IHtcclxuICAgICAgICBub2RlLnZpc2libGUgPSBvcHRpb25zLmdhbWVMZXZlbHMhLmluY2x1ZGVzKCBpbmRleCArIDEgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcnRpY2FsIGxheW91dFxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCBvcHRpb25pemU8VkJveE9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFZCb3hPcHRpb25zPigpKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBkZXNjcmlwdGlvbk5vZGVzLFxyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5tYXhDb250ZW50V2lkdGggLy8gc2NhbGUgYWxsIGRlc2NyaXB0aW9ucyB1bmlmb3JtbHlcclxuICAgIH0sIG9wdGlvbnMudkJveE9wdGlvbnMgKSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlR2FtZUluZm9EaWFsb2cgPSAoKSA9PiB7XHJcbiAgICAgIGRlc2NyaXB0aW9uTm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlR2FtZUluZm9EaWFsb2coKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnZlZ2FzLnJlZ2lzdGVyKCAnR2FtZUluZm9EaWFsb2cnLCBHYW1lSW5mb0RpYWxvZyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxFQUFFQyxRQUFRLEVBQW1CQyxJQUFJLFFBQXFCLDZCQUE2QjtBQUNoRyxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyxTQUFTLE1BQTRCLGlDQUFpQztBQUU3RSxPQUFPQyxNQUFNLE1BQXlCLHdCQUF3QjtBQUM5RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsVUFBVSxNQUFNLDhCQUE4QjtBQUdyRCxNQUFNQyw2QkFBNkIsR0FBRyxJQUFJRixRQUFRLENBQUUsRUFBRyxDQUFDO0FBb0J4RCxlQUFlLE1BQU1HLGNBQWMsU0FBU0wsTUFBTSxDQUFDO0VB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