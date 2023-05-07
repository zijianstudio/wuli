// Copyright 2020-2023, University of Colorado Boulder

/**
 * DiscreteControlPanel is the control panel for the 'Discrete' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import audioManager from '../../../../joist/js/audioManager.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import { AlignBox, AlignGroup, Color, HBox, HSeparator, Node, Path, SceneryConstants, Text, VBox } from '../../../../scenery/js/imports.js';
import volumeDownSolidShape from '../../../../sherpa/js/fontawesome-5/volumeDownSolidShape.js';
import volumeOffSolidShape from '../../../../sherpa/js/fontawesome-5/volumeOffSolidShape.js';
import volumeUpSolidShape from '../../../../sherpa/js/fontawesome-5/volumeUpSolidShape.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWColors from '../../common/FMWColors.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import Domain from '../../common/model/Domain.js';
import FourierSeries from '../../common/model/FourierSeries.js';
import DomainComboBox from '../../common/view/DomainComboBox.js';
import SeriesTypeRadioButtonGroup from '../../common/view/SeriesTypeRadioButtonGroup.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import DiscreteMeasurementTool from '../model/DiscreteMeasurementTool.js';
import DiscreteModel from '../model/DiscreteModel.js';
import Waveform from '../model/Waveform.js';
import DiscreteInfoDialog from './DiscreteInfoDialog.js';
import EquationComboBox from './EquationComboBox.js';
import FourierSoundEnabledCheckbox from './FourierSoundEnabledCheckbox.js';
import HarmonicsSpinner from './HarmonicsSpinner.js';
import OrderSpinner from './OrderSpinner.js';
import PeriodCheckbox from './PeriodCheckbox.js';
import WaveformComboBox from './WaveformComboBox.js';
import WavelengthCheckbox from './WavelengthCheckbox.js';
export default class DiscreteControlPanel extends Panel {
  /**
   * @param {DiscreteModel} model
   * @param {Node} popupParent
   * @param {Object} [options]
   */
  constructor(model, popupParent, options) {
    assert && assert(model instanceof DiscreteModel);
    assert && assert(popupParent instanceof Node);
    options = merge({}, FMWConstants.PANEL_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);
    const fourierSeriesSubpanel = new FourierSeriesSubpanel(model.fourierSeries, model.waveformProperty, popupParent, {
      tandem: options.tandem.createTandem('fourierSeriesSubpanel')
    });

    // {Node[]} logical sections of the control panel
    const sectionNodes = [fourierSeriesSubpanel, new GraphControlsSubpanel(model.domainProperty, model.seriesTypeProperty, model.equationFormProperty, popupParent, {
      tandem: options.tandem.createTandem('graphControlsSubpanel')
    }), new MeasurementToolsSubpanel(model.wavelengthTool, model.periodTool, model.domainProperty, {
      tandem: options.tandem.createTandem('measurementToolsSubpanel')
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
      children: children
    }));

    // Dialog that displays a key for math symbols. Created eagerly and reused for PhET-iO.
    const infoDialog = new DiscreteInfoDialog({
      tandem: options.tandem.createTandem('infoDialog')
    });

    // Button to open the dialog
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
    infoButton.centerY = fourierSeriesSubpanel.fourierSeriesText.boundsTo(vBox).centerY;
    super(content, options);

    // pdom - traversal order
    // See https://github.com/phetsims/fourier-making-waves/issues/53
    this.pdomOrder = [infoButton, vBox];
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
 * FourierSeriesSubpanel is the 'Fourier Series' subpanel of this control panel.
 */
class FourierSeriesSubpanel extends VBox {
  /**
   * @param {FourierSeries} fourierSeries
   * @param {Property.<Waveform>} waveformProperty
   * @param {Node} popupParent
   * @param {Object} [options]
   */
  constructor(fourierSeries, waveformProperty, popupParent, options) {
    assert && assert(fourierSeries instanceof FourierSeries);
    assert && AssertUtils.assertPropertyOf(waveformProperty, Waveform);
    assert && assert(popupParent instanceof Node);
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // To make all labels have the same effective width
    const labelsAlignBoxOptions = {
      xAlign: 'left',
      group: new AlignGroup({
        matchVertical: false
      })
    };

    // Title for this subpanel
    const fourierSeriesText = new Text(FourierMakingWavesStrings.fourierSeriesStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 180,
      // determined empirically
      tandem: options.tandem.createTandem('fourierSeriesText')
    });

    // Waveform combo box
    const waveformText = new Text(FourierMakingWavesStrings.waveformStringProperty, {
      font: FMWConstants.CONTROL_FONT,
      maxWidth: 70,
      // determined empirically
      tandem: options.tandem.createTandem('waveformText')
    });
    const waveformComboBox = new WaveformComboBox(waveformProperty, popupParent, options.tandem.createTandem('waveformComboBox'));
    const waveformBox = new HBox({
      spacing: 3,
      children: [new AlignBox(waveformText, labelsAlignBoxOptions), waveformComboBox]
    });

    // Harmonics spinner
    const harmonicsText = new Text(FourierMakingWavesStrings.harmonicsStringProperty, {
      font: FMWConstants.CONTROL_FONT,
      maxWidth: 70,
      // determined empirically
      tandem: options.tandem.createTandem('harmonicsText')
    });
    const harmonicsSpinner = new HarmonicsSpinner(fourierSeries.numberOfHarmonicsProperty, {
      tandem: options.tandem.createTandem('harmonicsSpinner')
    });
    const harmonicsBox = new HBox({
      spacing: 5,
      children: [new AlignBox(harmonicsText, labelsAlignBoxOptions), harmonicsSpinner]
    });

    // Sound checkbox and slider
    const soundBox = new SoundBox(fourierSeries.soundEnabledProperty, fourierSeries.soundOutputLevelProperty, {
      tandem: options.tandem.createTandem('soundBox')
    });
    assert && assert(!options.children, 'FourierSeriesSubpanel sets children');
    options.children = [fourierSeriesText, waveformBox, harmonicsBox, soundBox];
    super(options);

    // @public for layout
    this.fourierSeriesText = fourierSeriesText;
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
 * GraphControlsSubpanel is the 'Graph Controls' subpanel of this control panel.
 */
class GraphControlsSubpanel extends VBox {
  /**
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {EnumerationProperty.<SeriesType>} seriesTypeProperty
   * @param {EnumerationProperty.<EquationForm>} equationFormProperty
   * @param {Node} popupParent
   * @param {Object} [options]
   */
  constructor(domainProperty, seriesTypeProperty, equationFormProperty, popupParent, options) {
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(seriesTypeProperty instanceof EnumerationProperty);
    assert && assert(equationFormProperty instanceof EnumerationProperty);
    assert && assert(popupParent instanceof Node);
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // To make all labels have the same effective width
    const labelsAlignBoxOptions = {
      xAlign: 'left',
      group: new AlignGroup({
        matchVertical: false
      })
    };

    // Title for this subpanel
    const graphControlsText = new Text(FourierMakingWavesStrings.graphControlsStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 200,
      // determined empirically
      tandem: options.tandem.createTandem('graphControlsText')
    });
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
      children: [new AlignBox(functionOfText, labelsAlignBoxOptions), domainComboBox]
    });
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
      children: [new AlignBox(seriesText, labelsAlignBoxOptions), seriesTypeRadioButtonGroup]
    });
    const equationText = new Text(FourierMakingWavesStrings.equationStringProperty, {
      font: FMWConstants.CONTROL_FONT,
      maxWidth: 70,
      // determined empirically
      tandem: options.tandem.createTandem('equationText')
    });
    const equationComboBox = new EquationComboBox(equationFormProperty, domainProperty, popupParent, options.tandem.createTandem('equationComboBox'));
    const equationBox = new HBox({
      spacing: 5,
      children: [new AlignBox(equationText, labelsAlignBoxOptions), equationComboBox]
    });
    assert && assert(!options.children, 'DiscreteGraphControlsSubpanel sets children');
    options.children = [graphControlsText, functionOfBox, seriesBox, equationBox];
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
 * MeasurementToolsSubpanel is the 'Measurement Tools' subpanel of this control panel.
 */
class MeasurementToolsSubpanel extends VBox {
  /**
   * @param {DiscreteMeasurementTool} wavelengthTool
   * @param {DiscreteMeasurementTool} periodTool
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Object} [options]
   */
  constructor(wavelengthTool, periodTool, domainProperty, options) {
    assert && assert(wavelengthTool instanceof DiscreteMeasurementTool);
    assert && assert(periodTool instanceof DiscreteMeasurementTool);
    assert && assert(domainProperty instanceof EnumerationProperty);
    options = merge({}, FMWConstants.VBOX_OPTIONS, {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Title for this subpanel
    const measurementToolsText = new Text(FourierMakingWavesStrings.measurementToolsStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 200,
      // determined empirically
      tandem: options.tandem.createTandem('measurementToolsText')
    });

    // To make checkboxes have the same effective width
    const checkboxAlignBoxOptions = {
      group: new AlignGroup({
        matchVertical: false
      }),
      xAlign: 'left'
    };

    // To make spinners have the same effective width
    const spinnerAlignBoxOptions = {
      group: new AlignGroup({
        matchVertical: false
      }),
      xAlign: 'center'
    };
    const hBoxOptions = {
      spacing: 16
    };

    // Wavelength
    const wavelengthCheckbox = new WavelengthCheckbox(wavelengthTool.isSelectedProperty, {
      maxWidth: 90,
      enabledProperty: new DerivedProperty([domainProperty], domain => domain === Domain.SPACE || domain === Domain.SPACE_AND_TIME),
      tandem: options.tandem.createTandem('wavelengthCheckbox')
    });
    const wavelengthSpinner = new OrderSpinner(FMWSymbols.lambdaStringProperty, wavelengthTool.orderProperty, {
      enabledProperty: new DerivedProperty([wavelengthTool.isSelectedProperty, domainProperty], (isSelected, domain) => isSelected && (domain === Domain.SPACE || domain === Domain.SPACE_AND_TIME)),
      tandem: options.tandem.createTandem('wavelengthSpinner')
    });
    const wavelengthBox = new HBox(merge({}, hBoxOptions, {
      children: [new AlignBox(wavelengthCheckbox, checkboxAlignBoxOptions), new AlignBox(wavelengthSpinner, spinnerAlignBoxOptions)]
    }));

    // Period
    const periodCheckbox = new PeriodCheckbox(periodTool.isSelectedProperty, {
      maxWidth: 90,
      enabledProperty: new DerivedProperty([domainProperty], domain => domain === Domain.TIME || domain === Domain.SPACE_AND_TIME),
      tandem: options.tandem.createTandem('periodCheckbox')
    });
    const periodSpinner = new OrderSpinner(FMWSymbols.TStringProperty, periodTool.orderProperty, {
      enabledProperty: new DerivedProperty([periodTool.isSelectedProperty, domainProperty], (isSelected, domain) => isSelected && (domain === Domain.TIME || domain === Domain.SPACE_AND_TIME)),
      tandem: options.tandem.createTandem('periodSpinner')
    });
    const periodBox = new HBox(merge({}, hBoxOptions, {
      children: [new AlignBox(periodCheckbox, checkboxAlignBoxOptions), new AlignBox(periodSpinner, spinnerAlignBoxOptions)]
    }));
    assert && assert(!options.children, 'MeasurementToolsSubpanel sets children');
    options.children = [measurementToolsText, wavelengthBox, periodBox];
    super(options);
    wavelengthTool.isSelectedProperty.link(() => wavelengthSpinner.interruptSubtreeInput());
    periodTool.isSelectedProperty.link(() => periodSpinner.interruptSubtreeInput());

    // Interrupt input for controls that can be disabled.
    wavelengthCheckbox.enabledProperty.link(() => wavelengthCheckbox.interruptSubtreeInput());
    wavelengthSpinner.enabledProperty.link(() => wavelengthSpinner.interruptSubtreeInput());
    periodCheckbox.enabledProperty.link(() => periodCheckbox.interruptSubtreeInput());
    periodSpinner.enabledProperty.link(() => periodSpinner.interruptSubtreeInput());
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
 * SoundBox contains controls for enabling sound and adjusting output level. It's used to control the sound
 * associated with the Fourier series.
 */
class SoundBox extends HBox {
  /**
   * @param {Property.<boolean>} soundEnabledProperty
   * @param {NumberProperty} soundOutputLevelProperty
   * @param {Object} [options]
   */
  constructor(soundEnabledProperty, soundOutputLevelProperty, options) {
    assert && AssertUtils.assertPropertyOf(soundEnabledProperty, 'boolean');
    assert && assert(soundOutputLevelProperty instanceof NumberProperty);
    assert && assert(soundOutputLevelProperty.range, 'soundOutputLevelProperty.range required');
    options = merge({
      // HBox options
      spacing: 20,
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Checkbox with music icon
    const soundEnabledCheckbox = new FourierSoundEnabledCheckbox(soundEnabledProperty, {
      tandem: options.tandem.createTandem('soundEnabledCheckbox')
    });

    // Slider for controlling output level
    const outputLevelSlider = new HSlider(soundOutputLevelProperty, soundOutputLevelProperty.range, {
      thumbSize: new Dimension2(10, 20),
      trackSize: new Dimension2(100, 3),
      trackStroke: Color.grayColor(160),
      soundGenerator: null,
      tandem: options.tandem.createTandem('outputLevelSlider')
    });

    // Icons at the extremes of the slider
    const iconOptions = {
      scale: 0.037,
      fill: 'black'
    };
    const minVolumeIcon = new Path(soundOutputLevelProperty.range.min === 0 ? volumeOffSolidShape : volumeDownSolidShape, iconOptions);
    const maxVolumeIcon = new Path(volumeUpSolidShape, iconOptions);

    // Layout for slider and icons
    const sliderBox = new HBox({
      children: [minVolumeIcon, outputLevelSlider, maxVolumeIcon],
      spacing: 5
    });
    assert && assert(!options.children, 'SoundBox sets children');
    options.children = [soundEnabledCheckbox, sliderBox];
    super(options);

    // Disable this control when UI sounds are not being produced.
    audioManager.audioAndSoundEnabledProperty.link(audioAndSoundEnabled => {
      this.interruptSubtreeInput();
      soundEnabledCheckbox.enabled = audioAndSoundEnabled;
      outputLevelSlider.enabled = audioAndSoundEnabled;
      minVolumeIcon.opacity = audioAndSoundEnabled ? 1 : SceneryConstants.DISABLED_OPACITY;
      maxVolumeIcon.opacity = audioAndSoundEnabled ? 1 : SceneryConstants.DISABLED_OPACITY;
    });
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
fourierMakingWaves.register('DiscreteControlPanel', DiscreteControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiYXVkaW9NYW5hZ2VyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIkluZm9CdXR0b24iLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJDb2xvciIsIkhCb3giLCJIU2VwYXJhdG9yIiwiTm9kZSIsIlBhdGgiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVGV4dCIsIlZCb3giLCJ2b2x1bWVEb3duU29saWRTaGFwZSIsInZvbHVtZU9mZlNvbGlkU2hhcGUiLCJ2b2x1bWVVcFNvbGlkU2hhcGUiLCJIU2xpZGVyIiwiUGFuZWwiLCJUYW5kZW0iLCJGTVdDb2xvcnMiLCJGTVdDb25zdGFudHMiLCJGTVdTeW1ib2xzIiwiRG9tYWluIiwiRm91cmllclNlcmllcyIsIkRvbWFpbkNvbWJvQm94IiwiU2VyaWVzVHlwZVJhZGlvQnV0dG9uR3JvdXAiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiRGlzY3JldGVNZWFzdXJlbWVudFRvb2wiLCJEaXNjcmV0ZU1vZGVsIiwiV2F2ZWZvcm0iLCJEaXNjcmV0ZUluZm9EaWFsb2ciLCJFcXVhdGlvbkNvbWJvQm94IiwiRm91cmllclNvdW5kRW5hYmxlZENoZWNrYm94IiwiSGFybW9uaWNzU3Bpbm5lciIsIk9yZGVyU3Bpbm5lciIsIlBlcmlvZENoZWNrYm94IiwiV2F2ZWZvcm1Db21ib0JveCIsIldhdmVsZW5ndGhDaGVja2JveCIsIkRpc2NyZXRlQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInBvcHVwUGFyZW50Iiwib3B0aW9ucyIsImFzc2VydCIsIlBBTkVMX09QVElPTlMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImZvdXJpZXJTZXJpZXNTdWJwYW5lbCIsIkZvdXJpZXJTZXJpZXNTdWJwYW5lbCIsImZvdXJpZXJTZXJpZXMiLCJ3YXZlZm9ybVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwic2VjdGlvbk5vZGVzIiwiR3JhcGhDb250cm9sc1N1YnBhbmVsIiwiZG9tYWluUHJvcGVydHkiLCJzZXJpZXNUeXBlUHJvcGVydHkiLCJlcXVhdGlvbkZvcm1Qcm9wZXJ0eSIsIk1lYXN1cmVtZW50VG9vbHNTdWJwYW5lbCIsIndhdmVsZW5ndGhUb29sIiwicGVyaW9kVG9vbCIsImNoaWxkcmVuIiwiaSIsImxlbmd0aCIsInB1c2giLCJzdHJva2UiLCJzZXBhcmF0b3JTdHJva2VQcm9wZXJ0eSIsInZCb3giLCJWQk9YX09QVElPTlMiLCJpbmZvRGlhbG9nIiwiaW5mb0J1dHRvbiIsImxpc3RlbmVyIiwic2hvdyIsImljb25GaWxsIiwic2NhbGUiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsImNvbnRlbnQiLCJyaWdodCIsImNlbnRlclkiLCJmb3VyaWVyU2VyaWVzVGV4dCIsImJvdW5kc1RvIiwicGRvbU9yZGVyIiwiZGlzcG9zZSIsImFzc2VydFByb3BlcnR5T2YiLCJsYWJlbHNBbGlnbkJveE9wdGlvbnMiLCJ4QWxpZ24iLCJncm91cCIsIm1hdGNoVmVydGljYWwiLCJmb3VyaWVyU2VyaWVzU3RyaW5nUHJvcGVydHkiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwid2F2ZWZvcm1UZXh0Iiwid2F2ZWZvcm1TdHJpbmdQcm9wZXJ0eSIsIkNPTlRST0xfRk9OVCIsIndhdmVmb3JtQ29tYm9Cb3giLCJ3YXZlZm9ybUJveCIsInNwYWNpbmciLCJoYXJtb25pY3NUZXh0IiwiaGFybW9uaWNzU3RyaW5nUHJvcGVydHkiLCJoYXJtb25pY3NTcGlubmVyIiwibnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSIsImhhcm1vbmljc0JveCIsInNvdW5kQm94IiwiU291bmRCb3giLCJzb3VuZEVuYWJsZWRQcm9wZXJ0eSIsInNvdW5kT3V0cHV0TGV2ZWxQcm9wZXJ0eSIsImdyYXBoQ29udHJvbHNUZXh0IiwiZ3JhcGhDb250cm9sc1N0cmluZ1Byb3BlcnR5IiwiZnVuY3Rpb25PZlRleHQiLCJmdW5jdGlvbk9mU3RyaW5nUHJvcGVydHkiLCJkb21haW5Db21ib0JveCIsImZ1bmN0aW9uT2ZCb3giLCJzZXJpZXNUZXh0Iiwic2VyaWVzU3RyaW5nUHJvcGVydHkiLCJzZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCIsInNlcmllc0JveCIsImVxdWF0aW9uVGV4dCIsImVxdWF0aW9uU3RyaW5nUHJvcGVydHkiLCJlcXVhdGlvbkNvbWJvQm94IiwiZXF1YXRpb25Cb3giLCJtZWFzdXJlbWVudFRvb2xzVGV4dCIsIm1lYXN1cmVtZW50VG9vbHNTdHJpbmdQcm9wZXJ0eSIsImNoZWNrYm94QWxpZ25Cb3hPcHRpb25zIiwic3Bpbm5lckFsaWduQm94T3B0aW9ucyIsImhCb3hPcHRpb25zIiwid2F2ZWxlbmd0aENoZWNrYm94IiwiaXNTZWxlY3RlZFByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwiZG9tYWluIiwiU1BBQ0UiLCJTUEFDRV9BTkRfVElNRSIsIndhdmVsZW5ndGhTcGlubmVyIiwibGFtYmRhU3RyaW5nUHJvcGVydHkiLCJvcmRlclByb3BlcnR5IiwiaXNTZWxlY3RlZCIsIndhdmVsZW5ndGhCb3giLCJwZXJpb2RDaGVja2JveCIsIlRJTUUiLCJwZXJpb2RTcGlubmVyIiwiVFN0cmluZ1Byb3BlcnR5IiwicGVyaW9kQm94IiwibGluayIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJhbmdlIiwic291bmRFbmFibGVkQ2hlY2tib3giLCJvdXRwdXRMZXZlbFNsaWRlciIsInRodW1iU2l6ZSIsInRyYWNrU2l6ZSIsInRyYWNrU3Ryb2tlIiwiZ3JheUNvbG9yIiwic291bmRHZW5lcmF0b3IiLCJpY29uT3B0aW9ucyIsImZpbGwiLCJtaW5Wb2x1bWVJY29uIiwibWluIiwibWF4Vm9sdW1lSWNvbiIsInNsaWRlckJveCIsImF1ZGlvQW5kU291bmRFbmFibGVkUHJvcGVydHkiLCJhdWRpb0FuZFNvdW5kRW5hYmxlZCIsImVuYWJsZWQiLCJvcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzY3JldGVDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzY3JldGVDb250cm9sUGFuZWwgaXMgdGhlIGNvbnRyb2wgcGFuZWwgZm9yIHRoZSAnRGlzY3JldGUnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBhdWRpb01hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvYXVkaW9NYW5hZ2VyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IEluZm9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvSW5mb0J1dHRvbi5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBBbGlnbkdyb3VwLCBDb2xvciwgSEJveCwgSFNlcGFyYXRvciwgTm9kZSwgUGF0aCwgU2NlbmVyeUNvbnN0YW50cywgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB2b2x1bWVEb3duU29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS92b2x1bWVEb3duU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCB2b2x1bWVPZmZTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L3ZvbHVtZU9mZlNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgdm9sdW1lVXBTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L3ZvbHVtZVVwU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbG9ycy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGTVdTeW1ib2xzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdTeW1ib2xzLmpzJztcclxuaW1wb3J0IERvbWFpbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRG9tYWluLmpzJztcclxuaW1wb3J0IEZvdXJpZXJTZXJpZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0ZvdXJpZXJTZXJpZXMuanMnO1xyXG5pbXBvcnQgRG9tYWluQ29tYm9Cb3ggZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRG9tYWluQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgU2VyaWVzVHlwZVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2VyaWVzVHlwZVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIGZyb20gJy4uLy4uL0ZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVNZWFzdXJlbWVudFRvb2wgZnJvbSAnLi4vbW9kZWwvRGlzY3JldGVNZWFzdXJlbWVudFRvb2wuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVNb2RlbCBmcm9tICcuLi9tb2RlbC9EaXNjcmV0ZU1vZGVsLmpzJztcclxuaW1wb3J0IFdhdmVmb3JtIGZyb20gJy4uL21vZGVsL1dhdmVmb3JtLmpzJztcclxuaW1wb3J0IERpc2NyZXRlSW5mb0RpYWxvZyBmcm9tICcuL0Rpc2NyZXRlSW5mb0RpYWxvZy5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbkNvbWJvQm94IGZyb20gJy4vRXF1YXRpb25Db21ib0JveC5qcyc7XHJcbmltcG9ydCBGb3VyaWVyU291bmRFbmFibGVkQ2hlY2tib3ggZnJvbSAnLi9Gb3VyaWVyU291bmRFbmFibGVkQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgSGFybW9uaWNzU3Bpbm5lciBmcm9tICcuL0hhcm1vbmljc1NwaW5uZXIuanMnO1xyXG5pbXBvcnQgT3JkZXJTcGlubmVyIGZyb20gJy4vT3JkZXJTcGlubmVyLmpzJztcclxuaW1wb3J0IFBlcmlvZENoZWNrYm94IGZyb20gJy4vUGVyaW9kQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgV2F2ZWZvcm1Db21ib0JveCBmcm9tICcuL1dhdmVmb3JtQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgV2F2ZWxlbmd0aENoZWNrYm94IGZyb20gJy4vV2F2ZWxlbmd0aENoZWNrYm94LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc2NyZXRlQ29udHJvbFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Rpc2NyZXRlTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtOb2RlfSBwb3B1cFBhcmVudFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHBvcHVwUGFyZW50LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vZGVsIGluc3RhbmNlb2YgRGlzY3JldGVNb2RlbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9wdXBQYXJlbnQgaW5zdGFuY2VvZiBOb2RlICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgRk1XQ29uc3RhbnRzLlBBTkVMX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gb3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGZvdXJpZXJTZXJpZXNTdWJwYW5lbCA9IG5ldyBGb3VyaWVyU2VyaWVzU3VicGFuZWwoIG1vZGVsLmZvdXJpZXJTZXJpZXMsIG1vZGVsLndhdmVmb3JtUHJvcGVydHksIHBvcHVwUGFyZW50LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm91cmllclNlcmllc1N1YnBhbmVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ge05vZGVbXX0gbG9naWNhbCBzZWN0aW9ucyBvZiB0aGUgY29udHJvbCBwYW5lbFxyXG4gICAgY29uc3Qgc2VjdGlvbk5vZGVzID0gW1xyXG4gICAgICBmb3VyaWVyU2VyaWVzU3VicGFuZWwsXHJcbiAgICAgIG5ldyBHcmFwaENvbnRyb2xzU3VicGFuZWwoIG1vZGVsLmRvbWFpblByb3BlcnR5LCBtb2RlbC5zZXJpZXNUeXBlUHJvcGVydHksIG1vZGVsLmVxdWF0aW9uRm9ybVByb3BlcnR5LCBwb3B1cFBhcmVudCwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JhcGhDb250cm9sc1N1YnBhbmVsJyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmV3IE1lYXN1cmVtZW50VG9vbHNTdWJwYW5lbCggbW9kZWwud2F2ZWxlbmd0aFRvb2wsIG1vZGVsLnBlcmlvZFRvb2wsIG1vZGVsLmRvbWFpblByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFzdXJlbWVudFRvb2xzU3VicGFuZWwnIClcclxuICAgICAgfSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFB1dCBhIHNlcGFyYXRvciBiZXR3ZWVuIGVhY2ggbG9naWNhbCBzZWN0aW9uLlxyXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNlY3Rpb25Ob2Rlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY2hpbGRyZW4ucHVzaCggc2VjdGlvbk5vZGVzWyBpIF0gKTtcclxuICAgICAgaWYgKCBpIDwgc2VjdGlvbk5vZGVzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IEhTZXBhcmF0b3IoIHtcclxuICAgICAgICAgIHN0cm9rZTogRk1XQ29sb3JzLnNlcGFyYXRvclN0cm9rZVByb3BlcnR5XHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2Qm94ID0gbmV3IFZCb3goIG1lcmdlKCB7fSwgRk1XQ29uc3RhbnRzLlZCT1hfT1BUSU9OUywge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW5cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIERpYWxvZyB0aGF0IGRpc3BsYXlzIGEga2V5IGZvciBtYXRoIHN5bWJvbHMuIENyZWF0ZWQgZWFnZXJseSBhbmQgcmV1c2VkIGZvciBQaEVULWlPLlxyXG4gICAgY29uc3QgaW5mb0RpYWxvZyA9IG5ldyBEaXNjcmV0ZUluZm9EaWFsb2coIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmZvRGlhbG9nJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQnV0dG9uIHRvIG9wZW4gdGhlIGRpYWxvZ1xyXG4gICAgY29uc3QgaW5mb0J1dHRvbiA9IG5ldyBJbmZvQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBpbmZvRGlhbG9nLnNob3coKSxcclxuICAgICAgaWNvbkZpbGw6ICdyZ2IoIDUwLCAxNDUsIDE4NCApJyxcclxuICAgICAgc2NhbGU6IDAuNCxcclxuICAgICAgdG91Y2hBcmVhRGlsYXRpb246IDE1LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luZm9CdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgdkJveCwgaW5mb0J1dHRvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSW5mb0J1dHRvbiBhdCB1cHBlci1yaWdodCBvZiBjb250cm9sIHBhbmVsLCB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIHRpdGxlLlxyXG4gICAgaW5mb0J1dHRvbi5yaWdodCA9IHZCb3gucmlnaHQ7XHJcbiAgICBpbmZvQnV0dG9uLmNlbnRlclkgPSBmb3VyaWVyU2VyaWVzU3VicGFuZWwuZm91cmllclNlcmllc1RleHQuYm91bmRzVG8oIHZCb3ggKS5jZW50ZXJZO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIHRyYXZlcnNhbCBvcmRlclxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNTNcclxuICAgIHRoaXMucGRvbU9yZGVyID0gW1xyXG4gICAgICBpbmZvQnV0dG9uLFxyXG4gICAgICB2Qm94XHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3VyaWVyU2VyaWVzU3VicGFuZWwgaXMgdGhlICdGb3VyaWVyIFNlcmllcycgc3VicGFuZWwgb2YgdGhpcyBjb250cm9sIHBhbmVsLlxyXG4gKi9cclxuY2xhc3MgRm91cmllclNlcmllc1N1YnBhbmVsIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Rm91cmllclNlcmllc30gZm91cmllclNlcmllc1xyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFdhdmVmb3JtPn0gd2F2ZWZvcm1Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gcG9wdXBQYXJlbnRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGZvdXJpZXJTZXJpZXMsIHdhdmVmb3JtUHJvcGVydHksIHBvcHVwUGFyZW50LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvdXJpZXJTZXJpZXMgaW5zdGFuY2VvZiBGb3VyaWVyU2VyaWVzICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggd2F2ZWZvcm1Qcm9wZXJ0eSwgV2F2ZWZvcm0gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvcHVwUGFyZW50IGluc3RhbmNlb2YgTm9kZSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZNV0NvbnN0YW50cy5WQk9YX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gb3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRvIG1ha2UgYWxsIGxhYmVscyBoYXZlIHRoZSBzYW1lIGVmZmVjdGl2ZSB3aWR0aFxyXG4gICAgY29uc3QgbGFiZWxzQWxpZ25Cb3hPcHRpb25zID0ge1xyXG4gICAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgICAgZ3JvdXA6IG5ldyBBbGlnbkdyb3VwKCB7XHJcbiAgICAgICAgbWF0Y2hWZXJ0aWNhbDogZmFsc2VcclxuICAgICAgfSApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRpdGxlIGZvciB0aGlzIHN1YnBhbmVsXHJcbiAgICBjb25zdCBmb3VyaWVyU2VyaWVzVGV4dCA9IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmZvdXJpZXJTZXJpZXNTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDE4MCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvdXJpZXJTZXJpZXNUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2F2ZWZvcm0gY29tYm8gYm94XHJcbiAgICBjb25zdCB3YXZlZm9ybVRleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy53YXZlZm9ybVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5DT05UUk9MX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiA3MCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVmb3JtVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHdhdmVmb3JtQ29tYm9Cb3ggPSBuZXcgV2F2ZWZvcm1Db21ib0JveCggd2F2ZWZvcm1Qcm9wZXJ0eSwgcG9wdXBQYXJlbnQsXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVmb3JtQ29tYm9Cb3gnICkgKTtcclxuXHJcbiAgICBjb25zdCB3YXZlZm9ybUJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDMsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBBbGlnbkJveCggd2F2ZWZvcm1UZXh0LCBsYWJlbHNBbGlnbkJveE9wdGlvbnMgKSwgd2F2ZWZvcm1Db21ib0JveCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGFybW9uaWNzIHNwaW5uZXJcclxuICAgIGNvbnN0IGhhcm1vbmljc1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5oYXJtb25pY3NTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogNzAsICAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFybW9uaWNzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGhhcm1vbmljc1NwaW5uZXIgPSBuZXcgSGFybW9uaWNzU3Bpbm5lciggZm91cmllclNlcmllcy5udW1iZXJPZkhhcm1vbmljc1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFybW9uaWNzU3Bpbm5lcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGhhcm1vbmljc0JveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBBbGlnbkJveCggaGFybW9uaWNzVGV4dCwgbGFiZWxzQWxpZ25Cb3hPcHRpb25zICksIGhhcm1vbmljc1NwaW5uZXIgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNvdW5kIGNoZWNrYm94IGFuZCBzbGlkZXJcclxuICAgIGNvbnN0IHNvdW5kQm94ID0gbmV3IFNvdW5kQm94KCBmb3VyaWVyU2VyaWVzLnNvdW5kRW5hYmxlZFByb3BlcnR5LCBmb3VyaWVyU2VyaWVzLnNvdW5kT3V0cHV0TGV2ZWxQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvdW5kQm94JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdGb3VyaWVyU2VyaWVzU3VicGFuZWwgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIGZvdXJpZXJTZXJpZXNUZXh0LFxyXG4gICAgICB3YXZlZm9ybUJveCxcclxuICAgICAgaGFybW9uaWNzQm94LFxyXG4gICAgICBzb3VuZEJveFxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgZm9yIGxheW91dFxyXG4gICAgdGhpcy5mb3VyaWVyU2VyaWVzVGV4dCA9IGZvdXJpZXJTZXJpZXNUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHcmFwaENvbnRyb2xzU3VicGFuZWwgaXMgdGhlICdHcmFwaCBDb250cm9scycgc3VicGFuZWwgb2YgdGhpcyBjb250cm9sIHBhbmVsLlxyXG4gKi9cclxuY2xhc3MgR3JhcGhDb250cm9sc1N1YnBhbmVsIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPFNlcmllc1R5cGU+fSBzZXJpZXNUeXBlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPEVxdWF0aW9uRm9ybT59IGVxdWF0aW9uRm9ybVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOb2RlfSBwb3B1cFBhcmVudFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG9tYWluUHJvcGVydHksIHNlcmllc1R5cGVQcm9wZXJ0eSwgZXF1YXRpb25Gb3JtUHJvcGVydHksIHBvcHVwUGFyZW50LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbWFpblByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2VyaWVzVHlwZVByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZXF1YXRpb25Gb3JtUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3B1cFBhcmVudCBpbnN0YW5jZW9mIE5vZGUgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuVkJPWF9PUFRJT05TLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUbyBtYWtlIGFsbCBsYWJlbHMgaGF2ZSB0aGUgc2FtZSBlZmZlY3RpdmUgd2lkdGhcclxuICAgIGNvbnN0IGxhYmVsc0FsaWduQm94T3B0aW9ucyA9IHtcclxuICAgICAgeEFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgge1xyXG4gICAgICAgIG1hdGNoVmVydGljYWw6IGZhbHNlXHJcbiAgICAgIH0gKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3QgZ3JhcGhDb250cm9sc1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5ncmFwaENvbnRyb2xzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyMDAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFwaENvbnRyb2xzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGZ1bmN0aW9uT2ZUZXh0ID0gbmV3IFRleHQoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuZnVuY3Rpb25PZlN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5DT05UUk9MX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiA3MCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Z1bmN0aW9uT2ZUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZG9tYWluQ29tYm9Cb3ggPSBuZXcgRG9tYWluQ29tYm9Cb3goIGRvbWFpblByb3BlcnR5LCBwb3B1cFBhcmVudCxcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZnVuY3Rpb25PZkNvbWJvQm94JyApIC8vIHRhbmRlbSBuYW1lIGRpZmZlcnMgYnkgcmVxdWVzdFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBmdW5jdGlvbk9mQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IEFsaWduQm94KCBmdW5jdGlvbk9mVGV4dCwgbGFiZWxzQWxpZ25Cb3hPcHRpb25zICksIGRvbWFpbkNvbWJvQm94IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzZXJpZXNUZXh0ID0gbmV3IFRleHQoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3Muc2VyaWVzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDcwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2VyaWVzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwKCBzZXJpZXNUeXBlUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZXJpZXNSYWRpb0J1dHRvbkdyb3VwJyApIC8vIHRhbmRlbSBuYW1lIGRpZmZlcnMgYnkgcmVxdWVzdFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlcmllc0JveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBjaGlsZHJlbjogWyBuZXcgQWxpZ25Cb3goIHNlcmllc1RleHQsIGxhYmVsc0FsaWduQm94T3B0aW9ucyApLCBzZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZXF1YXRpb25UZXh0ID0gbmV3IFRleHQoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuZXF1YXRpb25TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogNzAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlcXVhdGlvblRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlcXVhdGlvbkNvbWJvQm94ID0gbmV3IEVxdWF0aW9uQ29tYm9Cb3goIGVxdWF0aW9uRm9ybVByb3BlcnR5LCBkb21haW5Qcm9wZXJ0eSwgcG9wdXBQYXJlbnQsXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWF0aW9uQ29tYm9Cb3gnICkgKTtcclxuXHJcbiAgICBjb25zdCBlcXVhdGlvbkJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBBbGlnbkJveCggZXF1YXRpb25UZXh0LCBsYWJlbHNBbGlnbkJveE9wdGlvbnMgKSwgZXF1YXRpb25Db21ib0JveCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdEaXNjcmV0ZUdyYXBoQ29udHJvbHNTdWJwYW5lbCBzZXRzIGNoaWxkcmVuJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcclxuICAgICAgZ3JhcGhDb250cm9sc1RleHQsXHJcbiAgICAgIGZ1bmN0aW9uT2ZCb3gsXHJcbiAgICAgIHNlcmllc0JveCxcclxuICAgICAgZXF1YXRpb25Cb3hcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVhc3VyZW1lbnRUb29sc1N1YnBhbmVsIGlzIHRoZSAnTWVhc3VyZW1lbnQgVG9vbHMnIHN1YnBhbmVsIG9mIHRoaXMgY29udHJvbCBwYW5lbC5cclxuICovXHJcbmNsYXNzIE1lYXN1cmVtZW50VG9vbHNTdWJwYW5lbCBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Rpc2NyZXRlTWVhc3VyZW1lbnRUb29sfSB3YXZlbGVuZ3RoVG9vbFxyXG4gICAqIEBwYXJhbSB7RGlzY3JldGVNZWFzdXJlbWVudFRvb2x9IHBlcmlvZFRvb2xcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPERvbWFpbj59IGRvbWFpblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB3YXZlbGVuZ3RoVG9vbCwgcGVyaW9kVG9vbCwgZG9tYWluUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2F2ZWxlbmd0aFRvb2wgaW5zdGFuY2VvZiBEaXNjcmV0ZU1lYXN1cmVtZW50VG9vbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGVyaW9kVG9vbCBpbnN0YW5jZW9mIERpc2NyZXRlTWVhc3VyZW1lbnRUb29sICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21haW5Qcm9wZXJ0eSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uUHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuVkJPWF9PUFRJT05TLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUaXRsZSBmb3IgdGhpcyBzdWJwYW5lbFxyXG4gICAgY29uc3QgbWVhc3VyZW1lbnRUb29sc1RleHQgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5tZWFzdXJlbWVudFRvb2xzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyMDAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFzdXJlbWVudFRvb2xzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvIG1ha2UgY2hlY2tib3hlcyBoYXZlIHRoZSBzYW1lIGVmZmVjdGl2ZSB3aWR0aFxyXG4gICAgY29uc3QgY2hlY2tib3hBbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCggeyBtYXRjaFZlcnRpY2FsOiBmYWxzZSB9ICksXHJcbiAgICAgIHhBbGlnbjogJ2xlZnQnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRvIG1ha2Ugc3Bpbm5lcnMgaGF2ZSB0aGUgc2FtZSBlZmZlY3RpdmUgd2lkdGhcclxuICAgIGNvbnN0IHNwaW5uZXJBbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCggeyBtYXRjaFZlcnRpY2FsOiBmYWxzZSB9ICksXHJcbiAgICAgIHhBbGlnbjogJ2NlbnRlcidcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaEJveE9wdGlvbnMgPSB7XHJcbiAgICAgIHNwYWNpbmc6IDE2XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdhdmVsZW5ndGhcclxuICAgIGNvbnN0IHdhdmVsZW5ndGhDaGVja2JveCA9IG5ldyBXYXZlbGVuZ3RoQ2hlY2tib3goIHdhdmVsZW5ndGhUb29sLmlzU2VsZWN0ZWRQcm9wZXJ0eSwge1xyXG4gICAgICBtYXhXaWR0aDogOTAsXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICBbIGRvbWFpblByb3BlcnR5IF0sXHJcbiAgICAgICAgZG9tYWluID0+ICggZG9tYWluID09PSBEb21haW4uU1BBQ0UgfHwgZG9tYWluID09PSBEb21haW4uU1BBQ0VfQU5EX1RJTUUgKVxyXG4gICAgICApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVsZW5ndGhDaGVja2JveCcgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgd2F2ZWxlbmd0aFNwaW5uZXIgPSBuZXcgT3JkZXJTcGlubmVyKCBGTVdTeW1ib2xzLmxhbWJkYVN0cmluZ1Byb3BlcnR5LCB3YXZlbGVuZ3RoVG9vbC5vcmRlclByb3BlcnR5LCB7XHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICBbIHdhdmVsZW5ndGhUb29sLmlzU2VsZWN0ZWRQcm9wZXJ0eSwgZG9tYWluUHJvcGVydHkgXSxcclxuICAgICAgICAoIGlzU2VsZWN0ZWQsIGRvbWFpbiApID0+XHJcbiAgICAgICAgICBpc1NlbGVjdGVkICYmICggZG9tYWluID09PSBEb21haW4uU1BBQ0UgfHwgZG9tYWluID09PSBEb21haW4uU1BBQ0VfQU5EX1RJTUUgKVxyXG4gICAgICApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVsZW5ndGhTcGlubmVyJyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB3YXZlbGVuZ3RoQm94ID0gbmV3IEhCb3goIG1lcmdlKCB7fSwgaEJveE9wdGlvbnMsIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQWxpZ25Cb3goIHdhdmVsZW5ndGhDaGVja2JveCwgY2hlY2tib3hBbGlnbkJveE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgQWxpZ25Cb3goIHdhdmVsZW5ndGhTcGlubmVyLCBzcGlubmVyQWxpZ25Cb3hPcHRpb25zIClcclxuICAgICAgXVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gUGVyaW9kXHJcbiAgICBjb25zdCBwZXJpb2RDaGVja2JveCA9IG5ldyBQZXJpb2RDaGVja2JveCggcGVyaW9kVG9vbC5pc1NlbGVjdGVkUHJvcGVydHksIHtcclxuICAgICAgbWF4V2lkdGg6IDkwLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgWyBkb21haW5Qcm9wZXJ0eSBdLFxyXG4gICAgICAgIGRvbWFpbiA9PiAoIGRvbWFpbiA9PT0gRG9tYWluLlRJTUUgfHwgZG9tYWluID09PSBEb21haW4uU1BBQ0VfQU5EX1RJTUUgKVxyXG4gICAgICApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BlcmlvZENoZWNrYm94JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBwZXJpb2RTcGlubmVyID0gbmV3IE9yZGVyU3Bpbm5lciggRk1XU3ltYm9scy5UU3RyaW5nUHJvcGVydHksIHBlcmlvZFRvb2wub3JkZXJQcm9wZXJ0eSwge1xyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgWyBwZXJpb2RUb29sLmlzU2VsZWN0ZWRQcm9wZXJ0eSwgZG9tYWluUHJvcGVydHkgXSxcclxuICAgICAgICAoIGlzU2VsZWN0ZWQsIGRvbWFpbiApID0+XHJcbiAgICAgICAgICBpc1NlbGVjdGVkICYmICggZG9tYWluID09PSBEb21haW4uVElNRSB8fCBkb21haW4gPT09IERvbWFpbi5TUEFDRV9BTkRfVElNRSApXHJcbiAgICAgICksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVyaW9kU3Bpbm5lcicgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcGVyaW9kQm94ID0gbmV3IEhCb3goIG1lcmdlKCB7fSwgaEJveE9wdGlvbnMsIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQWxpZ25Cb3goIHBlcmlvZENoZWNrYm94LCBjaGVja2JveEFsaWduQm94T3B0aW9ucyApLFxyXG4gICAgICAgIG5ldyBBbGlnbkJveCggcGVyaW9kU3Bpbm5lciwgc3Bpbm5lckFsaWduQm94T3B0aW9ucyApXHJcbiAgICAgIF1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnTWVhc3VyZW1lbnRUb29sc1N1YnBhbmVsIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBtZWFzdXJlbWVudFRvb2xzVGV4dCxcclxuICAgICAgd2F2ZWxlbmd0aEJveCxcclxuICAgICAgcGVyaW9kQm94XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgd2F2ZWxlbmd0aFRvb2wuaXNTZWxlY3RlZFByb3BlcnR5LmxpbmsoICgpID0+IHdhdmVsZW5ndGhTcGlubmVyLmludGVycnVwdFN1YnRyZWVJbnB1dCgpICk7XHJcbiAgICBwZXJpb2RUb29sLmlzU2VsZWN0ZWRQcm9wZXJ0eS5saW5rKCAoKSA9PiBwZXJpb2RTcGlubmVyLmludGVycnVwdFN1YnRyZWVJbnB1dCgpICk7XHJcblxyXG4gICAgLy8gSW50ZXJydXB0IGlucHV0IGZvciBjb250cm9scyB0aGF0IGNhbiBiZSBkaXNhYmxlZC5cclxuICAgIHdhdmVsZW5ndGhDaGVja2JveC5lbmFibGVkUHJvcGVydHkubGluayggKCkgPT4gd2F2ZWxlbmd0aENoZWNrYm94LmludGVycnVwdFN1YnRyZWVJbnB1dCgpICk7XHJcbiAgICB3YXZlbGVuZ3RoU3Bpbm5lci5lbmFibGVkUHJvcGVydHkubGluayggKCkgPT4gd2F2ZWxlbmd0aFNwaW5uZXIuaW50ZXJydXB0U3VidHJlZUlucHV0KCkgKTtcclxuICAgIHBlcmlvZENoZWNrYm94LmVuYWJsZWRQcm9wZXJ0eS5saW5rKCAoKSA9PiBwZXJpb2RDaGVja2JveC5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKSApO1xyXG4gICAgcGVyaW9kU3Bpbm5lci5lbmFibGVkUHJvcGVydHkubGluayggKCkgPT4gcGVyaW9kU3Bpbm5lci5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb3VuZEJveCBjb250YWlucyBjb250cm9scyBmb3IgZW5hYmxpbmcgc291bmQgYW5kIGFkanVzdGluZyBvdXRwdXQgbGV2ZWwuIEl0J3MgdXNlZCB0byBjb250cm9sIHRoZSBzb3VuZFxyXG4gKiBhc3NvY2lhdGVkIHdpdGggdGhlIEZvdXJpZXIgc2VyaWVzLlxyXG4gKi9cclxuY2xhc3MgU291bmRCb3ggZXh0ZW5kcyBIQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNvdW5kRW5hYmxlZFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gc291bmRPdXRwdXRMZXZlbFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzb3VuZEVuYWJsZWRQcm9wZXJ0eSwgc291bmRPdXRwdXRMZXZlbFByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBzb3VuZEVuYWJsZWRQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VuZE91dHB1dExldmVsUHJvcGVydHkgaW5zdGFuY2VvZiBOdW1iZXJQcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc291bmRPdXRwdXRMZXZlbFByb3BlcnR5LnJhbmdlLCAnc291bmRPdXRwdXRMZXZlbFByb3BlcnR5LnJhbmdlIHJlcXVpcmVkJyApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gSEJveCBvcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG5cclxuICAgICAgLy8gcGhldC1pbyBvcHRpb25zXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ2hlY2tib3ggd2l0aCBtdXNpYyBpY29uXHJcbiAgICBjb25zdCBzb3VuZEVuYWJsZWRDaGVja2JveCA9IG5ldyBGb3VyaWVyU291bmRFbmFibGVkQ2hlY2tib3goIHNvdW5kRW5hYmxlZFByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc291bmRFbmFibGVkQ2hlY2tib3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTbGlkZXIgZm9yIGNvbnRyb2xsaW5nIG91dHB1dCBsZXZlbFxyXG4gICAgY29uc3Qgb3V0cHV0TGV2ZWxTbGlkZXIgPSBuZXcgSFNsaWRlciggc291bmRPdXRwdXRMZXZlbFByb3BlcnR5LCBzb3VuZE91dHB1dExldmVsUHJvcGVydHkucmFuZ2UsIHtcclxuICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTAsIDIwICksXHJcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEwMCwgMyApLFxyXG4gICAgICB0cmFja1N0cm9rZTogQ29sb3IuZ3JheUNvbG9yKCAxNjAgKSxcclxuICAgICAgc291bmRHZW5lcmF0b3I6IG51bGwsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnb3V0cHV0TGV2ZWxTbGlkZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBJY29ucyBhdCB0aGUgZXh0cmVtZXMgb2YgdGhlIHNsaWRlclxyXG4gICAgY29uc3QgaWNvbk9wdGlvbnMgPSB7XHJcbiAgICAgIHNjYWxlOiAwLjAzNyxcclxuICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IG1pblZvbHVtZUljb24gPSBuZXcgUGF0aCggc291bmRPdXRwdXRMZXZlbFByb3BlcnR5LnJhbmdlLm1pbiA9PT0gMCA/IHZvbHVtZU9mZlNvbGlkU2hhcGUgOiB2b2x1bWVEb3duU29saWRTaGFwZSwgaWNvbk9wdGlvbnMgKTtcclxuICAgIGNvbnN0IG1heFZvbHVtZUljb24gPSBuZXcgUGF0aCggdm9sdW1lVXBTb2xpZFNoYXBlLCBpY29uT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIExheW91dCBmb3Igc2xpZGVyIGFuZCBpY29uc1xyXG4gICAgY29uc3Qgc2xpZGVyQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbWluVm9sdW1lSWNvbiwgb3V0cHV0TGV2ZWxTbGlkZXIsIG1heFZvbHVtZUljb24gXSxcclxuICAgICAgc3BhY2luZzogNVxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnU291bmRCb3ggc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHNvdW5kRW5hYmxlZENoZWNrYm94LCBzbGlkZXJCb3ggXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIERpc2FibGUgdGhpcyBjb250cm9sIHdoZW4gVUkgc291bmRzIGFyZSBub3QgYmVpbmcgcHJvZHVjZWQuXHJcbiAgICBhdWRpb01hbmFnZXIuYXVkaW9BbmRTb3VuZEVuYWJsZWRQcm9wZXJ0eS5saW5rKCBhdWRpb0FuZFNvdW5kRW5hYmxlZCA9PiB7XHJcbiAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgIHNvdW5kRW5hYmxlZENoZWNrYm94LmVuYWJsZWQgPSBhdWRpb0FuZFNvdW5kRW5hYmxlZDtcclxuICAgICAgb3V0cHV0TGV2ZWxTbGlkZXIuZW5hYmxlZCA9IGF1ZGlvQW5kU291bmRFbmFibGVkO1xyXG4gICAgICBtaW5Wb2x1bWVJY29uLm9wYWNpdHkgPSBhdWRpb0FuZFNvdW5kRW5hYmxlZCA/IDEgOiBTY2VuZXJ5Q29uc3RhbnRzLkRJU0FCTEVEX09QQUNJVFk7XHJcbiAgICAgIG1heFZvbHVtZUljb24ub3BhY2l0eSA9IGF1ZGlvQW5kU291bmRFbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdEaXNjcmV0ZUNvbnRyb2xQ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