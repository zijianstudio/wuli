// Copyright 2019-2023, University of Colorado Boulder

/**
 * AllelesPanel is the panel that contains controls for showing alleles in the 'Pedigree' graph.
 * Each row in the panel corresponds to one gene.  Until a gene has mutated, its row is disabled,
 * because a gene pair cannot be abbreviated until a dominance relationship exists, and a dominance
 * relationship does not exist until both the normal and mutant alleles exist in the population.
 * When a row is enabled, it shows the icon and abbreviation for the normal allele and the mutant allele.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions, optionize3 } from '../../../../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, HBox, HStrut, Text, VBox } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import naturalSelection from '../../../naturalSelection.js';
import NaturalSelectionStrings from '../../../NaturalSelectionStrings.js';
import NaturalSelectionConstants from '../../NaturalSelectionConstants.js';
import NaturalSelectionQueryParameters from '../../NaturalSelectionQueryParameters.js';
import NaturalSelectionPanel from '../NaturalSelectionPanel.js';
import AlleleNode from './AlleleNode.js';
export default class AllelesPanel extends NaturalSelectionPanel {
  constructor(genePool, furAllelesVisibleProperty, earsAllelesVisibleProperty, teethAllelesVisibleProperty, providedOptions) {
    const options = optionize3()({}, NaturalSelectionConstants.PANEL_OPTIONS, providedOptions);

    // To make the abbreviation + icon for all alleles the same effective size
    const alleleAlignGroup = new AlignGroup();

    // Alleles - title is plural, since we're always showing at least 2 alleles
    const titleText = new Text(NaturalSelectionStrings.allelesStringProperty, {
      font: NaturalSelectionConstants.TITLE_FONT,
      maxWidth: 125,
      // determined empirically
      tandem: options.tandem.createTandem('titleText')
    });

    // A row for each gene
    const furRow = new Row(genePool.furGene, furAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem('furRow')
    });
    const earsRow = new Row(genePool.earsGene, earsAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem('earsRow')
    });
    const teethRow = new Row(genePool.teethGene, teethAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem('teethRow')
    });
    const rows = [furRow, earsRow, teethRow];
    const content = new VBox(combineOptions({}, NaturalSelectionConstants.VBOX_OPTIONS, {
      spacing: 28,
      children: [titleText, ...rows]
    }));
    super(content, options);
    this.rows = rows;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Sets visibility of the UI components related to a specific gene.
   */
  setGeneVisible(gene, visible) {
    const row = _.find(this.rows, row => row.gene === gene);
    assert && assert(row, `row not found for ${gene.nameProperty.value} gene`);
    row.visible = visible;
  }
}

/**
 * Row is a row in AllelesPanel.
 *
 * Each row has a checkbox for showing allele abbreviations in the Pedigree graph, and icons that indicate the
 * phenotype for each abbreviation (e.g. 'F' <white fur icon>  'f' <brown fur icon>).  A row is hidden until
 * its corresponding mutation has been applied.
 */

class Row extends VBox {
  constructor(gene, visibleProperty, alignGroup, providedOptions) {
    const options = optionize()({
      // VBoxOptions
      align: 'left',
      spacing: 8,
      excludeInvisibleChildrenFromBounds: false
    }, providedOptions);
    const checkboxTandem = options.tandem.createTandem('checkbox');
    const text = new Text(gene.nameProperty, {
      font: NaturalSelectionConstants.CHECKBOX_FONT,
      maxWidth: 100,
      // determined empirically
      tandem: checkboxTandem.createTandem('text')
    });
    const checkbox = new Checkbox(visibleProperty, text, combineOptions({}, NaturalSelectionConstants.CHECKBOX_OPTIONS, {
      tandem: checkboxTandem
    }));
    const xDilation = 8;
    const yDilation = 8;
    checkbox.touchArea = checkbox.localBounds.dilatedXY(xDilation, yDilation);
    checkbox.mouseArea = checkbox.localBounds.dilatedXY(xDilation, yDilation);

    // Dominant allele
    const dominantAlleleNode = new AlleleNode(gene.dominantAbbreviationTranslatedProperty, gene.normalAllele.image, {
      tandem: options.tandem.createTandem('dominantAlleleNode')
    });

    // Recessive allele
    const recessiveAlleleNode = new AlleleNode(gene.recessiveAbbreviationTranslatedProperty, gene.mutantAllele.image, {
      tandem: options.tandem.createTandem('recessiveAlleleNode')
    });
    const alignBoxOptions = {
      group: alignGroup,
      xAlign: 'left'
    };

    // Dominant allele on the left, recessive on the right, to match 'Add Mutations' panel
    const hBox = new HBox({
      spacing: 0,
      children: [new HStrut(8),
      // indent
      new HBox({
        spacing: 12,
        children: [new AlignBox(dominantAlleleNode, alignBoxOptions), new AlignBox(recessiveAlleleNode, alignBoxOptions)]
      })]
    });
    options.children = [checkbox, hBox];
    super(options);
    if (NaturalSelectionQueryParameters.allelesVisible) {
      // unlink is not necessary.
      gene.dominantAlleleProperty.link(dominantAllele => {
        const hasMutation = !!dominantAllele;

        // Disable the checkbox when there is no mutation
        checkbox.enabled = hasMutation;

        // Don't show allele abbreviation and icon when there is no mutation
        hBox.visible = hasMutation;

        // Automatically make the alleles visible.
        // Corresponding alleles should not be visible when the row is disabled.
        // Do not do this when restoring PhET-iO state, see https://github.com/phetsims/natural-selection/issues/314.
        if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
          visibleProperty.value = hasMutation;
        }
        if (dominantAllele) {
          // Show the correct allele icons for dominant vs recessive
          const mutantIsDominant = dominantAllele === gene.mutantAllele;
          dominantAlleleNode.image = mutantIsDominant ? gene.mutantAllele.image : gene.normalAllele.image;
          recessiveAlleleNode.image = mutantIsDominant ? gene.normalAllele.image : gene.mutantAllele.image;
        }
      });
    }
    this.gene = gene;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
naturalSelection.register('AllelesPanel', AllelesPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJIQm94IiwiSFN0cnV0IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyIsIk5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMiLCJOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzIiwiTmF0dXJhbFNlbGVjdGlvblBhbmVsIiwiQWxsZWxlTm9kZSIsIkFsbGVsZXNQYW5lbCIsImNvbnN0cnVjdG9yIiwiZ2VuZVBvb2wiLCJmdXJBbGxlbGVzVmlzaWJsZVByb3BlcnR5IiwiZWFyc0FsbGVsZXNWaXNpYmxlUHJvcGVydHkiLCJ0ZWV0aEFsbGVsZXNWaXNpYmxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiUEFORUxfT1BUSU9OUyIsImFsbGVsZUFsaWduR3JvdXAiLCJ0aXRsZVRleHQiLCJhbGxlbGVzU3RyaW5nUHJvcGVydHkiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZnVyUm93IiwiUm93IiwiZnVyR2VuZSIsImVhcnNSb3ciLCJlYXJzR2VuZSIsInRlZXRoUm93IiwidGVldGhHZW5lIiwicm93cyIsImNvbnRlbnQiLCJWQk9YX09QVElPTlMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwiYXNzZXJ0Iiwic2V0R2VuZVZpc2libGUiLCJnZW5lIiwidmlzaWJsZSIsInJvdyIsIl8iLCJmaW5kIiwibmFtZVByb3BlcnR5IiwidmFsdWUiLCJ2aXNpYmxlUHJvcGVydHkiLCJhbGlnbkdyb3VwIiwiYWxpZ24iLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiY2hlY2tib3hUYW5kZW0iLCJ0ZXh0IiwiQ0hFQ0tCT1hfRk9OVCIsImNoZWNrYm94IiwiQ0hFQ0tCT1hfT1BUSU9OUyIsInhEaWxhdGlvbiIsInlEaWxhdGlvbiIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwiZG9taW5hbnRBbGxlbGVOb2RlIiwiZG9taW5hbnRBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHkiLCJub3JtYWxBbGxlbGUiLCJpbWFnZSIsInJlY2Vzc2l2ZUFsbGVsZU5vZGUiLCJyZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHkiLCJtdXRhbnRBbGxlbGUiLCJhbGlnbkJveE9wdGlvbnMiLCJncm91cCIsInhBbGlnbiIsImhCb3giLCJhbGxlbGVzVmlzaWJsZSIsImRvbWluYW50QWxsZWxlUHJvcGVydHkiLCJsaW5rIiwiZG9taW5hbnRBbGxlbGUiLCJoYXNNdXRhdGlvbiIsImVuYWJsZWQiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwibXV0YW50SXNEb21pbmFudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQWxsZWxlc1BhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFsbGVsZXNQYW5lbCBpcyB0aGUgcGFuZWwgdGhhdCBjb250YWlucyBjb250cm9scyBmb3Igc2hvd2luZyBhbGxlbGVzIGluIHRoZSAnUGVkaWdyZWUnIGdyYXBoLlxyXG4gKiBFYWNoIHJvdyBpbiB0aGUgcGFuZWwgY29ycmVzcG9uZHMgdG8gb25lIGdlbmUuICBVbnRpbCBhIGdlbmUgaGFzIG11dGF0ZWQsIGl0cyByb3cgaXMgZGlzYWJsZWQsXHJcbiAqIGJlY2F1c2UgYSBnZW5lIHBhaXIgY2Fubm90IGJlIGFiYnJldmlhdGVkIHVudGlsIGEgZG9taW5hbmNlIHJlbGF0aW9uc2hpcCBleGlzdHMsIGFuZCBhIGRvbWluYW5jZVxyXG4gKiByZWxhdGlvbnNoaXAgZG9lcyBub3QgZXhpc3QgdW50aWwgYm90aCB0aGUgbm9ybWFsIGFuZCBtdXRhbnQgYWxsZWxlcyBleGlzdCBpbiB0aGUgcG9wdWxhdGlvbi5cclxuICogV2hlbiBhIHJvdyBpcyBlbmFibGVkLCBpdCBzaG93cyB0aGUgaWNvbiBhbmQgYWJicmV2aWF0aW9uIGZvciB0aGUgbm9ybWFsIGFsbGVsZSBhbmQgdGhlIG11dGFudCBhbGxlbGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBvcHRpb25pemUzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduQm94T3B0aW9ucywgQWxpZ25Hcm91cCwgSEJveCwgSFN0cnV0LCBUZXh0LCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCwgeyBDaGVja2JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzIGZyb20gJy4uLy4uLy4uL05hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEdlbmUgZnJvbSAnLi4vLi4vbW9kZWwvR2VuZS5qcyc7XHJcbmltcG9ydCBHZW5lUG9vbCBmcm9tICcuLi8uLi9tb2RlbC9HZW5lUG9vbC5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL05hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25QYW5lbCwgeyBOYXR1cmFsU2VsZWN0aW9uUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vTmF0dXJhbFNlbGVjdGlvblBhbmVsLmpzJztcclxuaW1wb3J0IEFsbGVsZU5vZGUgZnJvbSAnLi9BbGxlbGVOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBBbGxlbGVzUGFuZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOYXR1cmFsU2VsZWN0aW9uUGFuZWxPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxsZWxlc1BhbmVsIGV4dGVuZHMgTmF0dXJhbFNlbGVjdGlvblBhbmVsIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByb3dzOiBSb3dbXTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBnZW5lUG9vbDogR2VuZVBvb2wsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmdXJBbGxlbGVzVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGVhcnNBbGxlbGVzVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHRlZXRoQWxsZWxlc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEFsbGVsZXNQYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTM8QWxsZWxlc1BhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFN0cmljdE9taXQ8TmF0dXJhbFNlbGVjdGlvblBhbmVsT3B0aW9ucywgJ3RhbmRlbSc+PigpKFxyXG4gICAgICB7fSwgTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5QQU5FTF9PUFRJT05TLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUbyBtYWtlIHRoZSBhYmJyZXZpYXRpb24gKyBpY29uIGZvciBhbGwgYWxsZWxlcyB0aGUgc2FtZSBlZmZlY3RpdmUgc2l6ZVxyXG4gICAgY29uc3QgYWxsZWxlQWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gQWxsZWxlcyAtIHRpdGxlIGlzIHBsdXJhbCwgc2luY2Ugd2UncmUgYWx3YXlzIHNob3dpbmcgYXQgbGVhc3QgMiBhbGxlbGVzXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuYWxsZWxlc1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDEyNSwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEEgcm93IGZvciBlYWNoIGdlbmVcclxuICAgIGNvbnN0IGZ1clJvdyA9IG5ldyBSb3coIGdlbmVQb29sLmZ1ckdlbmUsIGZ1ckFsbGVsZXNWaXNpYmxlUHJvcGVydHksIGFsbGVsZUFsaWduR3JvdXAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmdXJSb3cnIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGVhcnNSb3cgPSBuZXcgUm93KCBnZW5lUG9vbC5lYXJzR2VuZSwgZWFyc0FsbGVsZXNWaXNpYmxlUHJvcGVydHksIGFsbGVsZUFsaWduR3JvdXAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlYXJzUm93JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB0ZWV0aFJvdyA9IG5ldyBSb3coIGdlbmVQb29sLnRlZXRoR2VuZSwgdGVldGhBbGxlbGVzVmlzaWJsZVByb3BlcnR5LCBhbGxlbGVBbGlnbkdyb3VwLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGVldGhSb3cnIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHJvd3MgPSBbIGZ1clJvdywgZWFyc1JvdywgdGVldGhSb3cgXTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIGNvbWJpbmVPcHRpb25zPFZCb3hPcHRpb25zPigge30sIE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuVkJPWF9PUFRJT05TLCB7XHJcbiAgICAgIHNwYWNpbmc6IDI4LFxyXG4gICAgICBjaGlsZHJlbjogWyB0aXRsZVRleHQsIC4uLnJvd3MgXVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdmlzaWJpbGl0eSBvZiB0aGUgVUkgY29tcG9uZW50cyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZ2VuZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0R2VuZVZpc2libGUoIGdlbmU6IEdlbmUsIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBjb25zdCByb3cgPSBfLmZpbmQoIHRoaXMucm93cywgcm93ID0+ICggcm93LmdlbmUgPT09IGdlbmUgKSApITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJvdywgYHJvdyBub3QgZm91bmQgZm9yICR7Z2VuZS5uYW1lUHJvcGVydHkudmFsdWV9IGdlbmVgICk7XHJcbiAgICByb3cudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUm93IGlzIGEgcm93IGluIEFsbGVsZXNQYW5lbC5cclxuICpcclxuICogRWFjaCByb3cgaGFzIGEgY2hlY2tib3ggZm9yIHNob3dpbmcgYWxsZWxlIGFiYnJldmlhdGlvbnMgaW4gdGhlIFBlZGlncmVlIGdyYXBoLCBhbmQgaWNvbnMgdGhhdCBpbmRpY2F0ZSB0aGVcclxuICogcGhlbm90eXBlIGZvciBlYWNoIGFiYnJldmlhdGlvbiAoZS5nLiAnRicgPHdoaXRlIGZ1ciBpY29uPiAgJ2YnIDxicm93biBmdXIgaWNvbj4pLiAgQSByb3cgaXMgaGlkZGVuIHVudGlsXHJcbiAqIGl0cyBjb3JyZXNwb25kaW5nIG11dGF0aW9uIGhhcyBiZWVuIGFwcGxpZWQuXHJcbiAqL1xyXG5cclxudHlwZSBSb3dTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIFJvd09wdGlvbnMgPSBSb3dTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxWQm94T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgUm93IGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBnZW5lOiBHZW5lO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdlbmU6IEdlbmUsIHZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIGFsaWduR3JvdXA6IEFsaWduR3JvdXAsIHByb3ZpZGVkT3B0aW9uczogUm93T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJvd09wdGlvbnMsIFJvd1NlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gVkJveE9wdGlvbnNcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogOCxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrYm94VGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hlY2tib3gnICk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBnZW5lLm5hbWVQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzLkNIRUNLQk9YX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAxMDAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBjaGVja2JveFRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHZpc2libGVQcm9wZXJ0eSwgdGV4dCxcclxuICAgICAgY29tYmluZU9wdGlvbnM8Q2hlY2tib3hPcHRpb25zPigge30sIE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuQ0hFQ0tCT1hfT1BUSU9OUywge1xyXG4gICAgICAgIHRhbmRlbTogY2hlY2tib3hUYW5kZW1cclxuICAgICAgfSApICk7XHJcbiAgICBjb25zdCB4RGlsYXRpb24gPSA4O1xyXG4gICAgY29uc3QgeURpbGF0aW9uID0gODtcclxuICAgIGNoZWNrYm94LnRvdWNoQXJlYSA9IGNoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggeERpbGF0aW9uLCB5RGlsYXRpb24gKTtcclxuICAgIGNoZWNrYm94Lm1vdXNlQXJlYSA9IGNoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggeERpbGF0aW9uLCB5RGlsYXRpb24gKTtcclxuXHJcbiAgICAvLyBEb21pbmFudCBhbGxlbGVcclxuICAgIGNvbnN0IGRvbWluYW50QWxsZWxlTm9kZSA9IG5ldyBBbGxlbGVOb2RlKCBnZW5lLmRvbWluYW50QWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5LCBnZW5lLm5vcm1hbEFsbGVsZS5pbWFnZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RvbWluYW50QWxsZWxlTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJlY2Vzc2l2ZSBhbGxlbGVcclxuICAgIGNvbnN0IHJlY2Vzc2l2ZUFsbGVsZU5vZGUgPSBuZXcgQWxsZWxlTm9kZSggZ2VuZS5yZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHksIGdlbmUubXV0YW50QWxsZWxlLmltYWdlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVjZXNzaXZlQWxsZWxlTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGFsaWduQm94T3B0aW9uczogQWxpZ25Cb3hPcHRpb25zID0ge1xyXG4gICAgICBncm91cDogYWxpZ25Hcm91cCxcclxuICAgICAgeEFsaWduOiAnbGVmdCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gRG9taW5hbnQgYWxsZWxlIG9uIHRoZSBsZWZ0LCByZWNlc3NpdmUgb24gdGhlIHJpZ2h0LCB0byBtYXRjaCAnQWRkIE11dGF0aW9ucycgcGFuZWxcclxuICAgIGNvbnN0IGhCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBIU3RydXQoIDggKSwgLy8gaW5kZW50XHJcbiAgICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICAgIHNwYWNpbmc6IDEyLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IEFsaWduQm94KCBkb21pbmFudEFsbGVsZU5vZGUsIGFsaWduQm94T3B0aW9ucyApLFxyXG4gICAgICAgICAgICBuZXcgQWxpZ25Cb3goIHJlY2Vzc2l2ZUFsbGVsZU5vZGUsIGFsaWduQm94T3B0aW9ucyApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBjaGVja2JveCwgaEJveCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLmFsbGVsZXNWaXNpYmxlICkge1xyXG5cclxuICAgICAgLy8gdW5saW5rIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICAgIGdlbmUuZG9taW5hbnRBbGxlbGVQcm9wZXJ0eS5saW5rKCBkb21pbmFudEFsbGVsZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGhhc011dGF0aW9uID0gISFkb21pbmFudEFsbGVsZTtcclxuXHJcbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgY2hlY2tib3ggd2hlbiB0aGVyZSBpcyBubyBtdXRhdGlvblxyXG4gICAgICAgIGNoZWNrYm94LmVuYWJsZWQgPSBoYXNNdXRhdGlvbjtcclxuXHJcbiAgICAgICAgLy8gRG9uJ3Qgc2hvdyBhbGxlbGUgYWJicmV2aWF0aW9uIGFuZCBpY29uIHdoZW4gdGhlcmUgaXMgbm8gbXV0YXRpb25cclxuICAgICAgICBoQm94LnZpc2libGUgPSBoYXNNdXRhdGlvbjtcclxuXHJcbiAgICAgICAgLy8gQXV0b21hdGljYWxseSBtYWtlIHRoZSBhbGxlbGVzIHZpc2libGUuXHJcbiAgICAgICAgLy8gQ29ycmVzcG9uZGluZyBhbGxlbGVzIHNob3VsZCBub3QgYmUgdmlzaWJsZSB3aGVuIHRoZSByb3cgaXMgZGlzYWJsZWQuXHJcbiAgICAgICAgLy8gRG8gbm90IGRvIHRoaXMgd2hlbiByZXN0b3JpbmcgUGhFVC1pTyBzdGF0ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMzE0LlxyXG4gICAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICB2aXNpYmxlUHJvcGVydHkudmFsdWUgPSBoYXNNdXRhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggZG9taW5hbnRBbGxlbGUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gU2hvdyB0aGUgY29ycmVjdCBhbGxlbGUgaWNvbnMgZm9yIGRvbWluYW50IHZzIHJlY2Vzc2l2ZVxyXG4gICAgICAgICAgY29uc3QgbXV0YW50SXNEb21pbmFudCA9ICggZG9taW5hbnRBbGxlbGUgPT09IGdlbmUubXV0YW50QWxsZWxlICk7XHJcbiAgICAgICAgICBkb21pbmFudEFsbGVsZU5vZGUuaW1hZ2UgPSBtdXRhbnRJc0RvbWluYW50ID8gZ2VuZS5tdXRhbnRBbGxlbGUuaW1hZ2UgOiBnZW5lLm5vcm1hbEFsbGVsZS5pbWFnZTtcclxuICAgICAgICAgIHJlY2Vzc2l2ZUFsbGVsZU5vZGUuaW1hZ2UgPSBtdXRhbnRJc0RvbWluYW50ID8gZ2VuZS5ub3JtYWxBbGxlbGUuaW1hZ2UgOiBnZW5lLm11dGFudEFsbGVsZS5pbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdlbmUgPSBnZW5lO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdBbGxlbGVzUGFuZWwnLCBBbGxlbGVzUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLElBQUlDLGNBQWMsRUFBb0JDLFVBQVUsUUFBUSwwQ0FBMEM7QUFHbEgsU0FBU0MsUUFBUSxFQUFtQkMsVUFBVSxFQUFFQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLHNDQUFzQztBQUNuSSxPQUFPQyxRQUFRLE1BQTJCLG1DQUFtQztBQUM3RSxPQUFPQyxnQkFBZ0IsTUFBTSw4QkFBOEI7QUFDM0QsT0FBT0MsdUJBQXVCLE1BQU0scUNBQXFDO0FBR3pFLE9BQU9DLHlCQUF5QixNQUFNLG9DQUFvQztBQUMxRSxPQUFPQywrQkFBK0IsTUFBTSwwQ0FBMEM7QUFDdEYsT0FBT0MscUJBQXFCLE1BQXdDLDZCQUE2QjtBQUNqRyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBTXhDLGVBQWUsTUFBTUMsWUFBWSxTQUFTRixxQkFBcUIsQ0FBQztFQUl2REcsV0FBV0EsQ0FBRUMsUUFBa0IsRUFDbEJDLHlCQUE0QyxFQUM1Q0MsMEJBQTZDLEVBQzdDQywyQkFBOEMsRUFDOUNDLGVBQW9DLEVBQUc7SUFFekQsTUFBTUMsT0FBTyxHQUFHckIsVUFBVSxDQUF1RixDQUFDLENBQ2hILENBQUMsQ0FBQyxFQUFFVSx5QkFBeUIsQ0FBQ1ksYUFBYSxFQUFFRixlQUFnQixDQUFD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