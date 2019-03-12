import React, { useState, useMemo, useEffect } from 'react';
import jss from 'jss';
import preset from 'jss-preset-default'

import Unit, {UnitDefinition} from './Unit';

import base from 'base';

jss.setup(preset())

interface AppDefinition {
  styles
  units: UnitDefinition[]
}

interface PackagedApp {
  units
  styles: {
    classes: object
    stylesheet: string
  }
}

function packageApp(units, sheet): PackagedApp {
  return {
    units: units,
    styles: {
      classes: sheet.classes,
      stylesheet: sheet.toString()
    }
  }
}

function DevelopmentEnviroment() {
  const [app, setApp] = useState(base);
  const sheet = useMemo(() => jss.createStyleSheet(app.styles), [app.styles]);
  useEffect(() => {
    sheet.attach()
  
    return () => { sheet.detach(); };
  }, [sheet]);

  return app.units.map((unit, i) => {
    return <Unit definition={unit} classes={sheet.classes} />;
  })
}

export default DevelopmentEnviroment
