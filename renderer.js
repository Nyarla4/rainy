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
    }

    onDifficultyChange(event) {
        const selectedDifficulty = event.target.value;
        console.log("선택된 난이도:", selectedDifficulty);
        this.wordsList.appendChild(document.createTextNode(`선택된 난이도: ${selectedDifficulty}`));
        this.words[selectedDifficulty]?.forEach(element => {
            this.wordsList.appendChild(document.createTextNode(`- ${element.jp} (${element.kr.join(", ")})`));
        });
    }
}

loadWords();