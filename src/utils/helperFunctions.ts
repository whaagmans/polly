export function getIndexesOfBiggestNumbersInArray(arr: number[]) {
	const max = Math.max(...arr);
	const indexes = [];

	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === max) {
			indexes.push(i);
		}
	}
	return indexes;
}
