/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var commonModule = require('common');

var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('build');
	    }

	    if(creep.memory.building) {
            if(creep.memory.fillTerminal) {
                var terminal = Game.spawns['Spawn1'].room.terminal;
                var targets = [terminal];
                if(targets.length > 0 && (terminal.store[RESOURCE_ENERGY] < 100000 || !terminal.store[RESOURCE_ENERGY])) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    } 
                }
                else creep.memory.fillTerminal = false; //commonModule.goToStorageOrFlag(creep);
            }
            else
            { //Repair roads
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax * 0.8 && (object.structureType == STRUCTURE_ROAD 
                  /*  || (object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) && 
                    object.pos.x >= Game.flags.Flag2.pos.x && object.pos.x <= Game.flags.Flag3.pos.x && 
                    object.pos.y >= Game.flags.Flag2.pos.y && object.pos.y <= Game.flags.Flag3.pos.y &&
                    object.hits < 200000 */
                    )
                }); 
                
                //targets = []; //temp turn off all repair

                //targets.sort((a,b) => a.hits - b.hits);
                if(targets.length > 0) {
                    if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0],{visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }                
                else {
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    var iMin = -1, progressMin = 100000000;
                    if(targets.length) {
                        iMin = 0;
                        /*
                        for (var i=0; i<targets.length; i++)
                        {
                            if(targets[i].progress < progressMin)
                            {
                                progressMin = targets[i].progress;
                                iMin = i;
                            }
                        }*/
                       
                        if(creep.build(targets[iMin]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[iMin], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        
                        //console.log(JSON.stringify(Game.flags.Flag1));
                    }
                    else commonModule.goToStorageOrFlag(creep);
                    //creep.moveTo(Game.flags.Flag1);
                }
                
            }
	    }
	    else {
            commonModule.harvestSource(creep);
            
	        /*var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[creep.memory.energySource]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.energySource], {visualizePathStyle: {stroke: '#ffaa00'}});
            }*/
	    }
	},
    
};

module.exports = roleBuilder;
