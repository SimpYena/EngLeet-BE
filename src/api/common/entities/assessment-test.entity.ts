import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('assessment_test')
export class AssessmentTest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "json"})
    test: JSON;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_assessment' })
    user: User;
}