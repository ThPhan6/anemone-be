import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745485638334 implements MigrationInterface {
  name = 'Migration1745485638334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_cbac76cdb5654843e63bd6e6c76"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "product_variant_id"`);
    await queryRunner.query(`ALTER TABLE "scent_configs" ADD "created_by" uuid NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scent_configs" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "product_variant_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_cbac76cdb5654843e63bd6e6c76" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
