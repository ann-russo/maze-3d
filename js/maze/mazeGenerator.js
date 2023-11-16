/**
 * Generates a maze using a randomized depth-first search algorithm.
 * Reference: http://rosettacode.org/wiki/Maze_generation
 *
 * @param {number} width - The width of the maze.
 * @param {number} height - The height of the maze.
 * @returns An object containing the maze's dimensions and the horizontal and vertical gaps.
 */
const generateMaze = function (width, height) {

    // Check for valid maze dimensions
    let n = width * height - 1;
    if (n < 0) {
        console.alert("Illegal maze dimensions!");
        return;
    }

    // Arrays to store horizontal and vertical gaps in the maze
    let horizontal = [],
        vertical = [],
        here = [rnd(width), rnd(height)], // Starting cell
        stack = [here], // Stack to keep track of the path
        unvisited = []; // Array to keep track of unvisited cells

    // Initialize the horizontal and vertical arrays
    for (let i = 0; i < width + 1; i++) {
        horizontal[i] = [], vertical[i] = [];
    }

    // Mark all cells as unvisited
    for (let i = 0; i < width + 2; i++) {
        unvisited[i] = [];
        for (let j = 0; j < height + 1; j++) {
            unvisited[i].push(i > 0 && i < width + 1 && j > 0 && (i !== here[0] + 1 || j !== here[1] + 1));
        }
    }

    // Main loop to generate the maze
    while (n > 0) {
        // Determine the neighbors of the current cell
        const neighbors = [
            [here[0] + 1, here[1]],
            [here[0], here[1] + 1],
            [here[0] - 1, here[1]],
            [here[0], here[1] - 1]
        ];

        // Filter out visited neighbors
        for (let i = 0; i < neighbors.length;) {
            if (unvisited[neighbors[i][0] + 1][neighbors[i][1] + 1]) {
                i++;
            } else {
                neighbors.splice(i, 1);
            }
        }

        // If there are unvisited neighbors
        if (neighbors.length) {
            n--;
            const next = neighbors.randomElement(); // Choose a random neighbor
            unvisited[next[0] + 1][next[1] + 1] = false; // Mark the neighbor as visited

            // Remove the wall between the current cell and the chosen neighbor
            if (next[0] === here[0]) {
                horizontal[next[0]][(next[1] + here[1] - 1) / 2] = true;
            } else {
                vertical[(next[0] + here[0] - 1) / 2][next[1]] = true;
            }

            // Move to the chosen neighbor
            stack.push(here = next);
        } else {
            // Backtrack if no unvisited neighbors are found
            here = stack.pop();
        }
    }

    // Return the generated maze
    return {width: width, height: height, horizontal: horizontal, vertical: vertical};
};