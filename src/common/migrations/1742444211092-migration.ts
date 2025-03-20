import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742444211092 implements MigrationInterface {
  name = 'Migration1742444211092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_1be347a4bcc0a50166e19f80fde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ALTER COLUMN "serial_number" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cc9e89897e336172fd06367735d"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ALTER COLUMN "serial_number" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_1be347a4bcc0a50166e19f80fde" FOREIGN KEY ("serial_number") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cc9e89897e336172fd06367735d" FOREIGN KEY ("serial_number") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cc9e89897e336172fd06367735d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_1be347a4bcc0a50166e19f80fde"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ALTER COLUMN "serial_number" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cc9e89897e336172fd06367735d" FOREIGN KEY ("serial_number") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ALTER COLUMN "serial_number" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_1be347a4bcc0a50166e19f80fde" FOREIGN KEY ("serial_number") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
