#!/usr/bin/env python3
"""
Test script for the Layer-by-Layer Rubik's Cube solver
"""

from rubik_solver import LayerByLayerSolver
import copy

def create_test_cube():
    """Create a simple test cube configuration."""
    return {
        'U': [['yellow'] * 3 for _ in range(3)],  # Top - yellow
        'D': [['white'] * 3 for _ in range(3)],   # Bottom - white  
        'F': [['blue'] * 3 for _ in range(3)],    # Front - blue
        'B': [['green'] * 3 for _ in range(3)],   # Back - green
        'L': [['orange'] * 3 for _ in range(3)],  # Left - orange
        'R': [['red'] * 3 for _ in range(3)]      # Right - red
    }

def scramble_cube(cube):
    """Apply some scrambling moves to test the solver."""
    solver = LayerByLayerSolver(copy.deepcopy(cube))
    
    # Apply some scrambling moves
    scramble_moves = ["R", "U", "R'", "U'", "F", "R", "F'", "U"]
    
    for move in scramble_moves:
        if move in solver.rotations:
            solver.rotations[move]()
    
    return solver.cube

def test_layer_solver():
    """Test the layer-by-layer solver."""
    print("Testing Layer-by-Layer Rubik's Cube Solver")
    print("=" * 50)
    
    # Create test cube
    original_cube = create_test_cube()
    print("Created test cube with standard colors")
    
    # Scramble the cube
    scrambled_cube = scramble_cube(original_cube)
    print("Applied scrambling moves: R U R' U' F R F' U")
    
    # Create solver and solve
    solver = LayerByLayerSolver(copy.deepcopy(scrambled_cube))
    solution_moves = solver.solve()
    
    print(f"\nSolver completed with {len(solution_moves)} moves:")
    print("Solution moves:", " ".join(solution_moves))
    
    # Test individual rotations
    print("\nTesting individual rotations:")
    test_cube = create_test_cube()
    test_solver = LayerByLayerSolver(test_cube)
    
    # Test R move
    print("Testing R move...")
    test_solver.rotate_right()
    print("R move applied successfully")
    
    # Test U move  
    print("Testing U move...")
    test_solver.rotate_up()
    print("U move applied successfully")
    
    print("\nLayer-by-Layer solver implementation completed!")
    print("The solver implements the beginner's method with 7 stages:")
    print("1. White Cross")
    print("2. White Corners") 
    print("3. Middle Layer")
    print("4. Yellow Cross")
    print("5. Yellow Edges")
    print("6. Yellow Corners Position")
    print("7. Yellow Corners Orient")

if __name__ == "__main__":
    test_layer_solver()
