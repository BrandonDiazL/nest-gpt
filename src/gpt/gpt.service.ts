import * as path from 'path';
import * as fs from "fs";

import { Injectable, NotFoundException } from '@nestjs/common';
import { audioToTextUseCase, imageGenerationUseCase, imageVariationUseCase, orthographyCheckUseCase, prosConsDicusserStreamUseCase, prosConsDicusserUseCase, textToAudioUseCase, translateUseCase } from './use-cases';
import { AudioToTextDto, ImageGenerationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto } from './dtos';
import OpenAI from 'openai';
import { TranslateDto } from './dtos/translate.dto';
import { ImageVariationDto } from './dtos/image-variation.dto';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    async orthographyCheck(orthographyDto: OrthographyDto){
        return await orthographyCheckUseCase(this.openai, {
            prompt: orthographyDto.prompt
        });
    }

    async prosConsDicusser({ prompt }: ProsConsDiscusserDto){
        return await prosConsDicusserUseCase(this.openai, {prompt});
    }

    async prosConsDicusserStream({ prompt }: ProsConsDiscusserDto){
        return await prosConsDicusserStreamUseCase(this.openai, {prompt});
    }

    async translate(translateDto: TranslateDto){
        return await translateUseCase(this.openai, translateDto);
    }

    async textToAudio({prompt, voice}: TextToAudioDto){
        return await textToAudioUseCase(this.openai, {prompt, voice});
    }

    async textToAudioGetter(fileId: number){
        const folderPath = path.resolve(__dirname, '../../generated/audios/');
        const speechFile =path.resolve(`${folderPath}/${fileId}.mp3`);

        const wasFound = fs.existsSync(speechFile);

        if(!wasFound) throw new NotFoundException(`File ${fileId} not found`);

        return speechFile;
    }

    async audioToText(audioFile: Express.Multer.File, audioToTextDto: AudioToTextDto){
        return await audioToTextUseCase(this.openai, {prompt: audioToTextDto.prompt, audioFile });
    }

    async imageGeneration({prompt, maskImage, originalImage}: ImageGenerationDto){
        return await imageGenerationUseCase(this.openai, {prompt, maskImage, originalImage});
    }

    async imageGenerationFile(fileName: string){
        const folderPath = path.resolve(__dirname, '../../generated/images/');
        const speechFile =path.resolve(`${folderPath}/${fileName}`);

        const wasFound = fs.existsSync(speechFile);

        if(!wasFound) throw new NotFoundException(`File ${fileName} not found`);

        return speechFile;
    }

    async imageVariation({baseImage}: ImageVariationDto){
        return imageVariationUseCase(this.openai, {baseImage});
    }
}
