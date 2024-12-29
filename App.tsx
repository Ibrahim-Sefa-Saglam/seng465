import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Button, Text } from 'react-native';
import { calculateHeurisicValue, solveProblem } from './calculations';

interface stateProps{
  grid: Array<Array<string>>;
  heuristicValue: Number;
}


export default function App() {
  // Initialize a 3x3 grid with empty strings
  const [state, setState] = useState<stateProps>();
  const [grid, setGrid] = useState(Array(3).fill(null).map(() => Array(3).fill('')));
  const [text,setText] = useState<string>();
  
  let isSolving : boolean = false; 
  const staticIsSolving = isSolving;
  
  const getIsSolving = () : boolean =>{return isSolving;}

  // Handle input change
  
  const handleInputChange = (row: number, col: number, value: string) => {
    // Make a copy of the grid to avoid mutating the original state directly
    const validValue = ["1", "2", "3", "4", "5", "6", "7", "8", ""]; // Valid numbers including empty string
    if(!validValue.includes(value)) return;

    const newGrid = grid.map((r, rIndex) => 
      rIndex === row ? r.map((cell, cIndex) => (cIndex === col ? value : cell)) : r
    );    
    setGrid(newGrid);
  };

  // Handle button press
  const handleButtonPress = async () => {       
    isSolving = true;
    
    let initialState : stateProps= {grid:grid,heuristicValue:calculateHeurisicValue(grid)};        
    if(!isValidGrid(grid)) return;
    let x =  solveProblem(initialState,setGrid,getIsSolving, setText);
    
  };
   
  const onClear = () => {
    isSolving = false;
    const clearedGrid = Array(3).fill(null).map(() => Array(3).fill(''));    
    setGrid(clearedGrid); 
  };
  const onReset = () =>{
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
  // BAŞLANGIÇ DEĞERLERİNİ KURAR
useEffect(() => {
  isSolving = false;
  onReset();
}, []);

  return (
    
    <View style={styles.container}>
        {/* Render the 3x3 grid */}
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TextInput
                key={colIndex}
                style={styles.cell}
                value={cell}
                onChangeText={(text) => handleInputChange(rowIndex, colIndex, text)}
                keyboardType="numeric"
                maxLength={1}
              />
            ))}
          </View>
        ))}

        <View style={styles.textContainer}>
            <Text>{text ||"Fill the grid with different numbers (1-8)"}</Text>
        </View>

        <View style={styles.buttonContainer}>
            <Button title="Press Me" onPress={handleButtonPress} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Clear" onPress={onClear} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Reset" onPress={onReset} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
  },
  textContainer:{
    marginVertical:5,
  },
  buttonContainer:{
    marginTop:5
  }
});
