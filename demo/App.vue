<script lang="ts" setup>
import { onMounted, computed, ref, reactive, unref } from "vue";
import { AsmNeGym } from "@core/AsmNeGym";

const delay = async (time: number) => new Promise(resolve => setTimeout(resolve, time));

const canvas = ref<HTMLCanvasElement | null>(null);

const buttonStyle = "py-1 px-2 rounded-full bg-gray-300 border-2 border-gray-600 active:border-gray-1000"

const algorithmOptions = computed(() => ["CNE", "NEAT"]);
const moduleOptions = computed(() => ["flappy", "race"]);

const selectedAlgorithm = ref(algorithmOptions.value[0]);
const selectedModule = ref(moduleOptions.value[0]);

const activeAlgorithm = ref(selectedAlgorithm.value);
const activeModule = ref(selectedModule.value)

const hyperparameters = reactive({ population: 100, mutation: 0.05 });
const activeHyperparameters = reactive({ population: hyperparameters.population, mutation: hyperparameters.mutation });
const getInputOutputNeuronsSize = () => {
    switch (activeModule.value) {
        case "flappy": return [5, 1];
        case "race": return [11, 4];
        default: throw new Error("Unknown input/output neuron size for this module");
    }
};
const getNetworkSize = () => {
    switch (activeAlgorithm.value) {
        case "CNE": return [5, 2];
        case "NEAT": return [];
        default: throw new Error("Unknown netwrok size for this algorithm");
    }
}

const asmNeGym = new AsmNeGym(activeModule.value, activeAlgorithm.value, [
        ...getInputOutputNeuronsSize(),
        activeHyperparameters.population,
        activeHyperparameters.mutation,
        ...getNetworkSize()
    ]);
const bestGenome = ref("");
const bestGenomeFitness = ref(-1);
const lastGenome = ref("");
const lastGenomeFitness = ref(-1);
const population = ref("");
const numOfGeneration = ref(0);

const setNewConfiguration = () => {
    if (trainingRunning.value) return;
    // Set new values
    activeAlgorithm.value = selectedAlgorithm.value;
    activeModule.value = selectedModule.value;
    activeHyperparameters.population = hyperparameters.population;
    activeHyperparameters.mutation = hyperparameters.mutation;

    // apply them to AsmNeGym
    asmNeGym.setAlgorithm(activeAlgorithm.value);
    asmNeGym.setModule(activeModule.value);
    asmNeGym.setPopulation("");
    asmNeGym.clearFitnessHistory();
    asmNeGym.setHyperparameters([
        ...getInputOutputNeuronsSize(),
        activeHyperparameters.population,
        activeHyperparameters.mutation,
        ...getNetworkSize()
    ]);
};

let goingToStop = ref(true);
let trainingRunning = ref(false);
const stopTrain = () => {
    goingToStop.value = true;
}
const startTrain = async () => {
    trainingRunning.value = true;
    goingToStop.value = false;
    if (!asmNeGym.getPopulation()) await asmNeGym.train({ iterations: 1 });

    // start train process while lastGenome simulation is running
    const trainPromise = asmNeGym.train({ time: 3600000 });
    while (!goingToStop.value) {
        // run best genome
        await asmNeGym.runLastGenome(canvas.value!);

        // update chart, population and best genome
        updateChart(populationCrossSection(asmNeGym.getFitnessHistory(), 9));

        bestGenome.value = asmNeGym.getBestGenome().genome;
        bestGenomeFitness.value = asmNeGym.getBestGenome().fitness;

        lastGenome.value = asmNeGym.getLastGenome().genome;
        lastGenomeFitness.value = asmNeGym.getLastGenome().fitness;

        population.value = asmNeGym.getPopulation();
        numOfGeneration.value = asmNeGym.getFitnessHistory().length;

        await delay(200);
    }
    asmNeGym.forceStop();
    await trainPromise;
    trainingRunning.value = false;

    // update population / best genome
    bestGenome.value = asmNeGym.getBestGenome().genome;
    bestGenomeFitness.value = asmNeGym.getBestGenome().fitness;

    lastGenome.value = asmNeGym.getLastGenome().genome;
    lastGenomeFitness.value = asmNeGym.getLastGenome().fitness;

    population.value = asmNeGym.getPopulation();
    numOfGeneration.value = asmNeGym.getFitnessHistory().length;
};

const genomeRun = ref(false);
const runBestGenome = async () => {
    genomeRun.value = true;
    if (!asmNeGym.getPopulation()) await asmNeGym.train({ iterations: 1 });
    await asmNeGym.runBestGenome(canvas.value!);
    genomeRun.value = false;
};

// chart generation
const chartCtx = ref<HTMLCanvasElement | null>(null);
// @ts-ignore
let chart;
onMounted(() => {
    // @ts-ignore
    chart = new Chart(chartCtx.value, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Population fitness history',
                data: [],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
const populationCrossSection = (population: Array<number>, size:number) => {
    if (population.length <= size) return population.map((item, index) => ({ fitness: item, index }));

    const last = { fitness: population[population.length - 1], index: population.length - 1 };
    size--;
    const step = Math.floor((population.length - 1) / size);

    const result: Array<{ fitness: number, index: number }> = [];
    for (let i = 0; i < population.length; i += step) {
        result.push({ fitness: population[i], index: i });
    }
    result.push(last);
    return result;
}
const updateChart = (populationHistory: Array<{ fitness: number, index: number }>) => {
    // @ts-ignore
    chart.data.datasets[0].data = populationHistory.map(item => item.fitness);
    // @ts-ignore
    chart.data.labels = populationHistory.map(item => item.index);
    // @ts-ignore
    chart.update();
};

// set population
const importPopulation = ref("");
const setPopulation = () => {
    asmNeGym.setPopulation(importPopulation.value);
}

// run single genome
const importedGenome = ref("");
const runImportedGenome = async () => {
    genomeRun.value = true;
    await asmNeGym.runGenome(importedGenome.value, canvas.value!);
    genomeRun.value = false;
};

const selectContent = (event: InputEvent) => {
    if (event.target instanceof HTMLTextAreaElement) {
        event.target.select();
    }
}
</script>

<template>
        <div class="text-red-400 text-xs absolute">DISCLAIMER: bugs may appear, if that happens, restart page</div>
    <div class="flex flex-col gap-y-4 p-4 w-full min-h-screen bg-green-200">
        <div class="flex gap-x-6">
            <canvas ref="canvas" class="border-4 border-black bg-white" style="width: 600px; height: 600px;" width="600" height="600"></canvas>
            <div class="flex flex-col">
                <!-- Population fitness history chart -->
                <canvas ref="chartCtx" class="max-w-96 mb-12" />
                
                <!-- Data -->
                <div>
                    <p class="font-bold">Generation:</p> {{ numOfGeneration }}
                </div>

                <!-- export population / best genome -->
                <div class="flex-col">
                    <div class="font-semibold">Best genome ({{ bestGenomeFitness }}):</div>
                    <textarea class="text-gray-700 select-all max-w-44 text-wrap" v-model="bestGenome" @click="selectContent" />
                    <div class="font-semibold">Last genome ({{ lastGenomeFitness }}):</div>
                    <textarea class="text-gray-700 select-all max-w-44 text-wrap" v-model="lastGenome" @click="selectContent" />
                    <div class="font-semibold">Population:</div>
                    <textarea class="text-gray-700 select-all max-w-44 text-wrap" v-model="population" @click="selectContent"/>
                </div>
            </div>
        </div>
        <!-- CONTROL PANEL -->
        <div class="flex gap-x-6 items-start">
            <div class="flex flex-col gap-y-2">
                <button
                    :class="[buttonStyle, trainingRunning || genomeRun ? 'opacity-50' : 'hover:bg-gray-500']"
                    :disabled="trainingRunning || genomeRun"
                    @click=startTrain()
                >
                    Train
                </button>
                <button :class="[buttonStyle, goingToStop || !trainingRunning ? 'opacity-50' : 'hover:bg-gray-500']" :disabled="genomeRun" @click="stopTrain()">Stop next iteration</button>
                <button
                    :class="[buttonStyle, trainingRunning || genomeRun ? 'opacity-50' : 'hover:bg-gray-500']"
                    :disabled="trainingRunning || genomeRun"
                    @click="runBestGenome()"
                >
                        Run best genome
                </button>
            </div>

            <!-- Active configuration -->
            <div clas="flex flex-col">
                <div class="font-bold mb-4">Actual setup:</div>
                <div><p class="font-bold">Algorithm: </p>{{ activeAlgorithm }}</div>
                <div><p class="font-bold">Algorithm: </p>{{ activeModule }}</div>
                <div class="font-bold mt-4">Hyperparameters</div>
                <div><p class="font-semibold">Population: </p>{{ activeHyperparameters.population }}</div>
                <div><p class="font-semibold">Mutation: </p>{{ activeHyperparameters.mutation }}</div>
            </div>

            <!-- Configuration control -->
            <div class="flex flex-col gap-y-2">
                <button :class="[buttonStyle, trainingRunning || genomeRun ? 'opacity-50' : 'hover:bg-gray-500']" :disabled="trainingRunning || genomeRun" @click="setNewConfiguration">
                    Apply new configuration
                </button>
                <div class="flex flex-col">
                    Algorithm
                    <select v-model="selectedAlgorithm">
                        <option v-for="algorithm in algorithmOptions" :key="algorithm" :value="algorithm">
                            {{ algorithm }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col">
                    Module
                    <select v-model="selectedModule">
                        <option v-for="asmModule in moduleOptions" :key="asmModule" :value="asmModule">
                            {{ asmModule }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col gap-y-2">
                    <div class="font-bold">Hyperparameters</div>
                    <div class="flex gap-x-10">Population: <input type="number" v-model="hyperparameters.population"></div>
                    <div class="flex gap-x-10">Mutation: <input type="number" step="0.01" min="0" max="1" v-model="hyperparameters.mutation"></div>
                </div>
            </div>

            <!-- Export best genome / population -->
            <div class="flex flex-col gap-y-2">
                <div class="font-semibold">Genome:</div>
                <textarea class="text-gray-700 select-all max-w-44 text-wrap" v-model="importedGenome" />
                <button
                    class="mb-6"
                    :class="[buttonStyle, trainingRunning || genomeRun ? 'opacity-50' : 'hover:bg-gray-500']"
                    :disabled="trainingRunning || genomeRun"
                    @click="runImportedGenome()"
                >
                        Run genome
                </button>
                <div class="font-semibold">Population:</div>
                <textarea class="text-gray-700 select-all max-w-44 text-wrap" v-model="importPopulation"/>
                <button
                    :class="[buttonStyle, trainingRunning || genomeRun ? 'opacity-50' : 'hover:bg-gray-500']"
                    :disabled="trainingRunning || genomeRun"
                    @click="setPopulation()"
                >
                        Set population
                </button>
            </div>
        </div>
    </div>
</template>