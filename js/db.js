function start(callback){
	var db;
	var store;
	window.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;
	if(!db){
		if(window.indexedDB){
			var request=window.indexedDB.open("mm", 1);
						
			request.onerror=function(event){
				console.log("Error opening DB", event);
			}
			request.onupgradeneeded=function(event){
				console.log("New or Upgrading");
				var dbe=event.target.result;
				if(!dbe.objectStoreNames.contains("members")) {
					store=dbe.createObjectStore("members", {autoIncrement:true});
					store.createIndex("firstname", "firstname", {unique:false});
					store.createIndex("lastname", "lastname", {unique:false});
				}
			}
			request.onsuccess=function(event){
				console.log("Success opening DB");
				db=event.target.result;
				callback.call(db);
			}
		}
		else{
			console.log("Your Browser does not support IndexedDB");
		}
	}
}
function saveAthlete(){
	var fNameField=document.getElementById("fNameField").value;
	var lNameField=document.getElementById("lNameField").value;
	var bdayField=document.getElementById("bdayField").value;
	if(fNameField&&lNameField&&bdayField){
		console.log(fNameField+" "+lNameField+" - "+bdayField);
		start(function(){
			if(this){
				var athlete={firstname:fNameField, lastname:lNameField, birthday:bdayField, added:new Date()}
				document.getElementById("fNameField").value="";
				document.getElementById("lNameField").value="";
				document.getElementById("bdayField").value="";
				document.getElementById("newAthleteStatus").innerHTML="<b>Saved</b>";
				var objstore=this.transaction(["members"],"readwrite").objectStore("members");
				
				var query=objstore.add(athlete);
							
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(){
					console.log("Saved");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
}
function getAthleteInfoById(){
	var search=document.getElementById("searchValue").value;
	if(search){
		console.log(search);
		start(function(){
			if(this){
				var objstore=this.transaction(["members"],"readonly").objectStore("members");
				var query=objstore.get(Number(search));
				
				query.onsuccess=function(res){
					var result=res.target.result;
					console.dir(result);
					if(result){
						var returnValue="<h3>Searched: "+search+"</h3>Name: "+result.firstname+" "+result.lastname+"<br>Born "+result.birthday+"<br>Added: "+result.added.getDate()+"."+(result.added.getMonth()+1)+"."+result.added.getFullYear();
						document.getElementById("searchResult").innerHTML=returnValue;
					}else{
						document.getElementById("searchResult").innerHTML="0 Hits";
					}   
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getAthleteInfoByName(){
	var search=document.getElementById("searchValue2").value;
	if(search){
		var results="";
		console.log(search);
		search=search.split(" ");
		start(function(){
			if(this){
				var objstore=this.transaction(["members"],"readonly").objectStore("members");
				var indexF=objstore.index("firstname");
				var indexL=objstore.index("lastname");
				var range;
				var cursor;
				for(var i=0;i<search.length;i++){
					range=IDBKeyRange.only(search[i]);
					indexF.openCursor(range).onsuccess=function(res) {
						cursor=res.target.result;
						if(cursor){
							console.log("Cursor: "+cursor);
							results+="<h3>Searched: "+cursor.key+"</h3><p>";
							for(var field in cursor.value) {
								results+=field+": "+cursor.value[field]+"<br/>";
							}
							results+="</p>1 i="+i;
							console.log("Result: "+results);
							document.getElementById("searchResult").innerHTML=results;
							cursor.continue();
						}
					}
					indexL.openCursor(range).onsuccess=function(res) {
						cursor=res.target.result;
						if(cursor){
							console.log("Cursor: "+cursor);
							results+="<h3>Searched: "+cursor.key+"</h3><p>";
							console.log(results);
							for(var field in cursor.value) {
								results+=field+": "+cursor.value[field]+"<br/>";
							}
							results+="</p>2 i="+i;
							console.log("Result: "+results);
							document.getElementById("searchResult").innerHTML=results;
							cursor.continue();
						}
					}
				}
				if(!results){
					document.getElementById("searchResult").innerHTML="0 Hits";
				}
			}else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getAthleteList(){
	start(function(){
		if(this){
			var result="";
			var count=0;
			this.transaction(["members"],"readonly").objectStore("members").openCursor().onsuccess=function(res){
				var cursor=res.target.result;
				if(cursor){
					count++;
					console.log(cursor.value);
					result+=count+". <a href='profile.html?key="+cursor.key+"'>"+cursor.value.firstname+" "+cursor.value.lastname+"</a>"/*<br>Added: "+cursor.value.added.getDate()+"."+(cursor.value.added.getMonth()+1)+"."+cursor.value.added.getFullYear()*/+"<br />";
					cursor.continue();
				}
				document.getElementById("athleteList").innerHTML=result;
			};
		} else{
			console.log("DB didn't load");
		}
	});
}
function getProfile(){
	var id=window.location.search;
	if(id){
		id=id.split("=").pop();
		console.log("id: "+id);
		start(function(){
			if(this){
				var objstore=this.transaction(["members"],"readonly").objectStore("members");
				var query=objstore.get(Number(id));
							
				query.onsuccess=function(res){
					var result=res.target.result;
					console.dir(result);
					if(result){
						var returnValue=result.firstname+" "+result.lastname+"<br />"+result.birthday+"<br /><br />"+result.added.getDate()+"."+(result.added.getMonth()+1)+"."+result.added.getFullYear();
						document.getElementById("profileData").innerHTML=returnValue;
					}else{
						document.getElementById("profileData").innerHTML="0 Hits";
					}
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("profileData").innerHTML="Empty search";
	}
}