console.log("#######CONTENT SCRIPT GIRATEMPO#######")


let settings;
let config;


chrome.storage.sync.get('configDefaults', function(dataC) {
	settings = dataC.configDefaults;

	chrome.storage.sync.get('settings', function(dataS) {
		config = dataS.settings;

		if(config.enabled){
			start();
		}
	});

});



function getStoryDefault(storyId){
	if(settings){
		const matchedStory = settings.filter((storyDefault)=>storyDefault.storyId === storyId);
		if(matchedStory.length ===1){
			return matchedStory[0]
		}

		const matchedStoryWildcard = settings.filter((storyDefault)=>storyDefault.storyId.indexOf("*")!==-1 && storyId.indexOf(storyDefault.storyId.replace("*",""))!==-1);
		if(matchedStoryWildcard.length ===1){
			return matchedStoryWildcard[0]
		}
	}

	return;
}


function start(){
	//board
	let containerInDom = false;
	let issueInDom = false;
	let exIssueValue = null;

	//categoria board
	let issueTargetCategoryInDom = false;
	let exIssueCategoryValue = null;

	const observer = new MutationObserver(function(mutations) {
		const containerTarget = document.getElementById("tempo-add-hours-issue-dialog");
		const issueTarget = document.getElementById("tempo-issue-picker-popup-field"); 

		const issueTargetCategory = document.getElementById("tempo-issue-picker-0-field");


		if(document.contains(containerTarget)){
			if(!containerInDom){
				containerInDom = true;
			}
		}else{
			containerInDom = false;
		}


		if(document.contains(issueTarget)){
			if(!issueInDom){
				issueInDom = true;
			}
		}else{
			issueInDom = false;
		}

		if(document.contains(issueTargetCategory)){
			if(!issueTargetCategoryInDom){
				issueTargetCategoryInDom = true;
			}
		}else{
			issueTargetCategoryInDom = false;
		}


		if(containerInDom && issueInDom){
			if(exIssueValue != issueTarget.value){
				const commentPopup = document.getElementById("comment-popup");
				const timePopup = document.getElementById("time-popup");
				esegui(issueTarget.value,commentPopup,timePopup);
			}
			exIssueValue = issueTarget.value;
		}else if(issueTargetCategoryInDom){		
			if(exIssueCategoryValue!=issueTargetCategory.value){
				const timePopup = document.getElementById("time-0");
				const  commentPopup = document.getElementById("comment-0");

				esegui(issueTargetCategory.value,commentPopup,timePopup);
			}
			exIssueCategoryValue=issueTargetCategory.value;
		}
		if(!containerInDom || !issueInDom){
			exIssueValue = null;
		}

		if(!issueTargetCategoryInDom){
			exIssueCategoryValue = null;
		}	

	});

	observer.observe(document.body, {childList: true});

	//story
	//categoria board
	let issueStoryInDom = false;
	let exIssueStoryValue = null;

	if(document.getElementById('tempo-global-dialog-bundled')){
		const observer2 = new MutationObserver(function(mutations) {

			const issueStoryTarget = document.getElementById("issuePickerInput");
			if(document.contains(issueStoryTarget)){
				if(!issueStoryInDom){
					issueStoryInDom = true;
				}
			}else{
				issueStoryInDom = false;
			}

			if(issueStoryInDom){
				setTimeout(()=>{
				try{
					const text = document.getElementById("worklogForm").children[1].children[0].children[0].children[0].children[0].children[0].title;
						if(text && exIssueStoryValue!=text){

							const timePopup = document.getElementById("timeSpentSeconds");
							const commentPopup = document.getElementsByClassName("tuiTextField")[1];

							esegui(text.replace(": "," - "),commentPopup,timePopup);		
												}
						exIssueStoryValue=text;
				}catch(e){
					console.error(e);
				}

				},100);

			}else{
				exIssueStoryValue=null;
			}

		});
	
		observer2.observe(document.getElementById('tempo-global-dialog-bundled'), {attributes: true, childList: true,subtree: true  });
	}


	function esegui(issueTarget,commentPopup,timePopup){
		const nomeAttivita = issueTarget;
		const storia = nomeAttivita.substring(0,nomeAttivita.indexOf(" "));

		const first = nomeAttivita.indexOf("-");
		const second = nomeAttivita.indexOf("-",first+1);

		const titoloStoria = nomeAttivita.substring(second+2);

		const matchedStory = getStoryDefault(storia);

		if(document.getElementById("select-giratempo")){
			document.getElementById("select-giratempo").parentNode.removeChild(document.getElementById("select-giratempo"));
		}

		if(matchedStory){
			if(matchedStory.random){
				const randomStory = matchedStory.defaults[Math.floor(Math.random()*matchedStory.defaults.length) + 0];
				commentPopup.value = randomStory.description;
				if(randomStory.duration){
					timePopup.value = randomStory.duration;
				}else{
					timePopup.value = "";
				}
			}

			if(matchedStory.select){
				if(!document.getElementById("select-giratempo")){
					const newEl = document.createElement('select');

					newEl.id = "select-giratempo";
					newEl.style.display="block";
					newEl.style.width="200px";
					newEl.style.height="30px";
				   var opt = document.createElement('option');
						    opt.value = "|";
						    opt.innerHTML = "-----";
						    newEl.appendChild(opt);

					matchedStory.defaults.forEach((proposta)=>{
					    var opt = document.createElement('option');
							    opt.value = `${proposta.description}|${proposta.duration}`;
							    opt.innerHTML = proposta.description;
							    newEl.appendChild(opt);
					})
			


					commentPopup.parentNode.insertBefore(newEl, commentPopup);
			

					document.getElementById("select-giratempo").addEventListener("change",(event)=>{
							const defaultArray = document.getElementById("select-giratempo").value.split("|");
							commentPopup.value = defaultArray[0];

							if(defaultArray[1]){
								timePopup.value = defaultArray[1];
							}else{
								timePopup.value = "";
							}
							
					});
				}		
			}


		}else if(config.useTitle){
			commentPopup.value = titoloStoria;
		}

	}


}