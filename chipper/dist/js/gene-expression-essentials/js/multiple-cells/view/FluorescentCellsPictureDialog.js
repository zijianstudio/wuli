// Copyright 2015-2022, University of Colorado Boulder

/**
 * Shows a picture of real cells containing fluorescent protein.
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import ecoli_jpg from '../../../mipmaps/ecoli_jpg.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GeneExpressionEssentialsStrings from '../../GeneExpressionEssentialsStrings.js';

// constants
const IMAGE_WIDTH = 600; // in screen coordinates, empirically determined to look good
const imageCaptionNoteString = GeneExpressionEssentialsStrings.imageCaptionNote;
const imageCaptionString = GeneExpressionEssentialsStrings.imageCaption;

// constants
const TEXT_FONT = new PhetFont(16);
class FluorescentCellsPictureDialog extends Dialog {
  constructor() {
    const imageNode = new Image(ecoli_jpg, {
      minWidth: IMAGE_WIDTH,
      maxWidth: IMAGE_WIDTH
    });

    // Add the caption.  Originally the caption and the note were two separate strings that were shown on separate
    // lines, but this was changed (see https://github.com/phetsims/gene-expression-essentials/issues/121) and they are
    // now combined. The strings have been left separate in the strings files so that translations don't need to be
    // modified.
    const captionAndNoteNode = new RichText(`${imageCaptionString} <br>${imageCaptionNoteString}`, {
      font: TEXT_FONT,
      align: 'center'
    });
    const children = [imageNode, captionAndNoteNode, new Text('Image Copyright Dennis Kunkel Microscopy, Inc.', {
      font: TEXT_FONT
    })];
    const content = new VBox({
      align: 'center',
      spacing: 10,
      children: children
    });
    super(content, {
      topMargin: 20,
      bottomMargin: 20
    });
  }
}
geneExpressionEssentials.register('FluorescentCellsPictureDialog', FluorescentCellsPictureDialog);
export default FluorescentCellsPictureDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIkltYWdlIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIkRpYWxvZyIsImVjb2xpX2pwZyIsImdlbmVFeHByZXNzaW9uRXNzZW50aWFscyIsIkdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MiLCJJTUFHRV9XSURUSCIsImltYWdlQ2FwdGlvbk5vdGVTdHJpbmciLCJpbWFnZUNhcHRpb25Ob3RlIiwiaW1hZ2VDYXB0aW9uU3RyaW5nIiwiaW1hZ2VDYXB0aW9uIiwiVEVYVF9GT05UIiwiRmx1b3Jlc2NlbnRDZWxsc1BpY3R1cmVEaWFsb2ciLCJjb25zdHJ1Y3RvciIsImltYWdlTm9kZSIsIm1pbldpZHRoIiwibWF4V2lkdGgiLCJjYXB0aW9uQW5kTm90ZU5vZGUiLCJmb250IiwiYWxpZ24iLCJjaGlsZHJlbiIsImNvbnRlbnQiLCJzcGFjaW5nIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGbHVvcmVzY2VudENlbGxzUGljdHVyZURpYWxvZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHBpY3R1cmUgb2YgcmVhbCBjZWxscyBjb250YWluaW5nIGZsdW9yZXNjZW50IHByb3RlaW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSW1hZ2UsIFJpY2hUZXh0LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IGVjb2xpX2pwZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2Vjb2xpX2pwZy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MgZnJvbSAnLi4vLi4vR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSU1BR0VfV0lEVEggPSA2MDA7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlcywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBsb29rIGdvb2RcclxuY29uc3QgaW1hZ2VDYXB0aW9uTm90ZVN0cmluZyA9IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MuaW1hZ2VDYXB0aW9uTm90ZTtcclxuY29uc3QgaW1hZ2VDYXB0aW9uU3RyaW5nID0gR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncy5pbWFnZUNhcHRpb247XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEVYVF9GT05UID0gbmV3IFBoZXRGb250KCAxNiApO1xyXG5cclxuY2xhc3MgRmx1b3Jlc2NlbnRDZWxsc1BpY3R1cmVEaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBpbWFnZU5vZGUgPSBuZXcgSW1hZ2UoIGVjb2xpX2pwZywge1xyXG4gICAgICBtaW5XaWR0aDogSU1BR0VfV0lEVEgsXHJcbiAgICAgIG1heFdpZHRoOiBJTUFHRV9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgY2FwdGlvbi4gIE9yaWdpbmFsbHkgdGhlIGNhcHRpb24gYW5kIHRoZSBub3RlIHdlcmUgdHdvIHNlcGFyYXRlIHN0cmluZ3MgdGhhdCB3ZXJlIHNob3duIG9uIHNlcGFyYXRlXHJcbiAgICAvLyBsaW5lcywgYnV0IHRoaXMgd2FzIGNoYW5nZWQgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VuZS1leHByZXNzaW9uLWVzc2VudGlhbHMvaXNzdWVzLzEyMSkgYW5kIHRoZXkgYXJlXHJcbiAgICAvLyBub3cgY29tYmluZWQuIFRoZSBzdHJpbmdzIGhhdmUgYmVlbiBsZWZ0IHNlcGFyYXRlIGluIHRoZSBzdHJpbmdzIGZpbGVzIHNvIHRoYXQgdHJhbnNsYXRpb25zIGRvbid0IG5lZWQgdG8gYmVcclxuICAgIC8vIG1vZGlmaWVkLlxyXG4gICAgY29uc3QgY2FwdGlvbkFuZE5vdGVOb2RlID0gbmV3IFJpY2hUZXh0KCBgJHtpbWFnZUNhcHRpb25TdHJpbmd9IDxicj4ke2ltYWdlQ2FwdGlvbk5vdGVTdHJpbmd9YCwge1xyXG4gICAgICBmb250OiBURVhUX0ZPTlQsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJ1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXHJcbiAgICAgIGltYWdlTm9kZSxcclxuICAgICAgY2FwdGlvbkFuZE5vdGVOb2RlLFxyXG4gICAgICBuZXcgVGV4dCggJ0ltYWdlIENvcHlyaWdodCBEZW5uaXMgS3Vua2VsIE1pY3Jvc2NvcHksIEluYy4nLCB7IGZvbnQ6IFRFWFRfRk9OVCB9IClcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7IGFsaWduOiAnY2VudGVyJywgc3BhY2luZzogMTAsIGNoaWxkcmVuOiBjaGlsZHJlbiB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIHtcclxuICAgICAgdG9wTWFyZ2luOiAyMCxcclxuICAgICAgYm90dG9tTWFyZ2luOiAyMFxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnRmx1b3Jlc2NlbnRDZWxsc1BpY3R1cmVEaWFsb2cnLCBGbHVvcmVzY2VudENlbGxzUGljdHVyZURpYWxvZyApO1xyXG5leHBvcnQgZGVmYXVsdCBGbHVvcmVzY2VudENlbGxzUGljdHVyZURpYWxvZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDL0UsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQywrQkFBK0IsTUFBTSwwQ0FBMEM7O0FBRXRGO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLHNCQUFzQixHQUFHRiwrQkFBK0IsQ0FBQ0csZ0JBQWdCO0FBQy9FLE1BQU1DLGtCQUFrQixHQUFHSiwrQkFBK0IsQ0FBQ0ssWUFBWTs7QUFFdkU7QUFDQSxNQUFNQyxTQUFTLEdBQUcsSUFBSWQsUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUVwQyxNQUFNZSw2QkFBNkIsU0FBU1YsTUFBTSxDQUFDO0VBRWpEVyxXQUFXQSxDQUFBLEVBQUc7SUFFWixNQUFNQyxTQUFTLEdBQUcsSUFBSWhCLEtBQUssQ0FBRUssU0FBUyxFQUFFO01BQ3RDWSxRQUFRLEVBQUVULFdBQVc7TUFDckJVLFFBQVEsRUFBRVY7SUFDWixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNVyxrQkFBa0IsR0FBRyxJQUFJbEIsUUFBUSxDQUFHLEdBQUVVLGtCQUFtQixRQUFPRixzQkFBdUIsRUFBQyxFQUFFO01BQzlGVyxJQUFJLEVBQUVQLFNBQVM7TUFDZlEsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDO0lBQ0gsTUFBTUMsUUFBUSxHQUFHLENBQ2ZOLFNBQVMsRUFDVEcsa0JBQWtCLEVBQ2xCLElBQUlqQixJQUFJLENBQUUsZ0RBQWdELEVBQUU7TUFBRWtCLElBQUksRUFBRVA7SUFBVSxDQUFFLENBQUMsQ0FDbEY7SUFFRCxNQUFNVSxPQUFPLEdBQUcsSUFBSXBCLElBQUksQ0FBRTtNQUFFa0IsS0FBSyxFQUFFLFFBQVE7TUFBRUcsT0FBTyxFQUFFLEVBQUU7TUFBRUYsUUFBUSxFQUFFQTtJQUFTLENBQUUsQ0FBQztJQUVoRixLQUFLLENBQUVDLE9BQU8sRUFBRTtNQUNkRSxTQUFTLEVBQUUsRUFBRTtNQUNiQyxZQUFZLEVBQUU7SUFDaEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBcEIsd0JBQXdCLENBQUNxQixRQUFRLENBQUUsK0JBQStCLEVBQUViLDZCQUE4QixDQUFDO0FBQ25HLGVBQWVBLDZCQUE2QiJ9