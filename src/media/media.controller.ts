import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  CreateMediaDto,
  MediaIdParamDto,
  UpdateMediaDto,
} from './dto/media.schemas';
import {
  createMediaSchema,
  mediaIdParamSchema,
  updateMediaSchema,
} from './dto/media.schemas';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(mediaIdParamSchema))
  findById(@Param() params: MediaIdParamDto) {
    return this.mediaService.findById(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createMediaSchema))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMediaDto,
  ) {
    return this.mediaService.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(mediaIdParamSchema))
  @UsePipes(new ZodValidationPipe(updateMediaSchema))
  update(
    @Param() params: MediaIdParamDto,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(params.id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(mediaIdParamSchema))
  remove(
    @Param() params: MediaIdParamDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.mediaService.remove(params.id, user.userId);
  }
}
