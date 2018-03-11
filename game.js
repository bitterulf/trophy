var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('shelf', 'assets/sprites/shelf.png');
    game.load.image('background', 'assets/sprites/background.png');
    game.load.image('curtain', 'assets/sprites/curtain.png');

    for (var t = 1; t < 9; t++) {
        game.load.image('trophy'+t+'s', 'assets/sprites/trophy'+t+'s.png');
        game.load.image('trophy'+t+'m', 'assets/sprites/trophy'+t+'m.png');
        game.load.image('trophy'+t, 'assets/sprites/trophy'+t+'.png');
    }

    game.load.physics('physicsData', 'assets/physics/trophySprites.json');

}

var mouseBody;
var mouseConstraint;

var items = [];

function addShelf(x, y) {
    var item = game.add.sprite(x, y, 'shelf');
    item.data.polygon = 'shelf';
    item.data.static = true;
    item.anchor.set(0.5);

    items.push(item);
}

function addItem(sprite, polygon, x, y, style) {
    var item = game.add.sprite(x, y, sprite);
    item.data.polygon = polygon;
    item.anchor.set(0.5);

    var styles = [
        0xffff00,
        0xfc7d00,
        0xffffff
    ];

    item.tint = styles[style];

    items.push(item);
}

function addRandomItem(x, y) {
    var sizes = ['', 'm', 's'];
    var style = game.rnd.integerInRange(0, 2);
    var size = game.rnd.integerInRange(0, 2);
    var type = game.rnd.integerInRange(1, 3);
    addItem('trophy'+type+sizes[size], 'trophy'+type+sizes[size], x, y, style);
}

function create() {

    //  Enable p2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000;

    var blockCollisionGroup = game.physics.p2.createCollisionGroup();

    var background = game.add.sprite(0, 0, 'background');

    addShelf(400, 400);

    addRandomItem(200, 300);
    addRandomItem(400, 300);
    addRandomItem(600, 300);

    //  Create collision group for the blocks

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    //  Enable the physics bodies on all the sprites
    game.physics.p2.enable(items, false);

    items.forEach(function(item) {
        if (item.data.static) {
            item.body.static = true;
        }
        item.body.clearShapes();
        item.body.loadPolygon('physicsData', item.data.polygon);
        item.body.setCollisionGroup(blockCollisionGroup);
        item.body.collides([blockCollisionGroup]);
    });

    // create physics body for mouse which we will use for dragging clicked bodies
    mouseBody = new p2.Body();
    game.physics.p2.world.addBody(mouseBody);

    // attach pointer events
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);

    var curtain = game.add.sprite(0, 0, 'curtain');
}

function click(pointer) {

    var bodies = game.physics.p2.hitTest(pointer.position, items.map(function(item) { return item.body }));

    // p2 uses different coordinate system, so convert the pointer position to p2's coordinate system
    var physicsPos = [game.physics.p2.pxmi(pointer.position.x), game.physics.p2.pxmi(pointer.position.y)];

    if (bodies.length)
    {
        var clickedBody = bodies[0];

        var localPointInBody = [0, 0];
        // this function takes physicsPos and coverts it to the body's local coordinate system
        clickedBody.toLocalFrame(localPointInBody, physicsPos);

        // use a revoluteContraint to attach mouseBody to the clicked body
        mouseConstraint = this.game.physics.p2.createRevoluteConstraint(mouseBody, [0, 0], clickedBody, [game.physics.p2.mpxi(localPointInBody[0]), game.physics.p2.mpxi(localPointInBody[1]) ]);
    }

}

function release() {

    // remove constraint from object's body
    game.physics.p2.removeConstraint(mouseConstraint);

}

function move(pointer) {

    // p2 uses different coordinate system, so convert the pointer position to p2's coordinate system
    mouseBody.position[0] = game.physics.p2.pxmi(pointer.position.x);
    mouseBody.position[1] = game.physics.p2.pxmi(pointer.position.y);

}

function update() {
}

function render() {

//  game.debug.text(result, 32, 32);

}
