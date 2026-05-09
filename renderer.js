curWords = [];
curShowedWordIndexes = [];
removedWordsCount = 0;
mainArea = document.getElementById("main-area");
correctCount = document.getElementById("correct-count");
curInterval = "";
startScreen = document.getElementById("start-screen");
mainScreen = document.getElementById("main-screen");
resultScreen = document.getElementById("result-screen");
difficulty = document.getElementById("difficulty");

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
        curWords = [];
    }

    difficultyChanged(diff) {
        const selectedDifficulty = diff;
        this.wordsList.innerHTML = "";
        this.wordsList.appendChild(document.createTextNode(`선택된 난이도: ${selectedDifficulty}`));
        this.wordsList.appendChild(document.createElement("br"));
        this.words[selectedDifficulty]?.forEach(element => {
            this.wordsList.appendChild(document.createTextNode(`-  ${element.kanji} ${element.jp} (${element.kr.join(", ")})`));
            this.wordsList.appendChild(document.createElement("br"));
        });
        const wordsCount = Math.min(this.words[selectedDifficulty].length, 20);
        const shuffled = [...this.words[selectedDifficulty]].sort(() => Math.random() - 0.5);
        curWords = shuffled.slice(0, wordsCount);
        document.getElementById("total-count").innerHTML = wordsCount;
    }

    onDifficultyChange(event) {
        this.difficultyChanged(event.target.value);        
    }

    onEnter(event) {
        console.log("입력된 값:", this.answerInput.value);
        const inputWord = this.answerInput.value;
        let inputWord = curWords.find(f => {
            // 1. 한국어 뜻 배열(kr) 중 하나라도 일치하는지 확인
            const matchKr = f.kr.some(k => {
                // ① 완전 일치 (예: "(본궤도에서) 벗어나다")
                if (k === userInput) return true;
                // ② 괄호만 제거 (예: "본궤도에서 벗어나다")
                const flatWord = k.replace(/\(|\)/g, "");
                if (flatWord === userInput) return true;
                // ③ 괄호와 그 안의 내용까지 제거 (예: "벗어나다")
                const coreWord = k.replace(/\([^)]*\)/g, "").trim();
                if (coreWord === userInput) return true;
                return false;
            });

            if (matchKr) return true;

            // 2. 일본어 발음(jp) 일치 확인
            return f.jp === userInput;
        });
        if (inputWord != undefined) {
            let score = parseInt(correctCount.innerHTML);
            correctCount.innerHTML = score + 1;
            document.getElementById(inputWord.kanji)?.remove();
            removedWordsCount++;
            if (removedWordsCount == curWords.length) {
                onGameEnd();
            }
        }
        this.answerInput.value = "";
    }
}

function onStartButtonClick() {
    curShowedWordIndexes = [];
    removedWordsCount = 0;
    correctCount.innerHTML = 0;
    startScreen.classList.remove("active");
    mainScreen.classList.add("active");
    curInterval = setInterval(createWord, 1000);
}

function onGameEnd() {
    mainScreen.classList.remove("active");
    resultScreen.classList.add("active");
    document.getElementById("total-score").innerText = correctCount.innerHTML;
}

function onRestartButtonClick() {
    resultScreen.classList.remove("active");
    startScreen.classList.add("active");
}

function createWord() {
    if (curShowedWordIndexes.length == curWords.length) {
        clearInterval(curInterval);
        return;
    }

    let duration = 30;
    // 주어진 범위 내 무작위 글자 선택
    let randomIndex = Math.floor(Math.random() * curWords.length);
    while (curShowedWordIndexes.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * curWords.length);
    }
    const span = document.createElement('span'); // 요소 생성
    span.innerText = curWords[randomIndex].kanji;
    span.id = curWords[randomIndex].kanji;
    span.classList.add('falling-word');
    span.style.animationDuration = duration + 's';
    curShowedWordIndexes.push(randomIndex);

    // 무작위 X축 위치 (0 ~ 100vw)
    const left = Math.random() * 100;
    span.style.left = left + 'vw';

    this.mainArea.appendChild(span); // 화면에 추가

    // 2. 특정 위치(시간) 도달 시 제거 부분
    // 애니메이션 시간(duration)이 끝난 뒤에 요소를 삭제함
    setTimeout(() => {
        span.remove();
        removedWordsCount++;
        if (removedWordsCount == curWords.length) {
            onGameEnd();
        }
    }, duration * 1000);
}

loadWords();