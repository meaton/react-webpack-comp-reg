# CLARIN Component Registry - React.js front end

This project implements a front end for the [CLARIN Component Registry](https://catalog.clarin.eu/ds/ComponentRegistry), part of CLARIN's [Component Metadata Infrastructure](https://www.clarin.eu/cmdi) (CMDI).

This front end communicates with the Component Registry REST interface (source currently hosted at [svn.clarin.eu](https://svn.clarin.eu/ComponentRegistry)). It uses the following software components/technologies:

- [React](https://facebook.github.io/react/) (currently version 0.14)
- [Fluxxor](http://www.fluxxor.com)
- [jQuery](http://www.jquery.com)
- [Bootstrap](http://getbootstrap.com/) through [react-boostrap](https://react-bootstrap.github.io) components
- [Jsonix](https://github.com/highsource/jsonix) for XML serialisation

Build tools:
- Grunt
- Webpack
- grunt-maven-deploy for creating and deploying a Maven artifact to be used in the combined front end/back end package

More information, including UML diagrams, can be found in the project's [wiki](../../wiki).

## Getting started quickly
To run the application in development mode:
- Start the Component Registry back end/REST service (see https://github.com/clarin-eric/component-registry-rest)
- Adapt the configuration in `compRegConfig.jsp` to match the back end root location
- Install dependencies by running `npm install`
- Start the webpack dev server by running `grunt serve`

To integrate with the back end:
- Run `grunt maven-install`
- Make sure that the artifact matches the configuration of the maven-dependency-plugin in the `pom.xml` file of the back end project
- Build the back end (`mvn package`) and start it within Tomcat

## Licence

Copyright (C) 2016  CLARIN ERIC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
