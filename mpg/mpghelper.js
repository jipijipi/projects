/**
 * Created by LittleLama on 02/02/2018.
 */
if (typeof mpghelper === 'undefined') {
    var mpghelper = {
        version : "1.0",
		apiURL : "https://api.mlnstats.com/",
		newApi : {
			league : true,
			selection : true,
			storeSelection : true,
			builds : true,
			nextMatchs : false
		},
        TJS : undefined,
        RSP : undefined,
        SEL : undefined,
        test : undefined,
        DT : {"team":undefined,"data":[],"filters":[]},
        teamAjaxProcess : {
            CARTICON : undefined,
            UNAVICON : undefined,
            initCartUnavIcon : function() {
                if(typeof this.CARTICON === "undefined") this.CARTICON = mpghelper.teamDisplay.glyphiconing("Add to cart","glyphicon glyphicon-shopping-cart");
                if(typeof this.UNAVICON === "undefined") this.UNAVICON = mpghelper.teamDisplay.glyphiconing("Hide this","glyphicon glyphicon-eye-close");
            },
            parseJsonToTeam : function() {
                if(typeof mpghelper.TJS === "string") {
                    data = JSON.parse(mpghelper.TJS);
                }
                team = new MPGTeam(data,nbdays);
                data = null;
            },
            parseMetadataJson : function(team,target) {
                try{
                    document.getElementById("metadata").innerHTML = "";
                    if(target.type === "club") {
                        var club = team.getClub(target.club, "cleanName");
                        if (club instanceof MPGClub) {
                            var script = document.createElement("script");
                            script.type = "application/ld+json";
                            var json = {};
                            json["@context"] = "http://schema.org";
                            json["@type"] = "SportsTeam";
                            json["sport"] = "Soccer";
                            json["url"] = window.location.protocol + "//" + window.location.host + "/club/" + club.cleanName;
                            json["name"] = club.realName;
                            json["legalName"] = club.realName;
                            json["location"] = {
                                "@type": "City",
                                "name": club.name,
                                "publicAccess": true
                            };
                            json["event"] = [];

                            function createEvent(event,club) {
                                var json = {
                                    "@type": "SportsEvent",
                                    "homeTeam": {
                                        "@type": "SportsTeam",
                                        "sport": "Soccer",
                                        "url": window.location.protocol + "//" + window.location.host + "/club/" + event.t1.cleanName,
                                        "name": event.t1.name
                                    },
                                    "awayTeam": {
                                        "@type": "SportsTeam",
                                        "sport": "Soccer",
                                        "url": window.location.protocol + "//" + window.location.host + "/club/" + event.t2.cleanName,
                                        "name": event.t2.name
                                    },
                                    "name": event.t1.realName + " vs " + event.t2.realName,
                                    "location": {
                                        "@type": "Place",
                                        "name": event.t1.name,
                                        "publicAccess": true,
                                        "adress": {
                                            "@type": "City",
                                            "name": event.t1.name
                                        }
                                    },
                                    "startDate": new Date(event.date).toISOString(),
                                    "endDate": new Date(event.date + 2 * 60 * 60 * 1000).toISOString(),
                                    "duration": "T02:00:00",
                                    "description": event.league + " match : day " + event.day + " : " + event.t1.realName + " vs " + event.t2.realName
                                }
                                if(event.isScored()) {
                                    var t1s = event.t1score;
                                    var t2s = event.t2score;
                                    if(event.result() !== "draw") {
                                        /*Win*/
                                        if(event.winner() === club) {
                                            json.result = {
                                                "@type": "WinAction",
                                                "loser":{
                                                    "@type": "SportsTeam",
                                                    "sport": "Soccer",
                                                    "name":event.loser().name,
                                                    "url": window.location.protocol + "//" + window.location.host + "/club/" + event.t2.cleanName,
                                                }
                                            }
                                        }
                                        else {
											json.result = {
												"@type": "LoseAction",
												"winner":{
													"@type": "SportsTeam",
													"sport": "Soccer",
													"name":event.winner().name,
													"url": window.location.protocol + "//" + window.location.host + "/club/" + event.t2.cleanName,
												}
											}
                                        }
                                    }
                                    else {
                                        /*Draw*/
                                        json.result = {
                                            "@type": "TieAction"
                                        }
                                    }
                                }
                                return json;
                            }

                            if (club.nextMatch instanceof MPGEvent) {
                                json["event"].push(createEvent(club.nextMatch,club));
                            }
                            var pmk = Object.keys(club.pastMatchs);
                            for(var event of club.pastMatchs) {
								json["event"].push(createEvent(event,club));
                            }
                            json["athlete"] = [];
                            for (var [pid, player] of team.players) {
                                var pljs = {
                                    "@type": "Person",
                                    "gender": "male",
                                    "familyName": player.name
                                };
                                if (player.firstName) pljs.givenName = player.firstName;
                                if (player.club === club) {
                                    json["athlete"].push(pljs);
                                }
                            }
                            script.text = JSON.stringify(json);
                            document.getElementById("metadata").appendChild(script);
                        }
                    }
                }
                catch (e) {
                    console.warn("Failed to parse metadata "+e);
                }
            },
            parseDataToTeamArray : function(data, nbdays) {
                var players = [];
                if(typeof data === "string") {
                    data = JSON.parse(data);
                }
                team = new MPGTeam(data,nbdays);
                data = null;
                this.initCartUnavIcon();
                if(team.players && team.players.size > 0) {
                    var nextMatchDateOptions = { weekday: 'short', month: 'numeric', day: 'numeric', hour:"2-digit", minute:"2-digit"};
                    var pastMatchDateOptions = {year: 'numeric', month: 'numeric', day: 'numeric'};
                    if(i18next.language === "FR") {
                        var nextMatchDateFormat = new Intl.DateTimeFormat('fr-FR', nextMatchDateOptions);
                        var pastMatchDateFormat = new Intl.DateTimeFormat('fr-FR', pastMatchDateOptions);
                    }
                    else {
                        var nextMatchDateFormat = new Intl.DateTimeFormat('en-GB', nextMatchDateOptions);
                        var pastMatchDateFormat = new Intl.DateTimeFormat('en-GB', pastMatchDateOptions);
                    }

                    for(var [pid, p] of team.players) {
                        var player = p;
                        /*Identity*/
	                    player['select']=this.CARTICON+" "+this.UNAVICON;
                        player['star']=parseInt(mpghelper.teamDisplay.starPlayer(p,true),10);
                        player['agressiv']=parseInt(mpghelper.teamDisplay.markAgressivePlayer(p,true),10);
                        player['remarkable']=(player['star']>0 || player['agressiv']!=0);
                        /*Perfs*/
                        player["processedperfs"]=[];
                        var inverter = 1;
                        if(team.currentDay.dayStart < 0) {
                            inverter = -1;
                        }
	                    for (var k=0, j = Math.abs(team.currentDay.dayStart); j >= team.currentDay.dayStop * inverter ; k++ , j--) {
		                    /*Previous season backup*/
                            if(j === 0) {
                                j = team.currentDay.lastSeasonLastDay;
                                inverter = -1;
							}
							//If perf day is already filled, continue
							if(k>0 && inverter === -1 && j <= team.currentDay.dayStart) break;
                            /*Iteration upscaling*/
                            player["processedperfs"][j]= {
	                            display: mpghelper.teamDisplay.playerNote(team, pid, j * inverter, pastMatchDateFormat),
	                            value: mpghelper.teamDisplay.playerNote(team, pid, j * inverter, pastMatchDateFormat, true)
                            };
                            if(k>99) {
                                console.error('Infinite loop detected');
                                return;
                            }
                        }
                        /*Club*/
                        player['DMI']=mpghelper.teamDisplay.displayDMI(team,pid,pastMatchDateFormat);
                        player['nextOpponent']=mpghelper.teamDisplay.displayNextOpponent(p,nextMatchDateFormat);
                        /*Storing row*/
                        players.push(player);
                    }
                }
                mpghelper.DT.team = team;
                mpghelper.DT.data = players;
                return response = {"team" :team , "data" : players, "filters" : []};
            },
            teamColumns : function(team) {
                /*Pre perfs*/
                this.initCartUnavIcon();
	            var skipEmptyValues = $.fn.dataTable.absoluteOrderNumber( [
		            { value: '', position: 'bottom' }
	            ]);
	            var skipZeroValues = $.fn.dataTable.absoluteOrderNumber( [
		            { value: 0, position: 'bottom' }
	            ]);
	            var skipEmptyAndZeroValues = $.fn.dataTable.absoluteOrderNumber( [
		            { value: '', position: 'bottom' },
		            { value: 0, position: 'bottom' }
	            ]);
                var columns = [
                    /*filter display type sort*/
                    {
                    	"title":"id",
	                    "desig":"id",
	                    "visible": false,
	                    "exportable":false,
	                    "data": 'id' },
                    {
                    	"title":this.CARTICON+" "+this.UNAVICON,
	                    "footerTitle":"",
	                    "ordering": false,
	                    "orderable": false,
	                    "desig":"sel",
	                    "exportable":false,
	                    "data" : "select"
                    },
                    { "title":"star",  "desig":"star", "visible": false, "exportable":false, data: 'star' },
                    { "title":"agressiv",  "desig":"agressiv", "visible": false, "exportable":false, data: 'agressiv' },
                    { "title":"remarkable",  "desig":"remarkable", "visible": false, "exportable":false, data: 'remarkable' },
	                {
		                "title": i18next.t("teamHeader.CLUB_PLAYER"),
		                "desig": "name",
		                "searchField": true,
		                "exportable": true,
		                "data": null,
		                "render": function (data, type, row, meta) {
			                let d = mpghelper.teamDisplay.playerName(row);
			                return type === 'display' ? d.display : d.value;
		                }
	                },
	                {
		                "title": i18next.t("teamHeader.CLUB_PLACE"),
		                "desig": "place",
		                "searchField": true,
		                "searchInput": "select-set",
		                "searchOptions": [i18next.t("teamHeader.G"), i18next.t("teamHeader.D"), i18next.t("teamHeader.M"), i18next.t("teamHeader.A")],
		                "exportable": true,
		                "data":null,
		                "render": function (data, type, row, meta) {
			                let d = mpghelper.teamDisplay.displayPlayerPlace(row);
			                switch(type){
				                case "display" : return d.display; break;
				                case "value" : return d.short; break;
				                case "export" : return d.short; break;
			                    default : return d.value; break;
			                }
		                }
	                },
                    {
                    	"title":i18next.t("teamHeader.CLUB_RATE"),
	                    "desig":"rate",
	                    "searchField":true,
	                    "rangeSearch":true,
	                    "exportable":true,
	                    "data": null,
	                    "render": function (data, type, row, meta) {
		                    let d = mpghelper.teamDisplay.playerRate(row);
		                    return type === 'display' ? d.display : row.rate;
	                    }
                    },
	                {
	                	"title":"Enchère moy",
		                "desig":"avgbid",
		                "exportable":true,
		                "data": null,
		                "type": skipEmptyValues,
		                "render": function(data, type, row, meta){
	                		if(!row.auctionStats || !row.auctionStats.avgPrice) return "";
	                		return Math.max(row.auctionStats.avgPrice,row.rate);
		                },
		                "className": "extrastats avgbid hidden"
	                },
                    //Notes (beware : always Season then Succ then Overall because of regex filters
                    {
                    	"title":i18next.t("teamHeader.CLUB_NOTE"),
	                    "desig":"snote",
	                    "searchField":true,
	                    "rangeSearch":true,
	                    "type": skipEmptyValues,
                        "periodsLink" : {
                            season : {self : "snote", pres : "snbnote"},
                            succ : {self : "sucnote", pres : "sucnbnote"},
                            overall : {self : "onote", pres : "onbnote"}
                        },
	                    "exportable":true,
	                    "data" : null,
	                    "render": function(data, type, row, meta){
		                    var d = mpghelper.teamDisplay.displaySeasonAvgNote(row);
		                    return type === "display" ? d.display : d.value;
	                    }
                    },
	                {
		                "title":"Note série",
		                "desig":"sucnote",
		                "visible": false,
		                "data": 'stats.succ_avg_note',
		                "className": "periodsdata succavgnote hidden",
		                "exportable":true
	                },
	                {
		                "title":"Note 1 an",
		                "desig":"onote",
		                "visible": false,
		                "data": 'stats.overall_avg_note',
		                "className": "periodsdata ovavgnote hidden",
		                "exportable":true
	                },
	                {
		                "title":"Nb match",
		                "desig":"snbnote",
		                "visible": false,
		                "data": 'stats.nb_note',
		                "className": "hidden",
		                "exportable":true
	                },
	                {
		                "title":"Nb match série",
		                "desig":"sucnbnote",
		                "visible": false,
		                'data': 'stats.succ_nb_note',
		                "exportable":true
	                },
	                {
		                "title":"Nb match 1 an",
		                "desig":"onbnote",
		                "visible": false,
		                "data": 'stats.overall_nb_note',
		                "className": "hidden",
		                "exportable":true
	                },
	                {
		                "title":i18next.t("teamHeader.CLUB_VAR"),
		                "desig":"sdvn",
		                "searchField":true,
		                "rangeSearch":true,
		                "type": skipZeroValues,
		                "periodsLink" : {season : "sdvn", succ : "sucdvn", overall : "odvn"},
		                "exportable":true,
		                "data" : null,
		                "render": function(data, type, row, meta){
			                var d = mpghelper.teamDisplay.displaySeasonDvnNote(row);
			                return type === "display" ? d.display : d.value;
		                }
	                },
	                {
		                "title":"Var série",
		                "desig":"sucdvn",
		                "visible": false,
		                "data": 'stats.succ_dvn_note',
		                "exportable":true,
		                "className": "periodsdata sucdvnnote hidden"
	                },
					{
						"title":"Var 1 an",
						"desig":"odvn",
						"visible": false,
						"data": 'stats.overall_dvn_note',
						"exportable":true,
						"className": "periodsdata ovdvnnote hidden"
					},
	                {
		                "title": i18next.t("teamHeader.CLUB_GOAL"),
		                "desig":"sgoal",
		                "searchField":true,
		                "rangeSearch":true,
		                "periodsLink" : {season : "sgoal", succ : "sucgoal", overall : "ogoal"},
		                "exportable":true,
		                "type": skipZeroValues,
		                "data": null,
		                "render": function(data, type, row, meta){
			                var d = mpghelper.teamDisplay.displaySeasonGoals(row);
			                return type === "display" ? d.display : d.value;
		                }
	                },
	                {
		                "title":"Buts série",
		                "desig":"sucgoal",
		                "visible": false,
		                "data": 'stats.succ_goals',
		                "exportable":true,
		                "className": "periodsdata sucgoal hidden"
	                },
	                {
		                "title":"Buts 1 an",
		                "desig":"ogoal",
		                "visible": false,
		                "data": 'stats.overall_goals',
		                "exportable":true,
		                "className": "periodsdata ovgoal hidden"
	                },
	                {
		                "title": "Temps",
		                "desig":"smins",
		                "searchField":true,
		                "rangeSearch":true,
		                "periodsLink" : {season : "smins", succ : "succmins", overall : "omins"},
		                "type": skipZeroValues,
		                "exportable":true,
		                "data": null,
		                "className": "extrastats periodsdata smins hidden",
		                "render": function (data, type, row, meta) {
			                let d = mpghelper.teamDisplay.displayMinsPlayed(row);
			                return type === 'display' ? d.display : d.value;
		                }
	                },
	                {
		                "title": "Tps série",
		                "desig":"succmins",
		                "visible": false,
		                "exportable":true,
		                "data": "stats.succ_mins_played",
		                "className": "periodsdata succmins hidden"
	                },
	                {
		                "title": "Tps 1 an",
		                "desig":"omins",
		                "visible": false,
		                "exportable":true,
		                "data": "stats.overall_mins_played",
		                "className": "periodsdata omins hidden"
	                },
	                {
		                "title": "Tps moy",
		                "desig":"avgsmins",
		                "searchField":true,
		                "rangeSearch":true,
		                "type": skipZeroValues,
		                "periodsLink" : {season : "avgsmins", succ : "succavgmins", overall : "oavgmins"},
		                "exportable":true,
		                "data": null,
		                "className": "extrastats periodsdata avgsmins hidden",
		                "render": function (data, type, row, meta) {
			                let d = mpghelper.teamDisplay.displayAvgMinsPlayed(row);
			                return type === 'display' ? d.display : d.value;
		                }
	                },
	                {
		                "title": "Tps moy série",
		                "desig":"succavgmins",
		                "visible": false,
		                "exportable":true,
		                "data": "stats.succ_avg_mins_played",
		                "className": "periodsdata succavgmins hidden"
	                },

	                {
		                "title": "Tps moy 1 an",
		                "desig":"oavgmins",
		                "visible": false,
		                "exportable":true,
		                "data": "stats.overall_avg_mins_played",
		                "className": "periodsdata oavgmins hidden"
	                },
	                {
		                "title": "Min/But",
		                "desig":"goalpermin",
		                "className":"extrastats goalpermin hidden",
		                "searchField":true,
		                "rangeSearch":true,
		                "type": skipEmptyAndZeroValues,
		                "exportable":true,
		                "data" : null,
		                "render": function(data, type, row, meta){
			                if(row.stats.mins_played > 0 && row.stats.goals > 0){
				                return Math.round(row.stats.mins_played/row.stats.goals)
			                }
			                else return "";
		                }
	                },
	                {
		                "title": "Min/But 1 an",
		                "desig":"ovgoalpermin",
		                "className":"extrastats ovgoalpermin hidden",
		                "searchField":true,
		                "rangeSearch":true,
		                "type": skipEmptyValues,
		                "exportable":true,
		                "data" : null,
		                "render": function(data, type, row, meta){
			                if(row.stats.overall_mins_played > 0 && row.stats.overall_goals > 0){
				                return Math.round(row.stats.overall_mins_played/row.stats.overall_goals)
			                }
			                else return "";
		                }
	                },
	                {
	                	"title":i18next.t("teamHeader.MinScorerNote"),
		                "desig":"msn",
		                "className": "extrastats minscorernote hidden",
		                "exportable":true,
		                "type": skipEmptyAndZeroValues,
                        "data" : null,
		                "render": function(data, type, row, meta){
			                var d = mpghelper.teamDisplay.displayMinScorerNote(row);
			                return type === "display" ? d.display : d.value;
		                }
                    },
	                {
	                	"title":i18next.t("teamHeader.petrodollar"),
		                "desig":"petro",
		                "className":"extrastats petrodollar hidden",
		                "searchField":true,
		                "rangeSearch":true,
		                "exportable":true,
		                "type": skipEmptyAndZeroValues,
                        "data" : null,
		                "render": function(data, type, row, meta){
			                var d = mpghelper.teamDisplay.displayPetrodollar(row);
			                return type === "display" ? d.display : d.value;
		                }
	                }
                ];
                /*Perfs*/
                var inverter = 1;
	            if(team.currentDay.dayStart <= 0) {
		            inverter = -1;
	            }

	            for (var k=0, j = Math.abs(team.currentDay.dayStart); j >= team.currentDay.dayStop * inverter ; k++ , j--) {
                    /*Previous season backup*/
                    if(j === 0) {
	                    j = team.currentDay.lastSeasonLastDay;
	                    inverter = -1;
                    }
					//If perf day is already filled, continue
					if(k>0 && inverter === -1 && j <= team.currentDay.dayStart) break;

                    /*Iteration upscaling*/
                    var column = {
                        "title": i18next.t("teamHeader.CLUB_DAY")+ j,
                        "toptitle": i18next.t("teamHeader.CLUB_LASTMATCH"),
                        "colspan" : "daymatchs",
                        "desig":"d"+j,
                        "searchable": false,
	                    "type": skipEmptyAndZeroValues,
                        className: "perfs defaultDays day"+j,
	                    "exportable":true,
                        "data": "processedperfs."+j,
                        "render": function (data, type, row, meta) {
		                    return type === 'display' ? data.display : data.value;
	                    }
                    };
                    if(k<3) {
                        /*column.searchField=true;*/
                    }
                    if(k>team.currentDay.minDays-1) {
                        column.toptitle = i18next.t("teamHeader.CLUB_SEASONMATCH");
                        column.colspan = "extradaymatchs";
                        column.className= "perfs day"+j+" extraDay hidden";
                    }
                    if(k>99) {
                        console.error('Infinite loop detected');
                        return;
                    }
                    columns.push(column);
                }
                /*Post perfs*/
                //Extra perfs stats
	            columns.push({
		            "title":"Cleansheet",
		            "desig":"cleansheet",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.S"
	            });
	            columns.push({
		            "title":"But/Peno",
		            "desig":"pengoal",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.PF",
		            "render": function (data, type, row, meta) {
			            if(row.extraStats.PM>0 || row.extraStats.PG>0){
			            	let goal = row.extraStats.PG||0;
			            	let miss = row.extraStats.PM||0;
				            return type === "display" ? goal+"/"+(goal+miss) : goal;
			            }
			            return "";
		            }
	            });
	            columns.push({
		            "title":"But/Coup-franc",
		            "desig":"freekickgoal",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.FG"
	            });
	            columns.push({
		            "title":"But/surface",
		            "desig":"oboxgoal",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.OG"
	            });
	            columns.push({
		            "title":"Pass decis.",
		            "desig":"goalassist",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.GA"
	            });
	            columns.push({
		            "title":"Occas° créée",
		            "desig":"bigchancecreated",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.C"
	            });
	            columns.push({
		            "title":"Corner gagné",
		            "desig":"cornerwon",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.WC"
	            });
	            columns.push({
		            "title":"%Passes",
		            "desig":"passsuccess",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.aP",
		            "render": function (data, type, row, meta) {
			            if(data>0){
				            return type === "display" ? Math.round(data*10000)/100+"%" : data;
			            }
			            return "";
		            }
	            });
	            columns.push({
		            "title":"Ballons",
		            "desig":"touches",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.T"
	            });
	            columns.push({
		            "title":"Interceptions",
		            "desig":"interceptions",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.I"
	            });
	            columns.push({
		            "title":"Tacles",
		            "desig":"tackles",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.K"
	            });
	            columns.push({
		            "title":"%Duel",
		            "desig":"duelsrate",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : null,
		            "render": function (data, type, row, meta) {
		            	if(row.extraStats.DW && row.extraStats.DW>0){
		            		let won = row.extraStats.DW||0;
		            		let lost = row.extraStats.DL||0;
		            		let val = Math.round(won/(won+lost)*10000)/100;
				            return type === "display" ? val+"%" : val;
			            }
			            return "";
		            }
	            });
	            columns.push({
		            "title":"Fautes",
		            "desig":"faults",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.F"
	            });
	            columns.push({
		            "title":"But évité",
		            "desig":"savedibox",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.SI"
	            });
	            columns.push({
		            "title":"Action stoppée",
		            "desig":"savedobox",
		            "searchable":false,
		            "exportable":true,
		            "className": "extraperfstats hidden",
		            "type": skipEmptyAndZeroValues,
		            "data" : "extraStats.SO"
	            });
                /*-7*/columns.push({
                    "title":i18next.t("teamHeader.CLUB_LASTSAMEMATCH"),
                    "desig":"dmi",
                    "searchable": false,
		            "exportable":true,
		            "type": skipEmptyAndZeroValues,
                    "data" : {
                        _: "DMI.value",
                        display : "DMI.display"
                    }
                });
                /*-6*/columns.push({
		            "title":i18next.t("teamHeader.CLUB_CLUB"),
		            "desig":"club",
		            "searchField":true,
		            "exportable":true,
		            "data" : null,
		            "render": function (data, type, row, meta) {
			            return mpghelper.teamDisplay.displayClub(row);
		            }
                });
                /*-5*/columns.push({
		            "title":"CleanClub",
	                "desig":"cleanclub",
	                "visible": false,
	                "exportable":false,
	                "data" : 'club.cleanName'
                });
                /*-4*/columns.push({
		            "title":"RealClub",
		            "desig":"realclub",
		            "visible": false,
		            "exportable":false,
		            "data" : 'club.realName'
                });
				/*-3*/columns.push({
		            "title":"CleanRealClub",
		            "desig":"cleanrealclub",
		            "visible": false,
		            "exportable":false,
		            "data" : 'club.cleanRealName'
				});
                /*-2*/columns.push({
		            "title":i18next.t("teamHeader.CLUB_NEXTOP"),
		            "desig":"nextmatch",
		            "searchable": false,
		            "exportable":true,
		            "data" : 'nextOpponent'
                });
                /*-1*/columns.push({
                    "title":i18next.t("teamHeader.CLUB_NEXTWINCHANCE"),
                    "desig":"nextwc",
                    "searchable": false,
                    "exportable":true,
                    "data" : null,
		            "render": function (data, type, row, meta) {
			            let d = mpghelper.teamDisplay.displayWinChances(row);
			            if(!d) return "";
			            return type === 'display' ? d.display : d.value;
		            }
                });
                if(team && team.majorLeague && team.majorLeague.id === 1){
	                columns.push({
		                "title":"<small>Dispo@MPGLaurent?</small>",
		                "desig":"nextForfeit",
		                "className": "nextForfeit",
		                "searchable": false,
		                "exportable":true,
		                "data" : "nextForfeit",
		                "render": function (data, type, row, meta) {
			                if(!data || !data.type) return "";
			                let str = "";
			                switch(data.type.toLowerCase()){
				                case "home" : return "Hors groupe";
				                case "injury":	str+= "&#134; "+data.descr || "Blessé"; break;
				                case "grace" : str+= "Sursis"; break;
				                case "suspended" : str+= "Suspendu"; break;
				                case "yellow" : return;
				                case "yellow2" : return;
				                case "red" : return;
				                default : return data.type;
			                }
			                if(str){
				                if(data.dateBegin !== data.dateEnd){
					                let end = new Date(data.dateEnd);
					                let begin = new Date(data.dateBegin);
					                let now = new Date();
					                let nbWeek = Math.round((end-now)/7/24/60/60/1000);
					                if(nbWeek>1) return str += " ("+nbWeek+"sem.)";
				                }
				                return str;
			                }
		                }
	                });
                }

                return columns;
            },
            teamTopHeader : function(columns) {
                var theHeader = document.createElement("thead");
                var theTr = document.createElement("tr");
                var modTh = document.createElement("th");
                var colcount = columns.length;
                for(var key in columns) {
                    if(!columns.hasOwnProperty(key)) continue;
                    colcount--;
                    var column = columns[key];
                    var nextColumn = columns[parseInt(key,10)+1] || undefined;
                    var colspan = ("colspan" in column && column.colspan !== false);
                    var thisColspan = column.colspan || 0;

                    if(typeof thisTh==="undefined") {
                        var thisTh = modTh.cloneNode(false);
                        thisTh.innerHTML = column.toptitle || column.title;
                        thisTh.classList = column.className;
                        thisTh.colSpan = 1;
                        if(thisColspan) thisTh.id = thisColspan;
                    }
                    else if(colspan === true) {
                        thisTh.colSpan++;
                    }

                    var endOfColspan = (typeof nextColumn !== "undefined"
                        && "colspan" in nextColumn
                        && nextColumn.colspan!=thisColspan);

                    if(colcount===0 || colspan === false || endOfColspan === true) {
                        theTr.appendChild(thisTh);
                        thisTh = undefined;
                    }
                }
                theHeader.appendChild(theTr);
                return theHeader;
            },
            teamFooter : function(columns) {
                try{
                    var theFooter = document.createElement("tfoot");
                    var theTr = document.createElement("tr");
                    var modTh = document.createElement("th");
                    function isSearchable(column) {
                        if("searchField" in column && column.searchField == true) return true;
                        return false;
                    }
	                function isRangeSearchable(column) {
		                if("rangeSearch" in column && column.rangeSearch == true) return true;
		                return false;
	                }
                    function hasFooterTitle(column) {
                        if("footerTitle" in column) return true;
                        return false;
                    }
                    function searchInput(column) {
                        if("searchInput" in column && column.searchInput === "select" && "searchOptions" in column && column.searchOptions.length>0) {
                            return {
                                type : "select"
                            }
                        }
                        else if("searchInput" in column && column.searchInput === "select-set" && "searchOptions" in column && column.searchOptions.length>0){
                            return {
                                type : "select-set",
                                options : column.searchOptions
                            }
                        }
                        else return {type : "text"};
                    }

                    for(var key in columns) {
                        var column = columns[key];
                        var thisTh = modTh.cloneNode(false);
                        if(isSearchable(column)) {
                            var setInput = searchInput(column);
                            if(setInput.type==="text") {
                                if(isRangeSearchable(column)) {
									thisTh.innerHTML = '<input type="text" placeholder="'+column.title+'" class="column_search column_input range_search" />';
                                }
                                else {
									thisTh.innerHTML = '<input type="text" placeholder="'+column.title+'" class="column_search column_input simple_search" />';
                                }
                            }
                            else if(setInput.type==="select") {
                                thisTh.innerHTML = '<select><option value=""></option></select>';
                            }
                            else if(setInput.type==="select-set" && setInput.options.length>0) {
                                var select = document.createElement("select");
                                select.classList = "custom-select";
                                var option = document.createElement("option");
                                var opt = option.cloneNode();
                                opt.value = "";
                                opt.text = i18next.t("teamHeader.All");
                                select.appendChild(opt);
                                for(var i in setInput.options) {
                                    var opt = option.cloneNode();
                                    opt.value = i;
                                    opt.text = setInput.options[i];
                                    select.appendChild(opt);
                                }
                                thisTh.appendChild(select);
                            }
                        }
                        else if(hasFooterTitle(column)) thisTh.innerHTML = column.footerTitle;
                        else thisTh.innerHTML = column.title;
                        theTr.appendChild(thisTh);
                    }
                    theFooter.appendChild(theTr);
                    theFooter.appendChild(mpghelper.teamDisplay.legend(columns));
                    return theFooter;
                }
                catch(e) {
                    console.error("teamFooter : "+e);
                }

            },
            getTeamHeaders : function(columns) {
                var headers=[];
                for (var k in columns) {                    
					headers[k] = columns[k].desig;
                }
                return headers;
            },
            getColId : function(param){
				try {
	                return response.headers.indexOf(param);
                }
                catch(e) {
                    return null;
                }
            },
	        getColParam : function(id){
                id = parseInt(id);
                try {
	                return response.headers[id];
                }
                catch(e) {
                    return null;
                }
	        },
            detectMobile : function() {
                if (typeof window.orientation !== 'undefined') {
                    return true;
                }
                return false;
            },
            getColumnsForExport : function(columns){
	            if(!columns) return [];
                var output = [];
                var colLength = columns.length;
                for(var i=0 ; i<colLength ; i++){
                    var col = columns[i];
                    if(col && "exportable" in col && col.exportable === true){
	                    output.push(i);
                    }
                }
                return output;

            },
            drawTable : function(id,response,nbdays,table) {
                var timer_process = new Date().getTime();
                
                var parentTable =  document.getElementById(id);
                var columns,tableFooter;
                if ( table instanceof $.fn.dataTable.Api) {
                    columns = null;
                    tableFooter = null;
                    table.clear();
                    table.destroy();
                    parentTable.deleteTFoot();
                    parentTable.deleteTHead();
                }
                columns = mpghelper.teamAjaxProcess.teamColumns(team);
                tableFooter = mpghelper.teamAjaxProcess.teamFooter(columns);
                response.headers = mpghelper.teamAjaxProcess.getTeamHeaders(columns);
                var visibleColumns = this.getColumnsForExport(columns);

                var tableParameters = {
                    rowId: 'id',
                    retrieve : true,
	                lengthMenu: [15, 25, 50, 75, 100 ],
                    /*searchHighlight: true,*/
                    order:[[this.getColId("place"),'asc'],[this.getColId("sgoal"),'desc'],[this.getColId("snote"),'desc']],
                    stateSave :true,
                    deferRender:    true,
                    bDeferRender: true,
                    fixedHeader: {
                        header: !(this.detectMobile()),
                        footer: !(this.detectMobile())
                    },
	                dom: 'Blfrtip',
                    buttons : [
	                    {
		                    extend: 'copyHtml5',
		                    messageTop: 'Stats MPG compilées via MPGStats.fr',
		                    exportOptions: {
		                        orthogonal: 'export',
			                    columns: visibleColumns
                            }
	                    },
	                    {
		                    extend: 'excelHtml5',
		                    messageTop: 'Stats MPG compilées via MPGStats.fr',
		                    title: 'MPGStats_fr_export',
		                    exportOptions: {
			                    orthogonal: 'export',
			                    columns: visibleColumns
		                    }
	                    },
	                    {
		                    extend: 'pdfHtml5',
		                    messageTop: 'Stats MPG compilées via MPGStats.fr',
		                    title: 'MPGStats_fr_export',
		                    exportOptions: {
			                    orthogonal: 'export',
			                    columns: visibleColumns
		                    }
	                    }
                    ],
                    /*fixedColumns: {
                        leftColumns: 1
                    },*/
                    //select : "multi",

                    /*scrollX: true,*/
                    /*responsive: {
                        breakpoints: [
                            {name: 'bigdesktop', width: Infinity},
                            {name: 'meddesktop', width: 1480},
                            {name: 'smalldesktop', width: 1280},
                            {name: 'medium', width: 1188},
                            {name: 'tabletl', width: 1024},
                            {name: 'btwtabllandp', width: 848},
                            {name: 'tabletp', width: 768},
                            {name: 'mobilel', width: 480},
                            {name: 'mobilep', width: 320}
                        ]
                    },*/
                    columns: columns,
                    "rowCallback": function( row, data, index ) {
                        $('td', row).addClass(data["fullplace"].toLowerCase());
                    }
                };

                if(i18next.language !== "en") {
                    tableParameters.language = {
                        "decimal":        i18next.t("datatables.decimal"),
                        "emptyTable":     i18next.t("datatables.emptyTable"),
                        "info":           i18next.t("datatables.info"),
                        "infoEmpty":      i18next.t("datatables.infoEmpty"),
                        "infoFiltered":   i18next.t("datatables.infoFiltered"),
                        "infoPostFix":    i18next.t("datatables.infoPostFix"),
                        "thousands":      i18next.t("datatables.thousands"),
                        "lengthMenu":     i18next.t("datatables.lengthMenu"),
                        "loadingRecords": i18next.t("datatables.loadingRecords"),
                        "processing":     i18next.t("datatables.processing"),
                        "search":         i18next.t("datatables.search"),
                        "zeroRecords":    i18next.t("datatables.zeroRecords"),
                        "paginate": {
                            "first":      i18next.t("datatables.paginate.first"),
                            "last":       i18next.t("datatables.paginate.last"),
                            "next":       i18next.t("datatables.paginate.next"),
                            "previous":   i18next.t("datatables.paginate.previous"),
                        },
                        "aria": {
                            "sortAscending":  i18next.t("datatables.aria.sortAscending"),
                            "sortDescending": i18next.t("datatables.aria.sortDescending")
                        }
                    }
                }
                $.fn.dataTable.ext.errMode = 'none';
                /*Refreshing footer*/
                parentTable.tFoot = tableFooter;
                /*Adding top header*/
                /*parentTable.thead.appendChild(tableTopHeader.innerHTML);*/
                /*Calling DataTales*/
                table = $("#"+id).DataTable(tableParameters);

                response.applyRangeFilters = function(filters) {
                    $.fn.dataTable.ext.search.push(
                        function( settings, data, dataIndex ) {
                            for(var key in filters) {
                                if(filters[key]) {
									var counter = 0;
									var filter = filters[key];
									var colId = key;
									var search = parseFloat(data[colId] ) || 0;
									var min = parseFloat(filter.min)||0;
									var max = parseFloat(filter.max)||NaN;
									var notval = parseFloat(filter.notval)||NaN;
									if(!isNaN(notval) && search == notval) return false;
									if (
										( !isNaN(max) && search > max ) ||
										(  min > search )
									)
									{
										return false;
									}
                                }
                            }
                            return true;
                        }
                    );
                };

                /*Adding perfs columns*/
                table.clear();
                table.rows.add(response.data);

	            /**
	             * Parsing string to range syntax and applying filter to column in datatables instance
	             * @param value : the search string (parsed to separate modules by period and presence if so)
	             * @param index : index of the column sending the search string
	             * @param tableInstance : targetted instance of datatables
	             */
                var applyRangeOperator = function(value, index, tableInstance) {
	                var rangeOperators = new RegExp(/(\d\+$|\d-\d|\d-$|^>\d|^<\d)/);
	                var moreThan = new RegExp(/(\d*\.?\d+)\+$|^>(\d*\.?\d+)/);
	                var lessThan = new RegExp(/(\d*\.?\d+)-$|^<(\d*\.?\d+)/);
	                var rangeExp = new RegExp(/(\d*\.?\d+)-(\d*\.?\d+)/);

	                var colId, colName;
	                if(typeof index !== "number") {
						colId = mpghelper.teamAjaxProcess.getColId(index);
						colName = index;
                    }
                    else {
	                    colId = index;
	                    var cols = mpghelper.teamAjaxProcess.teamColumns(team);
	                    try{
							colName = cols[colId].desig;
                        }
                        catch (e) {}
                    }


					if(colId && rangeOperators.test(value)) {
						var test;
						if(test = moreThan.exec(value)) {
							var searchVal =parseFloat(test[1] || test[2]);
							response.filters[colId] = {min : searchVal, max : "", dataCol : colName};
							response.applyRangeFilters(response.filters);
						}
						else if(test = lessThan.exec(value)) {
							var searchVal =parseFloat(test[1] || test[2]);
							response.filters[colId] = {min : "", max : searchVal, dataCol : colName};
							response.applyRangeFilters(response.filters);
						}
						else if(test = rangeExp.exec(value)) {
							response.filters[colId] = {min : parseFloat(test[1]), max : parseFloat(test[2]) , dataCol : colName};
							response.applyRangeFilters(response.filters);
						}
						else {
							console.error("Filter condition not found");
						}
						tableInstance.draw();
					}
					else if(colId) {
						response.filters[colId] = undefined;
						var val = $.fn.dataTable.util.escapeRegex(value);
						if ( tableInstance.search() !== val ) {tableInstance.search(val);}
					}
					else {
					    console.error("colId not found for "+index);
                    }
                };
	            /**
	             * Test string input about period and pres search syntax
	             * @param value : the search string
	             * @param periodLink : the whole period object defined when setting columns
	             * @param tableInstance : target instance of datatables
	             */
	            var periodTest = function(value, periodLink, tableInstance) {
		            var seasonFilter;
		            if("overall" in periodLink) {
			            //Looking for an overall filter

			            var overallOperator = new RegExp(/\{(\S*)\}/);
			            var overallFilter = overallOperator.exec(value);
			            if(Array.isArray(overallFilter)) {
				            //Found a filter on overall values
				            var str = overallFilter[1];
							var link;
							try {
								link = periodLink.overall.self;
								if("pres" in periodLink.overall) {
									str = presenceTest(str, periodLink.overall.pres, tableInstance);
								}
							}
							catch(e) { link = periodLink.overall; }
				            applyRangeOperator(str, link, tableInstance);
			            }
			            seasonFilter = value.replace(overallOperator, "");
		            }
		            if("succ" in periodLink) {
			            //Looking for a successive filter
			            var succOperator = new RegExp(/\((\S*)\)/);
			            var succFilter = succOperator.exec(value);
			            if(Array.isArray(succFilter)) {
				            //Found a filter on overall values
				            var str = succFilter[1];
							var link;
							try {
								link = periodLink.succ.self;
								if("pres" in periodLink.succ) {
									str = presenceTest(str, periodLink.succ.pres, tableInstance);
								}
							}
							catch(e) { link = periodLink.succ; }
				            applyRangeOperator(str, link, tableInstance);
			            }
			            seasonFilter = seasonFilter.replace(succOperator, "");
		            };
		            //Extracting season filter
		            var link;
		            try {
			            link = periodLink.season.self;
						if("pres" in periodLink.season) {
							seasonFilter = presenceTest(seasonFilter, periodLink.season.pres, tableInstance);
						}
		            }
		            catch(e) {
			            link = periodLink.season;
		            }

		            if(seasonFilter.length > 0) {
			            applyRangeOperator(seasonFilter, link, tableInstance);
		            }
	            };
	            var presenceTest = function(value, colLink, tableInstance) {
	            	//Test and send back a string without presence chars
		            //Send to period regex test

		            var presOperator = new RegExp(/\^([><]?\d+[+-]?)/);
		            //Extract presence operator ( ^__ )
		            var test = presOperator.exec(value);
		            if(Array.isArray(test)) {
			            //Found a filter on overall values
			            applyRangeOperator(test[1], colLink, tableInstance);
		            }
		            return value.replace(presOperator, "");
	            };
				var resetOperator = function(index) {
					try {
						var cols = mpghelper.teamAjaxProcess.teamColumns(team);
						var links = cols[index].periodsLink;
						if (typeof links === "object") {
							for (var i in links) {
								var link = links[i];
								if (typeof link === "object") {
									for (var j in link) {
										var l = link[j];
										response.filters[mpghelper.teamAjaxProcess.getColId(l)] = undefined;
									}
								}
								if (typeof link === "string" && link.length > 0) {
									response.filters[mpghelper.teamAjaxProcess.getColId(link)] = undefined;
								}
							}
						}
						response.applyRangeFilters(response.filters);
					}
					catch(e) { console.log(e);}
                };

                table.columns().every( function (index) {
                    var that = this;
                    /*Select auto filling*/
                    if(that && that.footer().firstChild && that.footer().firstChild.tagName === "SELECT") {
                        that.footer().querySelectorAll("select").item(0).addEventListener('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
                            if(val==="") {
                                that.search('').draw();
                            }
                            else {
                                that
                                    .search( val ? '^'+val+'$' : '', true, false )
                                    .draw();
                            }
                        } );
                    }
                    else if(that && that.footer().firstChild && that.footer().firstChild.tagName === "INPUT") {
                        /*Input text on change for range search*/
                        $( 'input.range_search', this.footer() ).on('change', function () {
                            var value = this.value.toString();
	                        resetOperator(index);

	                        if(value.length > 0) {
								//Get periodLinks of this index
								var cols = mpghelper.teamAjaxProcess.teamColumns(team);

								var periodsLink, colId;
								try {
									periodsLink = cols[index].periodsLink;
								}
								catch(e) {}

								//If index has period links, let's make the regex tests
								if(typeof periodsLink === "object") {
									periodTest(value, periodsLink, that);
								}
								//Else : no period link for this column, giving to apply now
								else {
									applyRangeOperator(value, index, that);
								}
                            }
	                        table.draw();
                        } );
						/*Input text on change*/
						$( 'input.simple_search', this.footer() ).on('change', function () {
							var value = $.fn.dataTable.util.escapeRegex(
								$(this).val()
							);
							if(value.length === 0) {
								that.search('').draw();
							}
							else {
								that
									.search( value , true, false )
									.draw();
							}
						} );
                    }
                } );

                /*Draw event listener*/
                table.on( 'draw', function (e) {
                    console.log("Draw");
                    //mpghelper.teamDisplay.actualizeExtraDaysButton();
                    mpghelper.cart.initSelectTools();
                    mpghelper.cart.refreshCartAndUnavailable();
                    mpghelper.teamDisplay.refreshTeamDisplayTools();
                    $("#customteamDisplay").removeClass("hidden");
                    $("#tools").removeClass("hidden");
                    mpghelper.cart.refreshAddAllToCartIcon();
                    mpghelper.cart.refreshAddAllToUnavIcon();
                    mpghelper.player.init();
	                mpghelper.teamDisplay.days.showExtraDays(mpghelper.teamDisplay.days.displayExtraDays===true?"show":"hide");
	                mpghelper.teamDisplay.days.showPerfs(mpghelper.teamDisplay.days.displayPerfs===true?"show":"hide");
                    mpghelper.teamDisplay.days.showPeriodStats(mpghelper.teamDisplay.days.displayPeriodStats===true?"show":"hide");
	                mpghelper.teamDisplay.extraStats.showExtraStats(mpghelper.teamDisplay.extraStats.displayExtraStats===true?"show":"hide");
	                mpghelper.teamDisplay.extraPerfs.showExtraPerfStats(mpghelper.teamDisplay.extraPerfs.displayExtraPerfStats===true?"show":"hide");
                } );
                table.on( 'page', function () {
                    if (window.dataLayer) {
	                    try {
		                    dataLayer.push({'event':'pagechange'});
	                    }
	                    catch(e) {
		                    console.warn("GTM disabled - skipping");
	                    }
                    }
                });
                /*Render*/
                /*mpghelper.cache.idleDetector(true);*/
                /*Multi select : todo : check CSS*/
                /*$("#"+id+" tbody").on( 'click', 'tr', function () {
                    $(this).toggleClass('selected');
                } );*/

                /*$('#myTable').DataTable().searchPane.rebuild();*/
                timer_process = new Date().getTime()-timer_process;
                console.info("Table processed in "+timer_process.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+" ms");
                return table;
            }
        },
		cart : {
			cartState : "hide",
			unvaState : "show",
			addAllToCartAction : "add",
			addAllToUnavAction : "add",
			cart : [],
			unav : [],
			resetToInit : function() {
				if(document.getElementById("toggleCart") && document.getElementById("toggleUnavailable")) {
					this.cartState = "hide";
					this.unvaState = "show";
					this.cart = [];
					this.unav = [];
					document.getElementById("toggleCart").dataset.action = "show";
					document.getElementById("toggleUnavailable").dataset.action = "hide";
					//document.getElementById("saveCart").classList.add("hidden");
					document.getElementById("toggleCartT").innerText = i18next.t("legend.showCart");
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.hideUnavailable");
					document.getElementById("selectionNbPlayers").innerText = 0;
					document.getElementById("SformSubmit").classList.add("disabled");
				}
			},
			addToCart : function(row,action) {
				var rowid = parseInt(table.row(row).index(),10);
				var id = parseInt(row.id,10);
				spanicon = row.getElementsByClassName("glyphicon-ok-circle").item(0) || row.getElementsByClassName("glyphicon-shopping-cart").item(0);
				if((action === "remove" && this.cart.indexOf(id)!==-1) || (typeof action === "undefined" && (row.classList.contains("cart") || this.cart.indexOf(id)!==-1))) {
					//table.row(rowid).deselect();
					this.cart.splice(this.cart.indexOf(id),1);
					spanicon.title = i18next.t("legend.removeFromCart");
					spanicon.classList.toggle("glyphicon-ok-circle");
					spanicon.classList.toggle("glyphicon-shopping-cart");
					row.classList.toggle("cart");
				}
				else if((action === "add" && this.cart.indexOf(id)==-1) || typeof action === "undefined"){
					//table.row(rowid).select();
					this.cart.push(id);
					spanicon.title = i18next.t("legend.addToCart");
					spanicon.classList.toggle("glyphicon-ok-circle");
					spanicon.classList.toggle("glyphicon-shopping-cart");
					row.classList.toggle("cart");
				}

				if(table.rows(".cart")[0].length>0) {
					document.getElementById("toggleCartT").innerText = i18next.t("legend.showCart");
					document.getElementById("selectionNbPlayers").innerText = table.rows(".cart")[0].length;
					document.getElementById("SformSubmit").classList.remove("disabled");
					//document.getElementById("saveCart").classList.remove("disabled");
				}
				else {
					document.getElementById("selectionNbPlayers").innerText = 0;
					document.getElementById("toggleCartT").innerText = i18next.t("legend.hideCart");
					document.getElementById("SformSubmit").classList.add("disabled");
					//document.getElementById("saveCart").classList.add("disabled");
				}
			},
			refreshAddAllToCartIcon: function() {
				var spanicon = $('thead .glyphicon-shopping-cart, .glyphicon-ok-circle')[0];
				if($("#teamTable tbody tr:not(.cart)").length>0) {
					spanicon.title = i18next.t("legend.addToCart");
					spanicon.classList.remove("glyphicon-ok-circle");
					spanicon.classList.add("glyphicon-shopping-cart");
					mpghelper.cart.addAllToCartAction = "add";
				}
				else {
					spanicon.title = i18next.t("legend.removeFromCart");
					spanicon.classList.add("glyphicon-ok-circle");
					spanicon.classList.remove("glyphicon-shopping-cart");
					mpghelper.cart.addAllToCartAction = "remove";
				}
			},
			addAllToCart : function() {
				var trs = undefined;
				try {
					trs = document.getElementById("teamTable").getElementsByTagName("tbody").item(0).getElementsByTagName("tr");
				}
				catch (e) {
					console.warn("No rows to add to cart");
				}
				if(trs.length>0) {
					for(var i=0;i<trs.length;i++) {
						this.addToCart(trs.item(i),mpghelper.cart.addAllToCartAction);
					}
				}
				mpghelper.cart.refreshAddAllToCartIcon();
				if (window.dataLayer) {
					try {
						dataLayer.push({'event':'toggleAddAllToCart'});
					}
					catch(e) {
						console.warn("GTM disabled - skipping");
					}
				}
			},
			addToUnavailable : function(row,action) {
				var rowid = parseInt(table.row(row).index(),10);
				var id = parseInt(row.id,10);
				spanicon = row.getElementsByClassName("glyphicon-eye-close").item(0) || row.getElementsByClassName("glyphicon-eye-open").item(0);
				if((action === "remove" && this.unav.indexOf(id)!==-1) || (typeof action === "undefined" && (row.classList.contains("unavailable") || this.unav.indexOf(id)!==-1))){
					this.unav.splice(this.unav.indexOf(id),1);
					spanicon.title = i18next.t("legend.removeFromUnavailable");
					spanicon.classList.toggle("glyphicon-eye-close");
					spanicon.classList.toggle("glyphicon-eye-open");
					row.classList.toggle("unavailable");
				}
				else if((action === "add" && this.unav.indexOf(id)==-1) || typeof action === "undefined"){
					this.unav.push(id);
					spanicon.title = i18next.t("legend.addToUnavailable");
					spanicon.classList.toggle("glyphicon-eye-close");
					spanicon.classList.toggle("glyphicon-eye-open");
					row.classList.toggle("unavailable");
				}

				if(table.rows(".unavailable")[0].length>0) {
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.hideUnavailable");
				}
				else {
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.showUnavailable");
				}
			},
			refreshAddAllToUnavIcon: function() {
				var spanicon = $('thead .glyphicon-eye-close, .glyphicon-eye-open')[0];
				if($("#teamTable tbody tr:not(.unavailable)").length>0) {
					spanicon.title = i18next.t("legend.addToUnav");
					spanicon.classList.remove("glyphicon-eye-open");
					spanicon.classList.add("glyphicon-eye-close");
					mpghelper.cart.addAllToUnavAction = "add";
				}
				else {
					spanicon.title = i18next.t("legend.removeFromUnav");
					spanicon.classList.add("glyphicon-eye-open");
					spanicon.classList.remove("glyphicon-eye-close");
					mpghelper.cart.addAllToUnavAction = "remove";
				}
			},
			addAllToUnavailable : function() {
				var trs = undefined;
				try {
					trs = document.getElementById("teamTable").getElementsByTagName("tbody").item(0).getElementsByTagName("tr");
				}
				catch (e) {
					console.warn("No rows to add to unav");
				}
				if(trs.length>0) {
					for(var i=0;i<trs.length;i++) {
						this.addToUnavailable(trs.item(i),mpghelper.cart.addAllToUnavAction);
					}
				}
				mpghelper.cart.refreshAddAllToUnavIcon();
				if (window.dataLayer) {
					try {
						dataLayer.push({'event':'toggleAddAllToUnav'});
					}
					catch(e) {
						console.warn("GTM disabled - skipping");
					}
				}
			},
			toggleCart : function(action) {
				/*Draw out*/
				if(table.rows(".cart")[0].length >0 && action === "show") {
					this.cartState = "show";
					table.clear();
					for(var i in response.data) {
						var player = response.data[i];
						if(this.cart.indexOf(parseInt(player.id,10))!==-1){
							table.row.add(player);
						}
					}
					table.draw();
					document.getElementById("toggleCartT").innerText = i18next.t("legend.hideCart");
					document.getElementById("toggleCart").dataset.action = "hide";
					//document.getElementById("saveCart").classList.toggle("hidden");
				}
				else if(action === "hide") {
					this.cartState = "hide";
					/*Redraw in*/
					table.clear();
					if(this.unvaState==="show") {
						table.rows.add(response.data);
					}
					else {
						for(var i in response.data) {
							var player = response.data[i];
							if(this.unav.indexOf(player.id)===-1) {
								table.row.add(player);
							}
						}
					}
					table.draw();
					document.getElementById("toggleCart").dataset.action = "show";
					//document.getElementById("saveCart").classList.toggle("hidden");
				}

			},
			toggleUnavailable : function(action) {
				if(table.rows(".unavailable")[0].length >0 || action === "hide") {
					this.unvaState = "hide";
					table.rows(".unavailable").remove().draw();
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.showUnavailable");
				}
				else if(this.unvaState = "hide" || action === "show") {
					this.unvaState = "show";
					for(var i in this.unav) {
						var upid = parseInt(this.unav[i],10);
						var add = true;
						for(var k in table.rows().data()) {
							if (    table.rows().data()[k].id === upid ||
								(
									this.cartState === "show" &&
									this.cart.indexOf(upid) === -1
								)
							)
							{
								add = false;
								if(table.rows().data()[k].id === upid) {
								}
								else {
								}
								break;
							}
						}
						if(add === true) {
							for(var k in response.data) {
								var player = response.data[k];
								if(upid === player.id) {
									table.row.add(player);
								}
							}
						}
					}
					table.draw();
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.hideUnavailable");
				}
				else if(action === "only") {
					table.clear();
					for(var i in response.data) {
						var player = response.data[i];
						if(this.unav.indexOf(parseInt(player.id,10))!==-1){
							table.row.add(player);
						}
					}
					table.draw();
					document.getElementById("toggleUnavailableT").innerText = i18next.t("legend.hideCart");
					document.getElementById("toggleUnavailable").dataset.action = "hide";
				}
			},
			refreshCartAndUnavailable : function() {
				var row;
				var icon;
				for(var i in this.unav) {
					if(row = document.getElementById(this.unav[i])) {
						row.classList.add("unavailable");
						if(icon = row.getElementsByClassName("glyphicon-eye-close").item(0)) {
							icon.classList.remove("glyphicon-eye-open");
							icon.classList.add("glyphicon-eye-close");
						}
					}
				}
				for(var i in this.cart) {
					if(row = document.getElementById(this.cart[i])) {
						row.classList.add("cart");
						if(icon = row.getElementsByClassName("glyphicon-shopping-cart").item(0)){
							icon.classList.remove("glyphicon-shopping-cart");
							icon.classList.add("glyphicon-ok-circle");
						}
					}
				}
			},
			initSelectTools : function() {
				$('thead .glyphicon-shopping-cart, .glyphicon-ok-circle').each(function(){
					$(this).off("click");
					$(this).on("click",function(){
						mpghelper.cart.addAllToCart();
					});
				});

				$('thead .glyphicon-eye-close, .glyphicon-eye-open').each(function(){
					$(this).off("click");
					$(this).on("click",function(){
						mpghelper.cart.addAllToUnavailable();
					});
				});
				$('tbody .glyphicon-shopping-cart, .glyphicon-ok-circle').each(function(){
					$(this).off("click");
					$(this).on("click",function(){
						var row = $(this).parents("tr")[0];
						mpghelper.cart.addToCart(row);
						mpghelper.cart.refreshAddAllToCartIcon();
					});
				});

				$('tbody .glyphicon-eye-close, .glyphicon-eye-open').each(function(){
					$(this).off("click");
					$(this).on("click",function(){
						var row = $(this).parents("tr")[0];
						mpghelper.cart.addToUnavailable(row);
						mpghelper.cart.refreshAddAllToUnavIcon();
					});
				});
			}
		},
        live : {
            displayLiveMatchAlert : function() {
                var div = document.getElementById("livematch");
                div.classList.add("hidden");
                div.classList.remove("alert-warning");
                div.classList.remove("alert-success");
                var span = div.getElementsByTagName("span").item(1);
                span.innerHTML = "";
                var matchs = response.team.getCurrentMatchs();
                if(matchs.now !== "") {
                    div.classList.add("alert-success");
                    div.classList.remove("hidden");
                    var strong = document.createElement("strong");
                    strong.innerText = i18next.t("statsWarning.livestrong");
                    span.appendChild(strong);
                    var text = document.createTextNode(i18next.t("statsWarning.live",{
                        league:response.team.majorLeague.name,
                        day:matchs.now.day
                    }));
                    span.appendChild(text);
                }
                else if(response.team.majorLeague.activeSeason.currentDay.day > response.team.majorLeague.activeSeason.currentDay.lastDay && response.team.majorLeague.activeSeason.currentDay.lastDay > 0) {
                    div.classList.add("alert-warning");
                    div.classList.remove("hidden");
                    var strong = document.createElement("strong");
                    strong.innerText = i18next.t("statsWarning.latestrong");
                    span.appendChild(strong);
                    var text = document.createTextNode(i18next.t("statsWarning.late",{
                        league:response.team.majorLeague.name,
                        day:response.team.majorLeague.activeSeason.currentDay.day
                    }));
                    span.appendChild(text);
                }
            }
        },
        teamDisplay : {
            DELAYED_OPEN : "[",
            DELAYED_CLOSE : "]",
            SERIE_STAT_OPEN : "(",
            SERIE_STAT_CLOSE : ")",
            OVERALL_STAT_OPEN : "{",
            OVERALL_STAT_CLOSE : "}",
            NB_NOTE_OPEN : "<sup>/",
            NB_NOTE_CLOSE : "</sup>",
            SERIE_OPEN : "<strong>",
            SERIE_CLOSE : "</strong>",
            SUBSTITUTE_OPEN : "(",
            SUBSTITUTE_CLOSE : ")",
            TRANSFERED_OPEN : "<em>",
            TRANSFERED_CLOSE : "</em>",
            GOAL_MARKER : "*",
            AOG_MARKER : "°",
			YELLOW_MARKER : "<sup>J</sup>",
			RED_MARKER : "<sup>R</sup>",
			INJURY_MARKER : "<sup>&#134;</sup>",
            div : document.createElement('div'),
            span : document.createElement('span'),
            anchor : document.createElement('a'),
            tooltipSpan : function() {
                var span = document.createElement('span');
                span.setAttribute("aria-hidden","true");
                span.setAttribute("data-toggle","tooltip");
                span.setAttribute("data-placement","top");
                span.setAttribute("data-container","body");
                span.setAttribute("data-html","true");
                return span;
            },
            tooltiping : function(message, childnode, noHTML) {
                if(noHTML!== true && !isDOMNode(childnode) && !isDOMElement(childnode)) childnode = createElementFromHTML(childnode);
                if(typeof message == "string" && (isDOMNode(childnode) || isDOMElement(childnode) ||noHTML===true)) {
                    var span = this.tooltipSpan();
                    span.setAttribute("title",message);
                    if(noHTML===true) {
                        childnode = document.createTextNode(childnode)
                    }
                    span.appendChild(childnode);
                    return span.outerHTML;
                }
                else {
                    return null;
                }
            },
            glyphiconing : function(message, icon) {
                if(typeof message == "string" && typeof icon == "string") {
                    var span = document.createElement("span");
                    span.className = "glyphicon "+icon;
                    var outerSpan = this.tooltiping(message,span);
                    return outerSpan;
                }
                else return null;
            },
            legend : function(columns) {
                var thisTr = document.createElement("tr");
                var thisTd = document.createElement("td");
                thisTd.colSpan = columns.length;
                var str = "<strong>"+i18next.t('legend.LG_LEGEND')+"</strong> : ";
                str +=  this.DELAYED_OPEN+"5"+this.DELAYED_CLOSE;
                str += " : "+i18next.t('legend.LG_DELAYED')+ " || ";
                str +=  this.SUBSTITUTE_OPEN+"X"+this.SUBSTITUTE_CLOSE;
                str += " : "+i18next.t('legend.LG_SUBSTITUTE')+ " || ";
                str +=  "X"+this.GOAL_MARKER;
                str += " : "+i18next.t('legend.LG_GOAL')+ " || ";
                str +=  "X"+this.AOG_MARKER;
                str += " : "+i18next.t('legend.LG_AOG')+ " || ";
                //str +=  this.SERIE_OPEN+"X X X"+this.SERIE_CLOSE;
                //str += " : "+i18next.t('legend.LG_SERIE')+ " || ";
                str +=  "L"+this.NB_NOTE_OPEN+"Z"+this.NB_NOTE_CLOSE+" "+this.SERIE_STAT_OPEN+"M"+this.NB_NOTE_OPEN+"Z"+this.NB_NOTE_CLOSE+this.SERIE_STAT_CLOSE+" "+this.OVERALL_STAT_OPEN+"N"+this.NB_NOTE_OPEN+"Z"+this.NB_NOTE_CLOSE+this.OVERALL_STAT_CLOSE;
                str += " : "+i18next.t('legend.LG_OVERALL_STAT')+ " || ";
                str += i18next.t("teamHeader.CLUB_LASTSAMEMATCH")+" : "+i18next.t("teamHeader.CLUB_LASTSAMEMATCH_TOOLTIP");
                thisTd.innerHTML = str;
                thisTr.appendChild(thisTd)
                return thisTr;
            },
            /*PLAYER SPECIAL*/
            playerName : function(player) {
                var iconS = this.starPlayer(player);
                var iconA = this.markAgressivePlayer(player);

                var anchor = document.createElement("a");
				anchor.classList.add("player-info");

                var name = player.name;
                if(player.firstName && player.firstName.length>0) {
                    name +=" "+player.firstName;
                }

				var text = document.createTextNode(name);
				anchor.appendChild(text);

                return {
                    display : iconS+iconA+anchor.outerHTML,
                    value : name
                };
            },
            starPlayer : function(player,value) {
                var icon="";
                if(!player.stats) return;
                if (player.stats.succ_nb_note >= 5 && player.stats.succ_avg_note >= 6) {
                    if(value===true) return 5;
                    icon = this.glyphiconing(i18next.t("starPlayers.HEART_PLAYER"), "glyphicon-heart");
                }
                else if (player.stats.succ_nb_note >= 5 && player.stats.succ_avg_note >= 5) {
                    if(value===true) return 3;
                    icon = this.glyphiconing(i18next.t("starPlayers.STAR_PLAYER"), "glyphicon-star");
                }
                else if (player.stats.succ_nb_note >= 3 && player.stats.succ_avg_note >= 5) {
                    if(value===true) return 1;
                    icon = this.glyphiconing(i18next.t("starPlayers.MARK_PLAYER"), "glyphicon-star-empty");
                }
                else if(value===true) return 0;
                return icon;
            },
            markAgressivePlayer : function(player,value) {
                var icon="";
                var val=0;
	            if(!player.stats) return;
                if(player.place === "D" && player.stats.overall_nb_note>0 && player.stats.M_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val+=1;
                    else icon += this.glyphiconing(i18next.t("starPlayers.DefGoMid"), "glyphicon-screenshot");
                }
                if(player.place === "D" && player.stats.overall_nb_note>0 && player.stats.A_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val+=2;
                    else icon += this.glyphiconing(i18next.t("starPlayers.DefGoFor"), "glyphicon-fire");
                }
                if(player.place === "M" && player.stats.overall_nb_note>0 && player.stats.A_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val+=2;
                    else icon += this.glyphiconing(i18next.t("starPlayers.MidGoFor"), "glyphicon-screenshot");
                }
                if(player.place === "M" && player.stats.overall_nb_note>0 && player.stats.D_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val-=1;
                    else icon += this.glyphiconing(i18next.t("starPlayers.MidGoDef"), "glyphicon-circle-arrow-down");
                }
                if(player.place === "A" && player.stats.overall_nb_note>0 && player.stats.M_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val-=1;
                    else icon += this.glyphiconing(i18next.t("starPlayers.ForGoMid"), "glyphicon-info-sign");
                }
                if(player.place === "A" && player.stats.overall_nb_note>0 && player.stats.D_pos/player.stats.overall_nb_note >0.25) {
                    if(value===true) val-=2;
                    else icon += this.glyphiconing(i18next.t("starPlayers.ForGoDef"), "glyphicon-thumbs-down");
                }
                if(value===true) return val;
                else return icon;
            },
            displayPlayerPlace : function(player) {
                return {
                    display : this.tooltiping(i18next.t("teamHeader."+player.superPlace+"full"),i18next.t("teamHeader."+player.place),true),
	                short : player.superPlace,
                    value :  player.placeval
                }
            },
            playerRate : function(player) {
				var display;
				if(!player.auctionStats || !player.auctionStats.nbPrice) {
					if(player.rate)	display = player.rate.toString(); else display = "";
				}
				else {
					var anchor = document.createElement("a");
					anchor.classList.add("player-auctions-info");

					var a = player.auctionStats;
					var tooltipStr = i18next.t("teamHeader.CLUB_RATE")+" : "+player.rate;
					tooltipStr += "<br />"+i18next.t("teamHeader.auctions")+" : ";
					tooltipStr +="<br />Min:"+Math.max(a.minPrice,player.rate);
					tooltipStr +="<br />Moy:"+Math.max(a.avgPrice,player.rate);
					tooltipStr +="<br />Max:"+Math.max(a.maxPrice,player.rate);
					var qlt = Math.floor(a.nbPrice/10)*10;
					if(qlt <= 10) {
						tooltipStr +="<br />Fiabilité:"+"<10";
                    }
                    else {
						tooltipStr +="<br />Fiabilité:"+">"+qlt;
                    }
                    tooltipStr +="<br />Clic pour plus de détails !";
					anchor.innerHTML = this.tooltiping(tooltipStr,player.rate);
					display = anchor.outerHTML;
				}
				return {
					display : display,
					value :  player.rate
				}
            },
            /*PLAYER MATCH NOTES*/
            noteDetails : function(player, perf, initStr = "", dateformat) {
				var tooltipText = "";
				if(!initStr) initStr = perf.note;
				var event = perf.event;
				/*Opponents*/
				if(perf.opponent instanceof MPGClub) {
					tooltipText += perf.opponent.name+"<br />";
					tooltipText += "("+i18next.t("starPlayers."+perf.place)+")";
				}
				/*Matchs status*/
				if(perf.delayed === true) {
					tooltipText += "<br />"+"("+i18next.t("starPlayers.Del")+")";
				}
				/*Player status*/
				if(perf.substitute===1) {
					tooltipText += "<br />"+"("+i18next.t("starPlayers.Sub")+")";
				}
				/*Match date*/
				if(event.date!=="" && dateformat) {
					tooltipText +="<br />"+dateformat.format(event.date);
				}
				/*Match results*/
				var t1s = event.t1score||0, t2s = event.t2score||0;
				if(perf.delayed !== true && player.club === event.t2) {
					if(event.t1score > event.t2score) {
						/*Lost*/
						tooltipText +="<br />"+i18next.t("starPlayers.Lost")+" : ";
					}
					else if(event.t1score < event.t2score) {
						/*Won*/
						tooltipText +="<br />"+i18next.t("starPlayers.Won")+" : ";
					}
					else if(event.t1score === event.t2score) {
						/*Draw*/
						tooltipText +="<br />"+i18next.t("starPlayers.Draw")+" : ";
					}
					tooltipText += t1s.toString()+"-<strong>"+t2s.toString()+"</strong>";
				}
				else if(perf.delayed !== true && player.club === event.t1) {
					if(event.t1score > event.t2score) {
						/*Win*/
						tooltipText +="<br />"+i18next.t("starPlayers.Won")+" : ";
					}
					else if(event.t1score < event.t2score) {
						/*Lost*/
						tooltipText +="<br />"+i18next.t("starPlayers.Lost")+" : ";
					}
					else if(event.t1score === event.t2score) {
						/*Draw*/
						tooltipText +="<br />"+i18next.t("starPlayers.Draw")+" : ";
					}
					tooltipText +="<strong>"+t1s.toString()+"</strong>-"+t2s.toString();
				}
				/*Forfeits*/
				if(fs = player.forfeits.get(perf.event.id)) {
					for (var f of fs) {
                        tooltipText += "<br />"+i18next.t("starPlayers.forfeits."+f.type);
					}
				}

				var textElement = document.createElement("div");
				textElement.innerHTML = initStr;
				if(tooltipText.length>0)  {
					var tooltip = this.tooltiping(tooltipText,textElement.firstChild);
					return tooltip;
				}
				else return textElement.outerHTML;
            },
            playerNote : function(team,p,j,dateformat,numeric) {
                if(team.players.get(p) && team.players.get(p).perfs && team.players.get(p).perfs.get(j)){
                    var player = team.players.get(p);
                    var perf = player.perfs.get(j);
                    var event = perf.event;
                    if(event) {
						if(numeric===true) return perf.note;
						var textStr = this.displaySuccPlayerNote(team,player,perf).toString();
						return this.noteDetails(player, perf, textStr, dateformat);
					}
                }
                if(numeric===true) return 0;
                else return null;
            },
            displaySuccPlayerNote : function(team,player,perf) {
                if(team.currentDay.day > 0 && perf.event && (team.currentDay.day - perf.event.day) <= player.stats.succ_nb_note) {
                    return this.SERIE_OPEN+this.noteOnDelayedMatch(team,player,perf)+this.SERIE_CLOSE;
                }
                else {
                    return this.noteOnDelayedMatch(team,player,perf);
                }
                return null;
            },
            noteOnDelayedMatch : function(team,player,perf) {
                if(perf.delayed === true) {
                    return this.DELAYED_OPEN+"5"+this.DELAYED_CLOSE;
                }
                else {
                    return this.displaySubstituteAndPlayerNote(team,player,perf);
                }
            },
            displaySubstituteAndPlayerNote : function(team,player,perf) {
                if(perf.substitute === 1) {
                    return this.SUBSTITUTE_OPEN+perf.note.toString()+this.displayMatchGoals(team,player,perf)+this.SUBSTITUTE_CLOSE;
                }
                else {
                    return perf.note.toString()+this.displayMatchGoals(team,player,perf)+this.displayMatchForfeits(player, perf);
                }
                return null;
            },
            displayMatchGoals : function(team,player,perf) {
                var str="";
                if(perf.goal>0) {
                    for(var i=0; i<perf.goal;i++) {
                        str+=this.GOAL_MARKER;
                    }
                }
                if(perf.aog>0) {
                    for(var i=0; i<perf.aog;i++) {
                        str+=this.AOG_MARKER;
                    }
                }
                return str;
            },
			displayMatchForfeits : function(player,perf) {
				var str="";
				var fs;
				if(fs = player.forfeits.get(perf.event.id)) {
					for(var f of fs) {
						switch (f.type) {
							case "I" :
								str += this.INJURY_MARKER;
								break;
							case "Y" :
								str += this.YELLOW_MARKER;
								break;
							case "O" :
								str += this.RED_MARKER;
								break;
							case "R" :
								str += this.RED_MARKER;
								break;
						}
					}
				}
				return str;
			},
            /*NEXT MATCH*/
            displayNextOpponent : function(player,dateformat) {
                if(player.club.nextMatch instanceof MPGEvent) {
                    var opponent = "";
                    var place = "";
                    if(player.club === player.club.nextMatch.t1) {
                        opponent = player.club.nextMatch.t2;
                        place = i18next.t("starPlayers.Dom");
                    }
                    else if(player.club === player.club.nextMatch.t2) {
                        opponent = player.club.nextMatch.t1;
                        place = i18next.t("starPlayers.Ext");
                    }
                   /*Creating anchor*/
                    var anchor = document.createElement("a");
                    anchor.classList.add("club");
                    anchor.href = opponent.getURL();
                    /*Creating text*/
                    var text = document.createTextNode(opponent.name);
                    /*Mixing and returning*/
                    anchor.appendChild(text);
                    return mpghelper.teamDisplay.tooltiping(dateformat.format(player.club.nextMatch.date)+" ("+place+")", anchor);
                }
                else return null;
            },
            displayDMI : function(team,p,dateformat) {
                try {
					var str = "", avg = 0, l =0;
					var dmis = team.players.get(p).DMI;
					var c = team.players.get(p).club;
					for(var DMI of dmis) {
						if(DMI instanceof MPGPerf) {
							if(
								(DMI.event.t1.id === c.nextMatch.t1.id && DMI.event.t2.id === c.nextMatch.t2.id ) ||
								(DMI.event.t1.id === c.nextMatch.t2.id && DMI.event.t2.id === c.nextMatch.t1.id )) {
								if(str.length>0) str +="/";
								l++;
								avg+= DMI.note;
								str+= this.noteDetails(team.players.get(p), DMI,"",dateformat);
							}
						}
					}
					if(l>0) {avg = parseFloat(avg/l).toFixed(2);}
					return {display: str, value:avg};
                }
                catch(e) {
                    console.error("DMI"+e.message);
					return {display : "", value : 0}
                }

            },
            winChancesColor : function(winChance) {
                if(parseFloat(winChance)<=0.4) return "danger";
                else if(parseFloat(winChance)<=0.6) return "warning";
                else if(parseFloat(winChance)<=0.7) return "info";
                else return "success";
            },
            displayWinChances : function(player) {
                if( player.club.nextMatch instanceof MPGEvent
                    && player.club.nextMatchsWC.get(player.club.nextMatch.id) >=0
                    && player.club.nextMatch.t1.score.points >=0
                    && player.club.nextMatch.t2.score.points >=0)
                {
                    var tooltipStr = "";
                    var nmWC = player.club.nextMatchsWC.get(player.club.nextMatch.id);
	                var odds = player.club.nextMatch.odds;
                    if(!nmWC && odds) {
	                    if(player.club === t1) {
		                    nmWC = 1/odds.homeBet;
	                    }
	                    else if(player.club === t2) {
		                    nmWC = 1/odds.awayBet;
	                    }
                    }
                    var t1 = player.club.nextMatch.t1;
                    var t2 = player.club.nextMatch.t2;
                    if(player.club === t1) {
                        tooltipStr += t2.name;
                    }
                    else if(player.club === t2) {
                        tooltipStr += t1.name;
                    }
                    tooltipStr += " @"+t1.name;
                    tooltipStr += "<br />"+t1.abv+" : "+t1.score.points+i18next.t("starPlayers.points")+" / "+i18next.t("starPlayers.ELO")+t1.elo;
                    tooltipStr += "<br />"+t2.abv+" : "+t2.score.points+i18next.t("starPlayers.points")+" / "+i18next.t("starPlayers.ELO")+t2.elo;
                    var textNode = document.createElement("span");
                    var textClass = "text-"+this.winChancesColor(nmWC);
                    textNode.className += " "+textClass;
                    var text = (nmWC*100).toFixed(2)+"%";
                    //Adding odds
                    if(odds) {
                        var score = "";

                        var tempProb = 0;
                        if(odds.scoreChances){
                            for(var s in odds.scoreChances){
                                var sc = odds.scoreChances[s];
                                if(sc>tempProb) {
                                    score = s;
                                    tempProb = sc;
                                }
                            }
	                        tooltipStr += "<br />Score probable à "+(tempProb*100).toFixed(2)+"% : "+t1.abv+":"+score+":"+t2.abv;
	                        text += " - "+score;
                        }
	                    if(odds.goalDiffChances){
		                    var gd = "";
		                    var prob = 0;
		                    for(var s in odds.goalDiffChances){
			                    var sc = odds.goalDiffChances[s];
			                    if(sc>prob) {
				                    gd = s;
				                    prob = sc;
			                    }
		                    }
		                    tooltipStr += "<br />Différence de but probable à "+(prob*100).toFixed(2)+"% : "+gd;
	                    }
	                    if(odds.homeChances && odds.drawChances && odds.awayChances){
		                    tooltipStr += "<br />Résultat probable : ("+t1.abv+"/"+i18next.t("teamHeader.oddsDraw")+"/"+t2.abv+") : "+(odds.homeChances*100).toFixed(2)+"%"+"/"+(odds.drawChances*100).toFixed(2)+"%"+"/"+(odds.awayChances*100).toFixed(2)+"%";
	                    }
	                    tooltipStr += "<br />"+i18next.t("teamHeader.odds")+" : "+"("+t1.abv+"/"+i18next.t("teamHeader.oddsDraw")+"/"+t2.abv+") : "+odds.homeBet+"/"+odds.drawBet+"/"+odds.awayBet;
                    }
                    textNode.appendChild(document.createTextNode(text));
                    return {
                        display : this.tooltiping(tooltipStr, textNode),
                        value : nmWC * 100
                    };
                }
                else return null;
            },
            /*PLAYER CLUB*/
            displayClub : function(player) {
                if(player.club instanceof MPGClub) {
                    /*Creating anchor*/
                    var anchor = document.createElement('a');
                    anchor.classList.add("club");
                    anchor.href = player.club.getURL();
                    /*Creating text*/
                    var text = document.createTextNode(player.club.name);
                    /*Mixing and returning*/
                    anchor.appendChild(text);
                    return anchor.outerHTML;
                }
                else return null;
            },
            /*PLAYER SUMMARY PERFS*/
            displaySeasonAvgNote : function(player) {
                var str;
	            if(!player.stats) return {display : "", value : 0};
                str = player.stats.avg_note.toFixed(2);
                if(player.stats.nb_note>1) {
                    str+= this.NB_NOTE_OPEN+player.stats.nb_note+this.NB_NOTE_CLOSE;
                }
                if(player.stats.succ_avg_note>0 && player.stats.succ_avg_note !== player.stats.avg_note) {
                    str += this.SERIE_STAT_OPEN+player.stats.succ_avg_note.toFixed(2);
                    if(player.stats.succ_nb_note>1) {
                        str+= this.NB_NOTE_OPEN+player.stats.succ_nb_note+this.NB_NOTE_CLOSE;
                    }
                    str +=this.SERIE_STAT_CLOSE;
                }
                if(player.stats.overall_avg_note>0 && player.stats.overall_avg_note !== player.stats.avg_note) {
                    str += this.OVERALL_STAT_OPEN+player.stats.overall_avg_note.toFixed(2);
                    if(player.stats.overall_nb_note>1) {
                        str+= this.NB_NOTE_OPEN+player.stats.overall_nb_note+this.NB_NOTE_CLOSE;
                    }
                    str += this.OVERALL_STAT_CLOSE;
                }
                return {
                    display : str,
                    value :  player.stats.avg_note
                }
            },
            displaySeasonDvnNote : function(player) {
                var str;
	            if(!player.stats) return {display : "", value : 0};
                str = player.stats.dvn_note.toFixed(2);
                if(player.stats.succ_dvn_note>0 && player.stats.succ_dvn_note !== player.stats.dvn_note) {
                    str += this.SERIE_STAT_OPEN+player.stats.succ_dvn_note.toFixed(2)+this.SERIE_STAT_CLOSE;
                }
                if(player.stats.overall_dvn_note>0 && player.stats.overall_dvn_note !== player.stats.dvn_note) {
                    str += this.OVERALL_STAT_OPEN+player.stats.overall_dvn_note.toFixed(2)+this.OVERALL_STAT_CLOSE;
                }
                return {
                    display : str,
                    value :  player.stats.dvn_note
                }
            },
	        displayMinsPlayed : function(player) {
		        var str;
		        if(!player.stats) return {display : "", value : 0};
		        var stats = player.stats;
		        str = stats.mins_played;
		        if(stats.succ_mins_played>0 && stats.succ_mins_played !== stats.mins_played) {
			        str += this.SERIE_STAT_OPEN+stats.succ_mins_played+this.SERIE_STAT_CLOSE;
		        }
		        if(stats.overall_mins_played>0 && stats.overall_mins_played !== stats.mins_played) {
			        str += this.OVERALL_STAT_OPEN+stats.overall_mins_played+this.OVERALL_STAT_CLOSE;
		        }
		        return {
			        display : str,
			        value :  stats.mins_played
		        }
	        },
	        displayAvgMinsPlayed : function(player) {
		        var str;
		        if(!player.stats) return {display : "", value : 0};
		        var stats = player.stats;
		        str = stats.avg_mins_played;
		        if(stats.succ_avg_mins_played>0 && stats.succ_avg_mins_played !== stats.avg_mins_played) {
			        str += this.SERIE_STAT_OPEN+stats.succ_avg_mins_played+this.SERIE_STAT_CLOSE;
		        }
		        if(stats.overall_avg_mins_played>0 && stats.overall_avg_mins_played !== stats.avg_mins_played) {
			        str += this.OVERALL_STAT_OPEN+stats.overall_avg_mins_played+this.OVERALL_STAT_CLOSE;
		        }
		        return {
			        display : str,
			        value :  stats.avg_mins_played
		        }
	        },
	        displayMinScorerNote : function(player) {
		        var str = "";
		        if(!player.stats) return {display : "", value : 0};
		        if(player.stats.seasonMinScorerNote === null && player.stats.overallMinScorerNote === null) {
			        return {
				        display : "",
				        value :  null
			        }
                }
		        if(player.stats.overallMinScorerNote>0) {
		            str += this.OVERALL_STAT_OPEN+player.stats.overallMinScorerNote.toFixed(1)+this.OVERALL_STAT_CLOSE;
		        }
		        if(player.stats.seasonMinScorerNote>0 && player.stats.seasonMinScorerNote !== player.stats.overallMinScorerNote) {
			        str = player.stats.seasonMinScorerNote.toFixed(1) + str;
		        }
		        return {
			        display : str,
			        value :  player.stats.overallMinScorerNote
		        }
	        },
	        displayPetrodollar : function(player) {
		        var str = "";
		        var value = 0;
		        if(!player.stats) return {display : "", value : 0};
		        if(player.rate < 1 || (player.stats.goals<1 && player.stats.overall_goals<1)) {
			        return {
				        display : "",
				        value :  1000
			        }
		        }
		        if(player.stats.goals>0) {
		            value = parseFloat((player.rate/player.stats.goals).toFixed(2));
			        str += value;
		        }
		        else {
			        value = 1000;
                }
		        if(player.stats.overallGoals>0 && player.stats.goals !== player.stats.overall_goals) {
			        str += this.OVERALL_STAT_OPEN+(player.rate/player.stats.overall_goals).toFixed(2)+this.OVERALL_STAT_CLOSE;
		        }
		        return {
			        display : str,
			        value :  value
		        }
	        },
            displaySeasonGoals : function(player) {
                var str;
	            if(!player.stats) return {display : "", value : 0};
                str = player.stats.goals;
                if(player.stats.overall_goals>0 && player.stats.overall_goals !== player.stats.goals) {
                    str += this.OVERALL_STAT_OPEN+player.stats.overall_goals+this.OVERALL_STAT_CLOSE;
                }
                return {
                    display : str,
                    value :  player.stats.goals
                }
            },
	        days : {
		        displayExtraDays : false,
		        displayPeriodStats : false,
		        displayPerfs : true,
		        getPerfsStatus : function() {
			        var cells = document.getElementsByClassName("defaultDays");
			        if(cells && cells.length > 0 && cells[0].classList && cells[0].classList.contains("hidden")) {
				        return "hidden";
			        }
			        else return "shown";
		        },
		        showPerfs : function(action) {
			        var cells = document.getElementsByClassName("defaultDays");
			        if(action === "show" || (action !== "show" && action !== "hide" && cells && cells.length > 0 && cells[0].classList.contains("hidden"))) {
				        this.displayPerfs = true;
				        document.getElementById("showPerfsButtonT").innerText = "Masquer les journées";
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.remove("hidden");
				        }
				        return "show";
			        }
			        else if(action === "hide" || (action !== "hide" && action !== "show" && !(cells[0].classList.contains("hidden")))) {
				        this.displayPerfs = false;
				        document.getElementById("showPerfsButtonT").innerText = "Montrer les journées";
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.add("hidden");
				        }
				        this.showExtraDays("hide");
				        return "hide";
			        }
		        },
		        getExtraDayStatus : function() {
			        var cells = document.getElementsByClassName("extraDay");
			        if(cells && cells.length > 0 && cells[0].classList && cells[0].classList.contains("hidden")) {
				        return "hidden";
			        }
			        else return "shown";
		        },
		        showExtraDays : function(action) {
			        var cells = document.getElementsByClassName("extraDay");
			        if(action === "show" || (action !== "show" && action !== "hide" && cells && cells.length > 0 && cells[0].classList.contains("hidden"))) {
				        document.getElementById("moreDaysButtonT").innerText = i18next.t("legend.LG_LESS_DAYS");
				        this.displayExtraDays = true;
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.remove("hidden");
				        }
				        this.showPerfs("show");
				        return "show";
			        }
			        else if(action === "hide" || (action !== "hide" && action !== "show" && !(cells[0].classList.contains("hidden")))) {
				        document.getElementById("moreDaysButtonT").innerText = i18next.t("legend.LG_MORE_DAYS");
				        this.displayExtraDays = false;
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.add("hidden");
				        }
				        return "hide";
			        }
		        },
		        getPeriodStatsStatus : function() {
			        var cells = document.getElementsByClassName("periodsdata");
			        if(cells && cells.length > 0 && cells[0].classList && cells[0].classList.contains("hidden")) {
				        return "hidden";
			        }
			        else return "shown";
		        },
		        showPeriodStats : function(action) {
			        var cells = document.getElementsByClassName("periodsdata");
			        if(action === "show" || (action !== "show" && action !== "hide" && cells && cells.length > 0 && cells[0].classList.contains("hidden"))) {
				        //document.getElementById("periodstats").innerText = i18next.t("legend.LG_LESS_DAYS");
				        this.displayPeriodStats = true;
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.remove("hidden");
				        }
				        return "show";
			        }
			        else if(action === "hide" || (action !== "hide" && action !== "show" && !(cells[0].classList.contains("hidden")))) {
				        this.displayPeriodStats = false;
				        //document.getElementById("periodstats").innerText = i18next.t("legend.LG_MORE_DAYS");
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.add("hidden");
				        }
				        return "hide";
			        }
		        }
	        },
	        extraStats : {
		        displayExtraStats : false,
		        getExtraStatsStatus : function() {
			        var cells = document.getElementsByClassName("extrastats");
			        if(cells && cells.length > 0 && cells[0].classList && cells[0].classList.contains("hidden")) {
				        return "hidden";
			        }
			        else return "shown";
		        },
		        showExtraStats : function(action) {
			        var cells = document.getElementsByClassName("extrastats");
			        if(action === "show" || (action !== "show" && action !== "hide" && cells && cells.length > 0 && cells[0].classList.contains("hidden"))) {
				        this.displayExtraStats = true;
				        document.getElementById("moreStatsButtonT").innerText = i18next.t("legend.LG_LESS_STATS");
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.remove("hidden");
				        }
				        return "show";
			        }
			        else if(action === "hide" || (action !== "hide" && action !== "show" && !(cells[0].classList.contains("hidden")))) {
				        this.displayExtraStats = false;
				        document.getElementById("moreStatsButtonT").innerText = i18next.t("legend.LG_MORE_STATS");
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.add("hidden");
				        }
				        return "hide";
			        }
		        }
	        },
	        extraPerfs : {
		        displayExtraPerfStats : false,
		        getExtraPerfStatsStatus : function() {
			        var cells = document.getElementsByClassName("extraperfstats");
			        if(cells && cells.length > 0 && cells[0].classList && cells[0].classList.contains("hidden")) {
				        return "hidden";
			        }
			        else return "shown";
		        },
		        showExtraPerfStats : function(action) {
			        var cells = document.getElementsByClassName("extraperfstats");
			        if(action === "show" || (action !== "show" && action !== "hide" && cells && cells.length > 0 && cells[0].classList.contains("hidden"))) {
				        this.displayExtraPerfStats = true;
				        document.getElementById("morePerfStatsButtonT").innerText = "Masquer stats de jeu";
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.remove("hidden");
				        }
				        return "show";
			        }
			        else if(action === "hide" || (action !== "hide" && action !== "show" && !(cells[0].classList.contains("hidden")))) {
				        this.displayExtraPerfStats = false;
				        document.getElementById("morePerfStatsButtonT").innerText = "Montrer stats de jeu";
				        for(var k in cells) {
					        if(cells[k].classList) cells[k].classList.add("hidden");
				        }
				        return "hide";
			        }
		        }
	        },
            refreshTeamDisplayTools : function () {
                $('[data-toggle="tooltip"]').tooltip();
                mpghelper.router.initAnchorsRouting();
            }
        },
        filterTeam : {
            FILTERS : [],
            resetFilters : function(draw) {
                mpghelper.filterTeam.resetFooterInput();
                response.filters = [];
                this.FILTERS = [];
                while($.fn.dataTable.ext.search.length>0) {
                    $.fn.dataTable.ext.search.pop();
                }
                table.search('')
                    .columns().search('');
                if(draw===true) {
                    table.draw();
                }


            },
            resetFooterInput : function() {
                for(var i in table.columns()[0]) {
                    if(isNaN(i)) continue;
                    if (typeof table.column(i).footer === "function") {
                        if(table.column(i).footer().getElementsByTagName("input").length) {
                            table.column(i).footer().getElementsByTagName("input").item(0).value = "";
                        }
                    }
                }
            },
            setFooterInput : function(col,value) {
                if(table.column(parseInt(col,10))) {
                    if (typeof table.column(parseInt(col,10)).footer === "function") {
                        if(table.column(parseInt(col,10)).footer().getElementsByTagName("input").length) {
                            table.column(parseInt(col,10)).footer().getElementsByTagName("input").item(0).value = value;
                        }
                    }
                }
            },
            filterPlayers : function(ids) {
                if(ids.length>0) {
                    var searchPlayersIds = function( settings, data, dataIndex ) {
                        if(ids.indexOf(parseInt(data[0],10))!==-1) {
                            return true;
                        }
                        else return false;
                    };
                    $.fn.dataTable.ext.search.splice($.fn.dataTable.ext.search.indexOf(searchPlayersIds, 1));
                    $.fn.dataTable.ext.search.push(searchPlayersIds);
                    table.draw();
                }
            },
            filterTable : function(targetObj,reset) {
				targetObj = targetObj || mpghelper.router.hashPath(window.location.pathname);
                function gc(param) {
                    return mpghelper.teamAjaxProcess.getColId(param);
                }
                if (typeof reset=== "undefined" || reset === true) {
                    this.resetFilters();
                }
                switch(targetObj.type) {
                    case "club" :
                        table.column(gc("cleanrealclub")).search(targetObj.club);
                        table.order([gc("place"),'asc'],[gc("sgoal"),'desc'],[gc("snote"),'desc']);
                        table.page.len(50);
                        break;
                    case "selection" :
                        if(targetObj.selection && targetObj.selection.players.length>0) {
                            var players = targetObj.selection.players;
                            var playersAr = [];
                            for(var p of players) {
                                playersAr.push(p.id);
                            }
                            mpghelper.filterTeam.filterPlayers(playersAr);
                            table.order([gc("place"),'asc'],[gc("sgoal"),'desc'],[gc("snote"),'desc']);
                            table.page.len(25);
                        }
                        break;
                    case "top" :
                        var min_pres = parseInt(response.team.currentDay.day/3*2);
                        var min_note = 4.5;
                        switch (targetObj.topmode) {
                            case "remarkable" :
                                table.column(gc("remarkable")).search(true);
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                                break;
                            case "season" :
                                response.filters[gc("snbnote")] = {min:min_pres,dataCol:gc("snbnote")};
                                response.filters[gc("snote")] = {min:min_note,dataCol:gc("snote")};
                                this.setFooterInput(gc("snote"),min_note+"+^"+min_pres+"+");
                                if(targetObj.place === "B") {
                                    response.filters[gc("sgoal")] = {min:3,dataCol:gc("sgoal")};
                                }
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                                break;
                            case "moment" :
                                try {
	                                var pres = Math.min(5, mpghelper.DT.team.currentDay.day);
                                }
                                catch(e) {
                                    var pres = 5;
                                }
                                response.filters[gc("sucnbnote")] = {min:pres,dataCol:gc("sucnbnote")};
                                response.filters[gc("sucnote")] = {min:min_note,dataCol:gc("sucnote")};
                                this.setFooterInput(gc("snote"),"("+min_note+"+^"+pres+"+)");
                                if(targetObj.place === "B") {
                                    response.filters[gc("sgoal")] = {min:3,dataCol:gc("sgoal")};
                                }
                                table.order([gc("sgoal"),'desc'],[gc("sucnote"),'desc']);
                                break;
                            case "lastyear" :
                                response.filters[gc("onbnote")] = {min:2,dataCol:gc("onbnote")};
                                response.filters[gc("onote")] = {min:min_note,dataCol:gc("onote")};
                                this.setFooterInput(gc("snote"),"{"+min_note+"+^2+}");
                                if(targetObj.place === "B") {
                                    response.filters[gc("ogoal")] = {min:3,dataCol:gc("ogoal")};
                                }
                                table.order([gc("ogoal"),'desc'],[gc("onote"),'desc']);
                                break;
                            case "scorers" :
                                response.filters[gc("sgoal")] = {min:3,dataCol:gc("sgoal")};
                                this.setFooterInput(gc("sgoal"),3+"+");
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                                break;
                            case "risingstars" :
                                response.filters[gc("rate")] = {max:10,dataCol:gc("rate")};
                                this.setFooterInput(gc("rate"),"0-10");
                                response.filters[gc("snbnote")] = {min:min_pres,dataCol:gc("snbnote")};
                                response.filters[gc("snote")] = {min:min_note-1,dataCol:gc("snote")};
                                this.setFooterInput(gc("snote"),">"+parseInt(min_note-1,10)+"^"+min_pres+"+");
                                if(targetObj.place === "B") {
                                    response.filters[gc("sgoal")] = {min:1,dataCol:gc("sgoal")};
                                }
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                                break;
                            case "momentrisingstars" :
	                            try {
		                            var pres = Math.min(5, mpghelper.DT.team.currentDay.day);
	                            }
	                            catch(e) {
		                            var pres = 5;
	                            }
                                response.filters[gc("rate")] = {max:10,dataCol:gc("rate")};
                                this.setFooterInput(gc("rate"),"0-10");
                                response.filters[gc("sucnbnote")] = {min:pres,dataCol:gc("sucnbnote")};
                                response.filters[gc("sucnote")] = {min:min_note-1,dataCol:gc("sucnote")};
                                this.setFooterInput(gc("snote"),"("+parseInt(min_note-1,10)+"+^>"+pres+")");
                                if(targetObj.place === "B") {
                                    response.filters[gc("sgoal")] = {min:1,dataCol:gc("sgoal")};
                                }
                                table.order([gc("sgoal"),'desc'],[gc("sucnote"),'desc']);
                                break;
                            case "lastyearrisingstars" :
                                response.filters[gc("rate")] = {max:10,dataCol:gc("rate")};
                                this.setFooterInput(gc("rate"),"0-10");
                                response.filters[gc("onbnote")] = {min:2,dataCol:gc("onbnote")};
                                response.filters[gc("onote")] = {min:min_note-1,dataCol:gc("onote")};
                                this.setFooterInput(gc("snote"),"{"+parseInt(min_note-1,10)+"+^2+}");
                                if(targetObj.place === "B") {
                                    response.filters[gc("ogoal")] = {min:1,dataCol:gc("ogoal")};
                                }
                                table.order([gc("ogoal"),'desc'],[gc("onote"),'desc']);
                                break;
                            case "risingscorers" :
                                response.filters[gc("rate")] = {max:10,dataCol:gc("rate")};
                                this.setFooterInput(gc("rate"),"0-10");
                                response.filters[gc("sgoal")] = {min:1,dataCol:gc("sgoal")};
                                this.setFooterInput(gc("sgoal"),1+"+");
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                                break;
                            default:
                                table.order([gc("sgoal"),'desc'],[gc("snote"),'desc']);
                        }
                        break;
                    default : break;
                }
                response.applyRangeFilters(response.filters);
                table.draw();
                mpghelper.router.waitMessage("clear");
            }
        },
        minDays : {
            change : function(nb) {
                try  {
					nb = parseInt(nb, 10);
					//Loop arount columns to hide those above nb-1 then
					table.draw();
                }
                catch (e) {
                    console.error("minDays", e);
                }
            }
        },
        router : {
            QUERY_TIMEOUT : 15000,
            QUERY_RETRIES : 0,
            QUERY_MAX_RETRIES : 3,
            ANCHOR_FROM : "",
            WAIT_DIALOG : undefined,
            waitMessage : function(hide) {
                if(typeof this.WAIT_DIALOG === "undefined") {
                    this.WAIT_DIALOG = {"box":undefined, "timer":undefined};
                }
                if(typeof this.WAIT_DIALOG.box !== "undefined" && (hide === true || hide === "clear")) {
                    this.WAIT_DIALOG.box.modal('hide');
                    this.WAIT_DIALOG.box = undefined;
                    clearTimeout(this.WAIT_DIALOG.timer);
                    this.WAIT_DIALOG.timer = undefined;
                    return this.WAIT_DIALOG;
                }
                else if(typeof this.WAIT_DIALOG.box !== "undefined" && hide === "timeout") {
                    clearTimeout(this.WAIT_DIALOG.timer);
                    document.getElementById("waitDialogMessage").innerHTML = i18next.t("statusMessage.error");
                }
                else if(typeof this.WAIT_DIALOG.box === "undefined") {
                    function showDialog() {
                        mpghelper.router.WAIT_DIALOG.box = bootbox.dialog({
                            title: i18next.t("statusMessage.pleaseWait"),
                            message: '<p id="waitDialogMessage" class="text-center" data-i18n="[append]statusMessage.loading"><i class="fa fa-spin fa-spinner"></i> </p>',
                            closeButton: true,
                            onEscape: function() { mpghelper.router.WAIT_DIALOG.box=undefined;},
                            backdrop: true
                        });
                        mpghelper.router.WAIT_DIALOG.box.init(function(){
                            mpghelper.router.WAIT_DIALOG.timer = setTimeout(function(){
                                if(typeof mpghelper.router.WAIT_DIALOG.box !== "undefined") {
                                    mpghelper.router.WAIT_DIALOG.box.find('.bootbox-body').html(i18next.t("statusMessage.error"));
                                    if (window.dataLayer) {
	                                    try {
		                                    dataLayer.push({'event':'waitLoadingError'});
	                                    }
	                                    catch(e) {
		                                    console.warn("GTM disabled - skipping");
	                                    }
                                    }
                                }
                            }, mpghelper.router.QUERY_TIMEOUT*2);
                        });
                        $(mpghelper.router.WAIT_DIALOG.box).localize();
                        return mpghelper.router.WAIT_DIALOG;
                    }
                    showDialog();
                }
                return this.WAIT_DIALOG;
            },
            refreshOldVLink : function() {
                var oldvdiv = document.getElementById("oldversionlink");
                var excep = new RegExp(/^\/selection\/new$|^(\/top\/(\w|-)*\/(custom|remarkable)$)/);
                if(excep.test(window.location.pathname)) {
                    oldvdiv.classList.add("hidden");
                }
                else {
                    oldvdiv.classList.remove("hidden");
                    var oldvmessage = oldvdiv.getElementsByTagName("span").item(0);
                    var oldvlink = oldvmessage.getElementsByTagName("a").item(0);
                    oldvlink.href = "/old"+window.location.pathname;
                    oldvlink.hreflang = i18next.language;
                    oldvlink.innerText = i18next.t("messages.oldvanchor");
                }
            },
            initAnchorsRouting : function() {
                var anchors = document.getElementsByTagName("a");
                for(var k in anchors) {
                    var anchor = anchors[k];
                    if(/#$/.test(anchor.href) !== true &&  anchor.host === window.location.host) {
                        $(anchor).click(function(e){
                            mpghelper.router.routeAnchor($(this),e,response);
                        });
                    }
                }
            },
            routeAnchor : function(el,e,data) {
                var a = el[0];
                this.ANCHOR_FROM = window.location.pathname;
                if(a.pathname !==  window.location.pathname) {
                    var target = this.hashPath(a.pathname);
                    if(['club','selection','top'].indexOf(target.type.toLowerCase()) !== -1 && target.key !== "new") {
                        if(e) e.preventDefault();
                        this.route(target,data,this.historyPush(a.pathname,target));
                    }
                }
                else if(e){
                    e.preventDefault();
                }
            },
            route : function(target,data,historypush) {
                /*
                - Get target from anchor or location
                - Get league of current team
                - Get league of target
                    - If a selection : get Selection then:
                        - Callback 1 : Compare leagues
                        - Reload league on change then :
                            - Filter
                            - Title
                            - Callback 2 Hitory push
                 */
                this.QUERY_RETRIES = 0;
                target = target || this.hashPath(window.location.pathname);
                /*Getting instance of current loaded team*/
                if(data && "team" in data && data.team instanceof MPGTeam){
                    team=data.team;
                }
                else if(data && data instanceof MPGTeam){
                    team=data;
                }
                /*Getting league of target*/
                if(['club','selection','top'].indexOf(target.type.toLowerCase()) !== -1) {
                    this.waitMessage();
                    if(target.type.toLowerCase() === "selection") {
                        this.loadSelection(target,historypush);
                    }
                    else {
                        this.compareLeagues(target,historypush);
                    }
                }
            },
            compareLeagues : function(target,callback) {
                if(target.type === "selection" || !(team instanceof MPGTeam) || target.league !== team.majorLeague.cleanName) {
                    var actualLeague;
	                if(target.type === "selection") {
		                actualLeague = target.selection.league.cleanName;
	                }
                    else if(!(team instanceof MPGTeam)) {
                        actualLeague = "none";
                    }
                    else {
                        actualLeague = team.majorLeague.cleanName;
                    }
                    var precallback = function(json) {		
						response = mpghelper.teamAjaxProcess.parseDataToTeamArray(json,nbdays);						
						mpghelper.cache.loadOdds(function(){
							table = mpghelper.teamAjaxProcess.drawTable("teamTable",response,nbdays,table);
							mpghelper.live.displayLiveMatchAlert();
							mpghelper.filterTeam.filterTable(target,true);
							mpghelper.router.displayTeamTitles(response.team,target);
							callback;
							if (window.dataLayer) {
								try {
									dataLayer.push({'event':'pageDrawn'});
								}
								catch(e) {
									console.warn("GTM disabled - skipping");
								}
							}
						});                        
                    };
                    mpghelper.cache.loadLeague(target,false,precallback);
                }
                else {
                    mpghelper.filterTeam.filterTable(target);
                    mpghelper.router.displayTeamTitles(team,target);
                    callback;
                    if (window.dataLayer) {
	                    try {
		                    dataLayer.push({'event':'pageDrawn'});
	                    }
	                    catch(e) {
		                    console.warn("GTM disabled - skipping");
	                    }
                    }
                }
            },
            loadSelection : function(target,callback) {
                if(target.key.length>0) {
                    var URLTeam= mpghelper.apiURL + 'selection/'+target.key;
                    $.ajax({
                        type: 'GET',
                        dataType: 'json',
                        url: URLTeam,
                        timeout: mpghelper.router.QUERY_TIMEOUT,
                        success: function(selection){
                            /*Routing waiting for JSON selection to answer*/
                            target.league = selection.league.cleanName;
                            target.selection = selection;
                            mpghelper.SEL = selection;
                            mpghelper.router.compareLeagues(target,callback);
                            if (window.dataLayer) {
	                            try {
		                            dataLayer.push({'event':'loadselsuccess'});
	                            }
	                            catch(e) {
		                            console.warn("GTM disabled - skipping");
	                            }
                            }
                        },
                        error: function(xhr, textStatus, errorThrown){
                            console.error("{loadSelection} Failed to get stream "+errorThrown);
                            if(mpghelper.router.QUERY_RETRIES<mpghelper.router.QUERY_MAX_RETRIES) {
                                mpghelper.router.QUERY_RETRIES++;
                                mpghelper.router.loadSelection(target,callback);
                            }
                            else {
                                console.error("{loadSelection} Get stream aborted");
                                mpghelper.router.waitMessage("timeout");
                                console.error("{loadSelection} Restoring path to "+mpghelper.router.ANCHOR_FROM);
                                if (window.dataLayer) {
	                                try {
		                                dataLayer.push({'event':'loadselerror'});
	                                }
	                                catch(e) {
		                                console.warn("GTM disabled - skipping");
	                                }
                                }
                            }
                            /*history.back();*/
                        }
                    });
                }
                else {
                    console.log("{loadSelection} Selection key incorrect");
                }
            },
            displayTeamTitles : function(team,target) {
                try{
                    var deftitle= i18next.t("titles.DEFAULT_TITLE");
                    var title;
                    var subt;
                    var domtitle;
                    var domdesc;
                    var subdesc = "";
                    if(target.type === "club") {
                        var club = team.getClub(target.club,"cleanRealName");
                        title = i18next.t("titles.CLUB_TITLE", { name: club.name });
                        var dispName;
                        if(club.name !== club.realName) {
                            dispName = club.realName;
                        }
                        subt = i18next.t("titles.CLUB_SUBTITLE", { name: dispName, league: team.majorLeague.name});
                        if(dispName) dispName = "("+dispName+")";
                        domtitle = i18next.t("titles.CLUB_DOM_TITLE", { name: club.name, realName: dispName, league: team.majorLeague.name});
                        domdesc = i18next.t("descriptions.CLUB_DESC",{ name: club.realName, league: team.majorLeague.name});
                    }
                    else if(target.type === "selection") {
                        title = i18next.t("titles.SEL_TITLE", {name: target.selection.name});
                        subt = i18next.t("titles.SEL_SUBTITLE", {owner: target.selection.owner, league: target.selection.league.name});                       if(target.selection.mpgcode) {
		                    subt += " <small>(MPG #"+target.selection.mpgcode+")</small>";
	                    }
                        domtitle =i18next.t("titles.SEL_DOM_TITLE", {name: target.selection.name, owner: target.selection.owner, league: target.selection.league.name});
                        domdesc = i18next.t("descriptions.SEL_DESC",{name: target.selection.name, owner: target.selection.owner, league: target.selection.league.name});
                    }
                    else if(target.type === "top") {
                        var filtObj = {};
                        for(var i = 0, l = response.filters.length ; i<l ; i++) {
                            var f = response.filters[i];
                            if(f) {
                                var p = mpghelper.teamAjaxProcess.getColParam(i);
                                if(p) {
                                    if(typeof p === "object" && "name" in p) {
	                                    filtObj[p.name] = response.filters[i];
                                    }
                                    else if(typeof p === "string") {
	                                    filtObj[p] = response.filters[i];
                                    }
                                }
                            }
                        }

                        switch (target.topmode) {
                            case "season" :
                                title = i18next.t("titles.TOP_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_SEASON",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minPres",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_SEASON_DESC",{league:team.majorLeague.name});
                                break;
                            case "moment" :
                                title = i18next.t("titles.TOP_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_MOMENT",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minSucPres",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_MOMENT_DESC",{league:team.majorLeague.name});
                                break;
                            case "lastyear" :
                                title = i18next.t("titles.TOP_TITLE");
                                subt= i18next.t("titles.TOP_TYPE_YEAR",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minOverallPres",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_YEAR_DESC",{league:team.majorLeague.name});
                                break;
                            case "scorers" :
                                title = i18next.t("titles.TOP_SCORERS_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_SEASON",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minGoal",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_SCORERS_DESC",{league:team.majorLeague.name});
                                break;
                            case "risingstars" :
                                title = i18next.t("titles.TOP_RISING_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_SEASON",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minPresMaxRate",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_RISING_DESC",{league:team.majorLeague.name});
                                break;
                            case "momentrisingstars" :
                                title = i18next.t("titles.TOP_RISING_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_MOMENT",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minSucPresMaxRate",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_MOMRISING_DESC",{league:team.majorLeague.name});
                                break;
                            case "lastyearrisingstars" :
                                title = i18next.t("titles.TOP_RISING_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_YEAR",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minOverallPresMaxRate",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_YEARRISING_DESC",{league:team.majorLeague.name});
                                break;
                            case "risingscorers" :
                                title = i18next.t("titles.TOP_RISING_SCORERS_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_SEASON",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.minGoalMaxRate",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_SCORISING_DESC",{league:team.majorLeague.name});
                                break;
                            case "remarkable" :
                                title = i18next.t("titles.TOP_REMARKABLE_TITLE");
                                subt = i18next.t("titles.TOP_TYPE_SEASON",{league:team.majorLeague.name});
                                subdesc = "("+i18next.t("topdesc.remarkable",filtObj)+")";
                                domdesc = i18next.t("descriptions.TOP_REMARKABLE_DESC",{league:team.majorLeague.name});
                                break;
                            default:
                                title = i18next.t("titles.TOP_TITLE")+i18next.t("titles.TOP_TITLE_LEAGUE",{league:team.majorLeague.name});
                                subt = "";
                                subdesc = "";
                                domdesc = i18next.t("descriptions.TOP_SEASON_DESC",{league:team.majorLeague.name});
                        }
                        domtitle = title+subt;
                        domdesc+=i18next.t("descriptions.TOP_END_DESC");
                    }
                    else {
                        title = i18next.t("titles.TOP_TITLE")+i18next.t("titles.TOP_TITLE_LEAGUE",{league:team.majorLeague.name});
                        subt = "";
                        domtitle = title+subt;
                        domdesc = i18next.t("titles.LEAGUE_DESC",{league:team.majorLeague.name});
                    }
                    document.getElementById("teamTitle").innerHTML = title;
                    document.getElementById("subdesc").innerHTML = subdesc;
                    document.getElementById("teamSubtitle").innerHTML = subt;
                    document.title =domtitle;
                    $("meta[name='description']").attr("content", domdesc);
                    $("meta[itemprop='name']").attr("content", deftitle+" "+domtitle);
                    $("meta[itemprop='description']").attr("content", domdesc);
                    $("meta[name='twitter:title']").attr("content", deftitle+" "+domtitle);
                    $("meta[name='twitter:description']").attr("content", domdesc);
                    $("meta[property='og:title']").attr("content", deftitle+" "+domtitle);
                    $("meta[property='og:description']").attr("content", domdesc);
                    $("meta[property='og:url']").attr("content", window.location.href);
                    try {
                        $("#shareIcons").jsSocials("option","url",window.location.href);
                        $("#shareIcons").jsSocials("option","text",domtitle+" "+domdesc);
                    }
                    catch (e) {
                        console.error("displayTeamTitles - socials : "+e);
                    }
                    mpghelper.teamAjaxProcess.parseMetadataJson(team,target);
                }
                catch (e) {
                    console.error("displayTeamTitles : "+e);
                }
            },
            historyPush : function(pathname,target) {
                var stateObj = this.createStateObj(target);
                window.history.pushState(stateObj,"Test",pathname);
                this.refreshOldVLink();
            },
            createStateObj : function(target) {
                var current = this.hashPath(window.location.pathname);
                var stateObj = {
                    from:current,
                    to:target
                };
                stateObj.leagueFrom=(typeof stateObj.from !== "undefined" && "league" in stateObj.from)?stateObj.from.league:"";
                stateObj.leagueTo=(typeof stateObj.target !== "undefined" && "league" in stateObj.target)?stateObj.target.league:"";
                stateObj.leagueChange=(stateObj.leagueFrom!==stateObj.leagueTo);
                return stateObj;
            },
            hashPath : function(path) {
                var obj = {
                    path:path,
                    paths:"",
                    type:"",
                    league:"",
                    club:"",
                    topmode:"",
                    place:"",
                    key:""
                };
                obj.paths = path.split('/');
                if(obj.paths[1].length>0 && ['club','selection','top'].indexOf(obj.paths[1].toLowerCase()) !== -1 && 2 in obj.paths && obj.paths[2].length>0) {
                    obj.type = obj.paths[1];
                    if(['club','top'].indexOf(obj.type.toLowerCase()) !== -1 && 3 in obj.paths) {
                        obj.league = obj.paths[2];
                        if(obj.type.toLowerCase() === 'club' && obj.paths[3].length>0) {
                            obj.club = obj.paths[3];
                        }
                        else if(obj.type.toLowerCase() === 'top' && obj.paths[3].length>0) {
                            obj.topmode = obj.paths[3];
                        }
                    }
                    else if(obj.type.toLowerCase() === "selection") {
                        obj.key = obj.paths[2];
                    }
                }
                return obj;
            },

        },
        cache : {
            IDLETIMEOUT : 10,/*seconds*/
            TIMEOUT : 0,
            TIMEOUTRETRY : 5,
            TEAMSCACHE : "MPGStats_Teams",
            BUILDSCACHE : "lb",
            isLocalAble : function() {
                try {
                    localStorage.setItem("MPGStats_cache_test", "MPGStats_cache_test");
                    localStorage.removeItem("MPGStats_cache_test");
                    return true;
                } catch(e) {
                    return false;
                }
            },
            isSessionAble : function() {
                try {
                    sessionStorage.setItem("MPGStats_cache_test", "MPGStats_cache_test");
                    sessionStorage.removeItem("MPGStats_cache_test");
                    return true;
                } catch(e) {
                    return false;
                }
            },
			cacheBuilds : function(force, callback) {
				var json = "";
				//if(lbd) return lbd;
				//else
				if(this.isSessionAble()) {
					var json;
					if(!(json = sessionStorage.getItem(this.BUILDSCACHE)) || force) {
						var URL = mpghelper.apiURL +"builds.json";
						$.ajax({
							type: 'GET',
							dataType: 'json',
							url: URL,
							timeout: 3000,
							success: function(json){
								sessionStorage.setItem(this.BUILDSCACHE,JSON.stringify(json));
								ans = json;
								callback(json);
							},
							error: function(xhr, textStatus, errorThrown){
								console.error("Cache builds retrieval failed, loading latest build");
								callback(false);
							}
						});
					}
					else {
						json = JSON.parse(json);
					}
					return json;
				}
				else {
					console.error("{cacheBuilds} sessionStorage not able on this browser");
					if (window.dataLayer) {
						try {
							dataLayer.push({'event':'sessionstorageunable'});
						}
						catch(e) {
							console.warn("GTM disabled - skipping");
						}
					}
					return false;
				}
			},
			loadLeague : function(target,force,callback) {
				if(typeof target === "string") target.league = target;
				var params = {
					target : target,
					force : force,
					callback : callback
				};
				/*Checking build date*/
				this.cacheBuilds(force, function(leagues){
					if(leagues && target.league.length>0) {
						mpghelper.cart.resetToInit();
						var refresh = false , team;
						if(team = mpghelper.cache.isLeagueCached(target.league)) {
							if("mL" in team && "i" in team.mL && team.mL.i in leagues) {
								console.log("{Cache refresh test} Cached team parsed build date is "+Date.parse(team.bD));
								console.log("{Cache refresh test} Server team parsed build date is "+Date.parse(leagues[team.mL.i]));
								if(Date.parse(team.bD) < Date.parse(leagues[team.mL.i])) {
									refresh = true;
								}

							}
							else {
								console.log("{Cache refresh test} "+team.mL.i+" not found in leagues");
								console.log(leagues);
							}
						}
						var json = mpghelper.cache.isLeagueCached(target.league);

						if(!json || refresh === true) {
							var time = Date.now();
							console.log("{loadLeague} I'm starting to load league "+target.league);

							var URLTeam= mpghelper.apiURL +"leagues/"+target.league+".json";

							$.ajax({
								type: 'GET',
								dataType: 'json',
								url: URLTeam,
								timeout: mpghelper.router.QUERY_TIMEOUT,
								success: function(json){
									time = Date.now()-time;
									console.log("League loaded in "+time.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+" ms");
									mpghelper.TJS = JSON.stringify(json);
									//json = mpghelper.cache.identifyMatchsToUpdate();
									mpghelper.cache.cacheTeam(json,refresh);

									callback(json);
									if (window.dataLayer) {
										try {
											dataLayer.push({'event':'dlleaguesuccess'});
										}
										catch(e) {
											console.warn("GTM disabled - skipping");
										}
									}
								},
								error: function(xhr, textStatus, errorThrown){
									console.error("{loadLeague} Failed to get stream");
									if(mpghelper.router.QUERY_RETRIES<mpghelper.router.QUERY_MAX_RETRIES) {
										mpghelper.router.QUERY_RETRIES++;
										mpghelper.cache.loadLeague(target,force,callback);
									}
									else {
										console.error("{loadSelection} Get stream aborted");
										mpghelper.router.waitMessage("timeout");
										console.error("{loadSelection} Restoring path to "+mpghelper.router.ANCHOR_FROM);
										if (window.dataLayer) {
											try {
												dataLayer.push({'event':'dlleagueerror'});
											}
											catch(e) {
												console.warn("GTM disabled - skipping");
											}
										}
									}
									/*history.back();*/
								}
							});
						}
						else{
							if (window.dataLayer) {
								try {
									dataLayer.push({'event':'restoreleague'});
								}
								catch(e) {
									console.warn("GTM disabled - skipping");
								}
							}
							mpghelper.TJS = JSON.stringify(json);
							//json = mpghelper.cache.identifyMatchsToUpdate();
							callback(json);
						}
					}
				});
			},
	        loadOdds : function(callback){
		        var leagueId;
		        var hasChanged = false;
            	try{
		            leagueId = mpghelper.DT.team.majorLeague.id;
	            }
	            catch(e) {
            		console.warn("Load odds aborted",e);
		            mpghelper.cache.loadForfeits(hasChanged,callback);
            		return;
	            }
	            if(leagueId){
		            $.ajax({
			            type: 'GET',
			            dataType: 'json',
			            url: mpghelper.apiURL +"match/odds/"+leagueId+".json",
			            success: function(json){
				            if(Array.isArray(json)){
					            for(var odd of json){
						            var ne = mpghelper.DT.team.nextEvents.get(odd.i);
						            if(!ne) continue;
						            if(ne.odds && odd.gd && odd.r){
							            odd = new MPGOdds(odd);
							            hasChanged = true;
							            delete ne.odds;
							            ne.odds = odd;
							            mpghelper.DT.team.nextEvents.set(ne.id,ne);
						            }
					            }
				            }
				            if (window.dataLayer) {
					            try {
						            dataLayer.push({'event':'dloddssuccess'});
					            }
					            catch(e) {
						            console.warn("GTM disabled - skipping");
					            }
				            }
							console.log("Odds loaded");
				            mpghelper.cache.loadForfeits(hasChanged,callback);

			            },
			            error: function(xhr, textStatus, errorThrown){
				            console.error("{loadOdds} Failed to get stream");
				            mpghelper.cache.loadForfeits(hasChanged,callback);
			            }
		            });
	            }
	            else mpghelper.cache.loadForfeits(hasChanged,callback);
	        },
	        loadForfeits : function(hasChanged,callback){				
		        var leagueId, seasonId, day;
		        try{
			        leagueId = mpghelper.DT.team.majorLeague.id;
			        if(leagueId!== 1) return callback();
			        seasonId = mpghelper.DT.team.majorLeague.activeSeason.id;
			        day = mpghelper.DT.team.majorLeague.activeSeason.currentDay.day+1;
		        }
		        catch(e) {
			        console.warn("Load forfeits aborted",e);					
			        //if(hasChanged) table.draw();
			        return callback();
		        }
		        if(seasonId && day){
			        $.ajax({
				        type: 'GET',
				        dataType: 'json',
				        url: mpghelper.apiURL +"player/forfeits/"+seasonId+"/"+day+".json",
				        success: function(json){
					        if(Array.isArray(json)){
						        for(var forfeit of json){
						        	var p = mpghelper.DT.team.players.get(forfeit.playerId);
						        	if(p && p.nextForfeit !== forfeit){
						        		hasChanged = true;
						        		p.nextForfeit = forfeit;
						        		mpghelper.DT.team.players.set(p.id,p)
							        }
						        }

					        }
					        if (window.dataLayer) {
						        try {
							        dataLayer.push({'event':'dlforfeitssuccess'});
						        }
						        catch(e) {
							        console.warn("GTM disabled - skipping");
						        }
					        }
					        //if(hasChanged) table.draw();
							console.log("Forfeits loaded");
							return callback();
				        },
				        error: function(xhr, textStatus, errorThrown){
					        console.error("{loadForfeits} Failed to get stream");
					        //if(hasChanged) table.draw();
							return callback();
				        }
			        });
		        }
		        else {
					//if(hasChanged) table.draw();
					return callback();
				}
	        },
            isLeagueCached : function(key) {
                if(!(localStorage.getItem(this.TEAMSCACHE))) {
                    return false;
                }
                else {
                    var leagues = JSON.parse(localStorage.getItem(this.TEAMSCACHE));
                    if(key in leagues) {
                        return leagues[key];
                    }
                }
            },
            cacheTeam : function(json,force,team) {
                if(this.isLocalAble() && typeof json !== "undefined") {
                    if(typeof json !== "string") {
                        var json = jQuery.extend(true, {}, json);
                    }
                    if(typeof json === "string") {
                        json = JSON.parse(json);
                    }
                    var league = "";
                    if("mL" in json && "cN" in json.mL && json.mL.cN.length>0)  {
                        league = json.mL.cN;
                    }
                    else if(!(team) || !(team instanceof MPGTeam)) {
                        var teamobj = jQuery.extend(true, {}, json);
                        team = new MPGTeam(teamobj);
                        teamobj = null;
                    }
                    if(team && team instanceof MPGTeam) {
                        league = team.majorLeague.cleanName;
                    }
                    if(league.length>0){
                        if(leagues = localStorage.getItem(this.TEAMSCACHE)) {
                            leagues = JSON.parse(leagues);
                        }
                        else {
                            var leagues = {};
                        }
                        if(!(league in leagues) || force === true) {
                            if(!(league in leagues)) console.log("{cacheTeam} This league is not found");
                            if(force === true) console.log("{cacheTeam} Caching team is forced");
                            leagues[league] = json;
                            localStorage.setItem(this.TEAMSCACHE,JSON.stringify(leagues));
                        }
                        else {
                            console.log("{cacheTeam} League is already cached we're not going to replace it");
                        }
                    }
                    else {
                        console.error("{cacheTeam} Team not from the good instance");
                    }
                }
                else {
                    if(typeof json === "undefined") {
                        console.error("{cacheTeam} json undefined");
                        if (window.dataLayer) {
	                        try {
		                        dataLayer.push({'event':'dlleagueerror'});
	                        }
	                        catch(e) {
		                        console.warn("GTM disabled - skipping");
	                        }
                        }
                    }
                    else {
                        console.error("{cacheTeam} LocalStore not enable there");
                        if (window.dataLayer) {
	                        try {
		                        dataLayer.push({'event':'localstoreunable'});
	                        }
	                        catch(e) {
		                        console.warn("GTM disabled - skipping");
	                        }
                        }
                    }
                }
                return json;
            },
            identifyMatchsToUpdate : function() {
                return;
                try {
                    var json = mpghelper.TJS;
                    var now = Date.now();
                    var teamUpdateList = [];
                    if(typeof json === "string") var team = JSON.parse(json);
                    else var team = json;
                    if("Ne" in team) {
                        for(var i in team.Ne) {
                            var event = team.Ne[i];
                            if("dB" in event && "t1" in event && "t2" in event) {
                                var evDate = Date.parse(event.dB);
                                if(typeof evDate === "number" && evDate+(2*60*60*1000) < now) {
                                    console.log("Found a match #"+i+" (#"+event.t1+" vs #"+event.t2+") to refresh");
                                    if(teamUpdateList.indexOf(event.t1)==-1) teamUpdateList.push(parseInt(event.t1,10));
                                    if(teamUpdateList.indexOf(event.t2)==-1) teamUpdateList.push(parseInt(event.t2,10));
                                }
                            }
                        }
                    }
                    if(teamUpdateList.length>0) {
                        return this.refreshNextMatchs(teamUpdateList);
                    }
                    else {
                        return json;
                    }
                }
                catch(e) {
                    console.error("identifyMatchsToUpdate : "+e);
                }
            },
            refreshNextMatchs : function(teamUpdateList) {
                try{
                    if(teamUpdateList.length>0) {
                        console.log("{updateNextMatchs} I'm starting to load next matchs");
						if(mpghelper.newApi.nextMatchs === true) {
							var URL= mpghelper.apiURL +"nxtm/";
						}
						else {
							var URL='/json/nxtm.json';
						}
                        var postdata = "teams="+encodeURIComponent(JSON.stringify(teamUpdateList));
                        var now = Date.now();
                        $.ajax({
                            type: 'POST',
                            url: URL,
                            data: postdata,
                            dataType: 'json',
                            async: false,
                            timeout: mpghelper.router.QUERY_TIMEOUT,
                            success: function(json){
                                var update = false;
                                var team = JSON.parse(mpghelper.TJS);
                                /*Updating next matchs*/
                                for(var i in json) {
                                    if("t1" in json[i] && "t2" in json[i]) {
                                        var nextMatch = json[i];
                                        if("Ne" in team){
                                            team.Ne[i]=nextMatch;
                                            update = true;
                                            function nmwc(e1,e2) {
                                                return 1/(1+Math.pow(10,(parseInt(e1,10)-parseInt(e2,10))/400))
                                            }
                                            try {
                                                var t1 = parseInt(nextMatch.t1, 10);
                                                if (teamUpdateList.indexOf(t1)!==-1 && "nM" in team.c[t1]) {
                                                    team.c[t1].nM = parseInt(i, 10);
                                                    team.c[t1].nMWC = nmwc(team.c[t2].el,team.c[t1].el);
                                                }
                                            }
                                            catch(e) {
                                                    console.log("{updateNextMatchs} Team 1 not updated on event #"+i);
                                            }
                                            try {
                                                var t2 = parseInt(nextMatch.t2,10);
                                                if(teamUpdateList.indexOf(t2)!==-1 && "nM" in team.c[t2]) {
                                                    team.c[t2].nM = parseInt(i, 10);
                                                    team.c[t2].nMWC = nmwc(team.c[t1].el,team.c[t2].el);
                                                }
                                            }
                                            catch (e) {
                                                console.log("{updateNextMatchs} Team 2 not updated on event #"+i);
                                            }
                                        }
                                    }
                                }
                                /*Cleaning past next matchs*/
                                if("Ne" in team){
                                    for(var i in team.Ne) {
                                        if("dB" in team.Ne[i]) {
                                            var evDate = Date.parse(team.Ne[i].dB);
                                            if(typeof evDate === "number" && evDate+(2*60*60*1000) < now) {
                                                delete team.Ne[i];
                                            }
                                        }
                                    }
                                }
                                /*Caching*/
                                if(update){
                                    mpghelper.TJS = JSON.stringify(team);
                                    mpghelper.cache.cacheTeam(team,true);
                                    if (window.dataLayer) {
                                        try {
	                                        dataLayer.push({'event':'refnxtmtsuccess'});
                                        }
                                        catch(e) {
                                            console.warn("GTM disabled - skipping");
                                        }

                                    }
                                }
                            },
                            error: function(xhr, textStatus, errorThrown){
                                if(mpghelper.router.QUERY_RETRIES<mpghelper.router.QUERY_MAX_RETRIES) {
                                    mpghelper.router.QUERY_RETRIES++;
                                    mpghelper.cache.refreshNextMatchs(teamUpdateList);
                                }
                                else {
                                    console.error("{updateNextMatchs} Get stream aborted");
                                    if (window.dataLayer) {
                                        try {
	                                        dataLayer.push({'event':'refnxtmterror'});
                                        }
                                        catch(e) {
                                            console.warn("GTM disabled - skipping");
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                catch (e) {
                    console.error("refreshNextMatchs : "+e);
                }
                return mpghelper.TJS;
            }
        },
		selection : {
			DIALOG : undefined,
			FORMVALIDATOR : undefined,
			init : function() {
				try{
					$("#Sform").submit(function(event){

					});
					$("#SformSubmit").on("click",function(){
						if (!window.grecaptcha.getResponse()) {
							event.preventDefault(); //prevent form submit
							window.grecaptcha.reset();
							window.grecaptcha.execute();
						}
						$("#Sform").submit();
					});
					$("#SformCancel").on("click",function(){
						mpghelper.selection.DIALOG.modal('hide');
					});
				}
				catch (e) {
					console.error("selection.init : "+e);
				}
			},
			create : function() {
				this.DIALOG = bootbox.dialog({
					title: i18next.t("selectionForm.saveCartTitle"),
					message: $("#SformDiv")/*,
                    show: false*/})
					.on('shown.bs.modal', function() {
						$('#SformDiv').show();
						mpghelper.selection.FORMVALIDATOR = $("#Sform").validate({
							ignore: null,
							rules: {
								hiddenRecaptcha: {
									required: function () {
										var response = window.grecaptcha.getResponse();
										if (response.length > 0) {
											return false;
										} else {
											return true;
										}
									}
								}
							},
							submitHandler: function (form) {
								document.getElementById('SformSubmit').classList.add("disabled");
								document.getElementById('SformCancel').classList.add("disabled");
								mpghelper.selection.store();
								return false;
							},
							highlight: function (element) {
								var id_attr = "#" + $(element).attr("id") + "1";
								$(element).closest('.form-group').removeClass('has-success').addClass('has-error');
								$(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');
							},
							unhighlight: function (element) {
								var id_attr = "#" + $(element).attr("id") + "1";
								$(element).closest('.form-group').removeClass('has-error').addClass('has-success');
								$(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');
							},
							errorElement: 'span',
							errorClass: 'help-block',
							errorPlacement: function (error, element) {
								var el = element;
								if (el.length) {
									error.insertAfter(el);
								} else {
									error.insertAfter(el);
								}
							}
						});
						document.getElementById("SformSn").focus();
					})
					.on('hide.bs.modal', function(e) {
						$('#SformDiv').hide().appendTo('body');
					})
					.modal('show');
			},
			store : function() {
				try{
					function escapeRegExp(string){
						return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); /*$& means the whole matched string*/
					}
					var Sname = document.getElementById("SformSn").value.trim();
					var Sowner = document.getElementById("SformSo").value.trim();
					var Sleagueid = response.team.majorLeague.id;
					var Splayers = mpghelper.cart.cart;
					var SCaptcha = window.grecaptcha.getResponse();
                    var url= mpghelper.apiURL + 'selection/store';
					if(Splayers.length>0) {
						var players = JSON.stringify(Splayers);
						var params = {
						    sName: Sname,
						    sOwner : Sowner,
                            leagueId : Sleagueid,
                            playersList : players,
                            "g-recaptcha-response" : SCaptcha
						};
						$.ajax({
							type: 'POST',
							url: url,
							data: params,
							dataType: 'json',
							async: true,
							timeout: mpghelper.router.QUERY_TIMEOUT,
							success: function(res){
							    let sel = res.selection;
								mpghelper.selection.showLink(sel);
								mpghelper.selection.FORMVALIDATOR.resetForm();
								document.getElementById("Sform").reset();
								mpghelper.selection.DIALOG.modal("hide");
								if (window.dataLayer) {
									try {
										dataLayer.push({'event':'selcreated'});
									}
									catch(e) {
										console.warn("GTM disabled - skipping");
									}
								}
								document.getElementById('SformSubmit').classList.remove("disabled");
								document.getElementById('SformCancel').classList.remove("disabled");
							},
							error: function(xhr, textStatus, errorThrown){
								console.error(textStatus);
								console.error(errorThrown);
								if (window.dataLayer) {
									try {
										dataLayer.push({'event':'selcreateerror'});
									}
									catch(e) {
										console.warn("GTM disabled - skipping");
									}
								}
								document.getElementById('SformSubmit').classList.remove("disabled");
								document.getElementById('SformCancel').classList.remove("disabled");
							}
						});
						window.grecaptcha.reset();
						document.getElementById("hiddenRecaptcha").value = "";
					}
				}
				catch (e) {
					console.error("Selstore : "+e);
				}

			},
			showLink : function(selection) {
				try{
					var link = "/selection/"+selection.key+"/"+selection.cleanOwner+"/"+selection.cleanName;
                    var target = mpghelper.router.hashPath(link);
                    document.getElementById("selLinkInput").value = window.location.host+link;
                    document.getElementById("selLinkMPG").value = selection.mpgcode;
                    document.getElementById("selLink").classList.remove("hidden");
                    mpghelper.selection.linkTools();
                    mpghelper.router.route(target,response,mpghelper.router.historyPush(link,target));
				}
				catch (e) {
					console.error("showLink : "+e);
				}
			},
			linkTools : function() {
				try{
					var clipboard = new Clipboard('.btn');
					clipboard.on('success', function(e) {
						$('#selLinkCopyBtn').trigger('copied', [i18next.t("selectionCreated.COPIED")]);
						e.clearSelection();
					});
					clipboard.on('error', function(e) {
						console.error('Action:', e.action);
						console.error('Trigger:', e.trigger);
					});
					/*Handler for updating the tooltip message*/
					$('#selLinkCopyBtn').bind('copied', function(event, message) {
						$(this).attr('title', message)
							.tooltip('fixTitle')
							.tooltip('show')
							.attr('title', i18next.t("selectionCreated.COPY_TO_CLIP"))
							.tooltip('fixTitle');
					});
					$('#selLinkBookBtn').click(function(e) {
						var bookmarkURL = document.getElementById("selLinkInput").value;
						var bookmarkTitle = document.title;
						if ('addToHomescreen' in window && addToHomescreen.isCompatible) {
							/*Mobile browsers*/
							addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
						} else if (window.sidebar && window.sidebar.addPanel) {
							/*Firefox <=22*/
							window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
						} else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
							/*Firefox 23+ and Opera <=14*/
							$(this).attr({
								href: bookmarkURL,
								title: bookmarkTitle,
								rel: 'sidebar'
							}).off(e);
							return true;
						} else if (window.external && ('AddFavorite' in window.external)) {
							/*IE Favorites*/
							window.external.AddFavorite(bookmarkURL, bookmarkTitle);
						} else {
							/*Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)*/
							alert(i18next.t("selectionCreated.BOOKMARK_PRESS")+(/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + i18next.t("selectionCreated.BOOKMARK_INSTRUC"));
						}
						return false;
					});
				}
				catch (e) {
					console.error("linkTools : "+e);
				}
			}
		},
		paste : {
			VAL : undefined,
			CLUBSSTR : "",
			CLUBSABVSTR : "",
			PLACESARR : ["G", "Gardien", "D", "Défenseur", "DL", "Def. Lat.", "DC", "Def. Cen.", "Milieu", "MO", "Mil. Off", "Mil. Off.", "MD", "Mil. Def.", "A", "Attaquant", "Goalkeeper", "Defender", "CB", "Center Back", "WB", "Wing Back", "Midfielder", "DM", "Def. Mid.", "AM", "Att. Mid.", "F", "Forward", "P", "Portero", "Defensa", "CENT", "Def. Cent.", "LAT", "Def. Lat.", "Centrocampista", "MCD", "Med. Def.", "MCO", "Med. Ofe", "Med. Ofe.", "D", "Delantero"],
			FULLPLACESARR : ["Gardiens", "Défenseurs", "Milieux", "Attaquants", "Goalkeepers", "Defenders", "Midfielders", "Forwards", "Porteros", "Defensas", "Centrocampistas", "Delanteros"],
			PLACESSTR : "",
			FULLPLACESSTR : "",
			PLAYERLISTREGEX : undefined,
			PLAYERAUCTIONREGEX : undefined,
			PLAYERBIDREGEX : undefined,
			PLAYERDATAREGEX : undefined,
			PROCTIMEOUT : undefined,
			PLAYERS : [],
			DIALOG : undefined,
			BOXINIT : false,
			BOXID : "SPasteDiv",
			INPUTID : "SPasteInput",
			BUTTONID : "pasteBoxBtn",
			escapeRegExp : function(string) {
				return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

			},
			listClubs : function() {
				mpghelper.paste.CLUBSSTR = "";
				mpghelper.paste.CLUBSABVSTR = "";
				if(response.team instanceof MPGTeam && response.team.clubs.size>0) {
					for(var [i, club] of response.team.clubs) {
                        if(mpghelper.paste.CLUBSSTR !== "") mpghelper.paste.CLUBSSTR += "|";
                        mpghelper.paste.CLUBSSTR += this.escapeRegExp(club.name)+"\\s";
                        if(club.abv.length>0) {
                            mpghelper.paste.CLUBSSTR += "|" + this.escapeRegExp(club.abv) + "\\s";
                            if(mpghelper.paste.CLUBSABVSTR !== "") mpghelper.paste.CLUBSABVSTR += "|";
                            mpghelper.paste.CLUBSABVSTR += this.escapeRegExp(club.abv)+"\\s";
                        }
					}
				}
			},
			listPlaces : function() {
				mpghelper.paste.PLACESSTR = "";
				mpghelper.paste.FULLPLACESSTR = "";
				if(this.PLACESARR.length>0) {
					for (var i in this.PLACESARR) {
						if(mpghelper.paste.PLACESSTR !== "") mpghelper.paste.PLACESSTR += "|";
						mpghelper.paste.PLACESSTR += this.escapeRegExp(mpghelper.paste.PLACESARR[i]) + "\\s";
					}
					for (var j in this.FULLPLACESARR) {
						if(mpghelper.paste.FULLPLACESSTR !== "") mpghelper.paste.FULLPLACESSTR += "|";
						mpghelper.paste.FULLPLACESSTR += this.escapeRegExp(mpghelper.paste.FULLPLACESARR[j]) + "\\s";
					}
				}
			},
			buildPlayerListReg : function() {
				this.listClubs();
				this.listPlaces();
				var regex = "^("+this.CLUBSSTR+")?([\\w\\D]+)\\s("+this.CLUBSSTR+")("+this.PLACESSTR+")(\\d+)\\s?\\d*$";
				this.PLAYERLISTREGEX = new RegExp(regex,"gi");
			},
			buildPlayerAuctionReg : function() {
				this.listClubs();
				this.listPlaces();
				var regex = "^([\\w\\D]+)\\s("+this.PLACESSTR+")("+this.CLUBSSTR+")(\\d+)\\s?\\d*$";
				this.PLAYERAUCTIONREGEX = new RegExp(regex,"gi");
			},
			buildPlayerBidReg : function() {
				this.listClubs();
				this.listPlaces();
				var regex = "^("+this.FULLPLACESSTR+")?("+this.CLUBSABVSTR+")\\-\\s([\\w\\D]+)(\\s\\d+)(\\s\\d+)$";
				this.PLAYERBIDREGEX = new RegExp(regex,"gi");
			},
			buildPlayerDataReg : function() {
				this.listClubs();
				this.listPlaces();
				var regex = "^([\\w\\D]+)\\s("+this.PLACESSTR+")("+this.CLUBSSTR+")(\\d+,\\d+)\\s(\\d+)\\s(\\d+)\\s(\\d+)*$";
				this.PLAYERDATAREGEX = new RegExp(regex,"gi");
			},
			addSpaceToName : function(input) {
				var regex =  new RegExp("[\\w\\D][A-Z\\u00C0-\\u00DC]","g");
				var index = 0;
				var match;
				var res = input.trim();
				if(match = regex.exec(input)) {
					index = match.index + 1;
					res = input.slice(0, index)+ " " + input.slice(index);
				}
				res = res.trim();
				return res;
			},
			parsePlayer : function(input) {
				if(typeof input === "string" && input.length>0 && this.PLAYERLISTREGEX instanceof RegExp && this.PLAYERAUCTIONREGEX instanceof RegExp && this.PLAYERBIDREGEX instanceof RegExp && this.PLAYERDATAREGEX instanceof RegExp) {
					this.PLAYERLISTREGEX.lastIndex = 0;
					this.PLAYERAUCTIONREGEX.lastIndex = 0;
					this.PLAYERBIDREGEX.lastIndex = 0;
					this.PLAYERDATAREGEX.lastIndex = 0;
					var catchName = "";
					var catchClub = "";
					var catchPlace = "";
					var catchRate = "";
					if(input.match(this.PLAYERLISTREGEX)) {
						this.PLAYERLISTREGEX.lastIndex = 0;
						this.PLAYERLISTREGEX.exec(input);
						catchName = RegExp.$2;
						catchClub = RegExp.$3;
						catchPlace = RegExp.$4;
						catchRate = RegExp.$5;
					}
					else if(input.match(this.PLAYERAUCTIONREGEX)) {
						this.PLAYERAUCTIONREGEX.lastIndex = 0;
						this.PLAYERAUCTIONREGEX.exec(input);
						catchName = RegExp.$1;
						catchClub = RegExp.$3;
						catchPlace = RegExp.$2;
						catchRate = RegExp.$4;
					}
					else if(input.match(this.PLAYERBIDREGEX)) {
						this.PLAYERBIDREGEX.lastIndex = 0;
						this.PLAYERBIDREGEX.exec(input);
						catchName = RegExp.$3;
						catchClub = RegExp.$2;
					}
					else if(input.match(this.PLAYERDATAREGEX)) {
						this.PLAYERDATAREGEX.lastIndex = 0;
						this.PLAYERDATAREGEX.exec(input);
						catchName = RegExp.$1;
						catchClub = RegExp.$3;
						catchPlace = RegExp.$2;
						catchRate = RegExp.$6;
					}

					if(catchName && catchClub) {
						//Creating Player
						var player = new MPGPlayer(0);
						player.name = this.addSpaceToName(catchName);
						player.fullplace = catchPlace.trim();
						player.convertPlace();
						player.rate = parseInt(catchRate,10);
						//Getting Club
						catchClub = catchClub.trim();
						if(catchClub.length<4 && catchClub.toUpperCase() === catchClub) {
							var field = "abv";
						}
						else {
							var field = "name";
						}
						if(catchClub) {
							player.club = response.team.getClub(catchClub,field);
						}

						return player;
					}
				}
			},
			parsePlayerList : function(input) {
				if(!(this.PLAYERLISTREGEX instanceof RegExp)) this.buildPlayerListReg();
				if(!(this.PLAYERAUCTIONREGEX instanceof RegExp)) this.buildPlayerAuctionReg();
				if(!(this.PLAYERBIDREGEX instanceof RegExp)) this.buildPlayerBidReg();
				if(!(this.PLAYERDATAREGEX instanceof RegExp)) this.buildPlayerDataReg();
				if(typeof input === "string" && input.length>0) {
					this.PLAYERS = [];
					//console.log(this.PLAYERREGEX);
					input = input.trim();
					input = input.replace(/(\r\n|\n|\r)/gm," ");
					input = input.replace(/(\s+|\t+)/gm," ");
					input = input.replace(/^.+?[£|€]\s/i,"");
					input = input.replace(/^.*?JOUEURS\sEQUIPES\sPOSTES\s€/i,"");
					input = input.replace(/^.*?Joueurs\sPoste\sÉquipe\sNote\sButs\sCote\s/i,"");
					input = input.replace(/^.*?Joueurs\sPoste\sÉquipe\sCote\s/i,"");
					input = input.replace(/^.*?JUGADORES\sEQUIPOS\sPOSICIÓNES\s€/i,"");
					input = input.replace(/^.*?Jugadores\sPosición\sEquipo\sNota\sGoles\sValor\s/i,"");
					input = input.replace(/^.*?Jugadores\sPosición\sEquipo\sValor\s/i,"");
					input = input.replace(/^.*?PLAYERS\sTEAMS\sPOSITIONS\s£/i,"");
					input = input.replace(/^.*?Player\sPosition\sTeam\sRating\sGoals\sPrice\s/i,"");
					input = input.replace(/^.*?Player\sPosition\sTeam\sPrice\s/i,"");
					input = input.replace(/^Joueurs\s/i,"");
					input = input.replace(/^Jugadores\s/i,"");
					input = input.replace(/^Player\s/i,"");
					input = input.replace(/\([0-9] minimum\)\s/ig,"");
					//input = input.replace(/(\d+,\d+\s\d+\s)|(\-\s\d+\s)/gm, "");
					input = input.replace(/\s%/, "");
					/*console.log(input);*/
					var test = input.split(/(\d+)\s/);
					var length = test.length;
					//console.log(test);
					if(length>0) {
						for(var i=length-1;i>=0;i--) {
							test[i]=test[i].trim();
							var str=test[i];
							if(/(^\d+,*\d*$)|(^\d+,*\d*\s\d+,*\d*$)/.test(str) && i>0) {
								/*Transfert lost digit to previous occurence*/
								test[i-1]=test[i-1].trim();
								test[i-1]+= " "+str;
								test.splice(i,1);
							}
						}
					}

					//console.log(test);
					var str="";
					while(str=test.pop()) {
						/*Parsing players*/
						var player = this.parsePlayer(str);
						/*console.log(player);*/
						if(player instanceof MPGPlayer) this.PLAYERS.push(player);
					}
					/*console.log(this.PLAYERS);*/
				}
			},
			addPasteButton : function() {
				var tools = document.getElementById("tools");
				var button = document.createElement("button");
				button.id = "pasteBox";
				button.classList.add("btn");
				button.classList.add("btn-warning");
				var span = document.createElement("span");
				var glyph = span.cloneNode(false);
				glyph.classList.add("glyphicon");
				glyph.classList.add("glyphicon-paste");
				button.appendChild(glyph);
				var title = span.cloneNode(false);
				title.appendChild(document.createTextNode(i18next.t("pastePlayers.button")));
				button.appendChild(title);
				tools.appendChild(button);
				button.addEventListener("click",function(){
					mpghelper.paste.togglePasteBox();
				});
				return button;
			},
			togglePasteBox : function() {
				var box = document.getElementById("SPasteDiv");
				if(box.classList.contains("invisible") || box.style.display === "none") {
					/*Display*/
					console.log("Toggle in");
					box.style = "";
					box.classList.remove("invisible");
				}
				else {
					/*Hide*/
					console.log("Toggle off");
					box.classList.add("invisible");
				}
			},
			init : function() {
				if(!mpghelper.paste.BOXINIT) {
					var button = this.addPasteButton();
					button.addEventListener("click",function(){
						mpghelper.paste.showPasteBox();
					});
					var box = document.getElementById(this.BOXID);
					var label = document.createElement("label");
					label.for=this.INPUTID;
					label.appendChild(document.createTextNode(i18next.t("pastePlayers.description")));
					box.appendChild(label);
					var input = document.createElement("textarea");
					input.id = this.INPUTID;
					input.name = this.INPUTID;
					input.rows=30;
					input.cols=60;
					input.maxlength=20000;
					box.appendChild(input);
					$("#"+input.id).on('paste', function() {
						//Waiting for the box to be updated
						var that = this;
						setTimeout(function(e) {
							mpghelper.paste.parsePlayerList(that.value);
							mpghelper.paste.findPlayers();
							if(typeof mpghelper.paste.PROCTIMEOUT==="undefined") {
								mpghelper.paste.PROCTIMEOUT = setTimeout(function(){
									mpghelper.paste.displayPlayers();
									mpghelper.paste.PROCTIMEOUT=undefined;
									that.value = "";
								},500);
							}
						}, 10);

					});
					mpghelper.paste.BOXINIT = true;
				}
			},
			findPlayers : function() {
				if(this.PLAYERS.length>0) {
					for(var i in this.PLAYERS) {
						var found = this.findPlayer(this.PLAYERS[i]);
						if(found) {
							this.PLAYERS[i] = found;
						}
					}
				}
			},
			findPlayer : function(player) {
				if(player instanceof MPGPlayer && response.team instanceof MPGTeam && response.team.players.size>0) {
					var name = new RegExp(player.name.clean().replace(/\s/gm,""),"i");
					for(var [i, p] of response.team.players) {
						if(p.club.id === player.club.id && (!player.place || p.placeval === player.placeval)) {
							if((p.name.clean()+p.firstName.clean()).replace(/\s/gm,"").match(name) || (p.firstName.clean()+p.name.clean()).replace(/\s/gm,"").match(name)) {
								return p;
							}
						}
					}
					return false;
				}
			},
			displayPlayers : function() {
				if(this.PLAYERS.length>0) {
					var ids =[];
					for(var i in this.PLAYERS) {
						if(this.PLAYERS[i] instanceof MPGPlayer && this.PLAYERS[i].id>0) {
							ids.push(this.PLAYERS[i].id);
						}
					}
					if(ids.length>0) {
						mpghelper.filterTeam.resetFilters();
						mpghelper.filterTeam.filterPlayers(ids);
						table.order([mpghelper.teamAjaxProcess.getColId("place"),'asc'],[mpghelper.teamAjaxProcess.getColId("sgoal"),'desc'],[mpghelper.teamAjaxProcess.getColId("snote"),'desc']);
						table.draw();
						mpghelper.paste.resetPasteBox();
						this.DIALOG.modal("hide");
						if (window.dataLayer) {
							try {
								dataLayer.push({'event':'pastedPlayersFound'});
							}
							catch(e) {
								console.warn("GTM disabled - skipping");
							}
						}
					}
					else {
						if (window.dataLayer) {
							try {
								dataLayer.push({'event':'noPastedPlayersFound'});
							}
							catch(e) {
								console.warn("GTM disabled - skipping");
							}
						}
					}
				}
			},
			resetPasteBox : function() {
				var input = document.getElementById(this.INPUTID);
				input.value = "";
			},
			showPasteBox : function() {
				this.DIALOG = bootbox.dialog({
					title: i18next.t("pastePlayers.title"),
					message: $("#"+this.BOXID)/*,
                    show: false*/})
					.on('shown.bs.modal', function() {
						$("#"+mpghelper.paste.BOXID).show();
						document.getElementById(mpghelper.paste.INPUTID).focus();
					})
					.on('hide.bs.modal', function(e) {
						$("#"+mpghelper.paste.BOXID).hide().appendTo('body');
					})
					.modal('show');
			}
		},
        mpglogin : {
            DIALOG : "",
            ACCESS_TOKEN : "",
            USERID : "",
            ISLOGGEDIN : false,
            LOGINFORM : "mpgloginform",
            EXPLANATION : "mpgloginexplanation",
	        BOXID : "usermpglogin",
	        LOGINID : "mpglogin",
            PWDID : "mpgpassword",
	        BUTTONID : "mpgloginsubmit",
	        LOGOUTBUTTON : "mpglogoutsubmit",
            STATUSID : "mpgconnection-status",
	        FETCHSTATUSID : "mpgfetch-status",
            LEAGUEINPUT : "mpgleagueinput",
            LEAGUEINPUTBTN : "mpgleagueinputsubmit",
            LEAGUESBOX : "leaguesList",
            LEAGUESLIST : "mpgleagueslist",
            LEAGUEDETAILSBOX : "leagueDetails",
            LEAGUEDETAILSLIST : "leaguedetailslist",
            DIVISIONSBOX : "divisionsList",
            DIVISIONSLIST : "mpgdivisionslist",
            TEAMSBOX : "teamsList",
            TEAMSLIST : "mpgteamslist",
	        DIVISIONDETAILS : "divisionDetails",
	        DIVISIONDETAILSSTATE : undefined,
	        MOREDETAILSBUTTON : "moreAboutDivision",
	        MERCATOTABLE : "divisionDetailsMercato",
	        DETAILEDIVISIONLOADED : "",
	        TEAMSTABLE : "divisionDetailsTeamsTable",
            leaguesStore : [],
            targetLeague : undefined,
	        targetDivision : undefined,
            divisionsStore : [],
            teamsStore : [],
	        mercatoDataTable : undefined,
	        teamsDataTable : undefined,
	        init : function() {
		        this.ACCESSTOKEN = "";
		        this.USERID = "";
		        var loginButton = document.getElementById(this.BUTTONID);
		        loginButton.removeAttribute("onClick");
		        loginButton.setAttribute("onClick","mpghelper.mpglogin.getAccessToken()");
		        var logoutButton = document.getElementById(this.LOGOUTBUTTON);
		        logoutButton.removeAttribute("onClick");
		        logoutButton.setAttribute("onClick","mpghelper.mpglogin.disconnect()");
		        logoutButton.classList.add("hidden");
		        var leagueButton = document.getElementById(this.LEAGUEINPUTBTN);
		        leagueButton.removeAttribute("onClick");
		        leagueButton.setAttribute("onClick","mpghelper.mpglogin.getDirectLeague()");
		        var explanation = document.getElementById(this.EXPLANATION);
		        explanation.classList.remove("hidden");
		        document.getElementById(this.LOGINID).value = "";
		        document.getElementById(this.PWDID).value = "";
		        document.getElementById(this.LEAGUESBOX).classList.add("hidden");
		        document.getElementById(this.DIVISIONSBOX).classList.add("hidden");
		        document.getElementById(this.TEAMSBOX).classList.add("hidden");
		        var leagueInput = document.getElementById(this.LEAGUEINPUT);
		        leagueInput.value = "";
		        this.leaguesStore = [];
		        this.targetLeague = undefined;
		        this.DETAILEDIVISIONLOADED = "";
		        this.divisionsStore = [];
		        this.targetDivision = undefined;
		        this.teamsStore = [];
		        this.refreshMoreDetailsButton();
		        this.drawLeaguesList();
		        this.drawLeagueDetails();
		        this.drawDivisionsList();
		        this.drawTeamsList();
	        },
	        getDirectLeague : function(){
		        var leagueButton = document.getElementById(this.LEAGUEINPUTBTN);
		        var leagueInput = document.getElementById(this.LEAGUEINPUT);
		        var status = document.getElementById(this.FETCHSTATUSID);
		        status.classList.remove("alter-warning");
		        status.innerText = "";
		        leagueButton.disabled = true;
		        var leagueId = leagueInput.value;
		        leagueId = leagueId.trim();
		        if(leagueId){
		        	leagueInput.value = "";
			        this.listDivisions(leagueId.toUpperCase(),true);

		        }
	        },
	        showModal : function() {
		        //Create and show the modal
		        this.DIALOG = bootbox.dialog({
			        title: "Explorateur MPG - Voir les équipes",
			        className: 'mpglogin-modal',
			        onEscape : true,
			        backdrop: true,
			        message: $("#"+mpghelper.mpglogin.BOXID)})
			        .on('shown.bs.modal', function() {
				        $("#"+mpghelper.mpglogin.BOXID).show();
			        })
			        .on('hide.bs.modal', function(e) {
				        $("#"+mpghelper.mpglogin.BOXID).hide().appendTo('body');
			        })
			        .modal('show');
	        },
	        getAccessToken : function() {
		        var credentials = {
			        login : "",
			        password : ""
		        }
		        credentials.login = document.getElementById(this.LOGINID).value||"";
		        credentials.login = credentials.login.trim();
		        credentials.password = document.getElementById(this.PWDID).value||"";
		        credentials.password = credentials.password.trim();
		        this.init();
		        if(credentials.login.length>0 && credentials.password.length>0) {
			        document.getElementById(this.BUTTONID).disabled.true;
			        var that = this;
			        $.ajax({
				        type: 'POST',
				        dataType: 'json',
				        url: "https://api.mpg.football/user/sign-in",
				        data: {
					        "login":credentials.login,
					        "password":credentials.password,
					        "language":"fr-FR"
				        },
				        processData : true,
				        timeout: 2000,
				        success: function(json){
					        if(json && "token" in json) {
					            delete credentials;
						        that.ACCESS_TOKEN = json.token;
						        that.USERID = json.userId;
						        console.log("Logged in");
						        //List
						        that.listLeagues();
						        //Change status bar
						        var connectionStatusBar = document.getElementById(that.STATUSID);
						        connectionStatusBar.classList.remove("hidden");
						        connectionStatusBar.classList.remove("alert-warning");
						        connectionStatusBar.classList.remove("alert-danger");
						        connectionStatusBar.classList.add("alert-success");
						        connectionStatusBar.innerText = "CONNECTÉ !";
						        //Hide connection form
						        document.getElementById(that.LOGINFORM).classList.add("hidden");
						        document.getElementById(that.EXPLANATION).classList.add("hidden");
						        //Show logout button
						        document.getElementById(that.LOGOUTBUTTON).classList.remove("hidden");
						        if (window.dataLayer) {
							        try {
								        dataLayer.push({'event':'mpgleague-loggedin'});
							        }
							        catch(e) {}
						        }
					        }
					        else {
						        throw Error("Login failed");
                            }
				        },
				        error: function(xhr, textStatus, errorThrown){
					        console.error("{login error} Failed to get stream "+errorThrown);
					        //Change status bar
					        var connectionStatusBar = document.getElementById(that.STATUSID);
					        connectionStatusBar.classList.remove("hidden");
					        connectionStatusBar.classList.remove("alert-warning");
					        connectionStatusBar.classList.remove("alert-success");
					        connectionStatusBar.classList.add("alert-danger");
					        connectionStatusBar.innerText = "LOGIN ECHOUÉ :-(";
					        document.getElementById(that.BUTTONID).disabled = false;
				        }
			        });
		        }
		        else {
			        console.log("{login} Credentials not set");
		        }
	        },
	        disconnect : function() {
		        this.init();
		        console.log("Logged out");
		        //Status bar
		        var connectionStatusBar = document.getElementById(this.STATUSID);
		        connectionStatusBar.classList.remove("alert-success");
		        connectionStatusBar.classList.remove("alert-danger");
		        connectionStatusBar.classList.add("alert-warning");
		        connectionStatusBar.innerText = "DECONNECTÉ";
		        document.getElementById(mpghelper.mpglogin.LOGINFORM).classList.remove("hidden");
	        },
	        listLeagues : function() {
                var that = this;
		        if(that.ACCESS_TOKEN) {
			        document.getElementById(this.BUTTONID).disabled = true;
			        var status = document.getElementById(this.FETCHSTATUSID);
			        status.classList.remove("alter-warning");
			        status.innerText = "";
			        var that = this;
			        $.ajax({
				        type: 'POST',
				        async: true,
				        dataType: 'json',
				        url: mpghelper.apiURL+"mpgleague/dashboard",
                        data : {userAccessToken : that.ACCESS_TOKEN},
				        processData : true,
				        timeout: 20000,
				        success: function(json){
					        try {
						        if(json && "status" in json && json.status === "success" && json.leagues) {
						            for(var l of json.leagues){
							            that.leaguesStore.push(l);
                                    }
							        that.drawLeaguesList();
						        }
						        if(json && "error" in json){
						        	throw Error(json.error);
						        }
					        }
					        catch(e){
						        console.error(e);
						        status.classList.add("alert-warning");
						        status.innerText = "Il y'a eu un problème en récupérant vos ligues, veuillez ré-essayer.";
					        }
					        document.getElementById(that.BUTTONID).disabled = false;
				        },
				        error: function(xhr, textStatus, errorThrown){
					        document.getElementById(that.BUTTONID).disabled = false;
					        status.classList.add("alert-warning");
					        status.innerText = "Il y'a eu un problème en récupérant vos ligues, veuillez ré-essayer.";
					        console.error("{list leagues error} Failed to get stream "+errorThrown);
				        }
			        });
		        }
	        },
	        drawLeaguesList : function() {
		        var list = document.getElementById(this.LEAGUESLIST);
		        list.innerHTML = "";
		        if(this.leaguesStore.length > 0){
			        document.getElementById(this.LEAGUESBOX).classList.remove("hidden");
			        list.innerHTML = "<option selected disabled>Vos ligues</option>";
			        var item = document.createElement("option");
			        for(var league of this.leaguesStore) {
				        var newItem = item.cloneNode();
				        var name = "";
				        if(league.league) name = league.name+" - "+league.league.name;
			            else name = league.name+" - (championnat inconnu)";
				        newItem.appendChild(document.createTextNode(name));
				        newItem.value = league.id;
				        list.appendChild(newItem);
			        }
                }
                this.applyLeagueChangeTrigger();

	        },
            applyLeagueChangeTrigger : function(){
	            var that = this;
                $("#mpgleagueslist").off("change").on("change", function(event){
	                var leagueId = $(this).val();
	                that.DETAILEDIVISIONLOADED = "";
	                event.preventDefault();
	                that.listDivisions(leagueId);
	            });
            },
	        listDivisions : function(leagueId, fromDirectInput) {
                var that = this;
                this.targetLeague = undefined;
                this.drawLeagueDetails();
                this.divisionsStore = [];
                this.drawDivisionsList();
		        this.targetDivision = undefined;
		        this.DETAILEDIVISIONLOADED = "";
		        this.refreshMoreDetailsButton();
                this.teamsStore = [];
                this.drawTeamsList();
		        if(leagueId) {
			        var status = document.getElementById(this.FETCHSTATUSID);
			        status.classList.remove("alter-warning");
			        status.innerText = "";
			        $.ajax({
				        type: 'GET',
				        dataType: 'json',
				        url: mpghelper.apiURL+"mpgleague/league/"+leagueId.trim(),
				        crossDomain : true,
				        timeout: 20000,
				        success: function(json){
					        try {
						        if("error" in json) throw Error(json.error);
					            if(json && json.id){
						            that.targetLeague = json;
					                var found = false;
					                for(var i in that.leaguesStore){
					                    var l = that.leaguesStore[i];
					                    if(l.id === json.id) {
					                        that.leaguesStore[i] = json;
					                        found = true;
                                        }
                                    }
                                    if(!found) that.leaguesStore.push(json);
						            that.drawLeagueDetails(json.id);
                                }
                                if(fromDirectInput === true){
	                                var list = document.getElementById(that.LEAGUESLIST);
	                                list.removeAttribute("onChange");
	                                var el = document.createElement("option");
	                                el.appendChild(document.createTextNode(json.name));
	                                el.value = json.id;
	                                el.selected = true;
	                                list.appendChild(el);
	                                that.applyLeagueChangeTrigger();
	                                if (window.dataLayer) {
		                                try {
			                                dataLayer.push({'event':'mpgleague-directaccess'});
		                                }
		                                catch(e) {}
	                                }
                                }
						        if(json && json.divisions) {
							        that.divisionsStore = json.divisions;
							        that.drawDivisionsList();
						        }

					        }
					        catch(e){
						        console.error(e);
						        status.classList.add("alert-warning");
						        if(e.message === "championshipNotManaged"){
							        status.innerText = "Désolé mais ce championnat n'est pas pris en charge actuellement.";
						        }
						        else {
							        status.innerText = "Il y'a eu un problème en récupérant cette ligue.";
						        }
					        }
					        document.getElementById(that.LEAGUEINPUTBTN).disabled = false;
				        },
				        error: function(xhr, textStatus, errorThrown){
					        document.getElementById(that.LEAGUEINPUTBTN).disabled = false;
				        	status.classList.add("alert-warning");
					        console.error("{list divisions error} Failed to get stream "+errorThrown);
					        status.innerText = "Il y'a eu un problème en récupérant cette ligue.";
				        }
			        });
		        }
	        },
            drawLeagueDetails : function() {
                var league = this.targetLeague;
                var box = document.getElementById(this.LEAGUEDETAILSBOX);
                box.classList.add("hidden");
                var list = document.getElementById(this.LEAGUEDETAILSLIST);
                list.innerHTML = "";
                if(league){
	                try {
		                if(this.targetLeague.league.name !== mpghelper.DT.team.majorLeague.name){
			                mpghelper.router.routeAnchor([{pathname:"/top/"+this.targetLeague.league.cleanName+"/custom"}],"",mpghelper.DT);
		                }
	                }
	                catch(e){
		                console.error("Error when migrating to another league");
	                }

	                box.classList.remove("hidden");
	                var el = document.createElement("li");
	                //Code
	                var code = el.cloneNode();
	                code.innerText = "Code : "+league.id;
	                list.appendChild(code);
	                //Nom
	                var name = el.cloneNode();
	                name.innerText = "Nom : "+league.name;
	                list.appendChild(name);
	                //Championnat
                    if("league" in league){
	                    var championship = el.cloneNode();
	                    championship.innerText = "Championnat : "+league.league.name;
	                    list.appendChild(championship);
                    }
	                //Status
	                var status = el.cloneNode();
	                var statusName = ""
	                switch (league.status){
		                case 1 : statusName = "Inscriptions en cours"; break;
		                case 2 : statusName = "En préparation du mercato"; break;
		                case 3 : statusName = "Mercato en cours"; break;
		                case 4 : statusName = "Ligue lancée"; break;
		                case 5 : statusName = "Ligue terminée"; break;
		                default : statusName = "Inconnu"; break;
	                }
	                status.innerText = "Status : "+statusName;
	                list.appendChild(status);
	                //Saison
	                var season = el.cloneNode();
	                season.innerText = "Saison : "+league.seasonNum;
	                list.appendChild(season);
	                //Admin
	                if(league.admin){
		                var admin = el.cloneNode();
		                admin.innerText = "Administrateur : "+league.admin.name;
		                list.appendChild(admin);
	                }
	                if("divisions" in league && league.divisions.length > 0) {
		                //Notation
		                var notation = el.cloneNode();
		                notation.innerText = "Notation : "+league.divisions[0].rating;
		                list.appendChild(notation);
		                //Nb joueurs
		                var nbPlayers=0, nbPlayersPerDiv=0;
		                for(var d of league.divisions){
			                nbPlayersPerDiv = Math.max(nbPlayersPerDiv,d.size);
			                nbPlayers+=d.size;
		                }
		                var nbP = el.cloneNode();
		                nbP.innerText = "Nombre de joueurs : "+nbPlayers+" en "+league.divisions.length+" division";
		                if(league.divisions.length>1) nbP.innerText += "s de "+nbPlayersPerDiv;
		                list.appendChild(nbP);
	                }
	                else {
		                var nbP = el.cloneNode();
		                nbP.innerHTML = "<strong>Cette ligue ne comporte pas encore d'équipe, revenez plus tard ;)</strong>";
		                list.appendChild(nbP);
	                }
                }
            },
	        drawDivisionsList : function() {
                var list = document.getElementById(this.DIVISIONSLIST);
		        list.innerHTML = "";
		        if(this.divisionsStore.length>1){
			        list.innerHTML = "<option selected disabled>Les divisions</option>";
			        document.getElementById(this.DIVISIONSBOX).classList.remove("hidden");
			        var el = document.createElement("option");
			        for(var division of this.divisionsStore){
				        var item = el.cloneNode();
				        var text = "Saison "+division.seasonNum+" - Division "+division.divisionNum;
				        item.appendChild(document.createTextNode(text));
				        item.value = ""+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum;
				        list.appendChild(item);
			        }
                }
		        else if(this.divisionsStore.length === 1){
			        document.getElementById(this.DIVISIONSBOX).classList.add("hidden");
			        var division = this.divisionsStore[0];
			        this.targetDivision = this.divisionsStore[0];
			        var divisionId = ""+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum;
			        if(division.status > 2){
				        document.getElementById("moreAboutDivision").classList.remove("hidden");
			        }
			        this.listTeams(divisionId);
                }
                var that = this;
                $("#mpgdivisionslist").off("change").on("change", function(event){
                    var divisionId = $(this).val();
	                that.DETAILEDIVISIONLOADED = "";
                    for(var d of that.targetLeague.divisions){
                    	if(""+d.MPGleagueId+"_"+d.seasonNum+"_"+d.divisionNum === divisionId){
                    		that.targetDivision = d;
                    		break;
	                    }
                    }
                    event.preventDefault();
                    that.listTeams(divisionId);
                });
            },
	        listTeams : function(divisionId) {
		        this.teamsStore = [];
		        this.drawTeamsList();
		        this.refreshMoreDetailsButton();
		        var that = this;
		        if (divisionId) {
			        $.ajax({
				        type: 'GET',
				        dataType: 'json',
				        url: mpghelper.apiURL+"mpgleague/teams/"+divisionId.trim(),
				        timeout: 20000,
				        success: function (json) {
					        try {
						        if (json && json.teams) {
							        that.teamsStore = json.teams;
							        that.drawTeamsList();
						        }
					        }
					        catch (e) {
						        console.error(e);
					        }
				        },
				        error: function (xhr, textStatus, errorThrown) {
					        console.error("{list teams error} Failed to get stream " + errorThrown);
				        }
			        });
		        }
	        },
	        refreshMoreDetailsButton : function(){
            	var button = document.getElementById(this.MOREDETAILSBUTTON);
            	var that = this;
                if(!this.targetDivision || (this.targetDivision && this.targetDivision.status <3)) {
	                if(this.DIVISIONDETAILSSTATE) this.DIVISIONDETAILSSTATE.button('reset');
                	button.classList.add("hidden");
	                document.getElementById(that.DIVISIONDETAILS).classList.add("hidden");
                	$("#"+that.MOREDETAILSBUTTON).off("click");
                }
                else {
                	button.classList.remove("hidden");
	                $("#"+that.MOREDETAILSBUTTON).off("click").on("click",function(event){

		                if(that.targetDivision && that.DETAILEDIVISIONLOADED !== that.targetDivision.MPGleagueId+"_"+that.targetDivision.seasonNum+"_"+that.targetDivision.divisionNum){
			                event.preventDefault();
			                that.DIVISIONDETAILSSTATE = $(this).button('loading');
			                document.getElementById(that.DIVISIONDETAILS).classList.remove("hidden");
			                that.getMercato();
			                that.getTeams();
			                that.DETAILEDIVISIONLOADED = that.targetDivision.MPGleagueId+"_"+that.targetDivision.seasonNum+"_"+that.targetDivision.divisionNum;
		                }
		                that.DIALOG.modal("hide");
		                location.href = "#";
		                location.href = "#"+that.MERCATOTABLE;
	                });
                }
	        },
	        drawTeamsList : function(){
                var divList = document.getElementById(this.TEAMSLIST);
		        divList.innerHTML = "";
		        if(this.teamsStore.length>0){
			        document.getElementById(this.TEAMSBOX).classList.remove("hidden");
			        var el = document.createElement("li");
			        var anchor = document.createElement("a");
			        for(var team of this.teamsStore){
				        var div = el.cloneNode();
				        var newAnchor = anchor.cloneNode();
				        var text = team.name;
				        if(team.abv) text += " ("+team.abv+")";
				        newAnchor.appendChild(document.createTextNode(text));
				        newAnchor.id = team.id;
				        newAnchor.href = "";
				        div.appendChild(newAnchor);
				        divList.appendChild(div);
			        }
                }
                var that = this;
		        $("#mpgteamslist a").off("click").on("click", function(event){
			        var teamId = $(this).prop("id");
			        event.preventDefault();
			        for(var team of that.teamsStore){
			            if(team.id === teamId){
			                var players = team.players;
				            mpghelper.filterTeam.resetFilters();
				            mpghelper.filterTeam.filterPlayers(players);
				            table.page.len(30);
				            table.order([mpghelper.teamAjaxProcess.getColId("place"),'asc'],[mpghelper.teamAjaxProcess.getColId("sgoal"),'desc'],[mpghelper.teamAjaxProcess.getColId("snote"),'desc']);
				            table.draw();
				            document.getElementById("teamTitle").innerText = team.name;
				            document.getElementById("teamSubtitle").innerText = "("+team.abv+")";
				            that.DIALOG.modal("hide");
				            if (window.dataLayer) {
				                try {
					                if(teamId !== "available-players"){dataLayer.push({'event':'mpgleague-watch-available-players'});}
					                else {dataLayer.push({'event':'mpgleague-watchteam'});}
				                }
				                catch(e) {}
				            }
			                break;
                        }
                    }
		        });
	        },
	        getTeams(){
            	if(this.teamsDataTable instanceof $.fn.dataTable.Api) {
			        this.teamsDataTable.clear();
			        this.teamsDataTable.destroy();
		        }

		        if(this.targetDivision) {
			        var maxBonus = {
				        "2": {
					        "captain": "Inf",
					        "valise": 0,
					        "uber": 0,
					        "suarez": 0,
					        "zahia": 0,
					        "miroir": 0,
					        "chapron": 0,
					        "tonton": 0,
					        "def4": "Inf",
					        "def5": "Inf"
				        },
				        "4": {
					        "captain": "Inf",
					        "valise": 1,
					        "uber": 1,
					        "suarez": 0,
					        "zahia": 0,
					        "miroir": 0,
					        "chapron": 0,
					        "tonton": 0,
					        "def4": "Inf",
					        "def5": "Inf"
				        },
				        "6": {
					        "captain": "Inf",
					        "valise": 1,
					        "uber": 2,
					        "suarez": 1,
					        "zahia": 1,
					        "miroir": 1,
					        "chapron": 0,
					        "tonton": 0,
					        "def4": "Inf",
					        "def5": "Inf"
				        },
				        "8": {
					        "captain": "Inf",
					        "valise": 1,
					        "uber": 3,
					        "suarez": 1,
					        "zahia": 1,
					        "miroir": 1,
					        "chapron": 1,
					        "tonton": 1,
					        "def4": "Inf",
					        "def5": "Inf"
				        },
				        "10": {
					        "captain": "Inf",
					        "valise": 1,
					        "uber": 3,
					        "suarez": 2,
					        "zahia": 1,
					        "miroir": 1,
					        "chapron": 1,
					        "tonton": 1,
					        "def4": "Inf",
					        "def5": "Inf"
				        }
			        };
			        var division = this.targetDivision;
			        var that = this;

			        this.teamsDataTable = $("#" + that.TEAMSTABLE).DataTable({
				        "processing": true,
				        "fixedHeader": {
					        header: !(mpghelper.teamAjaxProcess.detectMobile())
				        },
				        "language" : {
					        "decimal":        i18next.t("datatables.decimal"),
					        "emptyTable":     i18next.t("datatables.emptyTable"),
					        "info":           i18next.t("datatables.info"),
					        "infoEmpty":      i18next.t("datatables.infoEmpty"),
					        "infoFiltered":   i18next.t("datatables.infoFiltered"),
					        "infoPostFix":    i18next.t("datatables.infoPostFix"),
					        "thousands":      i18next.t("datatables.thousands"),
					        "lengthMenu":     i18next.t("datatables.lengthMenu"),
					        "loadingRecords": i18next.t("datatables.loadingRecords"),
					        "processing":     i18next.t("datatables.processing"),
					        "search":         i18next.t("datatables.search"),
					        "zeroRecords":    i18next.t("datatables.zeroRecords"),
					        "paginate": {
						        "first":      i18next.t("datatables.paginate.first"),
						        "last":       i18next.t("datatables.paginate.last"),
						        "next":       i18next.t("datatables.paginate.next"),
						        "previous":   i18next.t("datatables.paginate.previous"),
					        },
					        "aria": {
						        "sortAscending":  i18next.t("datatables.aria.sortAscending"),
						        "sortDescending": i18next.t("datatables.aria.sortDescending")
					        }
				        },
				        "columns": [{data: "name"},
					        {data: "points"},
					        {data: "win"},
					        {data: "draw"},
					        {data: "loss"},
					        {data: "goalAvg"},
					        {
					        	data: null,
						        render: function (data, type, row) {
							        let GP = row.realGP||0;
							        let GC = row.realGC||0;
							        return type === "display" ? "+"+GP+"/-"+GC : GP-GC;
						        }
					        },
					        {
						        data: null,
						        render: function (data, type, row) {
							        let GP = row.MPGGP||0;
							        let GC = row.MPGGC||0;
							        return type === "display" ? "+"+GP+"/-"+GC : GP-GC;
						        }
					        },
					        {
						        data: "compoTab",
						        render: function (data, type, row) {
						        	let count = 0;
						        	let compo = "";
						        	if(data){
						        		for(let c in data){
						        			if(data[c]>count){
						        				compo = c;
						        				count = data[c];
									        }
								        }
							        }
							        return compo;
						        }
					        },
					        {
						        data: "timeline",
						        render: function (data, type, row) {
							        let rotaldos = 0;
							        if(data){
								        for(let d of data){
									        if("R" in d) rotaldos +=d.R;
								        }
							        }
							        return rotaldos;
						        }
					        },
					        {
						        data: "timeline",
						        render: function (data, type, row) {
							        let sum = 0;
						        	let nb = 0;
							        if(data){
								        for(let d of data){
									        if("a" in d) {
									        	nb++;
									        	sum+=d.a
									        }
								        }
							        }
							        return (nb>0) ? Math.round(sum/nb*10)/10 : 0;
						        }
					        },
					        {
						        data : "bonusTab.captain",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].captain;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.valise",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].valise;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.uber",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].uber;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.suarez",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].suarez;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.zahia",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].zahia;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.miroir",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].miroir;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.chapron",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].chapron;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.tonton",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].tonton;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.def4",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].def4;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {
						        data : "bonusTab.def5",
						        render: function (data, type, row) {
							        var max = maxBonus[division.size].def5;
							        return data ? data+"/"+max  :  0+"/"+max;
						        }
					        },
					        {data: "gScoreAvg"},
					        {data: "gRankAvg"}],
				        "order" : [[1,"desc"],[2,"desc"]],
				        "dom": "Blfrtip",
				        "buttons" : [
					        {
						        extend: "copyHtml5",
						        messageTop: "Stats ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
						        exportOptions: {
							        orthogonal: "export"
						        }
					        },
					        {
						        extend: "excelHtml5",
						        messageTop: "Stats ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
						        title: "MPGStats_fr_export_ligue_"+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum,
						        exportOptions: {
							        orthogonal: "export"
						        }
					        },
					        {
						        extend: "pdfHtml5",
						        messageTop: "Stats ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
						        title: "MPGStats_fr_export_ligue_"+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum,
						        exportOptions: {
							        orthogonal: "export"
						        }
					        }
				        ]
			        });

			        $.ajax({
				        type: 'GET',
				        dataType: 'json',
				        url: mpghelper.apiURL + "mpgleague/matches/" + division.MPGleagueId + "_" + division.seasonNum + "_" + division.divisionNum,
				        timeout: 60000,
				        success: function (json) {
					        if (json && json.division && json.division.teams && Array.isArray(json.division.teams) && json.division.teams.length > 0) {
					        	division = json.division;
						        that.teamsDataTable.rows.add(json.division.teams).draw();
						        if (json.effectiveScannedDay > 0) {
							        if (json.incomingResultsForDay > json.effectiveScannedDay) {
								        dayScan.innerText = "Les derniers résultats définitifs sont ceux de la journée " + json.effectiveScannedDay + "/" + json.maxDays + " mais les résultats de la journée " + json.incomingResultsForDay + " sont attendus chez MPG.";
							        }
							        else {
								        dayScan.innerText = "La ligue est scannée et à jour (journée " + json.effectiveScannedDay + "/" + json.maxDays + ").";
							        }
							        //Reload mercato
							        that.getMercato();
						        }
					        }
				        },
				        error: function (xhr, textStatus, errorThrown) {
					        console.error("{getTimeline error} Failed to get stream " + errorThrown);
				        }
			        });
		        }
	        },
	        getMercato(){
		        if(this.mercatoDataTable instanceof $.fn.dataTable.Api) {
			        this.mercatoDataTable.clear();
					this.mercatoDataTable.destroy();
		        }

				if(this.targetDivision){
					var division = this.targetDivision;
					var that = this;
					var skipEmptyAndZeroValues = $.fn.dataTable.absoluteOrderNumber( [
						{ value: '', position: 'bottom' },
						{ value: 0, position: 'bottom' }
					]);
					this.mercatoDataTable = $("#"+that.MERCATOTABLE).DataTable({
						"processing": true,
						"fixedHeader": {
							header: !(mpghelper.teamAjaxProcess.detectMobile())
						},
						"language" : {
							"decimal":        i18next.t("datatables.decimal"),
							"emptyTable":     i18next.t("datatables.emptyTable"),
							"info":           i18next.t("datatables.info"),
							"infoEmpty":      i18next.t("datatables.infoEmpty"),
							"infoFiltered":   i18next.t("datatables.infoFiltered"),
							"infoPostFix":    i18next.t("datatables.infoPostFix"),
							"thousands":      i18next.t("datatables.thousands"),
							"lengthMenu":     i18next.t("datatables.lengthMenu"),
							"loadingRecords": i18next.t("datatables.loadingRecords"),
							"processing":     i18next.t("datatables.processing"),
							"search":         i18next.t("datatables.search"),
							"zeroRecords":    i18next.t("datatables.zeroRecords"),
							"paginate": {
								"first":      i18next.t("datatables.paginate.first"),
								"last":       i18next.t("datatables.paginate.last"),
								"next":       i18next.t("datatables.paginate.next"),
								"previous":   i18next.t("datatables.paginate.previous"),
							},
							"aria": {
								"sortAscending":  i18next.t("datatables.aria.sortAscending"),
								"sortDescending": i18next.t("datatables.aria.sortDescending")
							}
						},
						"columns" : [
							{
								data : "mercatoTurn"
							},
							{
								data : "priceBuy",
								render: function ( data, type, row ) {
									return type === "display" ? data+" M€" : data;
								}
							},
							{
								data : "player.rate",
								render: function ( data, type, row ) {
									return type === "display" ? data+" M€" : data;
								}
							},
							{
								data : "player",
								render: function ( data, type, row ) {
									return data.firstname ? data.firstname+" "+data.name : data.name;
								}
							},
							{data : "MPGteam.name"},
							{data : "mercatoNbBids"},
							{
								data : null,
								render: function ( data, type, row ) {
									var totalG = row.nbGoal+row.nbMPG;
									if(totalG>0){
										return type === "display" ? ""+totalG+"("+row.nbGoal+"/"+row.nbMPG+")" : totalG;
									}
									else {
										return null;

									}
								}
							},
							{
								data : null,
								type : skipEmptyAndZeroValues,
								render: function ( data, type, row ) {
									var totalG = row.nbGoal+row.nbMPG;
									if(totalG>0){
										return Math.round(row.priceBuy/totalG*10)/10;
									}
									else {
										return null;

									}
								}
							},
							{
								data : null,
								type : skipEmptyAndZeroValues,
								render: function ( data, type, row ) {
									var nb = row.nbTitu+row.nbRemp;
									if(nb>0){
										var note = Math.round((row.sumNoteTitu+row.sumNoteRemp)/nb*100)/100;
										var textN = ""+note+"<sup>^"+nb+"</sup>";
										return type === "display" ? textN : note;
									}
								}
							},
							{
								data : null,
								render: function ( data, type, row ) {
									var nb = row.nbTitu+row.nbRemp;
									if(nb>0){
										return type === "display" ? ""+row.nbRemp+"/"+row.nbTacRemp : row.nbRemp;
									}
									return null;
								}
							}
						],
						"order" : [[0,"asc"],[1,"desc"],[5,"desc"]],
						"dom": "Blfrtip",
						"buttons" : [
							{
								extend: "copyHtml5",
								messageTop: "Stats Mercato ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
								exportOptions: {
									orthogonal: "export"
								}
							},
							{
								extend: "excelHtml5",
								messageTop: "Stats Mercato ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
								title: "MPGStats_fr_export_mercato_"+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum,
								exportOptions: {
									orthogonal: "export"
								}
							},
							{
								extend: "pdfHtml5",
								messageTop: "Stats Mercato ligue "+division.MPGleagueId+" saison "+division.seasonNum+" division "+division.divisionNum+" MPG compilées via MPGStats.fr",
								title: "MPGStats_fr_export_mercato_"+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum,
								exportOptions: {
									orthogonal: "export"
								}
							}
						]
					});

					$.ajax({
						type: "GET",
						dataType: "json",
						url: mpghelper.apiURL + "mpgleague/mercato/"+division.MPGleagueId+"_"+division.seasonNum+"_"+division.divisionNum,
						timeout: 60000,
						success: function (json) {
							if(json && Array.isArray(json) && json.length >0){
								if (window.dataLayer) {
									try {
										dataLayer.push({"event":"mpgleague-divisiondetails"});
									}
									catch(e) {}
								}
								that.mercatoDataTable.rows.add(json).draw();
								if(that.DIVISIONDETAILSSTATE) that.DIVISIONDETAILSSTATE.button('reset');
							}
						},
						error: function (xhr, textStatus, errorThrown) {
							console.error("{getMercato error} Failed to get stream " + errorThrown);
							if(that.DIVISIONDETAILSSTATE) that.DIVISIONDETAILSSTATE.button('reset');
						}
					});
				}
	        },
        },
        player : {
            BOXINIT : false,
			BOXID : "playerInfos",
	        AUCTIONSBOXID : "playerAuctionsInfos",
            GRAPHID : "playergraph",
	        AUCTIONSGRAPHID : "playerauctionsgraph",
			DIALOG : undefined,
	        AUCTIONSDIALOG : undefined,
	        CHART_WIDTH : 0.8,
			CHART_HEIGHT : 0.7,
            loaded : 0,
            init : function() {
				$('tbody a.player-info').each(function(){
					$(this).off("click");
					$(this).on("click",function(){
						var row = $(this).parents("tr")[0];
						mpghelper.player.show(parseInt(row.id,10));
					});
				});
	            $('tbody a.player-auctions-info').each(function(){
		            $(this).off("click");
		            $(this).on("click",function(){
			            var row = $(this).parents("tr")[0];
			            mpghelper.player.showAuctions(parseInt(row.id,10));
		            });
	            });
            },
            loadDependencies : function(callback) {
				if(!this.BOXINIT) {
					var script = document.createElement('script');
					script.onload = function () {
					    console.log("Script loaded");
						callback();
					};
					script.src = "https://cdn.plot.ly/plotly-latest.min.js";
					document.head.appendChild(script);
				}
				else {
				    callback();
                }
            },
            graph : function(obj, player) {
                var priceX = obj.priceX;
				var priceY = obj.priceY;
				var noteX = obj.noteX;
				var noteY = obj.noteY;
				var goalX = obj.goalX;
				var goalY = obj.goalY;
                var dateParams = [];
                if(priceX.length>0) dateParams.push(new Date(priceX[0]));
				if(noteX.length>0) dateParams.push(new Date(noteX[0]));
				var minDataDate = new Date(Math.min.apply(null,dateParams));
				var minDate = new Date(Math.max.apply(null,[minDataDate, new Date().getTime()-(365*24*60*60*1000/2)]));

				var trace1 = {
					x: noteX,
					y: noteY,
					hoverinfo: 'x',
					marker: {
						autocolorscale: false,
						cauto: true,
						cmax: 8,
						cmin: 4,
						color: noteY,
						colorscale: [['0', '#a50026'], ['0.1', '#d73027'], ['0.2', '#f46d43'], ['0.3', '#fdae61'], ['0.4', '#fee08b'], ['0.5', '#ffffbf'], ['0.6', '#d9ef8b'], ['0.7', '#a6d96a'], ['0.8', '#66bd63'], ['0.9', '#1a9850'], ['1', '#006837']],
						colorsrc: 'MPGStats:1:eda9e8',
						line: {width: 1},
						reversescale: false,
						showscale: false
					},
					name: i18next.t("teamHeader.CLUB_NOTE"),
					opacity: 0.89,
					orientation: 'v',
					showlegend: false,
					text: noteY,
					textposition: 'outside',
					textsrc: 'MPGStats:1:eda9e8',
					type: 'bar',
					xsrc: 'MPGStats:1:b4f6f6',
					yaxis: 'y2',
					ysrc: 'MPGStats:1:eda9e8'
				};
				var trace2 = {
					x: priceX,
					y: priceY,
					connectgaps: true,
					fill: 'tozeroy',
					hoverinfo: 'x+y+name',
					line: {
						shape: 'spline',
						smoothing: 1
					},
					mode: 'markers+lines+text',
					name: i18next.t("teamHeader.CLUB_RATE"),
					showlegend: false,
					text: priceY,
					textposition: 'top left',
					textsrc: 'MPGStats:0:97aedf',
					type: 'scatter',
					xsrc: 'MPGStats:0:c93e67',
					ysrc: 'MPGStats:0:97aedf'
				};
				var trace3 = {
					x: goalX,
					y: goalY,
					marker: {
						color: 'rgb(255, 0, 0)',
						line: {width: 1},
						maxdisplayed: 0,
						opacity: 1,
						size: goalY,
						sizemin: 5,
						sizemode: 'diameter',
						sizeref: 0.2,
						sizesrc: 'MPGStats:3:841a40'
					},
					mode: 'markers',
					name: i18next.t("teamHeader.CLUB_GOAL"),
					showlegend: false,
					type: 'scatter',
					xsrc: 'MPGStats:3:66cd76',
					yaxis: 'y2',
					ysrc: 'MPGStats:3:841a40'
				};
				var data = [trace1, trace2, trace3];
				var layout = {
					autosize: true,
					bargap: 0.5,
					bargroupgap: 0,
					barmode: 'group',
					barnorm: '',
					dragmode: 'pan',
					separators: ', ',
					title: i18next.t("graph.playerGraph",{name : player.name}),
					xaxis: {
						autorange: false,
                        range : [minDate, new Date()],
						domain: [0, 1],
						showspikes: false,
						side: 'bottom',
						title: i18next.t("graph.date"),
						type: 'date'
					},
					yaxis: {
						autorange: true,
						domain: [0, 1],
						showspikes: false,
						title: i18next.t("teamHeader.CLUB_RATE"),
						type: 'linear'
					},
					yaxis2: {
						autorange: false,
						domain: [0, 1],
						overlaying: 'y',
						range: [0, 10],
						side: 'right',
						title: i18next.t("teamHeader.CLUB_NOTE"),
						type: 'linear'
					},
					width: this.CHART_WIDTH * window.innerWidth,
					height: this.CHART_HEIGHT * window.innerHeight
				};
				return {
					data: data,
					layout: layout,
                    config : {displayModeBar: false, displaylogo: false}
				};
            },
            mapData : function(data, player) {
                var limit = new Date().getTime()-365*24*60*60*1000;
                var obj = {priceX : [], priceY : [], noteX : [], noteY: [], goalX : [], goalY : []};

                //Parsing Price

                try {
					var prices = data.h.filter(function(row) {
						if(row.action === "value" && new Date(row.log_date) > limit) return row;
                    });
					obj.priceX = prices.map(function(row) { if(row.action === "value") {
						var d = new Date(row.log_date);
					    return d.toISOString().substring(0, 10);
					} });
					obj.priceY = prices.map(function(row) { if(row.action === "value") return row.after; });

					if(! obj.priceX.includes(new Date().toISOString().substring(0, 10))) {
						obj.priceX.push(new Date().toISOString().substring(0, 10));
						obj.priceY.push(player.rate);
					}
                }
				catch (e) { console.error("mapData", e); }


				//Parsing Notes & Goals
				try {
                    var perfs = [];
                    for(var i of data.perfs.values()) {
                        perfs.push(i);
                    };
					var notes = perfs.filter(function(row) {
						if(row.note && new Date(row.event.date) > limit) return row;
					});
					obj.noteX = notes.map(function(row) {
						var d = new Date(row.event.date);
						return d.toISOString().substring(0, 10);
					});
					obj.noteY = notes.map(function(row) { return row.note; });
					obj.goalX = obj.noteX;
					obj.goalY = notes.map(function(row) { return row.goal; });
				}
				catch (e) { console.error("mapData", e); }

                return obj;
            },
            showModal : function(player) {
                //Create and show the modal
				mpghelper.player.DIALOG = bootbox.dialog({
					title: i18next.t("graph.playerModal",{name : player.name}),
					className: 'player-chart-modal',
					onEscape : true,
					backdrop: true,
					message: $("#"+mpghelper.player.GRAPHID)})
					.on('shown.bs.modal', function() {
						$("#"+mpghelper.player.GRAPHID).show();
					})
					.on('hide.bs.modal', function(e) {
						$("#"+mpghelper.player.GRAPHID).hide().appendTo('body');
					})
					.modal('show');
            },
	        show : function(id) {
		        var player = mpghelper.DT.team.getPlayer(id);
		        if(id === this.loaded) {
			        //Showing the modal again
			        this.showModal(player);
			        return;
		        }
		        else {
			        //Resetting modal
			        mpghelper.player.DIALOG = undefined;
		        }

		        this.loadDependencies(function () {
			        $.getJSON( mpghelper.apiURL +"player/"+id, function( data ) {
				        mpghelper.player.loaded = id;
				        data.perfs = player.perfs;

				        var map = mpghelper.player.mapData(data, player);
				        var config = mpghelper.player.graph(map, player);
				        var graphDOM = document.getElementById(mpghelper.player.GRAPHID);

				        Plotly.react(mpghelper.player.GRAPHID, config);

				        graphDOM.on('plotly_afterplot', function(){
					        //Creating a modal only if not existing to prevent modal creation each time browser is resized
					        if(!mpghelper.player.DIALOG) {
						        mpghelper.player.showModal(player);
					        }
				        });
				        window.onresize = function() {
					        Plotly.relayout(mpghelper.player.GRAPHID, {
						        width: mpghelper.player.CHART_WIDTH * window.innerWidth,
						        height: mpghelper.player.CHART_HEIGHT * window.innerHeight
					        })
				        };
			        });
		        });
	        },
	        showAuctionsModal : function(player) {
		        //Create and show the modal
		        mpghelper.player.AUCTIONSDIALOG = bootbox.dialog({
			        title: "Détail des enchères de "+player.name,
			        className: 'player-chart-modal',
			        onEscape : true,
			        backdrop: true,
			        message: $("#"+mpghelper.player.AUCTIONSGRAPHID)})
			        .on('shown.bs.modal', function() {
				        $("#"+mpghelper.player.AUCTIONSGRAPHID).show();
			        })
			        .on('hide.bs.modal', function(e) {
				        $("#"+mpghelper.player.AUCTIONSGRAPHID).hide().appendTo('body');
			        })
			        .modal('show');
	        },
	        showAuctions : function(id) {
		        var player = mpghelper.DT.team.getPlayer(id);
		        if(id === this.loadedAuctions) {
			        //Showing the modal again
			        this.showAuctionsModal(player);
			        return;
		        }
		        else {
			        //Resetting modal
			        mpghelper.player.AUCTIONSDIALOG = undefined;
		        }

		        this.loadDependencies(function () {
			        $.getJSON( mpghelper.apiURL +"player/auctions/"+id, function( auctions ) {
				        mpghelper.player.loadedAuctions = id;

				        var graphDOM = document.getElementById(mpghelper.player.AUCTIONSGRAPHID);
				        Plotly.react(mpghelper.player.AUCTIONSGRAPHID, {
				        	data : [
						        {
							        y: auctions.all,
							        name : "Toutes tailles",
							        boxpoints: 'all',
							        jitter: 0.3,
							        pointpos: -1.8,
							        type: 'box',
							        boxmean: 'sd'
						        },
						        {
							        y: auctions.s6,
							        name : "Ligues de 6",
							        boxpoints: 'all',
							        jitter: 0.3,
							        pointpos: -1.8,
							        type: 'box',
							        boxmean: 'sd'
						        },
						        {
							        y: auctions.s8,
							        name : "Ligues de 8",
							        boxpoints: 'all',
							        jitter: 0.3,
							        pointpos: -1.8,
							        type: 'box',
							        boxmean: 'sd'
						        },
						        {
							        y: auctions.s10,
							        name : "Ligues de 10",
							        boxpoints: 'all',
							        jitter: 0.3,
							        pointpos: -1.8,
							        type: 'box',
							        boxmean: 'sd'
						        }
					        ],
					        config : {
						        displayModeBar: false, displaylogo: false
					        },
				            layout : {
					            autosize: true,
					            bargap: 0.5,
					            bargroupgap: 0,
					            barmode: 'group',
					            barnorm: '',
					            separators: ', ',
					            title: "Détail des enchères au tour 1 de "+player.name,
					            width: this.CHART_WIDTH * window.innerWidth * 0.9,
					            height: this.CHART_HEIGHT * window.innerHeight
				            }
				        });

				        graphDOM.on('plotly_afterplot', function(){
					        //Creating a modal only if not existing to prevent modal creation each time browser is resized
					        if(!mpghelper.player.AUCTIONSDIALOG) {
						        mpghelper.player.showAuctionsModal(player);
					        }
				        });
				        window.onresize = function() {
					        Plotly.relayout(mpghelper.player.AUCTIONSGRAPHID, {
						        width: mpghelper.player.CHART_WIDTH * window.innerWidth,
						        height: mpghelper.player.CHART_HEIGHT * window.innerHeight
					        })
				        };
			        });
		        });
	        }
        }
    }
} else {
    console.error('Namespace mpghelper already exists');
}