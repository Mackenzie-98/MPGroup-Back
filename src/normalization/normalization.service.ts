import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Normalization } from './model/normalization.entity';

@Injectable()
export class NormalizationService {
    constructor(
        @InjectRepository(Normalization)
        private readonly normalizationRepository: Repository<Normalization>,
    ) { }

    async createNormalization(
        data: { nroMuestra: string, nroGenerico: string, overwrite?: boolean },
        username: string
    ): Promise<Normalization> {
        const { nroMuestra, nroGenerico, overwrite = false } = data;

        const existingSample = await this.normalizationRepository.findOne({ where: { nroMuestra } });
        if (existingSample) {
            if (existingSample.nroGenerico !== nroGenerico) {
                if (overwrite) {
                    existingSample.nroGenerico = nroGenerico;
                    existingSample.createdBy = username;
                    return this.normalizationRepository.save(existingSample);
                } else {
                    throw new ConflictException(`El Nro. de Muestra ${nroMuestra} está relacionado con el Nro. Genérico ${existingSample.nroGenerico}`);
                }
            } else {
                return existingSample;
            }
        }

        const newNormalization = this.normalizationRepository.create({
            nroMuestra,
            nroGenerico,
            createdBy: username
        });

        return this.normalizationRepository.save(newNormalization);
    }

    async getAllNormalizations(): Promise<Normalization[]> {
        return this.normalizationRepository.find();
    }

    async getNormalizationById(id: number): Promise<Normalization> {
        return this.normalizationRepository.findOne({ where: { id } });
    }

    async findMuestraByGenerico(nroGenerico: string): Promise<string> {
        const normalization = await this.normalizationRepository.findOne({ where: { nroGenerico } });

        if (!normalization) {
            throw new NotFoundException('Genérico no encontrado en la tabla normalization.');
        }

        return normalization.nroMuestra;
    }
}
