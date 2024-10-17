import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccessToken } from './access-token.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => AccessToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'access_token_id',
    foreignKeyConstraintName: 'fk_access_token',
  })
  @Index('idx_access_token')
  access_token: AccessToken;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: false })
  expires_at: Date;
}
