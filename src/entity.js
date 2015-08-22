import {construct} from './construct.js';
const uuid = require('uuid').v4;

export class Entity {
  constructor(game, name, id) {
    this.game = game;
    this.name = name || 'unknown';
    this.id = id || uuid();
    this.components = [];
  }

  construct() {
    this.components = this.components.map(comp => construct(
      this.game, comp, this));
    return this;
  }

  add(component) {
    this.components.push(component);
    return this;
  }

  get(type) {
    return this.components.filter(c => c.type === type);
  }

  first(type) {
    return this.get(type)[0];
  }

  types() {
    return this.components.map(c => c.type);
  }

  static guard(game) {
    return new Entity(game, 'guard')
      .add({ type: 'sprite', key: 'guard', body: true })
      .add({ type: 'scale', x: 3, y: 3 })
      .add({ type: 'facing', direction: 'left' })
      .add({ type: 'position', x: 100, y: 100 })
      .construct();
  }
};
