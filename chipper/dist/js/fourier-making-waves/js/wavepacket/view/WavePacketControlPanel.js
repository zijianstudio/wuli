// Copyright 2021-2023, University of Colorado Boulder

/**
 * WavePacketControlPanel is the control panel in the 'Wave Packet' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import { HBox, HSeparator, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWColors from '../../common/FMWColors.js';
import FMWConstants from '../../common/FMWConstants.js';
import DomainComboBox from '../../common/view/DomainComboBox.js';
import SeriesTypeRadioButtonGroup from '../../common/view/SeriesTypeRadioButtonGroup.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WavePacketModel from '../model/WavePacketModel.js';
import CenterControl from './CenterControl.js';
import ComponentSpacingControl from './ComponentSpacingControl.js';
import ComponentSpacingToolCheckbox from './ComponentSpacingToolCheckbox.js';
import ConjugateStandardDeviationControl from './ConjugateStandardDeviationControl.js';
import LengthToolCheckbox from './LengthToolCheckbox.js';
import StandardDeviationControl from './StandardDeviationControl.js';
import WavePacketInfoDialog from './WavePacketInfoDialog.js';
import WidthIndicatorsCheckbox from './WidthIndicatorsCheckbox.js';

// constants
const VERTICAL_SPACING = 7;
export default class WavePacketControlPanel extends Panel {
  /**
   * @param {WavePacketModel} model
   * @param {Property.<boolean>} componentSpacingToolVisibleProperty
   * @param {Property.<boolean>} lengthToolVisibleProperty
   * @param {Node} popupParent
   * @param {Object} [options]
   */
  constructor(model, componentSpacingToolVisibleProperty, lengthToolVisibleProperty, popupParent, options) {
    assert && assert(model instanceof WavePacketModel);
    assert && AssertUtils.assertPropertyOf(componentSpacingToolVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(lengthToolVisibleProperty, 'boolean');
    assert && assert(popupParent instanceof Node);
    options = merge({}, FMWConstants.PANEL_OPTIONS, {
      yMargin: 5,
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);
    const componentSpacingSubpanel = new ComponentSpacingSubpanel(model.domainProperty, model.wavePacket.componentSpacingProperty, componentSpacingToolVisibleProperty, lengthToolVisibleProperty, {
      spacing: VERTICAL_SPACING,
      tandem: options.tandem.createTandem('componentSpacingSubpanel')
    });
    const sectionNodes = [
    // Fourier Series
    componentSpacingSubpanel,
    // Wave Packet - Center
    new WavePacketCenterSubpanel(model.domainProperty, model.wavePacket.centerProperty, {
      spacing: VERTICAL_SPACING,
      tandem: options.tandem.createTandem('wavePacketCenterSubpanel')
    }),
    // Wave Packet - Width
    new WavePacketWidthSubpanel(model.domainProperty, model.wavePacket.standardDeviationProperty, model.wavePacket.conjugateStandardDeviationProperty, model.widthIndicatorsVisibleProperty, {
      spacing: VERTICAL_SPACING,
      tandem: options.tandem.createTandem('wavePacketWidthSubpanel')
    }),
    // Graph Controls
    new GraphControlsSubpanel(model.domainProperty, model.seriesTypeProperty, popupParent, {
      spacing: VERTICAL_SPACING,
      tandem: options.tandem.createTandem('graphControlsSubpanel')
    })];

    // Put a separator between each logical section.
    const children = [];
    for (let i = 0; i < sectionNodes.length; i++) {
      children.push(sectionNodes[i]);
      if (i < sectionNodes.length - 1) {
        children.push(new HSeparator({
          stroke: FMWColors.separatorStrokeProperty
        }));
      }
    }
    const vBox = new VBox(merge({}, FMWConstants.VBOX_OPTIONS, {
      children: children,
      spacing: 10
    }));

    // Dialog that displays a key for math symbols. Created eagerly and reused for PhET-iO.
    const infoDialog = new WavePacketInfoDialog({
      tandem: options.tandem.createTandem('infoDialog')
    });

    // Button to open the dialog.
    const infoButton = new InfoButton({
      listener: () => infoDialog.show(),
      iconFill: 'rgb( 50, 145, 184 )',
      scale: 0.4,
      touchAreaDilation: 15,
      tandem: options.tandem.createTandem('infoButton')
    });
    const content = new Node({
      children: [vBox, infoButton]
    });

    // InfoButton at upper-right of control panel, vertically centered on title.
    infoButton.right = vBox.right;
    infoButton.centerY = componentSpacingSubpanel.componentSpacingText.boundsTo(vBox).centerY;
    super(content, options);

    // pdom - traversal order
    // See https://github.com/phetsims/fourier-making-waves/issues/53
    this.pdomOrder = [infoButton, vBox];
  }
}

/**
 * ComponentSpacingSubpanel is the 'Fourier Component Spacing' section of this control panel.
 */
class ComponentSpacingSubpanel extends VBox {
  /**
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Property} componentSpacingProperty
   * @param {Property.<boolean>} componentSpacingToolVisibleProperty
   * @param {Property.<boolean>} lengthToolVisibleProperty
   * @param {Object} [options]
   */
  constructor(domainProperty, componentSpacingProperty, componentSpacingToolVisibleProperty, lengthToolVisibleProperty, options) {
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && AssertUtils.assertPropertyOf(componentSpacingProperty, 'number');
    assert && AssertUtils.assertPropertyOf(componentSpacingToolVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(lengthToolVisibleProperty, 'boolean');
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // VBox options
      spacing: 8,
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Title for this subpanel
    const componentSpacingText = new Text(FourierMakingWavesStrings.componentSpacingStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 160,
      // determined empirically
      tandem: options.tandem.createTandem('componentSpacingText')
    });
    const componentSpacingControl = new ComponentSpacingControl(componentSpacingProperty, domainProperty, {
      sliderOptions: {
        // Default pointer areas for slider and checkboxes overlap. We can't eliminate this overlap because we can't
        // afford to add vertical space. So do our best to mitigate the issue by shrinking the slider's touchArea.
        // It would be nicer if we could shift the slider's touchArea up, but that isn't supported by the Slider API.
        // See https://github.com/phetsims/fourier-making-waves/issues/196
        thumbTouchAreaYDilation: 5
      },
      tandem: options.tandem.createTandem('componentSpacingControl')
    });
    const componentSpacingToolCheckbox = new ComponentSpacingToolCheckbox(componentSpacingToolVisibleProperty, domainProperty, {
      tandem: options.tandem.createTandem('componentSpacingToolCheckbox')
    });

    // Checkbox for Length tool
    const lengthToolCheckbox = new LengthToolCheckbox(lengthToolVisibleProperty, domainProperty, {
      tandem: options.tandem.createTandem('lengthToolCheckbox')
    });

    // Default point areas for the slider and checkboxes overlap. We can't eliminate this overlap because we can't
    // afford to add vertical space. So do our best to mitigate the issue by shifting checkbox touchAreas down.
    // See https://github.com/phetsims/fourier-making-waves/issues/196
    lengthToolCheckbox.touchArea = lengthToolCheckbox.localBounds.dilatedXY(6, 4).shiftedY(2);
    componentSpacingToolCheckbox.touchArea = componentSpacingToolCheckbox.localBounds.dilatedXY(6, 4).shiftedY(2);
    assert && assert(!options.children, 'ComponentSpacingSubpanel sets children');
    options.children = [componentSpacingText, componentSpacingControl, new HBox({
      children: [componentSpacingToolCheckbox, lengthToolCheckbox],
      spacing: 25
    })];
    super(options);

    // @public for layout
    this.componentSpacingText = componentSpacingText;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * WavePacketCenterSubpanel is the 'Wave Packet - Center' section of this control panel.
 */
class WavePacketCenterSubpanel extends VBox {
  /**
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {NumberProperty} centerProperty
   * @param {Object} [options]
   */
  constructor(domainProperty, centerProperty, options) {
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(centerProperty instanceof NumberProperty);
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    /// Title for this subpanel
    const wavePacketCenterText = new Text(FourierMakingWavesStrings.wavePacketCenterStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 180,
      // determined empirically
      tandem: options.tandem.createTandem('wavePacketCenterText')
    });
    const centerControl = new CenterControl(centerProperty, domainProperty, {
      tandem: options.tandem.createTandem('centerControl')
    });
    assert && assert(!options.children, 'WavePacketCenterSubpanel sets children');
    options.children = [wavePacketCenterText, centerControl];
    super(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * WavePacketWidthSubpanel is the 'Wave Packet - Width' section of this control panel.
 */
class WavePacketWidthSubpanel extends VBox {
  /**
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {NumberProperty} standardDeviationProperty
   * @param {NumberProperty} conjugateStandardDeviationProperty
   * @param {Property.<boolean>} widthIndicatorsVisibleProperty
   * @param {Object} [options]
   */
  constructor(domainProperty, standardDeviationProperty, conjugateStandardDeviationProperty, widthIndicatorsVisibleProperty, options) {
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(standardDeviationProperty instanceof NumberProperty);
    assert && assert(conjugateStandardDeviationProperty instanceof NumberProperty);
    assert && AssertUtils.assertPropertyOf(widthIndicatorsVisibleProperty, 'boolean');
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Title for this subpanel
    const wavePacketWidthText = new Text(FourierMakingWavesStrings.wavePacketWidthStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 180,
      // determined empirically
      tandem: options.tandem.createTandem('wavePacketWidthText')
    });
    const standardDeviationControl = new StandardDeviationControl(standardDeviationProperty, domainProperty, {
      tandem: options.tandem.createTandem('standardDeviationControl')
    });
    const conjugateStandardDeviationControl = new ConjugateStandardDeviationControl(conjugateStandardDeviationProperty, domainProperty, {
      sliderOptions: {
        // Default pointer areas for widthIndicatorsCheckbox and standardDeviationControl.slider overlap.
        // We can't eliminate this overlap because we can't afford to add vertical space. So do our best to mitigate
        // the issue by shrinking the slider's touchArea. It would be nicer if we could shift the slider's touchArea
        // up, but that isn't supported by the Slider API.
        // See https://github.com/phetsims/fourier-making-waves/issues/124#issuecomment-897229707
        thumbTouchAreaYDilation: 5
      },
      tandem: options.tandem.createTandem('conjugateStandardDeviationControl')
    });

    // Interaction with these 2 controls is mutually-exclusive, because they both change standardDeviation.
    standardDeviationControl.isPressedProperty.link(isPressed => {
      isPressed && conjugateStandardDeviationControl.interruptSubtreeInput();
    });
    conjugateStandardDeviationControl.isPressedProperty.link(isPressed => {
      isPressed && standardDeviationControl.interruptSubtreeInput();
    });
    const widthIndicatorsCheckbox = new WidthIndicatorsCheckbox(widthIndicatorsVisibleProperty, {
      tandem: options.tandem.createTandem('widthIndicatorsCheckbox')
    });

    // Default pointer areas for widthIndicatorsCheckbox and standardDeviationControl.slider overlap. We can't
    // eliminate this overlap because we can't afford to add vertical space. So do our best to mitigate the issue
    // by shifting widthIndicatorsCheckbox's touchArea down.
    // See https://github.com/phetsims/fourier-making-waves/issues/124#issuecomment-897229707
    widthIndicatorsCheckbox.touchArea = widthIndicatorsCheckbox.localBounds.dilatedXY(6, 4).shiftedY(2);
    assert && assert(!options.children, 'WavePacketWidthSubpanel sets children');
    options.children = [wavePacketWidthText, standardDeviationControl, conjugateStandardDeviationControl, widthIndicatorsCheckbox];
    super(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * GraphControlsSubpanel is the 'Graph Controls' section of this control panel.
 */
class GraphControlsSubpanel extends VBox {
  /**
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {EnumerationDeprecatedProperty.<SeriesType>} seriesTypeProperty
   * @param {Node} popupParent
   * @param {Object} [options]
   */
  constructor(domainProperty, seriesTypeProperty, popupParent, options) {
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(seriesTypeProperty instanceof EnumerationProperty);
    assert && assert(popupParent instanceof Node);
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Title for this subpanel
    const graphControlsText = new Text(FourierMakingWavesStrings.graphControlsStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 200,
      // determined empirically
      tandem: options.tandem.createTandem('graphControlsText')
    });

    // Function of:
    const functionOfText = new Text(FourierMakingWavesStrings.functionOfStringProperty, {
      font: FMWConstants.CONTROL_FONT,
      maxWidth: 70,
      // determined empirically
      tandem: options.tandem.createTandem('functionOfText')
    });
    const domainComboBox = new DomainComboBox(domainProperty, popupParent, options.tandem.createTandem('functionOfComboBox') // tandem name differs by request
    );

    const functionOfBox = new HBox({
      spacing: 5,
      children: [functionOfText, domainComboBox]
    });

    // Series:
    const seriesText = new Text(FourierMakingWavesStrings.seriesStringProperty, {
      font: FMWConstants.CONTROL_FONT,
      maxWidth: 70,
      // determined empirically
      tandem: options.tandem.createTandem('seriesText')
    });
    const seriesTypeRadioButtonGroup = new SeriesTypeRadioButtonGroup(seriesTypeProperty, {
      tandem: options.tandem.createTandem('seriesRadioButtonGroup') // tandem name differs by request
    });

    const seriesBox = new HBox({
      spacing: 10,
      children: [seriesText, seriesTypeRadioButtonGroup]
    });
    assert && assert(!options.children, 'GraphControlsSubpanel sets children');
    options.children = [graphControlsText, functionOfBox, seriesBox];
    super(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
fourierMakingWaves.register('WavePacketControlPanel', WavePacketControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJtZXJnZSIsIkFzc2VydFV0aWxzIiwiSW5mb0J1dHRvbiIsIkhCb3giLCJIU2VwYXJhdG9yIiwiTm9kZSIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJUYW5kZW0iLCJGTVdDb2xvcnMiLCJGTVdDb25zdGFudHMiLCJEb21haW5Db21ib0JveCIsIlNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwIiwiZm91cmllck1ha2luZ1dhdmVzIiwiRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyIsIldhdmVQYWNrZXRNb2RlbCIsIkNlbnRlckNvbnRyb2wiLCJDb21wb25lbnRTcGFjaW5nQ29udHJvbCIsIkNvbXBvbmVudFNwYWNpbmdUb29sQ2hlY2tib3giLCJDb25qdWdhdGVTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wiLCJMZW5ndGhUb29sQ2hlY2tib3giLCJTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wiLCJXYXZlUGFja2V0SW5mb0RpYWxvZyIsIldpZHRoSW5kaWNhdG9yc0NoZWNrYm94IiwiVkVSVElDQUxfU1BBQ0lORyIsIldhdmVQYWNrZXRDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiY29tcG9uZW50U3BhY2luZ1Rvb2xWaXNpYmxlUHJvcGVydHkiLCJsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5IiwicG9wdXBQYXJlbnQiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYXNzZXJ0UHJvcGVydHlPZiIsIlBBTkVMX09QVElPTlMiLCJ5TWFyZ2luIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJjb21wb25lbnRTcGFjaW5nU3VicGFuZWwiLCJDb21wb25lbnRTcGFjaW5nU3VicGFuZWwiLCJkb21haW5Qcm9wZXJ0eSIsIndhdmVQYWNrZXQiLCJjb21wb25lbnRTcGFjaW5nUHJvcGVydHkiLCJzcGFjaW5nIiwiY3JlYXRlVGFuZGVtIiwic2VjdGlvbk5vZGVzIiwiV2F2ZVBhY2tldENlbnRlclN1YnBhbmVsIiwiY2VudGVyUHJvcGVydHkiLCJXYXZlUGFja2V0V2lkdGhTdWJwYW5lbCIsInN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkiLCJjb25qdWdhdGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5Iiwid2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5IiwiR3JhcGhDb250cm9sc1N1YnBhbmVsIiwic2VyaWVzVHlwZVByb3BlcnR5IiwiY2hpbGRyZW4iLCJpIiwibGVuZ3RoIiwicHVzaCIsInN0cm9rZSIsInNlcGFyYXRvclN0cm9rZVByb3BlcnR5IiwidkJveCIsIlZCT1hfT1BUSU9OUyIsImluZm9EaWFsb2ciLCJpbmZvQnV0dG9uIiwibGlzdGVuZXIiLCJzaG93IiwiaWNvbkZpbGwiLCJzY2FsZSIsInRvdWNoQXJlYURpbGF0aW9uIiwiY29udGVudCIsInJpZ2h0IiwiY2VudGVyWSIsImNvbXBvbmVudFNwYWNpbmdUZXh0IiwiYm91bmRzVG8iLCJwZG9tT3JkZXIiLCJjb21wb25lbnRTcGFjaW5nU3RyaW5nUHJvcGVydHkiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwiY29tcG9uZW50U3BhY2luZ0NvbnRyb2wiLCJzbGlkZXJPcHRpb25zIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJjb21wb25lbnRTcGFjaW5nVG9vbENoZWNrYm94IiwibGVuZ3RoVG9vbENoZWNrYm94IiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJzaGlmdGVkWSIsImRpc3Bvc2UiLCJ3YXZlUGFja2V0Q2VudGVyVGV4dCIsIndhdmVQYWNrZXRDZW50ZXJTdHJpbmdQcm9wZXJ0eSIsImNlbnRlckNvbnRyb2wiLCJ3YXZlUGFja2V0V2lkdGhUZXh0Iiwid2F2ZVBhY2tldFdpZHRoU3RyaW5nUHJvcGVydHkiLCJzdGFuZGFyZERldmlhdGlvbkNvbnRyb2wiLCJjb25qdWdhdGVTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wiLCJpc1ByZXNzZWRQcm9wZXJ0eSIsImxpbmsiLCJpc1ByZXNzZWQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJ3aWR0aEluZGljYXRvcnNDaGVja2JveCIsImdyYXBoQ29udHJvbHNUZXh0IiwiZ3JhcGhDb250cm9sc1N0cmluZ1Byb3BlcnR5IiwiZnVuY3Rpb25PZlRleHQiLCJmdW5jdGlvbk9mU3RyaW5nUHJvcGVydHkiLCJDT05UUk9MX0ZPTlQiLCJkb21haW5Db21ib0JveCIsImZ1bmN0aW9uT2ZCb3giLCJzZXJpZXNUZXh0Iiwic2VyaWVzU3RyaW5nUHJvcGVydHkiLCJzZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCIsInNlcmllc0JveCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZVBhY2tldENvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBXYXZlUGFja2V0Q29udHJvbFBhbmVsIGlzIHRoZSBjb250cm9sIHBhbmVsIGluIHRoZSAnV2F2ZSBQYWNrZXQnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBJbmZvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0luZm9CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBIQm94LCBIU2VwYXJhdG9yLCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbG9ycy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEb21haW5Db21ib0JveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Eb21haW5Db21ib0JveC5qcyc7XHJcbmltcG9ydCBTZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBXYXZlUGFja2V0TW9kZWwgZnJvbSAnLi4vbW9kZWwvV2F2ZVBhY2tldE1vZGVsLmpzJztcclxuaW1wb3J0IENlbnRlckNvbnRyb2wgZnJvbSAnLi9DZW50ZXJDb250cm9sLmpzJztcclxuaW1wb3J0IENvbXBvbmVudFNwYWNpbmdDb250cm9sIGZyb20gJy4vQ29tcG9uZW50U3BhY2luZ0NvbnRyb2wuanMnO1xyXG5pbXBvcnQgQ29tcG9uZW50U3BhY2luZ1Rvb2xDaGVja2JveCBmcm9tICcuL0NvbXBvbmVudFNwYWNpbmdUb29sQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgQ29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Db250cm9sIGZyb20gJy4vQ29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Db250cm9sLmpzJztcclxuaW1wb3J0IExlbmd0aFRvb2xDaGVja2JveCBmcm9tICcuL0xlbmd0aFRvb2xDaGVja2JveC5qcyc7XHJcbmltcG9ydCBTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wgZnJvbSAnLi9TdGFuZGFyZERldmlhdGlvbkNvbnRyb2wuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldEluZm9EaWFsb2cgZnJvbSAnLi9XYXZlUGFja2V0SW5mb0RpYWxvZy5qcyc7XHJcbmltcG9ydCBXaWR0aEluZGljYXRvcnNDaGVja2JveCBmcm9tICcuL1dpZHRoSW5kaWNhdG9yc0NoZWNrYm94LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBWRVJUSUNBTF9TUEFDSU5HID0gNztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVQYWNrZXRDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7V2F2ZVBhY2tldE1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBjb21wb25lbnRTcGFjaW5nVG9vbFZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOb2RlfSBwb3B1cFBhcmVudFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5LCBsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5LCBwb3B1cFBhcmVudCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCBpbnN0YW5jZW9mIFdhdmVQYWNrZXRNb2RlbCApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvcHVwUGFyZW50IGluc3RhbmNlb2YgTm9kZSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZNV0NvbnN0YW50cy5QQU5FTF9PUFRJT05TLCB7XHJcblxyXG4gICAgICB5TWFyZ2luOiA1LFxyXG5cclxuICAgICAgLy8gcGhldC1pbyBvcHRpb25zXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1N1YnBhbmVsID0gbmV3IENvbXBvbmVudFNwYWNpbmdTdWJwYW5lbCggbW9kZWwuZG9tYWluUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLndhdmVQYWNrZXQuY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5LCBjb21wb25lbnRTcGFjaW5nVG9vbFZpc2libGVQcm9wZXJ0eSwgbGVuZ3RoVG9vbFZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICAgIHNwYWNpbmc6IFZFUlRJQ0FMX1NQQUNJTkcsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb25lbnRTcGFjaW5nU3VicGFuZWwnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlY3Rpb25Ob2RlcyA9IFtcclxuXHJcbiAgICAgIC8vIEZvdXJpZXIgU2VyaWVzXHJcbiAgICAgIGNvbXBvbmVudFNwYWNpbmdTdWJwYW5lbCxcclxuXHJcbiAgICAgIC8vIFdhdmUgUGFja2V0IC0gQ2VudGVyXHJcbiAgICAgIG5ldyBXYXZlUGFja2V0Q2VudGVyU3VicGFuZWwoIG1vZGVsLmRvbWFpblByb3BlcnR5LCBtb2RlbC53YXZlUGFja2V0LmNlbnRlclByb3BlcnR5LCB7XHJcbiAgICAgICAgc3BhY2luZzogVkVSVElDQUxfU1BBQ0lORyxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVQYWNrZXRDZW50ZXJTdWJwYW5lbCcgKVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBXYXZlIFBhY2tldCAtIFdpZHRoXHJcbiAgICAgIG5ldyBXYXZlUGFja2V0V2lkdGhTdWJwYW5lbCggbW9kZWwuZG9tYWluUHJvcGVydHksIG1vZGVsLndhdmVQYWNrZXQuc3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC53YXZlUGFja2V0LmNvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksIG1vZGVsLndpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgc3BhY2luZzogVkVSVElDQUxfU1BBQ0lORyxcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2F2ZVBhY2tldFdpZHRoU3VicGFuZWwnIClcclxuICAgICAgICB9ICksXHJcblxyXG4gICAgICAvLyBHcmFwaCBDb250cm9sc1xyXG4gICAgICBuZXcgR3JhcGhDb250cm9sc1N1YnBhbmVsKCBtb2RlbC5kb21haW5Qcm9wZXJ0eSwgbW9kZWwuc2VyaWVzVHlwZVByb3BlcnR5LCBwb3B1cFBhcmVudCwge1xyXG4gICAgICAgIHNwYWNpbmc6IFZFUlRJQ0FMX1NQQUNJTkcsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFwaENvbnRyb2xzU3VicGFuZWwnIClcclxuICAgICAgfSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFB1dCBhIHNlcGFyYXRvciBiZXR3ZWVuIGVhY2ggbG9naWNhbCBzZWN0aW9uLlxyXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNlY3Rpb25Ob2Rlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY2hpbGRyZW4ucHVzaCggc2VjdGlvbk5vZGVzWyBpIF0gKTtcclxuICAgICAgaWYgKCBpIDwgc2VjdGlvbk5vZGVzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IEhTZXBhcmF0b3IoIHtcclxuICAgICAgICAgIHN0cm9rZTogRk1XQ29sb3JzLnNlcGFyYXRvclN0cm9rZVByb3BlcnR5XHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2Qm94ID0gbmV3IFZCb3goIG1lcmdlKCB7fSwgRk1XQ29uc3RhbnRzLlZCT1hfT1BUSU9OUywge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgIHNwYWNpbmc6IDEwXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBEaWFsb2cgdGhhdCBkaXNwbGF5cyBhIGtleSBmb3IgbWF0aCBzeW1ib2xzLiBDcmVhdGVkIGVhZ2VybHkgYW5kIHJldXNlZCBmb3IgUGhFVC1pTy5cclxuICAgIGNvbnN0IGluZm9EaWFsb2cgPSBuZXcgV2F2ZVBhY2tldEluZm9EaWFsb2coIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmZvRGlhbG9nJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQnV0dG9uIHRvIG9wZW4gdGhlIGRpYWxvZy5cclxuICAgIGNvbnN0IGluZm9CdXR0b24gPSBuZXcgSW5mb0J1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gaW5mb0RpYWxvZy5zaG93KCksXHJcbiAgICAgIGljb25GaWxsOiAncmdiKCA1MCwgMTQ1LCAxODQgKScsXHJcbiAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiAxNSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmZvQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHZCb3gsIGluZm9CdXR0b24gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEluZm9CdXR0b24gYXQgdXBwZXItcmlnaHQgb2YgY29udHJvbCBwYW5lbCwgdmVydGljYWxseSBjZW50ZXJlZCBvbiB0aXRsZS5cclxuICAgIGluZm9CdXR0b24ucmlnaHQgPSB2Qm94LnJpZ2h0O1xyXG4gICAgaW5mb0J1dHRvbi5jZW50ZXJZID0gY29tcG9uZW50U3BhY2luZ1N1YnBhbmVsLmNvbXBvbmVudFNwYWNpbmdUZXh0LmJvdW5kc1RvKCB2Qm94ICkuY2VudGVyWTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHBkb20gLSB0cmF2ZXJzYWwgb3JkZXJcclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm91cmllci1tYWtpbmctd2F2ZXMvaXNzdWVzLzUzXHJcbiAgICB0aGlzLnBkb21PcmRlciA9IFtcclxuICAgICAgaW5mb0J1dHRvbixcclxuICAgICAgdkJveFxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb21wb25lbnRTcGFjaW5nU3VicGFuZWwgaXMgdGhlICdGb3VyaWVyIENvbXBvbmVudCBTcGFjaW5nJyBzZWN0aW9uIG9mIHRoaXMgY29udHJvbCBwYW5lbC5cclxuICovXHJcbmNsYXNzIENvbXBvbmVudFNwYWNpbmdTdWJwYW5lbCBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPERvbWFpbj59IGRvbWFpblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGxlbmd0aFRvb2xWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRvbWFpblByb3BlcnR5LCBjb21wb25lbnRTcGFjaW5nUHJvcGVydHksIGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5LCBsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbWFpblByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eSwgJ251bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBjb21wb25lbnRTcGFjaW5nVG9vbFZpc2libGVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggbGVuZ3RoVG9vbFZpc2libGVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgRk1XQ29uc3RhbnRzLlZCT1hfT1BUSU9OUywge1xyXG5cclxuICAgICAgLy8gVkJveCBvcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDgsXHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5jb21wb25lbnRTcGFjaW5nU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAxNjAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb25lbnRTcGFjaW5nVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbXBvbmVudFNwYWNpbmdDb250cm9sID0gbmV3IENvbXBvbmVudFNwYWNpbmdDb250cm9sKCBjb21wb25lbnRTcGFjaW5nUHJvcGVydHksIGRvbWFpblByb3BlcnR5LCB7XHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCBwb2ludGVyIGFyZWFzIGZvciBzbGlkZXIgYW5kIGNoZWNrYm94ZXMgb3ZlcmxhcC4gV2UgY2FuJ3QgZWxpbWluYXRlIHRoaXMgb3ZlcmxhcCBiZWNhdXNlIHdlIGNhbid0XHJcbiAgICAgICAgLy8gYWZmb3JkIHRvIGFkZCB2ZXJ0aWNhbCBzcGFjZS4gU28gZG8gb3VyIGJlc3QgdG8gbWl0aWdhdGUgdGhlIGlzc3VlIGJ5IHNocmlua2luZyB0aGUgc2xpZGVyJ3MgdG91Y2hBcmVhLlxyXG4gICAgICAgIC8vIEl0IHdvdWxkIGJlIG5pY2VyIGlmIHdlIGNvdWxkIHNoaWZ0IHRoZSBzbGlkZXIncyB0b3VjaEFyZWEgdXAsIGJ1dCB0aGF0IGlzbid0IHN1cHBvcnRlZCBieSB0aGUgU2xpZGVyIEFQSS5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xOTZcclxuICAgICAgICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbjogNVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbXBvbmVudFNwYWNpbmdDb250cm9sJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1Rvb2xDaGVja2JveCA9IG5ldyBDb21wb25lbnRTcGFjaW5nVG9vbENoZWNrYm94KCBjb21wb25lbnRTcGFjaW5nVG9vbFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgZG9tYWluUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbXBvbmVudFNwYWNpbmdUb29sQ2hlY2tib3gnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIENoZWNrYm94IGZvciBMZW5ndGggdG9vbFxyXG4gICAgY29uc3QgbGVuZ3RoVG9vbENoZWNrYm94ID0gbmV3IExlbmd0aFRvb2xDaGVja2JveCggbGVuZ3RoVG9vbFZpc2libGVQcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZW5ndGhUb29sQ2hlY2tib3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEZWZhdWx0IHBvaW50IGFyZWFzIGZvciB0aGUgc2xpZGVyIGFuZCBjaGVja2JveGVzIG92ZXJsYXAuIFdlIGNhbid0IGVsaW1pbmF0ZSB0aGlzIG92ZXJsYXAgYmVjYXVzZSB3ZSBjYW4ndFxyXG4gICAgLy8gYWZmb3JkIHRvIGFkZCB2ZXJ0aWNhbCBzcGFjZS4gU28gZG8gb3VyIGJlc3QgdG8gbWl0aWdhdGUgdGhlIGlzc3VlIGJ5IHNoaWZ0aW5nIGNoZWNrYm94IHRvdWNoQXJlYXMgZG93bi5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm91cmllci1tYWtpbmctd2F2ZXMvaXNzdWVzLzE5NlxyXG4gICAgbGVuZ3RoVG9vbENoZWNrYm94LnRvdWNoQXJlYSA9IGxlbmd0aFRvb2xDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDYsIDQgKS5zaGlmdGVkWSggMiApO1xyXG4gICAgY29tcG9uZW50U3BhY2luZ1Rvb2xDaGVja2JveC50b3VjaEFyZWEgPSBjb21wb25lbnRTcGFjaW5nVG9vbENoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggNiwgNCApLnNoaWZ0ZWRZKCAyICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdDb21wb25lbnRTcGFjaW5nU3VicGFuZWwgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIGNvbXBvbmVudFNwYWNpbmdUZXh0LFxyXG4gICAgICBjb21wb25lbnRTcGFjaW5nQ29udHJvbCxcclxuICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBjb21wb25lbnRTcGFjaW5nVG9vbENoZWNrYm94LCBsZW5ndGhUb29sQ2hlY2tib3ggXSxcclxuICAgICAgICBzcGFjaW5nOiAyNVxyXG4gICAgICB9IClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGZvciBsYXlvdXRcclxuICAgIHRoaXMuY29tcG9uZW50U3BhY2luZ1RleHQgPSBjb21wb25lbnRTcGFjaW5nVGV4dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogV2F2ZVBhY2tldENlbnRlclN1YnBhbmVsIGlzIHRoZSAnV2F2ZSBQYWNrZXQgLSBDZW50ZXInIHNlY3Rpb24gb2YgdGhpcyBjb250cm9sIHBhbmVsLlxyXG4gKi9cclxuY2xhc3MgV2F2ZVBhY2tldENlbnRlclN1YnBhbmVsIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge051bWJlclByb3BlcnR5fSBjZW50ZXJQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG9tYWluUHJvcGVydHksIGNlbnRlclByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbWFpblByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VudGVyUHJvcGVydHkgaW5zdGFuY2VvZiBOdW1iZXJQcm9wZXJ0eSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZNV0NvbnN0YW50cy5WQk9YX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gb3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3Qgd2F2ZVBhY2tldENlbnRlclRleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy53YXZlUGFja2V0Q2VudGVyU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAxODAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3YXZlUGFja2V0Q2VudGVyVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNlbnRlckNvbnRyb2wgPSBuZXcgQ2VudGVyQ29udHJvbCggY2VudGVyUHJvcGVydHksIGRvbWFpblByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2VudGVyQ29udHJvbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnV2F2ZVBhY2tldENlbnRlclN1YnBhbmVsIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICB3YXZlUGFja2V0Q2VudGVyVGV4dCxcclxuICAgICAgY2VudGVyQ29udHJvbFxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXYXZlUGFja2V0V2lkdGhTdWJwYW5lbCBpcyB0aGUgJ1dhdmUgUGFja2V0IC0gV2lkdGgnIHNlY3Rpb24gb2YgdGhpcyBjb250cm9sIHBhbmVsLlxyXG4gKi9cclxuY2xhc3MgV2F2ZVBhY2tldFdpZHRoU3VicGFuZWwgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxEb21haW4+fSBkb21haW5Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IHN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge051bWJlclByb3BlcnR5fSBjb25qdWdhdGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHdpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG9tYWluUHJvcGVydHksIHN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksIGNvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksIHdpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21haW5Qcm9wZXJ0eSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uUHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkgaW5zdGFuY2VvZiBOdW1iZXJQcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSBpbnN0YW5jZW9mIE51bWJlclByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggd2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuVkJPWF9PUFRJT05TLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3Qgd2F2ZVBhY2tldFdpZHRoVGV4dCA9IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLndhdmVQYWNrZXRXaWR0aFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTgwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2F2ZVBhY2tldFdpZHRoVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbCA9IG5ldyBTdGFuZGFyZERldmlhdGlvbkNvbnRyb2woIHN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksIGRvbWFpblByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhbmRhcmREZXZpYXRpb25Db250cm9sJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Db250cm9sID1cclxuICAgICAgbmV3IENvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbCggY29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksIHtcclxuICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgLy8gRGVmYXVsdCBwb2ludGVyIGFyZWFzIGZvciB3aWR0aEluZGljYXRvcnNDaGVja2JveCBhbmQgc3RhbmRhcmREZXZpYXRpb25Db250cm9sLnNsaWRlciBvdmVybGFwLlxyXG4gICAgICAgICAgLy8gV2UgY2FuJ3QgZWxpbWluYXRlIHRoaXMgb3ZlcmxhcCBiZWNhdXNlIHdlIGNhbid0IGFmZm9yZCB0byBhZGQgdmVydGljYWwgc3BhY2UuIFNvIGRvIG91ciBiZXN0IHRvIG1pdGlnYXRlXHJcbiAgICAgICAgICAvLyB0aGUgaXNzdWUgYnkgc2hyaW5raW5nIHRoZSBzbGlkZXIncyB0b3VjaEFyZWEuIEl0IHdvdWxkIGJlIG5pY2VyIGlmIHdlIGNvdWxkIHNoaWZ0IHRoZSBzbGlkZXIncyB0b3VjaEFyZWFcclxuICAgICAgICAgIC8vIHVwLCBidXQgdGhhdCBpc24ndCBzdXBwb3J0ZWQgYnkgdGhlIFNsaWRlciBBUEkuXHJcbiAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xMjQjaXNzdWVjb21tZW50LTg5NzIyOTcwN1xyXG4gICAgICAgICAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb246IDVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uanVnYXRlU3RhbmRhcmREZXZpYXRpb25Db250cm9sJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBJbnRlcmFjdGlvbiB3aXRoIHRoZXNlIDIgY29udHJvbHMgaXMgbXV0dWFsbHktZXhjbHVzaXZlLCBiZWNhdXNlIHRoZXkgYm90aCBjaGFuZ2Ugc3RhbmRhcmREZXZpYXRpb24uXHJcbiAgICBzdGFuZGFyZERldmlhdGlvbkNvbnRyb2wuaXNQcmVzc2VkUHJvcGVydHkubGluayggaXNQcmVzc2VkID0+IHtcclxuICAgICAgaXNQcmVzc2VkICYmIGNvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbC5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgIH0gKTtcclxuICAgIGNvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbC5pc1ByZXNzZWRQcm9wZXJ0eS5saW5rKCBpc1ByZXNzZWQgPT4ge1xyXG4gICAgICBpc1ByZXNzZWQgJiYgc3RhbmRhcmREZXZpYXRpb25Db250cm9sLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHdpZHRoSW5kaWNhdG9yc0NoZWNrYm94ID0gbmV3IFdpZHRoSW5kaWNhdG9yc0NoZWNrYm94KCB3aWR0aEluZGljYXRvcnNWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3aWR0aEluZGljYXRvcnNDaGVja2JveCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERlZmF1bHQgcG9pbnRlciBhcmVhcyBmb3Igd2lkdGhJbmRpY2F0b3JzQ2hlY2tib3ggYW5kIHN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbC5zbGlkZXIgb3ZlcmxhcC4gV2UgY2FuJ3RcclxuICAgIC8vIGVsaW1pbmF0ZSB0aGlzIG92ZXJsYXAgYmVjYXVzZSB3ZSBjYW4ndCBhZmZvcmQgdG8gYWRkIHZlcnRpY2FsIHNwYWNlLiBTbyBkbyBvdXIgYmVzdCB0byBtaXRpZ2F0ZSB0aGUgaXNzdWVcclxuICAgIC8vIGJ5IHNoaWZ0aW5nIHdpZHRoSW5kaWNhdG9yc0NoZWNrYm94J3MgdG91Y2hBcmVhIGRvd24uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xMjQjaXNzdWVjb21tZW50LTg5NzIyOTcwN1xyXG4gICAgd2lkdGhJbmRpY2F0b3JzQ2hlY2tib3gudG91Y2hBcmVhID0gd2lkdGhJbmRpY2F0b3JzQ2hlY2tib3gubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCA2LCA0ICkuc2hpZnRlZFkoIDIgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1dhdmVQYWNrZXRXaWR0aFN1YnBhbmVsIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICB3YXZlUGFja2V0V2lkdGhUZXh0LFxyXG4gICAgICBzdGFuZGFyZERldmlhdGlvbkNvbnRyb2wsXHJcbiAgICAgIGNvbmp1Z2F0ZVN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbCxcclxuICAgICAgd2lkdGhJbmRpY2F0b3JzQ2hlY2tib3hcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR3JhcGhDb250cm9sc1N1YnBhbmVsIGlzIHRoZSAnR3JhcGggQ29udHJvbHMnIHNlY3Rpb24gb2YgdGhpcyBjb250cm9sIHBhbmVsLlxyXG4gKi9cclxuY2xhc3MgR3JhcGhDb250cm9sc1N1YnBhbmVsIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LjxTZXJpZXNUeXBlPn0gc2VyaWVzVHlwZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOb2RlfSBwb3B1cFBhcmVudFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG9tYWluUHJvcGVydHksIHNlcmllc1R5cGVQcm9wZXJ0eSwgcG9wdXBQYXJlbnQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tYWluUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZXJpZXNUeXBlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3B1cFBhcmVudCBpbnN0YW5jZW9mIE5vZGUgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuVkJPWF9PUFRJT05TLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3QgZ3JhcGhDb250cm9sc1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5ncmFwaENvbnRyb2xzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyMDAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFwaENvbnRyb2xzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEZ1bmN0aW9uIG9mOlxyXG4gICAgY29uc3QgZnVuY3Rpb25PZlRleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5mdW5jdGlvbk9mU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDcwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZnVuY3Rpb25PZlRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkb21haW5Db21ib0JveCA9IG5ldyBEb21haW5Db21ib0JveCggZG9tYWluUHJvcGVydHksIHBvcHVwUGFyZW50LFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmdW5jdGlvbk9mQ29tYm9Cb3gnICkgLy8gdGFuZGVtIG5hbWUgZGlmZmVycyBieSByZXF1ZXN0XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGZ1bmN0aW9uT2ZCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICBjaGlsZHJlbjogWyBmdW5jdGlvbk9mVGV4dCwgZG9tYWluQ29tYm9Cb3ggXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNlcmllczpcclxuICAgIGNvbnN0IHNlcmllc1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zZXJpZXNTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogNzAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZXJpZXNUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2VyaWVzVHlwZVJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgU2VyaWVzVHlwZVJhZGlvQnV0dG9uR3JvdXAoIHNlcmllc1R5cGVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nlcmllc1JhZGlvQnV0dG9uR3JvdXAnICkgLy8gdGFuZGVtIG5hbWUgZGlmZmVycyBieSByZXF1ZXN0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2VyaWVzQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHNlcmllc1RleHQsIHNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ0dyYXBoQ29udHJvbHNTdWJwYW5lbCBzZXRzIGNoaWxkcmVuJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcclxuICAgICAgZ3JhcGhDb250cm9sc1RleHQsXHJcbiAgICAgIGZ1bmN0aW9uT2ZCb3gsXHJcbiAgICAgIHNlcmllc0JveFxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1dhdmVQYWNrZXRDb250cm9sUGFuZWwnLCBXYXZlUGFja2V0Q29udHJvbFBhbmVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sbURBQW1EO0FBQzFFLFNBQVNDLElBQUksRUFBRUMsVUFBVSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RixPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLDJCQUEyQjtBQUNqRCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZE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