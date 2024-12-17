import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { checkConnection } from 'common/utils/net';
import { assignDataToInstance } from 'core/helper';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      dataSourceFactory: async (opts) => {
        const options: any = opts;
        const replication = options.replication;
        const master = options.replication.master;
        await checkConnection(master.port, master.host);
        const slaves: any[] = [];
        for (const slave of replication.slaves) {
          try {
            await checkConnection(slave.port, slave.host);
            slaves.push(slave);
          } catch (err) {}
        }

        const newOptions: any = {};
        assignDataToInstance(options, newOptions);
        if (slaves.length > 0) {
          newOptions.replication = {
            master: master,
            slaves: slaves,
          };
        } else {
          newOptions.replication = null;
          assignDataToInstance(master, newOptions);
        }

        return new DataSource(newOptions);
      },
      useFactory: (configService: ConfigService) => {
        const rHostList = JSON.parse(configService.get('POSTGRES_READ_HOST'));
        const rPortList = JSON.parse(configService.get('POSTGRES_READ_PORT'));
        const rUserList = JSON.parse(configService.get('POSTGRES_READ_USER'));
        const rPasswordList = JSON.parse(configService.get('POSTGRES_READ_PASSWORD'));
        const rDbList = JSON.parse(configService.get('POSTGRES_READ_DB'));

        return {
          type: 'postgres',
          replication: {
            master: {
              host: configService.get('POSTGRES_HOST'),
              port: configService.get('POSTGRES_PORT'),
              username: configService.get('POSTGRES_USER'),
              password: configService.get('POSTGRES_PASSWORD'),
              database: configService.get('POSTGRES_DB'),
            },
            slaves: rHostList.map((host, i) => {
              return {
                host: host,
                port: rPortList[i],
                username: rUserList[i],
                password: rPasswordList[i],
                database: rDbList[i],
              };
            }),
          },
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
