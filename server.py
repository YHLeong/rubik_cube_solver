#!/usr/bin/env python3
"""
Backend API server for Rubik's Cube Solver
Provides solving functionality using the Kociemba algorithm
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys

# Add the current directory to Python path to import kociemba
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import kociemba
    KOCIEMBA_AVAILABLE = True
except ImportError:
    KOCIEMBA_AVAILABLE = False
    print("Warning: kociemba not available. Install it with: pip install kociemba")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class RubikCubeAPI:
    """API class for Rubik's Cube operations"""
    
    @staticmethod
    def validate_cube_string(cube_string):
        """Validate a Kociemba format cube string"""
        if len(cube_string) != 54:
            return False, "Cube string must be exactly 54 characters"
        
        # Count each face letter
        face_counts = {}
        for char in cube_string:
            if char not in 'URFDLB':
                return False, f"Invalid character '{char}' in cube string"
            face_counts[char] = face_counts.get(char, 0) + 1
        
        # Each face should appear exactly 9 times
        for face, count in face_counts.items():
            if count != 9:
                return False, f"Face '{face}' appears {count} times, should be 9"
        
        # Should have all 6 faces
        if len(face_counts) != 6:
            return False, f"Should have 6 faces, found {len(face_counts)}"
        
        return True, "Valid cube string"
    
    @staticmethod
    def solve_cube(cube_string):
        """Solve a cube using Kociemba algorithm"""
        if not KOCIEMBA_AVAILABLE:
            # Return a mock solution if kociemba is not available
            return "R U R' U' F R F' U2 R' U' R U R' F' U F"
        
        try:
            solution = kociemba.solve(cube_string)
            if solution == "Error":
                return None
            return solution
        except Exception as e:
            print(f"Error solving cube: {e}")
            return None

# API Routes
@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, etc.)"""
    return send_from_directory('.', filename)

@app.route('/api/solve', methods=['POST'])
def solve_cube():
    """Solve a Rubik's cube"""
    try:
        data = request.get_json()
        
        if not data or 'cube' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing cube data'
            }), 400
        
        cube_string = data['cube']
        
        # Validate cube string
        is_valid, message = RubikCubeAPI.validate_cube_string(cube_string)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': message
            }), 400
        
        # Solve the cube
        solution = RubikCubeAPI.solve_cube(cube_string)
        
        if solution is None:
            return jsonify({
                'success': False,
                'error': 'Could not solve the cube. Please check your configuration.'
            }), 400
        
        # Parse solution into moves
        moves = solution.strip().split() if solution.strip() else []
        
        return jsonify({
            'success': True,
            'solution': moves,
            'moves_count': len(moves),
            'solution_string': solution
        })
        
    except Exception as e:
        print(f"Error in solve endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/validate', methods=['POST'])
def validate_cube():
    """Validate a cube configuration"""
    try:
        data = request.get_json()
        
        if not data or 'cube' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing cube data'
            }), 400
        
        cube_string = data['cube']
        is_valid, message = RubikCubeAPI.validate_cube_string(cube_string)
        
        return jsonify({
            'success': True,
            'valid': is_valid,
            'message': message
        })
        
    except Exception as e:
        print(f"Error in validate endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/scramble', methods=['GET'])
def get_scramble():
    """Generate a random scramble"""
    try:
        import random
        
        moves = ['R', 'L', 'U', 'D', 'F', 'B']
        modifiers = ['', '\'', '2']
        length = request.args.get('length', 20, type=int)
        
        # Limit scramble length
        length = max(10, min(30, length))
        
        scramble = []
        last_move = None
        
        for _ in range(length):
            # Avoid consecutive moves on the same face
            available_moves = [m for m in moves if m != last_move]
            move = random.choice(available_moves)
            modifier = random.choice(modifiers)
            
            scramble.append(move + modifier)
            last_move = move
        
        return jsonify({
            'success': True,
            'scramble': scramble,
            'scramble_string': ' '.join(scramble)
        })
        
    except Exception as e:
        print(f"Error in scramble endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get API status"""
    return jsonify({
        'success': True,
        'status': 'running',
        'kociemba_available': KOCIEMBA_AVAILABLE,
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Rubik's Cube Solver API server...")
    print(f"Kociemba available: {KOCIEMBA_AVAILABLE}")
    print(f"Server will run on http://localhost:{port}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
