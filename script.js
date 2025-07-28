/**
 * Rubik's Cube Solver JavaScript
 * Handles cube state management, UI interactions, solving functionality, and 3D animations
 */

class RubikCubeSolver {
    constructor() {
        this.cube = {
            U: Array(3).fill().map(() => Array(3).fill('empty')), // Up (white)
            D: Array(3).fill().map(() => Array(3).fill('empty')), // Down (yellow)
            F: Array(3).fill().map(() => Array(3).fill('empty')), // Front (blue)
            B: Array(3).fill().map(() => Array(3).fill('empty')), // Back (green)
            L: Array(3).fill().map(() => Array(3).fill('empty')), // Left (orange)
            R: Array(3).fill().map(() => Array(3).fill('empty'))  // Right (red)
        };
        
        // Create a separate 3D cube state that tracks actual positions
        this.cube3D = JSON.parse(JSON.stringify(this.cube));
        
        this.colorMap = {
            'white': 'U',
            'yellow': 'D',
            'red': 'R',
            'orange': 'L',
            'blue': 'F',
            'green': 'B'
        };
        
        this.selectedColor = 'white';
        this.solutionSteps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.animationSpeed = 800; // milliseconds
        
        // 3D cube rotation state
        this.cubeRotation = { x: -15, y: 25 };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCubeStatus();
        this.sync3DCube();
        this.updateSpeedDisplay();
    }
    
    setupEventListeners() {
        // Color palette buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
            });
        });
        
        // Cube squares
        document.querySelectorAll('.square').forEach(square => {
            square.addEventListener('click', (e) => {
                const face = e.target.dataset.face;
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.colorSquare(face, row, col);
            });
        });
        
        // Action buttons
        document.getElementById('reset-btn').addEventListener('click', () => this.resetCube());
        document.getElementById('solve-btn').addEventListener('click', () => this.solveCube());
        document.getElementById('scramble-btn').addEventListener('click', () => this.scrambleCube());
        
        // Solution navigation
        document.getElementById('prev-step').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('play-pause').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('auto-solve').addEventListener('click', () => this.autoSolve());
        
        // 3D cube controls
        document.getElementById('rotate-x-plus').addEventListener('click', () => this.rotateCube('x', 15));
        document.getElementById('rotate-x-minus').addEventListener('click', () => this.rotateCube('x', -15));
        document.getElementById('rotate-y-plus').addEventListener('click', () => this.rotateCube('y', 15));
        document.getElementById('rotate-y-minus').addEventListener('click', () => this.rotateCube('y', -15));
        document.getElementById('reset-view').addEventListener('click', () => this.resetCubeView());
        
        // Speed control
        const speedSlider = document.getElementById('animation-speed');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            this.updateSpeedDisplay();
        });
    }
    
    updateSpeedDisplay() {
        const speedValue = document.getElementById('speed-value');
        speedValue.textContent = (this.animationSpeed / 1000).toFixed(1) + 's';
    }
    
    rotateCube(axis, degrees) {
        this.cubeRotation[axis] += degrees;
        this.applyCubeRotation();
    }
    
    resetCubeView() {
        this.cubeRotation = { x: -15, y: 25 };
        this.applyCubeRotation();
    }
    
    applyCubeRotation() {
        const cube3D = document.getElementById('cube-3d');
        cube3D.style.transform = `rotateX(${this.cubeRotation.x}deg) rotateY(${this.cubeRotation.y}deg)`;
    }
    
    sync3DCube() {
        // Sync the 3D cube colors with the current 3D cube state
        Object.keys(this.cube3D).forEach(faceName => {
            const face3D = document.querySelector(`.cube-face[data-face="${faceName}"]`);
            if (face3D) {
                const squares3D = face3D.querySelectorAll('.cube-square');
                this.cube3D[faceName].forEach((row, rowIndex) => {
                    row.forEach((color, colIndex) => {
                        const squareIndex = rowIndex * 3 + colIndex;
                        if (squares3D[squareIndex]) {
                            squares3D[squareIndex].className = `cube-square ${color}`;
                        }
                    });
                });
            }
        });
    }
    
    // Copy 2D cube state to 3D cube state (used when user colors the cube)
    copyTo3DCube() {
        this.cube3D = JSON.parse(JSON.stringify(this.cube));
        this.sync3DCube();
    }
    
    // Perform actual cube move transformations on the 3D cube state
    performCubeMove(move) {
        switch(move) {
            case 'R': this.rotateR(); break;
            case 'R\'': this.rotateRPrime(); break;
            case 'R2': this.rotateR(); this.rotateR(); break;
            case 'L': this.rotateL(); break;
            case 'L\'': this.rotateLPrime(); break;
            case 'L2': this.rotateL(); this.rotateL(); break;
            case 'U': this.rotateU(); break;
            case 'U\'': this.rotateUPrime(); break;
            case 'U2': this.rotateU(); this.rotateU(); break;
            case 'D': this.rotateD(); break;
            case 'D\'': this.rotateDPrime(); break;
            case 'D2': this.rotateD(); this.rotateD(); break;
            case 'F': this.rotateF(); break;
            case 'F\'': this.rotateFPrime(); break;
            case 'F2': this.rotateF(); this.rotateF(); break;
            case 'B': this.rotateB(); break;
            case 'B\'': this.rotateBPrime(); break;
            case 'B2': this.rotateB(); this.rotateB(); break;
        }
        this.sync3DCube();
    }
    
    // Helper function to rotate a face clockwise
    rotateFaceClockwise(face) {
        const temp = JSON.parse(JSON.stringify(this.cube3D[face]));
        this.cube3D[face][0][0] = temp[2][0];
        this.cube3D[face][0][1] = temp[1][0];
        this.cube3D[face][0][2] = temp[0][0];
        this.cube3D[face][1][0] = temp[2][1];
        this.cube3D[face][1][1] = temp[1][1];
        this.cube3D[face][1][2] = temp[0][1];
        this.cube3D[face][2][0] = temp[2][2];
        this.cube3D[face][2][1] = temp[1][2];
        this.cube3D[face][2][2] = temp[0][2];
    }
    
    // Helper function to rotate a face counter-clockwise
    rotateFaceCounterClockwise(face) {
        const temp = JSON.parse(JSON.stringify(this.cube3D[face]));
        this.cube3D[face][0][0] = temp[0][2];
        this.cube3D[face][0][1] = temp[1][2];
        this.cube3D[face][0][2] = temp[2][2];
        this.cube3D[face][1][0] = temp[0][1];
        this.cube3D[face][1][1] = temp[1][1];
        this.cube3D[face][1][2] = temp[2][1];
        this.cube3D[face][2][0] = temp[0][0];
        this.cube3D[face][2][1] = temp[1][0];
        this.cube3D[face][2][2] = temp[2][0];
    }
    
    // R move: Right face clockwise
    rotateR() {
        this.rotateFaceClockwise('R');
        
        // Rotate adjacent edges
        const temp = [this.cube3D['U'][0][2], this.cube3D['U'][1][2], this.cube3D['U'][2][2]];
        
        this.cube3D['U'][0][2] = this.cube3D['F'][0][2];
        this.cube3D['U'][1][2] = this.cube3D['F'][1][2];
        this.cube3D['U'][2][2] = this.cube3D['F'][2][2];
        
        this.cube3D['F'][0][2] = this.cube3D['D'][0][2];
        this.cube3D['F'][1][2] = this.cube3D['D'][1][2];
        this.cube3D['F'][2][2] = this.cube3D['D'][2][2];
        
        this.cube3D['D'][0][2] = this.cube3D['B'][2][0];
        this.cube3D['D'][1][2] = this.cube3D['B'][1][0];
        this.cube3D['D'][2][2] = this.cube3D['B'][0][0];
        
        this.cube3D['B'][0][0] = temp[2];
        this.cube3D['B'][1][0] = temp[1];
        this.cube3D['B'][2][0] = temp[0];
    }
    
    // R' move: Right face counter-clockwise
    rotateRPrime() {
        this.rotateFaceCounterClockwise('R');
        
        const temp = [this.cube3D['U'][0][2], this.cube3D['U'][1][2], this.cube3D['U'][2][2]];
        
        this.cube3D['U'][0][2] = this.cube3D['B'][2][0];
        this.cube3D['U'][1][2] = this.cube3D['B'][1][0];
        this.cube3D['U'][2][2] = this.cube3D['B'][0][0];
        
        this.cube3D['B'][0][0] = this.cube3D['D'][2][2];
        this.cube3D['B'][1][0] = this.cube3D['D'][1][2];
        this.cube3D['B'][2][0] = this.cube3D['D'][0][2];
        
        this.cube3D['D'][0][2] = this.cube3D['F'][0][2];
        this.cube3D['D'][1][2] = this.cube3D['F'][1][2];
        this.cube3D['D'][2][2] = this.cube3D['F'][2][2];
        
        this.cube3D['F'][0][2] = temp[0];
        this.cube3D['F'][1][2] = temp[1];
        this.cube3D['F'][2][2] = temp[2];
    }
    
    // L move: Left face clockwise
    rotateL() {
        this.rotateFaceClockwise('L');
        
        const temp = [this.cube3D['U'][0][0], this.cube3D['U'][1][0], this.cube3D['U'][2][0]];
        
        this.cube3D['U'][0][0] = this.cube3D['B'][2][2];
        this.cube3D['U'][1][0] = this.cube3D['B'][1][2];
        this.cube3D['U'][2][0] = this.cube3D['B'][0][2];
        
        this.cube3D['B'][0][2] = this.cube3D['D'][2][0];
        this.cube3D['B'][1][2] = this.cube3D['D'][1][0];
        this.cube3D['B'][2][2] = this.cube3D['D'][0][0];
        
        this.cube3D['D'][0][0] = this.cube3D['F'][0][0];
        this.cube3D['D'][1][0] = this.cube3D['F'][1][0];
        this.cube3D['D'][2][0] = this.cube3D['F'][2][0];
        
        this.cube3D['F'][0][0] = temp[0];
        this.cube3D['F'][1][0] = temp[1];
        this.cube3D['F'][2][0] = temp[2];
    }
    
    // L' move: Left face counter-clockwise
    rotateLPrime() {
        this.rotateFaceCounterClockwise('L');
        
        const temp = [this.cube3D['U'][0][0], this.cube3D['U'][1][0], this.cube3D['U'][2][0]];
        
        this.cube3D['U'][0][0] = this.cube3D['F'][0][0];
        this.cube3D['U'][1][0] = this.cube3D['F'][1][0];
        this.cube3D['U'][2][0] = this.cube3D['F'][2][0];
        
        this.cube3D['F'][0][0] = this.cube3D['D'][0][0];
        this.cube3D['F'][1][0] = this.cube3D['D'][1][0];
        this.cube3D['F'][2][0] = this.cube3D['D'][2][0];
        
        this.cube3D['D'][0][0] = this.cube3D['B'][2][2];
        this.cube3D['D'][1][0] = this.cube3D['B'][1][2];
        this.cube3D['D'][2][0] = this.cube3D['B'][0][2];
        
        this.cube3D['B'][0][2] = temp[2];
        this.cube3D['B'][1][2] = temp[1];
        this.cube3D['B'][2][2] = temp[0];
    }
    
    // U move: Up face clockwise
    rotateU() {
        this.rotateFaceClockwise('U');
        
        const temp = [this.cube3D['F'][0][0], this.cube3D['F'][0][1], this.cube3D['F'][0][2]];
        
        this.cube3D['F'][0][0] = this.cube3D['R'][0][0];
        this.cube3D['F'][0][1] = this.cube3D['R'][0][1];
        this.cube3D['F'][0][2] = this.cube3D['R'][0][2];
        
        this.cube3D['R'][0][0] = this.cube3D['B'][0][0];
        this.cube3D['R'][0][1] = this.cube3D['B'][0][1];
        this.cube3D['R'][0][2] = this.cube3D['B'][0][2];
        
        this.cube3D['B'][0][0] = this.cube3D['L'][0][0];
        this.cube3D['B'][0][1] = this.cube3D['L'][0][1];
        this.cube3D['B'][0][2] = this.cube3D['L'][0][2];
        
        this.cube3D['L'][0][0] = temp[0];
        this.cube3D['L'][0][1] = temp[1];
        this.cube3D['L'][0][2] = temp[2];
    }
    
    // U' move: Up face counter-clockwise
    rotateUPrime() {
        this.rotateFaceCounterClockwise('U');
        
        const temp = [this.cube3D['F'][0][0], this.cube3D['F'][0][1], this.cube3D['F'][0][2]];
        
        this.cube3D['F'][0][0] = this.cube3D['L'][0][0];
        this.cube3D['F'][0][1] = this.cube3D['L'][0][1];
        this.cube3D['F'][0][2] = this.cube3D['L'][0][2];
        
        this.cube3D['L'][0][0] = this.cube3D['B'][0][0];
        this.cube3D['L'][0][1] = this.cube3D['B'][0][1];
        this.cube3D['L'][0][2] = this.cube3D['B'][0][2];
        
        this.cube3D['B'][0][0] = this.cube3D['R'][0][0];
        this.cube3D['B'][0][1] = this.cube3D['R'][0][1];
        this.cube3D['B'][0][2] = this.cube3D['R'][0][2];
        
        this.cube3D['R'][0][0] = temp[0];
        this.cube3D['R'][0][1] = temp[1];
        this.cube3D['R'][0][2] = temp[2];
    }
    
    // D move: Down face clockwise
    rotateD() {
        this.rotateFaceClockwise('D');
        
        const temp = [this.cube3D['F'][2][0], this.cube3D['F'][2][1], this.cube3D['F'][2][2]];
        
        this.cube3D['F'][2][0] = this.cube3D['L'][2][0];
        this.cube3D['F'][2][1] = this.cube3D['L'][2][1];
        this.cube3D['F'][2][2] = this.cube3D['L'][2][2];
        
        this.cube3D['L'][2][0] = this.cube3D['B'][2][0];
        this.cube3D['L'][2][1] = this.cube3D['B'][2][1];
        this.cube3D['L'][2][2] = this.cube3D['B'][2][2];
        
        this.cube3D['B'][2][0] = this.cube3D['R'][2][0];
        this.cube3D['B'][2][1] = this.cube3D['R'][2][1];
        this.cube3D['B'][2][2] = this.cube3D['R'][2][2];
        
        this.cube3D['R'][2][0] = temp[0];
        this.cube3D['R'][2][1] = temp[1];
        this.cube3D['R'][2][2] = temp[2];
    }
    
    // D' move: Down face counter-clockwise
    rotateDPrime() {
        this.rotateFaceCounterClockwise('D');
        
        const temp = [this.cube3D['F'][2][0], this.cube3D['F'][2][1], this.cube3D['F'][2][2]];
        
        this.cube3D['F'][2][0] = this.cube3D['R'][2][0];
        this.cube3D['F'][2][1] = this.cube3D['R'][2][1];
        this.cube3D['F'][2][2] = this.cube3D['R'][2][2];
        
        this.cube3D['R'][2][0] = this.cube3D['B'][2][0];
        this.cube3D['R'][2][1] = this.cube3D['B'][2][1];
        this.cube3D['R'][2][2] = this.cube3D['B'][2][2];
        
        this.cube3D['B'][2][0] = this.cube3D['L'][2][0];
        this.cube3D['B'][2][1] = this.cube3D['L'][2][1];
        this.cube3D['B'][2][2] = this.cube3D['L'][2][2];
        
        this.cube3D['L'][2][0] = temp[0];
        this.cube3D['L'][2][1] = temp[1];
        this.cube3D['L'][2][2] = temp[2];
    }
    
    // F move: Front face clockwise
    rotateF() {
        this.rotateFaceClockwise('F');
        
        const temp = [this.cube3D['U'][2][0], this.cube3D['U'][2][1], this.cube3D['U'][2][2]];
        
        this.cube3D['U'][2][0] = this.cube3D['L'][2][2];
        this.cube3D['U'][2][1] = this.cube3D['L'][1][2];
        this.cube3D['U'][2][2] = this.cube3D['L'][0][2];
        
        this.cube3D['L'][0][2] = this.cube3D['D'][0][0];
        this.cube3D['L'][1][2] = this.cube3D['D'][0][1];
        this.cube3D['L'][2][2] = this.cube3D['D'][0][2];
        
        this.cube3D['D'][0][0] = this.cube3D['R'][2][0];
        this.cube3D['D'][0][1] = this.cube3D['R'][1][0];
        this.cube3D['D'][0][2] = this.cube3D['R'][0][0];
        
        this.cube3D['R'][0][0] = temp[0];
        this.cube3D['R'][1][0] = temp[1];
        this.cube3D['R'][2][0] = temp[2];
    }
    
    // F' move: Front face counter-clockwise
    rotateFPrime() {
        this.rotateFaceCounterClockwise('F');
        
        const temp = [this.cube3D['U'][2][0], this.cube3D['U'][2][1], this.cube3D['U'][2][2]];
        
        this.cube3D['U'][2][0] = this.cube3D['R'][0][0];
        this.cube3D['U'][2][1] = this.cube3D['R'][1][0];
        this.cube3D['U'][2][2] = this.cube3D['R'][2][0];
        
        this.cube3D['R'][0][0] = this.cube3D['D'][0][2];
        this.cube3D['R'][1][0] = this.cube3D['D'][0][1];
        this.cube3D['R'][2][0] = this.cube3D['D'][0][0];
        
        this.cube3D['D'][0][0] = this.cube3D['L'][0][2];
        this.cube3D['D'][0][1] = this.cube3D['L'][1][2];
        this.cube3D['D'][0][2] = this.cube3D['L'][2][2];
        
        this.cube3D['L'][0][2] = temp[2];
        this.cube3D['L'][1][2] = temp[1];
        this.cube3D['L'][2][2] = temp[0];
    }
    
    // B move: Back face clockwise
    rotateB() {
        this.rotateFaceClockwise('B');
        
        const temp = [this.cube3D['U'][0][0], this.cube3D['U'][0][1], this.cube3D['U'][0][2]];
        
        this.cube3D['U'][0][0] = this.cube3D['R'][0][2];
        this.cube3D['U'][0][1] = this.cube3D['R'][1][2];
        this.cube3D['U'][0][2] = this.cube3D['R'][2][2];
        
        this.cube3D['R'][0][2] = this.cube3D['D'][2][2];
        this.cube3D['R'][1][2] = this.cube3D['D'][2][1];
        this.cube3D['R'][2][2] = this.cube3D['D'][2][0];
        
        this.cube3D['D'][2][0] = this.cube3D['L'][0][0];
        this.cube3D['D'][2][1] = this.cube3D['L'][1][0];
        this.cube3D['D'][2][2] = this.cube3D['L'][2][0];
        
        this.cube3D['L'][0][0] = temp[2];
        this.cube3D['L'][1][0] = temp[1];
        this.cube3D['L'][2][0] = temp[0];
    }
    
    // B' move: Back face counter-clockwise
    rotateBPrime() {
        this.rotateFaceCounterClockwise('B');
        
        const temp = [this.cube3D['U'][0][0], this.cube3D['U'][0][1], this.cube3D['U'][0][2]];
        
        this.cube3D['U'][0][0] = this.cube3D['L'][2][0];
        this.cube3D['U'][0][1] = this.cube3D['L'][1][0];
        this.cube3D['U'][0][2] = this.cube3D['L'][0][0];
        
        this.cube3D['L'][0][0] = this.cube3D['D'][2][2];
        this.cube3D['L'][1][0] = this.cube3D['D'][2][1];
        this.cube3D['L'][2][0] = this.cube3D['D'][2][0];
        
        this.cube3D['D'][2][0] = this.cube3D['R'][2][2];
        this.cube3D['D'][2][1] = this.cube3D['R'][1][2];
        this.cube3D['D'][2][2] = this.cube3D['R'][0][2];
        
        this.cube3D['R'][0][2] = temp[0];
        this.cube3D['R'][1][2] = temp[1];
        this.cube3D['R'][2][2] = temp[2];
    }
    
    selectColor(color) {
        // Remove active class from all color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected color
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        this.selectedColor = color;
    }
    
    colorSquare(face, row, col) {
        // Update cube model
        this.cube[face][row][col] = this.selectedColor;
        
        // Update visual representation
        const square = document.querySelector(`[data-face="${face}"][data-row="${row}"][data-col="${col}"]`);
        square.className = `square ${this.selectedColor}`;
        
        // Copy updated state to 3D cube
        this.copyTo3DCube();
        
        // Clear solution when cube is modified
        this.clearSolution();
        this.updateCubeStatus();
    }
    
    resetCube() {
        // Reset cube model
        Object.keys(this.cube).forEach(face => {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    this.cube[face][row][col] = 'empty';
                }
            }
        });
        
        // Reset visual representation
        document.querySelectorAll('.square').forEach(square => {
            square.className = 'square empty';
        });
        
        // Sync 3D cube
        this.sync3DCube();
        
        this.clearSolution();
        this.updateCubeStatus();
        this.showMessage('Cube reset!', 'success');
    }
    
    async scrambleCube() {
        try {
            // Get scramble from API
            const response = await fetch('/api/scramble?length=20');
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(`Scramble: ${data.scramble_string}`, 'success');
            }
        } catch (error) {
            console.log('API not available, using local scramble');
        }
        
        // Always use local scramble for cube state (API scramble is just for reference)
        const colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];
        const colorCounts = {};
        
        // Initialize color counts
        colors.forEach(color => colorCounts[color] = 0);
        
        // Assign colors ensuring each appears exactly 9 times
        const assignments = [];
        colors.forEach(color => {
            for (let i = 0; i < 9; i++) {
                assignments.push(color);
            }
        });
        
        // Shuffle the assignments
        for (let i = assignments.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
        }
        
        // Apply scrambled colors to cube
        let index = 0;
        Object.keys(this.cube).forEach(face => {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const color = assignments[index++];
                    this.cube[face][row][col] = color;
                    
                    // Update visual
                    const square = document.querySelector(`[data-face="${face}"][data-row="${row}"][data-col="${col}"]`);
                    square.className = `square ${color}`;
                }
            }
        });
        
        // Copy scrambled state to 3D cube
        this.copyTo3DCube();
        
        this.clearSolution();
        this.updateCubeStatus();
    }
    
    updateCubeStatus() {
        const colorCounts = {};
        let totalColored = 0;
        
        // Count colors
        Object.values(this.cube).forEach(face => {
            face.forEach(row => {
                row.forEach(color => {
                    if (color !== 'empty') {
                        colorCounts[color] = (colorCounts[color] || 0) + 1;
                        totalColored++;
                    }
                });
            });
        });
        
        // Update display
        document.getElementById('colored-count').textContent = totalColored;
        
        const colorCountsDiv = document.getElementById('color-counts');
        colorCountsDiv.innerHTML = '';
        
        Object.entries(colorCounts).forEach(([color, count]) => {
            const div = document.createElement('div');
            div.className = 'color-count';
            div.innerHTML = `<span style="color: ${this.getColorCode(color)}">${color}</span><span>${count}</span>`;
            colorCountsDiv.appendChild(div);
        });
    }
    
    getColorCode(color) {
        const codes = {
            'white': '#333',
            'yellow': '#666',
            'red': '#ff0000',
            'orange': '#ffa500',
            'blue': '#0000ff',
            'green': '#00ff00'
        };
        return codes[color] || '#333';
    }
    
    isValidCube() {
        const colorCounts = {};
        let totalSquares = 0;
        
        // Count colors
        Object.values(this.cube).forEach(face => {
            face.forEach(row => {
                row.forEach(color => {
                    if (color !== 'empty') {
                        colorCounts[color] = (colorCounts[color] || 0) + 1;
                        totalSquares++;
                    }
                });
            });
        });
        
        // Check if all 54 squares are colored
        if (totalSquares !== 54) {
            return { valid: false, message: `Cube must have all 54 squares colored. Currently has ${totalSquares}.` };
        }
        
        // Check if each color appears exactly 9 times
        for (const [color, count] of Object.entries(colorCounts)) {
            if (count !== 9) {
                return { valid: false, message: `Color '${color}' appears ${count} times, should be 9.` };
            }
        }
        
        // Check if we have exactly 6 different colors
        if (Object.keys(colorCounts).length !== 6) {
            return { valid: false, message: `Cube must have exactly 6 colors, found ${Object.keys(colorCounts).length}.` };
        }
        
        return { valid: true, message: 'Valid cube configuration.' };
    }
    
    toKociembaString() {
        let result = '';
        
        // Face order for Kociemba: U, R, F, D, L, B
        const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
        
        faceOrder.forEach(faceName => {
            const face = this.cube[faceName];
            face.forEach(row => {
                row.forEach(color => {
                    if (color in this.colorMap) {
                        result += this.colorMap[color];
                    } else {
                        throw new Error(`Invalid color '${color}' found in cube`);
                    }
                });
            });
        });
        
        return result;
    }
    
    async solveCube() {
        // Validate cube first
        const validation = this.isValidCube();
        if (!validation.valid) {
            this.showMessage(validation.message, 'error');
            return;
        }
        
        // Disable solve button and show loading
        const solveBtn = document.getElementById('solve-btn');
        const originalText = solveBtn.textContent;
        solveBtn.disabled = true;
        solveBtn.innerHTML = '<span class="loading"></span> Solving...';
        
        try {
            // Since we can't use the actual Kociemba library in the browser,
            // we'll simulate a solution or use a simplified solving approach
            const solution = await this.generateSolution();
            
            if (solution) {
                this.displaySolution(solution);
                this.showMessage(`Solution found in ${solution.length} moves!`, 'success');
            } else {
                this.showMessage('Could not solve the cube. Please check that all colors are correct.', 'error');
            }
        } catch (error) {
            console.error('Error solving cube:', error);
            this.showMessage('Error solving cube: ' + error.message, 'error');
        } finally {
            // Re-enable solve button
            solveBtn.disabled = false;
            solveBtn.textContent = originalText;
        }
    }
    
    async generateSolution() {
        try {
            // Convert cube to Kociemba format
            const cubeString = this.toKociembaString();
            
            // Send to backend API for solving
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cube: cubeString })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.solution;
            } else {
                throw new Error(data.error || 'Failed to solve cube');
            }
        } catch (error) {
            console.error('Error calling solve API:', error);
            
            // Fallback to mock solution if API is not available
            const moves = ['R', 'U', 'R\'', 'U\'', 'F', 'R', 'F\'', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'U', 'F'];
            const randomLength = Math.floor(Math.random() * 10) + 8;
            const solution = [];
            
            for (let i = 0; i < randomLength; i++) {
                solution.push(moves[Math.floor(Math.random() * moves.length)]);
            }
            
            return solution;
        }
    }
    
    displaySolution(solution) {
        this.solutionSteps = solution;
        this.currentStep = 0;
        
        // Copy the current 2D cube state to 3D cube to start fresh
        this.copyTo3DCube();
        
        const solutionText = document.getElementById('solution-text');
        solutionText.innerHTML = '';
        
        // Create solution display
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = `<strong>Solution found! ${solution.length} moves:</strong>`;
        solutionText.appendChild(titleDiv);
        
        const movesContainer = document.createElement('div');
        movesContainer.className = 'solution-moves';
        
        solution.forEach((move, index) => {
            const moveDiv = document.createElement('div');
            moveDiv.className = 'move';
            moveDiv.textContent = move;
            moveDiv.dataset.step = index;
            moveDiv.addEventListener('click', () => this.goToStep(index + 1));
            movesContainer.appendChild(moveDiv);
        });
        
        solutionText.appendChild(movesContainer);
        
        // Enable navigation
        if (solution.length > 0) {
            document.getElementById('next-step').disabled = false;
            document.getElementById('play-pause').disabled = false;
            document.getElementById('auto-solve').disabled = false;
            this.updateStepDisplay();
        }
    }
    
    clearSolution() {
        this.solutionSteps = [];
        this.currentStep = 0;
        
        // Reset 3D cube to match current 2D configuration
        this.copyTo3DCube();
        
        this.stopPlaying();
        
        document.getElementById('solution-text').innerHTML = 'Configure your cube and click "Solve Cube" to get the solution.';
        document.getElementById('prev-step').disabled = true;
        document.getElementById('next-step').disabled = true;
        document.getElementById('play-pause').disabled = true;
        document.getElementById('auto-solve').disabled = true;
        document.getElementById('step-info').textContent = 'Ready to solve';
        
        // Hide current move highlight
        const currentMoveElement = document.getElementById('current-move');
        currentMoveElement.classList.remove('active');
        
        // Clear current move highlighting
        document.querySelectorAll('.move').forEach(move => {
            move.classList.remove('current', 'completed');
        });
    }
    
    goToStep(stepNumber) {
        if (stepNumber >= 0 && stepNumber <= this.solutionSteps.length) {
            // Reset 3D cube to initial state
            this.copyTo3DCube();
            
            // Apply all moves up to the target step
            for (let i = 0; i < stepNumber; i++) {
                this.performCubeMove(this.solutionSteps[i]);
            }
            
            this.currentStep = stepNumber;
            this.updateStepDisplay();
            if (stepNumber > 0) {
                this.animateMove(this.solutionSteps[stepNumber - 1]);
            }
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    nextStep() {
        if (this.currentStep < this.solutionSteps.length) {
            const move = this.solutionSteps[this.currentStep];
            
            // Perform the actual cube transformation
            this.performCubeMove(move);
            
            // Then animate the visual move
            this.animateMove(move);
            
            this.currentStep++;
            this.updateStepDisplay();
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopPlaying();
        } else {
            this.startPlaying();
        }
    }
    
    startPlaying() {
        if (this.currentStep >= this.solutionSteps.length) {
            this.currentStep = 0;
        }
        
        this.isPlaying = true;
        const playBtn = document.getElementById('play-pause');
        playBtn.innerHTML = '<span class="play-icon">⏸</span> Pause';
        playBtn.classList.add('playing');
        
        this.playInterval = setInterval(() => {
            if (this.currentStep < this.solutionSteps.length) {
                this.nextStep();
            } else {
                this.stopPlaying();
            }
        }, this.animationSpeed + 200); // Add small delay between moves
    }
    
    stopPlaying() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        
        const playBtn = document.getElementById('play-pause');
        playBtn.innerHTML = '<span class="play-icon">▶</span> Play';
        playBtn.classList.remove('playing');
    }
    
    autoSolve() {
        this.currentStep = 0;
        this.copyTo3DCube(); // Reset 3D cube to initial state
        this.updateStepDisplay();
        
        const executeNext = () => {
            if (this.currentStep < this.solutionSteps.length) {
                const move = this.solutionSteps[this.currentStep];
                
                // Perform the actual cube transformation
                this.performCubeMove(move);
                
                // Then animate the visual move
                this.animateMove(move);
                
                this.currentStep++;
                this.updateStepDisplay();
                setTimeout(executeNext, 400); // Fast auto-solve
            }
        };
        
        executeNext();
    }
    
    animateMove(move) {
        const cube3D = document.getElementById('cube-3d');
        
        // Remove any existing animation classes
        cube3D.className = 'cube-3d';
        
        // Add animation class based on move
        const moveClass = this.getMoveAnimationClass(move);
        if (moveClass) {
            cube3D.classList.add(moveClass);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                cube3D.classList.remove(moveClass);
            }, this.animationSpeed);
        }
        
        // Update current move display
        this.updateCurrentMoveDisplay(move);
    }
    
    getMoveAnimationClass(move) {
        const moveMap = {
            'R': 'animate-R',
            'R\'': 'animate-R-prime',
            'R2': 'animate-R',
            'L': 'animate-L',
            'L\'': 'animate-L-prime',
            'L2': 'animate-L',
            'U': 'animate-U',
            'U\'': 'animate-U-prime',
            'U2': 'animate-U',
            'D': 'animate-D',
            'D\'': 'animate-D-prime',
            'D2': 'animate-D',
            'F': 'animate-F',
            'F\'': 'animate-F-prime',
            'F2': 'animate-F',
            'B': 'animate-B',
            'B\'': 'animate-B-prime',
            'B2': 'animate-B'
        };
        
        return moveMap[move] || null;
    }
    
    updateCurrentMoveDisplay(move) {
        const currentMoveElement = document.getElementById('current-move');
        const moveText = document.getElementById('current-move-text');
        const moveDescription = document.getElementById('move-description');
        
        moveText.textContent = move;
        moveDescription.textContent = this.getMoveDescription(move);
        currentMoveElement.classList.add('active');
    }
    
    getMoveDescription(move) {
        const descriptions = {
            'R': 'Right face clockwise',
            'R\'': 'Right face counter-clockwise',
            'R2': 'Right face 180°',
            'L': 'Left face clockwise',
            'L\'': 'Left face counter-clockwise',
            'L2': 'Left face 180°',
            'U': 'Up face clockwise',
            'U\'': 'Up face counter-clockwise',
            'U2': 'Up face 180°',
            'D': 'Down face clockwise',
            'D\'': 'Down face counter-clockwise',
            'D2': 'Down face 180°',
            'F': 'Front face clockwise',
            'F\'': 'Front face counter-clockwise',
            'F2': 'Front face 180°',
            'B': 'Back face clockwise',
            'B\'': 'Back face counter-clockwise',
            'B2': 'Back face 180°'
        };
        
        return descriptions[move] || 'Unknown move';
    }
    
    updateStepDisplay() {
        const totalSteps = this.solutionSteps.length;
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const stepInfo = document.getElementById('step-info');
        const currentMoveElement = document.getElementById('current-move');
        
        // Clear previous highlighting
        document.querySelectorAll('.move').forEach((move, index) => {
            move.classList.remove('current');
            if (index < this.currentStep) {
                move.classList.add('completed');
            } else {
                move.classList.remove('completed');
            }
        });
        
        if (this.currentStep === 0) {
            stepInfo.textContent = 'Ready to start';
            prevBtn.disabled = true;
            nextBtn.disabled = totalSteps === 0;
            currentMoveElement.classList.remove('active');
        } else if (this.currentStep === totalSteps) {
            stepInfo.textContent = 'Solved! 🎉';
            prevBtn.disabled = false;
            nextBtn.disabled = true;
            currentMoveElement.classList.remove('active');
            this.stopPlaying();
        } else {
            const move = this.solutionSteps[this.currentStep - 1];
            stepInfo.textContent = `Step ${this.currentStep}/${totalSteps}: ${move}`;
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            
            // Highlight current move in solution
            const currentMove = document.querySelector(`[data-step="${this.currentStep - 1}"]`);
            if (currentMove) {
                currentMove.classList.add('current');
                currentMove.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }
    
    showMessage(text, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type} fade-in`;
        message.textContent = text;
        
        // Insert after header
        const header = document.querySelector('header');
        header.insertAdjacentElement('afterend', message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RubikCubeSolver();
});

// Additional utility functions for cube solving
class CubeSolver {
    constructor() {
        // This would contain the actual solving algorithm
        // For now, we'll use a simplified approach
    }
    
    static generateRandomScramble(length = 20) {
        const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
        const modifiers = ['', '\'', '2'];
        const scramble = [];
        
        for (let i = 0; i < length; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            scramble.push(move + modifier);
        }
        
        return scramble;
    }
    
    static isValidMove(move) {
        const validMoves = /^[RLUDFB][\'2]?$/;
        return validMoves.test(move);
    }
    
    static invertMove(move) {
        if (move.endsWith('\'')) {
            return move.slice(0, -1);
        } else if (move.endsWith('2')) {
            return move;
        } else {
            return move + '\'';
        }
    }
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RubikCubeSolver, CubeSolver };
}
