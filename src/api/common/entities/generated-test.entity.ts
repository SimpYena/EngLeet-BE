import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Type } from "../enum/type.enum";
@Entity('generated_test')
export class GeneratedTest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @Column({type: "json"})
    content: JSON;

    @Column({nullable: false})
    type: Type;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_generated' })
    user: User;
}