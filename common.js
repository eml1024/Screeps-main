/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('common');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
	params: {
		averageInterval: 10000,
		averageSkipInterval: 10,
		notifyInterval: 30000, // 50000
		creepRoles: {
			harvester: {
				maxCreeps: 3,
			},
			upgrader: {
				maxCreeps: 1,
			},
			mineral_harvester: {
				maxCreeps: 1,
			},
			builder: {
				maxCreeps: 7,
			},
		},
	},
	average: function(statName, param, timeInterval) {
		if(!statName || !timeInterval)
			return;
		
		if(!Memory.stat)
			Memory.stat = {};

		if(!Memory.stat[statName])
			Memory.stat[statName] = {};
				
		if(!Memory.stat[statName].totalParam)
			Memory.stat[statName].totalParam = 0;
				
		if(!Memory.stat[statName].diagram)
			Memory.stat[statName].diagram = {};
				
		if(!Memory.stat[statName].diagram.maxKey)
			Memory.stat[statName].diagram.maxKey = 0;
				
		if(!Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey])
			Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey] = {};
				
		var lastElem = Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey];
		var curElem = null;

		if(typeof lastElem.timeStart === 'undefined' || Game.time - lastElem.timeStart >= this.params.averageSkipInterval)
		{
			//Push last elem:
			if(typeof lastElem.param === 'undefined')
				curElem = lastElem;
			else if(lastElem.param != param) {
				Memory.stat[statName].diagram.maxKey ++;
				if(!Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey])
					Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey] = {};
						
				curElem = Memory.stat[statName].diagram[Memory.stat[statName].diagram.maxKey];
			}
			
			//Filling curElem:
			if(curElem)
			{
				curElem.param = param;
				curElem.timeStart = Game.time;
				Memory.stat[statName].totalParam += param;
			}
			
			//Cutting diagram:
			for (var key in Memory.stat[statName].diagram){
				if(key != 'maxKey' && key != 'length')
					if(Memory.stat[statName].diagram[key].timeStart <= Game.time - timeInterval)
					{
						Memory.stat[statName].totalParam -= Memory.stat[statName].diagram[key].param;
						delete Memory.stat[statName].diagram[key];
					}
			}
			
			//Calc. length:
			Memory.stat[statName].diagram.length = 0;
			for (var key in Memory.stat[statName].diagram){
				if(key != 'maxKey' && key != 'length')
					Memory.stat[statName].diagram.length ++;
			}
			
			if(Memory.stat[statName].diagram.length)
				Memory.stat[statName].averageParam = Memory.stat[statName].totalParam / Memory.stat[statName].diagram.length;
		}
	},
	
	energyStat: function() {
		//this.average('time', Game.time, 3);
		
        var targets = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN)
                }
            });
	
		var totalEnergyMax = 0;
		var totalEnergy = 0;
		for (var i=0; i<targets.length; i++) {
			totalEnergyMax += targets[i].store.getCapacity(RESOURCE_ENERGY);
			totalEnergy += targets[i].store.getUsedCapacity(RESOURCE_ENERGY);
		}

		//this.average('energy', totalEnergy/totalEnergyMax, this.params.averageInterval);
		//console.log(totalEnergyMax)
		
		//Creeps:
		var totalParts = 0;
		for(var name in Game.creeps) {
			var creep = Game.creeps[name];
			totalParts += creep.getActiveBodyparts(WORK);
			totalParts += creep.getActiveBodyparts(CARRY);
			totalParts += creep.getActiveBodyparts(MOVE);
			//console.log(JSON.stringify(creep.getActiveBodyparts(WORK)));
		}
		
		this.average('creeps', totalParts, this.params.averageInterval);
		
		this.average('ticksToDowngrade', Game.spawns['Spawn1'].room.controller.ticksToDowngrade, this.params.averageInterval);

		//Sources:
		var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES), srcEnergy = 0, srcCapacity = 0;
		//sources.forEach(source => {
		var source = Game.getObjectById('5bbcaf359099fc012e63a536');
			srcEnergy += source.energy;
			srcCapacity += source.energyCapacity;
		//})

		this.average('sources', srcEnergy/srcCapacity, this.params.averageInterval);
		
		var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b');
		this.average('terminal', terminal.store[RESOURCE_ENERGY], this.params.averageInterval);
		
		var towers = Game.spawns['Spawn1'].room.find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
			
		var towerEnergy = 0;
		towers.forEach(tower => {
			towerEnergy += tower.energy;
		});
		
		this.average('towerEnergy', towerEnergy, this.params.averageInterval);
		
		//Notify
		if(!Memory.stat.timeNotify)
			Memory.stat.timeNotify = Game.time;

		if(Game.time - Memory.stat.timeNotify > this.params.notifyInterval) {
			Memory.stat.timeNotify = Game.time;
			var message = ""; //"energy.averageParam: " + Memory.stat.energy.averageParam;
			message += "creeps.averageParam: " + Memory.stat.creeps.averageParam;
			
			if(Memory.stat.hostile)
				message += "\nhostile.averageParam: " + Memory.stat.hostile.averageParam;
			
			message += "\nsources.averageParam: " + Memory.stat.sources.averageParam;
			
			message += "\nticksToDowngrade.averageParam: " + Memory.stat.ticksToDowngrade.averageParam;
			
			message += "\ntowerEnergy.averageParam: " + Memory.stat.towerEnergy.averageParam;
			
			//message += ("\nController: " + JSON.stringify({progress: Game.spawns['Spawn1'].room.controller.progress, progressTotal: Game.spawns['Spawn1'].room.controller.progressTotal}));
			
			//var lab = Game.getObjectById('5fac588b62a2a613fa2f1d70');
			//if(lab) message += "\nLab progress: "+lab.progress;
			
			message += "\nStorage: " + JSON.stringify(Game.spawns['Spawn1'].room.storage.store);
			
			var roads = Game.spawns['Spawn1'].room.find(
					FIND_STRUCTURES, {filter: {structureType: STRUCTURE_ROAD}});
			
			var roadHits = 0;
			roads.forEach(road => {
				roadHits += road.hits;
			}); 
			
			message += "\nRoads: " + roads.length;
			if(roads.length)
				message += ", avg hits: " + roadHits/roads.length;
			
			//message += "\nSilicon: " + Memory.marketStat.resources.silicon;

			message += "\nEnergyAtTerminal: " + terminal.store[RESOURCE_ENERGY];
			message += "\nterminal.averageParam: " + Memory.stat.terminal.averageParam;
			message += "\ncontroller.ticksToDowngrade: " + Game.spawns['Spawn1'].room.controller.ticksToDowngrade;
			message += "\nCredits: " + Game.market.credits;
			
			Game.notify(message, 0);
		}
	},

	goToStorageOrFlag: function (creep)
	{
		var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b');
		//var targets = [Game.spawns['Spawn1'].room.storage];
		
		var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_TOWER) && 
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
		});
		
		if(!target) target = terminal;
		var targets = [target];
   
		if(targets.length > 0 && targets[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
		else
		{
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
			//creep.moveTo(Game.flags.Flag1);
			//creep.memory.role = 'builder'
		}
	},
	
	harvestSource: function (creep)
	{
		var terminal = Game.spawns['Spawn1'].room.terminal, h;
		
		if(terminal.store.energy > 0 && creep.memory.role == 'builder' && creep.memory.fillTerminal)
		{
			if((h = creep.withdraw(terminal, RESOURCE_UTRIUM_OXIDE)) == ERR_NOT_IN_RANGE) {
				creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffaa00'}});
			} 
		}
		else // if(h == ERR_NOT_ENOUGH_ENERGY)
		{
			var sources = creep.room.find(FIND_SOURCES), h;
			if((h = creep.harvest(sources[creep.memory.energySource])) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[creep.memory.energySource], {visualizePathStyle: {stroke: '#ffaa00'}});
				
			/*var source = creep.pos.findClosestByPath(FIND_SOURCES), h;
			if((h = creep.harvest(source)) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});*/
			}
		}
		//else console.log(h)
	},
	
	marketSellEnergy: function (orderInfo)
	{
		var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b');
		var order = orderInfo.order;
		var targetAmount = 10000;
		var amount = (order.remainingAmount > targetAmount) ? targetAmount : order.remainingAmount;
		orderInfo.amount = amount;
			
		if(terminal.store[RESOURCE_ENERGY] - amount > 240000)// && orderInfo.costRel < 0.1 && order.price > 0.44)
		{
			var result = Game.market.deal(order.id, amount, 'E38S33');
			orderInfo.result = result;
			orderInfo.credits = Game.market.credits;
			orderInfo.terminalEnergy = terminal.store[RESOURCE_ENERGY];

			if(!Memory.marketStat)
				Memory.marketStat = {};
					
			if(!Memory.marketStat.energyOrders)
				Memory.marketStat.energyOrders = {};
			/*
			if(!Memory.marketStat.energyOrders[JSON.stringify(orderInfo)])
				Memory.marketStat.energyOrders[JSON.stringify(orderInfo)] = 1;
			else
				Memory.marketStat.energyOrders[JSON.stringify(orderInfo)] ++;
			*/
		}
		else 
			orderInfo.error = "Too large amount";
	},
	
	marketBuySilicon: function (ordersAll)
	{
		var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b');
		var orderInfo = {};
		
		var orders = _.filter(ordersAll, (order) => order.type == "sell" && order.resourceType == RESOURCE_SILICON && order.price <= 3);
		orders.sort((a,b) => b.remainingAmount - a.remainingAmount);

		orders.forEach(order => {
			var targetAmount = 6000 - terminal.store[RESOURCE_SILICON];
			var amount = (order.remainingAmount > targetAmount) ? targetAmount : order.remainingAmount;
			
			if(order.price <= 3) // terminal.store[RESOURCE_SILICON] + amount <= 6000 && 
			{
				var result = Game.market.deal(order.id, amount, 'E38S33');
				orderInfo.order = order;
				orderInfo.result = result;
				orderInfo.credits = Game.market.credits;
				orderInfo.terminalEnergy = terminal.store[RESOURCE_ENERGY];
				orderInfo.amount = amount;
				orderInfo.cost = Game.market.calcTransactionCost(amount, 'E38S33', order.roomName);

				if(!Memory.marketStat)
					Memory.marketStat = {};
						
				if(!Memory.marketStat.siliconOrders)
					Memory.marketStat.siliconOrders = {};
				
				/*
				if(!Memory.marketStat.siliconOrders[JSON.stringify(orderInfo)])
					Memory.marketStat.siliconOrders[JSON.stringify(orderInfo)] = 1;
				else
					Memory.marketStat.siliconOrders[JSON.stringify(orderInfo)] ++;
				*/
			}
		});
	},
	
	marketResearch: function (ordersAll)
	{
		var priceLimit = 0.45;
		var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b');
		if(terminal.store[RESOURCE_ENERGY] > 285000)
			priceLimit = 0.25;
		// [{"createdTimestamp":1604767984757,"type":"buy","amount":50000,"remainingAmount":50000,"resourceType":"energy","price":0.3,"roomName":"E38N39","created":22980000,"id":"5fa6d0f07e84a756d059d629"}]
		
		var amount = 10000; //Selling not this amount
		//var orders = Game.market.getAllOrders(order => order.type == "buy" && order.resourceType == "energy" && order.price > 0.3 && order.remainingAmount > amount);
		
		var orders = _.filter(ordersAll, (order) => order.type == "buy" && order.resourceType == RESOURCE_ENERGY && order.price > priceLimit && order.remainingAmount > amount);

		if(!Memory.marketStat)
			Memory.marketStat = {};
				
		if(!Memory.marketStat.energy)
			Memory.marketStat.energy = [];
				
		var costs = Memory.marketStat.energy;
		var resultPrices = [];
		
		if(orders.length)
		{
			orders.forEach(order => {
				var room = order.roomName;
				var cost = Game.market.calcTransactionCost(amount, 'E38S33', room);
				var costRel = cost/amount;
				var credits = Game.market.credits;
				var energy1 = Game.spawns['Spawn1'].room.terminal.store[RESOURCE_ENERGY];
				var found = 0;
				
				resultPrices.push({
					p: order.price / (1. + costRel),
					costRel: costRel,
					price: order.price,
					id: order.id,
					order: order,
				});
				
				costs.forEach(costObj => {
					if(costObj.cost == cost)
					{
						found = 1;
						//break;
					}
				});
				
				if(!found)
				{
					costs.push({
						cost: cost,
						price: order.price,
						amount: order.remainingAmount,
						id: order.id,
					});
				}
				
				/*this.marketSellEnergy({
					order: order,
					costRel: costRel,
				});*/
			});
		}

		costs.sort((a,b) => a.cost - b.cost);
		resultPrices.sort((a,b) => b.p - a.p);

		if(resultPrices[0])
		{
			var orderInfo = {
				order: resultPrices[0].order,
			};
			
			this.marketSellEnergy(orderInfo);
			
			if(!Memory.resultPrices)
			{
				Memory.resultPrices = true;
				console.log(JSON.stringify({
					resultPrices: resultPrices,
					orderInfo: orderInfo,
				}));
			}
		}
		
	},

	marketResources: function ()
	{
		// [{"createdTimestamp":1604767984757,"type":"buy","amount":50000,"remainingAmount":50000,"resourceType":"energy","price":0.3,"roomName":"E38N39","created":22980000,"id":"5fa6d0f07e84a756d059d629"}]
		
		var ordersAll = Game.market.getAllOrders();
		var orders = _.filter(ordersAll, (order) => order.type == "sell");
		this.marketResearch(ordersAll);
		//this.marketBuySilicon(ordersAll);
		
		//console.log(orders.length);
		if(!Memory.marketStat)
			Memory.marketStat = {};
				
		if(!Memory.marketStat.resources)
			Memory.marketStat.resources = {};
				
		var resources = Memory.marketStat.resources;

		if(orders.length)
		{
			orders.forEach(order => {
				if(!resources[order.resourceType])
					resources[order.resourceType] = 1;
				else
					resources[order.resourceType] ++;
				
				if(0 && order.resourceType == "silicon") //temp
				{
					if(!Memory.marketStat.silicon)
						Memory.marketStat.silicon = {};
					/*		
					if(!Memory.marketStat.silicon[JSON.stringify(order)])
						Memory.marketStat.silicon[JSON.stringify(order)] = 1;
					else
						Memory.marketStat.silicon[JSON.stringify(order)] ++;
					*/
				}
			});
		}
		
		//console.log(JSON.stringify(resources));
	},
	
	marketDeal: function ()
	{
		// [{"createdTimestamp":1604767984757,"type":"buy","amount":50000,"remainingAmount":50000,"resourceType":"energy","price":0.3,"roomName":"E38N39","created":22980000,"id":"5fa6d0f07e84a756d059d629"}]
		
		var amount = 1000;
		var orders = Game.market.getAllOrders(order => order.type == "buy" && order.resourceType == "energy" && order.price > 0.3 && order.remainingAmount > amount);
		
		if(orders.length)
		{
			order = orders[0];
			var room = order.roomName;
			var cost = Game.market.calcTransactionCost(amount, 'E38S33', room);
			var credits = Game.market.credits;
			var energy1 = Game.spawns['Spawn1'].room.terminal.store[RESOURCE_ENERGY];
			
			var result = Game.market.deal(order.id, amount, 'E38S33');
			
			Memory.marketDeal = {
				credits: Game.market.credits - credits,
				price: order.price,
				energy: energy1 - Game.spawns['Spawn1'].room.terminal.store[RESOURCE_ENERGY],
				cost: cost,
				amount: amount,
				result: result,
				order: order,
			}
			
			console.log(JSON.stringify(Memory.marketDeal));
		}
		
	},
	transferEnergyFromStorageToTerminal: function() {
		
		for(var name in Game.creeps) {
			var creep = Game.creeps[name];
			var storage = Game.spawns['Spawn1'].room.storage;
			var terminal = Game.getObjectById('5fad09211fb54140e7e5a29b'); //5fd73cd840716ec818f57393 - factory
			
			if(storage.store[RESOURCE_ENERGY] > 500000 && terminal.store[RESOURCE_ENERGY] < 280000 && creep.store.getFreeCapacity() > 0)
			{
				if((h = creep.withdraw(storage, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
				} 
			}
			else
			{
				var targets = [terminal];
				if(targets.length > 0) {
					if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					} 
				}
			}
		}
	},
	observeRooms: function() {
		//Memory.roomToObserve = "W60N60";
		
		if(Memory.roomToObserve)
		{
			if(!Memory.observeRoom)
			{
				var observers = Game.spawns['Spawn1'].room.find(
					FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_OBSERVER}});
					
				var room = observers[0].observeRoom(Memory.roomToObserve);
				Memory.observeRoom = true;
			}
			else
			{
				if(Game.rooms[Memory.roomToObserve])
					//console.log(JSON.stringify(Game.rooms[Memory.roomToObserve].find(FIND_STRUCTURES).length))    
					console.log(Game.rooms[Memory.roomToObserve].controller.ticksToDowngrade)    
				else
					console.log("false");
				
				Memory.roomToObserve = null;
				Memory.observeRoom = false;
			}
		}
	},
};
