import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('test_submitted')
export class TestSubmitted {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({"type":"json"})
    test: JSON;

    @Column({"type":"json"})
    answer: JSON;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_test' })
    user: User;
}