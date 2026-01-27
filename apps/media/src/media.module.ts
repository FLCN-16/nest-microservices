import { Module } from '@nestjs/common';
import { ConsulModule, CommonGatewayAuthModule } from '@the-falcon/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ConsulModule.register({
      serviceName: 'media',
      port: parseInt(process.env.PORT || '4003', 10),
      tcpPort: parseInt(process.env.TCP_PORT || '5003', 10),
      transport: 'tcp',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Generate schema in memory
      playground: false,
      introspection: true,
      csrfPrevention: false, // Allow local development access
    }),
    CommonGatewayAuthModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaResolver],
})
export class MediaModule {}
