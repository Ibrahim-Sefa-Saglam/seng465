import { useEffect } from "react";
import { calculateHeurisicValue } from "./calculations";

interface stateProps{
    grid: Array<Array<string>>;
    heuristicValue: Number;
  }
interface stateListProps{   
    parentState: stateProps; 
    thisState: stateProps;
    nextNeighbors: stateProps[];
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const PossibleStates = (currentState: stateProps) => {

    
    let currentGrid =  currentState.grid;
    let currentHeuristic = currentState.heuristicValue;

      // BU KISIM BOŞ HANENİN KONUMUNU BULUR 
      let emptyCellRow = -1;
      let emptyCellCol = -1;

      // Find the position of the empty cell in the grid
      outerLoop: for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (currentGrid[row][col] === '') {
            emptyCellRow = row;
            emptyCellCol = col;
            break outerLoop;
          }
        }
      }
      
      // BOŞ HANENİN KOMUŞULARININ KONUMLARI 
      const neighbors: { row: number; col: number }[] = [
        { row: emptyCellRow - 1, col: emptyCellCol }, // Up
        { row: emptyCellRow + 1, col: emptyCellCol }, // Down
        { row: emptyCellRow, col: emptyCellCol - 1 }, // Left
        { row: emptyCellRow, col: emptyCellCol + 1 }, // Right
      ];

      // BİR OLASI DURUMLAR VE DEĞERLERİ TABLOSU OLUŞTUR
      let neighborsTable: stateProps[] = [];

      let bestHeuristic: Number = currentState.heuristicValue ;

      // KOMŞULARI GEZ, TABLOYU DURUMLARLA DOLDURMAK İÇİN
      neighbors.forEach((neighbor) => {

        // KOMŞU YOKSA RETURN
        if ( !((neighbor.row >= 0) &&( neighbor.row < 3) && (neighbor.col >= 0) &&( neighbor.col < 3))) {
          return
        };


          // ŞUAN Kİ GRİD'İN KOPYASINI OLUŞTUR. HANELERİN YERİNİ, BUNUN ÜZERİNDE DEĞİŞİM YAPACAK 
        const newGrid = currentGrid.map((row) => row.slice()); // Create a copy of the grid
        
        // GEZİLMEKTE OLAN KOMŞU İLE BOŞ HÜCRENİN YERİNİ DEĞİŞTİR
        [newGrid[emptyCellRow][emptyCellCol], newGrid[neighbor.row][neighbor.col]] = [ newGrid[neighbor.row][neighbor.col], newGrid[emptyCellRow][emptyCellCol]];
        
        // OLUŞAN YENİ DURUMUN DEĞERİNİ ÖLÇ
        const newHeuristicValue = calculateHeurisicValue(newGrid);

        // YENİ DEĞER DAHA DÜŞÜK İSE, GÜNCELLE
        if (newHeuristicValue < bestHeuristic) {
            // TABLOYU DOLDURMAYA BAŞLA
           neighborsTable.push({grid: newGrid,heuristicValue: newHeuristicValue});
            bestHeuristic = newHeuristicValue;
            
        }        
        

       });
 
      // PARAMETRE OLARAK GİRİLEN GRİD'DEN GELEBİLECEK TÜM STATE'LERİ RETURN ET
      return neighborsTable;
};


const getStateTree = ( currentState: stateProps, parameterListState?: stateListProps, parentStateParameter? : stateProps ) : stateListProps =>{
     
    
    // EĞER YOKSA İLK DEFA LİSTEYİ OLUŞTUR
    let stateList : stateListProps = parameterListState? parameterListState :{
        parentState: parentStateParameter || currentState,
        thisState: currentState,
        nextNeighbors:[] // ŞUANKİ STATE'TEN TÜREYEN NESİLLERİ (KENDİSİNİN ZÜRRİYETİ)
    };

    let neighbors = PossibleStates(stateList.thisState);
    
    console.log(stateList.nextNeighbors.length);
    console.log(stateList.thisState.grid);
    

    
    function areGridsEqual(grid1: Array<Array<string>>, grid2: Array<Array<string>>) {
        if (grid1.length !== grid2.length) return false;
        for (let i = 0; i < grid1.length; i++) {
            if (grid1[i].length !== grid2[i].length) return false;
            for (let j = 0; j < grid1[i].length; j++) {
                if (grid1[i][j] !== grid2[i][j]) return false;
            }
        }
        return true;
    }
    // ÖNCEKİ GRİD'İ SONRAKİLERDEN ÇIKAR
    neighbors = neighbors.filter(
        (neighbor) => 
            !areGridsEqual(neighbor.grid, stateList.parentState.grid) &&
            !areGridsEqual(neighbor.grid, currentState.grid)
    );
      
    // EĞER KOMŞU YOKSA RETURN
    if(neighbors.length === 0) return stateList; 
    
    // EKRANDA ÇALIŞTIRILMASI İÇİN BİR LİSTE OLUŞTUR
    neighbors.forEach((neighbor) => {
        // KOMŞULARDAN BİRİNİ EKLE
        stateList.nextNeighbors.push(neighbor);
        // BU KOMŞU İÇİN BU FONKSYONU ÇALIŞTIR, BU KOMŞUNUN LİSTESİNİ/ÇOCUKLARINI AL, AĞACI BU OLUŞTURUR
      
         let listFromThisNeighbor = getStateTree(neighbor,stateList,currentState).nextNeighbors;
 
        
        // ELİMİZDEKİ LİSTEYE, KOMŞUDAN ALDIĞIMIZ LİSTEYİ EKLEYELİM
         
        if(listFromThisNeighbor.length !== 0) {stateList.nextNeighbors.push(...listFromThisNeighbor);}        

    })
    
    return stateList
}


export const traverseTree  = async (initialState:stateProps,  setGrid: React.Dispatch<React.SetStateAction<any[][]>>, isSolving :boolean,setText: React.Dispatch<React.SetStateAction<string | undefined>>) =>{    
 
 // if it is soved, return    
    if( initialState.heuristicValue === 0 && isSolving) {
        setText("Solved");
        setGrid(initialState.grid); // ŞUANKİ STATE'İN GRİD'İ
        return;
    }
    let currentListElement = getStateTree(initialState); // ŞUANKİ DURUM VE ONUN DEVAMI
    
    if(currentListElement.nextNeighbors.length === 0){
        setText("Unsolvable");
        return;
    }
    


    
    setGrid(currentListElement.thisState.grid); // ŞUANKİ STATE'İN GRİD'İ
    await sleep(1000);

    
     
    currentListElement.nextNeighbors.forEach(async (neighbor) => {       
        await traverseTree(neighbor,setGrid,isSolving,setText);        

    })
}

const getMovedNumber = (parentGrid: Array<Array<string>>, nextGrid : Array<Array<string>>) :string=>{
    
let emptyCellCol = -1;
let emptyCellRow = -1;

console.log("\n");
console.log(parentGrid);
console.log(nextGrid);


    outerLoop: for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (parentGrid[row][col] === '') {
            emptyCellRow = row;
            emptyCellCol = col;
            break outerLoop;
          }
        }
      }
if(emptyCellCol !== -1) return nextGrid[emptyCellRow][emptyCellCol];

return "";
}