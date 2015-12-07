var log = require('loglevel');

var err = {
  IllegalAttributeName: 'Illegal name value for attribute.',
  IllegalConceptLink: 'Illegal value for ConceptLink.',
  IllegalValueScheme: 'Illegal or missing value for type.',
  ReqName:  'Component or element is missing a name.',
  ReqComponentDesc: 'Component description is required.',
  ReqDisplayPriority: 'Display priority value is required for elements.',
  ReqValueScheme: 'Valid type value is required.'
};

var conceptLinkPattern = /^([^:\/?#]+):(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;

var requiredString = {
  test: function(v) {return v != null && v.length > 0},
  message: "Field cannot be empty"
}

var noSpaces = {
  test: function(v) {return v.indexOf(" ") < 0},
  message: "Field cannot contain spaces"
}

var regex = function(expr, msg) {
  return {
    test: function(v) {return v == null || v.length == 0 || expr.test(v)},
    message: msg
  };
}

var conceptLinkUri = regex(conceptLinkPattern, "Must be a valid URI")

var validators = {
  header: {
    'Name': [requiredString, noSpaces],
    'Description': [requiredString],
    'CMD_Component.@ConceptLink': [conceptLinkUri]
  },
  component: {
    '@name': [requiredString, noSpaces],
    '@ConceptLink': [conceptLinkUri]
  },
  element: {
    '@name': [requiredString, noSpaces],
    '@ConceptLink': [conceptLinkUri]
  },
  attribute: {
    'Name': [requiredString, noSpaces],
    'ConceptLink': [conceptLinkUri]
  }
};

var testConceptLink = function(fieldValue) {
  var regExp = conceptLinkPattern;
  if(typeof fieldValue === "string" && fieldValue.length > 0 && !regExp.test(fieldValue))
    return false;
  return true;
};

var testAttribute = function(attr, cb) {
  var errReturned = false;
  if(!testAttributeName(attr)) errReturned = !cb(err.IllegalAttributeName);
  if(!testValueScheme(attr)) errReturned = !cb(err.IllegalValueScheme);
  if(!testConceptLink(attr['ConceptLink'])) errReturned = !cb(err.IllegalConceptLink);

  if(!errReturned) log.debug('Tests Passed: Attribute (' + attr.attrId + ')');
  return !errReturned;
};

var testAttributeName = function(fieldValue) {
  var regExpName = /^[A-Za-z0-9_\-]+$/;
  if(fieldValue != undefined || fieldValue != null)
    if(!fieldValue.hasOwnProperty('Name')) return false;
    else if(fieldValue['Name'].length <= 0 || !regExpName.test(fieldValue['Name'])) return false;
  return true;
};

var testAttributeList = function(attrList, cb) {
  if(attrList != undefined)
    if(attrList.Attribute != undefined && $.isArray(attrList.Attribute))
      for(var i=0; i < attrList.Attribute.length; i++)
        return testAttribute(attrList.Attribute[i], cb)
    else return testAttribute(attrList, cb);
  return true;
};

var testValueScheme = function(item) {
  if(item.Type != null && item['Type'].length <= 0) return false;
  else if(item['@ValueScheme'] != null && item['@ValueScheme'].length <= 0) return false;
  else if(item.ValueScheme != null) {
    var fieldValue = item['ValueScheme'];
    if((fieldValue.enumeration != null && fieldValue.enumeration.item != null) || (fieldValue.pattern != null && fieldValue.pattern.length > 0))
      return true;
    else
      return false;
  }
  return true;
};

var testMandatoryFields = function(header, componentDesc, cb) {
  var regExpName = /^[A-Za-z0-9_\-]+$/;
  var errReturned = false;
  if(header != null) {
    if(header.Name != undefined && header.Name.length <= 0) errReturned = cb(err.ReqName);
    if(header.Description != undefined && header.Description.length <= 0) errReturned = cb(err.ReqComponentDesc);
  }
  if(componentDesc != null) {
    if(componentDesc.hasOwnProperty('@name') && (componentDesc['@name'].length <= 0 || !regExpName.test(componentDesc['name']))) errReturned = cb(err.ReqName);
    if(componentDesc.hasOwnProperty('@DisplayPriority') && componentDesc['@DisplayPriority'].length <= 0) errReturned = cb(err.ReqDisplayPriority);
    if(!testValueScheme(componentDesc)) errReturned = cb(err.ReqValueScheme);
  }
  return !errReturned;
};

var testCardinalitySettings = function(minValue, maxValue) {
  // TODO required?
  return true;
};

/**
* Validation - client-side validation checks before saving a CMDI Profile or Component item.
*/
var Validation = {

  validateField: function(parent, field, val, feedback) {
    var tests = validators[parent][field];
    if($.isArray(tests)) {
      for(i=0;i<tests.length;i++) {
        var test = tests[i];
        log.trace("Testing", test);
        if(!test.test(val)) {
          // a test failed
          log.debug("Failed validation test for field", field, "=", val, ":", test.message);
          if(feedback != null) {
            feedback(test.message);
          }
          return false;
        }
      }
    } else {
      log.warn("No validators for field", parent, field, "in", validators);
    }
    // no test failed
    return true;
  },

  checkUniqueSiblingName: function(items, field, name, feedback) {
    if(items != null) {
      var count = 0;
      for(var i=0;i<(items.length);i++) {
        if(items[i][field] === name) {
          count++;
        }
        if(count > 1) {
          feedback("Sibling names must be unique");
          return false;
        }
      }
    }
    return true;
  },

  validate: function(data) {
    log.debug('validate data');

    var errors = [];
    var addError = function(message) {
      errors.push({ message: message });
      return false;
    };

    var header = (data.Header != undefined) ? data.Header : null;
    var componentDesc = (data.Header != undefined) ? data.CMD_Component : data;

    if(testMandatoryFields(header, componentDesc, addError))
      log.debug('Test Passed: Mandatory fields');

    if(!testConceptLink(componentDesc['@ConceptLink']))
      addError(err.IllegalConceptLink);
    else
      log.debug('Test Passed: Concept Registry field');

    /*if(!testCardinalitySettings(componentDesc['@CardinalityMin'], componentDesc['@CardinalityMax']))
      addError(err.CardinalitySettings);
    else
      log.debug('Test Passed: Cardinality Settings (root)');
    */

    // attributes
    testAttributeList(componentDesc.AttributeList, addError);

    // elements
    var elems = componentDesc.CMD_Element;
    if(elems != undefined || elems != null) {
      for(var i=0; i < elems.length; i++) {
        if(elems[i].AttributeList != undefined) testAttributeList(elems[i].AttributeList, addError);
        testMandatoryFields(null, elems[i], addError);
      }
    }

    // components
    var comps = componentDesc.CMD_Component;
    if(comps != undefined && comps != null) {
      for(var i=0; i < comps.length; i++) {
        if(!comps[i].hasOwnProperty('@ComponentId')) {
          testMandatoryFields(null, comps[i], addError); //inline-component
          if(!testConceptLink(comps[i]['ConceptLink'])) addError(err.IllegalConceptLink);
          if(comps[i].AttributeList != undefined) testAttributeList(comps[i].AttributeList, addError)
        }
      }
    }

    return (errors.length > 0) ?
      { errors: errors } :
      data;
  }
};

module.exports = Validation;
