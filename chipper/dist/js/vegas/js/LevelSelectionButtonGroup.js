// Copyright 2022-2023, University of Colorado Boulder

/**
 * LevelSelectionButtonGroup is a group of related LevelSelectionButtons, used in games.
 *
 * Responsibilities include:
 * - Instantiation of the buttons, based on an 'items' array that describes the buttons.
 * - Setting an effective uniform size for the button icons.
 * - Layout of the buttons, see details below.
 * - Support for the gameLevels query parameter, via LevelSelectionButtonGroupOptions.gameLevels.
 *
 * Layout:
 * - The default layout is a single row of buttons, customizable via LevelSelectionButtonGroupOptions.flowBoxOptions.
 * - To create multiple rows of buttons, see example MultiRowButtonGroup in demoLevelSelectionButtonGroup.ts.
 * - To create a custom layout, see example XButtonGroup in demoLevelSelectionButtonGroup.ts.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, FlowBox, Node } from '../../scenery/js/imports.js';
import LevelSelectionButton from './LevelSelectionButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import vegas from './vegas.js';

// Describes one LevelSelectionButton

export default class LevelSelectionButtonGroup extends Node {
  // Buttons, ordered by increasing level number.
  // Note that level numbering starts from 1, to match the gameLevels query parameter.

  /**
   * @param items - descriptions of the LevelSelectionButtons, ordered by increasing level number
   * @param [providedOptions]
   */
  constructor(items, providedOptions) {
    assert && assert(items.length > 0, 'at least one item must be specified');
    const options = optionize()({
      // The default layout is a single row of buttons.
      flowBoxOptions: {
        orientation: 'horizontal',
        spacing: 10
      },
      // @ts-expect-error This default is provided for JavaScript simulations.
      tandem: Tandem.REQUIRED
    }, providedOptions);

    // All icons will have the same effective size.
    const alignBoxOptions = {
      group: new AlignGroup()
    };

    // Create the LevelSelectionButton instances.
    const buttons = items.map((item, index) => {
      let tandem = Tandem.OPT_OUT;
      if (options.tandem.supplied) {
        const tandemName = item.tandemName || `level${index + 1}Button`;
        tandem = options.tandem.createTandem(tandemName);
      }
      return new LevelSelectionButton(new AlignBox(item.icon, alignBoxOptions), item.scoreProperty, combineOptions({
        tandem: tandem
      }, options.levelSelectionButtonOptions, item.options));
    });

    // Hide buttons for levels that are not included in gameLevels.
    // All buttons must be instantiated so that the PhET-iO API is not changed conditionally.
    if (options.gameLevels) {
      assert && assert(options.gameLevels.length > 0, 'at least 1 gameLevel must be visible');
      assert && assert(_.every(options.gameLevels, gameLevel => Number.isInteger(gameLevel) && gameLevel > 0), 'gameLevels must be positive integers');
      buttons.forEach((button, index) => {
        button.visible = options.gameLevels.includes(index + 1);
      });
    }
    let layoutNode;
    if (options.createLayoutNode) {
      layoutNode = options.createLayoutNode(buttons);
    } else {
      // The default layout is a FlowBox, customizable via options.flowBoxOptions.
      layoutNode = new FlowBox(combineOptions({
        children: buttons
      }, options.flowBoxOptions));
    }
    options.children = [layoutNode];
    super(options);
    this.buttons = buttons;
  }

  /**
   * Sets the focus to the button associated with a specified level number. If your simulation supports keyboard
   * traversal, you'll typically need to call this when returning to the UI that show the LevelSelectionButtonGroup,
   * for example, when the 'Back' or 'Start Over' button is pressed in a game.
   * @param level - numbered starting from 1, to comply with gameLevels query parameter
   */
  focusLevelSelectionButton(level) {
    assert && assert(Number.isInteger(level) && level > 0 && level <= this.buttons.length, `invalid level: ${level}`);
    this.buttons[level - 1].focus();
  }
}
vegas.register('LevelSelectionButtonGroup', LevelSelectionButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIkZsb3dCb3giLCJOb2RlIiwiTGV2ZWxTZWxlY3Rpb25CdXR0b24iLCJUYW5kZW0iLCJ2ZWdhcyIsIkxldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAiLCJjb25zdHJ1Y3RvciIsIml0ZW1zIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwibGVuZ3RoIiwib3B0aW9ucyIsImZsb3dCb3hPcHRpb25zIiwib3JpZW50YXRpb24iLCJzcGFjaW5nIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJhbGlnbkJveE9wdGlvbnMiLCJncm91cCIsImJ1dHRvbnMiLCJtYXAiLCJpdGVtIiwiaW5kZXgiLCJPUFRfT1VUIiwic3VwcGxpZWQiLCJ0YW5kZW1OYW1lIiwiY3JlYXRlVGFuZGVtIiwiaWNvbiIsInNjb3JlUHJvcGVydHkiLCJsZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnMiLCJnYW1lTGV2ZWxzIiwiXyIsImV2ZXJ5IiwiZ2FtZUxldmVsIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwiZm9yRWFjaCIsImJ1dHRvbiIsInZpc2libGUiLCJpbmNsdWRlcyIsImxheW91dE5vZGUiLCJjcmVhdGVMYXlvdXROb2RlIiwiY2hpbGRyZW4iLCJmb2N1c0xldmVsU2VsZWN0aW9uQnV0dG9uIiwibGV2ZWwiLCJmb2N1cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwIGlzIGEgZ3JvdXAgb2YgcmVsYXRlZCBMZXZlbFNlbGVjdGlvbkJ1dHRvbnMsIHVzZWQgaW4gZ2FtZXMuXHJcbiAqXHJcbiAqIFJlc3BvbnNpYmlsaXRpZXMgaW5jbHVkZTpcclxuICogLSBJbnN0YW50aWF0aW9uIG9mIHRoZSBidXR0b25zLCBiYXNlZCBvbiBhbiAnaXRlbXMnIGFycmF5IHRoYXQgZGVzY3JpYmVzIHRoZSBidXR0b25zLlxyXG4gKiAtIFNldHRpbmcgYW4gZWZmZWN0aXZlIHVuaWZvcm0gc2l6ZSBmb3IgdGhlIGJ1dHRvbiBpY29ucy5cclxuICogLSBMYXlvdXQgb2YgdGhlIGJ1dHRvbnMsIHNlZSBkZXRhaWxzIGJlbG93LlxyXG4gKiAtIFN1cHBvcnQgZm9yIHRoZSBnYW1lTGV2ZWxzIHF1ZXJ5IHBhcmFtZXRlciwgdmlhIExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBPcHRpb25zLmdhbWVMZXZlbHMuXHJcbiAqXHJcbiAqIExheW91dDpcclxuICogLSBUaGUgZGVmYXVsdCBsYXlvdXQgaXMgYSBzaW5nbGUgcm93IG9mIGJ1dHRvbnMsIGN1c3RvbWl6YWJsZSB2aWEgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cE9wdGlvbnMuZmxvd0JveE9wdGlvbnMuXHJcbiAqIC0gVG8gY3JlYXRlIG11bHRpcGxlIHJvd3Mgb2YgYnV0dG9ucywgc2VlIGV4YW1wbGUgTXVsdGlSb3dCdXR0b25Hcm91cCBpbiBkZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cC50cy5cclxuICogLSBUbyBjcmVhdGUgYSBjdXN0b20gbGF5b3V0LCBzZWUgZXhhbXBsZSBYQnV0dG9uR3JvdXAgaW4gZGVtb0xldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAudHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBBbGlnbkdyb3VwLCBGbG93Qm94LCBGbG93Qm94T3B0aW9ucywgTGF5b3V0Tm9kZSwgTm9kZSwgTm9kZUxheW91dENvbnN0cmFpbnQsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IExldmVsU2VsZWN0aW9uQnV0dG9uLCB7IExldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vTGV2ZWxTZWxlY3Rpb25CdXR0b24uanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xyXG5cclxuLy8gRGVzY3JpYmVzIG9uZSBMZXZlbFNlbGVjdGlvbkJ1dHRvblxyXG5leHBvcnQgdHlwZSBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbSA9IHtcclxuXHJcbiAgLy8gVGhlIGljb24gZGlzcGxheWVkIG9uIHRoZSBidXR0b25cclxuICBpY29uOiBOb2RlO1xyXG5cclxuICAvLyBUaGUgc2NvcmUgZGlzcGxheWVkIG9uIHRoZSBidXR0b25cclxuICBzY29yZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gTmFtZSB1c2VkIHdoZW4gY3JlYXRpbmcgdGhlIGJ1dHRvbidzIHRhbmRlbSwgZGVmYXVsdHMgdG8gYGxldmVsJHtOfUJ1dHRvbmBcclxuICB0YW5kZW1OYW1lPzogc3RyaW5nO1xyXG5cclxuICAvLyBPcHRpb25zIGZvciB0aGUgYnV0dG9uLiBUaGVzZSB3aWxsIG92ZXJyaWRlIExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBPcHRpb25zLmxldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9ucy5cclxuICAvLyBTZXR0aW5nIHRhbmRlbSBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGdyb3VwLCBzbyBpdCBpcyBvbWl0dGVkIGhlcmUuXHJcbiAgb3B0aW9ucz86IFN0cmljdE9taXQ8TGV2ZWxTZWxlY3Rpb25CdXR0b25PcHRpb25zLCAndGFuZGVtJz47XHJcbn07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBPcHRpb25zIGZvciBhbGwgTGV2ZWxTZWxlY3Rpb25CdXR0b24gaW5zdGFuY2VzIGluIHRoZSBncm91cC5cclxuICAvLyBUaGVzZSBjYW4gYmUgb3ZlcnJpZGRlbiBmb3Igc3BlY2lmaWMgYnV0dG9uKHMpIHZpYSBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbS5vcHRpb25zLlxyXG4gIGxldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9ucz86IFN0cmljdE9taXQ8TGV2ZWxTZWxlY3Rpb25CdXR0b25PcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG4gIC8vIE9wdGlvbnMgZm9yIHRoZSBkZWZhdWx0IGxheW91dCwgd2hpY2ggaXMgYSBGbG93Qm94LiBJZ25vcmVkIGlmIGNyZWF0ZUxheW91dE5vZGUgaXMgcHJvdmlkZWQuXHJcbiAgZmxvd0JveE9wdGlvbnM/OiBTdHJpY3RPbWl0PEZsb3dCb3hPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbiAgLy8gQ3JlYXRlcyB0aGUgTm9kZSB0aGF0IGhhbmRsZXMgbGF5b3V0IG9mIHRoZSBidXR0b25zLlxyXG4gIC8vIFVzZSB0aGlzIG9wdGlvbiBpZiB5b3UgaGF2ZSBhIGN1c3RvbSBsYXlvdXQgdGhhdCBjYW5ub3QgYmUgYWNoaWV2ZWQgdXNpbmcgdGhlIGRlZmF1bHQgRmxvd0JveC5cclxuICBjcmVhdGVMYXlvdXROb2RlPzogKCBidXR0b25zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbltdICkgPT4gTGF5b3V0Tm9kZTxOb2RlTGF5b3V0Q29uc3RyYWludD47XHJcblxyXG4gIC8vIEdhbWUgbGV2ZWxzIHdob3NlIGJ1dHRvbnMgc2hvdWxkIGJlIHZpc2libGUuIExldmVscyBhcmUgbnVtYmVyZWQgc3RhcnRpbmcgZnJvbSAxLCB0byBjb21wbHkgd2l0aCB0aGUgZ2FtZUxldmVsc1xyXG4gIC8vIHF1ZXJ5IHBhcmFtZXRlci4gU2V0IHRoaXMgdG8gdGhlIHZhbHVlIG9mIHRoZSBnYW1lTGV2ZWxzIHF1ZXJ5IHBhcmFtZXRlciwgaWYgc3VwcG9ydGVkIGJ5IHlvdXIgc2ltLlxyXG4gIC8vIFNlZSBnZXRHYW1lTGV2ZWxzU2NoZW1hLnRzLlxyXG4gIGdhbWVMZXZlbHM/OiBudW1iZXJbXTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPiAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBCdXR0b25zLCBvcmRlcmVkIGJ5IGluY3JlYXNpbmcgbGV2ZWwgbnVtYmVyLlxyXG4gIC8vIE5vdGUgdGhhdCBsZXZlbCBudW1iZXJpbmcgc3RhcnRzIGZyb20gMSwgdG8gbWF0Y2ggdGhlIGdhbWVMZXZlbHMgcXVlcnkgcGFyYW1ldGVyLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYnV0dG9uczogTGV2ZWxTZWxlY3Rpb25CdXR0b25bXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGl0ZW1zIC0gZGVzY3JpcHRpb25zIG9mIHRoZSBMZXZlbFNlbGVjdGlvbkJ1dHRvbnMsIG9yZGVyZWQgYnkgaW5jcmVhc2luZyBsZXZlbCBudW1iZXJcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGl0ZW1zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbVtdLCBwcm92aWRlZE9wdGlvbnM/OiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwT3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGl0ZW1zLmxlbmd0aCA+IDAsICdhdCBsZWFzdCBvbmUgaXRlbSBtdXN0IGJlIHNwZWNpZmllZCcgKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBPcHRpb25zLFxyXG4gICAgICBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnY3JlYXRlTGF5b3V0Tm9kZScgfCAnZ2FtZUxldmVscycgfCAnbGV2ZWxTZWxlY3Rpb25CdXR0b25PcHRpb25zJz4sIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBUaGUgZGVmYXVsdCBsYXlvdXQgaXMgYSBzaW5nbGUgcm93IG9mIGJ1dHRvbnMuXHJcbiAgICAgIGZsb3dCb3hPcHRpb25zOiB7XHJcbiAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgICBzcGFjaW5nOiAxMFxyXG4gICAgICB9LFxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRoaXMgZGVmYXVsdCBpcyBwcm92aWRlZCBmb3IgSmF2YVNjcmlwdCBzaW11bGF0aW9ucy5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEFsbCBpY29ucyB3aWxsIGhhdmUgdGhlIHNhbWUgZWZmZWN0aXZlIHNpemUuXHJcbiAgICBjb25zdCBhbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgpXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgTGV2ZWxTZWxlY3Rpb25CdXR0b24gaW5zdGFuY2VzLlxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGl0ZW1zLm1hcCggKCBpdGVtLCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgIGxldCB0YW5kZW0gPSBUYW5kZW0uT1BUX09VVDtcclxuICAgICAgaWYgKCBvcHRpb25zLnRhbmRlbS5zdXBwbGllZCApIHtcclxuICAgICAgICBjb25zdCB0YW5kZW1OYW1lID0gaXRlbS50YW5kZW1OYW1lIHx8IGBsZXZlbCR7aW5kZXggKyAxfUJ1dHRvbmA7XHJcbiAgICAgICAgdGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCB0YW5kZW1OYW1lICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oIG5ldyBBbGlnbkJveCggaXRlbS5pY29uLCBhbGlnbkJveE9wdGlvbnMgKSwgaXRlbS5zY29yZVByb3BlcnR5LFxyXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPExldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9ucz4oIHtcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICAgICAgfSwgb3B0aW9ucy5sZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnMsIGl0ZW0ub3B0aW9ucyApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGlkZSBidXR0b25zIGZvciBsZXZlbHMgdGhhdCBhcmUgbm90IGluY2x1ZGVkIGluIGdhbWVMZXZlbHMuXHJcbiAgICAvLyBBbGwgYnV0dG9ucyBtdXN0IGJlIGluc3RhbnRpYXRlZCBzbyB0aGF0IHRoZSBQaEVULWlPIEFQSSBpcyBub3QgY2hhbmdlZCBjb25kaXRpb25hbGx5LlxyXG4gICAgaWYgKCBvcHRpb25zLmdhbWVMZXZlbHMgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZ2FtZUxldmVscy5sZW5ndGggPiAwLCAnYXQgbGVhc3QgMSBnYW1lTGV2ZWwgbXVzdCBiZSB2aXNpYmxlJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBvcHRpb25zLmdhbWVMZXZlbHMsIGdhbWVMZXZlbCA9PiAoIE51bWJlci5pc0ludGVnZXIoIGdhbWVMZXZlbCApICYmIGdhbWVMZXZlbCA+IDAgKSApLFxyXG4gICAgICAgICdnYW1lTGV2ZWxzIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlcnMnICk7XHJcbiAgICAgIGJ1dHRvbnMuZm9yRWFjaCggKCBidXR0b24sIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGJ1dHRvbi52aXNpYmxlID0gb3B0aW9ucy5nYW1lTGV2ZWxzIS5pbmNsdWRlcyggaW5kZXggKyAxICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGF5b3V0Tm9kZTtcclxuICAgIGlmICggb3B0aW9ucy5jcmVhdGVMYXlvdXROb2RlICkge1xyXG4gICAgICBsYXlvdXROb2RlID0gb3B0aW9ucy5jcmVhdGVMYXlvdXROb2RlKCBidXR0b25zICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBkZWZhdWx0IGxheW91dCBpcyBhIEZsb3dCb3gsIGN1c3RvbWl6YWJsZSB2aWEgb3B0aW9ucy5mbG93Qm94T3B0aW9ucy5cclxuICAgICAgbGF5b3V0Tm9kZSA9IG5ldyBGbG93Qm94KCBjb21iaW5lT3B0aW9uczxGbG93Qm94T3B0aW9ucz4oIHtcclxuICAgICAgICBjaGlsZHJlbjogYnV0dG9uc1xyXG4gICAgICB9LCBvcHRpb25zLmZsb3dCb3hPcHRpb25zICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBsYXlvdXROb2RlIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmJ1dHRvbnMgPSBidXR0b25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZm9jdXMgdG8gdGhlIGJ1dHRvbiBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpZWQgbGV2ZWwgbnVtYmVyLiBJZiB5b3VyIHNpbXVsYXRpb24gc3VwcG9ydHMga2V5Ym9hcmRcclxuICAgKiB0cmF2ZXJzYWwsIHlvdSdsbCB0eXBpY2FsbHkgbmVlZCB0byBjYWxsIHRoaXMgd2hlbiByZXR1cm5pbmcgdG8gdGhlIFVJIHRoYXQgc2hvdyB0aGUgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCxcclxuICAgKiBmb3IgZXhhbXBsZSwgd2hlbiB0aGUgJ0JhY2snIG9yICdTdGFydCBPdmVyJyBidXR0b24gaXMgcHJlc3NlZCBpbiBhIGdhbWUuXHJcbiAgICogQHBhcmFtIGxldmVsIC0gbnVtYmVyZWQgc3RhcnRpbmcgZnJvbSAxLCB0byBjb21wbHkgd2l0aCBnYW1lTGV2ZWxzIHF1ZXJ5IHBhcmFtZXRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBmb2N1c0xldmVsU2VsZWN0aW9uQnV0dG9uKCBsZXZlbDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbGV2ZWwgKSAmJiBsZXZlbCA+IDAgJiYgbGV2ZWwgPD0gdGhpcy5idXR0b25zLmxlbmd0aCxcclxuICAgICAgYGludmFsaWQgbGV2ZWw6ICR7bGV2ZWx9YCApO1xyXG4gICAgdGhpcy5idXR0b25zWyBsZXZlbCAtIDEgXS5mb2N1cygpO1xyXG4gIH1cclxufVxyXG5cclxudmVnYXMucmVnaXN0ZXIoICdMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwJywgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUEsT0FBT0EsU0FBUyxJQUFJQyxjQUFjLFFBQVEsaUNBQWlDO0FBQzNFLFNBQVNDLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxPQUFPLEVBQThCQyxJQUFJLFFBQTJDLDZCQUE2QjtBQUNoSixPQUFPQyxvQkFBb0IsTUFBdUMsMkJBQTJCO0FBRTdGLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsS0FBSyxNQUFNLFlBQVk7O0FBRTlCOztB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