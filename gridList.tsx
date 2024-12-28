import { calculateHeurisicValue } from "./calculations";

interface stateProps{
    grid: Array<Array<string>>;
    heuristicValue: Number;
  }
interface stateListProps{   
    parentState: stateProps | null; 
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

      let bestHeuristic: Number = 999999;

      // KOMŞULARI GEZ, TABLOYU DURUMLARLA DOLDURMAK İÇİN
      neighbors.forEach((neighbor) => {

        // KOMŞU YOKSA RETURN
        if ( !((neighbor.row >= 0) &&( neighbor.row < 3) && (neighbor.col >= 0) &&( neighbor.col < 3))) {
          return
        };


          // ŞUAN Kİ GRİD'İN KOPYASINI OLUŞTUR. HANELERİN YERİNİ, BUNUN ÜZERİNDE DEĞİŞİM YAPACAK 
        const newGrid = currentGrid.map((row) => row.slice()); // Create a copy of the grid
        
        // GEZİLMEKTE OLAN KOMŞU İLE BOŞ HÜCRENİN YERİNİ DEĞİŞTİR
        [newGrid[emptyCellRow][emptyCellCol], newGrid[neighbor.row][neighbor.col]] = [ newGrid[neighbor.row][neighbor.col], newGrid[emptyCellRow][emptyCellCol],];
        
        // OLUŞAN YENİ DURUMUN DEĞERİNİ ÖLÇ
        const newHeuristicValue = calculateHeurisicValue(newGrid);

        // EĞER TABLO YOKSA OLUŞTUR
        if(!neighborsTable) {
          neighborsTable = [];
        }
        // TABLOYU DOLDURMAYA BAŞLA
        neighborsTable.push({grid: newGrid,heuristicValue: newHeuristicValue});

        // YENİ DEĞER DAHA DÜŞÜK İSE, GÜNCELLE
       if (newHeuristicValue <= bestHeuristic) {
        bestHeuristic = newHeuristicValue;
        }


       });


      // PARAMETRE OLARAK GİRİLEN GRİD'DEN GELEBİLECEK TÜM STATE'LERİ RETURN ET
      return neighborsTable;
};


const getStateTree = ( currentState: stateProps, parameterListState?: stateListProps, parentState? : stateProps ) : stateListProps =>{
    
    // EĞER YOKSA İLK DEFA LİSTEYİ OLUŞTUR
    let stateList : stateListProps = parameterListState? parameterListState :{
        parentState: parentState || null,
        thisState: currentState,
        nextNeighbors:[] // ŞUANKİ STATE'TEN TÜREYEN NESİLLERİ (KENDİSİNİN ZÜRRİYETİ)
    };
    

    let neighbors = PossibleStates(stateList.thisState);
    
    // ÖNCEKİ GRİD'İ SONRAKİLERDEN ÇIKAR
    neighbors = neighbors.filter((neighbor) => {
        neighbor.grid !== parentState?.grid;
    })    

    // EĞER KOMŞU YOKSA RETURN
    if(neighbors.length === 0) return stateList; 
    
    // EKRANDA ÇALIŞTIRILMASI İÇİN BİR LİSTE OLUŞTUR
    neighbors.forEach((neighbor) => {
        
        // KOMŞULARDAN BİRİNİ EKLE
        stateList.nextNeighbors.push(neighbor);
        
        // BU KOMŞU İÇİN BU FONKSYONU ÇALIŞTIR, BU KOMŞUNUN LİSTESİNİ/ÇOCUKLARINI AL, AĞACI BU OLUŞTURUR
        let listFromThisNeighbor = getStateTree(neighbor,stateList).nextNeighbors;
        
        // ELİMİZDEKİ LİSTEYE, KOMŞUDAN ALDIĞIMIZ LİSTEYİ EKLEYELİM
        if(listFromThisNeighbor.length !== 0) {
            stateList.nextNeighbors.push(...listFromThisNeighbor);
        }        

    })
    

    return stateList
}


const traverseTree  = async (initialState:stateProps,  setGrid: React.Dispatch<React.SetStateAction<any[][]>>) =>{
    let currentListElement = getStateTree(initialState);

    setGrid(currentListElement.thisState.grid);
    await sleep(1000);

    // if it is soved, return
    if( currentListElement.thisState.heuristicValue === 0) return;

    currentListElement.nextNeighbors.forEach(async (neighbor) => {
         
        traverseTree(neighbor,setGrid);
        
        setGrid(currentListElement.thisState.grid);
        await sleep(1000);
    })



}