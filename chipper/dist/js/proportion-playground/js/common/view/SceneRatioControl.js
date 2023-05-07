// Copyright 2016-2022, University of Colorado Boulder

/**
 * Base type for a combined visual representation with controls (spinners, etc.) for the ratio-based items
 * (necklaces, billiard tables, splotches, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import proportionPlayground from '../../proportionPlayground.js';
import Side from '../model/Side.js';
import ProportionPlaygroundConstants from '../ProportionPlaygroundConstants.js';

// Bottom y value in layoutBounds for the pickers
const PICKER_BOTTOM = 540;
class SceneRatioControl extends Node {
  /**
   * @param {SceneRatio} sceneRatio
   * @param {Property.<Color>} leftPickerColorProperty - The color of the left picker's arrows
   * @param {Property.<Color>} rightPickerColorProperty - The color of the right picker's arrows
   * @param {Tandem} tandem
   * @param {Object} [options] - node options
   */
  constructor(sceneRatio, leftPickerColorProperty, rightPickerColorProperty, tandem, options) {
    assert && assert(tandem);
    options = merge({
      leftPickerOptions: {},
      // {Object} - Directly provided to the picker (for additional options)
      rightPickerOptions: {},
      // {Object} - Directly provided to the picker (for additional options)
      leftPickerLabel: null,
      // {Node|string|null}
      rightPickerLabel: null,
      // {Node|string|null}
      pickerLabelMaxWidth: 150,
      // {number},
      tandem: tandem
    }, options);
    super(options);
    sceneRatio.controlsVisibleProperty.linkAttribute(this, 'visible');

    /**
     * Creates a Node representing a single picker (may include multiple pickers due to needing multiple colors)
     * @private
     *
     * @param {Side} side - Whether we are the left picker or right.
     * @param {Node|string|null} label - If available, will be placed above the picker. Strings will use Text.
     * @param {Object} pickerOptions - Any options to provide directly to the NumberPicker
     * @returns {Node}
     */
    function createPickers(side, label, pickerOptions) {
      const picker = new NumberPicker(sceneRatio.getProperty(side), new Property(sceneRatio.getRange(side)), merge({
        scale: 2,
        valueMaxWidth: 40,
        timerInterval: 100,
        color: side === Side.LEFT ? leftPickerColorProperty : rightPickerColorProperty,
        tandem: tandem.createTandem(side === Side.LEFT ? 'leftPicker' : 'rightPicker')
      }, pickerOptions));

      // If there is a label, we'll add it above the picker
      if (label) {
        // Convert a string label to a Text node.
        if (typeof label === 'string') {
          label = new Text(label, {
            maxWidth: options.pickerLabelMaxWidth,
            font: ProportionPlaygroundConstants.CONTROL_FONT
          });
        }
        return new VBox({
          spacing: 10,
          children: [label, picker]
        });
      }
      // With no label, return the picker directly
      else {
        return picker;
      }
    }

    // @protected {Node}
    this.leftPicker = createPickers(Side.LEFT, options.leftPickerLabel, options.leftPickerOptions);
    this.rightPicker = createPickers(Side.RIGHT, options.rightPickerLabel, options.rightPickerOptions);

    // @protected {Node|null} - Will be initialized when one of the add-picker functions is called.
    this.pickerContainer = null;
  }

  /**
   * Add both pickers to the bottom-middle.
   * @protected
   */
  addBottomPickers() {
    this.pickerContainer = new HBox({
      spacing: 15,
      bottom: PICKER_BOTTOM,
      centerX: 0,
      align: 'bottom',
      // Some have labels of different height on top
      children: [this.leftPicker, this.rightPicker]
    });
    this.addChild(this.pickerContainer);
  }

  /**
   * Add both pickers to the bottom, with horizontal centers specified
   * @protected
   *
   * @param {number} leftPickerX
   * @param {number} rightPickerX
   */
  addBottomPickersWithPosition(leftPickerX, rightPickerX) {
    this.leftPicker.centerX = leftPickerX;
    this.rightPicker.centerX = rightPickerX;
    this.leftPicker.bottom = this.rightPicker.bottom = PICKER_BOTTOM;
    this.pickerContainer = new Node({
      children: [this.leftPicker, this.rightPicker]
    });
    this.addChild(this.pickerContainer);
  }
}
proportionPlayground.register('SceneRatioControl', SceneRatioControl);
export default SceneRatioControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiSEJveCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIk51bWJlclBpY2tlciIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiU2lkZSIsIlByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIiwiUElDS0VSX0JPVFRPTSIsIlNjZW5lUmF0aW9Db250cm9sIiwiY29uc3RydWN0b3IiLCJzY2VuZVJhdGlvIiwibGVmdFBpY2tlckNvbG9yUHJvcGVydHkiLCJyaWdodFBpY2tlckNvbG9yUHJvcGVydHkiLCJ0YW5kZW0iLCJvcHRpb25zIiwiYXNzZXJ0IiwibGVmdFBpY2tlck9wdGlvbnMiLCJyaWdodFBpY2tlck9wdGlvbnMiLCJsZWZ0UGlja2VyTGFiZWwiLCJyaWdodFBpY2tlckxhYmVsIiwicGlja2VyTGFiZWxNYXhXaWR0aCIsImNvbnRyb2xzVmlzaWJsZVByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImNyZWF0ZVBpY2tlcnMiLCJzaWRlIiwibGFiZWwiLCJwaWNrZXJPcHRpb25zIiwicGlja2VyIiwiZ2V0UHJvcGVydHkiLCJnZXRSYW5nZSIsInNjYWxlIiwidmFsdWVNYXhXaWR0aCIsInRpbWVySW50ZXJ2YWwiLCJjb2xvciIsIkxFRlQiLCJjcmVhdGVUYW5kZW0iLCJtYXhXaWR0aCIsImZvbnQiLCJDT05UUk9MX0ZPTlQiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJsZWZ0UGlja2VyIiwicmlnaHRQaWNrZXIiLCJSSUdIVCIsInBpY2tlckNvbnRhaW5lciIsImFkZEJvdHRvbVBpY2tlcnMiLCJib3R0b20iLCJjZW50ZXJYIiwiYWxpZ24iLCJhZGRDaGlsZCIsImFkZEJvdHRvbVBpY2tlcnNXaXRoUG9zaXRpb24iLCJsZWZ0UGlja2VyWCIsInJpZ2h0UGlja2VyWCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NlbmVSYXRpb0NvbnRyb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSB0eXBlIGZvciBhIGNvbWJpbmVkIHZpc3VhbCByZXByZXNlbnRhdGlvbiB3aXRoIGNvbnRyb2xzIChzcGlubmVycywgZXRjLikgZm9yIHRoZSByYXRpby1iYXNlZCBpdGVtc1xyXG4gKiAobmVja2xhY2VzLCBiaWxsaWFyZCB0YWJsZXMsIHNwbG90Y2hlcywgZXRjLilcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJQaWNrZXIuanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5pbXBvcnQgU2lkZSBmcm9tICcuLi9tb2RlbC9TaWRlLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIGZyb20gJy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIEJvdHRvbSB5IHZhbHVlIGluIGxheW91dEJvdW5kcyBmb3IgdGhlIHBpY2tlcnNcclxuY29uc3QgUElDS0VSX0JPVFRPTSA9IDU0MDtcclxuXHJcbmNsYXNzIFNjZW5lUmF0aW9Db250cm9sIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTY2VuZVJhdGlvfSBzY2VuZVJhdGlvXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q29sb3I+fSBsZWZ0UGlja2VyQ29sb3JQcm9wZXJ0eSAtIFRoZSBjb2xvciBvZiB0aGUgbGVmdCBwaWNrZXIncyBhcnJvd3NcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxDb2xvcj59IHJpZ2h0UGlja2VyQ29sb3JQcm9wZXJ0eSAtIFRoZSBjb2xvciBvZiB0aGUgcmlnaHQgcGlja2VyJ3MgYXJyb3dzXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBub2RlIG9wdGlvbnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NlbmVSYXRpbywgbGVmdFBpY2tlckNvbG9yUHJvcGVydHksIHJpZ2h0UGlja2VyQ29sb3JQcm9wZXJ0eSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFuZGVtICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGxlZnRQaWNrZXJPcHRpb25zOiB7fSwgLy8ge09iamVjdH0gLSBEaXJlY3RseSBwcm92aWRlZCB0byB0aGUgcGlja2VyIChmb3IgYWRkaXRpb25hbCBvcHRpb25zKVxyXG4gICAgICByaWdodFBpY2tlck9wdGlvbnM6IHt9LCAvLyB7T2JqZWN0fSAtIERpcmVjdGx5IHByb3ZpZGVkIHRvIHRoZSBwaWNrZXIgKGZvciBhZGRpdGlvbmFsIG9wdGlvbnMpXHJcbiAgICAgIGxlZnRQaWNrZXJMYWJlbDogbnVsbCwgLy8ge05vZGV8c3RyaW5nfG51bGx9XHJcbiAgICAgIHJpZ2h0UGlja2VyTGFiZWw6IG51bGwsIC8vIHtOb2RlfHN0cmluZ3xudWxsfVxyXG4gICAgICBwaWNrZXJMYWJlbE1heFdpZHRoOiAxNTAsIC8vIHtudW1iZXJ9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgc2NlbmVSYXRpby5jb250cm9sc1Zpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBOb2RlIHJlcHJlc2VudGluZyBhIHNpbmdsZSBwaWNrZXIgKG1heSBpbmNsdWRlIG11bHRpcGxlIHBpY2tlcnMgZHVlIHRvIG5lZWRpbmcgbXVsdGlwbGUgY29sb3JzKVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1NpZGV9IHNpZGUgLSBXaGV0aGVyIHdlIGFyZSB0aGUgbGVmdCBwaWNrZXIgb3IgcmlnaHQuXHJcbiAgICAgKiBAcGFyYW0ge05vZGV8c3RyaW5nfG51bGx9IGxhYmVsIC0gSWYgYXZhaWxhYmxlLCB3aWxsIGJlIHBsYWNlZCBhYm92ZSB0aGUgcGlja2VyLiBTdHJpbmdzIHdpbGwgdXNlIFRleHQuXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGlja2VyT3B0aW9ucyAtIEFueSBvcHRpb25zIHRvIHByb3ZpZGUgZGlyZWN0bHkgdG8gdGhlIE51bWJlclBpY2tlclxyXG4gICAgICogQHJldHVybnMge05vZGV9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBpY2tlcnMoIHNpZGUsIGxhYmVsLCBwaWNrZXJPcHRpb25zICkge1xyXG4gICAgICBjb25zdCBwaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBzY2VuZVJhdGlvLmdldFByb3BlcnR5KCBzaWRlICksIG5ldyBQcm9wZXJ0eSggc2NlbmVSYXRpby5nZXRSYW5nZSggc2lkZSApICksXHJcbiAgICAgICAgbWVyZ2UoIHtcclxuICAgICAgICAgIHNjYWxlOiAyLFxyXG4gICAgICAgICAgdmFsdWVNYXhXaWR0aDogNDAsXHJcbiAgICAgICAgICB0aW1lckludGVydmFsOiAxMDAsXHJcbiAgICAgICAgICBjb2xvcjogc2lkZSA9PT0gU2lkZS5MRUZUID8gbGVmdFBpY2tlckNvbG9yUHJvcGVydHkgOiByaWdodFBpY2tlckNvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIHNpZGUgPT09IFNpZGUuTEVGVCA/ICdsZWZ0UGlja2VyJyA6ICdyaWdodFBpY2tlcicgKVxyXG4gICAgICAgIH0sIHBpY2tlck9wdGlvbnMgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBsYWJlbCwgd2UnbGwgYWRkIGl0IGFib3ZlIHRoZSBwaWNrZXJcclxuICAgICAgaWYgKCBsYWJlbCApIHtcclxuICAgICAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIGxhYmVsIHRvIGEgVGV4dCBub2RlLlxyXG4gICAgICAgIGlmICggdHlwZW9mIGxhYmVsID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgIGxhYmVsID0gbmV3IFRleHQoIGxhYmVsLCB7XHJcbiAgICAgICAgICAgIG1heFdpZHRoOiBvcHRpb25zLnBpY2tlckxhYmVsTWF4V2lkdGgsXHJcbiAgICAgICAgICAgIGZvbnQ6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLkNPTlRST0xfRk9OVFxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBWQm94KCB7XHJcbiAgICAgICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIGxhYmVsLFxyXG4gICAgICAgICAgICBwaWNrZXJcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gV2l0aCBubyBsYWJlbCwgcmV0dXJuIHRoZSBwaWNrZXIgZGlyZWN0bHlcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge05vZGV9XHJcbiAgICB0aGlzLmxlZnRQaWNrZXIgPSBjcmVhdGVQaWNrZXJzKCBTaWRlLkxFRlQsIG9wdGlvbnMubGVmdFBpY2tlckxhYmVsLCBvcHRpb25zLmxlZnRQaWNrZXJPcHRpb25zICk7XHJcbiAgICB0aGlzLnJpZ2h0UGlja2VyID0gY3JlYXRlUGlja2VycyggU2lkZS5SSUdIVCwgb3B0aW9ucy5yaWdodFBpY2tlckxhYmVsLCBvcHRpb25zLnJpZ2h0UGlja2VyT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge05vZGV8bnVsbH0gLSBXaWxsIGJlIGluaXRpYWxpemVkIHdoZW4gb25lIG9mIHRoZSBhZGQtcGlja2VyIGZ1bmN0aW9ucyBpcyBjYWxsZWQuXHJcbiAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYm90aCBwaWNrZXJzIHRvIHRoZSBib3R0b20tbWlkZGxlLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBhZGRCb3R0b21QaWNrZXJzKCkge1xyXG4gICAgdGhpcy5waWNrZXJDb250YWluZXIgPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgYm90dG9tOiBQSUNLRVJfQk9UVE9NLFxyXG4gICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICBhbGlnbjogJ2JvdHRvbScsIC8vIFNvbWUgaGF2ZSBsYWJlbHMgb2YgZGlmZmVyZW50IGhlaWdodCBvbiB0b3BcclxuICAgICAgY2hpbGRyZW46IFsgdGhpcy5sZWZ0UGlja2VyLCB0aGlzLnJpZ2h0UGlja2VyIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGlja2VyQ29udGFpbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYm90aCBwaWNrZXJzIHRvIHRoZSBib3R0b20sIHdpdGggaG9yaXpvbnRhbCBjZW50ZXJzIHNwZWNpZmllZFxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0UGlja2VyWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodFBpY2tlclhcclxuICAgKi9cclxuICBhZGRCb3R0b21QaWNrZXJzV2l0aFBvc2l0aW9uKCBsZWZ0UGlja2VyWCwgcmlnaHRQaWNrZXJYICkge1xyXG4gICAgdGhpcy5sZWZ0UGlja2VyLmNlbnRlclggPSBsZWZ0UGlja2VyWDtcclxuICAgIHRoaXMucmlnaHRQaWNrZXIuY2VudGVyWCA9IHJpZ2h0UGlja2VyWDtcclxuICAgIHRoaXMubGVmdFBpY2tlci5ib3R0b20gPSB0aGlzLnJpZ2h0UGlja2VyLmJvdHRvbSA9IFBJQ0tFUl9CT1RUT007XHJcbiAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMubGVmdFBpY2tlciwgdGhpcy5yaWdodFBpY2tlciBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBpY2tlckNvbnRhaW5lciApO1xyXG4gIH1cclxufVxyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdTY2VuZVJhdGlvQ29udHJvbCcsIFNjZW5lUmF0aW9Db250cm9sICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2VuZVJhdGlvQ29udHJvbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjtBQUNuQyxPQUFPQyw2QkFBNkIsTUFBTSxxQ0FBcUM7O0FBRS9FO0FBQ0EsTUFBTUMsYUFB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