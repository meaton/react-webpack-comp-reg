/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

var SpaceSelector = React.createClass({
  getInitialState: function() {
    return { currentSpaceIdx: 0,
             spaces: [
                { label: "Public - Profiles", registry: { type: "components", filter: "published" } },
                { label: "Public - Components", registry: { type: "profiles", filter: "published" } },
                { label: "Private - Profiles", registry: { type: "profiles", filter: "private" } },
                { label: "Private - Components", registry: { type: "components", filter: "private" } }
             ]};
  },
  spaceSelect: function(idx, event) {
    if(this.currentSpaceIdx != idx) {
      var registryName = this.state.spaces[idx].registry;
      console.log('changed props: ' + registryName.filter);

      this.props.onSelect(registryName);
      this.setState({ currentSpaceIdx:idx });
    }
  },
  render: function() {
    var self = this;
    var list = this.state.spaces.map(function(d, index){
      var selectedClass = (self.state.currentSpaceIdx == index) ? "selected" : "";
      return (
        <li className={selectedClass} >
          <a href="#" onClick={self.spaceSelect.bind(null, index)}>{d.label}</a>
        </li>
      );
    });

    return (
      <ul className="space_selector">
        {list}
      </ul>
    );
  }
});

module.exports = SpaceSelector;
