import { useEffect } from "react";

interface stateProps{
    grid: Array<Array<string>>;
    heuristicValue: Number;
  }


  // HAMLELER ARASINA VAKİT KOYMAK İÇİN VAR
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
    // MANHATTAN DISTANCE KULLANARAK DURUMLARIN/TABLOLARIN DEĞERİNİ BULUR
export const calculateHeurisicValue = ( grid :Array<Array<string>>):Number  =>{
    let result = 0;

    // VERİLEN GRİD'İN HER SATIRINI SIRAYLA GEZER, "row" GEZİLMEKTE OLAN SATIR, "rowIndex" GEZİLMEKTE OLAN SATIRIN SIRASI (0,1,2 olabilir)
    grid.forEach((row, rowIndex : number) => {

        // "row" SATIRININ İÇERİĞİNİ GEZER, "cell"  GEZİLMEKTE OLAN HANE/HÜCRE, "colIndex" GEZİLMEKTE OLAN HANENİN SÜTUNUN SIRASI (0,1,2 olabilir)
        row.forEach((cell : any, colIndex : number) => {


          if (cell !== '') {
            const num = parseInt(cell, 10);  // HANEDEKİ SAYIYI "number" TİPİNE ÇEVİR
            if (!isNaN(num)) {

              // HANEDEKİ SAYININ, DEĞERİNE GÖRE, OLMASI GEREKEN SATIRI VE SÜTUNU BUL
              const targetRow = Math.floor(num / 3);
              const targetCol = num % 3;

              // HANEDEKİ SAYININ OLMASI GEREKEN YERE OLAN UZAKLIĞINI AL,[ |şuanki satır - olması gereken satır| + |şuanki kolon - olması gereken kolon| ]
              const manhattanDistance = Math.abs(rowIndex - targetRow) + Math.abs(colIndex - targetCol);
              result += manhattanDistance;
            }
          }
        });
      });
    
      return result;
    };

    // EN İYİ HAMLEYİ, BOŞ HANENİN KOMŞULARI İLE YERDEĞİŞTİRDİĞİ DURUMLARIN HEURISTIC DEĞERLERİNİ KIYASLAYARAK SAPTAR. EN DÜŞÜK DEĞERİ OLAN GRİD'İ RETURN EDER
const bestPossibleMove = (currentGrid: Array<Array<string>>) => {
      
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
       if (newHeuristicValue < bestHeuristic) {
        bestHeuristic = newHeuristicValue;
        }


       });

       // TABLODAN IDEAL OLMAYAN DEĞERLERİ ÇIKAR
       neighborsTable = neighborsTable.filter(
        (neighborState: stateProps) => neighborState.heuristicValue === bestHeuristic
      );
      // TABLODAN 
      const randomGrid : Array<Array<string>> = neighborsTable[Math.floor(Math.random() * neighborsTable.length)].grid;

      // Return the grid with the lowest heuristic value
      return randomGrid;
};

const getNewState = ( currentState:stateProps) : stateProps =>{

    const currentGrid = currentState.grid;

    const newGrid = bestPossibleMove(currentGrid);

    const newHeuristicValue = calculateHeurisicValue(newGrid);
    const newState:stateProps = {grid:newGrid,heuristicValue:newHeuristicValue};

    return newState;
}

export const solveProblem = async (
  initialState: stateProps, // BAŞLANGIÇ STATE'İ
  setGrid: React.Dispatch<React.SetStateAction<any[][]>>,// GRİD GÜNCELLEYEN FONKSİYON
  isSolvingRef: React.MutableRefObject<boolean>, // DEVAM EDİLDİĞİNİ BELİRLER
  setText: React.Dispatch<React.SetStateAction<string | undefined>>, // TEXT'İ GÜNCELLER
  setIsSolving: React.Dispatch<React.SetStateAction<boolean>> // BİTİNCE FALSE YAPMAK İÇİN
): Promise<void> => {


  let dynamicState = initialState;

  while (true) { 
    if (!isSolvingRef.current) { // EĞER DURDURULDUYSA LOOP'DAN ÇIK
      break;
    }
    console.log(dynamicState.heuristicValue);
    
    if(dynamicState.heuristicValue == 0){ // ÇÖZÜLÜNCE  RETURN
      setIsSolving(false);
      isSolvingRef.current= false;
      setText("Solved");      
      return;
    } 


    let previousState = dynamicState; // TEXT'İ GÜNCELLEMEK İÇİN ÖNCEKİ STATE'İ AL 
    dynamicState = getNewState(dynamicState); // YENİ STATE'İ AL
    setGrid(dynamicState.grid); // GRİD'İ GÜNCELLE 
    updateText(previousState.grid, dynamicState.grid, setText); // TEXT'İ GÜNCELLE
    await sleep(1000);// 1 SANİYE BEKLE
  }

  return;
};

/**
 * Bu fonksiyon ekranda sunulan <Text> objesinin içeriğini, hamle sırasında yer değiştiren sayıla günceller
 * @param previousGrid bu parametre hamle öncesi grid, bu grid'deki {""} değerine sahip hanenin koordinatlarını elde etmek için var 
 * @param nextGrid  bu parametre hamle sonrası grid, hamle ile yeri değiştirilen sayıyı bulmak için var
 * @param setText  ekrandaki yazıyı güncellemek için var, App.tsx dosyasındaki const [text, SetText] = useState<string>() objesini elde edecek şekilde planlandı 
 */
const updateText = ( previousGrid : Array<Array<string>>, nextGrid : Array<Array<string>>, setText: React.Dispatch<React.SetStateAction<string | undefined>>) => {
  
  if(!previousGrid) return;
  

  const findEmptyCell = () => { // DEĞİŞİMDEN ÖNCEKİ GRİD'İN KOORDİNATLARINI BULAN BİR FONKSİYON
    for (let row = 0; row < previousGrid.length; row++) {
      for (let col = 0; col < previousGrid[row].length; col++) {
        if (previousGrid[row][col] === "") {
          return { row, col }; // Return the row and column of the empty cell
        }
      }
    }
    return null; // In case no empty cell is found, though it's guaranteed to exist
  };

  const emptyCoordinates = findEmptyCell(); // BOŞLUĞUN KOORDİNATLARI
  
  if (emptyCoordinates  !== null&& emptyCoordinates.row !== null && emptyCoordinates.col  !== null) {

    let movedNumber = nextGrid[emptyCoordinates.row][emptyCoordinates.col]; // YENİ GRİD'DE, ÖNCEKİ GRİD'İN BOŞLUĞUNUN YERİNİ ALAN SAYI
    setText("Number "+movedNumber+" moved") ;
  }
}


