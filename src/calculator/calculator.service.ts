import { GoneException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calculation } from './model/calculation.entity';
import { NormalizationService } from 'src/normalization/normalization.service';
import { CreateCalculationDto } from './model/calculation.dto';

@Injectable()
export class CalculatorService {
    private readonly logger = new Logger(CalculatorService.name);
    constructor(
        @InjectRepository(Calculation)
        private readonly calculationRepository: Repository<Calculation>,
        private readonly normalizationService: NormalizationService,
    ) { }

    async calculate(data: CreateCalculationDto): Promise<any> {

        try {
            const { ancho, sentido: optSesgo, tallaBase: tallaBase, medidas, tallas } = data;

            let resultados = [];
            let detallesPorTalla = {};
            let infoMessage = '';

            const factorInicial = tallaBase;

            if (optSesgo == 2) {
                tallas.forEach((talla) => {
                    const factor = talla.value - factorInicial;
                    const sumaMedidas = medidas.reduce((acumulado, medida) => {
                        return acumulado + medida.value + (factor * medida.escala);
                    }, 0);

                    if (sumaMedidas <= 0) {
                        infoMessage = `Los resultados para las tallas que no se muestran son iguales o menores a 0.`;
                        return;
                    }

                    resultados.push({
                        label: `Consumo Talla ${talla.key}:`,
                        value: (sumaMedidas + sumaMedidas * 0.05).toFixed(2),
                        talla: talla.key,
                    });
                });

            } else {
                tallas.forEach((talla) => {
                    const factor = talla.value - factorInicial;
                    const medidasTalla = medidas.map(
                        (medida) => medida.value + (factor * medida.escala)
                    );

                    const medidaMaxima = Math.max(...medidasTalla);

                    if (medidaMaxima > ancho) {
                        infoMessage = `Los resultados para las tallas que no se muestran superan el ancho disponible.`;
                        return;
                    }

                    const medidaMinima = Math.min(...medidasTalla);

                    if (medidaMinima <= 0) {
                        infoMessage = `Las medidas para la talla ${talla.key} no pueden ser inferiores a 1.`;
                        return;
                    }

                    const consumoPorTalla = this.calculateConsumption(ancho, medidasTalla);

                    detallesPorTalla[talla.key] = consumoPorTalla;

                    resultados.push({
                        label: `Consumo Talla ${talla.key}:`,
                        value: consumoPorTalla.consumo.toFixed(2),
                        talla: talla.key,
                    });
                });
            }

            return { resultados, detallesPorTalla, infoMessage };

        } catch (error) {
            throw new GoneException(error.message);
        }
    }

    calculateConsumption(ancho: number, medidas: number[]) {
        medidas.sort((a, b) => b - a);
        const anchos: number[] = [];
        const mpAnchos: { [key: number]: number[] } = {};
        let pos = 0;

        medidas.forEach((medida) => {
            let colocada = false;
            pos = 0;

            anchos.forEach((anchoUsado, idx) => {
                pos++;
                if (!colocada && anchoUsado + medida <= ancho) {
                    anchos[idx] += medida;
                    if (!mpAnchos[pos]) {
                        mpAnchos[pos] = [];
                    }
                    mpAnchos[pos].push(medida);
                    colocada = true;
                }
            });

            if (!colocada) {
                pos++;
                anchos.push(medida);
                mpAnchos[pos] = [medida];
            }
        });

        let suma = 0;
        anchos.forEach((anchoUsado) => {
            const consumo = ancho * (1.0 / Math.floor(ancho / anchoUsado));
            suma += consumo;
        });

        return {
            consumo: suma,
            anchos,
            mpAnchos,
        };
    }

    async createCalculation(data: Calculation, username: string): Promise<Calculation> {
        try {
            const newCalculation = this.calculationRepository.create({
                ...data,
                createdBy: username,
            });
            return this.calculationRepository.save(newCalculation);
        } catch (error) {
            this.logger.error('Error in save calculate method', error.message, error.stack);
            throw error;
        }

    }

    async getAllCalculations(): Promise<Calculation[]> {
        return this.calculationRepository.find();
    }

    async getCalculationById(id: number): Promise<Calculation> {
        return this.calculationRepository.findOne({ where: { id } });
    }

    async getCalculationByGenerico(nroGenerico: string): Promise<Calculation> {
        const nroMuestra = await this.normalizationService.findMuestraByGenerico(nroGenerico);

        const calculation = await this.calculationRepository.findOne({ where: { nroMuestra } });

        if (!calculation) {
            throw new NotFoundException('No se encontró cálculo asociado a la muestra.');
        }

        return calculation;
    }
}
