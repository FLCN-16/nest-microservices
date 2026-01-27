import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserSession } from './user-session.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionsRepository: Repository<UserSession>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'username',
        'displayName',
        'role',
        'birthday',
        'createdAt',
        'updatedAt',
      ], // Explicitly select password
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'displayName',
        'role',
        'birthday',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async createSession(
    user: User,
    token: string,
    deviceId: string,
  ): Promise<UserSession> {
    const session = this.userSessionsRepository.create({
      user,
      token,
      deviceId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    return this.userSessionsRepository.save(session);
  }

  async deleteSession(token: string): Promise<void> {
    await this.userSessionsRepository.delete({ token });
  }

  async findSession(token: string): Promise<UserSession | null> {
    return this.userSessionsRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }
}
