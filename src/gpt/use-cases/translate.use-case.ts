import OpenAI from "openai";
import { TranslateDto } from "../dtos";


export const translateUseCase = async (openai: OpenAI, {prompt, lang}: TranslateDto)  => {

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `Traduce el siguiente texto al idioma ${lang}:${ prompt }`
            }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        //max_tokens: 100
    });

    const jsonResp = completion.choices[0].message;
    
    return jsonResp;
}