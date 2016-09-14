'use strict';
var log = require('loglevel');
var React = require('react');

/**
* @constructor
*/
var SuccessorSelector = React.createClass({
  propTypes: {
    subjectItem: React.PropTypes.object,
    candidateItems: React.PropTypes.array
  },

  render: function () {
    var options = this.props.candidateItems.map(function(item){
      return (
        <option value={item.id}>{item.name} {item.groupName && item.groupName != '' && '('+item.groupName+')'}</option>
      );
      //TODO: on dialogue submit, call action to set the successor via REST
    });
    return(
      <div>
        <p>Please select the item that you would like to appoint as the successor to <em>{this.props.subjectItem.name}</em>:</p>
        <form>
          <select>
            {options}
          </select>
        </form>
        <p>Keep in mind that you can set a component's successor <strong>only once</strong> and can not change this afterwards.</p>
        {/*TODO: selected item details */}
      </div>
    );
  }
});

module.exports = SuccessorSelector;
