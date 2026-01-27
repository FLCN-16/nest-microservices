import { Module } from '@nestjs/common';
import {
  ConsulModule,
  CommonGatewayAuthModule,
  TcpClientModule,
  CommonCaslModule,
} from '@the-falcon/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedResolver } from './feed.resolver';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    TcpClientModule.register(),
    CommonCaslModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ConsulModule.register({
      serviceName: 'feed',
      port: parseInt(process.env.PORT || '4002', 10),
      tcpPort: parseInt(process.env.TCP_PORT || '5002', 10),
      transport: 'tcp',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.FEED_DB_HOST || 'localhost',
      port: parseInt(process.env.FEED_DB_PORT || '5433'),
      username: process.env.FEED_DB_USER || 'feed_user',
      password: process.env.FEED_DB_PASSWORD || 'feed_password',
      database: process.env.FEED_DB_NAME || 'feed_db',
      entities: [Post],
      synchronize: true, // Auto-create tables (dev only)
    }),
    TypeOrmModule.forFeature([Post]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Generate schema in memory
      playground: false,
      introspection: true,
      csrfPrevention: false, // Allow local development access
    }),
    CommonGatewayAuthModule,
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedResolver],
})
// Rebuild trigger
export class FeedModule {}
