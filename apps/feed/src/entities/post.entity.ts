import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  caption: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  location: string;

  // Storing author details denormalized for performance (in a real app, this might be synced via events)
  @Column({ type: 'jsonb', nullable: true })
  authorDetails: {
    id: string;
    username: string;
    email: string; // Private data! Should be masked when sending to client
    phoneNumber: string; // Private data!
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
