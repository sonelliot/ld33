
export class HidingSpot {
  constructor(game, type, position, closed) {
    this.game = game;
    this.group = game.add.group();

    this.position = position;
    this.occupant = null;

    this.open = game.add.sprite(position.x, position.y, type + '_open', null, this.group);
    this.open.anchor.set(0, 1);
    this.open.smoothed = false;
    this.open.scale.set(game.zoom, game.zoom);
    this.open.visible = !closed;

    this.closed = game.add.sprite(position.x, position.y, type + '_closed', null, this.group);
    this.closed.anchor.set(0, 1);
    this.closed.smoothed = false;
    this.closed.scale.set(game.zoom, game.zoom);
    this.closed.visible = closed;
    this.closed.inputEnabled = true;

    const SEARCH_RADIUS = 80;

    this.closed.events.onInputOver.add(_ => {
      let {active} = this.game.guards;
      let dist = Phaser.Point.distance(active.position, this.position);
      if (dist < SEARCH_RADIUS) {
        let {question} = this.game;
        question.show(this.center());
      }
    });

    this.closed.events.onInputOut.add(_ => {
      let {question} = this.game;
      question.hide();
    });

    this.closed.events.onInputDown.add(_ => {
      let {active} = this.game.guards;
      if (!active) return;
      let dist = Phaser.Point.distance(active.position, this.position);
      if (dist < SEARCH_RADIUS) {
        let {question} = this.game;
        question.hide();
        this.search();
      }      
    });
  }

  hidable() {
    return this.open.visible === true;
  }

  center() {
    return new Phaser.Point(
      this.position.x + this.closed.width / 2,
      this.position.y - this.closed.height / 2);
  }

  occupied() {
    return this.occupant !== null;
  }

  occupy(intruder) {
    this.occupant = intruder;
    this.open.visible = false;
    this.closed.visible = true;
  }

  search() {
    this.open.visible = true;
    this.closed.visible = false;
    if (this.occupant) {
      this.occupant.group.visible = true;
      this.occupant.hidingSpot = null;
      this.occupant = null;
    }
  }
};
