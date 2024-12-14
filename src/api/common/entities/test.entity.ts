import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { Difficulty } from '../enum/difficulty.enum';
import { TestCategory } from './test-category.entity';
import { TestSubmitted } from './test-submitted.entity';

@Entity('test')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => TestCategory)
  @JoinColumn({ name: 'category_id', foreignKeyConstraintName: 'fk_category_test' })
  category: TestCategory

  @Column({ nullable: false })
  difficulty: Difficulty;

  @Column({ nullable: false })
  acceptance: number;

  @Column({nullable: false})
  image_url: string;

  @CreateDateColumn({ nullable: false })
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(() => Section, (section) => section.test)
  section: Section;

  @OneToMany(() => TestSubmitted, (testSubmitted) => testSubmitted.test)
  testSubmitted: TestSubmitted;
}
