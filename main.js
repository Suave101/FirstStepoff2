
function resizeCanvas() {
    canvas.width = Number(window.innerWidth * 0.98);
    canvas.height = canvas.width * (4/9);
}

const canvas = document.getElementById("main");
const xCordinateLabel = document.getElementById("cursorCordinateX");
const yCordinateLabel = document.getElementById("cursorCordinateY");
resizeCanvas();
window.addEventListener("resize", resizeCanvas)
const ctx = canvas.getContext("2d", { alpha: false });
var running = true;
var loopRate = 10;
var fieldColor = "#008507";
var yardlineColor = "#FFFFFF";
var hashColor = "#FFFFFF";
var numbersColor = "#FFFFFF";
var fieldCursorColor = "#5000a1";
var canvasMouseX = new Number(0);
var canvasMouseY = new Number(0);
var stepsPer5Yards = 8;  // If Change Reset yardLineArrayinSteps Var
var yardLineArrayinSteps = [yardsToSteps(10), yardsToSteps(15), yardsToSteps(20), yardsToSteps(25), yardsToSteps(30), yardsToSteps(35), yardsToSteps(40), yardsToSteps(45), yardsToSteps(50), yardsToSteps(55), yardsToSteps(60), yardsToSteps(65), yardsToSteps(70), yardsToSteps(75), yardsToSteps(80), yardsToSteps(85), yardsToSteps(90)];

function stepsToHumanReadableCordsX(steps) {
    let yardline = yardLineArrayinSteps.reduce(function(prev, curr) {return (Math.abs(curr - steps) < Math.abs(prev - steps) ? curr : prev);});
    if (yardline > 50) {
        if (steps > yardline) {
            return String(steps - yardline) + " steps outside the " + String(50 - ((stepToYard(yardline) - 10) - 50)) + " yardline";
        } else if (steps < yardline) {
            return String(yardline - steps) + " steps inside the " + String(50 - ((stepToYard(yardline) - 10) - 50)) + " yardline";
        } else {
            return "On the " + String(50 - ((stepToYard(yardline) - 10) - 50));
        }
    }
    if (steps > yardline) {
        return String(steps - yardline) + " steps inside the " + String(stepToYard(yardline) - 10) + " yardline";
    } else if (steps < yardline) {
        return String(yardline - steps) + " steps outside the " + String(stepToYard(yardline) - 10) + " yardline";
    } else {
        return "On the " + String(stepToYard(yardline) - 10);
    }
}

function yardsToPixles(number) {
    return number * canvas.width/120;
}

function stepsToPixles(steps) {
    return steps * canvas.width/(24*stepsPer5Yards);
}

function pixleToClosestStep(y) {
    return Math.round(y/(canvas.width/(24*stepsPer5Yards)));
}

function stepToYard(steps) {
    return steps * (5/stepsPer5Yards)
}

function yardsToSteps(yards) {
    return yards/(5/stepsPer5Yards);
}

function drawYardlines() {
    ctx.strokeStyle = yardlineColor;
    for (let i = 10; i < 111; i = i + 5) {
        ctx.beginPath();
        ctx.moveTo(yardsToPixles(i), 0);
        ctx.lineTo(yardsToPixles(i), canvas.height);
        ctx.stroke();
    }
}

function drawHashes() {
    ctx.strokeStyle = hashColor;
    for (let i = 10; i < 111; i++) {
        ctx.beginPath();
        ctx.moveTo(yardsToPixles(i), yardsToPixles(160/9));
        ctx.lineTo(yardsToPixles(i), yardsToPixles(166/9));
        ctx.stroke();
    }
    for (let i = 10; i < 111; i++) {
        ctx.beginPath();
        ctx.moveTo(yardsToPixles(i), yardsToPixles(320/9));
        ctx.lineTo(yardsToPixles(i), yardsToPixles(314/9));
        ctx.stroke();
    }
}

function drawNumbers() {
    ctx.fillStyle = numbersColor;
    for (let i = 20; i < 110; i = i + 10) {
        if (i-10 > 50) {
            ctx.fillText(String(50-((i-10)-50)), yardsToPixles(i-(2/3)), yardsToPixles(133/3), yardsToPixles(4/3));
        } else {
            ctx.fillText(String(i-10), yardsToPixles(i-(2/3)), yardsToPixles(133/3), yardsToPixles(4/3));
        }
    }
    for (let i = 20; i < 110; i = i + 10) {
        if (i-10 > 50) {
            ctx.fillText(String(50-((i-10)-50)), yardsToPixles(i-(2/3)), yardsToPixles(9), yardsToPixles(4/3));
        } else {
            ctx.fillText(String(i-10), yardsToPixles(i-(2/3)), yardsToPixles(9), yardsToPixles(4/3));
        }
    }
}

canvas.addEventListener("mousemove", function(e) { 
    var cRect = canvas.getBoundingClientRect();
    canvasMouseX = Math.round(e.clientX - cRect.left);
    canvasMouseY = Math.round(e.clientY - cRect.top);
});

function drawMouse() {
    ctx.fillStyle = fieldCursorColor;
    ctx.beginPath();
    ctx.arc(stepsToPixles(pixleToClosestStep(canvasMouseX)), stepsToPixles(pixleToClosestStep(canvasMouseY)), yardsToPixles(0.5), 0, 2*Math.PI);
    ctx.fill();
    xCordinateLabel.innerText = "X Cordinate: " + stepsToHumanReadableCordsX(pixleToClosestStep(canvasMouseX));
    yCordinateLabel.innerText = "Y Cordinate: " + String(pixleToClosestStep(canvasMouseY));
}

function drawLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fieldColor;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    drawYardlines();
    drawHashes();
    drawNumbers();
    drawMouse();
}

setInterval(drawLoop, loopRate);
