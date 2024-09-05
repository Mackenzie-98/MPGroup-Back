import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NormalizationService } from './normalization.service';
import { NormalizationController } from './normalization.controller';
import { Normalization } from './model/normalization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Normalization])],
    controllers: [NormalizationController],
    providers: [NormalizationService],
    exports: [NormalizationService],
})
export class NormalizationModule { }
