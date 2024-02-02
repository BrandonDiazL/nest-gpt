import OpenAI from "openai";

interface Options{
    threadId:string;
    assistantId?:string;
}
export const createRunUseCase = async(openai: OpenAI, options: Options) => {

    const {threadId, assistantId='asst_MLV190D1FX0lFLXz0XpZBodq'} = options;

    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        //instrucciones: sobreescribe al assistente
    });

    return run;
}