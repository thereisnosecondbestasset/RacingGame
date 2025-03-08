document.addEventListener("DOMContentLoaded", function () {
    let selectedGame, selectedDifficulty, selectedBetType;
    let selectedPlayers = [];
    let requiredPicks = 1;
    let scene, camera, renderer, racers = [], track;

    function showStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
        document.getElementById(stepNumber).classList.remove('hidden');
        document.getElementById("back-btn").classList.toggle("hidden", stepNumber === "step1" || stepNumber === "step6");
    }

    window.selectGame = function (game) {
        selectedGame = game;
        showStep("step2");
    };

    window.selectDifficulty = function (level) {
        selectedDifficulty = level;
        showStep("step3");

        const betOptions = {
            "easy": ["단승식", "연승식"],
            "normal": ["복승식", "쌍승식"],
            "hard": ["삼복승식", "쌍복승식", "삼쌍승식"]
        };

        document.getElementById("betting-options").innerHTML = "";
        betOptions[level].forEach(option => {
            let btn = document.createElement("button");
            btn.innerText = option;
            btn.addEventListener("click", function () {
                selectBet(option);
            });
            document.getElementById("betting-options").appendChild(btn);
        });
    };

    window.selectBet = function (betType) {
        selectedBetType = betType;
        const pickMessages = {
            "단승식": "1위 레이서 1명을 선택하세요!",
            "연승식": "1·2위 레이서 중 1명을 선택하세요!",
            "복승식": "1·2위 레이서 2명을 순서 상관없이 선택하세요!",
            "쌍승식": "1·2위 레이서 2명을 순서대로 선택하세요!",
            "삼복승식": "1·2·3위 레이서 3명을 순서 상관없이 선택하세요!",
            "쌍복승식": "먼저 1위 레이서를, 2·3위 레이서는 순서 상관없이 선택하세요!",
            "삼쌍승식": "1·2·3위 레이서를 순서대로 선택하세요!"
        };
        requiredPicks = { 
            "단승식": 1, "연승식": 1, "복승식": 2, "쌍승식": 2, 
            "삼복승식": 3, "쌍복승식": 3, "삼쌍승식": 3 
        }[betType];
        document.getElementById("pick-message").innerText = pickMessages[betType];
        selectedPlayers = [];
        generatePlayers();
        showStep("step4");
    };

    function generatePlayers() {
        const numPlayers = selectedGame === "cycle" ? 7 : 6;
        const colors = ["white", "black", "red", "blue", "yellow", "green", "hotpink"];
        const selectionDiv = document.getElementById("player-selection");
        selectionDiv.innerHTML = "";
        for (let i = 0; i < numPlayers; i++) {
            const num = i + 1;
            const racer = document.createElement("div");
            racer.classList.add("racer");
            racer.innerText = num;
            racer.style.backgroundColor = colors[i];
            racer.dataset.num = num;
            racer.addEventListener("click", function () {
                toggleSelection(num);
            });
            selectionDiv.appendChild(racer);
        }
        document.getElementById("confirm-btn").classList.remove("hidden");
        updateConfirmButton();
    }

    window.toggleSelection = function (num) {
        if (selectedPlayers.includes(num)) {
            selectedPlayers = selectedPlayers.filter(n => n !== num);
        } else if (selectedPlayers.length < requiredPicks) { 
            selectedPlayers.push(num);
        }
        document.querySelectorAll(".racer").forEach(el => {
            el.classList.toggle("selected", selectedPlayers.includes(parseInt(el.dataset.num)));
        });
        updateConfirmButton();
    };

    function updateConfirmButton() {
        document.getElementById("confirm-btn").disabled = selectedPlayers.length !== requiredPicks;
    }

    window.confirmSelection = function () {
        if (selectedPlayers.length === requiredPicks) {
            console.log("✅ 선택한 선수:", selectedPlayers.join(", "));
            showStep("step5");
        }
    };

    function init3D() {
        const raceTrack = document.getElementById("race-track");
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, raceTrack.offsetWidth / raceTrack.offsetHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(raceTrack.offsetWidth, raceTrack.offsetHeight);
        raceTrack.innerHTML = ""; // 기존 내용 제거
        raceTrack.appendChild(renderer.domElement);

        // 조명
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 100, 100);
        scene.add(light);

        // 트랙 생성
        if (selectedGame === "cycle") {
            // 경륜: 벨로드롬
            const trackGeometry = new THREE.TorusGeometry(50, 10, 16, 100);
            const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x546E90 });
            track = new THREE.Mesh(trackGeometry, trackMaterial);
            track.rotation.x = Math.PI / 2;
            scene.add(track);
        } else {
            // 경정: 물 표면
            const waterGeometry = new THREE.PlaneGeometry(120, 120);
            const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            water.rotation.x = -Math.PI / 2;
            scene.add(water);
            const trackGeometry = new THREE.TorusGeometry(50, 5, 16, 100);
            const trackMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            track = new THREE.Mesh(trackGeometry, trackMaterial);
            track.rotation.x = Math.PI / 2;
            track.position.y = 0.1;
            scene.add(track);
        }

        // 선수 생성
        const numPlayers = selectedGame === "cycle" ? 7 : 6;
        const colors = ["white", "black", "red", "blue", "yellow", "green", "hotpink"];
        for (let i = 0; i < numPlayers; i++) {
            const racerGeometry = new THREE.BoxGeometry(selectedGame === "cycle" ? 2 : 4, 2, selectedGame === "cycle" ? 4 : 2);
            const racerMaterial = new THREE.MeshBasicMaterial({ color: colors[i] });
            const racer = new THREE.Mesh(racerGeometry, racerMaterial);
            racer.position.set(50 * Math.cos(i * 2 * Math.PI / numPlayers), selectedGame === "cycle" ? 0 : 1, 50 * Math.sin(i * 2 * Math.PI / numPlayers));
            racer.name = (i + 1).toString();
            scene.add(racer);
            racers.push({ mesh: racer, angle: i * 2 * Math.PI / numPlayers, speed: 0.01 + Math.random() * 0.02 });
        }

        camera.position.set(0, 50, 70);
        camera.lookAt(0, 0, 0);
    }

    function animate() {
        requestAnimationFrame(animate);
        racers.forEach(racer => {
            racer.angle -= racer.speed; // 시계 반대 방향
            racer.mesh.position.set(50 * Math.cos(racer.angle), selectedGame === "cycle" ? 0 : 1 + Math.sin(racer.angle) * 0.2, 50 * Math.sin(racer.angle));
            racer.mesh.rotation.y = -racer.angle;
        });
        renderer.render(scene, camera);
    }

    window.startRace = function () {
        const startBtn = document.querySelector("#step5 button");
        startBtn.disabled = true;
        startBtn.innerText = "레이스 진행 중...";

        init3D();
        animate();

        setTimeout(() => {
            const results = racers.map(r => ({
                num: parseInt(r.mesh.name),
                position: r.angle
            })).sort((a, b) => a.position - b.position);

            const topPlayers = results.slice(0, requiredPicks).map(r => r.num);
            let userWon;
            if (selectedBetType === "쌍승식" || selectedBetType === "삼쌍승식") {
                userWon = selectedPlayers.every((num, idx) => num === topPlayers[idx]);
            } else if (selectedBetType === "쌍복승식") {
                userWon = selectedPlayers[0] === topPlayers[0] && 
                          topPlayers.slice(1).includes(selectedPlayers[1]) && 
                          topPlayers.slice(1).includes(selectedPlayers[2]);
            } else {
                userWon = selectedPlayers.every(num => topPlayers.includes(num));
            }

            showStep("step6");
            document.getElementById("result-message").innerText = userWon
                ? `🎉 축하합니다! ${selectedPlayers.join(", ")}번 선수가 조건에 맞게 상위권에 들었어요!`
                : `😢 아쉽네요. ${selectedPlayers.join(", ")}번 선수는 조건을 만족하지 못했어요. 결과: ${topPlayers.join(", ")}`;
            startBtn.disabled = false;
            startBtn.innerText = "🚀 경주 시작";
            racers = []; // 다음 경주를 위해 초기화
        }, 5000);
    };

    window.goBack = function () {
        const currentStep = document.querySelector(".step:not(.hidden)").id;
        const stepMap = { "step2": "step1", "step3": "step2", "step4": "step3", "step5": "step4" };
        if (stepMap[currentStep]) showStep(stepMap[currentStep]);
    };

    window.restartGame = function () {
        selectedGame = null;
        selectedDifficulty = null;
        selectedBetType = null;
        selectedPlayers = [];
        requiredPicks = 1;
        showStep("step1");
        document.getElementById("betting-options").innerHTML = "";
        document.getElementById("player-selection").innerHTML = "";
        document.getElementById("race-track").innerHTML = "";
        document.getElementById("result-message").innerText = "";
        document.getElementById("confirm-btn").classList.add("hidden");
    };
});
