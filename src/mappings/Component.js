var Component_Module_Factory = function () {
  var Component = {
    name: 'Component',
    typeInfos: [{
        localName: 'AttributeListType',
        propertyInfos: [{
            name: 'Attribute',
            collection: true,
            elementName: {
              localPart: 'Attribute'
            },
            typeInfo: '.AttributeListType.Attribute'
          }]
      }, {
        localName: 'AttributeListType.Attribute',
        propertyInfos: [{
            name: 'Name',
            elementName: {
              localPart: 'Name'
            }
          }, {
            name: 'ConceptLink',
            elementName: {
              localPart: 'ConceptLink'
            }
          }, {
            name: 'Type',
            elementName: {
              localPart: 'Type'
            }
          }, {
            name: 'ValueScheme',
            elementName: {
              localPart: 'ValueScheme'
            },
            typeInfo: '.ValueSchemeType'
          }]
      }, {
        localName: 'CMDComponentType',
        propertyInfos: [{
            name: 'AttributeList',
            elementName: {
              localPart: 'AttributeList'
            },
            typeInfo: '.AttributeListType'
          }, {
            type: 'element',
            name: 'CMD_Element',
            collection: true,
            elementName: {
              localPart: 'CMD_Element'
            },
            typeInfo: '.CMDElementType'
          }, {
            type: 'element',
            name: 'CMD_Component',
            collection: true,
            elementName: {
              localPart: 'CMD_Component'
            },
            typeInfo: '.CMDComponentType'
          }, {
            name: '@name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }, {
            name: '@ComponentId',
            attributeName: {
              localPart: 'ComponentId'
            },
            type: 'attribute'
          }, {
            name: '@ConceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: '@filename',
            attributeName: {
              localPart: 'filename'
            },
            type: 'attribute'
          }, {
            name: '@CardinalityMin',
            typeInfo: 'String',
            attributeName: {
              localPart: 'CardinalityMin'
            },
            type: 'attribute'
          }, {
            name: '@CardinalityMax',
            typeInfo: 'String',
            attributeName: {
              localPart: 'CardinalityMax'
            },
            type: 'attribute'
          }, {
            name: '@base',
            attributeName: {
              localPart: 'base',
              namespaceURI: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'EnumerationType',
        propertyInfos: [{
            name: 'item',
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
            name: '$',
            type: 'value'
          }, {
            name: '@ConceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: '@AppInfo',
            attributeName: {
              localPart: 'AppInfo'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'CMDElementType',
        propertyInfos: [{
            name: 'AttributeList',
            elementName: {
              localPart: 'AttributeList'
            },
            typeInfo: '.AttributeListType'
          }, {
            name: 'ValueScheme',
            elementName: {
              localPart: 'ValueScheme'
            },
            typeInfo: '.ValueSchemeType'
          }, {
            name: '@name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }, {
            name: '@ConceptLink',
            attributeName: {
              localPart: 'ConceptLink'
            },
            type: 'attribute'
          }, {
            name: '@ValueScheme',
            attributeName: {
              localPart: 'ValueScheme'
            },
            type: 'attribute'
          }, {
            name: '@CardinalityMin',
            typeInfo: 'String',
            attributeName: {
              localPart: 'CardinalityMin'
            },
            type: 'attribute'
          }, {
            name: '@CardinalityMax',
            typeInfo: 'String',
            attributeName: {
              localPart: 'CardinalityMax'
            },
            type: 'attribute'
          }, {
            name: '@Documentation',
            attributeName: {
              localPart: 'Documentation'
            },
            type: 'attribute'
          }, {
            name: '@DisplayPriority',
            typeInfo: 'Integer',
            attributeName: {
              localPart: 'DisplayPriority'
            },
            type: 'attribute'
          }, {
            name: '@Multilingual',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'Multilingual'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'CMDComponentSpec',
        propertyInfos: [{
            name: 'Header',
            elementName: {
              localPart: 'Header'
            },
            typeInfo: '.CMDComponentSpec.Header'
          }, {
            name: 'CMD_Component',
            elementName: {
              localPart: 'CMD_Component'
            },
            typeInfo: '.CMDComponentType'
          }, {
            name: '@isProfile',
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
            name: 'ID',
            elementName: {
              localPart: 'ID'
            }
          }, {
            name: 'Name',
            elementName: {
              localPart: 'Name'
            }
          }, {
            name: 'Description',
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
    Component: Component
  };
};
if (typeof define === 'function' && define.amd) {
  define([], Component_Module_Factory);
}
else {
  var Component_Module = Component_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Component = Component_Module.Component;
  }
  else {
    var Component = Component_Module.Component;
  }
}
