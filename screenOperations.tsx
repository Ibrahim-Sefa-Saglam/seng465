import { useState } from "react";
import { calculateHeurisicValue, solveProblem } from "./calculations";
import { traverseTree } from "./gridList";

interface stateProps{
    grid: Array<Array<string>>;
    heuristicValue: Number;
  }
  
const [state, setState] = useState<stateProps>();

const handleInputChange = (row: number, col: number, value: string,grid: Array<Array<string>>, setGrid: React.Dispatch<React.SetStateAction<any[][]>>) => {
    // Make a copy of the grid to avoid mutating the original state directly
    const validValue = ["1", "2", "3", "4", "5", "6", "7", "8", ""]; // Valid numbers including empty string
    if(!validValue.includes(value)) return;

    const newGrid = grid.map((r, rIndex) => 
      rIndex === row ? r.map((cell, cIndex) => (cIndex === col ? value : cell)) : r
    );    
    setGrid(newGrid);
  };

export const handleButtonPress2 = async (
        isSolving:boolean, 
        setText: React.Dispatch<React.SetStateAction<string | undefined>>,
        grid: Array<Array<string>>, 
        setGrid: React.Dispatch<React.SetStateAction<any[][]>>
    ) => {       
      isSolving = true;      
      let initialState : stateProps= {grid:grid,heuristicValue:calculateHeurisicValue(grid)};        
      if(!isValidGrid(grid)) return;
      
      traverseTree(initialState,setGrid,isSolving,setText);
      
    };
     
 
      const onClear = (isSolving:boolean, setGrid: React.Dispatch<React.SetStateAction<any[][]>>) => {
        isSolving = false;
        const clearedGrid = Array(3).fill(null).map(() => Array(3).fill(''));    
        setGrid(clearedGrid); 
      };
    
      const onReset = (
        isSolving:boolean, 
        setText: React.Dispatch<React.SetStateAction<string | undefined>>, 
        setGrid: React.Dispatch<React.SetStateAction<any[][]>>
    ) =>{
        isSolving = false;
        
        const numbers = ['', ...Array.from({ length: 8 }, (_, i) => (i + 1).toString())];
        const newGrid = Array(3)
          .fill(null)
          .map((_, rowIndex) => numbers.slice(rowIndex * 3, rowIndex * 3 + 3));
        
        setGrid(newGrid);
      
        const heuristic = calculateHeurisicValue(newGrid);
        setState({ grid: newGrid, heuristicValue: heuristic });
        setText("");
      }
    
      const isValidGrid = (grid: Array<Array<string>>): boolean => {
        const flatGrid = grid.flat(); // Flatten the 2D array into a 1D array
        const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", ""]; // Valid numbers including empty string
      
        // Check if the grid has exactly 9 cells
        if (flatGrid.length !== 9) return false;
      
        // Check if each value in the grid is one of the valid numbers and all unique
        const uniqueValues = new Set(flatGrid);
        if (uniqueValues.size !== 9) return false; // This ensures all values are unique
      
        // Check if the grid contains only numbers from 1-8 and one empty cell
        for (let value of flatGrid) {
          if (!numbers.includes(value)) {
            return false; // If there's an invalid value in the grid, return false
          }
        }
      
        return true; // All conditions passed, grid is valid
      };