// src/cut-section/cut-section.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recalculation } from './model/recalculation.entity';
import { Calculation } from '../calculator/model/calculation.entity';
import { CalculatorService } from 'src/calculator/calculator.service';
import { CreateCalculationDto } from 'src/calculator/model/calculation.dto';

@Injectable()
export class CutSectionService {
    constructor(
        @InjectRepository(Recalculation)
        private readonly recalculationRepository: Repository<Recalculation>,
        @InjectRepository(Calculation)
        private readonly calculationRepository: Repository<Calculation>,
        private readonly calculatorService: CalculatorService,
    ) { }

    async validateCut(nroGenerico: string, nroOrden: string, nuevoAncho: number) {
        const calculation = await this.calculationRepository.findOne({ where: { nroMuestra: nroGenerico } });

        if (!calculation) {
            throw new NotFoundException('El número de genérico digitado no existe.');
        }

        if (calculation.ancho === nuevoAncho) {
            return { isValid: true, message: 'El ancho corresponde con el calculado por ingeniería.' };
        } else {
            return { recalculate: true, message: 'El ancho no coincide con el calculado por ingeniería. ¿Desea recalcular el consumo?' };
        }
    }

    async recalculateCut(
        nroGenerico: string,
        nroOrden: string,
        nuevoAncho: number,
        user: string
    ): Promise<any> {
        try {
            const calculation = await this.calculatorService.getCalculationByGenerico(nroGenerico);

            if (!calculation) {
                throw new NotFoundException('No se encontró cálculo para el genérico proporcionado.');
            }

            // Validar la existencia de medidas y resultados
            if (!calculation.medidas || calculation.medidas.length === 0) {
                throw new Error('Datos de cálculo incompletos o medidas no encontradas.');
            }

            // Convertir los detalles al tipo esperado por CreateCalculationDto
            const detallesConvertidos = Object.entries(calculation.detalles).map(([key, detalle]) => ({
                consumo: detalle.consumo,
                anchos: detalle.anchos,
                mpAnchos: detalle.mpAnchos
            }));

            // Crear una copia del cálculo existente con el nuevo ancho y detalles convertidos
            const updatedCalculation: CreateCalculationDto = {
                ...calculation,
                ancho: nuevoAncho,
                tallas: calculation.tallas,
                detalles: detallesConvertidos,
                createdBy: user
            };

            // Recalcular los resultados con el nuevo ancho
            const recalculatedResult = await this.calculatorService.calculate(updatedCalculation);

            // Crear un nuevo registro de recalculación
            const recalculation = this.recalculationRepository.create({
                nroGenerico,
                nroOrden,
                nuevoAncho,
                resultados: recalculatedResult.resultados,
                createdBy: user
            });

            // Guardar la recalculación en la base de datos
            await this.recalculationRepository.save(recalculation);

            return { success: true, message: 'Recalculation saved successfully', recalculation };
        } catch (error) {
            // Manejar errores y proporcionar retroalimentación
            console.error('Error during recalculation:', error);
            throw new Error('Ocurrió un error al recalcular el corte.');
        }
    }

}
