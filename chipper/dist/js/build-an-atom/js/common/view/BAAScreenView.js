// Copyright 2013-2022, University of Colorado Boulder

/**
 * ScreenView that presents an interactive atom on the left side, buckets of particles underneath, and controls for
 * label visibility and reset.  A periodic table is included on the right side.  This is intended to be used as a base
 * class for screens with similar views.
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import BucketDragListener from '../../../../shred/js/view/BucketDragListener.js';
import ParticleCountDisplay from '../../../../shred/js/view/ParticleCountDisplay.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import PeriodicTableAndSymbol from '../../atom/view/PeriodicTableAndSymbol.js';
import buildAnAtom from '../../buildAnAtom.js';
import BuildAnAtomStrings from '../../BuildAnAtomStrings.js';
import BAAGlobalPreferences from '../BAAGlobalPreferences.js';
import BAAQueryParameters from '../BAAQueryParameters.js';
import BAASharedConstants from '../BAASharedConstants.js';

// strings
const cloudString = BuildAnAtomStrings.cloud;
const elementString = BuildAnAtomStrings.element;
const modelString = BuildAnAtomStrings.model;
const neutralSlashIonString = BuildAnAtomStrings.neutralSlashIon;
const orbitsString = BuildAnAtomStrings.orbits;
const showString = BuildAnAtomStrings.show;
const stableSlashUnstableString = BuildAnAtomStrings.stableSlashUnstable;

// constants
const CONTROLS_INSET = 10;
const LABEL_CONTROL_FONT = new PhetFont(12);
const LABEL_CONTROL_MAX_WIDTH = 180;
const LABEL_CONTROL_LINE_WIDTH = 1;
const ELECTRON_VIEW_CONTROL_FONT = new PhetFont(12);
const ELECTRON_VIEW_CONTROL_MAX_WIDTH = 60;
const NUM_NUCLEON_LAYERS = 5; // This is based on max number of particles, may need adjustment if that changes.

class BAAScreenView extends ScreenView {
  /**
   * @param {BuildAnAtomModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      layoutBounds: ShredConstants.LAYOUT_BOUNDS,
      tandem: tandem
    });
    this.model = model;
    this.resetFunctions = [];

    // @protected
    this.periodicTableAccordionBoxExpandedProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('periodicTableAccordionBoxExpandedProperty')
    });

    // Create the model-view transform.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.width * 0.3, this.layoutBounds.height * 0.45), 1.0);

    // Add the node that shows the textual labels, the electron shells, and the center X marker.
    const atomNode = new AtomNode(model.particleAtom, modelViewTransform, {
      showElementNameProperty: model.showElementNameProperty,
      showNeutralOrIonProperty: model.showNeutralOrIonProperty,
      showStableOrUnstableProperty: model.showStableOrUnstableProperty,
      electronShellDepictionProperty: model.electronShellDepictionProperty,
      tandem: tandem.createTandem('atomNode')
    });
    this.addChild(atomNode);

    // Add the bucket holes.  Done separately from the bucket front for layering.
    _.each(model.buckets, bucket => {
      this.addChild(new BucketHole(bucket, modelViewTransform, {
        pickable: false,
        tandem: tandem.createTandem(`${bucket.sphereBucketTandem.name}Hole`)
      }));
    });

    // add the layer where the nucleons and electrons will go, this is added last so that it remains on top
    const nucleonElectronLayer = new Node({
      tandem: tandem.createTandem('nucleonElectronLayer')
    });

    // Add the layers where the nucleons will exist.
    const nucleonLayers = [];
    _.times(NUM_NUCLEON_LAYERS, () => {
      const nucleonLayer = new Node();
      nucleonLayers.push(nucleonLayer);
      nucleonElectronLayer.addChild(nucleonLayer);
    });
    nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

    // Add the layer where the electrons will exist.
    const electronLayer = new Node({
      layerSplit: true,
      tandem: tandem.createTandem('electronLayer')
    });
    nucleonElectronLayer.addChild(electronLayer);

    // Add the nucleon particle views.
    const nucleonsGroupTandem = tandem.createTandem('nucleons').createGroupTandem('nucleon');
    const electronsGroupTandem = tandem.createTandem('electrons').createGroupTandem('electron');

    // add the nucleons
    const particleDragBounds = modelViewTransform.viewToModelBounds(this.layoutBounds);
    model.nucleons.forEach(nucleon => {
      nucleonLayers[nucleon.zLayerProperty.get()].addChild(new ParticleView(nucleon, modelViewTransform, {
        dragBounds: particleDragBounds,
        highContrastProperty: BAAGlobalPreferences.highContrastParticlesProperty,
        tandem: nucleonsGroupTandem.createNextTandem()
      }));

      // Add a listener that adjusts a nucleon's z-order layering.
      nucleon.zLayerProperty.link(zLayer => {
        assert && assert(nucleonLayers.length > zLayer, 'zLayer for nucleon exceeds number of layers, max number may need increasing.');
        // Determine whether nucleon view is on the correct layer.
        let onCorrectLayer = false;
        nucleonLayers[zLayer].children.forEach(particleView => {
          if (particleView.particle === nucleon) {
            onCorrectLayer = true;
          }
        });
        if (!onCorrectLayer) {
          // Remove particle view from its current layer.
          let particleView = null;
          for (let layerIndex = 0; layerIndex < nucleonLayers.length && particleView === null; layerIndex++) {
            for (let childIndex = 0; childIndex < nucleonLayers[layerIndex].children.length; childIndex++) {
              if (nucleonLayers[layerIndex].children[childIndex].particle === nucleon) {
                particleView = nucleonLayers[layerIndex].children[childIndex];
                nucleonLayers[layerIndex].removeChildAt(childIndex);
                break;
              }
            }
          }

          // Add the particle view to its new layer.
          assert && assert(particleView !== null, 'Particle view not found during relayering');
          nucleonLayers[zLayer].addChild(particleView);
        }
      });
    });

    // Add the electron particle views.
    model.electrons.forEach(electron => {
      electronLayer.addChild(new ParticleView(electron, modelViewTransform, {
        dragBounds: particleDragBounds,
        highContrastProperty: BAAGlobalPreferences.highContrastParticlesProperty,
        tandem: electronsGroupTandem.createNextTandem()
      }));
    });

    // When the electrons are represented as a cloud, the individual particles become invisible when added to the atom.
    const updateElectronVisibility = () => {
      electronLayer.getChildren().forEach(electronNode => {
        electronNode.visible = model.electronShellDepictionProperty.get() === 'orbits' || !model.particleAtom.electrons.includes(electronNode.particle);
      });
    };
    model.particleAtom.electrons.lengthProperty.link(updateElectronVisibility);
    model.electronShellDepictionProperty.link(updateElectronVisibility);

    // Add the front portion of the buckets. This is done separately from the bucket holes for layering purposes.
    const bucketFrontLayer = new Node({
      tandem: tandem.createTandem('bucketFrontLayer')
    });
    _.each(model.buckets, bucket => {
      const bucketFront = new BucketFront(bucket, modelViewTransform, {
        tandem: tandem.createTandem(`${bucket.sphereBucketTandem.name}FrontNode`)
      });
      bucketFrontLayer.addChild(bucketFront);
      bucketFront.addInputListener(new BucketDragListener(bucket, bucketFront, modelViewTransform, {
        tandem: tandem.createTandem(`${bucket.sphereBucketTandem.name}DragListener`)
      }));
    });

    // Add the particle count indicator.
    const particleCountDisplay = new ParticleCountDisplay(model.particleAtom, 13, 250, {
      tandem: tandem.createTandem('particleCountDisplay')
    }); // Width arbitrarily chosen.
    this.addChild(particleCountDisplay);

    // Add the periodic table display inside of an accordion box.
    const periodicTableAndSymbol = new PeriodicTableAndSymbol(model.particleAtom, tandem.createTandem('periodicTableAndSymbol'), {
      pickable: false
    });
    periodicTableAndSymbol.scale(0.55); // Scale empirically determined to match layout in design doc.
    const periodicTableAccordionBoxTandem = tandem.createTandem('periodicTableAccordionBox');
    this.periodicTableAccordionBox = new AccordionBox(periodicTableAndSymbol, {
      cornerRadius: 3,
      titleNode: new Text(elementString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH,
        tandem: periodicTableAccordionBoxTandem.createTandem('titleText')
      }),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      contentAlign: 'left',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandedProperty: this.periodicTableAccordionBoxExpandedProperty,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 12,
        touchAreaYDilation: 12
      },
      // phet-io
      tandem: periodicTableAccordionBoxTandem,
      // pdom
      labelContent: elementString
    });
    this.addChild(this.periodicTableAccordionBox);
    const labelVisibilityControlPanelTandem = tandem.createTandem('labelVisibilityControlPanel');
    const checkboxItems = [{
      createNode: tandem => new Text(elementString, {
        font: LABEL_CONTROL_FONT,
        maxWidth: LABEL_CONTROL_MAX_WIDTH,
        tandem: tandem.createTandem('elementText')
      }),
      property: model.showElementNameProperty,
      tandemName: 'showElementNameCheckbox'
    }, {
      createNode: tandem => new Text(neutralSlashIonString, {
        font: LABEL_CONTROL_FONT,
        maxWidth: LABEL_CONTROL_MAX_WIDTH,
        tandem: tandem.createTandem('neutralOrIonText')
      }),
      property: model.showNeutralOrIonProperty,
      tandemName: 'showNeutralOrIonCheckbox'
    }];

    // In support of a research study, it is possible to exclude the stable/unstable checkbox, see
    // https://github.com/phetsims/special-ops/issues/189.
    if (BAAQueryParameters.showStableUnstableCheckbox) {
      checkboxItems.push({
        createNode: tandem => new Text(stableSlashUnstableString, {
          font: LABEL_CONTROL_FONT,
          maxWidth: LABEL_CONTROL_MAX_WIDTH,
          tandem: tandem.createTandem('stableUnstableText')
        }),
        property: model.showStableOrUnstableProperty,
        tandemName: 'showStableOrUnstableCheckbox'
      });
    }
    const labelVisibilityControlPanel = new Panel(new VerticalCheckboxGroup(checkboxItems, {
      checkboxOptions: {
        boxWidth: 12
      },
      spacing: 8,
      tandem: tandem.createTandem('labelVisibilityCheckboxGroup')
    }), {
      fill: 'rgb( 245, 245, 245 )',
      lineWidth: LABEL_CONTROL_LINE_WIDTH,
      xMargin: 7.5,
      cornerRadius: 5,
      resize: false,
      tandem: labelVisibilityControlPanelTandem
    });
    const numDividerLines = checkboxItems.length - 1;
    const dividerLineShape = new Shape().moveTo(0, 0).lineTo(labelVisibilityControlPanel.width - 2 * LABEL_CONTROL_LINE_WIDTH, 0);
    for (let dividerLines = 0; dividerLines < numDividerLines; dividerLines++) {
      const dividerLine1 = new Path(dividerLineShape, {
        lineWidth: 1,
        stroke: 'gray',
        centerY: labelVisibilityControlPanel.height * (dividerLines + 1) / (numDividerLines + 1),
        x: LABEL_CONTROL_LINE_WIDTH / 2
      });
      labelVisibilityControlPanel.addChild(dividerLine1);
    }
    this.addChild(labelVisibilityControlPanel);
    const labelVisibilityControlPanelTitleText = new Text(showString, {
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      maxWidth: labelVisibilityControlPanel.width,
      tandem: tandem.createTandem('labelVisibilityControlPanelTitleText')
    });
    this.addChild(labelVisibilityControlPanelTitleText);

    // Add the radio buttons that control the electron representation in the atom.
    const radioButtonRadius = 6;
    const orbitsRadioButtonTandem = tandem.createTandem('orbitsRadioButton');
    const orbitsRadioButton = new AquaRadioButton(model.electronShellDepictionProperty, 'orbits', new Text(orbitsString, {
      font: ELECTRON_VIEW_CONTROL_FONT,
      maxWidth: ELECTRON_VIEW_CONTROL_MAX_WIDTH,
      tandem: orbitsRadioButtonTandem.createTandem('orbitsText')
    }), {
      radius: radioButtonRadius,
      tandem: orbitsRadioButtonTandem
    });
    const cloudRadioButtonTandem = tandem.createTandem('cloudRadioButton');
    const cloudRadioButton = new AquaRadioButton(model.electronShellDepictionProperty, 'cloud', new Text(cloudString, {
      font: ELECTRON_VIEW_CONTROL_FONT,
      maxWidth: ELECTRON_VIEW_CONTROL_MAX_WIDTH,
      tandem: cloudRadioButtonTandem.createTandem('cloudText')
    }), {
      radius: radioButtonRadius,
      tandem: cloudRadioButtonTandem
    });
    const electronViewButtonGroup = new Node({
      tandem: tandem.createTandem('electronViewButtonGroup')
    });
    electronViewButtonGroup.addChild(new Text(modelString, {
      font: new PhetFont({
        size: 14,
        weight: 'bold'
      }),
      maxWidth: ELECTRON_VIEW_CONTROL_MAX_WIDTH + 20,
      tandem: tandem.createTandem('electronViewButtonGroupLabelText')
    }));
    orbitsRadioButton.top = electronViewButtonGroup.bottom + 5;
    orbitsRadioButton.left = electronViewButtonGroup.left;
    electronViewButtonGroup.addChild(orbitsRadioButton);
    cloudRadioButton.top = electronViewButtonGroup.bottom + 5;
    cloudRadioButton.left = electronViewButtonGroup.left;
    electronViewButtonGroup.addChild(cloudRadioButton);
    this.addChild(electronViewButtonGroup);

    // Add the reset button.
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - CONTROLS_INSET,
      bottom: this.layoutBounds.maxY - CONTROLS_INSET,
      radius: BAASharedConstants.RESET_BUTTON_RADIUS,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // Do the layout.
    particleCountDisplay.top = CONTROLS_INSET;
    particleCountDisplay.left = CONTROLS_INSET;
    this.periodicTableAccordionBox.top = CONTROLS_INSET;
    this.periodicTableAccordionBox.right = this.layoutBounds.maxX - CONTROLS_INSET;
    labelVisibilityControlPanel.left = this.periodicTableAccordionBox.left;
    labelVisibilityControlPanel.bottom = this.layoutBounds.height - CONTROLS_INSET;
    labelVisibilityControlPanelTitleText.bottom = labelVisibilityControlPanel.top;
    labelVisibilityControlPanelTitleText.centerX = labelVisibilityControlPanel.centerX;
    electronViewButtonGroup.left = atomNode.right + 30;
    electronViewButtonGroup.bottom = atomNode.bottom + 5;

    // Any other objects added by class calling it will be added in this node for layering purposes
    this.controlPanelLayer = new Node({
      tandem: tandem.createTandem('controlPanelLayer')
    });
    this.addChild(this.controlPanelLayer);
    this.addChild(nucleonElectronLayer);
    this.addChild(bucketFrontLayer);
  }

  // @public
  reset() {
    this.periodicTableAccordionBoxExpandedProperty.reset();
  }
}

// @public export for usage when creating shred Particles
BAAScreenView.NUM_NUCLEON_LAYERS = NUM_NUCLEON_LAYERS;
buildAnAtom.register('BAAScreenView', BAAScreenView);
export default BAAScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlNoYXBlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkJ1Y2tldEZyb250IiwiQnVja2V0SG9sZSIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJOb2RlIiwiUGF0aCIsIlRleHQiLCJTaHJlZENvbnN0YW50cyIsIkF0b21Ob2RlIiwiQnVja2V0RHJhZ0xpc3RlbmVyIiwiUGFydGljbGVDb3VudERpc3BsYXkiLCJQYXJ0aWNsZVZpZXciLCJBY2NvcmRpb25Cb3giLCJBcXVhUmFkaW9CdXR0b24iLCJQYW5lbCIsIlZlcnRpY2FsQ2hlY2tib3hHcm91cCIsIlBlcmlvZGljVGFibGVBbmRTeW1ib2wiLCJidWlsZEFuQXRvbSIsIkJ1aWxkQW5BdG9tU3RyaW5ncyIsIkJBQUdsb2JhbFByZWZlcmVuY2VzIiwiQkFBUXVlcnlQYXJhbWV0ZXJzIiwiQkFBU2hhcmVkQ29uc3RhbnRzIiwiY2xvdWRTdHJpbmciLCJjbG91ZCIsImVsZW1lbnRTdHJpbmciLCJlbGVtZW50IiwibW9kZWxTdHJpbmciLCJtb2RlbCIsIm5ldXRyYWxTbGFzaElvblN0cmluZyIsIm5ldXRyYWxTbGFzaElvbiIsIm9yYml0c1N0cmluZyIsIm9yYml0cyIsInNob3dTdHJpbmciLCJzaG93Iiwic3RhYmxlU2xhc2hVbnN0YWJsZVN0cmluZyIsInN0YWJsZVNsYXNoVW5zdGFibGUiLCJDT05UUk9MU19JTlNFVCIsIkxBQkVMX0NPTlRST0xfRk9OVCIsIkxBQkVMX0NPTlRST0xfTUFYX1dJRFRIIiwiTEFCRUxfQ09OVFJPTF9MSU5FX1dJRFRIIiwiRUxFQ1RST05fVklFV19DT05UUk9MX0ZPTlQiLCJFTEVDVFJPTl9WSUVXX0NPTlRST0xfTUFYX1dJRFRIIiwiTlVNX05VQ0xFT05fTEFZRVJTIiwiQkFBU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwibGF5b3V0Qm91bmRzIiwiTEFZT1VUX0JPVU5EUyIsInJlc2V0RnVuY3Rpb25zIiwicGVyaW9kaWNUYWJsZUFjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJ3aWR0aCIsImhlaWdodCIsImF0b21Ob2RlIiwicGFydGljbGVBdG9tIiwic2hvd0VsZW1lbnROYW1lUHJvcGVydHkiLCJzaG93TmV1dHJhbE9ySW9uUHJvcGVydHkiLCJzaG93U3RhYmxlT3JVbnN0YWJsZVByb3BlcnR5IiwiZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5IiwiYWRkQ2hpbGQiLCJfIiwiZWFjaCIsImJ1Y2tldHMiLCJidWNrZXQiLCJwaWNrYWJsZSIsInNwaGVyZUJ1Y2tldFRhbmRlbSIsIm5hbWUiLCJudWNsZW9uRWxlY3Ryb25MYXllciIsIm51Y2xlb25MYXllcnMiLCJ0aW1lcyIsIm51Y2xlb25MYXllciIsInB1c2giLCJyZXZlcnNlIiwiZWxlY3Ryb25MYXllciIsImxheWVyU3BsaXQiLCJudWNsZW9uc0dyb3VwVGFuZGVtIiwiY3JlYXRlR3JvdXBUYW5kZW0iLCJlbGVjdHJvbnNHcm91cFRhbmRlbSIsInBhcnRpY2xlRHJhZ0JvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwibnVjbGVvbnMiLCJmb3JFYWNoIiwibnVjbGVvbiIsInpMYXllclByb3BlcnR5IiwiZ2V0IiwiZHJhZ0JvdW5kcyIsImhpZ2hDb250cmFzdFByb3BlcnR5IiwiaGlnaENvbnRyYXN0UGFydGljbGVzUHJvcGVydHkiLCJjcmVhdGVOZXh0VGFuZGVtIiwibGluayIsInpMYXllciIsImFzc2VydCIsImxlbmd0aCIsIm9uQ29ycmVjdExheWVyIiwiY2hpbGRyZW4iLCJwYXJ0aWNsZVZpZXciLCJwYXJ0aWNsZSIsImxheWVySW5kZXgiLCJjaGlsZEluZGV4IiwicmVtb3ZlQ2hpbGRBdCIsImVsZWN0cm9ucyIsImVsZWN0cm9uIiwidXBkYXRlRWxlY3Ryb25WaXNpYmlsaXR5IiwiZ2V0Q2hpbGRyZW4iLCJlbGVjdHJvbk5vZGUiLCJ2aXNpYmxlIiwiaW5jbHVkZXMiLCJsZW5ndGhQcm9wZXJ0eSIsImJ1Y2tldEZyb250TGF5ZXIiLCJidWNrZXRGcm9udCIsImFkZElucHV0TGlzdGVuZXIiLCJwYXJ0aWNsZUNvdW50RGlzcGxheSIsInBlcmlvZGljVGFibGVBbmRTeW1ib2wiLCJzY2FsZSIsInBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3hUYW5kZW0iLCJwZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94IiwiY29ybmVyUmFkaXVzIiwidGl0bGVOb2RlIiwiZm9udCIsIkFDQ09SRElPTl9CT1hfVElUTEVfRk9OVCIsIm1heFdpZHRoIiwiQUNDT1JESU9OX0JPWF9USVRMRV9NQVhfV0lEVEgiLCJmaWxsIiwiRElTUExBWV9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiY29udGVudEFsaWduIiwidGl0bGVBbGlnblgiLCJidXR0b25BbGlnbiIsImV4cGFuZGVkUHJvcGVydHkiLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJsYWJlbENvbnRlbnQiLCJsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWxUYW5kZW0iLCJjaGVja2JveEl0ZW1zIiwiY3JlYXRlTm9kZSIsInByb3BlcnR5IiwidGFuZGVtTmFtZSIsInNob3dTdGFibGVVbnN0YWJsZUNoZWNrYm94IiwibGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsIiwiY2hlY2tib3hPcHRpb25zIiwiYm94V2lkdGgiLCJzcGFjaW5nIiwibGluZVdpZHRoIiwieE1hcmdpbiIsInJlc2l6ZSIsIm51bURpdmlkZXJMaW5lcyIsImRpdmlkZXJMaW5lU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJkaXZpZGVyTGluZXMiLCJkaXZpZGVyTGluZTEiLCJzdHJva2UiLCJjZW50ZXJZIiwieCIsImxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbFRpdGxlVGV4dCIsInNpemUiLCJ3ZWlnaHQiLCJyYWRpb0J1dHRvblJhZGl1cyIsIm9yYml0c1JhZGlvQnV0dG9uVGFuZGVtIiwib3JiaXRzUmFkaW9CdXR0b24iLCJyYWRpdXMiLCJjbG91ZFJhZGlvQnV0dG9uVGFuZGVtIiwiY2xvdWRSYWRpb0J1dHRvbiIsImVsZWN0cm9uVmlld0J1dHRvbkdyb3VwIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsInJpZ2h0IiwibWF4WCIsIm1heFkiLCJSRVNFVF9CVVRUT05fUkFESVVTIiwiY2VudGVyWCIsImNvbnRyb2xQYW5lbExheWVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQUFTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgdGhhdCBwcmVzZW50cyBhbiBpbnRlcmFjdGl2ZSBhdG9tIG9uIHRoZSBsZWZ0IHNpZGUsIGJ1Y2tldHMgb2YgcGFydGljbGVzIHVuZGVybmVhdGgsIGFuZCBjb250cm9scyBmb3JcclxuICogbGFiZWwgdmlzaWJpbGl0eSBhbmQgcmVzZXQuICBBIHBlcmlvZGljIHRhYmxlIGlzIGluY2x1ZGVkIG9uIHRoZSByaWdodCBzaWRlLiAgVGhpcyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGFzIGEgYmFzZVxyXG4gKiBjbGFzcyBmb3Igc2NyZWVucyB3aXRoIHNpbWlsYXIgdmlld3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBCdWNrZXRGcm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnVja2V0L0J1Y2tldEZyb250LmpzJztcclxuaW1wb3J0IEJ1Y2tldEhvbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRIb2xlLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGgsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU2hyZWRDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvU2hyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXRvbU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9BdG9tTm9kZS5qcyc7XHJcbmltcG9ydCBCdWNrZXREcmFnTGlzdGVuZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9CdWNrZXREcmFnTGlzdGVuZXIuanMnO1xyXG5pbXBvcnQgUGFydGljbGVDb3VudERpc3BsYXkgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9QYXJ0aWNsZUNvdW50RGlzcGxheS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZVZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9QYXJ0aWNsZVZpZXcuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFZlcnRpY2FsQ2hlY2tib3hHcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVmVydGljYWxDaGVja2JveEdyb3VwLmpzJztcclxuaW1wb3J0IFBlcmlvZGljVGFibGVBbmRTeW1ib2wgZnJvbSAnLi4vLi4vYXRvbS92aWV3L1BlcmlvZGljVGFibGVBbmRTeW1ib2wuanMnO1xyXG5pbXBvcnQgYnVpbGRBbkF0b20gZnJvbSAnLi4vLi4vYnVpbGRBbkF0b20uanMnO1xyXG5pbXBvcnQgQnVpbGRBbkF0b21TdHJpbmdzIGZyb20gJy4uLy4uL0J1aWxkQW5BdG9tU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQUFHbG9iYWxQcmVmZXJlbmNlcyBmcm9tICcuLi9CQUFHbG9iYWxQcmVmZXJlbmNlcy5qcyc7XHJcbmltcG9ydCBCQUFRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQkFBUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJBQVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9CQUFTaGFyZWRDb25zdGFudHMuanMnO1xyXG5cclxuLy8gc3RyaW5nc1xyXG5jb25zdCBjbG91ZFN0cmluZyA9IEJ1aWxkQW5BdG9tU3RyaW5ncy5jbG91ZDtcclxuY29uc3QgZWxlbWVudFN0cmluZyA9IEJ1aWxkQW5BdG9tU3RyaW5ncy5lbGVtZW50O1xyXG5jb25zdCBtb2RlbFN0cmluZyA9IEJ1aWxkQW5BdG9tU3RyaW5ncy5tb2RlbDtcclxuY29uc3QgbmV1dHJhbFNsYXNoSW9uU3RyaW5nID0gQnVpbGRBbkF0b21TdHJpbmdzLm5ldXRyYWxTbGFzaElvbjtcclxuY29uc3Qgb3JiaXRzU3RyaW5nID0gQnVpbGRBbkF0b21TdHJpbmdzLm9yYml0cztcclxuY29uc3Qgc2hvd1N0cmluZyA9IEJ1aWxkQW5BdG9tU3RyaW5ncy5zaG93O1xyXG5jb25zdCBzdGFibGVTbGFzaFVuc3RhYmxlU3RyaW5nID0gQnVpbGRBbkF0b21TdHJpbmdzLnN0YWJsZVNsYXNoVW5zdGFibGU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09OVFJPTFNfSU5TRVQgPSAxMDtcclxuY29uc3QgTEFCRUxfQ09OVFJPTF9GT05UID0gbmV3IFBoZXRGb250KCAxMiApO1xyXG5jb25zdCBMQUJFTF9DT05UUk9MX01BWF9XSURUSCA9IDE4MDtcclxuY29uc3QgTEFCRUxfQ09OVFJPTF9MSU5FX1dJRFRIID0gMTtcclxuY29uc3QgRUxFQ1RST05fVklFV19DT05UUk9MX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDEyICk7XHJcbmNvbnN0IEVMRUNUUk9OX1ZJRVdfQ09OVFJPTF9NQVhfV0lEVEggPSA2MDtcclxuY29uc3QgTlVNX05VQ0xFT05fTEFZRVJTID0gNTsgLy8gVGhpcyBpcyBiYXNlZCBvbiBtYXggbnVtYmVyIG9mIHBhcnRpY2xlcywgbWF5IG5lZWQgYWRqdXN0bWVudCBpZiB0aGF0IGNoYW5nZXMuXHJcblxyXG5jbGFzcyBCQUFTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QnVpbGRBbkF0b21Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBTaHJlZENvbnN0YW50cy5MQVlPVVRfQk9VTkRTLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMucmVzZXRGdW5jdGlvbnMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkXHJcbiAgICB0aGlzLnBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbW9kZWwtdmlldyB0cmFuc2Zvcm0uXHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIDAuMywgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICogMC40NSApLFxyXG4gICAgICAxLjAgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5vZGUgdGhhdCBzaG93cyB0aGUgdGV4dHVhbCBsYWJlbHMsIHRoZSBlbGVjdHJvbiBzaGVsbHMsIGFuZCB0aGUgY2VudGVyIFggbWFya2VyLlxyXG4gICAgY29uc3QgYXRvbU5vZGUgPSBuZXcgQXRvbU5vZGUoIG1vZGVsLnBhcnRpY2xlQXRvbSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgIHNob3dFbGVtZW50TmFtZVByb3BlcnR5OiBtb2RlbC5zaG93RWxlbWVudE5hbWVQcm9wZXJ0eSxcclxuICAgICAgc2hvd05ldXRyYWxPcklvblByb3BlcnR5OiBtb2RlbC5zaG93TmV1dHJhbE9ySW9uUHJvcGVydHksXHJcbiAgICAgIHNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHk6IG1vZGVsLnNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHksXHJcbiAgICAgIGVsZWN0cm9uU2hlbGxEZXBpY3Rpb25Qcm9wZXJ0eTogbW9kZWwuZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhdG9tTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYXRvbU5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGJ1Y2tldCBob2xlcy4gIERvbmUgc2VwYXJhdGVseSBmcm9tIHRoZSBidWNrZXQgZnJvbnQgZm9yIGxheWVyaW5nLlxyXG4gICAgXy5lYWNoKCBtb2RlbC5idWNrZXRzLCBidWNrZXQgPT4ge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgQnVja2V0SG9sZSggYnVja2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtidWNrZXQuc3BoZXJlQnVja2V0VGFuZGVtLm5hbWV9SG9sZWAgKVxyXG4gICAgICB9ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGxheWVyIHdoZXJlIHRoZSBudWNsZW9ucyBhbmQgZWxlY3Ryb25zIHdpbGwgZ28sIHRoaXMgaXMgYWRkZWQgbGFzdCBzbyB0aGF0IGl0IHJlbWFpbnMgb24gdG9wXHJcbiAgICBjb25zdCBudWNsZW9uRWxlY3Ryb25MYXllciA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251Y2xlb25FbGVjdHJvbkxheWVyJyApIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGxheWVycyB3aGVyZSB0aGUgbnVjbGVvbnMgd2lsbCBleGlzdC5cclxuICAgIGNvbnN0IG51Y2xlb25MYXllcnMgPSBbXTtcclxuICAgIF8udGltZXMoIE5VTV9OVUNMRU9OX0xBWUVSUywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBudWNsZW9uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgICBudWNsZW9uTGF5ZXJzLnB1c2goIG51Y2xlb25MYXllciApO1xyXG4gICAgICBudWNsZW9uRWxlY3Ryb25MYXllci5hZGRDaGlsZCggbnVjbGVvbkxheWVyICk7XHJcbiAgICB9ICk7XHJcbiAgICBudWNsZW9uTGF5ZXJzLnJldmVyc2UoKTsgLy8gU2V0IHVwIHRoZSBudWNsZW9uIGxheWVycyBzbyB0aGF0IGxheWVyIDAgaXMgaW4gZnJvbnQuXHJcblxyXG4gICAgLy8gQWRkIHRoZSBsYXllciB3aGVyZSB0aGUgZWxlY3Ryb25zIHdpbGwgZXhpc3QuXHJcbiAgICBjb25zdCBlbGVjdHJvbkxheWVyID0gbmV3IE5vZGUoIHsgbGF5ZXJTcGxpdDogdHJ1ZSwgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25MYXllcicgKSB9ICk7XHJcbiAgICBudWNsZW9uRWxlY3Ryb25MYXllci5hZGRDaGlsZCggZWxlY3Ryb25MYXllciApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbnVjbGVvbiBwYXJ0aWNsZSB2aWV3cy5cclxuICAgIGNvbnN0IG51Y2xlb25zR3JvdXBUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVjbGVvbnMnICkuY3JlYXRlR3JvdXBUYW5kZW0oICdudWNsZW9uJyApO1xyXG4gICAgY29uc3QgZWxlY3Ryb25zR3JvdXBUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25zJyApLmNyZWF0ZUdyb3VwVGFuZGVtKCAnZWxlY3Ryb24nICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBudWNsZW9uc1xyXG4gICAgY29uc3QgcGFydGljbGVEcmFnQm91bmRzID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCB0aGlzLmxheW91dEJvdW5kcyApO1xyXG4gICAgbW9kZWwubnVjbGVvbnMuZm9yRWFjaCggbnVjbGVvbiA9PiB7XHJcbiAgICAgIG51Y2xlb25MYXllcnNbIG51Y2xlb24uekxheWVyUHJvcGVydHkuZ2V0KCkgXS5hZGRDaGlsZCggbmV3IFBhcnRpY2xlVmlldyggbnVjbGVvbiwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgZHJhZ0JvdW5kczogcGFydGljbGVEcmFnQm91bmRzLFxyXG4gICAgICAgIGhpZ2hDb250cmFzdFByb3BlcnR5OiBCQUFHbG9iYWxQcmVmZXJlbmNlcy5oaWdoQ29udHJhc3RQYXJ0aWNsZXNQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IG51Y2xlb25zR3JvdXBUYW5kZW0uY3JlYXRlTmV4dFRhbmRlbSgpXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCBhZGp1c3RzIGEgbnVjbGVvbidzIHotb3JkZXIgbGF5ZXJpbmcuXHJcbiAgICAgIG51Y2xlb24uekxheWVyUHJvcGVydHkubGluayggekxheWVyID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAgICAgbnVjbGVvbkxheWVycy5sZW5ndGggPiB6TGF5ZXIsXHJcbiAgICAgICAgICAnekxheWVyIGZvciBudWNsZW9uIGV4Y2VlZHMgbnVtYmVyIG9mIGxheWVycywgbWF4IG51bWJlciBtYXkgbmVlZCBpbmNyZWFzaW5nLidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIG51Y2xlb24gdmlldyBpcyBvbiB0aGUgY29ycmVjdCBsYXllci5cclxuICAgICAgICBsZXQgb25Db3JyZWN0TGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICBudWNsZW9uTGF5ZXJzWyB6TGF5ZXIgXS5jaGlsZHJlbi5mb3JFYWNoKCBwYXJ0aWNsZVZpZXcgPT4ge1xyXG4gICAgICAgICAgaWYgKCBwYXJ0aWNsZVZpZXcucGFydGljbGUgPT09IG51Y2xlb24gKSB7XHJcbiAgICAgICAgICAgIG9uQ29ycmVjdExheWVyID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIGlmICggIW9uQ29ycmVjdExheWVyICkge1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBwYXJ0aWNsZSB2aWV3IGZyb20gaXRzIGN1cnJlbnQgbGF5ZXIuXHJcbiAgICAgICAgICBsZXQgcGFydGljbGVWaWV3ID0gbnVsbDtcclxuICAgICAgICAgIGZvciAoIGxldCBsYXllckluZGV4ID0gMDsgbGF5ZXJJbmRleCA8IG51Y2xlb25MYXllcnMubGVuZ3RoICYmIHBhcnRpY2xlVmlldyA9PT0gbnVsbDsgbGF5ZXJJbmRleCsrICkge1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBudWNsZW9uTGF5ZXJzWyBsYXllckluZGV4IF0uY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KysgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCBudWNsZW9uTGF5ZXJzWyBsYXllckluZGV4IF0uY2hpbGRyZW5bIGNoaWxkSW5kZXggXS5wYXJ0aWNsZSA9PT0gbnVjbGVvbiApIHtcclxuICAgICAgICAgICAgICAgIHBhcnRpY2xlVmlldyA9IG51Y2xlb25MYXllcnNbIGxheWVySW5kZXggXS5jaGlsZHJlblsgY2hpbGRJbmRleCBdO1xyXG4gICAgICAgICAgICAgICAgbnVjbGVvbkxheWVyc1sgbGF5ZXJJbmRleCBdLnJlbW92ZUNoaWxkQXQoIGNoaWxkSW5kZXggKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEFkZCB0aGUgcGFydGljbGUgdmlldyB0byBpdHMgbmV3IGxheWVyLlxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGFydGljbGVWaWV3ICE9PSBudWxsLCAnUGFydGljbGUgdmlldyBub3QgZm91bmQgZHVyaW5nIHJlbGF5ZXJpbmcnICk7XHJcbiAgICAgICAgICBudWNsZW9uTGF5ZXJzWyB6TGF5ZXIgXS5hZGRDaGlsZCggcGFydGljbGVWaWV3ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBlbGVjdHJvbiBwYXJ0aWNsZSB2aWV3cy5cclxuICAgIG1vZGVsLmVsZWN0cm9ucy5mb3JFYWNoKCBlbGVjdHJvbiA9PiB7XHJcbiAgICAgIGVsZWN0cm9uTGF5ZXIuYWRkQ2hpbGQoIG5ldyBQYXJ0aWNsZVZpZXcoIGVsZWN0cm9uLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICBkcmFnQm91bmRzOiBwYXJ0aWNsZURyYWdCb3VuZHMsXHJcbiAgICAgICAgaGlnaENvbnRyYXN0UHJvcGVydHk6IEJBQUdsb2JhbFByZWZlcmVuY2VzLmhpZ2hDb250cmFzdFBhcnRpY2xlc1Byb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogZWxlY3Ryb25zR3JvdXBUYW5kZW0uY3JlYXRlTmV4dFRhbmRlbSgpXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGVsZWN0cm9ucyBhcmUgcmVwcmVzZW50ZWQgYXMgYSBjbG91ZCwgdGhlIGluZGl2aWR1YWwgcGFydGljbGVzIGJlY29tZSBpbnZpc2libGUgd2hlbiBhZGRlZCB0byB0aGUgYXRvbS5cclxuICAgIGNvbnN0IHVwZGF0ZUVsZWN0cm9uVmlzaWJpbGl0eSA9ICgpID0+IHtcclxuICAgICAgZWxlY3Ryb25MYXllci5nZXRDaGlsZHJlbigpLmZvckVhY2goIGVsZWN0cm9uTm9kZSA9PiB7XHJcbiAgICAgICAgZWxlY3Ryb25Ob2RlLnZpc2libGUgPSBtb2RlbC5lbGVjdHJvblNoZWxsRGVwaWN0aW9uUHJvcGVydHkuZ2V0KCkgPT09ICdvcmJpdHMnIHx8ICFtb2RlbC5wYXJ0aWNsZUF0b20uZWxlY3Ryb25zLmluY2x1ZGVzKCBlbGVjdHJvbk5vZGUucGFydGljbGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICAgIG1vZGVsLnBhcnRpY2xlQXRvbS5lbGVjdHJvbnMubGVuZ3RoUHJvcGVydHkubGluayggdXBkYXRlRWxlY3Ryb25WaXNpYmlsaXR5ICk7XHJcbiAgICBtb2RlbC5lbGVjdHJvblNoZWxsRGVwaWN0aW9uUHJvcGVydHkubGluayggdXBkYXRlRWxlY3Ryb25WaXNpYmlsaXR5ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBmcm9udCBwb3J0aW9uIG9mIHRoZSBidWNrZXRzLiBUaGlzIGlzIGRvbmUgc2VwYXJhdGVseSBmcm9tIHRoZSBidWNrZXQgaG9sZXMgZm9yIGxheWVyaW5nIHB1cnBvc2VzLlxyXG4gICAgY29uc3QgYnVja2V0RnJvbnRMYXllciA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1Y2tldEZyb250TGF5ZXInICkgfSApO1xyXG5cclxuICAgIF8uZWFjaCggbW9kZWwuYnVja2V0cywgYnVja2V0ID0+IHtcclxuICAgICAgY29uc3QgYnVja2V0RnJvbnQgPSBuZXcgQnVja2V0RnJvbnQoIGJ1Y2tldCwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtidWNrZXQuc3BoZXJlQnVja2V0VGFuZGVtLm5hbWV9RnJvbnROb2RlYCApXHJcbiAgICAgIH0gKTtcclxuICAgICAgYnVja2V0RnJvbnRMYXllci5hZGRDaGlsZCggYnVja2V0RnJvbnQgKTtcclxuICAgICAgYnVja2V0RnJvbnQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEJ1Y2tldERyYWdMaXN0ZW5lciggYnVja2V0LCBidWNrZXRGcm9udCwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtidWNrZXQuc3BoZXJlQnVja2V0VGFuZGVtLm5hbWV9RHJhZ0xpc3RlbmVyYCApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgcGFydGljbGUgY291bnQgaW5kaWNhdG9yLlxyXG4gICAgY29uc3QgcGFydGljbGVDb3VudERpc3BsYXkgPSBuZXcgUGFydGljbGVDb3VudERpc3BsYXkoIG1vZGVsLnBhcnRpY2xlQXRvbSwgMTMsIDI1MCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXJ0aWNsZUNvdW50RGlzcGxheScgKVxyXG4gICAgfSApOyAgLy8gV2lkdGggYXJiaXRyYXJpbHkgY2hvc2VuLlxyXG4gICAgdGhpcy5hZGRDaGlsZCggcGFydGljbGVDb3VudERpc3BsYXkgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHBlcmlvZGljIHRhYmxlIGRpc3BsYXkgaW5zaWRlIG9mIGFuIGFjY29yZGlvbiBib3guXHJcbiAgICBjb25zdCBwZXJpb2RpY1RhYmxlQW5kU3ltYm9sID0gbmV3IFBlcmlvZGljVGFibGVBbmRTeW1ib2woXHJcbiAgICAgIG1vZGVsLnBhcnRpY2xlQXRvbSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BlcmlvZGljVGFibGVBbmRTeW1ib2wnICksXHJcbiAgICAgIHtcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHBlcmlvZGljVGFibGVBbmRTeW1ib2wuc2NhbGUoIDAuNTUgKTsgLy8gU2NhbGUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBtYXRjaCBsYXlvdXQgaW4gZGVzaWduIGRvYy5cclxuICAgIGNvbnN0IHBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3hUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVyaW9kaWNUYWJsZUFjY29yZGlvbkJveCcgKTtcclxuICAgIHRoaXMucGVyaW9kaWNUYWJsZUFjY29yZGlvbkJveCA9IG5ldyBBY2NvcmRpb25Cb3goIHBlcmlvZGljVGFibGVBbmRTeW1ib2wsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBlbGVtZW50U3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogU2hyZWRDb25zdGFudHMuQUNDT1JESU9OX0JPWF9USVRMRV9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiBTaHJlZENvbnN0YW50cy5BQ0NPUkRJT05fQk9YX1RJVExFX01BWF9XSURUSCxcclxuICAgICAgICB0YW5kZW06IHBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3hUYW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgZmlsbDogU2hyZWRDb25zdGFudHMuRElTUExBWV9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SLFxyXG4gICAgICBjb250ZW50QWxpZ246ICdsZWZ0JyxcclxuICAgICAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICAgICAgYnV0dG9uQWxpZ246ICdyaWdodCcsXHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHk6IHRoaXMucGVyaW9kaWNUYWJsZUFjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTIsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMlxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3hUYW5kZW0sXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIGxhYmVsQ29udGVudDogZWxlbWVudFN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94ICk7XHJcblxyXG4gICAgY29uc3QgbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbCcgKTtcclxuICAgIGNvbnN0IGNoZWNrYm94SXRlbXMgPSBbIHtcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBUZXh0KCBlbGVtZW50U3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogTEFCRUxfQ09OVFJPTF9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiBMQUJFTF9DT05UUk9MX01BWF9XSURUSCxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVtZW50VGV4dCcgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93RWxlbWVudE5hbWVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtTmFtZTogJ3Nob3dFbGVtZW50TmFtZUNoZWNrYm94J1xyXG4gICAgfSwge1xyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IFRleHQoIG5ldXRyYWxTbGFzaElvblN0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IExBQkVMX0NPTlRST0xfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogTEFCRUxfQ09OVFJPTF9NQVhfV0lEVEgsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV1dHJhbE9ySW9uVGV4dCcgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93TmV1dHJhbE9ySW9uUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdzaG93TmV1dHJhbE9ySW9uQ2hlY2tib3gnXHJcbiAgICB9IF07XHJcblxyXG4gICAgLy8gSW4gc3VwcG9ydCBvZiBhIHJlc2VhcmNoIHN0dWR5LCBpdCBpcyBwb3NzaWJsZSB0byBleGNsdWRlIHRoZSBzdGFibGUvdW5zdGFibGUgY2hlY2tib3gsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NwZWNpYWwtb3BzL2lzc3Vlcy8xODkuXHJcbiAgICBpZiAoIEJBQVF1ZXJ5UGFyYW1ldGVycy5zaG93U3RhYmxlVW5zdGFibGVDaGVja2JveCApIHtcclxuICAgICAgY2hlY2tib3hJdGVtcy5wdXNoKCB7XHJcbiAgICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBUZXh0KCBzdGFibGVTbGFzaFVuc3RhYmxlU3RyaW5nLCB7XHJcbiAgICAgICAgICBmb250OiBMQUJFTF9DT05UUk9MX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogTEFCRUxfQ09OVFJPTF9NQVhfV0lEVEgsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGFibGVVbnN0YWJsZVRleHQnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgcHJvcGVydHk6IG1vZGVsLnNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dTdGFibGVPclVuc3RhYmxlQ2hlY2tib3gnXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWwgPSBuZXcgUGFuZWwoIG5ldyBWZXJ0aWNhbENoZWNrYm94R3JvdXAoIGNoZWNrYm94SXRlbXMsIHtcclxuICAgICAgY2hlY2tib3hPcHRpb25zOiB7IGJveFdpZHRoOiAxMiB9LFxyXG4gICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFZpc2liaWxpdHlDaGVja2JveEdyb3VwJyApXHJcbiAgICB9ICksIHtcclxuICAgICAgZmlsbDogJ3JnYiggMjQ1LCAyNDUsIDI0NSApJyxcclxuICAgICAgbGluZVdpZHRoOiBMQUJFTF9DT05UUk9MX0xJTkVfV0lEVEgsXHJcbiAgICAgIHhNYXJnaW46IDcuNSxcclxuICAgICAgY29ybmVyUmFkaXVzOiA1LFxyXG4gICAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IGxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbFRhbmRlbVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbnVtRGl2aWRlckxpbmVzID0gY2hlY2tib3hJdGVtcy5sZW5ndGggLSAxO1xyXG4gICAgY29uc3QgZGl2aWRlckxpbmVTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsLndpZHRoIC0gMiAqIExBQkVMX0NPTlRST0xfTElORV9XSURUSCwgMCApO1xyXG4gICAgZm9yICggbGV0IGRpdmlkZXJMaW5lcyA9IDA7IGRpdmlkZXJMaW5lcyA8IG51bURpdmlkZXJMaW5lczsgZGl2aWRlckxpbmVzKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpdmlkZXJMaW5lMSA9IG5ldyBQYXRoKCBkaXZpZGVyTGluZVNoYXBlLCB7XHJcbiAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICAgIGNlbnRlclk6IGxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbC5oZWlnaHQgKiAoIGRpdmlkZXJMaW5lcyArIDEgKSAvICggbnVtRGl2aWRlckxpbmVzICsgMSApLFxyXG4gICAgICAgIHg6IExBQkVMX0NPTlRST0xfTElORV9XSURUSCAvIDJcclxuICAgICAgfSApO1xyXG4gICAgICBsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWwuYWRkQ2hpbGQoIGRpdmlkZXJMaW5lMSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbCApO1xyXG4gICAgY29uc3QgbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsVGl0bGVUZXh0ID0gbmV3IFRleHQoIHNob3dTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIG1heFdpZHRoOiBsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWwud2lkdGgsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbFRpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsVGl0bGVUZXh0ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSByYWRpbyBidXR0b25zIHRoYXQgY29udHJvbCB0aGUgZWxlY3Ryb24gcmVwcmVzZW50YXRpb24gaW4gdGhlIGF0b20uXHJcbiAgICBjb25zdCByYWRpb0J1dHRvblJhZGl1cyA9IDY7XHJcbiAgICBjb25zdCBvcmJpdHNSYWRpb0J1dHRvblRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvcmJpdHNSYWRpb0J1dHRvbicgKTtcclxuICAgIGNvbnN0IG9yYml0c1JhZGlvQnV0dG9uID0gbmV3IEFxdWFSYWRpb0J1dHRvbihcclxuICAgICAgbW9kZWwuZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5LFxyXG4gICAgICAnb3JiaXRzJyxcclxuICAgICAgbmV3IFRleHQoIG9yYml0c1N0cmluZywge1xyXG4gICAgICAgICAgZm9udDogRUxFQ1RST05fVklFV19DT05UUk9MX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogRUxFQ1RST05fVklFV19DT05UUk9MX01BWF9XSURUSCxcclxuICAgICAgICAgIHRhbmRlbTogb3JiaXRzUmFkaW9CdXR0b25UYW5kZW0uY3JlYXRlVGFuZGVtKCAnb3JiaXRzVGV4dCcgKVxyXG4gICAgICAgIH1cclxuICAgICAgKSxcclxuICAgICAgeyByYWRpdXM6IHJhZGlvQnV0dG9uUmFkaXVzLCB0YW5kZW06IG9yYml0c1JhZGlvQnV0dG9uVGFuZGVtIH1cclxuICAgICk7XHJcbiAgICBjb25zdCBjbG91ZFJhZGlvQnV0dG9uVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nsb3VkUmFkaW9CdXR0b24nICk7XHJcbiAgICBjb25zdCBjbG91ZFJhZGlvQnV0dG9uID0gbmV3IEFxdWFSYWRpb0J1dHRvbihcclxuICAgICAgbW9kZWwuZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5LFxyXG4gICAgICAnY2xvdWQnLFxyXG4gICAgICBuZXcgVGV4dCggY2xvdWRTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBFTEVDVFJPTl9WSUVXX0NPTlRST0xfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogRUxFQ1RST05fVklFV19DT05UUk9MX01BWF9XSURUSCxcclxuICAgICAgICB0YW5kZW06IGNsb3VkUmFkaW9CdXR0b25UYW5kZW0uY3JlYXRlVGFuZGVtKCAnY2xvdWRUZXh0JyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgeyByYWRpdXM6IHJhZGlvQnV0dG9uUmFkaXVzLCB0YW5kZW06IGNsb3VkUmFkaW9CdXR0b25UYW5kZW0gfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGVsZWN0cm9uVmlld0J1dHRvbkdyb3VwID0gbmV3IE5vZGUoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25WaWV3QnV0dG9uR3JvdXAnICkgfSApO1xyXG4gICAgZWxlY3Ryb25WaWV3QnV0dG9uR3JvdXAuYWRkQ2hpbGQoIG5ldyBUZXh0KCBtb2RlbFN0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHtcclxuICAgICAgICBzaXplOiAxNCxcclxuICAgICAgICB3ZWlnaHQ6ICdib2xkJ1xyXG4gICAgICB9ICksXHJcbiAgICAgIG1heFdpZHRoOiBFTEVDVFJPTl9WSUVXX0NPTlRST0xfTUFYX1dJRFRIICsgMjAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uVmlld0J1dHRvbkdyb3VwTGFiZWxUZXh0JyApXHJcbiAgICB9ICkgKTtcclxuICAgIG9yYml0c1JhZGlvQnV0dG9uLnRvcCA9IGVsZWN0cm9uVmlld0J1dHRvbkdyb3VwLmJvdHRvbSArIDU7XHJcbiAgICBvcmJpdHNSYWRpb0J1dHRvbi5sZWZ0ID0gZWxlY3Ryb25WaWV3QnV0dG9uR3JvdXAubGVmdDtcclxuICAgIGVsZWN0cm9uVmlld0J1dHRvbkdyb3VwLmFkZENoaWxkKCBvcmJpdHNSYWRpb0J1dHRvbiApO1xyXG4gICAgY2xvdWRSYWRpb0J1dHRvbi50b3AgPSBlbGVjdHJvblZpZXdCdXR0b25Hcm91cC5ib3R0b20gKyA1O1xyXG4gICAgY2xvdWRSYWRpb0J1dHRvbi5sZWZ0ID0gZWxlY3Ryb25WaWV3QnV0dG9uR3JvdXAubGVmdDtcclxuICAgIGVsZWN0cm9uVmlld0J1dHRvbkdyb3VwLmFkZENoaWxkKCBjbG91ZFJhZGlvQnV0dG9uICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlbGVjdHJvblZpZXdCdXR0b25Hcm91cCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgcmVzZXQgYnV0dG9uLlxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLm1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIENPTlRST0xTX0lOU0VULFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBDT05UUk9MU19JTlNFVCxcclxuICAgICAgcmFkaXVzOiBCQUFTaGFyZWRDb25zdGFudHMuUkVTRVRfQlVUVE9OX1JBRElVUyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gRG8gdGhlIGxheW91dC5cclxuICAgIHBhcnRpY2xlQ291bnREaXNwbGF5LnRvcCA9IENPTlRST0xTX0lOU0VUO1xyXG4gICAgcGFydGljbGVDb3VudERpc3BsYXkubGVmdCA9IENPTlRST0xTX0lOU0VUO1xyXG4gICAgdGhpcy5wZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94LnRvcCA9IENPTlRST0xTX0lOU0VUO1xyXG4gICAgdGhpcy5wZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94LnJpZ2h0ID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIENPTlRST0xTX0lOU0VUO1xyXG4gICAgbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsLmxlZnQgPSB0aGlzLnBlcmlvZGljVGFibGVBY2NvcmRpb25Cb3gubGVmdDtcclxuICAgIGxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbC5ib3R0b20gPSB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgLSBDT05UUk9MU19JTlNFVDtcclxuICAgIGxhYmVsVmlzaWJpbGl0eUNvbnRyb2xQYW5lbFRpdGxlVGV4dC5ib3R0b20gPSBsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWwudG9wO1xyXG4gICAgbGFiZWxWaXNpYmlsaXR5Q29udHJvbFBhbmVsVGl0bGVUZXh0LmNlbnRlclggPSBsYWJlbFZpc2liaWxpdHlDb250cm9sUGFuZWwuY2VudGVyWDtcclxuICAgIGVsZWN0cm9uVmlld0J1dHRvbkdyb3VwLmxlZnQgPSBhdG9tTm9kZS5yaWdodCArIDMwO1xyXG4gICAgZWxlY3Ryb25WaWV3QnV0dG9uR3JvdXAuYm90dG9tID0gYXRvbU5vZGUuYm90dG9tICsgNTtcclxuXHJcbiAgICAvLyBBbnkgb3RoZXIgb2JqZWN0cyBhZGRlZCBieSBjbGFzcyBjYWxsaW5nIGl0IHdpbGwgYmUgYWRkZWQgaW4gdGhpcyBub2RlIGZvciBsYXllcmluZyBwdXJwb3Nlc1xyXG4gICAgdGhpcy5jb250cm9sUGFuZWxMYXllciA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbExheWVyJyApIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY29udHJvbFBhbmVsTGF5ZXIgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBudWNsZW9uRWxlY3Ryb25MYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYnVja2V0RnJvbnRMYXllciApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wZXJpb2RpY1RhYmxlQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpYyBleHBvcnQgZm9yIHVzYWdlIHdoZW4gY3JlYXRpbmcgc2hyZWQgUGFydGljbGVzXHJcbkJBQVNjcmVlblZpZXcuTlVNX05VQ0xFT05fTEFZRVJTID0gTlVNX05VQ0xFT05fTEFZRVJTO1xyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdCQUFTY3JlZW5WaWV3JywgQkFBU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBCQUFTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxXQUFXLE1BQU0sbURBQW1EO0FBQzNFLE9BQU9DLFVBQVUsTUFBTSxrREFBa0Q7QUFDekUsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx3Q0FBd0M7QUFDbkUsT0FBT0MsUUFBUSxNQUFNLHVDQUF1QztBQUM1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