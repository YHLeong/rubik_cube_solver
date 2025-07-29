# Rubik's Cube Solver 3x3x3

A comprehensive Rubik's Cube solver with multiple solving algorithms and both desktop GUI and web interfaces.

## Features

### Multiple Solving Methods
- **Kociemba Algorithm**: Fast optimal solutions (requires `kociemba` package)
- **Layer-by-Layer Method**: Step-by-step beginner's approach based on GeeksforGeeks algorithm

### Multiple Interfaces
- **Desktop GUI**: Tkinter-based application with interactive cube configuration
- **Web Interface**: HTML/CSS/JavaScript with 3D animated cube visualization
- **3D Visualization**: Real-time cube state representation with animated moves

## Solving Algorithms

### 1. Kociemba Algorithm (Optimal)
- Produces optimal solutions (typically 20 moves or less)
- Uses advanced group theory and mathematical algorithms
- Requires the `kociemba` Python package

### 2. Layer-by-Layer Method (Beginner's)
Based on the [GeeksforGeeks algorithm](https://www.geeksforgeeks.org/blogs/algorithm-to-solve-rubiks-cube/):

**7-Step Process:**
1. **White Cross** - Create white cross on bottom layer
2. **White Corners** - Complete white layer using `R U R' U'`
3. **Middle Layer** - Position middle edges using:
   - Right: `U R U' R' U' F' U F`
   - Left: `U' L' U L U F U' F'`
4. **Yellow Cross** - Create yellow cross using `F R U R' U' F'`
5. **Yellow Edges** - Orient last layer edges using `F R U R' U' F'`
6. **Position Corners** - Position yellow corners using `U R U' L' U R' U' L`
7. **Orient Corners** - Orient final corners using `U R' U' R`

## Desktop GUI Usage

### Installation
```bash
pip install kociemba  # For Kociemba algorithm support
```

### Running the Application
```bash
python rubik_solver.py
```

### Instructions
1. Select a color from the palette
2. Click cube squares to paint them with selected color
3. Color all 54 squares (9 of each color: white, yellow, red, orange, blue, green)
4. Choose solving method:
   - **"Solve Cube (Kociemba)"** - Fast optimal solution
   - **"Solve Cube (Layer Method)"** - Step-by-step beginner approach
5. Use navigation buttons to step through the solution

## Web Interface Usage

### Starting the Server
```bash
python server.py
```

### Accessing the Interface
Open your browser and navigate to: `http://localhost:5000`

### Features
- 2D cube configuration interface
- 3D animated cube visualization
- Step-by-step solution execution
- Real-time cube state tracking
- Play/pause controls with speed adjustment
- Auto-solve functionality

### Sharing Your Solver
- **Local Network**: Use your computer's IP address (e.g., `http://192.168.1.100:5000`)
- **Online Hosting**: Deploy to platforms like Heroku, Railway, or Vercel
- **Standalone Files**: The web interface works with just the HTML/CSS/JS files

## Implementation Details

### Layer-by-Layer Algorithm
The implementation follows the exact steps from the GeeksforGeeks reference:

```python
# Key algorithms used:
CORNER_ALGORITHM = "R U R' U'"           # Position white corners
RIGHT_HAND = "U R U' R' U' F' U F"       # Middle layer right
LEFT_HAND = "U' L' U L U F U' F'"        # Middle layer left  
YELLOW_CROSS = "F R U R' U' F'"          # Create yellow cross
CORNER_POSITION = "U R U' L' U R' U' L"  # Position last corners
CORNER_ORIENT = "U R' U' R"              # Orient last corners
```

### Cube Notation
Standard Rubik's cube notation is used:
- **R, L** - Right, Left face rotations
- **U, D** - Up, Down face rotations  
- **F, B** - Front, Back face rotations
- **'** - Counter-clockwise rotation (e.g., R')
- **2** - Double rotation (e.g., R2)

## File Structure

```
rubik_cube_solver/
├── rubik_solver.py              # Desktop GUI application
├── server.py                    # Flask web server
├── index.html                   # Web interface
├── style.css                    # Web styling and 3D animations
├── script.js                    # Web JavaScript logic
├── standalone_layer_solver.py   # Standalone layer solver
├── requirements.txt             # Python dependencies
├── start_server.bat            # Windows server launcher
└── README.md                   # This file
```

## Dependencies

### Required
- Python 3.6+
- Flask (for web interface)

### Optional
- `kociemba` - For optimal solving algorithm
- `numpy` - For advanced cube operations

### Installation
```bash
pip install -r requirements.txt
```

## Algorithm Comparison

| Method | Pros | Cons | Typical Moves |
|--------|------|------|---------------|
| **Kociemba** | Optimal solutions, Fast | Complex, Requires package | 15-25 moves |
| **Layer-by-Layer** | Educational, No dependencies | Longer solutions | 50-100 moves |

## Educational Value

The layer-by-layer implementation serves as an excellent educational tool for:
- Understanding Rubik's cube mechanics
- Learning basic solving algorithms
- Studying algorithmic problem solving
- Implementing mathematical transformations

## Testing the Layer-by-Layer Solver

You can test the standalone layer solver:

```bash
python standalone_layer_solver.py
```

This will demonstrate:
- All 7 solving stages
- Move sequence generation
- Cube state transformations
- Algorithm implementation details

## Contributing

Feel free to contribute by:
- Adding new solving algorithms
- Improving the web interface
- Optimizing the layer-by-layer implementation
- Adding new visualization features

## References

- [GeeksforGeeks Rubik's Cube Algorithm](https://www.geeksforgeeks.org/blogs/algorithm-to-solve-rubiks-cube/)
- [Kociemba's Algorithm](http://kociemba.org/cube.htm)
- [Rubik's Cube Notation](https://ruwix.com/the-rubiks-cube/notation/)

## License

This project is open source and available under the MIT License.
