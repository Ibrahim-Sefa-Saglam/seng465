
interface stateProps{
    grid: Array<Array<string>>;
    heuristicValue: number;
  }
interface listElement{
    parentNode: listElement | null,
    currentState: stateProps,
    nextNodes: listElement[],
}

const createList = (currentState : stateProps, prevState?: listElement) => { // create the list or add to list (state to add, list )

    // create a linkedState from given state, link it to its parent. If there is no parent, assing self as parent
    const newLinkedState : listElement = prevState? {parentNode:prevState, currentState: currentState, nextNodes:[]}
    : {parentNode: null, currentState: currentState, nextNodes: []};
    
    const newNextNodes : stateProps[] = createNextStates(newLinkedState);// create nextNodes
    
    if(newNextNodes.length === 0) return newLinkedState;// if no nextNode, return
    newNextNodes.forEach((nextNode) => {          
        const nodeToAdd = createList(nextNode,prevState); // add the nodes to list as nodes
        newLinkedState.nextNodes.push(nodeToAdd); // add the new node to nextNodes
    })
    return newLinkedState;
}


const createNextStates = (thisNode: listElement) => {
      
      const newStates : stateProps[] = [] 
      
      const newGrids : Array<Array<string>>[] = createNextGrids(thisNode.currentState.grid)
      
      newGrids.filter((newGrid) => calculateHeurisicValue(newGrid) <= calculateHeurisicValue(thisNode.currentState.grid)  )
      newGrids.filter((newGrid) =>{        
        if(!thisNode.parentNode) return true;        
        // newGrid != with parent.state.grid
        for (let rowIndex = 0; rowIndex < thisNode.parentNode.currentState.grid.length; rowIndex++) {
          for (let colIndex= 0; colIndex< thisNode.parentNode.currentState.grid[rowIndex].length; colIndex++) {
            if(newGrid[rowIndex][colIndex] === thisNode.parentNode.currentState.grid[rowIndex][colIndex]) return false
          }
        }                 
        return true;
      })
      
      newGrids.forEach((grid) => {
      const newState : stateProps = { grid:grid, heuristicValue:calculateHeurisicValue(grid) }
      newStates.push(newState)
      })
      return newStates
     

}

const createNextGrids = (thisGrid: Array<Array<string>>) :Array<Array<string>>[] =>{

    const newGrids :  Array<Array<string>>[] = [];

    let emptyCoordinates : {row:number,column:number} = {row:-1,column:-1}; // get the coordinates of the empty cell
    for (let row = 0; row < thisGrid.length; row++) {
        for (let column = 0; column < thisGrid[row].length; column++) {
        if(thisGrid[row][column] === "") {emptyCoordinates = {row:row,column:column}}        
        }        
    }
    const neighbors :  {row:number,column:number}[] = [
        {row: emptyCoordinates.row + 1, column: emptyCoordinates.column}, // down
        {row: emptyCoordinates.row + -1, column: emptyCoordinates.column},// up
        {row: emptyCoordinates.row, column: emptyCoordinates.column +1 }, // right
        {row: emptyCoordinates.row + 1, column: emptyCoordinates.column -1 } // left
    ]
    
    
    neighbors.forEach((neighbor) => {
        if(neighbor.row < 0 || neighbor.column < 0) return;// return if coordinate in valid
        const neighborGrid = thisGrid.map((row) => row.slice()); // Create a copy of the grid
        // swap the neighbor with empty
        [neighborGrid[emptyCoordinates.row][emptyCoordinates.column],neighborGrid[neighbor.row][neighbor.column]] = [neighborGrid[neighbor.row][neighbor.column],neighborGrid[emptyCoordinates.row][emptyCoordinates.column]] 
        newGrids.push(neighborGrid);
    })
    
    return newGrids

}

const calculateHeurisicValue = ( grid :Array<Array<string>>):number  =>{
    let result = 0;

    grid.forEach((row, rowIndex : number) => {

        row.forEach((cell : any, colIndex : number) => {
          
          if (cell !== '') {
            const num = parseInt(cell, 10);  // HANEDEKİ SAYIYI "number" TİPİNE ÇEVİR
            if (!isNaN(num)) {
             
              const targetRow = Math.floor(num / 3);
              const targetCol = num % 3;
              
              const manhattanDistance = Math.abs(rowIndex - targetRow) + Math.abs(colIndex - targetCol);                  
              result += manhattanDistance;
            }
          }
        });
      });
    
      return result;
    };



const printNodeTree = (listNode : listElement, depth? : number) =>{

    if(listNode.parentNode === null) console.log(listNode.currentState);
    const newDepth = depth? depth + 1 : 0;
    
console.log("\n\n ---- DEPTH"+newDepth+" ----");

    listNode.nextNodes.forEach((nextNode) => {
    console.log(nextNode.currentState);
        
    })
    listNode.nextNodes.forEach((nextNode) => {
        printNodeTree(nextNode);
    })
    
}    