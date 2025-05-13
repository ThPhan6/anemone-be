import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747125597389 implements MigrationInterface {
  name = 'Migration1747125597389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "certificate_id" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "certificate_id"`);
  }
}
