import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('recalculo_corte')
export class Recalculation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nroGenerico: string;

    @Column()
    nroOrden: string;

    @Column()
    nuevoAncho: number;

    @Column('jsonb')
    resultados: { label: string; value: string; talla: string }[];

    @Column()
    createdBy: string;

    @CreateDateColumn({ type: 'timestamp' })
    dateCreated: Date;
}
