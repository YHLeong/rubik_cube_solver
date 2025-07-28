#!/usr/bin/env python3
"""
Rubik's Cube Solver with GUI
A 3x3x3 Rubik's Cube solver application with interactive graphical interface.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import numpy as np
import kociemba
from typing import Dict, List, Tuple, Optional
import threading
import time


class RubikCube:
    """Represents a 3x3x3 Rubik's Cube with solving capabilities."""
    
    # Standard color mapping for Kociemba notation
    COLOR_MAP = {
        'white': 'U',   # Up face
        'yellow': 'D',  # Down face  
        'red': 'R',     # Right face
        'orange': 'L',  # Left face
        'blue': 'F',    # Front face
        'green': 'B'    # Back face
    }
    
    # Color codes for GUI display
    COLOR_CODES = {
        'white': '#FFFFFF',
        'yellow': '#FFFF00',
        'red': '#FF0000',
        'orange': '#FFA500',
        'blue': '#0000FF',
        'green': '#00FF00',
        'empty': '#CCCCCC'
    }
    
    def __init__(self):
        self.reset_cube()
    
    def reset_cube(self):
        """Reset cube to default (all faces empty/gray)."""
        # Each face is a 3x3 grid, starting with 'empty' color
        self.faces = {
            'U': [['empty'] * 3 for _ in range(3)],  # Up (white)
            'D': [['empty'] * 3 for _ in range(3)],  # Down (yellow)
            'F': [['empty'] * 3 for _ in range(3)],  # Front (blue)
            'B': [['empty'] * 3 for _ in range(3)],  # Back (green)
            'L': [['empty'] * 3 for _ in range(3)],  # Left (orange)
            'R': [['empty'] * 3 for _ in range(3)]   # Right (red)
        }
    
    def set_face_color(self, face: str, row: int, col: int, color: str):
        """Set the color of a specific square on the cube."""
        if face in self.faces and 0 <= row <= 2 and 0 <= col <= 2:
            self.faces[face][row][col] = color
    
    def get_face_color(self, face: str, row: int, col: int) -> str:
        """Get the color of a specific square on the cube."""
        if face in self.faces and 0 <= row <= 2 and 0 <= col <= 2:
            return self.faces[face][row][col]
        return 'empty'
    
    def is_valid_cube(self) -> Tuple[bool, str]:
        """Check if the current cube configuration is valid for solving."""
        # Count colors
        color_counts = {}
        total_squares = 0
        
        for face in self.faces.values():
            for row in face:
                for color in row:
                    if color != 'empty':
                        color_counts[color] = color_counts.get(color, 0) + 1
                        total_squares += 1
        
        # Check if we have all 54 squares colored
        if total_squares != 54:
            return False, f"Cube must have all 54 squares colored. Currently has {total_squares}."
        
        # Each color should appear exactly 9 times
        for color, count in color_counts.items():
            if count != 9:
                return False, f"Color '{color}' appears {count} times, should be 9."
        
        # Check if we have exactly 6 different colors
        if len(color_counts) != 6:
            return False, f"Cube must have exactly 6 colors, found {len(color_counts)}."
        
        return True, "Valid cube configuration."
    
    def to_kociemba_string(self) -> str:
        """Convert cube state to Kociemba notation string."""
        # Kociemba expects: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
        result = ""
        
        # Face order for Kociemba: U, R, F, D, L, B
        face_order = ['U', 'R', 'F', 'D', 'L', 'B']
        
        for face_name in face_order:
            face = self.faces[face_name]
            for row in face:
                for color in row:
                    if color in self.COLOR_MAP:
                        result += self.COLOR_MAP[color]
                    else:
                        # If color not in map, this is an error
                        raise ValueError(f"Invalid color '{color}' found in cube")
        
        return result
    
    def solve(self) -> Optional[str]:
        """Solve the cube using Kociemba algorithm."""
        try:
            # First validate the cube
            is_valid, message = self.is_valid_cube()
            if not is_valid:
                return None
            
            # Convert to Kociemba format and solve
            cube_string = self.to_kociemba_string()
            solution = kociemba.solve(cube_string)
            
            if solution == "Error":
                return None
                
            return solution
            
        except Exception as e:
            print(f"Error solving cube: {e}")
            return None


class RubikSolverGUI:
    """Main GUI application for the Rubik's Cube solver."""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Rubik's Cube Solver 3x3x3")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        # Initialize cube
        self.cube = RubikCube()
        self.selected_color = 'white'
        self.solution_steps = []
        self.current_step = 0
        
        # Store button references for each face square
        self.face_buttons = {}
        
        self.setup_gui()
        
    def setup_gui(self):
        """Set up the main GUI layout."""
        # Title
        title_label = tk.Label(
            self.root, 
            text="Rubik's Cube Solver 3x3x3", 
            font=('Arial', 18, 'bold'),
            bg='#f0f0f0'
        )
        title_label.pack(pady=10)
        
        # Main container
        main_frame = tk.Frame(self.root, bg='#f0f0f0')
        main_frame.pack(expand=True, fill='both', padx=20, pady=10)
        
        # Left panel for cube display
        left_panel = tk.Frame(main_frame, bg='#f0f0f0')
        left_panel.pack(side='left', fill='both', expand=True)
        
        # Right panel for controls
        right_panel = tk.Frame(main_frame, bg='#f0f0f0', width=300)
        right_panel.pack(side='right', fill='y', padx=(20, 0))
        right_panel.pack_propagate(False)
        
        self.setup_cube_display(left_panel)
        self.setup_controls(right_panel)
        
    def setup_cube_display(self, parent):
        """Set up the cube face display."""
        cube_frame = tk.Frame(parent, bg='#f0f0f0')
        cube_frame.pack(expand=True)
        
        # Title for cube area
        cube_title = tk.Label(
            cube_frame, 
            text="Click squares to color them", 
            font=('Arial', 12),
            bg='#f0f0f0'
        )
        cube_title.pack(pady=(0, 10))
        
        # Create cube layout in cross formation
        #     [U]
        # [L] [F] [R] [B]
        #     [D]
        
        # Top row - Up face
        top_frame = tk.Frame(cube_frame, bg='#f0f0f0')
        top_frame.pack()
        
        # Spacer for alignment
        tk.Frame(top_frame, width=120, bg='#f0f0f0').pack(side='left')
        self.create_face_grid(top_frame, 'U', 'Up')
        
        # Middle row - Left, Front, Right, Back faces
        middle_frame = tk.Frame(cube_frame, bg='#f0f0f0')
        middle_frame.pack(pady=5)
        
        self.create_face_grid(middle_frame, 'L', 'Left')
        self.create_face_grid(middle_frame, 'F', 'Front')
        self.create_face_grid(middle_frame, 'R', 'Right')
        self.create_face_grid(middle_frame, 'B', 'Back')
        
        # Bottom row - Down face
        bottom_frame = tk.Frame(cube_frame, bg='#f0f0f0')
        bottom_frame.pack(pady=5)
        
        # Spacer for alignment
        tk.Frame(bottom_frame, width=120, bg='#f0f0f0').pack(side='left')
        self.create_face_grid(bottom_frame, 'D', 'Down')
        
    def create_face_grid(self, parent, face_name: str, face_label: str):
        """Create a 3x3 grid for a cube face."""
        face_frame = tk.Frame(parent, bg='black', bd=2, relief='raised')
        face_frame.pack(side='left', padx=2)
        
        # Face label
        label = tk.Label(face_frame, text=face_label, font=('Arial', 8), bg='#f0f0f0')
        label.grid(row=0, column=0, columnspan=3, pady=2)
        
        # Store buttons for this face
        self.face_buttons[face_name] = []
        
        # Create 3x3 grid of buttons
        for row in range(3):
            button_row = []
            for col in range(3):
                btn = tk.Button(
                    face_frame,
                    width=3,
                    height=1,
                    bg=self.cube.COLOR_CODES['empty'],
                    relief='solid',
                    bd=1,
                    command=lambda f=face_name, r=row, c=col: self.color_square(f, r, c)
                )
                btn.grid(row=row+1, column=col, padx=1, pady=1)
                button_row.append(btn)
            self.face_buttons[face_name].append(button_row)
    
    def setup_controls(self, parent):
        """Set up the control panel."""
        # Color palette
        palette_frame = tk.LabelFrame(parent, text="Color Palette", font=('Arial', 10, 'bold'))
        palette_frame.pack(fill='x', pady=(0, 10))
        
        colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green']
        self.color_buttons = {}
        
        for i, color in enumerate(colors):
            btn = tk.Button(
                palette_frame,
                width=8,
                height=2,
                bg=self.cube.COLOR_CODES[color],
                text=color.title(),
                font=('Arial', 8),
                relief='raised',
                bd=2,
                command=lambda c=color: self.select_color(c)
            )
            btn.grid(row=i//2, column=i%2, padx=2, pady=2, sticky='ew')
            self.color_buttons[color] = btn
        
        # Configure grid weights
        palette_frame.grid_columnconfigure(0, weight=1)
        palette_frame.grid_columnconfigure(1, weight=1)
        
        # Initially select white
        self.select_color('white')
        
        # Action buttons
        action_frame = tk.LabelFrame(parent, text="Actions", font=('Arial', 10, 'bold'))
        action_frame.pack(fill='x', pady=(0, 10))
        
        # Reset button
        reset_btn = tk.Button(
            action_frame,
            text="Reset Cube",
            font=('Arial', 10),
            bg='#ffcccc',
            command=self.reset_cube
        )
        reset_btn.pack(fill='x', pady=2)
        
        # Solve button
        self.solve_btn = tk.Button(
            action_frame,
            text="Solve Cube",
            font=('Arial', 10, 'bold'),
            bg='#ccffcc',
            command=self.solve_cube
        )
        self.solve_btn.pack(fill='x', pady=2)
        
        # Solution display
        solution_frame = tk.LabelFrame(parent, text="Solution Steps", font=('Arial', 10, 'bold'))
        solution_frame.pack(fill='both', expand=True)
        
        # Solution text area
        self.solution_text = scrolledtext.ScrolledText(
            solution_frame,
            height=8,
            font=('Courier', 9),
            wrap='word'
        )
        self.solution_text.pack(fill='both', expand=True, padx=5, pady=5)
        
        # Navigation buttons
        nav_frame = tk.Frame(solution_frame)
        nav_frame.pack(fill='x', padx=5, pady=(0, 5))
        
        self.prev_btn = tk.Button(
            nav_frame,
            text="← Previous",
            state='disabled',
            command=self.previous_step
        )
        self.prev_btn.pack(side='left')
        
        self.next_btn = tk.Button(
            nav_frame,
            text="Next →",
            state='disabled',
            command=self.next_step
        )
        self.next_btn.pack(side='right')
        
        # Step counter
        self.step_label = tk.Label(nav_frame, text="", font=('Arial', 9))
        self.step_label.pack()
        
        # Instructions
        instructions = tk.Text(parent, height=4, font=('Arial', 9), wrap='word', bg='#f9f9f9')
        instructions.pack(fill='x', pady=(10, 0))
        
        instructions.insert('1.0', 
            "Instructions:\n"
            "1. Select a color from the palette\n"
            "2. Click cube squares to paint them\n"
            "3. Color all 54 squares (9 of each color)\n"
            "4. Click 'Solve Cube' to get solution"
        )
        instructions.config(state='disabled')
    
    def select_color(self, color: str):
        """Select a color from the palette."""
        # Reset all color buttons
        for btn in self.color_buttons.values():
            btn.config(relief='raised', bd=2)
        
        # Highlight selected color
        self.color_buttons[color].config(relief='sunken', bd=3)
        self.selected_color = color
    
    def color_square(self, face: str, row: int, col: int):
        """Color a square on the cube."""
        # Update cube model
        self.cube.set_face_color(face, row, col, self.selected_color)
        
        # Update button appearance
        color_code = self.cube.COLOR_CODES[self.selected_color]
        self.face_buttons[face][row][col].config(bg=color_code)
        
        # Clear solution when cube is modified
        self.clear_solution()
    
    def reset_cube(self):
        """Reset the cube to empty state."""
        self.cube.reset_cube()
        
        # Reset all button colors
        for face_name, face_buttons in self.face_buttons.items():
            for row in range(3):
                for col in range(3):
                    face_buttons[row][col].config(bg=self.cube.COLOR_CODES['empty'])
        
        self.clear_solution()
    
    def clear_solution(self):
        """Clear the solution display."""
        self.solution_steps = []
        self.current_step = 0
        self.solution_text.delete('1.0', 'end')
        self.prev_btn.config(state='disabled')
        self.next_btn.config(state='disabled')
        self.step_label.config(text="")
    
    def solve_cube(self):
        """Solve the cube and display the solution."""
        # Validate cube first
        is_valid, message = self.cube.is_valid_cube()
        if not is_valid:
            messagebox.showerror("Invalid Cube", message)
            return
        
        # Disable solve button during solving
        self.solve_btn.config(state='disabled', text='Solving...')
        self.root.update()
        
        # Solve in background thread to prevent GUI freezing
        def solve_thread():
            try:
                solution = self.cube.solve()
                
                # Update GUI in main thread
                self.root.after(0, lambda: self.display_solution(solution))
                
            except Exception as e:
                self.root.after(0, lambda: self.handle_solve_error(str(e)))
        
        threading.Thread(target=solve_thread, daemon=True).start()
    
    def display_solution(self, solution: Optional[str]):
        """Display the solution steps."""
        self.solve_btn.config(state='normal', text='Solve Cube')
        
        if solution is None:
            messagebox.showerror("Solving Error", 
                "Could not solve the cube. Please check that all colors are correct.")
            return
        
        if not solution or solution.strip() == "":
            messagebox.showinfo("Already Solved", "The cube is already solved!")
            return
        
        # Parse solution into steps
        self.solution_steps = solution.strip().split()
        self.current_step = 0
        
        # Display solution
        self.solution_text.delete('1.0', 'end')
        self.solution_text.insert('1.0', f"Solution found! {len(self.solution_steps)} moves:\n\n")
        
        for i, move in enumerate(self.solution_steps, 1):
            self.solution_text.insert('end', f"{i:2d}. {move}\n")
        
        self.solution_text.insert('end', f"\nTotal moves: {len(self.solution_steps)}")
        
        # Enable navigation
        if self.solution_steps:
            self.next_btn.config(state='normal')
            self.update_step_display()
    
    def handle_solve_error(self, error_msg: str):
        """Handle solving errors."""
        self.solve_btn.config(state='normal', text='Solve Cube')
        messagebox.showerror("Solving Error", f"Error solving cube: {error_msg}")
    
    def previous_step(self):
        """Go to previous solution step."""
        if self.current_step > 0:
            self.current_step -= 1
            self.update_step_display()
    
    def next_step(self):
        """Go to next solution step."""
        if self.current_step < len(self.solution_steps):
            self.current_step += 1
            self.update_step_display()
    
    def update_step_display(self):
        """Update the step display and navigation buttons."""
        total_steps = len(self.solution_steps)
        
        if self.current_step == 0:
            self.step_label.config(text="Ready to start")
            self.prev_btn.config(state='disabled')
            self.next_btn.config(state='normal' if total_steps > 0 else 'disabled')
        elif self.current_step == total_steps:
            self.step_label.config(text="Solved!")
            self.prev_btn.config(state='normal')
            self.next_btn.config(state='disabled')
        else:
            move = self.solution_steps[self.current_step - 1]
            self.step_label.config(text=f"Step {self.current_step}/{total_steps}: {move}")
            self.prev_btn.config(state='normal')
            self.next_btn.config(state='normal')


def main():
    """Main application entry point."""
    root = tk.Tk()
    app = RubikSolverGUI(root)
    
    # Center window on screen
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - (root.winfo_width() // 2)
    y = (root.winfo_screenheight() // 2) - (root.winfo_height() // 2)
    root.geometry(f"+{x}+{y}")
    
    root.mainloop()


if __name__ == "__main__":
    main()
