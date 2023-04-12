import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTagTable1681202540229 implements MigrationInterface {
  name = 'CreateTagTable1681202540229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "updated" TIMESTAMP(3) NOT NULL DEFAULT now(), 
        "created" TIMESTAMP(3) NOT NULL DEFAULT now(), 
        "deleted" TIMESTAMP(3), 
        "post_id" uuid NOT NULL, 
        "name" character varying(255) NOT NULL, 
        CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "FK_b20aaa37aa83f407ff31c82ded5" FOREIGN KEY ("post_id") 
        REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "FK_b20aaa37aa83f407ff31c82ded5"`,
    );
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
