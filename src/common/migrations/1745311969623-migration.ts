import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745311969623 implements MigrationInterface {
  name = 'Migration1745311969623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scent_configs" ADD "color" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scent_configs" DROP COLUMN "color"`);
  }
}
