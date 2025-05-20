import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747708073224 implements MigrationInterface {
  name = 'Migration1747708073224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" RENAME COLUMN "is_connected" TO "connection_status"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "connection_status"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "connection_status" integer NOT NULL DEFAULT '2'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "connection_status"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "connection_status" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" RENAME COLUMN "connection_status" TO "is_connected"`,
    );
  }
}
