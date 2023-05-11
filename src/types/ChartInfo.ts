function setDynamicFields(labels: string[]): Field {
	const fields = [];
	const emojiArr: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

	for (let i = 0; i < labels.length; i++) {
		fields.push({
			name: `${emojiArr[i]}  ${labels[i]}`,
			value: `\u200b`,
		});
	}
	return fields;
}

function setChartLabels(amount: number) {
	const numberArray = ['1', '2', '3', '4', '5'];
	const removeAmount = 5 - amount;
	numberArray.splice(-removeAmount, removeAmount);
	return numberArray;
}

class ChartInfo {
	constructor(
		pollName: string,
		labels: string[],
		data: number[],
		colors: string[],
		createdByUser: string
	) {
		this.pollName = pollName;
		this.chartLabels = setChartLabels(labels.length);
		this.labels = labels;
		this.data = data;
		this.colors = colors;
		this.title = pollName;
		this.description = `${this.totalVotes} votes`;
		this.fields = setDynamicFields(labels);
		this.createdByUser = createdByUser;
	}
	pollName: string;
	chartLabels: string[];
	labels: string[];
	data: number[];
	colors: string[];
	title: string;
	description: string;
	totalVotes = 0;
	fields: Field;
	readonly createdByUser: string;
}

type Field = {
	name: string;
	value: string;
}[];

export { ChartInfo };
