var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMineralHarvester = require('role.mineral_harvester');
var commonModule = require('common');

module.exports.loop = function () {
    commonModule.energyStat();
    commonModule.marketResources();
    commonModule.observeRooms();
   // commonModule.transferEnergyFromStorageToTerminal();
    //console.log(Game.time)
    
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    
    //Links:
    Game.getObjectById('5f9c193de387d8be4b6d8e51').transferEnergy(Game.getObjectById('5f9c135ba761fd5d8e6739da'));        

    //Labs:
    //Game.getObjectById('5fadcee0ec6acf47a2fa5f1c').runReaction(Game.getObjectById('5fae5029aa43fd2385e2a778'), Game.getObjectById('5fad7358f175abd1e1943d7d'))

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'mineral_harvester') {
            roleMineralHarvester.run(creep);
        }
    }
	
	 var creepRoles = commonModule.params.creepRoles;
	
	/* var creepRoles = {
		harvester: {
			maxCreeps: 3,
		},
		builder: {
			maxCreeps: 7,
		},
		upgrader: {
			maxCreeps: 0,
		},
	} */
	
	for (var role in creepRoles) {
	
		var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
		//console.log('Harvesters: ' + harvesters.length);

        var targets = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN)
                }
            });
					
		var totalEnergy = 0;
		for (var i=0; i<targets.length; i++) {
			totalEnergy += targets[i].store.getUsedCapacity(RESOURCE_ENERGY);
		}

		var storage = Game.spawns['Spawn1'].room.storage;
		var src = Game.spawns['Spawn1'].room.find(FIND_MINERALS, {
                filter: (mineral) => { 
                    return mineral.mineralAmount > 0;
                }
            });    
		
		if(role != 'mineral_harvester' || (src && storage && storage.store.getFreeCapacity() > 0))
		if(creeps.length < creepRoles[role].maxCreeps) {
			var i, parts = [];
			
			if(totalEnergy >= 3500)
			{
				for (i=0; i<20; i++) {
					parts.push(WORK)
				}
				for (i=0; i<18; i++) {
					parts.push(CARRY)
				}
				for (i=0; i<12; i++) {
					parts.push(MOVE)
				}
			}
			/*if(totalEnergy >= 2800)
			{
				for (i=0; i<15; i++) {
					parts.push(WORK)
				}
				for (i=0; i<17; i++) {
					parts.push(CARRY)
				}
				for (i=0; i<9; i++) {
					parts.push(MOVE)
				}
			}*/
			//if(totalEnergy >= 1800) parts = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
			//if(totalEnergy >= 1300) parts = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
			//else if(totalEnergy >= 1000) parts = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
			//else if(totalEnergy >= 750) parts = [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
			else if(totalEnergy >= 300 && role == 'harvester' && creeps.length < 1) parts = [WORK,CARRY,CARRY,CARRY,MOVE];
			
			if(parts && parts.length)
			{
				var newName = role + '_p' + parts.length + '_' + Game.time, result;

				if(parts && parts.length && (result = Game.spawns['Spawn1'].spawnCreep(parts, newName, 
					{memory: {role: role, energySource: Math.floor(Math.random() * Game.spawns['Spawn1'].room.find(FIND_SOURCES).length)}})) == OK)
				{
					console.log('Spawning new ('+parts.length+') '+role+': ' + newName);
					break;
				}
				else
					console.log("spawnCreep(): ", result);
			}
		}
	}
// Tower:
	var towers = Game.spawns['Spawn1'].room.find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
			
	towers.forEach(tower => {
		if(tower) { //temp turned off
			var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_ROAD
			});

			var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			var isHostile = 0;
			if(closestHostile) {
				tower.attack(closestHostile);
				isHostile = 1;
			}
			else if(closestDamagedStructure) {
				//tower.repair(closestDamagedStructure); //temp turn off
				//tower.heal(closestDamagedStructure); //heal creep //temp turn off
				//console.log(closestDamagedStructure.hits)
			}
			commonModule.average('hostile', isHostile, commonModule.params.averageInterval);
		}
	});
}