// src/cut-section/cut-section.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutSectionService } from './cut-section.service';
import { CutSectionController } from './cut-section.controller';
import { Recalculation } from './model/recalculation.entity';
import { Calculation } from '../calculator/model/calculation.entity';
import { CalculatorModule } from 'src/calculator/calculator.module';

@Module({
    imports: [TypeOrmModule.forFeature([Recalculation, Calculation]), CalculatorModule],
    controllers: [CutSectionController],
    providers: [CutSectionService],
})
export class CutSectionModule { }
