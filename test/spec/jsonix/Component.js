'use strict';
var assert = require('chai').assert;
var Jsonix = require('jsonix').Jsonix;
var CMD = require('../../../src/mappings/Component').Component;

var chai    = require('chai');
var expect  = require('chai').expect;
var chaiXml = require('chai-xml');
chai.use(chaiXml);

var data = {
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
    //     "Component": [
    //         {
    //             "@ComponentId": "clarin.eu:cr1:c_1361876010584",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@name": "Access",
    //             "@ComponentId": "clarin.eu:cr1:c_1357720977472",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@name": "Project",
    //             "@ComponentId": "clarin.eu:cr1:c_1357720977474",
    //             "@CardinalityMin": "0",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@name": "Publications",
    //             "@ComponentId": "clarin.eu:cr1:c_1357720977486",
    //             "@CardinalityMin": "0",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@name": "SubjectLanguages",
    //             "@ComponentId": "clarin.eu:cr1:c_1357720977487",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@ComponentId": "clarin.eu:cr1:c_1361876010582",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@ComponentId": "clarin.eu:cr1:c_1361876010595",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "1"
    //         },
    //         {
    //             "@name": "TechnicalInfo",
    //             "@ComponentId": "clarin.eu:cr1:c_1357720977482",
    //             "@CardinalityMin": "1",
    //             "@CardinalityMax": "unbounded"
    //         }
    //     ]
    }
};
var expectedOut =`
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
    <Component
      name="AnnotatedCorpusProfile-DLU"
      CardinalityMin="1"
      CardinalityMax="1" />
  </ComponentSpec>
`;

describe('Component', function () {
  describe('marshall', function() {
    var context = new Jsonix.Context([CMD]);
    var marshaller = context.createMarshaller();

    var xmlOut = marshaller.marshalString({ name: new Jsonix.XML.QName('ComponentSpec'), value: data });
    it('should marshall', function() {
      //assert.equal(expectedOut, xmlOut);
      expect(expectedOut).xml.to.deep.equal(xmlOut);
    });
  });
});
