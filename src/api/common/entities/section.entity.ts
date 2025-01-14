import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Test } from './test.entity';
import { SectionContext } from './section-context.entity';

@Entity('section')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id', foreignKeyConstraintName: 'fk_test_section' })
  test: Test;

  @Column({nullable: false})
  type: string;

  @Column({nullable: false})
  title: string;

  @OneToMany(() => SectionContext, (context) => context.section)
  sectionContext: SectionContext;
}
