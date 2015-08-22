
function spritify(game, component, entity) {
  let {key, body} = component;
  let sprite = game.add.sprite(0, 0, key);
  sprite.type = component.type;
  sprite.smoothed = false;
  if (body === true)
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
  return sprite;
}

export function construct(game, component, entity) {
  const {type} = component;
  if (type === 'sprite')
    return spritify(game, component, entity);
  return component;
}
