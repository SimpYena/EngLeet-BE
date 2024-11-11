import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SectionContext } from "./section-context.entity";

@Entity('test_question')
export class TestQuestion {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=> SectionContext)
    @JoinColumn({name:'section_context_id', foreignKeyConstraintName: 'fk_context_question'})
    sectionContext: SectionContext

    @Column({type: 'json', nullable: false})
    answer: JSON

    @Column({nullable: false})
    correct_answer: string

    @Column({nullable: false})
    score: number
}   