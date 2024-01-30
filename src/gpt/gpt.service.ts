import { Injectable } from '@nestjs/common';
import { orthographyCheckUseCase } from './use-cases';
import { OrthographyDto } from './dtos';

@Injectable()
export class GptService {

    async orthographyCheck(orthographyDto: OrthographyDto){
        return await orthographyCheckUseCase({
            prompt: orthographyDto.prompt
        });
    }
}
