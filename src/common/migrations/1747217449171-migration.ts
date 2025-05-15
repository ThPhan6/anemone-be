import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747217449171 implements MigrationInterface {
  name = 'Migration1747217449171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL`);
  }
}
