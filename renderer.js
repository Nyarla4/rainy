const maxWordCount = 20;

curWords = [];
curDiffWords = [];
curShowedWordIndexes = [];
wordsCount = 0;
removedWordsCount = 0;
mainArea = document.getElementById("main-area");
correctCount = document.getElementById("correct-count");
wrongCount = document.getElementById("wrong-count");
curInterval = "";
startScreen = document.getElementById("start-screen");
mainScreen = document.getElementById("main-screen");
resultScreen = document.getElementById("result-screen");
difficulty = document.getElementById("difficulty");
resultWords = [];
resultWordsList= document.getElementById("result-words");
duration = 30;
timeTerm = 4000;
speed = document.getElementById("speed");
indexList = [];

async function loadWords() {
    try {
        const response = await fetch('./words.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const words = await response.json();

        console.log("데이터 로드 완료:", words);
        const main = new Main(words);
        main.difficultyChanged(difficulty.value);

    } catch (error) {
        console.error("JSON 파일을 불러오는 중 오류 발생:", error);
        alert("데이터를 불러오지 못했습니다. 서버 환경(Live Server 등)에서 실행 중인지 확인하세요.");
    }
}

class Main {
    constructor(words) {
        this.words = words;
        difficulty.addEventListener("change", this.onDifficultyChange.bind(this));
        this.wordsList = document.getElementById("words-list");
        this.startBtn = document.getElementById("start-button");
        this.startBtn.addEventListener("click", onStartButtonClick.bind(this));
        this.answerInput = document.getElementById("answer-input");
        this.answerInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.onEnter(event);
            }
        });
        this.restartButton = document.getElementById("restart-button");
        this.restartButton.addEventListener("click", onRestartButtonClick.bind(this));
        speed.addEventListener("change", this.onSpeedChange.bind(this));
        curWords = [];
    }

    difficultyChanged(diff) {
        const selectedDifficulty = diff;
        curDiffWords = this.words[selectedDifficulty];
        
        createListHeader(this.wordsList, curDiffWords);
        setCurWords();
    }

    onSpeedChange(diff) {
        duration = diff.target.value;
        timeTerm = duration / 30 * 4000;
    }

    onDifficultyChange(event) {
        this.difficultyChanged(event.target.value);        
    }

    onEnter(event) {
        console.log("입력된 값:", this.answerInput.value);
        const userInput = this.answerInput.value.trim();
        let isKr = false;
        let inputWord = curWords.find(f => {
            // 1. 한국어 뜻 배열(kr) 중 하나라도 일치하는지 확인
            const matchKr = f.kr.some(k => {
                const trimedK = k.trim();
                // ① 완전 일치 (예: "(본궤도에서) 벗어나다")
                if (trimedK === userInput) {
                    isKr = true;
                    return true;
                }
                // ② 괄호만 제거 (예: "본궤도에서 벗어나다")
                const flatWord = trimedK.replace(/\(|\)/g, "");
                if (flatWord === userInput) {
                    isKr = true;
                    return true;
                }
                // ③ 괄호와 그 안의 내용까지 제거 (예: "벗어나다")
                const coreWord = trimedK.replace(/\([^)]*\)/g, "").trim();
                if (coreWord === userInput) {
                    isKr = true;
                    return true;
                }
                return false;
            });

            if (matchKr) return true;

            // 2. 일본어 발음(jp) 일치 확인
            return f.jp === userInput;
        });
        if (inputWord != undefined) {
            let targetElement = document.getElementById(inputWord.kanji);
            if(targetElement != undefined) {
                let score = parseInt(correctCount.innerHTML);
                correctCount.innerHTML = score + 1;
                let word = Object.assign({}, inputWord);
                word.isKr = isKr;
                resultWords.push(word);
                targetElement.remove();
                removedWordsCount++;
                if (removedWordsCount == curWords.length) {
                    onGameEnd();
                }
                targetElement = undefined;
            }
        }
        this.answerInput.value = "";
    }
}

function onStartButtonClick() {
    curShowedWordIndexes = [];
    resultWords = [];
    removedWordsCount = 0;
    correctCount.innerHTML = 0;
    wrongCount.innerHTML = 0;
    startScreen.classList.remove("active");
    mainScreen.classList.add("active");
    indexList = Array.from({ length: curWords.length }, (_, i) => i);
    for (let i = indexList.length -1; i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [indexList[i],indexList[j]]=[indexList[j],indexList[i]];
    }
    createWord();
    curInterval = setInterval(createWord, timeTerm);
}

function setCurWords() {
    wordsCount = Math.min(curDiffWords.length, maxWordCount);
    const shuffled = [...curDiffWords].sort(() => Math.random() - 0.5);
    curWords = shuffled.slice(0, wordsCount);
    document.getElementsByClassName("total-count")[0].innerHTML = wordsCount;
    document.getElementsByClassName("total-count")[1].innerHTML = wordsCount;
}

function onGameEnd() {
    mainScreen.classList.remove("active");
    resultScreen.classList.add("active");
    let finalCorrect = parseInt(correctCount.innerHTML);
    let finalScore = finalCorrect / wordsCount * 100;
    document.getElementById("total-score").innerText = `난이도: ${difficulty.value}, 속도: ${document.getElementById(duration).innerHTML}, 점수: ${finalScore}(${finalCorrect} / ${wordsCount})`;
    
    createListHeader(resultWordsList, resultWords);
}

function onRestartButtonClick() {
    resultScreen.classList.remove("active");
    startScreen.classList.add("active");
    setCurWords();
}

function createWord() {
    if (curShowedWordIndexes.length == curWords.length) {
        clearInterval(curInterval);
        return;
    }

    let randomIndex = indexList.pop();

    const span = document.createElement('span'); // 요소 생성
    span.innerText = curWords[randomIndex].kanji;
    span.id = curWords[randomIndex].kanji;
    span.classList.add('falling-word');
    span.style.animationDuration = duration + 's';
    curShowedWordIndexes.push(randomIndex);

    // 무작위 X축 위치 (25 ~ 75vw)
    const left = Math.random() * 50 + 25;
    span.style.left = left + 'vw';

    this.mainArea.appendChild(span); // 화면에 추가

    // 2. 특정 위치(시간) 도달 시 제거 부분
    // 애니메이션 시간(duration)이 끝난 뒤에 요소를 삭제함
    setTimeout(() => {
        var originWord = curWords.find(f => f.kanji == span.id);
        if (resultWords.find(f => f.kanji == originWord.kanji) == undefined) {
            span.remove();
            let score = parseInt(wrongCount.innerHTML);
            wrongCount.innerHTML = score + 1;
            let word = Object.assign({}, originWord);
            word.isRemoved = true;
            resultWords.push(word);
            removedWordsCount++;
            if (removedWordsCount == curWords.length) {
                onGameEnd();
            }
        }
    }, duration * 1000);
}

function createListHeader(wordList, words) {
    wordList.innerHTML = "";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");

    const maxKanjiLength = Math.max(...words.map(f => f.kanji.length));
    const thKanjiWidth = ((maxKanjiLength + 1) * 20) + 'vh';

    const maxJpLength = Math.max(...words.map(f => f.jp.length));
    const thJpWidth = ((maxJpLength + 1) * 10) + 'vh';

    const maxKrLength = Math.max(...curDiffWords.map(f=>f.kr.join().length));
    const thKrWidth = ((maxKrLength / 2 + 10) * 10) + 'vh';

    const th1 = document.createElement("th");
    th1.textContent = "한자";
    th1.width = thKanjiWidth;
    headerRow.appendChild(th1);
    const th2 = document.createElement("th");
    th2.textContent = "발음";
    th2.width = thJpWidth;
    headerRow.appendChild(th2);
    const th3 = document.createElement("th");
    th3.textContent = "뜻";
    th3.width = thKrWidth;
    headerRow.appendChild(th3);

    thead.appendChild(headerRow);

    words?.forEach(element => {
        const tr = document.createElement("tr");
        const data = [element.kanji, element.jp, element.kr.join(", ")];
        data.forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            td.height = '50vh';

            if (element.isKr != undefined || element.isRemoved != undefined) {
                if (element.isKr != undefined) {
                    if (element.kanji == text) {
                        td.style.color = 'green';
                    }
                    else if ((element.isKr && text == element.kr.join(", ")) // 뜻으로 맞춘 경우
                        || (!element.isKr && text == element.jp)) { // 발음으로 맞춘 경우
                        td.style.color = 'green';
                    }
                }
                else if (element.kanji == text) {
                    td.style.color = 'red';
                }
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wordList.appendChild(table);
}

loadWords();