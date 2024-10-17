const { World, Engine, Render, Bodies, Runner, Body, Events } = Matter;
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const width = window.innerWidth;
const height = window.innerHeight;

const cellsHorizontal = 12;
const cellsVertical = 12;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const ballSpeed = 6;
const wallThickness = 4;
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes:false,
        width,
        height
    }
})
Render.run(render);
Runner.run(Runner.create(), engine);
// Walls 
const walls = [
    Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true }),
    Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true })
];
World.add(world, walls);
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const randomIndex = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[randomIndex];
        arr[randomIndex] = temp;
    }
    return arr;
};
// Maze Generation :
const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));
// Rondom starting cell
const startRowIndex = Math.floor(Math.random() * cellsVertical);
const startColumnIndex = Math.floor(Math.random() * cellsHorizontal);
const stepThroughCell = (row, column) => {
    // if i have visited cell at [row,column], then return
    if (grid[row][column] === true)
        return;
    // Mark this cell as being visited,
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    // For each neighbor .... 
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // check if that neighbors are out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
        //  if we have visited that neighbor ... continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        //  Remove  a wall from either  horizontals or verticals
        if (direction === 'left')
            verticals[row][column - 1] = true;
        else if (direction === 'right')
            verticals[row][column] = true;
        if (direction === 'up')
            horizontals[row - 1][column] = true;
        else if (direction === 'down')
            horizontals[row][column] = true;
        stepThroughCell(nextRow, nextColumn);
    }
    //  visit that next cell 
};
stepThroughCell(startRowIndex, startColumnIndex);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open)
            return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            wallThickness,
            {
                label: 'wall',
                isStatic: true,
                render:{
                    fillStyle : 'orangered'
                }
            }
        );
        World.add(world, wall);
    })
})
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open)
            return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            wallThickness,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render:{
                    fillStyle: 'orangered'
                }
            }
        );
        World.add(world, wall);
    })
})
// Making goal...
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render:{
            fillStyle:'lime'
        }
    }
);
World.add(world, goal);
// Making ball ...
const ballRaduis  = unitLengthX > unitLengthY ? unitLengthY/3 : unitLengthX/3;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRaduis, {
    label: 'ball',
    render:{
        fillStyle: 'lightblue'
    }
}
);
World.add(world, ball);

document.addEventListener('keydown', ({ keyCode }) => {
    const { x, y } = ball.velocity;
    if (keyCode === 87 || keyCode === 38) {
        Body.setVelocity(ball, { x, y: ballSpeed * -1 });
    }
    if (keyCode === 83 || keyCode === 40) {
        Body.setVelocity(ball, { x, y: ballSpeed })
    }
    if (keyCode === 65 || keyCode === 37) {
        Body.setVelocity(ball, { x: ballSpeed * -1, y })
    }
    if (keyCode === 68 || keyCode === 39) {
        Body.setVelocity(ball, { x: ballSpeed, y })
    }
})

// Win Condition
Events.on(engine,'collisionStart',event =>{
    event.pairs.forEach((collision)=> {
        const labels= ['ball','goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y = 1 ;
            document.querySelector('.winner').classList.remove('hidden')
            document.querySelector('.btn').innerHTML = `<a href="index.html">Play Again</a>`
            world.bodies.forEach((body)=>{
                if (body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })

        }
    })
})