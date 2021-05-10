/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
var commonModule = require('common');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var link1 = Game.getObjectById('5f9c193de387d8be4b6d8e51');
        /*var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LAB ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });*/
        
        /* var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LAB ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
        var targets = [target];*/
        
        var creepRoles = commonModule.params.creepRoles;
        var role = "harvester";
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        var target = null;
        
        if(creeps.length >= creepRoles[role].maxCreeps) 
        {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            
        }
        
        if(!target)
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            // structure.structureType == STRUCTURE_LAB ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            
        var targets = [target];
        
        //targets.sort((a,b) => b.structureType == STRUCTURE_LAB); // structureType == STRUCTURE_LAB 1st
        /*    
        var targetsLab = _.filter(targets, target => target.structureType == STRUCTURE_LAB);
        if(targetsLab.length)
            targets = targetsLab;
        
        if(0 && creep.name == "harvester_p20_23124376")
        {
            var targets = [Game.getObjectById('5fad7358f175abd1e1943d7d')];
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            return;
        }*/

        if(creep.memory.transferring && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transferring = false;
            creep.say('harvest');
	    }
	    if(!creep.memory.transferring && creep.store.getFreeCapacity() == 0) {
	        creep.memory.transferring = true;
	        creep.say('transfer');
	    }

	    if(creep.memory.transferring) {
            
            //targets = [Game.spawns['Spawn1'].room.storage];
            if(0 && creep.memory.energySource == 0)
            {
                targets = [];
                //if(link1.getFreeCapacity(RESOURCE_ENERGY) > 0)
                    targets = [link1];
            }
            
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                } 
            }
            else
            {
                commonModule.goToStorageOrFlag(creep);
                //creep.moveTo(Game.flags.Flag1);
                //creep.memory.role = 'builder'
            }
        }
        else {
            commonModule.harvestSource(creep);
            
            /* var storage = Game.spawns['Spawn1'].room.storage;
            if((creep.withdraw(storage, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            } 
            
            var sources = creep.room.find(FIND_SOURCES), h;
            //sources[1] = Game.getObjectById('5f9c135ba761fd5d8e6739da');
            //sources[1] = Game.spawns['Spawn1'].room.storage;
            if((h=creep.harvest(sources[creep.memory.energySource])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.energySource], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            //else console.log(h)
            */
        }
	}
};

module.exports = roleHarvester;
