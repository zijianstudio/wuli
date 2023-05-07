// Copyright 2015-2021, University of Colorado Boulder

/**
 * Given structured documentation output from extractDocumentation (and associated other metadata), this outputs both
 * HTML meant for a collapsible documentation index and HTML content for all of the documentation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

/* eslint-env browser, node */

(function () {
  let typeURLs = {
    // is replaced by every documentationToHTML() call
  };

  // borrowed from phet-core.
  function escapeHTML(str) {
    // see https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    // HTML Entity Encoding
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  }

  /**
   * Parses the HTML looking for examples (matching #begin and #end) that have embedded #on/#off to control where code
   * examples are displayed. Breaks up everything into a concise paragraph structure (blank lines trigger the end of a
   * paragraph).
   * @private
   *
   * @param {string} string
   * @returns {string}
   */
  function descriptionHTML(string) {
    let result = '';
    const lines = string.split('\n');
    let inParagraph = false;
    function insideParagraph() {
      if (!inParagraph) {
        result += '<p>\n';
        inParagraph = true;
      }
    }
    function outsideParagraph() {
      if (inParagraph) {
        result += '</p>\n';
        inParagraph = false;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf('#begin') === 0) {
        const initialLine = lines[i];
        const runLines = [];
        const displayLines = [];
        let isDisplayed = false;
        for (i++; i < lines.length; i++) {
          if (lines[i].indexOf('#end') === 0) {
            break;
          } else if (lines[i].indexOf('#on') === 0) {
            isDisplayed = true;
          } else if (lines[i].indexOf('#off') === 0) {
            isDisplayed = false;
          } else {
            runLines.push(lines[i]);
            if (isDisplayed) {
              displayLines.push(lines[i]);
            }
          }
        }
        const runString = runLines.join('\n');
        const displayString = displayLines.join('\n');
        const canvasExampleMatch = initialLine.match(/^#begin canvasExample ([^ ]+) ([^x]+)x([^x]+)$/);
        if (canvasExampleMatch) {
          outsideParagraph();
          const name = canvasExampleMatch[1];
          const width = canvasExampleMatch[2];
          const height = canvasExampleMatch[3];
          const exampleName = `example-${name}`;
          result += `<canvas id="${exampleName}" class="exampleScene"></canvas>`;
          result += '<script>(function(){';
          result += `var canvas = document.getElementById( "${exampleName}" );`;
          result += `canvas.width = ${width};`;
          result += `canvas.height = ${height};`;
          result += 'var context = canvas.getContext( "2d" );';
          result += runString;
          result += '})();</' + 'script>'; // eslint-disable-line no-useless-concat
          result += '<pre class="brush: js">\n';
          result += displayString;
          result += '</pre>';
        }
      } else {
        if (line.length === 0) {
          outsideParagraph();
        } else {
          insideParagraph();
          result += `${line}\n`;
        }
      }
    }
    outsideParagraph();
    return result;
  }
  function typeString(type) {
    const url = typeURLs[type];
    if (url) {
      return ` <a href="${url}" class="type">${escapeHTML(type)}</a>`;
    } else {
      return ` <span class="type">${escapeHTML(type)}</span>`;
    }
  }
  function inlineParameterList(object) {
    let result = '';
    if (object.parameters) {
      result += `( ${object.parameters.map(parameter => {
        let name = parameter.name;
        if (parameter.optional) {
          name = `<span class="optional">${name}</span>`;
        }
        return `<span class="args">${typeString(parameter.type)} ${name}</span>`;
      }).join(', ')} )`;
    } else if (object.type === 'function') {
      result += '()';
    }
    return result;
  }
  function parameterDetailsList(object) {
    let result = '';
    const parametersWithDescriptions = object.parameters ? object.parameters.filter(parameter => {
      return !!parameter.description;
    }) : [];
    if (parametersWithDescriptions.length) {
      result += '<table class="params">\n';
      parametersWithDescriptions.forEach(parameter => {
        let name = parameter.name;
        const description = parameter.description || '';
        if (parameter.optional) {
          name = `<span class="optional">${name}</span>`;
        }
        result += `<tr class="param"><td>${typeString(parameter.type)}</td><td>${name}</td><td> - </td><td>${description}</td></tr>\n`;
      });
      result += '</table>\n';
    }
    return result;
  }
  function returnOrConstant(object) {
    let result = '';
    if (object.returns || object.constant) {
      const type = (object.returns || object.constant).type;
      if (object.returns) {
        result += ' :';
      }
      result += `<span class="return">${typeString(type)}</span>`;
    }
    return result;
  }
  function nameLookup(array, name) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name) {
        return array[i];
      }
    }
    return null;
  }

  /**
   * For a given doc (extractDocumentation output) and a base name for the file (e.g. 'Vector2' for Vector2.js),
   * collect top-level documentation (and public documentation for every type referenced in typeNmaes) and return an
   * object: { indexHTML: {string}, contentHTML: {string} } which includes the HTML for the index (list of types and
   * methods/fields/etc.) and content (the documentation itself).
   *
   * @param {Object} doc
   * @param {string} baseName
   * @param {Array.<string>} typeNames - Names of types from this file to include in the documentation.
   * @param {Object} localTypeIds - Keys should be type names included in the same documentation output, and the values
   *                                should be a prefix applied for hash URLs of the given type. This helps prefix
   *                                things, so Vector2.angle will have a URL #vector2-angle.
   * @param {Object} externalTypeURLs - Keys should be type names NOT included in the same documentation output, and
   *                                    values should be URLs for those types.
   * @returns {Object} - With indexHTML and contentHTML fields, both strings of HTML.
   */
  function documentationToHTML(doc, baseName, typeNames, localTypeIds, externalTypeURLs) {
    let indexHTML = '';
    let contentHTML = '';

    // Initialize typeURLs for the output
    typeURLs = {};
    Object.keys(externalTypeURLs).forEach(typeId => {
      typeURLs[typeId] = externalTypeURLs[typeId];
    });
    Object.keys(localTypeIds).forEach(typeId => {
      typeURLs[typeId] = `#${localTypeIds[typeId]}`;
    });
    const baseURL = typeURLs[baseName];
    indexHTML += `<a class="navlink" href="${baseURL}" data-toggle="collapse" data-target="#collapse-${baseName}" onclick="$( '.collapse.in' ).collapse( 'toggle' ); return true;">${baseName}</a><br>\n`;
    indexHTML += `<div id="collapse-${baseName}" class="collapse">\n`;
    contentHTML += `<h3 id="${baseURL.slice(1)}" class="section">${baseName}</h3>\n`;
    contentHTML += descriptionHTML(doc.topLevelComment.description);
    typeNames.forEach(typeName => {
      const baseObject = doc[typeName];
      const baseURLPrefix = `${localTypeIds[typeName]}-`;

      // constructor
      if (baseObject.type === 'type') {
        // Add a target for #-links if we aren't the baseName.
        if (typeName !== baseName) {
          contentHTML += `<div id="${baseURLPrefix.slice(0, baseURLPrefix.length - 1)}"></div>`;
        }
        let constructorLine = typeName + inlineParameterList(baseObject.comment);
        if (baseObject.supertype) {
          constructorLine += ` <span class="inherit">extends ${typeString(baseObject.supertype)}</span>`;
        }
        contentHTML += `<h4 id="${baseURLPrefix}constructor" class="section">${constructorLine}</h4>`;
        contentHTML += descriptionHTML(baseObject.comment.description);
        contentHTML += parameterDetailsList(baseObject.comment);
      }
      const staticProperties = baseObject.staticProperties || baseObject.properties || [];
      const staticNames = staticProperties.map(prop => prop.name).sort();
      staticNames.forEach(name => {
        const object = nameLookup(staticProperties, name);
        indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
        let typeLine = `<span class="entryName">${typeName}.${object.name}</span>`;
        typeLine += inlineParameterList(object);
        typeLine += returnOrConstant(object);
        contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
        if (object.description) {
          contentHTML += descriptionHTML(object.description);
        }
        contentHTML += parameterDetailsList(object);
      });
      if (baseObject.type === 'type') {
        const constructorNames = baseObject.constructorProperties.map(prop => prop.name).sort();
        constructorNames.forEach(name => {
          const object = nameLookup(baseObject.constructorProperties, name);
          indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
          let typeLine = `<span class="entryName">${object.name}</span>`;
          typeLine += ` <span class="property">${typeString(object.type)}</span>`;
          contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
          if (object.description) {
            contentHTML += descriptionHTML(object.description);
          }
        });
      }
      if (baseObject.type === 'type') {
        const instanceNames = baseObject.instanceProperties.map(prop => prop.name).sort();
        instanceNames.forEach(name => {
          const object = nameLookup(baseObject.instanceProperties, name);
          indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
          let typeLine = `<span class="entryName">${object.name}</span>`;
          if (object.explicitGetName) {
            typeLine += ` <span class="property">${typeString(object.returns.type)}</span>`;
            typeLine += ` <span class="entryName explicitSetterGetter">${object.explicitGetName}`;
          }
          if (object.explicitSetName) {
            typeLine += ` <span class="property">${typeString(object.returns.type)}</span>`;
            typeLine += ` <span class="entryName explicitSetterGetter">${object.explicitSetName}`;
          }
          typeLine += inlineParameterList(object);
          typeLine += returnOrConstant(object);
          if (object.explicitSetName || object.explicitGetName) {
            typeLine += '</span>';
          }
          contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
          contentHTML += descriptionHTML(object.description);
          contentHTML += parameterDetailsList(object);
        });
      }
    });
    indexHTML += '</div>';
    return {
      indexHTML: indexHTML,
      contentHTML: contentHTML
    };
  }

  // Node.js-compatible definition
  if (typeof module !== 'undefined') {
    module.exports = documentationToHTML;
  }

  // Browser direct definition (for testing)
  if (typeof window !== 'undefined') {
    window.documentationToHTML = documentationToHTML;
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0eXBlVVJMcyIsImVzY2FwZUhUTUwiLCJzdHIiLCJyZXBsYWNlIiwiZGVzY3JpcHRpb25IVE1MIiwic3RyaW5nIiwicmVzdWx0IiwibGluZXMiLCJzcGxpdCIsImluUGFyYWdyYXBoIiwiaW5zaWRlUGFyYWdyYXBoIiwib3V0c2lkZVBhcmFncmFwaCIsImkiLCJsZW5ndGgiLCJsaW5lIiwiaW5kZXhPZiIsImluaXRpYWxMaW5lIiwicnVuTGluZXMiLCJkaXNwbGF5TGluZXMiLCJpc0Rpc3BsYXllZCIsInB1c2giLCJydW5TdHJpbmciLCJqb2luIiwiZGlzcGxheVN0cmluZyIsImNhbnZhc0V4YW1wbGVNYXRjaCIsIm1hdGNoIiwibmFtZSIsIndpZHRoIiwiaGVpZ2h0IiwiZXhhbXBsZU5hbWUiLCJ0eXBlU3RyaW5nIiwidHlwZSIsInVybCIsImlubGluZVBhcmFtZXRlckxpc3QiLCJvYmplY3QiLCJwYXJhbWV0ZXJzIiwibWFwIiwicGFyYW1ldGVyIiwib3B0aW9uYWwiLCJwYXJhbWV0ZXJEZXRhaWxzTGlzdCIsInBhcmFtZXRlcnNXaXRoRGVzY3JpcHRpb25zIiwiZmlsdGVyIiwiZGVzY3JpcHRpb24iLCJmb3JFYWNoIiwicmV0dXJuT3JDb25zdGFudCIsInJldHVybnMiLCJjb25zdGFudCIsIm5hbWVMb29rdXAiLCJhcnJheSIsImRvY3VtZW50YXRpb25Ub0hUTUwiLCJkb2MiLCJiYXNlTmFtZSIsInR5cGVOYW1lcyIsImxvY2FsVHlwZUlkcyIsImV4dGVybmFsVHlwZVVSTHMiLCJpbmRleEhUTUwiLCJjb250ZW50SFRNTCIsIk9iamVjdCIsImtleXMiLCJ0eXBlSWQiLCJiYXNlVVJMIiwic2xpY2UiLCJ0b3BMZXZlbENvbW1lbnQiLCJ0eXBlTmFtZSIsImJhc2VPYmplY3QiLCJiYXNlVVJMUHJlZml4IiwiY29uc3RydWN0b3JMaW5lIiwiY29tbWVudCIsInN1cGVydHlwZSIsInN0YXRpY1Byb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwic3RhdGljTmFtZXMiLCJwcm9wIiwic29ydCIsInR5cGVMaW5lIiwiY29uc3RydWN0b3JOYW1lcyIsImNvbnN0cnVjdG9yUHJvcGVydGllcyIsImluc3RhbmNlTmFtZXMiLCJpbnN0YW5jZVByb3BlcnRpZXMiLCJleHBsaWNpdEdldE5hbWUiLCJleHBsaWNpdFNldE5hbWUiLCJtb2R1bGUiLCJleHBvcnRzIiwid2luZG93Il0sInNvdXJjZXMiOlsiZG9jdW1lbnRhdGlvblRvSFRNTC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHaXZlbiBzdHJ1Y3R1cmVkIGRvY3VtZW50YXRpb24gb3V0cHV0IGZyb20gZXh0cmFjdERvY3VtZW50YXRpb24gKGFuZCBhc3NvY2lhdGVkIG90aGVyIG1ldGFkYXRhKSwgdGhpcyBvdXRwdXRzIGJvdGhcclxuICogSFRNTCBtZWFudCBmb3IgYSBjb2xsYXBzaWJsZSBkb2N1bWVudGF0aW9uIGluZGV4IGFuZCBIVE1MIGNvbnRlbnQgZm9yIGFsbCBvZiB0aGUgZG9jdW1lbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbi8qIGVzbGludC1lbnYgYnJvd3Nlciwgbm9kZSAqL1xyXG5cclxuXHJcbiggZnVuY3Rpb24oKSB7XHJcblxyXG4gIGxldCB0eXBlVVJMcyA9IHtcclxuICAgIC8vIGlzIHJlcGxhY2VkIGJ5IGV2ZXJ5IGRvY3VtZW50YXRpb25Ub0hUTUwoKSBjYWxsXHJcbiAgfTtcclxuXHJcbiAgLy8gYm9ycm93ZWQgZnJvbSBwaGV0LWNvcmUuXHJcbiAgZnVuY3Rpb24gZXNjYXBlSFRNTCggc3RyICkge1xyXG4gICAgLy8gc2VlIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvWFNTXyhDcm9zc19TaXRlX1NjcmlwdGluZylfUHJldmVudGlvbl9DaGVhdF9TaGVldFxyXG4gICAgLy8gSFRNTCBFbnRpdHkgRW5jb2RpbmdcclxuICAgIHJldHVybiBzdHJcclxuICAgICAgLnJlcGxhY2UoIC8mL2csICcmYW1wOycgKVxyXG4gICAgICAucmVwbGFjZSggLzwvZywgJyZsdDsnIClcclxuICAgICAgLnJlcGxhY2UoIC8+L2csICcmZ3Q7JyApXHJcbiAgICAgIC5yZXBsYWNlKCAvXCIvZywgJyZxdW90OycgKVxyXG4gICAgICAucmVwbGFjZSggLycvZywgJyYjeDI3OycgKVxyXG4gICAgICAucmVwbGFjZSggL1xcLy9nLCAnJiN4MkY7JyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2VzIHRoZSBIVE1MIGxvb2tpbmcgZm9yIGV4YW1wbGVzIChtYXRjaGluZyAjYmVnaW4gYW5kICNlbmQpIHRoYXQgaGF2ZSBlbWJlZGRlZCAjb24vI29mZiB0byBjb250cm9sIHdoZXJlIGNvZGVcclxuICAgKiBleGFtcGxlcyBhcmUgZGlzcGxheWVkLiBCcmVha3MgdXAgZXZlcnl0aGluZyBpbnRvIGEgY29uY2lzZSBwYXJhZ3JhcGggc3RydWN0dXJlIChibGFuayBsaW5lcyB0cmlnZ2VyIHRoZSBlbmQgb2YgYVxyXG4gICAqIHBhcmFncmFwaCkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRlc2NyaXB0aW9uSFRNTCggc3RyaW5nICkge1xyXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgY29uc3QgbGluZXMgPSBzdHJpbmcuc3BsaXQoICdcXG4nICk7XHJcblxyXG4gICAgbGV0IGluUGFyYWdyYXBoID0gZmFsc2U7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5zaWRlUGFyYWdyYXBoKCkge1xyXG4gICAgICBpZiAoICFpblBhcmFncmFwaCApIHtcclxuICAgICAgICByZXN1bHQgKz0gJzxwPlxcbic7XHJcbiAgICAgICAgaW5QYXJhZ3JhcGggPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb3V0c2lkZVBhcmFncmFwaCgpIHtcclxuICAgICAgaWYgKCBpblBhcmFncmFwaCApIHtcclxuICAgICAgICByZXN1bHQgKz0gJzwvcD5cXG4nO1xyXG4gICAgICAgIGluUGFyYWdyYXBoID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbGluZSA9IGxpbmVzWyBpIF07XHJcblxyXG4gICAgICBpZiAoIGxpbmUuaW5kZXhPZiggJyNiZWdpbicgKSA9PT0gMCApIHtcclxuICAgICAgICBjb25zdCBpbml0aWFsTGluZSA9IGxpbmVzWyBpIF07XHJcbiAgICAgICAgY29uc3QgcnVuTGluZXMgPSBbXTtcclxuICAgICAgICBjb25zdCBkaXNwbGF5TGluZXMgPSBbXTtcclxuICAgICAgICBsZXQgaXNEaXNwbGF5ZWQgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKCBpKys7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGlmICggbGluZXNbIGkgXS5pbmRleE9mKCAnI2VuZCcgKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggbGluZXNbIGkgXS5pbmRleE9mKCAnI29uJyApID09PSAwICkge1xyXG4gICAgICAgICAgICBpc0Rpc3BsYXllZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggbGluZXNbIGkgXS5pbmRleE9mKCAnI29mZicgKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgaXNEaXNwbGF5ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBydW5MaW5lcy5wdXNoKCBsaW5lc1sgaSBdICk7XHJcbiAgICAgICAgICAgIGlmICggaXNEaXNwbGF5ZWQgKSB7XHJcbiAgICAgICAgICAgICAgZGlzcGxheUxpbmVzLnB1c2goIGxpbmVzWyBpIF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcnVuU3RyaW5nID0gcnVuTGluZXMuam9pbiggJ1xcbicgKTtcclxuICAgICAgICBjb25zdCBkaXNwbGF5U3RyaW5nID0gZGlzcGxheUxpbmVzLmpvaW4oICdcXG4nICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbnZhc0V4YW1wbGVNYXRjaCA9IGluaXRpYWxMaW5lLm1hdGNoKCAvXiNiZWdpbiBjYW52YXNFeGFtcGxlIChbXiBdKykgKFteeF0rKXgoW154XSspJC8gKTtcclxuICAgICAgICBpZiAoIGNhbnZhc0V4YW1wbGVNYXRjaCApIHtcclxuICAgICAgICAgIG91dHNpZGVQYXJhZ3JhcGgoKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBuYW1lID0gY2FudmFzRXhhbXBsZU1hdGNoWyAxIF07XHJcbiAgICAgICAgICBjb25zdCB3aWR0aCA9IGNhbnZhc0V4YW1wbGVNYXRjaFsgMiBdO1xyXG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gY2FudmFzRXhhbXBsZU1hdGNoWyAzIF07XHJcblxyXG4gICAgICAgICAgY29uc3QgZXhhbXBsZU5hbWUgPSBgZXhhbXBsZS0ke25hbWV9YDtcclxuXHJcbiAgICAgICAgICByZXN1bHQgKz0gYDxjYW52YXMgaWQ9XCIke2V4YW1wbGVOYW1lfVwiIGNsYXNzPVwiZXhhbXBsZVNjZW5lXCI+PC9jYW52YXM+YDtcclxuICAgICAgICAgIHJlc3VsdCArPSAnPHNjcmlwdD4oZnVuY3Rpb24oKXsnO1xyXG4gICAgICAgICAgcmVzdWx0ICs9IGB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwiJHtleGFtcGxlTmFtZX1cIiApO2A7XHJcbiAgICAgICAgICByZXN1bHQgKz0gYGNhbnZhcy53aWR0aCA9ICR7d2lkdGh9O2A7XHJcbiAgICAgICAgICByZXN1bHQgKz0gYGNhbnZhcy5oZWlnaHQgPSAke2hlaWdodH07YDtcclxuICAgICAgICAgIHJlc3VsdCArPSAndmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggXCIyZFwiICk7JztcclxuICAgICAgICAgIHJlc3VsdCArPSBydW5TdHJpbmc7XHJcbiAgICAgICAgICByZXN1bHQgKz0gJ30pKCk7PC8nICsgJ3NjcmlwdD4nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZWxlc3MtY29uY2F0XHJcbiAgICAgICAgICByZXN1bHQgKz0gJzxwcmUgY2xhc3M9XCJicnVzaDoganNcIj5cXG4nO1xyXG4gICAgICAgICAgcmVzdWx0ICs9IGRpc3BsYXlTdHJpbmc7XHJcbiAgICAgICAgICByZXN1bHQgKz0gJzwvcHJlPic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggbGluZS5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICBvdXRzaWRlUGFyYWdyYXBoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaW5zaWRlUGFyYWdyYXBoKCk7XHJcbiAgICAgICAgICByZXN1bHQgKz0gYCR7bGluZX1cXG5gO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgb3V0c2lkZVBhcmFncmFwaCgpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0eXBlU3RyaW5nKCB0eXBlICkge1xyXG4gICAgY29uc3QgdXJsID0gdHlwZVVSTHNbIHR5cGUgXTtcclxuICAgIGlmICggdXJsICkge1xyXG4gICAgICByZXR1cm4gYCA8YSBocmVmPVwiJHt1cmx9XCIgY2xhc3M9XCJ0eXBlXCI+JHtlc2NhcGVIVE1MKCB0eXBlICl9PC9hPmA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGAgPHNwYW4gY2xhc3M9XCJ0eXBlXCI+JHtlc2NhcGVIVE1MKCB0eXBlICl9PC9zcGFuPmA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbmxpbmVQYXJhbWV0ZXJMaXN0KCBvYmplY3QgKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICBpZiAoIG9iamVjdC5wYXJhbWV0ZXJzICkge1xyXG4gICAgICByZXN1bHQgKz0gYCggJHtvYmplY3QucGFyYW1ldGVycy5tYXAoIHBhcmFtZXRlciA9PiB7XHJcbiAgICAgICAgbGV0IG5hbWUgPSBwYXJhbWV0ZXIubmFtZTtcclxuICAgICAgICBpZiAoIHBhcmFtZXRlci5vcHRpb25hbCApIHtcclxuICAgICAgICAgIG5hbWUgPSBgPHNwYW4gY2xhc3M9XCJvcHRpb25hbFwiPiR7bmFtZX08L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cImFyZ3NcIj4ke3R5cGVTdHJpbmcoIHBhcmFtZXRlci50eXBlICl9ICR7bmFtZX08L3NwYW4+YDtcclxuICAgICAgfSApLmpvaW4oICcsICcgKX0gKWA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggb2JqZWN0LnR5cGUgPT09ICdmdW5jdGlvbicgKSB7XHJcbiAgICAgIHJlc3VsdCArPSAnKCknO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBhcmFtZXRlckRldGFpbHNMaXN0KCBvYmplY3QgKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJzV2l0aERlc2NyaXB0aW9ucyA9IG9iamVjdC5wYXJhbWV0ZXJzID8gb2JqZWN0LnBhcmFtZXRlcnMuZmlsdGVyKCBwYXJhbWV0ZXIgPT4ge1xyXG4gICAgICByZXR1cm4gISFwYXJhbWV0ZXIuZGVzY3JpcHRpb247XHJcbiAgICB9ICkgOiBbXTtcclxuXHJcbiAgICBpZiAoIHBhcmFtZXRlcnNXaXRoRGVzY3JpcHRpb25zLmxlbmd0aCApIHtcclxuICAgICAgcmVzdWx0ICs9ICc8dGFibGUgY2xhc3M9XCJwYXJhbXNcIj5cXG4nO1xyXG4gICAgICBwYXJhbWV0ZXJzV2l0aERlc2NyaXB0aW9ucy5mb3JFYWNoKCBwYXJhbWV0ZXIgPT4ge1xyXG4gICAgICAgIGxldCBuYW1lID0gcGFyYW1ldGVyLm5hbWU7XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBwYXJhbWV0ZXIuZGVzY3JpcHRpb24gfHwgJyc7XHJcbiAgICAgICAgaWYgKCBwYXJhbWV0ZXIub3B0aW9uYWwgKSB7XHJcbiAgICAgICAgICBuYW1lID0gYDxzcGFuIGNsYXNzPVwib3B0aW9uYWxcIj4ke25hbWV9PC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdCArPSBgPHRyIGNsYXNzPVwicGFyYW1cIj48dGQ+JHt0eXBlU3RyaW5nKCBwYXJhbWV0ZXIudHlwZSApfTwvdGQ+PHRkPiR7bmFtZX08L3RkPjx0ZD4gLSA8L3RkPjx0ZD4ke2Rlc2NyaXB0aW9ufTwvdGQ+PC90cj5cXG5gO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHJlc3VsdCArPSAnPC90YWJsZT5cXG4nO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJldHVybk9yQ29uc3RhbnQoIG9iamVjdCApIHtcclxuICAgIGxldCByZXN1bHQgPSAnJztcclxuICAgIGlmICggb2JqZWN0LnJldHVybnMgfHwgb2JqZWN0LmNvbnN0YW50ICkge1xyXG4gICAgICBjb25zdCB0eXBlID0gKCBvYmplY3QucmV0dXJucyB8fCBvYmplY3QuY29uc3RhbnQgKS50eXBlO1xyXG4gICAgICBpZiAoIG9iamVjdC5yZXR1cm5zICkge1xyXG4gICAgICAgIHJlc3VsdCArPSAnIDonO1xyXG4gICAgICB9XHJcbiAgICAgIHJlc3VsdCArPSBgPHNwYW4gY2xhc3M9XCJyZXR1cm5cIj4ke3R5cGVTdHJpbmcoIHR5cGUgKX08L3NwYW4+YDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuYW1lTG9va3VwKCBhcnJheSwgbmFtZSApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGFycmF5WyBpIF0ubmFtZSA9PT0gbmFtZSApIHtcclxuICAgICAgICByZXR1cm4gYXJyYXlbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgYSBnaXZlbiBkb2MgKGV4dHJhY3REb2N1bWVudGF0aW9uIG91dHB1dCkgYW5kIGEgYmFzZSBuYW1lIGZvciB0aGUgZmlsZSAoZS5nLiAnVmVjdG9yMicgZm9yIFZlY3RvcjIuanMpLFxyXG4gICAqIGNvbGxlY3QgdG9wLWxldmVsIGRvY3VtZW50YXRpb24gKGFuZCBwdWJsaWMgZG9jdW1lbnRhdGlvbiBmb3IgZXZlcnkgdHlwZSByZWZlcmVuY2VkIGluIHR5cGVObWFlcykgYW5kIHJldHVybiBhblxyXG4gICAqIG9iamVjdDogeyBpbmRleEhUTUw6IHtzdHJpbmd9LCBjb250ZW50SFRNTDoge3N0cmluZ30gfSB3aGljaCBpbmNsdWRlcyB0aGUgSFRNTCBmb3IgdGhlIGluZGV4IChsaXN0IG9mIHR5cGVzIGFuZFxyXG4gICAqIG1ldGhvZHMvZmllbGRzL2V0Yy4pIGFuZCBjb250ZW50ICh0aGUgZG9jdW1lbnRhdGlvbiBpdHNlbGYpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGRvY1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlTmFtZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHR5cGVOYW1lcyAtIE5hbWVzIG9mIHR5cGVzIGZyb20gdGhpcyBmaWxlIHRvIGluY2x1ZGUgaW4gdGhlIGRvY3VtZW50YXRpb24uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FsVHlwZUlkcyAtIEtleXMgc2hvdWxkIGJlIHR5cGUgbmFtZXMgaW5jbHVkZWQgaW4gdGhlIHNhbWUgZG9jdW1lbnRhdGlvbiBvdXRwdXQsIGFuZCB0aGUgdmFsdWVzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBiZSBhIHByZWZpeCBhcHBsaWVkIGZvciBoYXNoIFVSTHMgb2YgdGhlIGdpdmVuIHR5cGUuIFRoaXMgaGVscHMgcHJlZml4XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaW5ncywgc28gVmVjdG9yMi5hbmdsZSB3aWxsIGhhdmUgYSBVUkwgI3ZlY3RvcjItYW5nbGUuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGV4dGVybmFsVHlwZVVSTHMgLSBLZXlzIHNob3VsZCBiZSB0eXBlIG5hbWVzIE5PVCBpbmNsdWRlZCBpbiB0aGUgc2FtZSBkb2N1bWVudGF0aW9uIG91dHB1dCwgYW5kXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgc2hvdWxkIGJlIFVSTHMgZm9yIHRob3NlIHR5cGVzLlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IC0gV2l0aCBpbmRleEhUTUwgYW5kIGNvbnRlbnRIVE1MIGZpZWxkcywgYm90aCBzdHJpbmdzIG9mIEhUTUwuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZG9jdW1lbnRhdGlvblRvSFRNTCggZG9jLCBiYXNlTmFtZSwgdHlwZU5hbWVzLCBsb2NhbFR5cGVJZHMsIGV4dGVybmFsVHlwZVVSTHMgKSB7XHJcbiAgICBsZXQgaW5kZXhIVE1MID0gJyc7XHJcbiAgICBsZXQgY29udGVudEhUTUwgPSAnJztcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHR5cGVVUkxzIGZvciB0aGUgb3V0cHV0XHJcbiAgICB0eXBlVVJMcyA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMoIGV4dGVybmFsVHlwZVVSTHMgKS5mb3JFYWNoKCB0eXBlSWQgPT4ge1xyXG4gICAgICB0eXBlVVJMc1sgdHlwZUlkIF0gPSBleHRlcm5hbFR5cGVVUkxzWyB0eXBlSWQgXTtcclxuICAgIH0gKTtcclxuICAgIE9iamVjdC5rZXlzKCBsb2NhbFR5cGVJZHMgKS5mb3JFYWNoKCB0eXBlSWQgPT4ge1xyXG4gICAgICB0eXBlVVJMc1sgdHlwZUlkIF0gPSBgIyR7bG9jYWxUeXBlSWRzWyB0eXBlSWQgXX1gO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJhc2VVUkwgPSB0eXBlVVJMc1sgYmFzZU5hbWUgXTtcclxuXHJcbiAgICBpbmRleEhUTUwgKz0gYDxhIGNsYXNzPVwibmF2bGlua1wiIGhyZWY9XCIke2Jhc2VVUkx9XCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtdGFyZ2V0PVwiI2NvbGxhcHNlLSR7YmFzZU5hbWV9XCIgb25jbGljaz1cIiQoICcuY29sbGFwc2UuaW4nICkuY29sbGFwc2UoICd0b2dnbGUnICk7IHJldHVybiB0cnVlO1wiPiR7YmFzZU5hbWV9PC9hPjxicj5cXG5gO1xyXG4gICAgaW5kZXhIVE1MICs9IGA8ZGl2IGlkPVwiY29sbGFwc2UtJHtiYXNlTmFtZX1cIiBjbGFzcz1cImNvbGxhcHNlXCI+XFxuYDtcclxuXHJcbiAgICBjb250ZW50SFRNTCArPSBgPGgzIGlkPVwiJHtiYXNlVVJMLnNsaWNlKCAxICl9XCIgY2xhc3M9XCJzZWN0aW9uXCI+JHtiYXNlTmFtZX08L2gzPlxcbmA7XHJcbiAgICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIGRvYy50b3BMZXZlbENvbW1lbnQuZGVzY3JpcHRpb24gKTtcclxuXHJcbiAgICB0eXBlTmFtZXMuZm9yRWFjaCggdHlwZU5hbWUgPT4ge1xyXG4gICAgICBjb25zdCBiYXNlT2JqZWN0ID0gZG9jWyB0eXBlTmFtZSBdO1xyXG4gICAgICBjb25zdCBiYXNlVVJMUHJlZml4ID0gYCR7bG9jYWxUeXBlSWRzWyB0eXBlTmFtZSBdfS1gO1xyXG5cclxuICAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgaWYgKCBiYXNlT2JqZWN0LnR5cGUgPT09ICd0eXBlJyApIHtcclxuICAgICAgICAvLyBBZGQgYSB0YXJnZXQgZm9yICMtbGlua3MgaWYgd2UgYXJlbid0IHRoZSBiYXNlTmFtZS5cclxuICAgICAgICBpZiAoIHR5cGVOYW1lICE9PSBiYXNlTmFtZSApIHtcclxuICAgICAgICAgIGNvbnRlbnRIVE1MICs9IGA8ZGl2IGlkPVwiJHtiYXNlVVJMUHJlZml4LnNsaWNlKCAwLCBiYXNlVVJMUHJlZml4Lmxlbmd0aCAtIDEgKX1cIj48L2Rpdj5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29uc3RydWN0b3JMaW5lID0gdHlwZU5hbWUgKyBpbmxpbmVQYXJhbWV0ZXJMaXN0KCBiYXNlT2JqZWN0LmNvbW1lbnQgKTtcclxuICAgICAgICBpZiAoIGJhc2VPYmplY3Quc3VwZXJ0eXBlICkge1xyXG4gICAgICAgICAgY29uc3RydWN0b3JMaW5lICs9IGAgPHNwYW4gY2xhc3M9XCJpbmhlcml0XCI+ZXh0ZW5kcyAke3R5cGVTdHJpbmcoIGJhc2VPYmplY3Quc3VwZXJ0eXBlICl9PC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnRIVE1MICs9IGA8aDQgaWQ9XCIke2Jhc2VVUkxQcmVmaXh9Y29uc3RydWN0b3JcIiBjbGFzcz1cInNlY3Rpb25cIj4ke2NvbnN0cnVjdG9yTGluZX08L2g0PmA7XHJcbiAgICAgICAgY29udGVudEhUTUwgKz0gZGVzY3JpcHRpb25IVE1MKCBiYXNlT2JqZWN0LmNvbW1lbnQuZGVzY3JpcHRpb24gKTtcclxuICAgICAgICBjb250ZW50SFRNTCArPSBwYXJhbWV0ZXJEZXRhaWxzTGlzdCggYmFzZU9iamVjdC5jb21tZW50ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHN0YXRpY1Byb3BlcnRpZXMgPSBiYXNlT2JqZWN0LnN0YXRpY1Byb3BlcnRpZXMgfHwgYmFzZU9iamVjdC5wcm9wZXJ0aWVzIHx8IFtdO1xyXG4gICAgICBjb25zdCBzdGF0aWNOYW1lcyA9IHN0YXRpY1Byb3BlcnRpZXMubWFwKCBwcm9wID0+IHByb3AubmFtZSApLnNvcnQoKTtcclxuICAgICAgc3RhdGljTmFtZXMuZm9yRWFjaCggbmFtZSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmFtZUxvb2t1cCggc3RhdGljUHJvcGVydGllcywgbmFtZSApO1xyXG5cclxuICAgICAgICBpbmRleEhUTUwgKz0gYDxhIGNsYXNzPVwic3VibGlua1wiIGhyZWY9XCIjJHtiYXNlVVJMUHJlZml4fSR7b2JqZWN0Lm5hbWV9XCI+JHtvYmplY3QubmFtZX08L2E+PGJyPmA7XHJcblxyXG4gICAgICAgIGxldCB0eXBlTGluZSA9IGA8c3BhbiBjbGFzcz1cImVudHJ5TmFtZVwiPiR7dHlwZU5hbWV9LiR7b2JqZWN0Lm5hbWV9PC9zcGFuPmA7XHJcbiAgICAgICAgdHlwZUxpbmUgKz0gaW5saW5lUGFyYW1ldGVyTGlzdCggb2JqZWN0ICk7XHJcbiAgICAgICAgdHlwZUxpbmUgKz0gcmV0dXJuT3JDb25zdGFudCggb2JqZWN0ICk7XHJcbiAgICAgICAgY29udGVudEhUTUwgKz0gYDxoNSBpZD1cIiR7YmFzZVVSTFByZWZpeH0ke29iamVjdC5uYW1lfVwiIGNsYXNzPVwic2VjdGlvblwiPiR7dHlwZUxpbmV9PC9oNT5gO1xyXG4gICAgICAgIGlmICggb2JqZWN0LmRlc2NyaXB0aW9uICkge1xyXG4gICAgICAgICAgY29udGVudEhUTUwgKz0gZGVzY3JpcHRpb25IVE1MKCBvYmplY3QuZGVzY3JpcHRpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudEhUTUwgKz0gcGFyYW1ldGVyRGV0YWlsc0xpc3QoIG9iamVjdCApO1xyXG5cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgaWYgKCBiYXNlT2JqZWN0LnR5cGUgPT09ICd0eXBlJyApIHtcclxuICAgICAgICBjb25zdCBjb25zdHJ1Y3Rvck5hbWVzID0gYmFzZU9iamVjdC5jb25zdHJ1Y3RvclByb3BlcnRpZXMubWFwKCBwcm9wID0+IHByb3AubmFtZSApLnNvcnQoKTtcclxuICAgICAgICBjb25zdHJ1Y3Rvck5hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmFtZUxvb2t1cCggYmFzZU9iamVjdC5jb25zdHJ1Y3RvclByb3BlcnRpZXMsIG5hbWUgKTtcclxuXHJcbiAgICAgICAgICBpbmRleEhUTUwgKz0gYDxhIGNsYXNzPVwic3VibGlua1wiIGhyZWY9XCIjJHtiYXNlVVJMUHJlZml4fSR7b2JqZWN0Lm5hbWV9XCI+JHtvYmplY3QubmFtZX08L2E+PGJyPmA7XHJcblxyXG4gICAgICAgICAgbGV0IHR5cGVMaW5lID0gYDxzcGFuIGNsYXNzPVwiZW50cnlOYW1lXCI+JHtvYmplY3QubmFtZX08L3NwYW4+YDtcclxuICAgICAgICAgIHR5cGVMaW5lICs9IGAgPHNwYW4gY2xhc3M9XCJwcm9wZXJ0eVwiPiR7dHlwZVN0cmluZyggb2JqZWN0LnR5cGUgKX08L3NwYW4+YDtcclxuICAgICAgICAgIGNvbnRlbnRIVE1MICs9IGA8aDUgaWQ9XCIke2Jhc2VVUkxQcmVmaXh9JHtvYmplY3QubmFtZX1cIiBjbGFzcz1cInNlY3Rpb25cIj4ke3R5cGVMaW5lfTwvaDU+YDtcclxuICAgICAgICAgIGlmICggb2JqZWN0LmRlc2NyaXB0aW9uICkge1xyXG4gICAgICAgICAgICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIG9iamVjdC5kZXNjcmlwdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGJhc2VPYmplY3QudHlwZSA9PT0gJ3R5cGUnICkge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlTmFtZXMgPSBiYXNlT2JqZWN0Lmluc3RhbmNlUHJvcGVydGllcy5tYXAoIHByb3AgPT4gcHJvcC5uYW1lICkuc29ydCgpO1xyXG4gICAgICAgIGluc3RhbmNlTmFtZXMuZm9yRWFjaCggbmFtZSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvYmplY3QgPSBuYW1lTG9va3VwKCBiYXNlT2JqZWN0Lmluc3RhbmNlUHJvcGVydGllcywgbmFtZSApO1xyXG5cclxuICAgICAgICAgIGluZGV4SFRNTCArPSBgPGEgY2xhc3M9XCJzdWJsaW5rXCIgaHJlZj1cIiMke2Jhc2VVUkxQcmVmaXh9JHtvYmplY3QubmFtZX1cIj4ke29iamVjdC5uYW1lfTwvYT48YnI+YDtcclxuXHJcbiAgICAgICAgICBsZXQgdHlwZUxpbmUgPSBgPHNwYW4gY2xhc3M9XCJlbnRyeU5hbWVcIj4ke29iamVjdC5uYW1lfTwvc3Bhbj5gO1xyXG4gICAgICAgICAgaWYgKCBvYmplY3QuZXhwbGljaXRHZXROYW1lICkge1xyXG4gICAgICAgICAgICB0eXBlTGluZSArPSBgIDxzcGFuIGNsYXNzPVwicHJvcGVydHlcIj4ke3R5cGVTdHJpbmcoIG9iamVjdC5yZXR1cm5zLnR5cGUgKX08L3NwYW4+YDtcclxuICAgICAgICAgICAgdHlwZUxpbmUgKz0gYCA8c3BhbiBjbGFzcz1cImVudHJ5TmFtZSBleHBsaWNpdFNldHRlckdldHRlclwiPiR7b2JqZWN0LmV4cGxpY2l0R2V0TmFtZX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBvYmplY3QuZXhwbGljaXRTZXROYW1lICkge1xyXG4gICAgICAgICAgICB0eXBlTGluZSArPSBgIDxzcGFuIGNsYXNzPVwicHJvcGVydHlcIj4ke3R5cGVTdHJpbmcoIG9iamVjdC5yZXR1cm5zLnR5cGUgKX08L3NwYW4+YDtcclxuICAgICAgICAgICAgdHlwZUxpbmUgKz0gYCA8c3BhbiBjbGFzcz1cImVudHJ5TmFtZSBleHBsaWNpdFNldHRlckdldHRlclwiPiR7b2JqZWN0LmV4cGxpY2l0U2V0TmFtZX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdHlwZUxpbmUgKz0gaW5saW5lUGFyYW1ldGVyTGlzdCggb2JqZWN0ICk7XHJcbiAgICAgICAgICB0eXBlTGluZSArPSByZXR1cm5PckNvbnN0YW50KCBvYmplY3QgKTtcclxuICAgICAgICAgIGlmICggb2JqZWN0LmV4cGxpY2l0U2V0TmFtZSB8fCBvYmplY3QuZXhwbGljaXRHZXROYW1lICkge1xyXG4gICAgICAgICAgICB0eXBlTGluZSArPSAnPC9zcGFuPic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250ZW50SFRNTCArPSBgPGg1IGlkPVwiJHtiYXNlVVJMUHJlZml4fSR7b2JqZWN0Lm5hbWV9XCIgY2xhc3M9XCJzZWN0aW9uXCI+JHt0eXBlTGluZX08L2g1PmA7XHJcbiAgICAgICAgICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIG9iamVjdC5kZXNjcmlwdGlvbiApO1xyXG4gICAgICAgICAgY29udGVudEhUTUwgKz0gcGFyYW1ldGVyRGV0YWlsc0xpc3QoIG9iamVjdCApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGluZGV4SFRNTCArPSAnPC9kaXY+JztcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbmRleEhUTUw6IGluZGV4SFRNTCxcclxuICAgICAgY29udGVudEhUTUw6IGNvbnRlbnRIVE1MXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTm9kZS5qcy1jb21wYXRpYmxlIGRlZmluaXRpb25cclxuICBpZiAoIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudGF0aW9uVG9IVE1MO1xyXG4gIH1cclxuXHJcbiAgLy8gQnJvd3NlciBkaXJlY3QgZGVmaW5pdGlvbiAoZm9yIHRlc3RpbmcpXHJcbiAgaWYgKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyApIHtcclxuICAgIHdpbmRvdy5kb2N1bWVudGF0aW9uVG9IVE1MID0gZG9jdW1lbnRhdGlvblRvSFRNTDtcclxuICB9XHJcbn0gKSgpO1xyXG4i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