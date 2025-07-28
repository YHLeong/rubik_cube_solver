# Rubik's Cube Solver 3x3x3

A web-based Rubik's Cube solver with an intuitive HTML/CSS/JavaScript interface and Python backend. This solver uses the powerful Kociemba algorithm to find optimal solutions and provides an interactive interface for inputting cube configurations and viewing step-by-step solutions.

## Features

- **Modern Web Interface**: Responsive HTML/CSS design with JavaScript interactivity
- **Visual Cube Layout**: Cross-formation display showing all six faces (Up, Down, Front, Back, Left, Right)
- **Color Palette**: Click-to-paint system for inputting your cube's current state
- **Real-time Validation**: Live feedback on cube configuration and color counts
- **Optimal Solving**: Uses the Kociemba algorithm via Python backend for fast, efficient solutions
- **Step-by-Step Navigation**: Browse through solution moves with visual highlighting
- **Scramble Function**: Generate random valid cube configurations
- **Responsive Design**: Works on desktop and mobile devices
- **API Backend**: RESTful API for cube solving and validation

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask with Kociemba algorithm
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **API**: RESTful endpoints for solving, validation, and scrambling

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YHLeong/rubik_cube_solver.git
   cd rubik_cube_solver
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   # source .venv/bin/activate  # On macOS/Linux
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Quick Start (Windows)
Simply double-click `start_server.bat` to install dependencies and start the server automatically.

### Manual Start
1. **Start the backend server**:
   ```bash
   python server.py
   ```

2. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```

### How to Use the Interface:

1. **Input Your Cube**:
   - Select a color from the color palette on the right
   - Click on the cube squares to paint them with the selected color
   - The interface shows your progress (colored squares out of 54)
   - Color all 54 squares ensuring 9 squares of each of the 6 colors

2. **Solve Your Cube**:
   - Click "Solve Cube" to generate the solution
   - The solution steps will appear with move count
   - Each move is displayed in standard Rubik's Cube notation

3. **Navigate Solution**:
   - Use "Previous" and "Next" buttons to step through the solution
   - Current move is highlighted and automatically scrolled into view
   - Step counter shows your progress through the solution

4. **Additional Features**:
   - **Reset Cube**: Clear all colors and start over
   - **Scramble**: Generate a random valid cube configuration
   - **Real-time Status**: See color counts and validation status

## API Endpoints

The backend provides several REST API endpoints:

- `POST /api/solve` - Solve a cube configuration
- `POST /api/validate` - Validate a cube configuration  
- `GET /api/scramble` - Generate a random scramble
- `GET /api/status` - Check API status

## Cube Notation

The solver uses standard Rubik's Cube notation:
- **F** (Front), **B** (Back), **R** (Right), **L** (Left), **U** (Up), **D** (Down)
- **'** means counter-clockwise (e.g., R')
- **2** means 180-degree turn (e.g., F2)

## Color Mapping

- **White**: Up face (U)
- **Yellow**: Down face (D)
- **Blue**: Front face (F)
- **Green**: Back face (B)
- **Red**: Right face (R)
- **Orange**: Left face (L)

## Files Structure

```
rubik_cube_solver/
├── index.html          # Main web interface
├── style.css           # Styling and responsive design
├── script.js           # Frontend JavaScript logic
├── server.py           # Flask backend API
├── start_server.bat    # Windows startup script
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Requirements

- Python 3.7+
- Flask 2.0+
- kociemba (Rubik's Cube solving library)
- flask-cors (for API access)
- Modern web browser with JavaScript enabled

## Dependencies

This project uses the following main libraries:

**Backend:**
- **Flask**: Web framework for the API server
- **kociemba**: Implements the two-phase algorithm for solving Rubik's Cubes
- **flask-cors**: Enables cross-origin requests

**Frontend:**
- **Vanilla JavaScript**: No external frameworks required
- **Modern CSS**: Flexbox, Grid, and CSS animations
- **Responsive Design**: Works on all screen sizes

## Algorithm

The solver uses the **Kociemba algorithm** (also known as the two-phase algorithm):

1. **Phase 1**: Reduce the cube to a subgroup where only specific moves are allowed
2. **Phase 2**: Solve the cube using only those allowed moves

This algorithm guarantees solutions in 20 moves or fewer, typically finding solutions in 15-18 moves.

## Browser Compatibility

- Chrome 60+ ✅
- Firefox 55+ ✅  
- Safari 12+ ✅
- Edge 79+ ✅
- Mobile browsers ✅

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Herbert Kociemba** for the two-phase algorithm
- **Grubiks** for inspiration from their online solver interface
- The Rubik's Cube community for algorithms and notation standards
- **Flask** team for the excellent web framework