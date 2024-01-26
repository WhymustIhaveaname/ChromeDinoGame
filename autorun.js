function printobstacle(o){
    console.log(`xyPos: ${o.xPos}, ${o.yPos}\n\
type: ${o.typeConfig.type}\n\
width height: ${o.typeConfig.width} ${o.typeConfig.height}`);
    console.log(o);
}

function ongameover(runner){
    let distance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
    console.log(`Game Over\n\
      current Speed: ${runner.currentSpeed}\n\
      current distanceMeter: ${distance}\n`);
    console.log("nearest obstacle");
    printobstacle(runner.horizon.obstacles[0]);
}

function pressup(runner){
    let e = new KeyboardEvent('keydown', {
        keyCode: 38,
        key: "ArrowUp",
        code: "ArrowUp",
    });
    runner.onKeyDown(e);
}

function releaseup(runner){
    let e = new KeyboardEvent('keyup', {
        keyCode: 38,
        key: "ArrowUp",
        code: "ArrowUp",
    });
    runner.onKeyUp(e);
}

var ducking  = false;
var jumping  = false;
var lastdist = -1;

function onupdate(runner){
    let distance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
    // let speed = runner.currentSpeed;
    // if(distance<1000 && distance>lastdist && distance%100===0){
    //     console.log(`distance ${distance} speed ${speed}`);
    //     lastdist = distance;
    // }
    if(runner.horizon.obstacles.length==0){
        return;
    }
    //console.log(`update at ${runner.runningTime} ${runner.distanceRan}`);
    let nearestobs = runner.horizon.obstacles[0];
    // There are 3 heights for PTERODACTYL: 50 75 100
    // if(nearestobs.typeConfig.type === "PTERODACTYL" && nearestobs.xPos===0){
    //     console.log(nearestobs.yPos);
    // }
    if(~ducking && nearestobs.typeConfig.type === "PTERODACTYL" && nearestobs.yPos==75 && nearestobs.xPos<300){
        let e = new KeyboardEvent('keydown', {
            keyCode: 40,
            key: "ArrowDown",
            code: "ArrowDown",
        });
        runner.onKeyDown(e);
        ducking = true;
        return;
    }else if(ducking){
        let e = new KeyboardEvent('keyup', {
            keyCode: 40,
            key: "ArrowDown",
            code: "ArrowDown",
        });
        runner.onKeyUp(e);
        ducking = false;
    }

    if(nearestobs.typeConfig.type === "PTERODACTYL" && nearestobs.yPos==50){
        return;
    }

    // Cactus have 2 width: 17 and 25
    // if(nearestobs.xPos<300 && nearestobs.xPos>200 && nearestobs.typeConfig.type.includes("CACTUS")){
    //     printobstacle(nearestobs);
    // }
    let speed;
    if(distance<820){
        speed = Math.sqrt(2*0.08106*distance+6*6);
    }else{
        speed = 13.001;
    }

    let collitime = nearestobs.xPos/speed;
    if(nearestobs.typeConfig.type.includes("CACTUS_LARGE") && nearestobs.size==3){
        //console.log(`large cactus at ${distance}`);
        if(collitime<15 && collitime>1){
            pressup(runner);
            jumping = true;
        }else if(collitime<1){
            releaseup(runner);
            jumping = false;
        }
    }else if(nearestobs.typeConfig.type == "CACTUS_LARGE" && nearestobs.size==3){
        if(~jumping && collitime<17 && collitime>10){
            pressup(runner);
            jumping = true;
        }else if(jumping && collitime<10){
            releaseup(runner);
            jumping = false;
        }
    }else{
        if(~jumping && collitime<20 && collitime>15){
            pressup(runner);
            jumping = true;
        }else if(jumping && collitime<15){
            releaseup(runner);
            jumping = false;
        }
    }
}