const words = [];

class main {
    constructor() {
        this.difficulty = document.getElementById("difficulty");
        this.difficulty.addEventListener("change", this.onDifficultyChange.bind(this));
    }

    onDifficultyChange(event) {
        const selectedDifficulty = event.target.value;
        console.log("선택된 난이도:", selectedDifficulty);
        // 선택된 난이도에 따라 필요한 작업을 수행할 수 있습니다.
    }
}