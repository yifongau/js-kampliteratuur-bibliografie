const url = "https://kampliteratuur.nl/wp-json/wp/v2/"

// Main function
const bibliographyPage = async (url) => {

	// fetch data
	const campArray = await getPagedItems(url + "kamp?per_page=100");
	const authorArray = await getPagedItems(url + "auteur?per_page=100");
	const titleArray = await getPagedItems(url + "bib-titel?per_page=100");
	const publisherArray = await getPagedItems(url + "uitgever?per_page=100");

	// build treeArray
	renderFilteredArray(bibliographyFilter(buildCampTree(campArray, authorArray, titleArray, publisherArray)));

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

function buildCampTree(campArray, authorArray, titleArray) {

	// Construct campMap for accessing item.parent as key

	let campMap = nodeMapById(campArray);
	let authorMap = nodeMapById(authorArray);
	let titleMap = nodeMapById(titleArray);

	arrayById(key)

	// Iterate over titleArray and push into corresponding camp in campMap 
	for (let x in titleArray) {
		const title = titleArray[x]
		for (let y in title.kamp) {
			const campId = title.kamp[y]
			campMap[campId].posts.push(title);

		}

	}

	for (let x in 

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

	console.log(treeArray);
	return treeArray;
}

function bibliographyFilter(treeArray) {

	filteredArray = []

	for (let i in treeArray) {
		filteredArray.push(treeArray[i].name)
	}

	console.log(filteredArray)
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
