import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747361193259 implements MigrationInterface {
  name = 'Migration1747361193259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scent_configs" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."scent_configs_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."scent_configs_type_enum" AS ENUM('1', '2')`);
    await queryRunner.query(
      `ALTER TABLE "scent_configs" ADD "type" "public"."scent_configs_type_enum"`,
    );
  }
}
