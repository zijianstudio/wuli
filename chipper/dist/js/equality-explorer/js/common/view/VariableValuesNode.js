// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays the values of variables in parenthesis.
 * E.g. '(x = 2)' or '(x = 1, y = 3)' or (sphere = 2, square = 1, triangle = 4).
 * This is used for snapshots, so the displayed value does not update when the variable's value changes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Text } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
import VariableNode from './VariableNode.js';
export default class VariableValuesNode extends HBox {
  // Nodes that need to be disposed
  /**
   * @param variables - in the order that they appear, from left to right
   * @param providedOptions
   */
  constructor(variables, providedOptions) {
    const options = optionize()({
      // SelfOptions
      fontSize: 28,
      commaSeparated: true,
      spacingInsideTerms: 3,
      spacingBetweenTerms: 15,
      // HBoxOptions
      // De-emphasize variable values by scaling them down.
      // See https://github.com/phetsims/equality-explorer/issues/110
      scale: 0.75,
      spacing: 0
    }, providedOptions);
    super(options);
    this.variables = variables;
    this.font = new PhetFont(options.fontSize);
    this.fontSize = options.fontSize;
    this.commaSeparated = options.commaSeparated;
    this.spacingInsideTerms = options.spacingInsideTerms;
    this.spacingBetweenTerms = options.spacingBetweenTerms;
    this.disposeNodes = [];
    this.update();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  update() {
    this.disposeNodes.forEach(node => node.dispose());
    this.disposeNodes.length = 0;
    const children = [];

    // '(' with normal font
    const leftParenText = new Text('(', {
      font: this.font
    });
    children.push(leftParenText);

    // E.g. {{symbol}} = {{value}}, for each variable
    for (let i = 0; i < this.variables.length; i++) {
      const variable = this.variables[i];
      const variableNode = new VariableNode(variable, {
        iconScale: 0.35,
        fontSize: this.fontSize
      });
      this.disposeNodes.push(variableNode); // because variableNode may be linked to a StringProperty

      children.push(new HBox({
        spacing: this.spacingInsideTerms,
        children: [
        // variable
        variableNode,
        // =
        new Text(MathSymbols.EQUAL_TO, {
          font: this.font
        }),
        // N
        new Text(`${variable.valueProperty.value}`, {
          font: this.font
        })]
      }));

      // comma + space separator
      if (i < this.variables.length - 1) {
        if (this.commaSeparated) {
          children.push(new Text(',', {
            font: this.font
          }));
        }
        children.push(new HStrut(this.spacingBetweenTerms));
      }
    }
    const rightParenText = new Text(')', {
      font: this.font
    });
    children.push(rightParenText);
    this.children = children;
  }
}
equalityExplorer.register('VariableValuesNode', VariableValuesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiSEJveCIsIkhTdHJ1dCIsIlRleHQiLCJlcXVhbGl0eUV4cGxvcmVyIiwiVmFyaWFibGVOb2RlIiwiVmFyaWFibGVWYWx1ZXNOb2RlIiwiY29uc3RydWN0b3IiLCJ2YXJpYWJsZXMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZm9udFNpemUiLCJjb21tYVNlcGFyYXRlZCIsInNwYWNpbmdJbnNpZGVUZXJtcyIsInNwYWNpbmdCZXR3ZWVuVGVybXMiLCJzY2FsZSIsInNwYWNpbmciLCJmb250IiwiZGlzcG9zZU5vZGVzIiwidXBkYXRlIiwiZGlzcG9zZSIsImFzc2VydCIsImZvckVhY2giLCJub2RlIiwibGVuZ3RoIiwiY2hpbGRyZW4iLCJsZWZ0UGFyZW5UZXh0IiwicHVzaCIsImkiLCJ2YXJpYWJsZSIsInZhcmlhYmxlTm9kZSIsImljb25TY2FsZSIsIkVRVUFMX1RPIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwicmlnaHRQYXJlblRleHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZhcmlhYmxlVmFsdWVzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyB0aGUgdmFsdWVzIG9mIHZhcmlhYmxlcyBpbiBwYXJlbnRoZXNpcy5cclxuICogRS5nLiAnKHggPSAyKScgb3IgJyh4ID0gMSwgeSA9IDMpJyBvciAoc3BoZXJlID0gMiwgc3F1YXJlID0gMSwgdHJpYW5nbGUgPSA0KS5cclxuICogVGhpcyBpcyB1c2VkIGZvciBzbmFwc2hvdHMsIHNvIHRoZSBkaXNwbGF5ZWQgdmFsdWUgZG9lcyBub3QgdXBkYXRlIHdoZW4gdGhlIHZhcmlhYmxlJ3MgdmFsdWUgY2hhbmdlcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEZvbnQsIEhCb3gsIEhCb3hPcHRpb25zLCBIU3RydXQsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlIGZyb20gJy4uL21vZGVsL1ZhcmlhYmxlLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlTm9kZSBmcm9tICcuL1ZhcmlhYmxlTm9kZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGZvbnRTaXplPzogbnVtYmVyO1xyXG4gIGNvbW1hU2VwYXJhdGVkPzogYm9vbGVhbjtcclxuICBzcGFjaW5nSW5zaWRlVGVybXM/OiBudW1iZXI7XHJcbiAgc3BhY2luZ0JldHdlZW5UZXJtcz86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgVmFyaWFibGVWYWx1ZXNOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBQaWNrT3B0aW9uYWw8SEJveE9wdGlvbnMsICdvcGFjaXR5JyB8ICdzY2FsZScgfCAndmlzaWJsZVByb3BlcnR5Jz4gJlxyXG4gIFBpY2tSZXF1aXJlZDxIQm94T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGVWYWx1ZXNOb2RlIGV4dGVuZHMgSEJveCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmFyaWFibGVzOiBWYXJpYWJsZVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZm9udDogRm9udDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGZvbnRTaXplOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb21tYVNlcGFyYXRlZDogYm9vbGVhbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNwYWNpbmdJbnNpZGVUZXJtczogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BhY2luZ0JldHdlZW5UZXJtczogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU5vZGVzOiBOb2RlW107IC8vIE5vZGVzIHRoYXQgbmVlZCB0byBiZSBkaXNwb3NlZFxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdmFyaWFibGVzIC0gaW4gdGhlIG9yZGVyIHRoYXQgdGhleSBhcHBlYXIsIGZyb20gbGVmdCB0byByaWdodFxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhcmlhYmxlczogVmFyaWFibGVbXSwgcHJvdmlkZWRPcHRpb25zPzogVmFyaWFibGVWYWx1ZXNOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZhcmlhYmxlVmFsdWVzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgZm9udFNpemU6IDI4LFxyXG4gICAgICBjb21tYVNlcGFyYXRlZDogdHJ1ZSxcclxuICAgICAgc3BhY2luZ0luc2lkZVRlcm1zOiAzLFxyXG4gICAgICBzcGFjaW5nQmV0d2VlblRlcm1zOiAxNSxcclxuXHJcbiAgICAgIC8vIEhCb3hPcHRpb25zXHJcbiAgICAgIC8vIERlLWVtcGhhc2l6ZSB2YXJpYWJsZSB2YWx1ZXMgYnkgc2NhbGluZyB0aGVtIGRvd24uXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzExMFxyXG4gICAgICBzY2FsZTogMC43NSxcclxuICAgICAgc3BhY2luZzogMFxyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XHJcbiAgICB0aGlzLmZvbnQgPSBuZXcgUGhldEZvbnQoIG9wdGlvbnMuZm9udFNpemUgKTtcclxuICAgIHRoaXMuZm9udFNpemUgPSBvcHRpb25zLmZvbnRTaXplO1xyXG4gICAgdGhpcy5jb21tYVNlcGFyYXRlZCA9IG9wdGlvbnMuY29tbWFTZXBhcmF0ZWQ7XHJcbiAgICB0aGlzLnNwYWNpbmdJbnNpZGVUZXJtcyA9IG9wdGlvbnMuc3BhY2luZ0luc2lkZVRlcm1zO1xyXG4gICAgdGhpcy5zcGFjaW5nQmV0d2VlblRlcm1zID0gb3B0aW9ucy5zcGFjaW5nQmV0d2VlblRlcm1zO1xyXG4gICAgdGhpcy5kaXNwb3NlTm9kZXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlTm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgdGhpcy5kaXNwb3NlTm9kZXMubGVuZ3RoID0gMDtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogTm9kZVtdID0gW107XHJcblxyXG4gICAgLy8gJygnIHdpdGggbm9ybWFsIGZvbnRcclxuICAgIGNvbnN0IGxlZnRQYXJlblRleHQgPSBuZXcgVGV4dCggJygnLCB7IGZvbnQ6IHRoaXMuZm9udCB9ICk7XHJcbiAgICBjaGlsZHJlbi5wdXNoKCBsZWZ0UGFyZW5UZXh0ICk7XHJcblxyXG4gICAgLy8gRS5nLiB7e3N5bWJvbH19ID0ge3t2YWx1ZX19LCBmb3IgZWFjaCB2YXJpYWJsZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy52YXJpYWJsZXMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICBjb25zdCB2YXJpYWJsZSA9IHRoaXMudmFyaWFibGVzWyBpIF07XHJcblxyXG4gICAgICBjb25zdCB2YXJpYWJsZU5vZGUgPSBuZXcgVmFyaWFibGVOb2RlKCB2YXJpYWJsZSwge1xyXG4gICAgICAgIGljb25TY2FsZTogMC4zNSxcclxuICAgICAgICBmb250U2l6ZTogdGhpcy5mb250U2l6ZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZU5vZGVzLnB1c2goIHZhcmlhYmxlTm9kZSApOyAvLyBiZWNhdXNlIHZhcmlhYmxlTm9kZSBtYXkgYmUgbGlua2VkIHRvIGEgU3RyaW5nUHJvcGVydHlcclxuXHJcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogdGhpcy5zcGFjaW5nSW5zaWRlVGVybXMsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuXHJcbiAgICAgICAgICAvLyB2YXJpYWJsZVxyXG4gICAgICAgICAgdmFyaWFibGVOb2RlLFxyXG5cclxuICAgICAgICAgIC8vID1cclxuICAgICAgICAgIG5ldyBUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgeyBmb250OiB0aGlzLmZvbnQgfSApLFxyXG5cclxuICAgICAgICAgIC8vIE5cclxuICAgICAgICAgIG5ldyBUZXh0KCBgJHt2YXJpYWJsZS52YWx1ZVByb3BlcnR5LnZhbHVlfWAsIHsgZm9udDogdGhpcy5mb250IH0gKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyBjb21tYSArIHNwYWNlIHNlcGFyYXRvclxyXG4gICAgICBpZiAoIGkgPCB0aGlzLnZhcmlhYmxlcy5sZW5ndGggLSAxICkge1xyXG4gICAgICAgIGlmICggdGhpcy5jb21tYVNlcGFyYXRlZCApIHtcclxuICAgICAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBUZXh0KCAnLCcsIHsgZm9udDogdGhpcy5mb250IH0gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgSFN0cnV0KCB0aGlzLnNwYWNpbmdCZXR3ZWVuVGVybXMgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmlnaHRQYXJlblRleHQgPSBuZXcgVGV4dCggJyknLCB7IGZvbnQ6IHRoaXMuZm9udCB9ICk7XHJcbiAgICBjaGlsZHJlbi5wdXNoKCByaWdodFBhcmVuVGV4dCApO1xyXG5cclxuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdWYXJpYWJsZVZhbHVlc05vZGUnLCBWYXJpYWJsZVZhbHVlc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSx1Q0FBdUM7QUFHN0QsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQWVDLElBQUksRUFBZUMsTUFBTSxFQUFRQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9GLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUV4RCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBYTVDLGVBQWUsTUFBTUMsa0JBQWtCLFNBQVNMLElBQUksQ0FBQztFQVFaO0VBRXZDO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NNLFdBQVdBLENBQUVDLFNBQXFCLEVBQUVDLGVBQTJDLEVBQUc7SUFFdkYsTUFBTUMsT0FBTyxHQUFHWixTQUFTLENBQXNELENBQUMsQ0FBRTtNQUVoRjtNQUNBYSxRQUFRLEVBQUUsRUFBRTtNQUNaQyxjQUFjLEVBQUUsSUFBSTtNQUNwQkMsa0JBQWtCLEVBQUUsQ0FBQztNQUNyQkMsbUJBQW1CLEVBQUUsRUFBRTtNQUV2QjtNQUNBO01BQ0E7TUFDQUMsS0FBSyxFQUFFLElBQUk7TUFDWEMsT0FBTyxFQUFFO0lBRVgsQ0FBQyxFQUFFUCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0YsU0FBUyxHQUFHQSxTQUFTO0lBQzFCLElBQUksQ0FBQ1MsSUFBSSxHQUFHLElBQUlqQixRQUFRLENBQUVVLE9BQU8sQ0FBQ0MsUUFBUyxDQUFDO0lBQzVDLElBQUksQ0FBQ0EsUUFBUSxHQUFHRCxPQUFPLENBQUNDLFFBQVE7SUFDaEMsSUFBSSxDQUFDQyxjQUFjLEdBQUdGLE9BQU8sQ0FBQ0UsY0FBYztJQUM1QyxJQUFJLENBQUNDLGtCQUFrQixHQUFHSCxPQUFPLENBQUNHLGtCQUFrQjtJQUNwRCxJQUFJLENBQUNDLG1CQUFtQixHQUFHSixPQUFPLENBQUNJLG1CQUFtQjtJQUN0RCxJQUFJLENBQUNJLFlBQVksR0FBRyxFQUFFO0lBRXRCLElBQUksQ0FBQ0MsTUFBTSxDQUFDLENBQUM7RUFDZjtFQUVnQkMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtFQUVPRCxNQUFNQSxDQUFBLEVBQVM7SUFFcEIsSUFBSSxDQUFDRCxZQUFZLENBQUNJLE9BQU8sQ0FBRUMsSUFBSSxJQUFJQSxJQUFJLENBQUNILE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDbkQsSUFBSSxDQUFDRixZQUFZLENBQUNNLE1BQU0sR0FBRyxDQUFDO0lBRTVCLE1BQU1DLFFBQWdCLEdBQUcsRUFBRTs7SUFFM0I7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSXZCLElBQUksQ0FBRSxHQUFHLEVBQUU7TUFBRWMsSUFBSSxFQUFFLElBQUksQ0FBQ0E7SUFBSyxDQUFFLENBQUM7SUFDMURRLFFBQVEsQ0FBQ0UsSUFBSSxDQUFFRCxhQUFjLENBQUM7O0lBRTlCO0lBQ0EsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDcEIsU0FBUyxDQUFDZ0IsTUFBTSxFQUFFSSxDQUFDLEVBQUUsRUFBRztNQUVoRCxNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDckIsU0FBUyxDQUFFb0IsQ0FBQyxDQUFFO01BRXBDLE1BQU1FLFlBQVksR0FBRyxJQUFJekIsWUFBWSxDQUFFd0IsUUFBUSxFQUFFO1FBQy9DRSxTQUFTLEVBQUUsSUFBSTtRQUNmcEIsUUFBUSxFQUFFLElBQUksQ0FBQ0E7TUFDakIsQ0FBRSxDQUFDO01BQ0gsSUFBSSxDQUFDTyxZQUFZLENBQUNTLElBQUksQ0FBRUcsWUFBYSxDQUFDLENBQUMsQ0FBQzs7TUFFeENMLFFBQVEsQ0FBQ0UsSUFBSSxDQUFFLElBQUkxQixJQUFJLENBQUU7UUFDdkJlLE9BQU8sRUFBRSxJQUFJLENBQUNILGtCQUFrQjtRQUNoQ1ksUUFBUSxFQUFFO1FBRVI7UUFDQUssWUFBWTtRQUVaO1FBQ0EsSUFBSTNCLElBQUksQ0FBRUosV0FBVyxDQUFDaUMsUUFBUSxFQUFFO1VBQUVmLElBQUksRUFBRSxJQUFJLENBQUNBO1FBQUssQ0FBRSxDQUFDO1FBRXJEO1FBQ0EsSUFBSWQsSUFBSSxDQUFHLEdBQUUwQixRQUFRLENBQUNJLGFBQWEsQ0FBQ0MsS0FBTSxFQUFDLEVBQUU7VUFBRWpCLElBQUksRUFBRSxJQUFJLENBQUNBO1FBQUssQ0FBRSxDQUFDO01BRXRFLENBQUUsQ0FBRSxDQUFDOztNQUVMO01BQ0EsSUFBS1csQ0FBQyxHQUFHLElBQUksQ0FBQ3BCLFNBQVMsQ0FBQ2dCLE1BQU0sR0FBRyxDQUFDLEVBQUc7UUFDbkMsSUFBSyxJQUFJLENBQUNaLGNBQWMsRUFBRztVQUN6QmEsUUFBUSxDQUFDRSxJQUFJLENBQUUsSUFBSXhCLElBQUksQ0FBRSxHQUFHLEVBQUU7WUFBRWMsSUFBSSxFQUFFLElBQUksQ0FBQ0E7VUFBSyxDQUFFLENBQUUsQ0FBQztRQUN2RDtRQUNBUSxRQUFRLENBQUNFLElBQUksQ0FBRSxJQUFJekIsTUFBTSxDQUFFLElBQUksQ0FBQ1ksbUJBQW9CLENBQUUsQ0FBQztNQUN6RDtJQUNGO0lBRUEsTUFBTXFCLGNBQWMsR0FBRyxJQUFJaEMsSUFBSSxDQUFFLEdBQUcsRUFBRTtNQUFFYyxJQUFJLEVBQUUsSUFBSSxDQUFDQTtJQUFLLENBQUUsQ0FBQztJQUMzRFEsUUFBUSxDQUFDRSxJQUFJLENBQUVRLGNBQWUsQ0FBQztJQUUvQixJQUFJLENBQUNWLFFBQVEsR0FBR0EsUUFBUTtFQUMxQjtBQUNGO0FBRUFyQixnQkFBZ0IsQ0FBQ2dDLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRTlCLGtCQUFtQixDQUFDIn0=