import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column({ default: false })
  isSubscribed: boolean;
  @Column({ nullable: true })
  city: string;

}
