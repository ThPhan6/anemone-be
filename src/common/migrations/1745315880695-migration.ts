import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745315880695 implements MigrationInterface {
  name = 'Migration1745315880695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0669070d4efe22fff90ac549ac7" FOREIGN KEY ("scent_config_id") REFERENCES "scent_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_0669070d4efe22fff90ac549ac7" UNIQUE ("scent_config_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0669070d4efe22fff90ac549ac7" FOREIGN KEY ("scent_config_id") REFERENCES "scent_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
