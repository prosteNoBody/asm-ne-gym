import type { AsmCore, Vector } from "@core/types/AsmNeGym"

export class AsmNeGymError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AsmNeGymError";
    }
}

export const calculateOutputs = (phenotype: AsmCore, vector: typeof Vector, inputs: Array<number>): Array<number> => {
    // fill vector
    const vectorInputs = new vector();
    inputs.forEach(val => vectorInputs.push_back(val));

    // do calculations
    const vectorOutputs = phenotype.forward(vectorInputs);

    // convert vector to array
    const outputs: Array<number> = [];
    for (let i = 0; i < vectorOutputs.size(); i++) {
        outputs.push(vectorOutputs.get(i));
    }

    vectorInputs.delete();
    vectorOutputs.delete();

    return outputs;
}

export const generateRandomSeed = (length: number): string => {
    const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++)
        result += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));

    return result;
}