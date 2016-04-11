var Component_Module_Factory = function () {
  var Component = {
    name: 'Component',
    typeInfos: [{
        localName: 'EnumerationType',
        typeName: 'enumeration_type',
        propertyInfos: [{
            name: 'appinfo',
            elementName: {
              localPart: 'appinfo'
            }
          }, {
            name: 'item',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'item'
            },
            typeInfo: '.ItemType'
          }]
      }, {
        localName: 'ItemType',
        typeName: 'item_type',
        propertyInfos: [{
            name: 'otherAttributes',
            type: 'anyAttribute'
          }, {
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
        localName: 'ValueSchemeType',
        typeName: 'ValueScheme_type',
        propertyInfos: [{
            name: 'pattern',
            required: true,
            elementName: {
              localPart: 'pattern'
            }
          }, {
            name: 'vocabulary',
            required: true,
            elementName: {
              localPart: 'Vocabulary'
            },
            typeInfo: '.VocabularyType'
          }]
      }, {
        localName: 'AttributeListType.Attribute',
        typeName: null,
        propertyInfos: [{
            name: 'otherAttributes',
            type: 'anyAttribute'
          }, {
            name: 'documentation',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'Documentation'
            },
            typeInfo: '.DocumentationType'
          }, {
            name: 'attributeValueScheme',
            elementName: {
              localPart: 'ValueScheme'
            },
            typeInfo: '.ValueSchemeType'
          }, {
            name: 'autoValue',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'AutoValue'
            }
          }, {
            name: 'name',
            required: true,
            typeInfo: 'Name',
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
            name: 'valueScheme',
            typeInfo: 'Token',
            attributeName: {
              localPart: 'ValueScheme'
            },
            type: 'attribute'
          }, {
            name: 'required',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'Required'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'AttributeListType',
        typeName: 'AttributeList_type',
        propertyInfos: [{
            name: 'attribute',
            required: true,
            collection: true,
            elementName: {
              localPart: 'Attribute'
            },
            typeInfo: '.AttributeListType.Attribute'
          }]
      }, {
        localName: 'ComponentType',
        typeName: 'Component_type',
        propertyInfos: [{
            name: 'otherAttributes',
            type: 'anyAttribute'
          }, {
            name: 'documentation',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'Documentation'
            },
            typeInfo: '.DocumentationType'
          }, {
            name: 'attributeList',
            elementName: {
              localPart: 'AttributeList'
            },
            typeInfo: '.AttributeListType'
          }, {
            name: 'element',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'Element'
            },
            typeInfo: '.ElementType'
          }, {
            name: 'component',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'Component'
            },
            typeInfo: '.ComponentType'
          }, {
            name: 'name',
            typeInfo: 'Name',
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
        localName: 'DocumentationType',
        typeName: 'Documentation_type',
        propertyInfos: [{
            name: 'value',
            type: 'value'
          }, {
            name: 'lang',
            attributeName: {
              localPart: 'lang',
              namespaceURI: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ElementType',
        typeName: 'Element_type',
        propertyInfos: [{
            name: 'otherAttributes',
            type: 'anyAttribute'
          }, {
            name: 'documentation',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'Documentation'
            },
            typeInfo: '.DocumentationType'
          }, {
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
            name: 'autoValue',
            minOccurs: 0,
            collection: true,
            elementName: {
              localPart: 'AutoValue'
            }
          }, {
            name: 'name',
            required: true,
            typeInfo: 'Name',
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
            typeInfo: 'Token',
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
            name: 'multilingual',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'Multilingual'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'VocabularyType',
        typeName: 'Vocabulary_type',
        propertyInfos: [{
            name: 'enumeration',
            elementName: {
              localPart: 'enumeration'
            },
            typeInfo: '.EnumerationType'
          }, {
            name: 'uri',
            attributeName: {
              localPart: 'URI'
            },
            type: 'attribute'
          }, {
            name: 'valueProperty',
            attributeName: {
              localPart: 'ValueProperty'
            },
            type: 'attribute'
          }, {
            name: 'valueLanguage',
            typeInfo: 'Language',
            attributeName: {
              localPart: 'ValueLanguage'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ComponentSpec',
        typeName: null,
        propertyInfos: [{
            name: 'header',
            required: true,
            elementName: {
              localPart: 'Header'
            },
            typeInfo: '.ComponentSpec.Header'
          }, {
            name: 'component',
            required: true,
            elementName: {
              localPart: 'Component'
            },
            typeInfo: '.ComponentType'
          }, {
            name: 'isProfile',
            required: true,
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'isProfile'
            },
            type: 'attribute'
          }, {
            name: 'cmdVersion',
            required: true,
            typeInfo: 'AnySimpleType',
            attributeName: {
              localPart: 'CMDVersion'
            },
            type: 'attribute'
          }, {
            name: 'cmdOriginalVersion',
            attributeName: {
              localPart: 'CMDOriginalVersion'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ComponentSpec.Header',
        typeName: null,
        propertyInfos: [{
            name: 'id',
            required: true,
            elementName: {
              localPart: 'ID'
            }
          }, {
            name: 'name',
            required: true,
            elementName: {
              localPart: 'Name'
            }
          }, {
            name: 'description',
            elementName: {
              localPart: 'Description'
            }
          }, {
            name: 'status',
            required: true,
            elementName: {
              localPart: 'Status'
            }
          }, {
            name: 'statusComment',
            elementName: {
              localPart: 'StatusComment'
            }
          }, {
            name: 'successor',
            elementName: {
              localPart: 'Successor'
            }
          }]
      }, {
        type: 'enumInfo',
        localName: 'AllowedAttributetypesType',
        baseTypeInfo: 'Token',
        values: ['boolean', 'decimal', 'float', 'int', 'string', 'anyURI', 'date', 'gDay', 'gMonth', 'gYear', 'time', 'dateTime']
      }],
    elementInfos: [{
        elementName: {
          localPart: 'ComponentSpec'
        },
        typeInfo: '.ComponentSpec'
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
