var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants");

var Config = require("../../config").Config;

var Main = React.createClass({
  render: function() {
    return(
      <div className="aboutBox">
        <p>
          The <a href="https://www.clarin.eu">CLARIN</a> Component Registry
          provides long term storage and easy browsing, creation and editing of
          components and profiles.
        </p>
        <table>
          <tbody>
            <tr>
              <td>Back end version:</td>
              <td>{Config.backendVersion || "unknown"}</td>
            </tr>
            <tr>
              <td>Front end version:</td>
              <td>1.0-beta</td>
            </tr>
            <tr>
              <td>License:</td>
              <td>GPL</td>
            </tr>
            <tr>
              <td>Source code:</td>
              <td><a href="https://github.com/clarin-eric">https://github.com/clarin-eric</a></td>
            </tr>
            <tr>
              <td>Written by:</td>
              <td>Patrick Duin, Twan Goosen, Mitchell Seaton, Olha Shkaravska, George Georgovassilis, Jean-Charles Ferrieres</td>
            </tr>
          </tbody>
        </table>
        <p>Go to <a href="https://www.clarin.eu/cmdi">www.clarin.eu/cmdi</a> for more information.<br/>
        Email <a href="mailto:cmdi@clarin.eu">cmdi@clarin.eu</a> for questions/support.</p>
      </div>
    );
  }
});
module.exports = Main;
