import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745220522109 implements MigrationInterface {
  name = 'Migration1745220522109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "UQ_2667f40edb344d6f274a0d42b6f"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "device_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" ADD "device_id" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "UQ_2667f40edb344d6f274a0d42b6f" UNIQUE ("device_id")`,
    );
  }
}
