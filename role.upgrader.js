/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */
var commonModule = require('common');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = (Game.spawns['Spawn1'].room.controller.ticksToDowngrade < 175000) ? "controller" : "other";
	        creep.say('upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.memory.upgrading == "controller")
            {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else
                commonModule.goToStorageOrFlag(creep);
        }
        else {
            commonModule.harvestSource(creep);
            
            /*var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[creep.memory.energySource]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.energySource], {visualizePathStyle: {stroke: '#ffaa00'}});
            }*/
        }
	}
};

module.exports = roleUpgrader;
