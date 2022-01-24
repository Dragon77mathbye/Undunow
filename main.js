let score = 0;
let maxTime = 10000;
let time = 10000;
let timerDecrease;
let questionNum = 0;
let correctAnswers = 0;
let incorrect = 0;
let unanswered = 0;
let totalQuestions = game.questions.length;
let streak = 0;

async function loadGame(gameFile) {
    document.getElementById("uploadGame").style.display = "none";
    document.getElementById("startScreen").style.display = "";
    game = JSON.parse(await gameFile.text());
    totalQuestions = game.questions.length;
    if (game.shuffle === undefined || game.shuffle) game.questions = shuffle(game.questions);
    for (let i = 0; i < game.questions.length; i++) if (game.questions[i].shuffle === undefined || game.questions[i].shuffle) game.questions[i].answers = shuffle(game.questions[i].answers);
}

function answer(isCorrect, pts, timeUp) {
    const previousScore = score;
    clearInterval(timerDecrease);
    if (isCorrect) {
        correctAnswers++;
        streak++;
        document.getElementById("isCorrect").style.color = "#0b0";
        document.getElementById("isCorrect").innerText = "Correct! :D";
        score += pts * (time / maxTime);
    } else {
        document.getElementById("isCorrect").style.color = "#f00";
        if (timeUp) {
            document.getElementById("isCorrect").innerText = "Time's Up! :(";
            unanswered++;
        } else {
            document.getElementById("isCorrect").innerText = "Incorrect! :(";
            incorrect++;
        }
        streak = 0;
        score -= pts;
    }
    document.getElementById("score").innerText = `Score: ${score >= 10000 ? toNumberName(score, "default", true, 1) : Math.floor(score).toLocaleString()}`;
    document.getElementById("addScore").innerText = (score - previousScore >= 0) ? `+${toNumberName(score - previousScore, "default", true, 1)}` : toNumberName(score - previousScore, "default", true, 1);
    document.getElementById("questions").style.display = "none";
    document.getElementById("answerScreen").style.display = "";
    document.getElementById("correct").innerText = `Correct: ${correctAnswers}`;
    document.getElementById("incorrect").innerText = `Incorrect: ${incorrect}`;
    document.getElementById("unanswered").innerText = `Unanswered: ${unanswered}`;
    document.getElementById("streak").innerText = `Current Streak: ${streak}`;
    document.getElementById("accuracyStats").style.color = `hsl(${correctAnswers / (correctAnswers + incorrect + unanswered) * 120}, 100%, 60%)`;
    document.getElementById("accuracyStats").innerText = `Accuracy: ${Math.round(correctAnswers / (correctAnswers + incorrect + unanswered) * 100)}%`;
}

function shake(elem, radius) {
    if (radius <= 0 || isNaN(radius)) return false;
    elem.style.position = "relative";
    elem.style.top = `${Math.random() * (radius * 2) - radius}px`;
    elem.style.left = `${Math.random() * (radius * 2) - radius}px`;
}

function start() {
    document.getElementById("questionNumber").innerText = `1/${totalQuestions}`;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("game").style.display = "";
    let output = "";
    for (let i = 0; i < game.questions.length; i++) {
        output += `<div id="question${i}" style="display: ${(0 === i) ? "" : "none"};" class="answers"><p style="text-align: center; font-size: 150%; position: fixed; float: left; max-width: 20vw; overflow: hidden;">${game.questions[i].text}</p>`;
        for (let a = 0; a < game.questions[i].answers.length; a++) {
            if (typeof game.questions[i].answers[a] === "object") {
                game.questions[i].answers[a].text = String(game.questions[i].answers[a].text);
            } else {
                if (game.questions[i].excludedChars === undefined) game.questions[i].excludedChars = [];
                game.questions[i].answers[a] = String(game.questions[i].answers[a]);
                for (const g of game.questions[i].excludedChars) {
                    game.questions[i].answers[a] = game.questions[i].answers[a].replaceAll(g, "");
                }
            }
            const points = (game.questions[i].pts === undefined) ? 1000 : game.questions[i].pts;
            const penalty = (game.questions[i].penalty === undefined) ? 0 : game.questions[i].penalty;
            if (a % 4 === 0) {
                output += "<br>";
            }
            if (game.questions[i].type === undefined || game.questions[i].type === "single") {
                output += `<button style="width: ${(game.questions[i].answers.length <= 4) ? 60 / game.questions[i].answers.length : 15}%; font-size: ${7000 / game.questions[i].answers[a].length < 100 ? game.questions[i].answers[a].length * 1.25 : 125}%;" onclick="answer(${game.questions[i].answers[a].correct}, ${game.questions[i].answers[a].correct ? points : penalty});">${game.questions[i].answers[a].text}</button>`;
            } else if (game.questions[i].type === "text") {
                game.questions[i].answers[a] = game.questions[i].answers[a].toLowerCase();
            }
        }
        if (game.questions[i].type === "text" || game.questions[i].type === "number") {
            const penalty = (game.questions[i].penalty === undefined) ? 0 : game.questions[i].penalty;
            output += `<input type="${game.questions[i].type}" id="question${i}Answer"><br><br><button style="max-width: 60%;" onclick="let v = String(document.getElementById('question${i}Answer').value.toLowerCase()); for (const g of game.questions[${i}].excludedChars) {v = v.replaceAll(g, '')} if (game.questions[${i}].answers.includes(v)) {answer(true, ${game.questions[i].pts !== undefined ? game.questions[i].pts : 1000})} else {answer(false, ${penalty});}">Submit</button>`;
        }
        output += "</div>";
    }
    maxTime = (game.questions[0].time === undefined) ? 20000 : game.questions[0].time * 1000;
    startTimer();
    document.getElementById("questions").innerHTML = output;
}

function nextQuestion(n) {
    questionNum++;
    for (let i = 0; i < game.questions.length; i++) {
        document.getElementById(`question${i}`).style.display = (n === i) ? "" : "none";
    }
    if (questionNum < game.questions.length) {
        document.getElementById("questions").style.display = "";
        document.getElementById("questionNumber").innerText = `${questionNum + 1}/${totalQuestions}`;
    } else {
        document.getElementById("timer").style.display = "none";
        document.getElementById("timerText").style.display = "none";
        document.body.style.background = `hsl(${correctAnswers / (correctAnswers + incorrect + unanswered) * 120}, 100%, 30%)`;

        function sam(msg) {
            // Set accuracy message (Sam)
            document.getElementById("accuracyMessage").innerHTML = msg;
        }

        let accuracy = correctAnswers / (correctAnswers + incorrect + unanswered);
        if (accuracy > 1 || accuracy < 0 || isNaN(accuracy)) {
            sam("why u hack :(");
        } else if (accuracy === 1) {
            sam("ez 100");
        } else if (accuracy >= 0.9) {
            sam("Alright, pretty good!");
        } else if (accuracy >= 0.8) {
            sam("Not bad!");
        } else if (accuracy >= 0.7) {
            sam("I mean, I guess it's still passing");
        } else if (accuracy >= 0.6) {
            sam("Just barely didn't pass");
        } else if (accuracy >= 0.5) {
            sam("Did you even try to understand?");
        } else if (accuracy >= 0.4) {
            sam("That's less than half, you idiot!");
        } else if (accuracy >= 0.3) {
            sam("Are you okay?");
        } else if (accuracy >= 0.2) {
            sam("you are actually garbage");
        } else if (accuracy >= 0.1) {
            sam("dude you suck at this");
        } else if (accuracy > 0) {
            sam("you're terrible at this");
        } else {
            sam("wait 5 seconds...");
            setTimeout(() => {
                sam("<span style='color: red;'>You didn't get a single one right you stupid, idiotic, pathetic, worthless failure. You're a disappointment to mankind. A horrible mistake. You're better off dead. You may as well leave now. Go. Get out of here. No one wants to see your ugly face. When anyone asks where you've been, I'm going to tell them that you're gone. You don't deserve to live. Your life is a lie. No one cares about you, and no one loves you even in the slightest. Your family is horrible, and everyone that you love will suffer horribly, and you will be forced to watch as they are slowly roasted over a fire, and then you get to be roasted too. The remains of your body will not be buried, and instead will be cooked into soup that the person you hate the most will eat while knowing what's inside it and will be eaten. I don't even know if you can be called a human. You are not one. You are a creature. A horrible creature. An ugly, idiotic, horrible creature. Your brain is nothing. You have no brain. No knowledge. If someone were to open your skull, there would be nothing inside it. You have no intelligence, no skills. You are the lamest excuse for a human or even an object. If you die, no one will care. No one will notice. You make no positive influence to this world. Only bad influences. Anyone that you know, anyone at all, wished you were dead. And you should be. You do not deserve to live on this planet. You have ruined everyone's lives. I can't believe I just wrote that entire thing, but I did. Screw you.</span>");
            }, 5000);
        }
        document.getElementById("accuracy").innerText = `Accuracy: ${correctAnswers} / ${correctAnswers + incorrect + unanswered} (${Math.round(accuracy * 100)}%)`;
        document.getElementById("endScreen").style.display = "";
    }
    document.getElementById("answerScreen").style.display = "none";
    maxTime = (game.questions[n].time === undefined) ? 20000 : game.questions[n].time * 1000;
    startTimer();
}

function startTimer() {
    time = maxTime;
    const startTime = Date.now();
    document.getElementById("timer").max = maxTime;
    timerDecrease = setInterval(() => {
        time = maxTime + startTime - Date.now();
        if (time <= 0) {
            clearInterval(timerDecrease);
            answer(false, 0, true);
        }
        document.getElementById("timerText").innerText = secondsToOtherUnits(time / 1000);
        document.getElementById("timer").style.setProperty("--c", String(time / maxTime * 120));
        document.getElementById("timer").value = time;
    }, 0);
}

function secondsToOtherUnits(time) {
    if (time === Infinity) {
        return "Forever";
    } else if (time >= 2 ** 53) {
        return `${toNumberName(time / 31536000)} years`;
    } else if (time >= 31536000) {
        return `${Math.floor(time / 31536000)} years ${secondsToOtherUnits(time % 31536000)}`;
    } else if (time >= 86400) {
        return `${Math.floor(time / 86400)} days ${secondsToOtherUnits(time % 86400)}`;
    } else if (time >= 3600) {
        return `${Math.floor(time / 3600)} hours ${secondsToOtherUnits(time % 3600)}`;
    } else if (time >= 60) {
        return `${Math.floor(time / 60)} minutes ${secondsToOtherUnits(time % 60)}`;
    } else if (time >= 1) {
        return `${Math.floor(time)} seconds ${secondsToOtherUnits(time % 1)}`;
    } else if (time > 0) {
        return `${Math.round(time * 1000)} milliseconds`;
    } else {
        return "";
    }
}

setInterval(() => {
    let a = streak - 10;
    let b = 180 - streak * 10;
    if (a < 0) a = 0;
    if (b < 0) b = 0;
    shake(document.getElementById("streak"), Math.sqrt(streak - 5));
    document.getElementById("fire").style.height = `${a}%`;
    document.getElementById("fire").style.top = `${100 - a}%`;
    document.getElementById("streak").style.color = `hsl(${b}, 100%, 33%)`;
}, 20);