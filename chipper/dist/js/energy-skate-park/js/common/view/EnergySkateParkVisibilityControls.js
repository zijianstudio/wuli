// Copyright 2018-2022, University of Colorado Boulder

/**
 * Checkboxes that control visibility of items in energy-skate-park, including the pie chart, bar graph, grid,
 * speedometer, and reference height control. Even though the model may support changing a particular Property of this
 * control group, that doesn't mean it will be included in this control group. A single ScreenView might contain
 * more than one of these groups with different sets of Checkboxes, so it is important that each check box can be
 * specifically included/excluded with an option.
 *
 * At the moment, order of checkboxes cannot be controlled.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { AlignGroup, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkCheckboxItem from './EnergySkateParkCheckboxItem.js';
const controlsPathString = EnergySkateParkStrings.visibilityControls.pathStringProperty;
const controlsReferenceHeightString = EnergySkateParkStrings.visibilityControls.referenceHeightStringProperty;
const controlsShowGridString = EnergySkateParkStrings.visibilityControls.gridStringProperty;
const controlsStickToTrackString = EnergySkateParkStrings.trackControls.stickToTrackStringProperty;
const pieChartString = EnergySkateParkStrings.plots.pieChart.labelStringProperty;
const propertiesSpeedString = EnergySkateParkStrings.visibilityControls.speedStringProperty;

// constants
const TEXT_OPTIONS = {
  font: EnergySkateParkConstants.CHECKBOX_LABEL_FONT,
  maxWidth: 117
};
const CHECKBOX_SPACING = 6; // spacing between checkbox and its icon content

class EnergySkateParkVisibilityControls extends VBox {
  /**
   * @param {EnergySkateParkModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, tandem, options) {
    options = merge({
      // {boolean} - whether or not Checkboxes for these Properties are included in the controls
      showPieChartCheckbox: true,
      showGridCheckbox: false,
      showSpeedCheckbox: true,
      showReferenceHeightCheckbox: false,
      showSkaterPathCheckbox: false,
      showStickToTrackCheckbox: false,
      // {number|null} if specified, the desired width for all checkboxes and icons so that the control can be aligned
      // with other items in a control panel. This will be used to calculate the spacing between the label and icon
      // portion of the Checkox content
      checkboxWidth: null,
      // {*|null} options that are passed to each EnergySkateParkCheckboxItem in this group of controls
      itemOptions: null
    }, options);
    super({
      align: 'left',
      spacing: 5
    });

    // @private {AlignGroup} - Used to align labels and icons so that every box in the group has the same dimensions
    this.textAlignGroup = new AlignGroup();
    this.iconAlignGroup = new AlignGroup();

    // @private {CheckboxContent[]} - list of contents containing icon nodes and Properties that will be used to
    // create checkboxes
    this.checkboxContents = [];

    // {EnergySkateParkCheckboxItem[]}
    const checkboxItems = [];
    if (options.showPieChartCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createPieChartIcon(tandem.createTandem('pieChartIcon'));
      this.addCheckboxContent(pieChartString, iconNode, model.pieChartVisibleProperty, tandem.createTandem('pieChartCheckbox'));
    }
    if (options.showGridCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createGridIcon(tandem.createTandem('gridIcon'));
      this.addCheckboxContent(controlsShowGridString, iconNode, model.gridVisibleProperty, tandem.createTandem('gridCheckbox'));
    }
    if (options.showSpeedCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createSpeedometerIcon(tandem.createTandem('speedIcon'));
      this.addCheckboxContent(propertiesSpeedString, iconNode, model.speedometerVisibleProperty, tandem.createTandem('speedCheckbox'));
    }
    if (options.showSkaterPathCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createSamplesIcon(tandem.createTandem('pathIcon'));
      this.addCheckboxContent(controlsPathString, iconNode, model.saveSamplesProperty, tandem.createTandem('pathCheckbox'));
    }
    if (options.showReferenceHeightCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createReferenceHeightIcon(tandem.createTandem('referenceHeightIcon'));
      this.addCheckboxContent(controlsReferenceHeightString, iconNode, model.referenceHeightVisibleProperty, tandem.createTandem('referenceHeightCheckbox'));
    }
    if (options.showStickToTrackCheckbox) {
      const iconNode = EnergySkateParkCheckboxItem.createStickingToTrackIcon();

      // this is the only checkbox that controls model physics, if it gets changed
      // by the user we may need to clear saved data or do other things
      const userControlledProperty = model.userControlledPropertySet.stickingToTrackControlledProperty;
      this.addCheckboxContent(controlsStickToTrackString, iconNode, model.stickingToTrackProperty, tandem.createTandem('stickingCheckbox'), {
        userControlledProperty: userControlledProperty
      });
    }

    // set spacing of contents for layout
    if (options.checkboxWidth) {
      this.checkboxContents.forEach(content => {
        content.setContentWidthForCheckbox(options.checkboxWidth);
      });
    }
    if (options.itemOptions) {
      assert && assert(options.itemOptions.boxWidth === undefined, 'EnergySkateParkVisibilityControls sets boxWidth');
      assert && assert(options.itemOptions.spacing === undefined, 'EnergySkateParkVisibilityControls sets spacing');
    }
    options.itemOptions = merge({}, options.itemOptions, {
      boxWidth: EnergySkateParkConstants.CHECKBOX_WIDTH,
      spacing: CHECKBOX_SPACING
    });
    this.checkboxContents.forEach(content => {
      options.itemOptions = merge({}, options.itemOptions, {
        userControlledProperty: content.userControlledProperty
      });
      checkboxItems.push(new EnergySkateParkCheckboxItem(content.property, content.checkboxIcon, content.tandem, options.itemOptions));
    });
    this.children = checkboxItems;
  }

  /**
   * Create and add to the list of checkbox contents. These are created eagerly so that layout can complete before
   * creating checkboxes, as checkboxes do not support icons with variable dimensions.
   * @public
   *
   * @param {string} labelString
   * @param {Node} iconNode
   * @param {BooleanProperty} property
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  addCheckboxContent(labelString, iconNode, property, tandem, options) {
    this.checkboxContents.push(new CheckboxContent(labelString, iconNode, this.textAlignGroup, this.iconAlignGroup, property, tandem, options));
  }
}

/**
 * Inner type that collects the contents for a checkbox, and assigns icons and labels to align groups for layout.
 * This is done BEFORE passing content to checkboxes as checkboxes do not support label nodes with varying dimensions.
 */
class CheckboxContent {
  /**
   * @param {string} labelString
   * @param {Node} iconNode
   * @param {AlignGroup} textAlignGroup
   * @param {AlignGroup} iconAlignGroup
   * @param {BooleanProperty}property
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(labelString, iconNode, textAlignGroup, iconAlignGroup, property, tandem, options) {
    options = merge({
      // {BooleanProperty} - Property indicating that the checkbox Property has been
      // changed by the user (rather than internally by the sim), allowing us
      // to do extra work if user changes directly
      userControlledProperty: null
    }, options);

    // create the text and assign to an AlignBox
    const text = new Text(labelString, merge({
      tandem: tandem.createTandem('text')
    }, TEXT_OPTIONS));
    const textBox = textAlignGroup.createBox(text, {
      xAlign: 'left'
    });
    const iconBox = iconAlignGroup.createBox(iconNode, {
      xAlign: 'center'
    });

    // @public {HBox} - contents for the checkbox
    this.checkboxIcon = new HBox({
      children: [textBox, iconBox],
      spacing: 10
    });
    this.tandem = tandem;

    // @public {BooleanProperty} - Property for the checkbox
    this.property = property;

    // @public {BooleanProperty}
    this.userControlledProperty = options.userControlledProperty;
  }

  /**
   * Set width of the content by modifying spacing between items. Includes width of the checkbox and its spacing so
   * that width can be specified when it is used as Checkbox content. This must be done BEFORE content is passed to
   * a Checkbox because Checkbox does not support content with variable dimensions.
   * @public
   *
   * @param width
   */
  setContentWidthForCheckbox(width) {
    this.checkboxIcon.spacing = this.checkboxIcon.spacing + (width - this.checkboxIcon.width) - EnergySkateParkConstants.CHECKBOX_WIDTH - CHECKBOX_SPACING;
  }
}
energySkatePark.register('EnergySkateParkVisibilityControls', EnergySkateParkVisibilityControls);
export default EnergySkateParkVisibilityControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFsaWduR3JvdXAiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJlbmVyZ3lTa2F0ZVBhcmsiLCJFbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzIiwiRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIiwiRW5lcmd5U2thdGVQYXJrQ2hlY2tib3hJdGVtIiwiY29udHJvbHNQYXRoU3RyaW5nIiwidmlzaWJpbGl0eUNvbnRyb2xzIiwicGF0aFN0cmluZ1Byb3BlcnR5IiwiY29udHJvbHNSZWZlcmVuY2VIZWlnaHRTdHJpbmciLCJyZWZlcmVuY2VIZWlnaHRTdHJpbmdQcm9wZXJ0eSIsImNvbnRyb2xzU2hvd0dyaWRTdHJpbmciLCJncmlkU3RyaW5nUHJvcGVydHkiLCJjb250cm9sc1N0aWNrVG9UcmFja1N0cmluZyIsInRyYWNrQ29udHJvbHMiLCJzdGlja1RvVHJhY2tTdHJpbmdQcm9wZXJ0eSIsInBpZUNoYXJ0U3RyaW5nIiwicGxvdHMiLCJwaWVDaGFydCIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJwcm9wZXJ0aWVzU3BlZWRTdHJpbmciLCJzcGVlZFN0cmluZ1Byb3BlcnR5IiwiVEVYVF9PUFRJT05TIiwiZm9udCIsIkNIRUNLQk9YX0xBQkVMX0ZPTlQiLCJtYXhXaWR0aCIsIkNIRUNLQk9YX1NQQUNJTkciLCJFbmVyZ3lTa2F0ZVBhcmtWaXNpYmlsaXR5Q29udHJvbHMiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwib3B0aW9ucyIsInNob3dQaWVDaGFydENoZWNrYm94Iiwic2hvd0dyaWRDaGVja2JveCIsInNob3dTcGVlZENoZWNrYm94Iiwic2hvd1JlZmVyZW5jZUhlaWdodENoZWNrYm94Iiwic2hvd1NrYXRlclBhdGhDaGVja2JveCIsInNob3dTdGlja1RvVHJhY2tDaGVja2JveCIsImNoZWNrYm94V2lkdGgiLCJpdGVtT3B0aW9ucyIsImFsaWduIiwic3BhY2luZyIsInRleHRBbGlnbkdyb3VwIiwiaWNvbkFsaWduR3JvdXAiLCJjaGVja2JveENvbnRlbnRzIiwiY2hlY2tib3hJdGVtcyIsImljb25Ob2RlIiwiY3JlYXRlUGllQ2hhcnRJY29uIiwiY3JlYXRlVGFuZGVtIiwiYWRkQ2hlY2tib3hDb250ZW50IiwicGllQ2hhcnRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVHcmlkSWNvbiIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVTcGVlZG9tZXRlckljb24iLCJzcGVlZG9tZXRlclZpc2libGVQcm9wZXJ0eSIsImNyZWF0ZVNhbXBsZXNJY29uIiwic2F2ZVNhbXBsZXNQcm9wZXJ0eSIsImNyZWF0ZVJlZmVyZW5jZUhlaWdodEljb24iLCJyZWZlcmVuY2VIZWlnaHRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVTdGlja2luZ1RvVHJhY2tJY29uIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQiLCJzdGlja2luZ1RvVHJhY2tDb250cm9sbGVkUHJvcGVydHkiLCJzdGlja2luZ1RvVHJhY2tQcm9wZXJ0eSIsImZvckVhY2giLCJjb250ZW50Iiwic2V0Q29udGVudFdpZHRoRm9yQ2hlY2tib3giLCJhc3NlcnQiLCJib3hXaWR0aCIsInVuZGVmaW5lZCIsIkNIRUNLQk9YX1dJRFRIIiwicHVzaCIsInByb3BlcnR5IiwiY2hlY2tib3hJY29uIiwiY2hpbGRyZW4iLCJsYWJlbFN0cmluZyIsIkNoZWNrYm94Q29udGVudCIsInRleHQiLCJ0ZXh0Qm94IiwiY3JlYXRlQm94IiwieEFsaWduIiwiaWNvbkJveCIsIndpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmVyZ3lTa2F0ZVBhcmtWaXNpYmlsaXR5Q29udHJvbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2hlY2tib3hlcyB0aGF0IGNvbnRyb2wgdmlzaWJpbGl0eSBvZiBpdGVtcyBpbiBlbmVyZ3ktc2thdGUtcGFyaywgaW5jbHVkaW5nIHRoZSBwaWUgY2hhcnQsIGJhciBncmFwaCwgZ3JpZCxcclxuICogc3BlZWRvbWV0ZXIsIGFuZCByZWZlcmVuY2UgaGVpZ2h0IGNvbnRyb2wuIEV2ZW4gdGhvdWdoIHRoZSBtb2RlbCBtYXkgc3VwcG9ydCBjaGFuZ2luZyBhIHBhcnRpY3VsYXIgUHJvcGVydHkgb2YgdGhpc1xyXG4gKiBjb250cm9sIGdyb3VwLCB0aGF0IGRvZXNuJ3QgbWVhbiBpdCB3aWxsIGJlIGluY2x1ZGVkIGluIHRoaXMgY29udHJvbCBncm91cC4gQSBzaW5nbGUgU2NyZWVuVmlldyBtaWdodCBjb250YWluXHJcbiAqIG1vcmUgdGhhbiBvbmUgb2YgdGhlc2UgZ3JvdXBzIHdpdGggZGlmZmVyZW50IHNldHMgb2YgQ2hlY2tib3hlcywgc28gaXQgaXMgaW1wb3J0YW50IHRoYXQgZWFjaCBjaGVjayBib3ggY2FuIGJlXHJcbiAqIHNwZWNpZmljYWxseSBpbmNsdWRlZC9leGNsdWRlZCB3aXRoIGFuIG9wdGlvbi5cclxuICpcclxuICogQXQgdGhlIG1vbWVudCwgb3JkZXIgb2YgY2hlY2tib3hlcyBjYW5ub3QgYmUgY29udHJvbGxlZC5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEFsaWduR3JvdXAsIEhCb3gsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneVNrYXRlUGFya1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIGZyb20gJy4uL0VuZXJneVNrYXRlUGFya0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtDaGVja2JveEl0ZW0gZnJvbSAnLi9FbmVyZ3lTa2F0ZVBhcmtDaGVja2JveEl0ZW0uanMnO1xyXG5cclxuY29uc3QgY29udHJvbHNQYXRoU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy52aXNpYmlsaXR5Q29udHJvbHMucGF0aFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBjb250cm9sc1JlZmVyZW5jZUhlaWdodFN0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3MudmlzaWJpbGl0eUNvbnRyb2xzLnJlZmVyZW5jZUhlaWdodFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBjb250cm9sc1Nob3dHcmlkU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy52aXNpYmlsaXR5Q29udHJvbHMuZ3JpZFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBjb250cm9sc1N0aWNrVG9UcmFja1N0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3MudHJhY2tDb250cm9scy5zdGlja1RvVHJhY2tTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgcGllQ2hhcnRTdHJpbmcgPSBFbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzLnBsb3RzLnBpZUNoYXJ0LmxhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHByb3BlcnRpZXNTcGVlZFN0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3MudmlzaWJpbGl0eUNvbnRyb2xzLnNwZWVkU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEVYVF9PUFRJT05TID0ge1xyXG4gIGZvbnQ6IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5DSEVDS0JPWF9MQUJFTF9GT05ULFxyXG4gIG1heFdpZHRoOiAxMTdcclxufTtcclxuXHJcbmNvbnN0IENIRUNLQk9YX1NQQUNJTkcgPSA2OyAvLyBzcGFjaW5nIGJldHdlZW4gY2hlY2tib3ggYW5kIGl0cyBpY29uIGNvbnRlbnRcclxuXHJcbmNsYXNzIEVuZXJneVNrYXRlUGFya1Zpc2liaWxpdHlDb250cm9scyBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IENoZWNrYm94ZXMgZm9yIHRoZXNlIFByb3BlcnRpZXMgYXJlIGluY2x1ZGVkIGluIHRoZSBjb250cm9sc1xyXG4gICAgICBzaG93UGllQ2hhcnRDaGVja2JveDogdHJ1ZSxcclxuICAgICAgc2hvd0dyaWRDaGVja2JveDogZmFsc2UsXHJcbiAgICAgIHNob3dTcGVlZENoZWNrYm94OiB0cnVlLFxyXG4gICAgICBzaG93UmVmZXJlbmNlSGVpZ2h0Q2hlY2tib3g6IGZhbHNlLFxyXG4gICAgICBzaG93U2thdGVyUGF0aENoZWNrYm94OiBmYWxzZSxcclxuICAgICAgc2hvd1N0aWNrVG9UcmFja0NoZWNrYm94OiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ8bnVsbH0gaWYgc3BlY2lmaWVkLCB0aGUgZGVzaXJlZCB3aWR0aCBmb3IgYWxsIGNoZWNrYm94ZXMgYW5kIGljb25zIHNvIHRoYXQgdGhlIGNvbnRyb2wgY2FuIGJlIGFsaWduZWRcclxuICAgICAgLy8gd2l0aCBvdGhlciBpdGVtcyBpbiBhIGNvbnRyb2wgcGFuZWwuIFRoaXMgd2lsbCBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgc3BhY2luZyBiZXR3ZWVuIHRoZSBsYWJlbCBhbmQgaWNvblxyXG4gICAgICAvLyBwb3J0aW9uIG9mIHRoZSBDaGVja294IGNvbnRlbnRcclxuICAgICAgY2hlY2tib3hXaWR0aDogbnVsbCxcclxuXHJcbiAgICAgIC8vIHsqfG51bGx9IG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIGVhY2ggRW5lcmd5U2thdGVQYXJrQ2hlY2tib3hJdGVtIGluIHRoaXMgZ3JvdXAgb2YgY29udHJvbHNcclxuICAgICAgaXRlbU9wdGlvbnM6IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FsaWduR3JvdXB9IC0gVXNlZCB0byBhbGlnbiBsYWJlbHMgYW5kIGljb25zIHNvIHRoYXQgZXZlcnkgYm94IGluIHRoZSBncm91cCBoYXMgdGhlIHNhbWUgZGltZW5zaW9uc1xyXG4gICAgdGhpcy50ZXh0QWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XHJcbiAgICB0aGlzLmljb25BbGlnbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q2hlY2tib3hDb250ZW50W119IC0gbGlzdCBvZiBjb250ZW50cyBjb250YWluaW5nIGljb24gbm9kZXMgYW5kIFByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG9cclxuICAgIC8vIGNyZWF0ZSBjaGVja2JveGVzXHJcbiAgICB0aGlzLmNoZWNrYm94Q29udGVudHMgPSBbXTtcclxuXHJcbiAgICAvLyB7RW5lcmd5U2thdGVQYXJrQ2hlY2tib3hJdGVtW119XHJcbiAgICBjb25zdCBjaGVja2JveEl0ZW1zID0gW107XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dQaWVDaGFydENoZWNrYm94ICkge1xyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IEVuZXJneVNrYXRlUGFya0NoZWNrYm94SXRlbS5jcmVhdGVQaWVDaGFydEljb24oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaWVDaGFydEljb24nICkgKTtcclxuICAgICAgdGhpcy5hZGRDaGVja2JveENvbnRlbnQoIHBpZUNoYXJ0U3RyaW5nLCBpY29uTm9kZSwgbW9kZWwucGllQ2hhcnRWaXNpYmxlUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaWVDaGFydENoZWNrYm94JyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dHcmlkQ2hlY2tib3ggKSB7XHJcbiAgICAgIGNvbnN0IGljb25Ob2RlID0gRW5lcmd5U2thdGVQYXJrQ2hlY2tib3hJdGVtLmNyZWF0ZUdyaWRJY29uKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JpZEljb24nICkgKTtcclxuICAgICAgdGhpcy5hZGRDaGVja2JveENvbnRlbnQoIGNvbnRyb2xzU2hvd0dyaWRTdHJpbmcsIGljb25Ob2RlLCBtb2RlbC5ncmlkVmlzaWJsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JpZENoZWNrYm94JyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dTcGVlZENoZWNrYm94ICkge1xyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IEVuZXJneVNrYXRlUGFya0NoZWNrYm94SXRlbS5jcmVhdGVTcGVlZG9tZXRlckljb24oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVlZEljb24nICkgKTtcclxuICAgICAgdGhpcy5hZGRDaGVja2JveENvbnRlbnQoIHByb3BlcnRpZXNTcGVlZFN0cmluZywgaWNvbk5vZGUsIG1vZGVsLnNwZWVkb21ldGVyVmlzaWJsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BlZWRDaGVja2JveCcgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5zaG93U2thdGVyUGF0aENoZWNrYm94ICkge1xyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IEVuZXJneVNrYXRlUGFya0NoZWNrYm94SXRlbS5jcmVhdGVTYW1wbGVzSWNvbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhdGhJY29uJyApICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hlY2tib3hDb250ZW50KCBjb250cm9sc1BhdGhTdHJpbmcsIGljb25Ob2RlLCBtb2RlbC5zYXZlU2FtcGxlc1Byb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGF0aENoZWNrYm94JyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dSZWZlcmVuY2VIZWlnaHRDaGVja2JveCApIHtcclxuICAgICAgY29uc3QgaWNvbk5vZGUgPSBFbmVyZ3lTa2F0ZVBhcmtDaGVja2JveEl0ZW0uY3JlYXRlUmVmZXJlbmNlSGVpZ2h0SWNvbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZmVyZW5jZUhlaWdodEljb24nICkgKTtcclxuICAgICAgdGhpcy5hZGRDaGVja2JveENvbnRlbnQoIGNvbnRyb2xzUmVmZXJlbmNlSGVpZ2h0U3RyaW5nLCBpY29uTm9kZSwgbW9kZWwucmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVmZXJlbmNlSGVpZ2h0Q2hlY2tib3gnICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1N0aWNrVG9UcmFja0NoZWNrYm94ICkge1xyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IEVuZXJneVNrYXRlUGFya0NoZWNrYm94SXRlbS5jcmVhdGVTdGlja2luZ1RvVHJhY2tJY29uKCk7XHJcblxyXG4gICAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IGNoZWNrYm94IHRoYXQgY29udHJvbHMgbW9kZWwgcGh5c2ljcywgaWYgaXQgZ2V0cyBjaGFuZ2VkXHJcbiAgICAgIC8vIGJ5IHRoZSB1c2VyIHdlIG1heSBuZWVkIHRvIGNsZWFyIHNhdmVkIGRhdGEgb3IgZG8gb3RoZXIgdGhpbmdzXHJcbiAgICAgIGNvbnN0IHVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBtb2RlbC51c2VyQ29udHJvbGxlZFByb3BlcnR5U2V0LnN0aWNraW5nVG9UcmFja0NvbnRyb2xsZWRQcm9wZXJ0eTtcclxuICAgICAgdGhpcy5hZGRDaGVja2JveENvbnRlbnQoIGNvbnRyb2xzU3RpY2tUb1RyYWNrU3RyaW5nLCBpY29uTm9kZSwgbW9kZWwuc3RpY2tpbmdUb1RyYWNrUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGlja2luZ0NoZWNrYm94JyApLCB7XHJcbiAgICAgICAgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogdXNlckNvbnRyb2xsZWRQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IHNwYWNpbmcgb2YgY29udGVudHMgZm9yIGxheW91dFxyXG4gICAgaWYgKCBvcHRpb25zLmNoZWNrYm94V2lkdGggKSB7XHJcbiAgICAgIHRoaXMuY2hlY2tib3hDb250ZW50cy5mb3JFYWNoKCBjb250ZW50ID0+IHtcclxuICAgICAgICBjb250ZW50LnNldENvbnRlbnRXaWR0aEZvckNoZWNrYm94KCBvcHRpb25zLmNoZWNrYm94V2lkdGggKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5pdGVtT3B0aW9ucyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5pdGVtT3B0aW9ucy5ib3hXaWR0aCA9PT0gdW5kZWZpbmVkLCAnRW5lcmd5U2thdGVQYXJrVmlzaWJpbGl0eUNvbnRyb2xzIHNldHMgYm94V2lkdGgnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuaXRlbU9wdGlvbnMuc3BhY2luZyA9PT0gdW5kZWZpbmVkLCAnRW5lcmd5U2thdGVQYXJrVmlzaWJpbGl0eUNvbnRyb2xzIHNldHMgc3BhY2luZycgKTtcclxuICAgIH1cclxuICAgIG9wdGlvbnMuaXRlbU9wdGlvbnMgPSBtZXJnZSgge30sIG9wdGlvbnMuaXRlbU9wdGlvbnMsIHtcclxuICAgICAgYm94V2lkdGg6IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5DSEVDS0JPWF9XSURUSCxcclxuICAgICAgc3BhY2luZzogQ0hFQ0tCT1hfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hlY2tib3hDb250ZW50cy5mb3JFYWNoKCBjb250ZW50ID0+IHtcclxuICAgICAgb3B0aW9ucy5pdGVtT3B0aW9ucyA9IG1lcmdlKCB7fSwgb3B0aW9ucy5pdGVtT3B0aW9ucywge1xyXG4gICAgICAgIHVzZXJDb250cm9sbGVkUHJvcGVydHk6IGNvbnRlbnQudXNlckNvbnRyb2xsZWRQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjaGVja2JveEl0ZW1zLnB1c2goIG5ldyBFbmVyZ3lTa2F0ZVBhcmtDaGVja2JveEl0ZW0oIGNvbnRlbnQucHJvcGVydHksIGNvbnRlbnQuY2hlY2tib3hJY29uLCBjb250ZW50LnRhbmRlbSwgb3B0aW9ucy5pdGVtT3B0aW9ucyApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoZWNrYm94SXRlbXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW5kIGFkZCB0byB0aGUgbGlzdCBvZiBjaGVja2JveCBjb250ZW50cy4gVGhlc2UgYXJlIGNyZWF0ZWQgZWFnZXJseSBzbyB0aGF0IGxheW91dCBjYW4gY29tcGxldGUgYmVmb3JlXHJcbiAgICogY3JlYXRpbmcgY2hlY2tib3hlcywgYXMgY2hlY2tib3hlcyBkbyBub3Qgc3VwcG9ydCBpY29ucyB3aXRoIHZhcmlhYmxlIGRpbWVuc2lvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsU3RyaW5nXHJcbiAgICogQHBhcmFtIHtOb2RlfSBpY29uTm9kZVxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBwcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgYWRkQ2hlY2tib3hDb250ZW50KCBsYWJlbFN0cmluZywgaWNvbk5vZGUsIHByb3BlcnR5LCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICB0aGlzLmNoZWNrYm94Q29udGVudHMucHVzaCggbmV3IENoZWNrYm94Q29udGVudCggbGFiZWxTdHJpbmcsIGljb25Ob2RlLCB0aGlzLnRleHRBbGlnbkdyb3VwLCB0aGlzLmljb25BbGlnbkdyb3VwLCBwcm9wZXJ0eSwgdGFuZGVtLCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbm5lciB0eXBlIHRoYXQgY29sbGVjdHMgdGhlIGNvbnRlbnRzIGZvciBhIGNoZWNrYm94LCBhbmQgYXNzaWducyBpY29ucyBhbmQgbGFiZWxzIHRvIGFsaWduIGdyb3VwcyBmb3IgbGF5b3V0LlxyXG4gKiBUaGlzIGlzIGRvbmUgQkVGT1JFIHBhc3NpbmcgY29udGVudCB0byBjaGVja2JveGVzIGFzIGNoZWNrYm94ZXMgZG8gbm90IHN1cHBvcnQgbGFiZWwgbm9kZXMgd2l0aCB2YXJ5aW5nIGRpbWVuc2lvbnMuXHJcbiAqL1xyXG5jbGFzcyBDaGVja2JveENvbnRlbnQge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxTdHJpbmdcclxuICAgKiBAcGFyYW0ge05vZGV9IGljb25Ob2RlXHJcbiAgICogQHBhcmFtIHtBbGlnbkdyb3VwfSB0ZXh0QWxpZ25Hcm91cFxyXG4gICAqIEBwYXJhbSB7QWxpZ25Hcm91cH0gaWNvbkFsaWduR3JvdXBcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX1wcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxhYmVsU3RyaW5nLCBpY29uTm9kZSwgdGV4dEFsaWduR3JvdXAsIGljb25BbGlnbkdyb3VwLCBwcm9wZXJ0eSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Qm9vbGVhblByb3BlcnR5fSAtIFByb3BlcnR5IGluZGljYXRpbmcgdGhhdCB0aGUgY2hlY2tib3ggUHJvcGVydHkgaGFzIGJlZW5cclxuICAgICAgLy8gY2hhbmdlZCBieSB0aGUgdXNlciAocmF0aGVyIHRoYW4gaW50ZXJuYWxseSBieSB0aGUgc2ltKSwgYWxsb3dpbmcgdXNcclxuICAgICAgLy8gdG8gZG8gZXh0cmEgd29yayBpZiB1c2VyIGNoYW5nZXMgZGlyZWN0bHlcclxuICAgICAgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogbnVsbFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgdGV4dCBhbmQgYXNzaWduIHRvIGFuIEFsaWduQm94XHJcbiAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHQoIGxhYmVsU3RyaW5nLCBtZXJnZSggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApIH0sIFRFWFRfT1BUSU9OUyApICk7XHJcbiAgICBjb25zdCB0ZXh0Qm94ID0gdGV4dEFsaWduR3JvdXAuY3JlYXRlQm94KCB0ZXh0LCB7IHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuXHJcbiAgICBjb25zdCBpY29uQm94ID0gaWNvbkFsaWduR3JvdXAuY3JlYXRlQm94KCBpY29uTm9kZSwgeyB4QWxpZ246ICdjZW50ZXInIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtIQm94fSAtIGNvbnRlbnRzIGZvciB0aGUgY2hlY2tib3hcclxuICAgIHRoaXMuY2hlY2tib3hJY29uID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGV4dEJveCwgaWNvbkJveCBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGFuZGVtID0gdGFuZGVtO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBQcm9wZXJ0eSBmb3IgdGhlIGNoZWNrYm94XHJcbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fVxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5ID0gb3B0aW9ucy51c2VyQ29udHJvbGxlZFByb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHdpZHRoIG9mIHRoZSBjb250ZW50IGJ5IG1vZGlmeWluZyBzcGFjaW5nIGJldHdlZW4gaXRlbXMuIEluY2x1ZGVzIHdpZHRoIG9mIHRoZSBjaGVja2JveCBhbmQgaXRzIHNwYWNpbmcgc29cclxuICAgKiB0aGF0IHdpZHRoIGNhbiBiZSBzcGVjaWZpZWQgd2hlbiBpdCBpcyB1c2VkIGFzIENoZWNrYm94IGNvbnRlbnQuIFRoaXMgbXVzdCBiZSBkb25lIEJFRk9SRSBjb250ZW50IGlzIHBhc3NlZCB0b1xyXG4gICAqIGEgQ2hlY2tib3ggYmVjYXVzZSBDaGVja2JveCBkb2VzIG5vdCBzdXBwb3J0IGNvbnRlbnQgd2l0aCB2YXJpYWJsZSBkaW1lbnNpb25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB3aWR0aFxyXG4gICAqL1xyXG4gIHNldENvbnRlbnRXaWR0aEZvckNoZWNrYm94KCB3aWR0aCApIHtcclxuICAgIHRoaXMuY2hlY2tib3hJY29uLnNwYWNpbmcgPSB0aGlzLmNoZWNrYm94SWNvbi5zcGFjaW5nICsgKCB3aWR0aCAtIHRoaXMuY2hlY2tib3hJY29uLndpZHRoICkgLSBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuQ0hFQ0tCT1hfV0lEVEggLSBDSEVDS0JPWF9TUEFDSU5HO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5U2thdGVQYXJrLnJlZ2lzdGVyKCAnRW5lcmd5U2thdGVQYXJrVmlzaWJpbGl0eUNvbnRyb2xzJywgRW5lcmd5U2thdGVQYXJrVmlzaWJpbGl0eUNvbnRyb2xzICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneVNrYXRlUGFya1Zpc2liaWxpdHlDb250cm9sczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQUNyRSxPQUFPQywyQkFBMkIsTUFBTSxrQ0FBa0M7QUFFMUUsTUFBTUMsa0JBQWtCLEdBQUdILHNCQUFzQixDQUFDSSxrQkFBa0IsQ0FBQ0Msa0JBQWtCO0FBQ3ZGLE1BQU1DLDZCQUE2QixHQUFHTixzQkFBc0IsQ0FBQ0ksa0JBQWtCLENBQUNHLDZCQUE2QjtBQUM3RyxNQUFNQyxzQkFBc0IsR0FBR1Isc0JBQXNCLENBQUNJLGtCQUFrQixDQUFDSyxrQkFBa0I7QUFDM0YsTUFBTUMsMEJBQTBCLEdBQUdWLHNCQUFzQixDQUFDVyxhQUFhLENBQUNDLDBCQUEwQjtBQUNsRyxNQUFNQyxjQUFjLEdBQUdiLHNCQUFzQixDQUFDYyxLQUFLLENBQUNDLFFBQVEsQ0FBQ0MsbUJBQW1CO0FBQ2hGLE1BQU1DLHFCQUFxQixHQUFHakIsc0JBQXNCLENBQUNJLGtCQUFrQixDQUFDYyxtQkFBbUI7O0FBRTNGO0FBQ0EsTUFBTUMsWUFBWSxHQUFHO0VBQ25CQyxJQUFJLEVBQUVuQix3QkFBd0IsQ0FBQ29CLG1CQUFtQjtFQUNsREMsUUFBUSxFQUFFO0FBQ1osQ0FBQztBQUVELE1BQU1DLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUU1QixNQUFNQyxpQ0FBaUMsU0FBUzFCLElBQUksQ0FBQztFQUVuRDtBQUNGO0FBQ0E7QUFDQTtBQUNB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