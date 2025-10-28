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
	console.log(json)
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
			const targetId = sourceNode[sourceKey]
			console.log(targetId)

			
			targetMap[targetId][targetKey] = sourceNode[sourceKey]
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

	// create nodeMaps of arrays so they can be retrieved by their id
	let campMap = nodeMapById(campArray);
	let authorMap = nodeMapById(authorArray);
	let titleMap = nodeMapById(titleArray);
	let publisherMap = nodeMapById(publisherArray);

	// process titleMap	
	for (let x in titleMap) {
		const title = titleMap[x]
		
		nodeSurfaceNestedKey(title, "auteurs", "acf")
		nodeSurfaceNestedKey(title, "redacteuren", "acf")
		nodeSurfaceNestedKey(title, "vertalers", "acf")
		nodeSurfaceNestedKey(title, "bijdragen_auteurs", "acf")
		nodeSurfaceNestedKey(title, "bijdragen_vertalers", "acf")

		nodePullByValue(title, "uitgever", publisherMap)
		nodePullByValue(title, "auteurs", authorMap)
		nodePullByValue(title, "redacteuren", authorMap)
		nodePullByValue(title, "vertalers", authorMap)
		nodePullByValue(title, "bijdragen_auteurs", authorMap)
		nodePullByValue(title, "bijdragen_vertalers", authorMap)

	}

	console.log(campMap)
	// process campMap
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

		//

		

	}

	console.log(campMap)






	return


	// Iterate over titleArray and push into corresponding camp in campMap 
	for (let x in titleArray) {
		const title = titleArray[x]
		for (let y in title.kamp) {
			const campId = title.kamp[y]
			campMap[campId].posts.push(title);

		}

	}


	// Iterate over campArray and create tree in campMap (taking advantage of copy by reference)
	for (let i in campArray) {
		const camp = campArray[i]
		if (camp.parent !== 0) {
		    campMap[camp.parent].children.push(campMap[camp.id]);
		}
	}

	// Iterate over campArray and push items with no parent
	let treeArray = [];
	for (let i in campArray) {
		const camp = campArray[i]
		if (camp.parent === 0) {
			treeArray.push(campMap[camp.id])
		}
	}

	return treeArray;
}

function bibliographyFilter(treeArray) {

	filteredArray = []

	for (let i in treeArray) {
		filteredArray.push(treeArray[i].name)
	}

	return filteredArray


}

function renderFilteredArray(filteredArray) {

	let output = document.getElementById('bibliografieOutput')

	for (let i in filteredArray) {
		const item = filteredArray[i];
		let h1 = document.createElement("h1");
		h1.appendChild(document.createTextNode(item));

		output.appendChild(h1);

	}
}
