
function resizeCanvas() {
    canvas.width = Number(window.innerWidth * 0.98);
    canvas.height = canvas.width * (4/9);
}

const canvas = document.getElementById("main");
const xCordinateLabel = document.getElementById("cursorCordinateX");
const yCordinateLabel = document.getElementById("cursorCordinateY");
const cursorItemSelector = document.getElementById("cursorItem");
const marcherCountValue = document.getElementById("cursorItemMarcherCount");
const cursorItemRadius = document.getElementById("cursorItemRadius");
const objectCreationDataObject = document.getElementById("objectCreationDataObject");
const radiusDiv = document.getElementById("radius");
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
var circleColor = "#FFFFFF";
var canvasMouseX = new Number(0);
var canvasMouseY = new Number(0);
var stepsPer5Yards = 8;  // If Change Reset yardLineArrayinSteps Var
var yardLineArrayinSteps = [yardsToSteps(10), yardsToSteps(15), yardsToSteps(20), yardsToSteps(25), yardsToSteps(30), yardsToSteps(35), yardsToSteps(40), yardsToSteps(45), yardsToSteps(50), yardsToSteps(55), yardsToSteps(60), yardsToSteps(65), yardsToSteps(70), yardsToSteps(75), yardsToSteps(80), yardsToSteps(85), yardsToSteps(90)];
var hashArrayinSteps = [0, yardsToSteps(17.5), yardsToSteps(35), yardsToSteps(53.125)];
var fieldObjects = {"Circles": [],"Arcs": [],"Lines": [],"Blocks": [],"Custom Objects": []};
var cursorItemSelected = "circle";
var currentSelectedObject = {};
var objectSelected = false;
var CIDs = 0;
var AIDs = 0;
var LIDs = 0;
var BIDs = 0;

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
function stepsToHumanReadableCordsY(steps) {
    let hash = hashArrayinSteps.reduce(function(prev, curr) {return (Math.abs(curr - steps) < Math.abs(prev - steps) ? curr : prev);});
    let strHash = "";
    if (hash == 0) {
        strHash = "back sideline";
    } else if (hash == yardsToSteps(17.5)) {
        strHash = "back hash";
    } else if (hash == yardsToSteps(35)) {
        strHash = "front hash";
    } else {
        strHash = "front sideline";
    }
    if (steps > hash) {
        return String(steps - hash) + " infront of the " + strHash
    } else if (steps < hash) {
        return String(hash - steps) + " behind the " + strHash
    } else {
        return "On the " + strHash
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
function drawMouse() {
    ctx.fillStyle = fieldCursorColor;
    ctx.beginPath();
    ctx.arc(stepsToPixles(pixleToClosestStep(canvasMouseX)), stepsToPixles(pixleToClosestStep(canvasMouseY)), yardsToPixles(0.5), 0, 2*Math.PI);
    ctx.fill();
    xCordinateLabel.innerText = "X Cordinate: " + stepsToHumanReadableCordsX(pixleToClosestStep(canvasMouseX));
    yCordinateLabel.innerText = "Y Cordinate: " + stepsToHumanReadableCordsY(pixleToClosestStep(canvasMouseY));
    if (cursorItemSelected == "circle") {
        ctx.fillStyle = circleColor;
        ctx.beginPath();
        ctx.arc(stepsToPixles(pixleToClosestStep(canvasMouseX)), stepsToPixles(pixleToClosestStep(canvasMouseY)), stepsToPixles(cursorItemRadius.value), 0, 2*Math.PI);
        ctx.stroke();
    }
    // else if (cursorItemSelected == "arc") {}
    // else if (cursorItemSelected == "line") {}
    // else if (cursorItemSelected == "block") {}
    // else if (cursorItemSelected == "custom") {}
}
function drawFieldObjects() {
    ctx.fillStyle = circleColor;
    for (let i = 0; i < fieldObjects.Circles.length; i++) {
        ctx.beginPath();
        ctx.arc(stepsToPixles(fieldObjects.Circles[i].X), stepsToPixles(fieldObjects.Circles[i].Y), stepsToPixles(Number(fieldObjects.Circles[i].Radius)), 0, 2*Math.PI);
        ctx.stroke();
    }
}
// var fieldObjects = {
//     "Circles": [{"X": 0, "Y": 0, "CID": 0, "Radius": 5, "MarcherValue": 5}],
//     "Arcs": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "AID": 0, "Radius": 5, "MarcherValue": 5}],
//     "Lines": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "LID": 0, "MarcherValue": 5}],
//     "Blocks": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "X3": 0, "Y3": 0, "BID": 0, "MarcherValue": 5}],
//     "Custom Objects": [{"TODO": "Make"}]};
function onMouseClickCommand() {
    console.log("Mouse Click: (" + String(canvasMouseX) + ", " + String(canvasMouseY) + ")");
    console.log("People in Form: " + String(marcherCountValue.value));
    if (cursorItemSelected == "circle") {
        if (objectSelected == false) {
            CIDs++;
            fieldObjects.Circles.push({"X": pixleToClosestStep(structuredClone(canvasMouseX)), "Y": pixleToClosestStep(structuredClone(canvasMouseY)), "CID": structuredClone(CIDs), "Radius": structuredClone(cursorItemRadius.value), "MarcherValue": structuredClone(marcherCountValue.value)});
        }
    }
    else if (cursorItemSelected == "arc") {alert("TODO: Arc Objects");objectCreationDataObject.innerText = "Select A Second Point";}
    else if (cursorItemSelected == "line") {alert("TODO: Line Objects");}
    else if (cursorItemSelected == "block") {alert("TODO: Block Objects");}
    else if (cursorItemSelected == "custom") {alert("TODO: Custom Objects");}
}

function drawLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fieldColor;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    drawYardlines();
    drawHashes();
    drawNumbers();
    drawFieldObjects();
    drawMouse();
}

setInterval(drawLoop, loopRate);

cursorItemSelector.addEventListener("change", function(e) {
    cursorItemSelected = cursorItemSelector.value;
    if (cursorItemSelected == "custom") {
        objectCreationDataObject.innerText = "Select First Custom Point";
    } else if (cursorItemSelected == "block") {
        objectCreationDataObject.innerText = "Select First Block Point";
    } else if (cursorItemSelected == "line") {
        objectCreationDataObject.innerText = "Select First Line Point";
    } else if (cursorItemSelected == "arc") {
        objectCreationDataObject.innerText = "Select First Arc Point";
    } else {
        objectCreationDataObject.innerText = "Click Field to Create a Circle";
    }
    if (cursorItemSelected == "line" || cursorItemSelected == "block" || cursorItemSelected == "custom") {
        radiusDiv.style.visibility = 'hidden';
    } else {
        radiusDiv.style.visibility = 'visible';
    }
});

canvas.addEventListener("mousemove", function(e) { 
    var cRect = canvas.getBoundingClientRect();
    canvasMouseX = Math.round(e.clientX - cRect.left);
    canvasMouseY = Math.round(e.clientY - cRect.top);
});

canvas.addEventListener("mousedown", onMouseClickCommand)