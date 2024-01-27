function printobstacle(o){
    console.log(`xyPos: ${o.xPos}, ${o.yPos}\n\
type: ${o.typeConfig.type}\n\
width height size: ${o.typeConfig.width} ${o.typeConfig.height} ${o.size}`);
    //console.log(o);
}

function printRexconfig(t){
    console.log(
        `minJumpHeight: ${t.minJumpHeight}, `+
        `MAX_JUMP_HEIGHTL: ${t.config.MAX_JUMP_HEIGHT}, `+
        // `SPEED_DROP_COEFFICIENT: ${t.config.SPEED_DROP_COEFFICIENT}, `+
        `DROP_VELOCITY: ${t.config.DROP_VELOCITY}, `+
        `jumpV: ${t.jumpVelocity}, `
    );
}

function ongameover(runner){
    let distance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
    console.log(`Game Over\n\
      current time: ${runner.time}\n\
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
    console.log(`${Math.round(runner.time)} press up`);
    runner.onKeyDown(e);
}

function releaseup(runner){
    let e = new KeyboardEvent('keyup', {
        keyCode: 38,
        key: "ArrowUp",
        code: "ArrowUp",
    });
    console.log(`${Math.round(runner.time)} release up`);
    runner.onKeyUp(e);
}

function pressdown(runner){
    let e = new KeyboardEvent('keydown', {
        keyCode: 40,
        key: "ArrowDown",
        code: "ArrowDown",
    });
    console.log(`${Math.round(runner.time)} press down`);
    runner.onKeyDown(e);
}

function releasedown(runner){
    let e = new KeyboardEvent('keyup', {
        keyCode: 40,
        key: "ArrowDown",
        code: "ArrowDown",
    });
    console.log(`${Math.round(runner.time)} release down`);
    runner.onKeyUp(e);
}

var ducking  = false;
var freezetime = 0;

function onupdate(runner){
    if (runner.time<freezetime){return;}
    if (runner.horizon.obstacles.length==0){return;}

    let nearestobs = runner.horizon.obstacles[0];

    if(nearestobs.typeConfig.type === "PTERODACTYL" && nearestobs.yPos==50){return;}

    if(needsduck = nearestobs.typeConfig.type === "PTERODACTYL" && nearestobs.yPos==75){
        if (nearestobs.xPos<300){
            pressdown(runner);
            freezetime = runner.time + 10;
            ducking = true;
        }
        return;
    }

    if(ducking){
        releasedown(runner);
        freezetime = runner.time + 10;
        ducking = false;
    }

    let distance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan)); // in m
    let speed = distance<820 ? Math.sqrt(2*0.08106*distance+6*6) : 13.001;

    let collitime = nearestobs.xPos/speed;
    if(nearestobs.typeConfig.type == "CACTUS_LARGE" && nearestobs.size==3){
        // was 23, 1
        if(collitime<23 && collitime>10){
            pressup(runner);
            freezetime = runner.time + 10;
        }else if(collitime<1){
            releaseup(runner);
            freezetime = runner.time + 10;
        }
    }else if(nearestobs.typeConfig.type == "CACTUS_LARGE" && nearestobs.size==2){
        // 26 collide with 2 large
        if(collitime<25 && collitime>10){
            pressup(runner);
            freezetime = runner.time + 10;
        }else if(collitime<1){
            releaseup(runner);
            freezetime = runner.time + 10;
        }
    }else{
        // was 25 1
        if(collitime<27 && collitime>10){
            pressup(runner);
            freezetime = runner.time + 10;
        }else if(collitime<1){
            releaseup(runner);
            freezetime = runner.time + 10;
        }
    }
}

var todolist = [];
var freezetime = 0;

function onupdate_pressonce(runner){
    // if (runner.horizon.obstacles.length>0){
    //     console.log(runner.time,runner.horizon.obstacles[0].xPos);
    // }
    if (runner.time<freezetime){
        ;
    }else{
        let o;
        for (let i in runner.horizon.obstacles){
            o = runner.horizon.obstacles[i];

            if(o.xPos<290 || o.xPos>310){continue;}

            if(o.typeConfig.type === "PTERODACTYL" && o.yPos==50){
                continue;
            }

            let distance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan)); // in m
            let speed = distance<820 ? Math.sqrt(2*0.08106*distance+6*6) : 13.001;
            let deltatime = 16.67*(o.xPos)/speed;
            let lastactiont = todolist[todolist.length-2] ? todolist[todolist.length-2].t : 0;
            console.log(`pushing action for ${o.size}x${o.typeConfig.type} at ${o.xPos} after ${deltatime}`);

            if (o.typeConfig.type === "PTERODACTYL" && o.yPos==75){
                todolist.push({
                    t: runner.time,
                    do: pressdown
                });
                todolist.push({
                    t: runner.time + deltatime + 16.67*80/speed,
                    do: releasedown
                });
            }else{
                todolist.push({
                    t: runner.time + deltatime - 300,
                    do: pressup,
                    info: "jump"
                });
                if (o.typeConfig.type === "CACTUS_LARGE" && o.size==3){
                    todolist.push({
                        t: runner.time + deltatime - 100, // time is in ms
                        do: releaseup
                    });
                }else{
                    todolist.push({
                        t: runner.time + deltatime - 290, // time is in ms
                        do: releaseup
                    });
                }
            }
            // if (todolist[todolist.length-2].t < lastactiont + 600){
            //     let extradelay = lastactiont + 600 - todolist[todolist.length-2].t;
            //     todolist[todolist.length-2].t += extradelay;
            //     todolist[todolist.length-1].t += extradelay;
            //     console.log("add extra delay",extradelay);
            // }
            console.log(`next action time ${todolist[todolist.length-2].t}`);
            freezetime = runner.time + 50; // no doing anything in next 100 ms
            break;
        }
    }

    // only do one action in each frame
    if (todolist.length>0 && todolist[0].t<runner.time){
        // console.log(runner.tRex.jumping,runner.tRex.ducking);
        // action = todolist.shift();
        // action.do(runner);
        if (todolist[0].info == "jump" && runner.tRex.jumping){
            console.log("skip jump",runner.tRex.jumping,runner.tRex.ducking);
        }else{
            action = todolist.shift();
            action.do(runner);
        }
    }
}