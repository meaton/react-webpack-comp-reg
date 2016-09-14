'use strict';
var log = require('loglevel');
var _ = require('lodash');
var React = require('react');

/**
* @constructor
*/
var SuccessorSelector = React.createClass({
  propTypes: {
    subjectItem: React.PropTypes.object,
    candidateItems: React.PropTypes.array,
    onSelect: React.PropTypes.func
  },

  getInitialState: function() {
    return {item: null}
  },

  render: function () {
    var options = this.props.candidateItems.map(function(item){
      return (
        <option key={item.id} value={item.id} onSelect={onItemSelect} >{item.name} {item.groupName && item.groupName != '' && '('+item.groupName+')'}</option>
      );
    });

    var onItemSelect = function(evt) {
      var itemId = evt.target.value;
      if(itemId == null) {
        this.setState({item: null});
        this.props.onSelect(null);
      } else {
        var item = _.find(this.props.candidateItems, {'id': itemId});
        this.setState({item: item});
        this.props.onSelect(item);
      }
    };

    return(
      <div>
        <p>Please select the item that you would like to appoint as the successor to <em>{this.props.subjectItem.name}</em>:</p>
        <form>
          <select ref="selector" onChange={onItemSelect.bind(this)}>
            {this.state.item == null && <option key="select">Select a successor</option>}
            {options}
          </select>
        </form>
        {this.state.item &&
          <div className="selected-successor-candidate">
            <div className="title">{this.state.item.name}</div>
            <div className="description">{this.state.item.description}</div>
            <ul>
              <li>Creator: {this.state.item.creatorName}</li>
              <li>Registration date: {this.state.item.registrationDate.substr(0,10)}</li>
              <li>Group: {this.state.item.groupName || "-"}</li>
            </ul>
          </div>
        }
        <p>Keep in mind that you can set a component's successor <strong>only once</strong> and can not change this afterwards. Only published items of the same type with <em>production</em> status are eligible for selection as a successor.</p>
        {/*TODO: selected item details */}
      </div>
    );
  }
});

module.exports = SuccessorSelector;
