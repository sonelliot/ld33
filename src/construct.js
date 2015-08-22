
function spritify(game, component, entity) {
  let {key, body, input} = component;
  let sprite = game.add.sprite(0, 0, key);
  sprite.type = component.type;
  sprite.smoothed = false;
  sprite.inputEnabled = input;
  if (body === true)
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
  if (sprite.inputEnabled)
    sprite.events.onInputDown.add(_ => entity.controller.clicked(), entity.controller);
  return sprite;
}

function pointify(game, component, entity) {
  let point = new Phaser.Point(component.x, component.y);
  point.type = component.type;
  return point;
}

export function construct(game, component, entity) {
  const {type} = component;
  if (type === 'sprite')
    return spritify(game, component, entity);
  else if (type === 'scale' || type === 'position')
    return pointify(game, component, entity);
  return component;
}
