curWords = [];
curShowedWordIndexes = [];
mainArea = document.getElementById("main-area");

async function loadWords() {
    try {
        const response = await fetch('./words.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const words = await response.json();

        console.log("데이터 로드 완료:", words);
        new Main(words);

    } catch (error) {
        console.error("JSON 파일을 불러오는 중 오류 발생:", error);
        alert("데이터를 불러오지 못했습니다. 서버 환경(Live Server 등)에서 실행 중인지 확인하세요.");
    }
}

class Main {
    constructor(words) {
        this.words = words;
        this.difficulty = document.getElementById("difficulty");
        this.difficulty.addEventListener("change", this.onDifficultyChange.bind(this));
        this.wordsList = document.getElementById("words-list");
        this.startBtn = document.getElementById("start-button");
        this.startBtn.addEventListener("click", this.onStartButtonClick.bind(this));
        this.startScreen = document.getElementById("start-screen");
        this.mainScreen = document.getElementById("main-screen");
        this.resultScreen = document.getElementById("result-screen");
        this.answerInput = document.getElementById("answer-input");
        this.answerInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.onEnter(event);
            }
        });
        this.restartButton = document.getElementById("restart-button");
        this.restartButton.addEventListener("click", this.onRestartButtonClick.bind(this));
        this.correctCount = document.getElementById("correct-count");
        curWords = [];
        curShowedWordIndexes = [];
    }

    onDifficultyChange(event) {
        const selectedDifficulty = event.target.value;
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

    onStartButtonClick() {
        this.correctCount.innerHTML = 0;
        this.startScreen.classList.remove("active");
        this.mainScreen.classList.add("active");
    }

    onEnter(event) {
        console.log("입력된 값:", this.answerInput.value);
        let inputWord = curWords.find(f=>f.kr.includes(this.answerInput.value));
        if(inputWord == undefined) {
            inputWord = curWords.find(f=>f.jp == this.answerInput.value);
        }
        if(inputWord != undefined) {
            let score = parseInt(this.correctCount.innerHTML);
            this.correctCount.innerHTML = score + 1;
            document.getElementById(inputWord.kanji)?.remove();
        }
        this.answerInput.value = "";
    }

    onGameEnd() {
        this.mainScreen.classList.remove("active");
        this.resultScreen.classList.add("active");
    }

    onRestartButtonClick() {
        this.resultScreen.classList.remove("active");
        this.startScreen.classList.add("active");
    }
}

function createWord() {
    const span = document.createElement('span'); // 요소 생성

    // 주어진 범위 내 무작위 글자 선택
    let randomIndex = Math.floor(Math.random() * curWords.length);
    while (curShowedWordIndexes.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * curWords.length);
    }
    span.innerText = curWords[randomIndex].kanji;
    span.id = curWords[randomIndex].kanji;
    curShowedWordIndexes.push(randomIndex);

    // 무작위 X축 위치 (0 ~ 100vw)
    const left = Math.random() * 100;
    span.style.left = left + 'vw';

    this.mainArea.appendChild(span); // 화면에 추가

    // 2. 특정 위치(시간) 도달 시 제거 부분
    // 애니메이션 시간(duration)이 끝난 뒤에 요소를 삭제함
    setTimeout(() => {
        span.remove();
    }, duration * 1000);
}

loadWords();