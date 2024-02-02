import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AudioToTextDto, ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage} from 'multer';
import { Guid } from 'guid-typescript';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(@Body() orthographyDto:OrthographyDto){
    return this.gptService.orthographyCheck({prompt: orthographyDto.prompt});
  }

  @Post('pros-cons-discusser')
  prosConsDicusser(@Body() prosConsDiscusserDto:ProsConsDiscusserDto){
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDicusserStream(@Body() prosConsDiscusserDto:ProsConsDiscusserDto, @Res() res: Response){

    const stream = await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await( const chunk of stream){
      const piece = chunk.choices[0].delta.content || '';
      //console.log(piece);
      res.write(piece);
    }

    res.end();
  }

  @Post('translate')
  translate(@Body() translateDto:TranslateDto){
    return this.gptService.translate(translateDto);
  }

  @Post('text-to-audio')
  async textToAudio(@Body() textToAudioDto: TextToAudioDto, @Res() res: Response){
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader('Content-Type','audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }


  @Get('text-to-audio/:fileId')
  async textToAudioFile(@Res() res: Response, @Param('fileId') fileId: number){

    const speechFile = await this.gptService.textToAudioGetter(fileId);

    res.setHeader('Content-Type','audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(speechFile);
  }

  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${Guid.create()}.${fileExtension}`;
          return callback(null, fileName);
        }
      })
    })
  )
  async audioToText( @UploadedFile( new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1000 * 1024 * 5, message: 'File is biiger than 5 mb'}),
      new FileTypeValidator({fileType: 'audio/*'})
    ]
  })) file: Express.Multer.File, @Body() audioToTextDto: AudioToTextDto){
    return this.gptService.audioToText(file, audioToTextDto);
  }

  @Post('image-generation')
  async imageGeneration(@Body() imageGenerationDto: ImageGenerationDto){
    //console.log(imageGenerationDto);
    return await this.gptService.imageGeneration(imageGenerationDto)
  }

  @Get('image-generation/:fileName')
  async imageGenerationFile(@Res() res: Response, @Param('fileName') fileName: string){

    const speechFile = await this.gptService.imageGenerationFile(fileName);

    res.setHeader('Content-Type','image/png');
    res.status(HttpStatus.OK);
    res.sendFile(speechFile);
  }

  @Post('image-variation')
  async imageVariation(@Body() imageVariationDto: ImageVariationDto){
    //console.log(imageGenerationDto);
    return await this.gptService.imageVariation(imageVariationDto)
  }
}
