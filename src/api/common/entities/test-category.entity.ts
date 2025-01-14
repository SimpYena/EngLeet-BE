import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Test } from './test.entity';

@Entity('category')
export class TestCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @OneToMany(() => Test, (test) => test.category)
  test: Test;
}
