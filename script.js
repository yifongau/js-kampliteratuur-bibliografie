const url = "https://kampliteratuur.nl/wp-json/wp/v2/"

// Main
const bibliographyPage = async (url) => {

	// fetch data
	const campArray = await getPagedItems(url + "kamp?per_page=100");
	const authorArray = await getPagedItems(url + "auteur?per_page=100");
	const titleArray = await getPagedItems(url + "bib-titel?per_page=100");
	const publisherArray = await getPagedItems(url + "uitgever?per_page=100");

	// build treeArray
	renderFilteredArray(bibliographyFilter(campDataSet(campArray, authorArray, titleArray, publisherArray)));

}


bibliographyPage(url)


// Functions

async function getPagedItems(url) {
	const response = await fetch(url);
	const json = await response.json();
	return json
}


function nodeMapById(array) {
	nodeMap = {};
	for (let i in array) {
		const item = array[i];
		nodeMap[item.id] = { ...item };
	}
	return nodeMap
}


function nodePullByValue(sourceNode, sourceKey, targetMap) {
		for (let x in sourceNode[sourceKey]) {
			const targetId = sourceNode[sourceKey][x]
			sourceNode[sourceKey][x] = targetMap[targetId];		
		}
}

function nodePushIntoTargetKeyByValue(sourceNode, sourceKey, targetMap, targetKey) {
			const targetIds = sourceNode[sourceKey]

			for (let x in targetIds) {
				let targetId = targetIds[x]
				if (! Object.hasOwn(targetMap[targetId], targetKey)) {
					nodeAddKey(targetMap[targetId], targetKey, [])
				}

				targetMap[targetId][targetKey].push(sourceNode);
			}
}

function nodeAddKey(node, key, value) {
		Object.defineProperty(node, key, {value: value})
}

function nodeSurfaceNestedKey(node, key, parentKey) {
		const nestedKey = node[parentKey][key];
		Object.defineProperty(node, key, {value: nestedKey})
}


// The is the big function
function campDataSet(campArray, authorArray, titleArray, publisherArray) {

	let campDataSet = [];

	// create nodeMaps of arrays so they can be retrieved by their id
	let campMap = nodeMapById(campArray);
	let authorMap = nodeMapById(authorArray);
	let titleMap = nodeMapById(titleArray);
	let publisherMap = nodeMapById(publisherArray);

	// process titleMap	
	for (let x in titleMap) {
		const title = titleMap[x]
	
		// add keys to titles
		nodeSurfaceNestedKey(title, "auteurs", "acf")
		nodeSurfaceNestedKey(title, "redacteuren", "acf")
		nodeSurfaceNestedKey(title, "vertalers", "acf")
		nodeSurfaceNestedKey(title, "bijdragen_auteurs", "acf")
		nodeSurfaceNestedKey(title, "bijdragen_vertalers", "acf")
		nodeSurfaceNestedKey(title, "titelinformatie", "acf")

		// populate keys in titles
		nodePullByValue(title, "auteurs", authorMap)
		nodePullByValue(title, "redacteuren", authorMap)
		nodePullByValue(title, "vertalers", authorMap)
		nodePullByValue(title, "bijdragen_auteurs", authorMap)
		nodePullByValue(title, "bijdragen_vertalers", authorMap)
		nodePullByValue(title, "uitgever", publisherMap)

		// push titles into camps
		nodePushIntoTargetKeyByValue(title, "kamp", campMap, "titles")

	}

	// make tree of camp parents and children
	for (let x in campMap) {
		const camp = campMap[x]

		// add children to parents
		if (camp.parent !== 0) {
			const parent = campMap[camp.parent];
			if (! Object.hasOwn(parent, 'children')) {
				nodeAddKey(parent, "children", [])
			}
			campMap[camp.parent].children.push(camp);
		}

		// if it has no parents push it into the variable that will be returned
		// this will work because of copy-by-reference
		else {
			campDataSet.push(campMap[camp.id])
		}

	}

	return campDataSet;
}

function bibliographyFilter(dataSet) {

	bibliography = []

	for (let x in dataSet) {
		let dataNode = dataSet[x]
		console.log(dataNode)

		let object = { name: dataNode.name, titles: [] }

		for (let y in dataNode.titles) {
			let title = dataNode.titles[y];

			// CREATORS
			let m = [ title.auteurs, title.redacteuren, title.vertalers, title.bijdragen_auteurs, title.bijdragen_vertalers ]

			// if has author
			if (m[0]]) {

				if (!m[1] && !m[2]) {

				}
				// Set creatorString and extraCreatorString
				else if (m[1] && !m[2]) {
				}

				else if (m[1] && m[2]) {
				}

			}

			// if has no author
			else if (!m[0]) {
				if (!m[1] && !m[2]) {

				}
				// Set creatorString and extraCreatorString
				else if (m[1] && !m[2]) {
				}

				else if (m[1] && m[2]) {
				}
			}





				
				

			

			
			// NAME OF WORK
			let titleName = title.titelinformatie;
			let pubData = title.titelinformatie.publicatiedata;
			let nameString
			titleName.ondertitel ? 
				nameString = titleName.titel.trim() + ": " + titleName.ondertitel : 
				nameString = titleName.titel

			//  PUBLISHING INFO
			let titlePubInfo = title.uitgever[0];
			let PubInfo = `${pubData.plaats_van_publicatie}: ${titlePubInfo.name}, ${pubData.jaar_van_publicatie}.`



			// COMPOSING BIBTITLE
			let titleString = nameString + ". " + PubInfo
			console.log(titleString)
			object.titles.push(titleString);
		}
		bibliography.push(object);

		
	}

	return bibliography
}

function renderFilteredArray(bibliography) {

	let output = document.getElementById('bibliografieOutput')

	for (let x in bibliography) {
		const header = bibliography[x].name;
		let h1 = document.createElement("h1");
		h1.appendChild(document.createTextNode(header));
		output.appendChild(h1);

		for (let y in bibliography[x].titles) {
			const title = bibliography[x].titles[y];
			let p = document.createElement("p")
			p.appendChild(document.createTextNode(title));
			output.appendChild(p);
		}

	}


}

