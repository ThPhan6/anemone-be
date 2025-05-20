import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747733947164 implements MigrationInterface {
  name = 'Migration1747733947164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_admin"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "is_admin" boolean NOT NULL DEFAULT false`);
  }
}
