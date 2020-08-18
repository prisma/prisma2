import path from 'path'
import { getGenerators } from '../../getGenerators'
import { pick } from '../../pick'
import { omit } from '../../omit'

jest.setTimeout(10000)

describe('getGenerators', () => {
  test('basic', async () => {
    const aliases = {
      'predefined-generator': {
        generatorPath: path.join(__dirname, 'generator'),
        outputPath: __dirname,
      },
    }

    const generators = await getGenerators({
      schemaPath: path.join(__dirname, 'valid-minimal-schema.prisma'),
      providerAliases: aliases,
    })

    expect(generators.map((g) => g.manifest)).toMatchInlineSnapshot(`
      Array [
        Object {
          "defaultOutput": "default-output",
          "denylist": Array [
            "SomeForbiddenType",
          ],
          "prettyName": "This is a pretty pretty name",
          "requiresEngines": Array [
            "queryEngine",
            "migrationEngine",
          ],
          "requiresGenerators": Array [
            "prisma-client-js",
          ],
        },
      ]
    `)

    expect(
      pick(generators[0].options!, [
        'datamodel',
        'datasources',
        'otherGenerators',
      ]),
    ).toMatchInlineSnapshot(`
      Object {
        "datamodel": "datasource db {
        provider = \\"postgresql\\"
        url      = env(\\"TEST_POSTGRES_URI\\")
      }

      generator gen {
        provider      = \\"predefined-generator\\"
        binaryTargets = [\\"darwin\\"]
      }

      model User {
        id   Int    @id
        name String
      }",
        "datasources": Array [
          Object {
            "activeProvider": "postgresql",
            "name": "db",
            "provider": Array [
              "postgresql",
            ],
            "url": Object {
              "fromEnvVar": null,
              "value": "postgresql://",
            },
          },
        ],
        "otherGenerators": Array [],
      }
    `)

    expect(omit(generators[0].options!.generator, ['output']))
      .toMatchInlineSnapshot(`
      Object {
        "binaryTargets": Array [
          "darwin",
        ],
        "config": Object {},
        "name": "gen",
        "previewFeatures": Array [],
        "provider": "predefined-generator",
      }
    `)
  })

  test('fail on platforms', async () => {
    const aliases = {
      'predefined-generator': {
        generatorPath: path.join(__dirname, 'generator'),
        outputPath: __dirname,
      },
    }

    await expect(
      getGenerators({
        schemaPath: path.join(__dirname, 'invalid-platforms-schema.prisma'),
        providerAliases: aliases,
      }),
    ).rejects.toThrow('deprecated')
  })

  test('fail on invalid binaryTarget', async () => {
    const aliases = {
      'predefined-generator': {
        generatorPath: path.join(__dirname, 'generator'),
        outputPath: __dirname,
      },
    }

    await expect(
      getGenerators({
        schemaPath: path.join(__dirname, 'invalid-binary-target-schema.prisma'),
        providerAliases: aliases,
      }),
    ).rejects.toThrow('Unknown')
  })
})
