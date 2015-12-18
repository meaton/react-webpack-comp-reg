var log = require("loglevel");

var React = require("react");
var ReactDOM = require("react-dom");
var Constants = require("../../constants");
var Config = require('../../../config');

var Clipboard = require('clipboard');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var ComponentRegistryClient = require('../../service/ComponentRegistryClient');

require('../../../../styles/Browser.sass');

var ComponentInfo = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    item: React.PropTypes.object.isRequired,
    space: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    team: React.PropTypes.string,
    history: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {clipboard: null};
  },

  componentDidMount: function() {
    var cb = new Clipboard("#" + ReactDOM.findDOMNode(this).id + " .btn");
    log.trace("Init clipboard", cb);
    this.setState({clipboard: cb})
  },

  componentWillUnmount: function() {
    if(this.state.clipboard != null) {
      log.trace("Destroying clipboard", this.state.clipboard);
      //as advised...
      this.state.clipboard.destroy();
      this.setState({clipboard: null});
    }
  },

  render: function(item, contentId) {
    var item = this.props.item;
    var space = this.props.space;
    var type = this.props.type;

    var query = {
      itemId: item.id,
      registrySpace: ComponentRegistryClient.getRegistrySpacePath(space)
    };
    if(space === Constants.SPACE_TEAM) {
      query.groupId = this.props.team;
    }
    var bookmarkLink = Config.webappUrl + this.props.history.createHref("/", query);

    var xsdLink = type === Constants.TYPE_PROFILE ? ComponentRegistryClient.getRegistryUrl(type, item.id) + "/xsd" : null;

    //not setting onChange to the inputs will generate a warning unless readOnly
    //is set, which does not yield the desired behaviour, therefore a noop function is passed
    var noop = function() {};

    return (
      <div id="componentInfoModal" className={this.props.className}>
        <div>
          <a href={bookmarkLink}>Bookmark link:</a>
          <div>
            <input id="bookmarkLink" type="text" value={bookmarkLink} onChange={noop} />
            <button type="button" className="btn btn-default" data-clipboard-target="#bookmarkLink" title="Copy to clipboard">
              <span className="glyphicon glyphicon-copy" aria-hidden="true"/>
            </button>
          </div>
        </div>
        {xsdLink != null && (
          <div>
            <a href={xsdLink}>Link to xsd:</a>
            <div>
              <input id="xsdLink" type="text" value={xsdLink} onChange={noop} />
              <button type="button" className="btn btn-default" data-clipboard-target="#xsdLink" title="Copy to clipboard">
                <span className="glyphicon glyphicon-copy" aria-hidden="true"/>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
});

module.exports = ComponentInfo;
