import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export abstract class BaseSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    // Abstract method to be implemented by child seeders
    await this.execute(dataSource, factoryManager);
  }

  // Abstract method that child seeders must implement
  protected abstract execute(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void>;
}
