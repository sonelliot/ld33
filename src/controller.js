export class Controller {

  constructor(game, entity) {
    this.game = game;
    this.entity = entity;
    this.register(game);
  }

  register(game) {
    let pointer = game.input.activePointer;
    pointer.leftButton.onDown.add(_ => this.leftDown(), this);
  }

  leftDown() { }

  clicked() { }
};

export class GuardController extends Controller {
  clicked() {
    let selected = this.entity.first('selected');
    selected.value = !selected.value;
  }

  leftDown() {
  }
};
