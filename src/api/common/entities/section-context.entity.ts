import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { TestQuestion } from './test-question.entity';

@Entity('section_context')
export class SectionContext {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Section)
  @JoinColumn({
    name: 'section_id',
    foreignKeyConstraintName: 'fk_section_context',
  })
  section: Section;

  @Column({ nullable: true })
  audio_link: string;

  @Column({ type: 'text', nullable: true })
  passage: string;

  @OneToMany(() => TestQuestion, (question) => question.sectionContext)
  question: TestQuestion;
}
