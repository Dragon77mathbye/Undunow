let gc = {
    questions: [],
    shuffle: true,
    savedRecently: true,
    addQuestion: type => {
        gc.questions.push({
            type: type,
            text: "Sample question text (Click to edit)",
            answers: [],
            shuffle: true,
            time: 20,
            pts: 1000,
            penalty: 0,
            excludedChars: []
        });
        gc.refresh();
    },
    addAnswer: (index, type) => {
        if (type === "single" || type === undefined) {
            gc.questions[index].answers.push({
                text: "Sample answer text (Click to edit)",
                correct: false
            });
        } else {
            gc.questions[index].answers.push("Click to change");
        }
        gc.refresh();
    },
    refresh: () => {
        gc.savedRecently = false;
        let output = `<button onclick="gc.addQuestion('single');" style="width: 60%; left: 20%; position: fixed; min-height: 24px; top: 10px;">New Multiple Choice Question</button>`;
        output += `<button onclick="gc.addQuestion('text');" style="width: 60%; left: 20%; position: fixed; min-height: 24px; top: 40px;">New Text/Typing Question</button>`;
        output += `<button onclick="gc.addQuestion('number');" style="width: 60%; left: 20%; position: fixed; min-height: 24px; top: 70px;">New Number Question</button>`;
        output += `<br>`.repeat(8);
        output += `<p class="blueHover" onclick="gc.shuffle = !gc.shuffle; gc.refresh();" id='shuffleQuestions'>${!gc.shuffle ? 'Not ' : ''}Shuffling Questions</p>`;
        for (let i = 0; i < gc.questions.length; i++) {
            if (gc.questions[i].excludedChars === undefined) gc.questions[i].excludedChars = [];
            output += `<div class="gcQuestion" style="text-align: left;"><button onclick="gc.questions.splice(${i}, 1); gc.refresh();" style="width: 120px;">Delete</button><p class="blueHover" style="font-size: 250%; text-align: center;" onclick="const questionText = prompt('Set question text to:'); gc.questions[${i}].text = questionText !== null ? questionText : gc.questions[${i}].text; gc.refresh();">${gc.questions[i].text}</p><button onclick="gc.addAnswer(${i}, '${gc.questions[i].type}');">New Answer</button><p class="blueHover" onclick="const t = prompt('How much time, in seconds, to answer this question?'); gc.questions[${i}].time = t !== null ? Number(t) : gc.questions[${i}].time; gc.refresh();" style="text-align: left;">${secondsToOtherUnits(gc.questions[i].time === undefined ? 20 : gc.questions[i].time)}</p><p class="blueHover" style="text-align: left;" onclick="gc.questions[${i}].shuffle = !gc.questions[${i}].shuffle; gc.refresh();">${gc.questions[i].shuffle ? "Shuffling Answers" : "Not Shuffling Answers"}</p><p class="blueHover" onclick="const p = Number(prompt('How many points should this question give?')); gc.questions[${i}].pts = p !== undefined ? p : gc.questions[${i}].pts; gc.refresh();">${toNumberName(gc.questions[i].pts === undefined ? 1000 : gc.questions[i].pts, "default", true)} points</p><p class="blueHover" style="text-align: left;" onclick="const p = prompt('Penalty for getting question wrong?'); gc.questions[${i}].penalty = p !== null ? -p : gc.questions[${i}].penalty; gc.refresh();">${gc.questions[i].penalty === undefined || gc.questions[i].penalty === 0 ? "No penalty" : `Penalty: ${gc.questions[i].penalty < 0 ? "+" : "-"}${String(gc.questions[i].penalty).replace("-", "")} points`}</p>`;
            if (gc.questions[i].type === "text" || gc.questions[i].type === "number") {
                output += `<div class="gcQuestion"><p style="font-size: 18px;">Excluded Characters/Phrases (These characters/phrases will be ignored)</p><p class="blueHover" onclick="gc.questions[${i}].excludedChars.push('Click to change'); gc.refresh();">New excluded character/phrase</p>`;
                for (let c = 0; c < gc.questions[i].excludedChars.length; c++) {
                    output += `<div style="background: #00000080;"><p class="blueHover" style="min-width: 8px; min-height: 8px;" onclick="const c = prompt('What character/phrase to exclude?'); gc.questions[${i}].excludedChars[${c}] = c !== null ? c : gc.questions[${i}].excludedChars[${c}]; gc.refresh();">"${gc.questions[i].excludedChars[c]}"</p><p class="redHover" onclick="gc.questions[${i}].excludedChars.splice(${c}, 1); gc.refresh();">Delete</p></div>`;
                }
                output += `</div>`;
            }
            for (let a = 0; a < gc.questions[i].answers.length; a++) {
                if (typeof gc.questions[i].answers[a] === "object") {
                    output += `<div class="gcQuestion" style="text-align: center;"><p class="blueHover" onclick="const t = prompt('What should the answer text be?'); gc.questions[${i}].answers[${a}].text = t !== null ? t : gc.questions[${i}].answers[${a}].text; gc.refresh();" style="font-size: 24px;">${gc.questions[i].answers[a].text}</p><p class="blueHover" onclick="gc.questions[${i}].answers[${a}].correct = !gc.questions[${i}].answers[${a}].correct; gc.refresh();">${gc.questions[i].answers[a].correct === undefined || gc.questions[i].answers[a].correct === false ? "Incorrect" : "Correct"}</p><p onclick="gc.questions[${i}].answers.splice(${a}, 1); gc.refresh();" class="redHover">Delete</p></div>`;
                } else {
                    output += `<div class="gcQuestion" style="text-align: center;"><p class="blueHover" onclick="const t = prompt('What should the answer text be?'); gc.questions[${i}].answers[${a}] = t !== null ? t : gc.questions[${i}].answers[${a}]; gc.refresh();" style="font-size: 24px;">${gc.questions[i].answers[a]}</p><p onclick="gc.questions[${i}].answers.splice(${a}, 1); gc.refresh();" class="redHover">Delete</p></div>`;
                }
            }
            output += `</div>`;
        }
        let foo = {
            questions: gc.questions,
            shuffle: gc.shuffle
        };
        document.getElementById("gc").innerHTML = output;
        document.getElementById("output2").value = JSON.stringify(foo, null, 2);
        document.getElementById("output2").style.height = `${document.getElementById("output2").scrollHeight}px`;
    }
}

function leaveGameCreator() {
    document.getElementById('gameCreator').style.display = 'none';
    document.getElementById('uploadGame').style.display = '';
}

window.addEventListener('beforeunload', e => {
    if (!gc.savedRecently) {
        const msg = "Wait! You haven't saved your project recently. To prevent it from being deleted, make sure you save it before closing the tab!";
        (e || window.event).returnValue = msg;
        return msg;
    }
});