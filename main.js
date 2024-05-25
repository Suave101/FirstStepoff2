
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
const cursorItemDegOffset = document.getElementById("cursorItemDegOffset");
const objectCreationDataObject = document.getElementById("objectCreationDataObject");
const radiusDiv = document.getElementById("radius");
const degOffsetDiv = document.getElementById("degOffset");
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
var fieldCursorColorSecondary = "#d916bf";
var circleCenterColor = "#a83232";
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
var CIDs = 0; // Circle ID's
var AIDs = 0; // Arc ID's
var LIDs = 0; // Line ID's
var BIDs = 0; // Block ID's
var pointCache = {};
var cursorMode = 0;
// 0: Free click because no action initiated (Always when Circle or Individual Mode. When esc pressed, all actions canceled and
//    Mode is reset to 0)
// 1: Arc Second Point is to be selected
// 2: Line Second Point is to be selected
// 3: Block Second Point is to be selected
// 4: Block Third Point is to be selected
// 5: Edit mode Circle (Implement Custom Menu)
// 6: Edit mode Arc (Implement Custom Menu)
// 7: Edit mode Line (Implement Custom Menu)
// 8: Edit mode Block (Implement Custom Menu)


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
        return String(steps - hash) + " infront of the " + strHash;
    } else if (steps < hash) {
        return String(hash - steps) + " behind the " + strHash;
    } else {
        return "On the " + strHash;
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
function arcBetweenTwoPoints(x1, y1, x2, y2) {
    ctx.fillStyle = circleColor;
    ctx.beginPath();
    ctx.arc(((x1+x2)/2), ((y1+y2)/2), (Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)))/2, 0, Math.PI, false);
    ctx.stroke();
    console.log("Rahh");
}
function drawEquidistantPoints(centerX, centerY, radius, numPoints, offsetDeg) {
    const angleIncrement = Math.PI * 2 / numPoints;
    let theta = 0 + (offsetDeg*(Math.PI/180.0));
  
    for (let i = 0; i < numPoints; i++) {
        const pointX = radius * Math.cos(theta) + centerX;
        const pointY = radius * Math.sin(theta) + centerY;
        // Draw the point (adjust width and height for point size)
        ctx.fillStyle = circleCenterColor;
        ctx.beginPath();
        ctx.arc(pointX, pointY, yardsToPixles(0.5), 0, 2*Math.PI);
        ctx.fill();
  
        theta += angleIncrement;
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
        ctx.fillStyle = circleCenterColor;
        drawEquidistantPoints(stepsToPixles(pixleToClosestStep(canvasMouseX)), stepsToPixles(pixleToClosestStep(canvasMouseY)), stepsToPixles(cursorItemRadius.value), Number(marcherCountValue.value), Number(cursorItemDegOffset.value));
    }
    else if (cursorItemSelected == "arc") {
        if (cursorMode == 1) {
            ctx.fillStyle = fieldCursorColorSecondary;
            ctx.beginPath();
            ctx.arc(stepsToPixles(pointCache["X1"]), stepsToPixles(pointCache["Y1"]), yardsToPixles(0.5), 0, 2*Math.PI);
            ctx.fill();
            arcBetweenTwoPoints(stepsToPixles(pointCache["X1"]), stepsToPixles(pointCache["Y1"], stepsToPixles(pixleToClosestStep(canvasMouseX)), stepsToPixles(pixleToClosestStep(canvasMouseY))));
        }
    }
    // else if (cursorItemSelected == "line") {}
    // else if (cursorItemSelected == "block") {}
    // else if (cursorItemSelected == "custom") {}
}
function drawFieldObjects() {
    // Draw Circles

    ctx.fillStyle = circleColor;
    // Draw White Circle
    for (let i = 0; i < fieldObjects.Circles.length; i++) {
        ctx.beginPath();
        ctx.arc(stepsToPixles(fieldObjects.Circles[i].X), stepsToPixles(fieldObjects.Circles[i].Y), stepsToPixles(Number(fieldObjects.Circles[i].Radius)), 0, 2*Math.PI);
        ctx.stroke();
    }
    // Draw Red Centers
    for (let i = 0; i < fieldObjects.Circles.length; i++) {
        ctx.fillStyle = circleCenterColor;
        ctx.beginPath();
        ctx.arc(stepsToPixles(fieldObjects.Circles[i].X), stepsToPixles(fieldObjects.Circles[i].Y), yardsToPixles(0.5), 0, 2*Math.PI);
        ctx.fill();
    }
    // Draw Marchers on Circle
    for (let i = 0; i < fieldObjects.Circles.length; i++) {
        // fieldObjects.Circles[i].MarcherValue
        ctx.fillStyle = circleCenterColor;
        drawEquidistantPoints(stepsToPixles(fieldObjects.Circles[i].X), stepsToPixles(fieldObjects.Circles[i].Y), stepsToPixles(Number(fieldObjects.Circles[i].Radius)), Number(fieldObjects.Circles[i].MarcherValue), Number(fieldObjects.Circles[i].degOffset));
    }
}
// var fieldObjects = {
//     "Circles": [{"X": 0, "Y": 0, "CID": 0, "Radius": 5, "MarcherValue": 5, "degOffset": 80}],
//     "Arcs": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "AID": 0, "Radius": 5, "MarcherValue": 5}],
//     "Lines": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "LID": 0, "MarcherValue": 5}],
//     "Blocks": [{"X1": 0, "Y1": 0, "X2": 0, "Y2": 0, "X3": 0, "Y3": 0, "BID": 0, "MarcherValue": 5}],
//     "Custom Objects": [{"TODO": "Make"}]};
// var cursorMode = 0;
// 0: Free click because no action initiated (Always when Circle or Individual Mode. When esc pressed, all actions canceled and
//    Mode is reset to 0)
// 1: Arc Second Point is to be selected
// 2: Line Second Point is to be selected
// 3: Block Second Point is to be selected
// 4: Block Third Point is to be selected
function onMouseClickCommand() {
    console.log("Mouse Click: (" + String(canvasMouseX) + ", " + String(canvasMouseY) + ")");
    console.log("People in Form: " + String(marcherCountValue.value));
    if (cursorItemSelected == "circle") {
        pointCache = {};
        if (objectSelected == false) {
            CIDs++;
            fieldObjects.Circles.push({
                "X": pixleToClosestStep(structuredClone(canvasMouseX)),
                "Y": pixleToClosestStep(structuredClone(canvasMouseY)),
                "CID": structuredClone(CIDs),
                "Radius": structuredClone(cursorItemRadius.value),
                "MarcherValue": structuredClone(marcherCountValue.value),
                "degOffset": structuredClone(cursorItemDegOffset.value)
            });
        }
    } else if (cursorItemSelected == "arc") {
        if (cursorMode == 0) {
            pointCache["X1"] = pixleToClosestStep(structuredClone(canvasMouseX));
            pointCache["Y1"] = pixleToClosestStep(structuredClone(canvasMouseY));
            objectCreationDataObject.innerText = "Select Second Arc Point";
            cursorMode = 1;
        } else if (cursorMode == 1) {
            objectCreationDataObject.innerText = "Select First Arc Point";
            cursorMode = 0;
            AIDs++;
            fieldObjects.Arcs.push({
                "X2": pixleToClosestStep(structuredClone(canvasMouseX)),
                "Y2": pixleToClosestStep(structuredClone(canvasMouseY)),
                "X1": pointCache["X1"],
                "Y1": pointCache["Y1"],
                "AID": structuredClone(AIDs),
                "Radius": structuredClone(cursorItemRadius.value),
                "MarcherValue": structuredClone(marcherCountValue.value)
            });
            pointCache = {};
        }
    } else if (cursorItemSelected == "line") {alert("TODO: Line Objects");}
    else if (cursorItemSelected == "block") {alert("TODO: Block Objects");}
    else if (cursorItemSelected == "custom") {alert("TODO: Custom Objects");}
    else if (cursorItemSelected == "individual") {pointCache = {};alert("TODO: Custom Individual");}
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
        radiusDiv.style.display = "none";
        degOffsetDiv.style.display = "none";
        objectCreationDataObject.innerText = "Select First Custom Point";
    } else if (cursorItemSelected == "block") {
        radiusDiv.style.display = "none";
        degOffsetDiv.style.display = "none";
        objectCreationDataObject.innerText = "Select First Block Point";
    } else if (cursorItemSelected == "line") {
        radiusDiv.style.display = "none";
        degOffsetDiv.style.display = "none";
        objectCreationDataObject.innerText = "Select First Line Point";
    } else if (cursorItemSelected == "arc") {
        radiusDiv.style.display = "block";
        degOffsetDiv.style.display = "none";
        objectCreationDataObject.innerText = "Select First Arc Point";
    } else if (cursorItemSelected == "individual") {
        objectCreationDataObject.innerText = "Select A Location";
        degOffsetDiv.style.display = "none";
    } else {
        radiusDiv.style.display = "block";
        degOffsetDiv.style.display = "block";
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