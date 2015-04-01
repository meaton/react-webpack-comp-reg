var CMD_Module_Factory = function () {
  var CMD = {
    name: 'CMD',
    typeInfos: [{
        localName: 'AttributeListType',
        propertyInfos: [{
            name: 'attribute',
            collection: true,
            elementName: {
              localPart: 'Attribute'
            },
            typeInfo: '.AttributeListType.Attribute'
          }]
      }, {
        localName: 'AttributeListType.Attribute',
        propertyInfos: [{
            name: 'name',
            elementName: {
              localPart: 'Name'
            }
          }, {
            name: 'conceptLink',
            elementName: {
              localPart: 'ConceptLink'
            }
          }, {
            name: 'type',
            elementName: {
              localPart: 'Type'
            }
          }, {
            name: 'valueScheme',
            elementName: {
              localPart: 'ValueScheme'
            },
            typeInfo: '.ValueSchemeType'
          }]
      }, {
        localName: 'CMDComponentType',
        propertyInfos: [{
            name: 'attributeList',
            elementName: {
              localPart: 'AttributeList'
            },
            typeInfo: '.AttributeListType'
          }, {
            name: 'cmdElement',
            collection: true,
            elementName: {
              localPart: 'CMD_Element'
            },
            typeInfo: '.CMDElementType'
          }, {
            name: 'cmdComponent',
            collection: true,
            elementName: {
              localPart: 'CMD_Component'
            },
            typeInfo: '.CMDComponentType'
          }, {
            name: 'name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }, {
            name: 'componentId',
            attributeName: {
              localPart: 'ComponentId'
            },
            type: 'attribute'
          }, {
            name: 'conceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: 'filename',
            attributeName: {
              localPart: 'filename'
            },
            type: 'attribute'
          }, {
            name: 'cardinalityMin',
            typeInfo: {
              type: 'list'
            },
            attributeName: {
              localPart: 'CardinalityMin'
            },
            type: 'attribute'
          }, {
            name: 'cardinalityMax',
            typeInfo: {
              type: 'list'
            },
            attributeName: {
              localPart: 'CardinalityMax'
            },
            type: 'attribute'
          }, {
            name: 'base',
            attributeName: {
              localPart: 'base',
              namespaceURI: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'EnumerationType',
        propertyInfos: [{
            name: 'itemOrAppinfo',
            collection: true,
            elementTypeInfos: [{
                elementName: {
                  localPart: 'item'
                },
                typeInfo: '.ItemType'
              }, {
                elementName: {
                  localPart: 'appinfo'
                }
              }],
            type: 'elements'
          }]
      }, {
        localName: 'ItemType',
        propertyInfos: [{
            name: 'value',
            type: 'value'
          }, {
            name: 'conceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: 'appInfo',
            attributeName: {
              localPart: 'AppInfo'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'CMDElementType',
        propertyInfos: [{
            name: 'attributeList',
            elementName: {
              localPart: 'AttributeList'
            },
            typeInfo: '.AttributeListType'
          }, {
            name: 'valueScheme',
            elementName: {
              localPart: 'ValueScheme'
            },
            typeInfo: '.ValueSchemeType'
          }, {
            name: 'name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }, {
            name: 'conceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: 'valueSchemeAttribute',
            attributeName: {
              localPart: 'ValueScheme'
            },
            type: 'attribute'
          }, {
            name: 'cardinalityMin',
            typeInfo: {
              type: 'list'
            },
            attributeName: {
              localPart: 'CardinalityMin'
            },
            type: 'attribute'
          }, {
            name: 'cardinalityMax',
            typeInfo: {
              type: 'list'
            },
            attributeName: {
              localPart: 'CardinalityMax'
            },
            type: 'attribute'
          }, {
            name: 'documentation',
            attributeName: {
              localPart: 'Documentation'
            },
            type: 'attribute'
          }, {
            name: 'displayPriority',
            typeInfo: 'Integer',
            attributeName: {
              localPart: 'DisplayPriority'
            },
            type: 'attribute'
          }, {
            name: 'multilingual',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'Multilingual'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'CMDComponentSpec',
        propertyInfos: [{
            name: 'header',
            elementName: {
              localPart: 'Header'
            },
            typeInfo: '.CMDComponentSpec.Header'
          }, {
            name: 'cmdComponent',
            elementName: {
              localPart: 'CMD_Component'
            },
            typeInfo: '.CMDComponentType'
          }, {
            name: 'isProfile',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'isProfile'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ValueSchemeType',
        propertyInfos: [{
            name: 'pattern',
            elementName: {
              localPart: 'pattern'
            }
          }, {
            name: 'enumeration',
            elementName: {
              localPart: 'enumeration'
            },
            typeInfo: '.EnumerationType'
          }]
      }, {
        localName: 'CMDComponentSpec.Header',
        propertyInfos: [{
            name: 'id',
            elementName: {
              localPart: 'ID'
            }
          }, {
            name: 'name',
            elementName: {
              localPart: 'Name'
            }
          }, {
            name: 'description',
            elementName: {
              localPart: 'Description'
            }
          }]
      }, {
        type: 'enumInfo',
        localName: 'AllowedAttributetypesType',
        values: ['boolean', 'decimal', 'float', 'int', 'string', 'anyURI', 'date', 'gDay', 'gMonth', 'gYear', 'time', 'dateTime']
      }],
    elementInfos: [{
        elementName: {
          localPart: 'CMD_ComponentSpec'
        },
        typeInfo: '.CMDComponentSpec'
      }]
  };
  return {
    CMD: CMD
  };
};
if (typeof define === 'function' && define.amd) {
  define([], CMD_Module_Factory);
}
else {
  var CMD_Module = CMD_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.CMD = CMD_Module.CMD;
  }
  else {
    var CMD = CMD_Module.CMD;
  }
}