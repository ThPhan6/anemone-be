import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1744863389697 implements MigrationInterface {
  name = 'Migration1744863389697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_commands" ADD "is_executed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_commands" DROP COLUMN "is_executed"`);
  }
}
