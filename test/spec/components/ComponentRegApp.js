'use strict';
var React = require('react/addons');
var rewire = require('rewire');

describe('Main', function () {
  var component;
  var ComponentRegApp = rewire('../../../src/scripts/components/ComponentRegApp.jsx');

  // aka jest.mock(component); auto-mock/stubComponent
  beforeEach(function () {
    this.original = {
      Profile: ComponentRegApp.__get__("Profile"),
    };

    this.stubbed = {
      Profile: React.DOM.div(),
    };

    ComponentRegApp.__set__({
      Profile: this.stubbed.Profile
    });

    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    component = ComponentRegApp();
  });

  it('should create a new instance of ComponentRegApp', function () {
    expect(component).toBeDefined();
  });

  afterEach(function() {
    ComponentRegApp.__set__({
      Profile: this.original.Profile
    });
  })
});
