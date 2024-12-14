import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Test } from "./test.entity";

@Entity('test_submitted')
export class TestSubmitted {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({"type":"json"})
    history: JSON;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_test' })
    user: User;

    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id', foreignKeyConstraintName: 'fk_test_submitted' })
    test: Test;
}
