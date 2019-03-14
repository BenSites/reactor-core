# Reactor

Reactor is a bootstraped React app builder/designer, but, uniquely, it allows combining
powerful visual design and code. 

## Goalss

For designers, Reactor...

 - provides an amazing visual style editor
 - uses CSS classes to promote style reusability and consistency
 - allows editing JSS directly for extreme control over styling
 - supports modern layout techniques, no reliance on absolute positioning
 - makes reponsive design super-simple
 - allows designing with real data and real behavoir
 - displays live-previews of the entire app

For developers, Reactor...

 - works with React Dev-Tools, each unit maps to a component
 - uses React Hooks to make visual editing simple
 - respects React component heirarchy and provides easy manipulation of props and state 
 - provides multiple methods of providing custom code for units
    - Units can specify hooks, allowing almost any behavior to be easily developed for a unit
    - a unit can render any React component natively, passing values from hooks, props,
      and/or state, providing unparalleled adaptability.
 - displays live-previews of the entire app
 - uses a file structure that allows for simple version control
 - can be used with either React or React Native

## Technical Overview

Reactor is built on the abstraction of units, which map directly to React components. 
The main difference is that units can be defined using a flat data structure, allowing
them to be edited as data.
