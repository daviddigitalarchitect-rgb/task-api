import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1788787085155 implements MigrationInterface {
    name = 'InitSchema1788787085155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47b7c8be2" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f903baf43" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" character varying,
                "priority" character varying,
                "done" boolean NOT NULL DEFAULT false,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab74c772" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX "idx_task_title" ON "tasks" ("title")`);
        
        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_1687cc41d7d0a64cfd81c8bf1c3" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_1687cc41d7d0a64cfd81c8bf1c3"`);
        await queryRunner.query(`DROP INDEX "public"."idx_task_title"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}