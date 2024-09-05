import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';
import { Calculation } from './model/calculation.entity';
import { NormalizationModule } from 'src/normalization/normalization.module';

@Module({
    imports: [TypeOrmModule.forFeature([Calculation]), NormalizationModule],
    controllers: [CalculatorController],
    providers: [CalculatorService],
    exports: [CalculatorService]
})
export class CalculatorModule { }
