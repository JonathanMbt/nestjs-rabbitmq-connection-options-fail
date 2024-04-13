import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { credentials, connect } from 'amqplib';
import amqp from 'amqp-connection-manager';

async function bootstrap() {
  const localConfig = configuration();

  const opts = {
    cert: readFileSync(
      join(__dirname, '../', localConfig.rabbitmq.certs.client),
    ),
    key: readFileSync(join(__dirname, '../', localConfig.rabbitmq.certs.key)),
    passphrase: '',
    ca: [readFileSync(join(__dirname, '../', localConfig.rabbitmq.certs.ca))],
  };

  // WORKING
  // let t = amqp.connect('amqps://dev.rabbitmq:5672', {
  //   connectionOptions: {
  //     ...opts,
  //     credentials: credentials.external(),
  //   },
  // });

  // WORKING
  // let open = connect('amqps://dev.rabbitmq:5672', {
  //   ...opts,
  //   credentials: credentials.external(),
  // });

  // FAILING
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqps://dev.rabbitmq:5672`],
        queue: 'rnd-queue',
        queueOptions: {
          durable: true,
          exclusive: true,
        },
        socketOptions: {
          connectionOptions: {
            cert: '',
            key: '',
            passphrase: '',
            ca: [''],
            credentials: credentials.external(),
          },
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
