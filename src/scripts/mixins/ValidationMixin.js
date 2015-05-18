var err = {
  IllegalAttributeName: 'Illegal name value for attribute.',
  IllegalConceptLink: 'Illegal value for ConceptLink.',
  IllegalValueScheme: 'Illegal or missing value for type.',
  ReqName:  'Component or element is missing a name.',
  ReqComponentDesc: 'Component description is required.',
  ReqDisplayPriority: 'Display priority value is required for elements.'
};

var testConceptLink = function(fieldValue) {
  var regExp = /^([^:\/?#]+):(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
  if(typeof fieldValue === "string" && fieldValue.length > 0 && !regExp.test(fieldValue))
    return false;
  return true;
};

var testAttribute = function(attr, cb) {
  var errReturned = false;
  if(!testAttributeName(attr)) errReturned = !cb(err.IllegalAttributeName);
  if(!testValueScheme(attr)) errReturned = !cb(err.IllegalValueScheme);
  if(!testConceptLink(attr['ConceptLink'])) errReturned = !cb(err.IllegalConceptLink);

  if(!errReturned) console.log('Tests Passed: Attribute (' + attr.attrId + ')');
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
  if(item.Type != undefined && item['Type'].length <= 0) return false;
  else if(item.hasOwnProperty('@ValueScheme') && item['@ValueScheme'].length <= 0) return false;
  else if(item.ValueScheme != undefined) {
    var fieldValue = item['ValueScheme'];
    if((fieldValue.enumeration != undefined && fieldValue.enumeration.item != undefined) || fieldValue.pattern != undefined)
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

var ValidationMixin = {
  validate: function(data) {
    // client-side validation tests
    console.log('validate data');

    var errors = [];
    var addError = function(message) {
      errors.push({error: message});
      return false;
    };

    var header = (data.Header != undefined) ? data.Header : null;
    var componentDesc = (data.Header != undefined) ? data.CMD_Component : data;

    if(testMandatoryFields(header, componentDesc, addError))
      console.log('Test Passed: Mandatory fields');

    if(!testConceptLink(componentDesc['@ConceptLink']))
      addError(err.IllegalConceptLink);
    else
      console.log('Test Passed: Concept Registry field');

    /*if(!testCardinalitySettings(componentDesc['@CardinalityMin'], componentDesc['@CardinalityMax']))
      addError(err.CardinalitySettings);
    else
      console.log('Test Passed: Cardinality Settings (root)');
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
        //if(!testCardinalitySettings(comps[i]['@CardinalityMin'], comps[i]['@CardinalityMax'])) addError(err.CardinalitySettings);
      }
    }

    return (errors.length > 0) ?
      { errors: errors } :
      data;
  }
};

module.exports = ValidationMixin;
