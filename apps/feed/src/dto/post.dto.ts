import { Exclude, Expose, Type } from 'class-transformer';

export class UserSummaryDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  // Masking private data by Excluding it by default
  // or explicitly excluding specific fields
  @Exclude()
  email: string;

  @Exclude()
  phoneNumber: string;

  constructor(partial: Partial<UserSummaryDto>) {
    Object.assign(this, partial);
  }
}

export class PostDto {
  @Expose()
  id: string;

  @Expose()
  caption: string;

  @Expose()
  imageUrl: string;

  @Expose()
  location: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserSummaryDto)
  author: UserSummaryDto;

  constructor(partial: Partial<PostDto>) {
    Object.assign(this, partial);
  }
}
