// Copyright 2022-2023, University of Colorado Boulder

/**
 * Sets up a system of Properties to handle translation fallback and phet-io support for a single translated string.
 *
 * @author Jonathan Olson <jonathan.olson>
 */

import DynamicProperty from '../../axon/js/DynamicProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import TinyOverrideProperty from '../../axon/js/TinyOverrideProperty.js';
import localeProperty from '../../joist/js/i18n/localeProperty.js';
import localeOrderProperty from '../../joist/js/i18n/localeOrderProperty.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import chipper from './chipper.js';
import { localizedStrings } from './getStringModule.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import TandemConstants from '../../tandem/js/TandemConstants.js';

// constants
const FALLBACK_LOCALE = 'en';

// for readability/docs

// Where "string" is a phetioID

class LocalizedString {
  // Public-facing IProperty<string>, used by string modules

  // Holds our non-Override Property at the root of everything

  // Uses lazy creation of locales
  localePropertyMap = new Map();
  // Store initial values, so we can handle state deltas
  initialValues = {};
  constructor(englishValue, tandem, metadata) {
    // Allow phetioReadOnly to be overridden
    const phetioReadOnly = metadata && typeof metadata.phetioReadOnly === 'boolean' ? metadata.phetioReadOnly : TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioReadOnly;

    // All i18n model strings are phetioFeatured by default
    const phetioFeatured = metadata && typeof metadata.phetioFeatured === 'boolean' ? metadata.phetioFeatured : true;

    // Allow phetioDocumentation to be overridden
    const phetioDocumentation = metadata && typeof metadata.phetioDocumentation === 'string' ? metadata.phetioDocumentation : TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDocumentation;
    this.englishProperty = new TinyProperty(englishValue);
    this.initialValues[FALLBACK_LOCALE] = englishValue;
    this.localeOrderListener = this.onLocaleOrderChange.bind(this);
    localeOrderProperty.lazyLink(this.localeOrderListener);
    this.property = new DynamicProperty(localeProperty, {
      derive: locale => this.getLocaleSpecificProperty(locale),
      bidirectional: true,
      phetioValueType: StringIO,
      phetioState: false,
      tandem: tandem,
      phetioFeatured: phetioFeatured,
      phetioReadOnly: phetioReadOnly,
      phetioDocumentation: phetioDocumentation
    });

    // Add to a global list to support PhET-iO serialization and internal testing
    localizedStrings.push(this);
  }

  /**
   * Sets the initial value of a translated string (so that there will be no fallback for that locale/string combo)
   */
  setInitialValue(locale, value) {
    this.initialValues[locale] = value;
    this.getLocaleSpecificProperty(locale).value = value;
  }

  /**
   * Returns an object that shows the changes of strings from their initial values. This includes whether strings are
   * marked as "overridden"
   */
  getStateDelta() {
    const result = {};
    this.usedLocales.forEach(locale => {
      const rawString = this.getRawStringValue(locale);
      if (rawString !== null && rawString !== this.initialValues[locale]) {
        result[locale] = rawString;
      }
    });
    return result;
  }

  /**
   * Take a state from getStateDelta, and apply it.
   */
  setStateDelta(state) {
    // Create potential new locales (since locale-specific Properties are lazily created as needed
    Object.keys(state).forEach(locale => this.getLocaleSpecificProperty(locale));
    this.usedLocales.forEach(locale => {
      const localeSpecificProperty = this.getLocaleSpecificProperty(locale);
      const initialValue = this.initialValues[locale] !== undefined ? this.initialValues[locale] : null;
      const stateValue = state[locale] !== undefined ? state[locale] : null;

      // If not specified in the state
      if (stateValue === null) {
        // If we have no initial value, we'll want to set it to fall back
        if (initialValue === null) {
          localeSpecificProperty.clearOverride();
        } else {
          localeSpecificProperty.value = initialValue;
        }
      } else {
        localeSpecificProperty.value = stateValue;
      }
    });
  }

  /**
   * Returns the specific translation for a locale (no fallbacks), or null if that string is not translated in the
   * exact locale
   */
  getRawStringValue(locale) {
    const property = this.getLocaleSpecificProperty(locale);
    if (property instanceof TinyOverrideProperty) {
      return property.isOverridden ? property.value : null;
    } else {
      // english
      return property.value;
    }
  }
  get usedLocales() {
    // NOTE: order matters, we want the fallback to be first so that in onLocaleOrderChange we don't run into infinite
    // loops.
    return [FALLBACK_LOCALE, ...this.localePropertyMap.keys()];
  }
  onLocaleOrderChange(localeOrder) {
    // Do this in reverse order to AVOID infinite loops.
    // For example, if localeOrder1=ar,es localeOrder2=es,ar) then we could run into the case temporarily where the
    // TinyOverrideProperty for ar has its target as es, and the TinyOverrideProperty for es has its target as ar.
    // This would then trigger an infinite loop if you try to read the value of either of them, as it would ping
    // back-and-forth.
    const locales = [...this.usedLocales,
    // Yes, this duplicates some, but it should be a no-op and saves code length
    ...localeOrder];
    for (let i = locales.length - 1; i >= 0; i--) {
      const locale = locales[i];
      const localeProperty = this.getLocaleSpecificProperty(locale);
      if (localeProperty instanceof TinyOverrideProperty) {
        localeProperty.targetProperty = this.getLocaleSpecificProperty(LocalizedString.getFallbackLocale(locale));
      }
    }
  }

  /**
   * Returns the locale-specific Property for any locale (lazily creating it if necessary)
   */
  getLocaleSpecificProperty(locale) {
    if (locale === 'en') {
      return this.englishProperty;
    }

    // Lazy creation
    if (!this.localePropertyMap.has(locale)) {
      this.localePropertyMap.set(locale, new TinyOverrideProperty(this.getLocaleSpecificProperty(LocalizedString.getFallbackLocale(locale))));
    }
    return this.localePropertyMap.get(locale);
  }

  /**
   * What should be the next-most fallback locale for a given locale. Our global localeOrder is used, and otherwise it
   * defaults to our normal fallback mechanism.
   */
  static getFallbackLocale(locale) {
    if (locale === 'en') {
      return 'en'; // can be its own fallback
    }

    const localeOrder = localeOrderProperty.value;
    const index = localeOrder.indexOf(locale);
    if (index >= 0) {
      assert && assert(localeOrder[localeOrder.length - 1] === 'en');
      assert && assert(index + 1 < localeOrder.length);
      return localeOrder[index + 1];
    } else {
      // doesn't exist in those
      if (locale.includes('_')) {
        return locale.slice(0, 2); // zh_CN => zh
      } else {
        return 'en';
      }
    }
  }
  dispose() {
    localeOrderProperty.unlink(this.localeOrderListener);
    this.property.dispose();
    arrayRemove(localizedStrings, this);
  }

  /**
   * Reset to the initial value for the specified locale, used for testing.
   */
  restoreInitialValue(locale) {
    assert && assert(typeof this.initialValues[locale] === 'string', 'initial value expected for', locale);
    this.property.value = this.initialValues[locale];
  }
}
chipper.register('LocalizedString', LocalizedString);
export default LocalizedString;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJUaW55T3ZlcnJpZGVQcm9wZXJ0eSIsImxvY2FsZVByb3BlcnR5IiwibG9jYWxlT3JkZXJQcm9wZXJ0eSIsIlN0cmluZ0lPIiwiY2hpcHBlciIsImxvY2FsaXplZFN0cmluZ3MiLCJhcnJheVJlbW92ZSIsIlRhbmRlbUNvbnN0YW50cyIsIkZBTExCQUNLX0xPQ0FMRSIsIkxvY2FsaXplZFN0cmluZyIsImxvY2FsZVByb3BlcnR5TWFwIiwiTWFwIiwiaW5pdGlhbFZhbHVlcyIsImNvbnN0cnVjdG9yIiwiZW5nbGlzaFZhbHVlIiwidGFuZGVtIiwibWV0YWRhdGEiLCJwaGV0aW9SZWFkT25seSIsIlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZW5nbGlzaFByb3BlcnR5IiwibG9jYWxlT3JkZXJMaXN0ZW5lciIsIm9uTG9jYWxlT3JkZXJDaGFuZ2UiLCJiaW5kIiwibGF6eUxpbmsiLCJwcm9wZXJ0eSIsImRlcml2ZSIsImxvY2FsZSIsImdldExvY2FsZVNwZWNpZmljUHJvcGVydHkiLCJiaWRpcmVjdGlvbmFsIiwicGhldGlvVmFsdWVUeXBlIiwicGhldGlvU3RhdGUiLCJwdXNoIiwic2V0SW5pdGlhbFZhbHVlIiwidmFsdWUiLCJnZXRTdGF0ZURlbHRhIiwicmVzdWx0IiwidXNlZExvY2FsZXMiLCJmb3JFYWNoIiwicmF3U3RyaW5nIiwiZ2V0UmF3U3RyaW5nVmFsdWUiLCJzZXRTdGF0ZURlbHRhIiwic3RhdGUiLCJPYmplY3QiLCJrZXlzIiwibG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSIsImluaXRpYWxWYWx1ZSIsInVuZGVmaW5lZCIsInN0YXRlVmFsdWUiLCJjbGVhck92ZXJyaWRlIiwiaXNPdmVycmlkZGVuIiwibG9jYWxlT3JkZXIiLCJsb2NhbGVzIiwiaSIsImxlbmd0aCIsInRhcmdldFByb3BlcnR5IiwiZ2V0RmFsbGJhY2tMb2NhbGUiLCJoYXMiLCJzZXQiLCJnZXQiLCJpbmRleCIsImluZGV4T2YiLCJhc3NlcnQiLCJpbmNsdWRlcyIsInNsaWNlIiwiZGlzcG9zZSIsInVubGluayIsInJlc3RvcmVJbml0aWFsVmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxvY2FsaXplZFN0cmluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGEgc3lzdGVtIG9mIFByb3BlcnRpZXMgdG8gaGFuZGxlIHRyYW5zbGF0aW9uIGZhbGxiYWNrIGFuZCBwaGV0LWlvIHN1cHBvcnQgZm9yIGEgc2luZ2xlIHRyYW5zbGF0ZWQgc3RyaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbj5cclxuICovXHJcblxyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUaW55T3ZlcnJpZGVQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlPdmVycmlkZVByb3BlcnR5LmpzJztcclxuaW1wb3J0IGxvY2FsZVByb3BlcnR5LCB7IExvY2FsZSB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbG9jYWxlT3JkZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9qb2lzdC9qcy9pMThuL2xvY2FsZU9yZGVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IGNoaXBwZXIgZnJvbSAnLi9jaGlwcGVyLmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IGxvY2FsaXplZFN0cmluZ3MgfSBmcm9tICcuL2dldFN0cmluZ01vZHVsZS5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgVGFuZGVtQ29uc3RhbnRzLCB7IFBoZXRpb0lEIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbUNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRkFMTEJBQ0tfTE9DQUxFID0gJ2VuJztcclxuXHJcbi8vIGZvciByZWFkYWJpbGl0eS9kb2NzXHJcbnR5cGUgVHJhbnNsYXRpb25TdHJpbmcgPSBzdHJpbmc7XHJcbmV4cG9ydCB0eXBlIExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGEgPSBQYXJ0aWFsPFJlY29yZDxMb2NhbGUsIFRyYW5zbGF0aW9uU3RyaW5nPj47XHJcblxyXG4vLyBXaGVyZSBcInN0cmluZ1wiIGlzIGEgcGhldGlvSURcclxuZXhwb3J0IHR5cGUgU3RyaW5nc1N0YXRlU3RhdGVPYmplY3QgPSB7IGRhdGE6IFJlY29yZDxQaGV0aW9JRCwgTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YT4gfTtcclxuXHJcbmNsYXNzIExvY2FsaXplZFN0cmluZyB7XHJcblxyXG4gIC8vIFB1YmxpYy1mYWNpbmcgSVByb3BlcnR5PHN0cmluZz4sIHVzZWQgYnkgc3RyaW5nIG1vZHVsZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydHk6IER5bmFtaWNQcm9wZXJ0eTxzdHJpbmcsIHN0cmluZywgTG9jYWxlPjtcclxuXHJcbiAgLy8gSG9sZHMgb3VyIG5vbi1PdmVycmlkZSBQcm9wZXJ0eSBhdCB0aGUgcm9vdCBvZiBldmVyeXRoaW5nXHJcbiAgcHJpdmF0ZSByZWFkb25seSBlbmdsaXNoUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxUcmFuc2xhdGlvblN0cmluZz47XHJcblxyXG4gIC8vIFVzZXMgbGF6eSBjcmVhdGlvbiBvZiBsb2NhbGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBsb2NhbGVQcm9wZXJ0eU1hcCA9IG5ldyBNYXA8TG9jYWxlLCBUaW55T3ZlcnJpZGVQcm9wZXJ0eTxUcmFuc2xhdGlvblN0cmluZz4+KCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbG9jYWxlT3JkZXJMaXN0ZW5lcjogKCBsb2NhbGVzOiBMb2NhbGVbXSApID0+IHZvaWQ7XHJcblxyXG4gIC8vIFN0b3JlIGluaXRpYWwgdmFsdWVzLCBzbyB3ZSBjYW4gaGFuZGxlIHN0YXRlIGRlbHRhc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5pdGlhbFZhbHVlczogTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YSA9IHt9O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVuZ2xpc2hWYWx1ZTogVHJhbnNsYXRpb25TdHJpbmcsIHRhbmRlbTogVGFuZGVtLCBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICkge1xyXG5cclxuICAgIC8vIEFsbG93IHBoZXRpb1JlYWRPbmx5IHRvIGJlIG92ZXJyaWRkZW5cclxuICAgIGNvbnN0IHBoZXRpb1JlYWRPbmx5ID0gKCBtZXRhZGF0YSAmJiB0eXBlb2YgbWV0YWRhdGEucGhldGlvUmVhZE9ubHkgPT09ICdib29sZWFuJyApID8gbWV0YWRhdGEucGhldGlvUmVhZE9ubHkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvUmVhZE9ubHk7XHJcblxyXG4gICAgLy8gQWxsIGkxOG4gbW9kZWwgc3RyaW5ncyBhcmUgcGhldGlvRmVhdHVyZWQgYnkgZGVmYXVsdFxyXG4gICAgY29uc3QgcGhldGlvRmVhdHVyZWQgPSAoIG1ldGFkYXRhICYmIHR5cGVvZiBtZXRhZGF0YS5waGV0aW9GZWF0dXJlZCA9PT0gJ2Jvb2xlYW4nICkgPyBtZXRhZGF0YS5waGV0aW9GZWF0dXJlZCA6IHRydWU7XHJcblxyXG4gICAgLy8gQWxsb3cgcGhldGlvRG9jdW1lbnRhdGlvbiB0byBiZSBvdmVycmlkZGVuXHJcbiAgICBjb25zdCBwaGV0aW9Eb2N1bWVudGF0aW9uID0gKCBtZXRhZGF0YSAmJiB0eXBlb2YgbWV0YWRhdGEucGhldGlvRG9jdW1lbnRhdGlvbiA9PT0gJ3N0cmluZycgKSA/IG1ldGFkYXRhLnBoZXRpb0RvY3VtZW50YXRpb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9Eb2N1bWVudGF0aW9uO1xyXG5cclxuICAgIHRoaXMuZW5nbGlzaFByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggZW5nbGlzaFZhbHVlICk7XHJcbiAgICB0aGlzLmluaXRpYWxWYWx1ZXNbIEZBTExCQUNLX0xPQ0FMRSBdID0gZW5nbGlzaFZhbHVlO1xyXG5cclxuICAgIHRoaXMubG9jYWxlT3JkZXJMaXN0ZW5lciA9IHRoaXMub25Mb2NhbGVPcmRlckNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICBsb2NhbGVPcmRlclByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmxvY2FsZU9yZGVyTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggbG9jYWxlUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAoIGxvY2FsZTogTG9jYWxlICkgPT4gdGhpcy5nZXRMb2NhbGVTcGVjaWZpY1Byb3BlcnR5KCBsb2NhbGUgKSxcclxuICAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJTyxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHBoZXRpb0ZlYXR1cmVkLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogcGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IHBoZXRpb0RvY3VtZW50YXRpb25cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdG8gYSBnbG9iYWwgbGlzdCB0byBzdXBwb3J0IFBoRVQtaU8gc2VyaWFsaXphdGlvbiBhbmQgaW50ZXJuYWwgdGVzdGluZ1xyXG4gICAgbG9jYWxpemVkU3RyaW5ncy5wdXNoKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbml0aWFsIHZhbHVlIG9mIGEgdHJhbnNsYXRlZCBzdHJpbmcgKHNvIHRoYXQgdGhlcmUgd2lsbCBiZSBubyBmYWxsYmFjayBmb3IgdGhhdCBsb2NhbGUvc3RyaW5nIGNvbWJvKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbml0aWFsVmFsdWUoIGxvY2FsZTogTG9jYWxlLCB2YWx1ZTogVHJhbnNsYXRpb25TdHJpbmcgKTogdm9pZCB7XHJcbiAgICB0aGlzLmluaXRpYWxWYWx1ZXNbIGxvY2FsZSBdID0gdmFsdWU7XHJcbiAgICB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIGxvY2FsZSApLnZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IHNob3dzIHRoZSBjaGFuZ2VzIG9mIHN0cmluZ3MgZnJvbSB0aGVpciBpbml0aWFsIHZhbHVlcy4gVGhpcyBpbmNsdWRlcyB3aGV0aGVyIHN0cmluZ3MgYXJlXHJcbiAgICogbWFya2VkIGFzIFwib3ZlcnJpZGRlblwiXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0YXRlRGVsdGEoKTogTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YSB7XHJcbiAgICBjb25zdCByZXN1bHQ6IExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGEgPSB7fTtcclxuXHJcbiAgICB0aGlzLnVzZWRMb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XHJcbiAgICAgIGNvbnN0IHJhd1N0cmluZyA9IHRoaXMuZ2V0UmF3U3RyaW5nVmFsdWUoIGxvY2FsZSApO1xyXG4gICAgICBpZiAoIHJhd1N0cmluZyAhPT0gbnVsbCAmJiByYXdTdHJpbmcgIT09IHRoaXMuaW5pdGlhbFZhbHVlc1sgbG9jYWxlIF0gKSB7XHJcbiAgICAgICAgcmVzdWx0WyBsb2NhbGUgXSA9IHJhd1N0cmluZztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIGEgc3RhdGUgZnJvbSBnZXRTdGF0ZURlbHRhLCBhbmQgYXBwbHkgaXQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFN0YXRlRGVsdGEoIHN0YXRlOiBMb2NhbGl6ZWRTdHJpbmdTdGF0ZURlbHRhICk6IHZvaWQge1xyXG5cclxuICAgIC8vIENyZWF0ZSBwb3RlbnRpYWwgbmV3IGxvY2FsZXMgKHNpbmNlIGxvY2FsZS1zcGVjaWZpYyBQcm9wZXJ0aWVzIGFyZSBsYXppbHkgY3JlYXRlZCBhcyBuZWVkZWRcclxuICAgIE9iamVjdC5rZXlzKCBzdGF0ZSApLmZvckVhY2goIGxvY2FsZSA9PiB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIGxvY2FsZSBhcyBMb2NhbGUgKSApO1xyXG5cclxuICAgIHRoaXMudXNlZExvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IHtcclxuICAgICAgY29uc3QgbG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSA9IHRoaXMuZ2V0TG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSggbG9jYWxlICk7XHJcbiAgICAgIGNvbnN0IGluaXRpYWxWYWx1ZTogc3RyaW5nIHwgbnVsbCA9IHRoaXMuaW5pdGlhbFZhbHVlc1sgbG9jYWxlIF0gIT09IHVuZGVmaW5lZCA/IHRoaXMuaW5pdGlhbFZhbHVlc1sgbG9jYWxlIF0hIDogbnVsbDtcclxuICAgICAgY29uc3Qgc3RhdGVWYWx1ZTogc3RyaW5nIHwgbnVsbCA9IHN0YXRlWyBsb2NhbGUgXSAhPT0gdW5kZWZpbmVkID8gc3RhdGVbIGxvY2FsZSBdISA6IG51bGw7XHJcblxyXG4gICAgICAvLyBJZiBub3Qgc3BlY2lmaWVkIGluIHRoZSBzdGF0ZVxyXG4gICAgICBpZiAoIHN0YXRlVmFsdWUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm8gaW5pdGlhbCB2YWx1ZSwgd2UnbGwgd2FudCB0byBzZXQgaXQgdG8gZmFsbCBiYWNrXHJcbiAgICAgICAgaWYgKCBpbml0aWFsVmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICAoIGxvY2FsZVNwZWNpZmljUHJvcGVydHkgYXMgVGlueU92ZXJyaWRlUHJvcGVydHk8c3RyaW5nPiApLmNsZWFyT3ZlcnJpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsb2NhbGVTcGVjaWZpY1Byb3BlcnR5LnZhbHVlID0gaW5pdGlhbFZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsb2NhbGVTcGVjaWZpY1Byb3BlcnR5LnZhbHVlID0gc3RhdGVWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3BlY2lmaWMgdHJhbnNsYXRpb24gZm9yIGEgbG9jYWxlIChubyBmYWxsYmFja3MpLCBvciBudWxsIGlmIHRoYXQgc3RyaW5nIGlzIG5vdCB0cmFuc2xhdGVkIGluIHRoZVxyXG4gICAqIGV4YWN0IGxvY2FsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0UmF3U3RyaW5nVmFsdWUoIGxvY2FsZTogTG9jYWxlICk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIGxvY2FsZSApO1xyXG4gICAgaWYgKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIFRpbnlPdmVycmlkZVByb3BlcnR5ICkge1xyXG4gICAgICByZXR1cm4gcHJvcGVydHkuaXNPdmVycmlkZGVuID8gcHJvcGVydHkudmFsdWUgOiBudWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGVuZ2xpc2hcclxuICAgICAgcmV0dXJuIHByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXQgdXNlZExvY2FsZXMoKTogTG9jYWxlW10ge1xyXG4gICAgLy8gTk9URTogb3JkZXIgbWF0dGVycywgd2Ugd2FudCB0aGUgZmFsbGJhY2sgdG8gYmUgZmlyc3Qgc28gdGhhdCBpbiBvbkxvY2FsZU9yZGVyQ2hhbmdlIHdlIGRvbid0IHJ1biBpbnRvIGluZmluaXRlXHJcbiAgICAvLyBsb29wcy5cclxuICAgIHJldHVybiBbIEZBTExCQUNLX0xPQ0FMRSwgLi4udGhpcy5sb2NhbGVQcm9wZXJ0eU1hcC5rZXlzKCkgXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Mb2NhbGVPcmRlckNoYW5nZSggbG9jYWxlT3JkZXI6IExvY2FsZVtdICk6IHZvaWQge1xyXG5cclxuICAgIC8vIERvIHRoaXMgaW4gcmV2ZXJzZSBvcmRlciB0byBBVk9JRCBpbmZpbml0ZSBsb29wcy5cclxuICAgIC8vIEZvciBleGFtcGxlLCBpZiBsb2NhbGVPcmRlcjE9YXIsZXMgbG9jYWxlT3JkZXIyPWVzLGFyKSB0aGVuIHdlIGNvdWxkIHJ1biBpbnRvIHRoZSBjYXNlIHRlbXBvcmFyaWx5IHdoZXJlIHRoZVxyXG4gICAgLy8gVGlueU92ZXJyaWRlUHJvcGVydHkgZm9yIGFyIGhhcyBpdHMgdGFyZ2V0IGFzIGVzLCBhbmQgdGhlIFRpbnlPdmVycmlkZVByb3BlcnR5IGZvciBlcyBoYXMgaXRzIHRhcmdldCBhcyBhci5cclxuICAgIC8vIFRoaXMgd291bGQgdGhlbiB0cmlnZ2VyIGFuIGluZmluaXRlIGxvb3AgaWYgeW91IHRyeSB0byByZWFkIHRoZSB2YWx1ZSBvZiBlaXRoZXIgb2YgdGhlbSwgYXMgaXQgd291bGQgcGluZ1xyXG4gICAgLy8gYmFjay1hbmQtZm9ydGguXHJcbiAgICBjb25zdCBsb2NhbGVzOiBMb2NhbGVbXSA9IFtcclxuICAgICAgLi4udGhpcy51c2VkTG9jYWxlcyxcclxuXHJcbiAgICAgIC8vIFllcywgdGhpcyBkdXBsaWNhdGVzIHNvbWUsIGJ1dCBpdCBzaG91bGQgYmUgYSBuby1vcCBhbmQgc2F2ZXMgY29kZSBsZW5ndGhcclxuICAgICAgLi4ubG9jYWxlT3JkZXJcclxuICAgIF07XHJcbiAgICBmb3IgKCBsZXQgaSA9IGxvY2FsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGxvY2FsZSA9IGxvY2FsZXNbIGkgXTtcclxuICAgICAgY29uc3QgbG9jYWxlUHJvcGVydHkgPSB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIGxvY2FsZSApO1xyXG4gICAgICBpZiAoIGxvY2FsZVByb3BlcnR5IGluc3RhbmNlb2YgVGlueU92ZXJyaWRlUHJvcGVydHkgKSB7XHJcbiAgICAgICAgbG9jYWxlUHJvcGVydHkudGFyZ2V0UHJvcGVydHkgPSB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIExvY2FsaXplZFN0cmluZy5nZXRGYWxsYmFja0xvY2FsZSggbG9jYWxlICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbG9jYWxlLXNwZWNpZmljIFByb3BlcnR5IGZvciBhbnkgbG9jYWxlIChsYXppbHkgY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbGVTcGVjaWZpY1Byb3BlcnR5KCBsb2NhbGU6IExvY2FsZSApOiBUUHJvcGVydHk8c3RyaW5nPiB7XHJcbiAgICBpZiAoIGxvY2FsZSA9PT0gJ2VuJyApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZW5nbGlzaFByb3BlcnR5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExhenkgY3JlYXRpb25cclxuICAgIGlmICggIXRoaXMubG9jYWxlUHJvcGVydHlNYXAuaGFzKCBsb2NhbGUgKSApIHtcclxuICAgICAgdGhpcy5sb2NhbGVQcm9wZXJ0eU1hcC5zZXQoIGxvY2FsZSwgbmV3IFRpbnlPdmVycmlkZVByb3BlcnR5KCB0aGlzLmdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIExvY2FsaXplZFN0cmluZy5nZXRGYWxsYmFja0xvY2FsZSggbG9jYWxlICkgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxlUHJvcGVydHlNYXAuZ2V0KCBsb2NhbGUgKSE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGF0IHNob3VsZCBiZSB0aGUgbmV4dC1tb3N0IGZhbGxiYWNrIGxvY2FsZSBmb3IgYSBnaXZlbiBsb2NhbGUuIE91ciBnbG9iYWwgbG9jYWxlT3JkZXIgaXMgdXNlZCwgYW5kIG90aGVyd2lzZSBpdFxyXG4gICAqIGRlZmF1bHRzIHRvIG91ciBub3JtYWwgZmFsbGJhY2sgbWVjaGFuaXNtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RmFsbGJhY2tMb2NhbGUoIGxvY2FsZTogTG9jYWxlICk6IExvY2FsZSB7XHJcbiAgICBpZiAoIGxvY2FsZSA9PT0gJ2VuJyApIHtcclxuICAgICAgcmV0dXJuICdlbic7IC8vIGNhbiBiZSBpdHMgb3duIGZhbGxiYWNrXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9jYWxlT3JkZXIgPSBsb2NhbGVPcmRlclByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IGluZGV4ID0gbG9jYWxlT3JkZXIuaW5kZXhPZiggbG9jYWxlICk7XHJcbiAgICBpZiAoIGluZGV4ID49IDAgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsZU9yZGVyWyBsb2NhbGVPcmRlci5sZW5ndGggLSAxIF0gPT09ICdlbicgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggKyAxIDwgbG9jYWxlT3JkZXIubGVuZ3RoICk7XHJcbiAgICAgIHJldHVybiBsb2NhbGVPcmRlclsgaW5kZXggKyAxIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gZG9lc24ndCBleGlzdCBpbiB0aG9zZVxyXG4gICAgICBpZiAoIGxvY2FsZS5pbmNsdWRlcyggJ18nICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGxvY2FsZS5zbGljZSggMCwgMiApIGFzIExvY2FsZTsgLy8gemhfQ04gPT4gemhcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJ2VuJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBsb2NhbGVPcmRlclByb3BlcnR5LnVubGluayggdGhpcy5sb2NhbGVPcmRlckxpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5wcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICBhcnJheVJlbW92ZSggbG9jYWxpemVkU3RyaW5ncywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdG8gdGhlIGluaXRpYWwgdmFsdWUgZm9yIHRoZSBzcGVjaWZpZWQgbG9jYWxlLCB1c2VkIGZvciB0ZXN0aW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXN0b3JlSW5pdGlhbFZhbHVlKCBsb2NhbGU6IExvY2FsZSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLmluaXRpYWxWYWx1ZXNbIGxvY2FsZSBdID09PSAnc3RyaW5nJywgJ2luaXRpYWwgdmFsdWUgZXhwZWN0ZWQgZm9yJywgbG9jYWxlICk7XHJcbiAgICB0aGlzLnByb3BlcnR5LnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVzWyBsb2NhbGUgXSE7XHJcbiAgfVxyXG59XHJcblxyXG5jaGlwcGVyLnJlZ2lzdGVyKCAnTG9jYWxpemVkU3RyaW5nJywgTG9jYWxpemVkU3RyaW5nICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2NhbGl6ZWRTdHJpbmc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBQzlELE9BQU9DLFlBQVksTUFBTSwrQkFBK0I7QUFDeEQsT0FBT0Msb0JBQW9CLE1BQU0sdUNBQXVDO0FBQ3hFLE9BQU9DLGNBQWMsTUFBa0IsdUNBQXVDO0FBQzlFLE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUU1RSxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBQ3hELE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBRWxDLFNBQVNDLGdCQUFnQixRQUFRLHNCQUFzQjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLGVBQWUsTUFBb0Isb0NBQW9DOztBQUU5RTtBQUNBLE1BQU1DLGVBQWUsR0FBRyxJQUFJOztBQUU1Qjs7QUFJQTs7QUFHQSxNQUFNQyxlQUFlLENBQUM7RUFFcEI7O0VBR0E7O0VBR0E7RUFDaUJDLGlCQUFpQixHQUFHLElBQUlDLEdBQUcsQ0FBa0QsQ0FBQztFQUkvRjtFQUNpQkMsYUFBYSxHQUE4QixDQUFDLENBQUM7RUFFdkRDLFdBQVdBLENBQUVDLFlBQStCLEVBQUVDLE1BQWMsRUFBRUMsUUFBa0MsRUFBRztJQUV4RztJQUNBLE1BQU1DLGNBQWMsR0FBS0QsUUFBUSxJQUFJLE9BQU9BLFFBQVEsQ0FBQ0MsY0FBYyxLQUFLLFNBQVMsR0FBS0QsUUFBUSxDQUFDQyxjQUFjLEdBQ3RGVixlQUFlLENBQUNXLGdDQUFnQyxDQUFDRCxjQUFjOztJQUV0RjtJQUNBLE1BQU1FLGNBQWMsR0FBS0gsUUFBUSxJQUFJLE9BQU9BLFFBQVEsQ0FBQ0csY0FBYyxLQUFLLFNBQVMsR0FBS0gsUUFBUSxDQUFD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