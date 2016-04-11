'use strict';
var assert = require('chai').assert;
var Jsonix = require('jsonix').Jsonix;
var CMD = require('../../../src/mappings/Component').Component;

var chai    = require('chai');
var expect  = require('chai').expect;
var chaiXml = require('chai-xml');
chai.use(chaiXml);

var data1 = {
    "@isProfile": "true",
    "@CMDVersion": "1.2",
    "@CMDOriginalVersion": "1.1",
    "Header": {
        "ID": "clarin.eu:cr1:p_1361876010587",
        "Name": "AnnotatedCorpusProfile-DLU",
        "Description": "A CMDI profile for annotated text corpus resources.",
        "Status": "production"
    },
    "Component": {
        "@name": "AnnotatedCorpusProfile-DLU",
        "@CardinalityMin": "1",
        "@CardinalityMax": "1",
        "Component": [
            {
                "@ComponentId": "clarin.eu:cr1:c_1361876010584",
                "@CardinalityMin": "1",
                "@CardinalityMax": "1"
            }
        ]
    }
};
var expectedOut1 =`
  <ComponentSpec
    isProfile="true"
    CMDVersion="1.2"
    CMDOriginalVersion="1.1"
    >
    <Header>
      <ID>clarin.eu:cr1:p_1361876010587</ID>
      <Name>AnnotatedCorpusProfile-DLU</Name>
      <Description>A CMDI profile for annotated text corpus resources.</Description>
      <Status>production</Status>
    </Header>
    <Component name="AnnotatedCorpusProfile-DLU" CardinalityMin="1" CardinalityMax="1">
        <Component ComponentId="clarin.eu:cr1:c_1361876010584" CardinalityMin="1" CardinalityMax="1" />
    </Component>
  </ComponentSpec>
`;

describe('Component', function () {
  var context = new Jsonix.Context([CMD]);
  var marshaller = context.createMarshaller();

  describe('marshall1', function() {
    var xmlOut = marshaller.marshalString({ name: new Jsonix.XML.QName('ComponentSpec'), value: data1 });
    it('should marshall', function() {
      //assert.equal(expectedOut, xmlOut);
      expect(expectedOut1).xml.to.deep.equal(xmlOut);
    });
  });
});
