// Copyright 2015-2022, University of Colorado Boulder

/**
 * Control panel that present a user interface for controlling the affinity of RNA polymerase to DNA plus a
 * transcription factor.
 *
 * @author Mohamed Safi
 * @author John Blanco
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Spacer, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import GEEConstants from '../../common/GEEConstants.js';
import DnaMolecule from '../../common/model/DnaMolecule.js';
import RnaPolymerase from '../../common/model/RnaPolymerase.js';
import TranscriptionFactor from '../../common/model/TranscriptionFactor.js';
import DnaMoleculeNode from '../../common/view/DnaMoleculeNode.js';
import MobileBiomoleculeNode from '../../common/view/MobileBiomoleculeNode.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GeneExpressionEssentialsStrings from '../../GeneExpressionEssentialsStrings.js';
import AffinityController from './AffinityController.js';

// constants
const TITLE_FONT = new PhetFont({
  size: 16,
  weight: 'bold'
});
const POLYMERASE_SCALE = 0.08;
const POLYMERASE_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(0, 0), POLYMERASE_SCALE);
const DNA_AND_TF_SCALE = 0.08;
const DNA_AND_TF_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(0, 0), DNA_AND_TF_SCALE);

//strings
const rnaPolymeraseString = GeneExpressionEssentialsStrings.rnaPolymerase;
class PolymeraseAffinityControlPanel extends Panel {
  /**
   * @param {TranscriptionFactorConfig} tfConfig
   * @param {number} minHeight
   * @param {Property} polymeraseAffinityProperty
   */
  constructor(tfConfig, minHeight, polymeraseAffinityProperty) {
    const titleNode = new Text(rnaPolymeraseString, {
      font: TITLE_FONT,
      maxWidth: 180
    });

    // Create the affinity control node.
    const polymeraseNode = new MobileBiomoleculeNode(POLYMERASE_MVT, new RnaPolymerase());
    const dnaFragmentNode = new DnaMoleculeNode(new DnaMolecule(null, GEEConstants.BASE_PAIRS_PER_TWIST * 2 + 1, 0.0, true), DNA_AND_TF_MVT, 2, false).toDataURLNodeSynchronous(); // make this into an image in the control panel so another canvas isn't created
    const transcriptionFactorNode = new MobileBiomoleculeNode(DNA_AND_TF_MVT, new TranscriptionFactor(null, tfConfig));

    // Set position to be on top of the dna, values empirically determined.
    transcriptionFactorNode.x = 25;
    transcriptionFactorNode.y = 0;
    dnaFragmentNode.addChild(transcriptionFactorNode);
    const panelOptions = {
      cornerRadius: GEEConstants.CORNER_RADIUS,
      fill: new Color(250, 250, 250),
      lineWidth: 2,
      xMargin: 10,
      yMargin: 10,
      minWidth: 200,
      align: 'center',
      resize: false
    };

    // In order to size the control panel correctly, make one first, see how far off it is, and then make one of the
    // correct size.
    const dummyContents = new VBox({
      children: [titleNode, new AffinityController(polymeraseNode, dnaFragmentNode, new Property(0))],
      spacing: 20
    });
    const dummyControlPanel = new Panel(dummyContents, panelOptions);
    const growthAmount = minHeight - dummyControlPanel.height - 40;
    dummyControlPanel.dispose();
    dummyContents.dispose();

    // Create the spacers used to make the panel meet the min size.
    const topSpacer = new Spacer(0, growthAmount * 0.25);
    const bottomSpacer = new Spacer(0, growthAmount * 0.75);
    const contents = new VBox({
      children: [titleNode, topSpacer, new AffinityController(polymeraseNode, dnaFragmentNode, polymeraseAffinityProperty), bottomSpacer],
      spacing: 20
    });
    super(contents, panelOptions);
  }
}
geneExpressionEssentials.register('PolymeraseAffinityControlPanel', PolymeraseAffinityControlPanel);
export default PolymeraseAffinityControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiUGhldEZvbnQiLCJDb2xvciIsIlNwYWNlciIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJHRUVDb25zdGFudHMiLCJEbmFNb2xlY3VsZSIsIlJuYVBvbHltZXJhc2UiLCJUcmFuc2NyaXB0aW9uRmFjdG9yIiwiRG5hTW9sZWN1bGVOb2RlIiwiTW9iaWxlQmlvbW9sZWN1bGVOb2RlIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncyIsIkFmZmluaXR5Q29udHJvbGxlciIsIlRJVExFX0ZPTlQiLCJzaXplIiwid2VpZ2h0IiwiUE9MWU1FUkFTRV9TQ0FMRSIsIlBPTFlNRVJBU0VfTVZUIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJETkFfQU5EX1RGX1NDQUxFIiwiRE5BX0FORF9URl9NVlQiLCJybmFQb2x5bWVyYXNlU3RyaW5nIiwicm5hUG9seW1lcmFzZSIsIlBvbHltZXJhc2VBZmZpbml0eUNvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwidGZDb25maWciLCJtaW5IZWlnaHQiLCJwb2x5bWVyYXNlQWZmaW5pdHlQcm9wZXJ0eSIsInRpdGxlTm9kZSIsImZvbnQiLCJtYXhXaWR0aCIsInBvbHltZXJhc2VOb2RlIiwiZG5hRnJhZ21lbnROb2RlIiwiQkFTRV9QQUlSU19QRVJfVFdJU1QiLCJ0b0RhdGFVUkxOb2RlU3luY2hyb25vdXMiLCJ0cmFuc2NyaXB0aW9uRmFjdG9yTm9kZSIsIngiLCJ5IiwiYWRkQ2hpbGQiLCJwYW5lbE9wdGlvbnMiLCJjb3JuZXJSYWRpdXMiLCJDT1JORVJfUkFESVVTIiwiZmlsbCIsImxpbmVXaWR0aCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibWluV2lkdGgiLCJhbGlnbiIsInJlc2l6ZSIsImR1bW15Q29udGVudHMiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJkdW1teUNvbnRyb2xQYW5lbCIsImdyb3d0aEFtb3VudCIsImhlaWdodCIsImRpc3Bvc2UiLCJ0b3BTcGFjZXIiLCJib3R0b21TcGFjZXIiLCJjb250ZW50cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9seW1lcmFzZUFmZmluaXR5Q29udHJvbFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2wgcGFuZWwgdGhhdCBwcmVzZW50IGEgdXNlciBpbnRlcmZhY2UgZm9yIGNvbnRyb2xsaW5nIHRoZSBhZmZpbml0eSBvZiBSTkEgcG9seW1lcmFzZSB0byBETkEgcGx1cyBhXHJcbiAqIHRyYW5zY3JpcHRpb24gZmFjdG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBTcGFjZXIsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IEdFRUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR0VFQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IERuYU1vbGVjdWxlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9EbmFNb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBSbmFQb2x5bWVyYXNlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9SbmFQb2x5bWVyYXNlLmpzJztcclxuaW1wb3J0IFRyYW5zY3JpcHRpb25GYWN0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1RyYW5zY3JpcHRpb25GYWN0b3IuanMnO1xyXG5pbXBvcnQgRG5hTW9sZWN1bGVOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0RuYU1vbGVjdWxlTm9kZS5qcyc7XHJcbmltcG9ydCBNb2JpbGVCaW9tb2xlY3VsZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTW9iaWxlQmlvbW9sZWN1bGVOb2RlLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncyBmcm9tICcuLi8uLi9HZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEFmZmluaXR5Q29udHJvbGxlciBmcm9tICcuL0FmZmluaXR5Q29udHJvbGxlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVElUTEVfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNiwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBQT0xZTUVSQVNFX1NDQUxFID0gMC4wODtcclxuY29uc3QgUE9MWU1FUkFTRV9NVlQgPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gIG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICBQT0xZTUVSQVNFX1NDQUxFXHJcbik7XHJcbmNvbnN0IEROQV9BTkRfVEZfU0NBTEUgPSAwLjA4O1xyXG5jb25zdCBETkFfQU5EX1RGX01WVCA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gIEROQV9BTkRfVEZfU0NBTEVcclxuKTtcclxuXHJcbi8vc3RyaW5nc1xyXG5jb25zdCBybmFQb2x5bWVyYXNlU3RyaW5nID0gR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncy5ybmFQb2x5bWVyYXNlO1xyXG5cclxuY2xhc3MgUG9seW1lcmFzZUFmZmluaXR5Q29udHJvbFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RyYW5zY3JpcHRpb25GYWN0b3JDb25maWd9IHRmQ29uZmlnXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbkhlaWdodFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHBvbHltZXJhc2VBZmZpbml0eVByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRmQ29uZmlnLCBtaW5IZWlnaHQsIHBvbHltZXJhc2VBZmZpbml0eVByb3BlcnR5ICkge1xyXG4gICAgY29uc3QgdGl0bGVOb2RlID0gbmV3IFRleHQoIHJuYVBvbHltZXJhc2VTdHJpbmcsIHtcclxuICAgICAgZm9udDogVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDE4MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYWZmaW5pdHkgY29udHJvbCBub2RlLlxyXG4gICAgY29uc3QgcG9seW1lcmFzZU5vZGUgPSBuZXcgTW9iaWxlQmlvbW9sZWN1bGVOb2RlKCBQT0xZTUVSQVNFX01WVCwgbmV3IFJuYVBvbHltZXJhc2UoKSApO1xyXG4gICAgY29uc3QgZG5hRnJhZ21lbnROb2RlID0gbmV3IERuYU1vbGVjdWxlTm9kZShcclxuICAgICAgbmV3IERuYU1vbGVjdWxlKFxyXG4gICAgICAgIG51bGwsXHJcbiAgICAgICAgR0VFQ29uc3RhbnRzLkJBU0VfUEFJUlNfUEVSX1RXSVNUICogMiArIDEsXHJcbiAgICAgICAgMC4wLFxyXG4gICAgICAgIHRydWVcclxuICAgICAgKSxcclxuICAgICAgRE5BX0FORF9URl9NVlQsXHJcbiAgICAgIDIsXHJcbiAgICAgIGZhbHNlXHJcbiAgICApLnRvRGF0YVVSTE5vZGVTeW5jaHJvbm91cygpOyAvLyBtYWtlIHRoaXMgaW50byBhbiBpbWFnZSBpbiB0aGUgY29udHJvbCBwYW5lbCBzbyBhbm90aGVyIGNhbnZhcyBpc24ndCBjcmVhdGVkXHJcbiAgICBjb25zdCB0cmFuc2NyaXB0aW9uRmFjdG9yTm9kZSA9IG5ldyBNb2JpbGVCaW9tb2xlY3VsZU5vZGUoIEROQV9BTkRfVEZfTVZULCBuZXcgVHJhbnNjcmlwdGlvbkZhY3RvciggbnVsbCwgdGZDb25maWcgKSApO1xyXG5cclxuICAgIC8vIFNldCBwb3NpdGlvbiB0byBiZSBvbiB0b3Agb2YgdGhlIGRuYSwgdmFsdWVzIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgICB0cmFuc2NyaXB0aW9uRmFjdG9yTm9kZS54ID0gMjU7XHJcbiAgICB0cmFuc2NyaXB0aW9uRmFjdG9yTm9kZS55ID0gMDtcclxuXHJcbiAgICBkbmFGcmFnbWVudE5vZGUuYWRkQ2hpbGQoIHRyYW5zY3JpcHRpb25GYWN0b3JOb2RlICk7XHJcblxyXG4gICAgY29uc3QgcGFuZWxPcHRpb25zID0ge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IEdFRUNvbnN0YW50cy5DT1JORVJfUkFESVVTLFxyXG4gICAgICBmaWxsOiBuZXcgQ29sb3IoIDI1MCwgMjUwLCAyNTAgKSxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIG1pbldpZHRoOiAyMDAsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgcmVzaXplOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbiBvcmRlciB0byBzaXplIHRoZSBjb250cm9sIHBhbmVsIGNvcnJlY3RseSwgbWFrZSBvbmUgZmlyc3QsIHNlZSBob3cgZmFyIG9mZiBpdCBpcywgYW5kIHRoZW4gbWFrZSBvbmUgb2YgdGhlXHJcbiAgICAvLyBjb3JyZWN0IHNpemUuXHJcbiAgICBjb25zdCBkdW1teUNvbnRlbnRzID0gbmV3IFZCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgdGl0bGVOb2RlLFxyXG4gICAgICAgICAgbmV3IEFmZmluaXR5Q29udHJvbGxlciggcG9seW1lcmFzZU5vZGUsIGRuYUZyYWdtZW50Tm9kZSwgbmV3IFByb3BlcnR5KCAwICkgKVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc3BhY2luZzogMjBcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGR1bW15Q29udHJvbFBhbmVsID0gbmV3IFBhbmVsKCBkdW1teUNvbnRlbnRzLCBwYW5lbE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IGdyb3d0aEFtb3VudCA9IG1pbkhlaWdodCAtIGR1bW15Q29udHJvbFBhbmVsLmhlaWdodCAtIDQwO1xyXG4gICAgZHVtbXlDb250cm9sUGFuZWwuZGlzcG9zZSgpO1xyXG4gICAgZHVtbXlDb250ZW50cy5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzcGFjZXJzIHVzZWQgdG8gbWFrZSB0aGUgcGFuZWwgbWVldCB0aGUgbWluIHNpemUuXHJcbiAgICBjb25zdCB0b3BTcGFjZXIgPSBuZXcgU3BhY2VyKCAwLCBncm93dGhBbW91bnQgKiAwLjI1ICk7XHJcbiAgICBjb25zdCBib3R0b21TcGFjZXIgPSBuZXcgU3BhY2VyKCAwLCBncm93dGhBbW91bnQgKiAwLjc1ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudHMgPSBuZXcgVkJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICB0aXRsZU5vZGUsXHJcbiAgICAgICAgICB0b3BTcGFjZXIsXHJcbiAgICAgICAgICBuZXcgQWZmaW5pdHlDb250cm9sbGVyKCBwb2x5bWVyYXNlTm9kZSwgZG5hRnJhZ21lbnROb2RlLCBwb2x5bWVyYXNlQWZmaW5pdHlQcm9wZXJ0eSApLFxyXG4gICAgICAgICAgYm90dG9tU3BhY2VyXHJcbiAgICAgICAgXSxcclxuICAgICAgICBzcGFjaW5nOiAyMFxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50cywgcGFuZWxPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdQb2x5bWVyYXNlQWZmaW5pdHlDb250cm9sUGFuZWwnLCBQb2x5bWVyYXNlQWZmaW5pdHlDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgUG9seW1lcmFzZUFmZmluaXR5Q29udHJvbFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM3RSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0MsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLG1CQUFtQixNQUFNLDJDQUEyQztBQUMzRSxPQUFPQyxlQUFlLE1BQU0sc0NBQXNDO0FBQ2xFLE9BQU9D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