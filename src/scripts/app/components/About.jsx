var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants");

var Config = require("../../config").Config;

var Main = React.createClass({
  render: function() {
    return(
      <div className="aboutBox">
        <p>
          The CMDI Component Registry provides long term storage and easy
          browsing, creation and editing of components and profiles for
          the <a href="https://www.clarin.eu">CLARIN</a> infrastructure.
        </p>
        <table>
          <tbody>
            <tr>
              <td>Back end version:</td>
              <td>{Config.backEndVersion || "unknown"}</td>
            </tr>
            <tr>
              <td>Front end version:</td>
              <td>{Config.frontEndVersion || "unknown"}</td>
            </tr>
            <tr>
              <td>License:</td>
              <td><a href="http://www.gnu.org/licenses/gpl-3.0.html">GPL version 3</a></td>
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
