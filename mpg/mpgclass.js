const MPGLeague = class MPGLeague {
	constructor(prop = {}) {
		const {setter} = prop;
		const mL = setter.mL;
		this.id = mL.i?parseInt(mL.i,10):0;
		this.name = mL.n?mL.n:"";
		this.cleanName = mL.cN?mL.cN:"";
		this.url = mL.u?mL.u:"";
		if(mL.lS) this.lastSeason = new MPGSeason(mL.lS, this, prop);
		this.activeSeason = new MPGSeason(mL.aS, this, prop);
		//this.lastBuildDate = Date.parse(mL.bT)||"";
	}
};
const MPGSeason = class MPGSeason {
	constructor(s, league, prop = {}) {
		this.id = s.i?parseInt(s.i,10):0;
		this.name = s.n?s.n:"";
		this.cleanName = s.cN?s.cN:0;
		this.maxDay = s.mD?s.mD:0;
		this.league = league;
		if(s.cD) {
			this.currentDay = new MPGCurrentDay(s.cD, this, prop);
		}
	}
};
const MPGCurrentDay = class MPGCurrentDay {
	constructor(cD, season, prop = {}) {
		const {mindays} = prop;
		this.day = parseInt(cD.d,10);
		this.lastDay = cD.lD?parseInt(cD.lD,10):0;
		this.isInProgress = !!cD.p;
		this.minDays = mindays?parseInt(mindays,10):8;
		this.lastSeasonLastDay = season.league.lastSeason?season.league.lastSeason.maxDay:38;
		//Perf rendering day start
		this.dayStart = this.lastDay;
		if(this.dayStart === 0 && season.league.lastSeason) {
			this.dayStart = this.lastSeasonLastDay * -1;
		}
		if(this.isInProgress) {
			this.dayStart = this.day;
		}
		//Perf rendering day stop
		this.dayStop = 1;
		if(season.league.lastSeason) {
			if(this.dayStart - season.maxDay < 0) {
				if(this.dayStart < 0) {
					this.dayStop = -1;
				}
				else {
					this.dayStop = this.dayStart * -1 -1;
				}
			}
		}
		this.displayedDays = Math.max(this.dayStart, this.minDays);
	}
};

const MPGClub = class MPGClub {
	constructor(id, setter={}) {
		if(parseInt(id,10)<=0) return;

		this.id = parseInt(id,10);
		this.name = setter.n?setter.n:"";
		this.cleanName = setter.cn?setter.cn:"";
		this.realName = setter.rn?setter.rn:"";
		this.cleanRealName = setter.crn?setter.crn:"";
		this.abv = setter.a?setter.a:"";
		this.url = setter.u?setter.u:"";
		this.nextMatch = null;
		if(setter.nm && Array.isArray(setter.nm)) {
			this.nextMatchsWC = new Map(setter.nm)
		}
		else {
			this.nextMatchsWC = new Map();
		}
		this.pastMatchs = setter.pM?setter.pM:[];
		this.DMI = setter.DMI?setter.DMI:[];
		this.score = new MPGTeamScore(setter.s);
		this.elo = setter.el||0;
		this.majorLeagueName = setter.l||0;
	};

	getURL() {
		return "/club/"+ this.majorLeagueName +"/"+this.cleanRealName
	};
};

const MPGAuctionStats = class MPGAuctionStats {
		constructor(setter = {}) {
			this.minPrice = setter.m?setter.m:null;
			this.avgPrice = setter.a?setter.a:null;
			this.maxPrice = setter.M?setter.M:null;
			this.nbPrice =  setter.n?setter.n:null;
		}
};

const MPGPlayer = class MPGPlayer {
	constructor(pid, setter={}) {
		this.id = parseInt(pid,10);
		this.name = setter.n||0;
		this.firstName = setter.f||"";
		this.club = null;
		this.rate = parseInt(setter.r,10)||0;
		this.auctionStats = new MPGAuctionStats(setter.a);
		this.forfeits = new Map();
		this.nextForfeit = {};
		this.place = "";
		this.superPlace = setter.fp||"";
		this.fullplace = "";
		this.placeval = 9;
		this.convertPlace();
		if(setter.s) {
			this.stats = new MPGPlayerStats(setter.p.s)
		} else {
			this.stats = new MPGPlayerStats();
		}
		this.extraStats = setter.es||{};
		this.perfs = new Map();
		this.DMI = [];
	};

	convertPlace() {
		if(this.place.length===0 && this.fullplace.length>0) {
			switch (this.fullplace.toLowerCase()) {
				//Goalkeeper
				case "g":
				case "gardien":
				case "goalkeeper":
				case "portero":
					this.place ="G";
					this.superPlace="G";
					break;
				//Old def version
				case "défenseur":
				case "defender":
				case "defensa":
					this.place = "D";
					this.superPlace="D";
					break;
				//Def cent
				case "dc":
				case "cb":
				case "cent":
				case "def. cen.":
				case "center back":
				case "def. cent.":
					this.place = "D";
					this.superPlace="DC";
					break;
				//Def lat
				case "dl":
				case "wb":
				case "lat":
				case "def. lat.":
				case "wing back":
					this.place = "D";
					this.superPlace="DL";
					break;
				//Old milieu
				case "milieu":
				case "midfielder":
				case "centrocampista":
					this.place = "M";
					this.superPlace="M";
					break;
				//Mil Def
				case "md":
				case "dm":
				case "mcd":
				case "mil. def.":
				case "def. mid.":
				case "med. def.":
					this.place = "M";
					this.superPlace="MD";
					break;
				//Mil off
				case "mo":
				case "am":
				case "mco":
				case "mil. off":
				case "mil. off.":
				case "att. mid.":
				case "med. ofe":
				case "med. ofe.":
					this.place = "M";
					this.superPlace="MO";
					break;
				//Att
				case "a":
				case "f":
				case "d":
				case "attaquant":
				case "forward":
				case "delantero":
					this.place = "A";
					this.superPlace="A";
					break;
			}
		}
		if(this.superPlace.length>0) {
			switch (this.superPlace) {
				case 'G' :
					this.fullplace= "Goalkeeper";
					this.place= "G";
					this.placeval= 0;
					break;
				case 'DC' :
					this.fullplace= "Central Defender";
					this.place = "D"
					this.placeval= 1;
					break;
				case 'DL' :
					this.fullplace= "Lateral Defender";
					this.place = "D"
					this.placeval= 1;
					break;
				case 'MD' :
					this.fullplace = "Defensive Midfielder";
					this.place = "M"
					this.placeval= 2;
					break;
				case 'MO' :
					this.fullplace = "Offensive Midfielder";
					this.place = "M"
					this.placeval= 2;
					break;
				case 'A' :
					this.fullplace= "Forward";
					this.place = "A"
					this.placeval= 3;
					break;
				default :
					this.fullplace= false;
					this.placeval= 9;
			}
		}
	}

};

const MPGTeam = class MPGTeam {
	constructor(setter={},mindays) {
		const prop = {
			setter : setter,
			mindays : mindays
		};
		this.majorLeague = new MPGLeague(prop);
		this.leagues = new Map();

		this.currentDay = this.majorLeague.activeSeason.currentDay;

		this.name = setter.n?setter.n:this.majorLeague.name;
		this.cleanName = setter.cn?setter.cn:this.majorLeague.cleanName;
		this.owner = setter.o?setter.o:"";
		this.cleanOwner = setter.co?setter.co:"";

		this.buildDate = new Date(setter.bD) || "";

		this.players = new Map();

		this.clubs = new Map();
		this.opponents = new Map();
		this.allClubs = new Map();

		this.events = new Map();
		this.pastEvents = new Map();
		this.nextEvents = new Map();
		this.postProc(setter,mindays);


	};

	postProc(setter, mindays) {
		this.now = new Date();
		/*Post processing*/
		/*Day*/
		//try {
			//Todo : checks this to get last match reported day
			//this.day = Math.max(this.majorLeague.activeSeason.currentDay.day, parseInt(setter.mxD,10));
		//}
		//catch(e) {};

		/*Leagues*/
		if("le" in setter) {
			this.leagues = new Map(setter.le);
		}

		/*Clubs*/
		if("c" in setter) {
			for (var [cid, strClub] of setter.c) {
				try {
					var club = new MPGClub(cid,strClub);
					if(club.majorLeague) {
						club.majorLeagueName = this.leagues.get(club.majorLeagueName);
					}
					else {
						club.majorLeagueName = this.majorLeague.cleanName;
					}
					this.clubs.set(club.id, club);
					this.allClubs.set(club.id, club);
				}
				catch(e) {console.error(e);}
			}
		}
		if("op" in setter) {
			for (var [cid, strClub] of setter.op) {
				try {
					var club = new MPGClub(cid,strClub);
					if(club.majorLeague) {
						club.majorLeagueName = this.leagues.get(club.majorLeagueName);
					}
					else {
						club.majorLeagueName = this.majorLeague.cleanName;
					}
					this.opponents.set(club.id, club);
					if(!this.allClubs.get(club.id)) this.allClubs.set(club.id, club);
				}
				catch(e) {console.error(e);}
			}
		}
		/*Events*/
		if("e" in setter) {
			for (var [eid, eventStr] of setter.e) {
				try {
					var event = new MPGEvent(eid,eventStr);
					event.t1 = this.allClubs.get(eventStr.t1);
					event.t2 = this.allClubs.get(eventStr.t2);
					if(!(event.t1 && event.t2)) {
						let err = event.t1?eventStr.t2:eventStr.t1;
						console.error("Can't find clubs", err);
						continue;
					}

					/*Verifying if both opponents are in the league*/
					if(event.t1.majorLeagueName === event.t2.majorLeagueName) {
						event.league = event.t1.majorLeagueName;
					}

					/*Filling clubs past matchs with this event*/
					if(event.t1.pastMatchs[event.day] === eid) {
						event.t1.pastMatchs[event.day] = event;
					}
					if(event.t2.pastMatchs[event.day] === eid) {
						event.t2.pastMatchs[event.day] = event;
					}

					/*Filling clubs DMI with this event*/
					if(event.t1.DMI) {
						for (var key in event.t1.DMI) {
							var DMIid = event.t1.DMI[key];
							if(DMIid === eid) {
								event.t1.DMI[key] = event;
							}
						}
					}
					if(event.t2.DMI) {
						for (var key in event.t2.DMI) {
							var DMIid = event.t2.DMI[key];
							if(DMIid === eid) {
								event.t2.DMI[key] = event;
							}
						}
					}

					this.events.set(eid,event);
					this.pastEvents.set(eid,event);
				}
				catch(e) {
					console.error(e, setter.e[eid]);
				}

			}
		}
		/*Next Events*/
		if("Ne" in setter) {
			for (var [eid,eventStr] of setter.Ne) {
				try {
					event = new MPGEvent(eid,eventStr);
					event.t1 = this.clubs.get(eventStr.t1);
					event.t2 = this.clubs.get(eventStr.t2);

					/*Verifying if both opponents are in the league*/
					if(event.t1.majorLeagueName === event.t2.majorLeagueName) {
						event.league = event.t1.majorLeagueName;
					}
					else {
						console.error("Outter league next match spotted",event);
					}
					/*Filling clubs next matchs with this event*/
					for(var [NMid,WC] of event.t1.nextMatchsWC) {
						if(eid === NMid) {
							if(!event.t1.nextMatch) {
								event.t1.nextMatch = event;
							}
							if(event.t1.nextMatch && event.date < event.t1.nextMatch.date && event.date > this.now) {
								event.t1.nextMatch = event;
							}
						}
					}
					for(var [NMid,WC] of event.t2.nextMatchsWC) {
						if(eid === NMid) {
							if(!event.t2.nextMatch) {
								event.t2.nextMatch = event;
							}
							if(event.t2.nextMatch && event.date < event.t2.nextMatch.date && event.date > this.now) {
								event.t2.nextMatch = event;
							}
						}
					}

					this.events.set(eid,event);
					this.nextEvents.set(eid,event);
				}
				catch(e) {
					console.error(e);
				}
			}
		}
		/*Players*/
		if("p" in setter) {
			for(var [pid, playerJson] of setter.p) {
				var player = new MPGPlayer(pid, playerJson);
				var club;
				if(club = this.clubs.get(playerJson.c)) {
					player.club = club;
				}

				//Perfs
				if(playerJson.p) {
					for (var [day, strPerf] of playerJson.p) {
						try {
							var perf = new MPGPerf(strPerf);
							perf.event = this.pastEvents.get(strPerf.e);
							/*Filling players perfs events, opponent ref and place*/

							if(perf.transfered===1) {
								/*If player was transfered*/
								if(strPerf.c) perf.fromClub = this.clubs.get(strPerf.c);
								if([perf.event.t1,perf.event.t2].indexOf(perf.fromClub) !== -1) {
									/*Player was already in current club*/
									if(perf.fromClub === perf.event.t1) {
										perf.opponent = perf.event.t2;
										perf.place = "Dom";
									}
									else if(perf.fromClub === perf.event.t2) {
										perf.opponent = perf.event.t1;
										perf.place = "Ext";
									}
								}

							}
							else {
								//Todo : check this
								if(perf.event) {
									/*Player perf opponent fill*/
									if(player.club === perf.event.t1) {
										perf.opponent = perf.event.t2;
										perf.place = "Dom";
									}
									else if(player.club === perf.event.t2) {
										perf.opponent = perf.event.t1;
										perf.place = "Ext";
									}
								}
							}

							/*Player DMI fill*/
							for (var event of player.club.DMI) {
								if(perf.event === event) {
									player.DMI.push(perf);
								}
							}

							player.perfs.set(parseInt(day,10), perf);
						}
						catch(e) {
							console.error(e, strPerf);
							continue;
						}
					}
				}

				//Forfeits
				if(playerJson.fo) {
					for(var [eid, fs] of playerJson.fo) {
						var event = this.pastEvents.get(eid);
						var arr = [];
						for(var f of fs) {
							var forf = new MPGForfeit(f, event);
							arr.push(forf);
						}
						player.forfeits.set(eid, arr);
					}
				}

				//PlayerStats
				if(playerJson.s) {
					player.stats = new MPGPlayerStats(playerJson.s);
				}

				this.players.set(pid, player);
			}
		}
		return;


	};

	getClub(name, field) {
		for(var [cid, club] of this.clubs) {
			if(name.toLowerCase() === club[field].toLowerCase()) {
				return club;
			}
		}
	};

	getPlayer(id) {
		return this.players.get(id);
	};

	//Todo : THIS continue here
	getCurrentMatchs() {
		var now = Date.now();
		var dontFetchBefore = Date.now()-30*24*60*60*1000;
		var matchs = {current:[],next:[],days:[],now:""};
		for(var [key, event] of this.events) {
			if(event.league === this.majorLeague.cleanName && event.date>dontFetchBefore) {
				var date_begin = event.date;
				var date_end = date_begin+2*60*60*1000;
				if(typeof matchs.days[event.day] === "undefined")  {
					matchs.days[event.day] = {"day":event.day,"min":date_begin,"max":date_end};
				}
				else {
					matchs.days[event.day].min = Math.min(matchs.days[event.day].min,date_begin);
					matchs.days[event.day].max = Math.max(matchs.days[event.day].max,date_end);
					if(matchs.days[event.day].min<now && matchs.days[event.day].max>now) {
						matchs.now = matchs.days[event.day];
					}
				}
				if(date_begin>now) {
					matchs.next.push(event);
				}
				else if(date_begin<now && date_end>now) {
					matchs.current.push(event);
				}
			}
		}
		return matchs;
	}
};

const MPGEvent = class MPGEvent{
	constructor(id, setter={}) {
		if(parseInt(id,10)>0 && setter.d){
			this.id = parseInt(id,10);
			this.date = new Date(setter.dB*1000)||"";
			this.day = parseInt(setter.d,10);
			this.league = "";
			this.delayed = setter.dl?setter.dl:0;
			this.t1score = setter.t1s?setter.t1s:null;
			this.t2score = setter.t2s?setter.t2s:null;
			this.t1 = null;
			this.t2 = null;
			this.odds = new MPGOdds(setter.o);
		}
	}

	isScored() {
		if(this.t1score !== null && this.t2score !== null) return true; return false;
	}

	result() {
		if(!this.isScored()) return null;
		if(this.t1score > this.t2score) return this.t1;
		if(this.t2score > this.t1score) return this.t2;
		if(this.t1score === this.t2score) return "draw";
	}

	winner() {
		if(!this.isScored() || this.result() === "draw") return null;
		else return this.resultClub();
	}

	loser() {
		if(!this.isScored() || this.result() === "draw") return null;
		else {
			if(this.result() === this.t1) return this.t2;
			else if(this.result() === this.t2) return this.t1;
			else return null;
		}
	}
};

const MPGOdds = class MPGOdds {
	constructor(setter = {}) {
		this.homeBet = setter.h ? setter.h : 0.0;
		this.drawBet = setter.d ? setter.d : 0.0;
		this.awayBet = setter.a ? setter.a : 0.0;
		this.goalDiffChances = setter.gd;
		this.scoreChances = setter.r;
		this.homeChances = setter.hc;
		this.drawChances = setter.dc;
		this.awayChances = setter.ac;
	}

};

const MPGPlayerStats = class MPGPlayerStats {
	constructor(setter = {}) {
		this.goals=setter.g?parseInt(setter.g,10):0;
		this.goals_aog=setter.ao?parseInt(setter.ao,10):0;
		this.sum_note=setter.s?parseInt(setter.s,10):0;
		this.nb_note=setter.n?parseInt(setter.n,10):0;
		this.avg_note=setter.a?parseFloat(setter.a):0;
		this.dvn_note=setter.d?parseFloat(setter.d):0;
		this.mins_played=setter.m?setter.m:0;
		this.avg_mins_played=setter.am||0;
		this.succ_goals=setter.Sg?parseInt(setter.Sg,10):0;
		this.succ_goals_aog=setter.Sao?parseInt(setter.Sao,10):0;
		this.succ_sum_note=setter.Ss?parseInt(setter.Ss,10):0;
		this.succ_nb_note=setter.Sn?parseInt(setter.Sn,10):0;
		this.succ_avg_note=setter.Sa?parseFloat(setter.Sa):0;
		this.succ_dvn_note=setter.Sd?parseFloat(setter.Sd):0;
		this.succ_mins_played=setter.Sm?setter.Sm:0;
		this.succ_avg_mins_played=setter.Sam||0;
		this.overall_goals=setter.Og?parseInt(setter.Og,10):0;
		this.overall_goals_aog=setter.Oao?parseInt(setter.Oao,10):0;
		this.overall_sum_note=setter.Os?parseInt(setter.Os,10):0;
		this.overall_nb_note=setter.On?parseInt(setter.On,10):0;
		this.overall_avg_note=setter.Oa?parseFloat(setter.Oa):0;
		this.overall_dvn_note=setter.Od?parseFloat(setter.Od):0;
		this.overall_mins_played=setter.Om?setter.Om:0;
		this.overall_avg_mins_played=setter.Oam||0;
		this.G_pos=setter.Gp?parseInt(setter.Gp,10):0;
		this.M_pos=setter.Mp?parseInt(setter.Mp,10):0;
		this.D_pos=setter.Dp?parseInt(setter.Dp,10):0;
		this.A_pos=setter.Ap?parseInt(setter.Ap,10):0;
		this.seasonMinScorerNote=setter.Smsn?parseFloat(setter.Smsn):null;
		this.overallMinScorerNote=setter.Omsn?parseFloat(setter.Omsn):null;
		this.DMI=[];
	}
};

 const MPGPerf = class MPGPerf{
	constructor(setter={}) {
		this.event="";
		this.fromClub="";
		this.transfered=0;
		this.delayed=setter.d?true:false;
		this.opponent;
		this.place;
		if(setter && setter.e && setter.c) {
			this.transfered = 1;
			//this.event=parseInt(setter.e,10);
			//this.fromClub=parseInt(setter.c);
		}
		this.note=setter.n?parseFloat(setter.n):0;
		this.goal=setter.g?parseInt(setter.g,10):0;
		this.aog=setter.a?parseInt(setter.a,10):0;
		this.substitute=setter.s?parseInt(setter.s,10):0;
	}
 };


const MPGTeamScore = class MPGTeamScore {
	constructor(setter={}) {
		if(typeof setter !== "undefined") {
			this.wins = setter.w||0;
			this.losses = setter.l||0;
			this.draws = setter.d||0;
			this.played = setter.pl||0;
			this.GA = setter.GA||0;
			this.GS = setter.GS||0;
			this.GT = setter.GT||0;
			this.points = setter.p||0;
		}
		else this.points =0;
	}
};

const MPGForfeit = class MPGForfeit {
	constructor(setter={}, event = null) {
		if(typeof setter !== "undefined") {
			this.type = setter.t || null;
			this.dateBegin = setter.dB || null;
			this.dateEnd = setter.dE || null;
			this.description = setter.d || "";
			this.event = event;
			this.postProc();
		}
	}
	postProc() {
		if(this.dateBegin && this.dateBegin.constructor.name !== "Date") {
			this.dateBegin = new Date(this.dateBegin*1000);
		}
		if(this.dateEnd && this.dateEnd.constructor.name !== "Date") {
			this.dateEnd = new Date(this.dateEnd*1000);
		}
		if(this.event) {
			this.dateBegin = new Date(this.event.date.getTime()+2*60*60*1000);
		}
		if(this.type === "Y" && this.event) {
			this.dateEnd = new Date(this.event.date.getTime()+2*60*60*1000);
		}
	}
};

/*module.exports = {
	MPGTeam : MPGTeam,
	MPGCurrentDay : MPGCurrentDay,
	MPGPlayer : MPGPlayer,
	MPGAuctionStats : MPGAuctionStats,
	MPGClub : MPGClub,
	MPGEvent : MPGEvent,
	MPGOdds : MPGOdds,
	MPGPlayerStats : MPGPlayerStats,
	MPGPerf : MPGPerf,
	MPGLeague : MPGLeague,
	MPGTeamScore : MPGTeamScore,
	MPGSeason : MPGSeason
};*/